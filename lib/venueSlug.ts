// Normaliza texto removendo acentos e caracteres especiais
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9\s]/g, ' ') // Remove caracteres especiais (-, ,, etc.)
    .replace(/\s+/g, ' ') // Normaliza espaços múltiplos
    .trim();
}

// Gera slug a partir do nome do local (remove acentos antes de criar o slug)
export function venueToSlug(venue: string): string {
  return normalizeText(venue).replace(/\s+/g, '-');
}

// Converte slug de volta para texto normalizado (para comparação)
export function slugToNormalized(slug: string): string {
  return normalizeText(slug.replace(/-/g, ' '));
}
