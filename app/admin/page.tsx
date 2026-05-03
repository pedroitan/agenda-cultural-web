import { getSupabaseServerClient } from "@/lib/supabaseServer";
import RunScraperButton from "./RunScraperButton";
import ResetClicksButton from "./ResetClicksButton";
import { RealtimeClickCounter, RealtimeTopClicked } from "./RealtimeClickStats";
import PendingEvents from "./PendingEvents";
import ActiveEvents from "./ActiveEvents";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type ScrapeRun = {
  id: string;
  source: string;
  city: string;
  started_at: string;
  ended_at: string | null;
  status: string;
  items_fetched: number;
  items_valid: number;
  items_upserted: number;
  items_invalid: number;
  error_message: string | null;
};

type EventCount = {
  source: string;
  count: number;
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Bahia",
  });
}

function formatDuration(start: string, end: string | null): string {
  if (!end) return "Em andamento...";
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffMs = endDate.getTime() - startDate.getTime();
  const diffSec = Math.round(diffMs / 1000);
  if (diffSec < 60) return `${diffSec}s`;
  const diffMin = Math.floor(diffSec / 60);
  const remainingSec = diffSec % 60;
  return `${diffMin}m ${remainingSec}s`;
}

export default async function AdminPage() {
  const supabase = getSupabaseServerClient();

  // Check if Supabase is configured
  if (!supabase) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Supabase não configurado</h1>
          <p className="text-gray-400 mb-4">
            Crie um arquivo <code className="bg-gray-800 px-2 py-1 rounded">.env.local</code> com:
          </p>
          <pre className="bg-gray-800 p-4 rounded text-left text-sm">
{`SUPABASE_URL=https://ssxowzurrtyzmracmusn.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key`}
          </pre>
        </div>
      </div>
    );
  }

  // Get last scrape runs for each source
  const { data: scrapeRuns } = await supabase
    .from("scrape_runs")
    .select("*")
    .order("started_at", { ascending: false })
    .limit(20);

  // Get event counts by source
  const { data: eventCounts } = await supabase
    .rpc("get_event_counts_by_source");

  // Fallback: if RPC doesn't exist, query directly
  let counts: EventCount[] = eventCounts || [];
  if (!eventCounts) {
    const { data: events } = await supabase
      .from("events")
      .select("source");
    
    if (events) {
      const countMap = new Map<string, number>();
      events.forEach((e: { source: string }) => {
        countMap.set(e.source, (countMap.get(e.source) || 0) + 1);
      });
      counts = Array.from(countMap.entries()).map(([source, count]) => ({
        source,
        count,
      }));
    }
  }

  // Get total events
  const { count: totalEvents } = await supabase
    .from("events")
    .select("*", { count: "exact", head: true });

  // Get future events count
  const { count: futureEvents } = await supabase
    .from("events")
    .select("*", { count: "exact", head: true })
    .gt("start_datetime", new Date().toISOString());

  // Get top clicked events
  const { data: topClicked } = await supabase
    .from("events")
    .select("id, title, click_count, source, start_datetime, url")
    .gt("click_count", 0)
    .order("click_count", { ascending: false })
    .limit(10);

  // Get total clicks (with deduplication like frontend)
  const { data: clickStats } = await supabase
    .from("events")
    .select("id, title, venue_name, start_datetime, click_count, url");
  
  // Deduplicate by title + date + venue (same logic as frontend)
  const grouped = new Map<string, number>();
  (clickStats || []).forEach((e: any) => {
    const titleNormalized = e.title
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const dateMatch = e.start_datetime.match(/^(\d{4})-(\d{2})-(\d{2})/);
    const dateKey = dateMatch ? `${dateMatch[2]}-${dateMatch[3]}` : '';
    const venueKey = (e.venue_name || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const key = `${titleNormalized}-${dateKey}-${venueKey}`;
    
    // Keep the highest click_count for duplicates
    const current = grouped.get(key) || 0;
    grouped.set(key, Math.max(current, e.click_count || 0));
  });
  
  const totalClicks = Array.from(grouped.values()).reduce((sum, count) => sum + count, 0);

  // Group scrape runs by source to get latest for each
  const latestBySource = new Map<string, ScrapeRun>();
  (scrapeRuns || []).forEach((run: ScrapeRun) => {
    if (!latestBySource.has(run.source)) {
      latestBySource.set(run.source, run);
    }
  });

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard Admin</h1>
            <p className="text-gray-400">Agenda Cultural Salvador</p>
          </div>
          <div className="flex gap-3 flex-wrap items-center">
            <RunScraperButton />
            <a
              href="/admin/instagram"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              + Instagram (Texto)
            </a>
            <a
              href="/admin/instagram-vision"
              className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
            >
              🤖 Instagram Vision (Imagens)
            </a>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg p-6">
            <p className="text-gray-400 text-sm">Total de Eventos</p>
            <p className="text-4xl font-bold text-green-400">{totalEvents || 0}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <p className="text-gray-400 text-sm">Eventos Futuros</p>
            <p className="text-4xl font-bold text-blue-400">{futureEvents || 0}</p>
          </div>
          {counts.map((c) => (
            <div key={c.source} className="bg-gray-800 rounded-lg p-6">
              <p className="text-gray-400 text-sm">
                {c.source === 'instagram' ? 'Instagram (Manual)' : c.source.charAt(0).toUpperCase() + c.source.slice(1)}
              </p>
              <p className="text-4xl font-bold text-purple-400">{c.count}</p>
            </div>
          ))}
        </div>

        {/* Analytics Overview */}
        <h2 className="text-xl font-semibold mb-4">📊 Analytics & Métricas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <a
            href="https://dash.cloudflare.com"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-6 hover:from-orange-600 hover:to-orange-700 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-white text-sm font-medium">Cloudflare Analytics</p>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>
            <p className="text-white text-2xl font-bold mb-1">Web Analytics</p>
            <p className="text-orange-100 text-xs">Tráfego, origem, performance</p>
          </a>

          <a
            href="https://vercel.com/pedroitans-projects/agenda-cultural-web/analytics"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-to-br from-black to-gray-800 rounded-lg p-6 hover:from-gray-900 hover:to-gray-700 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-white text-sm font-medium">Vercel Analytics</p>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>
            <p className="text-white text-2xl font-bold mb-1">Core Web Vitals</p>
            <p className="text-gray-300 text-xs">Performance detalhada</p>
          </a>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-white text-sm font-medium">Engajamento</p>
              <ResetClicksButton />
            </div>
            <RealtimeClickCounter initialTotal={totalClicks} />
          </div>
        </div>

        {/* Top Clicked Events — updates in realtime */}
        <RealtimeTopClicked initialTop={topClicked ?? []} />

        {/* Pending Events */}
        <PendingEvents />

        {/* Active Events */}
        <ActiveEvents />

        {/* Latest Scrape by Source */}
        <h2 className="text-xl font-semibold mb-4">Último Scrape por Fonte</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {Array.from(latestBySource.values()).map((run) => (
            <div
              key={run.id}
              className={`bg-gray-800 rounded-lg p-6 border-l-4 ${
                run.status === "success" ? "border-green-500" : "border-red-500"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold capitalize">{run.source}</h3>
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    run.status === "success"
                      ? "bg-green-500/20 text-green-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {run.status}
                </span>
              </div>
              <p className="text-gray-400 text-sm mb-3">
                {formatDate(run.started_at)} • {formatDuration(run.started_at, run.ended_at)}
              </p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-2xl font-bold text-blue-400">{run.items_fetched}</p>
                  <p className="text-xs text-gray-500">Fetched</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-400">{run.items_valid}</p>
                  <p className="text-xs text-gray-500">Valid</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-400">{run.items_upserted}</p>
                  <p className="text-xs text-gray-500">Upserted</p>
                </div>
              </div>
              {run.error_message && (
                <p className="mt-3 text-red-400 text-sm truncate">{run.error_message}</p>
              )}
            </div>
          ))}
        </div>

        {/* Recent Scrape Runs */}
        <h2 className="text-xl font-semibold mb-4">Histórico de Scrapes</h2>
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-sm">Fonte</th>
                <th className="px-4 py-3 text-left text-sm">Data</th>
                <th className="px-4 py-3 text-left text-sm">Duração</th>
                <th className="px-4 py-3 text-left text-sm">Status</th>
                <th className="px-4 py-3 text-right text-sm">Fetched</th>
                <th className="px-4 py-3 text-right text-sm">Valid</th>
                <th className="px-4 py-3 text-right text-sm">Upserted</th>
              </tr>
            </thead>
            <tbody>
              {(scrapeRuns || []).map((run: ScrapeRun) => (
                <tr key={run.id} className="border-t border-gray-700 hover:bg-gray-750">
                  <td className="px-4 py-3 capitalize">{run.source}</td>
                  <td className="px-4 py-3 text-gray-400 text-sm">
                    {formatDate(run.started_at)}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-sm">
                    {formatDuration(run.started_at, run.ended_at)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        run.status === "success"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {run.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">{run.items_fetched}</td>
                  <td className="px-4 py-3 text-right text-green-400">{run.items_valid}</td>
                  <td className="px-4 py-3 text-right text-yellow-400">{run.items_upserted}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <a href="/" className="hover:text-white">← Voltar para o site</a>
        </div>
      </div>
    </div>
  );
}
