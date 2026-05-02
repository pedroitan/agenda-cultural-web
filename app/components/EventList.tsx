"use client";

import { useState, useMemo } from "react";
import EventFilters from "./EventFilters";

// Format date for WhatsApp share
function formatDateForShare(dateStr: string): string {
  const months = [
    "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
    "Jul", "Ago", "Set", "Out", "Nov", "Dez"
  ];
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!match) return dateStr;
  const [, , month, day, hour, minute] = match;
  return `${day}/${month} às ${hour}:${minute}`;
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

// Format date as "16 Abril" and time as "19:00"
// Parses the literal stored value (BRT times stored as UTC-naive in DB)
// Does NOT apply timezone conversion - values are already BRT
function formatEventDate(dateStr: string): { date: string; time: string | null } {
  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!match) return { date: '?', time: null };
  const [, , month, day, hour, minute] = match;
  const timeStr = `${hour}:${minute}`;
  return {
    date: `${parseInt(day)} ${months[parseInt(month) - 1]}`,
    time: timeStr === '00:00' ? null : timeStr,
  };
}

export default function EventList({
  events,
  initialSearch = "",
  initialCategoria = "",
}: {
  events: EventRow[];
  initialSearch?: string;
  initialCategoria?: string;
}) {
  const [categoria, setCategoria] = useState<string>(initialCategoria || "Todos");
  const [data, setData] = useState<string>("");
  const [busca, setBusca] = useState<string>(initialSearch);

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
            
            const primaryUrl = urls[0];
            const whatsappText = `${ev.title} - ${formatDateForShare(ev.start_datetime)} - ${ev.venue_name ?? 'Local a confirmar'} - ${primaryUrl}`;
            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;
            
            return (
              <a
                key={ev.id}
                href={primaryUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  fetch(`/api/track-click/${ev.id}`, { method: 'POST' }).catch(() => {})
                }}
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
                      {date}{time ? ` • ${time}` : " • Horário a confirmar"}
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
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="flex-none self-center rounded-full bg-green-500 p-2 text-white hover:bg-green-600 transition-colors"
                  title="Compartilhar no WhatsApp"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </a>
              </a>
            );
          })}
        </div>
      )}
    </>
  );
}
