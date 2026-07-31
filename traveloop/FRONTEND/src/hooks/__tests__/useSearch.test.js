import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useSearch from '../useSearch';

const mockTrips = [
  { title: 'Paris Adventure', location: 'Paris', activities: ['sightseeing'] },
  { title: 'Tokyo Trip', location: 'Tokyo', activities: ['food tour'] },
  { title: 'Beach Getaway', location: 'Bali', activities: ['surfing'] },
];

describe('useSearch', () => {
  it('returns all trips when query is empty', () => {
    const { result } = renderHook(() => useSearch(mockTrips));
    expect(result.current.filteredTrips).toEqual([]);
  });

  it('filters trips by title', () => {
    const { result } = renderHook(() => useSearch(mockTrips));
    act(() => result.current.setSearchQuery('paris'));
    expect(result.current.filteredTrips).toHaveLength(1);
    expect(result.current.filteredTrips[0].title).toBe('Paris Adventure');
  });

  it('filters trips by location', () => {
    const { result } = renderHook(() => useSearch(mockTrips));
    act(() => result.current.setSearchQuery('bali'));
    expect(result.current.filteredTrips).toHaveLength(1);
  });

  it('filters trips by activities', () => {
    const { result } = renderHook(() => useSearch(mockTrips));
    act(() => result.current.setSearchQuery('surfing'));
    expect(result.current.filteredTrips).toHaveLength(1);
  });

  it('returns empty when no match', () => {
    const { result } = renderHook(() => useSearch(mockTrips));
    act(() => result.current.setSearchQuery('mars'));
    expect(result.current.filteredTrips).toHaveLength(0);
  });
});