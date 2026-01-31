import { getSupabaseServerClient } from "@/lib/supabaseServer";
import EventList from "./components/EventList";

// Disable caching to always fetch fresh data
export const dynamic = "force-dynamic";
export const revalidate = 0;

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

export default async function Home() {

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
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": dedupedEvents.slice(0, 20).map((event, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Event",
        "name": event.title,
        "startDate": event.start_datetime,
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-4 py-5">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-semibold tracking-tight">
              Agenda Cultural Salvador
            </h1>
            <p className="text-sm text-zinc-600">
              {hasSupabase
                ? `${dedupedEvents.length} eventos encontrados`
                : "Supabase ainda não configurado"}
            </p>
            {lastUpdatedAt && (
              <p className="text-xs text-zinc-500">
                Última atualização: {new Date(lastUpdatedAt).toLocaleString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl px-4 py-8">
        {!hasSupabase ? (
          <div className="rounded-xl border border-zinc-200 bg-white p-5">
            <h2 className="text-base font-semibold">Próximo passo</h2>
            <p className="mt-2 text-sm text-zinc-600">
              Crie o projeto no Supabase e preencha as variáveis em um arquivo
              <code className="mx-1 rounded bg-zinc-100 px-1 py-0.5">.env.local</code>
              (ou configure no deploy). Depois reinicie o dev server.
            </p>
          </div>
        ) : (
          <EventList events={dedupedEvents} />
        )}
      </main>
    </div>
  );
}
