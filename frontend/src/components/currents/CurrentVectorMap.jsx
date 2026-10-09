import React, { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Compass, 
  Layers, 
  MapPin, 
  Flame, 
  Eye, 
  EyeOff, 
  RotateCcw, 
  Activity, 
  ShieldAlert, 
  Info, 
  X,
  Sliders
} from 'lucide-react';
import CurrentHeatmapOverlay from './CurrentHeatmapOverlay';

// Custom DivIcon for directional vector arrows
const createArrowIcon = (direction, speed, isPrediction = false) => {
  let color = '#00F5D4'; // < 0.1 m/s
  if (speed >= 0.1 && speed < 0.2) color = '#C9A961';
  else if (speed >= 0.2 && speed < 0.35) color = '#F77F00';
  else if (speed >= 0.35) color = '#D62828';

  const svg = `
    <svg width="24" height="24" viewBox="0 0 24 24" style="transform: rotate(${direction}deg); transform-origin: center;">
      <path d="M12 2 L16 10 L13 9 L13 22 L11 22 L11 9 L8 10 Z" fill="${color}" stroke="#0B1E2D" stroke-width="1.5"/>
    </svg>
  `;

  return L.divIcon({
    html: svg,
    className: `current-vector-glyph ${isPrediction ? 'dash-glyph' : ''}`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

function MapEventsHandler({ onSelectLocation }) {
  useMapEvents({
    click(e) {
      if (onSelectLocation) {
        onSelectLocation(e.latlng.lat, e.latlng.lng);
      }
    }
  });
  return null;
}

// Controller component to programmatically recenter map
function MapRecenterController({ center }) {
  const map = useMap();
  React.useEffect(() => {
    if (center) {
      map.flyTo(center, Math.max(map.getZoom(), 7), { duration: 1.2 });
    }
  }, [center, map]);
  return null;
}

export default function CurrentVectorMap({
  currents = [],
  predictions = [],
  location = { lat: 16.98, lon: 82.24, name: 'Kakinada Coast' },
  onSelectLocation,
  showObservations = true,
  showPredictions = true,
  loading = false,
  error = null
}) {
  // Basemap State: 'satellite' (default) or 'standard' (Nav Map). Dark GIS completely removed.
  const [activeBasemap, setActiveBasemap] = useState('satellite');

  // Heatmap State
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [heatmapMetric, setHeatmapMetric] = useState('SPEED'); // 'SPEED' | 'ANOMALY' | 'SEVERITY'
  const [heatmapOpacity, setHeatmapOpacity] = useState(0.65);
  const [dataStreamFilter, setDataStreamFilter] = useState('ALL'); // 'ALL' | 'OBSERVATION' | 'PREDICTION'
  
  // Vector Layer Toggle
  const [showVectors, setShowVectors] = useState(true);

  // Map Recenter State
  const [recenterPos, setRecenterPos] = useState(null);

  // Selected Point for Inspection Panel
  const [inspectedPoint, setInspectedPoint] = useState(null);

  const safeCurrents = useMemo(() => {
    return Array.isArray(currents)
      ? currents
      : Array.isArray(currents?.data)
      ? currents.data
      : Array.isArray(currents?.data?.data)
      ? currents.data.data
      : [];
  }, [currents]);

  const safePredictions = useMemo(() => {
    return Array.isArray(predictions)
      ? predictions
      : Array.isArray(predictions?.data)
      ? predictions.data
      : Array.isArray(predictions?.data?.data)
      ? predictions.data.data
      : [];
  }, [predictions]);

  // Combine data streams for Heatmap Overlay based on stream filter
  const combinedHeatmapData = useMemo(() => {
    let dataset = [];
    if (dataStreamFilter === 'ALL' || dataStreamFilter === 'OBSERVATION') {
      if (showObservations) dataset = dataset.concat(safeCurrents);
    }
    if (dataStreamFilter === 'ALL' || dataStreamFilter === 'PREDICTION') {
      if (showPredictions) dataset = dataset.concat(safePredictions);
    }
    return dataset;
  }, [safeCurrents, safePredictions, showObservations, showPredictions, dataStreamFilter]);

  // Supported Basemaps Configuration (Dark GIS is completely removed)
  const basemaps = {
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    standard: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
  };

  const handleResetView = () => {
    setRecenterPos([location.lat, location.lon]);
  };

  return (
    <div className="relative w-full h-[620px] rounded-2xl overflow-hidden border border-[#1E3F5A] bg-[#091D2C] shadow-2xl flex flex-col">
      <div className="relative w-full h-full">
        <MapContainer
          center={[location.lat, location.lon]}
          zoom={7}
          className="w-full h-full z-0 bg-[#091D2C]"
          zoomControl={false}
        >
          <TileLayer
            url={basemaps[activeBasemap]}
            attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; NASA PO.DAAC'
          />

          {/* Place names & boundary overlay for Satellite view */}
          {activeBasemap === 'satellite' && (
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
              attribution="&copy; Esri Labels"
            />
          )}

          <MapEventsHandler onSelectLocation={onSelectLocation} />
          {recenterPos && <MapRecenterController center={recenterPos} />}

          {/* DATA-DRIVEN SEVERITY HEATMAP LAYER */}
          <CurrentHeatmapOverlay
            data={combinedHeatmapData}
            metric={heatmapMetric}
            opacity={heatmapOpacity}
            visible={showHeatmap}
          />

          {/* ACTIVE LOCATION PIN MARKER */}
          <Marker
            position={[location.lat, location.lon]}
            icon={L.divIcon({
              html: `<div class="w-4 h-4 rounded-full bg-[#C9A961] border-2 border-white shadow-[0_0_14px_#C9A961] animate-pulse"></div>`,
              className: 'custom-location-pin',
              iconSize: [16, 16],
              iconAnchor: [8, 8]
            })}
          >
            <Popup className="custom-leaflet-popup">
              <div className="p-2.5 text-xs text-[#D8D2C2] bg-[#0F2436] rounded-lg border border-[#1E3F5A]">
                <div className="font-bold text-[#C9A961]">{location.name}</div>
                <div className="text-[10px] font-mono text-[#8EA5B5]">{location.lat.toFixed(4)}° N, {location.lon.toFixed(4)}° E</div>
              </div>
            </Popup>
          </Marker>

          {/* CURRENT OBSERVATIONS VECTOR LAYER */}
          {showVectors && showObservations && safeCurrents.map((pt, idx) => (
            <Marker
              key={`obs-${idx}`}
              position={[pt.latitude, pt.longitude]}
              icon={createArrowIcon(pt.direction, pt.speed, false)}
              eventHandlers={{
                click: () => setInspectedPoint({ ...pt, recordType: 'OBSERVATION' })
              }}
            >
              <Popup className="custom-leaflet-popup">
                <div className="p-2.5 text-xs text-[#D8D2C2] bg-[#091D2C] rounded-lg border border-[#1E3F5A] space-y-1.5 font-mono">
                  <div className="font-bold text-[#00F5D4] flex items-center justify-between border-b border-[#1E3F5A] pb-1">
                    <span>OBSERVED VECTOR</span>
                    <span className="text-[9px] bg-[#00F5D4]/20 text-[#00F5D4] px-1.5 py-0.5 rounded">LIVE</span>
                  </div>
                  <div>Lat: {pt.latitude}° N | Lon: {pt.longitude}° E</div>
                  <div>Speed: <span className="font-bold text-[#00F5D4]">{pt.speed} m/s</span></div>
                  <div>Direction: <span className="font-bold text-[#C9A961]">{pt.direction}°</span></div>
                  <div className="text-[10px] text-[#8EA5B5]">u: {pt.u} m/s | v: {pt.v} m/s</div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* CURRENT PREDICTIONS VECTOR LAYER */}
          {showVectors && showPredictions && safePredictions.map((pt, idx) => (
            <Marker
              key={`pred-${idx}`}
              position={[pt.latitude, pt.longitude]}
              icon={createArrowIcon(pt.direction, pt.speed, true)}
              eventHandlers={{
                click: () => setInspectedPoint({ ...pt, recordType: 'PREDICTION' })
              }}
            >
              <Popup className="custom-leaflet-popup">
                <div className="p-2.5 text-xs text-[#D8D2C2] bg-[#091D2C] rounded-lg border border-[#C9A961] space-y-1.5 font-mono">
                  <div className="font-bold text-[#C9A961] flex items-center justify-between border-b border-[#1E3F5A] pb-1">
                    <span>RF PREDICTED VECTOR</span>
                    <span className="text-[9px] bg-[#C9A961]/20 text-[#C9A961] px-1.5 py-0.5 rounded">MODEL</span>
                  </div>
                  <div>Lat: {pt.latitude}° N | Lon: {pt.longitude}° E</div>
                  <div>Predicted Speed: <span className="font-bold text-white">{pt.speed} m/s</span></div>
                  <div>Predicted Dir: <span className="font-bold text-[#C9A961]">{pt.direction}°</span></div>
                  <div className="text-[10px] text-[#8EA5B5]">u: {pt.u} m/s | v: {pt.v} m/s</div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* FLOATING TOP-RIGHT MAP CONTROLS TOOLBAR */}
        <div className="absolute top-3 right-3 z-[400] flex flex-wrap items-center gap-2 bg-[#0B1E2D]/95 backdrop-blur-md p-2 rounded-2xl border border-[#1E3F5A] shadow-xl text-xs select-none">
          {/* BASEMAP SELECTOR (DARK GIS IS REMOVED) */}
          <div className="flex items-center gap-1 bg-[#0F2436] p-1 rounded-xl border border-[#1E3F5A]">
            <button
              onClick={() => setActiveBasemap('satellite')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeBasemap === 'satellite' ? 'bg-[#C9A961] text-[#0B1E2D]' : 'text-[#8EA5B5] hover:text-white'
              }`}
            >
              Satellite
            </button>
            <button
              onClick={() => setActiveBasemap('standard')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeBasemap === 'standard' ? 'bg-[#C9A961] text-[#0B1E2D]' : 'text-[#8EA5B5] hover:text-white'
              }`}
            >
              Nav Map
            </button>
          </div>

          <div className="h-4 w-px bg-[#1E3F5A]" />

          {/* HEATMAP TOGGLE */}
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
              showHeatmap
                ? 'bg-[#00F5D4]/20 border-[#00F5D4] text-[#00F5D4] shadow-[0_0_10px_rgba(0,245,212,0.3)]'
                : 'bg-[#0F2436] border-[#1E3F5A] text-[#8EA5B5]'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Heatmap {showHeatmap ? 'ON' : 'OFF'}</span>
          </button>

          {/* METRIC SELECTOR */}
          {showHeatmap && (
            <div className="flex items-center gap-1 bg-[#0F2436] border border-[#1E3F5A] px-2 py-1 rounded-xl font-mono text-xs">
              <span className="text-[#8EA5B5] text-[10px]">Metric:</span>
              <select
                value={heatmapMetric}
                onChange={(e) => setHeatmapMetric(e.target.value)}
                className="bg-transparent font-bold text-[#C9A961] focus:outline-none cursor-pointer"
              >
                <option value="SPEED" className="bg-[#0B1E2D]">Current Speed (m/s)</option>
                <option value="ANOMALY" className="bg-[#0B1E2D]">Current Anomaly (m/s dev)</option>
                <option value="SEVERITY" className="bg-[#0B1E2D]">Operational Severity (Risk Tier)</option>
              </select>
            </div>
          )}

          {/* STREAM SELECTOR */}
          <div className="flex items-center gap-1 bg-[#0F2436] border border-[#1E3F5A] px-2 py-1 rounded-xl font-mono text-xs">
            <span className="text-[#8EA5B5] text-[10px]">Stream:</span>
            <select
              value={dataStreamFilter}
              onChange={(e) => setDataStreamFilter(e.target.value)}
              className="bg-transparent font-bold text-[#D8D2C2] focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-[#0B1E2D]">All Streams</option>
              <option value="OBSERVATION" className="bg-[#0B1E2D]">Observations Only</option>
              <option value="PREDICTION" className="bg-[#0B1E2D]">Predictions Only</option>
            </select>
          </div>

          {/* VECTORS TOGGLE */}
          <button
            onClick={() => setShowVectors(!showVectors)}
            className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer border ${
              showVectors ? 'bg-[#1E3F5A] border-[#C9A961]/50 text-white' : 'bg-[#0F2436] border-[#1E3F5A] text-[#8EA5B5]'
            }`}
            title="Toggle Vector Arrows"
          >
            {showVectors ? <Eye className="w-3.5 h-3.5 text-[#C9A961]" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>Vectors</span>
          </button>

          {/* OPACITY SLIDER */}
          {showHeatmap && (
            <div className="flex items-center gap-1.5 bg-[#0F2436] border border-[#1E3F5A] px-2.5 py-1 rounded-xl text-xs font-mono text-[#D8D2C2]">
              <span className="text-[10px] text-[#8EA5B5]">Opacity:</span>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={heatmapOpacity}
                onChange={(e) => setHeatmapOpacity(parseFloat(e.target.value))}
                className="w-16 accent-[#C9A961] cursor-pointer"
              />
              <span className="text-[10px] font-bold text-[#C9A961] w-7">{Math.round(heatmapOpacity * 100)}%</span>
            </div>
          )}

          {/* RESET VIEW BUTTON */}
          <button
            onClick={handleResetView}
            className="p-1.5 bg-[#0F2436] hover:bg-[#1E3F5A] text-[#C9A961] hover:text-white border border-[#1E3F5A] rounded-xl transition-all cursor-pointer"
            title="Reset Map View to Active Location"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* POINT INSPECTION OVERLAY CARD */}
        {inspectedPoint && (
          <div className="absolute top-16 left-4 z-[400] w-72 bg-[#091D2C]/95 backdrop-blur-md border border-[#C9A961]/60 text-[#D8D2C2] p-4 rounded-2xl shadow-2xl space-y-3 font-mono text-xs animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#1E3F5A] pb-2">
              <div className="flex items-center gap-1.5 font-bold text-[#C9A961]">
                <Compass className="w-4 h-4" />
                <span>POINT INSPECTION</span>
              </div>
              <button
                onClick={() => setInspectedPoint(null)}
                className="p-1 text-[#8EA5B5] hover:text-white rounded-lg cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-[#8EA5B5]">Coordinates:</span>
                <span className="text-white font-bold">{Number(inspectedPoint.latitude).toFixed(4)}° N, {Number(inspectedPoint.longitude).toFixed(4)}° E</span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#8EA5B5]">Current Speed:</span>
                <span className="text-[#00F5D4] font-bold">{inspectedPoint.speed} m/s</span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#8EA5B5]">Flow Direction:</span>
                <span className="text-[#C9A961] font-bold">{inspectedPoint.direction}°</span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#8EA5B5]">u (Eastward):</span>
                <span className="text-white">{inspectedPoint.u} m/s</span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#8EA5B5]">v (Northward):</span>
                <span className="text-white">{inspectedPoint.v} m/s</span>
              </div>

              <div className="flex justify-between pt-1 border-t border-[#1E3F5A]/50">
                <span className="text-[#8EA5B5]">Record Type:</span>
                <span className="text-[10px] bg-[#00F5D4]/15 text-[#00F5D4] px-1.5 py-0.5 rounded font-bold">{inspectedPoint.recordType || 'OBSERVATION'}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#8EA5B5]">Data Source:</span>
                <span className="text-slate-300 text-[10px]">{inspectedPoint.source || 'NASA PO.DAAC OSCAR'}</span>
              </div>
            </div>
          </div>
        )}

        {/* DYNAMIC SEVERITY HEATMAP LEGEND */}
        {showHeatmap && (
          <div className="absolute bottom-4 left-4 z-[400] bg-[#091D2C]/95 backdrop-blur-md px-4 py-3 rounded-2xl border border-[#1E3F5A] shadow-2xl text-xs font-mono text-[#D8D2C2] space-y-2 select-none min-w-[280px]">
            <div className="flex items-center justify-between border-b border-[#1E3F5A] pb-1.5">
              <span className="font-bold text-[11px] text-[#C9A961] uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-[#00F5D4]" />
                {heatmapMetric === 'SPEED' && 'Current Speed Intensity (m/s)'}
                {heatmapMetric === 'ANOMALY' && 'Current Anomaly (m/s dev)'}
                {heatmapMetric === 'SEVERITY' && 'Operational Severity (Risk Tier)'}
              </span>
              <span className="text-[9px] bg-[#00F5D4]/15 text-[#00F5D4] px-1.5 py-0.5 rounded border border-[#00F5D4]/30">
                {combinedHeatmapData.length} Points
              </span>
            </div>

            {/* COLOR GRADIENT RAMP */}
            <div className="space-y-1">
              <div className="h-2.5 w-full rounded-full bg-gradient-to-r from-[#22c55e] via-[#f97316] to-[#ef4444] border border-[#1E3F5A]" />
              <div className="flex justify-between text-[10px] text-[#8EA5B5] font-bold">
                {heatmapMetric === 'SPEED' && (
                  <>
                    <span>0.0 m/s</span>
                    <span>0.10</span>
                    <span>0.20</span>
                    <span>0.35+ m/s</span>
                  </>
                )}
                {heatmapMetric === 'ANOMALY' && (
                  <>
                    <span>0.00 (Base)</span>
                    <span>0.05</span>
                    <span>0.12</span>
                    <span>0.22+ m/s</span>
                  </>
                )}
                {heatmapMetric === 'SEVERITY' && (
                  <>
                    <span className="text-[#00F5D4]">Low</span>
                    <span className="text-[#C9A961]">Moderate</span>
                    <span className="text-[#F77F00]">High</span>
                    <span className="text-[#D62828]">Very High</span>
                  </>
                )}
              </div>
            </div>

            <div className="text-[9px] text-[#8EA5B5] pt-1 border-t border-[#1E3F5A]/40 flex items-center justify-between">
              <span>Source: NASA PO.DAAC / RF Model</span>
              <span className="text-[#C9A961]">Live Grid Aligned</span>
            </div>
          </div>
        )}

        {/* LOADING & EMPTY STATE OVERLAYS */}
        {loading && (
          <div className="absolute inset-0 z-[500] bg-[#091D2C]/75 backdrop-blur-xs flex items-center justify-center">
            <div className="flex items-center gap-3 bg-[#0B1E2D] border border-[#1E3F5A] px-5 py-3 rounded-2xl shadow-2xl text-xs font-mono text-[#D8D2C2]">
              <Activity className="w-5 h-5 text-[#C9A961] animate-spin" />
              <span>Rendering Geospatial Heatmap &amp; Vector Layers...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[500] bg-rose-950/90 border border-rose-600/50 text-rose-200 px-4 py-2 rounded-xl text-xs font-mono shadow-xl flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            <span>Map Layer Warning: {error}</span>
          </div>
        )}
      </div>
    </div>
  );
}
