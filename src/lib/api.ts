const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface LocalizedString {
  en: string;
  ja: string;
  zh: string;
}

export interface Clinic {
  _id: string;
  name: LocalizedString;
  city: 'seoul' | 'busan' | 'jeju';
  address: LocalizedString;
  phone: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  languages: string[];
  hours: Record<string, string>;
  tags: string[];
  rating: number;
  reviewCount: number;
  images: string[];
  description: LocalizedString;
  externalReviewLinks: { source: string; url: string }[];
  distance?: number;
}

export interface BookingRequest {
  _id: string;
  clinic: Clinic;
  procedure: string;
  preferredDate: string;
  preferredTimeSlot?: string;
  budget?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  notes?: string;
  status: string;
  statusHistory?: {
    status: string;
    changedAt: string;
    note?: string;
  }[];
  proposedOptions?: {
    date: string;
    timeSlot: string;
    price: number;
    note?: string;
  }[];
  confirmedOption?: {
    date: string;
    timeSlot: string;
    price: number;
  };
  accessCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookingListItem {
  _id: string;
  clinic: Pick<Clinic, '_id' | 'name' | 'address' | 'phone'>;
  procedure: string;
  preferredDate: string;
  preferredTimeSlot?: string;
  status: string;
  accessCode: string;
  createdAt: string;
  confirmedOption?: {
    date: string;
    timeSlot: string;
    price: number;
  };
}

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      credentials: 'include',
    });
    return await res.json();
  } catch (error) {
    console.error('API Error:', error);
    return { success: false, error: 'Network error' };
  }
}

// Clinics API
export async function searchClinics(params: {
  city?: string;
  tags?: string;
  q?: string;
  sort?: string;
  lat?: number;
  lng?: number;
  page?: number;
  limit?: number;
}): Promise<ApiResponse<PaginatedResponse<Clinic>>> {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) query.set(key, String(value));
  });
  return fetchApi(`/v1/clinics?${query}`);
}

export async function getClinic(id: string): Promise<ApiResponse<Clinic>> {
  return fetchApi(`/v1/clinics/${id}`);
}

export async function getClinicReviews(
  id: string
): Promise<ApiResponse<{ externalLinks: { source: string; url: string }[]; reviews: unknown[] }>> {
  return fetchApi(`/v1/clinics/${id}/reviews`);
}

// Booking API
export async function createBookingRequest(data: {
  clinicId: string;
  procedure: string;
  preferredDate: string;
  preferredTimeSlot?: string;
  budget?: { min?: number; max?: number; currency?: string };
  guestEmail?: string;
  guestPhone?: string;
  photos?: string[];
  locale?: string;
  notes?: string;
}): Promise<ApiResponse<{ id: string; accessCode: string; status: string; message: string }>> {
  return fetchApi('/v1/booking-requests', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getBookingRequest(
  id: string,
  accessCode?: string
): Promise<ApiResponse<BookingRequest>> {
  const query = accessCode ? `?accessCode=${accessCode}` : '';
  return fetchApi(`/v1/booking-requests/${id}${query}`);
}

export async function getMyBookingRequests(params: {
  email?: string;
  accessCode?: string;
  page?: number;
  limit?: number;
  status?: string;
}): Promise<ApiResponse<PaginatedResponse<BookingListItem>>> {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) query.set(key, String(value));
  });
  return fetchApi(`/v1/booking-requests/my-requests?${query}`);
}

// Get booking requests for logged-in user (no email/accessCode needed)
export async function getMyBookingRequestsAuth(params?: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<ApiResponse<PaginatedResponse<BookingListItem>>> {
  const query = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) query.set(key, String(value));
    });
  }
  return fetchApi(`/v1/booking-requests/my-requests?${query}`);
}

// Auth API
export async function getCurrentUser(): Promise<
  ApiResponse<{
    id: string;
    email: string;
    name: string;
    locale: string;
    profileImage?: string;
  }>
> {
  return fetchApi('/v1/auth/me');
}

export async function logout(): Promise<ApiResponse<{ message: string }>> {
  return fetchApi('/v1/auth/logout', { method: 'POST' });
}

// Ops API
export async function getOpsQueue(params: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<
  ApiResponse<
    PaginatedResponse<
      BookingRequest & {
        sla: { hoursElapsed: number; hoursRemaining: number; isOverdue: boolean };
      }
    >
  >
> {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) query.set(key, String(value));
  });
  return fetchApi(`/v1/ops/booking-requests?${query}`);
}

export async function updateBookingStatus(
  id: string,
  data: {
    status: string;
    note?: string;
    proposedOptions?: { date: string; timeSlot: string; price: number; note?: string }[];
    confirmedOption?: { date: string; timeSlot: string; price: number };
  }
): Promise<ApiResponse<{ id: string; status: string; message: string }>> {
  return fetchApi(`/v1/ops/booking-requests/${id}/status`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getOpsStats(): Promise<
  ApiResponse<{
    statusCounts: Record<string, number>;
    totalRequests: number;
    conversionRate: number;
    pending: number;
  }>
> {
  return fetchApi('/v1/ops/stats');
}
