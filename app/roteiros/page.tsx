import { getSupabaseServerClient } from "@/lib/supabaseServer";
import Link from "next/link";
import { MapPin, User, ArrowRight } from "lucide-react";

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

export default async function RoteirosPage() {
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

  const { data: tours } = await supabase
    .from("tours")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

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
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Roteiros Curados
          </h1>
          <p className="text-lg text-white/90 max-w-2xl">
            Descubra Salvador através de roteiros pensados por curadores locais. 
            Múltiplos eventos conectados com horário, trajeto e experiência completa.
          </p>
        </div>
      </div>

      {/* Grid de Roteiros */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {!tours || tours.length === 0 ? (
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
                {/* Image */}
                {tour.image_url ? (
                  <div className="aspect-video w-full bg-zinc-100">
                    <img
                      src={tour.image_url}
                      alt={tour.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="aspect-video w-full bg-zinc-100 flex items-center justify-center text-zinc-300">
                    <MapPin size={48} />
                  </div>
                )}

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
