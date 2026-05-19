import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Coordenadas de bairros/locais em Salvador (fallback)
const NEIGHBORHOOD_COORDS: Record<string, { lat: number; lng: number }> = {
  "pelourinho": { lat: -12.9732034, lng: -38.5088593 },
  "terreiro de jesus": { lat: -12.974, lng: -38.507 },
  "centro histórico": { lat: -12.973, lng: -38.505 },
  "sé": { lat: -12.971, lng: -38.503 },
  "comércio": { lat: -12.974, lng: -38.502 },
  "baixa dos sapateiros": { lat: -12.972, lng: -38.501 },
  "rio vermelho": { lat: -13.011, lng: -38.49 },
  "barra": { lat: -12.997, lng: -38.485 },
  "pituba": { lat: -12.994, lng: -38.459 },
  "caminho das árvores": { lat: -12.975, lng: -38.462 },
  "barris": { lat: -12.985, lng: -38.513 },
  "federação": { lat: -12.998, lng: -38.448 },
  "graça": { lat: -12.995, lng: -38.462 },
  "vila rica": { lat: -12.992, lng: -38.468 },
};

async function geocodeVenue(venue: string, city: string): Promise<{ lat: number; lng: number } | null> {
  const venueLower = venue.toLowerCase();

  // 1. Tentar geocodificação com Nominatim
  const queries = [
    venue,
    venue.split('-')[0].trim(),
    venue.split(',')[0].trim()
  ];

  for (const query of queries) {
    try {
      const searchQuery = encodeURIComponent(`${query}, ${city}`);
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}&limit=1`, {
        headers: {
          'User-Agent': 'AgendaCulturalSalvador/1.0 (cultural-events-geocoding)'
        }
      });

      if (!response.ok) continue;

      const data = await response.json();
      if (!data || data.length === 0) continue;

      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    } catch (error) {
      console.error('Erro ao geocodificar:', query, error);
    }
  }

  // 2. Fallback: usar coordenadas do bairro se mencionado no venue
  for (const [neighborhood, coords] of Object.entries(NEIGHBORHOOD_COORDS)) {
    if (venueLower.includes(neighborhood)) {
      console.log(`  ✓ Usando coordenadas do bairro: ${neighborhood}`);
      return coords;
    }
  }

  return null;
}

async function main() {
  console.log('Buscando eventos sem coordenadas...');

  const { data: events, error } = await supabase
    .from('events')
    .select('id, title, venue_name, city')
    .eq('is_active', true)
    .is('latitude', null)
    .is('longitude', null)
    .not('venue_name', 'is', null)
    .or('venue_name.ilike.%Pelourinho%,venue_name.ilike.%Terreiro de Jesus%,venue_name.ilike.%Rua Chile%,venue_name.ilike.%Centro Histórico%')
    .limit(50);

  if (error) {
    console.error('Erro ao buscar eventos:', error);
    return;
  }

  console.log(`Encontrados ${events?.length || 0} eventos sem coordenadas`);

  let updated = 0;
  let failed = 0;

  for (const event of events || []) {
    console.log(`Geocodificando: ${event.title} - ${event.venue_name}`);

    const coords = await geocodeVenue(event.venue_name!, event.city || 'Salvador');

    if (coords) {
      await supabase
        .from('events')
        .update({
          latitude: coords.lat,
          longitude: coords.lng
        })
        .eq('id', event.id);

      console.log(`  ✓ Coordenadas: ${coords.lat}, ${coords.lng}`);
      updated++;
    } else {
      console.log(`  ✗ Não encontrado`);
      failed++;
    }

    // Rate limit: 1 requisição por segundo (Nominatim limit)
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`\nResumo:`);
  console.log(`- Atualizados: ${updated}`);
  console.log(`- Falharam: ${failed}`);
}

main();
