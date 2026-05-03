# UX Analysis — Agenda Cultural Salvador

> Análise baseada nos 8 wireframes de referência (`wireframes.png`) e no site atual.
> Objetivo: passar de portal de listagem → plataforma de experiência cultural imersiva.

---

## Diagnóstico geral

| Dimensão | Hoje (site atual) | Meta (redesign) |
|---|---|---|
| Identidade visual | Portal genérico de eventos | Guia noturno imersivo |
| Personalização | Nenhuma | Vibe-first, persistente |
| Urgência | Ausente | "Ao vivo agora" como hook |
| Navegação | Linear, por data | Por vibe, bairro, roteiro |
| Diferencial | Agenda completa | Curadoria humana + roteiros |
| Mobile UX | Adaptado, não nativo | Mobile-first, gestures |

---

## Análise por tela

---

### 1. Vibe Selection (onboarding)

**Quando aparece**: Primeiro acesso (salvar em localStorage) ou ao trocar de vibe no perfil.

**O que faz**: Personaliza todo o feed com base no humor atual do usuário.

**6 vibes disponíveis:**
| Vibe | Ícone | O que filtra |
|------|-------|-------------|
| Chill | folha verde | Acústico, jazz, ambient, lounge |
| Energético | raio rosa | Eletrônico, funk, forró, axé animado |
| Cultural | máscara roxa | Teatro, exposições, palestras, afro |
| Curioso | lâmpada âmbar | Experimental, underground, estreias |
| Romântico | coração rosa | Jantar, live suave, view, íntimo |
| Aventureiro | montanha teal | Outdoor, festa de rua, novo bairro |
| Surpreenda-me | estrelas douradas | Algoritmo decide (mix) |

**UX notes:**
- Grid 2x3 + "Surpreenda-me" full-width embaixo
- Tap = seleção imediata + vibração haptic leve
- Transição: slide up para home após 300ms
- Guardar seleção com timestamp (revisar após 6h)

---

### 2. Home Feed

**Estrutura em seções verticais:**

```
[Header: Salvador ▾  🌤 26°  🔔]
[Título: "O que está acontecendo agora?"]
[Search bar]

─── ACONTECENDO AGORA ─────────── [LIVE] ──
[Scroll horizontal: 3 cards grandes 280x180]
  Card 1: Afrobeat Sunset — MAM Park
  Card 2: Corpos Invisíveis — Solar União
  Card 3: Baile da Cidade — Santo Antônio

─── ESSA NOITE ─────────────────── [Ver tudo] ──
[Card destaque largo: Hidden Sounds, 23:00, Armazém 404]
[+32 going, badge ELETRÔNICO]

─── SOB O RADAR ─────────────────── [Ver tudo] ──
[3 cards menores em grid 3 colunas]

─── CURADO ESTA NOITE ──────────────────────
[Card especial: Afro-Bahia Night by Deh Bakare]
[Subtítulo: "Uma jornada pelo ritmo, cultura e resistência"]
[Botão: Ver roteiro →]
```

**UX notes:**
- Header pegajoso (sticky) com transparência + blur ao scrollar
- Seção "Acontecendo agora" só aparece se existir eventos ao vivo (não mostrar vazia)
- Scroll horizontal com snap-to-card
- Pull-to-refresh para atualizar eventos ao vivo
- Badge LIVE pisca suavemente (não de forma irritante)

---

### 3. Explore

**Layout:**
```
[Título: Explore]                    [🔍]
[Now] [Tonight] [Weekend]  ← tabs sticky

─── CATEGORIAS ──────────────── [Ver tudo]
( 🎵 Música ) ( 🎭 Teatro ) ( 🎨 Arte ) ( 🌿 Outdoor )
( 💬 Talks  ) ( ⚡ Experimental )

─── FILTROS ──────────────────────── [Reset]
[Preço ▾] [Distância ▾] [Vibe ▾] [⚙]

126 eventos encontrados

[Lista de cards: imagem pequena + info]
  FRI MAY 24 · 20:00
  Baile da Cidade — Live Band
  📍 Santo Antônio Além do Carmo
  [$$] [Live Music]

  SAT MAY 25 · 18:00
  Vernissage Corpos Invisíveis
  📍 Solar do Unhão
  [Grátis] [Arte]

  SAT MAY 25 · 23:00
  SubSolo Underground Session
  📍 SubSolo Club
  [$$$] [Eletrônico]
```

