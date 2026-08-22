import { useState } from 'react';
import { useApp } from '../AppContext';
import type { TravelStyle, Trip } from '../types';
import { Plus, Trash2, Calendar, MapPin, DollarSign, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

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
          Enter your destinations and preferences to generate an itinerary.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl bg-white p-8 shadow-sm border border-slate-100">
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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">
              Primary City / Destination
            </label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Florence, Rome, Amalfi"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white"
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">
              Country
            </label>
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="e.g. Italy"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white"
            />
          </div>
        </div>

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
