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
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <div
          style={{
            fontSize: '80px',
            fontWeight: 'bold',
            color: '#ffffff',
          }}
        >
          TESTE STORY
        </div>
        <div
          style={{
            fontSize: '40px',
            color: '#ffffff',
            marginTop: '20px',
          }}
        >
          1080 x 1920
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1920,
    }
  );
}
