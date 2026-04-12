# 🧪 Teste Local de Geração de Stories

## Passo 1: Configurar Credenciais

Crie um arquivo `.env.local` na raiz do projeto:

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://ssxowzurrtyzmracmusn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
```

**Onde encontrar a ANON_KEY:**
1. Acesse: https://supabase.com/dashboard/project/ssxowzurrtyzmracmusn/settings/api
2. Copie a chave `anon` / `public`

## Passo 2: Testar com Dados Reais

Execute o script de teste:

```powershell
node scripts/test-with-supabase.js
```

Ou com variáveis de ambiente inline:

```powershell
$env:NEXT_PUBLIC_SUPABASE_URL="https://ssxowzurrtyzmracmusn.supabase.co"
$env:NEXT_PUBLIC_SUPABASE_ANON_KEY="sua-key-aqui"
node scripts/test-with-supabase.js
```

## Passo 3: Verificar Resultados

Os Stories serão gerados em:
```
stories-test-real/
├── story-week-real.png
├── story-free-real.png
├── story-weekend-real.png
└── story-today-real.png
```

## O que o script faz:

1. ✅ Conecta no Supabase
2. ✅ Busca eventos reais por tipo (week, free, weekend, today)
3. ✅ Formata os dados dos eventos
4. ✅ Gera Stories com Playwright
5. ✅ Salva como PNG na pasta `stories-test-real/`

## Exemplo de Saída:

```
🧪 Testando geração de Stories com dados REAIS do Supabase

📅 Buscando eventos para: week
   Filtro: Próximos 7 dias
   ✅ 5 eventos encontrados

   📋 Eventos para "Agenda da Semana":
      1. Ensaio do Olodum
         📍 Pelourinho
         📅 19/01/2026 às 20:00
      ...

   🎨 Gerando Story...
   ✅ Gerado: story-week-real.png (245.32 KB)

📊 RESUMO:
═══════════════════════════════════════════════
Agenda da Semana          → 5 eventos →  245.32 KB
Eventos Gratuitos         → 3 eventos →  198.45 KB
Fim de Semana             → 4 eventos →  223.67 KB
Hoje em Salvador          → 2 eventos →  156.89 KB
═══════════════════════════════════════════════

✅ 4 Stories gerados com sucesso!
📁 Pasta: stories-test-real
```

## Troubleshooting:

### "Invalid API key"
- Verifique se a ANON_KEY está correta
- Confirme que o projeto Supabase está ativo

### "Nenhum evento encontrado"
- Verifique se há eventos futuros no banco
- Ajuste os filtros de data se necessário

### Erro do Playwright
- Execute: `npx playwright install chromium`

## Próximos Passos:

Após validar localmente:
1. Commit e push do código
2. Configurar secrets no GitHub
3. Testar GitHub Action
4. Acessar `/admin/content` para gestão
