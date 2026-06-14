/**
 * Custom hook for fetching destination data with caching and error handling.
 * Provides a consistent data-fetching pattern across all screens.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchWithCache, generateCacheKey, CACHE_TTL } from '../services/cacheManager';

/**
 * Hook for fetching destination data with built-in caching,
 * loading states, error handling, and pull-to-refresh support.
 *
 * @param {string} namespace - Cache namespace (e.g., 'discover', 'places')
 * @param {string} operation - Cache operation (e.g., 'trending', 'search')
 * @param {function} fetchFn - Async function that returns data from API
 * @param {object} options - Configuration options
 * @param {object} options.params - Query params for cache key generation
 * @param {number} options.ttl - Cache TTL in seconds (default: CACHE_TTL.STANDARD)
 * @param {boolean} options.enabled - Whether to fetch on mount (default: true)
 * @param {function} options.transform - Transform function for raw data
 * @returns {{data, loading, error, refresh, fetchMore}}
 */
export const useDestinations = (namespace, operation, fetchFn, options = {}) => {
  const {
    params = {},
    ttl = CACHE_TTL.STANDARD,
    enabled = true,
    transform = null,
  } = options;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [fromCache, setFromCache] = useState(false);
  const mountedRef = useRef(true);

  const cacheKey = generateCacheKey(namespace, operation, params);

  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const result = await fetchWithCache(cacheKey, fetchFn, ttl);

      if (!mountedRef.current) return;

      let processedData = result.data;

      // Handle various response shapes
      if (processedData?.data) processedData = processedData.data;
      if (!Array.isArray(processedData)) processedData = [processedData].filter(Boolean);

      // Apply transform if provided
      if (transform) {
        processedData = processedData.map(transform);
      }

      setData(processedData);
      setFromCache(result.fromCache);
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err.message || 'Failed to load destinations');
      console.warn(`[useDestinations] ${namespace}/${operation} error:`, err.message);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [cacheKey, fetchFn, ttl, transform]);

  // Fetch on mount
  useEffect(() => {
    mountedRef.current = true;
    if (enabled) {
      fetchData();
    } else {
      setLoading(false);
    }
    return () => { mountedRef.current = false; };
  }, [enabled, fetchData]);

  // Pull-to-refresh handler
  const refresh = useCallback(() => fetchData(true), [fetchData]);

  return {
    data,
    loading,
    refreshing,
    error,
    fromCache,
    refresh,
    isEmpty: !loading && data.length === 0,
  };
};

/**
 * Hook for paginated destination fetching with infinite scroll.
 *
 * @param {string} namespace - Cache namespace
 * @param {string} operation - Cache operation
 * @param {function} fetchFn - Async fn that accepts (page) and returns data
 * @param {object} options - Configuration
 * @returns {{data, loading, loadingMore, error, refresh, fetchMore, hasMore}}
 */
export const usePaginatedDestinations = (namespace, operation, fetchFn, options = {}) => {
  const { pageSize = 10, transform = null, enabled = true } = options;

  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const mountedRef = useRef(true);

  const fetchPage = useCallback(async (pageNum, isRefresh = false) => {
    try {
      if (pageNum === 1) {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      let result = await fetchFn(pageNum);

      if (!mountedRef.current) return;

      // Handle response shapes
      if (result?.data) result = result.data;
      if (!Array.isArray(result)) result = [result].filter(Boolean);

      // Apply transform
      if (transform) {
        result = result.map(transform);
      }

      // Check if we've reached the end
      if (result.length < pageSize) {
        setHasMore(false);
      }

      // Set or append data
      if (pageNum === 1) {
        setData(result);
      } else {
        setData((prev) => [...prev, ...result]);
      }
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err.message || 'Failed to load more');
    } finally {
      if (mountedRef.current) {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    }
  }, [fetchFn, pageSize, transform]);

  // Initial fetch
  useEffect(() => {
    mountedRef.current = true;
    if (enabled) fetchPage(1);
    else setLoading(false);
    return () => { mountedRef.current = false; };
  }, [enabled, fetchPage]);

  const refresh = useCallback(() => {
    setPage(1);
    setHasMore(true);
    fetchPage(1, true);
  }, [fetchPage]);

  const fetchMore = useCallback(() => {
    if (!loadingMore && hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPage(nextPage);
    }
  }, [loadingMore, hasMore, loading, page, fetchPage]);

  return {
    data,
    loading,
    loadingMore,
    refreshing,
    error,
    hasMore,
    refresh,
    fetchMore,
    isEmpty: !loading && data.length === 0,
  };
};

export default useDestinations;
