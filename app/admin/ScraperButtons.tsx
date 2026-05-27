"use client";

import { useState } from "react";

type ScraperType = 'sympla' | 'elcabong' | 'salvadordabahia' | 'instagram' | 'all';

const SCRAPERS = [
  { id: 'sympla' as const, name: 'Sympla', color: 'bg-blue-600', hoverColor: 'hover:bg-blue-700' },
  { id: 'elcabong' as const, name: 'El Cabong', color: 'bg-purple-600', hoverColor: 'hover:bg-purple-700' },
  { id: 'salvadordabahia' as const, name: 'Salvador da Bahia', color: 'bg-green-600', hoverColor: 'hover:bg-green-700' },
  { id: 'instagram' as const, name: 'Instagram', color: 'bg-pink-600', hoverColor: 'hover:bg-pink-700' },
];

export default function ScraperButtons() {
  const [statuses, setStatuses] = useState<Record<ScraperType, 'idle' | 'loading' | 'success' | 'error'>>({
    sympla: 'idle',
    elcabong: 'idle',
    salvadordabahia: 'idle',
    instagram: 'idle',
    all: 'idle',
  });
  const [messages, setMessages] = useState<Record<ScraperType, string>>({
    sympla: '',
    elcabong: '',
    salvadordabahia: '',
    instagram: '',
    all: '',
  });

  async function runScraper(scraper: ScraperType) {
    setStatuses(prev => ({ ...prev, [scraper]: 'loading' }));
    setMessages(prev => ({ ...prev, [scraper]: '' }));

    try {
      const endpoint = scraper === 'all' 
        ? '/api/run-scraper/all'
        : `/api/run-scraper/${scraper}`;
      
      const res = await fetch(endpoint, { method: "POST" });
      const data = await res.json();
      
      if (res.ok) {
        setStatuses(prev => ({ ...prev, [scraper]: 'success' }));
        setMessages(prev => ({ ...prev, [scraper]: data.message || 'Scraper iniciado!' }));
      } else {
        setStatuses(prev => ({ ...prev, [scraper]: 'error' }));
        setMessages(prev => ({ ...prev, [scraper]: data.error || 'Erro desconhecido' }));
      }
    } catch {
      setStatuses(prev => ({ ...prev, [scraper]: 'error' }));
      setMessages(prev => ({ ...prev, [scraper]: 'Falha na requisição' }));
    }
  }

  async function runAllScrapers() {
    await runScraper('all');
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        {SCRAPERS.map((scraper) => (
          <div key={scraper.id} className="flex items-center gap-2">
            <button
              onClick={() => runScraper(scraper.id)}
              disabled={statuses[scraper.id] === 'loading'}
              className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors
                ${statuses[scraper.id] === 'loading'
                  ? 'cursor-not-allowed bg-gray-600'
                  : statuses[scraper.id] === 'success'
                  ? 'bg-green-600 hover:bg-green-700'
                  : statuses[scraper.id] === 'error'
                  ? 'bg-red-600 hover:bg-red-700'
                  : `${scraper.color} ${scraper.hoverColor}`
                }`}
            >
              {statuses[scraper.id] === 'loading' ? '⏳' : '▶'} {scraper.name}
            </button>
            {messages[scraper.id] && (
              <span
                className={`text-sm ${statuses[scraper.id] === 'success' ? 'text-green-400' : 'text-red-400'}`}
              >
                {messages[scraper.id]}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 pt-2 border-t border-zinc-200">
        <button
          onClick={runAllScrapers}
          disabled={statuses.all === 'loading'}
          className={`rounded-lg px-6 py-2 text-sm font-medium text-white transition-colors
            ${statuses.all === 'loading'
              ? 'cursor-not-allowed bg-gray-600'
              : statuses.all === 'success'
              ? 'bg-green-600 hover:bg-green-700'
              : statuses.all === 'error'
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
        >
          {statuses.all === 'loading' ? '⏳ Iniciando todos...' : '▶ Rodar Todos'}
        </button>
        {messages.all && (
          <span
            className={`text-sm ${statuses.all === 'success' ? 'text-green-400' : 'text-red-400'}`}
          >
            {messages.all}
          </span>
        )}
      </div>
    </div>
  );
}
