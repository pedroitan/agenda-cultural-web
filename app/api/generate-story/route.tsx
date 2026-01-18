import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storyType = searchParams.get('type') || 'today';
    const eventsParam = searchParams.get('events') || '[]';
    
    let events: any[] = [];
    try {
      // Tenta parse direto primeiro (URLSearchParams já decodifica)
      events = JSON.parse(eventsParam);
    } catch {
      // Se falhar, tenta com decodeURIComponent
      try {
        events = JSON.parse(decodeURIComponent(eventsParam));
      } catch {
        events = [];
      }
    }
    
    if (events.length === 0) {
      events = [{ title: 'Sem eventos', venue: 'Salvador', date: 'Hoje', time: '00:00', price: 'Grátis' }];
    }

    const configs: Record<string, any> = {
      today: { title: 'HOJE', emoji: '🎉', color1: '#667eea', color2: '#764ba2' },
      weekend: { title: 'FIM DE SEMANA', emoji: '🎊', color1: '#f093fb', color2: '#f5576c' },
      free: { title: 'GRATUITOS', emoji: '💚', color1: '#4ade80', color2: '#22c55e' },
      highlight: { title: 'DESTAQUE', emoji: '⭐', color1: '#fbbf24', color2: '#f59e0b' },
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
            background: `linear-gradient(135deg, ${config.color1}, ${config.color2})`,
            padding: '60px 40px',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '40px' }}>
            <div style={{ fontSize: '32px', color: 'white', marginBottom: '20px' }}>
              🎭 AGENDA CULTURAL
            </div>
            <div style={{ fontSize: '72px', fontWeight: 'bold', color: 'white', textAlign: 'center' }}>
              {config.emoji} {config.title}
            </div>
            <div style={{ fontSize: '36px', color: 'white', marginTop: '10px' }}>
              {events.length} {events.length === 1 ? 'evento' : 'eventos'}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
            {displayEvents.map((event: any, i: number) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  background: 'rgba(255,255,255,0.15)',
                  padding: '25px',
                  borderRadius: '20px',
                  border: '1px solid rgba(255,255,255,0.25)',
                }}
              >
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'white', marginBottom: '12px' }}>
                  {event.title}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: '24px', color: 'white' }}>
                    📅 {event.date} • {event.time}
                  </div>
                  <div style={{ fontSize: '24px', color: 'white' }}>
                    📍 {event.venue}
                  </div>
                  <div style={{ fontSize: '28px', color: '#4ade80', fontWeight: 'bold' }}>
                    💰 {event.price}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '40px' }}>
            <div style={{ fontSize: '32px', color: 'white', fontWeight: '600' }}>
              @agendaculturalssa
            </div>
            <div style={{ fontSize: '24px', color: 'rgba(255,255,255,0.8)' }}>
              agendaculturalsalvador.com.br
            </div>
          </div>
        </div>
      ),
      {
        width: 1080,
        height: 1920,
      }
    );
  } catch (error) {
    return new Response('Error: ' + String(error), { status: 500 });
  }
}
