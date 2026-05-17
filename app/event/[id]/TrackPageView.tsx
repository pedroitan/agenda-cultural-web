"use client";

import { useEffect } from "react";

export default function TrackPageView({ eventId }: { eventId: string }) {
  useEffect(() => {
    // Check if user already viewed this event (cookie-based)
    const hasViewed = document.cookie.includes(`viewed_${eventId}=1`);

    if (!hasViewed) {
      // Increment view count via API
      fetch(`/api/events/${eventId}/view`, { method: "POST" })
        .then(() => {
          // Set cookie to prevent duplicate counting (expires in 1 hour)
          document.cookie = `viewed_${eventId}=1; max-age=86400; path=/`;
        })
        .catch(console.error);
    }
  }, [eventId]);

  return null;
}
