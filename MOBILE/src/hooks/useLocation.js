/**
 * Custom hook for device location access.
 * Wraps locationService with React state management.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getCurrentLocation,
  getLocationWithDetails,
  hasLocationPermission,
  requestLocationPermission,
} from '../services/locationService';

/**
 * Hook for accessing device location with permission handling.
 *
 * @param {object} options
 * @param {boolean} options.requestOnMount - Request location on mount (default: false)
 * @param {boolean} options.withDetails - Include city/country via reverse geocoding (default: false)
 * @returns {{location, loading, error, hasPermission, requestLocation, refresh}}
 */
export const useLocation = (options = {}) => {
  const { requestOnMount = false, withDetails = false } = options;

  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState(null); // null = unknown
  const mountedRef = useRef(true);

  // Check permission on mount
  useEffect(() => {
    mountedRef.current = true;
    hasLocationPermission().then((granted) => {
      if (mountedRef.current) setPermissionStatus(granted);
    });
    return () => { mountedRef.current = false; };
  }, []);

  // Auto-request on mount if configured
  useEffect(() => {
    if (requestOnMount && permissionStatus !== null) {
      fetchLocation();
    }
  }, [requestOnMount, permissionStatus]);

  const fetchLocation = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = withDetails
        ? await getLocationWithDetails()
        : await getCurrentLocation();

      if (!mountedRef.current) return;

      if (result) {
        setLocation(result);
        setPermissionStatus(true);
      } else {
        setError('Location access denied or unavailable');
        setPermissionStatus(false);
      }
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err.message || 'Failed to get location');
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [withDetails]);

  const requestLocation = useCallback(async () => {
    const granted = await requestLocationPermission();
    if (mountedRef.current) {
      setPermissionStatus(granted);
      if (granted) {
        await fetchLocation();
      }
    }
    return granted;
  }, [fetchLocation]);

  return {
    location,
    loading,
    error,
    hasPermission: permissionStatus,
    requestLocation,
    refresh: fetchLocation,
  };
};

export default useLocation;
