"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useEffect } from "react";

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

export default function EventFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get("categoria") || "Todos";
  const currentDate = searchParams.get("data") || "";
  const currentSearch = searchParams.get("busca") || "";

  // Local state for search input (for instant typing)
  const [searchInput, setSearchInput] = useState(currentSearch);

  const updateFilters = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "Todos" && value !== "") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`/?${params.toString()}`);
    },
    [router, searchParams]
  );

  // Debounce search input - only update URL after 500ms of no typing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== currentSearch) {
        updateFilters("busca", searchInput);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput, currentSearch, updateFilters]);

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
              onClick={() => updateFilters("categoria", cat)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                currentCategory === cat
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
            onClick={() => updateFilters("data", df.value)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              currentDate === df.value
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
