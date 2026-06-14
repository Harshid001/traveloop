/**
 * @fileoverview Google Maps Platform API proxy service.
 * Wraps Places, Geocoding, Directions, and Distance Matrix APIs
 * so the mobile app never exposes the API key directly.
 */

const axios = require('axios');
const env = require('../config/env');

const BASE_URL = 'https://maps.googleapis.com/maps/api';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Normalize a raw Google Places result into a consistent shape.
 * @param {object} place - Raw place object from any Google Places endpoint
 * @returns {object} Normalized place object
 */
const normalizePlaceResult = (place) => {
  return {
    placeId: place.place_id || null,
    name: place.name || '',
    address: place.formatted_address || place.vicinity || '',
    city: extractAddressComponent(place, 'locality'),
    country: extractAddressComponent(place, 'country'),
    coordinates: place.geometry
      ? { lat: place.geometry.location.lat, lng: place.geometry.location.lng }
      : { lat: null, lng: null },
    rating: place.rating || null,
    userRatingsTotal: place.user_ratings_total || 0,
    types: place.types || [],
    photos: (place.photos || []).map((p) => ({
      url: `${BASE_URL}/place/photo?maxwidth=800&photoreference=${p.photo_reference}&key=${env.GOOGLE_MAPS_API_KEY}`,
      attribution: p.html_attributions ? p.html_attributions[0] : '',
    })),
    openingHours: place.opening_hours
      ? {
          openNow: place.opening_hours.open_now,
          weekdayText: place.opening_hours.weekday_text || [],
        }
      : null,
    website: place.website || null,
    priceLevel: place.price_level ?? null,
    reviews: (place.reviews || []).map((r) => ({
      author: r.author_name,
      rating: r.rating,
      text: r.text,
      time: r.relative_time_description || r.time,
    })),
  };
};

/**
 * Extract a specific address component from a place's address_components array.
 * @param {object} place - Raw Google place object
 * @param {string} type - The component type to extract (e.g. 'locality')
 * @returns {string} Component long name or empty string
 */
const extractAddressComponent = (place, type) => {
  if (!place.address_components) return '';
  const comp = place.address_components.find((c) => c.types.includes(type));
  return comp ? comp.long_name : '';
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Search for places matching a text query.
 * @param {string} query - Search text (e.g. "restaurants in Paris")
 * @param {string} [location] - Lat,lng bias (e.g. "48.8566,2.3522")
 * @param {number} [radius=5000] - Search radius in meters
 * @param {string} [type] - Place type filter (e.g. "restaurant")
 * @returns {Promise<object[]>} Array of normalized place objects
 */
const searchPlaces = async (query, location, radius = 5000, type) => {
  try {
    const params = {
      query,
      key: env.GOOGLE_MAPS_API_KEY,
      radius,
    };
    if (location) params.location = location;
    if (type) params.type = type;

    const { data } = await axios.get(`${BASE_URL}/place/textsearch/json`, { params });

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(`Google Places Text Search error: ${data.status} — ${data.error_message || ''}`);
    }

    return (data.results || []).map(normalizePlaceResult);
  } catch (error) {
    console.error('googleMapsService.searchPlaces error:', error.message);
    throw error;
  }
};

/**
 * Get detailed information for a specific place.
 * @param {string} placeId - Google Place ID
 * @returns {Promise<object>} Normalized place object with full details
 */
const getPlaceDetails = async (placeId) => {
  try {
    const fields = [
      'name', 'formatted_address', 'geometry', 'rating', 'reviews',
      'photos', 'opening_hours', 'types', 'url', 'website',
      'user_ratings_total', 'price_level', 'address_components', 'place_id',
    ].join(',');

    const { data } = await axios.get(`${BASE_URL}/place/details/json`, {
      params: { place_id: placeId, fields, key: env.GOOGLE_MAPS_API_KEY },
    });

    if (data.status !== 'OK') {
      throw new Error(`Google Place Details error: ${data.status} — ${data.error_message || ''}`);
    }

    return normalizePlaceResult(data.result);
  } catch (error) {
    console.error('googleMapsService.getPlaceDetails error:', error.message);
    throw error;
  }
};

/**
 * Build a Google Places photo URL.
 * @param {string} photoReference - Photo reference string from Places API
 * @param {number} [maxWidth=800] - Maximum width of the returned image
 * @returns {string} Full photo URL
 */
const getPlacePhotos = (photoReference, maxWidth = 800) => {
  return `${BASE_URL}/place/photo?maxwidth=${maxWidth}&photoreference=${photoReference}&key=${env.GOOGLE_MAPS_API_KEY}`;
};

/**
 * Get autocomplete suggestions for a partial input string.
 * @param {string} input - Partial user input
 * @param {string} [types] - Restrict to a place type (e.g. "(cities)")
 * @param {string} [location] - Lat,lng bias
 * @returns {Promise<object[]>} Array of prediction objects
 */
const autocomplete = async (input, types, location) => {
  try {
    const params = { input, key: env.GOOGLE_MAPS_API_KEY };
    if (types) params.types = types;
    if (location) {
      params.location = location;
      params.radius = 50000;
    }

    const { data } = await axios.get(`${BASE_URL}/place/autocomplete/json`, { params });

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(`Autocomplete error: ${data.status} — ${data.error_message || ''}`);
    }

    return (data.predictions || []).map((p) => ({
      placeId: p.place_id,
      description: p.description,
      mainText: p.structured_formatting?.main_text || '',
      secondaryText: p.structured_formatting?.secondary_text || '',
      types: p.types || [],
    }));
  } catch (error) {
    console.error('googleMapsService.autocomplete error:', error.message);
    throw error;
  }
};

