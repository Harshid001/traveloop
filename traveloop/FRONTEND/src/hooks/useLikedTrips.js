import { useState, useCallback } from 'react';

export default function useLikedTrips() {
  const [likedTrips, setLikedTrips] = useState({});
  const toggleLike = useCallback((id) => {
    setLikedTrips((p) => ({ ...p, [id]: !p[id] }));
  }, []);
  return { likedTrips, toggleLike };
}