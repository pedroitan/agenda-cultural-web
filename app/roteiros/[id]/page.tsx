import { getSupabaseServerClient } from "@/lib/supabaseServer";
import Link from "next/link";
import { ArrowLeft, MapPin, Clock, ExternalLink, ArrowRight, Navigation } from "lucide-react";

function TourImageCollage({ images }: { images: (string | null)[] }) {
  const validImages = images.filter(Boolean) as string[];

  if (validImages.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-zinc-700">
        <MapPin size={64} />
      </div>
    );
  }

  if (validImages.length === 1) {
    return (
      <img src={validImages[0]} alt="" className="w-full h-full object-cover" />
    );
  }

  if (validImages.length === 2) {
    return (
      <div className="w-full h-full grid grid-cols-2 gap-0.5 bg-zinc-900">
        {validImages.map((img, i) => (
          <div key={i} className="overflow-hidden h-full">
            <img src={img} alt="" className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full h-full flex gap-0.5 bg-zinc-900">
      <div className="w-1/2 overflow-hidden">
        <img src={validImages[0]} alt="" className="w-full h-full object-cover" />
      </div>
      <div className="w-1/2 flex flex-col gap-0.5">
        {validImages.slice(1, 3).map((img, i) => (
          <div key={i} className="flex-1 overflow-hidden">
            <img src={img} alt="" className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
    </div>
  );
}

function buildMapsDirectionsUrl(venues: (string | null)[], city: string): string {
  const valid = venues.filter(Boolean) as string[];
  if (valid.length === 0) return `https://www.google.com/maps/search/${encodeURIComponent(city)}`;
  const parts = valid.map(v => encodeURIComponent(`${v}, ${city}`));
  return `https://www.google.com/maps/dir/${parts.join('/')}`;
}

function buildMapsEmbedRouteUrl(venues: (string | null)[], city: string): string {
  const valid = venues.filter(Boolean) as string[];
  if (valid.length === 0) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(city)}&output=embed&z=13`;
  }
  if (valid.length === 1) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(valid[0] + ', ' + city)}&output=embed&z=14`;
  }
  const saddr = encodeURIComponent(valid[0] + ', ' + city);
  const daddr = encodeURIComponent(valid.slice(1).map(v => v + ', ' + city).join(' to '));
  return `https://maps.google.com/maps?saddr=${saddr}&daddr=${daddr}&output=embed&dirflg=d`;
}

export const dynamic = "force-dynamic";

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

  // Buscar roteiro
  const { data: tour } = await supabase
    .from("tours")
    .select("*")
    .eq("id", id)
    .eq("is_published", true)
    .maybeSingle();

  if (!tour) {
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

  // Buscar paradas com eventos relacionados
  const { data: stops } = await supabase
    .from("tour_stops")
    .select(`
      id,
      tour_id,
      event_id,
      horario,
      duracao_min,
      deslocamento_proximo_min,
      modo_deslocamento,
      order_index,
      events:event_id (
        id,
        title,
        start_datetime,
        venue_name,
        image_url,
        price_text,
        is_free,
        category,
        url,
        description
      )
    `)
    .eq("tour_id", id)
    .order("order_index", { ascending: true });

  const tourWithStops = {
    ...tour,
    stops: (stops || []) as unknown as TourStop[],
  };

  const stopImages = tourWithStops.stops.map((s: TourStop) => s.events?.image_url ?? null);
  const venueNames = tourWithStops.stops.map((s: TourStop) => s.events?.venue_name ?? null);
  const mapsUrl = buildMapsDirectionsUrl(venueNames, 'Salvador, Bahia');
  const mapEmbedUrl = buildMapsEmbedRouteUrl(venueNames, 'Salvador, Bahia');

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Hero com Collage */}
      <div className="relative h-72 md:h-96 bg-zinc-900">
        <TourImageCollage images={stopImages} />
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
          
          {!tourWithStops.stops || tourWithStops.stops.length === 0 ? (

            <div className="bg-white rounded-xl p-6 border border-zinc-200 text-center">
              <p className="text-zinc-600">Este roteiro ainda não tem paradas definidas.</p>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 md:left-6 top-0 bottom-0 w-0.5 bg-violet-200"></div>

              {tourWithStops.stops.map((stop: TourStop, index: number) => (
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
                    {stop.deslocamento_proximo_min && index < tourWithStops.stops.length - 1 && (
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

        {/* Mapa do Roteiro */}
        {tourWithStops.stops && tourWithStops.stops.length > 0 && (
          <div className="mt-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
                <MapPin size={24} className="text-violet-600" />
                Mapa do Roteiro
              </h2>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors text-sm font-medium"
              >
                <Navigation size={16} />
                Ver rota no Google Maps
              </a>
            </div>

            {/* Lista de paradas para navegação */}
            <div className="bg-white rounded-xl border border-zinc-200 p-4 mb-4">
              <p className="text-sm font-medium text-zinc-500 mb-3">Paradas do roteiro</p>
              <div className="flex flex-col gap-2">
                {tourWithStops.stops.map((stop: TourStop, i: number) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-violet-100 text-violet-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-900 truncate">{stop.events?.venue_name || stop.events?.title}</p>
                      {stop.horario && <p className="text-xs text-zinc-500">{stop.horario}</p>}
                    </div>
                    <a
                      href={`https://www.google.com/maps/search/${encodeURIComponent((stop.events?.venue_name || stop.events?.title) + ', Salvador, Bahia')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-400 hover:text-violet-600 transition-colors flex-shrink-0"
                    >
                      <ExternalLink size={14} />
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Google Maps iframe */}
            <div className="rounded-xl overflow-hidden border border-zinc-200 shadow-sm">
              <iframe
                src={mapEmbedUrl}
                width="100%"
                height="360"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Mapa do roteiro"
              />
            </div>
          </div>
        )}

        {/* CTA */}
        {tourWithStops.stops && tourWithStops.stops.length > 0 && (
          <div className="mt-8 text-center">
            <Link
              href={`/event/${tourWithStops.stops[0].events.id}`}
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
