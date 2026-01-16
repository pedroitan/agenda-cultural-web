import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

interface InstagramEvent {
  projeto?: string
  atracoes?: string
  local?: string
  quanto?: string
  horario?: string
}

const MONTH_MAP: Record<string, number> = {
  janeiro: 0, fevereiro: 1, março: 2, abril: 3,
  maio: 4, junho: 5, julho: 6, agosto: 7,
  setembro: 8, outubro: 9, novembro: 10, dezembro: 11,
}

function extractDateFromTitle(text: string): Date | null {
  const match = text.match(/(\d{1,2})\s+de\s+(\w+)/i)
  if (!match) return null

  const day = parseInt(match[1], 10)
  const monthName = match[2].toLowerCase()
  const month = MONTH_MAP[monthName]
  
  if (month === undefined) return null

  const year = new Date().getFullYear()
  return new Date(year, month, day)
}

function parseEventBlock(block: string): InstagramEvent | null {
  const lines = block.trim().split('\n').filter(l => l.trim())
  if (lines.length === 0) return null

  const event: InstagramEvent = {}

  for (const line of lines) {
    const cleaned = line.trim()
    
    if (/^Projeto:/i.test(cleaned)) {
      event.projeto = cleaned.replace(/^Projeto:\s*/i, '').trim()
    }
    else if (/^Atra[çc][õo](?:es)?:/i.test(cleaned)) {
      event.atracoes = cleaned.replace(/^Atra[çc][õo](?:es)?:\s*/i, '').trim()
    }
    else if (/^Local:/i.test(cleaned)) {
      event.local = cleaned.replace(/^Local:\s*/i, '').trim()
    }
    else if (/^Quanto:/i.test(cleaned)) {
      event.quanto = cleaned.replace(/^Quanto:\s*/i, '').trim()
    }
    else if (/^Hor[áa]rio:/i.test(cleaned)) {
      event.horario = cleaned.replace(/^Hor[áa]rio:\s*/i, '').trim()
    }
  }

  if (!event.atracoes && !event.projeto) return null
  return event
}

function parseTime(timeStr: string): string {
  const match = timeStr.match(/(\d{1,2})h(\d{2})?/)
  if (!match) return '20:00'

  const hour = match[1].padStart(2, '0')
  const minute = match[2] || '00'
  return `${hour}:${minute}`
}

function parsePrice(priceStr: string): { is_free: boolean; price_text: string | null } {
  const lower = priceStr.toLowerCase()
  
  if (lower.includes('gratuito') || lower.includes('grátis') || lower.includes('free')) {
    return { is_free: true, price_text: null }
  }
  
  if (lower.includes('sympla')) {
    return { is_free: false, price_text: 'Ver Sympla' }
  }
  
  return { is_free: false, price_text: priceStr }
}

export async function POST(request: NextRequest) {
  try {
    // Use same env var names as the rest of the project (without NEXT_PUBLIC_ prefix)
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    console.log('Environment check:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseServiceKey,
      urlValue: supabaseUrl?.substring(0, 30) + '...',
    })

    // Validate Supabase credentials
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase credentials')
      return NextResponse.json({ 
        error: 'Server configuration error',
        details: 'Missing database credentials. Please contact administrator.' 
      }, { status: 500 })
    }

    const { postText, postUrl } = await request.json()

    console.log('Received post text length:', postText?.length)

    if (!postText) {
      return NextResponse.json({ error: 'Post text is required' }, { status: 400 })
    }

    let baseDate = extractDateFromTitle(postText)
    console.log('Extracted date:', baseDate)
    
    // If no date found in post, use today's date
    if (!baseDate) {
      baseDate = new Date()
      console.log('No date found in post, using today:', baseDate)
    }

    const blocks = postText.split(/_{5,}|─{5,}/).filter((b: string) => b.trim())
    console.log('Found blocks:', blocks.length)
    
    const events = []

    for (const block of blocks) {
      if (block.includes('♫') || block.includes('#')) {
        const lines = block.split('\n')
        const eventStartIndex = lines.findIndex((l: string) => 
          /^(Projeto:|Atra[çc][õo](?:es)?:|Local:)/i.test(l.trim())
        )
        
        if (eventStartIndex > 0) {
          const eventText = lines.slice(eventStartIndex).join('\n')
          const parsed = parseEventBlock(eventText)
          if (parsed) {
            events.push(buildEvent(parsed, baseDate, postUrl || 'https://instagram.com'))
          }
        }
        continue
      }

      const parsed = parseEventBlock(block)
      if (parsed) {
        events.push(buildEvent(parsed, baseDate, postUrl || 'https://instagram.com'))
      }
    }

    console.log('Parsed events:', events.length)

    if (events.length === 0) {
      return NextResponse.json({ 
        error: 'No events found in post. Make sure the text includes event details like "Projeto:", "Atrações:", "Local:", etc.' 
      }, { status: 400 })
    }

    // Insert events into Supabase
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { error } = await supabase.from('events').upsert(events, {
      onConflict: 'external_id',
      ignoreDuplicates: false,
    })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ 
        error: 'Failed to save events',
        details: error.message,
        code: error.code 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      count: events.length,
      events: events.map(e => ({ title: e.title, start_datetime: e.start_datetime }))
    })

  } catch (error) {
    console.error('Parse error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ 
      error: 'Failed to parse post',
      details: errorMessage 
    }, { status: 500 })
  }
}

function buildEvent(parsed: InstagramEvent, baseDate: Date, postUrl: string) {
  const title = parsed.projeto || parsed.atracoes || 'Evento'
  
  const time = parsed.horario ? parseTime(parsed.horario) : '20:00'
  const [hour, minute] = time.split(':')
  const eventDate = new Date(baseDate)
  eventDate.setHours(parseInt(hour, 10), parseInt(minute, 10), 0, 0)
  const start_datetime = eventDate.toISOString().replace('Z', '').slice(0, 19)

  const { is_free, price_text } = parsed.quanto 
    ? parsePrice(parsed.quanto)
    : { is_free: false, price_text: null }

  const idString = `${title}-${start_datetime}-${parsed.local || ''}`
  const external_id = `instagram-${Buffer.from(idString).toString('base64').slice(0, 32)}`

  return {
    external_id,
    source: 'instagram',
    city: 'Salvador',
    title,
    start_datetime,
    venue_name: parsed.local || undefined,
    image_url: undefined,
    url: postUrl,
    price_text: price_text || undefined,
    is_free,
    category: 'Shows e Festas',
  }
}
