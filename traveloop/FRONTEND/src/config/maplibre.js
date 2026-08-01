import * as maplibregl from 'maplibre-gl';

// 100% Free & Open-Source Map Tile Style Definitions (No API Key Required)
// Set source maxzoom & tile bounds so MapLibre overzooms tiles smoothly without showing missing tile watermarks
export const FREE_STYLE_OBJECTS = {
  liberty: 'https://tiles.openfreemap.org/styles/liberty',
  bright: 'https://tiles.openfreemap.org/styles/bright',
  dark: {
    version: 8,
    name: 'Dark Midnight 3D',
    sources: {
      'carto-dark': {
        type: 'raster',
        tiles: [
          'https://a.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png',
          'https://b.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png',
          'https://c.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png',
        ],
        tileSize: 256,
        maxzoom: 18,
        attribution: '© OpenStreetMap contributors © CARTO',
      },
    },
    layers: [
      {
        id: 'bg-dark',
        type: 'background',
        paint: { 'background-color': '#0f172a' },
      },
      {
        id: 'carto-dark-layer',
        type: 'raster',
        source: 'carto-dark',
        minzoom: 0,
        maxzoom: 22,
        paint: {
          'raster-opacity': 1.0,
          'raster-fade-duration': 0,
        },
      },
    ],
  },
  voyager: {
    version: 8,
    name: 'Streets HD',
    sources: {
      'osm-voyager': {
        type: 'raster',
        tiles: [
          'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
          'https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
          'https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
        ],
        tileSize: 256,
        maxzoom: 18,
        attribution: '© OpenStreetMap contributors © CARTO',
      },
    },
    layers: [
      {
        id: 'bg-voyager',
        type: 'background',
        paint: { 'background-color': '#e2e8f0' },
      },
      {
        id: 'carto-voyager-layer',
        type: 'raster',
        source: 'osm-voyager',
        minzoom: 0,
        maxzoom: 22,
        paint: {
          'raster-opacity': 1.0,
          'raster-fade-duration': 0,
        },
      },
    ],
  },
  streets: {
    version: 8,
    name: 'OpenStreetMap Light',
    sources: {
      'osm-standard': {
        type: 'raster',
        tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
        tileSize: 256,
        maxzoom: 18,
        attribution: '© OpenStreetMap contributors',
      },
    },
    layers: [
      {
        id: 'bg-streets',
        type: 'background',
        paint: { 'background-color': '#f8fafc' },
      },
      {
        id: 'osm-standard-layer',
        type: 'raster',
        source: 'osm-standard',
        minzoom: 0,
        maxzoom: 22,
        paint: {
          'raster-opacity': 1.0,
          'raster-fade-duration': 0,
        },
      },
    ],
  },
  satellite: {
    version: 8,
    name: 'Satellite HD',
    sources: {
      'esri-satellite': {
        type: 'raster',
        tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
        tileSize: 256,
        maxzoom: 18,
        attribution: 'Tiles © Esri',
      },
    },
    layers: [
      {
        id: 'bg-sat',
        type: 'background',
        paint: { 'background-color': '#020617' },
      },
      {
        id: 'esri-satellite-layer',
        type: 'raster',
        source: 'esri-satellite',
        minzoom: 0,
        maxzoom: 22,
        paint: {
          'raster-opacity': 1.0,
          'raster-fade-duration': 0,
        },
      },
    ],
  },
  topo: {
    version: 8,
    name: 'Topographic',
    sources: {
      'opentopo': {
        type: 'raster',
        tiles: [
          'https://a.tile.opentopomap.org/{z}/{x}/{y}.png',
          'https://b.tile.opentopomap.org/{z}/{x}/{y}.png',
          'https://c.tile.opentopomap.org/{z}/{x}/{y}.png',
        ],
        tileSize: 256,
        maxzoom: 17,
        attribution: 'Map data © OpenStreetMap contributors | Map style © OpenTopoMap',
      },
    },
    layers: [
      {
        id: 'bg-topo',
        type: 'background',
        paint: { 'background-color': '#f1f5f9' },
      },
      {
        id: 'opentopo-layer',
        type: 'raster',
        source: 'opentopo',
        minzoom: 0,
        maxzoom: 22,
        paint: {
          'raster-opacity': 1.0,
          'raster-fade-duration': 0,
        },
      },
    ],
  },
};

export const MAPLIBRE_STYLES = {
  liberty: {
    id: 'liberty',
    name: 'OpenFreeMap Liberty (Vector)',
    url: FREE_STYLE_OBJECTS.liberty,
    style: FREE_STYLE_OBJECTS.liberty,
  },
  bright: {
    id: 'bright',
    name: 'OpenFreeMap Bright (Vector)',
    url: FREE_STYLE_OBJECTS.bright,
    style: FREE_STYLE_OBJECTS.bright,
  },
  dark: {
    id: 'dark',
    name: 'Dark Midnight 3D',
    url: FREE_STYLE_OBJECTS.dark,
    style: FREE_STYLE_OBJECTS.dark,
  },
  voyager: {
    id: 'voyager',
    name: 'Streets HD',
    url: FREE_STYLE_OBJECTS.voyager,
    style: FREE_STYLE_OBJECTS.voyager,
  },
  streets: {
    id: 'streets',
    name: 'OpenStreetMap Light',
    url: FREE_STYLE_OBJECTS.streets,
    style: FREE_STYLE_OBJECTS.streets,
  },
  satellite: {
    id: 'satellite',
    name: 'Satellite HD',
    url: FREE_STYLE_OBJECTS.satellite,
    style: FREE_STYLE_OBJECTS.satellite,
  },
  topo: {
    id: 'topo',
    name: 'Topographic',
    url: FREE_STYLE_OBJECTS.topo,
    style: FREE_STYLE_OBJECTS.topo,
  },
};

export const DEFAULT_MAP_CENTER = [15, 25]; // [lng, lat]
export const DEFAULT_MAP_ZOOM = 2.4;

export default maplibregl;
