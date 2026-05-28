import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { Metadata } from "next";
import EventList from "../../components/EventList";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 300; // 5 minutos

// Mapeamento de slugs para categorias e SEO
const CATEGORY_MAP: Record<string, { category: string | null; title: string; description: string; keywords: string }> = {
  "teatro-salvador": {
    category: "Teatro",
    title: "Teatro em Salvador - Peças e Espetáculos | Agenda Cultural",
    description: "Confira os melhores espetáculos de teatro em Salvador. Peças clássicas, contemporâneas, teatro infantil e muito mais. Agenda completa de teatros.",
    keywords: "teatro salvador, peças salvador, espetáculos salvador, teatro infantil salvador, agenda teatral salvador"
  },
  "shows-salvador": {
    category: "Shows",
    title: "Shows em Salvador - Música Ao Vivo | Agenda Cultural",
    description: "Descubra os melhores shows em Salvador: rock, pop, samba, reggae, forró e muito mais. Agenda completa de shows e apresentações ao vivo.",
    keywords: "shows salvador, música ao vivo salvador, shows salvador hoje, concertos salvador, agenda shows salvador"
  },
  "exposicoes-salvador": {
    category: "Exposições",
    title: "Exposições em Salvador - Arte e Cultura | Agenda Cultural",
    description: "Visite as melhores exposições de arte e cultura em Salvador. Galerias, museus, centros culturais e eventos de arte contemporânea.",
    keywords: "exposições salvador, arte salvador, museus salvador, galerias salvador, cultura visual salvador"
  },
  "festivais-salvador": {
    category: "Festivais",
    title: "Festivais em Salvador - Eventos de Grande Porte | Agenda Cultural",
    description: "Não perca os grandes festivais de Salvador: música, cultura, gastronomia e muito mais. Calendário completo de festivais.",
    keywords: "festivais salvador, eventos grandes salvador, festas salvador, calendário festivais salvador"
  },
  "eventos-gratuitos-salvador": {
    category: null, // Filtra por is_free
    title: "Eventos Gratuitos em Salvador - Cultura de Graça | Agenda Cultural",
    description: "Descubra eventos culturais gratuitos em Salvador: shows, teatro, exposições, workshops e muito mais. Cultura para todos!",
    keywords: "eventos gratuitos salvador, cultura gratuita salvador, shows grátis salvador, atividades gratuitas salvador"
  },
  "eventos-criancas-salvador": {
    category: "Infantil",
    title: "Eventos para Crianças em Salvador | Agenda Cultural",
    description: "Os melhores eventos infantis em Salvador: teatro, oficinas, shows para crianças, atividades recreativas e muito mais.",
    keywords: "eventos crianças salvador, atividades infantis salvador, teatro infantil salvador, diversão kids salvador"
  },
  "forro-salvador": {
    category: "Shows e Festas",
    title: "Forró e São João em Salvador | Agenda Cultural",
    description: "Confira os melhores eventos de forró e São João em Salvador. Arrastões, quadrilhas, festas juninas e muito mais.",
    keywords: "forró salvador, são joão salvador, festas juninas salvador, quadrilhas salvador, arrastão forró salvador"
  }
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const config = CATEGORY_MAP[slug];

  if (!config) {
    return {
      title: "Categoria não encontrada",
    };
  }

  return {
    title: config.title,
    description: config.description,
    keywords: config.keywords,
    openGraph: {
      title: config.title,
      description: config.description,
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

export default async function CategoriaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const config = CATEGORY_MAP[slug];

  if (!config) {
    notFound();
  }

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

  // Filtrar eventos por categoria ou is_free
  let query = supabase
    .from("events")
    .select("*")
    .eq("is_active", true)
    .gt("start_datetime", new Date().toISOString())
    .order("start_datetime", { ascending: true });

  if (config.category) {
    query = query.eq("category", config.category);
  } else if (slug === "eventos-gratuitos-salvador") {
    query = query.eq("is_free", true);
  }

  const { data: events } = await query;

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
            {config.title.split(" - ")[0]}
          </h1>
          <p className="text-lg text-white/90 max-w-2xl">
            {config.description}
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
            <h2 className="text-xl font-semibold mb-2">Nenhum evento encontrado</h2>
            <p className="text-zinc-600 mb-4">
              Não há eventos nesta categoria no momento.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
            >
              Ver todos os eventos
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