**UX notes:**
- Tabs Now/Tonight/Weekend mudam o conjunto de resultados com animação suave
- Filtros em bottom sheet (não dropdown) — mais espaço, mais fácil no mobile
- Cards de lista: thumbnail 80x80 à esquerda, info à direita, bookmark icon
- Scroll infinito (não paginação)
- Feedback imediato ao aplicar filtro: contador "X eventos" atualiza em tempo real

---

### 4. Map

**Layout:**
```
[Mapa escuro Mapbox full screen]
[Filtros flutuantes no topo: [Agora] [Tonight] [Weekend] [📍]]

[Clusters coloridos por bairro:]
  • PELOURINHO: 24 (roxo)
  • BARRA: 7 (azul)
  • RIO VERMELHO: 15 (verde)
  • SANTO ANTÔNIO: 6 (âmbar)
  • Cluster menor: 8, 12 (coral)

[Botão de localização: canto inferior direito]

[Bottom sheet ao clicar cluster:]
  ┌─────────────────────────────────┐
  │ [thumbnail] Hidden Sounds    [♡]│
  │             23:00 · Armazém 404 │
  │             [Eletrônico] [$$$]  │
  └─────────────────────────────────┘
  [swipe up para ver todos do cluster]
```

**UX notes:**
- Estilo do mapa: `mapbox://styles/mapbox/dark-v11` + ajuste de opacidade para +escuro
- Clusters: cor muda por categoria dominante na área
- Tocar cluster → zoom + bottom sheet com evento principal
- Tocar evento no bottom sheet → Event Detail
- Long press no mapa → "Ver eventos perto daqui"
- Animação: clusters aparecem com fade-in conforme zoom

---

### 5. Event Detail

**Layout:**
```
[Hero imagem full-bleed, 60vh]
[Overlay gradiente bottom: escuro → transparente]
[Badge flutuante: LIVE MUSIC]
[← voltar]  [♡]  [⬆ compartilhar]

[Conteúdo scrollável:]
  AFROBEAT SUNSET
  [Afrobeat] [Live Band] [Open Air]

  📅 Hoje · 18:30 – 22:30
     Começa em 2h 15min

  📍 MAM Park
     Av. Contorno, s/n, Salvador

  💰 R$30 – R$60
     Taxas não incluídas

  👥 [avatares] +43  48 amigos vão

  ─── SOBRE ───
  Um show a céu aberto vibrante celebrando afrobeat,
  cultura e comunidade com banda ao vivo e DJs.
  [Ler mais]

  ─── LOCAL ───
  [mini mapa estático]

[Barra fixa inferior:]
  [⬆ compartilhar] [🔖 salvar]  [COMPRAR INGRESSOS ⚡]
```

**UX notes:**
- Hero com parallax leve ao scrollar
- "Começa em X horas" — contador dinâmico com cor urgente (<2h = vermelho)
- Seção "Amigos vão" — avatares reais dos amigos (se conectado)
- CTA "Comprar ingressos" — deep link para Sympla/Ingresso.com
- Botão salvar → animação de coração
- Compartilhar → native share sheet do iOS/Android
- Se evento passado: mostrar "Evento encerrado" com sugestões similares

---

### 6. Curated Tour

**Layout:**
```
[← voltar]                [⬆ compartilhar]

AFRO-BAHIA NIGHT
by Deh Bakare
"Uma noite pelo som, arte e sabor no coração de Salvador."

─── LINHA DO TEMPO ──────────────────────
18:00  ● AfroBeat Sunset          [♡]
         Live Music · MAM Park · 1h 30min

       ┊ 10 min a pé

20:00  ● Jantar no Pelô           [♡]
         Dinner Experience · Casa de Tereza · 1h 15min

       ┊ 8 min a pé

22:00  ● Baile da Cidade          [♡]
         Live Band · Santo Antônio · 2h

       ┊ 12 min de táxi

00:30  ● Afterparty: SubSolo      [♡]
         DJ Set · SubSolo Club · 2h+

─── TOTAIS ──────────────────────
4 paradas · ~6h 30min · ~22 min de deslocamento

[           ▶ INICIAR ROTEIRO           ]
```

**UX notes:**
- Linha do tempo: dot colorido por categoria + linha vertical conectando
- Cada parada: tap → Event Detail
- Ícone de deslocamento + tempo de trajeto entre paradas
- Botão "Iniciar roteiro" → Tour in Progress
- Opção de salvar roteiro completo no perfil
- Se algum evento não tiver ingresso disponível: indicar na timeline

---

### 7. Tour in Progress

