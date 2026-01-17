import { InstagramEvent } from "./instagram-queries";

/**
 * Format date as "16 de Janeiro"
 */
function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  const day = d.getDate();
  const month = months[d.getMonth()];
  return `${day} de ${month}`;
}

/**
 * Format time as "19:00"
 */
function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  const hours = d.getHours().toString().padStart(2, "0");
  const minutes = d.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

/**
 * Format day of week as "Sábado"
 */
function formatDayOfWeek(dateStr: string): string {
  const d = new Date(dateStr);
  const days = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
  return days[d.getDay()];
}

/**
 * Template: Evento Individual
 */
export function singleEventCopy(event: InstagramEvent): string {
  const date = formatDate(event.start_datetime);
  const time = formatTime(event.start_datetime);
  const dayOfWeek = formatDayOfWeek(event.start_datetime);
  
  return `🎭 ${event.title}

📍 ${event.venue_name || "Salvador"}
📅 ${dayOfWeek}, ${date} • ${time}

💰 ${event.price_text || "Consulte"}

👉 Link na bio para mais eventos

#SalvadorBA #EventosSalvador #AgendaCulturalSalvador`;
}

/**
 * Template: Lista de Eventos (Hoje)
 */
export function todayListCopy(events: InstagramEvent[]): string {
  if (events.length === 0) {
    return `Nenhum evento encontrado para hoje 😔

Mas temos muitos outros rolês incríveis na agenda!

🔗 Confira no link da bio

#SalvadorBA #AgendaCulturalSalvador`;
  }

  const eventsList = events
    .map((e, i) => {
      const time = formatTime(e.start_datetime);
      const price = e.is_free ? "Grátis" : (e.price_text || "Consulte");
      return `${i + 1}️⃣ ${e.title}\n   📍 ${e.venue_name || "Salvador"} • ${time} • ${price}`;
    })
    .join("\n\n");

  return `O que fazer em Salvador HOJE 👇

${eventsList}

🔗 Agenda completa no link da bio

#AgendaCulturalSalvador #SalvadorBA #EventosHoje`;
}

/**
 * Template: Lista de Eventos (Fim de Semana)
 */
export function weekendListCopy(events: InstagramEvent[]): string {
  if (events.length === 0) {
    return `Nenhum evento encontrado para o fim de semana 😔

Mas temos muitos outros rolês incríveis na agenda!

🔗 Confira no link da bio

#SalvadorBA #AgendaCulturalSalvador`;
  }

  const eventsList = events
    .map((e, i) => {
      const dayOfWeek = formatDayOfWeek(e.start_datetime);
      const time = formatTime(e.start_datetime);
      const price = e.is_free ? "Grátis" : (e.price_text || "Consulte");
      return `${i + 1}️⃣ ${e.title}\n   ${dayOfWeek} • ${time} • ${e.venue_name || "Salvador"} • ${price}`;
    })
    .join("\n\n");

  return `O que fazer em Salvador NESTE FIM DE SEMANA 🎉

${eventsList}

🔗 Agenda completa no link da bio

#FimDeSemana #SalvadorBA #AgendaCulturalSalvador`;
}

/**
 * Template: Eventos Gratuitos
 */
export function freeEventsListCopy(events: InstagramEvent[]): string {
  if (events.length === 0) {
    return `Nenhum evento gratuito encontrado para hoje 😔

Mas temos muitos outros rolês na agenda!

🔗 Confira no link da bio

#SalvadorBA #AgendaCulturalSalvador`;
  }

  const eventsList = events
    .map((e, i) => {
      const time = formatTime(e.start_datetime);
      return `${i + 1}️⃣ ${e.title}\n   📍 ${e.venue_name || "Salvador"} • ${time}`;
    })
    .join("\n\n");

  return `ROLÊS GRATUITOS em Salvador hoje 💚

${eventsList}

🔗 Mais eventos no link da bio

#EventosGratuitos #SalvadorBA #AgendaCulturalSalvador #Gratis`;
}
