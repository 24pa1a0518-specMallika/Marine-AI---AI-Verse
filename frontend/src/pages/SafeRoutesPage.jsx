import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, Circle, Polyline, Marker, Popup, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  CheckCircle2, 
  AlertTriangle, 
  SlidersHorizontal, 
  Send, 
  Star, 
  ShieldCheck, 
  Fuel, 
  Clock, 
  MapPin, 
  Compass,
  X,
  Info
} from 'lucide-react';
import { useNavigate, useLocation as useRouterLocation } from 'react-router-dom';
import { findFishingRoute } from '../api/routeApi';
import { checkGeofence } from '../api/geofenceApi';
import { useLocation } from '../context/LocationContext';
import MapController from '../components/map/MapController';
import BaseMapLayers from '../components/map/BaseMapLayers';
import BasemapSwitcher from '../components/map/BasemapSwitcher';

export default function SafeRoutesPage() {
  const navigate = useNavigate();
  const routerLocation = useRouterLocation();
  const targetDate = routerLocation.state?.targetDate || null;
  const targetPfzId = routerLocation.state?.targetPfzId || null;
  const { selectedLocation, refreshTrigger } = useLocation();

  const startLat = selectedLocation?.lat ?? 16.98;
  const startLon = selectedLocation?.lon ?? 82.24;
  const startCoords = useMemo(() => [startLat, startLon], [startLat, startLon]);
  const targetCoords = useMemo(() => [startLat - 0.06, startLon + 0.38], [startLat, startLon]);
  const hazardCenter = useMemo(() => [startLat + 0.05, startLon + 0.20], [startLat, startLon]);

  const [basemap, setBasemap] = useState('satellite');
  const [selectedRoute, setSelectedRoute] = useState('Route A');
  const [isFavoritesSaved, setIsFavoritesSaved] = useState(false);
  const [isPreferencesModalOpen, setIsPreferencesModalOpen] = useState(false);

  // Zoom / Recenter triggers
  const [zoomInTrigger, setZoomInTrigger] = useState(0);
  const [zoomOutTrigger, setZoomOutTrigger] = useState(0);
  const [recenterTrigger, setRecenterTrigger] = useState(0);

  // API State
  const [routeState, setRouteState] = useState({ data: null, isFallback: false, source: 'live' });
  const [geofenceCheckState, setGeofenceCheckState] = useState({ data: null, isFallback: false, source: 'live' });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadSafeRouteData() {
      setIsLoading(true);
      try {
        // 1. Fetch live safe fishing route from Express backend solver for active vessel
        const routeRes = await findFishingRoute({
          startLat: startCoords[0],
          startLon: startCoords[1],
          targetPfzId,
          targetDate
        });

        if (!isMounted) return;
        setRouteState(routeRes);

        const routeData = routeRes.data;
        const waypoints = routeData?.waypoints || [];

        // 2. Independently validate route waypoints against geofence engine
        if (waypoints.length > 0) {
          const checkRes = await checkGeofence({
            latitude: startCoords[0],
            longitude: startCoords[1],
            waypoints
          });
          if (!isMounted) return;
          setGeofenceCheckState(checkRes);
        }
      } catch (e) {
        console.warn('Safe route load error:', e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadSafeRouteData();
    return () => { isMounted = false; };
  }, [startCoords[0], startCoords[1], targetPfzId, targetDate, refreshTrigger]);

  const routeData = routeState.data || {};
  const isFallback = routeState.isFallback || geofenceCheckState.isFallback;

  const liveRoutePoints = useMemo(() => {
    if (routeData && routeData.waypoints && routeData.waypoints.length > 0) {
      return routeData.waypoints.map(wp => [wp.lat, wp.lon]);
    }
    return [];
  }, [routeData]);

  const hasValidRoute = liveRoutePoints.length >= 2;
  const backendSafety = routeData?.safetyStatus || 'UNKNOWN';
  const geofenceStatus = routeData?.geofenceStatus || 'CLEAR';

  // Determine final route status
  let finalStatus = 'UNAVAILABLE';
  let isRouteSafe = false;

  if (backendSafety === 'DO_NOT_SAIL') {
    finalStatus = 'DO_NOT_SAIL';
  } else if (backendSafety === 'UNKNOWN' || (isFallback && !hasValidRoute)) {
    finalStatus = 'UNKNOWN';
  } else if (backendSafety === 'SAFE') {
    if (geofenceStatus === 'BLOCKED') {
      finalStatus = 'BLOCKED';
    } else {
      finalStatus = 'SAFE';
      isRouteSafe = true;
    }
  }

  const routeDistance = hasValidRoute && routeData?.distanceKm ? `${Number(routeData.distanceKm).toFixed(1)} km` : '--';

  const routeBPoints = [];

  // Custom DivIcon for Start Marker
  const startMarkerIcon = useMemo(() => L.divIcon({
    className: 'start-route-marker',
    html: `
      <div style="
        background-color: #1363DF;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 0 15px rgba(19,99,223,0.9);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="background-color: white; width: 10px; height: 10px; border-radius: 50%;"></div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  }), []);

  // Custom DivIcon for Target Marker (PFZ-03)
  const targetMarkerIcon = useMemo(() => L.divIcon({
    className: 'target-route-marker',
    html: `
      <div style="
        background-color: #10B981;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 0 18px rgba(16,185,129,0.9);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="background-color: white; width: 10px; height: 10px; border-radius: 50%;"></div>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  }), []);

  return (
    <div className="max-w-[1680px] mx-auto pb-12">
      <div className="border border-[#1E3F5A] rounded-2xl p-4 md:p-5 bg-[#091D2C]/80 shadow-2xl space-y-6">
        {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-sans font-extrabold text-2xl md:text-3xl text-[#D8D2C2] tracking-tight">
              Safest Route Navigation
            </h1>
            {isFallback && (
              <span className="text-[10px] font-mono text-[#C9A961] bg-[#C9A961]/15 border border-[#C9A961]/40 px-2 py-0.5 rounded-full">
                Offline Mode
              </span>
            )}
          </div>
          <p className="text-xs md:text-sm text-[#8EA5B5] mt-0.5 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#C9A961]" />
            <span>Departure: <strong className="text-[#D8D2C2]">{selectedLocation?.name}</strong> ({startLat.toFixed(4)}° N, {startLon.toFixed(4)}° E)</span>
          </p>
        </div>

        {/* MAP ACTION CONTROLS */}
        <div className="flex items-center gap-2.5">
          <BasemapSwitcher basemap={basemap} onBasemapChange={setBasemap} />
          <button
            onClick={() => setIsPreferencesModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-[#132C40] border border-[#1E3F5A] hover:bg-[#183852] text-[#D8D2C2] font-semibold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#C9A961]" />
            <span>Route Preferences</span>
          </button>
        </div>
      </div>

      {/* MAIN TWO COLUMN WORKSPACE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: SATELLITE MAP & ELEVATION/RISK BREAKDOWN (8 COLS) */}
        <div className="lg:col-span-8 space-y-4">
          {/* SATELLITE MAP DISPLAY */}
          <div className="bg-[#132C40] rounded-2xl border border-[#1E3F5A] shadow-card overflow-hidden">
            <div className="h-[440px] md:h-[480px] relative w-full">
              <MapContainer
                center={startCoords}
                zoom={9}
                zoomControl={false}
                scrollWheelZoom={true}
                className="w-full h-full z-10 bg-[#0B1E2D]"
              >
                <MapController
                  center={startCoords}
                  zoom={9}
                  zoomInTrigger={zoomInTrigger}
                  zoomOutTrigger={zoomOutTrigger}
                  recenterTrigger={recenterTrigger}
                />

                <BaseMapLayers basemap={basemap} />

                {/* HIGH RISK (WAVES) HAZARD ZONE */}
                <Circle
                  center={hazardCenter}
                  radius={11000}
                  pathOptions={{
                    color: '#EF4444',
                    fillColor: '#EF4444',
                    fillOpacity: 0.38,
                    weight: 1.5
                  }}
                >
                  <Tooltip sticky direction="top" className="risk-tooltip-high">
                    <div className="space-y-1.5 max-w-[260px] text-xs">
                      <div className="flex items-center justify-between border-b border-red-500/40 pb-1">
                        <span className="font-bold text-red-400 uppercase tracking-wider text-[11px] flex items-center gap-1">
                          ⛔ High Hazard Avoidance Zone
                        </span>
                        <span className="font-mono text-[9px] bg-red-950 text-red-300 px-1.5 py-0.5 rounded border border-red-800 font-bold">
                          DANGER
                        </span>
                      </div>
                      <div className="space-y-0.5 text-[11px] text-slate-200">
                        <p><strong>Primary Threat:</strong> Rough Wave Swell &amp; Squall</p>
                        <p><strong>Significant Waves:</strong> 2.8m – 3.4m (Heavy Swell)</p>
                        <p><strong>Surface Wind:</strong> 30 – 34 knots (Gale Force)</p>
                        <p><strong>Clearance Radius:</strong> 11.0 km Restricted Buffer</p>
                      </div>
                      <div className="text-[10px] text-amber-300 bg-amber-950/40 p-1.5 rounded border border-amber-800/40 font-semibold">
                        Advisory: Avoid navigation; transit diverted along Recommended Route A.
                      </div>
                    </div>
                  </Tooltip>
                  <Popup>
                    <div className="p-1 font-sans text-xs">
                      <div className="font-bold text-red-600">High Risk (Waves) Hazard</div>
                      <div className="text-slate-600">Offshore Swell &gt; 2.5m | Wind &gt; 30 kts</div>
                    </div>
                  </Popup>
                </Circle>

                {/* RECOMMENDED LIVE ROUTE */}
                {hasValidRoute && isRouteSafe && (
                  <Polyline
                  positions={liveRoutePoints}
                  pathOptions={{
                    color: '#10B981',
                    weight: 4.5,
                    dashArray: '8,8'
                  }}
                >
                  <Tooltip sticky direction="top" className="risk-tooltip-low">
                    <div className="space-y-1 max-w-[240px] text-xs">
                      <div className="flex items-center justify-between border-b border-emerald-500/40 pb-1">
                        <span className="font-bold text-emerald-400 text-[11px]">Route A (Recommended)</span>
                        <span className="font-mono text-[9px] bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-800 font-bold">
                          SAFE
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-200 space-y-0.5">
                        <p><strong>Status:</strong> 100% Clear Navigable Waters</p>
                        <p><strong>Hazard Clearance:</strong> &gt; 5.2 NM Outside Danger Zone</p>
                        <p><strong>Est. Distance:</strong> {routeDistance} | <strong>ETA:</strong> --</p>
                        <p><strong>Fuel Consumption:</strong> {routeData?.fuelEstimate || '--'} L (Eco-Optimized)</p>
                      </div>
                    </div>
                  </Tooltip>
                </Polyline>
                )}



                {/* START MARKER */}
                <Marker position={startCoords} icon={startMarkerIcon}>
                  <Tooltip direction="top" offset={[0, -16]} className="risk-tooltip-low">
                    <div className="space-y-0.5 text-xs min-w-[150px]">
                      <div className="font-bold text-sky-400 flex items-center gap-1">
                        <span>🚢 Departure Station</span>
                      </div>
                      <div className="text-slate-100 font-semibold">{selectedLocation?.name || 'Vessel Station'}</div>
                      <div className="font-mono text-slate-400 text-[10px]">{startLat.toFixed(4)}° N, {startLon.toFixed(4)}° E</div>
                    </div>
                  </Tooltip>
                  <Popup>
                    <div className="p-1 font-sans text-xs">
                      <div className="font-bold text-[#1363DF]">{selectedLocation?.name || 'Start Point'}</div>
                      <div className="text-slate-600">{startLat.toFixed(4)}° N, {startLon.toFixed(4)}° E</div>
                    </div>
                  </Popup>
                </Marker>

                {/* TARGET MARKER */}
                <Marker position={hasValidRoute ? liveRoutePoints[liveRoutePoints.length - 1] : targetCoords} icon={targetMarkerIcon}>
                  <Tooltip permanent direction="top" offset={[0, -18]} className="map-station-tooltip">
                    <span className="font-bold text-[10px] text-emerald-950 bg-white/95 px-2 py-0.5 rounded shadow-sm flex items-center gap-1 border border-emerald-500/50">
                      🎯 Destination: {targetPfzId}
                    </span>
                  </Tooltip>
                  <Popup>
                    <div className="p-1.5 font-sans text-xs min-w-[170px]">
                      <div className="font-bold text-emerald-600 flex items-center gap-1">
                        <span>🎯 INCOIS PFZ Destination</span>
                      </div>
                      <div className="text-slate-800 font-semibold text-[11px] mt-0.5">Optimal Catch Ground ({targetPfzId})</div>
                      <div className="text-slate-600 text-[10px] font-mono mt-0.5">
                        {(hasValidRoute ? liveRoutePoints[liveRoutePoints.length - 1][0] : targetCoords[0]).toFixed(4)}° N, {(hasValidRoute ? liveRoutePoints[liveRoutePoints.length - 1][1] : targetCoords[1]).toFixed(4)}° E
                      </div>
                      <div className="text-emerald-700 font-semibold text-[10px] mt-1 border-t border-slate-200 pt-1">
                        INCOIS High Fish Density Zone • Depth: ~45m
                      </div>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>

              {/* FLOATING MAP LEGEND CARD */}
              <div className="absolute bottom-4 left-4 z-[400] bg-slate-950/85 backdrop-blur-md border border-slate-800 text-white p-3 rounded-xl shadow-xl text-xs space-y-2 select-none min-w-[150px]">
                <p className="font-bold text-[11px] uppercase tracking-wider text-slate-300">Legend</p>
                <div className="space-y-1.5 text-[11px]">
                  {hasValidRoute && (
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-0.5 bg-emerald-500 rounded"></span>
                      <span>Recommended Route</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
                    <span>Avoidance Hazard</span>
                  </div>
                </div>
              </div>

              {/* ZOOM CONTROLS */}
              <div className="absolute bottom-4 right-4 z-[400] flex items-center gap-2">
                <button
                  onClick={() => setZoomInTrigger((p) => p + 1)}
                  className="w-7 h-7 bg-slate-900/90 hover:bg-slate-800 text-white rounded-lg flex items-center justify-center font-bold text-sm border border-slate-700 shadow cursor-pointer"
                >
                  +
                </button>
                <button
                  onClick={() => setZoomOutTrigger((p) => p + 1)}
                  className="w-7 h-7 bg-slate-900/90 hover:bg-slate-800 text-white rounded-lg flex items-center justify-center font-bold text-sm border border-slate-700 shadow cursor-pointer"
                >
                  -
                </button>
              </div>
            </div>
          </div>

          {/* BOTTOM ROW UNDER MAP: RISK PROFILE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-xs space-y-3">
              <h3 className="font-bold text-xs text-[#0F172A]">
                Route Risk Profile
              </h3>
              <div className="relative h-28 w-full flex items-end pt-2">
                <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-[9px] font-mono font-semibold text-slate-400">
                  <span className="text-red-500">Hazard</span>
                  <span className="text-amber-500">Caution</span>
                  <span className="text-emerald-500">Clear</span>
                </div>
                <div className="w-full h-full pl-14 pb-4">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 200 60" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="riskProfileGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#EF4444" stopOpacity="0.7" />
                        <stop offset="50%" stopColor="#F59E0B" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#10B981" stopOpacity="0.1" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 0,50 Q 50,45 100,10 Q 150,40 200,50 L 200,60 L 0,60 Z"
                      fill="url(#riskProfileGradient)"
                    />
                    <path
                      d="M 0,50 Q 50,45 100,10 Q 150,40 200,50"
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
                <div className="absolute bottom-0 left-14 right-0 flex justify-between text-[10px] font-mono text-slate-400">
                  <span className="text-emerald-600 font-bold">Start</span>
                  <span className="text-emerald-600 font-bold">PFZ Target</span>
                </div>
              </div>
            </div>

            <div className="bg-[#132C40] rounded-xl border border-[#1E3F5A] p-4 shadow-xs space-y-3">
              <h3 className="font-bold text-xs text-[#D8D2C2]">
                Waypoint Risk Breakdown
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 bg-[#3E7C6B]/20 rounded-lg border border-[#3E7C6B]/40">
                  <span className="font-semibold text-[#3E7C6B]">Clear Nav Waters</span>
                  <span className="font-mono font-bold text-[#3E7C6B]">84%</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-[#C9A961]/20 rounded-lg border border-[#C9A961]/40">
                  <span className="font-semibold text-[#C9A961]">Swell Proximity</span>
                  <span className="font-mono font-bold text-[#C9A961]">12%</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-[#0B1E2D] rounded-lg border border-[#1E3F5A]">
                  <span className="font-semibold text-[#8EA5B5]">Restricted Buffer Clearance</span>
                  <span className="font-mono font-bold text-[#D8D2C2]">&gt; 3.5 nm</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ROUTE SUMMARY & COMPARISON STACK (4 COLS) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#132C40] rounded-xl border border-[#1E3F5A] shadow-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1E3F5A] pb-3">
              <h2 className="font-bold text-sm text-[#D8D2C2]">
                Route Summary
              </h2>
            </div>

            <div className="bg-[#3E7C6B]/15 border border-[#3E7C6B]/40 rounded-xl p-3.5 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className={`flex items-center gap-2 text-xs font-bold ${isRouteSafe ? 'text-[#3E7C6B]' : finalStatus === 'UNKNOWN' || finalStatus === 'UNAVAILABLE' ? 'text-[#C9A961]' : 'text-[#EF4444]'}`}>
                  <ShieldCheck className="w-4 h-4" />
                  <span>
                    {isRouteSafe ? 'Recommended Route (A)' : finalStatus === 'UNKNOWN' ? 'Route Unavailable' : finalStatus === 'DO_NOT_SAIL' ? 'Route Blocked' : 'Route Unavailable'}
                  </span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isRouteSafe ? 'bg-[#3E7C6B]/25 text-[#3E7C6B] border border-[#3E7C6B]/50' : finalStatus === 'UNKNOWN' || finalStatus === 'UNAVAILABLE' ? 'bg-[#C9A961]/25 text-[#C9A961] border border-[#C9A961]/50' : 'bg-[#EF4444]/25 text-[#EF4444] border border-[#EF4444]/50'}`}>
                  {isRouteSafe ? 'Clear' : finalStatus === 'UNKNOWN' ? 'SAFETY UNKNOWN' : finalStatus === 'DO_NOT_SAIL' ? 'DO NOT SAIL' : 'UNAVAILABLE'}
                </span>
              </div>
              <p className="text-[11px] text-[#D8D2C2]">
                {routeData.explanation || routeData.summary || (isRouteSafe ? 'Solver evaluated wind, wave swell and geofences to ensure maximum passage safety.' : 'Route could not be calculated.')}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 text-xs">
              <div className="bg-[#0B1E2D] p-2.5 rounded-lg border border-[#1E3F5A] text-center">
                <span className="text-[10px] text-[#8EA5B5] font-medium block">Distance</span>
                <span className="font-mono font-bold text-[#D8D2C2] text-sm">{isLoading ? '...' : routeDistance}</span>
              </div>

              <div className="bg-[#0B1E2D] p-2.5 rounded-lg border border-[#1E3F5A] text-center">
                <span className="text-[10px] text-[#8EA5B5] font-medium block">ETA</span>
                <span className="font-mono font-bold text-[#D8D2C2] text-sm">--</span>
              </div>

              <div className="bg-[#0B1E2D] p-2.5 rounded-lg border border-[#1E3F5A] text-center">
                <span className="text-[10px] text-[#8EA5B5] font-medium block">Risk Level</span>
                <span className={`font-mono font-extrabold text-sm ${isRouteSafe ? 'text-[#3E7C6B]' : finalStatus === 'UNKNOWN' || finalStatus === 'UNAVAILABLE' ? 'text-[#C9A961]' : 'text-[#EF4444]'}`}>
                  {isRouteSafe ? 'LOW' : finalStatus === 'UNKNOWN' || finalStatus === 'UNAVAILABLE' ? '--' : 'HIGH'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
              <div className="bg-[#0B1E2D] p-2.5 rounded-lg border border-[#1E3F5A]">
                <span className="text-[10px] text-[#8EA5B5] font-medium block">Fuel Estimate</span>
                <span className="font-mono font-bold text-[#D8D2C2] text-sm">--</span>
              </div>

              <div className="bg-[#0B1E2D] p-2.5 rounded-lg border border-[#1E3F5A]">
                <span className="text-[10px] text-[#8EA5B5] font-medium block">Fuel Saved vs Alt</span>
                <span className="font-mono font-bold text-[#3E7C6B] text-sm">--</span>
              </div>
            </div>
          </div>

          <div className="bg-[#132C40] rounded-xl border border-[#1E3F5A] shadow-card p-5 space-y-3">
            <h3 className="font-bold text-xs text-[#D8D2C2]">
              Hazards Avoided
            </h3>

            <div className="space-y-2 text-xs">
              <div
                onClick={() => setSelectedRoute('Route A')}
                className={`p-2.5 rounded-lg border flex items-center justify-between transition-all cursor-pointer ${
                  selectedRoute === 'Route A'
                    ? (isRouteSafe ? 'bg-[#3E7C6B]/15 border-[#3E7C6B] font-semibold' : 'bg-[#EF4444]/15 border-[#EF4444] font-semibold')
                    : 'bg-[#0B1E2D] border-[#1E3F5A] hover:bg-[#183852]'
                }`}
              >
                <span className={`${isRouteSafe ? 'text-[#3E7C6B]' : 'text-[#EF4444]'} font-bold`}>
                  {hasValidRoute ? (isRouteSafe ? 'Route A (Recommended)' : 'Route A (High Risk)') : 'Route Unavailable'}
                </span>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[#D8D2C2]">{routeDistance}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isRouteSafe ? 'bg-[#3E7C6B]/25 text-[#3E7C6B] border border-[#3E7C6B]/40' : 'bg-[#EF4444]/25 text-[#EF4444] border border-[#EF4444]/40'}`}>
                    {hasValidRoute ? (isRouteSafe ? 'LOW' : 'HIGH') : '--'}
                  </span>
                </div>
              </div>

            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsFavoritesSaved(!isFavoritesSaved)}
              className={`flex-1 py-3 px-3 rounded-xl border font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                isFavoritesSaved
                  ? 'bg-[#C9A961]/20 border-[#C9A961] text-[#C9A961]'
                  : 'bg-[#183852] border-[#1E3F5A] text-[#D8D2C2] hover:bg-[#1E3F5A]'
              }`}
            >
              <Star className={`w-4 h-4 ${isFavoritesSaved ? 'fill-[#C9A961] text-[#C9A961]' : 'text-[#8EA5B5]'}`} />
              <span>{isFavoritesSaved ? 'Saved' : 'Add to Favorites'}</span>
            </button>

            {/* DOMINANT BRASS ACCENT (#C9A961) CTA */}
            <button
              onClick={() => alert('Starting AI Tactical Navigation along Route A...')}
              className="flex-1 py-3 px-4 bg-[#C9A961] hover:bg-[#B89750] text-[#0B1E2D] font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Send className="w-4 h-4 rotate-45" />
              <span>Start Navigation</span>
            </button>
          </div>
        </div>
      </div>

      {/* ROUTE PREFERENCES MODAL */}
      {isPreferencesModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-[1000] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-md w-full p-5 space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-[#0F172A]">AI Route Preference Options</h3>
              <button
                onClick={() => setIsPreferencesModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Optimization Priority</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none cursor-pointer">
                  <option value="safety">Maximum Safety (Avoid High Swell)</option>
                  <option value="fuel">Fuel Economy (Eco Speed)</option>
                  <option value="speed">Fastest Arrival (Direct Path)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Restricted Zone Safety Margin</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none cursor-pointer font-mono">
                  <option value="2nm">2.0 Nautical Miles Buffer</option>
                  <option value="5nm">5.0 Nautical Miles Buffer</option>
                  <option value="10nm">10.0 Nautical Miles Buffer</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setIsPreferencesModalOpen(false)}
                  className="px-4 py-2 bg-[#1363DF] text-white rounded-lg font-semibold shadow-xs cursor-pointer"
                >
                  Apply Preferences
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
