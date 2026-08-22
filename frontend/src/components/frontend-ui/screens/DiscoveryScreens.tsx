import { useState, useEffect } from 'react';
import { useApp } from '../AppContext';
import { Search, MapPin, Clock, Star, Plus, Loader2, SlidersHorizontal, ChevronDown } from 'lucide-react';

// ── City Search Screen ────────────────────────────────────────────────────────
interface ApiCity {
  id: number;
  name: string;
  country: string;
  region?: string;
  lat?: number;
  lng?: number;
  image_url?: string;
  cost_index?: number;
  popularity?: number;
}

export function CitySearchScreen() {
  const { formatCurrency, showToast, navigate } = useApp();
  const [query, setQuery] = useState('');
  const [cities, setCities] = useState<ApiCity[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch from live API — no artificial limit
  const fetchCities = async (q = '') => {
    setLoading(true);
    try {
      const qs = q ? `?q=${encodeURIComponent(q)}` : '';
      const res = await fetch(`/api/cities${qs}`);
      const data = await res.json();
      setCities(Array.isArray(data) ? data : []);
    } catch {
      showToast('Could not load cities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCities(); }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => fetchCities(query), 350);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Explore Destinations</h1>
        <p className="mt-1 text-sm text-slate-500">
          Discover top travel cities with live budget estimates. Showing {cities.length} destinations.
        </p>

        <div className="relative mt-6 max-w-xl">
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by city, country, or region…"
            className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-12 pr-4 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-500"
          />
          {loading && (
            <Loader2 className="absolute right-4 top-3.5 h-4 w-4 animate-spin text-slate-400" />
          )}
        </div>
      </div>

      {loading && cities.length === 0 ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
        </div>
      ) : cities.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="text-slate-500">No cities found for "{query}".</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cities.map((city) => {
            const dailyCost = city.cost_index ? Math.round(city.cost_index * 80) : 80;
            return (
              <div
                key={city.id}
                className="group overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative h-52 w-full overflow-hidden bg-gradient-to-br from-sky-200 to-slate-200">
                  {city.image_url ? (
                    <img
                      src={city.image_url}
                      alt={city.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-4xl font-bold text-white/40">
                      {city.name[0]}
                    </div>
                  )}
                  <div className="absolute top-3 right-3 rounded-full bg-slate-900/80 px-3 py-1 text-xs font-bold text-white backdrop-blur-md">
                    ~{formatCurrency(dailyCost)}/day
                  </div>
                  {city.popularity && (
                    <div className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-amber-400/90 px-2.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-md">
                      <Star className="h-3 w-3 fill-white" /> {city.popularity}
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <div className="flex items-baseline justify-between">
                    <h3 className="text-xl font-bold text-slate-900">{city.name}</h3>
                    <span className="text-xs font-semibold text-slate-400">{city.country}</span>
                  </div>
                  {city.region && (
                    <p className="mt-0.5 text-xs text-slate-500">{city.region}</p>
                  )}
                  {city.lat && city.lng && (
                    <p className="mt-1 flex items-center gap-1 text-[10px] text-slate-400">
                      <MapPin className="h-3 w-3" /> {city.lat.toFixed(2)}, {city.lng.toFixed(2)}
                    </p>
                  )}

                  <div className="mt-4 border-t border-slate-100 pt-4">
                    <button
                      onClick={() => {
                        showToast(`📍 ${city.name} selected! Go to Plan New Trip to add it.`);
                        navigate('create-trip');
                      }}
                      className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-slate-900 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800"
                    >
                      <Plus className="h-3.5 w-3.5" /> Plan Trip Here
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Activity Explorer Screen ──────────────────────────────────────────────────
interface ApiActivity {
  id: number;
  name: string;
  category?: string;
  description?: string;
  cost_estimate?: number;
  duration_hours?: number;
  city_id?: number;
  image_url?: string;
  rating?: number;
}

const CATEGORIES = ['All', 'sightseeing', 'culture', 'food', 'adventure', 'shopping'];
const SORT_OPTIONS = [
  { value: '', label: 'Default' },
  { value: 'cost_asc', label: 'Cost: Low → High' },
  { value: 'cost_desc', label: 'Cost: High → Low' },
  { value: 'duration_asc', label: 'Duration: Shortest' },
];

export function ActivityExplorerScreen() {
  const { formatCurrency, showToast } = useApp();
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [maxCost, setMaxCost] = useState('');
  const [query, setQuery] = useState('');
  const [activities, setActivities] = useState<ApiActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (sortBy) params.append('sort_by', sortBy);
      if (maxCost) params.append('max_cost', maxCost);
      if (query) params.append('q', query);
      params.append('limit', '200'); // fetch all — no arbitrary cap

      const res = await fetch(`/api/activities?${params.toString()}`);
      const data = await res.json();
      setActivities(Array.isArray(data) ? data : []);
    } catch {
      showToast('Could not load activities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchActivities(); }, [category, sortBy, maxCost]);
  useEffect(() => {
    const t = setTimeout(fetchActivities, 350);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Activity Explorer</h1>
        <p className="mt-1 text-sm text-slate-500">
          Browse {activities.length} activities across all destinations.
        </p>

        {/* Search + Filters */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search activities…"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:border-sky-500"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-sky-500"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Max cost ($)</span>
            <input
              type="number"
              value={maxCost}
              onChange={(e) => setMaxCost(e.target.value)}
              placeholder="Any"
              className="w-20 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-sky-500"
            />
          </div>
        </div>

        {/* Category pills */}
        <div className="mt-4 flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat === 'All' ? '' : cat)}
              className={`rounded-xl px-4 py-1.5 text-xs font-semibold capitalize transition ${
                (cat === 'All' && !category) || category === cat
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading && activities.length === 0 ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
        </div>
      ) : activities.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
          No activities found. Try clearing filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {activities.map((act) => (
            <div
              key={act.id}
              className="group overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative h-44 w-full overflow-hidden bg-gradient-to-br from-indigo-100 to-slate-200">
                {act.image_url ? (
                  <img
                    src={act.image_url}
                    alt={act.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-5xl">🗺️</div>
                )}
                {act.category && (
                  <div className="absolute top-3 left-3 rounded-full bg-slate-900/80 px-2.5 py-0.5 text-[10px] font-bold uppercase text-white backdrop-blur-md">
                    {act.category}
                  </div>
                )}
                {act.rating && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-bold text-slate-900 backdrop-blur-md">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {act.rating}
                  </div>
                )}
              </div>

              <div className="p-5">
                <h3 className="text-base font-bold text-slate-900">{act.name}</h3>
                {act.description && (
                  <p className="mt-1.5 text-xs text-slate-500 line-clamp-2">{act.description}</p>
                )}

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                  {act.duration_hours ? (
                    <span className="flex items-center gap-1 text-slate-500">
                      <Clock className="h-3.5 w-3.5" /> {act.duration_hours}h
                    </span>
                  ) : <span />}
                  <span className="font-bold text-slate-900">
                    {act.cost_estimate !== undefined ? formatCurrency(act.cost_estimate) : 'Free'}
                  </span>
                </div>

                <button
                  onClick={() => showToast(`Added "${act.name}" to your active itinerary`)}
                  className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl bg-sky-50 py-2.5 text-xs font-semibold text-sky-700 transition hover:bg-sky-100 active:scale-95"
                >
                  <Plus className="h-3.5 w-3.5" /> Add to Itinerary
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
