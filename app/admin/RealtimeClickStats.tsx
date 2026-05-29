"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type TopEvent = {
  id: string;
  title: string;
  click_count: number;
  source: string;
  url: string | null;
};

export function RealtimeClickCounter({
  initialTotal,
  initialCtaTotal,
}: {
  initialTotal: number;
  initialCtaTotal: number;
}) {
  const [totalClicks, setTotalClicks] = useState(initialTotal);
  const [totalCta, setTotalCta] = useState(initialCtaTotal);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const fetchTotal = async () => {
      try {
        const res = await fetch("/api/click-stats");
        const { total, cta_total } = await res.json();
        if (typeof total === "number") setTotalClicks(total);
        if (typeof cta_total === "number") setTotalCta(cta_total);
      } catch {}
    };

    const channel = supabase
      .channel("click_counter")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "events" },
        () => {
          // Re-fetch accurate total instead of computing delta from old values
          // (Supabase Realtime without REPLICA IDENTITY FULL doesn't send old column values)
          fetchTotal();
        }
      )
      .subscribe((status) => setLive(status === "SUBSCRIBED"));

    return () => { supabase.removeChannel(channel); };
  }, []);

  const liveBadge = (
    <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${live ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}>
      {live ? "● ao vivo" : "○ ..."}
    </span>
  );

  return (
    <>
      <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 shadow-sm">
        <p className="text-white text-sm font-medium mb-2">Cliques em Eventos</p>
        <div className="flex items-center gap-2 mb-1">
          <p className="text-white text-2xl font-bold">{totalClicks}</p>
          {liveBadge}
        </div>
        <p className="text-purple-100 text-xs">Aberturas da página do evento</p>
      </div>
      <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg p-6 shadow-sm">
        <p className="text-white text-sm font-medium mb-2">Cliques CTA Ingresso</p>
        <div className="flex items-center gap-2 mb-1">
          <p className="text-white text-2xl font-bold">{totalCta}</p>
          {liveBadge}
        </div>
        <p className="text-emerald-100 text-xs">Cliques no botão de ingresso</p>
      </div>
    </>
  );
}

export function RealtimeTopClicked({
  initialTop,
}: {
  initialTop: TopEvent[];
}) {
  const [topClicked, setTopClicked] = useState<TopEvent[]>(initialTop);

  useEffect(() => {
    const channel = supabase
      .channel("click_top")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "events" },
        (payload) => {
          const updated = payload.new as TopEvent;
          setTopClicked((prev) => {
            const exists = prev.find((e) => e.id === updated.id);
            const next: TopEvent[] = exists
              ? prev.map((e) => (e.id === updated.id ? { ...e, click_count: updated.click_count } : e))
              : updated.click_count > 0
              ? [...prev, { id: updated.id, title: updated.title, source: updated.source, url: updated.url, click_count: updated.click_count }]
              : prev;
            return next.filter((e) => e.click_count > 0).sort((a, b) => b.click_count - a.click_count).slice(0, 10);
          });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  if (topClicked.length === 0) return null;

  return (
    <>
      <h2 className="text-xl font-semibold mb-4 text-gray-900">Eventos Mais Clicados</h2>
      <div className="bg-white rounded-lg p-6 mb-8 border border-gray-200 shadow-sm">
        <div className="space-y-3">
          {topClicked.map((event, index) => (
            <div key={event.id} className="flex items-center justify-between border-b border-gray-200 pb-3 last:border-0">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-2xl font-bold text-gray-400">#{index + 1}</span>
                <div className="min-w-0 flex-1">
                  <a
                    href={`/r/${event.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium truncate block hover:text-purple-600 transition-colors text-gray-900"
                  >
                    {event.title}
                  </a>
                  <p className="text-sm text-gray-500 capitalize">{event.source}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-purple-600">{event.click_count}</span>
                <span className="text-sm text-gray-500">cliques</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
