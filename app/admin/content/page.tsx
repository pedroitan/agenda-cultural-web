import { Suspense } from "react";
import Link from "next/link";
import {
  getHighlightEvent,
  getEventsToday,
  getWeekendEvents,
  getFreeEventsToday,
} from "@/lib/instagram-queries";
import {
  singleEventCopy,
  todayListCopy,
  weekendListCopy,
  freeEventsListCopy,
} from "@/lib/instagram-copy";
import { CopyButton } from "./CopyButton";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function buildCardUrl(event: any): string {
  const date = new Date(event.start_datetime);
  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  const dateStr = `${date.getDate()} de ${months[date.getMonth()]}`;
  const timeStr = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  
  const params = new URLSearchParams({
    title: event.title,
    venue: event.venue_name || 'Salvador',
    date: dateStr,
    time: timeStr,
    price: event.price_text || 'Consulte',
    type: 'single',
  });
  
  if (event.image_url) {
    params.set('image', event.image_url);
  }
  
  return `/api/generate-card?${params.toString()}`;
}

function buildListCardUrl(title: string, description: string): string {
  const params = new URLSearchParams({
    title,
    venue: description,
    type: 'list',
  });
  
  return `/api/generate-card?${params.toString()}`;
}

function buildStoryUrl(type: string, events: any[]): string {
  const formattedEvents = events.map(event => {
    const date = new Date(event.start_datetime);
    const months = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    const dateStr = `${date.getDate()} de ${months[date.getMonth()]}`;
    const timeStr = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    
    return {
      title: event.title,
      venue: event.venue_name || 'Salvador',
      date: dateStr,
      time: timeStr,
      price: event.price_text || 'Consulte',
    };
  });

  const params = new URLSearchParams({
    type,
    events: encodeURIComponent(JSON.stringify(formattedEvents)),
  });
  
  return `/api/generate-story?${params.toString()}`;
}

