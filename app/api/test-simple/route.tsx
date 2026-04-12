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
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(to bottom, #667eea, #764ba2)',
          color: 'white',
          fontSize: '80px',
          fontWeight: 'bold',
        }}
      >
        TESTE 1920px
      </div>
    ),
    {
      width: 1080,
      height: 1920,
    }
  );
}
