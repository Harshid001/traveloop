import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEYS = {
  onboardingComplete: 'traveloop.onboarding.complete',
  user: 'traveloop.user',
  guestMode: 'traveloop.guest',
  wishlist: 'traveloop.wishlist',
  trips: 'traveloop.trips',
  bookings: 'traveloop.bookings',
  itineraries: 'traveloop.itineraries',
  budgets: 'traveloop.budgets',
  packing: 'traveloop.packing',
  journal: 'traveloop.journal',
  notifications: 'traveloop.notifications',
};

export async function getJson(key, fallback = null) {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export async function setJson(key, value) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
  return value;
}

export async function removeKey(key) {
  await AsyncStorage.removeItem(key);
}

export async function getBoolean(key, fallback = false) {
  const value = await AsyncStorage.getItem(key);
  if (value === null) return fallback;
  return value === 'true';
}

export async function setBoolean(key, value) {
  await AsyncStorage.setItem(key, value ? 'true' : 'false');
}
