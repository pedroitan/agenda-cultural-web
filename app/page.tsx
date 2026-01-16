import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

import { getSupabaseServerClient } from "@/lib/supabaseServer";
import EventFilters from "./components/EventFilters";

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

// Format date as "16 Janeiro" and time as "19:00"
function formatEventDate(dateStr: string): { date: string; time: string } {
  const d = new Date(dateStr);
  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  const day = d.getDate();
  const month = months[d.getMonth()];
  const hours = d.getHours().toString().padStart(2, "0");
  const minutes = d.getMinutes().toString().padStart(2, "0");
  
  return {
    date: `${day} ${month}`,
    time: `${hours}:${minutes}`,
  };
}

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

// Filter events based on search params
function filterEvents(
  events: EventRow[],
  categoria: string | null,
  data: string | null,
  busca: string | null
): EventRow[] {
  let filtered = events;

  // Filter by category
  if (categoria && categoria !== "Todos") {
    filtered = filtered.filter((e) => e.category === categoria);
  }

  // Filter by date
  if (data) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    if (data === "today") {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      filtered = filtered.filter((e) => {
        const eventDate = new Date(e.start_datetime);
        // Show events that haven't started yet OR started less than 4 hours ago
        const fourHoursAgo = new Date(now.getTime() - (4 * 60 * 60 * 1000));
        return eventDate >= fourHoursAgo && eventDate < tomorrow;
      });
    } else if (data === "week") {
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      filtered = filtered.filter((e) => {
        const eventDate = new Date(e.start_datetime);
        // Show events that haven't started yet OR started less than 4 hours ago
        const fourHoursAgo = new Date(now.getTime() - (4 * 60 * 60 * 1000));
        return eventDate >= fourHoursAgo && eventDate < nextWeek;
      });
    } else if (data === "month") {
      const nextMonth = new Date(today);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      filtered = filtered.filter((e) => {
        const eventDate = new Date(e.start_datetime);
        // Show events that haven't started yet OR started less than 4 hours ago
        const fourHoursAgo = new Date(now.getTime() - (4 * 60 * 60 * 1000));
        return eventDate >= fourHoursAgo && eventDate < nextMonth;
      });
    }
  }

  // Filter by search text
  if (busca) {
    const searchLower = busca.toLowerCase();
    filtered = filtered.filter(
      (e) =>
        e.title.toLowerCase().includes(searchLower) ||
        e.venue_name?.toLowerCase().includes(searchLower)
    );
  }

  return filtered;
}

type SearchParams = { [key: string]: string | string[] | undefined };

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const categoria = typeof params.categoria === "string" ? params.categoria : null;
  const data = typeof params.data === "string" ? params.data : null;
  const busca = typeof params.busca === "string" ? params.busca : null;

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

  // Apply filters
  const filteredEvents = filterEvents(dedupedEvents, categoria, data, busca);

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-950">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-4 py-5">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-semibold tracking-tight">
              Agenda Cultural Salvador
            </h1>
            <p className="text-sm text-zinc-600">
              {hasSupabase
                ? `${filteredEvents.length} eventos encontrados`
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
        {hasSupabase && (
          <Suspense fallback={<div className="mb-6 h-24 animate-pulse rounded-lg bg-zinc-100" />}>
            <EventFilters />
          </Suspense>
        )}

        {!hasSupabase ? (
          <div className="rounded-xl border border-zinc-200 bg-white p-5">
            <h2 className="text-base font-semibold">Próximo passo</h2>
            <p className="mt-2 text-sm text-zinc-600">
              Crie o projeto no Supabase e preencha as variáveis em um arquivo
              <code className="mx-1 rounded bg-zinc-100 px-1 py-0.5">.env.local</code>
              (ou configure no deploy). Depois reinicie o dev server.
            </p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="rounded-xl border border-zinc-200 bg-white p-5">
            <h2 className="text-base font-semibold">Nenhum evento encontrado</h2>
            <p className="mt-2 text-sm text-zinc-600">
              {events.length > 0
                ? "Tente ajustar os filtros para ver mais eventos."
                : "Quando o scraper rodar e persistir eventos, eles vão aparecer aqui."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredEvents.map((ev) => {
              const { date, time } = formatEventDate(ev.start_datetime);
              const urls = ev.url.split('|');
              const sources = urls.map(url => {
                if (url.includes('sympla.com')) return 'Sympla';
                if (url.includes('elcabong.com')) return 'El Cabong';
                return 'Outro';
              });
              const hasMultipleSources = urls.length > 1;
              
              return (
                <Link
                  key={ev.id}
                  href={`/r/${ev.id}`}
                  prefetch={false}
                  className="flex gap-4 rounded-xl border border-zinc-200 bg-white p-4 transition-shadow hover:shadow-md"
                >
                  <div className="relative h-20 w-20 flex-none overflow-hidden rounded-lg bg-zinc-100">
                    {ev.image_url ? (
                      <Image
                        src={ev.image_url}
                        alt={ev.title}
                        fill
                        className="object-cover"
                        sizes="80px"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-zinc-400">
                        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xs font-medium text-zinc-500">
                        {date} • {time}
                      </p>
                      {ev.category && (
                        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
                          {ev.category}
                        </span>
                      )}
                      {hasMultipleSources && (
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                          {sources.join(' + ')}
                        </span>
                      )}
                    </div>
                    <h2 className="mt-1 line-clamp-2 text-base font-semibold">
                      {ev.title}
                    </h2>
                    <p className="mt-1 text-sm text-zinc-600">
                      {ev.venue_name ?? "Local a confirmar"}
                    </p>
                    {ev.is_free && (
                      <p className="mt-1 text-sm font-medium text-green-600">
                        Gratuito
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
