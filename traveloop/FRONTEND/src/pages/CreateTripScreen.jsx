import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  ArrowLeft, Trash2, Calendar, Check,
  ChevronUp, ChevronDown, Search, Star, Hotel, Utensils, Car, Ticket,
  Save, GripVertical, MapPin, Maximize2, Layers, Compass, Globe
} from 'lucide-react';
import { useGetDestinationsQuery, useCreateTripMutation } from '../services/apiSlice';
import Button from '../components/ui/Button';
import AppLayout from '../components/layout/AppLayout';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const selectedIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const defaultIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

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
        <div className="w-full h-full min-h-[350px] flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900 rounded-3xl p-6 text-center border border-slate-200 dark:border-slate-800">
          <p className="font-poppins font-bold text-sm text-slate-800 dark:text-slate-200 mb-1">Interactive Map Preview</p>
          <p className="text-xs text-slate-500 mb-4 max-w-xs">Map tiles re-initializing. Select your destinations using the list on the right.</p>
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

const mapLayers = {
  voyager: {
    name: 'Carto Voyager HD',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attr: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
  osm: {
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attr: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
  topo: {
    name: 'Topographic',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attr: '&copy; OpenTopoMap &copy; OpenStreetMap',
  },
};

function MapResizeHelper() {
  const map = useMap();
  useEffect(() => {
    const handleResize = () => map.invalidateSize();
    window.addEventListener('resize', handleResize);
    const timer = setTimeout(() => map.invalidateSize(), 250);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, [map]);
  return null;
}

function AutoFitBounds({ points }) {
  const map = useMap();
  useEffect(() => {
    if (points && points.length > 1) {
      const validPoints = points.filter(([lat, lng]) => !isNaN(lat) && !isNaN(lng));
      if (validPoints.length > 1) {
        try {
          const bounds = L.latLngBounds(validPoints);
          if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12, animate: true });
          }
        } catch (e) {
          console.warn('AutoFitBounds error:', e);
        }
      }
    }
  }, [points, map]);
  return null;
}

function MapClickHandler({ destinations, onSelectNearest }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      let closest = null;
      let minDistance = Infinity;
      destinations.forEach((d) => {
        const dLat = parseFloat(d.lat);
        const dLng = parseFloat(d.lng);
        if (!isNaN(dLat) && !isNaN(dLng)) {
          const dist = Math.hypot(dLat - lat, dLng - lng);
          if (dist < minDistance && dist < 1.5) {
            minDistance = dist;
            closest = d;
          }
        }
      });
      if (closest) onSelectNearest(closest);
    },
  });
  return null;
}

function FlyTo({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && Array.isArray(center) && center.length === 2) {
      const lat = parseFloat(center[0]);
      const lng = parseFloat(center[1]);
      if (!isNaN(lat) && !isNaN(lng)) {
        try {
          map.flyTo([lat, lng], 8, { duration: 1.2 });
        } catch (e) {
          console.warn('FlyTo error:', e);
        }
      }
    }
  }, [center, map]);
  return null;
}

