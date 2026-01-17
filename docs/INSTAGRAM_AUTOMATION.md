# Automação de Conteúdo Instagram

Sistema automatizado de geração de conteúdo para Instagram da Agenda Cultural Salvador.

## 📋 Visão Geral

O sistema gera automaticamente:
- Cards visuais (1080x1080px)
- Copies otimizadas para Instagram
- 4 tipos de conteúdo diferentes

## 🎯 Tipos de Conteúdo

### 1. Evento em Destaque
- **Query:** Evento com mais cliques nos próximos 7 dias
- **Formato:** Card individual com imagem
- **Frequência:** Diária

### 2. Hoje em Salvador
- **Query:** Até 5 eventos que acontecem hoje
- **Formato:** Lista de eventos
- **Frequência:** Diária

### 3. Fim de Semana
- **Query:** Até 8 eventos do próximo fim de semana
- **Formato:** Lista de eventos
- **Frequência:** Quinta-feira

### 4. Gratuitos Hoje
- **Query:** Até 3 eventos gratuitos hoje
- **Formato:** Lista de eventos
- **Frequência:** Diária

## 🚀 Como Usar

### Visualizar Preview (Local)

1. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

2. Acesse a página de preview:
```
http://localhost:3000/admin/content
```

3. Você verá todos os cards e copies gerados automaticamente

### Gerar Conteúdo Manualmente

```bash
npm run generate-content
```

Isso irá:
- Buscar eventos do banco de dados
- Gerar copies
- Criar URLs dos cards
- Salvar em `content/pending/YYYY-MM-DD.json`

### Automação (GitHub Actions)

O conteúdo é gerado automaticamente todos os dias às 9h (UTC) via GitHub Actions.

**Workflow:** `.github/workflows/daily-content.yml`

**Como funciona:**
1. GitHub Actions roda diariamente
2. Script `generate-daily-content.ts` é executado
3. Conteúdo é salvo em branch `content/YYYY-MM-DD`
4. Você revisa e posta manualmente

## 📁 Estrutura de Arquivos

```
lib/
  instagram-queries.ts    # Queries SQL para buscar eventos
  instagram-copy.ts       # Templates de copy

app/api/generate-card/
  route.tsx              # Endpoint de geração de cards (Vercel OG)

scripts/
  generate-daily-content.ts  # Script de geração diária

content/pending/
  YYYY-MM-DD.json       # Conteúdo gerado (salvo localmente)

.github/workflows/
  daily-content.yml     # GitHub Action para automação
```

## 🎨 Personalização

### Modificar Queries SQL

Edite `lib/instagram-queries.ts`:

```typescript
export async function getHighlightEvent() {
  // Modifique a query aqui
  const { data } = await supabase
    .from("events")
    .select("*")
    .order("click_count", { ascending: false })
    .limit(1);
  
  return data;
}
```

### Modificar Templates de Copy

Edite `lib/instagram-copy.ts`:

```typescript
export function singleEventCopy(event: InstagramEvent): string {
  return `🎭 ${event.title}
  
📍 ${event.venue_name}
📅 ${formatDate(event.start_datetime)}

#SalvadorBA #EventosSalvador`;
}
```

### Modificar Design dos Cards

Edite `app/api/generate-card/route.tsx`:

```tsx
return new ImageResponse(
  (
    <div style={{
      backgroundColor: '#0f172a', // Altere cores
      fontSize: '56px',            // Altere tamanhos
      // ... outros estilos
    }}>
      {/* Seu design aqui */}
    </div>
  ),
  { width: 1080, height: 1080 }
);
```

## 🔧 Configuração

### Variáveis de Ambiente

Adicione no Vercel e GitHub Secrets:

```env
SUPABASE_URL=https://ssxowzurrtyzmracmusn.supabase.co
SUPABASE_SERVICE_KEY=seu_service_key
NEXT_PUBLIC_SITE_URL=https://agendaculturalsalvador.com.br
```

### GitHub Secrets

1. Acesse: `Settings > Secrets and variables > Actions`
2. Adicione:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY`
   - `NEXT_PUBLIC_SITE_URL`

## 📊 Formato do Conteúdo Gerado

```json
{
  "date": "2026-01-17",
  "generated_at": "2026-01-17T12:00:00.000Z",
  "options": [
    {
      "type": "single",
      "title": "Evento em Destaque",
      "copy": "🎭 Show do Velotroz...",
      "imageUrl": "https://agendaculturalsalvador.com.br/api/generate-card?...",
      "events": [{ /* evento */ }]
    },
    {
      "type": "list",
      "title": "Hoje em Salvador",
      "copy": "O que fazer em Salvador HOJE 👇...",
      "imageUrl": "https://agendaculturalsalvador.com.br/api/generate-card?...",
      "events": [{ /* eventos */ }]
    }
  ]
}
```

## 🎯 Workflow Recomendado

### Fase 1: Manual Assistido (Primeiros 30 dias)

1. Script gera conteúdo automaticamente
2. Você acessa `/admin/content` para visualizar
3. Copia o copy e baixa o card
4. Posta manualmente no Instagram
5. Aprende o que funciona melhor

**Vantagens:**
- Evita shadowban
- Você controla o que é postado
- Aprende padrões de engajamento

### Fase 2: Semi-Automático (Após 30 dias)

1. Script gera conteúdo
2. Você aprova com 1 clique
3. Agendamento via Meta Business Suite

**Vantagens:**
- Mais rápido
- Ainda tem controle
- Mantém autenticidade

## 📈 Métricas

Acompanhe no dashboard admin:
- Cliques por evento
- Eventos mais populares
- Fontes com melhor performance

Use essas métricas para:
- Ajustar queries SQL
- Melhorar copies
- Otimizar design dos cards

## 🚨 Troubleshooting

### Cards não aparecem

Verifique:
1. Servidor está rodando (`npm run dev`)
2. Variáveis de ambiente estão configuradas
3. URL base está correta

### Queries retornam vazio

Verifique:
1. Há eventos no banco de dados
2. Eventos estão no futuro
3. Filtros de data estão corretos

### GitHub Action falha

Verifique:
1. Secrets estão configurados
2. Permissões do workflow
3. Logs do GitHub Actions

## 📚 Recursos

- [Vercel OG Image](https://vercel.com/docs/functions/edge-functions/og-image-generation)
- [Next.js Image Response](https://nextjs.org/docs/app/api-reference/functions/image-response)
- [Supabase Queries](https://supabase.com/docs/guides/database/queries)

## 🎨 Exemplos de Cards

Acesse `/admin/content` para ver exemplos ao vivo.

## 🔄 Próximos Passos

1. ✅ Sistema de geração implementado
2. ⏳ Testar com eventos reais
3. ⏳ Ajustar design baseado em feedback
4. ⏳ Implementar agendamento automático (Fase 2)
5. ⏳ Integrar com Meta Graph API (Futuro)
