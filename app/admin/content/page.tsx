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
import { StoriesManager } from "./StoriesManager";

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

          {/* Stories Manager */}
          <div className="mt-16 pt-8 border-t-4 border-purple-500">
            <StoriesManager />
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
