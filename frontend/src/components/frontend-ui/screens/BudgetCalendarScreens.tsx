import { useState } from 'react';
import { useApp } from '../AppContext';
import { DollarSign, Calendar, Clock, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';


export function BudgetScreen() {
  const { trips, activeTripId, formatCurrency } = useApp();
  const trip = trips.find((t) => t.id === activeTripId) || trips[0];

  if (!trip) {
    return <div className="p-8 text-center text-slate-500">No trip found</div>;
  }

  // Calculate actual activity costs
  let totalActivityCost = 0;
  const categoryBreakdown: Record<string, number> = {};

  trip.days.forEach((day) => {
    day.activities.forEach((act) => {
      totalActivityCost += act.cost;
      categoryBreakdown[act.category] = (categoryBreakdown[act.category] || 0) + act.cost;
    });
  });

  const remaining = Math.max(0, trip.budget - totalActivityCost);
  const percentage = Math.min(100, Math.round((totalActivityCost / (trip.budget || 1)) * 100));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Trip Budget & Expenses</h1>
        <p className="mt-1 text-sm text-slate-500">
          Budget analysis for <span className="font-semibold text-slate-800">{trip.title}</span>
        </p>
      </div>

      {/* Top 3 Summary Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Budget</span>
          <p className="mt-2 text-3xl font-extrabold text-slate-900">{formatCurrency(trip.budget)}</p>
          <p className="mt-1 text-xs text-slate-400">Target allocated</p>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Estimated Expenses</span>
          <p className="mt-2 text-3xl font-extrabold text-sky-600">{formatCurrency(totalActivityCost)}</p>
          <p className="mt-1 text-xs text-slate-400">{percentage}% of budget used</p>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Remaining Cushion</span>
          <p className="mt-2 text-3xl font-extrabold text-emerald-600">{formatCurrency(remaining)}</p>
          <p className="mt-1 text-xs text-slate-400">Safe buffer left</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="mb-2 flex justify-between text-xs font-bold">
          <span className="text-slate-700">Budget Consumption</span>
          <span className="text-sky-600">{percentage}%</span>
        </div>
        <div className="h-3.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              percentage > 90 ? 'bg-amber-500' : 'bg-sky-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Spending by Category</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(categoryBreakdown).map(([cat, amt]) => (
            <div key={cat} className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
              <span className="text-xs font-semibold text-slate-500 uppercase">{cat}</span>
              <p className="mt-1 text-xl font-bold text-slate-900">{formatCurrency(amt)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CalendarScreen() {
  const { trips, activeTripId, formatCurrency, updateTrip } = useApp();
  const trip = trips.find((t) => t.id === activeTripId) || trips[0];
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);

  if (!trip) {
    return <div className="p-8 text-center text-slate-500">No trip found</div>;
  }

  const days = trip.days || [];
  const currentDay = days[selectedDayIdx] || days[0];

  const handleDateChange = (dayId: string, newDate: string) => {
    const updatedDays = days.map((d) => d.id === dayId ? { ...d, date: newDate } : d);
    updateTrip(trip.id, { days: updatedDays });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Timeline & Calendar</h1>
        <p className="mt-1 text-sm text-slate-500">
          Visual schedule for <span className="font-semibold text-slate-800">{trip.title}</span>
          {trip.startDate && trip.endDate && <> &nbsp;({trip.startDate} → {trip.endDate})</>}
        </p>
      </div>

      {/* Day Tabs */}
      <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedDayIdx(Math.max(0, selectedDayIdx - 1))}
          className="shrink-0 rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 hover:bg-slate-50"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {days.map((day, idx) => (
          <button
            key={day.id}
            onClick={() => setSelectedDayIdx(idx)}
            className={`flex shrink-0 items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition ${
              selectedDayIdx === idx
                ? 'bg-slate-900 text-white shadow-md'
                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Calendar className="h-3.5 w-3.5" /> Day {day.dayNumber}
          </button>
        ))}

        <button
          onClick={() => setSelectedDayIdx(Math.min(days.length - 1, selectedDayIdx + 1))}
          className="shrink-0 rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 hover:bg-slate-50"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {currentDay && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Day Schedule */}
          <div className="lg:col-span-2 space-y-4">
            {/* Date selector for this day */}
            <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <Calendar className="h-5 w-5 text-sky-600 shrink-0" />
              <div className="flex-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Date for Day {currentDay.dayNumber}
                </label>
                <input
                  type="date"
                  value={currentDay.date?.match(/^\d{4}-\d{2}-\d{2}$/) ? currentDay.date : ''}
                  onChange={(e) => handleDateChange(currentDay.id, e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-500 focus:bg-white"
                />
              </div>
              <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                {currentDay.activities.length} activities
              </span>
            </div>

            {/* Activities timeline */}
            {currentDay.activities.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
                No activities for this day. Go to Itinerary to add some.
              </div>
            ) : (
              currentDay.activities.map((act) => (
                <div key={act.id} className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50">
                    <Clock className="h-5 w-5 text-sky-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-400">{act.time}</span>
                      <span className="text-xs font-bold text-slate-900">{formatCurrency(act.cost)}</span>
                    </div>
                    <p className="mt-1 font-bold text-slate-900">{act.title}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                      <MapPin className="h-3 w-3 text-slate-400" /> {act.location}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Summary sidebar */}
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm h-fit">
            <h3 className="text-base font-bold text-slate-900 mb-4">Day {currentDay.dayNumber} Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Activities</span>
                <span className="font-semibold text-slate-900">{currentDay.activities.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Total Cost</span>
                <span className="font-semibold text-slate-900">
                  {formatCurrency(currentDay.activities.reduce((s, a) => s + a.cost, 0))}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Completed</span>
                <span className="font-semibold text-emerald-600">
                  {currentDay.activities.filter((a) => a.completed).length} / {currentDay.activities.length}
                </span>
              </div>
            </div>

            <div className="mt-6 text-xs text-slate-400">
              {days.length} total days in this trip
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
