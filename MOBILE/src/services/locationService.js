/**
 * Location service for Traveloop mobile app.
 * Wraps expo-location to provide device GPS coordinates,
 * permission management, and reverse geocoding via backend.
 */

import * as Location from 'expo-location';
import { mapsApi } from './api';

/** Permission status cache */
let permissionGranted = null;

/**
 * Request location permission from the user.
 * @returns {Promise<boolean>} Whether permission was granted.
 */
export const requestLocationPermission = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    permissionGranted = status === 'granted';
    return permissionGranted;
  } catch (error) {
    console.warn('Location permission request failed:', error.message);
    permissionGranted = false;
    return false;
  }
};

/**
 * Check if location permission has already been granted.
 * @returns {Promise<boolean>}
 */
export const hasLocationPermission = async () => {
  if (permissionGranted !== null) return permissionGranted;
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    permissionGranted = status === 'granted';
    return permissionGranted;
  } catch {
    return false;
  }
};

/**
 * Get current device location with coordinates.
 * Requests permission if not yet granted.
 * @returns {Promise<{lat: number, lng: number} | null>}
 */
export const getCurrentLocation = async () => {
  try {
    const hasPermission = await hasLocationPermission();
    if (!hasPermission) {
      const granted = await requestLocationPermission();
      if (!granted) return null;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
      timeout: 10000,
    });

    return {
      lat: location.coords.latitude,
      lng: location.coords.longitude,
    };
  } catch (error) {
    console.warn('Failed to get current location:', error.message);
    return null;
  }
};

/**
 * Get current location with city and country info via reverse geocoding.
 * @returns {Promise<{lat: number, lng: number, city: string, country: string} | null>}
 */
export const getLocationWithDetails = async () => {
  try {
    const coords = await getCurrentLocation();
    if (!coords) return null;

    // Try backend reverse geocode first (uses Google API)
    try {
      const result = await mapsApi.reverseGeocode(coords.lat, coords.lng);
      if (result?.city) {
        return {
          ...coords,
          city: result.city,
          country: result.country,
          formattedAddress: result.formattedAddress || '',
        };
      }
    } catch {
      // Fall back to expo-location's built-in reverse geocoding
    }

    // Fallback: use Expo's reverse geocoding
    const [reverseResult] = await Location.reverseGeocodeAsync({
      latitude: coords.lat,
      longitude: coords.lng,
    });

    return {
      ...coords,
      city: reverseResult?.city || reverseResult?.subregion || '',
      country: reverseResult?.country || '',
      formattedAddress: reverseResult?.formattedAddress || '',
    };
  } catch (error) {
    console.warn('Failed to get location details:', error.message);
    return null;
  }
};

/**
 * Watch device location changes. Returns a subscription object with a `remove()` method.
 * @param {function} callback - Called with {lat, lng} on each update
 * @param {object} options - Location watch options
 * @returns {Promise<{remove: function}>}
 */
export const watchLocation = async (callback, options = {}) => {
  try {
    const hasPermission = await hasLocationPermission();
    if (!hasPermission) {
      const granted = await requestLocationPermission();
      if (!granted) return { remove: () => {} };
    }

    return await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
        distanceInterval: options.distanceInterval || 500, // meters
        timeInterval: options.timeInterval || 30000, // 30 seconds
        ...options,
      },
      (location) => {
        callback({
          lat: location.coords.latitude,
          lng: location.coords.longitude,
        });
      }
    );
  } catch (error) {
    console.warn('Location watch failed:', error.message);
    return { remove: () => {} };
  }
};
