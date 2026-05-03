"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { ExternalLink, X } from "lucide-react";

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
};

type AdBannerProps = {
  type?: "banner" | "sidebar" | "featured";
  position?: string;
  className?: string;
};

export default function AdBanner({ type = "banner", position, className = "" }: AdBannerProps) {
  const [ad, setAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetchAd();
  }, [type, position]);

  const fetchAd = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];

      let query = supabase
        .from("ads")
        .select("*")
        .eq("is_active", true)
        .eq("status", "active")
        .eq("ad_type", type)
        .lte("start_date", today)
        .gte("end_date", today)
        .order("priority", { ascending: false })
        .limit(1);

      if (position) {
        query = query.eq("position", position);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching ad:", error);
      } else if (data && data.length > 0) {
        setAd(data[0]);
        
        // Incrementar impressões
        await supabase.rpc("increment_ad_impression", { ad_id: data[0].id });
      }
    } catch (error) {
      console.error("Error fetching ad:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = async () => {
    if (!ad) return;

    console.log("Ad clicked, ad_id:", ad.id);

    try {
      // Incrementar cliques
      const response = await fetch("/api/ad-click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ad_id: ad.id }),
      });

      const data = await response.json();
      console.log("Click tracking response:", data);

      if (!response.ok) {
        console.error("Click tracking failed:", data);
      }

      // Redirecionar para o destino
      window.open(ad.target_url, "_blank");
    } catch (error) {
      console.error("Error tracking ad click:", error);
      // Redirecionar mesmo se houver erro no tracking
      window.open(ad.target_url, "_blank");
    }
  };

  if (dismissed || loading || !ad) return null;

  if (type === "banner") {
    return (
      <div className={`relative bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl overflow-hidden ${className}`}>
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-2 right-2 text-white/70 hover:text-white p-1"
        >
          <X size={16} />
        </button>
        <div
          onClick={handleClick}
          className="cursor-pointer p-6 flex items-center gap-4"
        >
          {ad.image_url && (
            <img
              src={ad.image_url}
              alt={ad.title}
              className="w-20 h-20 object-cover rounded-lg"
            />
          )}
          <div className="flex-1 text-white">
            <h3 className="font-bold text-lg mb-1">{ad.title}</h3>
            {ad.description && (
              <p className="text-white/90 text-sm">{ad.description}</p>
            )}
            <div className="flex items-center gap-1 text-white/70 text-xs mt-1">
              <ExternalLink size={12} />
              <span>Anúncio</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === "sidebar") {
    return (
      <div className={`relative bg-white rounded-xl border border-gray-200 overflow-hidden ${className}`}>
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 p-1 z-10"
        >
          <X size={16} />
        </button>
        <div onClick={handleClick} className="cursor-pointer">
          {ad.image_url && (
            <img
              src={ad.image_url}
              alt={ad.title}
              className="w-full h-32 object-cover"
            />
          )}
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 mb-1">{ad.title}</h3>
            {ad.description && (
              <p className="text-gray-600 text-sm">{ad.description}</p>
            )}
            <div className="flex items-center gap-1 text-violet-600 text-xs mt-2">
              <ExternalLink size={12} />
              <span>Saiba mais</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
