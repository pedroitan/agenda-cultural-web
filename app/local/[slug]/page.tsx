import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { Metadata } from "next";
import EventList from "../../components/EventList";
import Link from "next/link";
import { MapPin, Calendar } from "lucide-react";

// Função para normalizar texto removendo acentos e caracteres especiais
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9\s]/g, ' ') // Remove caracteres especiais (-, ,, etc.)
    .replace(/\s+/g, ' ') // Normaliza espaços múltiplos
    .trim();
}

export const dynamic = "force-dynamic";
export const revalidate = 300; // 5 minutos

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const venueName = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return {
    title: `Eventos em ${venueName} - Salvador | Agenda Cultural`,
    description: `Confira todos os eventos culturais que acontecem em ${venueName} em Salvador. Shows, peças de teatro, exposições e muito mais.`,
    keywords: `eventos ${venueName} salvador, ${venueName} salvador, agenda cultural ${venueName}`,
    openGraph: {
      title: `Eventos em ${venueName}`,
      description: `Eventos culturais em ${venueName} - Salvador`,
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

export default async function VenuePage({ params }: Props) {
  const { slug } = await params;
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

  // Converter slug para nome do local normalizado (sem acentos)
  const venueName = slug.replace(/-/g, ' ');

  // Buscar todos os eventos ativos
  const { data: events } = await supabase
    .from("events")
    .select("*")
    .eq("is_active", true)
    .gt("start_datetime", new Date().toISOString())
    .order("start_datetime", { ascending: true });

  // Filtrar eventos por local usando normalização de texto
  const venueEvents = (events as EventRow[] || []).filter(
    (e) => {
      if (!e.venue_name) return false;
      const normalizedVenue = normalizeText(e.venue_name);
      const normalizedSlug = normalizeText(venueName);
      return normalizedVenue.includes(normalizedSlug);
    }
  );

  // Agrupar eventos por data
  const eventsByDate = venueEvents.reduce((acc, event) => {
    const dateKey = event.start_datetime.split('T')[0];
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(event);
    return acc;
  }, {} as Record<string, EventRow[]>);

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
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
          >
            ← Voltar para Home
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <MapPin size={48} />
            <h1 className="text-4xl md:text-5xl font-bold">{venueName}</h1>
          </div>
          <p className="text-lg text-white/90 max-w-2xl">
            Eventos culturais que acontecem neste local em Salvador
          </p>
          <p className="text-white/70 mt-2">
            {venueEvents.length} evento{venueEvents.length !== 1 ? 's' : ''} encontrado{venueEvents.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {Object.keys(eventsByDate).length > 0 ? (
          Object.entries(eventsByDate)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, events]) => (
              <div key={date} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="text-blue-600" size={20} />
                  <h2 className="text-xl font-semibold text-gray-900">{formatDate(date)}</h2>
                </div>
                <EventList events={events} />
              </div>
            ))
        ) : (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
            <MapPin size={48} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Nenhum evento encontrado</h2>
            <p className="text-gray-600 mb-4">
              Não há eventos cadastrados para este local no momento.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              Ver todos os eventos
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
