// Script para configurar o bucket de Stories no Supabase
// Uso: node scripts/setup-storage-bucket.js

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ssxowzurrtyzmracmusn.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseKey) {
  console.error('❌ Configure SUPABASE_SERVICE_KEY');
  console.error('   Acesse: https://supabase.com/dashboard/project/ssxowzurrtyzmracmusn/settings/api');
  console.error('   Copie a "service_role" key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupBucket() {
  console.log('🔧 Configurando bucket de Stories...\n');

  const bucketName = 'instagram-stories';

  // Verificar se bucket existe
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  
  if (listError) {
    console.error('❌ Erro ao listar buckets:', listError.message);
    process.exit(1);
  }

  const bucketExists = buckets.some(b => b.name === bucketName);

  if (bucketExists) {
    console.log('✅ Bucket já existe');
    
    // Atualizar para público
    const { error: updateError } = await supabase.storage.updateBucket(bucketName, {
      public: true,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ['image/png', 'image/jpeg'],
    });

    if (updateError) {
      console.error('❌ Erro ao atualizar bucket:', updateError.message);
      process.exit(1);
    }

    console.log('✅ Bucket configurado como PÚBLICO');
  } else {
    console.log('📦 Criando bucket...');
    
    const { error: createError } = await supabase.storage.createBucket(bucketName, {
      public: true,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ['image/png', 'image/jpeg'],
    });

    if (createError) {
      console.error('❌ Erro ao criar bucket:', createError.message);
      process.exit(1);
    }

    console.log('✅ Bucket criado como PÚBLICO');
  }

  // Testar upload
  console.log('\n🧪 Testando upload...');
  
  const testContent = Buffer.from('test');
  const testFileName = `test-${Date.now()}.txt`;
  
  const { error: uploadError } = await supabase.storage
    .from(bucketName)
    .upload(testFileName, testContent, {
      contentType: 'text/plain',
    });

  if (uploadError) {
    console.error('❌ Erro ao fazer upload de teste:', uploadError.message);
    process.exit(1);
  }

  console.log('✅ Upload de teste bem-sucedido');

  // Obter URL pública
  const { data: urlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(testFileName);

  console.log('✅ URL pública:', urlData.publicUrl);

  // Deletar arquivo de teste
  await supabase.storage.from(bucketName).remove([testFileName]);
  console.log('✅ Arquivo de teste removido');

  console.log('\n🎉 Configuração concluída com sucesso!');
  console.log('\n📋 Informações do bucket:');
  console.log(`   Nome: ${bucketName}`);
  console.log(`   Público: SIM`);
  console.log(`   Tamanho máximo: 5MB`);
  console.log(`   Tipos permitidos: PNG, JPEG`);
  console.log(`\n🔗 URL base: ${supabaseUrl}/storage/v1/object/public/${bucketName}/`);
}

setupBucket()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('\n❌ Erro:', err);
    process.exit(1);
  });
