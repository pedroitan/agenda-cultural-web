# 📸 Geração Automática de Instagram Stories

## Visão Geral

Sistema automatizado para gerar Stories do Instagram com eventos da Agenda Cultural Salvador usando Playwright + GitHub Actions.

## 🎨 Tipos de Stories

| Tipo | Título | Gradiente | Descrição |
|------|--------|-----------|-----------|
| `week` | Agenda da Semana | Roxo (#667eea → #764ba2) | Eventos dos próximos 7 dias |
| `free` | Eventos Gratuitos | Verde (#4ade80 → #22c55e) | Apenas eventos gratuitos |
| `weekend` | Fim de Semana | Rosa (#f093fb → #f5576c) | Eventos de sexta a domingo |
| `today` | Hoje em Salvador | Laranja (#fbbf24 → #f59e0b) | Eventos do dia atual |

## 🚀 Como Funciona

### Automático (GitHub Actions)
- Roda diariamente às **04:00 BRT** (1h após o scraper)
- Busca eventos do Supabase
- Gera 4 variações de Stories
- Upload para Supabase Storage
- Mantém histórico por 7 dias

### Manual (Workflow Dispatch)
```bash
# Via GitHub UI
Actions → Generate Instagram Stories → Run workflow
```

## 📁 Estrutura de Arquivos

```
scripts/
├── generate-story.js              # Função principal de geração
├── generate-stories-workflow.js   # Script do GitHub Actions
├── upload-stories.js              # Upload para Supabase Storage
└── README-STORIES.md             # Esta documentação

.github/workflows/
└── generate-stories.yml          # Configuração do GitHub Actions

stories/                          # Gerado durante execução
├── story-week-{timestamp}.png
├── story-free-{timestamp}.png
├── story-weekend-{timestamp}.png
├── story-today-{timestamp}.png
├── metadata.json
└── upload-results.json
```

## 🔧 Configuração

### Secrets Necessários (GitHub)
```
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_KEY=sua-service-key
```

### Instalação Local
```bash
npm install
npx playwright install chromium
```

## 💻 Uso Local

### Gerar todas as variações
```bash
node scripts/generate-story.js
```

### Gerar tipo específico
```javascript
const { generateStory } = require('./scripts/generate-story');

const events = [
  { day: '26', month: 'Jan', title: 'Show', venue: 'Local', time: '20h' }
];

await generateStory(events, 'free', 'output.png');
```

### Workflow completo (com Supabase)
```bash
export SUPABASE_URL="https://..."
export SUPABASE_SERVICE_KEY="..."
export STORY_TYPES="week,free"

node scripts/generate-stories-workflow.js
node scripts/upload-stories.js
```

## 📊 Queries do Supabase

### Eventos Gratuitos
```sql
SELECT * FROM events 
WHERE start_datetime >= CURRENT_DATE
  AND (price_text ILIKE '%grátis%' 
    OR price_text ILIKE '%gratuito%' 
    OR price_text = '0')
ORDER BY start_datetime
LIMIT 5;
```

### Eventos do Fim de Semana
```sql
SELECT * FROM events 
WHERE start_datetime >= (próxima sexta)
  AND start_datetime <= (próximo domingo)
ORDER BY start_datetime
LIMIT 5;
```

## 🎯 Próximos Passos

- [ ] Adicionar mais variações de design
- [ ] Integrar com Instagram Graph API para posting automático
- [ ] Adicionar analytics de visualizações
- [ ] Criar endpoint no admin para preview
- [ ] Notificações no Discord/Slack quando Stories são gerados

## 🐛 Troubleshooting

### Stories não são gerados
- Verificar se há eventos no Supabase
- Checar logs do GitHub Actions
- Validar secrets configurados

### Erro de upload
- Verificar permissões do bucket no Supabase
- Confirmar que `SUPABASE_SERVICE_KEY` tem permissões de storage

### Fontes não carregam
- Playwright baixa fontes do Google Fonts automaticamente
- Verificar conexão de rede no GitHub Actions

## 📝 Logs

Os logs são salvos em:
- GitHub Actions: `Actions → Generate Instagram Stories → [run]`
- Artifacts: Stories gerados ficam disponíveis por 7 dias

## 🔗 Links Úteis

- [Playwright Docs](https://playwright.dev/)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
- [GitHub Actions](https://docs.github.com/actions)
