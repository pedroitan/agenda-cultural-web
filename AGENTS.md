# Agent Guidelines: agenda-cultural-web

## Stack

- Next.js 16 (App Router, Turbopack) + React 19 + TypeScript
- Tailwind CSS 4 (tokens via `@theme` em `app/globals.css`)
- Supabase (`lib/supabaseServer.ts` server / `lib/supabaseClient.ts` browser)
- Fonte: Inter (`next/font/google`) — manter
- Dados sao alimentados pelo repo irmao `../agenda-cultural-scraper` (mesmo banco Supabase)

## Comandos

- `npm run dev` — dev server
- `npx tsc --noEmit -p tsconfig.json` — typecheck
- `npx eslint <arquivos>` — lint (ha warnings pre-existentes de `<img>` e `prefer-const`)
- `npx next build` — build de producao

## Identidade visual (set/2026)

- Fonte dos assets: `public/ID Visual/` (manter; nomes com espaco/acento — NAO referenciar direto no codigo)
- Assets usados pelo site ficam em `public/brand/` com nomes limpos:
  - `header-{home,roteiros,distrito}[-mobile].webp` — heros (desktop 2560x600 / mobile 750x400), usados com `<picture>`
  - `destaques/*.png` — icones dos Destaques da home (240px)
  - `favicon.svg`, `pwa-icon-512.png`
- `app/icon.png`, `app/apple-icon.png`, `app/favicon.ico`, `app/opengraph-image.jpg` — estaticos da marca (nao recriar versoes dinamicas com `ImageResponse`)
- `app/manifest.ts` — PWA manifest (theme `#181818`)
- Tokens Tailwind: `brand-orange #f1612d`, `brand-magenta #e4007f`, `brand-lime #c5f312`, `brand-offwhite #eeeeee`, `brand-graphite #181818`, `bg-brand-gradient` (magenta -> laranja)
- Botoes secundarios (Restaurantes/Roteiros/Adicionar Evento), filtros e marcadores do mapa continuam em violeta/laranja Tailwind por decisao de design (mockups em `public/ID Visual/Mockups`)
- Nao adicionar barra de navegacao global (decisao do usuario)
- `headerImage`/`headerImageMobile` por cidade em `config/cities/*.ts`; RJ/SP ainda usam `/banner.png` (identidade antiga)

## Pendente (proxima rodada)

- Limpeza da raiz (PNGs de stories, `test-gemini-vision.js`, `debug-clicks.sql`, `env-example.txt`, README boilerplate)
- Stories/cards do Instagram (`templates/`, `api/generate-story`) ainda na paleta antiga
- Inconsistencia `ads`: API usa `clicks`/`impressions`, schema define `click_count`/`impression_count`
