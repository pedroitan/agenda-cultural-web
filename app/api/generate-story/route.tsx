import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storyType = searchParams.get('type') || 'today';
    const eventsParam = searchParams.get('events') || '[]';
    
    let events: any[] = [];
    let parseError = null;
    
    try {
      events = JSON.parse(eventsParam);
    } catch (e) {
      parseError = e instanceof Error ? e.message : String(e);
      events = [];
    }
    
    if (events.length === 0) {
      events = [{ title: 'Sem eventos', venue: 'Salvador', date: 'Hoje', time: '00:00', price: 'Grátis' }];
    }
    
    // Debug: retornar info se houver erro de parse
    if (parseError) {
      return new Response(
        `Parse Error: ${parseError}\nEvents Param: ${eventsParam.substring(0, 200)}...`,
        { status: 400, headers: { 'Content-Type': 'text/plain' } }
      );
    }

  const configs: Record<string, any> = {
    today: { title: 'HOJE', color1: '#667eea', color2: '#764ba2' },
    weekend: { title: 'FIM DE SEMANA', color1: '#f093fb', color2: '#f5576c' },
    free: { title: 'GRATUITOS', color1: '#4ade80', color2: '#22c55e' },
    highlight: { title: 'DESTAQUE', color1: '#fbbf24', color2: '#f59e0b' },
  };

  const config = configs[storyType] || configs.today;
  const displayEvents = events.slice(0, 5);

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: `linear-gradient(to bottom, ${config.color1}, ${config.color2})`,
          padding: '60px 40px',
          color: 'white',
        }}
      >
        <div style={{ fontSize: '64px', fontWeight: 'bold', marginBottom: '40px', textAlign: 'center' }}>
          {config.title}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {displayEvents.map((event: any, i: number) => (
            <div
              key={i}
              style={{
                background: 'rgba(255,255,255,0.2)',
                padding: '20px',
                borderRadius: '16px',
              }}
            >
              <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '10px' }}>
                {event.title}
              </div>
              <div style={{ fontSize: '20px' }}>
                {event.date} - {event.time}
              </div>
              <div style={{ fontSize: '20px' }}>
                {event.venue}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 'auto', fontSize: '28px', textAlign: 'center' }}>
          @agendaculturalssa
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1920,
    }
  );
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return new Response(
      `Story Generation Error: ${errorMsg}\nStack: ${error instanceof Error ? error.stack : 'N/A'}`,
      { status: 500, headers: { 'Content-Type': 'text/plain' } }
    );
  }
}
