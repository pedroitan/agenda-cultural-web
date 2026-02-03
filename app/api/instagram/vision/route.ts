import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Configure route segment for larger payloads
export const runtime = 'nodejs'
export const maxDuration = 60 // 60 seconds timeout

// Gemini Vision API
const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_MODEL = 'gemini-1.5-flash' // Using stable model instead of experimental
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`

interface ExtractedEvent {
  title: string
  date: string // DD/MM/YYYY
  time: string // HH:MM
  venue: string
  price: string
  description?: string
}

function getCurrentDateContext(): string {
  const now = new Date()
  const day = String(now.getDate()).padStart(2, '0')
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const year = now.getFullYear()
  return `${day}/${month}/${year}`
}

function buildPrompt(previousDate?: string): string {
  return `
Analise esta imagem de post do Instagram e extraia TODOS os eventos culturais mencionados.

CONTEXTO TEMPORAL E SEQUENCIAL:
- Data de hoje: ${getCurrentDateContext()}
- ${previousDate ? `Data do último evento da imagem anterior: ${previousDate}` : 'Esta é a primeira imagem da sequência'}
- IMPORTANTE: As imagens são processadas em ORDEM CRONOLÓGICA (ordem de captura dos stories)
- Leia SEQUENCIALMENTE: coluna esquerda → coluna direita → próxima imagem
- Se NÃO houver novo cabeçalho de data, continue com a data anterior
- Cabeçalhos de data indicam mudança de dia

ATENÇÃO ESPECIAL AOS CABEÇALHOS DE DATA E LAYOUT:
- A imagem tem CABEÇALHOS DE DATA em DESTAQUE com formato: "SEXTA-FEIRA (30/01)", "SÁBADO (31/01)", "DOMINGO (01/02)"
- CRÍTICO: Antes de processar eventos, ESCANEIE A IMAGEM INTEIRA procurando por TODOS os cabeçalhos de data
- A imagem pode ter LAYOUT DE DUAS COLUNAS lado a lado
- As datas nos cabeçalhos estão no formato DD/MM (sem ano)
- Use o ano atual (2026) e ajuste o mês se necessário baseado na data de hoje

REGRA CRÍTICA - PROCESSO DE LEITURA EM 3 ETAPAS:

ETAPA 1 - ESCANEAR CABEÇALHOS (FAÇA ISSO PRIMEIRO):
- Olhe para o TOPO da imagem, lado ESQUERDO: há um cabeçalho de data?
- Olhe para o TOPO da imagem, lado DIREITO: há um cabeçalho de data?
- Olhe para o MEIO da imagem, lado ESQUERDO: há um cabeçalho de data?
- Olhe para o MEIO da imagem, lado DIREITO: há um cabeçalho de data?
- Liste TODOS os cabeçalhos encontrados antes de processar eventos

ETAPA 2 - VALIDAÇÃO DE HORÁRIOS:
- Se você vê eventos com horários 19:00-21:30, depois 11:00-16:00, isso indica MUDANÇA DE DATA
- Horários que "voltam no tempo" significam novo dia
- Procure o cabeçalho de data acima desses eventos de horário mais cedo

ETAPA 3 - ATRIBUIR DATAS:
- Para cada evento, identifique qual cabeçalho está IMEDIATAMENTE ACIMA dele
- Se não há cabeçalho visível acima, use o último cabeçalho visto na mesma coluna
- NUNCA use a data de um cabeçalho da coluna esquerda para eventos da coluna direita

LAYOUT DE DUAS COLUNAS - REGRAS:
- Coluna esquerda e direita podem ter cabeçalhos DIFERENTES
- Um cabeçalho "SÁBADO (31/01)" na coluna esquerda NÃO se aplica à coluna direita
- Se a coluna direita tem "DOMINGO (01/02)", TODOS os eventos abaixo dele são de DOMINGO
- Se a coluna direita NÃO tem cabeçalho próprio, continua a data da coluna esquerda

