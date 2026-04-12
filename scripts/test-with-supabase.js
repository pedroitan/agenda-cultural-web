// Script para testar geração de Stories com dados reais do Supabase
// Uso: node scripts/test-with-supabase.js

const { createClient } = require('@supabase/supabase-js');
const { generateStory } = require('./generate-story');
const path = require('path');
const fs = require('fs');

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ssxowzurrtyzmracmusn.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!supabaseKey) {
  console.error('❌ Configure NEXT_PUBLIC_SUPABASE_ANON_KEY ou SUPABASE_SERVICE_KEY');
  console.error('   Exemplo: export NEXT_PUBLIC_SUPABASE_ANON_KEY="sua-key"');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Criar pasta para stories de teste
const storiesDir = path.join(process.cwd(), 'stories-test-real');
if (!fs.existsSync(storiesDir)) {
  fs.mkdirSync(storiesDir, { recursive: true });
}

async function fetchEvents(type) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  console.log(`\n📅 Buscando eventos para: ${type}`);
  
  let query = supabase
    .from('events')
    .select('*')
    .gte('start_datetime', today.toISOString())
    .order('start_datetime', { ascending: true });

  switch (type) {
    case 'free':
      console.log('   Filtro: Eventos gratuitos');
      query = query.or('price_text.ilike.%grátis%,price_text.ilike.%gratuito%,price_text.ilike.%free%,price_text.eq.0');
      break;
    case 'weekend':
      console.log('   Filtro: Fim de semana');
      const friday = new Date(today);
      const dayOfWeek = today.getDay();
      const daysUntilFriday = (5 - dayOfWeek + 7) % 7;
      friday.setDate(today.getDate() + daysUntilFriday);
      const sunday = new Date(friday);
      sunday.setDate(friday.getDate() + 2);
      sunday.setHours(23, 59, 59);
      query = query.gte('start_datetime', friday.toISOString()).lte('start_datetime', sunday.toISOString());
      break;
    case 'today':
      console.log('   Filtro: Hoje');
      query = query.lt('start_datetime', tomorrow.toISOString());
      break;
    case 'week':
    default:
      console.log('   Filtro: Próximos 7 dias');
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      query = query.lt('start_datetime', nextWeek.toISOString());
      break;
  }

  const { data, error } = await query.limit(5);

  if (error) {
    console.error(`   ❌ Erro:`, error.message);
    return [];
  }

  console.log(`   ✅ ${data?.length || 0} eventos encontrados`);
  return data || [];
}

function formatEvent(event) {
  const date = new Date(event.start_datetime);
  const months = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
  
  return {
    day: date.getDate().toString(),
    month: months[date.getMonth()],
    title: event.title.substring(0, 50),
    venue: (event.venue_name || 'Salvador').substring(0, 30),
    time: `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}h`,
  };
}

async function testWithSupabase() {
  console.log('🧪 Testando geração de Stories com dados REAIS do Supabase\n');
  console.log('📊 Supabase URL:', supabaseUrl);
  console.log('─'.repeat(60));

  const types = [
    { key: 'week', label: 'Agenda da Semana' },
    { key: 'free', label: 'Eventos Gratuitos' },
    { key: 'weekend', label: 'Fim de Semana' },
    { key: 'today', label: 'Hoje em Salvador' },
  ];

  const results = [];

  for (const { key, label } of types) {
    try {
      const events = await fetchEvents(key);
      
      if (events.length === 0) {
        console.log(`   ⚠️  Pulando ${label} (sem eventos)\n`);
        continue;
      }

      // Mostrar eventos encontrados
      console.log(`\n   📋 Eventos para "${label}":`);
      events.forEach((event, i) => {
        const date = new Date(event.start_datetime);
        console.log(`      ${i + 1}. ${event.title.substring(0, 40)}...`);
        console.log(`         📍 ${event.venue_name || 'Salvador'}`);
        console.log(`         📅 ${date.toLocaleDateString('pt-BR')} às ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`);
      });

      const formattedEvents = events.map(formatEvent);
      const outputPath = path.join(storiesDir, `story-${key}-real.png`);
      
      console.log(`\n   🎨 Gerando Story...`);
      await generateStory(formattedEvents, key, outputPath);
      
      const stats = fs.statSync(outputPath);
      results.push({
        type: key,
        label,
        path: outputPath,
        size: `${(stats.size / 1024).toFixed(2)} KB`,
        eventCount: events.length,
      });

      console.log(`   ✅ Gerado: ${path.basename(outputPath)} (${results[results.length - 1].size})`);
      console.log('─'.repeat(60));

    } catch (error) {
      console.error(`\n   ❌ Erro ao gerar ${label}:`, error.message);
      console.log('─'.repeat(60));
    }
  }

  console.log('\n📊 RESUMO:');
  console.log('═'.repeat(60));
  
  if (results.length === 0) {
    console.log('⚠️  Nenhum Story foi gerado (sem eventos no Supabase)');
  } else {
    results.forEach(r => {
      console.log(`${r.label.padEnd(25)} → ${r.eventCount} eventos → ${r.size.padStart(10)}`);
    });
    console.log('═'.repeat(60));
    console.log(`\n✅ ${results.length} Stories gerados com sucesso!`);
    console.log(`📁 Pasta: ${storiesDir}`);
    console.log('\n💡 Abra os arquivos PNG para visualizar os Stories gerados!');
  }

  return results;
}

// Executar
testWithSupabase()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('\n❌ Erro:', err);
    process.exit(1);
  });
