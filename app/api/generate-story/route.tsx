import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

interface Event {
  title: string;
  venue: string;
  date: string;
  time: string;
  price: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  const storyType = searchParams.get('type') || 'today'; // today, weekend, free, highlight
  const eventsParam = searchParams.get('events') || '[]';
  const events: Event[] = JSON.parse(decodeURIComponent(eventsParam));

  // Definir título e cor baseado no tipo
  const storyConfig = {
    today: {
      title: 'HOJE em Salvador',
      emoji: '🎉',
      gradient: ['#667eea', '#764ba2'],
      accentColor: '#ff6b35',
    },
    weekend: {
      title: 'FIM DE SEMANA',
      emoji: '🎊',
      gradient: ['#f093fb', '#f5576c'],
      accentColor: '#ffc107',
    },
    free: {
      title: 'ROLÊS GRATUITOS',
      emoji: '💚',
      gradient: ['#4ade80', '#22c55e'],
      accentColor: '#10b981',
    },
    highlight: {
      title: 'DESTAQUE DO DIA',
      emoji: '⭐',
      gradient: ['#fbbf24', '#f59e0b'],
      accentColor: '#ff6b35',
    },
  };

  const config = storyConfig[storyType as keyof typeof storyConfig] || storyConfig.today;

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: `linear-gradient(135deg, ${config.gradient[0]} 0%, ${config.gradient[1]} 100%)`,
          position: 'relative',
        }}
      >
        {/* Círculos decorativos */}
        <div
          style={{
            position: 'absolute',
            top: '-150px',
            right: '-150px',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-200px',
            left: '-200px',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
          }}
        />

        {/* Header */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '60px 40px 40px 40px',
            zIndex: 10,
          }}
        >
          {/* Badge superior */}
          <div
            style={{
              background: 'rgba(255,255,255,0.25)',
              padding: '15px 35px',
              borderRadius: '50px',
              marginBottom: '20px',
            }}
          >
            <div
              style={{
                fontSize: '28px',
                color: '#ffffff',
                fontWeight: '600',
              }}
            >
              🎭 AGENDA CULTURAL
            </div>
          </div>

          {/* Título principal */}
          <div
            style={{
              fontSize: '64px',
              fontWeight: 'bold',
              color: '#ffffff',
              textAlign: 'center',
              letterSpacing: '2px',
              textShadow: '0 4px 12px rgba(0,0,0,0.3)',
              marginBottom: '10px',
            }}
          >
            {config.emoji} {config.title}
          </div>

          {/* Contador de eventos */}
          <div
            style={{
              fontSize: '32px',
              color: 'rgba(255,255,255,0.9)',
              fontWeight: '600',
            }}
          >
            {events.length} {events.length === 1 ? 'evento' : 'eventos'}
          </div>
        </div>

        {/* Lista de eventos */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            padding: '0 40px',
            flex: 1,
            overflowY: 'hidden',
            zIndex: 10,
          }}
        >
          {events.slice(0, 5).map((event, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                flexDirection: 'column',
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)',
                padding: '25px',
                borderRadius: '20px',
                border: '1px solid rgba(255,255,255,0.25)',
              }}
            >
              {/* Título do evento */}
              <div
                style={{
                  fontSize: '28px',
                  fontWeight: 'bold',
                  color: '#ffffff',
                  marginBottom: '12px',
                  lineHeight: 1.2,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {event.title}
              </div>

              {/* Info do evento */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                {event.date && (
                  <div
                    style={{
                      fontSize: '22px',
                      color: 'rgba(255,255,255,0.95)',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    📅 {event.date} {event.time && `• ${event.time}`}
                  </div>
                )}
                {event.venue && (
                  <div
                    style={{
                      fontSize: '22px',
                      color: 'rgba(255,255,255,0.95)',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    📍 {event.venue}
                  </div>
                )}
                {event.price && (
                  <div
                    style={{
                      fontSize: '24px',
                      color: '#4ade80',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    💰 {event.price}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Indicador de mais eventos */}
          {events.length > 5 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: 'rgba(255,255,255,0.2)',
                padding: '20px',
                borderRadius: '16px',
              }}
            >
              <div
                style={{
                  fontSize: '24px',
                  color: '#ffffff',
                  fontWeight: '600',
                }}
              >
                + {events.length - 5} eventos
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '30px 40px 50px 40px',
            zIndex: 10,
          }}
        >
          <div
            style={{
              fontSize: '28px',
              color: 'rgba(255,255,255,0.9)',
              fontWeight: '600',
              marginBottom: '10px',
            }}
          >
            @agendaculturalssa
          </div>
          <div
            style={{
              fontSize: '22px',
              color: 'rgba(255,255,255,0.7)',
            }}
          >
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
}
