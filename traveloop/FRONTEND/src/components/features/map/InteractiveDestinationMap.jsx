import React, { useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Layers, Compass, Navigation, Search, Trash2, Globe, Sparkles } from 'lucide-react';
import DestinationGlassPanel from './DestinationGlassPanel';
import { GLOBAL_DESTINATIONS } from '../../../data/destinationsData';

// Custom SVG Marker Generator
const createCustomMarker = (isSelected, isSaved, category) => {
  const primaryColor = isSelected ? '#6366F1' : isSaved ? '#EF4444' : '#06B6D4';
  
  const iconHtml = `
    <div style="transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1); display: flex; align-items: center; justify-content: center; position: relative; filter: drop-shadow(0 10px 20px rgba(0,0,0,0.4));">
      <svg width="38" height="48" viewBox="0 0 34 44" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M17 0C7.61116 0 0 7.61116 0 17C0 29.75 17 44 17 44C17 44 34 29.75 34 17C34 7.61116 26.3888 0 17 0Z" fill="${primaryColor}"/>
        <circle cx="17" cy="17" r="12" fill="#0B0F17" stroke="#ffffff" stroke-width="2"/>
      </svg>
      <span style="position: absolute; top: 8px; left: 50%; transform: translateX(-50%); color: #ffffff; font-size: 11px;">
        ${category === 'Beach' ? '🏖️' : category === 'Mountain' ? '🏔️' : category === 'Heritage' ? '🏛️' : '✨'}
      </span>
    </div>
  `;

  return L.divIcon({
    html: iconHtml,
    className: 'custom-interactive-marker',
    iconSize: [38, 48],
    iconAnchor: [19, 48],
    popupAnchor: [0, -42],
  });
};

const mapLayers = {
  dark: {
    name: 'Dark Midnight 3D',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attr: '&copy; CARTO &copy; OpenStreetMap',
  },
  voyager: {
    name: 'Carto Voyager HD',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attr: '&copy; CARTO &copy; OpenStreetMap',
  },
  satellite: {
    name: 'Satellite HD',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attr: '&copy; ESRI',
  },
  topo: {
    name: 'Topographic',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attr: '&copy; OpenTopoMap',
  },
};

function FlyTo({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && Array.isArray(center) && center.length === 2) {
      map.flyTo(center, 7, { duration: 1.5 });
    }
  }, [center, map]);
  return null;
}

export default function InteractiveDestinationMap({ searchQuery = '', activeCategory = 'All' }) {
  const [activeLayerKey, setActiveLayerKey] = useState('dark');
  const [selectedDest, setSelectedDest] = useState(null);
  const [savedIds, setSavedIds] = useState({});
  const [flyCenter, setFlyCenter] = useState(null);

  const activeLayer = mapLayers[activeLayerKey];

  const filteredDestinations = useMemo(() => {
    return GLOBAL_DESTINATIONS.filter((d) => {
      const matchCat = activeCategory === 'All' || d.category === activeCategory;
      const matchQuery = !searchQuery.trim() ||
        `${d.name} ${d.country} ${d.description}`.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [searchQuery, activeCategory]);

  const toggleSave = (id) => {
    setSavedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="relative w-full h-[650px] rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-card-dark group">
      
      {/* Floating Map Theme Controls */}
      <div className="absolute top-4 right-4 z-[600] flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/10 shadow-2xl">
        <button
          onClick={() => setActiveLayerKey((k) => (k === 'dark' ? 'voyager' : k === 'voyager' ? 'satellite' : 'dark'))}
          className="flex items-center gap-1.5 text-xs font-bold text-white hover:text-primary-light transition-colors"
        >
          <Layers size={14} className="text-primary-light" />
          <span className="font-poppins">{activeLayer.name}</span>
        </button>
      </div>

      <MapContainer
        center={[25, 10]}
        zoom={3}
        minZoom={3}
        maxZoom={18}
        zoomSnap={0.5}
        zoomDelta={0.5}
        bounceAtZoomLimits={true}
        maxBounds={[[-75, -180], [75, 180]]}
        maxBoundsViscosity={1.0}
        className="w-full h-full"
        zoomControl={false}
        scrollWheelZoom={true}
        worldCopyJump={false}
      >
        <TileLayer
          attribution={activeLayer.attr}
          url={activeLayer.url}
          maxZoom={19}
          minZoom={3}
          noWrap={true}
          bounds={[[-75, -180], [75, 180]]}
          key={activeLayerKey}
        />
        <FlyTo center={flyCenter} />

        {filteredDestinations.map((dest) => {
          const isSelected = selectedDest?.id === dest.id;
          const isSaved = !!savedIds[dest.id];
          const markerIcon = createCustomMarker(isSelected, isSaved, dest.category);

          return (
            <Marker
              key={dest.id}
              position={[dest.lat, dest.lng]}
              icon={markerIcon}
              eventHandlers={{
                click: () => {
                  setSelectedDest(dest);
                  setFlyCenter([dest.lat, dest.lng]);
                },
              }}
            >
              <Popup>
                <div className="text-center p-1 font-poppins min-w-[150px]">
                  <p className="font-bold text-sm text-slate-900">{dest.name} {dest.flag}</p>
                  <p className="text-[11px] text-slate-500 font-medium">{dest.country}</p>
                  <button
                    onClick={() => setSelectedDest(dest)}
                    className="mt-2 w-full py-1.5 text-xs font-bold text-white bg-primary rounded-xl shadow-md"
                  >
                    View Details
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Floating Glassmorphism Detail Panel */}
      {selectedDest && (
        <DestinationGlassPanel
          destination={selectedDest}
          onClose={() => setSelectedDest(null)}
          onSave={() => toggleSave(selectedDest.id)}
          isSaved={!!savedIds[selectedDest.id]}
        />
      )}
    </div>
  );
}
