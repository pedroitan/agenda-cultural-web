"use client";

import { LucideIcon, Sparkles, Music, Theater, Palette, Utensils, BookOpen, Mic, Heart, Gamepad2, Church } from "lucide-react";

const categories: { label: string; icon: LucideIcon }[] = [
  { label: "Todos",          icon: Sparkles },
  { label: "Shows e Festas", icon: Music },
  { label: "Teatro",         icon: Theater },
  { label: "Arte e Cultura", icon: Palette },
  { label: "Gastronomia",    icon: Utensils },
  { label: "Cursos",         icon: BookOpen },
  { label: "Palestras",      icon: Mic },
  { label: "Bem-estar",      icon: Heart },
  { label: "Games e Geek",   icon: Gamepad2 },
  { label: "Religioso",      icon: Church },
  { label: "Copa do Mundo",  icon: Gamepad2 },
];

const dateFilters = [
  { label: "Todas as datas", value: "" },
  { label: "Hoje", value: "today" },
  { label: "Esta semana", value: "week" },
  { label: "Este mês", value: "month" },
  { label: "Copa do Mundo", value: "worldcup" },
];

type EventFiltersProps = {
  categoria: string;
  data: string;
  onCategoriaChange: (value: string) => void;
  onDataChange: (value: string) => void;
  showOnMobile?: boolean;
};

function updateURL(categoria: string, q: string) {
  const params = new URLSearchParams();
  if (categoria && categoria !== "Todos") params.set("categoria", categoria);
  if (q) params.set("q", q);
  const url = params.toString() ? `/?${params.toString()}` : "/";
  window.history.replaceState(null, "", url);
}

export default function EventFilters({
  categoria,
  data,
  onCategoriaChange,
  onDataChange,
  showOnMobile = false,
}: EventFiltersProps) {
  const handleCategoriaChange = (cat: string) => {
    onCategoriaChange(cat);
  };

  return (
    <div className={`mb-6 space-y-3 ${showOnMobile ? '' : 'hidden md:block'}`}>
      {/* Category pills with icons */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat.label}
            onClick={() => handleCategoriaChange(cat.label)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all ${
              categoria === cat.label
                ? "bg-zinc-900 text-white shadow-sm"
                : "bg-white border border-zinc-200 text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50"
            }`}
          >
            <cat.icon size={16} />
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Date filter */}
      <div className="flex gap-2 flex-wrap items-center">
        {dateFilters.map((df) => (
          <button
            key={df.value}
            onClick={() => onDataChange(df.value)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              data === df.value
                ? "bg-zinc-900 text-white"
                : "bg-white border border-zinc-200 text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50"
            }`}
          >
            {df.label}
          </button>
        ))}

        {/* Date picker */}
        <div className="relative">
          <input
            type="date"
            value={data.startsWith('date:') ? data.replace('date:', '') : ''}
            onChange={(e) => onDataChange(e.target.value ? `date:${e.target.value}` : '')}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
              data.startsWith('date:')
                ? "bg-zinc-900 text-white"
                : "bg-white border border-zinc-200 text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50"
            }`}
          />
        </div>
      </div>
    </div>
  );
}
