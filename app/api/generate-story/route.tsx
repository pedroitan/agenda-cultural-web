import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const storyType = url.searchParams.get('type') || 'today';
    const eventsParam = url.searchParams.get('events') || '[]';
    
    let events: any[] = [];
    
    try {
      // Decodificar e fazer parse do JSON
      const decoded = decodeURIComponent(eventsParam);
      events = JSON.parse(decoded);
    } catch (e) {
      // Se falhar, usar evento padrão
      console.error('JSON parse error:', e);
      events = [];
    }
    
    if (events.length === 0) {
      events = [{ title: 'Sem eventos', venue: 'Salvador', date: 'Hoje', time: '00:00', price: 'Grátis' }];
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', flex: 1 }}>
          {displayEvents[0] && (
            <div>
              <div style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '10px' }}>{displayEvents[0].title}</div>
              <div style={{ fontSize: '26px' }}>{displayEvents[0].date} • {displayEvents[0].time}</div>
              <div style={{ fontSize: '26px' }}>{displayEvents[0].venue}</div>
            </div>
          )}
          {displayEvents[1] && (
            <div>
              <div style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '10px' }}>{displayEvents[1].title}</div>
              <div style={{ fontSize: '26px' }}>{displayEvents[1].date} • {displayEvents[1].time}</div>
              <div style={{ fontSize: '26px' }}>{displayEvents[1].venue}</div>
            </div>
          )}
          {displayEvents[2] && (
            <div>
              <div style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '10px' }}>{displayEvents[2].title}</div>
              <div style={{ fontSize: '26px' }}>{displayEvents[2].date} • {displayEvents[2].time}</div>
              <div style={{ fontSize: '26px' }}>{displayEvents[2].venue}</div>
            </div>
          )}
          {displayEvents[3] && (
            <div>
              <div style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '10px' }}>{displayEvents[3].title}</div>
              <div style={{ fontSize: '26px' }}>{displayEvents[3].date} • {displayEvents[3].time}</div>
              <div style={{ fontSize: '26px' }}>{displayEvents[3].venue}</div>
            </div>
          )}
          {displayEvents[4] && (
            <div>
              <div style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '10px' }}>{displayEvents[4].title}</div>
              <div style={{ fontSize: '26px' }}>{displayEvents[4].date} • {displayEvents[4].time}</div>
              <div style={{ fontSize: '26px' }}>{displayEvents[4].venue}</div>
            </div>
          )}
        </div>

        <div style={{ fontSize: '28px', textAlign: 'center', marginTop: '40px' }}>
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
