import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { RealtimeClickCounter, RealtimeTopClicked } from "./RealtimeClickStats";
import PendingEvents from "./PendingEvents";
import ActiveEvents from "./ActiveEvents";
import AdminLayout from "./AdminLayout";
import EventSubmissions from "./EventSubmissions";
import AdsManager from "./AdsManager";
import ToursManager from "./ToursManager";
import { getCityConfig } from "@/config/cities";

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
  const cityConfig = getCityConfig();

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
{`SUPABASE_URL=https://ifocsakyvzkqdhrfmgbz.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key`}
          </pre>
        </div>
      </div>
    );
  }

  // Get last scrape runs for each source (filtered by city)
  const { data: scrapeRuns } = await supabase
    .from("scrape_runs")
    .select("*")
    .eq("city", cityConfig.slug)
    .order("started_at", { ascending: false })
    .limit(20);

  // Get event counts by source (filtered by city)
  const { data: eventCounts } = await supabase
    .rpc("get_event_counts_by_source", { city_slug: cityConfig.slug });

  // Fallback: if RPC doesn't exist, query directly
  let counts: EventCount[] = eventCounts || [];
  if (!eventCounts) {
    const { data: events } = await supabase
      .from("events")
      .select("source")
      .eq("city", cityConfig.slug);
    
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

  // Get total events (filtered by city)
  const { count: totalEvents } = await supabase
    .from("events")
    .select("*", { count: "exact", head: true })
    .eq("city", cityConfig.slug);

  // Get future events count (filtered by city)
  const { count: futureEvents } = await supabase
    .from("events")
    .select("*", { count: "exact", head: true })
    .eq("city", cityConfig.slug)
    .gt("start_datetime", new Date().toISOString());

  // Get all events with clicks for both total + top10 (one query, both deduplicated)
  const { data: clickStats } = await supabase
    .from("events")
    .select("id, title, venue_name, start_datetime, click_count, source, url, city")
    .eq("city", cityConfig.slug)
    .gt("click_count", 0);

  // Deduplicate by title + date + venue — keep event with highest click_count per group
  const groupedEvents = new Map<string, any>();
  (clickStats || []).forEach((e: any) => {
    const titleNormalized = e.title
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const dateMatch = e.start_datetime.match(/^(\d{4})-(\d{2})-(\d{2})/);
    const dateKey = dateMatch ? `${dateMatch[2]}-${dateMatch[3]}` : '';
    const venueKey = (e.venue_name || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const key = `${titleNormalized}-${dateKey}-${venueKey}`;

    const existing = groupedEvents.get(key);
    if (!existing || (e.click_count || 0) > (existing.click_count || 0)) {
      groupedEvents.set(key, e);
    }
  });

  const dedupedEvents = Array.from(groupedEvents.values());
  const totalClicks = dedupedEvents.reduce((sum, e) => sum + (e.click_count || 0), 0);
  const topClicked = dedupedEvents
    .sort((a, b) => (b.click_count || 0) - (a.click_count || 0))
    .slice(0, 10);

  // Group scrape runs by source to get latest for each
  const latestBySource = new Map<string, ScrapeRun>();
  (scrapeRuns || []).forEach((run: ScrapeRun) => {
    if (!latestBySource.has(run.source)) {
      latestBySource.set(run.source, run);
    }
  });

  const sourceLabel = (source: string) => {
    const labels: Record<string, string> = {
      sympla: 'Sympla',
      elcabong: 'El Cabong',
      instagram: 'Instagram',
      manual_submission: 'Submissão Manual',
      salvadordabahia: 'Salvador da Bahia',
    };
    return labels[source] ?? source.charAt(0).toUpperCase() + source.slice(1);
  };

  const sourceIcon = (source: string) => {
    const icons: Record<string, string> = {
      sympla: '🎟️',
      elcabong: '🎵',
      instagram: '📸',
      manual_submission: '✍️',
      salvadordabahia: '🌴',
    };
    return icons[source] ?? '📋';
  };

  const statsCards = (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
        <p className="text-gray-500 text-xs font-medium uppercase tracking-wide mb-1">Total de Eventos</p>
        <p className="text-3xl font-bold text-gray-900">{totalEvents || 0}</p>
        <p className="text-xs text-green-600 mt-1 font-medium">Todos ativos</p>
      </div>
      <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
        <p className="text-gray-500 text-xs font-medium uppercase tracking-wide mb-1">Eventos Futuros</p>
        <p className="text-3xl font-bold text-gray-900">{futureEvents || 0}</p>
        <p className="text-xs text-blue-600 mt-1 font-medium">Próximos dias</p>
      </div>
      {counts.map((c) => (
        <div key={c.source} className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <p className="text-gray-500 text-xs font-medium uppercase tracking-wide mb-1">
            {sourceIcon(c.source)} {sourceLabel(c.source)}
          </p>
          <p className="text-3xl font-bold text-gray-900">{c.count}</p>
          <p className="text-xs text-violet-600 mt-1 font-medium">eventos</p>
        </div>
      ))}
    </div>
  );

  const analyticsCards = (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <a
        href="https://dash.cloudflare.com"
        target="_blank"
        rel="noopener noreferrer"
        className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-6 hover:from-orange-600 hover:to-orange-700 transition-all shadow-sm"
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
        className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 hover:from-gray-900 hover:to-gray-700 transition-all shadow-sm"
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
      <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 shadow-sm">
        <p className="text-white text-sm font-medium mb-2">Engajamento</p>
        <RealtimeClickCounter initialTotal={totalClicks} />
      </div>
    </div>
  );

  const scrapesSection = (
    <>
      <h3 className="text-base font-semibold mb-4 text-gray-700">Último Scrape por Fonte</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {Array.from(latestBySource.values()).map((run) => (
          <div
            key={run.id}
            className={`bg-white rounded-lg p-6 border-l-4 shadow-sm ${
              run.status === "success" ? "border-green-500" : "border-red-500"
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold capitalize text-gray-900">{run.source}</h3>
              <span className={`px-2 py-1 rounded text-xs ${run.status === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                {run.status}
              </span>
            </div>
            <p className="text-gray-500 text-sm mb-3">
              {formatDate(run.started_at)} • {formatDuration(run.started_at, run.ended_at)}
            </p>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-600">{run.items_fetched}</p>
                <p className="text-xs text-gray-500">Fetched</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{run.items_valid}</p>
                <p className="text-xs text-gray-500">Valid</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">{run.items_upserted}</p>
                <p className="text-xs text-gray-500">Upserted</p>
              </div>
            </div>
            {run.error_message && (
              <p className="mt-3 text-red-600 text-sm truncate">{run.error_message}</p>
            )}
          </div>
        ))}
      </div>

      <h3 className="text-base font-semibold mb-4 text-gray-700">Histórico de Scrapes</h3>
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm text-gray-600 font-medium">Fonte</th>
              <th className="px-4 py-3 text-left text-sm text-gray-600 font-medium">Data</th>
              <th className="px-4 py-3 text-left text-sm text-gray-600 font-medium">Duração</th>
              <th className="px-4 py-3 text-left text-sm text-gray-600 font-medium">Status</th>
              <th className="px-4 py-3 text-right text-sm text-gray-600 font-medium">Fetched</th>
              <th className="px-4 py-3 text-right text-sm text-gray-600 font-medium">Valid</th>
              <th className="px-4 py-3 text-right text-sm text-gray-600 font-medium">Upserted</th>
            </tr>
          </thead>
          <tbody>
            {(scrapeRuns || []).map((run: ScrapeRun) => (
              <tr key={run.id} className="border-t border-gray-200 hover:bg-gray-50">
                <td className="px-4 py-3 capitalize text-gray-900">{run.source}</td>
                <td className="px-4 py-3 text-gray-500 text-sm">{formatDate(run.started_at)}</td>
                <td className="px-4 py-3 text-gray-500 text-sm">{formatDuration(run.started_at, run.ended_at)}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs ${run.status === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {run.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-gray-900">{run.items_fetched}</td>
                <td className="px-4 py-3 text-right text-green-600">{run.items_valid}</td>
                <td className="px-4 py-3 text-right text-yellow-600">{run.items_upserted}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );

  return (
    <AdminLayout
      cityName={cityConfig.name}
      homeContent={
        <>
          {statsCards}
          <h3 className="text-base font-semibold mb-4 text-gray-700">Analytics & Métricas</h3>
          {analyticsCards}
          <RealtimeTopClicked initialTop={topClicked ?? []} />
        </>
      }
      eventosContent={
        <>
          <PendingEvents />
          <ActiveEvents />
          <EventSubmissions />
        </>
      }
      roteirosContent={<ToursManager />}
      anunciosContent={<AdsManager />}
      scrapesContent={scrapesSection}
    />
  );
}
