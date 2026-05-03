'use client';

import { useState, useEffect } from 'react';

type PendingEvent = {
  id: string;
  title: string;
  start_datetime: string;
  venue_name: string;
  category: string | null;
  is_free: boolean;
  price_text: string | null;
  url: string;
  image_url: string | null;
  description: string | null;
  contact_email: string;
  created_at: string;
};

export default function PendingEvents() {
  const [events, setEvents] = useState<PendingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadEvents = async () => {
    try {
      const res = await fetch('/api/admin/events/pending');
      const data = await res.json();
      setEvents(data.events || []);
    } catch (err) {
      setError('Erro ao carregar eventos pendentes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/events/${id}/approve`, { method: 'POST' });
      if (res.ok) {
        setEvents(events.filter(e => e.id !== id));
      }
    } catch (err) {
      alert('Erro ao aprovar evento');
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm('Tem certeza que deseja rejeitar este evento?')) return;
    
    try {
      const res = await fetch(`/api/admin/events/${id}/reject`, { method: 'POST' });
      if (res.ok) {
        setEvents(events.filter(e => e.id !== id));
      }
    } catch (err) {
      alert('Erro ao rejeitar evento');
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
      <h2 className="text-xl font-semibold mb-4">📋 Eventos Pendentes de Aprovação</h2>
      {events.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-6 text-center text-gray-400">
          Nenhum evento pendente de aprovação
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.id} className="bg-gray-800 rounded-lg p-6 border-l-4 border-yellow-500">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">{event.title}</h3>
                  <div className="space-y-1 text-sm text-gray-400">
                    <p>📅 {formatDate(event.start_datetime)}</p>
                    <p>📍 {event.venue_name}</p>
                    {event.category && <p>🏷️ {event.category}</p>}
                    <p>💰 {event.is_free ? 'Gratuito' : event.price_text || 'Pago'}</p>
                    {event.url && (
                      <p>
                        🔗 <a href={event.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                          {event.url}
                        </a>
                      </p>
                    )}
                    <p>📧 {event.contact_email}</p>
                    {event.description && (
                      <p className="mt-2 text-gray-300">📝 {event.description}</p>
                    )}
                  </div>
                </div>
                {event.image_url && (
                  <img
                    src={event.image_url}
                    alt={event.title}
                    className="w-32 h-32 object-cover rounded-lg ml-4"
                  />
                )}
              </div>
              <div className="flex gap-3 mt-4 pt-4 border-t border-gray-700">
                <button
                  onClick={() => handleApprove(event.id)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  ✓ Aprovar
                </button>
                <button
                  onClick={() => handleReject(event.id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  ✗ Rejeitar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
