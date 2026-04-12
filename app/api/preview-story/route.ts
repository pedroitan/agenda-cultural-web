import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Endpoint temporário para preview de Stories
// Retorna URLs de Stories de exemplo pré-gerados
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'week';

  // Mapear tipos para imagens de exemplo
  // Você pode substituir por URLs reais do Supabase Storage depois
  const storyExamples: Record<string, string> = {
    week: 'https://placehold.co/1080x1920/667eea/white?text=Agenda+da+Semana',
    free: 'https://placehold.co/1080x1920/4ade80/white?text=Eventos+Gratuitos',
    weekend: 'https://placehold.co/1080x1920/f093fb/white?text=Fim+de+Semana',
    today: 'https://placehold.co/1080x1920/fbbf24/white?text=Hoje+em+Salvador',
    highlight: 'https://placehold.co/1080x1920/f59e0b/white?text=Destaque',
  };

  const imageUrl = storyExamples[type] || storyExamples.week;

  // Redirecionar para a imagem
  return NextResponse.redirect(imageUrl);
}
