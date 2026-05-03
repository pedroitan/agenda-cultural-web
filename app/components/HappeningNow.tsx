'use client';

import Link from "next/link";

type Event = {
  id: string;
  title: string;
  start_datetime: string;
  venue_name: string | null;
  image_url: string | null;
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

export default function HappeningNow({ events }: { events: Event[] }) {
  // Filter events happening now: started within last 2 hours (simplified logic without end_datetime)
  const now = new Date();
  const twoHoursAgo = new Date(now.getTime() - (2 * 60 * 60 * 1000));
  const happeningNow = events.filter(event => {
    const start = new Date(event.start_datetime);
    return start >= twoHoursAgo && start <= now;
  });

  if (happeningNow.length === 0) {
    return null;
  }

  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <p className="text-sm font-semibold tracking-wider uppercase text-zinc-500">
          Acontecendo agora
        </p>
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
      </div>
      
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {happeningNow.map(event => {
          const { date, time } = formatEventDate(event.start_datetime);
          return (
            <Link
              key={event.id}
              href={`/event/${event.id}`}
              className="flex-shrink-0 w-64 cursor-pointer group"
            >
              <div className="relative w-full aspect-[16/9] bg-zinc-100 overflow-hidden rounded-lg transition-all group-hover:shadow-md group-hover:-translate-y-0.5">
                {event.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={event.image_url}
                    alt={event.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-zinc-300">
                    <span className="text-sm">Sem imagem</span>
                  </div>
                )}
                <div className="absolute top-2 left-2">
                  {event.category && (
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-black/60 text-white backdrop-blur-sm">
                      {event.category}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-0.5 pt-2 pb-2 px-1">
                <p className="line-clamp-2 text-base font-bold leading-tight text-zinc-900">
                  {event.title}
                </p>
                <p className="line-clamp-1 text-sm text-zinc-600 mt-0.5">
                  {event.venue_name ?? "Local a confirmar"}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
