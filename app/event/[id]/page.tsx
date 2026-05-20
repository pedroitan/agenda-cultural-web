import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Calendar, MapPin, ExternalLink } from "lucide-react";
import TrackPageView from "./TrackPageView";
import EventMap from "@/app/components/EventMapWrapper";

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
  description: string | null;
  latitude: number | null;
  longitude: number | null;
};

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const supabase = getSupabaseServerClient();
  
  if (!supabase) {
    return {
      title: "Evento não encontrado",
    };
  }

  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (!event) {
    return {
      title: "Evento não encontrado",
    };
  }

  const formattedDate = formatEventDate(event.start_datetime);

  return {
    title: `${event.title} - Agenda Cultural Salvador`,
    description: `${formattedDate.date}${formattedDate.time ? ` às ${formattedDate.time}` : ""} • ${event.venue_name || "Local a confirmar"} • ${event.price_text || (event.is_free ? "Grátis" : "Consulte preço")}`,
    openGraph: {
      title: event.title,
      description: `${formattedDate.date}${formattedDate.time ? ` às ${formattedDate.time}` : ""} • ${event.venue_name || "Local a confirmar"}`,
      images: event.image_url ? [{ url: event.image_url }] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: event.title,
      description: `${formattedDate.date}${formattedDate.time ? ` às ${formattedDate.time}` : ""} • ${event.venue_name || "Local a confirmar"}`,
      images: event.image_url ? [event.image_url] : [],
    },
  };
}

function formatEventDate(dateStr: string): { date: string; time: string | null } {
  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!match) return { date: '?', time: null };
  const [, , month, day, hour, minute] = match;
  const timeStr = `${hour}:${minute}`;
  return {
    date: `${parseInt(day)} ${months[parseInt(month) - 1]}`,
    time: timeStr === '00:00' ? null : timeStr,
  };
}

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Supabase não configurado</h1>
          <p className="text-zinc-600">Configure as variáveis de ambiente para acessar os eventos.</p>
        </div>
      </div>
    );
  }

  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (!event) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Evento não encontrado</h1>
          <Link href="/" className="text-blue-600 hover:underline">
            Voltar para a página inicial
          </Link>
        </div>
      </div>
    );
  }

  const { date, time } = formatEventDate(event.start_datetime);
  const primaryUrl = event.url.split('|')[0];

  return (
    <div className="min-h-screen bg-zinc-50">
      <TrackPageView eventId={event.id} />
      {/* Hero Full-Bleed */}
      <div className="relative w-full h-64 md:h-96 lg:h-[500px] bg-zinc-900">
        {event.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-700">
            <span className="text-6xl">🎭</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        {/* Back Button */}
        <Link
          href="/"
          className="absolute top-4 left-4 md:top-8 md:left-8 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors flex items-center gap-2"
        >
          <ArrowLeft size={20} />
          <span>Voltar</span>
        </Link>

        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          {event.category && (
            <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-white/20 backdrop-blur-sm text-white mb-4">
              {event.category}
            </span>
          )}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2">
            {event.title}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 border border-zinc-200">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="text-zinc-600" size={24} />
              <span className="font-semibold text-zinc-900">Data e Horário</span>
            </div>
            <p className="text-zinc-700">
              {date}
              {time && <span className="ml-2">{time}</span>}
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-zinc-200">
            <div className="flex items-center gap-3 mb-2">
              <MapPin className="text-zinc-600" size={24} />
              <span className="font-semibold text-zinc-900">Local</span>
            </div>
            <p className="text-zinc-700">
              {event.venue_name || "Local a confirmar"}
            </p>
          </div>
        </div>

        {/* Mapa do local */}
        {event.latitude && event.longitude && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="text-zinc-700" size={20} />
              <h2 className="font-semibold text-zinc-900 text-lg">Como chegar</h2>
            </div>
            <EventMap
              events={[{
                id: event.id,
                title: event.title,
                venue_name: event.venue_name,
                latitude: event.latitude,
                longitude: event.longitude,
                start_datetime: event.start_datetime,
                image_url: event.image_url,
              }]}
              height="350px"
              zoom={16}
              singleEvent={true}
            />
            <div className="mt-3 flex gap-2">
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${event.latitude},${event.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                Rotas no Google Maps
              </a>
              <a
                href={`https://waze.com/ul?ll=${event.latitude},${event.longitude}&navigate=yes`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.54 6.63c.89 1.55 1.46 3.32 1.46 5.37 0 4.91-3.87 9-9 9H13c-.73.62-1.66 1-2.5 1-1.93 0-3.5-1.57-3.5-3.5v-.5c-2.45-.49-4.5-2.38-5.5-4.5C1.17 12 1 10.96 1 10c0-4.96 4.04-9 9-9 4.16 0 7.72 2.82 8.5 6.63h2.04z"/>
                </svg>
                Abrir no Waze
              </a>
            </div>
          </div>
        )}

        {/* Price */}
        <div className="bg-white rounded-xl p-6 border border-zinc-200 mb-8">
          <span className="font-semibold text-zinc-900">
            {event.is_free ? "Grátis" : event.price_text || "Consulte preço"}
          </span>
        </div>

        {/* Description */}
        {event.description && (
          <div className="bg-white rounded-xl p-6 border border-zinc-200 mb-8">
            <h2 className="font-semibold text-zinc-900 mb-4">Sobre o evento</h2>
            <p className="text-zinc-700 whitespace-pre-wrap">{event.description}</p>
          </div>
        )}

        {/* CTA Button */}
        <a
          href={`/cta/${event.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-violet-700 hover:to-fuchsia-700 transition-all shadow-lg hover:shadow-xl text-lg"
        >
          {event.is_free ? "Ver detalhes" : "Comprar ingresso"}
          <ExternalLink size={20} />
        </a>
      </div>
    </div>
  );
}
