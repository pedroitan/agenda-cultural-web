import { getSupabaseServerClient } from "@/lib/supabaseServer";
import PageClient from "./components/PageClient";
import Highlights from "./components/Highlights";
import Link from "next/link";
import { getCityConfig } from "@/config/cities";

// Revalidate every 5 minutes — reduces Supabase egress from repeated bot/crawler hits
// Events only change when scraper runs (3x/day), so 5min cache is safe
export const revalidate = 300;

type EventRow = {
  id: string;
  title: string;
  start_datetime: string;
  venue_name: string | null;
  image_url: string | null;
  price_text: string | null;
  is_free: boolean;
  category: string | null;
  url: string;
};

// Deduplicate events by title + date + venue
function deduplicateEvents(events: EventRow[]): EventRow[] {
  const grouped = new Map<string, EventRow[]>();
  
  events.forEach((event) => {
    // Normalize title: lowercase, remove special chars, get first significant words
    const titleNormalized = event.title
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9\s]/g, ' ') // Remove special chars
      .trim()
      .replace(/\s+/g, ' ');
    
    // Use first 2-3 significant words for matching (skip common words)
    const words = titleNormalized.split(' ').filter(w => w.length > 2);
    const titleKey = words.slice(0, 3).join(' ');
    
    const dateKey = event.start_datetime.split('T')[0]; // YYYY-MM-DD
    
    // Normalize venue (remove city/state suffixes and get first significant words)
    const venueNormalized = (event.venue_name || '')
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/\s*-\s*salvador.*$/i, '')
      .replace(/\s*-\s*ba.*$/i, '')
      .replace(/\s*-\s*rio\s+vermelho.*$/i, '')
      .replace(/\s*-\s*pelourinho.*$/i, '')
      .trim()
      .split(/\s+/)
      .slice(0, 3) // First 3 words only
      .join(' ');
    
    const key = `${titleKey}|${dateKey}|${venueNormalized}`;
    
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(event);
  });
  
  // For each group, keep the longest title (more descriptive) and merge sources
  return Array.from(grouped.values()).map((group) => {
    if (group.length === 1) return group[0];
    
    // Sort by title length (descending) to keep most descriptive
    group.sort((a, b) => b.title.length - a.title.length);
    
    const primary = group[0];
    const sources = group.map(e => e.url).join('|');
    
    return {
      ...primary,
      url: sources,
      // Keep only primary ID - clicking will increment only this event
      // This is acceptable since deduplicated events represent the same event from different sources
    };
  });
}

