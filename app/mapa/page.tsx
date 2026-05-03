import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { Metadata } from "next";
import EventMap from "../components/EventMapWrapper";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 300; // 5 minutos

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Mapa de Eventos Salvador | Agenda Cultural",
    description: "Veja os eventos culturais de Salvador no mapa. Encontre shows, teatro, exposições e mais perto de você.",
    keywords: "mapa eventos salvador, eventos por localização, mapa cultural salvador, onde estão os eventos salvador",
    openGraph: {
      title: "Mapa de Eventos Salvador",
      description: "Encontre eventos culturais perto de você no mapa interativo",
      type: "website",
    },
  };
}

type EventRow = {
  id: string;
  title: string;
  start_datetime: string;
  venue_name: string | null;
  image_url: string | null;
  latitude: number | null;
  longitude: number | null;
};

export default async function MapaPage() {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Supabase não configurado</h1>
        </div>
      </div>
    );
  }

  const { data: events } = await supabase
    .from("events")
    .select("id, title, start_datetime, venue_name, image_url, latitude, longitude")
    .eq("is_active", true)
    .gt("start_datetime", new Date().toISOString())
    .order("start_datetime", { ascending: true });

  const validEvents = events?.filter(e => e.latitude && e.longitude) || [];

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header com imagem de fundo */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900 via-purple-900 to-fuchsia-900"></div>
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        <div className="relative max-w-6xl mx-auto px-4 py-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            Voltar para Home
          </Link>
          <div className="flex items-start gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                Mapa de Eventos
              </h1>
              <p className="text-lg text-white/90 max-w-2xl">
                Encontre eventos culturais em Salvador no mapa interativo
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-6">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              {validEvents.length} eventos no mapa
            </span>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <EventMap events={events || []} height="600px" />
        
        {validEvents.length === 0 && (
          <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Nenhum evento com localização</h2>
            <p className="text-zinc-600 mb-4">
              Os eventos precisam ter latitude e longitude para aparecer no mapa.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-violet-600 hover:text-violet-700 font-medium"
            >
              Ver todos os eventos
            </Link>
          </div>
        )}

        {/* Lista de eventos abaixo do mapa */}
        {validEvents.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-zinc-900">Eventos no mapa</h2>
                <p className="text-sm text-zinc-600 mt-1">Clique em um evento para ver os detalhes</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {validEvents.map((event) => (
                <Link
                  key={event.id}
                  href={`/event/${event.id}`}
                  className="group bg-white rounded-2xl border border-zinc-200 overflow-hidden hover:shadow-xl hover:border-violet-200 transition-all duration-300"
                >
                  {event.image_url ? (
                    <div className="aspect-[16/9] overflow-hidden bg-zinc-100">
                      <img
                        src={event.image_url}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  ) : (
                    <div className="aspect-[16/9] bg-gradient-to-br from-violet-100 to-fuchsia-100 flex items-center justify-center">
                      <svg className="w-12 h-12 text-violet-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      </svg>
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-zinc-900 mb-2 line-clamp-2 group-hover:text-violet-600 transition-colors">
                      {event.title}
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-zinc-600 mb-1">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      </svg>
                      <span className="truncate">{event.venue_name || "Local a confirmar"}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-zinc-500">
                      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                      </svg>
                      {new Date(event.start_datetime).toLocaleDateString('pt-BR', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
