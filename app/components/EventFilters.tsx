"use client";

import { useState, useEffect } from "react";

const categories = [
  "Todos",
  "Shows e Festas",
  "Teatro",
  "Arte e Cultura",
  "Gastronomia",
  "Cursos",
  "Palestras",
  "Bem-estar",
  "Games e Geek",
  "Religioso",
];

const dateFilters = [
  { label: "Todas as datas", value: "" },
  { label: "Hoje", value: "today" },
  { label: "Esta semana", value: "week" },
  { label: "Este mês", value: "month" },
];

type EventFiltersProps = {
  categoria: string;
  data: string;
  busca: string;
  onCategoriaChange: (value: string) => void;
  onDataChange: (value: string) => void;
  onBuscaChange: (value: string) => void;
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
  busca,
  onCategoriaChange,
  onDataChange,
  onBuscaChange,
}: EventFiltersProps) {
  // Local state for search input (for instant typing)
  const [searchInput, setSearchInput] = useState(busca);

  // Debounce search input - update state + URL after 400ms
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== busca) {
        onBuscaChange(searchInput);
        updateURL(categoria, searchInput);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput, busca, onBuscaChange, categoria]);

  const handleCategoriaChange = (cat: string) => {
    onCategoriaChange(cat);
    updateURL(cat, searchInput);
  };

  return (
    <div className="mb-6 space-y-4">
      {/* Search */}
      <div>
        <input
          type="text"
          placeholder="Buscar evento..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm focus:border-zinc-400 focus:outline-none"
        />
      </div>

      {/* Category and Date filters */}
      <div className="flex flex-wrap gap-2">
        {/* Category pills */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoriaChange(cat)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                categoria === cat
                  ? "bg-zinc-900 text-white"
                  : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Date filter */}
      <div className="flex gap-2">
        {dateFilters.map((df) => (
          <button
            key={df.value}
            onClick={() => onDataChange(df.value)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              data === df.value
                ? "bg-zinc-900 text-white"
                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
            }`}
          >
            {df.label}
          </button>
        ))}
      </div>
    </div>
  );
}
