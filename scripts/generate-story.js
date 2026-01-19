const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function generateStory(events, storyType = 'week', outputPath = 'story-output.png') {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.setViewportSize({ width: 1080, height: 1920 });

  const html = generateHTML(events, storyType);
  
  await page.setContent(html, { waitUntil: 'networkidle' });
  
  await page.screenshot({ 
    path: outputPath,
    type: 'png'
  });

  await browser.close();
  
  console.log(`✅ Story gerado: ${outputPath}`);
  return outputPath;
}

function generateHTML(events, storyType = 'week') {
  const storyConfig = {
    week: { title: 'Agenda da', subtitle: 'Semana', gradient: ['#667eea', '#764ba2'] },
    free: { title: 'ROLÊS GRATUITOS', subtitle: 'em Salvador hoje', gradient: ['#4ade80', '#22c55e'] },
    weekend: { title: 'O que fazer em Salvador', subtitle: 'NESTE FIM DE SEMANA', gradient: ['#f093fb', '#f5576c'] },
    today: { title: 'O que fazer em Salvador', subtitle: 'HOJE', gradient: ['#fbbf24', '#f59e0b'] },
    highlight: { title: 'Evento em', subtitle: 'Destaque', gradient: ['#ff6b35', '#f59e0b'] },
  };
  const config = storyConfig[storyType] || storyConfig.week;
  const numberEmojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣'];
  
  const eventItems = events.map((event, index) => `
    <div class="event-item">
      <div class="event-number">${numberEmojis[index] || `${index + 1}️⃣`}</div>
      <div class="event-content">
        <div class="event-title">${event.title}</div>
        <div class="event-details">${event.dayOfWeek} • ${event.time} • ${event.venue} • ${event.price}</div>
      </div>
    </div>
  `).join('');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=1080, height=1920">
  <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 1080px;
      height: 1920px;
      font-family: 'Inter', sans-serif;
      background: linear-gradient(135deg, ${config.gradient[0]} 0%, ${config.gradient[1]} 100%);
      position: relative;
      overflow: hidden;
    }
    .texture {
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 100%;
      background-image: 
        radial-gradient(ellipse at 10% 20%, rgba(255,255,255,0.1) 0%, transparent 50%),
        radial-gradient(ellipse at 90% 80%, rgba(255,255,255,0.08) 0%, transparent 40%);
    }
    .artistic-overlay {
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 100%;
      background-image: 
        radial-gradient(circle at 20% 30%, rgba(255,255,255,0.15) 0%, transparent 25%),
        radial-gradient(circle at 80% 70%, rgba(255,255,255,0.12) 0%, transparent 30%);
      mix-blend-mode: overlay;
    }
    .container {
      position: relative;
      z-index: 1;
      padding: 80px 60px;
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    .header { text-align: center; margin-bottom: 80px; }
    .title-main {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 90px;
      color: white;
      line-height: 1.1;
      letter-spacing: 2px;
      text-shadow: 0 4px 20px rgba(0,0,0,0.3);
      text-align: center;
      max-width: 900px;
    }
    .title-sub {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 70px;
      background: rgba(255,255,255,0.95);
      color: #1a1a1a;
      display: inline-block;
      padding: 10px 40px;
      margin-top: 10px;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.2);
      text-align: center;
    }
    .events-list {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 40px;
    }
    .event-item {
      display: flex;
      align-items: flex-start;
      gap: 20px;
      background: rgba(255,255,255,0.15);
      backdrop-filter: blur(10px);
      padding: 25px 30px;
      border-radius: 16px;
      border: 1px solid rgba(255,255,255,0.2);
    }
    .event-number {
      font-size: 48px;
      line-height: 1;
      flex-shrink: 0;
      margin-top: 5px;
    }
    .event-content {
      flex: 1;
      min-width: 0;
    }
    .event-title {
      font-size: 32px;
      font-weight: 700;
      color: white;
      margin-bottom: 10px;
      line-height: 1.2;
    }
    .event-details {
      font-size: 24px;
      color: rgba(255,255,255,0.9);
      line-height: 1.4;
    }
    .footer {
      text-align: center;
      margin-top: auto;
      padding-top: 60px;
    }
    .logo {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 15px;
    }
    .logo-icon { font-size: 60px; }
    .logo-text {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 48px;
      color: white;
      text-shadow: 0 2px 10px rgba(0,0,0,0.3);
    }
    .logo-text span { color: rgba(255,255,255,0.9); }
    .instagram-handle {
      font-size: 28px;
      color: rgba(255,255,255,0.8);
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="texture"></div>
  <div class="artistic-overlay"></div>

  <div class="container">
    <div class="header">
      <div class="title-main">${config.title}</div>
      <div class="title-sub">${config.subtitle}</div>
    </div>

    <div class="events-list">
      ${eventItems}
    </div>

    <div class="footer">
      <div class="logo">
        <span class="logo-icon">🎭</span>
        <span class="logo-text"><span>Agenda</span> Cultural</span>
      </div>
      <div class="instagram-handle">@agendaculturalsalvador</div>
    </div>
  </div>
</body>
</html>`;
}

// Exemplo de uso
const sampleEvents = [
  { title: 'Ensaio do Olodum', dayOfWeek: 'Sábado', time: '19:00', venue: 'Pelourinho', price: 'Grátis' },
  { title: 'Show Ivete Sangalo', dayOfWeek: 'Domingo', time: '20:00', venue: 'Arena Fonte Nova', price: 'Consulte' },
  { title: 'Festival de Jazz', dayOfWeek: 'Sábado', time: '21:00', venue: 'Teatro Castro Alves', price: 'R$ 50' },
  { title: 'Carnaval de Rua', dayOfWeek: 'Domingo', time: '18:00', venue: 'Barra-Ondina', price: 'Grátis' },
];

// Executar se chamado diretamente
if (require.main === module) {
  // Gerar diferentes tipos de stories
  Promise.all([
    generateStory(sampleEvents, 'week', 'story-week.png'),
    generateStory(sampleEvents, 'free', 'story-free.png'),
    generateStory(sampleEvents, 'weekend', 'story-weekend.png'),
    generateStory(sampleEvents, 'today', 'story-today.png'),
  ])
    .then(() => console.log('🎉 Todas as variações geradas!'))
    .catch(err => console.error('❌ Erro:', err));
}

module.exports = { generateStory, generateHTML };
