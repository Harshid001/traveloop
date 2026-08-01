/**
 * Free & Open-Source OSRM (Open Source Routing Machine) Service
 * Calculates routes, distances, travel durations, and GeoJSON polylines using OSRM public server.
 */

const OSRM_BASE_URL = 'https://router.project-osrm.org/route/v1';

/**
 * Fetch driving route for a list of coordinate stops [{ lat, lng }]
 * @param {Array<{lat: number, lng: number}>} stops 
 * @param {'driving' | 'walking' | 'cycling'} mode 
 * @returns {Promise<{ coordinates: Array<[number, number]>, distanceKm: number, durationMinutes: number, legs: Array }>}
 */
export async function getOSRMRoute(stops, mode = 'driving') {
  if (!stops || stops.length < 2) {
    return null;
  }

  const profile = mode === 'walking' ? 'foot' : mode === 'cycling' ? 'bike' : 'driving';
  const coordsString = stops.map((s) => `${parseFloat(s.lng)},${parseFloat(s.lat)}`).join(';');

  const url = `${OSRM_BASE_URL}/${profile}/${coordsString}?overview=full&geometries=geojson&steps=true`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`OSRM API HTTP error status: ${res.status}`);
    }
    const data = await res.json();
    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      throw new Error('OSRM routing request failed or returned empty route');
    }

    const route = data.routes[0];
    const coordinates = route.geometry.coordinates; // [[lng, lat], ...]
    const distanceKm = Math.round((route.distance / 1000) * 10) / 10;
    const durationMinutes = Math.round(route.duration / 60);

    return {
      coordinates,
      distanceKm,
      durationMinutes,
      legs: route.legs || [],
      summary: route.weight_name || 'Driving Route',
    };
  } catch (err) {
    console.warn('OSRM Route fetch error, falling back to direct line calculation:', err);

    // Straight line fallback if public OSRM server is unreachable or rate-limited
    const lineCoords = stops.map((s) => [parseFloat(s.lng), parseFloat(s.lat)]);
    let approxDist = 0;
    for (let i = 0; i < stops.length - 1; i++) {
      approxDist += haversineDistance(stops[i], stops[i + 1]);
    }
    const approxDuration = Math.round((approxDist / 70) * 60); // approx 70km/h

    return {
      coordinates: lineCoords,
      distanceKm: Math.round(approxDist * 10) / 10,
      durationMinutes: approxDuration,
      legs: [],
      summary: 'Direct Polyline Route',
    };
  }
}

/**
 * Helper to calculate Haversine distance in km between two lat/lng points
 */
export function haversineDistance(p1, p2) {
  const R = 6371; // Earth radius in km
  const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
  const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((p1.lat * Math.PI) / 180) *
      Math.cos((p2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
