import { NextRequest } from 'next/server';
import { createCanvas, loadImage } from 'canvas';

export const runtime = 'nodejs';

// Helper function to draw rounded rectangle
function roundRect(
  ctx: any,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

// Helper function to wrap text
function wrapText(
  ctx: any,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + ' ' + word).width;
    if (width < maxWidth) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  const title = searchParams.get('title') || 'Evento em Salvador';
  const venue = searchParams.get('venue') || 'Salvador';
  const date = searchParams.get('date') || '';
  const time = searchParams.get('time') || '';
  const price = searchParams.get('price') || 'Consulte';
  const imageUrl = searchParams.get('image');
  const type = searchParams.get('type') || 'single';

  const canvas = createCanvas(1080, 1080);
  const ctx = canvas.getContext('2d');

  if (type === 'list') {
    // ========== LIST CARD DESIGN ==========
    
    // Gradient background
    const gradient = ctx.createLinearGradient(0, 0, 1080, 1080);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(0.5, '#764ba2');
    gradient.addColorStop(1, '#f093fb');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1080, 1080);

    // Decorative circles
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(950, 150, 200, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(150, 950, 250, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Decorative lines
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 3;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(100 + i * 200, 0);
      ctx.lineTo(300 + i * 200, 1080);
      ctx.stroke();
    }

    // Top badge
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    roundRect(ctx, 340, 80, 400, 60, 30);
    ctx.fill();
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🎭 AGENDA CULTURAL', 540, 120);

    // Main title
    ctx.font = 'bold 90px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetY = 8;
    
    const titleLines = wrapText(ctx, title, 900);
    const titleY = 540 - (titleLines.length * 50);
    titleLines.forEach((line, i) => {
      ctx.fillText(line, 540, titleY + i * 100);
    });
    
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // Event count badge
    const eventCount = venue.split(' ')[0];
    
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    roundRect(ctx, 340, 680, 400, 120, 60);
    ctx.fill();

    // Glow effect
    ctx.shadowColor = 'rgba(255,255,255,0.5)';
    ctx.shadowBlur = 30;
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    roundRect(ctx, 340, 680, 400, 120, 60);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Event count number
    ctx.font = 'bold 80px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(eventCount, 440, 760);

    // "eventos" text
    ctx.font = 'bold 42px sans-serif';
    ctx.fillText('eventos', 600, 760);

    // Bottom bar
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(0, 980, 1080, 100);

    // Location
    ctx.font = 'bold 32px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.fillText('📍 Salvador, BA', 60, 1035);

    // Instagram handle
    ctx.textAlign = 'right';
    ctx.fillText('@agendaculturalssa', 1020, 1035);

  } else {
    // ========== SINGLE EVENT CARD DESIGN ==========
    
    if (imageUrl) {
      // Card with image
      try {
        const img = await loadImage(imageUrl);
        
        // Draw image
        const aspectRatio = img.width / img.height;
        let drawWidth = 1080;
        let drawHeight = 1080 / aspectRatio;
        let offsetY = 0;
        
        if (drawHeight < 650) {
          drawHeight = 650;
          drawWidth = 650 * aspectRatio;
          offsetY = 0;
        }
        
        ctx.drawImage(img, (1080 - drawWidth) / 2, offsetY, drawWidth, drawHeight);
        
        // Dark overlay gradient
        const overlayGradient = ctx.createLinearGradient(0, 0, 0, 1080);
        overlayGradient.addColorStop(0, 'rgba(15,23,42,0)');
        overlayGradient.addColorStop(0.5, 'rgba(15,23,42,0.7)');
        overlayGradient.addColorStop(1, 'rgba(15,23,42,0.95)');
        ctx.fillStyle = overlayGradient;
        ctx.fillRect(0, 0, 1080, 1080);
      } catch (error) {
        // If image fails, use gradient
        const gradient = ctx.createLinearGradient(0, 0, 1080, 1080);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(1, '#764ba2');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 1080, 1080);
      }
    } else {
      // No image - use gradient
      const gradient = ctx.createLinearGradient(0, 0, 1080, 1080);
      gradient.addColorStop(0, '#667eea');
      gradient.addColorStop(1, '#764ba2');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1080, 1080);
      
      // Decorative elements
      ctx.globalAlpha = 0.1;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(900, 200, 180, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Content area
    const contentY = 650;
    
    // Title with outline
    ctx.font = 'bold 64px sans-serif';
    ctx.textAlign = 'left';
    
    const titleLines = wrapText(ctx, title, 960);
    let currentY = contentY;
    
    titleLines.forEach((line) => {
      // Outline
      ctx.strokeStyle = 'rgba(0,0,0,0.5)';
      ctx.lineWidth = 8;
      ctx.strokeText(line, 60, currentY);
      
      // Fill
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 10;
      ctx.fillText(line, 60, currentY);
      
      currentY += 75;
    });
    
    ctx.shadowBlur = 0;

    // Info badges
    currentY += 20;
    
    if (date) {
      // Date badge
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      roundRect(ctx, 60, currentY, 450, 60, 30);
      ctx.fill();
      
      ctx.font = 'bold 32px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'left';
      ctx.fillText(`📅 ${date}`, 85, currentY + 42);
      
      if (time) {
        ctx.fillText(`• ${time}`, 400, currentY + 42);
      }
      
      currentY += 80;
    }

    if (venue) {
      // Venue badge
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      const venueWidth = Math.min(ctx.measureText(`📍 ${venue}`).width + 50, 960);
      roundRect(ctx, 60, currentY, venueWidth, 60, 30);
      ctx.fill();
      
      ctx.font = 'bold 32px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`📍 ${venue}`, 85, currentY + 42);
      
      currentY += 80;
    }

    if (price) {
      // Price badge with glow
      ctx.fillStyle = 'rgba(74,222,128,0.3)';
      ctx.shadowColor = 'rgba(74,222,128,0.6)';
      ctx.shadowBlur = 20;
      roundRect(ctx, 60, currentY, 300, 70, 35);
      ctx.fill();
      ctx.shadowBlur = 0;
      
      ctx.font = 'bold 40px sans-serif';
      ctx.fillStyle = '#4ade80';
      ctx.fillText(`💰 ${price}`, 85, currentY + 48);
    }

    // Bottom Instagram handle
    ctx.font = 'bold 28px sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.textAlign = 'right';
    ctx.fillText('@agendaculturalssa', 1020, 1035);
  }

  const buffer = canvas.toBuffer('image/png');
  
  return new Response(buffer, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
