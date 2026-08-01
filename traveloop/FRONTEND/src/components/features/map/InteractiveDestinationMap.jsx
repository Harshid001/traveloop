import React, { useState, useMemo, useEffect, useRef } from 'react';
import maplibregl, { MAPLIBRE_STYLES, DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from '../../../config/maplibre';
import {
  Layers, Compass, Navigation, Globe, Sparkles, Maximize2, RotateCcw, Box, Scale, Play, MapPin, Eye, Flame, Layers3, LocateFixed
} from 'lucide-react';
import DestinationGlassPanel from './DestinationGlassPanel';
import LiveInfoDashboard from './LiveInfoDashboard';
import SearchAndFilterBar from './SearchAndFilterBar';
import RoutePlannerDrawer from './RoutePlannerDrawer';
import AITripPlannerModal from './AITripPlannerModal';
import BookingModal from './BookingModal';
import CompareDestinationsModal from './CompareDestinationsModal';
import { GLOBAL_DESTINATIONS, STANDALONE_POIS, MARKER_CATEGORIES } from '../../../data/destinationsData';
import { getOSRMRoute } from '../../../services/osrmService';
import { reverseGeocode } from '../../../services/nominatimService';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80';

export default function InteractiveDestinationMap({ initialCategory = 'All' }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  // Filter & Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [filterOptions, setFilterOptions] = useState({ maxPrice: 500, minRating: 0, category: 'All' });

  // Layer & View state (Default to OpenStreetMap Light)
  const [activeStyleKey, setActiveStyleKey] = useState('streets');
  const [pitch3d, setPitch3d] = useState(false);
  const [heatmapOn, setHeatmapOn] = useState(false);
  const [trafficOn, setTrafficOn] = useState(false);

  // Selection & Modal states
  const [selectedDest, setSelectedDest] = useState(null);
  const [savedIds, setSavedIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem('traveloop_saved_destinations') || '{}'); }
    catch { return {}; }
  });
  const [compareList, setCompareList] = useState([]);
  const [routeStops, setRouteStops] = useState([]);
  const [userLocation, setUserLocation] = useState(null);

  // Drawer / Modal visibility
  const [showRouteDrawer, setShowRouteDrawer] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);

  // OSRM route details
  const [routeStats, setRouteStats] = useState({ distanceKm: 0, durationMinutes: 0 });

  const activeLayer = MAPLIBRE_STYLES[activeStyleKey] || MAPLIBRE_STYLES.voyager;

  // Filtered dataset
  const filteredDestinations = useMemo(() => {
    return GLOBAL_DESTINATIONS.filter((d) => {
      const matchCat = activeCategory === 'All' || d.category === activeCategory || d.type === activeCategory || (d.subCategories && d.subCategories.includes(activeCategory));
      const matchPrice = (d.pricePerDay || 200) <= filterOptions.maxPrice;
      const matchRating = (d.rating || 0) >= filterOptions.minRating;
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        `${d.name} ${d.country} ${d.city || ''} ${d.description || ''} ${d.category}`.toLowerCase().includes(q);
      return matchCat && matchPrice && matchRating && matchSearch;
    });
  }, [searchQuery, activeCategory, filterOptions]);

  const toggleSave = (id) => {
    setSavedIds((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      localStorage.setItem('traveloop_saved_destinations', JSON.stringify(next));
      return next;
    });
  };

  const handleAddToCompare = (dest) => {
    if (!dest) return;
    if (compareList.some((c) => c.id === dest.id)) {
      setCompareList(compareList.filter((c) => c.id !== dest.id));
    } else {
      if (compareList.length >= 3) {
        alert('You can compare up to 3 destinations at a time.');
        return;
      }
      setCompareList([...compareList, dest]);
      setShowCompareModal(true);
    }
  };

  const handleAddToRoute = (dest) => {
    if (!dest) return;
    if (!routeStops.some((s) => s.id === dest.id)) {
      setRouteStops([...routeStops, dest]);
    }
    setShowRouteDrawer(true);
  };

  const setupMapLayers = (map) => {
    if (!map) return;
    if (!map.getSource('destinations-heatmap-source')) {
      const features = GLOBAL_DESTINATIONS.map((d) => ({
        type: 'Feature',
        properties: {
          id: d.id,
          name: d.name,
          pricePerDay: d.pricePerDay || 200,
          rating: d.rating || 4.5,
        },
        geometry: {
          type: 'Point',
          coordinates: [parseFloat(d.lng), parseFloat(d.lat)],
        },
      }));

      map.addSource('destinations-heatmap-source', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features },
      });
    }

    if (!map.getLayer('destinations-heatmap-layer')) {
      map.addLayer({
        id: 'destinations-heatmap-layer',
        type: 'heatmap',
        source: 'destinations-heatmap-source',
        layout: { visibility: heatmapOn ? 'visible' : 'none' },
        paint: {
          'heatmap-weight': ['interpolate', ['linear'], ['get', 'pricePerDay'], 0, 0, 500, 1],
          'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 9, 3],
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(99, 102, 241, 0)',
            0.2, 'rgb(99, 102, 241)',
            0.4, 'rgb(6, 182, 212)',
            0.6, 'rgb(245, 158, 11)',
            0.8, 'rgb(239, 68, 68)',
            1, 'rgb(225, 29, 72)'
          ],
          'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 4, 9, 30],
          'heatmap-opacity': 0.85,
        },
      });
    }

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
  };

  // Initialize MapLibre GL JS instance
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: activeLayer.style,
      center: DEFAULT_MAP_CENTER,
      zoom: DEFAULT_MAP_ZOOM,
      pitch: 0,
      bearing: 0,
      maxZoom: 18,
      minZoom: 1.5,
      dragRotate: false,
      pitchWithRotate: false,
      touchPitch: false,
      attributionControl: false,
    });

    map.on('error', (e) => {
      console.warn('MapLibre GL notice:', e?.error?.message || e);
    });

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'bottom-right');

    const geolocate = new maplibregl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
      showUserHeading: true,
    });
    map.addControl(geolocate, 'bottom-right');

    geolocate.on('geolocate', async (e) => {
      const lat = e.coords.latitude;
      const lng = e.coords.longitude;
      setUserLocation({ lat, lng });

      try {
        const place = await reverseGeocode(lat, lng);
        console.log('User GPS Location:', place.displayName);
      } catch (err) {
        console.warn('GPS location reverse geocode error:', err);
      }
    });

    map.on('load', () => {
      map.resize();
      setupMapLayers(map);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update map style safely when changed
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    map.setStyle(activeLayer.style);
    map.once('styledata', () => {
      setupMapLayers(map);
    });
  }, [activeStyleKey, activeLayer.style]);

  // Toggle 3D Pitch
  const toggle3dPitch = () => {
    if (!mapRef.current) return;
    const nextPitch = pitch3d ? 0 : 60;
    mapRef.current.easeTo({ pitch: nextPitch, duration: 1000 });
    setPitch3d(!pitch3d);
  };

  // Toggle Heatmap Layer
  const toggleHeatmap = () => {
    const map = mapRef.current;
    if (!map || !map.getLayer('destinations-heatmap-layer')) return;
    const nextState = !heatmapOn;
    map.setLayoutProperty('destinations-heatmap-layer', 'visibility', nextState ? 'visible' : 'none');
    setHeatmapOn(nextState);
  };

  // Fullscreen mode toggle
  const toggleFullscreen = () => {
    if (!mapContainerRef.current) return;
    if (!document.fullscreenElement) {
      mapContainerRef.current.requestFullscreen().catch((err) => console.warn(err));
    } else {
      document.exitFullscreen().catch((err) => console.warn(err));
    }
  };

  // Synchronize Ultra-Clean Minimal Dot Pins
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    filteredDestinations.forEach((dest) => {
      const lat = parseFloat(dest.lat);
      const lng = parseFloat(dest.lng);
      if (isNaN(lat) || isNaN(lng)) return;

      const categoryMeta = MARKER_CATEGORIES[dest.category] || MARKER_CATEGORIES[dest.type] || MARKER_CATEGORIES.Destination;
      const isSelected = selectedDest?.id === dest.id;
      const isSaved = !!savedIds[dest.id];
      const accentColor = isSelected ? '#6366F1' : isSaved ? '#EF4444' : categoryMeta.color;

      const el = document.createElement('div');
      el.className = 'custom-map-minimal-dot group cursor-pointer';
      el.title = `${dest.name}, ${dest.country}`;
      el.innerHTML = `
        <div style="
          transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
          width: ${isSelected ? '26px' : '20px'};
          height: ${isSelected ? '26px' : '20px'};
          border-radius: 50%;
          background: rgba(15, 23, 42, 0.9);
          backdrop-filter: blur(8px);
          border: 2px solid ${accentColor};
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 16px rgba(0,0,0,0.4), 0 0 10px ${accentColor}80;
        ">
          <span style="
            width: ${isSelected ? '8px' : '6px'};
            height: ${isSelected ? '8px' : '6px'};
            border-radius: 50%;
            background: ${accentColor};
            box-shadow: 0 0 6px ${accentColor};
          "></span>
        </div>
      `;

      // Popup Content
      const popupNode = document.createElement('div');
      popupNode.className = 'p-1 text-center font-poppins min-w-[160px]';
      popupNode.innerHTML = `
        <p class="font-extrabold text-xs text-slate-900 dark:text-slate-100">${dest.name} ${dest.flag || ''}</p>
        <p class="text-[10px] text-slate-500 font-medium">${dest.country} · ${categoryMeta.label}</p>
        <p class="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">$${dest.pricePerDay || 200}/day</p>
      `;

      const btn = document.createElement('button');
      btn.className = 'mt-2 w-full py-1.5 text-xs font-extrabold text-white bg-primary hover:bg-primary-dark rounded-xl shadow-md transition-all';
      btn.innerText = 'Explore Destination';
      btn.onclick = () => {
        setSelectedDest(dest);
        map.flyTo({ center: [lng, lat], zoom: 6, duration: 1500 });
      };
      popupNode.appendChild(btn);

      const popup = new maplibregl.Popup({ offset: [0, -14], closeButton: true }).setDOMContent(popupNode);

      const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(map);

      el.addEventListener('click', () => {
        setSelectedDest(dest);
        map.flyTo({ center: [lng, lat], zoom: 6, duration: 1500 });
      });

      markersRef.current.push(marker);
    });

    // Render Standalone POIs
    STANDALONE_POIS.forEach((poi) => {
      const categoryMeta = MARKER_CATEGORIES[poi.category] || MARKER_CATEGORIES.Attraction;
      const el = document.createElement('div');
      el.className = 'custom-poi-marker cursor-pointer group';
      el.title = poi.name;
      el.innerHTML = `
        <div style="
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: rgba(15, 23, 42, 0.85);
          border: 1.5px solid ${categoryMeta.color || '#3B82F6'};
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        ">
          <span style="width: 4px; height: 4px; border-radius: 50%; background: ${categoryMeta.color || '#3B82F6'};"></span>
        </div>
      `;

      const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat([poi.lng, poi.lat])
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [filteredDestinations, selectedDest, savedIds]);

  // Synchronize GeoJSON Route Polyline via free OSRM Service
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (routeStops.length < 2) {
      if (map.getSource('route-line-source')) {
        map.getSource('route-line-source').setData({
          type: 'Feature',
          properties: {},
          geometry: { type: 'LineString', coordinates: [] },
        });
      }
      setRouteStats({ distanceKm: 0, durationMinutes: 0 });
      return;
    }

    const stops = routeStops.map((s) => ({ lat: parseFloat(s.lat), lng: parseFloat(s.lng) }));

    getOSRMRoute(stops, 'driving').then((res) => {
      if (!res || !map.getSource('route-line-source')) return;

      setRouteStats({ distanceKm: res.distanceKm, durationMinutes: res.durationMinutes });

      map.getSource('route-line-source').setData({
        type: 'Feature',
        properties: {},
        geometry: { type: 'LineString', coordinates: res.coordinates },
      });

      const bounds = new maplibregl.LngLatBounds();
      res.coordinates.forEach((coord) => bounds.extend(coord));
      map.fitBounds(bounds, { padding: 80, duration: 1500 });
    });
  }, [routeStops]);

  // 3D Camera Flyover Playback
  const handlePlayFlyover = () => {
    const map = mapRef.current;
    if (!map || routeStops.length === 0) return;

    let index = 0;
    const flyNext = () => {
      if (index >= routeStops.length) return;
      const stop = routeStops[index];
      map.flyTo({
        center: [parseFloat(stop.lng), parseFloat(stop.lat)],
        zoom: 7,
        pitch: 60,
        bearing: index * 45,
        duration: 3000,
      });
      index++;
      if (index < routeStops.length) {
        setTimeout(flyNext, 3500);
      }
    };
    flyNext();
  };

  return (
    <div className="relative w-full h-[750px] rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-2xl group font-poppins">
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Top Floating Bar: Search & Smart Filters */}
      <div className="absolute top-4 left-4 right-4 z-[20] flex items-center justify-between gap-3 pointer-events-none">
        <div className="pointer-events-auto flex-1 max-w-xl">
          <SearchAndFilterBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            destinations={GLOBAL_DESTINATIONS}
            onSelectDestination={(dest) => {
              setSelectedDest(dest);
              if (mapRef.current) {
                mapRef.current.flyTo({ center: [dest.lng, dest.lat], zoom: 6, duration: 1500 });
              }
            }}
            filterOptions={filterOptions}
            setFilterOptions={setFilterOptions}
          />
        </div>

        {/* Action Triggers */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Style Selector */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-2xl border border-white/15 shadow-2xl font-poppins">
            <Layers size={14} className="text-primary-light" />
            <select
              value={activeStyleKey}
              onChange={(e) => setActiveStyleKey(e.target.value)}
              className="bg-transparent text-xs font-bold text-white outline-none cursor-pointer pr-1"
            >
              {Object.keys(MAPLIBRE_STYLES).map((key) => (
                <option key={key} value={key} className="bg-slate-900 text-white">
                  {MAPLIBRE_STYLES[key].name}
                </option>
              ))}
            </select>
          </div>

          {/* Heatmap Toggle */}
          <button
            onClick={toggleHeatmap}
            className={`flex items-center gap-1 text-xs font-bold px-3 py-2 rounded-2xl border backdrop-blur-md transition-all shadow-2xl ${
              heatmapOn
                ? 'bg-rose-600 text-white border-rose-400 shadow-rose-500/30'
                : 'bg-slate-900/90 text-white/90 hover:text-white border-white/15'
            }`}
            title="Toggle Destination Density Heatmap"
          >
            <Flame size={14} className={heatmapOn ? 'animate-pulse text-white' : ''} />
            <span className="hidden sm:inline">Heatmap</span>
          </button>

          {/* 3D Pitch Toggle */}
          <button
            onClick={toggle3dPitch}
            className={`flex items-center gap-1 text-xs font-bold px-3 py-2 rounded-2xl border backdrop-blur-md transition-all shadow-2xl ${
              pitch3d
                ? 'bg-primary text-white border-primary-light'
                : 'bg-slate-900/90 text-white/90 hover:text-white border-white/15'
            }`}
            title="Toggle 3D View Perspective"
          >
            <Compass size={14} className={pitch3d ? 'animate-spin' : ''} />
            <span>3D</span>
          </button>

          {/* Route Planner Drawer Trigger */}
          <button
            onClick={() => setShowRouteDrawer(!showRouteDrawer)}
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-2xl border backdrop-blur-md transition-all shadow-2xl ${
              routeStops.length > 0
                ? 'bg-emerald-500 text-white border-emerald-400'
                : 'bg-slate-900/90 text-white/90 hover:text-white border-white/15'
            }`}
          >
            <Navigation size={14} />
            <span className="hidden sm:inline">Route ({routeStops.length})</span>
          </button>

          {/* AI Trip Planner Trigger */}
          <button
            onClick={() => setShowAIModal(true)}
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-2xl bg-gradient-to-r from-primary via-secondary to-accent text-white shadow-2xl hover:opacity-95 transition-all"
          >
            <Sparkles size={14} />
            <span className="hidden sm:inline">AI Planner</span>
          </button>

          {/* Fullscreen Trigger */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-2xl bg-slate-900/90 border border-white/15 text-white/90 hover:text-white backdrop-blur-md shadow-2xl transition-all"
            title="Toggle Fullscreen Map View"
          >
            <Maximize2 size={14} />
          </button>
        </div>
      </div>

      {/* Floating Bottom Left: Live Info Overlay */}
      <div className="absolute bottom-6 left-4 z-[20] pointer-events-auto">
        <LiveInfoDashboard
          selectedDest={selectedDest}
          trafficOn={trafficOn}
          setTrafficOn={setTrafficOn}
        />
      </div>

      {/* Glassmorphism Detail Drawer */}
      {selectedDest && (
        <DestinationGlassPanel
          destination={selectedDest}
          onClose={() => setSelectedDest(null)}
          onSave={() => toggleSave(selectedDest.id)}
          isSaved={!!savedIds[selectedDest.id]}
          onAddToRoute={() => handleAddToRoute(selectedDest)}
          onAddToCompare={() => handleAddToCompare(selectedDest)}
          isCompared={compareList.some((c) => c.id === selectedDest.id)}
          onOpenBooking={() => setShowBookingModal(true)}
          userLocation={userLocation}
        />
      )}

      {/* Route Planner Drawer */}
      {showRouteDrawer && (
        <RoutePlannerDrawer
          routeStops={routeStops}
          setRouteStops={setRouteStops}
          onClose={() => setShowRouteDrawer(false)}
          onPlayFlyover={handlePlayFlyover}
          routeStats={routeStats}
          onOptimizeRoute={() => {
            const copy = [...routeStops];
            copy.sort((a, b) => a.lat - b.lat);
            setRouteStops(copy);
          }}
        />
      )}

      {/* AI Trip Planner Modal */}
      <AITripPlannerModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        onApplyAIRoute={() => {
          setRouteStops(GLOBAL_DESTINATIONS.slice(0, 4));
          setShowRouteDrawer(true);
        }}
      />

      {/* Instant Booking Modal */}
      <BookingModal
        destination={selectedDest || GLOBAL_DESTINATIONS[0]}
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
      />

      {/* Compare Destinations Modal */}
      {showCompareModal && (
        <CompareDestinationsModal
          compareList={compareList}
          onRemoveFromCompare={(id) => setCompareList(compareList.filter((c) => c.id !== id))}
          onClose={() => setShowCompareModal(false)}
        />
      )}
    </div>
  );
}
