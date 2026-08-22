import { useState } from 'react';
import { WorldMap, type SelectedStop, type DayTargetOption } from '../WorldMap';
import { useApp } from '../AppContext';
import { MapPin, Globe, Navigation2, Compass, Layers, ArrowRight } from 'lucide-react';

export function MapScreen() {
  const { trips, activeTripId, openTrip, showToast, navigate, updateTrip } = useApp();
  const activeTrip = trips.find((t) => t.id === activeTripId) || trips[0];
  const [lastAddedBatch, setLastAddedBatch] = useState<string[]>([]);

  const handleAddStops = (
    stops: SelectedStop[],
    options: { mode: DayTargetOption; targetDayId?: string }
  ) => {
    if (!activeTrip) {
      showToast('Please create or select a trip first!');
      navigate('create-trip');
      return;
    }

    const times = ['09:00 AM', '11:30 AM', '02:00 PM', '04:30 PM', '07:00 PM', '09:00 PM'];
    const currentDays = [...(activeTrip.days || [])];

    if (options.mode === 'existing-day') {
      // DEFAULT: Add all stops as activities to the selected existing day without creating new days
      if (currentDays.length === 0) {
        const newActivities = stops.map((stop, idx) => ({
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
          date: `Day 1 - ${stops[0]?.name || activeTrip.destination}`,
          activities: newActivities,
        };
        updateTrip(activeTrip.id, { days: [newDay] });
        showToast(`📍 Added ${stops.length} stop(s) to Day 1!`);
      } else {
        const targetDay = currentDays.find((d) => d.id === options.targetDayId) || currentDays[0];
        const existingCount = targetDay.activities.length;
        const newActivities = stops.map((stop, idx) => ({
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
        showToast(`📍 Added ${stops.length} stop(s) to Day ${targetDay.dayNumber} of "${activeTrip.title}"!`);
      }
    } else if (options.mode === 'single-new-day') {
      // Bundle into 1 new day
      const nextDayNum = currentDays.length + 1;
      const newActivities = stops.map((stop, idx) => ({
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
      showToast(`📍 Grouped ${stops.length} stop(s) into new Day ${nextDayNum}!`);
    } else if (options.mode === 'separate-new-days') {
      // Separate new day per stop
      let curNum = currentDays.length;
      const newDays = stops.map((stop, idx) => {
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
      showToast(`📍 Created ${stops.length} new days in "${activeTrip.title}"!`);
    }

    setLastAddedBatch(stops.map((s) => s.name));
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-600">
            <Compass className="h-4 w-4 text-sky-600 animate-spin-slow" /> Interactive Route Builder
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
            World Map Explorer
          </h1>
          <p className="mt-1 text-sm text-slate-500 max-w-2xl">
            Point multiple stops sequentially across the world. By default, stops are bundled into your current day without inflating your itinerary days, or choose your preferred day assignment mode.
          </p>
        </div>

        {/* Trip Switcher if user has trips */}
        {trips.length > 1 && (
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-600 whitespace-nowrap">Target Trip:</label>
            <select
              value={activeTrip?.id || ''}
              onChange={(e) => openTrip(e.target.value, 'map')}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 shadow-sm focus:border-sky-500 focus:ring-sky-500"
            >
              {trips.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title} ({t.destination})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Active Trip Status Bar */}
      {activeTrip ? (
        <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-sky-200 bg-gradient-to-r from-sky-50 to-blue-50/50 px-5 py-3.5 shadow-sm">
          <div className="flex items-center gap-2.5 text-sm font-semibold text-sky-950">
            <Navigation2 className="h-4 w-4 text-sky-600" />
            <span>
              Active Trip: <strong className="text-sky-700">"{activeTrip.title}"</strong> ({activeTrip.destination}) • {activeTrip.days?.length || 0} Day(s)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('itinerary')}
              className="flex items-center gap-1.5 rounded-xl bg-sky-600 px-3.5 py-1.5 text-xs font-bold text-white shadow hover:bg-sky-700 transition"
            >
              <span>View Itinerary</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-5 flex items-center justify-between rounded-2xl border border-amber-200 bg-amber-50/60 px-5 py-3 text-sm font-semibold text-amber-800">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-amber-600" />
            No active trip — create one to save your map routes!
          </div>
          <button
            onClick={() => navigate('create-trip')}
            className="rounded-lg bg-amber-600 px-3 py-1 text-xs font-semibold text-white hover:bg-amber-700"
          >
            Create Trip
          </button>
        </div>
      )}

      {/* Last Added Stops Notification */}
      {lastAddedBatch.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-2 text-xs font-semibold text-emerald-800 animate-fade-in">
          <span className="text-emerald-700 font-bold">Recently Added Stops:</span>
          {lastAddedBatch.map((s, i) => (
            <span key={i} className="flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-900">
              <MapPin className="h-3 w-3 text-emerald-600" /> {s}
            </span>
          ))}
        </div>
      )}

      {/* Map Container */}
      <div style={{ height: '70vh' }}>
        <WorldMap onAddStops={handleAddStops} />
      </div>

      {/* Legend & Guide */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500 border-t border-slate-200 pt-3">
        <div className="flex flex-wrap items-center gap-6">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-full bg-sky-500 ring-4 ring-sky-200" />
            Featured Destinations
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-sky-600 text-[9px] font-bold text-white shadow">1</span>
            Marked Multi-Stop Route
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-full bg-red-500 ring-4 ring-red-200" />
            Custom Clicked Coordinates
          </span>
        </div>

        <div className="text-[11px] text-slate-400 italic">
          Tip: You can reorder, delete, and bundle multiple points directly before saving to your itinerary.
        </div>
      </div>
    </div>
  );
}
