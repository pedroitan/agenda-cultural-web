import { getSupabaseServerClient } from "@/lib/supabaseServer";
import EventList from "../components/EventList";
import EventMap from "../components/EventMap";
import HappeningNow from "../components/HappeningNow";
import Link from "next/link";

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
  category: string | null;
  url: string;
};

export default async function DistritoComercioPage() {
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

  // Padrões e coordenadas de fallback para cada área do Distrito do Comércio
  const districtPatterns: { pattern: RegExp; lat: number; lng: number }[] = [
    { pattern: /terreiro de jesus/i,   lat: -12.9741, lng: -38.5072 },
    { pattern: /largo do pelourinho/i, lat: -12.9735, lng: -38.5083 },
    { pattern: /pelourinho/i,          lat: -12.9732, lng: -38.5089 },
    { pattern: /rua chile/i,           lat: -12.9705, lng: -38.5107 },
    { pattern: /centro histórico/i,    lat: -12.9730, lng: -38.5050 },
    { pattern: /centro historico/i,    lat: -12.9730, lng: -38.5050 },
    { pattern: /praça da sé/i,         lat: -12.9712, lng: -38.5030 },
    { pattern: /praca da se/i,         lat: -12.9712, lng: -38.5030 },
    { pattern: /\bsé\b/i,              lat: -12.9712, lng: -38.5030 },
    { pattern: /baixa dos sapateiros/i,lat: -12.9720, lng: -38.5010 },
  ];

  const { data: allEvents, error } = await supabase
    .from("events")
    .select("*")
    .eq("is_active", true)
    .gt("start_datetime", new Date().toISOString())
    .order("start_datetime", { ascending: true });

  // Filtrar e enriquecer com coordenadas de fallback se necessário
  const events = (allEvents || [])
    .map((ev) => {
      const venue = ev.venue_name || "";
      const match = districtPatterns.find(({ pattern }) => pattern.test(venue));
      if (!match) return null;
      // Se não tem coordenadas, usar as do bairro correspondente
      if (!ev.latitude || !ev.longitude) {
        return { ...ev, latitude: match.lat, longitude: match.lng };
      }
      return ev;
    })
    .filter(Boolean);

  if (error) {
    console.error("Erro ao buscar eventos do distrito:", error);
  }
  console.log("Eventos do distrito encontrados:", events?.length || 0);

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header customizado */}
      <div className="relative">
        <img
          src="/distrito-comercio-header.jpg"
          alt="Vista aérea do porto de Salvador e bairro do comércio"
          className="w-full h-64 md:h-80 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-amber-900/80 to-orange-900/70">
          <div className="max-w-6xl mx-auto px-4 py-12 h-full flex flex-col justify-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
            >
              ← Voltar para Home
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              Distrito do Comércio
            </h1>
            <p className="text-lg text-white/90 max-w-2xl">
              Eventos no coração histórico de Salvador — Pelourinho, Terreiro de Jesus, 
              Rua Chile e arredores. Descubra a cultura viva do centro da cidade.
            </p>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Mapa com marcadores dos eventos */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-zinc-900 mb-4">Mapa de Eventos</h2>
          <EventMap events={events || []} height="400px" />
        </div>

        <HappeningNow events={events || []} />
        <EventList events={events || []} />
      </div>
    </div>
  );
}
