import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  const title = searchParams.get('title') || 'Evento em Salvador';
  const venue = searchParams.get('venue') || 'Salvador';
  const date = searchParams.get('date') || '';
  const time = searchParams.get('time') || '';
  const price = searchParams.get('price') || 'Consulte';
  const imageUrl = searchParams.get('image');
  const type = searchParams.get('type') || 'single';

  if (type === 'list') {
    // ========== LISTA ELEGANTE (Inspirado na Agenda da Semana) ==========
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: 'linear-gradient(135deg, #f5f5f0 0%, #e8e8e0 100%)',
            position: 'relative',
            padding: '60px',
          }}
        >
          {/* Círculo decorativo laranja - superior direito */}
          <div
            style={{
              position: 'absolute',
              top: '-100px',
              right: '-100px',
              width: '350px',
              height: '350px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
              opacity: 0.8,
            }}
          />
          
          {/* Círculo decorativo amarelo - inferior esquerdo */}
          <div
            style={{
              position: 'absolute',
              bottom: '-120px',
              left: '-120px',
              width: '400px',
              height: '400px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #ffc107 0%, #ff9800 100%)',
              opacity: 0.7,
            }}
          />

          {/* Estrela decorativa - superior esquerdo */}
          <div
            style={{
              position: 'absolute',
              top: '40px',
              left: '60px',
              fontSize: '48px',
              opacity: 0.6,
            }}
          >
            ✨
          </div>

          {/* Estrela decorativa - inferior direito */}
          <div
            style={{
              position: 'absolute',
              bottom: '40px',
              right: '80px',
              fontSize: '48px',
              opacity: 0.6,
            }}
          >
            ✨
          </div>

          {/* Conteúdo principal */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              zIndex: 10,
            }}
          >
            {/* Título "AGENDA" */}
            <div
              style={{
                fontSize: '120px',
                fontWeight: 'bold',
                color: '#ff6b35',
                letterSpacing: '8px',
                marginBottom: '-20px',
                textTransform: 'uppercase',
              }}
            >
              AGENDA
            </div>

            {/* Subtítulo em script */}
            <div
              style={{
                fontSize: '72px',
                fontStyle: 'italic',
                color: '#333',
                marginBottom: '60px',
              }}
            >
              {title.toLowerCase()}
            </div>

            {/* Badge de contagem de eventos */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                background: 'rgba(255,255,255,0.9)',
                padding: '30px 60px',
                borderRadius: '20px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              }}
            >
              <div
                style={{
                  fontSize: '80px',
                  fontWeight: 'bold',
                  color: '#ff6b35',
                }}
              >
                {venue.split(' ')[0]}
              </div>
              <div
                style={{
                  fontSize: '42px',
                  color: '#333',
                  fontWeight: '600',
                }}
              >
                eventos
              </div>
            </div>
          </div>

          {/* Rodapé com logo/branding */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: '40px',
              zIndex: 10,
            }}
          >
            <div
              style={{
                fontSize: '28px',
                color: '#666',
                fontWeight: '600',
              }}
            >
              @agendaculturalssa
            </div>
          </div>
        </div>
      ),
      {
        width: 1080,
        height: 1080,
      }
    );
  }

  // ========== CULTURAL ARTÍSTICO (Evento Individual) ==========
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: imageUrl 
            ? '#1a1a1a' 
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
          position: 'relative',
        }}
      >
        {/* Imagem de fundo com overlay artístico */}
        {imageUrl && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
            }}
          >
            <img
              src={imageUrl}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
            {/* Overlay com gradiente artístico */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(135deg, rgba(102,126,234,0.85) 0%, rgba(118,75,162,0.85) 50%, rgba(240,147,251,0.85) 100%)',
                mixBlendMode: 'multiply',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.7) 70%, rgba(0,0,0,0.9) 100%)',
              }}
            />
          </div>
        )}

        {/* Elementos decorativos quando não há imagem */}
        {!imageUrl && (
          <>
            <div
              style={{
                position: 'absolute',
                top: '100px',
                left: '80px',
                fontSize: '120px',
                opacity: 0.15,
              }}
            >
              🎭
            </div>
            <div
              style={{
                position: 'absolute',
                bottom: '150px',
                right: '100px',
                fontSize: '100px',
                opacity: 0.15,
              }}
            >
              🎵
            </div>
          </>
        )}

        {/* Conteúdo */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: '60px',
            flex: 1,
            zIndex: 10,
          }}
        >
          {/* Título com destaque */}
          <div
            style={{
              fontSize: '68px',
              fontWeight: 'bold',
              color: '#ffffff',
              lineHeight: 1.2,
              marginBottom: '30px',
              textShadow: '0 4px 12px rgba(0,0,0,0.5)',
              maxWidth: '900px',
            }}
          >
            {title}
          </div>

          {/* Info cards */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            {date && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(10px)',
                  padding: '20px 30px',
                  borderRadius: '16px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  maxWidth: 'fit-content',
                }}
              >
                <div
                  style={{
                    fontSize: '36px',
                    color: '#ffffff',
                    fontWeight: '600',
                  }}
                >
                  📅 {date} {time && `• ${time}`}
                </div>
              </div>
            )}

            {venue && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(10px)',
                  padding: '20px 30px',
                  borderRadius: '16px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  maxWidth: 'fit-content',
                }}
              >
                <div
                  style={{
                    fontSize: '36px',
                    color: '#ffffff',
                    fontWeight: '600',
                  }}
                >
                  📍 {venue}
                </div>
              </div>
            )}

            {price && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'rgba(74,222,128,0.25)',
                  backdropFilter: 'blur(10px)',
                  padding: '20px 30px',
                  borderRadius: '16px',
                  border: '2px solid rgba(74,222,128,0.5)',
                  maxWidth: 'fit-content',
                }}
              >
                <div
                  style={{
                    fontSize: '42px',
                    color: '#4ade80',
                    fontWeight: 'bold',
                  }}
                >
                  💰 {price}
                </div>
              </div>
            )}
          </div>

          {/* Instagram handle */}
          <div
            style={{
              marginTop: '40px',
              fontSize: '28px',
              color: 'rgba(255,255,255,0.8)',
              fontWeight: '600',
            }}
          >
            @agendaculturalssa
          </div>
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1080,
    }
  );
}
