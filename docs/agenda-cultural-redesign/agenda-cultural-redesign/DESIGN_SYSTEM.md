# Design System — Agenda Cultural Salvador

## Princípio visual

**Atmosfera noturna urbana.** Fundo quase-preto com imagens vibrantes em contraste.
A paleta é escura por padrão — não é dark mode opcional, é identidade.

---

## Cores

### Base (fundo e superfície)
```css
--bg-base:        #0A0A0A;   /* fundo principal */
--bg-surface:     #141414;   /* cards, modais */
--bg-elevated:    #1E1E1E;   /* hover, inputs */
--bg-overlay:     rgba(0,0,0,0.6); /* overlay sobre imagens */
```

### Accent (identidade da marca)
```css
--accent-primary:   #7B61FF;   /* roxo vibrante — ações principais */
--accent-secondary: #FF3A8C;   /* rosa quente — destaques ao vivo */
--accent-glow:      rgba(123,97,255,0.2); /* glow sutil em foco */
```

### Texto
```css
--text-primary:     #F5F5F0;   /* títulos, texto principal */
--text-secondary:   #9B9991;   /* metadados, subtítulos */
--text-tertiary:    #5C5A56;   /* placeholders, desabilitados */
--text-on-accent:   #FFFFFF;   /* texto sobre botões coloridos */
```

### Categorias (chips de categoria)
```css
--cat-music:        #FF6B6B;   /* vermelho coral */
--cat-theatre:      #A855F7;   /* roxo médio */
--cat-art:          #F59E0B;   /* âmbar */
--cat-outdoor:      #10B981;   /* verde */
--cat-talks:        #3B82F6;   /* azul */
--cat-experimental: #EC4899;   /* rosa */
```

### Preço (indicador de custo)
```css
--price-free:   #10B981;   /* grátis */
--price-low:    #F59E0B;   /* $$ */
--price-high:   #EF4444;   /* $$$ */
```

### Bordas
```css
--border-subtle:  rgba(255,255,255,0.06);
--border-medium:  rgba(255,255,255,0.12);
--border-strong:  rgba(255,255,255,0.24);
```

---

## Tipografia

### Fontes
```css
/* Display — títulos de telas, nome de eventos */
--font-display: 'Syne', sans-serif;
/* Google Fonts: https://fonts.google.com/specimen/Syne */

/* Body — texto geral, metadados */
--font-body: 'DM Sans', sans-serif;
/* Google Fonts: https://fonts.google.com/specimen/DM+Sans */

/* Mono — horários, preços, números */
--font-mono: 'DM Mono', monospace;
```

### Escala tipográfica
```css
--text-xs:   11px;   /* badges, labels de ícone */
--text-sm:   13px;   /* metadados (hora, local) */
--text-base: 15px;   /* corpo de texto */
--text-lg:   18px;   /* título de card */
--text-xl:   22px;   /* título de seção */
--text-2xl:  28px;   /* título de tela */
--text-3xl:  36px;   /* hero principal */
```

### Pesos
```css
--weight-regular: 400;
--weight-medium:  500;
--weight-bold:    700;
```

---

## Espaçamento

Grid de 4px:
```css
--space-1:  4px;
--space-2:  8px;
--space-3:  12px;
--space-4:  16px;
--space-5:  20px;
--space-6:  24px;
--space-8:  32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
```

Padding de tela (mobile): `0 16px`  
Padding de tela (desktop): `0 24px`

---

## Raios de borda
```css
--radius-sm:   6px;    /* badges, chips pequenos */
--radius-md:   10px;   /* cards compactos */
--radius-lg:   16px;   /* cards principais */
--radius-xl:   24px;   /* modais, bottom sheets */
--radius-full: 9999px; /* pills, avatares */
```

---

## Sombras
```css
--shadow-card:   0 4px 24px rgba(0,0,0,0.4);
--shadow-modal:  0 16px 64px rgba(0,0,0,0.7);
--shadow-glow:   0 0 32px rgba(123,97,255,0.3);
```

---

## Componentes principais

### EventCard (card de evento)
```
┌─────────────────────────────────┐
│  [imagem 16:9 ou 4:3]           │
│  [badge categoria] [badge preço]│
├─────────────────────────────────┤
│  Nome do Evento         [♡]     │
│  23:00 · Armazém 404            │
│  👥 +32 going                   │
└─────────────────────────────────┘
```
- Fundo: `--bg-surface`
- Borda: `1px solid --border-subtle`
- Raio: `--radius-lg`
- Hover: leve escala `transform: scale(1.02)` + `--shadow-card`

### LiveBadge
```css
background: --accent-secondary;
color: white;
font-size: --text-xs;
font-weight: --weight-bold;
padding: 3px 8px;
border-radius: --radius-full;
/* animação de pulse no dot */
```

### BottomNav (mobile)
- 4 ícones: Home, Explore, Map, Profile
- Ativo: cor `--accent-primary` + indicador abaixo
- Fundo: `--bg-surface` com `backdrop-filter: blur(12px)`
- Altura: 64px + safe area do iOS

### VibeChip
```
┌──────────────┐
│  [ícone 24px]│
│    Label     │
└──────────────┘
```
- Grid 2 colunas
- Selecionado: borda `2px solid --accent-primary` + `--accent-glow` como sombra
- Tamanho: `~44% da largura da tela`

### CategoryPill (explore)
```
( [ícone] Música )
```
- Scroll horizontal sem scrollbar visível
- Ativo: `background: --accent-primary`
- Inativo: `background: --bg-elevated`, `border: --border-medium`

---

## Animações

### Princípios
- **Duração**: 150ms (micro) → 300ms (transições) → 500ms (entradas de tela)
- **Easing**: `cubic-bezier(0.16, 1, 0.3, 1)` para entradas (spring feel)
- **Reduzir movimento**: sempre respeitar `prefers-reduced-motion`

### Animações chave
```css
/* Entrada de card (stagger) */
@keyframes slideUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Badge AO VIVO — pulse no dot */
@keyframes livePulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.6; transform: scale(0.85); }
}

/* Entrada de tela */
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
```

---

## Globals CSS (ponto de partida)

```css
/* globals.css */
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;700;800&family=DM+Sans:wght@400;500&family=DM+Mono:wght@400;500&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg-base:          #0A0A0A;
  --bg-surface:       #141414;
  --bg-elevated:      #1E1E1E;
  --accent-primary:   #7B61FF;
  --accent-secondary: #FF3A8C;
  --text-primary:     #F5F5F0;
  --text-secondary:   #9B9991;
  --text-tertiary:    #5C5A56;
  --border-subtle:    rgba(255,255,255,0.06);
  --border-medium:    rgba(255,255,255,0.12);
  --font-display:     'Syne', sans-serif;
  --font-body:        'DM Sans', sans-serif;
  --font-mono:        'DM Mono', monospace;
}

html { background: var(--bg-base); color: var(--text-primary); }
body { font-family: var(--font-body); font-size: 15px; line-height: 1.6; -webkit-font-smoothing: antialiased; }

h1, h2, h3 { font-family: var(--font-display); }
```
