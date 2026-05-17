import { getSupabaseServerClient } from "@/lib/supabaseServer";
import Link from "next/link";
import { MapPin, User, ArrowRight, Calendar } from "lucide-react";
import { getCityConfig } from "@/config/cities";

function getWeekendDates(): { label: string; satLabel: string; sunLabel: string } {
  const now = new Date();
  const bahia = new Date(now.toLocaleString('en-US', { timeZone: 'America/Bahia' }));
  const day = bahia.getDay();

  let daysToSat = day === 0 ? 6 : day === 6 ? 0 : 6 - day;
  const sat = new Date(bahia);
  sat.setDate(bahia.getDate() + daysToSat);
  const sun = new Date(sat);
  sun.setDate(sat.getDate() + 1);

  const months = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
  const monthsShort = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];

  const satDay = sat.getDate();
  const sunDay = sun.getDate();
  const satMonth = months[sat.getMonth()];
  const sunMonth = months[sun.getMonth()];
  const satMonthShort = monthsShort[sat.getMonth()];
  const sunMonthShort = monthsShort[sun.getMonth()];

  const label = sat.getMonth() === sun.getMonth()
    ? `${satDay} e ${sunDay} de ${satMonth}`
    : `${satDay} de ${satMonthShort} e ${sunDay} de ${sunMonthShort}`;

  return {
    label,
    satLabel: `Sábado, ${satDay} de ${satMonth}`,
    sunLabel: `Domingo, ${sunDay} de ${sunMonth}`,
  };
}

type TourStop = {
  order_index: number;
  events: { image_url: string | null; title: string } | null;
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
  tour_stops: TourStop[];
};

function TourImageCollage({ stops, fallback }: { stops: TourStop[]; fallback: string | null }) {
  const images = stops
    .sort((a, b) => a.order_index - b.order_index)
    .map((s) => s.events?.image_url)
    .filter(Boolean) as string[];

  if (images.length === 0) {
    if (fallback) {
      return (
        <div className="aspect-video w-full overflow-hidden">
          <img src={fallback} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        </div>
      );
    }
    return (
      <div className="aspect-video w-full bg-zinc-100 flex items-center justify-center text-zinc-300">
        <MapPin size={48} />
      </div>
    );
  }

  if (images.length === 1) {
    return (
      <div className="aspect-video w-full overflow-hidden">
        <img src={images[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
      </div>
    );
  }

  if (images.length === 2) {
    return (
      <div className="aspect-video w-full grid grid-cols-2 gap-0.5 bg-zinc-200 overflow-hidden">
        {images.map((img, i) => (
          <div key={i} className="overflow-hidden h-full">
            <img src={img} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="aspect-video w-full flex gap-0.5 bg-zinc-200 overflow-hidden">
      <div className="w-1/2 overflow-hidden">
        <img src={images[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
      </div>
      <div className="w-1/2 flex flex-col gap-0.5">
        {images.slice(1, 3).map((img, i) => (
          <div key={i} className="flex-1 overflow-hidden">
            <img src={img} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function RoteirosPage() {
  const supabase = getSupabaseServerClient();
  const cityConfig = getCityConfig();
  const weekend = getWeekendDates();

  if (!supabase) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Supabase não configurado</h1>
        </div>
      </div>
    );
  }

  const { data: rawTours } = await supabase
    .from("tours")
    .select(`
      *,
      tour_stops (
        order_index,
        events ( image_url, title )
      )
    `)
    .eq("is_published", true)
    .eq("city", cityConfig.slug)
    .order("created_at", { ascending: false });

  const seenTitles = new Set<string>();
  const tours = (rawTours as Tour[] | null)?.filter((t) => {
    if (seenTitles.has(t.title)) return false;
    seenTitles.add(t.title);
    return true;
  }) ?? [];

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
          >
            ← Voltar para Home
          </Link>
          <div className="flex items-center gap-2 text-white/70 text-sm font-medium mb-2">
            <Calendar size={16} />
            <span>{weekend.label}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Roteiros do Fim de Semana
          </h1>
          <p className="text-lg text-white/90 max-w-2xl">
            Selecionamos os melhores roteiros para você curtir {cityConfig.name} neste fim de semana.
            Arte, cultura, gastronomia e muito mais — com horário, trajeto e experiência completa.
          </p>
          <div className="flex flex-wrap gap-3 mt-6 text-sm text-white/80">
            <span className="bg-white/20 rounded-full px-3 py-1">{weekend.satLabel}</span>
            <span className="bg-white/20 rounded-full px-3 py-1">{weekend.sunLabel}</span>
            {tours.length > 0 && (
              <span className="bg-white/20 rounded-full px-3 py-1">{tours.length} {tours.length === 1 ? 'roteiro' : 'roteiros'} disponíveis</span>
            )}
          </div>
        </div>
      </div>

      {/* Grid de Roteiros */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {tours.length === 0 ? (
          <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Nenhum roteiro disponível</h2>
            <p className="text-zinc-600">
              Em breve teremos roteiros curados para você explorar.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tours.map((tour) => (
              <Link
                key={tour.id}
                href={`/roteiros/${tour.id}`}
                className="group bg-white rounded-xl border border-zinc-200 overflow-hidden hover:shadow-lg transition-all"
              >
                <TourImageCollage stops={tour.tour_stops ?? []} fallback={tour.image_url} />

                {/* Content */}
                <div className="p-5">
                  <h2 className="text-xl font-bold text-zinc-900 mb-2 group-hover:text-violet-600 transition-colors">
                    {tour.title}
                  </h2>

                  <div className="flex items-center gap-2 text-sm text-zinc-600 mb-3">
                    <User size={16} />
                    <span>Por {tour.curator_name}</span>
                  </div>

                  {tour.description && (
                    <p className="text-sm text-zinc-600 line-clamp-3 mb-4">
                      {tour.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 text-violet-600 font-medium text-sm">
                    Ver roteiro completo
                    <ArrowRight size={16} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
