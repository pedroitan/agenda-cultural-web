# Agenda Cultural Salvador — Redesign

> Plataforma de experiência cultural para Salvador, BA.  
> Visão: guia noturno imersivo com curadoria humana, personalização por vibe e roteiros conectados.

---

## Estrutura do projeto

```
agenda-cultural-redesign/
├── README.md              ← este arquivo (spec completa + guia de dev)
├── wireframes.png         ← referência visual dos 8 screens
├── DESIGN_SYSTEM.md       ← tokens de cor, tipografia, espaçamento
├── UX_ANALYSIS.md         ← análise detalhada + prioridades
└── src/
    ├── pages/
    │   ├── Home.jsx           (Home Feed)
    │   ├── Explore.jsx        (Explore + filtros)
    │   ├── Map.jsx            (Mapa interativo)
    │   ├── EventDetail.jsx    (Página de evento)
    │   ├── CuratedTour.jsx    (Roteiro curado)
    │   ├── TourInProgress.jsx (Tour em andamento)
    │   ├── Profile.jsx        (Perfil do usuário)
    │   └── VibeSelection.jsx  (Onboarding de vibe)
    ├── components/
    │   ├── EventCard.jsx
    │   ├── LiveBadge.jsx
    │   ├── VibeChip.jsx
    │   ├── CategoryPill.jsx
    │   ├── BottomNav.jsx
    │   ├── MapCluster.jsx
    │   └── TourTimeline.jsx
    ├── styles/
    │   └── globals.css        (CSS variables + reset)
    └── data/
        └── mock.json          (dados mockados para dev)
```

---

## Stack recomendada

- **Framework**: Next.js 14 (App Router) ou React + Vite
- **Estilização**: Tailwind CSS v3 (com tema customizado) ou CSS Modules
- **Mapa**: Mapbox GL JS (dark style `mapbox://styles/mapbox/dark-v11`)
- **Animações**: Framer Motion
- **Ícones**: Lucide React
- **Deploy**: Vercel

---

## Visão do produto

O site atual funciona como um **portal de listagem**. O objetivo do redesign é transformá-lo numa **plataforma de experiência cultural** com três diferenciais:

1. **Personalização por vibe** — o usuário diz como quer a noite (Chill, Energético, Cultural, Romântico) e o feed se adapta
2. **Urgência real** — "Acontecendo agora" com badge ao vivo no topo da home
3. **Roteiros curados** — múltiplos eventos conectados com horário, trajeto a pé e curador humano

---

## Referência visual (wireframes)

O arquivo `wireframes.png` contém 8 telas de referência:

| Tela | Descrição |
|------|-----------|
| Home Feed | Feed principal com "Happening Now", "Tonight", curadoria |
| Explore | Categorias em pills + lista filtrada de eventos |
| Map | Mapa escuro com clusters coloridos por bairro |
| Event Detail | Hero 60vh, tags, CTA fixo, mapa inline |
| Curated Tour | Timeline vertical de roteiro noturno |
| Tour in Progress | Mapa + próxima parada + progresso |
| Profile | Stats do usuário, vibes salvas, histórico |
| Vibe Selection | Onboarding com 6 opções de humor |
