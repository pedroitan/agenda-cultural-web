"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix para ícones do Leaflet no Next.js
const customIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

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
};

function MapCenter({ events }: { events: EventLocation[] }) {
  const map = useMap();

  useEffect(() => {
    if (events.length === 0) return;

    // Filtrar eventos com coordenadas válidas
    const validEvents = events.filter(e => e.latitude && e.longitude);

    if (validEvents.length === 0) return;

    // Calcular centro médio
    const avgLat = validEvents.reduce((sum, e) => sum + (e.latitude || 0), 0) / validEvents.length;
    const avgLng = validEvents.reduce((sum, e) => sum + (e.longitude || 0), 0) / validEvents.length;

    map.setView([avgLat, avgLng], 12);
  }, [events, map]);

  return null;
}

export default function EventMap({ events }: EventMapProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full h-[500px] bg-zinc-200 rounded-xl flex items-center justify-center">
        <p className="text-zinc-600">Carregando mapa...</p>
      </div>
    );
  }

  // Filtrar eventos com coordenadas válidas
  const validEvents = events.filter(e => e.latitude && e.longitude);

  if (validEvents.length === 0) {
    return (
      <div className="w-full h-[500px] bg-zinc-100 rounded-xl flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-600 font-medium">Nenhum evento com localização</p>
          <p className="text-zinc-500 text-sm mt-1">Os eventos precisam ter latitude e longitude</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[500px] rounded-xl overflow-hidden border border-zinc-200">
      <MapContainer
        center={[-12.9714, -38.5014] as [number, number]}
        zoom={12}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapCenter events={validEvents} />
        {validEvents.map((event) => (
          <Marker
            key={event.id}
            position={[event.latitude!, event.longitude!] as [number, number]}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                {event.image_url && (
                  <img
                    src={event.image_url}
                    alt={event.title}
                    className="w-full h-32 object-cover rounded-lg mb-2"
                  />
                )}
                <h3 className="font-bold text-sm mb-1">{event.title}</h3>
                <p className="text-xs text-zinc-600 mb-1">{event.venue_name || "Local a confirmar"}</p>
                <a
                  href={`/event/${event.id}`}
                  className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                >
                  Ver detalhes →
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
