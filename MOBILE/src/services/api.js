import axios from 'axios';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 12000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const setAuthToken = (token) => {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
    return;
  }

  delete apiClient.defaults.headers.common.Authorization;
};

apiClient.interceptors.response.use(
  (response) => response.data?.data ?? response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Something went wrong. Please try again.';

    return Promise.reject(new Error(message));
  }
);

export const authApi = {
  login: (payload) => apiClient.post('/auth/login', payload),
  register: (payload) => apiClient.post('/auth/signup', payload),
  getProfile: () => apiClient.get('/auth/me'),
  updateProfile: (payload) => apiClient.put('/auth/profile', payload),
};

export const tripsApi = {
  getTrips: () => apiClient.get('/trips'),
  getTrip: (id) => apiClient.get(`/trips/${id}`),
  createTrip: (payload) => apiClient.post('/trips', payload),
  getUpcomingTrips: () => apiClient.get('/trips/upcoming'),
  getRecentTrips: () => apiClient.get('/trips/recent'),
};

export const exploreApi = {
  getDestinations: (params = {}) => apiClient.get('/explore', { params }),
};

export const savedApi = {
  getSavedPlaces: () => apiClient.get('/saved'),
  savePlace: (payload) => apiClient.post('/saved', payload),
  updateSavedPlace: (id, payload) => apiClient.put(`/saved/${id}`, payload),
  deleteSavedPlace: (id) => apiClient.delete(`/saved/${id}`),
  toggleFavorite: (id) => apiClient.patch(`/saved/${id}/toggle-favorite`),
};

export const bookingsApi = {
  getBookings: async () => {
    // TODO: Add a BACKEND /api/bookings route and replace this placeholder call.
    return [];
  },
  createBooking: async (payload) => {
    // TODO: Add a BACKEND /api/bookings route and persist this booking on the server.
    return {
      id: `booking-${Date.now()}`,
      status: 'pending',
      ...payload,
    };
  },
};

export const wishlistApi = {
  getWishlist: () => savedApi.getSavedPlaces(),
  saveWishlistItem: (payload) => savedApi.savePlace(payload),
  removeWishlistItem: (id) => savedApi.deleteSavedPlace(id),
};

export const notificationsApi = {
  getNotifications: async () => {
    // TODO: Add a BACKEND /api/notifications route and return user notifications.
    return [];
  },
};

export default apiClient;
