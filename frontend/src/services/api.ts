/**
 * GlobeTrotter Backend API Service Layer
 * Connects frontend views with Flask backend endpoints (Phase 1, 2 & 3)
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
  start_date?: string;
  end_date?: string;
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
  stop_activities?: Array<{
    id: number;
    stop_id: number;
    activity_id: number;
    day_number?: number;
    time_slot?: string;
    notes?: string;
    activity?: BackendActivity;
  }>;
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
  cost_estimate?: number;
  estimated_cost?: number;
  duration_hours?: number;
  city_id?: number;
  image_url?: string;
  address?: string;
  rating?: number;
  is_custom?: boolean;
}

export const tripsApi = {
  getTrips: async (): Promise<BackendTrip[]> => {
    return request<BackendTrip[]>('/trips');
  },

  createTrip: async (data: { name: string; description?: string; cover_url?: string; start_date?: string; end_date?: string }): Promise<BackendTrip> => {
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
    data: { name?: string; description?: string; cover_url?: string; is_public?: boolean; start_date?: string; end_date?: string }
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
      total_cost: number;
      total_estimated_cost_usd: number;
      currency: string;
      avg_per_day: number;
      num_days: number;
      by_category: Record<string, number>;
      categories: Record<string, number>;
      by_stop: Array<{
        stop_id: number;
        city: string;
        cost: number;
        cost_usd: number;
        activity_count: number;
        activities?: any[];
      }>;
      stops_breakdown: Array<{
        city: string;
        stop_id: number;
        cost_usd: number;
        activity_count: number;
      }>;
    }>(`/trips/${tripId}/budget`);
  },

  getTripTimeline: async (tripId: number | string) => {
    return request<{
      trip_id: number;
      name: string;
      start_date: string;
      end_date: string;
      days: Array<{
        day_number: number;
        date?: string;
        slots: {
          morning: any[];
          afternoon: any[];
          evening: any[];
        };
        activities: any[];
      }>;
    }>(`/trips/${tripId}/timeline`);
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
export interface ActivityFilterParams {
  city_id?: number;
  category?: string;
  q?: string;
  min_cost?: number;
  max_cost?: number;
  max_duration?: number;
  sort_by?: 'cost_asc' | 'cost_desc' | 'duration_asc' | 'duration_desc' | string;
  limit?: number;
}

export const activitiesApi = {
  searchActivities: async (params?: ActivityFilterParams): Promise<BackendActivity[]> => {
    const searchParams = new URLSearchParams();
    if (params?.city_id) searchParams.append('city_id', String(params.city_id));
    if (params?.category) searchParams.append('category', params.category);
    if (params?.q) searchParams.append('q', params.q);
    if (params?.min_cost !== undefined) searchParams.append('min_cost', String(params.min_cost));
    if (params?.max_cost !== undefined) searchParams.append('max_cost', String(params.max_cost));
    if (params?.max_duration !== undefined) searchParams.append('max_duration', String(params.max_duration));
    if (params?.sort_by) searchParams.append('sort_by', params.sort_by);
    if (params?.limit) searchParams.append('limit', String(params.limit));
    const qs = searchParams.toString();
    return request<BackendActivity[]>(`/activities${qs ? `?${qs}` : ''}`);
  },

  createCustomActivity: async (data: {
    name: string;
    description?: string;
    category?: string;
    cost_estimate?: number;
    duration_hours?: number;
    city_id?: number;
    image_url?: string;
  }): Promise<BackendActivity> => {
    return request<BackendActivity>('/activities', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  addStopActivity: async (
    stopId: number | string,
    data: { activity_id: number; day_number?: number; time_slot?: string; notes?: string }
  ) => {
    return request(`/stops/${stopId}/activities`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  removeStopActivity: async (stopId: number | string, activityId: number | string) => {
    return request(`/stops/${stopId}/activities/${activityId}`, {
      method: 'DELETE',
    });
  },
};

// ---------------- SHARE API ----------------
export const shareApi = {
  shareTrip: async (tripId: number | string): Promise<{ share_token: string; share_url: string; url: string; is_public: boolean }> => {
    return request<{ share_token: string; share_url: string; url: string; is_public: boolean }>(`/trips/${tripId}/share`, {
      method: 'POST',
    });
  },

  revokeShareTrip: async (tripId: number | string): Promise<{ message: string; is_public: boolean }> => {
    return request<{ message: string; is_public: boolean }>(`/trips/${tripId}/share`, {
      method: 'DELETE',
    });
  },

  getSharedTrip: async (token: string): Promise<BackendTrip> => {
    return request<BackendTrip>(`/share/${token}`);
  },
};
