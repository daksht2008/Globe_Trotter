import { AppProvider, useApp } from '@/components/frontend-ui/AppContext';
import { Navbar } from '@/components/frontend-ui/Navbar';
import { AuthScreen } from '@/components/frontend-ui/screens/AuthScreen';
import { DashboardScreen } from '@/components/frontend-ui/screens/DashboardScreen';
import { CreateTripScreen, MyTripsScreen } from '@/components/frontend-ui/screens/TripScreens';
import { ItineraryScreen } from '@/components/frontend-ui/screens/ItineraryScreen';
import { CitySearchScreen, ActivityExplorerScreen } from '@/components/frontend-ui/screens/DiscoveryScreens';
import { BudgetScreen, CalendarScreen } from '@/components/frontend-ui/screens/BudgetCalendarScreens';
import { PublicItineraryScreen, ProfileScreen } from '@/components/frontend-ui/screens/ProfilePublicScreens';

function Toast() {
  const { toast } = useApp();
  if (!toast) return null;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up">
      <div className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-2xl">
        {toast}
      </div>
    </div>
  );
}

function AppContent() {
  const { isAuthenticated, currentScreen } = useApp();

  if (!isAuthenticated) {
    return (
      <>
        <AuthScreen />
        <Toast />
      </>
    );
  }

  const screens: Record<typeof currentScreen, React.ReactNode> = {
    dashboard: <DashboardScreen />,
    'my-trips': <MyTripsScreen />,
    'create-trip': <CreateTripScreen />,
    itinerary: <ItineraryScreen />,
    'discover-cities': <CitySearchScreen />,
    'discover-activities': <ActivityExplorerScreen />,
    budget: <BudgetScreen />,
    calendar: <CalendarScreen />,
    'public-view': <PublicItineraryScreen />,
    profile: <ProfileScreen />,
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main>{screens[currentScreen]}</main>
      <Toast />
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
