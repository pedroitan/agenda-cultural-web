const { createClient } = require('@supabase/supabase-js');
const { generateStory } = require('./generate-story');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const storyTypes = (process.env.STORY_TYPES || 'week,free,weekend,today').split(',');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ SUPABASE_URL e SUPABASE_SERVICE_KEY são obrigatórios');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Criar pasta para stories
const storiesDir = path.join(process.cwd(), 'stories');
if (!fs.existsSync(storiesDir)) {
  fs.mkdirSync(storiesDir, { recursive: true });
}

async function fetchEvents(type) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  let query = supabase
    .from('events')
    .select('*')
    .gte('start_datetime', today.toISOString())
    .order('start_datetime', { ascending: true });

  switch (type) {
    case 'free':
      query = query.or('price_text.ilike.%grátis%,price_text.ilike.%gratuito%,price_text.eq.0');
      break;
    case 'weekend':
      const friday = new Date(today);
      friday.setDate(today.getDate() + (5 - today.getDay() + 7) % 7);
      const sunday = new Date(friday);
      sunday.setDate(friday.getDate() + 2);
      query = query.gte('start_datetime', friday.toISOString()).lte('start_datetime', sunday.toISOString());
      break;
    case 'today':
      query = query.lt('start_datetime', tomorrow.toISOString());
      break;
    case 'week':
    default:
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      query = query.lt('start_datetime', nextWeek.toISOString());
      break;
  }

  const { data, error } = await query.limit(5);

  if (error) {
    console.error(`❌ Erro ao buscar eventos (${type}):`, error);
    return [];
  }

  return data || [];
}

function formatEvent(event) {
  const date = new Date(event.start_datetime);
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  
  return {
    day: date.getDate().toString(),
    month: months[date.getMonth()].toUpperCase(),
    title: event.title.substring(0, 50),
    venue: (event.venue_name || 'Salvador').substring(0, 30),
    time: `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}h`,
  };
}

async function generateAllStories() {
  console.log('🎨 Iniciando geração de Stories...');
  console.log(`📋 Tipos: ${storyTypes.join(', ')}`);

  const results = [];

  for (const type of storyTypes) {
    try {
      console.log(`\n📅 Buscando eventos para: ${type}`);
      const events = await fetchEvents(type);
      
      if (events.length === 0) {
        console.log(`⚠️  Nenhum evento encontrado para ${type}`);
        continue;
      }

      console.log(`✅ ${events.length} eventos encontrados`);
      
      const formattedEvents = events.map(formatEvent);
      const outputPath = path.join(storiesDir, `story-${type}-${Date.now()}.png`);
      
      console.log(`🎨 Gerando Story: ${type}`);
      await generateStory(formattedEvents, type, outputPath);
      
      results.push({
        type,
        path: outputPath,
        eventCount: events.length,
      });

      console.log(`✅ Story gerado: ${path.basename(outputPath)}`);
    } catch (error) {
      console.error(`❌ Erro ao gerar story ${type}:`, error);
    }
  }

  console.log('\n🎉 Geração concluída!');
  console.log(`📊 Total de Stories gerados: ${results.length}`);
  
  // Salvar metadata
  const metadata = {
    timestamp: new Date().toISOString(),
    stories: results,
  };
  
  fs.writeFileSync(
    path.join(storiesDir, 'metadata.json'),
    JSON.stringify(metadata, null, 2)
  );

  return results;
}

// Executar
generateAllStories()
  .then(results => {
    console.log('\n✅ Workflow concluído com sucesso!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Erro no workflow:', error);
    process.exit(1);
  });
