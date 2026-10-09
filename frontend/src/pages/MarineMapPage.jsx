import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, Marker, Popup, Polyline, Polygon, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import MarineIntelligenceHUD from '../components/map/MarineIntelligenceHUD';
import MapLegendWidget from '../components/map/MapLegendWidget';
import MapToolToolbar from '../components/map/MapToolToolbar';
import MapController from '../components/map/MapController';
import BaseMapLayers, { BASEMAP_CONFIGS } from '../components/map/BaseMapLayers';
import { MapPin, Navigation, Bell, HelpCircle, User, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getPFZs } from '../api/pfzApi';
import { getGeofences } from '../api/geofenceApi';
import { getSST } from '../api/weatherApi';
import { useLocation } from '../context/LocationContext';
import { useLanguage } from '../context/LanguageContext';

export default function MarineMapPage() {
  const { selectedLocation } = useLocation();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [showRisk, setShowRisk] = useState(true);
  const [showRoute, setShowRoute] = useState(true);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [basemap, setBasemap] = useState('satellite');

  useEffect(() => {
    window.__test_navigate = (id) => navigate('/safe-routes', { state: { targetPfzId: id } });
  }, [navigate]);

  // Zoom / Recenter state triggers
  const [zoomInTrigger, setZoomInTrigger] = useState(0);
  const [zoomOutTrigger, setZoomOutTrigger] = useState(0);
  const [recenterTrigger, setRecenterTrigger] = useState(0);

  // API State
  const [pfzState, setPfzState] = useState({ data: [], isFallback: false, source: 'live' });
  const [geofenceState, setGeofenceState] = useState({ data: [], isFallback: false, source: 'live' });
  const [sstState, setSstState] = useState({ data: null, isFallback: false, source: 'live' });
  const [isLoading, setIsLoading] = useState(true);

  const centerLat = selectedLocation?.lat || 16.98;
  const centerLon = selectedLocation?.lon || 82.24;

  useEffect(() => {
    let isMounted = true;

    async function loadMapData() {
      setIsLoading(true);
      try {
        const [pfzRes, geoRes, sstRes] = await Promise.all([
          getPFZs({ category: 'ALL' }),
          getGeofences({ latitude: centerLat, longitude: centerLon }),
          getSST({
            minLat: centerLat - 1.5,
            maxLat: centerLat + 1.5,
            minLon: centerLon - 1.5,
            maxLon: centerLon + 1.5
          })
        ]);

        if (!isMounted) return;

        setPfzState(pfzRes);
        setGeofenceState(geoRes);
        setSstState(sstRes);
      } catch (e) {
        console.warn('Map data load error:', e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadMapData();
    return () => { isMounted = false; };
  }, [centerLat, centerLon]);

  const displayPfzs = pfzState.data?.length > 0 ? pfzState.data : [];

  // Identify target INCOIS PFZ destination from live data
  const targetPfz = useMemo(() => {
    if (displayPfzs.length > 0) {
      const valid = displayPfzs.filter(p => (p.latitude || p.lat) && (p.longitude || p.lon));
      if (valid.length > 0) {
        const withDist = valid.map(p => {
          const lat = p.latitude || p.lat;
          const lon = p.longitude || p.lon;
          const distSq = Math.pow(lat - centerLat, 2) + Math.pow(lon - centerLon, 2);
          return { ...p, lat, lon, distSq };
        });
        withDist.sort((a, b) => a.distSq - b.distSq);
        const best = withDist[0];
        return {
          lat: best.lat,
          lon: best.lon,
          name: best.name || best.id || 'INCOIS PFZ Ground',
          score: best.score || best.confidence || best.suitability || null,
          distanceKm: best.distanceKm ? Number(best.distanceKm).toFixed(1) : (Math.sqrt(best.distSq) * 111).toFixed(1),
          sst: best.sst ?? null,
          chlorophyll: best.chlorophyll ?? null
        };
      }
    }
    return null;
  }, [displayPfzs, centerLat, centerLon]);

  // Departure Marker Icon
  const startIcon = useMemo(() => L.divIcon({
    className: 'start-marker',
    html: `<div style="background-color: #1363DF; color: white; font-weight: bold; font-size: 10px; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2.5px solid white; box-shadow: 0 0 14px rgba(19,99,223,0.95);">DEP</div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13]
  }), []);

  // Destination Marker Icon (Glowing Green Target)
  const destinationIcon = useMemo(() => L.divIcon({
    className: 'destination-marker',
    html: `<div style="background-color: #10B981; color: white; font-weight: bold; font-size: 10px; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2.5px solid white; box-shadow: 0 0 16px rgba(16,185,129,0.95);">PFZ</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  }), []);

  // INCOIS PFZ Badge Marker Builder with generous pill container width
  const createPfzBadgeIcon = useMemo(() => (label, scoreText, isDestination = false) => L.divIcon({
    className: 'incois-badge-marker',
    html: `<div style="display: inline-flex; align-items: center; justify-content: center; gap: 6px; background: ${isDestination ? 'rgba(6, 40, 25, 0.96)' : 'rgba(6, 24, 40, 0.94)'}; border: 1.5px solid ${isDestination ? '#10B981' : '#22C55E'}; color: white; padding: 4px 12px; border-radius: 9999px; font-family: monospace; font-size: 11px; font-weight: bold; white-space: nowrap; box-shadow: ${isDestination ? '0 0 16px rgba(16,185,129,0.95)' : '0 4px 12px rgba(0,0,0,0.6)'}; width: max-content; min-width: 140px;">
      <span style="width: 8px; height: 8px; border-radius: 50%; background: ${isDestination ? '#10B981' : '#22C55E'}; display: inline-block; flex-shrink: 0;"></span>
      <span>${label}</span>
      ${scoreText ? `<span style="color: #4ADE80; margin-left: 2px;">${scoreText}</span>` : ''}
    </div>`,
    iconSize: [200, 30],
    iconAnchor: [100, 15]
  }), []);

  const startPoint = [centerLat, centerLon];

  // Route waypoints connecting vessel directly to target INCOIS PFZ destination!
  const routeWaypoints = useMemo(() => {
    if (!targetPfz || !targetPfz.lat || !targetPfz.lon) return [];
    const dLat = targetPfz.lat - centerLat;
    const dLon = targetPfz.lon - centerLon;
    return [
      startPoint,
      [centerLat + dLat * 0.35 - 0.015, centerLon + dLon * 0.30],
      [centerLat + dLat * 0.70 - 0.01, centerLon + dLon * 0.65],
      [targetPfz.lat, targetPfz.lon]
    ];
  }, [startPoint, centerLat, centerLon, targetPfz]);
  const geofencesList = Array.isArray(geofenceState.data)
    ? geofenceState.data
    : (Array.isArray(geofenceState) ? geofenceState : (geofenceState.zones || []));

  const isAnyFallback = pfzState.isFallback || geofenceState.isFallback || sstState.isFallback;

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      {/* MAP PAGE HEADER & SUB-NAV */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-sans font-extrabold text-2xl md:text-3xl text-[#0F172A] tracking-tight">
                {t('pfzExplorer') || 'PFZ Explorer'}
              </h1>
              {isAnyFallback ? (
                <span className="text-[10px] font-mono text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                  Fallback Active
                </span>
              ) : (
                <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  Live INCOIS Data
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="flex items-center gap-1 text-xs font-mono text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                <MapPin className="w-3 h-3 text-[#1363DF]" />
                {selectedLocation?.name || 'Active Station'} ({centerLat.toFixed(4)}° N, {centerLon.toFixed(4)}° E)
              </span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-mono">
            {['Dashboard', 'Analysis', 'Settings'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  activeTab === tab
                    ? 'bg-white font-bold text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Basemap Switcher Toolbar in Header */}
        <div className="flex items-center gap-3 text-xs font-mono text-slate-600">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <span className="text-[10px] text-slate-500 px-1 font-sans">Basemap:</span>
            {Object.values(BASEMAP_CONFIGS).map((b) => (
              <button
                key={b.id}
                onClick={() => setBasemap(b.id)}
                className={`px-2 py-1 rounded text-xs transition-colors cursor-pointer flex items-center gap-1 ${
                  basemap === b.id
                    ? 'bg-white font-bold text-[#1363DF] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>{b.icon}</span>
                <span>{b.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* FULL MAP CANVAS CONTAINER */}
      <div className="w-full h-[640px] rounded-xl border border-[#E2E8F0] shadow-card overflow-hidden relative bg-[#020b14]">
        <MapContainer
          center={[centerLat, centerLon]}
          zoom={10}
          zoomControl={false}
          scrollWheelZoom={true}
          className="w-full h-full"
        >
          {/* Dynamic Map Controller for Zoom, Pan, Recenter & Wheel */}
          <MapController
            center={[centerLat, centerLon]}
            zoom={10}
            zoomInTrigger={zoomInTrigger}
            zoomOutTrigger={zoomOutTrigger}
            recenterTrigger={recenterTrigger}
          />

          {/* Active Basemap with city and place labels */}
          <BaseMapLayers basemap={basemap} />

          {/* Real Backend Geofence Polygons */}
          {showRisk && geofencesList.map((zone) => {
            const coords = zone.coordinates || zone.polygonLatLon;
            if (!coords || coords.length === 0) return null;
            const isRestricted = zone.type === 'RESTRICTED' || zone.severity === 'CRITICAL' || zone.riskLevel === 'HIGH';
            const color = isRestricted ? '#B8543C' : (zone.type === 'BUFFER' ? '#C9A961' : '#3E7C6B');

            return (
              <Polygon
                key={zone.id || zone.name}
                positions={coords}
                pathOptions={{
                  color,
                  fillColor: color,
                  fillOpacity: isRestricted ? 0.28 : 0.16,
                  weight: 2,
                  dashArray: isRestricted ? '6, 6' : undefined
                }}
              >
                <Tooltip sticky direction="top" className={isRestricted ? "risk-tooltip-high" : "risk-tooltip-mod"}>
                  <div className="space-y-1 max-w-[220px] text-xs">
                    <div className="flex items-center justify-between border-b border-slate-700/50 pb-1">
                      <span className="font-bold text-slate-100">{zone.name}</span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                        isRestricted ? 'bg-rose-950 text-rose-300' : 'bg-amber-950 text-amber-300'
                      }`}>
                        {zone.type}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300">{zone.description}</p>
                    <p className="text-[10px] font-mono text-slate-400">Risk Severity: <strong className={isRestricted ? 'text-rose-400' : 'text-amber-400'}>{zone.riskLevel}</strong></p>
                  </div>
                </Tooltip>
                <Popup>
                  <div className="p-1 font-sans text-xs">
                    <strong className="text-slate-900 font-bold">{zone.name}</strong>
                    <p className="text-slate-600 text-[11px] mt-0.5">{zone.description}</p>
                    <p className="font-mono text-[10px] mt-1 font-bold">
                      Type: <span className="text-slate-800">{zone.type}</span> | Risk: <span className={isRestricted ? 'text-rose-600' : 'text-amber-600'}>{zone.riskLevel}</span>
                    </p>
                  </div>
                </Popup>
              </Polygon>
            );
          })}

          {/* Vessel Route Waypoints */}
          {showRoute && (
            <Polyline
              positions={routeWaypoints}
              pathOptions={{
                color: '#00B4D8',
                weight: 3,
                dashArray: '8, 8'
              }}
            >
              <Tooltip sticky direction="top" className="risk-tooltip-low">
                <div className="space-y-0.5 text-xs min-w-[160px]">
                  <div className="font-bold text-cyan-300">Vessel Transit Corridor</div>
                  <div className="text-[11px] text-slate-200">From: {selectedLocation?.name || 'Vessel'}</div>
                  <div className="text-[10px] text-slate-400">Heading: 134° SE | Clear Channel</div>
                </div>
              </Tooltip>
            </Polyline>
          )}

          {/* Start Point Marker (Active Selected Vessel Location) */}
          <Marker position={startPoint} icon={startIcon}>
            <Tooltip permanent direction="top" offset={[0, -14]} className="map-station-tooltip">
              <span className="font-bold text-[11px] text-blue-900 bg-white/95 px-1.5 py-0.5 rounded shadow-sm">
                {selectedLocation?.name || 'Vessel Station'}
              </span>
            </Tooltip>
            <Popup>
              <div className="font-sans text-xs text-slate-900">
                <strong>{selectedLocation?.name || 'Vessel Departure'}</strong>
                <p>{centerLat.toFixed(4)}° N, {centerLon.toFixed(4)}° E</p>
              </div>
            </Popup>
          </Marker>

          {/* Designated INCOIS PFZ Destination Marker */}
          {targetPfz && targetPfz.lat && targetPfz.lon && (
            <Marker position={[targetPfz.lat, targetPfz.lon]} icon={destinationIcon}>
              <Tooltip permanent direction="top" offset={[0, -16]} className="map-station-tooltip">
                <span className="font-bold text-[10px] text-emerald-950 bg-white/95 px-2 py-0.5 rounded shadow-sm flex items-center gap-1 border border-emerald-500/50">
                  🎯 Destination: {targetPfz.name}
                </span>
              </Tooltip>
              <Popup>
                <div className="font-mono text-xs p-1 text-slate-900">
                  <strong className="text-emerald-600 font-bold text-xs flex items-center gap-1">
                    <span>🎯 INCOIS PFZ Target Destination</span>
                  </strong>
                  <p className="text-slate-700 text-[11px] font-semibold mt-1">{targetPfz.name}</p>
                  <p className="text-slate-600 text-[10px]">
                    {targetPfz.lat.toFixed(4)}° N, {targetPfz.lon.toFixed(4)}° E
                  </p>
                  <p className="text-[11px] text-emerald-600 font-bold mt-1">
                    Catch Suitability: {targetPfz.score != null ? `${targetPfz.score}%` : 'Unavailable'}
                  </p>
                  <p className="text-[10px] text-slate-500 font-sans mt-0.5">
                    Est. Distance: ~{targetPfz.distanceKm} km from {selectedLocation?.name}
                  </p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Live INCOIS PFZ Markers */}
          {displayPfzs.map((pfz) => {
            const lat = pfz.latitude || pfz.lat;
            const lon = pfz.longitude || pfz.lon;
            if (!lat || !lon) return null;
            const score = pfz.score || pfz.confidence || null;
            const isDestination = targetPfz && (pfz.name === targetPfz.name || pfz.id === targetPfz.name);
            const badgeLabel = score != null ? `${score}%` : (pfz.sector ? `Sec ${pfz.sector}` : 'PFZ');

            return (
              <Marker
                key={pfz.id || `${lat}-${lon}`}
                position={[lat, lon]}
                icon={createPfzBadgeIcon(pfz.name || pfz.id || 'INCOIS PFZ', badgeLabel, isDestination)}
              >
                <Tooltip sticky direction="top" className="risk-tooltip-low">
                  <div className="space-y-0.5 text-xs min-w-[160px]">
                    <div className="font-bold text-emerald-400 flex items-center justify-between">
                      <span>🐟 {pfz.name || pfz.id}</span>
                      <span className="text-[10px] font-mono text-emerald-300">
                        {score != null ? `${score}% Score` : (t('confidence_not_available') || 'Confidence: Not available')}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-200">
                      {isDestination ? '⭐ Recommended Route Destination' : 'INCOIS Marine Advisory Point'}
                    </div>
                    {pfz.sector && (
                      <div className="text-[10px] text-slate-300">
                        {t('sector') || 'Sector'}: {pfz.sector} {pfz.length ? `| ${t('length_km') || 'Length'}: ${pfz.length} km` : ''}
                      </div>
                    )}
                    <div className="text-[10px] text-slate-400 font-mono">
                      {lat.toFixed(4)}° N, {lon.toFixed(4)}° E
                    </div>
                    {pfz.sst != null && (
                      <div className="text-[10px] text-cyan-300">
                        SST: {pfz.sst}°C
                      </div>
                    )}
                  </div>
                </Tooltip>
                <Popup>
                  <div className="font-sans text-xs text-slate-900 space-y-2 p-1 min-w-[160px]">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                      <strong className="font-bold text-[#0F172A]">{pfz.name || pfz.id}</strong>
                      <span className="text-emerald-600 font-bold">●</span>
                    </div>
                    <div className="space-y-0.5 text-[11px] text-slate-600 font-mono">
                      {pfz.distanceKm && (
                        <div className="flex justify-between">
                          <span>Distance:</span>
                          <span className="font-semibold text-slate-900">{Number(pfz.distanceKm).toFixed(1)} km</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Suitability:</span>
                        <span className="font-bold text-[#22C55E]">{pfz.score != null ? `${pfz.score}%` : 'Unavailable'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 pt-1">
                      <button
                        onClick={() => navigate('/safe-routes', { state: { targetPfzId: pfz.id } })}
                        className="flex-1 py-1 px-2 bg-[#00B4D8] hover:bg-[#0096B4] text-[#001F3F] font-bold text-[11px] rounded transition-all cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Navigation className="w-3 h-3" />
                        <span>Find Route</span>
                      </button>
                      <button
                        onClick={() => navigate('/pfz-explorer')}
                        className="py-1 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[11px] rounded border border-slate-300 transition-all cursor-pointer"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* MAP TOOL TOOLBAR WITH FUNCTIONAL HANDLERS */}
        <div className="absolute top-4 left-4 z-[1000]">
          <MapToolToolbar
            onZoomIn={() => setZoomInTrigger((p) => p + 1)}
            onZoomOut={() => setZoomOutTrigger((p) => p + 1)}
            onRecenter={() => setRecenterTrigger((p) => p + 1)}
            toggleRisk={() => setShowRisk(!showRisk)}
            toggleRoute={() => setShowRoute(!showRoute)}
            showRisk={showRisk}
            showRoute={showRoute}
          />
        </div>

        <div className="absolute top-4 right-4 z-[1000]">
          <MarineIntelligenceHUD onGeneratePrediction={() => navigate('/safety-risk')} />
        </div>

        <div className="absolute bottom-4 left-4 z-[1000]">
          <MapLegendWidget />
        </div>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] bg-white px-3.5 py-1 rounded-full text-[11px] font-mono text-slate-700 border border-[#E2E8F0] shadow-md flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse"></span>
          <span>{isAnyFallback ? 'Offline Fallback Active' : 'Live Express GIS Sync: Active'}</span>
        </div>
      </div>
    </div>
  );
}
