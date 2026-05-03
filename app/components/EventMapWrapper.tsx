"use client";

import dynamic from "next/dynamic";

const EventMap = dynamic(() => import("./EventMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-gradient-to-br from-zinc-100 to-zinc-200 rounded-2xl flex items-center justify-center animate-pulse">
      <p className="text-zinc-600 text-sm">Carregando mapa...</p>
    </div>
  ),
});

export default EventMap;
