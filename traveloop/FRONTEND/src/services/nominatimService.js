/**
 * Free & Open-Source OpenStreetMap Nominatim Geocoding Service
 * Forward geocoding (place search) and reverse geocoding (coordinates -> place name).
 */

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

/**
 * Search places by query string
 * @param {string} query 
 * @param {number} limit 
 * @returns {Promise<Array<{ name: string, displayName: string, country: string, lat: number, lng: number, type: string }>>}
 */
export async function searchPlaces(query, limit = 5) {
  if (!query || query.trim().length < 2) return [];

  const url = `${NOMINATIM_BASE_URL}/search?format=json&q=${encodeURIComponent(
    query
  )}&limit=${limit}&addressdetails=1`;

  try {
    const res = await fetch(url, {
      headers: {
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });
    if (!res.ok) throw new Error(`Nominatim HTTP error ${res.status}`);
    const data = await res.json();

    return data.map((item) => {
      const parts = (item.display_name || '').split(',');
      const mainName = parts[0] ? parts[0].trim() : item.name || 'Location';
      const country = item.address?.country || (parts[parts.length - 1] ? parts[parts.length - 1].trim() : '');
      const state = item.address?.state || item.address?.region || '';
      const city = item.address?.city || item.address?.town || item.address?.village || '';

      return {
        id: item.place_id,
        name: mainName,
        displayName: item.display_name,
        country,
        state,
        city,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        type: item.type || item.category || 'place',
      };
    });
  } catch (err) {
    console.warn('Nominatim place search warning:', err);
    return [];
  }
}

/**
 * Reverse geocode coordinates to place details
 * @param {number} lat 
 * @param {number} lng 
 * @returns {Promise<{ name: string, country: string, city: string }>}
 */
export async function reverseGeocode(lat, lng) {
  const url = `${NOMINATIM_BASE_URL}/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Nominatim reverse HTTP error ${res.status}`);
    const item = await res.json();
    const parts = (item.display_name || '').split(',');
    const mainName = parts[0] ? parts[0].trim() : 'Current Location';
    const country = item.address?.country || '';
    const city = item.address?.city || item.address?.town || '';

    return {
      name: mainName,
      displayName: item.display_name || 'Current Location',
      country,
      city,
      lat,
      lng,
    };
  } catch (err) {
    console.warn('Nominatim reverse geocode failed:', err);
    return {
      name: 'Current GPS Location',
      displayName: `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`,
      country: '',
      city: '',
      lat,
      lng,
    };
  }
}
