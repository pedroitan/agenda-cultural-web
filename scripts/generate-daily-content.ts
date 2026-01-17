import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import {
  getHighlightEvent,
  getEventsToday,
  getWeekendEvents,
  getFreeEventsToday,
  InstagramEvent,
} from '../lib/instagram-queries';
import {
  singleEventCopy,
  todayListCopy,
  weekendListCopy,
  freeEventsListCopy,
} from '../lib/instagram-copy';

type ContentOption = {
  type: 'single' | 'list';
  title: string;
  copy: string;
  imageUrl: string;
  events?: InstagramEvent[];
};

function buildCardUrl(event: InstagramEvent): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  
  const date = new Date(event.start_datetime);
  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  const dateStr = `${date.getDate()} de ${months[date.getMonth()]}`;
  const timeStr = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  
  const params = new URLSearchParams({
    title: event.title,
    venue: event.venue_name || 'Salvador',
    date: dateStr,
    time: timeStr,
    price: event.price_text || 'Consulte',
    type: 'single',
  });
  
  if (event.image_url) {
    params.set('image', event.image_url);
  }
  
  return `${baseUrl}/api/generate-card?${params.toString()}`;
}

function buildListCardUrl(title: string, description: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  
  const params = new URLSearchParams({
    title,
    venue: description,
    type: 'list',
  });
  
  return `${baseUrl}/api/generate-card?${params.toString()}`;
}

async function generateDailyContent() {
  console.log('🎨 Generating daily content...\n');
  
  const options: ContentOption[] = [];
  
  // Option 1: Highlight Event
  console.log('📌 Fetching highlight event...');
  const highlightEvent = await getHighlightEvent();
  if (highlightEvent) {
    options.push({
      type: 'single',
      title: 'Evento em Destaque',
      copy: singleEventCopy(highlightEvent),
      imageUrl: buildCardUrl(highlightEvent),
      events: [highlightEvent],
    });
    console.log(`✅ Highlight: ${highlightEvent.title}\n`);
  } else {
    console.log('⚠️  No highlight event found\n');
  }
  
  // Option 2: Today's Events
  console.log('📅 Fetching today\'s events...');
  const todayEvents = await getEventsToday();
  if (todayEvents.length > 0) {
    options.push({
      type: 'list',
      title: 'Hoje em Salvador',
      copy: todayListCopy(todayEvents),
      imageUrl: buildListCardUrl('O que fazer HOJE em Salvador', `${todayEvents.length} eventos`),
      events: todayEvents,
    });
    console.log(`✅ Today: ${todayEvents.length} events\n`);
  } else {
    console.log('⚠️  No events today\n');
  }
  
  // Option 3: Weekend Events (only run on Thursday)
  const dayOfWeek = new Date().getDay();
  if (dayOfWeek === 4) { // Thursday
    console.log('🎉 Fetching weekend events...');
    const weekendEvents = await getWeekendEvents();
    if (weekendEvents.length > 0) {
      options.push({
        type: 'list',
        title: 'Fim de Semana',
        copy: weekendListCopy(weekendEvents),
        imageUrl: buildListCardUrl('Fim de Semana em Salvador', `${weekendEvents.length} eventos`),
        events: weekendEvents,
      });
      console.log(`✅ Weekend: ${weekendEvents.length} events\n`);
    } else {
      console.log('⚠️  No weekend events found\n');
    }
  }
  
  // Option 4: Free Events Today
  console.log('💚 Fetching free events...');
  const freeEvents = await getFreeEventsToday();
  if (freeEvents.length > 0) {
    options.push({
      type: 'list',
      title: 'Gratuitos Hoje',
      copy: freeEventsListCopy(freeEvents),
      imageUrl: buildListCardUrl('Rolês GRATUITOS em Salvador', `${freeEvents.length} eventos`),
      events: freeEvents,
    });
    console.log(`✅ Free: ${freeEvents.length} events\n`);
  } else {
    console.log('⚠️  No free events today\n');
  }
  
  if (options.length === 0) {
    console.log('❌ No content options generated');
    return;
  }
  
  // Save content to file
  const date = new Date().toISOString().split('T')[0];
  const content = {
    date,
    generated_at: new Date().toISOString(),
    options,
  };
  
  const contentDir = join(process.cwd(), 'content', 'pending');
  await mkdir(contentDir, { recursive: true });
  
  const filePath = join(contentDir, `${date}.json`);
  await writeFile(filePath, JSON.stringify(content, null, 2));
  
  console.log(`\n✅ Content generated: ${filePath}`);
  console.log(`📊 Total options: ${options.length}`);
  
  // Print summary
  console.log('\n📋 Summary:');
  options.forEach((opt, i) => {
    console.log(`\n${i + 1}. ${opt.title} (${opt.type})`);
    console.log(`   Events: ${opt.events?.length || 0}`);
    console.log(`   Image: ${opt.imageUrl}`);
    console.log(`   Copy preview: ${opt.copy.substring(0, 100)}...`);
  });
}

// Run if called directly
if (require.main === module) {
  generateDailyContent()
    .then(() => {
      console.log('\n✅ Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Error:', error);
      process.exit(1);
    });
}

export { generateDailyContent };
