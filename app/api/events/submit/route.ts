import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      title,
      start_datetime,
      category,
      venue_name,
      address,
      is_free,
      price,
      ticket_url,
      image_url,
      description,
      producer_name,
      contact_email,
    } = body;

    // Validação básica
    if (!title || !start_datetime || !venue_name || !contact_email) {
      return NextResponse.json(
        { message: 'Campos obrigatórios faltando' },
        { status: 400 }
      );
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contact_email)) {
      return NextResponse.json(
        { message: 'Email inválido' },
        { status: 400 }
      );
    }

    // Validação de duplicatas (título + data + local)
    const { data: existingEvents } = await supabase
      .from('events')
      .select('id')
      .eq('title', title)
      .eq('start_datetime', start_datetime)
      .eq('venue_name', venue_name)
      .limit(1);

    if (existingEvents && existingEvents.length > 0) {
      return NextResponse.json(
        { message: 'Evento já existe na agenda' },
        { status: 409 }
      );
    }

    // Rate limiting (máximo 5 eventos por dia por email)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: recentEvents } = await supabase
      .from('events')
      .select('id')
      .eq('contact_email', contact_email)
      .gte('created_at', oneDayAgo);

    if (recentEvents && recentEvents.length >= 5) {
      return NextResponse.json(
        { message: 'Limite de 5 eventos por dia atingido. Tente novamente amanhã.' },
        { status: 429 }
      );
    }

    // Inserir evento
    const { data: newEvent, error } = await supabase
      .from('events')
      .insert({
        title,
        start_datetime,
        category: category || null,
        venue_name,
        address: address || null,
        is_free: is_free || false,
        price_text: price || null,
        url: ticket_url || '',
        image_url: image_url || null,
        description: description || null,
        source: 'manual_submission',
        contact_email,
        is_approved: false,
        is_flagged: false,
        external_id: `manual-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        city: 'Salvador',
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao inserir evento:', error);
      return NextResponse.json(
        { message: 'Erro ao salvar evento' },
        { status: 500 }
      );
    }

    // TODO: Enviar email de confirmação para o produtor
    // TODO: Enviar notificação para admin

    return NextResponse.json(
      { 
        message: 'Evento enviado com sucesso',
        eventId: newEvent.id 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Erro no servidor:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
