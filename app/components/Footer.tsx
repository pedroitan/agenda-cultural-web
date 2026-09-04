'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getCityConfig } from '@/config/cities';

const city = getCityConfig();
const siteName = city.siteTitle.split(' -')[0];

export default function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) return null;

  return (
    <footer className="border-t border-zinc-200 bg-white">
      <div className="mx-auto w-full max-w-5xl px-4 py-8 space-y-4 text-sm text-zinc-500">
        <div>
          <p className="font-medium text-zinc-700 mb-1">Sobre a {siteName}</p>
          <p>
            A {siteName} é um agregador de eventos culturais {city.preposition} {city.name}, {city.state}.
            Reunimos shows, peças de teatro, exposições, festivais, eventos gastronômicos e muito mais
            em um só lugar, com informações atualizadas diariamente.
          </p>
        </div>
        <div>
          <p className="font-medium text-zinc-700 mb-1">Principais espaços culturais {city.preposition} {city.name}</p>
          <p>{city.footerVenues}</p>
        </div>
        <div>
          <p className="font-medium text-zinc-700 mb-1">Categorias de eventos</p>
          <div className="flex flex-wrap gap-2">
            {city.categoryLinks.map((link, i) => (
              <span key={link.href} className="flex items-center gap-2">
                {i > 0 && <span>·</span>}
                <Link href={link.href} className="underline hover:text-zinc-700">{link.label}</Link>
              </span>
            ))}
          </div>
        </div>
        <div>
          <p className="font-medium text-zinc-700 mb-1">Páginas populares</p>
          <div className="flex flex-wrap gap-2">
            {city.popularLinks.map((link, i) => (
              <span key={link.href} className="flex items-center gap-2">
                {i > 0 && <span>·</span>}
                <Link href={link.href} className="underline hover:text-zinc-700">{link.label}</Link>
              </span>
            ))}
            <span className="flex items-center gap-2">
              <span>·</span>
              <Link href="/sobre" className="underline hover:text-zinc-700">Sobre / Manifesto</Link>
            </span>
          </div>
        </div>
        <p className="text-xs text-zinc-400 pt-2">
          © {new Date().getFullYear()} {city.footerCopyright} ·{" "}
          <Link href="/sobre" className="underline hover:text-zinc-600">Sobre / Manifesto</Link> ·{" "}
          <a href="/api/events" className="underline hover:text-zinc-600">API pública</a>
        </p>
        <p className="text-xs text-zinc-400">
          Desenvolvido por{" "}
          <a
            href="https://pedroitan.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-zinc-500 hover:text-brand-orange transition-colors"
          >
            Itan Musictech
          </a>
        </p>
      </div>
    </footer>
  );
}
