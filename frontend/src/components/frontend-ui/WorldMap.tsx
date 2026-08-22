import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet';
import { DivIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useApp } from './AppContext';
import {
  MapPin,
  Plus,
  Navigation,
  X,
  Loader2,
  Trash2,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  Route,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';

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
export interface MapCity {
  id: string | number;
  name: string;
  country: string;
  lat: number;
  lng: number;
  image?: string;
  avgDailyBudget?: number;
}

export interface SelectedStop {
  id: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
  display_name?: string;
  cost?: number;
}

export type DayTargetOption = 'existing-day' | 'single-new-day' | 'separate-new-days';

export interface WorldMapProps {
  onAddStops?: (
    stops: SelectedStop[],
    options: { mode: DayTargetOption; targetDayId?: string }
  ) => void;
  selectedStops?: SelectedStop[];
  onSelectedStopsChange?: (stops: SelectedStop[]) => void;
  dayTargetMode?: DayTargetOption;
  onDayTargetModeChange?: (mode: DayTargetOption) => void;
  selectedDayId?: string;
  onSelectedDayIdChange?: (dayId: string) => void;
  maxStops?: number;
}

// ── Map Click Handler ─────────────────────────────────────────────────────────
function ClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// ── Numbered Pin Icon Generator ───────────────────────────────────────────────
const createNumberedIcon = (num: number) => {
  return new DivIcon({
    html: `<div style="
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
      color: white;
      font-size: 12px;
      font-weight: 800;
      border-radius: 50%;
      border: 2.5px solid #ffffff;
      box-shadow: 0 4px 12px rgba(2, 132, 199, 0.45);
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    ">${num}</div>`,
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  });
};

// ── Seed City Icon ────────────────────────────────────────────────────────────
const cityPinIcon = new DivIcon({
  html: `<div style="width:14px;height:14px;background:#0ea5e9;border:2px solid white;border-radius:50%;box-shadow:0 0 0 4px rgba(14,165,233,0.35);"></div>`,
  className: '',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
  popupAnchor: [0, -10],
});

// ── Geocoded Pending Pin Icon ─────────────────────────────────────────────────
const pendingPinIcon = new DivIcon({
  html: `<div style="width:16px;height:16px;background:#ef4444;border:2px solid white;border-radius:50%;box-shadow:0 0 0 5px rgba(239,68,68,0.4);"></div>`,
  className: '',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
  popupAnchor: [0, -12],
});

export function WorldMap({
  onAddStops,
  selectedStops: controlledStops,
  onSelectedStopsChange,
  dayTargetMode: controlledDayMode,
  onDayTargetModeChange,
  selectedDayId: controlledDayId,
  onSelectedDayIdChange,
  maxStops = 6,
}: WorldMapProps) {
  const { trips, activeTripId, showToast, formatCurrency, updateTrip, navigate } = useApp();
  const [cities, setCities] = useState<MapCity[]>([]);
  const [loadingGeo, setLoadingGeo] = useState(false);
  const [pendingPin, setPendingPin] = useState<SelectedStop | null>(null);

  // Internal state if uncontrolled
  const [internalStops, setInternalStops] = useState<SelectedStop[]>([]);
  const [internalDayMode, setInternalDayMode] = useState<DayTargetOption>('existing-day');
  const [internalDayId, setInternalDayId] = useState<string>('');
  const [isTrayExpanded, setIsTrayExpanded] = useState<boolean>(true);

  const selectedStops = controlledStops ?? internalStops;
  const setSelectedStops = (updater: SelectedStop[] | ((prev: SelectedStop[]) => SelectedStop[])) => {
    const nextVal = typeof updater === 'function' ? updater(selectedStops) : updater;
    if (onSelectedStopsChange) {
      onSelectedStopsChange(nextVal);
    } else {
      setInternalStops(nextVal);
    }
  };

  const dayTargetMode = controlledDayMode ?? internalDayMode;
  const selectedDayId = controlledDayId ?? internalDayId;

  const activeTrip = trips.find((t) => t.id === activeTripId) || trips[0];
  const tripDays = activeTrip?.days || [];

  // Initialize selectedDayId when activeTrip changes
  useEffect(() => {
    if (tripDays.length > 0 && !selectedDayId) {
      if (onSelectedDayIdChange) {
        onSelectedDayIdChange(tripDays[0].id);
      } else {
        setInternalDayId(tripDays[0].id);
      }
    }
  }, [tripDays, selectedDayId, onSelectedDayIdChange]);

  // Fetch seeded cities from the API
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

  // Reverse geocode on map click via Nominatim
  const handleMapClick = async (lat: number, lng: number) => {
    if (selectedStops.length >= maxStops) {
      showToast(`⚠️ Maximum ${maxStops} stop places reached! Remove a stop to add another.`);
      return;
    }

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
        'Custom Point';
      const country = data.address?.country || '';
      const newStop: SelectedStop = {
        id: `stop-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        lat,
        lng,
        name,
        country,
        display_name: data.display_name,
        cost: 25,
      };
      setPendingPin(newStop);
    } catch {
      showToast('Could not geocode location. Check internet connection.');
    } finally {
      setLoadingGeo(false);
    }
  };

  // Add a stop to the multi-point queue (capped at maxStops)
  const handleAddStopToQueue = (stop: Omit<SelectedStop, 'id'>) => {
    if (selectedStops.length >= maxStops) {
      showToast(`⚠️ Maximum ${maxStops} places can be selected at a time.`);
      return;
    }

    const newStop: SelectedStop = {
      ...stop,
      id: `stop-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    };
    setSelectedStops([...selectedStops, newStop]);
    setPendingPin(null);
    showToast(`📍 Added "${stop.name}" (#${selectedStops.length + 1}/${maxStops})`);
  };

  // Remove stop from queue
  const handleRemoveStop = (id: string) => {
    setSelectedStops(selectedStops.filter((s) => s.id !== id));
  };

  // Reorder stops
  const handleMoveStop = (index: number, direction: 'up' | 'down') => {
    const newStops = [...selectedStops];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newStops.length) return;
    const temp = newStops[index];
    newStops[index] = newStops[targetIdx];
    newStops[targetIdx] = temp;
    setSelectedStops(newStops);
  };

  // Clear all stops
  const handleClearStops = () => {
    setSelectedStops([]);
    setPendingPin(null);
  };

  // Commit selected stops to the active trip
  const handleConfirmAndAddStops = () => {
    if (selectedStops.length === 0) {
      showToast('Please point or select at least one stop on the map.');
      return;
    }

    if (!activeTrip) {
      showToast('Please select or create a trip first.');
      navigate('create-trip');
      return;
    }

    if (onAddStops) {
      onAddStops(selectedStops, { mode: dayTargetMode, targetDayId: selectedDayId });
      setSelectedStops([]);
      return;
    }

    const times = ['09:00 AM', '11:30 AM', '02:00 PM', '04:30 PM', '07:00 PM', '09:00 PM'];
    const currentDays = [...(activeTrip.days || [])];

    if (dayTargetMode === 'existing-day') {
      // Option 1 (Default): Add to existing day without creating new days
      if (currentDays.length === 0) {
        const newActivities = selectedStops.map((stop, idx) => ({
          id: `act-${Date.now()}-${idx}`,
          time: times[idx % times.length],
          title: `Visit ${stop.name}`,
          category: 'Sightseeing',
          location: `${stop.name}${stop.country ? ', ' + stop.country : ''}`,
          cost: stop.cost || 25,
          completed: false,
        }));
        const newDay = {
          id: `day-${Date.now()}`,
          dayNumber: 1,
          date: `Day 1 - ${selectedStops[0]?.name || activeTrip.destination}`,
          activities: newActivities,
        };
        updateTrip(activeTrip.id, { days: [newDay] });
        showToast(`✅ Added ${selectedStops.length} stops to Day 1!`);
      } else {
        const targetDay = currentDays.find((d) => d.id === selectedDayId) || currentDays[0];
        const existingCount = targetDay.activities.length;
        const newActivities = selectedStops.map((stop, idx) => ({
          id: `act-${Date.now()}-${idx}`,
          time: times[(existingCount + idx) % times.length],
          title: `Visit ${stop.name}`,
          category: 'Sightseeing',
          location: `${stop.name}${stop.country ? ', ' + stop.country : ''}`,
          cost: stop.cost || 25,
          completed: false,
        }));

        const updatedDays = currentDays.map((d) =>
          d.id === targetDay.id ? { ...d, activities: [...d.activities, ...newActivities] } : d
        );

        updateTrip(activeTrip.id, { days: updatedDays });
        showToast(`✅ Added ${selectedStops.length} stop(s) to Day ${targetDay.dayNumber} of "${activeTrip.title}"!`);
      }
    } else if (dayTargetMode === 'single-new-day') {
      // Option 2: Group all stops into a single new day
      const nextDayNum = currentDays.length + 1;
      const newActivities = selectedStops.map((stop, idx) => ({
        id: `act-${Date.now()}-${idx}`,
        time: times[idx % times.length],
        title: `Visit ${stop.name}`,
        category: 'Sightseeing',
        location: `${stop.name}${stop.country ? ', ' + stop.country : ''}`,
        cost: stop.cost || 25,
        completed: false,
      }));
      const newDay = {
        id: `day-${Date.now()}`,
        dayNumber: nextDayNum,
        date: `Day ${nextDayNum} - Multi-Stop Route`,
        activities: newActivities,
      };
      updateTrip(activeTrip.id, { days: [...currentDays, newDay] });
      showToast(`✅ Created Day ${nextDayNum} with all ${selectedStops.length} stops!`);
    } else if (dayTargetMode === 'separate-new-days') {
      // Option 3: Separate day for each stop
      let curNum = currentDays.length;
      const newDays = selectedStops.map((stop, idx) => {
        curNum++;
        return {
          id: `day-${Date.now()}-${idx}`,
          dayNumber: curNum,
          date: `Day ${curNum} - ${stop.name}`,
          activities: [
            {
              id: `act-${Date.now()}-${idx}`,
              time: '10:00 AM',
              title: `Explore ${stop.name}`,
              category: 'Sightseeing',
              location: `${stop.name}${stop.country ? ', ' + stop.country : ''}`,
              cost: stop.cost || 30,
              completed: false,
            },
          ],
        };
      });
      updateTrip(activeTrip.id, { days: [...currentDays, ...newDays] });
      showToast(`✅ Created ${selectedStops.length} new days (one per stop) in "${activeTrip.title}"!`);
    }

    setSelectedStops([]);
  };

  // Extract coordinates for Polyline
  const routePositions = selectedStops.map((s) => [s.lat, s.lng] as [number, number]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-3xl border border-slate-200 shadow-xl bg-slate-950">
      {/* Geocoding Loading Indicator */}
      {loadingGeo && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-2 rounded-full bg-slate-900/90 px-4 py-2 text-xs font-semibold text-white backdrop-blur-md shadow-lg border border-slate-700 animate-pulse">
          <Loader2 className="h-4 w-4 animate-spin text-sky-400" /> Geocoding location…
        </div>
      )}

      {/* Top Bar / Instruction Pill */}
      <div className="absolute top-4 left-4 z-[9999] flex flex-wrap items-center gap-2">
        <div className="rounded-xl bg-white/95 backdrop-blur-md px-3.5 py-2 text-xs font-semibold text-slate-800 shadow-md border border-slate-200/80 flex items-center gap-2">
          <Navigation className="h-3.5 w-3.5 text-sky-600 animate-bounce" />
          <span>Point up to {maxStops} stops by clicking anywhere or selecting cities</span>
        </div>

        {selectedStops.length > 0 && (
          <div
            className={`rounded-xl px-3 py-2 text-xs font-bold shadow-md flex items-center gap-1.5 animate-fade-in ${
              selectedStops.length >= maxStops
                ? 'bg-amber-600 text-white ring-2 ring-amber-400'
                : 'bg-sky-600 text-white'
            }`}
          >
            <Route className="h-3.5 w-3.5" />
            <span>
              {selectedStops.length} / {maxStops} Stops Marked {selectedStops.length >= maxStops && '(Max)'}
            </span>
          </div>
        )}
      </div>

      {/* Main Map */}
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

        {/* Route Polyline connecting multi-selected stops */}
        {routePositions.length > 1 && (
          <Polyline
            positions={routePositions}
            pathOptions={{
              color: '#0284c7',
              weight: 4,
              opacity: 0.85,
              dashArray: '8, 8',
              lineCap: 'round',
              lineJoin: 'round',
            }}
          />
        )}

        {/* Pre-seeded city markers */}
        {cities.map((city) => {
          const isSelected = selectedStops.some((s) => s.name.toLowerCase() === city.name.toLowerCase());
          return (
            <Marker key={city.id} position={[city.lat, city.lng]} icon={cityPinIcon}>
              <Popup maxWidth={260} className="leaflet-popup-custom">
                <div className="w-56 overflow-hidden rounded-xl">
                  {city.image && (
                    <img src={city.image} alt={city.name} className="h-28 w-full object-cover" />
                  )}
                  <div className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-slate-900 text-sm">{city.name}</div>
                      {isSelected && (
                        <span className="rounded bg-sky-100 px-1.5 py-0.5 text-[10px] font-bold text-sky-700">
                          Selected
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500">{city.country}</div>
                    {city.avgDailyBudget && (
                      <div className="mt-1 text-xs text-slate-600 font-medium">
                        ~{formatCurrency(city.avgDailyBudget)}/day
                      </div>
                    )}

                    <div className="mt-3 flex flex-col gap-1.5">
                      {selectedStops.length >= maxStops && !isSelected ? (
                        <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
                          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                          <span>Max {maxStops} stops reached.</span>
                        </div>
                      ) : (
                        <button
                          onClick={() =>
                            handleAddStopToQueue({
                              name: city.name,
                              country: city.country,
                              lat: city.lat,
                              lng: city.lng,
                              cost: city.avgDailyBudget,
                            })
                          }
                          disabled={isSelected}
                          className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-sky-600 py-1.5 text-xs font-semibold text-white hover:bg-sky-700 disabled:opacity-50 transition shadow-sm"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          {isSelected ? 'Already in Route' : `Add as Stop #${selectedStops.length + 1} of ${maxStops}`}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Render Selected Stops as Numbered Badges (1 to 6) */}
        {selectedStops.map((stop, idx) => (
          <Marker key={stop.id} position={[stop.lat, stop.lng]} icon={createNumberedIcon(idx + 1)}>
            <Popup maxWidth={240}>
              <div className="p-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-sky-700 uppercase tracking-wide">
                  <Route className="h-3 w-3" /> Stop #{idx + 1} of {maxStops}
                </div>
                <div className="font-bold text-slate-900 text-sm mt-0.5">{stop.name}</div>
                <div className="text-xs text-slate-500">{stop.country}</div>
                <button
                  onClick={() => handleRemoveStop(stop.id)}
                  className="mt-2.5 flex w-full items-center justify-center gap-1 rounded-lg border border-red-200 bg-red-50 py-1 text-xs font-semibold text-red-600 hover:bg-red-100 transition"
                >
                  <Trash2 className="h-3 w-3" /> Remove Stop
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Temporary Geocoded Pin (just clicked) */}
        {pendingPin && (
          <Marker position={[pendingPin.lat, pendingPin.lng]} icon={pendingPinIcon}>
            <Popup maxWidth={260}>
              <div className="w-56 p-1">
                <div className="flex items-center gap-1 text-[11px] font-bold text-rose-600 uppercase tracking-wider">
                  <MapPin className="h-3 w-3" /> Clicked Point
                </div>
                <div className="font-bold text-slate-900 text-sm mt-0.5">{pendingPin.name}</div>
                <div className="text-xs text-slate-500">{pendingPin.country}</div>
                {pendingPin.display_name && (
                  <div className="mt-1 text-[10px] text-slate-400 leading-tight line-clamp-2">
                    {pendingPin.display_name}
                  </div>
                )}
                <div className="mt-3 flex flex-col gap-1.5">
                  {selectedStops.length >= maxStops ? (
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
                      <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                      <span>Max {maxStops} stops reached. Remove one first.</span>
                    </div>
                  ) : (
                    <button
                      onClick={() =>
                        handleAddStopToQueue({
                          name: pendingPin.name,
                          country: pendingPin.country,
                          lat: pendingPin.lat,
                          lng: pendingPin.lng,
                          display_name: pendingPin.display_name,
                          cost: 25,
                        })
                      }
                      className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-sky-600 py-1.5 text-xs font-semibold text-white hover:bg-sky-700 transition shadow-sm"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add as Stop #{selectedStops.length + 1} of {maxStops}
                    </button>
                  )}
                  <button
                    onClick={() => setPendingPin(null)}
                    className="flex w-full items-center justify-center gap-1 rounded-lg py-1 text-xs text-slate-500 hover:text-slate-700 transition"
                  >
                    <X className="h-3 w-3" /> Dismiss
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Floating Multi-Stop Tray / Control Panel */}
      {selectedStops.length > 0 && (
        <div className="absolute bottom-4 left-4 right-4 z-[9999] max-w-4xl mx-auto rounded-2xl bg-white/95 backdrop-blur-md shadow-2xl border border-slate-200 overflow-hidden transition-all duration-300">
          {/* Header Bar */}
          <div className="flex items-center justify-between bg-slate-900 px-4 py-2.5 text-white">
            <div className="flex items-center gap-2">
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold text-white ${
                  selectedStops.length >= maxStops ? 'bg-amber-500' : 'bg-sky-500'
                }`}
              >
                {selectedStops.length}
              </span>
              <span className="text-xs sm:text-sm font-bold tracking-tight">
                {selectedStops.length} / {maxStops} Stops Marked
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleClearStops}
                className="text-[11px] font-medium text-slate-400 hover:text-rose-400 transition flex items-center gap-1"
                title="Clear all selected stops"
              >
                <Trash2 className="h-3 w-3" /> Clear All
              </button>
              <button
                onClick={() => setIsTrayExpanded(!isTrayExpanded)}
                className="rounded bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-300 hover:bg-slate-700 transition"
              >
                {isTrayExpanded ? 'Minimize' : 'Expand'}
              </button>
            </div>
          </div>

          {/* Tray Body */}
          {isTrayExpanded && (
            <div className="p-3.5 space-y-3 max-h-[35vh] overflow-y-auto">
              {/* Sequential Stops Horizontal / Vertical List */}
              <div className="flex flex-wrap items-center gap-2">
                {selectedStops.map((stop, idx) => (
                  <div
                    key={stop.id}
                    className="flex items-center gap-1.5 rounded-xl border border-sky-200 bg-sky-50/80 px-2.5 py-1.5 text-xs font-semibold text-slate-800 shadow-sm"
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-600 text-[10px] font-extrabold text-white">
                      {idx + 1}
                    </span>
                    <span className="truncate max-w-[140px] font-bold text-slate-900">{stop.name}</span>
                    <span className="text-[10px] text-slate-500">{stop.country}</span>

                    <div className="ml-1 flex items-center gap-0.5 border-l border-sky-200 pl-1">
                      <button
                        onClick={() => handleMoveStop(idx, 'up')}
                        disabled={idx === 0}
                        className="rounded p-0.5 text-slate-400 hover:text-sky-700 disabled:opacity-30"
                        title="Move Earlier"
                      >
                        <ArrowUp className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => handleMoveStop(idx, 'down')}
                        disabled={idx === selectedStops.length - 1}
                        className="rounded p-0.5 text-slate-400 hover:text-sky-700 disabled:opacity-30"
                        title="Move Later"
                      >
                        <ArrowDown className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => handleRemoveStop(stop.id)}
                        className="rounded p-0.5 text-slate-400 hover:text-red-600 transition"
                        title="Remove Stop"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Commit Action Button & Target Trip Info */}
              <div className="flex items-center justify-between gap-3 pt-1 border-t border-slate-100">
                <div className="text-xs text-slate-500">
                  Target trip:{' '}
                  <strong className="text-slate-800">
                    "{activeTrip?.title || 'Active Trip'}"
                  </strong>
                </div>

                <button
                  onClick={handleConfirmAndAddStops}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-sky-500/25 hover:from-sky-500 hover:to-blue-500 active:scale-98 transition"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>
                    Add {selectedStops.length} Stop{selectedStops.length > 1 ? 's' : ''} to Trip
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 opacity-70" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
