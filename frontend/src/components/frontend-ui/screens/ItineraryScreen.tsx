import { useState } from 'react';
import { useApp } from '../AppContext';
import {
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  CheckCircle2,
  Circle,
  Plus,
  Share2,
  Sparkles,
  PieChart,
  Navigation
} from 'lucide-react';

export function ItineraryScreen() {
  const { trips, activeTripId, toggleActivityComplete, formatCurrency, navigate, showToast, updateTrip } = useApp();
  const trip = trips.find((t) => t.id === activeTripId) || trips[0];
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);

  if (!trip) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <p className="text-slate-500">No active trip selected.</p>
        <button
          onClick={() => navigate('create-trip')}
          className="mt-4 rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white"
        >
          Create Trip
        </button>
      </div>
    );
  }

  const days = trip.days || [];
  const currentDay = days[selectedDayIdx] || days[0];

  const handleAddActivity = () => {
    const title = prompt('Enter activity title (e.g. Visit Museum):');
    if (!title) return;
    const cost = Number(prompt('Enter estimated cost ($):', '20')) || 0;
    const location = prompt('Enter location/neighborhood:', trip.destination) || trip.destination;

    const newActivity = {
      id: `act-${Date.now()}`,
      time: '02:00 PM',
      title,
      category: 'Sightseeing',
      location,
      cost,
      completed: false,
    };

    const updatedDays = days.map((d, i) =>
      i === selectedDayIdx ? { ...d, activities: [...d.activities, newActivity] } : d
    );

    updateTrip(trip.id, { days: updatedDays });
    showToast('Activity added to itinerary');
  };

  const handleAddDay = () => {
    const newDayNumber = days.length + 1;
    const newDay = {
      id: `day-${Date.now()}`,
      dayNumber: newDayNumber,
      date: `Day ${newDayNumber}`,
      activities: [],
    };
    updateTrip(trip.id, { days: [...days, newDay] });
    setSelectedDayIdx(days.length);
    showToast(`Added Day ${newDayNumber}`);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header Banner */}
      <div className="relative mb-8 overflow-hidden rounded-3xl bg-slate-900 text-white shadow-xl">
        <div className="relative h-48 w-full sm:h-60">
          <img src={trip.coverImage} alt={trip.title} className="h-full w-full object-cover opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md">
                <Navigation className="h-3.5 w-3.5 text-sky-400" /> {trip.destination}
              </div>
              <h1 className="text-2xl font-bold sm:text-4xl">{trip.title}</h1>
              <p className="mt-1 text-xs text-slate-300 sm:text-sm">
                {trip.startDate} to {trip.endDate} • {trip.style} style
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('budget')}
                className="flex items-center gap-1.5 rounded-xl bg-white/15 px-4 py-2 text-xs font-semibold backdrop-blur-md transition hover:bg-white/25"
              >
                <PieChart className="h-4 w-4 text-emerald-400" /> Budget View
              </button>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href);
                  showToast('📋 Share link copied to clipboard!');
                }}
                className="flex items-center gap-1.5 rounded-xl bg-sky-600 px-4 py-2 text-xs font-semibold text-white shadow-md transition hover:bg-sky-700"
              >
                <Share2 className="h-4 w-4" /> Share Itinerary
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Day Selector Tabs */}
      <div className="mb-8 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {days.map((day, idx) => (
          <button
            key={day.id}
            onClick={() => setSelectedDayIdx(idx)}
            className={`flex shrink-0 items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition ${
              selectedDayIdx === idx
                ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>Day {day.dayNumber}</span>
            <span className={`rounded-full px-2 py-0.5 text-xs ${
              selectedDayIdx === idx ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              {day.activities.length} acts
            </span>
          </button>
        ))}

        <button
          onClick={handleAddDay}
          className="flex shrink-0 items-center gap-1.5 rounded-2xl border border-dashed border-sky-400 bg-sky-50/50 px-4 py-3 text-sm font-semibold text-sky-700 hover:bg-sky-100"
        >
          <Plus className="h-4 w-4" /> Add Day
        </button>
      </div>

      {/* Day Schedule Timeline */}
      {currentDay && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">
                Day {currentDay.dayNumber} Timeline
              </h2>
              <button
                onClick={handleAddActivity}
                className="flex items-center gap-1.5 rounded-xl bg-sky-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-sky-700"
              >
                <Plus className="h-3.5 w-3.5" /> Add Activity
              </button>
            </div>

            {currentDay.activities.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
                <p className="text-sm text-slate-500">No activities scheduled for this day yet.</p>
                <button
                  onClick={handleAddActivity}
                  className="mt-3 rounded-lg bg-sky-600 px-4 py-2 text-xs font-semibold text-white"
                >
                  + Add First Activity
                </button>
              </div>
            ) : (
              currentDay.activities.map((act) => (
                <div
                  key={act.id}
                  className={`group relative flex items-start gap-4 rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md ${
                    act.completed ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-100'
                  }`}
                >
                  <button
                    onClick={() => toggleActivityComplete(trip.id, currentDay.id, act.id)}
                    className="mt-0.5 text-slate-400 transition hover:scale-110"
                  >
                    {act.completed ? (
                      <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                    ) : (
                      <Circle className="h-6 w-6 text-slate-300 group-hover:text-sky-500" />
                    )}
                  </button>

                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 text-xs font-semibold text-slate-400">
                          <Clock className="h-3.5 w-3.5" /> {act.time}
                        </span>
                        <span className="rounded-md bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-800 uppercase">
                          {act.category}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-slate-700">
                        {formatCurrency(act.cost)}
                      </span>
                    </div>

                    <h3 className={`mt-1.5 text-base font-bold ${act.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                      {act.title}
                    </h3>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                      <MapPin className="h-3 w-3 text-slate-400" /> {act.location}
                    </p>
                    {act.notes && (
                      <p className="mt-2 rounded-lg bg-slate-50 p-2 text-xs text-slate-600 italic">
                        {act.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Day Summary Card */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-900">Day {currentDay.dayNumber} Overview</h3>
              <div className="mt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Scheduled Activities</span>
                  <span className="font-semibold text-slate-900">{currentDay.activities.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Estimated Cost</span>
                  <span className="font-semibold text-slate-900">
                    {formatCurrency(currentDay.activities.reduce((acc, a) => acc + a.cost, 0))}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Completed</span>
                  <span className="font-semibold text-emerald-600">
                    {currentDay.activities.filter((a) => a.completed).length} / {currentDay.activities.length}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-gradient-to-br from-indigo-900 to-slate-900 p-6 text-white shadow-md">
              <Sparkles className="h-6 w-6 text-yellow-300 mb-2" />
              <h4 className="font-bold text-sm">Smart Suggestion</h4>
              <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                Add 15-minute buffers between activities to navigate local transit comfortably.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
