import type { ReactNode } from 'react';

export type ScreenId =
  | 'dashboard'
  | 'my-trips'
  | 'create-trip'
  | 'itinerary'
  | 'discover-cities'
  | 'discover-activities'
  | 'budget'
  | 'calendar'
  | 'public-view'
  | 'profile';

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'INR' | 'JPY' | 'AUD';

export interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  label: string;
  rate: number; // relative to USD
}

export const CURRENCIES: CurrencyInfo[] = [
  { code: 'USD', symbol: '$', label: 'USD ($)', rate: 1 },
  { code: 'EUR', symbol: '€', label: 'EUR (€)', rate: 0.92 },
  { code: 'GBP', symbol: '£', label: 'GBP (£)', rate: 0.79 },
  { code: 'INR', symbol: '₹', label: 'INR (₹)', rate: 83.2 },
  { code: 'JPY', symbol: '¥', label: 'JPY (¥)', rate: 156.3 },
  { code: 'AUD', symbol: 'A$', label: 'AUD (A$)', rate: 1.51 },
];

export type TravelStyle = 'relaxed' | 'balanced' | 'packed';

export interface Activity {
  id: string;
  time: string;
  title: string;
  category: string;
  location: string;
  notes?: string;
  cost: number; // in USD
  completed?: boolean;
}

export interface DayPlan {
  id: string;
  dayNumber: number;
  date: string;
  activities: Activity[];
}

export interface Trip {
  id: string;
  title: string;
  destination: string;
  country: string;
  startDate: string;
  endDate: string;
  coverImage: string;
  budget: number; // in USD
  style: TravelStyle;
  days: DayPlan[];
  collaborators: string[];
  isPublic: boolean;
}

export interface NotificationPrefs {
  emailUpdates: boolean;
  tripReminders: boolean;
  collaboratorAlerts: boolean;
  marketingTips: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  avatarColor: string;
  bio: string;
  homeBase: string;
  notifications: NotificationPrefs;
  travelStyle: TravelStyle;
  currency: CurrencyCode;
}

export interface CityResult {
  id: string;
  name: string;
  country: string;
  image: string;
  tagline: string;
  vibe: string[];
  avgDailyBudget: number;
}

export interface ActivityIdea {
  id: string;
  title: string;
  category: string;
  city: string;
  image: string;
  description: string;
  durationHours: number;
  cost: number;
  rating: number;
}

export type ToastMsg = string | ReactNode;
