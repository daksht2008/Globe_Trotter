import { useState } from 'react';
import { WorldMap } from '../WorldMap';
import { useApp } from '../AppContext';
import { MapPin, Globe, Plus, Navigation2 } from 'lucide-react';

export function MapScreen() {
  const { trips, activeTripId, showToast, navigate, updateTrip } = useApp();
  const activeTrip = trips.find((t) => t.id === activeTripId) || trips[0];
  const [addedStops, setAddedStops] = useState<string[]>([]);

  const handleAddStop = (city: { name: string; country: string; lat: number; lng: number }) => {
    if (!activeTrip) {
      showToast('Please create or select a trip first!');
      navigate('create-trip');
      return;
    }

    // Add a new day for this city stop
    const newDay = {
      id: `day-${Date.now()}`,
      dayNumber: (activeTrip.days?.length || 0) + 1,
      date: city.name,
      activities: [
        {
          id: `act-${Date.now()}`,
          time: '10:00 AM',
          title: `Explore ${city.name} City Center`,
          category: 'Sightseeing',
          location: city.name,
          cost: 30,
          completed: false,
        },
      ],
    };

    updateTrip(activeTrip.id, { days: [...(activeTrip.days || []), newDay] });
    setAddedStops((prev) => [...prev, city.name]);
    showToast(`📍 ${city.name} added as Stop ${newDay.dayNumber} to "${activeTrip.title}"!`);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          World Map Explorer
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Click any city pin to add it to your trip, or click anywhere on the map to geocode a custom location.
        </p>
      </div>

      {/* Active Trip Status Bar */}
      {activeTrip ? (
        <div className="mb-5 flex items-center justify-between rounded-2xl border border-sky-200 bg-sky-50/60 px-5 py-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-sky-900">
            <Navigation2 className="h-4 w-4 text-sky-600" />
            Stops will be added to: <span className="text-sky-700">"{activeTrip.title}"</span>
            {addedStops.length > 0 && (
              <span className="ml-2 rounded-full bg-sky-600 px-2 py-0.5 text-[10px] font-bold text-white">
                +{addedStops.length} added
              </span>
            )}
          </div>
          <button
            onClick={() => navigate('itinerary')}
            className="rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-700"
          >
            View Itinerary
          </button>
        </div>
      ) : (
        <div className="mb-5 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50/60 px-5 py-3 text-sm font-semibold text-amber-800">
          <Globe className="h-4 w-4 text-amber-600" />
          No active trip — <button onClick={() => navigate('create-trip')} className="underline text-amber-700 hover:text-amber-900">create one first</button> to start adding map stops.
        </div>
      )}

      {/* Recently Added */}
      {addedStops.length > 0 && (
        <div className="mb-5 flex flex-wrap gap-2">
          {addedStops.map((s, i) => (
            <span key={i} className="flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
              <MapPin className="h-3 w-3" /> {s}
            </span>
          ))}
        </div>
      )}

      {/* Map Container */}
      <div style={{ height: '68vh' }}>
        <WorldMap onAddStop={handleAddStop} />
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center gap-6 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full bg-sky-500 ring-4 ring-sky-200" />
          Pre-seeded cities (click for details)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full bg-red-500 ring-4 ring-red-200" />
          Custom clicked location (reverse geocoded)
        </span>
      </div>
    </div>
  );
}
