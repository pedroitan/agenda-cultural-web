import Image from "next/image";
import Link from "next/link";

import { getSupabaseServerClient } from "@/lib/supabaseServer";

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

export default async function Home() {
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
          "id,title,start_datetime,venue_name,image_url,price_text,is_free,url"
        )
        .gt("start_datetime", nowIso)
        .order("start_datetime", { ascending: true })
        .limit(100),
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
                ? lastUpdatedAt
                  ? `Última atualização: ${new Date(lastUpdatedAt).toLocaleString("pt-BR")}`
                  : "Última atualização: —"
                : "Supabase ainda não configurado"}
            </p>
          </div>
          <a
            className="text-sm font-medium text-zinc-700 hover:text-zinc-950"
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
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
        ) : events.length === 0 ? (
          <div className="rounded-xl border border-zinc-200 bg-white p-5">
            <h2 className="text-base font-semibold">Nenhum evento encontrado</h2>
            <p className="mt-2 text-sm text-zinc-600">
              Quando o scraper rodar e persistir eventos, eles vão aparecer aqui.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {events.map((ev) => {
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
                    <p className="text-xs font-medium text-zinc-500">
                      {date} • {time}
                    </p>
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
