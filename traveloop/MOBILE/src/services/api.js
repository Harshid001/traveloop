import axios from 'axios';
import { getStoredToken, storeToken, clearStoredToken } from './tokenStorage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

const apiClient = axios.create({ baseURL: API_BASE_URL });

apiClient.interceptors.request.use(async (config) => {
  const token = await getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearStoredToken();
    }
    return Promise.reject(error);
  }
);

const apiGet = (url, params) => apiClient.get(url, { params }).then((r) => r.data.data ?? r.data);
const apiPost = (url, body) => apiClient.post(url, body).then((r) => r.data.data ?? r.data);

export const getTrendingDestinations = () => apiGet('/discover/trending');
export const getSeasonalRecommendations = (params) => apiGet('/discover/seasonal', params);
export const getDestinationDetails = (id) => apiGet(`/destinations/${id}`);
export const searchDestinations = (q) => apiGet('/search', { q });

export const hydrateAuthToken = async () => {
  const token = await getStoredToken();
  return token;
};

export const persistAuthToken = async (token) => {
  if (token) await storeToken(token);
  else await clearStoredToken();
};

export const authApi = {
  login: (body) => apiPost('/auth/login', body),
  register: (body) => apiPost('/auth/register', body),
};

export const bookingsApi = {
  list: () => apiGet('/bookings'),
  create: (body) => apiPost('/bookings', body),
};

export const tripsApi = {
  getTrips: (params) => apiGet('/trips', params),
  create: (body) => apiPost('/trips', body),
  getTrip: (id) => apiGet(`/trips/${id}`),
  updateTrip: (id, body) => apiClient.put(`/trips/${id}`, body).then((r) => r.data.data ?? r.data),
  deleteTrip: (id) => apiClient.delete(`/trips/${id}`).then((r) => r.data.data ?? r.data),
};

export const chatbotApi = {
  send: (body) => apiPost('/chatbot/message', body),
};

export const journalApi = {
  list: () => apiGet('/journals'),
  create: (body) => apiPost('/journals', body),
};

export const notificationsApi = {
  list: () => apiGet('/notifications'),
  getNotifications: () => apiGet('/notifications'),
  markRead: (id) => apiClient.patch(`/notifications/${id}/read`).then((r) => r.data.data ?? r.data),
  markAsRead: (id) => apiClient.patch(`/notifications/${id}/read`).then((r) => r.data.data ?? r.data),
  deleteNotification: (id) => apiClient.delete(`/notifications/${id}`).then((r) => r.data.data ?? r.data),
};

export const wishlistApi = {
  list: () => apiGet('/wishlist'),
  saveWishlistItem: (destinationId, body) => apiPost(`/wishlist/${destinationId}`, body),
};

export const imagesApi = {
  destination: (destinationName) => apiGet(`/images/destination/${destinationName}`),
  search: (params) => apiGet('/images/search', params),
  random: () => apiGet('/images/random'),
};

export const placesApi = {
  nearby: (params) => apiGet('/places/nearby', params),
  details: (id) => apiGet(`/places/details/${id}`),
  photos: (photoReference) => apiGet(`/places/photos/${photoReference}`),
  autocomplete: (params) => apiGet('/places/autocomplete', params),
};

export const mapsApi = {
  reverseGeocode: (lat, lng) => apiGet(`/maps/reverse-geocode?lat=${lat}&lng=${lng}`),
};

export const discoverApi = {
  smartSearch: (query, filters = {}) => {
    const params = new URLSearchParams({ q: query, ...filters });
    return apiGet(`/discover/smart-search?${params.toString()}`);
  },
};