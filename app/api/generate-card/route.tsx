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
            backgroundColor: '#0f172a',
            color: 'white',
            padding: '60px',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <h1 style={{ fontSize: '64px', margin: 0, fontWeight: 'bold', lineHeight: 1.2 }}>
              {title}
            </h1>
            
            <div style={{ fontSize: '32px', opacity: 0.9, lineHeight: 1.6 }}>
              {venue}
            </div>
          </div>
          
          <div
            style={{
              position: 'absolute',
              bottom: '40px',
              right: '60px',
              fontSize: '24px',
              opacity: 0.6,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
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
          backgroundColor: '#0f172a',
          color: 'white',
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
                background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(15,23,42,0.8) 100%)',
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
              background: 'linear-gradient(to right, #a855f7, #ec4899)',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            {title}
          </h1>
          
          {date && (
            <div style={{ fontSize: '32px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              📅 {date} {time && `• ${time}`}
            </div>
          )}
          
          {venue && (
            <div style={{ fontSize: '32px', display: 'flex', alignItems: 'center', gap: '10px' }}>
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
                color: '#10b981',
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
            opacity: 0.6,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
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
