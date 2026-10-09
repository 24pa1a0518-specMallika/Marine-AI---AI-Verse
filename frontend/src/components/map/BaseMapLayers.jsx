import React from 'react';
import { TileLayer } from 'react-leaflet';

export const BASEMAP_CONFIGS = {
  satellite: {
    id: 'satellite',
    name: 'Satellite',
    icon: '🛰️',
    description: 'High-resolution satellite imagery with city, port & coastal labels'
  },
  terrain: {
    id: 'terrain',
    name: 'Terrain',
    icon: '⛰️',
    description: 'Topographic relief, elevation contours & place names'
  },
  standard: {
    id: 'standard',
    name: 'Standard',
    icon: '🗺️',
    description: 'Clear navigation map with cities, ports & maritime landmarks'
  }
};

/**
 * BaseMapLayers Component
 * Renders high-quality Leaflet TileLayers with place and city names
 * across Satellite, Terrain, and Standard views.
 */
export default function BaseMapLayers({ basemap = 'satellite' }) {
  if (basemap === 'terrain') {
    return (
      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
        attribution="&copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, METI"
        maxZoom={18}
      />
    );
  }

  if (basemap === 'standard') {
    return (
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        maxZoom={19}
      />
    );
  }

  // Default: Hybrid Satellite (Satellite + Place Names / City Labels Overlay)
  return (
    <>
      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        attribution="&copy; Esri, DigitalGlobe, GeoEye, Earthstar Geographics"
        maxZoom={18}
      />
      {/* City names, towns, coastal boundaries, and maritime place labels */}
      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
        attribution="&copy; Esri Reference Labels"
        maxZoom={18}
      />
      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}"
        attribution="&copy; Esri Transportation"
        maxZoom={18}
        opacity={0.65}
      />
    </>
  );
}