DICA ADICIONAL - EVOLUÇÃO CRONOLÓGICA DOS HORÁRIOS:
- Dentro de uma mesma data, os horários geralmente progridem cronologicamente (11:00, 12:00, 13:00, etc.)
- Se você vê horários voltando no tempo (ex: 21:00, depois 11:00), provavelmente mudou de data
- Use a progressão de horários como PISTA ADICIONAL para identificar mudanças de data

Para cada evento, extraia:
- title: Título do evento (máximo 100 caracteres)
- date: Data no formato DD/MM/YYYY (do cabeçalho + ano atual)
- time: Horário no formato HH:MM (ex: "19:00")
- venue: Local do evento
- price: Preço ("Grátis", "Consulte", ou valor específico como "R$ 30")
- description: Descrição adicional (opcional)

Retorne APENAS um JSON válido com array de eventos:
[
  {
    "title": "Nome do Evento",
    "date": "30/01/2026",
    "time": "19:00",
    "venue": "Local",
    "price": "Grátis"
  }
]
`.trim()
}

async function extractEventsFromImage(
  imageBuffer: Buffer,
  mimeType: string,
  previousDate?: string
): Promise<{ events: ExtractedEvent[], error?: string }> {
  if (!GEMINI_API_KEY) {
    const error = 'Gemini API key not configured'
    console.error('❌', error)
    return { events: [], error }
  }

  try {
    const prompt = buildPrompt(previousDate)
    console.log('🤖 Calling Gemini Vision API...')
    
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: mimeType,
                data: imageBuffer.toString('base64')
              }
            }
          ]
        }]
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      const error = `Gemini API error ${response.status}: ${errorText}`
      console.error('❌', error)
      return { events: [], error }
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    
    console.log('📝 Gemini response length:', text.length)

    // Extract JSON from response
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      const error = 'No JSON array found in Gemini response'
      console.error('❌', error)
      console.log('Response text:', text.substring(0, 500))
      return { events: [], error }
    }

    const events = JSON.parse(jsonMatch[0])
    console.log('✅ Extracted', events.length, 'events')
    return { events }
  } catch (error) {
    const errorMsg = `Error extracting events: ${error}`
    console.error('❌', errorMsg)
    return { events: [], error: errorMsg }
  }
}

function parseInstagramDate(dateStr: string, timeStr: string): string | null {
  const match = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  if (!match) return null

  const day = match[1].padStart(2, '0')
  const month = match[2].padStart(2, '0')
  const year = match[3]

  const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})/)
  const hour = timeMatch ? timeMatch[1].padStart(2, '0') : '19'
  const minute = timeMatch ? timeMatch[2] : '00'

  return `${year}-${month}-${day}T${hour}:${minute}:00`
}

function categorizeEvent(title: string, description?: string): string {
  const text = `${title} ${description || ''}`.toLowerCase()

  if (text.match(/show|música|festival|concert|samba|pagode|rock|jazz|mpb/)) {
    return 'Shows e Festas'
  }
  if (text.match(/teatro|peça|espetáculo|drama|comédia/)) {
    return 'Teatro'
  }
  if (text.match(/arte|exposição|galeria|museu|cultura/)) {
    return 'Arte e Cultura'
  }
  if (text.match(/gastronomia|culinária|restaurante|food|comida/)) {
    return 'Gastronomia'
  }
  if (text.match(/curso|workshop|aula|treinamento/)) {
    return 'Cursos'
  }
  if (text.match(/palestra|conferência|seminário|talk/)) {
    return 'Palestras'
  }

  return 'Shows e Festas' // Default
}

export async function POST(request: NextRequest) {
  try {
    // Initialize Supabase client with correct env vars
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase credentials')
      return NextResponse.json({ 
        error: 'Server configuration error',
        details: 'Missing database credentials' 
      }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const formData = await request.formData()
    const images = formData.getAll("images") as File[]
    const channelName = formData.get("channelName") as string
    const channelLogo = formData.get("channelLogo") as File | null

    if (!images || images.length === 0) {
      return NextResponse.json({ error: "Nenhuma imagem fornecida" }, { status: 400 })
    }

    if (!channelName) {
      return NextResponse.json({ error: "Nome do canal é obrigatório" }, { status: 400 })
    }

    // Upload channel logo to Supabase Storage if provided
    let logoUrl = null
    if (channelLogo) {
      const logoBuffer = Buffer.from(await channelLogo.arrayBuffer())
      const logoFileName = `instagram-logos/${channelName.replace('@', '')}-${Date.now()}.${channelLogo.type.split('/')[1]}`
      
      const { data: logoData, error: logoError } = await supabase.storage
        .from('event-images')
        .upload(logoFileName, logoBuffer, {
          contentType: channelLogo.type,
          upsert: true
        })

      if (logoError) {
        console.error('Error uploading logo:', logoError)
      } else {
        const { data: { publicUrl } } = supabase.storage
          .from('event-images')
          .getPublicUrl(logoFileName)
        logoUrl = publicUrl
      }
    }

    const allEvents: any[] = []
    const errors: string[] = []
    let lastEventDate: string | undefined

    // Process images sequentially
    for (let i = 0; i < images.length; i++) {
      const image = images[i]
      console.log(`Processing image ${i + 1}/${images.length}: ${image.name}`)

      const imageBuffer = Buffer.from(await image.arrayBuffer())
      const mimeType = image.type

      // Extract events using Gemini Vision
      const result = await extractEventsFromImage(imageBuffer, mimeType, lastEventDate)

      if (result.error) {
        const errorMsg = `Image ${i + 1}: ${result.error}`
        console.error(errorMsg)
        errors.push(errorMsg)
        continue
      }

      if (result.events.length === 0) {
        console.log(`No events found in image ${i + 1}`)
        continue
      }

      console.log(`Extracted ${result.events.length} events from image ${i + 1}`)

      // Process each extracted event
      for (const ev of result.events) {
        const startDatetime = parseInstagramDate(ev.date, ev.time)
        if (!startDatetime) {
          console.log(`Invalid date format: ${ev.date} ${ev.time}`)
          continue
        }

        const externalId = `instagram-vision-${channelName}-${Buffer.from(ev.title + ev.date).toString('base64').slice(0, 20)}`
        const category = categorizeEvent(ev.title, ev.description)
        const isFree = ev.price.toLowerCase().includes('grátis') || ev.price.toLowerCase().includes('gratuito')

        const eventData = {
          source: channelName, // Use channel name as source
          external_id: externalId,
          title: ev.title,
          start_datetime: startDatetime,
          city: 'Salvador',
          venue_name: ev.venue || undefined,
          price_text: ev.price !== 'Consulte' ? ev.price : undefined,
          category,
          is_free: isFree,
          url: `https://www.instagram.com/${channelName.replace('@', '')}/`,
          image_url: logoUrl || undefined, // Use channel logo as event image
          raw_payload: ev,
        }

        // Insert into database
        const { data, error } = await supabase
          .from('events')
          .upsert(eventData, { onConflict: 'external_id' })
          .select()

        if (error) {
          console.error('Error inserting event:', error)
        } else {
          allEvents.push(data[0])
          lastEventDate = ev.date // Update for next image
        }
      }
    }

    // Collect debug info
    const debugInfo = {
      imagesProcessed: images.length,
      geminiApiConfigured: !!GEMINI_API_KEY,
      totalEventsExtracted: allEvents.length,
      errors: errors.length > 0 ? errors : undefined,
    }

    return NextResponse.json({
      success: true,
      count: allEvents.length,
      events: allEvents,
      debug: debugInfo,
    })
  } catch (error) {
    console.error("Error processing images:", error)
    return NextResponse.json(
      { error: "Erro ao processar imagens" },
      { status: 500 }
    )
  }
}
