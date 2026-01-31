"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useMemo } from "react";
import EventFilters from "./EventFilters";

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

// Format date as "16 Janeiro" and time as "19:00"
function formatEventDate(dateStr: string): { date: string; time: string } {
  const d = new Date(dateStr);
  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  const day = d.getDate();
  const month = months[d.getMonth()];
  const hours = d.getHours().toString().padStart(2, "0");
  const minutes = d.getMinutes().toString().padStart(2, "0");
  
  return {
    date: `${day} ${month}`,
    time: `${hours}:${minutes}`,
  };
}

export default function EventList({ events }: { events: EventRow[] }) {
  const [categoria, setCategoria] = useState<string>("Todos");
  const [data, setData] = useState<string>("");
  const [busca, setBusca] = useState<string>("");

  // Client-side filtering - instant, no page reload
  const filteredEvents = useMemo(() => {
    let filtered = events;

    // Filter by category
    if (categoria && categoria !== "Todos") {
      filtered = filtered.filter((e) => e.category === categoria);
    }

    // Filter by date
    if (data) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      if (data === "today") {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        filtered = filtered.filter((e) => {
          const eventDate = new Date(e.start_datetime);
          const fourHoursAgo = new Date(now.getTime() - (4 * 60 * 60 * 1000));
          return eventDate >= fourHoursAgo && eventDate < tomorrow;
        });
      } else if (data === "week") {
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);
        filtered = filtered.filter((e) => {
          const eventDate = new Date(e.start_datetime);
          const fourHoursAgo = new Date(now.getTime() - (4 * 60 * 60 * 1000));
          return eventDate >= fourHoursAgo && eventDate < nextWeek;
        });
      } else if (data === "month") {
        const nextMonth = new Date(today);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        filtered = filtered.filter((e) => {
          const eventDate = new Date(e.start_datetime);
          const fourHoursAgo = new Date(now.getTime() - (4 * 60 * 60 * 1000));
          return eventDate >= fourHoursAgo && eventDate < nextMonth;
        });
      }
    }

    // Filter by search text
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

  return (
    <>
      <EventFilters
        categoria={categoria}
        data={data}
        busca={busca}
        onCategoriaChange={setCategoria}
        onDataChange={setData}
        onBuscaChange={setBusca}
      />

      {filteredEvents.length === 0 ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <h2 className="text-base font-semibold">Nenhum evento encontrado</h2>
          <p className="mt-2 text-sm text-zinc-600">
            {events.length > 0
              ? "Tente ajustar os filtros para ver mais eventos."
              : "Quando o scraper rodar e persistir eventos, eles vão aparecer aqui."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredEvents.map((ev) => {
            const { date, time } = formatEventDate(ev.start_datetime);
            const urls = ev.url.split('|');
            const sources = urls.map(url => {
              if (url.includes('sympla.com')) return 'Sympla';
              if (url.includes('elcabong.com')) return 'El Cabong';
              return 'Outro';
            });
            const hasMultipleSources = urls.length > 1;
            
            return (
              <Link
                key={ev.id}
                href={`/r/${ev.id}`}
                prefetch={false}
                className="flex gap-4 rounded-xl border border-zinc-200 bg-white p-4 transition-shadow hover:shadow-md"
              >
                <div className="relative h-20 w-20 flex-none overflow-hidden rounded-lg bg-zinc-100">
                  {ev.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={ev.image_url}
                      alt={ev.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-zinc-400">
                      <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-xs font-medium text-zinc-500">
                      {date} • {time}
                    </p>
                    {ev.category && (
                      <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
                        {ev.category}
                      </span>
                    )}
                    {hasMultipleSources && (
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                        {sources.join(' + ')}
                      </span>
                    )}
                  </div>
                  <h2 className="mt-1 line-clamp-2 text-base font-semibold">
                    {ev.title}
                  </h2>
                  <p className="mt-1 text-sm text-zinc-600">
                    {ev.venue_name ?? "Local a confirmar"}
                  </p>
                  {ev.is_free && (
                    <p className="mt-1 text-sm font-medium text-green-600">
                      Gratuito
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
