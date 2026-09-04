'use client';

import Link from 'next/link';

const HIGHLIGHTS = [
  { id: 'shows', name: 'Shows', href: '/categoria/shows-salvador', image: '/brand/destaques/shows.png' },
  { id: 'teatro', name: 'Teatro', href: '/categoria/teatro-salvador', image: '/brand/destaques/teatro.png' },
  { id: 'gratuito', name: 'Gratuito', href: '/categoria/eventos-gratuitos-salvador', image: '/brand/destaques/gratuito.png' },
  { id: 'saojoao', name: 'Forró', href: '/categoria/forro-salvador', image: '/brand/destaques/forro.png' },
  { id: 'distrito', name: 'Distrito', href: '/distrito-comercio', image: '/brand/destaques/distrito.png' },
  { id: 'roteiros', name: 'Roteiros', href: '/roteiros', image: '/brand/destaques/roteiros.png' },
];

export default function Highlights() {
  return (
    <div className="w-full bg-white border-b border-zinc-200">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex gap-6 overflow-x-auto pb-2 scrollbar-hide">
          {HIGHLIGHTS.map((highlight) => (
            <Link
              key={highlight.id}
              href={highlight.href}
              className="flex-shrink-0 flex flex-col items-center gap-2 group"
            >
              <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden ring-2 ring-transparent group-hover:ring-brand-orange transition-all group-hover:scale-105">
                <img
                  src={highlight.image}
                  alt={highlight.name}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <span className="text-xs md:text-sm text-zinc-600 group-hover:text-brand-orange transition-colors font-medium">
                {highlight.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
