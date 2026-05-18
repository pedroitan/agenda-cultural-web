"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Plus, Edit, Trash2, MapPin, Clock, ArrowRight, Sparkles } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Tour = {
  id: string;
  title: string;
  curator_name: string;
  curator_bio: string | null;
  description: string | null;
  image_url: string | null;
  is_published: boolean;
  created_at: string;
  city: string;
};

type TourStop = {
  id: string;
  tour_id: string;
  event_id: string;
  horario: string | null;
  duracao_min: number | null;
  deslocamento_proximo_min: number | null;
  modo_deslocamento: string | null;
  order_index: number;
  events: {
    title: string;
  };
};

type Event = {
  id: string;
  title: string;
  start_datetime: string;
  venue_name: string | null;
};

export default function ToursManager() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [stops, setStops] = useState<TourStop[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showStopsModal, setShowStopsModal] = useState(false);
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [generating, setGenerating] = useState(false);
  const [genResult, setGenResult] = useState<{ count: number; events_analyzed: number; nearby_pairs: number } | null>(null);

  const handleGenerate = async () => {
    if (!confirm("Gerar roteiros com IA para o fim de semana? Os roteiros ficarão como rascunho para revisão.")) return;
    setGenerating(true);
    setGenResult(null);
    try {
      const res = await fetch("/api/tours/generate", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setGenResult({ count: data.generated, events_analyzed: data.events_analyzed, nearby_pairs: data.nearby_pairs_found });
        fetchTours();
      } else {
        alert(`Erro: ${data.error}`);
      }
    } catch {
      alert("Erro ao gerar roteiros");
    } finally {
      setGenerating(false);
    }
  };

  const [formData, setFormData] = useState({
    title: "",
    curator_name: "",
    curator_bio: "",
    description: "",
    image_url: "",
    city: process.env.NEXT_PUBLIC_CITY || "salvador",
  });

  useEffect(() => {
    fetchTours();
    fetchEvents();
  }, []);

  const fetchTours = async () => {
    setLoading(true);
    const city = process.env.NEXT_PUBLIC_CITY || "salvador";
    const { data } = await supabase
      .from("tours")
      .select("*")
      .eq("city", city)
      .order("created_at", { ascending: false });
    setTours(data || []);
    setLoading(false);
  };

  const fetchEvents = async () => {
    const { data } = await supabase
      .from("events")
      .select("id, title, start_datetime, venue_name")
      .gt("start_datetime", new Date().toISOString())
      .order("start_datetime", { ascending: true })
      .limit(100);
    setEvents(data || []);
  };

  const fetchStops = async (tourId: string) => {
    const { data } = await supabase
      .from("tour_stops")
      .select("*, events (title)")
      .eq("tour_id", tourId)
      .order("order_index", { ascending: true });
    setStops(data || []);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.curator_name) {
      alert("Preencha título e nome do curador");
      return;
    }

    if (selectedTour) {
      await supabase
        .from("tours")
        .update(formData)
        .eq("id", selectedTour.id);
    } else {
      await supabase.from("tours").insert([formData]);
    }

    handleCloseModal();
    fetchTours();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este roteiro?")) return;
    await supabase.from("tours").delete().eq("id", id);
    fetchTours();
  };

  const togglePublished = async (tour: Tour) => {
    await supabase.from("tours").update({ is_published: !tour.is_published }).eq("id", tour.id);
    fetchTours();
  };

  const handleAddStop = async (eventId: string) => {
    if (!selectedTour) return;
    const nextOrder = stops.length;
    await supabase.from("tour_stops").insert([{
      tour_id: selectedTour.id,
      event_id: eventId,
      order_index: nextOrder,
    }]);
    fetchStops(selectedTour.id);
  };

  const handleDeleteStop = async (stopId: string) => {
    await supabase.from("tour_stops").delete().eq("id", stopId);
    if (selectedTour) fetchStops(selectedTour.id);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTour(null);
    setFormData({ title: "", curator_name: "", curator_bio: "", description: "", image_url: "", city: process.env.NEXT_PUBLIC_CITY || "salvador" });
  };

  const handleEdit = (tour: Tour) => {
    setSelectedTour(tour);
    setFormData({
      title: tour.title,
      curator_name: tour.curator_name,
      curator_bio: tour.curator_bio || "",
      description: tour.description || "",
      image_url: tour.image_url || "",
      city: tour.city,
    });
    setShowModal(true);
  };

  const handleOpenStops = async (tour: Tour) => {
    setSelectedTour(tour);
    await fetchStops(tour.id);
    setShowStopsModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-semibold text-gray-900">Gerenciar Roteiros</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white px-4 py-2 rounded-lg hover:from-violet-700 hover:to-fuchsia-700 transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Sparkles size={16} />
            {generating ? "Gerando..." : "Gerar com IA"}
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Plus size={16} />
            Novo Roteiro
          </button>
        </div>
      </div>

      {genResult && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          ✅ <strong>{genResult.count} roteiros gerados</strong> a partir de {genResult.events_analyzed} eventos
          {genResult.nearby_pairs > 0 && ` · ${genResult.nearby_pairs} pares próximos identificados por GPS`}.
          Revise e publique abaixo.
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 text-gray-500">Carregando...</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {tours.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Nenhum roteiro encontrado</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Título</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Curador</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Status</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Paradas</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-700">Ações</th>
                </tr>
              </thead>
              <tbody>
                {tours.map((tour) => (
                  <tr key={tour.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{tour.title}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{tour.curator_name}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => togglePublished(tour)}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          tour.is_published
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {tour.is_published ? "Publicado" : "Rascunho"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      <button
                        onClick={() => handleOpenStops(tour)}
                        className="text-violet-600 hover:text-violet-700 flex items-center gap-1"
                      >
                        <MapPin size={14} />
                        Ver paradas
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(tour)}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                          title="Editar"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(tour.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                          title="Excluir"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Modal de criação/edição */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {selectedTour ? "Editar Roteiro" : "Novo Roteiro"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Curador</label>
                <input
                  type="text"
                  value={formData.curator_name}
                  onChange={(e) => setFormData({ ...formData, curator_name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio do Curador</label>
                <textarea
                  value={formData.curator_bio}
                  onChange={(e) => setFormData({ ...formData, curator_bio: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL da Imagem</label>
                <input
                  type="text"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleSave}
                className="flex-1 bg-violet-600 text-white py-2 rounded-lg hover:bg-violet-700 transition-colors"
              >
                Salvar
              </button>
              <button
                onClick={handleCloseModal}
                className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de paradas */}
      {showStopsModal && selectedTour && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Paradas: {selectedTour.title}</h3>
              <button onClick={() => setShowStopsModal(false)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Adicionar evento</label>
              <select
                onChange={(e) => e.target.value && handleAddStop(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                defaultValue=""
              >
                <option value="">Selecione um evento...</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.title} - {event.venue_name || "Sem local"}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              {stops.map((stop, index) => (
                <div key={stop.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 text-violet-600 font-medium">
                    <Clock size={16} />
                    {stop.horario || "Horário"}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{stop.events.title}</div>
                    {stop.duracao_min && <div className="text-sm text-gray-500">{stop.duracao_min} min</div>}
                  </div>
                  {index < stops.length - 1 && (
                    <ArrowRight size={16} className="text-gray-400" />
                  )}
                  <button
                    onClick={() => handleDeleteStop(stop.id)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            {stops.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Nenhuma parada adicionada. Selecione um evento acima.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
