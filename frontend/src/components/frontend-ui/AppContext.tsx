import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';
import type {
  ScreenId,
  Trip,
  UserProfile,
  CurrencyCode,
  CurrencyInfo,
  ToastMsg,
  TravelStyle,
  NotificationPrefs,
} from './types';
import { CURRENCIES } from './types';
import { seedTrips, seedCities, seedActivities } from './seedData';

interface AppState {
  isAuthenticated: boolean;
  currentScreen: ScreenId;
  activeTripId: string | null;
  user: UserProfile;
  trips: Trip[];
  toast: ToastMsg | null;
  currency: CurrencyInfo;
  formatCurrency: (usd: number) => string;
  navigate: (screen: ScreenId) => void;
  openTrip: (tripId: string, screen?: ScreenId) => void;
  signIn: (email: string, name: string) => void;
  signOut: () => void;
  showToast: (msg: ToastMsg) => void;
  addTrip: (trip: Trip) => void;
  updateTrip: (tripId: string, updates: Partial<Trip>) => void;
  deleteTrip: (tripId: string) => void;
  toggleActivityComplete: (tripId: string, dayId: string, activityId: string) => void;
  updateUser: (updates: Partial<UserProfile>) => void;
  setCurrency: (code: CurrencyCode) => void;
}

const AppContext = createContext<AppState | null>(null);

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export function useCurrency() {
  const { user, currency, setCurrency, formatCurrency } = useApp();
  return {
    currency: user.currency,
    currencyInfo: currency,
    setCurrency,
    formatCurrency,
  };
}

const defaultUser: UserProfile = {
  name: 'Alex Rivera',
  email: 'alex@globetrotter.app',
  avatarColor: '#0ea5e9',
  bio: 'Chasing sunsets and street food, one city at a time.',
  homeBase: 'San Francisco, CA',
  notifications: {
    emailUpdates: true,
    tripReminders: true,
    collaboratorAlerts: false,
    marketingTips: true,
  },
  travelStyle: 'balanced',
  currency: 'USD',
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('dashboard');
  const [activeTripId, setActiveTripId] = useState<string | null>(seedTrips[0]?.id ?? null);
  const [user, setUser] = useState<UserProfile>(defaultUser);
  const [trips, setTrips] = useState<Trip[]>(seedTrips);
  const [toast, setToast] = useState<ToastMsg | null>(null);

  const showToast = useCallback((msg: ToastMsg) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2600);
  }, []);

  const navigate = useCallback((screen: ScreenId) => {
    setCurrentScreen(screen);
  }, []);

  const openTrip = useCallback((tripId: string, screen: ScreenId = 'itinerary') => {
    setActiveTripId(tripId);
    setCurrentScreen(screen);
  }, []);

  const signIn = useCallback((email: string, name: string) => {
    setUser((u) => ({ ...u, email, name: name || u.name }));
    setIsAuthenticated(true);
    setCurrentScreen('dashboard');
  }, []);

  const signOut = useCallback(() => {
    setIsAuthenticated(false);
  }, []);

  const addTrip = useCallback((trip: Trip) => {
    setTrips((prev) => [trip, ...prev]);
    setActiveTripId(trip.id);
  }, []);

  const updateTrip = useCallback((tripId: string, updates: Partial<Trip>) => {
    setTrips((prev) => prev.map((t) => (t.id === tripId ? { ...t, ...updates } : t)));
  }, []);

  const deleteTrip = useCallback((tripId: string) => {
    setTrips((prev) => prev.filter((t) => t.id !== tripId));
    setActiveTripId((cur) => (cur === tripId ? null : cur));
  }, []);

  const toggleActivityComplete = useCallback(
    (tripId: string, dayId: string, activityId: string) => {
      setTrips((prev) =>
        prev.map((t) => {
          if (t.id !== tripId) return t;
          return {
            ...t,
            days: t.days.map((d) => {
              if (d.id !== dayId) return d;
              return {
                ...d,
                activities: d.activities.map((a) =>
                  a.id === activityId ? { ...a, completed: !a.completed } : a
                ),
              };
            }),
          };
        })
      );
    },
    []
  );

  const updateUser = useCallback((updates: Partial<UserProfile>) => {
    setUser((u) => ({ ...u, ...updates }));
  }, []);

  const setCurrency = useCallback(
    (code: CurrencyCode) => {
      setUser((u) => ({ ...u, currency: code }));
      const info = CURRENCIES.find((c) => c.code === code);
      if (info) showToast(`Currency switched to ${info.label}`);
    },
    [showToast]
  );

  const currency = useMemo(
    () => CURRENCIES.find((c) => c.code === user.currency) ?? CURRENCIES[0],
    [user.currency]
  );

  const formatCurrency = useCallback(
    (usd: number) => {
      const converted = usd * currency.rate;
      const decimals = currency.rate > 100 ? 0 : currency.rate >= 10 ? 0 : 2;
      return `${currency.symbol}${converted.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}`;
    },
    [currency]
  );

  const value: AppState = {
    isAuthenticated,
    currentScreen,
    activeTripId,
    user,
    trips,
    toast,
    showToast,
    currency,
    formatCurrency,
    navigate,
    openTrip,
    signIn,
    signOut,
    addTrip,
    updateTrip,
    deleteTrip,
    toggleActivityComplete,
    updateUser,
    setCurrency,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export { seedCities, seedActivities };
export type { TravelStyle, NotificationPrefs };
