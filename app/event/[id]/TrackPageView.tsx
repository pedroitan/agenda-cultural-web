"use client";

import { useEffect } from "react";

export default function TrackPageView({ eventId }: { eventId: string }) {
  useEffect(() => {
    // Server-side dedup via httpOnly cookie + bot/prefetch filtering
    fetch(`/api/events/${eventId}/view`, {
      method: "POST",
      credentials: "include",
    }).catch(() => {});
  }, [eventId]);

  return null;
}