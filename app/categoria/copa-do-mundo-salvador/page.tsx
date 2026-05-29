import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { Metadata } from "next";
import EventList from "../../components/EventList";
import Link from "next/link";
import { Trophy, Calendar, MapPin } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 300; // 5 minutos

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Copa do Mundo 2026 - Eventos em Salvador | Agenda Cultural",
    description: "Confira todos os eventos relacionados à Copa do Mundo 2026 em Salvador. Assistência pública, festas, shows e muito mais durante os jogos.",
    keywords: "copa do mundo 2026 salvador, eventos copa salvador, jogos copa salvador, festa copa salvador, world cup salvador",
    openGraph: {
      title: "Copa do Mundo 2026 - Eventos em Salvador",
      description: "Eventos relacionados à Copa do Mundo 2026 em Salvador",
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
  price_text: string | null;
  is_free: boolean;
  category: string | null;
  url: string;
  tags?: string[];
};

// Datas dos jogos da Copa do Mundo 2026 (calendário oficial)
const WORLD_CUP_MATCH_DATES = [
  "2026-06-11", "2026-06-12", "2026-06-13", "2026-06-14", "2026-06-15", "2026-06-16",
  "2026-06-17", "2026-06-18", "2026-06-19", "2026-06-20", "2026-06-21", "2026-06-22",
  "2026-06-23", "2026-06-24", "2026-06-25", "2026-06-26", "2026-06-27", "2026-06-28",
  "2026-06-29", "2026-06-30", "2026-07-01", "2026-07-02", "2026-07-03", "2026-07-04",
  "2026-07-05", "2026-07-07", "2026-07-09", "2026-07-10", "2026-07-11", "2026-07-14",
  "2026-07-15", "2026-07-18", "2026-07-19",
];

export default async function CopaMundoPage() {
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

  // Filtrar eventos relacionados à Copa do Mundo
  const { data: allEvents } = await supabase
    .from("events")
    .select("*")
    .eq("is_active", true)
    .gt("start_datetime", new Date().toISOString())
    .order("start_datetime", { ascending: true });

  const worldCupEvents = (allEvents as EventRow[] || []).filter((e) =>
    e.category === "Copa do Mundo" ||
    e.title?.toLowerCase().includes("copa") ||
    e.title?.toLowerCase().includes("world cup") ||
    e.title?.toLowerCase().includes("futebol") ||
    e.tags?.some((tag: string) => tag.toLowerCase().includes("copa") || tag.toLowerCase().includes("world cup"))
  );

  // Agrupar por data de jogo
  const eventsByMatchDate = WORLD_CUP_MATCH_DATES.map((date) => {
    const dayEvents = worldCupEvents.filter((e) => e.start_datetime.startsWith(date));
    return { date, events: dayEvents };
  }).filter((d) => d.events.length > 0);

  // Eventos não associados a datas específicas de jogo
  const otherEvents = worldCupEvents.filter((e) =>
    !WORLD_CUP_MATCH_DATES.some((date) => e.start_datetime.startsWith(date))
  );

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-yellow-500 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
          >
            ← Voltar para Home
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <Trophy size={48} />
            <h1 className="text-4xl md:text-5xl font-bold">Copa do Mundo 2026</h1>
          </div>
          <p className="text-lg text-white/90 max-w-2xl">
            Eventos relacionados à Copa do Mundo em Salvador. Festas, shows, assistência pública e muito mais.
          </p>
          <p className="text-white/70 mt-2">
            {worldCupEvents.length} eventos encontrados
          </p>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Eventos por data de jogo */}
        {eventsByMatchDate.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Eventos por Dia de Jogo</h2>
            <div className="space-y-6">
              {eventsByMatchDate.map(({ date, events }) => (
                <div key={date} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <Calendar className="text-green-600" size={20} />
                    <h3 className="text-xl font-semibold text-gray-900">{formatDate(date)}</h3>
                  </div>
                  <EventList events={events} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Outros eventos da Copa */}
        {otherEvents.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Outros Eventos da Copa</h2>
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <EventList events={otherEvents} />
            </div>
          </div>
        )}

        {/* Sem eventos */}
        {worldCupEvents.length === 0 && (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
            <Trophy size={48} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Nenhum evento da Copa encontrado</h2>
            <p className="text-gray-600 mb-4">
              Ainda não há eventos relacionados à Copa do Mundo cadastrados.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
            >
              Ver todos os eventos
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
