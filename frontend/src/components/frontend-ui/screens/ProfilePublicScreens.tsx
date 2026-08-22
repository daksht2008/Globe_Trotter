import { useState } from 'react';
import { useApp } from '../AppContext';
import { CURRENCIES, type CurrencyCode } from '../types';
import { User, Globe, DollarSign, Bell, LogOut, Check, Share2, Copy } from 'lucide-react';

export function ProfileScreen() {
  const { user, updateUser, setCurrency, signOut, showToast } = useApp();
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio);
  const [homeBase, setHomeBase] = useState(user.homeBase);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ name, bio, homeBase });
    showToast('Profile updated successfully');
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Account & Preferences</h1>
        <p className="mt-1 text-sm text-slate-500">Manage your profile, currency, and settings.</p>
      </div>

      <div className="space-y-6">
        {/* Profile Card */}
        <form onSubmit={handleSave} className="rounded-3xl border border-slate-100 bg-white p-6 sm:p-8 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Personal Details</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">
                Email
              </label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm text-slate-500"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">
                Home Base
              </label>
              <input
                type="text"
                value={homeBase}
                onChange={(e) => setHomeBase(e.target.value)}
                placeholder="e.g. London, UK"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={2}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              className="rounded-xl bg-sky-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-sky-700"
            >
              Save Profile
            </button>
          </div>
        </form>

        {/* Currency Selection */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 sm:p-8 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-2">Display Currency</h2>
          <p className="text-xs text-slate-500 mb-6">Choose your preferred currency for cost calculations.</p>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {CURRENCIES.map((c) => (
              <button
                key={c.code}
                onClick={() => setCurrency(c.code)}
                className={`flex items-center justify-between rounded-xl border p-3.5 text-sm font-semibold transition ${
                  user.currency === c.code
                    ? 'border-sky-500 bg-sky-50/50 text-sky-900 shadow-sm'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{c.label}</span>
                {user.currency === c.code && <Check className="h-4 w-4 text-sky-600" />}
              </button>
            ))}
          </div>
        </div>

        {/* Sign Out Button */}
        <div className="rounded-3xl border border-red-100 bg-red-50/30 p-6 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-red-950">Sign Out</h3>
            <p className="text-xs text-red-600">End your current session on this device.</p>
          </div>
          <button
            onClick={() => {
              signOut();
              showToast('Signed out');
            }}
            className="flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-red-700"
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

export function PublicItineraryScreen() {
  const { trips, activeTripId, formatCurrency, showToast } = useApp();
  const trip = trips.find((t) => t.id === activeTripId) || trips[0];

  if (!trip) return <div className="p-8 text-center text-slate-500">Trip not found</div>;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 uppercase">
            Public Shared Itinerary
          </span>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">{trip.title}</h1>
          <p className="text-sm text-slate-500">{trip.destination} • {trip.startDate} to {trip.endDate}</p>
        </div>
        <button
          onClick={() => {
            navigator.clipboard?.writeText(window.location.href);
            showToast('📋 Link copied to clipboard!');
          }}
          className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800"
        >
          <Copy className="h-4 w-4" /> Copy Link
        </button>
      </div>

      <div className="space-y-6">
        {trip.days.map((day) => (
          <div key={day.id} className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4">
              Day {day.dayNumber} Schedule
            </h3>
            <div className="space-y-3">
              {day.activities.map((act) => (
                <div key={act.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3.5 text-xs">
                  <div>
                    <span className="font-semibold text-slate-400">{act.time}</span>
                    <h4 className="font-bold text-slate-900 mt-0.5">{act.title}</h4>
                    <p className="text-slate-500">{act.location}</p>
                  </div>
                  <span className="font-bold text-slate-900">{formatCurrency(act.cost)}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
