"use client";

import Link from "next/link";

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

export default function EventList({ events }: { events: EventRow[] }) {
  if (events.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-5">
        <h2 className="text-base font-semibold">Nenhum evento encontrado</h2>
        <p className="mt-2 text-sm text-zinc-600">
          Tente ajustar os filtros para ver mais eventos.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
      {events.map((ev) => {
        const { date, time } = formatEventDate(ev.start_datetime);

        return (
          <Link
            key={ev.id}
            href={`/event/${ev.id}`}
            className="group flex flex-col"
          >
            {/* Image — landscape 16:9 */}
            <div className="relative w-full aspect-[16/9] bg-zinc-100 overflow-hidden rounded-lg transition-all group-hover:shadow-md group-hover:-translate-y-0.5">
              {ev.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={ev.image_url}
                  alt={ev.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-zinc-300">
                  <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              {/* Category badge overlay */}
              {ev.category && (
                <span className="absolute bottom-2 left-2 rounded-full bg-black/60 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
                  {ev.category}
                </span>
              )}
            </div>

            {/* Info below image — title first, venue, date */}
            <div className="flex flex-col gap-0.5 pt-2 pb-2 px-1">
              <h2 className="line-clamp-2 text-base font-bold leading-tight text-zinc-900">
                {ev.title}
              </h2>
              <p className="line-clamp-1 text-sm text-zinc-600 mt-0.5">
                {ev.venue_name ?? "Local a confirmar"}
              </p>
              <p className="text-xs text-zinc-500 mt-0.5">
                {date}{time ? ` • ${time}` : ""}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
