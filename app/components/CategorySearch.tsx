'use client';

import { useState, useMemo } from 'react';
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

type CategorySearchProps = {
  events: EventRow[];
};

export default function CategorySearch({ events }: CategorySearchProps) {
  const [busca, setBusca] = useState('');

  const filteredEvents = useMemo(() => {
    if (!busca) return events;

    const searchLower = busca.toLowerCase();
    return events.filter(
      (e) =>
        e.title.toLowerCase().includes(searchLower) ||
        e.venue_name?.toLowerCase().includes(searchLower)
    );
  }, [events, busca]);

  const handleBuscaChange = (q: string) => {
    setBusca(q);
  };

  const handleBuscaKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <>
      <div className="mb-6">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            type="search"
            placeholder="Buscar nesta categoria..."
            value={busca}
            onChange={(e) => handleBuscaChange(e.target.value)}
            onKeyDown={handleBuscaKeyDown}
            className="w-full rounded-full border border-zinc-200 bg-zinc-50 pl-9 pr-4 py-2 text-sm focus:bg-white focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-100 transition-all"
          />
        </div>
      </div>
      <EventList events={filteredEvents} />
    </>
  );
}
