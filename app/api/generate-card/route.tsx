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
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '80px',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', textAlign: 'center' }}>
            <h1 style={{ 
              fontSize: '72px', 
              margin: 0, 
              fontWeight: 'bold', 
              lineHeight: 1.2,
              color: 'white',
              textShadow: '0 4px 6px rgba(0,0,0,0.3)',
            }}>
              {title}
            </h1>
            
            <div style={{ 
              fontSize: '48px', 
              lineHeight: 1.6,
              color: 'white',
              fontWeight: '600',
              textShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }}>
              {venue}
            </div>
          </div>
          
          <div
            style={{
              position: 'absolute',
              bottom: '50px',
              right: '60px',
              fontSize: '28px',
              color: 'white',
              opacity: 0.8,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              textShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }}
          >
            @agendaculturalssa
          </div>
        </div>
      ),
      {
        width: 1080,
        height: 1080,
      }
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: imageUrl ? '#0f172a' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        {imageUrl && (
          <div
            style={{
              width: '100%',
              height: '60%',
              display: 'flex',
              position: 'relative',
            }}
          >
            <img
              src={imageUrl}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
              alt="Event"
            />
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(15,23,42,0.9) 100%)',
              }}
            />
          </div>
        )}
        
        <div
          style={{
            padding: '50px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            flex: 1,
            justifyContent: imageUrl ? 'flex-end' : 'center',
          }}
        >
          <h1
            style={{
              fontSize: '56px',
              margin: 0,
              lineHeight: 1.2,
              fontWeight: 'bold',
              color: 'white',
              textShadow: '0 4px 6px rgba(0,0,0,0.3)',
            }}
          >
            {title}
          </h1>
          
          {date && (
            <div style={{ 
              fontSize: '32px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px',
              color: 'white',
              textShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }}>
              📅 {date} {time && `• ${time}`}
            </div>
          )}
          
          {venue && (
            <div style={{ 
              fontSize: '32px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px',
              color: 'white',
              textShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }}>
              📍 {venue}
            </div>
          )}
          
          {price && (
            <div
              style={{
                fontSize: '36px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: '#4ade80',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              }}
            >
              💰 {price}
            </div>
          )}
        </div>
        
        <div
          style={{
            position: 'absolute',
            bottom: '30px',
            right: '50px',
            fontSize: '24px',
            color: 'white',
            opacity: 0.8,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            textShadow: '0 2px 4px rgba(0,0,0,0.2)',
          }}
        >
          @agendaculturalssa
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1080,
    }
  );
}
