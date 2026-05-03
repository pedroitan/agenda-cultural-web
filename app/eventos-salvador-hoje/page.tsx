import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { Metadata } from "next";
import EventList from "../components/EventList";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 300; // 5 minutos

export async function generateMetadata(): Promise<Metadata> {
  const today = new Date();
  const formattedDate = today.toLocaleDateString('pt-BR', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return {
    title: `Eventos Salvador Hoje - ${formattedDate} | Agenda Cultural`,
    description: `Descubra os melhores eventos culturais em Salvador hoje: ${formattedDate}. Shows, teatro, exposições, festivais e muito mais. Confira a agenda completa!`,
    keywords: "eventos salvador hoje, o que fazer em salvador, shows salvador, teatro salvador, agenda cultural salvador, eventos gratuitos salvador",
    openGraph: {
      title: `Eventos Salvador Hoje - ${formattedDate}`,
      description: `Os melhores eventos culturais em Salvador hoje: ${formattedDate}`,
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
};

export default async function EventosHojePage() {
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

  // Filtrar eventos de hoje (BRT adjustment)
  const now = new Date();
  const nowBRT = new Date(now.getTime() - (3 * 60 * 60 * 1000));
  const todayStart = new Date(nowBRT.getFullYear(), nowBRT.getMonth(), nowBRT.getDate());
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);

  const { data: events } = await supabase
    .from("events")
    .select("*")
    .gte("start_datetime", todayStart.toISOString())
    .lt("start_datetime", tomorrowStart.toISOString())
    .eq("is_active", true)
    .order("start_datetime", { ascending: true });

  const todayFormatted = new Date().toLocaleDateString('pt-BR', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

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
            Eventos Salvador Hoje
          </h1>
          <p className="text-lg text-white/90">
            {todayFormatted.charAt(0).toUpperCase() + todayFormatted.slice(1)}
          </p>
          <p className="text-white/70 mt-2">
            {events?.length || 0} eventos encontrados
          </p>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {events && events.length > 0 ? (
          <EventList events={events} />
        ) : (
          <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Nenhum evento hoje</h2>
            <p className="text-zinc-600 mb-4">
              Não há eventos agendados para hoje em Salvador.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
            >
              Ver eventos de outros dias
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
