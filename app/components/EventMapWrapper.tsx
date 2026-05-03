"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const EventMap = dynamic(() => import("./EventMap"), {
  loading: () => (
    <div className="w-full h-[400px] bg-gradient-to-br from-zinc-100 to-zinc-200 rounded-2xl flex items-center justify-center animate-pulse">
      <div className="flex flex-col items-center gap-2">
        <svg className="w-8 h-8 text-zinc-400 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
        <p className="text-zinc-600 text-sm">Carregando mapa...</p>
      </div>
    </div>
  ),
});

type EventMapProps = {
  events: any[];
  height?: string;
  zoom?: number;
  singleEvent?: boolean;
};

export default function EventMapWrapper({ events, height, zoom, singleEvent }: EventMapProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full h-[400px] bg-gradient-to-br from-zinc-100 to-zinc-200 rounded-2xl flex items-center justify-center animate-pulse">
        <div className="flex flex-col items-center gap-2">
          <svg className="w-8 h-8 text-zinc-400 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          <p className="text-zinc-600 text-sm">Carregando mapa...</p>
        </div>
      </div>
    );
  }

  return <EventMap events={events} height={height} zoom={zoom} singleEvent={singleEvent} />;
}
