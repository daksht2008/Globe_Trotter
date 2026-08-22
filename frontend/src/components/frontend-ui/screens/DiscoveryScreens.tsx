import { useState } from 'react';
import { useApp } from '../AppContext';
import { seedCities, seedActivities } from '../seedData';
import { Search, MapPin, DollarSign, Clock, Star, Plus, Check } from 'lucide-react';

export function CitySearchScreen() {
  const [query, setQuery] = useState('');
  const { formatCurrency, showToast, navigate } = useApp();

  const filteredCities = seedCities.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.country.toLowerCase().includes(query.toLowerCase()) ||
      c.vibe.some((v) => v.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Explore Destinations</h1>
        <p className="mt-1 text-sm text-slate-500">
          Discover top travel cities, daily budget estimates, and curated vibes.
        </p>

        <div className="relative mt-6 max-w-xl">
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by city, country, or vibe (e.g. Foodie, Beach, Paris)..."
            className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-12 pr-4 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredCities.map((city) => (
          <div
            key={city.id}
            className="group overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="relative h-52 w-full overflow-hidden">
              <img
                src={city.image}
                alt={city.name}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute top-3 right-3 rounded-full bg-slate-900/80 px-3 py-1 text-xs font-bold text-white backdrop-blur-md">
                ~{formatCurrency(city.avgDailyBudget)}/day
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-baseline justify-between">
                <h3 className="text-xl font-bold text-slate-900">{city.name}</h3>
                <span className="text-xs font-semibold text-slate-400">{city.country}</span>
              </div>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">{city.tagline}</p>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {city.vibe.map((v) => (
                  <span
                    key={v}
                    className="rounded-lg bg-sky-50 px-2.5 py-1 text-[11px] font-semibold text-sky-700"
                  >
                    {v}
                  </span>
                ))}
              </div>

              <div className="mt-6 border-t border-slate-100 pt-4">
                <button
                  onClick={() => {
                    showToast(`📍 Selected ${city.name}! Ready to add to your trip.`);
                    navigate('create-trip');
                  }}
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-slate-900 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800"
                >
                  <Plus className="h-3.5 w-3.5" /> Plan Trip Here
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ActivityExplorerScreen() {
  const [category, setCategory] = useState<string>('All');
  const { formatCurrency, showToast } = useApp();

  const categories = ['All', 'Sightseeing', 'Culture', 'Food & Drink', 'Adventure', 'Shopping'];

  const filteredActivities = seedActivities.filter(
    (act) => category === 'All' || act.category.toLowerCase() === category.toLowerCase()
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Activity Explorer</h1>
        <p className="mt-1 text-sm text-slate-500">
          Browse top-rated activities, culinary experiences, and landmark tours.
        </p>

        {/* Category Pills */}
        <div className="mt-6 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                category === cat
                  ? 'bg-sky-600 text-white shadow-sm shadow-sky-500/25'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredActivities.map((act) => (
          <div
            key={act.id}
            className="group overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="relative h-48 w-full overflow-hidden">
              <img
                src={act.image}
                alt={act.title}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute top-3 left-3 rounded-full bg-slate-900/80 px-2.5 py-0.5 text-[10px] font-bold text-white uppercase backdrop-blur-md">
                {act.category}
              </div>
              <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-bold text-slate-900 backdrop-blur-md">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {act.rating}
              </div>
            </div>

            <div className="p-5">
              <span className="flex items-center gap-1 text-xs font-semibold text-slate-400">
                <MapPin className="h-3 w-3 text-sky-500" /> {act.city}
              </span>
              <h3 className="mt-1 text-base font-bold text-slate-900">{act.title}</h3>
              <p className="mt-2 text-xs text-slate-500 line-clamp-2">{act.description}</p>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                <span className="flex items-center gap-1 text-slate-500">
                  <Clock className="h-3.5 w-3.5" /> {act.durationHours} hrs
                </span>
                <span className="font-bold text-slate-900">{formatCurrency(act.cost)}</span>
              </div>

              <button
                onClick={() => showToast(`Added "${act.title}" to active itinerary`)}
                className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl bg-sky-50 py-2.5 text-xs font-semibold text-sky-700 transition hover:bg-sky-100 active:scale-95"
              >
                <Plus className="h-3.5 w-3.5" /> Add to Itinerary
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
