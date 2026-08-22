import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { DivIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useApp } from './AppContext';
import { MapPin, Plus, Navigation, X, Loader2 } from 'lucide-react';

// Fix default Leaflet marker icon for Vite bundler
import markerIconUrl from 'leaflet/dist/images/marker-icon.png';
import markerIcon2xUrl from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadowUrl from 'leaflet/dist/images/marker-shadow.png';
import { Icon as LIcon } from 'leaflet';
(LIcon.Default as any).mergeOptions({
  iconUrl: markerIconUrl,
  iconRetinaUrl: markerIcon2xUrl,
  shadowUrl: markerShadowUrl,
});

// ── Types ─────────────────────────────────────────────────────────────────────
interface MapCity {
  id: string | number;
  name: string;
  country: string;
  lat: number;
  lng: number;
  image?: string;
  avgDailyBudget?: number;
}

interface ReverseGeoResult {
  lat: number;
  lng: number;
  name: string;
  country: string;
  display_name: string;
}

// ── Mode B: Click-to-geocode listener ─────────────────────────────────────────
function ClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// ── Main WorldMap component ───────────────────────────────────────────────────
export function WorldMap({ onAddStop }: { onAddStop?: (city: { name: string; country: string; lat: number; lng: number }) => void }) {
  const { trips, activeTripId, showToast, formatCurrency } = useApp();
  const [cities, setCities] = useState<MapCity[]>([]);
  const [loadingGeo, setLoadingGeo] = useState(false);
  const [pendingPin, setPendingPin] = useState<ReverseGeoResult | null>(null);

  const activeTrip = trips.find((t) => t.id === activeTripId) || trips[0];

  // Fetch seeded cities from the API (they have lat/lng)
  useEffect(() => {
    fetch('/api/cities')
      .then((r) => r.json())
      .then((data: any[]) => {
        const mapped: MapCity[] = data
          .filter((c) => c.lat && c.lng)
          .map((c) => ({
            id: c.id,
            name: c.name,
            country: c.country,
            lat: c.lat,
            lng: c.lng,
            image: c.image_url,
            avgDailyBudget: c.cost_index ? Math.round(c.cost_index * 80) : 80,
          }));
        setCities(mapped);
      })
      .catch(() => {
        // Fallback seed data if API is unavailable
        setCities([
          { id: 'p', name: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522 },
          { id: 't', name: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503 },
          { id: 'r', name: 'Rome', country: 'Italy', lat: 41.9028, lng: 12.4964 },
          { id: 'ny', name: 'New York', country: 'USA', lat: 40.7128, lng: -74.006 },
          { id: 'b', name: 'Barcelona', country: 'Spain', lat: 41.3851, lng: 2.1734 },
          { id: 'bk', name: 'Bangkok', country: 'Thailand', lat: 13.7563, lng: 100.5018 },
          { id: 'ams', name: 'Amsterdam', country: 'Netherlands', lat: 52.3676, lng: 4.9041 },
          { id: 'dub', name: 'Dubai', country: 'UAE', lat: 25.2048, lng: 55.2708 },
        ]);
      });
  }, []);

  // Mode B: Reverse geocode on map click via Nominatim
  const handleMapClick = async (lat: number, lng: number) => {
    setPendingPin(null);
    setLoadingGeo(true);
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;
      const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
      const data = await res.json();
      const name =
        data.address?.city ||
        data.address?.town ||
        data.address?.village ||
        data.address?.county ||
        data.address?.state ||
        'Unknown Location';
      const country = data.address?.country || '';
      setPendingPin({ lat, lng, name, country, display_name: data.display_name });
    } catch {
      showToast('Could not geocode location. Check internet connection.');
    } finally {
      setLoadingGeo(false);
    }
  };

  const handleAddCity = (city: { name: string; country: string; lat: number; lng: number }) => {
    if (onAddStop) {
      onAddStop(city);
    } else {
      showToast(`📍 ${city.name} selected! Go to Create Trip to add it.`);
    }
    setPendingPin(null);
  };

  // Custom glowing pin icon for seeded cities
  const cityPinIcon = new DivIcon({
    html: `<div style="width:14px;height:14px;background:#0ea5e9;border:2px solid white;border-radius:50%;box-shadow:0 0 0 4px rgba(14,165,233,0.3);"></div>`,
    className: '',
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -10],
  });

  // Red pin for clicked/geocoded location
  const clickedPinIcon = new DivIcon({
    html: `<div style="width:16px;height:16px;background:#ef4444;border:2px solid white;border-radius:50%;box-shadow:0 0 0 5px rgba(239,68,68,0.3);"></div>`,
    className: '',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -12],
  });

  return (
    <div className="relative h-full w-full overflow-hidden rounded-3xl border border-slate-200 shadow-md">
      {loadingGeo && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-2 rounded-full bg-slate-900/90 px-4 py-2 text-xs font-semibold text-white backdrop-blur-md shadow-lg">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Locating…
        </div>
      )}

      <div className="absolute top-4 left-4 z-[9999] rounded-xl bg-white/90 backdrop-blur-md px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-md border border-slate-200">
        <Navigation className="inline h-3 w-3 mr-1 text-sky-600" />
        Click anywhere to add a custom stop
      </div>

      <MapContainer
        center={[25, 15]}
        zoom={2}
        minZoom={2}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ClickHandler onMapClick={handleMapClick} />

        {/* Mode A: Pre-seeded city markers */}
        {cities.map((city) => (
          <Marker key={city.id} position={[city.lat, city.lng]} icon={cityPinIcon}>
            <Popup maxWidth={240} className="leaflet-popup-custom">
              <div className="w-56 rounded-xl overflow-hidden">
                {city.image && (
                  <img src={city.image} alt={city.name} className="h-32 w-full object-cover" />
                )}
                <div className="p-3">
                  <div className="font-bold text-slate-900 text-sm">{city.name}</div>
                  <div className="text-xs text-slate-500">{city.country}</div>
                  {city.avgDailyBudget && (
                    <div className="mt-1 text-xs text-slate-600">
                      ~{formatCurrency(city.avgDailyBudget)}/day
                    </div>
                  )}
                  <button
                    onClick={() => handleAddCity({ name: city.name, country: city.country, lat: city.lat, lng: city.lng })}
                    className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-sky-600 py-1.5 text-xs font-semibold text-white hover:bg-sky-700"
                  >
                    <Plus className="h-3 w-3" />
                    {activeTrip ? `Add to "${activeTrip.title}"` : 'Select Destination'}
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Mode B: Clicked/geocoded location pin */}
        {pendingPin && (
          <Marker position={[pendingPin.lat, pendingPin.lng]} icon={clickedPinIcon}>
            <Popup maxWidth={240} autoOpen>
              <div className="w-52 p-1">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{pendingPin.name}</div>
                    <div className="text-xs text-slate-500">{pendingPin.country}</div>
                    <div className="mt-0.5 text-[10px] text-slate-400 leading-tight line-clamp-2">
                      {pendingPin.display_name}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleAddCity({ name: pendingPin.name, country: pendingPin.country, lat: pendingPin.lat, lng: pendingPin.lng })}
                  className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-600 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                >
                  <Plus className="h-3 w-3" /> Add this location
                </button>
                <button
                  onClick={() => setPendingPin(null)}
                  className="mt-1.5 flex w-full items-center justify-center gap-1 rounded-lg py-1 text-xs text-slate-500 hover:text-slate-700"
                >
                  <X className="h-3 w-3" /> Dismiss
                </button>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
