import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { data: venues } = await supabase
      .from('events')
      .select('venue_name')
      .not('venue_name', 'is', null)
      .order('venue_name', { ascending: true });

    // Remover duplicatas e null
    const uniqueVenues = [...new Set(venues?.map(v => v.venue_name).filter(Boolean) || [])];

    return NextResponse.json(
      { venues: uniqueVenues },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao buscar locais:', error);
    return NextResponse.json(
      { message: 'Erro ao buscar locais' },
      { status: 500 }
    );
  }
}
