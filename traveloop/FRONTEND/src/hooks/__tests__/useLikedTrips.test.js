import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useLikedTrips from '../useLikedTrips';

describe('useLikedTrips', () => {
  it('initializes with empty liked state', () => {
    const { result } = renderHook(() => useLikedTrips());
    expect(result.current.likedTrips).toEqual({});
  });

  it('toggles like on a trip', () => {
    const { result } = renderHook(() => useLikedTrips());
    act(() => result.current.toggleLike('trip1'));
    expect(result.current.likedTrips.trip1).toBe(true);
    act(() => result.current.toggleLike('trip1'));
    expect(result.current.likedTrips.trip1).toBe(false);
  });
});