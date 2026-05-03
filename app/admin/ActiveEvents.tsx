'use client';

import { useState, useEffect } from 'react';

type ActiveEvent = {
  id: string;
  title: string;
  start_datetime: string;
  venue_name: string;
  category: string | null;
  is_free: boolean;
  price_text: string | null;
  url: string;
  image_url: string | null;
  contact_email: string;
  created_at: string;
  source: string;
};

export default function ActiveEvents() {
  const [events, setEvents] = useState<ActiveEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAll, setShowAll] = useState(false);
  const limit = showAll ? 100 : 10;

  const loadEvents = async () => {
    try {
      const res = await fetch(`/api/events?limit=${limit}`);
      const data = await res.json();
      setEvents(data.events || []);
    } catch (err) {
      setError('Erro ao carregar eventos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [limit]);

  const handleDeactivate = async (id: string) => {
    if (!confirm('Tem certeza que deseja desativar este evento?')) return;
    
    try {
      const res = await fetch(`/api/admin/events/${id}/deactivate`, { method: 'POST' });
      if (res.ok) {
        setEvents(events.filter(e => e.id !== id));
      }
    } catch (err) {
      alert('Erro ao desativar evento');
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Bahia',
    });
  };

  if (loading) return <div className="text-gray-400">Carregando...</div>;
  if (error) return <div className="text-red-400">{error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">📋 Eventos Aprovados</h2>
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-sm text-blue-400 hover:text-blue-300"
        >
          {showAll ? 'Mostrar menos' : 'Mostrar todos'}
        </button>
      </div>
      {events.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-6 text-center text-gray-400">
          Nenhum evento aprovado
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <div key={event.id} className="bg-gray-800 rounded-lg p-4 border-l-4 border-green-500">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{event.title}</h3>
                  <div className="text-sm text-gray-400 space-y-0.5">
                    <p>📅 {formatDate(event.start_datetime)}</p>
                    <p>📍 {event.venue_name}</p>
                    {event.category && <p>🏷️ {event.category}</p>}
                    <p className="text-xs">📧 {event.contact_email}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeactivate(event.id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors ml-4"
                >
                  Desativar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
