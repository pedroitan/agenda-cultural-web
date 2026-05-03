'use client';

import { useState, useEffect } from 'react';
import { Calendar, MapPin, Tag, DollarSign, Link2, Mail, FileText, CheckCircle2, XCircle } from 'lucide-react';

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

  if (loading) return <div className="text-gray-500 py-4">Carregando...</div>;
  if (error) return <div className="text-red-500 py-4">{error}</div>;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Eventos Pendentes de Aprovação</h2>
        {events.length > 0 && (
          <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-2.5 py-1 rounded-full">
            {events.length} pendente{events.length > 1 ? 's' : ''}
          </span>
        )}
      </div>
      {events.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center text-gray-500">
          Nenhum evento pendente de aprovação
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <div key={event.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div className="border-l-4 border-yellow-400 p-5">
                <div className="flex gap-4">
                  {event.image_url && (
                    <img
                      src={event.image_url}
                      alt={event.title}
                      className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-gray-900 mb-2 leading-tight">{event.title}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm text-gray-600">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-gray-400 flex-shrink-0" />
                        {formatDate(event.start_datetime)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin size={13} className="text-gray-400 flex-shrink-0" />
                        {event.venue_name || '—'}
                      </span>
                      {event.category && (
                        <span className="flex items-center gap-1.5">
                          <Tag size={13} className="text-gray-400 flex-shrink-0" />
                          {event.category}
                        </span>
                      )}
                      <span className="flex items-center gap-1.5">
                        <DollarSign size={13} className="text-gray-400 flex-shrink-0" />
                        {event.is_free ? 'Gratuito' : event.price_text || 'Pago'}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Mail size={13} className="text-gray-400 flex-shrink-0" />
                        {event.contact_email}
                      </span>
                      {event.url && (
                        <a
                          href={event.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-violet-600 hover:text-violet-700 truncate"
                        >
                          <Link2 size={13} className="flex-shrink-0" />
                          <span className="truncate">{event.url}</span>
                        </a>
                      )}
                    </div>
                    {event.description && (
                      <p className="mt-2 text-sm text-gray-500 flex items-start gap-1.5">
                        <FileText size={13} className="text-gray-400 flex-shrink-0 mt-0.5" />
                        {event.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => handleApprove(event.id)}
                    className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <CheckCircle2 size={16} />
                    Aprovar
                  </button>
                  <button
                    onClick={() => handleReject(event.id)}
                    className="flex items-center gap-1.5 bg-white hover:bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <XCircle size={16} />
                    Rejeitar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
