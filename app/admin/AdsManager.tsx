"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Plus, Edit, Trash2, Eye, MousePointer2, Calendar, ExternalLink, Check, X, RefreshCw } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Ad = {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  target_url: string;
  ad_type: string;
  position: string | null;
  priority: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  impressions: number;
  clicks: number;
  advertiser_name: string;
  advertiser_email: string | null;
  advertiser_phone: string | null;
  status: string;
  rejection_reason: string | null;
  created_at: string;
};

export default function AdsManager() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "active" | "paused" | "expired">("all");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image_url: "",
    target_url: "",
    ad_type: "banner" as const,
    position: "",
    priority: 0,
    start_date: "",
    end_date: "",
    advertiser_name: "",
    advertiser_email: "",
    advertiser_phone: "",
  });

  useEffect(() => {
    fetchAds();
    const interval = setInterval(fetchAds, 30000);
    return () => clearInterval(interval);
  }, [filter]);

  const fetchAds = async () => {
    setLoading(true);
    let query = supabase.from("ads").select("*").order("created_at", { ascending: false });

    if (filter !== "all") {
      query = query.eq("status", filter);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching ads:", error);
    } else {
      setAds(data || []);
    }
    setLoading(false);
  };

  const handleApprove = async (adId: string) => {
    const { error } = await supabase
      .from("ads")
      .update({ status: "active", is_active: true, reviewed_at: new Date().toISOString() })
      .eq("id", adId);

    if (error) {
      console.error("Error approving ad:", error);
      alert("Erro ao aprovar anúncio");
    } else {
      fetchAds();
    }
  };

  const handleReject = async (adId: string, reason: string) => {
    const { error } = await supabase
      .from("ads")
      .update({ status: "paused", rejection_reason: reason, is_active: false, reviewed_at: new Date().toISOString() })
      .eq("id", adId);

    if (error) {
      console.error("Error rejecting ad:", error);
      alert("Erro ao rejeitar anúncio");
    } else {
      fetchAds();
    }
  };

  const handleDelete = async (adId: string) => {
    if (!confirm("Tem certeza que deseja excluir este anúncio?")) return;

    const { error } = await supabase.from("ads").delete().eq("id", adId);

    if (error) {
      console.error("Error deleting ad:", error);
      alert("Erro ao excluir anúncio");
    } else {
      fetchAds();
    }
  };

  const handleSave = async () => {
    if (!formData.title || !formData.image_url || !formData.target_url || !formData.start_date || !formData.end_date || !formData.advertiser_name) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    const { error } = editingAd
      ? await supabase.from("ads").update(formData).eq("id", editingAd.id)
      : await supabase.from("ads").insert({
          ...formData,
          status: "pending",
          is_active: false,
          impressions: 0,
          clicks: 0,
        });

    if (error) {
      console.error("Error saving ad:", error);
      alert("Erro ao salvar anúncio");
    } else {
      setShowForm(false);
      setEditingAd(null);
      setFormData({
        title: "",
        description: "",
        image_url: "",
        target_url: "",
        ad_type: "banner",
        position: "",
        priority: 0,
        start_date: "",
        end_date: "",
        advertiser_name: "",
        advertiser_email: "",
        advertiser_phone: "",
      });
      fetchAds();
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingAd(null);
    setFormData({
      title: "",
      description: "",
      image_url: "",
      target_url: "",
      ad_type: "banner",
      position: "",
      priority: 0,
      start_date: "",
      end_date: "",
      advertiser_name: "",
      advertiser_email: "",
      advertiser_phone: "",
    });
  };

  const handleEdit = (ad: Ad) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title,
      description: ad.description || "",
      image_url: ad.image_url,
      target_url: ad.target_url,
      ad_type: ad.ad_type as any,
      position: ad.position || "",
      priority: ad.priority,
      start_date: ad.start_date.split("T")[0],
      end_date: ad.end_date.split("T")[0],
      advertiser_name: ad.advertiser_name,
      advertiser_email: ad.advertiser_email || "",
      advertiser_phone: ad.advertiser_phone || "",
    });
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("pt-BR");
  };

  const calculateCTR = (impressions: number, clicks: number) => {
    if (impressions === 0) return 0;
    return ((clicks / impressions) * 100).toFixed(2);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-gray-900">Gerenciar Anúncios</h2>
          <button
            onClick={fetchAds}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="Atualizar"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
        <div className="flex gap-2">
          {(["all", "pending", "active", "paused", "expired"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === status
                  ? "bg-violet-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {status === "all" && "Todos"}
              {status === "pending" && "Pendentes"}
              {status === "active" && "Ativos"}
              {status === "paused" && "Pausados"}
              {status === "expired" && "Expirados"}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => setShowForm(true)}
        className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
      >
        <Plus size={18} />
        <span>Novo Anúncio</span>
      </button>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Carregando...</div>
      ) : ads.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Nenhum anúncio encontrado.
        </div>
      ) : (
        <div className="space-y-4">
          {ads.map((ad) => (
            <div key={ad.id} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-start gap-4">
                {/* Imagem */}
                <img
                  src={ad.image_url}
                  alt={ad.title}
                  className="w-32 h-24 object-cover rounded-lg"
                />

                {/* Conteúdo */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{ad.title}</h3>
                      {ad.description && (
                        <p className="text-gray-600 text-sm">{ad.description}</p>
                      )}
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        ad.status === "active"
                          ? "bg-green-100 text-green-700"
                          : ad.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : ad.status === "paused"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {ad.status === "active" && "Ativo"}
                      {ad.status === "pending" && "Pendente"}
                      {ad.status === "paused" && "Pausado"}
                      {ad.status === "expired" && "Expirado"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
                    <div className="text-gray-600">
                      <span className="font-medium">Tipo:</span> {ad.ad_type}
                    </div>
                    <div className="text-gray-600">
                      <span className="font-medium">Posição:</span> {ad.position || "N/A"}
                    </div>
                    <div className="text-gray-600">
                      <span className="font-medium">Prioridade:</span> {ad.priority}
                    </div>
                    <div className="text-gray-600">
                      <span className="font-medium">Período:</span> {formatDate(ad.start_date)} - {formatDate(ad.end_date)}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm mb-3">
                    <div className="flex items-center gap-1 text-gray-600">
                      <Eye size={16} />
                      <span>{ad.impressions} impressões</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <MousePointer2 size={16} />
                      <span>{ad.clicks} cliques</span>
                    </div>
                    <div className="text-gray-600">
                      <span className="font-medium">CTR:</span> {calculateCTR(ad.impressions, ad.clicks)}%
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm mb-3">
                    <a
                      href={ad.target_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-violet-600 hover:text-violet-700"
                    >
                      <ExternalLink size={14} />
                      <span>Ver destino</span>
                    </a>
                  </div>

                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Anunciante:</span> {ad.advertiser_name}
                    {ad.advertiser_email && ` • ${ad.advertiser_email}`}
                  </div>

                  {ad.rejection_reason && (
                    <div className="mt-2 bg-red-50 border border-red-200 rounded-lg p-2 text-sm text-red-700">
                      <strong>Motivo da rejeição:</strong> {ad.rejection_reason}
                    </div>
                  )}
                </div>
              </div>

              {/* Ações */}
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
                {ad.status === "pending" && (
                  <>
                    <button
                      onClick={() => handleApprove(ad.id)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      <Check size={16} />
                      <span>Aprovar</span>
                    </button>
                    <button
                      onClick={() => {
                        const reason = prompt("Motivo da rejeição:");
                        if (reason) handleReject(ad.id, reason);
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                    >
                      <X size={16} />
                      <span>Rejeitar</span>
                    </button>
                  </>
                )}
                <button
                  onClick={() => handleEdit(ad)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                >
                  <Edit size={16} />
                  <span>Editar</span>
                </button>
                <button
                  onClick={() => handleDelete(ad.id)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  <Trash2 size={16} />
                  <span>Excluir</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {(showForm || editingAd) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {editingAd ? "Editar Anúncio" : "Novo Anúncio"}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 min-h-[80px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL da Imagem *
                </label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL de Destino *
                </label>
                <input
                  type="url"
                  value={formData.target_url}
                  onChange={(e) => setFormData({ ...formData, target_url: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Anúncio *
                  </label>
                  <select
                    value={formData.ad_type}
                    onChange={(e) => setFormData({ ...formData, ad_type: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                  >
                    <option value="banner">Banner</option>
                    <option value="sidebar">Sidebar</option>
                    <option value="featured">Featured</option>
                    <option value="sponsored">Sponsored</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Posição
                  </label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                    placeholder="top, sidebar, etc."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prioridade (0-10)
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Início *
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Término *
                  </label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Anunciante *
                </label>
                <input
                  type="text"
                  value={formData.advertiser_name}
                  onChange={(e) => setFormData({ ...formData, advertiser_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email do Anunciante
                  </label>
                  <input
                    type="email"
                    value={formData.advertiser_email}
                    onChange={(e) => setFormData({ ...formData, advertiser_email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone do Anunciante
                  </label>
                  <input
                    type="tel"
                    value={formData.advertiser_phone}
                    onChange={(e) => setFormData({ ...formData, advertiser_phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={handleSave}
                className="flex-1 bg-violet-600 text-white py-2 rounded-lg hover:bg-violet-700 transition-colors"
              >
                {editingAd ? "Salvar" : "Criar"}
              </button>
              <button
                onClick={handleCloseForm}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
