import { getSupabaseServerClient } from "@/lib/supabaseServer";
import Link from "next/link";
import { ArrowLeft, MapPin, Clock, Calendar, ExternalLink, ArrowRight } from "lucide-react";

type TourStop = {
  id: string;
  tour_id: string;
  event_id: string;
  horario: string | null;
  duracao_min: number | null;
  deslocamento_proximo_min: number | null;
  modo_deslocamento: string | null;
  order_index: number;
  events: {
    id: string;
    title: string;
    start_datetime: string;
    venue_name: string | null;
    image_url: string | null;
    price_text: string | null;
    is_free: boolean;
    category: string | null;
    url: string;
    description: string | null;
  };
};

type Tour = {
  id: string;
  title: string;
  curator_name: string;
  curator_bio: string | null;
  description: string | null;
  image_url: string | null;
  is_published: boolean;
  created_at: string;
};

export default async function TourDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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

  // Buscar roteiro e paradas
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/tours/${id}`);
  const tour: Tour & { stops: TourStop[] } = await response.json();

  if (!tour || !tour.id) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Roteiro não encontrado</h1>
          <Link href="/roteiros" className="text-violet-600 hover:underline">
            Voltar para roteiros
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Hero */}
      <div className="relative h-72 md:h-96 bg-zinc-900">
        {tour.image_url ? (
          <img
            src={tour.image_url}
            alt={tour.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-700">
            <MapPin size={64} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        <Link
          href="/roteiros"
          className="absolute top-4 left-4 md:top-8 md:left-8 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors flex items-center gap-2"
        >
          <ArrowLeft size={20} />
          <span>Voltar</span>
        </Link>

        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2">
            {tour.title}
          </h1>
          <div className="flex items-center gap-2 text-white/80">
            <span>Por {tour.curator_name}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        {/* Description */}
        {tour.description && (
          <div className="bg-white rounded-xl p-6 border border-zinc-200 mb-8">
            <h2 className="font-semibold text-zinc-900 mb-4">Sobre este roteiro</h2>
            <p className="text-zinc-700 whitespace-pre-wrap">{tour.description}</p>
          </div>
        )}

        {/* Timeline */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-zinc-900">Roteiro</h2>
          
          {!tour.stops || tour.stops.length === 0 ? (
            <div className="bg-white rounded-xl p-6 border border-zinc-200 text-center">
              <p className="text-zinc-600">Este roteiro ainda não tem paradas definidas.</p>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 md:left-6 top-0 bottom-0 w-0.5 bg-violet-200"></div>

              {tour.stops.map((stop, index) => (
                <div key={stop.id} className="relative pl-12 md:pl-16 pb-8 last:pb-0">
                  {/* Timeline dot */}
                  <div className="absolute left-2 md:left-4 top-0 w-4 h-4 rounded-full bg-violet-600 border-4 border-white shadow-sm"></div>

                  {/* Card */}
                  <div className="bg-white rounded-xl p-5 border border-zinc-200 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-violet-600">
                        <Clock size={16} />
                        {stop.horario || "Horário a definir"}
                      </div>
                      <span className="text-xs text-zinc-500">
                        {stop.duracao_min && `${stop.duracao_min} min`}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-zinc-900 mb-2">
                      {stop.events.title}
                    </h3>

                    <div className="flex items-center gap-2 text-sm text-zinc-600 mb-2">
                      <MapPin size={16} />
                      <span>{stop.events.venue_name || "Local a confirmar"}</span>
                    </div>

                    {stop.events.description && (
                      <p className="text-sm text-zinc-600 line-clamp-2 mb-3">
                        {stop.events.description}
                      </p>
                    )}

                    {stop.events.price_text && (
                      <div className="text-sm font-medium text-zinc-900 mb-3">
                        {stop.events.is_free ? "Grátis" : stop.events.price_text}
                      </div>
                    )}

                    <Link
                      href={`/event/${stop.events.id}`}
                      className="inline-flex items-center gap-2 text-violet-600 hover:text-violet-700 font-medium text-sm"
                    >
                      Ver detalhes do evento
                      <ExternalLink size={14} />
                    </Link>

                    {/* Deslocamento para próxima parada */}
                    {stop.deslocamento_proximo_min && index < tour.stops.length - 1 && (
                      <div className="mt-4 pt-4 border-t border-zinc-100 flex items-center gap-2 text-sm text-zinc-500">
                        <ArrowRight size={16} />
                        <span>
                          {stop.deslocamento_proximo_min} min até próxima parada
                          {stop.modo_deslocamento && ` (${stop.modo_deslocamento})`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CTA */}
        {tour.stops && tour.stops.length > 0 && (
          <div className="mt-8 text-center">
            <Link
              href={`/event/${tour.stops[0].events.id}`}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-violet-700 hover:to-fuchsia-700 transition-all shadow-lg hover:shadow-xl text-lg"
            >
              Começar Roteiro
              <ArrowRight size={20} />
            </Link>
            <p className="text-sm text-zinc-500 mt-2">
              Começa pelo primeiro evento da lista
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
