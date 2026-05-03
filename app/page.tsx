import { getSupabaseServerClient } from "@/lib/supabaseServer";
import PageClient from "./components/PageClient";
import Link from "next/link";

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

const BASE_URL = "https://agendaculturalsalvador.com.br";

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
    "name": "Agenda Cultural Salvador",
    "url": BASE_URL,
    "description": "Agregador de eventos culturais em Salvador, Bahia. Shows, teatro, exposições e festivais.",
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
    "mainEntity": [
      {
        "@type": "Question",
        "name": "O que tem pra fazer em Salvador este fim de semana?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `A Agenda Cultural Salvador lista ${dedupedEvents.length} eventos atuais em Salvador, incluindo shows, teatro, exposições e festivais. Acesse agendaculturalsalvador.com.br para ver todos os eventos com datas, horários e locais.`
        }
      },
      {
        "@type": "Question",
        "name": "Onde ver shows e eventos culturais em Salvador?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Salvador tem uma agenda cultural intensa com eventos no Teatro Castro Alves (TCA), Teatro Gamboa, El Cabong, Casa de Música da Bahia, SESI, Concha Acústica e muitos outros. A Agenda Cultural Salvador agrega eventos de Sympla e El Cabong em um só lugar."
        }
      },
      {
        "@type": "Question",
        "name": "Quais são os eventos gratuitos em Salvador?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Salvador oferece muitos eventos gratuitos, especialmente em espaços públicos, museus e centros culturais. Use o filtro 'Gratuito' na Agenda Cultural Salvador para ver apenas eventos sem custo."
        }
      },
      {
        "@type": "Question",
        "name": "Como comprar ingressos para eventos em Salvador?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "A maioria dos eventos em Salvador vende ingressos pelo Sympla (sympla.com.br). A Agenda Cultural Salvador exibe links diretos para compra de ingressos em cada evento listado."
        }
      }
    ]
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Agenda Cultural Salvador",
    "description": `${dedupedEvents.length} eventos culturais em Salvador, Bahia`,
    "url": "https://agendaculturalsalvador.com.br",
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
          "name": event.venue_name || "Salvador, BA",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Salvador",
            "addressRegion": "BA",
            "addressCountry": "BR"
          }
        },
        "organizer": {
          "@type": "Organization",
          "name": "Agenda Cultural Salvador",
          "url": "https://agendaculturalsalvador.com.br"
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
          src="/banner.png" 
          alt="Agenda Cultural Salvador - Shows, Teatro, Exposições e Festivais em Salvador, Bahia" 
          className="w-full h-32 md:h-48 lg:h-56 object-cover"
          loading="eager"
          fetchPriority="high"
        />
      </div>

      <PageClient
        events={dedupedEvents}
        eventCount={dedupedEvents.length}
        initialSearch={initialSearch}
        initialCategoria={initialCategoria}
      />

      <footer className="border-t border-zinc-200 bg-white mt-8">
        <div className="mx-auto w-full max-w-5xl px-4 py-8 space-y-4 text-sm text-zinc-500">
          <div>
            <p className="font-medium text-zinc-700 mb-1">Sobre a Agenda Cultural Salvador</p>
            <p>
              A Agenda Cultural Salvador é um agregador de eventos culturais em Salvador, Bahia.
              Reunimos shows, peças de teatro, exposições, festivais, eventos gastronômicos e muito mais
              em um só lugar, com informações atualizadas diariamente a partir do{" "}
              <a href="https://sympla.com.br" target="_blank" rel="noopener noreferrer" className="underline hover:text-zinc-700">Sympla</a>{" "}
              e do{" "}
              <a href="https://elcabong.com.br" target="_blank" rel="noopener noreferrer" className="underline hover:text-zinc-700">El Cabong</a>.
            </p>
          </div>
          <div>
            <p className="font-medium text-zinc-700 mb-1">Principais espaços culturais em Salvador</p>
            <p>
              Teatro Castro Alves (TCA), Teatro Gamboa, El Cabong, Casa de Música da Bahia,
              SESI Salvador, Concha Acústica do TCA, Teatro ISBA, Teatro Vila Velha,
              Museu de Arte Moderna da Bahia (MAM), Farol da Barra, Solar do Unhão,
              Teatro SESC Casa do Comerciário, Espaço Cultural da Barroquinha e outros
              espaços culturais de Salvador, Bahia.
            </p>
          </div>
          <div>
            <p className="font-medium text-zinc-700 mb-1">Categorias de eventos</p>
            <div className="flex flex-wrap gap-2">
              <Link href="/categoria/shows-salvador" className="underline hover:text-zinc-700">Shows e Festas</Link>
              <span>·</span>
              <Link href="/categoria/teatro-salvador" className="underline hover:text-zinc-700">Teatro</Link>
              <span>·</span>
              <Link href="/categoria/exposicoes-salvador" className="underline hover:text-zinc-700">Arte e Cultura</Link>
              <span>·</span>
              <Link href="/categoria/festivais-salvador" className="underline hover:text-zinc-700">Festivais</Link>
              <span>·</span>
              <Link href="/categoria/eventos-gratuitos-salvador" className="underline hover:text-zinc-700">Eventos Gratuitos</Link>
              <span>·</span>
              <Link href="/categoria/eventos-criancas-salvador" className="underline hover:text-zinc-700">Infantil</Link>
            </div>
          </div>
          <div>
            <p className="font-medium text-zinc-700 mb-1">Páginas populares</p>
            <div className="flex flex-wrap gap-2">
              <Link href="/eventos-salvador-hoje" className="underline hover:text-zinc-700">Eventos Hoje</Link>
              <span>·</span>
              <Link href="/roteiros" className="underline hover:text-zinc-700">Roteiros Curados</Link>
              <span>·</span>
              <Link href="/distrito-comercio" className="underline hover:text-zinc-700">Distrito do Comércio</Link>
            </div>
          </div>
          <p className="text-xs text-zinc-400 pt-2">
            © {new Date().getFullYear()} Agenda Cultural Salvador · Salvador, Bahia, Brasil ·{" "}
            <a href="/api/events" className="underline hover:text-zinc-600">API pública</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
