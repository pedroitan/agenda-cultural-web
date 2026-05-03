"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Check, X, AlertTriangle, Calendar, MapPin, User, Mail, ExternalLink } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Submission = {
  id: string;
  title: string;
  description: string | null;
  start_datetime: string;
  end_datetime: string | null;
  venue_name: string | null;
  venue_address: string | null;
  image_url: string | null;
  category: string | null;
  price_text: string | null;
  is_free: boolean;
  url: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  status: string;
  moderation_notes: string | null;
  flagged_reason: string | null;
  ai_moderation_score: number | null;
  ai_flagged_reasons: any;
  created_at: string;
  reviewed_at: string | null;
};

export default function EventSubmissions() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"pending" | "flagged" | "approved" | "rejected">("pending");

  useEffect(() => {
    fetchSubmissions();
  }, [filter]);

  const fetchSubmissions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("event_submissions")
      .select("*")
      .eq("status", filter)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching submissions:", error);
    } else {
      setSubmissions(data || []);
    }
    setLoading(false);
  };

  const handleApprove = async (submissionId: string) => {
    // Em produção, isso moveria o evento para a tabela events
    const { error } = await supabase
      .from("event_submissions")
      .update({ status: "approved", reviewed_at: new Date().toISOString() })
      .eq("id", submissionId);

    if (error) {
      console.error("Error approving submission:", error);
      alert("Erro ao aprovar submissão");
    } else {
      fetchSubmissions();
    }
  };

  const handleReject = async (submissionId: string, reason: string) => {
    const { error } = await supabase
      .from("event_submissions")
      .update({ 
        status: "rejected", 
        moderation_notes: reason,
        reviewed_at: new Date().toISOString() 
      })
      .eq("id", submissionId);

    if (error) {
      console.error("Error rejecting submission:", error);
      alert("Erro ao rejeitar submissão");
    } else {
      fetchSubmissions();
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Submissões de Eventos</h2>
        <div className="flex gap-2">
          {(["pending", "flagged", "approved", "rejected"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === status
                  ? "bg-violet-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {status === "pending" && "Pendentes"}
              {status === "flagged" && "Marcados"}
              {status === "approved" && "Aprovados"}
              {status === "rejected" && "Rejeitados"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Carregando...</div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Nenhuma submissão encontrada.
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => (
            <div
              key={submission.id}
              className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{submission.title}</h3>
                    {submission.ai_moderation_score && submission.ai_moderation_score > 50 && (
                      <span className="flex items-center gap-1 text-amber-600 text-sm bg-amber-50 px-2 py-1 rounded-full">
                        <AlertTriangle size={14} />
                        Score: {submission.ai_moderation_score}
                      </span>
                    )}
                  </div>

                  {submission.description && (
                    <p className="text-gray-600 mb-3">{submission.description}</p>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar size={16} />
                      <span>{formatDate(submission.start_datetime)}</span>
                    </div>
                    {submission.venue_name && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin size={16} />
                        <span>{submission.venue_name}</span>
                      </div>
                    )}
                    {submission.category && (
                      <div className="text-gray-600">
                        <span className="bg-violet-100 text-violet-700 px-2 py-1 rounded-full text-xs">
                          {submission.category}
                        </span>
                      </div>
                    )}
                    {submission.price_text && (
                      <div className="text-gray-600">
                        {submission.is_free ? "Grátis" : submission.price_text}
                      </div>
                    )}
                  </div>

                  {submission.url && (
                    <a
                      href={submission.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-violet-600 hover:text-violet-700 text-sm mt-2"
                    >
                      <ExternalLink size={14} />
                      <span>Ver evento original</span>
                    </a>
                  )}
                </div>

                {submission.image_url && (
                  <img
                    src={submission.image_url}
                    alt={submission.title}
                    className="w-32 h-24 object-cover rounded-lg ml-4"
                  />
                )}
              </div>

              {/* Informações de Contato */}
              <div className="border-t border-gray-200 pt-4 mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <User size={16} />
                  Informações de Contato
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <span>{submission.contact_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail size={16} />
                    <span>{submission.contact_email}</span>
                  </div>
                  {submission.contact_phone && (
                    <div className="text-gray-600">{submission.contact_phone}</div>
                  )}
                </div>
              </div>

              {/* Motivos de Flag */}
              {(submission.flagged_reason || submission.ai_flagged_reasons) && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-amber-800">
                    <strong>Motivo do flag:</strong> {submission.flagged_reason || "Detecção automática"}
                  </p>
                  {submission.ai_flagged_reasons && (
                    <ul className="text-sm text-amber-700 mt-1 list-disc list-inside">
                      {(Array.isArray(submission.ai_flagged_reasons) 
                        ? submission.ai_flagged_reasons 
                        : []).map((reason: string, i: number) => (
                        <li key={i}>{reason}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* Ações */}
              {filter === "pending" || filter === "flagged" ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(submission.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Check size={18} />
                    <span>Aprovar</span>
                  </button>
                  <button
                    onClick={() => {
                      const reason = prompt("Motivo da rejeição:");
                      if (reason) handleReject(submission.id, reason);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <X size={18} />
                    <span>Rejeitar</span>
                  </button>
                </div>
              ) : (
                <div className="text-sm text-gray-500">
                  {filter === "approved" && "Aprovado em " + formatDate(submission.reviewed_at || submission.created_at)}
                  {filter === "rejected" && (
                    <>
                      Rejeitado em {formatDate(submission.reviewed_at || submission.created_at)}
                      {submission.moderation_notes && ` - ${submission.moderation_notes}`}
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
