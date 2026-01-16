import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabaseServer'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params
  const supabase = getSupabaseServerClient()

  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
  }

  try {
    // Get event URL
    const { data: event, error: fetchError } = await supabase
      .from('events')
      .select('url')
      .eq('id', eventId)
      .single()

    if (fetchError || !event) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Increment click count using SQL
    await supabase.rpc('increment_click_count', { event_id: eventId })

    // Redirect to event URL
    return NextResponse.redirect(event.url)
  } catch (error) {
    console.error('Redirect error:', error)
    return NextResponse.redirect(new URL('/', request.url))
  }
}
