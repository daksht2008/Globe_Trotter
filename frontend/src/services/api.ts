/**
 * GlobeTrotter Backend API Service Layer
 * Connects frontend views with Flask backend endpoints
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

function getAuthToken(): string | null {
  return localStorage.getItem('globetrotter_token');
}

export function setAuthToken(token: string) {
  localStorage.setItem('globetrotter_token', token);
}

export function clearAuthToken() {
  localStorage.removeItem('globetrotter_token');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `HTTP ${response.status}: ${response.statusText}`;
    try {
      const errData = await response.json();
      errorMsg = errData.error || errData.message || errorMsg;
    } catch {
      // fallback to status text
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

// ---------------- AUTH API ----------------
export interface AuthResponse {
  user: {
    id: number;
    email: string;
    name: string;
    created_at?: string;
  };
  token: string;
}

export const authApi = {
  signup: async (data: { email: string; password: string; name: string }): Promise<AuthResponse> => {
    const res = await request<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res.token) setAuthToken(res.token);
    return res;
  },

  login: async (data: { email: string; password: string }): Promise<AuthResponse> => {
    const res = await request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res.token) setAuthToken(res.token);
    return res;
  },

  getMe: async () => {
    return request<{ user: { id: number; email: string; name: string } }>('/auth/me');
  },

  logout: () => {
    clearAuthToken();
  },
};

// ---------------- TRIPS API ----------------
export interface BackendTrip {
  id: number;
  user_id: number;
  name: string;
  description?: string;
  cover_url?: string;
  is_public: boolean;
  share_token?: string;
  created_at: string;
  updated_at: string;
  stops?: BackendStop[];
}

export interface BackendStop {
  id: number;
  trip_id: number;
  city_id: number;
  order_index: number;
  notes?: string;
  city?: BackendCity;
  activities?: BackendActivity[];
}

export interface BackendCity {
  id: number;
  name: string;
  country: string;
  region?: string;
  lat?: number;
  lng?: number;
  popularity?: number;
  image_url?: string;
  activities?: BackendActivity[];
}

export interface BackendActivity {
  id: number;
  name: string;
  description?: string;
  category?: string;
  estimated_cost?: number;
  duration_hours?: number;
  city_id: number;
  image_url?: string;
  address?: string;
  rating?: number;
  is_custom?: boolean;
}

export const tripsApi = {
  getTrips: async (): Promise<BackendTrip[]> => {
    return request<BackendTrip[]>('/trips');
  },

  createTrip: async (data: { name: string; description?: string; cover_url?: string }): Promise<BackendTrip> => {
    return request<BackendTrip>('/trips', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getTripDetail: async (tripId: number | string): Promise<BackendTrip> => {
    return request<BackendTrip>(`/trips/${tripId}`);
  },

  updateTrip: async (
    tripId: number | string,
    data: { name?: string; description?: string; cover_url?: string; is_public?: boolean }
  ): Promise<BackendTrip> => {
    return request<BackendTrip>(`/trips/${tripId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteTrip: async (tripId: number | string): Promise<{ message: string }> => {
    return request<{ message: string }>(`/trips/${tripId}`, {
      method: 'DELETE',
    });
  },

  getTripBudget: async (tripId: number | string) => {
    return request<{
      trip_id: number;
      total_estimated_cost_usd: number;
      currency: string;
      categories: Record<string, number>;
      stops_breakdown: Array<{
        city: string;
        stop_id: number;
        cost_usd: number;
        activity_count: number;
      }>;
    }>(`/trips/${tripId}/budget`);
  },
};

// ---------------- CITIES & DISCOVERY API ----------------
export const citiesApi = {
  getCities: async (params?: { q?: string; country?: string; region?: string }): Promise<BackendCity[]> => {
    const searchParams = new URLSearchParams();
    if (params?.q) searchParams.append('q', params.q);
    if (params?.country) searchParams.append('country', params.country);
    if (params?.region) searchParams.append('region', params.region);
    const qs = searchParams.toString();
    return request<BackendCity[]>(`/cities${qs ? `?${qs}` : ''}`);
  },

  getCityDetail: async (cityId: number | string): Promise<BackendCity & { activities: BackendActivity[]; country_info?: any }> => {
    return request<BackendCity & { activities: BackendActivity[]; country_info?: any }>(`/cities/${cityId}`);
  },
};

// ---------------- STOPS API ----------------
export const stopsApi = {
  getStops: async (tripId: number | string): Promise<BackendStop[]> => {
    return request<BackendStop[]>(`/trips/${tripId}/stops`);
  },

  addStop: async (
    tripId: number | string,
    data: { city_id: number; order_index?: number; notes?: string }
  ): Promise<BackendStop> => {
    return request<BackendStop>(`/trips/${tripId}/stops`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateStop: async (
    stopId: number | string,
    data: { order_index?: number; notes?: string }
  ): Promise<BackendStop> => {
    return request<BackendStop>(`/stops/${stopId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteStop: async (stopId: number | string): Promise<{ message: string }> => {
    return request<{ message: string }>(`/stops/${stopId}`, {
      method: 'DELETE',
    });
  },

  reorderStops: async (tripId: number | string, stop_ids: number[]): Promise<BackendStop[]> => {
    return request<BackendStop[]>(`/trips/${tripId}/stops/reorder`, {
      method: 'PUT',
      body: JSON.stringify({ stop_ids }),
    });
  },
};

// ---------------- ACTIVITIES API ----------------
export const activitiesApi = {
  createCustomActivity: async (
    cityId: number | string,
    data: { name: string; description?: string; category?: string; estimated_cost?: number; duration_hours?: number; address?: string }
  ): Promise<BackendActivity> => {
    return request<BackendActivity>(`/cities/${cityId}/activities`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  attachToStop: async (stopId: number | string, activityId: number | string) => {
    return request(`/stops/${stopId}/activities/${activityId}`, {
      method: 'POST',
    });
  },

  removeFromStop: async (stopId: number | string, activityId: number | string) => {
    return request(`/stops/${stopId}/activities/${activityId}`, {
      method: 'DELETE',
    });
  },
};

// ---------------- SHARE API ----------------
export const shareApi = {
  shareTrip: async (tripId: number | string): Promise<{ share_token: string; url: string }> => {
    return request<{ share_token: string; url: string }>(`/trips/${tripId}/share`, {
      method: 'POST',
    });
  },

  getSharedTrip: async (token: string): Promise<BackendTrip> => {
    return request<BackendTrip>(`/share/${token}`);
  },
};