async function ContentPreview() {
  const highlightEvent = await getHighlightEvent();
  const todayEvents = await getEventsToday();
  const weekendEvents = await getWeekendEvents();
  const freeEvents = await getFreeEventsToday();

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link href="/admin" className="text-blue-600 hover:underline font-semibold">
            ← Voltar para Admin
          </Link>
          <h1 className="text-3xl font-bold mt-4 text-black">Preview de Conteúdo Instagram</h1>
          <p className="text-gray-800 mt-2">
            Visualize os cards e copies gerados automaticamente
          </p>
        </div>

        <div className="space-y-12">
          {/* Highlight Event */}
          {highlightEvent && (
            <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
              <h2 className="text-2xl font-bold mb-4 text-black">1. Evento em Destaque</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2 text-black">Card:</h3>
                  <img
                    src={buildCardUrl(highlightEvent)}
                    alt="Highlight Event Card"
                    className="w-full rounded-lg shadow-md"
                  />
                  <a
                    href={buildCardUrl(highlightEvent)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline mt-2 block"
                  >
                    Abrir em nova aba
                  </a>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-black">Copy:</h3>
                  <pre className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap text-sm text-black border border-gray-300">
                    {singleEventCopy(highlightEvent)}
                  </pre>
                  <CopyButton text={singleEventCopy(highlightEvent)} />
                </div>
              </div>
            </div>
          )}

          {/* Today's Events */}
          {todayEvents.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
              <h2 className="text-2xl font-bold mb-4 text-black">2. Hoje em Salvador ({todayEvents.length} eventos)</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2 text-black">Card:</h3>
                  <img
                    src={buildListCardUrl('O que fazer HOJE em Salvador', `${todayEvents.length} eventos`)}
                    alt="Today Events Card"
                    className="w-full rounded-lg shadow-md"
                  />
                  <a
                    href={buildListCardUrl('O que fazer HOJE em Salvador', `${todayEvents.length} eventos`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline mt-2 block"
                  >
                    Abrir em nova aba
                  </a>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-black">Copy:</h3>
                  <pre className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap text-sm text-black border border-gray-300">
                    {todayListCopy(todayEvents)}
                  </pre>
                  <CopyButton text={todayListCopy(todayEvents)} />
                </div>
              </div>
            </div>
          )}

          {/* Weekend Events */}
          {weekendEvents.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
              <h2 className="text-2xl font-bold mb-4 text-black">3. Fim de Semana ({weekendEvents.length} eventos)</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2 text-black">Card:</h3>
                  <img
                    src={buildListCardUrl('Fim de Semana em Salvador', `${weekendEvents.length} eventos`)}
                    alt="Weekend Events Card"
                    className="w-full rounded-lg shadow-md"
                  />
                  <a
                    href={buildListCardUrl('Fim de Semana em Salvador', `${weekendEvents.length} eventos`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline mt-2 block"
                  >
                    Abrir em nova aba
                  </a>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-black">Copy:</h3>
                  <pre className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap text-sm text-black border border-gray-300">
                    {weekendListCopy(weekendEvents)}
                  </pre>
                  <CopyButton text={weekendListCopy(weekendEvents)} />
                </div>
              </div>
            </div>
          )}

          {/* Free Events */}
          {freeEvents.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
              <h2 className="text-2xl font-bold mb-4 text-black">4. Gratuitos Hoje ({freeEvents.length} eventos)</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2 text-black">Card:</h3>
                  <img
                    src={buildListCardUrl('Rolês GRATUITOS em Salvador', `${freeEvents.length} eventos`)}
                    alt="Free Events Card"
                    className="w-full rounded-lg shadow-md"
                  />
                  <a
                    href={buildListCardUrl('Rolês GRATUITOS em Salvador', `${freeEvents.length} eventos`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline mt-2 block"
                  >
                    Abrir em nova aba
                  </a>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-black">Copy:</h3>
                  <pre className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap text-sm text-black border border-gray-300">
                    {freeEventsListCopy(freeEvents)}
                  </pre>
                  <CopyButton text={freeEventsListCopy(freeEvents)} />
                </div>
              </div>
            </div>
          )}

          {/* Instagram Stories Section */}
          <div className="mt-16 pt-8 border-t-4 border-purple-500">
            <h2 className="text-3xl font-bold mb-6 text-purple-600">📱 Instagram Stories (Formato Vertical)</h2>
            <p className="text-gray-700 mb-8">
              Stories verticais (1080x1920) com eventos listados diretamente na arte gráfica
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Story: Destaque */}
              {highlightEvent && (
                <div className="bg-white rounded-lg shadow-lg p-4 border border-purple-200">
                  <h3 className="font-bold mb-3 text-purple-700">⭐ Destaque do Dia</h3>
                  <img
                    src={buildStoryUrl('highlight', [highlightEvent])}
                    alt="Highlight Story"
                    className="w-full rounded-lg shadow-md"
                    style={{ aspectRatio: '9/16' }}
                  />
                  <a
                    href={buildStoryUrl('highlight', [highlightEvent])}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-purple-600 hover:underline mt-2 block"
                  >
                    Abrir Story
                  </a>
                </div>
              )}

              {/* Story: Hoje */}
              {todayEvents.length > 0 && (
                <div className="bg-white rounded-lg shadow-lg p-4 border border-blue-200">
                  <h3 className="font-bold mb-3 text-blue-700">🎉 Hoje ({todayEvents.length})</h3>
                  <img
                    src={buildStoryUrl('today', todayEvents)}
                    alt="Today Story"
                    className="w-full rounded-lg shadow-md"
                    style={{ aspectRatio: '9/16' }}
                  />
                  <a
                    href={buildStoryUrl('today', todayEvents)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline mt-2 block"
                  >
                    Abrir Story
                  </a>
                </div>
              )}

              {/* Story: Fim de Semana */}
              {weekendEvents.length > 0 && (
                <div className="bg-white rounded-lg shadow-lg p-4 border border-pink-200">
                  <h3 className="font-bold mb-3 text-pink-700">🎊 Fim de Semana ({weekendEvents.length})</h3>
                  <img
                    src={buildStoryUrl('weekend', weekendEvents)}
                    alt="Weekend Story"
                    className="w-full rounded-lg shadow-md"
                    style={{ aspectRatio: '9/16' }}
                  />
                  <a
                    href={buildStoryUrl('weekend', weekendEvents)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-pink-600 hover:underline mt-2 block"
                  >
                    Abrir Story
                  </a>
                </div>
              )}

              {/* Story: Gratuitos */}
              {freeEvents.length > 0 && (
                <div className="bg-white rounded-lg shadow-lg p-4 border border-green-200">
                  <h3 className="font-bold mb-3 text-green-700">💚 Gratuitos ({freeEvents.length})</h3>
                  <img
                    src={buildStoryUrl('free', freeEvents)}
                    alt="Free Events Story"
                    className="w-full rounded-lg shadow-md"
                    style={{ aspectRatio: '9/16' }}
                  />
                  <a
                    href={buildStoryUrl('free', freeEvents)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-green-600 hover:underline mt-2 block"
                  >
                    Abrir Story
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ContentPage() {
  return (
    <Suspense fallback={<div className="p-8">Carregando...</div>}>
      <ContentPreview />
    </Suspense>
  );
}