const cityConfig = getCityConfig();
const BASE_URL = cityConfig.siteUrl;

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; categoria?: string }>;
}) {
  const { q: initialSearch = "", categoria: initialCategoria = "" } = await searchParams;

  const supabase = getSupabaseServerClient();

  let events: EventRow[] = [];
  let lastUpdatedAt: string | null = null;
  let hasSupabase = Boolean(supabase);

  if (supabase) {
    // Events in DB are stored as BRT time but without timezone (treated as UTC by Postgres)
    // So we need to adjust: current BRT time - 3h offset - 4h window
    const now = new Date();
    const nowBRT = new Date(now.getTime() - (3 * 60 * 60 * 1000)); // Convert UTC to BRT equivalent
    const fourHoursAgo = new Date(nowBRT.getTime() - (4 * 60 * 60 * 1000));
    const fourHoursAgoIso = fourHoursAgo.toISOString();

    const [eventsResult, lastRunResult] = await Promise.all([
      supabase
        .from("events")
        .select(
          "id,title,start_datetime,venue_name,image_url,price_text,is_free,category,url"
        )
        .gte("start_datetime", fourHoursAgoIso)
        .eq("is_active", true)
        .order("start_datetime", { ascending: true }),
      supabase
        .from("scrape_runs")
        .select("ended_at")
        .eq("status", "success")
        .order("ended_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    if (eventsResult.error) {
      console.error("Events query error:", eventsResult.error);
    }

    events = (eventsResult.data ?? []) as EventRow[];
    lastUpdatedAt = (lastRunResult.data?.ended_at as string | null) ?? null;
  }

  // Deduplicate events first
  const dedupedEvents = deduplicateEvents(events);

  // Generate JSON-LD structured data for events
  // Dates stored as BRT literals treated as UTC — convert +00:00 → -03:00 for correct timezone signalling
  const toBRT = (dt: string) => dt.replace(/\+00:00$|Z$/, '-03:00');

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": cityConfig.siteTitle.split(' -')[0],
    "url": BASE_URL,
    "description": cityConfig.siteDescription,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${BASE_URL}/?q={search_term_input}`
      },
      "query-input": "required name=search_term_input"
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": cityConfig.jsonLd.faq.map(item => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer,
      }
    }))
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": cityConfig.siteTitle.split(' -')[0],
    "description": `${dedupedEvents.length} eventos culturais ${cityConfig.preposition} ${cityConfig.name}, ${cityConfig.state}`,
    "url": BASE_URL,
    "itemListElement": dedupedEvents.slice(0, 20).map((event, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Event",
        "name": event.title,
        "startDate": toBRT(event.start_datetime),
        "eventStatus": "https://schema.org/EventScheduled",
        "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
        "location": {
          "@type": "Place",
          "name": event.venue_name || `${cityConfig.name}, ${cityConfig.state}`,
          "address": {
            "@type": "PostalAddress",
            "addressLocality": cityConfig.jsonLd.locality,
            "addressRegion": cityConfig.jsonLd.region,
            "addressCountry": "BR"
          }
        },
        "organizer": {
          "@type": "Organization",
          "name": cityConfig.siteTitle.split(' -')[0],
          "url": BASE_URL
        },
        "offers": event.is_free ? {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "BRL",
          "availability": "https://schema.org/InStock"
        } : event.price_text ? {
          "@type": "Offer",
          "price": event.price_text,
          "priceCurrency": "BRL"
        } : undefined,
        "image": event.image_url || undefined,
        "url": event.url.split('|')[0]
      }
    }))
  };

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-950">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      
      {/* Banner - full width on all devices, maximized */}
      <div className="w-full bg-gradient-to-r from-purple-900 to-indigo-900">
        <img
          src={cityConfig.headerImage}
          alt={cityConfig.siteTitle}
          className="w-full h-32 md:h-48 lg:h-56 object-cover"
          loading="eager"
          fetchPriority="high"
        />
      </div>

      <Highlights />

      <PageClient
        events={dedupedEvents}
        eventCount={dedupedEvents.length}
        initialSearch={initialSearch}
        initialCategoria={initialCategoria}
        cityName={cityConfig.name}
        cityPreposition={cityConfig.preposition}
      />

      <footer className="border-t border-zinc-200 bg-white mt-8">
        <div className="mx-auto w-full max-w-5xl px-4 py-8 space-y-4 text-sm text-zinc-500">
          <div>
            <p className="font-medium text-zinc-700 mb-1">Sobre a {cityConfig.siteTitle.split(' -')[0]}</p>
            <p>
              A {cityConfig.siteTitle.split(' -')[0]} é um agregador de eventos culturais {cityConfig.preposition} {cityConfig.name}, {cityConfig.state}.
              Reunimos shows, peças de teatro, exposições, festivais, eventos gastronômicos e muito mais
              em um só lugar, com informações atualizadas diariamente.
            </p>
          </div>
          <div>
            <p className="font-medium text-zinc-700 mb-1">Principais espaços culturais {cityConfig.preposition} {cityConfig.name}</p>
            <p>{cityConfig.footerVenues}</p>
          </div>
          <div>
            <p className="font-medium text-zinc-700 mb-1">Categorias de eventos</p>
            <div className="flex flex-wrap gap-2">
              {cityConfig.categoryLinks.map((link, i) => (
                <span key={link.href} className="flex items-center gap-2">
                  {i > 0 && <span>·</span>}
                  <Link href={link.href} className="underline hover:text-zinc-700">{link.label}</Link>
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="font-medium text-zinc-700 mb-1">Páginas populares</p>
            <div className="flex flex-wrap gap-2">
              {cityConfig.popularLinks.map((link, i) => (
                <span key={link.href} className="flex items-center gap-2">
                  {i > 0 && <span>·</span>}
                  <Link href={link.href} className="underline hover:text-zinc-700">{link.label}</Link>
                </span>
              ))}
            </div>
          </div>
          <p className="text-xs text-zinc-400 pt-2">
            © {new Date().getFullYear()} {cityConfig.footerCopyright} ·{" "}
            <a href="/api/events" className="underline hover:text-zinc-600">API pública</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
