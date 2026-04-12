# 🔑 Como Criar GitHub Token para Stories

## Passo 1: Acessar GitHub Settings

1. Acesse: https://github.com/settings/tokens
2. Ou vá em: **GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)**

## Passo 2: Criar Novo Token

1. Clique em **"Generate new token"** → **"Generate new token (classic)"**
2. Preencha:
   - **Note:** `Agenda Cultural - Stories Generation`
   - **Expiration:** `No expiration` (ou escolha um período)

## Passo 3: Selecionar Permissões

Marque **APENAS** estas permissões:

- ✅ **`workflow`** - Permite disparar GitHub Actions
  - Esta é a ÚNICA permissão necessária!

## Passo 4: Gerar e Copiar

1. Clique em **"Generate token"** no final da página
2. **COPIE O TOKEN IMEDIATAMENTE** (você não verá ele novamente!)
3. O token terá formato: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

## Passo 5: Adicionar no Vercel

1. Acesse: https://vercel.com/pedroitans-projects/agenda-cultural-web/settings/environment-variables
2. Clique em **"Add New"**
3. Preencha:
   - **Key:** `GITHUB_TOKEN`
   - **Value:** Cole o token que você copiou
   - **Environments:** Marque `Production`, `Preview`, `Development`
4. Clique em **"Save"**

## Passo 6: Adicionar SUPABASE_SERVICE_KEY

Enquanto está no Vercel, adicione também:

1. Acesse Supabase: https://supabase.com/dashboard/project/ssxowzurrtyzmracmusn/settings/api
2. Copie a **"service_role key"** (não a anon key!)
3. No Vercel, adicione:
   - **Key:** `SUPABASE_SERVICE_KEY`
   - **Value:** Cole a service key
   - **Environments:** Marque `Production`, `Preview`, `Development`

## Passo 7: Redeploy (Importante!)

Após adicionar as variáveis:

1. Vá em: https://vercel.com/pedroitans-projects/agenda-cultural-web
2. Clique em **"Deployments"**
3. No último deployment, clique nos 3 pontinhos → **"Redeploy"**
4. Confirme o redeploy

## ✅ Pronto!

Agora você pode:
- Usar o botão "Gerar Stories" no `/admin/content`
- Os Stories serão gerados automaticamente todo dia às 04:00 BRT

## 🔒 Segurança

- ⚠️ **NUNCA** compartilhe seu GitHub Token
- ⚠️ **NUNCA** commite o token no código
- ✅ Tokens ficam seguros nas variáveis de ambiente do Vercel
- ✅ Se vazar, revogue imediatamente em: https://github.com/settings/tokens

## 🐛 Troubleshooting

### "Invalid token" ou "401 Unauthorized"
- Verifique se marcou a permissão `workflow`
- Confirme que copiou o token completo
- Tente gerar um novo token

### "Erro ao disparar workflow"
- Confirme que o token está no Vercel
- Verifique se fez o redeploy após adicionar
- Aguarde 1-2 minutos após o redeploy

### Stories não aparecem no histórico
- Aguarde 2-3 minutos após gerar
- Verifique se o bucket `instagram-stories` existe no Supabase Storage
- Clique em "Atualizar" no StoriesManager
