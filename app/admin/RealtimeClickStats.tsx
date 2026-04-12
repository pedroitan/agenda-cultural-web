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
}: {
  initialTotal: number;
}) {
  const [totalClicks, setTotalClicks] = useState(initialTotal);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const channel = supabase
      .channel("click_counter")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "events" },
        (payload) => {
          const diff =
            ((payload.new as { click_count: number }).click_count || 0) -
            ((payload.old as { click_count: number }).click_count || 0);
          if (diff !== 0) setTotalClicks((prev) => prev + diff);
        }
      )
      .subscribe((status) => setLive(status === "SUBSCRIBED"));

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <>
      <div className="flex items-center gap-2 mb-1">
        <p className="text-white text-2xl font-bold">{totalClicks}</p>
        <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${live ? "bg-green-400/20 text-green-300" : "bg-gray-500/20 text-gray-400"}`}>
          {live ? "● ao vivo" : "○ ..."}
        </span>
      </div>
      <p className="text-purple-100 text-xs">Total de cliques em eventos</p>
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
      <h2 className="text-xl font-semibold mb-4">Eventos Mais Clicados</h2>
      <div className="bg-gray-800 rounded-lg p-6 mb-8">
        <div className="space-y-3">
          {topClicked.map((event, index) => (
            <div key={event.id} className="flex items-center justify-between border-b border-gray-700 pb-3 last:border-0">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-2xl font-bold text-gray-600">#{index + 1}</span>
                <div className="min-w-0 flex-1">
                  <a
                    href={event.url?.split("|")[0]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium truncate block hover:text-yellow-300 transition-colors"
                  >
                    {event.title}
                  </a>
                  <p className="text-sm text-gray-400 capitalize">{event.source}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-yellow-400">{event.click_count}</span>
                <span className="text-sm text-gray-400">cliques</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
