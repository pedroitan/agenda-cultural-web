'use client';

import { useState, useEffect } from 'react';
import { Calendar, MapPin, Tag, XCircle, ChevronDown, ChevronUp } from 'lucide-react';

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

  if (loading) return <div className="text-gray-500 py-4">Carregando eventos...</div>;
  if (error) return <div className="text-red-500 py-4">{error}</div>;

  const sourceLabel = (source: string) => {
    if (source === 'instagram') return 'Instagram';
    if (source === 'manual_submission') return 'Submissão';
    return source.charAt(0).toUpperCase() + source.slice(1);
  };

  const sourceColor = (source: string) => {
    if (source === 'sympla') return 'bg-blue-100 text-blue-700';
    if (source === 'elcabong') return 'bg-green-100 text-green-700';
    if (source === 'instagram') return 'bg-pink-100 text-pink-700';
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Eventos Aprovados</h2>
        <button
          onClick={() => setShowAll(!showAll)}
          className="flex items-center gap-1 text-sm text-violet-600 hover:text-violet-700 font-medium"
        >
          {showAll ? <><ChevronUp size={16} /> Mostrar menos</> : <><ChevronDown size={16} /> Mostrar todos</>}
        </button>
      </div>
      {events.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center text-gray-500">
          Nenhum evento aprovado
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Evento</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Data</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Local</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Fonte</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {events.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900 text-sm leading-tight">{event.title}</p>
                      {event.category && (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                          <Tag size={11} />{event.category}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="flex items-center gap-1.5 text-sm text-gray-600">
                      <Calendar size={14} className="text-gray-400" />
                      {formatDate(event.start_datetime)}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="flex items-center gap-1.5 text-sm text-gray-600">
                      <MapPin size={14} className="text-gray-400" />
                      {event.venue_name || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${sourceColor(event.source)}`}>
                      {sourceLabel(event.source)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDeactivate(event.id)}
                      className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
                    >
                      <XCircle size={16} />
                      <span className="hidden sm:inline">Desativar</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
