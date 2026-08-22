import { useState, useEffect, useRef } from 'react';
import { useApp } from '../AppContext';
import type { TravelStyle, Trip } from '../types';
import {
  Plus,
  Trash2,
  Calendar,
  MapPin,
  DollarSign,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Search,
  Loader2,
  Globe,
  ChevronDown,
  Check,
} from 'lucide-react';

export const COUNTRIES = [
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭' },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'AT', name: 'Austria', flag: '🇦🇹' },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'CZ', name: 'Czech Republic', flag: '🇨🇿' },
  { code: 'DK', name: 'Denmark', flag: '🇩🇰' },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬' },
  { code: 'FI', name: 'Finland', flag: '🇫🇮' },
  { code: 'GR', name: 'Greece', flag: '🇬🇷' },
  { code: 'HU', name: 'Hungary', flag: '🇭🇺' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'IE', name: 'Ireland', flag: '🇮🇪' },
  { code: 'IS', name: 'Iceland', flag: '🇮🇸' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
  { code: 'MA', name: 'Morocco', flag: '🇲🇦' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾' },
  { code: 'NO', name: 'Norway', flag: '🇳🇴' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿' },
  { code: 'PE', name: 'Peru', flag: '🇵🇪' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭' },
  { code: 'PL', name: 'Poland', flag: '🇵🇱' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
  { code: 'QA', name: 'Qatar', flag: '🇶🇦' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪' },
  { code: 'TR', name: 'Turkey', flag: '🇹🇷' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
];

interface CitySuggestion {
  name: string;
  country: string;
  region?: string;
  lat?: number;
  lng?: number;
  image_url?: string;
  cost_index?: number;
  source?: 'db' | 'osm';
}

export function CreateTripScreen() {
  const { addTrip, openTrip, showToast, formatCurrency } = useApp();
  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [country, setCountry] = useState('');
  const [startDate, setStartDate] = useState('2026-09-15');
  const [endDate, setEndDate] = useState('2026-09-22');
  const [budget, setBudget] = useState(2500);
  const [style, setStyle] = useState<TravelStyle>('balanced');
  const [coverImage, setCoverImage] = useState(
    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1000'
  );

  // Auto-fill suggestions state
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced auto-fill query
  useEffect(() => {
    if (!destination || destination.trim().length < 1) {
      setSuggestions([]);
      setIsDropdownOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoadingSuggestions(true);
      const query = destination.trim();
      const countryFilter = country.trim();

      const combined: CitySuggestion[] = [];
      const seenNames = new Set<string>();

      try {
        // 1. Fetch from local backend API / database
        const url = `/api/cities?q=${encodeURIComponent(query)}${
          countryFilter ? `&country=${encodeURIComponent(countryFilter)}` : ''
        }`;
        const res = await fetch(url);
        if (res.ok) {
          const dbData: any[] = await res.json();
          if (Array.isArray(dbData)) {
            for (const c of dbData) {
              const key = `${c.name.toLowerCase()}__${(c.country || '').toLowerCase()}`;
              if (!seenNames.has(key)) {
                seenNames.add(key);
                combined.push({
                  name: c.name,
                  country: c.country,
                  region: c.region,
                  lat: c.lat,
                  lng: c.lng,
                  image_url: c.image_url,
                  cost_index: c.cost_index,
                  source: 'db',
                });
              }
            }
          }
        }
      } catch (err) {
        // Fallback silently
      }

      // 2. Fetch from OpenStreetMap / Nominatim (World Map geocoding source) if needed
      if (combined.length < 5) {
        try {
          const osmQuery = countryFilter ? `${query}, ${countryFilter}` : query;
          const osmUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            osmQuery
          )}&addressdetails=1&limit=6`;
          const osmRes = await fetch(osmUrl, {
            headers: { 'Accept-Language': 'en' },
          });
          if (osmRes.ok) {
            const osmData: any[] = await osmRes.json();
            for (const item of osmData) {
              const cityName =
                item.address?.city ||
                item.address?.town ||
                item.address?.village ||
                item.address?.municipality ||
                item.name;
              const countryName = item.address?.country || '';
              const stateName = item.address?.state || item.address?.region || '';

              if (cityName) {
                const key = `${cityName.toLowerCase()}__${countryName.toLowerCase()}`;
                if (!seenNames.has(key)) {
                  seenNames.add(key);
                  combined.push({
                    name: cityName,
                    country: countryName,
                    region: stateName,
                    lat: parseFloat(item.lat),
                    lng: parseFloat(item.lon),
                    source: 'osm',
                  });
                }
              }
            }
          }
        } catch (err) {
          // Ignore network errors
        }
      }

      setSuggestions(combined.slice(0, 6));
      setIsDropdownOpen(combined.length > 0);
      setHighlightedIndex(-1);
      setIsLoadingSuggestions(false);
    }, 280);

    return () => clearTimeout(timer);
  }, [destination, country]);

  // Click outside to close suggestion dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle selection from auto-fill suggestions
  const handleSelectSuggestion = (city: CitySuggestion) => {
    setDestination(city.name);

    // Auto-select country in dropdown if matched
    if (city.country) {
      setCountry(city.country);
    }

    // Auto-generate title if empty or default
    if (!title || title.startsWith('Trip to') || title.startsWith('Summer in')) {
      setTitle(`Journey to ${city.name}`);
    }

    // Update cover image if city has a photo
    if (city.image_url) {
      setCoverImage(city.image_url);
    } else {
      setCoverImage(
        `https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1000`
      );
    }

    setIsDropdownOpen(false);
    setSuggestions([]);
  };

  // Keyboard navigation for suggestions
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isDropdownOpen || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        e.preventDefault();
        handleSelectSuggestion(suggestions[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsDropdownOpen(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !destination) {
      showToast('Please fill in title and destination');
      return;
    }

    const newTripId = `trip-${Date.now()}`;
    const newTrip: Trip = {
      id: newTripId,
      title,
      destination,
      country: country || destination,
      startDate,
      endDate,
      coverImage:
        coverImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1000',
      budget: Number(budget),
      style,
      isPublic: true,
      collaborators: ['You'],
      days: [
        {
          id: `day-${Date.now()}-1`,
          dayNumber: 1,
          date: startDate,
          activities: [
            {
              id: `act-${Date.now()}-1`,
              time: '10:00 AM',
              title: `Explore ${destination} City Center`,
              category: 'Sightseeing',
              location: destination,
              cost: 25,
              completed: false,
            },
          ],
        },
      ],
    };

    try {
      const token = localStorage.getItem('globetrotter_token');
      await fetch('/api/trips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: title,
          description: `Trip to ${destination}`,
          start_date: startDate,
          end_date: endDate,
          cover_url: coverImage,
        }),
      });
    } catch (e) {
      // Offline fallback
    }

    addTrip(newTrip);
    showToast('🎉 Trip created successfully!');
    openTrip(newTripId, 'itinerary');
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Plan a New Journey</h1>
        <p className="mt-1 text-sm text-slate-500">
          Enter your destination with live auto-complete suggestions and choose your country.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-3xl bg-white p-8 shadow-sm border border-slate-100"
      >
        {/* Trip Title */}
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">
            Trip Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Summer in Southern Italy"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white"
            required
          />
        </div>

        {/* Primary City with Live Auto-Fill Suggestions & Country Dropdown */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* City / Destination Input with Floating Auto-Fill Menu */}
          <div className="relative" ref={containerRef}>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Primary City / Destination
              </label>
              {isLoadingSuggestions && (
                <span className="flex items-center gap-1 text-[11px] text-sky-600 font-semibold animate-pulse">
                  <Loader2 className="h-3 w-3 animate-spin" /> Searching…
                </span>
              )}
            </div>

            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={destination}
                onChange={(e) => {
                  setDestination(e.target.value);
                  setIsDropdownOpen(true);
                }}
                onFocus={() => {
                  if (suggestions.length > 0) setIsDropdownOpen(true);
                }}
                onKeyDown={handleKeyDown}
                placeholder="e.g. Florence, Rome, Mumbai"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white pr-10"
                required
                autoComplete="off"
              />
              <MapPin className="absolute right-3.5 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>

            {/* Auto-fill Suggestions Dropdown Popover */}
            {isDropdownOpen && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-50 mt-1.5 overflow-hidden rounded-2xl border border-slate-200 bg-white/95 shadow-xl backdrop-blur-md animate-fade-in">
                <div className="bg-slate-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 flex items-center justify-between">
                  <span>Suggested Destinations</span>
                  <span>Select to auto-fill</span>
                </div>
                <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
                  {suggestions.map((item, idx) => (
                    <button
                      key={`${item.name}-${item.country}-${idx}`}
                      type="button"
                      onClick={() => handleSelectSuggestion(item)}
                      onMouseEnter={() => setHighlightedIndex(idx)}
                      className={`flex w-full items-center justify-between px-3.5 py-2.5 text-left transition ${
                        highlightedIndex === idx
                          ? 'bg-sky-50 text-sky-900'
                          : 'hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="h-8 w-8 rounded-lg object-cover border border-slate-200"
                          />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 text-sky-600 font-bold text-xs">
                            <MapPin className="h-4 w-4" />
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-bold text-slate-900 leading-tight">
                            {item.name}
                          </div>
                          <div className="text-xs text-slate-500">
                            {item.region ? `${item.region}, ` : ''}
                            {item.country}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {item.cost_index && (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                            ${Math.round(item.cost_index * 80)}/day
                          </span>
                        )}
                        <span className="text-[11px] font-bold text-sky-600">Fill ↵</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Country Dropdown Menu */}
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">
              Country
            </label>
            <div className="relative">
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white pr-10 cursor-pointer"
              >
                <option value="">Select a country (or search global)</option>
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.name}>
                    {c.flag} {c.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3.5 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Start Date & End Date */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white"
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white"
              required
            />
          </div>
        </div>

        {/* Budget & Style */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">
              Budget Estimate ({formatCurrency(budget)})
            </label>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white"
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">
              Pace & Travel Style
            </label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value as TravelStyle)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white"
            >
              <option value="relaxed">Relaxed & Leisurely</option>
              <option value="balanced">Balanced Highlights</option>
              <option value="packed">Fast-Paced Explorer</option>
            </select>
          </div>
        </div>

        {/* Cover Photo */}
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">
            Cover Photo URL (Optional)
          </label>
          <input
            type="url"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            placeholder="https://images.unsplash.com/..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white"
          />
        </div>

        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 transition hover:bg-sky-700 active:scale-[0.99]"
        >
          <Sparkles className="h-4 w-4" /> Generate Smart Itinerary
        </button>
      </form>
    </div>
  );
}

export function MyTripsScreen() {
  const { trips, openTrip, deleteTrip, showToast, formatCurrency, navigate } = useApp();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">My Trips</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your saved journeys, itineraries, and collaborations.
          </p>
        </div>
        <button
          onClick={() => navigate('create-trip')}
          className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-sky-700 active:scale-95"
        >
          <Plus className="h-4 w-4" /> Plan New Trip
        </button>
      </div>

      {trips.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="text-base text-slate-500">No trips planned yet.</p>
          <button
            onClick={() => navigate('create-trip')}
            className="mt-4 rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white"
          >
            Create Your First Trip
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {trips.map((trip) => (
            <div
              key={trip.id}
              className="group overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div
                onClick={() => openTrip(trip.id, 'itinerary')}
                className="relative h-48 w-full cursor-pointer overflow-hidden"
              >
                <img
                  src={trip.coverImage}
                  alt={trip.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />
                <div className="absolute top-3 right-3 rounded-full bg-slate-900/80 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-md">
                  {formatCurrency(trip.budget)}
                </div>
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h3 className="text-lg font-bold">{trip.title}</h3>
                  <p className="text-xs text-slate-200 flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-sky-400" /> {trip.destination}
                  </p>
                </div>
              </div>

              <div className="p-5">
                <div className="mb-4 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1 font-medium">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" /> {trip.startDate}
                  </span>
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 font-semibold text-slate-700 uppercase">
                    {trip.style}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <button
                    onClick={() => openTrip(trip.id, 'itinerary')}
                    className="flex items-center gap-1 text-xs font-bold text-sky-600 hover:text-sky-700"
                  >
                    Open Itinerary <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTrip(trip.id);
                      showToast('Trip deleted');
                    }}
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                    title="Delete trip"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