function MapControlsBar({ activeLayer, setActiveLayerKey, routeLine, setFlyCenter }) {
  const map = useMap();
  return (
    <div className="absolute top-3 right-3 z-[600] flex items-center gap-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl">
      <button
        type="button"
        onClick={() => setActiveLayerKey((k) => (k === 'voyager' ? 'osm' : k === 'osm' ? 'topo' : 'voyager'))}
        title={`Switch Map Layer (${activeLayer.name})`}
        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <Layers size={13} className="text-primary" />
        <span className="hidden sm:inline">{activeLayer.name}</span>
      </button>
      {routeLine.length > 0 && (
        <button
          type="button"
          onClick={() => setFlyCenter([...routeLine[0]])}
          title="Focus on first stop"
          className="flex items-center gap-1 px-2 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Compass size={13} className="text-primary" />
          <span>Center</span>
        </button>
      )}
      <div className="flex items-center border-l border-slate-200 dark:border-slate-800 pl-1.5 ml-1">
        <button
          type="button"
          onClick={() => map.zoomIn()}
          className="w-7 h-7 flex items-center justify-center font-bold text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          title="Zoom in"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => map.zoomOut()}
          className="w-7 h-7 flex items-center justify-center font-bold text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          title="Zoom out"
        >
          −
        </button>
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
  const [activeLayerKey, setActiveLayerKey] = useState('voyager');
  const [customPlaces, setCustomPlaces] = useState([]);
  const [mapSearchQuery, setMapSearchQuery] = useState('');
  const [mapSearchOpen, setMapSearchOpen] = useState(false);
  const [globalSearchResults, setGlobalSearchResults] = useState([]);
  const [isSearchingGlobal, setIsSearchingGlobal] = useState(false);

  const { data: initialDestinations = [], isLoading: destsLoading } = useGetDestinationsQuery();
  const [createTrip] = useCreateTripMutation();

  const destinations = useMemo(() => {
    return [...initialDestinations, ...customPlaces];
  }, [initialDestinations, customPlaces]);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return destinations;
    const q = searchQuery.toLowerCase();
    return destinations.filter((d) =>
      d.name.toLowerCase().includes(q) || (d.country || '').toLowerCase().includes(q)
    );
  }, [searchQuery, destinations]);

  const activeLayer = mapLayers[activeLayerKey];

  useEffect(() => {
    if (!mapSearchQuery.trim() || mapSearchQuery.length < 2) {
      setGlobalSearchResults([]);
      setIsSearchingGlobal(false);
      return;
    }
    
    setIsSearchingGlobal(true);
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(mapSearchQuery.trim())}&limit=4`,
          { signal: controller.signal }
        );
        if (res.ok) {
          const data = await res.json();
          setGlobalSearchResults(data);
        }
      } catch (err) {
        if (err.name !== 'AbortError') console.error('Geocoding search error:', err);
      } finally {
        setIsSearchingGlobal(false);
      }
    }, 450);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [mapSearchQuery]);

  const toggleDest = useCallback((dest) => {
    setSelectedDests((prev) => {
      const exists = prev.find((d) => (d.id || d._id) === (dest.id || dest._id));
      if (exists) return prev.filter((d) => (d.id || d._id) !== (dest.id || dest._id));
      return [...prev, dest];
    });
    if (dest.lat && dest.lng) setFlyCenter([dest.lat, dest.lng]);
  }, []);

  const moveDest = (idx, dir) => {
    setSelectedDests((prev) => {
      const arr = [...prev];
      const next = idx + dir;
      if (next < 0 || next >= arr.length) return arr;
      [arr[idx], arr[next]] = [arr[next], arr[idx]];
      return arr;
    });
  };

  const removeDest = (id) => setSelectedDests((prev) => prev.filter((d) => (d.id || d._id) !== id));

  const budget = useMemo(() => {
    let hotel = 0, transport = 0, food = 0, activity = 0;
    selectedDests.forEach((d) => {
      const est = d.budgetEstimate || d.budget || 2000;
      hotel += Math.round(est * 0.4);
      transport += Math.round(est * 0.25);
      food += Math.round(est * 0.2);
      const destData = destinations.find((dd) => (dd.id || dd._id) === (d.id || d._id));
      destData?.activities?.forEach((act) => {
        activity += act.cost || 0;
      });
    });
    return { hotel, transport, food, activity, total: hotel + transport + food + activity };
  }, [selectedDests, destinations]);

  const routeLine = useMemo(
    () =>
      selectedDests
        .map((d) => [parseFloat(d.lat), parseFloat(d.lng)])
        .filter(([lat, lng]) => !isNaN(lat) && !isNaN(lng)),
    [selectedDests],
  );

  const handleSave = async () => {
    if (selectedDests.length === 0) return;
    setSaving(true);
    try {
      await createTrip({
        title: tripName || 'My Adventure',
        destinations: selectedDests.map((d) => d._id || d.id),
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        budget: budget.total,
        status: 'upcoming',
      }).unwrap();
      setSaved(true);
      navigate('/my-trips');
    } catch (err) {
      console.error('Failed to create trip:', err.message);
    } finally {
      setSaving(false);
    }
  };

  const mapSearchResults = useMemo(() => {
    if (!mapSearchQuery.trim()) return [];
    const q = mapSearchQuery.toLowerCase();
    return destinations.filter((d) =>
      d.name.toLowerCase().includes(q) || (d.country || '').toLowerCase().includes(q)
    ).slice(0, 4);
  }, [mapSearchQuery, destinations]);

  const selectFromMapSearch = (dest) => {
    if (dest.lat && dest.lng) {
      setFlyCenter([dest.lat, dest.lng]);
    }
    const isSelected = selectedDests.some((s) => (s._id || s.id) === (dest._id || dest.id));
    if (!isSelected) {
      toggleDest(dest);
    }
    setMapSearchQuery('');
    setMapSearchOpen(false);
  };

  const selectGlobalPlace = (place) => {
    const lat = parseFloat(place.lat);
    const lng = parseFloat(place.lon);
    const parts = place.display_name.split(',');
    const name = parts[0].trim();
    const country = parts.length > 1 ? parts[parts.length - 1].trim() : '';

    const newDest = {
      _id: `geo_${place.place_id}`,
      id: `geo_${place.place_id}`,
      name,
      country,
      lat,
      lng,
      image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=400&q=80',
      budgetEstimate: 1800,
      rating: 4.8,
    };

    setCustomPlaces((prev) => [...prev.filter((p) => p._id !== newDest._id), newDest]);
    toggleDest(newDest);
    setFlyCenter([lat, lng]);
    setMapSearchQuery('');
    setMapSearchOpen(false);
  };

  return (
    <AppLayout>
      {/* Top Page Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button aria-label="Back to home" onClick={() => navigate('/home')} className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors"><ArrowLeft size={18} /></button>
          <div>
            <h1 className="font-poppins text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Create Trip Itinerary</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">{selectedDests.length} destinations selected · Interactive live map with search</p>
          </div>
        </div>
        <Button variant="primary" onClick={handleSave} className="text-xs px-5 py-2.5 shadow-md font-bold" disabled={saving || saved || selectedDests.length === 0}>
          {saved ? <><Check size={14} /> Saved!</> : saving ? <span className="animate-spin inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full mr-1" /> : null}
          {saving ? 'Saving...' : saved ? 'Saved!' : <><Save size={14} /> Save Trip</>}
        </Button>
      </div>

      <div className="w-full flex flex-col lg:flex-row gap-6">
        {/* Interactive Map Column */}
        <div className="relative z-0 h-[52dvh] min-h-[380px] lg:sticky lg:top-20 lg:h-[calc(100vh-8rem)] lg:w-1/2 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-700/80 shadow-xl group">
          
          {/* Floating Map Search Bar */}
          <div className="absolute top-3 left-3 z-[600] w-60 sm:w-72">
            <div className="relative flex items-center bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xl px-3.5 py-2">
              <Search size={14} className="text-primary shrink-0 mr-2" />
              <input
                type="text"
                value={mapSearchQuery}
                onChange={(e) => {
                  setMapSearchQuery(e.target.value);
                  setMapSearchOpen(true);
                }}
                onFocus={() => setMapSearchOpen(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && mapSearchResults.length > 0) {
                    selectFromMapSearch(mapSearchResults[0]);
                  }
                }}
                placeholder="Search map location..."
                className="w-full bg-transparent text-xs font-bold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none"
              />
              {mapSearchQuery && (
                <button
                  onClick={() => {
                    setMapSearchQuery('');
                    setMapSearchOpen(false);
                  }}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ml-1"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>

            {/* Map Search Dropdown */}
            {mapSearchOpen && (mapSearchResults.length > 0 || globalSearchResults.length > 0 || isSearchingGlobal) && (
              <div className="mt-2 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 max-h-72 overflow-y-auto">
                {isSearchingGlobal && globalSearchResults.length === 0 && mapSearchResults.length === 0 && (
                  <div className="px-4 py-3 flex items-center gap-2 text-xs text-slate-500 font-medium">
                    <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full" />
                    <span>Searching global locations...</span>
                  </div>
                )}

                {/* Local Featured Destinations */}
                {mapSearchResults.map((dest) => {
                  const isSel = selectedDests.some((s) => (s._id || s.id) === (dest._id || dest.id));
                  return (
                    <button
                      key={dest._id || dest.id}
                      onClick={() => selectFromMapSearch(dest)}
                      className="w-full px-3.5 py-2.5 text-left flex items-center justify-between hover:bg-primary/10 transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <MapPin size={13} className={isSel ? 'text-primary' : 'text-slate-400'} />
                        <div className="truncate">
                          <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{dest.name}</p>
                          <p className="text-[10px] text-slate-500 truncate">{dest.country || 'Featured destination'}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${isSel ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                        {isSel ? 'Added' : 'Fly to'}
                      </span>
                    </button>
                  );
                })}

                {/* Global OpenStreetMap Geocoding Results */}
                {globalSearchResults.map((place) => {
                  const parts = place.display_name.split(',');
                  const name = parts[0].trim();
                  const country = parts.slice(1, 3).join(', ').trim();
                  const isSel = selectedDests.some((s) => (s._id || s.id) === `geo_${place.place_id}`);

                  return (
                    <button
                      key={place.place_id}
                      onClick={() => selectGlobalPlace(place)}
                      className="w-full px-3.5 py-2.5 text-left flex items-center justify-between hover:bg-accent/10 transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Globe size={13} className="text-accent shrink-0" />
                        <div className="truncate">
                          <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{name}</p>
                          <p className="text-[10px] text-slate-500 truncate">{country || 'Global place'}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${isSel ? 'bg-primary text-white' : 'bg-accent/20 text-accent dark:text-accent-light'}`}>
                        {isSel ? 'Added' : '+ Add'}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <MapErrorBoundary>
            <MapContainer
              center={[20, 20]}
              zoom={2}
              className="w-full h-full min-h-[300px]"
              scrollWheelZoom={true}
              zoomControl={false}
              dragging={true}
              touchZoom={true}
              doubleClickZoom={true}
            >
              <TileLayer
                key={activeLayerKey}
                attribution={activeLayer.attr}
                url={activeLayer.url}
                maxZoom={19}
              />
              <MapControlsBar
                activeLayer={activeLayer}
                setActiveLayerKey={setActiveLayerKey}
                routeLine={routeLine}
                setFlyCenter={setFlyCenter}
              />
              <MapResizeHelper />
              <AutoFitBounds points={routeLine} />
              <MapClickHandler destinations={destinations} onSelectNearest={toggleDest} />
              <FlyTo center={flyCenter} />

              {destinations.map((d) => {
                const lat = parseFloat(d.lat);
                const lng = parseFloat(d.lng);
                if (isNaN(lat) || isNaN(lng)) return null;

                const dId = d._id || d.id;
                const selectedIdx = selectedDests.findIndex((s) => (s._id || s.id) === dId);
                const isSelected = selectedIdx !== -1;

                return (
                  <Marker
                    key={dId}
                    position={[lat, lng]}
                    icon={isSelected ? selectedIcon : defaultIcon}
                    eventHandlers={{ click: () => toggleDest(d) }}
                  >
                    <Popup>
                      <div className="text-center min-w-[150px] p-1">
                        {d.image && <img src={d.image} alt={d.name} className="w-full h-20 object-cover rounded-lg mb-2 shadow-sm" />}
                        <p className="font-poppins font-bold text-sm text-slate-900">{d.name}</p>
                        <p className="text-xs text-slate-500 font-medium">{d.country}</p>
                        <p className="text-xs font-extrabold text-primary mt-1.5">${(d.budgetEstimate || d.budget || 0).toLocaleString()} est.</p>
                        <button
                          onClick={() => toggleDest(d)}
                          className={`mt-2 w-full py-1.5 text-xs font-bold rounded-lg transition-colors ${
                            isSelected
                              ? 'bg-rose-500 text-white hover:bg-rose-600'
                              : 'bg-primary text-white hover:bg-primary-dark'
                          }`}
                        >
                          {isSelected ? 'Remove from Route' : 'Add to Route'}
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}

              {routeLine.length > 1 && (
                <Polyline
                  positions={routeLine}
                  pathOptions={{
                    color: '#4F46E5',
                    weight: 4,
                    dashArray: '10, 10',
                    opacity: 0.85,
                    lineCap: 'round',
                    lineJoin: 'round',
                  }}
                />
              )}
            </MapContainer>
          </MapErrorBoundary>

          {selectedDests.length > 0 && (
            <div className="absolute bottom-4 left-4 right-4 z-[500] rounded-xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 px-4 py-3 shadow-lg backdrop-blur-md flex items-center justify-between">
              <div>
                <p className="text-xs font-extrabold text-slate-900 dark:text-slate-100">{selectedDests.length} stop{selectedDests.length > 1 ? 's' : ''} on route</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Click any marker or map area to interact</p>
              </div>
              <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                ${budget.total.toLocaleString()} total
              </span>
            </div>
          )}
        </div>

        <div className="lg:w-1/2 overflow-y-auto space-y-6">
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

          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-5 shadow-soft">
            <h3 className="font-poppins text-sm font-bold text-slate-900 dark:text-slate-100 mb-3">Select Destinations</h3>
            <div className="relative mb-4">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search destinations..."
                className="input-field text-xs py-2.5 pl-10" />
            </div>

            {destsLoading ? (
              <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" /></div>
            ) : (
              <div className="grid max-h-64 grid-cols-2 gap-2.5 overflow-y-auto pr-1 sm:grid-cols-3">
                {filtered.map((d) => {
                  const dId = d._id || d.id;
                  const selected = selectedDests.some((s) => (s._id || s.id) === dId);
                  const img = d.image || 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=400&q=80';
                  return (
                    <motion.button key={dId} whileTap={{ scale: 0.96 }}
                      onClick={() => toggleDest(d)}
                      className={`relative rounded-xl overflow-hidden h-24 group text-left transition-all ${selected ? 'ring-2 ring-primary ring-offset-2 dark:ring-offset-slate-800' : 'ring-1 ring-slate-200 dark:ring-slate-700'}`}>
                      <img src={img} alt={d.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                      {selected && <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center"><Check size={11} className="text-white" /></div>}
                      <div className="absolute bottom-0 left-0 p-2">
                        <p className="text-white text-xs font-semibold leading-tight">{d.name}</p>
                        <p className="text-white/70 text-[9px]">{d.country}</p>
                      </div>
                      {d.rating && (
                        <div className="absolute bottom-1.5 right-2 flex items-center gap-0.5">
                          <Star size={8} className="fill-amber-400 text-amber-400" />
                          <span className="text-white text-[9px] font-medium">{d.rating}</span>
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            )}
          </div>

          {selectedDests.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-poppins text-sm font-bold text-slate-900 dark:text-slate-100">Your Route ({selectedDests.length} stops)</h3>
              {selectedDests.map((dest, idx) => {
                const dId = dest._id || dest.id;
                const fullDest = destinations.find((d) => (d._id || d.id) === dId);
                const img = dest.image || 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=400&q=80';
                return (
                  <motion.div key={dId} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}
                    className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-soft overflow-hidden">
                    <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-primary/5 dark:from-primary/10 to-transparent">
                      <div className="flex flex-col gap-0.5">
                        <button aria-label={`Move ${dest.name} up`} onClick={() => moveDest(idx, -1)} disabled={idx === 0} className="flex min-h-5 min-w-8 items-center justify-center rounded-md text-slate-400 hover:text-primary disabled:opacity-30"><ChevronUp size={12} /></button>
                        <button aria-label={`Move ${dest.name} down`} onClick={() => moveDest(idx, 1)} disabled={idx === selectedDests.length - 1} className="flex min-h-5 min-w-8 items-center justify-center rounded-md text-slate-400 hover:text-primary disabled:opacity-30"><ChevronDown size={12} /></button>
                      </div>
                      <GripVertical size={14} className="text-slate-400" />
                      <span className="w-6 h-6 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">{idx + 1}</span>
                      <img src={img} alt={dest.name} className="w-8 h-8 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{dest.name}{dest.country ? `, ${dest.country}` : ''}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">${(dest.budgetEstimate || dest.budget || 0).toLocaleString()} est. · {fullDest?.activities?.length || 0} activities</p>
                      </div>
                      <button aria-label={`Remove ${dest.name}`} onClick={() => removeDest(dId)} className="w-8 h-8 rounded-full bg-danger/10 flex items-center justify-center text-danger hover:bg-danger/20 transition-colors"><Trash2 size={13} /></button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {selectedDests.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-primary via-secondary to-accent rounded-2xl p-5 text-white shadow-xl">
              <h3 className="font-poppins text-sm font-bold mb-4">Estimated Budget Breakdown</h3>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { label: 'Hotels', val: budget.hotel, icon: Hotel },
                  { label: 'Transport', val: budget.transport, icon: Car },
                  { label: 'Food', val: budget.food, icon: Utensils },
                  { label: 'Activities', val: budget.activity, icon: Ticket },
                ].map((b) => (
                  <div key={b.label} className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
                    <b.icon size={15} className="text-white/80 mb-1" />
                    <p className="font-poppins text-lg font-bold">${b.val.toLocaleString()}</p>
                    <p className="text-[10px] text-white/70 font-medium">{b.label}</p>
                  </div>
                ))}
              </div>
              <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 text-center border border-white/20">
                <p className="text-white/80 text-[10px] uppercase tracking-widest font-bold mb-0.5">Total Estimated Budget</p>
                <p className="font-poppins text-3xl font-extrabold">${budget.total.toLocaleString()}</p>
              </div>
            </motion.div>
          )}

          <div className="pb-8">
            <Button variant="primary" onClick={handleSave} className="w-full py-4 text-sm font-bold shadow-lg" disabled={saving || saved || selectedDests.length === 0}>
              {saving ? 'Saving Trip...' : saved ? 'Trip Saved!' : 'Save Trip Itinerary'}
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}