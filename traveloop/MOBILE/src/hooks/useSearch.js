/**
 * Custom hook for search with debounce, autocomplete, and recent searches.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { placesApi, discoverApi } from '../services/api';

const RECENT_SEARCHES_KEY = 'traveloop:recent_searches';
const MAX_RECENT_SEARCHES = 10;
const DEBOUNCE_MS = 300;

/**
 * Hook for intelligent search with debounced autocomplete,
 * recent search history, and smart search capabilities.
 *
 * @param {object} options
 * @param {number} options.debounceMs - Debounce delay in ms (default: 300)
 * @param {number} options.maxRecent - Max recent searches to keep (default: 10)
 * @returns {{query, setQuery, results, suggestions, recentSearches, loading, search, clearRecent}}
 */
export const useSearch = (options = {}) => {
  const {
    debounceMs = DEBOUNCE_MS,
    maxRecent = MAX_RECENT_SEARCHES,
  } = options;

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const debounceRef = useRef(null);
  const mountedRef = useRef(true);

  // Load recent searches on mount
  useEffect(() => {
    mountedRef.current = true;
    loadRecentSearches();
    return () => {
      mountedRef.current = false;
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // Debounced autocomplete as user types
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        setLoading(true);
        const result = await placesApi.autocomplete(query, { types: '(cities)' });

        if (!mountedRef.current) return;

        const predictions = Array.isArray(result)
          ? result
          : result?.predictions || result?.data || [];

        setSuggestions(
          predictions.map((p) => ({
            id: p.placeId || p.place_id || p.id,
            text: p.description || p.name || p.text,
            placeId: p.placeId || p.place_id,
            mainText: p.mainText || p.structured_formatting?.main_text || p.name,
            secondaryText: p.secondaryText || p.structured_formatting?.secondary_text || '',
          }))
        );
      } catch (err) {
        console.warn('Autocomplete error:', err.message);
        if (mountedRef.current) setSuggestions([]);
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    }, debounceMs);
  }, [query, debounceMs]);

  /**
   * Execute a full smart search.
   * @param {string} searchQuery - Search text (uses current query if not provided)
   * @param {object} filters - Additional filters
   */
  const search = useCallback(async (searchQuery = null, filters = {}) => {
    const q = searchQuery || query;
    if (!q || q.length < 2) return;

    try {
      setSearchLoading(true);

      // Save to recent searches
      await saveRecentSearch(q);

      // Execute smart search
      const result = await discoverApi.smartSearch(q, filters);

      if (!mountedRef.current) return;

      const data = Array.isArray(result)
        ? result
        : result?.data || result?.results || [];

      setResults(data);
    } catch (err) {
      console.warn('Search error:', err.message);
      if (mountedRef.current) setResults([]);
    } finally {
      if (mountedRef.current) setSearchLoading(false);
    }
  }, [query]);

  /**
   * Select an autocomplete suggestion.
   * @param {object} suggestion - The selected suggestion
   */
  const selectSuggestion = useCallback((suggestion) => {
    setQuery(suggestion.mainText || suggestion.text);
    setSuggestions([]);
    search(suggestion.mainText || suggestion.text);
  }, [search]);

  /**
   * Clear the current search.
   */
  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setSuggestions([]);
  }, []);

  // ─── Recent searches management ───────────────────────────────────────────

  const loadRecentSearches = async () => {
    try {
      const raw = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
      if (raw) setRecentSearches(JSON.parse(raw));
    } catch {
      // ignore
    }
  };

  const saveRecentSearch = async (searchText) => {
    try {
      const current = [...recentSearches];
      // Remove duplicate if exists
      const filtered = current.filter((s) => s.toLowerCase() !== searchText.toLowerCase());
      // Add to front
      filtered.unshift(searchText);
      // Trim to max
      const trimmed = filtered.slice(0, maxRecent);

      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(trimmed));
      if (mountedRef.current) setRecentSearches(trimmed);
    } catch {
      // ignore
    }
  };

  const clearRecentSearches = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
      if (mountedRef.current) setRecentSearches([]);
    } catch {
      // ignore
    }
  }, []);

  const removeRecentSearch = useCallback(async (searchText) => {
    try {
      const filtered = recentSearches.filter(
        (s) => s.toLowerCase() !== searchText.toLowerCase()
      );
      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(filtered));
      if (mountedRef.current) setRecentSearches(filtered);
    } catch {
      // ignore
    }
  }, [recentSearches]);

  return {
    query,
    setQuery,
    results,
    suggestions,
    recentSearches,
    loading,         // autocomplete loading
    searchLoading,   // full search loading
    search,
    selectSuggestion,
    clearSearch,
    clearRecentSearches,
    removeRecentSearch,
  };
};

export default useSearch;
