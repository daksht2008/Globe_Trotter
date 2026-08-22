import { useApp } from '../AppContext';
import { Plane, Plus, MapPin, Calendar, DollarSign, Compass, ArrowRight, Sparkles } from 'lucide-react';
import { seedCities, seedActivities } from '../seedData';

export function DashboardScreen() {
  const { user, trips, navigate, openTrip, formatCurrency } = useApp();
  const activeTrip = trips[0];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Hero Welcome */}
      <div className="relative mb-10 overflow-hidden rounded-3xl bg-gradient-to-r from-sky-600 via-indigo-600 to-slate-900 p-8 text-white shadow-xl sm:p-10">
        <div className="relative z-10 max-w-2xl">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-yellow-300" /> Multi-City Travel Planner
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Welcome back, {user.name.split(' ')[0]}! ✈️
          </h1>
          <p className="mt-2 text-base text-sky-100">
            You have <span className="font-semibold text-white">{trips.length} active journeys</span>. Ready to build your next dream itinerary?
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('create-trip')}
              className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-md transition hover:bg-slate-100 active:scale-95"
            >
              <Plus className="h-4 w-4 text-sky-600" /> Create New Trip
            </button>
            <button
              onClick={() => navigate('discover-cities')}
              className="flex items-center gap-2 rounded-xl bg-white/15 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/25 active:scale-95"
            >
              <Compass className="h-4 w-4" /> Explore Destinations
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3 text-slate-400">
            <Plane className="h-5 w-5 text-sky-500" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Trips</span>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">{trips.length}</p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3 text-slate-400">
            <MapPin className="h-5 w-5 text-emerald-500" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Destinations</span>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">
            {trips.reduce((acc, t) => acc + (t.days?.length || 1), 0)} stops
          </p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3 text-slate-400">
            <Calendar className="h-5 w-5 text-violet-500" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Days</span>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">
            {trips.reduce((acc, t) => acc + t.days.length, 0)} days
          </p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3 text-slate-400">
            <DollarSign className="h-5 w-5 text-amber-500" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Budget Planned</span>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">
            {formatCurrency(trips.reduce((acc, t) => acc + t.budget, 0))}
          </p>
        </div>
      </div>

      {/* Featured / Active Trip Card */}
      {activeTrip && (
        <div className="mb-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Featured Active Trip</h2>
            <button
              onClick={() => openTrip(activeTrip.id, 'itinerary')}
              className="flex items-center gap-1 text-sm font-semibold text-sky-600 hover:text-sky-700"
            >
              Open Itinerary <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div
            onClick={() => openTrip(activeTrip.id, 'itinerary')}
            className="group relative cursor-pointer overflow-hidden rounded-3xl bg-white shadow-md transition hover:shadow-xl"
          >
            <div className="relative h-64 w-full sm:h-80">
              <img
                src={activeTrip.coverImage}
                alt={activeTrip.title}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <div className="mb-2 inline-block rounded-full bg-sky-500/90 px-3 py-1 text-xs font-semibold uppercase backdrop-blur-md">
                  {activeTrip.style} style
                </div>
                <h3 className="text-2xl font-bold sm:text-3xl">{activeTrip.title}</h3>
                <p className="mt-1 flex items-center gap-2 text-sm text-slate-200">
                  <MapPin className="h-4 w-4 text-sky-400" /> {activeTrip.destination} • {activeTrip.startDate} to {activeTrip.endDate}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Popular World Destinations */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Trending Destinations</h2>
          <button
            onClick={() => navigate('discover-cities')}
            className="flex items-center gap-1 text-sm font-semibold text-sky-600 hover:text-sky-700"
          >
            View All Cities <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {seedCities.slice(0, 3).map((city) => (
            <div
              key={city.id}
              onClick={() => navigate('discover-cities')}
              className="group cursor-pointer overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="relative h-48 w-full overflow-hidden">
                <img
                  src={city.image}
                  alt={city.name}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                />
                <div className="absolute top-3 right-3 rounded-full bg-slate-900/80 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-md">
                  ~{formatCurrency(city.avgDailyBudget)}/day
                </div>
              </div>
              <div className="p-5">
                <h4 className="text-lg font-bold text-slate-900">{city.name}</h4>
                <p className="text-xs font-semibold text-slate-400">{city.country}</p>
                <p className="mt-2 text-xs text-slate-600 line-clamp-2">{city.tagline}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {city.vibe.map((v) => (
                    <span key={v} className="rounded-md bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-sky-700">
                      {v}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
