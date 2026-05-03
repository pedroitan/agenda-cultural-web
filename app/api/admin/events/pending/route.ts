import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .eq('is_approved', false)
      .eq('source', 'manual_submission')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar eventos pendentes:', error);
      return NextResponse.json(
        { message: 'Erro ao buscar eventos pendentes' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { events: events || [] },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro no servidor:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
