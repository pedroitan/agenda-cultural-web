# Roadmap — Agenda Cultural Salvador

## ✅ Concluído

### Click Tracking
- [x] API `/api/track-click/[id]` — incremento atômico via Supabase RPC
- [x] Decoupled tracking: `<a>` direto + POST assíncrono (sem double-counting)
- [x] API `/api/reset-clicks` — zerar contagens
- [x] Botão "Zerar Cliques" no dashboard admin
- [x] Eventos clicáveis no dashboard (sem incrementar contador)

### Dashboard Admin
- [x] Botão "Rodar Scraper" (trigger GitHub Actions)
- [x] Realtime via Supabase WebSocket — contador "ao vivo"
- [x] Fix: total re-fetched via `/api/click-stats` (sem depender de REPLICA IDENTITY FULL)

### SEO — Google & Bing
- [x] `og:image` dinâmica (1200x630) via `opengraph-image.tsx`
- [x] Favicon + Apple icon (`icon.tsx`, `apple-icon.tsx`) — fundo roxo, "AC" amarelo
- [x] `llms.txt` para IAs (ChatGPT, Perplexity, Claude)
- [x] Sitemap dinâmico (sem `/admin`, `lastModified` do último scrape)
- [x] `canonical` URL no `layout.tsx`
- [x] JSON-LD melhorado: `startDate` com timezone `-03:00`, `eventStatus`, `organizer`
- [x] WebSite SearchAction (Sitelinks Search Box no Google)
- [x] FAQPage schema (rich snippets para perguntas sobre eventos em Salvador)
- [x] URL atualiza ao filtrar por categoria (`/?categoria=Teatro`)
- [x] Rodapé com venues, fontes e categorias (texto visível para Google)
- [x] API pública `/api/events` com filtros (limit, category, date, free, q)
- [x] `robots.txt` permite `/api/events` para crawlers de IA

---

## 📋 Pendente — Geração de Tráfego

### 🔴 Alta prioridade

#### Newsletter semanal por e-mail
- Cadastro de e-mail no site (formulário simples)
- Envio automático toda sexta com os melhores eventos do fim de semana
- Stack sugerida: **Resend** (gratuito até 3.000 e-mails/mês) + tabela `subscribers` no Supabase
- Trigger: GitHub Action toda sexta às 10h

#### Botão "Compartilhar no WhatsApp" por evento
- Link `https://wa.me/?text=...` com título + data + URL do evento
- Implementar em `EventList.tsx` em cada card de evento
- Baixo esforço, alto impacto viral

### 🟡 Média prioridade

#### Feed RSS dos eventos
- Rota `/feed.xml` ou `/rss`
- Permite integração com apps de RSS, automações n8n/Zapier
- Clientes de RSS (Feedly, etc.) podem agregar e trazer tráfego

#### Widget embeddable para outros sites
- Script ou iframe que outros sites (blogs, portais de turismo) podem embutir
- Mostra os próximos eventos de Salvador
- Cada embed traz referral traffic

#### Bot WhatsApp/Telegram
- Usuário envia "shows sábado" → bot responde com lista
- Usa a `/api/events` já criada
- Stack: Twilio (WhatsApp) ou python-telegram-bot

### 🟢 Baixa prioridade / Futuro

#### Tráfego pago
- Google Ads: palavras "eventos salvador", "shows salvador", "o que fazer em salvador"
- Meta Ads: segmentação geográfica Salvador + interesse em música/cultura

#### Parcerias
- Pedir link/menção em: Correio Bahia, A Tarde, blogs de entretenimento de Salvador
- Contato com venues: Teatro Gamboa, El Cabong, TCA — pedir que linkem o site
- Guias de turismo: TripAdvisor, Google Maps

#### Páginas de categoria dedicadas
- `/categoria/shows` — ranqueia "shows em Salvador"
- `/categoria/teatro` — ranqueia "teatro salvador"
- `/categoria/gratuitos` — ranqueia "eventos gratuitos Salvador"
- Cada página com title/description próprios e conteúdo estático sobre a categoria

#### Automação de redes sociais
- Post automático no Instagram/Twitter toda sexta com resumo semanal
- Pode usar n8n + `/api/events` + API do Instagram/Twitter

---

## 🔧 Débito técnico

- [ ] Configurar `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` no Vercel (para Realtime funcionar em produção)
- [ ] Habilitar Realtime na tabela `events` no Supabase Studio: `ALTER PUBLICATION supabase_realtime ADD TABLE events;`
- [ ] Considerar `REPLICA IDENTITY FULL` na tabela `events` para melhorar precisão do Realtime
- [ ] Monitorar cliques de bots e filtrar se necessário
- [ ] Testar JSON-LD no [Rich Results Test](https://search.google.com/test/rich-results)
- [ ] Submeter sitemap no Google Search Console e Bing Webmaster Tools
