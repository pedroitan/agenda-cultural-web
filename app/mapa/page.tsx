import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { Metadata } from "next";
import EventMap from "../components/EventMap";
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
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
          >
            ← Voltar para Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Mapa de Eventos
          </h1>
          <p className="text-lg text-white/90 max-w-2xl">
            Encontre eventos culturais em Salvador no mapa interativo
          </p>
          <p className="text-white/70 mt-2">
            {validEvents.length} eventos com localização
          </p>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <EventMap events={events || []} />
        
        {validEvents.length === 0 && (
          <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Nenhum evento com localização</h2>
            <p className="text-zinc-600 mb-4">
              Os eventos precisam ter latitude e longitude para aparecer no mapa.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
            >
              Ver todos os eventos
            </Link>
          </div>
        )}

        {/* Lista de eventos abaixo do mapa */}
        {validEvents.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Eventos no mapa</h2>
            <div className="grid gap-4">
              {validEvents.map((event) => (
                <Link
                  key={event.id}
                  href={`/event/${event.id}`}
                  className="flex items-start gap-4 p-4 bg-white rounded-xl border border-zinc-200 hover:shadow-md transition-shadow"
                >
                  {event.image_url && (
                    <img
                      src={event.image_url}
                      alt={event.title}
                      className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-zinc-900 mb-1 line-clamp-1">
                      {event.title}
                    </h3>
                    <p className="text-sm text-zinc-600 mb-1">
                      {event.venue_name || "Local a confirmar"}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {new Date(event.start_datetime).toLocaleDateString('pt-BR', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
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
