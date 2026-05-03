'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import HappeningNow from './HappeningNow';
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
}: {
  events: EventRow[];
  eventCount: number;
  initialSearch?: string;
  initialCategoria?: string;
}) {
  const [busca, setBusca] = useState(initialSearch);
  const [categoria, setCategoria] = useState(initialCategoria || 'Todos');
  const [data, setData] = useState('');

  const filteredEvents = useMemo(() => {
    let filtered = events;

    if (categoria && categoria !== 'Todos') {
      filtered = filtered.filter((e) => e.category === categoria);
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

  return (
    <>
      {/* Header com search no menu superior — estilo Sympla */}
      <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white shadow-sm">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-4 py-3">
          <h1 className="shrink-0 text-sm font-bold text-zinc-900 hidden sm:block">
            Agenda Cultural Salvador
          </h1>
          {/* Search bar — centralizada, proeminente */}
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              type="text"
              placeholder="O que você quer curtir hoje em Salvador?"
              value={busca}
              onChange={(e) => handleBuscaChange(e.target.value)}
              className="w-full rounded-full border border-zinc-200 bg-zinc-50 pl-9 pr-4 py-2 text-sm focus:bg-white focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-100 transition-all"
            />
          </div>
          <Link
            href="/adicionar-evento"
            className="shrink-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white px-3 py-2 rounded-lg font-medium hover:from-violet-700 hover:to-fuchsia-700 transition-all shadow-sm text-sm whitespace-nowrap"
          >
            + Adicionar Evento
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-6">
        <HappeningNow events={events} />
        <EventFilters
          categoria={categoria}
          data={data}
          onCategoriaChange={handleCategoriaChange}
          onDataChange={setData}
        />
        <EventList events={filteredEvents} />
      </main>
    </>
  );
}
