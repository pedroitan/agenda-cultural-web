import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(to bottom, #667eea, #764ba2)',
          padding: '60px 40px',
          color: 'white',
        }}
      >
        <div style={{ fontSize: '64px', fontWeight: 'bold', marginBottom: '40px', textAlign: 'center' }}>
          GRATUITOS
        </div>

        <div style={{ background: 'rgba(255,255,255,0.2)', padding: '20px', borderRadius: '16px', marginBottom: '20px' }}>
          <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '10px' }}>
            Ensaio do Bloco Olodum
          </div>
          <div style={{ fontSize: '20px' }}>
            18 Jan - 20:00
          </div>
          <div style={{ fontSize: '20px' }}>
            Largo do Pelourinho
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.2)', padding: '20px', borderRadius: '16px' }}>
          <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '10px' }}>
            Musiclauns
          </div>
          <div style={{ fontSize: '20px' }}>
            18 Jan - 20:00
          </div>
          <div style={{ fontSize: '20px' }}>
            Terraço do Shopping Barra
          </div>
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
}
