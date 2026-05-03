import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    // Criar cliente Supabase dentro da função
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { message: 'Missing Supabase configuration' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
