'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import EventFilters from './EventFilters';
import EventList from './EventList';

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

function updateURL(categoria: string, q: string) {
  const params = new URLSearchParams();
  if (categoria && categoria !== 'Todos') params.set('categoria', categoria);
  if (q) params.set('q', q);
  const url = params.toString() ? `/?${params.toString()}` : '/';
  window.history.replaceState(null, '', url);
}

export default function PageClient({
  events,
  eventCount,
  initialSearch = '',
  initialCategoria = '',
  cityName = 'Salvador',
  cityPreposition = 'em',
}: {
  events: EventRow[];
  eventCount: number;
  initialSearch?: string;
  initialCategoria?: string;
  cityName?: string;
  cityPreposition?: string;
}) {
  const [busca, setBusca] = useState(initialSearch);
  const [categoria, setCategoria] = useState(initialCategoria || 'Todos');
  const [data, setData] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const filteredEvents = useMemo(() => {
    let filtered = events;

    if (categoria && categoria !== 'Todos') {
      if (categoria === 'Shows e Festas') {
        // Filtra tanto Shows quanto Festas quanto "Shows e Festas" (legado)
        filtered = filtered.filter((e) => 
          e.category === 'Shows' || 
          e.category === 'Festas' || 
          e.category === 'Shows e Festas'
        );
      } else {
        filtered = filtered.filter((e) => e.category === categoria);
      }
    }

    if (data) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      if (data === 'today') {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        filtered = filtered.filter((e) => {
          const eventDate = new Date(e.start_datetime);
          const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000);
          return eventDate >= fourHoursAgo && eventDate < tomorrow;
        });
      } else if (data === 'week') {
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);
        filtered = filtered.filter((e) => {
          const eventDate = new Date(e.start_datetime);
          const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000);
          return eventDate >= fourHoursAgo && eventDate < nextWeek;
        });
      } else if (data === 'month') {
        const nextMonth = new Date(today);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        filtered = filtered.filter((e) => {
          const eventDate = new Date(e.start_datetime);
          const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000);
          return eventDate >= fourHoursAgo && eventDate < nextMonth;
        });
      } else if (data.startsWith('date:')) {
        // Specific date filter: date:YYYY-MM-DD
        const selectedDateStr = data.replace('date:', '');
        const [year, month, day] = selectedDateStr.split('-').map(Number);
        const selectedDate = new Date(year, month - 1, day);
        const nextDay = new Date(selectedDate);
        nextDay.setDate(nextDay.getDate() + 1);
        filtered = filtered.filter((e) => {
          const eventDate = new Date(e.start_datetime);
          return eventDate >= selectedDate && eventDate < nextDay;
        });
      }
    }

    if (busca) {
      const searchLower = busca.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.title.toLowerCase().includes(searchLower) ||
          e.venue_name?.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [events, categoria, data, busca]);

  const handleCategoriaChange = (cat: string) => {
    setCategoria(cat);
    updateURL(cat, busca);
  };

  const handleBuscaChange = (q: string) => {
    setBusca(q);
    updateURL(categoria, q);
  };

  const handleBuscaKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white shadow-sm">
        {/* Linha 1: nome + botões de ação */}
        <div className="mx-auto flex w-full max-w-6xl items-center gap-2 px-4 pt-3 pb-2">
          <h1 className="shrink-0 text-sm font-bold text-zinc-900 hidden sm:block mr-auto">
            Agenda Cultural {cityName}
          </h1>
          <div className="flex-1 sm:flex-none" />
          <Link
            href="/restaurantes"
            className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-orange-200 bg-orange-50 text-orange-700 px-3 py-1.5 text-sm font-medium hover:bg-orange-100 transition-colors whitespace-nowrap"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="hidden sm:inline">Restaurantes</span>
            <span className="sm:hidden">🍽️</span>
          </Link>
          <Link
            href="/roteiros"
            className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 text-violet-700 px-3 py-1.5 text-sm font-medium hover:bg-violet-100 transition-colors whitespace-nowrap"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <span className="hidden sm:inline">Roteiros</span>
            <span className="sm:hidden">Roteiros</span>
          </Link>
          <Link
            href="/adicionar-evento"
            className="shrink-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white px-3 py-1.5 rounded-lg font-medium hover:from-violet-700 hover:to-fuchsia-700 transition-all shadow-sm text-sm whitespace-nowrap"
          >
            + Adicionar Evento
          </Link>
        </div>
        {/* Linha 2: busca + filtros */}
        <div className="mx-auto flex w-full max-w-6xl items-center gap-2 px-4 pb-3">
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              type="search"
              placeholder={`Buscar evento ${cityPreposition} ${cityName}...`}
              value={busca}
              onChange={(e) => handleBuscaChange(e.target.value)}
              onKeyDown={handleBuscaKeyDown}
              className="w-full rounded-full border border-zinc-200 bg-zinc-50 pl-9 pr-4 py-2 text-sm focus:bg-white focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-100 transition-all"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
              showFilters
                ? 'bg-violet-600 border-violet-600 text-white'
                : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
            </svg>
            Filtros
            {(categoria !== 'Todos' || data) && (
              <span className="ml-0.5 bg-white text-violet-700 rounded-full w-4 h-4 text-xs flex items-center justify-center font-bold">
                {(categoria !== 'Todos' ? 1 : 0) + (data ? 1 : 0)}
              </span>
            )}
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-6">
        {showFilters && (
          <EventFilters
            categoria={categoria}
            data={data}
            onCategoriaChange={handleCategoriaChange}
            onDataChange={setData}
            showOnMobile={showFilters}
          />
        )}
        <EventList events={filteredEvents} />
      </main>
    </>
  );
}
