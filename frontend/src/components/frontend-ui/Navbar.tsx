import { useState } from 'react';
import { useApp } from './AppContext';
import type { ScreenId } from './types';
import {
  Compass,
  LayoutDashboard,
  Plus,
  Plane,
  CalendarDays,
  Wallet,
  User,
  Menu,
  X,
  LogOut,
} from 'lucide-react';

interface NavItem {
  id: ScreenId;
  label: string;
  icon: typeof Compass;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'my-trips', label: 'My Trips', icon: Plane },
  { id: 'create-trip', label: 'Plan New', icon: Plus },
  { id: 'discover-cities', label: 'Discover', icon: Compass },
  { id: 'budget', label: 'Budget', icon: Wallet },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays },
];

export function Navbar() {
  const { currentScreen, navigate, user, signOut } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNav = (id: ScreenId) => {
    navigate(id);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <button onClick={() => handleNav('dashboard')} className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-cyan-600 text-white shadow-md">
            <Compass size={20} />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900">
            Globe<span className="text-sky-600">Trotter</span>
          </span>
        </button>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-sky-50 text-sky-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon size={16} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User */}
        <div className="hidden items-center gap-3 md:flex">
          <button
            onClick={() => handleNav('profile')}
            className="flex items-center gap-2 rounded-lg p-1 pr-3 transition-colors hover:bg-slate-100"
          >
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white"
              style={{ backgroundColor: user.avatarColor }}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium text-slate-700">{user.name.split(' ')[0]}</span>
          </button>
          <button
            onClick={signOut}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            title="Sign out"
          >
            <LogOut size={18} />
          </button>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <nav className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = currentScreen === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    active ? 'bg-sky-50 text-sky-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </button>
              );
            })}
            <button
              onClick={() => handleNav('profile')}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              <User size={18} />
              Profile
            </button>
            <button
              onClick={signOut}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </nav>
      )}
    </header>
  );
}
