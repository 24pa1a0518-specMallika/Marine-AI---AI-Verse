import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { ShieldCheck, Wind, Waves, Compass, Layers } from 'lucide-react';

export default function SafeRouteMapCard() {
  const depIcon = useMemo(() => L.divIcon({
    className: 'dep-marker',
    html: `<div style="background-color: #1363DF; color: white; font-weight: bold; font-size: 10px; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white;">DEP</div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  }), []);

  const pfzHarvestIcon = useMemo(() => L.divIcon({
    className: 'harvest-marker',
    html: `<div style="background-color: #00B4D8; color: #001F3F; font-weight: bold; font-size: 10px; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 0 10px rgba(0,180,216,0.8);">PFZ</div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11]
  }), []);

  const depPoint = [16.98, 82.24];
  const destPoint = [16.742, 82.491];

  // Direct Path (Passes through restricted zone)
  const directPath = [
    depPoint,
    [16.88, 82.36],
    destPoint
  ];

  // Safe Recommended Path (Detour around restricted zone)
  const safePath = [
    depPoint,
    [16.92, 82.32],
    [16.81, 82.38],
    [16.76, 82.44],
    destPoint
  ];

  // Military Restricted Zone
  const militaryZoneCoords = [
    [17.02, 82.34],
    [17.05, 82.45],
    [16.89, 82.48],
    [16.85, 82.36]
  ];

  return (
    <div className="space-y-4">
      {/* MAP CONTAINER CARD */}
      <div className="bg-[#04111D] text-white rounded-xl border border-slate-800 shadow-card overflow-hidden flex flex-col h-[480px] relative">
        {/* TOP MAP HUD */}
        <div className="px-5 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-[#061826] z-10 text-xs font-mono">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold bg-emerald-950/60 px-2.5 py-0.5 rounded border border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              NET SAFETY MARGIN: +68% vs Direct
            </span>
            <span className="text-slate-400">Clearance: 2.8 NM</span>
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <button className="hover:text-white px-2 py-0.5 rounded bg-slate-800/60 cursor-pointer">Contours</button>
            <button className="hover:text-white px-2 py-0.5 rounded bg-slate-800/60 cursor-pointer">Bathymetry</button>
            <button className="hover:text-white px-2 py-0.5 rounded bg-slate-800/60 cursor-pointer">AIS Traffic</button>
          </div>
        </div>

        {/* MAP CANVAS */}
        <div className="flex-1 w-full h-full relative z-0">
          <MapContainer
            center={[16.88, 82.36]}
            zoom={10}
            zoomControl={false}
            className="w-full h-full bg-[#020b14]"
          >
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />

            {/* Military Firing Sector Polygon */}
            <Polygon
              positions={militaryZoneCoords}
              pathOptions={{
                color: '#EF4444',
                fillColor: '#EF4444',
                fillOpacity: 0.25,
                weight: 2,
                dashArray: '5, 5'
              }}
            >
              <Popup>
                <div className="p-1 font-sans text-xs text-slate-900">
                  <strong className="text-red-600">IN-EXZ-88 RESTRICTED ZONE</strong>
                  <p>Naval Firing Range (Lethal Target Area)</p>
                </div>
              </Popup>
            </Polygon>

            {/* Direct Path (High Hazard) */}
            <Polyline
              positions={directPath}
              pathOptions={{
                color: '#EF4444',
                weight: 2,
                dashArray: '6, 6'
              }}
            />

            {/* Recommended Safe Path */}
            <Polyline
              positions={safePath}
              pathOptions={{
                color: '#00B4D8',
                weight: 4
              }}
            />

            {/* Departure Marker */}
            <Marker position={depPoint} icon={depIcon}>
              <Popup>
                <div className="font-sans text-xs text-slate-900">
                  <strong>Departure: Kakinada Anchorage</strong>
                </div>
              </Popup>
            </Marker>

            {/* Destination Marker */}
            <Marker position={destPoint} icon={pfzHarvestIcon}>
              <Popup>
                <div className="font-sans text-xs text-slate-900">
                  <strong>Destination: PFZ-001 (Harvest Zone)</strong>
                </div>
              </Popup>
            </Marker>
          </MapContainer>

          {/* NAUTICAL CHART LEGEND OVERLAY */}
          <div className="absolute bottom-4 right-4 z-[1000] glass-map-dark rounded-xl p-3 shadow-xl max-w-[240px] text-[11px] font-mono text-slate-300 space-y-1.5 border border-slate-700/80">
            <span className="text-[10px] text-slate-400 uppercase font-bold block border-b border-slate-700 pb-1">
              Nautical Chart Legend
            </span>
            <div className="flex items-center gap-2">
              <span className="w-4 h-0.5 bg-[#00B4D8]"></span>
              <span>Recommended Safe Path (36.4 km)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-0.5 bg-rose-500 border-t border-dashed border-rose-500"></span>
              <span>Direct Path (32.1 km, High Hazard)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-rose-500/40 border border-rose-500"></span>
              <span>Restricted Zone (IN-EXZ-88)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#00B4D8]"></span>
              <span>PFZ Optimum Harvest Zone</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4-CARD TELEMETRY ROW BELOW MAP */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card p-3.5 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold block">
            Significant Wave Height
          </span>
          <div className="font-extrabold text-lg text-[#0F172A]">1.2 <span className="text-xs font-normal text-slate-500">meters</span></div>
          <div className="text-[11px] font-mono text-slate-500">Moderate swell • Clear lee</div>
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card p-3.5 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold block">
            Surface Wind
          </span>
          <div className="font-extrabold text-lg text-[#0F172A]">14 <span className="text-xs font-normal text-slate-500">knots (SE)</span></div>
          <div className="text-[11px] font-mono text-slate-500">Beam sea relative to WP-02</div>
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card p-3.5 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold block">
            Current Drift
          </span>
          <div className="font-extrabold text-lg text-[#0F172A]">0.8 <span className="text-xs font-normal text-slate-500">knots @ 194°</span></div>
          <div className="text-[11px] font-mono text-slate-500">Favorable southerly set</div>
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card p-3.5 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold block">
            Channel Bathymetry
          </span>
          <div className="font-extrabold text-lg text-[#0F172A]">38 - 52 <span className="text-xs font-normal text-slate-500">m</span></div>
          <div className="text-[11px] font-mono text-slate-500">Zero shallow shoal contact</div>
        </div>
      </div>
    </div>
  );
}
