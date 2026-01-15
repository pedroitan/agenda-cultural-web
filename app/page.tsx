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

export default async function Home() {
  const supabase = getSupabaseServerClient();

  let events: EventRow[] = [];
  let lastUpdatedAt: string | null = null;
  let hasSupabase = Boolean(supabase);

  if (supabase) {
    const nowIso = new Date().toISOString();

    const [{ data: eventsData }, { data: lastRunData }] = await Promise.all([
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

    events = (eventsData ?? []) as EventRow[];
    lastUpdatedAt = (lastRunData?.ended_at as string | null) ?? null;
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
            {events.map((ev) => (
              <article
                key={ev.id}
                className="flex gap-4 rounded-xl border border-zinc-200 bg-white p-4"
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
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-zinc-500">
                    {new Date(ev.start_datetime).toLocaleString("pt-BR")}
                  </p>
                  <h2 className="mt-1 line-clamp-2 text-base font-semibold">
                    <Link
                      href={`/r/${ev.id}`}
                      className="hover:underline"
                    >
                      {ev.title}
                    </Link>
                  </h2>
                  <p className="mt-1 text-sm text-zinc-600">
                    {ev.venue_name ?? "Local a confirmar"}
                  </p>
                  <p className="mt-1 text-sm text-zinc-700">
                    {ev.is_free ? "Gratuito" : ev.price_text ?? "Consulte"}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
