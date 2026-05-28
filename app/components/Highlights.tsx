'use client';

import Link from 'next/link';

const HIGHLIGHTS = [
  {
    id: 'shows',
    name: 'Shows',
    href: '/categoria/shows-salvador',
    image: '/highlights-shows.png',
    emoji: '🎵',
  },
  {
    id: 'teatro',
    name: 'Teatro',
    href: '/categoria/teatro-salvador',
    image: '/highlights-teatro.png',
    emoji: '🎭',
  },
  {
    id: 'gratuito',
    name: 'Gratuito',
    href: '/categoria/eventos-gratuitos-salvador',
    image: '/highlights-gratuito.png',
    emoji: '🆓',
  },
  {
    id: 'hoje',
    name: 'Hoje',
    href: '/eventos-salvador-hoje',
    image: '/highlights-hoje.png',
    emoji: '📅',
  },
  {
    id: 'fimdesemana',
    name: 'Fim de Semana',
    href: '/roteiros',
    image: '/highlights-fimdesemana.png',
    emoji: '🌟',
  },
  {
    id: 'saojoao',
    name: 'São João',
    href: '/categoria/forro-salvador',
    image: '/highlights-saojoao.png',
    emoji: '🎉',
  },
  {
    id: 'distrito',
    name: 'Distrito',
    href: '/distrito-comercio',
    image: '/highlights-distrito.png',
    emoji: '🏛️',
  },
  {
    id: 'roteiros',
    name: 'Roteiros',
    href: '/roteiros',
    image: '/highlights-roteiros.png',
    emoji: '🗺️',
  },
];

export default function Highlights() {
  return (
    <div className="w-full bg-white border-b border-zinc-200">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <h2 className="text-lg font-semibold text-zinc-900 mb-4">Destaques</h2>
        
        <div className="flex gap-6 overflow-x-auto pb-2 scrollbar-hide">
          {HIGHLIGHTS.map((highlight) => (
            <Link
              key={highlight.id}
              href={highlight.href}
              className="flex-shrink-0 flex flex-col items-center gap-2 group"
            >
              <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-zinc-200 group-hover:border-violet-500 transition-colors bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                <span className="text-3xl">{highlight.emoji}</span>
              </div>
              <span className="text-xs md:text-sm text-zinc-600 group-hover:text-violet-600 transition-colors font-medium">
                {highlight.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
