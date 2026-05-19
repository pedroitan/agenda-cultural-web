import { createClient } from '@supabase/supabase-js';

async function main() {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const keywords = ['Pelourinho', 'Terreiro de Jesus', 'Rua Chile', 'Centro Histórico', 'Sé', 'Comércio', 'Baixa dos Sapateiros', 'Largo do Pelourinho', 'Praça da Sé'];

  const { data } = await supabase
    .from('events')
    .select('title,venue_name')
    .eq('is_active', true)
    .gt('start_datetime', new Date().toISOString())
    .order('start_datetime', { ascending: true })
    .limit(50);

  const filtered = (data || []).filter(e =>
    keywords.some(k => (e.venue_name || '').toLowerCase().includes(k.toLowerCase()))
  );

  console.log('Eventos filtrados como Distrito do Comércio:', filtered.length);
  filtered.forEach(e => console.log('-', e.title, '|', e.venue_name));
}

main();
