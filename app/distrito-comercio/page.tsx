import { getSupabaseServerClient } from "@/lib/supabaseServer";
import EventList from "../components/EventList";
import HappeningNow from "../components/HappeningNow";
import EventFilters from "../components/EventFilters";
import Link from "next/link";

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

  const { data: events } = await supabase
    .from("events")
    .select("*")
    .eq("district", "comercio")
    .gt("start_datetime", new Date().toISOString())
    .order("start_datetime", { ascending: true });

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header customizado */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
          >
            ← Voltar para Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Distrito do Comércio
          </h1>
          <p className="text-lg text-white/90 max-w-2xl">
            Eventos no coração histórico de Salvador — Pelourinho, Terreiro de Jesus, 
            Rua Chile e arredores. Descubra a cultura viva do centro da cidade.
          </p>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <HappeningNow events={events || []} />
        <EventFilters
          categoria="Todos"
          data=""
          onCategoriaChange={() => {}}
          onDataChange={() => {}}
        />
        <EventList events={events || []} />
      </div>
    </div>
  );
}