**Layout:**
```
[← sair do tour]

👤  Próxima parada em 10 min a pé

[Mapa com rota traçada ponto-a-ponto]
  ✅ Ponto 1 (concluído, verde)
  ● Ponto 2 (atual, roxo pulsando)
  ○ Ponto 3
  ○ Ponto 4

[Bottom sheet:]
  PRÓXIMO · 20:00
  [thumbnail] Jantar no Pelô
              Casa de Tereza · 1h 15min
  [👥 avatares +12]

  [         ABRIR NO MAPS          ↗]
```

**UX notes:**
- Mapa com linha tracejada mostrando rota a pé
- Ponto atual pulsa suavemente
- Notificação push 30min antes de cada parada ("Hora de ir para o próximo!")
- Swipe up no bottom sheet → lista completa das paradas restantes
- Se usuário chegar perto do local → marcar como chegou automaticamente (geofence)

---

### 8. Profile

**Layout:**
```
[⚙ configurações]  [🔔 notificações]

[Avatar circular grande]
Itan
@itan.ssa
[Explorer]  ← badge de nível

128        36         12          8
Eventos    Salvos    Roteiros   Seguindo

─── SUA VIBE ─────────────────── [Editar]
[Música] [Arte] [Underground] [Afro Culture] [Eletrônico] [Outdoor]

─── EVENTOS SALVOS ────────────── [Ver tudo]
[scroll horizontal: 3 cards]
  Baile da Cidade   Vernissage Corpos   Hidden S...
  24 mai            25 mai               25 mai

─── SEUS ROTEIROS ─────────────── [Ver tudo]
  [card] Afro-Bahia Night
         by Deh Bakare · 24 mai · 4 paradas
```

**UX notes:**
- Badge de nível gamificado: Explorer > Flaneur > Habitué > Curador
- Editar vibe → vai para Vibe Selection
- Histórico de eventos frequentados (se checkin via geofence)
- Opção de seguir curadores de roteiros

---

## Prioridades de implementação

### Fase 1 — Visual e impacto imediato (sprint 1-2)
1. ✅ Dark mode + paleta de cores definida
2. ✅ Tipografia (Syne + DM Sans)
3. ✅ EventCard component
4. ✅ Home Feed — estrutura de seções
5. ✅ Seção "Acontecendo agora" com LiveBadge

### Fase 2 — Conversão e engajamento (sprint 3-4)
6. ✅ Event Detail com hero full-bleed + CTA fixo
7. ✅ Vibe Selection (onboarding)
8. ✅ Explore com filtros e categorias
9. ✅ BottomNav mobile

### Fase 3 — Diferencial de produto (sprint 5-6)
10. ✅ Mapa com clusters (Mapbox)
11. ✅ Curated Tour (timeline)
12. ✅ Tour in Progress

### Fase 4 — Retenção e comunidade (sprint 7-8)
13. ✅ Profile com vibes salvas
14. ✅ Sistema de bookmarks
15. ✅ Notificações push

---

## Decisões de UX a validar com usuários

1. **Vibe obrigatório no onboarding** vs. opcional (pular e configurar depois)?
2. **Feed cronológico vs. por vibe** — usuários querem controle explícito?
3. **Roteiros curados** — quem são os curadores? Editoriais ou qualquer usuário?
4. **Compra de ingresso** — integração direta (Sympla API) ou deep link?
5. **Geolocalização** — pedir no onboarding ou contextualmente?

---

## Dados necessários para produção

```json
{
  "evento": {
    "id": "uuid",
    "nome": "string",
    "categoria": "musica|teatro|arte|outdoor|talks|experimental",
    "vibe": ["chill", "energetico", "cultural", "curioso", "romantico", "aventureiro"],
    "data_inicio": "ISO 8601",
    "data_fim": "ISO 8601",
    "local": {
      "nome": "string",
      "endereco": "string",
      "bairro": "string",
      "lat": "number",
      "lng": "number"
    },
    "preco_min": "number | null",
    "preco_max": "number | null",
    "imagem_url": "string",
    "link_ingresso": "string | null",
    "ao_vivo": "boolean",
    "curador": "string | null"
  },
  "roteiro": {
    "id": "uuid",
    "titulo": "string",
    "curador_nome": "string",
    "curador_bio": "string",
    "descricao": "string",
    "paradas": [
      {
        "evento_id": "uuid",
        "horario": "HH:mm",
        "duracao_min": "number",
        "deslocamento_proximo_min": "number",
        "modo_deslocamento": "a_pe|onibus|taxi|uber"
      }
    ]
  }
}
```
