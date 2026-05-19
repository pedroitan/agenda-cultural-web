"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.Default.css";

// Marcador SVG customizado (gradiente violeta/fuchsia, combinando com o site)
const createCustomIcon = () => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#a855f7;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#ec4899;stop-opacity:1" />
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#00000066"/>
        </filter>
      </defs>
      <path d="M16 0C7.163 0 0 7.163 0 16c0 11 16 26 16 26s16-15 16-26C32 7.163 24.837 0 16 0z" fill="url(#grad)" filter="url(#shadow)"/>
      <circle cx="16" cy="16" r="5" fill="white" opacity="0.95"/>
    </svg>
  `;
  return L.divIcon({
    html: svg,
    className: "custom-marker",
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -46],
  });
};

// Cluster icon com gradiente roxo
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createClusterCustomIcon = (cluster: any) => {
  const count = cluster.getChildCount();
  const size = count < 10 ? 36 : count < 20 ? 42 : 48;
  return L.divIcon({
    html: `
      <div style="
        width:${size}px;height:${size}px;
        background:linear-gradient(135deg,#9333ea,#c026d3);
        border-radius:50%;
        border:3px solid rgba(255,255,255,0.8);
        display:flex;align-items:center;justify-content:center;
        color:white;font-weight:700;font-size:${count < 10 ? 14 : 12}px;
        box-shadow:0 2px 12px rgba(147,51,234,0.6);
        font-family:system-ui,sans-serif;
      ">${count}</div>
    `,
    className: "",
    iconSize: L.point(size, size, true),
  });
};

type EventLocation = {
  id: string;
  title: string;
  venue_name: string | null;
  latitude: number | null;
  longitude: number | null;
  start_datetime: string;
  image_url: string | null;
};

type EventMapProps = {
  events: EventLocation[];
  height?: string;
  zoom?: number;
  singleEvent?: boolean;
};

function MapCenter({ events, zoom }: { events: EventLocation[]; zoom?: number }) {
  const map = useMap();

  useEffect(() => {
    if (events.length === 0) return;

    const validEvents = events.filter(e => e.latitude && e.longitude);
    if (validEvents.length === 0) return;

    if (validEvents.length === 1) {
      map.setView([validEvents[0].latitude!, validEvents[0].longitude!], zoom || 15);
      return;
    }

    // Fit bounds para múltiplos eventos
    const bounds = L.latLngBounds(
      validEvents.map(e => [e.latitude!, e.longitude!] as [number, number])
    );
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [events, map, zoom]);

  return null;
}

export default function EventMap({ events, height = "500px", zoom, singleEvent = false }: EventMapProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div
        className="w-full bg-gradient-to-br from-zinc-100 to-zinc-200 rounded-2xl flex items-center justify-center animate-pulse"
        style={{ height }}
      >
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

  const rawValid = events.filter(e => e.latitude && e.longitude);

  // Adicionar jitter para eventos com coordenadas idênticas (mesmo local/bairro)
  // para que apareçam como marcadores distintos no mapa
  const coordCount: Record<string, number> = {};
  const validEvents = rawValid.map((event) => {
    const key = `${event.latitude?.toFixed(4)},${event.longitude?.toFixed(4)}`;
    coordCount[key] = (coordCount[key] || 0) + 1;
    const idx = coordCount[key] - 1;
    if (idx === 0) return event;
    // Espalha em espiral ~100m de raio
    const angle = (idx * 137.5 * Math.PI) / 180; // golden angle
    const radius = 0.0005 + idx * 0.0003;
    return {
      ...event,
      latitude: event.latitude! + Math.cos(angle) * radius,
      longitude: event.longitude! + Math.sin(angle) * radius,
    };
  });

  if (validEvents.length === 0) {
    return (
      <div
        className="w-full bg-gradient-to-br from-zinc-50 to-zinc-100 rounded-2xl flex items-center justify-center border border-zinc-200"
        style={{ height }}
      >
        <div className="text-center px-6">
          <svg className="w-12 h-12 text-zinc-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
          <p className="text-zinc-700 font-medium">Sem localização disponível</p>
          <p className="text-zinc-500 text-sm mt-1">Este evento ainda não tem coordenadas cadastradas</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-full rounded-2xl overflow-hidden border border-zinc-200 shadow-lg relative"
      style={{ height }}
    >
      <MapContainer
        center={[-12.9714, -38.5014] as [number, number]}
        zoom={zoom || 12}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={!singleEvent}
      >
        {/* CartoDB Voyager - clean e bonito */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
        />
        <MapCenter events={validEvents} zoom={zoom} />
        <MarkerClusterGroup chunkedLoading iconCreateFunction={createClusterCustomIcon}>
          {validEvents.map((event) => (
            <Marker
              key={event.id}
              position={[event.latitude!, event.longitude!] as [number, number]}
              icon={createCustomIcon()}
            >
              <Popup className="custom-popup">
                <div className="min-w-[220px]">
                  {event.image_url && (
                    <img
                      src={event.image_url}
                      alt={event.title}
                      className="w-full h-32 object-cover rounded-t-lg -m-3 mb-2"
                      style={{ width: "calc(100% + 24px)", maxWidth: "none" }}
                    />
                  )}
                  <div className="px-1 pt-1">
                    <h3 className="font-bold text-sm mb-1 text-zinc-900 leading-tight">{event.title}</h3>
                    <p className="text-xs text-zinc-600 mb-2 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      </svg>
                      {event.venue_name || "Local a confirmar"}
                    </p>
                    <p className="text-xs text-zinc-500 mb-3">
                      {new Date(event.start_datetime).toLocaleDateString('pt-BR', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    <a
                      href={`/event/${event.id}`}
                      className="inline-block w-full text-center bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-xs font-semibold py-2 px-3 rounded-lg hover:from-violet-700 hover:to-fuchsia-700 transition-all no-underline"
                    >
                      Ver detalhes →
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}
