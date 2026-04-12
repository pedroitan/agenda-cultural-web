import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  const event = { title: 'Show de Rock', venue: 'Teatro Castro Alves', date: '18 Jan', time: '20:00' };
  
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
          TESTE COM EVENTO
        </div>

        <div style={{ background: 'rgba(255,255,255,0.2)', padding: '20px', borderRadius: '16px' }}>
          <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '10px' }}>
            {event.title}
          </div>
          <div style={{ fontSize: '20px' }}>
            {event.date} - {event.time}
          </div>
          <div style={{ fontSize: '20px' }}>
            {event.venue}
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
