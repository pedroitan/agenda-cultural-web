const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ SUPABASE_URL e SUPABASE_SERVICE_KEY são obrigatórios');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const storiesDir = path.join(process.cwd(), 'stories');
const BUCKET_NAME = 'instagram-stories';

async function ensureBucketExists() {
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketExists = buckets?.some(b => b.name === BUCKET_NAME);

  if (!bucketExists) {
    console.log('📦 Criando bucket de Stories...');
    const { error } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: true,
      fileSizeLimit: 5242880, // 5MB
    });

    if (error) {
      console.error('❌ Erro ao criar bucket:', error);
      throw error;
    }
    console.log('✅ Bucket criado com sucesso');
  }
}

async function uploadStories() {
  console.log('\n📤 Iniciando upload de Stories...');

  // Garantir que o bucket existe
  await ensureBucketExists();

  // Ler metadata
  const metadataPath = path.join(storiesDir, 'metadata.json');
  if (!fs.existsSync(metadataPath)) {
    console.error('❌ Arquivo metadata.json não encontrado');
    return;
  }

  const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
  const uploadResults = [];

  for (const story of metadata.stories) {
    try {
      const fileName = path.basename(story.path);
      const fileBuffer = fs.readFileSync(story.path);

      console.log(`📤 Uploading: ${fileName}`);

      // Upload para Supabase Storage
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, fileBuffer, {
          contentType: 'image/png',
          upsert: true,
        });

      if (error) {
        console.error(`❌ Erro ao fazer upload de ${fileName}:`, error);
        continue;
      }

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(fileName);

      uploadResults.push({
        type: story.type,
        fileName,
        url: urlData.publicUrl,
        eventCount: story.eventCount,
      });

      console.log(`✅ Upload concluído: ${fileName}`);
      console.log(`   URL: ${urlData.publicUrl}`);
    } catch (error) {
      console.error(`❌ Erro ao processar ${story.path}:`, error);
    }
  }

  // Salvar URLs dos uploads
  const uploadMetadata = {
    timestamp: new Date().toISOString(),
    uploads: uploadResults,
  };

  fs.writeFileSync(
    path.join(storiesDir, 'upload-results.json'),
    JSON.stringify(uploadMetadata, null, 2)
  );

  console.log('\n✅ Upload concluído!');
  console.log(`📊 Total de Stories enviados: ${uploadResults.length}`);
  
  return uploadResults;
}

// Executar
uploadStories()
  .then(results => {
    console.log('\n🎉 Todos os Stories foram enviados para o Supabase Storage!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Erro no upload:', error);
    process.exit(1);
  });
