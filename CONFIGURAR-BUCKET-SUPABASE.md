# 🪣 Configurar Bucket Público no Supabase

## Problema

Os Stories estão sendo gerados e enviados para o Supabase Storage, mas retornam erro 404/400 porque o bucket não está público.

## Solução Rápida (2 minutos)

### Passo 1: Acessar Supabase Storage

1. Acesse: https://supabase.com/dashboard/project/ssxowzurrtyzmracmusn/storage/buckets
2. Você verá o bucket `instagram-stories` na lista

### Passo 2: Tornar o Bucket Público

**Opção A - Se o bucket já existe:**

1. Clique no bucket `instagram-stories`
2. Clique no ícone de **configurações** (⚙️) ou nos 3 pontinhos
3. Clique em **"Edit bucket"** ou **"Configuration"**
4. Marque a opção **"Public bucket"** ✅
5. Clique em **"Save"**

**Opção B - Se o bucket não existe:**

1. Clique em **"New bucket"**
2. Preencha:
   - **Name:** `instagram-stories`
   - **Public bucket:** ✅ Marcar como público
   - **File size limit:** `5 MB`
   - **Allowed MIME types:** `image/png, image/jpeg`
3. Clique em **"Create bucket"**

### Passo 3: Verificar

1. Clique no bucket `instagram-stories`
2. Você deve ver os 3 arquivos PNG que foram enviados:
   - `story-week-1768787928558.png`
   - `story-weekend-1768787930461.png`
   - `story-today-1768787931827.png`

3. Clique em um arquivo
4. Copie a **URL pública**
5. Cole no navegador - deve abrir a imagem!

### Passo 4: Testar no Site

1. Acesse: https://agendaculturalsalvador.com.br/admin/content
2. Clique em **"Atualizar"** no StoriesManager
3. Os 3 Stories devem aparecer com preview funcionando! 🎉

## URLs Esperadas

Após tornar público, as URLs devem funcionar:

```
https://ssxowzurrtyzmracmusn.supabase.co/storage/v1/object/public/instagram-stories/story-week-1768787928558.png
https://ssxowzurrtyzmracmusn.supabase.co/storage/v1/object/public/instagram-stories/story-weekend-1768787930461.png
https://ssxowzurrtyzmracmusn.supabase.co/storage/v1/object/public/instagram-stories/story-today-1768787931827.png
```

## Troubleshooting

### Ainda dá erro 404
- Confirme que marcou "Public bucket"
- Aguarde 1-2 minutos para propagar
- Limpe o cache do navegador (Ctrl+Shift+R)

### Não vejo os arquivos no bucket
- Verifique se o GitHub Action rodou com sucesso
- Vá em: https://github.com/pedroitan/agenda-cultural-web/actions
- Veja o último workflow "Generate Instagram Stories"

### Bucket não aparece na lista
- O GitHub Action cria automaticamente
- Ou crie manualmente seguindo "Opção B" acima

## ✅ Pronto!

Depois de configurar, o sistema funcionará 100%:
- ✅ GitHub Action gera Stories diariamente às 04:00 BRT
- ✅ Upload automático para Supabase Storage
- ✅ Histórico visível em `/admin/content`
- ✅ Preview e download funcionando
