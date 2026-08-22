import { useApp } from '../AppContext';
import { DollarSign, PieChart, TrendingUp, Calendar as CalIcon, Clock, MapPin, CheckCircle2 } from 'lucide-react';

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
  const { trips, activeTripId, formatCurrency } = useApp();
  const trip = trips.find((t) => t.id === activeTripId) || trips[0];

  if (!trip) {
    return <div className="p-8 text-center text-slate-500">No trip found</div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Timeline & Calendar</h1>
        <p className="mt-1 text-sm text-slate-500">
          Visual schedule for <span className="font-semibold text-slate-800">{trip.title}</span> ({trip.startDate} to {trip.endDate})
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {trip.days.map((day) => (
          <div key={day.id} className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="font-bold text-slate-900">Day {day.dayNumber}</span>
              <span className="text-xs font-semibold text-sky-600 bg-sky-50 px-2.5 py-1 rounded-full">
                {day.activities.length} items
              </span>
            </div>

            <div className="space-y-3">
              {day.activities.map((act) => (
                <div key={act.id} className="rounded-xl bg-slate-50 p-3 text-xs">
                  <div className="flex items-center justify-between text-slate-400 font-medium">
                    <span>{act.time}</span>
                    <span className="font-bold text-slate-700">{formatCurrency(act.cost)}</span>
                  </div>
                  <p className="mt-1 font-bold text-slate-900">{act.title}</p>
                  <p className="text-slate-500 mt-0.5">{act.location}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
