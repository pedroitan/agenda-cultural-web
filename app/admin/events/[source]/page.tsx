import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, MapPin, Tag, ExternalLink, Eye, MousePointer2 } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 60; // 1 minuto

const SOURCE_LABELS: Record<string, string> = {
  sympla: 'Sympla',
  elcabong: 'El Cabong',
  instagram: 'Instagram (Agenda Alternativa)',
  manual_submission: 'Submissão Manual',
  salvadordabahia: 'Salvador da Bahia',
};

const SOURCE_ICONS: Record<string, string> = {
  sympla: '🎟️',
  elcabong: '🎵',
  instagram: '📸',
  manual_submission: '✍️',
  salvadordabahia: '🌴',
};

export async function generateMetadata({ params }: { params: Promise<{ source: string }> }): Promise<Metadata> {
  const { source } = await params;
  const label = SOURCE_LABELS[source] || source;

  return {
    title: `Eventos ${label} - Admin`,
  };
}

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
  click_count: number;
  cta_click_count: number;
  is_active: boolean;
  created_at: string;
};

export default async function SourceEventsPage({ params }: { params: Promise<{ source: string }> }) {
  const { source } = await params;

  if (!SOURCE_LABELS[source]) {
    notFound();
  }

  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Supabase não configurado</h1>
        </div>
      </div>
    );
  }

  const { data: events } = await supabase
    .from("events")
    .select("*")
    .eq("source", source)
    .order("start_datetime", { ascending: false })
    .limit(500);

  const activeEvents = events?.filter((e: EventRow) => e.is_active) || [];
  const inactiveEvents = events?.filter((e: EventRow) => !e.is_active) || [];

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Bahia",
    });
  };

  const isFuture = (dateStr: string) => {
    return new Date(dateStr) > new Date();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft size={16} />
            Voltar ao Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-4xl">{SOURCE_ICONS[source]}</span>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Eventos {SOURCE_LABELS[source]}
              </h1>
              <p className="text-gray-600">
                {activeEvents.length} ativos • {inactiveEvents.length} inativos • {events?.length || 0} total
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Eventos Ativos */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Eventos Ativos ({activeEvents.length})
          </h2>
          {activeEvents.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
              Nenhum evento ativo
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Evento</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Data</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Local</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Categoria</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliques</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">CTA</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {activeEvents.map((event: EventRow) => (
                    <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-start gap-3">
                          {event.image_url && (
                            <img
                              src={event.image_url}
                              alt={event.title}
                              className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                            />
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-900 text-sm leading-tight">{event.title}</p>
                            <a
                              href={event.url.split("|")[0]}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-700 mt-1"
                            >
                              <ExternalLink size={12} />
                              <span className="truncate">Ver original</span>
                            </a>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className={`flex items-center gap-1.5 text-sm ${isFuture(event.start_datetime) ? 'text-gray-900' : 'text-gray-500'}`}>
                          <Calendar size={14} className={isFuture(event.start_datetime) ? 'text-green-500' : 'text-gray-400'} />
                          {formatDate(event.start_datetime)}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="flex items-center gap-1.5 text-sm text-gray-600">
                          <MapPin size={14} className="text-gray-400" />
                          {event.venue_name || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        {event.category ? (
                          <span className="inline-flex items-center gap-1 text-xs text-gray-600">
                            <Tag size={11} />
                            {event.category}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center gap-1 justify-end text-gray-600">
                          <Eye size={14} />
                          <span className="text-sm">{event.click_count}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center gap-1 justify-end text-gray-600">
                          <MousePointer2 size={14} />
                          <span className="text-sm">{event.cta_click_count}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          Ativo
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Eventos Inativos */}
        {inactiveEvents.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Eventos Inativos ({inactiveEvents.length})
            </h2>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Evento</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Data</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliques</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {inactiveEvents.map((event: EventRow) => (
                    <tr key={event.id} className="hover:bg-gray-50 transition-colors opacity-60">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900 text-sm leading-tight">{event.title}</p>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-sm text-gray-500">{formatDate(event.start_datetime)}</span>
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-500">{event.click_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
