import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { data: categories } = await supabase
      .from('events')
      .select('category')
      .not('category', 'is', null)
      .order('category', { ascending: true });

    // Remover duplicatas e null
    const uniqueCategories = [...new Set(categories?.map(c => c.category).filter(Boolean) || [])];

    return NextResponse.json(
      { categories: uniqueCategories },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    return NextResponse.json(
      { message: 'Erro ao buscar categorias' },
      { status: 500 }
    );
  }
}
