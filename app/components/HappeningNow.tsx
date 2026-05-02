'use client';

type Event = {
  id: string;
  title: string;
  start_datetime: string;
  venue_name: string | null;
  image_url: string | null;
  category: string | null;
  url: string;
};

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

  const handleEventClick = (url: string) => {
    window.open(url.split('|')[0], '_blank');
  };

  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <p className="text-sm font-semibold tracking-wider uppercase text-[var(--text-secondary)]">
          Acontecendo agora
        </p>
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent-secondary)] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent-secondary)]"></span>
        </span>
      </div>
      
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {happeningNow.map(event => (
          <div
            key={event.id}
            onClick={() => handleEventClick(event.url)}
            className="flex-shrink-0 w-64 cursor-pointer group"
          >
            <div className="relative overflow-hidden rounded-lg" style={{ aspectRatio: '4/3' }}>
              {event.image_url ? (
                <img
                  src={event.image_url}
                  alt={event.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-[var(--bg-surface)] flex items-center justify-center">
                  <span className="text-[var(--text-tertiary)] text-sm">Sem imagem</span>
                </div>
              )}
              <div className="absolute top-2 left-2 flex gap-2">
                <span className="px-2 py-1 text-xs font-bold rounded-full bg-[var(--accent-primary)] text-white">
                  AO VIVO
                </span>
                {event.category && (
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-black/50 text-white backdrop-blur-sm">
                    {event.category}
                  </span>
                )}
              </div>
            </div>
            <div className="mt-3">
              <p className="text-base font-semibold text-[var(--text-primary)] line-clamp-2">
                {event.title}
              </p>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                {event.venue_name}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
