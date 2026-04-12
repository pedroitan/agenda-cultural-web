# Versão 2.6.0 - Instagram Stories Automation

**Data:** 18 de Janeiro de 2026  
**Tag:** v2.6.0  
**Repositório:** agenda-cultural-web

## 🎨 Nova Funcionalidade: Geração Automática de Instagram Stories

### ✅ Implementado:

#### **1. Sistema de Geração com Playwright**
- Geração de Stories em formato vertical (1080x1920)
- 4 tipos de Stories com designs únicos:
  - **Agenda da Semana** - Gradiente roxo (#667eea → #764ba2)
  - **Eventos Gratuitos** - Gradiente verde (#4ade80 → #22c55e)
  - **Fim de Semana** - Gradiente rosa (#f093fb → #f5576c)
  - **Hoje em Salvador** - Gradiente laranja (#fbbf24 → #f59e0b)
- Design baseado em referência artística com:
  - Gradientes dinâmicos
  - Glassmorphism nos cards de eventos
  - Tipografia Bebas Neue para títulos
  - Até 5 eventos por Story

#### **2. GitHub Actions Workflow**
- Arquivo: `.github/workflows/generate-stories.yml`
- Execução automática diária às **04:00 BRT** (07:00 UTC)
- Execução manual via GitHub UI com seleção de tipos
- Instalação automática do Playwright
- Upload automático para Supabase Storage
- Artifact storage por 7 dias

#### **3. Scripts de Geração**
- `scripts/generate-story.js` - Função principal com Playwright
- `scripts/generate-stories-workflow.js` - Integração com Supabase
- `scripts/upload-stories.js` - Upload para Supabase Storage
- `scripts/test-with-supabase.js` - Teste local com dados reais
- `scripts/README-STORIES.md` - Documentação completa

#### **4. Dashboard Admin**
- Página: `/admin/content`
- Componente `StoriesManager` com:
  - Seleção de tipos de Stories para gerar
  - Botão de geração sob demanda (requer GitHub Token)
  - Histórico dos últimos 20 Stories gerados
  - Preview de cada Story
  - Botões "Ver" e "Download"
  - Instruções de configuração
  - Informações sobre geração automática

#### **5. API Routes**
- `POST /api/generate-stories-on-demand` - Dispara GitHub Action
- `GET /api/generate-stories-on-demand` - Lista Stories do Supabase Storage
- Suporte para debug e troubleshooting
- Tratamento de erros robusto

### 📋 Configuração Necessária:

#### **Variáveis de Ambiente no Vercel:**
```
NEXT_PUBLIC_SUPABASE_URL=https://ssxowzurrtyzmracmusn.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
GITHUB_TOKEN=seu-github-token (opcional)
```

#### **Variáveis de Ambiente no GitHub Actions:**
```
SUPABASE_URL=https://ssxowzurrtyzmracmusn.supabase.co
SUPABASE_SERVICE_KEY=sua-service-key
```

#### **Supabase Storage:**
- Bucket: `instagram-stories`
- Configuração: Público
- Tamanho máximo: 5MB
- Tipos permitidos: PNG, JPEG

### 🔧 Arquivos Criados/Modificados:

**Novos Arquivos:**
- `.github/workflows/generate-stories.yml`
- `app/admin/content/StoriesManager.tsx`
- `app/api/generate-stories-on-demand/route.ts`
- `scripts/generate-story.js`
- `scripts/generate-stories-workflow.js`
- `scripts/upload-stories.js`
- `scripts/test-with-supabase.js`
- `scripts/README-STORIES.md`
- `CONFIGURAR-GITHUB-TOKEN.md`
- `CONFIGURAR-BUCKET-SUPABASE.md`
- `TESTE-LOCAL.md`

**Arquivos Modificados:**
- `app/admin/content/page.tsx` - Integração do StoriesManager
- `package.json` - Adicionado Playwright
- `package-lock.json` - Dependências atualizadas

### 🐛 Problemas Resolvidos:

1. **Vercel OG Limitations** - Migrado para Playwright para designs complexos
2. **Variáveis de Ambiente** - Leitura dentro das funções para compatibilidade com Vercel
3. **Bucket Permissions** - Configuração de bucket público no Supabase
4. **URL Generation** - URLs públicas corretas para Supabase Storage

### 🚀 Como Usar:

#### **Geração Automática:**
- Stories são gerados automaticamente todo dia às 04:00 BRT
- Não requer intervenção manual

#### **Geração Manual:**
1. Acesse: https://agendaculturalsalvador.com.br/admin/content
2. Selecione os tipos de Stories desejados
3. Clique em "Gerar Stories Selecionados"
4. Aguarde 2-3 minutos
5. Stories aparecem no histórico

#### **Download:**
- Acesse o histórico no `/admin/content`
- Clique em "Download" no Story desejado
- Ou acesse diretamente via URL do Supabase Storage

### 📊 Métricas:

- **Tempo de geração:** ~2-3 minutos (4 Stories)
- **Tamanho médio:** ~200-250 KB por Story
- **Resolução:** 1080x1920 pixels
- **Formato:** PNG
- **Retenção:** Ilimitada no Supabase Storage

### 🔗 URLs Importantes:

- **Site:** https://agendaculturalsalvador.com.br
- **Admin Stories:** https://agendaculturalsalvador.com.br/admin/content
- **GitHub Actions:** https://github.com/pedroitan/agenda-cultural-web/actions
- **Supabase Storage:** https://supabase.com/dashboard/project/ssxowzurrtyzmracmusn/storage/buckets/instagram-stories

### 📝 Próximos Passos Sugeridos:

1. Monitorar geração automática diária
2. Validar qualidade visual dos Stories
3. Considerar adicionar mais tipos de Stories
4. Integrar com API do Instagram para publicação automática
5. Adicionar analytics de visualizações

### 🎯 Status:

✅ **100% Funcional e em Produção**

- GitHub Action rodando diariamente
- Upload automático para Supabase Storage
- Dashboard admin funcionando
- Preview e download operacionais
