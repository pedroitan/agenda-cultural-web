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
        return eventDate >= today && eventDate < tomorrow;
      });
    } else if (data === "week") {
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      filtered = filtered.filter((e) => {
        const eventDate = new Date(e.start_datetime);
        return eventDate >= today && eventDate < nextWeek;
      });
    } else if (data === "month") {
      const nextMonth = new Date(today);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      filtered = filtered.filter((e) => {
        const eventDate = new Date(e.start_datetime);
        return eventDate >= today && eventDate < nextMonth;
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
    const nowIso = new Date().toISOString();

    const [eventsResult, lastRunResult] = await Promise.all([
      supabase
        .from("events")
        .select(
          "id,title,start_datetime,venue_name,image_url,price_text,is_free,category,url"
        )
        .gt("start_datetime", nowIso)
        .order("start_datetime", { ascending: true }),
      supabase
        .from("scrape_runs")
        .select("ended_at")
        .eq("status", "success")
        .order("ended_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    // Debug logging
    console.log("Events query result:", JSON.stringify(eventsResult));
    console.log("Now ISO:", nowIso);

    if (eventsResult.error) {
      console.error("Events query error:", eventsResult.error);
    }

    events = (eventsResult.data ?? []) as EventRow[];
    lastUpdatedAt = (lastRunResult.data?.ended_at as string | null) ?? null;
  }

  // Apply filters
  const filteredEvents = filterEvents(events, categoria, data, busca);

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
              return (
                <Link
                  key={ev.id}
                  href={`/r/${ev.id}`}
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
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-medium text-zinc-500">
                        {date} • {time}
                      </p>
                      {ev.category && (
                        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
                          {ev.category}
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
