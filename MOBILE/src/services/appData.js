import { destinations, myTrips, notifications as demoNotifications, profile as demoProfile } from '../constants/data';
import { getJson, setJson, STORAGE_KEYS } from './storage';

const today = new Date();

export function normalizeDestination(item) {
  return {
    ...item,
    id: String(item.id || item._id || item.name),
    name: item.name || item.title,
    title: item.title || `${item.name} Getaway`,
    country: item.country || item.destination || '',
    location: item.location || [item.name, item.country].filter(Boolean).join(', '),
    type: item.type || item.category || 'city',
    duration: item.duration || item.bestTime || 'Flexible',
    durationDays: item.durationDays || Number(String(item.duration || '').match(/\d+/)?.[0]) || 4,
    price: item.price || (item.budgetEstimate ? `INR ${Number(item.budgetEstimate).toLocaleString('en-IN')}` : 'Custom plan'),
    budgetAmount: item.budgetAmount || Number(String(item.price || item.estimatedBudget || item.budgetEstimate || '').replace(/\D/g, '')) || 0,
    image: item.image || destinations[0].image,
    rating: Number(item.rating || 4.7),
    bestTime: item.bestTime || item.bestTimeToVisit || 'Flexible',
    description: item.description || 'A Traveloop destination ready to compare, save, and plan.',
    activities: Array.isArray(item.activities) ? item.activities : [],
    facilities: item.facilities || ['Hotel', 'Meals', 'Guide', 'Transfers'],
  };
}

export function normalizeTrip(trip) {
  const startDate = trip.startDate || trip.date || '';
  const endDate = trip.endDate || '';
  return {
    id: String(trip._id || trip.id || Date.now()),
    title: trip.title || trip.tripTitle || trip.name || 'Untitled trip',
    status: calculateTripStatus({ ...trip, startDate, endDate }),
    startDate,
    endDate,
    destinations: Array.isArray(trip.destinations) ? trip.destinations : [trip.destination || trip.location].filter(Boolean),
    totalBudget: trip.totalBudget || trip.budget || trip.price || 'Custom budget',
    budgetAmount: Number(String(trip.budget || trip.totalBudget || trip.price || '').replace(/\D/g, '')) || 0,
    image: trip.image || trip.coverImage || destinations[0].image,
    activities: Number(trip.activities || trip.activitiesCount || trip.tags?.length || 0) || 4,
    rating: trip.rating || 4.8,
    description: trip.description || 'A planned Traveloop journey with itinerary, budget, packing, and journal tools.',
    type: trip.type || trip.tripType || 'custom',
    facilities: trip.facilities || ['Itinerary', 'Budget', 'Packing', 'Journal'],
  };
}

export function calculateTripStatus(trip) {
  if (trip.status && trip.status !== 'planning') return trip.status === 'ongoing' ? 'active' : trip.status;
  const start = trip.startDate ? new Date(trip.startDate) : null;
  const end = trip.endDate ? new Date(trip.endDate) : null;
  if (start && end && start <= today && today <= end) return 'active';
  if (start && start > today) return 'upcoming';
  if (end && end < today) return 'completed';
  return 'upcoming';
}

export async function getCurrentUser() {
  return getJson(STORAGE_KEYS.user, demoProfile);
}

export async function setCurrentUser(user) {
  return setJson(STORAGE_KEYS.user, user);
}

export async function getLocalWishlist() {
  const stored = await getJson(STORAGE_KEYS.wishlist, null);
  return stored || [];
}

export async function saveWishlistItem(destination) {
  const wishlist = await getLocalWishlist();
  const normalized = normalizeDestination(destination);
  const exists = wishlist.some((item) => String(item.id) === String(normalized.id));
  const next = exists ? wishlist : [normalized, ...wishlist];
  await setJson(STORAGE_KEYS.wishlist, next);
  return next;
}

export async function removeWishlistItem(id) {
  const wishlist = await getLocalWishlist();
  const next = wishlist.filter((item) => String(item.id) !== String(id));
  await setJson(STORAGE_KEYS.wishlist, next);
  return next;
}

export async function getLocalTrips() {
  const stored = await getJson(STORAGE_KEYS.trips, null);
  return stored || myTrips.map(normalizeTrip);
}

export async function saveLocalTrip(trip) {
  const trips = await getLocalTrips();
  const normalized = normalizeTrip({ ...trip, id: trip.id || `local-trip-${Date.now()}` });
  const next = [normalized, ...trips.filter((item) => item.id !== normalized.id)];
  await setJson(STORAGE_KEYS.trips, next);
  return normalized;
}

export async function deleteLocalTrip(id) {
  const trips = await getLocalTrips();
  const next = trips.filter((item) => String(item.id) !== String(id));
  await setJson(STORAGE_KEYS.trips, next);
  return next;
}

export async function getLocalNotifications() {
  const stored = await getJson(STORAGE_KEYS.notifications, null);
  return stored || demoNotifications.map((item) => ({ ...item, read: false, type: item.type || 'system' }));
}

export async function addNotification(notification) {
  const notifications = await getLocalNotifications();
  const next = [{ id: `n-${Date.now()}`, time: 'Just now', read: false, ...notification }, ...notifications];
  await setJson(STORAGE_KEYS.notifications, next);
  return next;
}

export async function updateNotifications(next) {
  await setJson(STORAGE_KEYS.notifications, next);
  return next;
}

export async function getLocalBookings() {
  return getJson(STORAGE_KEYS.bookings, []);
}

export async function saveLocalBooking(booking) {
  const bookings = await getLocalBookings();
  const nextBooking = { id: `booking-${Date.now()}`, status: 'requested', createdAt: new Date().toISOString(), ...booking };
  await setJson(STORAGE_KEYS.bookings, [nextBooking, ...bookings]);
  await addNotification({
    type: 'booking',
    title: 'Booking request sent',
    message: `${booking.tripTitle || 'Your trip'} booking request is saved and ready to track.`,
  });
  return nextBooking;
}

export async function getTripScoped(key, tripId, fallback) {
  const all = await getJson(key, {});
  return all[String(tripId || 'default')] || fallback;
}

export async function setTripScoped(key, tripId, value) {
  const all = await getJson(key, {});
  const next = { ...all, [String(tripId || 'default')]: value };
  await setJson(key, next);
  return value;
}
