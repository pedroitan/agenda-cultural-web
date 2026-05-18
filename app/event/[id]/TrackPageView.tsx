"use client";

import { useEffect } from "react";

export default function TrackPageView({ eventId }: { eventId: string }) {
  useEffect(() => {
    const key = `ev_${eventId}`;
    try {
      if (localStorage.getItem(key)) return;
      fetch(`/api/events/${eventId}/view`, { method: "POST" })
        .then((res) => {
          if (res.ok) localStorage.setItem(key, "1");
        })
        .catch(() => {});
    } catch {}
  }, [eventId]);

  return null;
}