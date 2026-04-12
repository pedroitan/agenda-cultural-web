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
          TESTE COM BACKGROUND
        </div>
        
        <div style={{ background: 'white' }}>
          <div style={{ fontSize: '28px', color: 'black' }}>
            Evento Teste
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
