import { useState, useRef } from 'react';

export default function useSearch(allSearchableTrips = []) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef(null);

  const filteredTrips = searchQuery.trim()
    ? allSearchableTrips.filter((t) =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.activities || []).some((a) => a.toLowerCase().includes(searchQuery.toLowerCase())))
    : [];

  return { searchOpen, setSearchOpen, searchQuery, setSearchQuery, filteredTrips, searchRef };
}