/**
 * Geocode an address string to coordinates.
 * @param {string} address - Human-readable address
 * @returns {Promise<object>} { lat, lng, formattedAddress, placeId }
 */
const geocode = async (address) => {
  try {
    const { data } = await axios.get(`${BASE_URL}/geocode/json`, {
      params: { address, key: env.GOOGLE_MAPS_API_KEY },
    });

    if (data.status !== 'OK') {
      throw new Error(`Geocode error: ${data.status} — ${data.error_message || ''}`);
    }

    const result = data.results[0];
    return {
      lat: result.geometry.location.lat,
      lng: result.geometry.location.lng,
      formattedAddress: result.formatted_address,
      placeId: result.place_id,
    };
  } catch (error) {
    console.error('googleMapsService.geocode error:', error.message);
    throw error;
  }
};

/**
 * Reverse-geocode coordinates to a human-readable address.
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<object>} { formattedAddress, placeId, city, country }
 */
const reverseGeocode = async (lat, lng) => {
  try {
    const { data } = await axios.get(`${BASE_URL}/geocode/json`, {
      params: { latlng: `${lat},${lng}`, key: env.GOOGLE_MAPS_API_KEY },
    });

    if (data.status !== 'OK') {
      throw new Error(`Reverse geocode error: ${data.status} — ${data.error_message || ''}`);
    }

    const result = data.results[0];
    return {
      formattedAddress: result.formatted_address,
      placeId: result.place_id,
      city: extractAddressComponent(result, 'locality'),
      country: extractAddressComponent(result, 'country'),
    };
  } catch (error) {
    console.error('googleMapsService.reverseGeocode error:', error.message);
    throw error;
  }
};

/**
 * Get directions between an origin and a destination.
 * @param {string} origin - Origin (address, Place ID, or lat,lng)
 * @param {string} destination - Destination
 * @param {string} [mode='driving'] - Travel mode: driving | walking | transit | bicycling
 * @returns {Promise<object>} Normalized directions object
 */
const getDirections = async (origin, destination, mode = 'driving') => {
  try {
    const { data } = await axios.get(`${BASE_URL}/directions/json`, {
      params: { origin, destination, mode, key: env.GOOGLE_MAPS_API_KEY },
    });

    if (data.status !== 'OK') {
      throw new Error(`Directions error: ${data.status} — ${data.error_message || ''}`);
    }

    const route = data.routes[0];
    const leg = route.legs[0];
    return {
      distance: leg.distance,
      duration: leg.duration,
      startAddress: leg.start_address,
      endAddress: leg.end_address,
      steps: (leg.steps || []).map((s) => ({
        instruction: s.html_instructions,
        distance: s.distance,
        duration: s.duration,
        travelMode: s.travel_mode,
      })),
      polyline: route.overview_polyline?.points || '',
      summary: route.summary,
    };
  } catch (error) {
    console.error('googleMapsService.getDirections error:', error.message);
    throw error;
  }
};

/**
 * Search for nearby places around a coordinate.
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} [radius=5000] - Radius in meters
 * @param {string} [type] - Place type filter
 * @returns {Promise<object[]>} Array of normalized place objects
 */
const getNearbyPlaces = async (lat, lng, radius = 5000, type) => {
  try {
    const params = {
      location: `${lat},${lng}`,
      radius,
      key: env.GOOGLE_MAPS_API_KEY,
    };
    if (type) params.type = type;

    const { data } = await axios.get(`${BASE_URL}/place/nearbysearch/json`, { params });

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(`Nearby search error: ${data.status} — ${data.error_message || ''}`);
    }

    return (data.results || []).map(normalizePlaceResult);
  } catch (error) {
    console.error('googleMapsService.getNearbyPlaces error:', error.message);
    throw error;
  }
};

/**
 * Get travel distance and time between sets of origins and destinations.
 * @param {string|string[]} origins - One or more origin locations
 * @param {string|string[]} destinations - One or more destination locations
 * @param {string} [mode='driving'] - Travel mode
 * @returns {Promise<object>} Distance matrix result
 */
const getDistanceMatrix = async (origins, destinations, mode = 'driving') => {
  try {
    const originStr = Array.isArray(origins) ? origins.join('|') : origins;
    const destStr = Array.isArray(destinations) ? destinations.join('|') : destinations;

    const { data } = await axios.get(`${BASE_URL}/distancematrix/json`, {
      params: {
        origins: originStr,
        destinations: destStr,
        mode,
        key: env.GOOGLE_MAPS_API_KEY,
      },
    });

    if (data.status !== 'OK') {
      throw new Error(`Distance Matrix error: ${data.status} — ${data.error_message || ''}`);
    }

    return {
      originAddresses: data.origin_addresses,
      destinationAddresses: data.destination_addresses,
      rows: data.rows.map((row) =>
        row.elements.map((el) => ({
          status: el.status,
          distance: el.distance,
          duration: el.duration,
        }))
      ),
    };
  } catch (error) {
    console.error('googleMapsService.getDistanceMatrix error:', error.message);
    throw error;
  }
};

module.exports = {
  searchPlaces,
  getPlaceDetails,
  getPlacePhotos,
  autocomplete,
  geocode,
  reverseGeocode,
  getDirections,
  getNearbyPlaces,
  getDistanceMatrix,
};
