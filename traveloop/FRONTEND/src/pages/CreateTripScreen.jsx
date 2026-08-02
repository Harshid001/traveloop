import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import maplibregl, { MAPLIBRE_STYLES, DEFAULT_MAP_CENTER } from '../config/maplibre';
import {
  Trash2, Calendar, Check, Sparkles,
  ChevronUp, ChevronDown, Search, Hotel, Utensils, Car, Ticket,
  GripVertical, Layers, Compass, Globe, Eye, Columns,
  Flame, Plus, X, Zap, DollarSign,
  Landmark, Trees, Mountain, ShoppingBag, UtensilsCrossed, Camera, Film, Moon, Users, Gem
} from 'lucide-react';
import { useGetDestinationsQuery, useCreateTripMutation } from '../services/apiSlice';
import Button from '../components/ui/Button';
import AppLayout from '../components/layout/AppLayout';
import { searchPlaces } from '../services/nominatimService';
import { getOSRMRoute } from '../services/osrmService';
import { GLOBAL_DESTINATIONS } from '../data/destinationsData';
import { fetchLiveViewportDestinations, fetchNearbyAttractionsForLocation } from '../services/liveDestinationService';
import { fetchWikipediaSummary } from '../services/wikipediaService';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80';

// Currency Rates Definition
// eslint-disable-next-line react-refresh/only-export-components
export const CURRENCIES = {
  USD: { code: 'USD', symbol: '$', name: 'USD ($)', rate: 1.0 },
  EUR: { code: 'EUR', symbol: '€', name: 'EUR (€)', rate: 0.92 },
  GBP: { code: 'GBP', symbol: '£', name: 'GBP (£)', rate: 0.79 },
  INR: { code: 'INR', symbol: '₹', name: 'INR (₹)', rate: 83.5 },
  JPY: { code: 'JPY', symbol: '¥', name: 'JPY (¥)', rate: 155.0 },
  CAD: { code: 'CAD', symbol: 'CA$', name: 'CAD (CA$)', rate: 1.36 },
  AUD: { code: 'AUD', symbol: 'A$', name: 'AUD (A$)', rate: 1.51 },
  CHF: { code: 'CHF', symbol: 'Fr.', name: 'CHF (Fr.)', rate: 0.90 },
  AED: { code: 'AED', symbol: 'AED', name: 'AED (AED)', rate: 3.67 },
};

// eslint-disable-next-line react-refresh/only-export-components
export function formatCurrency(amountInUSD, currencyCode = 'USD') {
  const curr = CURRENCIES[currencyCode] || CURRENCIES.USD;
  const converted = (amountInUSD || 0) * curr.rate;
  return `${curr.symbol}${Math.round(converted).toLocaleString()}`;
}

// Attraction Categories Definition
const NEARBY_CATEGORIES = [
  { id: 'All', label: 'All Places', icon: Sparkles },
  { id: 'Historical', label: '🏛 Historical', icon: Landmark },
  { id: 'Beaches', label: '🏖 Beaches', icon: Globe },
  { id: 'Nature', label: '🌲 Nature', icon: Trees },
  { id: 'Mountains', label: '🏔 Mountains', icon: Mountain },
  { id: 'Adventure', label: '🎢 Adventure', icon: Zap },
  { id: 'Food', label: '🍽 Food & Dining', icon: UtensilsCrossed },
  { id: 'Shopping', label: '🛍 Shopping', icon: ShoppingBag },
  { id: 'Photo', label: '📸 Photo Spots', icon: Camera },
  { id: 'Culture', label: '🎭 Museums', icon: Film },
  { id: 'Nightlife', label: '🌃 Nightlife', icon: Moon },
  { id: 'Family', label: '👨‍👩‍👧 Family', icon: Users },
  { id: 'HiddenGems', label: '💎 Hidden Gems', icon: Gem },
];

const RADIUS_OPTIONS = [5, 10, 25, 50];

class MapErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.error('MapErrorBoundary caught error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full min-h-[350px] flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900 rounded-3xl p-6 text-center border border-slate-200 dark:border-slate-800 font-poppins">
          <p className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-1">Interactive Map Discovery</p>
          <p className="text-xs text-slate-500 mb-4 max-w-xs font-medium">Map tiles re-initializing. Select your destinations using the discovery list on the right.</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-4 py-2 text-xs font-bold text-white bg-primary rounded-xl shadow-md hover:bg-primary-dark transition-colors"
          >
            Reload Map View
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const getValidImageUrl = (img) => {
  if (!img) return FALLBACK_IMAGE;
  if (typeof img === 'object' && img.url) return img.url;
  if (typeof img === 'string' && (img.startsWith('http://') || img.startsWith('https://'))) return img;
  return FALLBACK_IMAGE;
};

// Helper: Determine closest country/region from coordinates
const detectRegionFromCoords = (lat, lng) => {
  let closest = 'Worldwide';
  let minDist = Infinity;

  GLOBAL_DESTINATIONS.forEach((d) => {
    const dist = Math.hypot(d.lat - lat, d.lng - lng);
    if (dist < minDist) {
      minDist = dist;
      closest = d.country;
    }
  });

  return minDist < 35 ? closest : 'Worldwide';
};

// Free MapLibre Interactive Discovery Map Component
function MapLibreTripPlannerMap({
  destinations,
  nearbyAttractions,
  selectedDests,
  flyCenter,
  activeLayerKey,
  setActiveLayerKey,
  previewOnlyMap,
  setPreviewOnlyMap,
  activeMapRegion,
  setActiveMapRegion,
  focusedDest,
  setFocusedDest,
  onMapViewportChange,
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const [pitch3d, setPitch3d] = useState(false);
  const [layerDropdownOpen, setLayerDropdownOpen] = useState(false);

  const activeLayer = MAPLIBRE_STYLES[activeLayerKey] || MAPLIBRE_STYLES.streets;

  const setupRouteLayer = useCallback((map) => {
    if (!map) return;
    if (!map.getSource('route-line-source')) {
      map.addSource('route-line-source', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: { type: 'LineString', coordinates: [] },
        },
      });
    }
    if (!map.getLayer('route-line-layer')) {
      map.addLayer({
        id: 'route-line-layer',
        type: 'line',
        source: 'route-line-source',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#6366F1',
          'line-width': 5,
          'line-dasharray': [2, 2],
          'line-opacity': 0.9,
        },
      });
    }
  }, []);

  // Initialize MapLibre map instance
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: activeLayer.style,
      center: DEFAULT_MAP_CENTER,
      zoom: 2.5,
      maxZoom: 18,
      minZoom: 1,
      pitch: 0,
      bearing: 0,
      dragRotate: false,
      pitchWithRotate: false,
      touchPitch: false,
      attributionControl: false,
    });

    map.on('error', (e) => {
      console.warn('MapLibre GL notice:', e?.error?.message || e);
    });

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'bottom-right');

    map.on('load', () => {
      map.resize();
      setupRouteLayer(map);
    });

    map.on('moveend', () => {
      const center = map.getCenter();
      const zoom = map.getZoom();
      const bounds = map.getBounds();
      const bbox = {
        south: bounds.getSouth(),
        west: bounds.getWest(),
        north: bounds.getNorth(),
        east: bounds.getEast(),
      };

      const region = detectRegionFromCoords(center.lat, center.lng);
      setActiveMapRegion(region);

      if (onMapViewportChange) {
        onMapViewportChange(bbox, zoom);
      }
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Switch map style cleanly
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    map.setStyle(activeLayer.style);
    map.once('styledata', () => {
      setupRouteLayer(map);
    });
  }, [activeLayerKey, activeLayer.style, setupRouteLayer]);

  useEffect(() => {
    if (mapRef.current) {
      setTimeout(() => mapRef.current.resize(), 150);
    }
  }, [previewOnlyMap]);

  const toggle3dPitch = () => {
    if (!mapRef.current) return;
    const nextPitch = pitch3d ? 0 : 60;
    mapRef.current.easeTo({ pitch: nextPitch, duration: 1000 });
    setPitch3d(!pitch3d);
  };

  // Sync destination markers + nearby attraction markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const allMapItems = [...destinations, ...nearbyAttractions];

    allMapItems.forEach((d) => {
      const lat = parseFloat(d.lat);
      const lng = parseFloat(d.lng);
      if (isNaN(lat) || isNaN(lng)) return;

      const dId = d._id || d.id;
      const selectedIdx = selectedDests.findIndex((s) => (s._id || s.id) === dId);
      const isSelected = selectedIdx !== -1;
      const stopNumber = isSelected ? selectedIdx + 1 : null;
      const isFocused = focusedDest && (focusedDest._id || focusedDest.id) === dId;
      const isNearby = d.isNearbyAttraction;

      const accentColor = isSelected
        ? '#6366F1'
        : isFocused
        ? '#F59E0B'
        : isNearby
        ? '#10B981'
        : '#0284C7';

      const el = document.createElement('div');
      el.className = 'custom-maplibre-trip-marker cursor-pointer group';
      el.title = `${d.name}, ${d.country || ''}`;
      el.innerHTML = `
        <div style="
          transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
          width: ${isSelected ? '26px' : isFocused ? '22px' : isNearby ? '14px' : '12px'};
          height: ${isSelected ? '26px' : isFocused ? '22px' : isNearby ? '14px' : '12px'};
          border-radius: 50%;
          background: ${isSelected ? '#6366F1' : accentColor};
          border: ${isSelected || isFocused ? '2.5px solid #ffffff' : '1.5px solid #ffffff'};
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 12px ${accentColor}cc, 0 3px 10px rgba(0,0,0,0.35);
        ">
          ${
            isSelected && stopNumber !== null
              ? `<span style="font-weight: 900; font-size: 11px; color: #ffffff; font-family: 'Poppins', sans-serif;">${stopNumber}</span>`
              : ''
          }
        </div>
      `;

      const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat([lng, lat])
        .addTo(map);

      el.addEventListener('click', () => {
        setFocusedDest(d);
        map.flyTo({ center: [lng, lat], zoom: 6.5, duration: 1200 });
      });

      markersRef.current.push(marker);
    });
  }, [destinations, nearbyAttractions, selectedDests, focusedDest, setFocusedDest]);

  // Sync polyline route line coordinates using OSRM Routing
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (selectedDests.length < 2) {
      const source = map.getSource('route-line-source');
      if (source) {
        source.setData({
          type: 'Feature',
          properties: {},
          geometry: { type: 'LineString', coordinates: [] },
        });
      }
      return;
    }

    const stops = selectedDests.map((d) => ({ lat: parseFloat(d.lat), lng: parseFloat(d.lng) }));

    getOSRMRoute(stops, 'driving').then((res) => {
      if (!res || !map.getSource('route-line-source')) return;

      map.getSource('route-line-source').setData({
        type: 'Feature',
        properties: {},
        geometry: { type: 'LineString', coordinates: res.coordinates },
      });

      if (res.coordinates.length > 1) {
        try {
          const bounds = res.coordinates.reduce(
            (b, coord) => b.extend(coord),
            new maplibregl.LngLatBounds(res.coordinates[0], res.coordinates[0])
          );
          map.fitBounds(bounds, { padding: 60, maxZoom: 10, duration: 1000 });
        } catch (e) {
          console.warn('Fit bounds error:', e);
        }
      }
    });
  }, [selectedDests]);

  // Sync FlyTo camera target
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !flyCenter || !Array.isArray(flyCenter) || flyCenter.length !== 2) return;
    const [lat, lng] = flyCenter;
    if (!isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng))) {
      map.flyTo({ center: [parseFloat(lng), parseFloat(lat)], zoom: 7, duration: 1200 });
    }
  }, [flyCenter]);

  return (
    <div className="relative w-full h-full min-h-[300px] rounded-3xl overflow-hidden font-poppins">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating Region Indicator Badge */}
      <div className="absolute top-3 left-3 z-[10] flex items-center gap-2">
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-900/90 backdrop-blur-md text-white border border-white/15 shadow-xl">
          <Globe size={14} className="text-primary animate-pulse" />
          <span className="text-xs font-extrabold tracking-wide">{activeMapRegion}</span>
        </div>
      </div>

      {/* Floating Controls Bar */}
      <div className="absolute top-3 right-3 z-[10] flex items-center gap-2">
        <button
          type="button"
          onClick={() => setPreviewOnlyMap(!previewOnlyMap)}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl backdrop-blur-md text-xs font-bold transition-all shadow-xl border ${
            previewOnlyMap
              ? 'bg-emerald-500 text-white border-emerald-400 shadow-emerald-500/30'
              : 'bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-100 border-slate-200/80 dark:border-slate-800'
          }`}
          title="Toggle Full Map Preview Mode"
        >
          {previewOnlyMap ? <Columns size={14} /> : <Eye size={14} className="text-primary" />}
          <span>{previewOnlyMap ? 'Split View' : 'Map Only'}</span>
        </button>

        <button
          type="button"
          onClick={toggle3dPitch}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl backdrop-blur-md text-xs font-bold transition-all shadow-xl border ${
            pitch3d
              ? 'bg-primary text-white border-primary-light'
              : 'bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-100 border-slate-200/80 dark:border-slate-800'
          }`}
          title="Toggle 3D Perspective"
        >
          <Compass size={14} className={pitch3d ? 'animate-spin text-white' : 'text-primary'} />
          <span>3D</span>
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setLayerDropdownOpen(!layerDropdownOpen)}
            title="Switch Map Theme"
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-xs font-bold text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-800 shadow-xl hover:bg-white dark:hover:bg-slate-900 transition-all"
          >
            <Layers size={14} className="text-primary" />
            <span className="font-poppins">{activeLayer.name}</span>
            <ChevronDown size={12} className={`text-slate-400 transition-transform ${layerDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {layerDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-700/80 shadow-2xl p-1.5 z-[30] space-y-1 font-poppins">
              {Object.entries(MAPLIBRE_STYLES).map(([key, layer]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setActiveLayerKey(key);
                    setLayerDropdownOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-left transition-colors ${
                    activeLayerKey === key
                      ? 'bg-primary text-white font-bold'
                      : 'text-slate-200 hover:bg-slate-800/80'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${activeLayerKey === key ? 'bg-white shadow-sm shadow-white' : 'bg-slate-500'}`} />
                  <span className="truncate">{layer.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CreateTripScreen() {
  const navigate = useNavigate();
  const [tripName, setTripName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedDests, setSelectedDests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [flyCenter, setFlyCenter] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeLayerKey, setActiveLayerKey] = useState('streets');
  const [previewOnlyMap, setPreviewOnlyMap] = useState(false);
  const [activeMapRegion, setActiveMapRegion] = useState('Worldwide');
  const [focusedDest, setFocusedDest] = useState(null);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');

  // Nearby Attractions State
  const [nearbyAttractions, setNearbyAttractions] = useState([]);
  const [selectedRadiusKm, setSelectedRadiusKm] = useState(10);
  const [selectedNearbyCategory, setSelectedNearbyCategory] = useState('All');
  const [isFetchingNearby, setIsFetchingNearby] = useState(false);

  const [liveViewportDestinations, setLiveViewportDestinations] = useState([]);
  const [isFetchingLiveBbox, setIsFetchingLiveBbox] = useState(false);

  const [globalSearchDestinationsResults, setGlobalSearchDestinationsResults] = useState([]);
  const [isSearchingDestinationsGlobal, setIsSearchingDestinationsGlobal] = useState(false);

  const { data: initialDestinations = [] } = useGetDestinationsQuery();
  const [createTrip] = useCreateTripMutation();

  // Combine Live OpenTripMap & Wikipedia API Bbox places + Curated Base Dataset
  const baseDestinations = useMemo(() => {
    const combined = [...liveViewportDestinations, ...GLOBAL_DESTINATIONS];
    if (Array.isArray(initialDestinations)) {
      initialDestinations.forEach((item) => {
        const img = getValidImageUrl(item.image);
        if (img !== FALLBACK_IMAGE && !combined.some((c) => c.name.toLowerCase() === (item.name || '').toLowerCase())) {
          combined.push(item);
        }
      });
    }
    const deduped = [];
    const nameSet = new Set();
    combined.forEach((d) => {
      const key = (d.name || '').toLowerCase();
      if (!nameSet.has(key)) {
        nameSet.add(key);
        deduped.push(d);
      }
    });
    return deduped;
  }, [liveViewportDestinations, initialDestinations]);

  // Viewport change handler
  const handleMapViewportChange = useCallback(async (bbox, zoom) => {
    setIsFetchingLiveBbox(true);
    try {
      const places = await fetchLiveViewportDestinations(bbox, zoom);
      if (places && places.length > 0) {
        setLiveViewportDestinations(places);
      }
    } catch (e) {
      console.warn('Map viewport live fetch error:', e);
    } finally {
      setIsFetchingLiveBbox(false);
    }
  }, []);

  // Fetch Automatic Nearby Attractions whenever focused destination or selected route changes
  const targetLocation = useMemo(() => {
    if (focusedDest && focusedDest.lat && focusedDest.lng) {
      return { name: focusedDest.name, lat: parseFloat(focusedDest.lat), lng: parseFloat(focusedDest.lng) };
    }
    if (selectedDests.length > 0) {
      const last = selectedDests[selectedDests.length - 1];
      return { name: last.name, lat: parseFloat(last.lat), lng: parseFloat(last.lng) };
    }
    return null;
  }, [focusedDest, selectedDests]);

  useEffect(() => {
    if (!targetLocation) return;

    const timer = setTimeout(async () => {
      setIsFetchingNearby(true);
      try {
        const attractions = await fetchNearbyAttractionsForLocation(
          targetLocation.lat,
          targetLocation.lng,
          selectedRadiusKm,
          selectedNearbyCategory,
          25
        );
        setNearbyAttractions(attractions);
      } catch (err) {
        console.warn('Nearby attractions fetch error:', err);
      } finally {
        setIsFetchingNearby(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [targetLocation, selectedRadiusKm, selectedNearbyCategory]);

  // Real-time Global Nominatim Search integration
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) return;

    const timer = setTimeout(async () => {
      setIsSearchingDestinationsGlobal(true);
      try {
        const results = await searchPlaces(searchQuery, 8);
        const travelPhotos = [
          'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1500835556837-99ac94a94552?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1530789253388-582c481c54b0?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?auto=format&fit=crop&w=1200&q=80',
        ];
        const mapped = await Promise.all(
          (results || []).map(async (place, idx) => {
            const wikiData = await fetchWikipediaSummary(place.name);
            return {
              _id: `global-${place.id}-${Date.now()}-${idx}`,
              name: place.name || 'Global Destination',
              country: place.country || 'Global Place',
              lat: parseFloat(place.lat),
              lng: parseFloat(place.lng),
              image: wikiData?.thumbnail || travelPhotos[idx % travelPhotos.length],
              description: wikiData?.extract || `${place.name} is a historic point of interest in ${place.country || 'the region'}.`,
              budgetEstimate: 1400,
              pricePerDay: 160 + (idx * 25),
              rating: 4.8,
              visitorCount: `${(1.2 + (idx * 0.3)).toFixed(1)}M visitors/yr`,
              topAttractions: [`${place.name} Landmark`, 'Cultural Quarter', 'City Panorama'],
              activitiesTags: ['Sightseeing', 'Culture', 'Local Dining'],
              isGlobalResult: true,
            };
          })
        );
        setGlobalSearchDestinationsResults(mapped);
      } catch (err) {
        console.warn('Global destination search error:', err);
      } finally {
        setIsSearchingDestinationsGlobal(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Dynamic "Trending in [Active Map Region]" Filter
  const regionTrendingDestinations = useMemo(() => {
    if (activeMapRegion === 'Worldwide') return baseDestinations;
    const regionMatches = baseDestinations.filter(
      (d) => (d.country || '').toLowerCase() === activeMapRegion.toLowerCase()
    );
    return regionMatches.length > 0 ? regionMatches : baseDestinations;
  }, [activeMapRegion, baseDestinations]);

  // Search & Filter Output
  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return regionTrendingDestinations;

    const localMatched = baseDestinations.filter((d) =>
      d.name.toLowerCase().includes(q) || (d.country || '').toLowerCase().includes(q)
    );

    const combined = [...localMatched];
    globalSearchDestinationsResults.forEach((g) => {
      const exists = combined.some(
        (c) => c.name.toLowerCase() === g.name.toLowerCase() || (Math.abs(c.lat - g.lat) < 0.05 && Math.abs(c.lng - g.lng) < 0.05)
      );
      if (!exists) {
        combined.push(g);
      }
    });

    return combined;
  }, [searchQuery, baseDestinations, regionTrendingDestinations, globalSearchDestinationsResults]);

  const toggleDest = useCallback((dest) => {
    const dId = dest._id || dest.id;
    setSelectedDests((prev) => {
      const exists = prev.some((d) => (d._id || d.id) === dId);
      if (exists) return prev.filter((d) => (d._id || d.id) !== dId);
      return [...prev, dest];
    });
    const lat = parseFloat(dest.lat);
    const lng = parseFloat(dest.lng);
    if (!isNaN(lat) && !isNaN(lng)) setFlyCenter([lat, lng]);
  }, []);

  const addAllNearbyAttractions = () => {
    const newStops = nearbyAttractions.filter(
      (s) => !selectedDests.some((d) => (d._id || d.id) === (s._id || s.id))
    );
    if (newStops.length > 0) {
      setSelectedDests((prev) => [...prev, ...newStops]);
    }
  };

  const moveDest = (index, delta) => {
    const nextIndex = index + delta;
    if (nextIndex < 0 || nextIndex >= selectedDests.length) return;
    const updated = [...selectedDests];
    const [moved] = updated.splice(index, 1);
    updated.splice(nextIndex, 0, moved);
    setSelectedDests(updated);
  };

  const removeDest = (dId) => {
    setSelectedDests((prev) => prev.filter((d) => (d._id || d.id) !== dId));
  };

  const budget = useMemo(() => {
    const totalEst = selectedDests.reduce(
      (sum, d) => sum + (d.budgetEstimate || d.budget || 1200),
      0
    );
    return {
      hotel: Math.round(totalEst * 0.4),
      transport: Math.round(totalEst * 0.25),
      food: Math.round(totalEst * 0.2),
      activity: Math.round(totalEst * 0.15),
      total: totalEst,
    };
  }, [selectedDests]);

  const handleSave = async () => {
    if (!tripName.trim()) {
      alert('Please enter a trip name');
      return;
    }
    if (selectedDests.length === 0) {
      alert('Please select at least one destination');
      return;
    }

    setSaving(true);
    try {
      await createTrip({
        name: tripName,
        startDate,
        endDate,
        destinations: selectedDests.map((d) => ({
          name: d.name,
          country: d.country,
          lat: parseFloat(d.lat),
          lng: parseFloat(d.lng),
          image: getValidImageUrl(d.image),
        })),
        totalBudget: budget.total,
      }).unwrap();

      setSaved(true);
      setTimeout(() => navigate('/my-trips'), 1200);
    } catch (err) {
      console.error('Failed to create trip:', err);
      alert('Failed to save trip. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout headerTitle="Build New Trip">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-6rem)] font-poppins">
        {/* Map Column */}
        <div className={`relative rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-card-dark bg-slate-950 flex flex-col transition-all duration-300 ${previewOnlyMap ? 'w-full h-[calc(100vh-7rem)]' : 'lg:w-1/2 min-h-[450px]'}`}>
          <MapErrorBoundary>
            <MapLibreTripPlannerMap
              destinations={baseDestinations}
              nearbyAttractions={nearbyAttractions}
              selectedDests={selectedDests}
              toggleDest={toggleDest}
              flyCenter={flyCenter}
              activeLayerKey={activeLayerKey}
              setActiveLayerKey={setActiveLayerKey}
              previewOnlyMap={previewOnlyMap}
              setPreviewOnlyMap={setPreviewOnlyMap}
              activeMapRegion={activeMapRegion}
              setActiveMapRegion={setActiveMapRegion}
              focusedDest={focusedDest}
              setFocusedDest={setFocusedDest}
              onMapViewportChange={handleMapViewportChange}
            />
          </MapErrorBoundary>

          {/* Slide-Up Marker Detail Drawer */}
          <AnimatePresence>
            {focusedDest && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className="absolute bottom-4 left-4 right-4 z-[20] bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-2xl backdrop-blur-md font-poppins max-h-[70vh] overflow-y-auto"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    <img
                      src={getValidImageUrl(focusedDest.image)}
                      alt={focusedDest.name}
                      className="w-16 h-16 rounded-2xl object-cover shadow-md shrink-0"
                      onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMAGE; }}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-base text-slate-900 dark:text-slate-100">{focusedDest.name}</h4>
                        {focusedDest.flag && <span className="text-sm">{focusedDest.flag}</span>}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mt-0.5">
                        <span className="flex items-center gap-0.5 text-amber-500 font-bold">
                          ★ {focusedDest.rating || 4.9}
                        </span>
                        <span>·</span>
                        <span>📍 {focusedDest.country || 'Attraction'}</span>
                        {focusedDest.distanceKm !== undefined && (
                          <>
                            <span>·</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{focusedDest.distanceKm} km away</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setFocusedDest(null)}
                    className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800"
                  >
                    <X size={14} />
                  </button>
                </div>

                {focusedDest.description && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 mb-3 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                    {focusedDest.description}
                  </p>
                )}

                <div className="grid grid-cols-3 gap-2 text-center text-xs mb-3 font-poppins">
                  <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <span className="text-[9px] text-slate-400 uppercase font-bold block">Budget</span>
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(focusedDest.budgetDetails?.budgetCategory?.budgetTraveler || Math.round((focusedDest.pricePerDay || 200) * 0.45), selectedCurrency)}/day
                    </span>
                  </div>
                  <div className="bg-primary/10 p-2 rounded-2xl border border-primary/20">
                    <span className="text-[9px] text-primary uppercase font-bold block">Mid-Range</span>
                    <span className="font-extrabold text-primary">
                      {formatCurrency(focusedDest.pricePerDay || 200, selectedCurrency)}/day
                    </span>
                  </div>
                  <div className="bg-amber-500/10 p-2 rounded-2xl border border-amber-500/20">
                    <span className="text-[9px] text-amber-500 uppercase font-bold block">Luxury</span>
                    <span className="font-extrabold text-amber-500">
                      {formatCurrency(focusedDest.budgetDetails?.budgetCategory?.luxuryTraveler || Math.round((focusedDest.pricePerDay || 200) * 2.2), selectedCurrency)}/day
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      toggleDest(focusedDest);
                      setFocusedDest(null);
                    }}
                    className={`flex-1 py-2.5 rounded-2xl text-xs font-extrabold transition-all shadow-md flex items-center justify-center gap-1.5 ${
                      selectedDests.some((s) => (s._id || s.id) === (focusedDest._id || focusedDest.id))
                        ? 'bg-rose-500 text-white hover:bg-rose-600'
                        : 'bg-gradient-to-r from-primary to-secondary text-white hover:opacity-95'
                    }`}
                  >
                    <Plus size={14} />
                    <span>
                      {selectedDests.some((s) => (s._id || s.id) === (focusedDest._id || focusedDest.id))
                        ? 'Remove from Trip'
                        : 'Add to Trip'}
                    </span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {selectedDests.length > 0 && !focusedDest && (
            <div className="absolute bottom-4 left-4 right-4 z-[10] rounded-xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 px-4 py-3 shadow-lg backdrop-blur-md flex items-center justify-between font-poppins">
              <div>
                <p className="text-xs font-extrabold text-slate-900 dark:text-slate-100">{selectedDests.length} stop{selectedDests.length > 1 ? 's' : ''} on route</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Click map markers or cards to add/remove stops</p>
              </div>
              <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                {formatCurrency(budget.total, selectedCurrency)} total
              </span>
            </div>
          )}
        </div>

        {/* Right Interactive Discovery Panel */}
        {!previewOnlyMap && (
          <div className="lg:w-1/2 overflow-y-auto space-y-6">
            {/* 1. Trip Details Form */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-5 shadow-soft">
              <h3 className="font-poppins text-sm font-bold text-slate-900 dark:text-slate-100 mb-3">Trip Details</h3>
              <input value={tripName} onChange={(e) => setTripName(e.target.value)}
                placeholder="e.g. European Summer Adventure"
                className="input-field mb-3 font-poppins font-semibold" />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="relative">
                  <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                    className="input-field text-xs py-2.5 pl-11" />
                </div>
                <div className="relative">
                  <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                    className="input-field text-xs py-2.5 pl-11" />
                </div>
              </div>
            </div>

            {/* 2. Destination Search & Live OpenTripMap / Wikipedia API Discovery */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-5 shadow-soft">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Flame size={16} className="text-rose-500 animate-bounce" />
                  <h3 className="font-poppins text-sm font-extrabold text-slate-900 dark:text-slate-100">
                    {searchQuery ? 'Search Results' : `Trending in ${activeMapRegion}`}
                  </h3>
                </div>
                {(isSearchingDestinationsGlobal || isFetchingLiveBbox) && (
                  <span className="text-[10px] font-bold text-primary animate-pulse flex items-center gap-1">
                    <Sparkles size={11} />
                    <span>Loading Live OpenTripMap API...</span>
                  </span>
                )}
              </div>

              <div className="relative mb-4">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Paris, Kyoto, Rome, Tokyo, or any place..."
                  className="input-field text-xs py-2.5 pl-10"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="grid max-h-72 grid-cols-2 gap-3 overflow-y-auto pr-1 sm:grid-cols-2 font-poppins">
                {filtered.map((d) => {
                  const dId = d._id || d.id;
                  const selected = selectedDests.some((s) => (s._id || s.id) === dId);
                  const imgUrl = getValidImageUrl(d.image);
                  return (
                    <motion.div
                      key={dId}
                      whileHover={{ y: -3 }}
                      onClick={() => {
                        setFocusedDest(d);
                        if (d.lat && d.lng) setFlyCenter([d.lat, d.lng]);
                      }}
                      className={`relative rounded-2xl overflow-hidden group cursor-pointer border transition-all text-left bg-slate-900 ${
                        selected
                          ? 'ring-2 ring-primary border-primary'
                          : 'border-slate-200 dark:border-slate-700/80 hover:border-primary/50'
                      }`}
                    >
                      <div className="h-28 relative">
                        <img
                          src={imgUrl}
                          alt={d.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                          onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMAGE; }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

                        {selected && (
                          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-lg">
                            <Check size={12} className="text-white" />
                          </div>
                        )}

                        {d.isLiveApiResult && (
                          <div className="absolute top-2 left-2 bg-emerald-500/90 backdrop-blur-md text-white text-[8px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Live API
                          </div>
                        )}

                        <div className="absolute bottom-2 left-2 right-2">
                          <div className="flex items-center gap-1.5">
                            <p className="text-white text-xs font-extrabold truncate">{d.name}</p>
                            {d.flag && <span className="text-xs">{d.flag}</span>}
                          </div>
                          <p className="text-white/70 text-[10px]">{d.country}</p>
                        </div>
                      </div>

                      <div className="p-2.5 flex items-center justify-between bg-slate-900 text-white">
                        <div>
                          <p className="text-[10px] text-slate-400 font-medium">Est. Budget</p>
                          <p className="text-xs font-extrabold text-emerald-400">{formatCurrency(d.pricePerDay || 200, selectedCurrency)}/day</p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleDest(d);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold transition-all ${
                            selected
                              ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'
                              : 'bg-primary text-white hover:bg-primary-dark shadow-md'
                          }`}
                        >
                          {selected ? 'Remove' : '+ Add'}
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* 3. Automatic Nearby Famous Places & Attractions Engine (OpenTripMap Radius API) */}
            {targetLocation && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-5 shadow-soft font-poppins">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <Sparkles size={16} className="text-amber-500 animate-pulse" />
                      <span>Nearby Famous Places near {targetLocation.name}</span>
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Fetched live from OpenTripMap &amp; Wikipedia APIs
                    </p>
                  </div>
                  {nearbyAttractions.length > 0 && (
                    <button
                      onClick={addAllNearbyAttractions}
                      className="text-xs font-extrabold text-primary hover:underline flex items-center gap-1"
                    >
                      <span>Add All ({nearbyAttractions.length})</span>
                      <Plus size={12} />
                    </button>
                  )}
                </div>

                {/* Radius Filter Pills (5km, 10km, 25km, 50km) */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold text-slate-400">Radius:</span>
                  {RADIUS_OPTIONS.map((r) => (
                    <button
                      key={r}
                      onClick={() => setSelectedRadiusKm(r)}
                      className={`px-3 py-1 rounded-xl text-xs font-extrabold transition-all ${
                        selectedRadiusKm === r
                          ? 'bg-primary text-white shadow-md'
                          : 'bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {r} km
                    </button>
                  ))}
                </div>

                {/* 12 Categorized Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2 mb-3">
                  {NEARBY_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedNearbyCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold shrink-0 transition-all ${
                        selectedNearbyCategory === cat.id
                          ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-md'
                          : 'bg-slate-50 dark:bg-slate-700/40 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {isFetchingNearby ? (
                  <div className="flex items-center justify-center py-8 gap-2 text-xs text-primary font-bold animate-pulse">
                    <Sparkles size={16} />
                    <span>Fetching live points of interest from OpenTripMap...</span>
                  </div>
                ) : nearbyAttractions.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">No nearby places found for this radius/category. Try expanding the radius tab.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1">
                    {nearbyAttractions.map((att) => {
                      const aId = att._id || att.id;
                      const selected = selectedDests.some((s) => (s._id || s.id) === aId);
                      return (
                        <div
                          key={aId}
                          onClick={() => {
                            setFocusedDest(att);
                            if (att.lat && att.lng) setFlyCenter([att.lat, att.lng]);
                          }}
                          className="flex items-center gap-2.5 p-2 rounded-2xl bg-slate-50 dark:bg-slate-700/40 border border-slate-200/80 dark:border-slate-700 hover:border-primary/50 transition-all cursor-pointer group"
                        >
                          <img
                            src={getValidImageUrl(att.image)}
                            alt={att.name}
                            className="w-10 h-10 rounded-xl object-cover shrink-0"
                            onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMAGE; }}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-primary transition-colors">{att.name}</p>
                            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">{att.distanceKm} km away · ~{att.driveMins} mins</p>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleDest(att);
                            }}
                            className={`p-1.5 rounded-xl transition-all ${
                              selected
                                ? 'bg-rose-500/20 text-rose-500'
                                : 'bg-primary text-white hover:bg-primary-dark shadow-sm'
                            }`}
                          >
                            {selected ? <X size={13} /> : <Plus size={13} />}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* 4. Selected Trip Route Sequence */}
            {selectedDests.length > 0 && (
              <div className="space-y-3 font-poppins">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">Your Route ({selectedDests.length} stops)</h3>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(budget.total, selectedCurrency)} est.
                  </span>
                </div>
                {selectedDests.map((dest, idx) => {
                  const dId = dest._id || dest.id;
                  const fullDest = baseDestinations.find((d) => (d._id || d.id) === dId);
                  const imgUrl = getValidImageUrl(dest.image);
                  return (
                    <motion.div key={dId} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}
                      className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-soft overflow-hidden">
                      <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-primary/5 dark:from-primary/10 to-transparent">
                        <div className="flex flex-col gap-0.5">
                          <button aria-label={`Move ${dest.name} up`} onClick={() => moveDest(idx, -1)} disabled={idx === 0} className="flex min-h-5 min-w-8 items-center justify-center rounded-md text-slate-400 hover:text-primary disabled:opacity-30"><ChevronUp size={12} /></button>
                          <button aria-label={`Move ${dest.name} down`} onClick={() => moveDest(idx, 1)} disabled={idx === selectedDests.length - 1} className="flex min-h-5 min-w-8 items-center justify-center rounded-md text-slate-400 hover:text-primary disabled:opacity-30"><ChevronDown size={12} /></button>
                        </div>
                        <GripVertical size={14} className="text-slate-400" />
                        <span className="w-6 h-6 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">Day {idx + 1}</span>
                        <img src={imgUrl} alt={dest.name} className="w-9 h-9 rounded-xl object-cover" onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMAGE; }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{dest.name}{dest.country ? `, ${dest.country}` : ''}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">{formatCurrency(dest.budgetEstimate || dest.budget || 200, selectedCurrency)} est. · {fullDest?.topAttractions?.length || 3} attractions</p>
                        </div>
                        <button aria-label={`Remove ${dest.name}`} onClick={() => removeDest(dId)} className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 hover:bg-rose-500/20 transition-colors"><Trash2 size={13} /></button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* 5. Estimated Budget Breakdown with Currency Selector */}
            {selectedDests.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-primary via-secondary to-accent rounded-3xl p-5 text-white shadow-xl font-poppins">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold">Estimated Budget Breakdown</h3>

                  {/* Currency Selector Dropdown */}
                  <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/20 shadow-md">
                    <DollarSign size={13} className="text-white" />
                    <select
                      value={selectedCurrency}
                      onChange={(e) => setSelectedCurrency(e.target.value)}
                      className="bg-transparent text-xs font-extrabold text-white outline-none cursor-pointer pr-1"
                    >
                      {Object.keys(CURRENCIES).map((code) => (
                        <option key={code} value={code} className="bg-slate-900 text-white">
                          {CURRENCIES[code].name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[
                    { label: 'Hotels', val: budget.hotel, icon: Hotel },
                    { label: 'Transport', val: budget.transport, icon: Car },
                    { label: 'Food', val: budget.food, icon: Utensils },
                    { label: 'Activities', val: budget.activity, icon: Ticket },
                  ].map((b) => (
                    <div key={b.label} className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                      <b.icon size={15} className="text-white/80 mb-1" />
                      <p className="text-lg font-bold">{formatCurrency(b.val, selectedCurrency)}</p>
                      <p className="text-[10px] text-white/70 font-medium">{b.label}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 text-center border border-white/20">
                  <p className="text-white/80 text-[10px] uppercase tracking-widest font-bold mb-0.5">Total Estimated Budget</p>
                  <p className="text-3xl font-extrabold">{formatCurrency(budget.total, selectedCurrency)}</p>
                </div>
              </motion.div>
            )}

            {/* 6. Save Trip Action Button */}
            <div className="pb-8">
              <Button variant="primary" onClick={handleSave} className="w-full py-4 text-sm font-bold shadow-lg font-poppins" disabled={saving || saved || selectedDests.length === 0}>
                {saving ? 'Saving Trip...' : saved ? 'Trip Saved!' : 'Save Trip Itinerary'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}