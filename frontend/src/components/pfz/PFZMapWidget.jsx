import React, { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, Circle } from 'react-leaflet';
import L from 'leaflet';
import { Layers, Navigation, Shield, Compass } from 'lucide-react';

export default function PFZMapWidget({ selectedPfz, onComputeRoute }) {
  const [activeTab, setActiveTab] = useState('SST Fronts');

  const activePfzIcon = useMemo(() => L.divIcon({
    className: 'active-pfz-marker',
    html: `<div style="background-color: #00B4D8; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 12px rgba(0,180,216,0.9);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  }), []);

  const moderatePfzIcon = useMemo(() => L.divIcon({
    className: 'mod-pfz-marker',
    html: `<div style="background-color: #F59E0B; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 8px rgba(245,158,11,0.7);"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  }), []);

  // Restricted Navy Sector Polygon
  const navySectorCoords = [
    [17.15, 82.60],
    [17.22, 82.75],
    [17.10, 82.80],
    [17.02, 82.65]
  ];

  return (
    <div className="bg-[#04111D] text-white rounded-xl border border-slate-800 shadow-card overflow-hidden flex flex-col h-[520px] relative">
      {/* HEADER & LAYER TABS */}
      <div className="px-5 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-[#061826] z-10">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#00B4D8]" />
          <span className="label-caps text-slate-200 tracking-wider">
            Bathymetry & Satellite Grid: Bay of Bengal Sector • Kakinada Deep
          </span>
        </div>

        {/* LAYER TABS */}
        <div className="flex items-center gap-1.5 text-xs font-mono">
          {['SST Fronts', 'Chlorophyll', 'Bathymetry', 'Fleet AIS'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                activeTab === tab
                  ? 'bg-[#1363DF] text-white font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {tab === 'SST Fronts' && '● '}
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* MAP CONTAINER */}
      <div className="flex-1 w-full h-full relative z-0">
        <MapContainer
          center={[16.88, 82.48]}
          zoom={9}
          zoomControl={false}
          className="w-full h-full bg-[#020b14]"
        >
          {/* Dark Carto Tile Layer */}
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />

          {/* Restricted Military Sector Polygon */}
          <Polygon
            positions={navySectorCoords}
            pathOptions={{
              color: '#EF4444',
              fillColor: '#EF4444',
              fillOpacity: 0.2,
              weight: 2,
              dashArray: '5, 5'
            }}
          >
            <Popup>
              <div className="p-1 font-sans text-xs text-slate-900">
                <strong className="text-red-600 uppercase">Restricted Navy Sector</strong>
                <p className="text-slate-600 mt-1">Firing Range: 90-EX3-D0 Active Firing Zone</p>
              </div>
            </Popup>
          </Polygon>

          {/* PFZ Markers */}
          <Marker position={[16.742, 82.491]} icon={activePfzIcon}>
            <Popup>
              <div className="font-sans text-xs text-slate-900">
                <strong className="text-[#00B4D8]">PFZ-001 (Godavari Plume)</strong>
                <p>82% Suitability • Depth: -88m</p>
              </div>
            </Popup>
          </Marker>

          <Marker position={[16.941, 82.398]} icon={moderatePfzIcon} />
          <Marker position={[17.182, 82.520]} icon={moderatePfzIcon} />
          <Marker position={[16.491, 82.410]} icon={moderatePfzIcon} />
        </MapContainer>

        {/* FLOATING INSPECTION BOX OVERLAY */}
        <div className="absolute top-4 left-4 z-[1000] glass-map-dark rounded-xl p-4 max-w-[280px] shadow-2xl text-xs space-y-3 border border-slate-700/80">
          <div className="flex items-start justify-between gap-2 border-b border-slate-700/80 pb-2">
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase">Selected Inspection</span>
              <h4 className="font-bold text-sm text-white">{selectedPfz.name || 'PFZ-001 (Godavari Plume)'}</h4>
            </div>
            <div className="bg-[#1363DF]/20 border border-[#1363DF]/40 text-[#00B4D8] font-mono text-[10px] px-2 py-0.5 rounded">
              Vector 138° • {selectedPfz.distance || '31.8 km'}
            </div>
          </div>

          <div className="space-y-1.5 font-mono text-[11px] text-slate-300">
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Route Risk: Low</span>
            </div>
            <div>• Wave: 1.4m Swell</div>
            <div>• Wind: 18 km/h SE</div>
            <div>• Depth: -88m</div>
          </div>

          <button
            onClick={() => onComputeRoute(selectedPfz)}
            className="w-full py-2 bg-[#1363DF] hover:bg-[#003366] text-white font-semibold text-xs rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md mt-2"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Compute Safe Navigation Route</span>
          </button>
        </div>
      </div>

      {/* FOOTER LEGEND */}
      <div className="px-5 py-2.5 bg-[#061826] border-t border-slate-800 text-[11px] font-mono text-slate-400 flex flex-wrap items-center justify-between gap-3 z-10">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#00B4D8]"></span>
            Active PFZ (Optimal)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#F59E0B]"></span>
            Moderate Potential
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#EF4444]"></span>
            Restricted Military Zone
          </span>
        </div>

        <div className="flex items-center gap-4 text-slate-500">
          <span>Grid Scale: 1:250,000</span>
          <span>WGS 84 Projection</span>
        </div>
      </div>
    </div>
  );
}
