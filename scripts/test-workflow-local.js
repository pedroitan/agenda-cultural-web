// Script para testar o workflow localmente
// Uso: node scripts/test-workflow-local.js

require('dotenv').config();
const { generateStory } = require('./generate-story');
const path = require('path');
const fs = require('fs');

// Mock de eventos para teste
const mockEvents = [
  { day: '26', month: 'JAN', title: 'Ensaio do Olodum', venue: 'Pelourinho', time: '19h' },
  { day: '28', month: 'JAN', title: 'Show Ivete Sangalo', venue: 'Arena Fonte Nova', time: '20h' },
  { day: '29', month: 'JAN', title: 'Festival de Jazz', venue: 'Teatro Castro Alves', time: '21h' },
  { day: '30', month: 'JAN', title: 'Carnaval de Rua', venue: 'Barra-Ondina', time: '18h' },
];

const storiesDir = path.join(process.cwd(), 'stories-test');
if (!fs.existsSync(storiesDir)) {
  fs.mkdirSync(storiesDir, { recursive: true });
}

async function testWorkflow() {
  console.log('🧪 Testando workflow de geração de Stories...\n');

  const types = ['week', 'free', 'weekend', 'today'];
  const results = [];

  for (const type of types) {
    try {
      const outputPath = path.join(storiesDir, `story-${type}-test.png`);
      console.log(`🎨 Gerando: ${type}`);
      
      await generateStory(mockEvents, type, outputPath);
      
      const stats = fs.statSync(outputPath);
      results.push({
        type,
        path: outputPath,
        size: `${(stats.size / 1024).toFixed(2)} KB`,
      });

      console.log(`✅ Gerado: ${path.basename(outputPath)} (${results[results.length - 1].size})\n`);
    } catch (error) {
      console.error(`❌ Erro ao gerar ${type}:`, error.message);
    }
  }

  console.log('\n📊 Resumo:');
  console.log('─'.repeat(50));
  results.forEach(r => {
    console.log(`${r.type.padEnd(10)} → ${r.size.padStart(10)} → ${path.basename(r.path)}`);
  });
  console.log('─'.repeat(50));
  console.log(`\n✅ ${results.length}/4 Stories gerados com sucesso!`);
  console.log(`📁 Pasta: ${storiesDir}`);
}

testWorkflow()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('\n❌ Erro:', err);
    process.exit(1);
  });
