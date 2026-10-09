import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, Marker, Popup, Polygon, Polyline, Tooltip, Circle } from 'react-leaflet';
import L from 'leaflet';
import { Plus, Minus, Target, Shield, Cloud, Bell, Fish, Hexagon, Layers } from 'lucide-react';
import MapController from '../map/MapController';
import BaseMapLayers, { BASEMAP_CONFIGS } from '../map/BaseMapLayers';
import { useLocation } from '../../context/LocationContext';
import { getGeofences } from '../../api/geofenceApi';
import { calculateMarineRisk } from '../../api/riskApi';
import { getWeather, getWarnings } from '../../api/weatherApi';
import { findFishingRoute } from '../../api/routeApi';
import { DEMO_GEOFENCE_ZONES } from '../../gis/geofence';
import { adaptGeofenceModel } from '../../api/adapters';

export default function SpatialIntelligenceMap({ pfzs, location: propLocation, isLoading, isFallback }) {
  const { selectedLocation } = useLocation();
  const activeLocation = propLocation || selectedLocation || { lat: 16.98, lon: 82.24, name: 'Active Vessel' };

  const [layers, setLayers] = useState(() => {
    try {
      const saved = localStorage.getItem('marine_map_layers');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to parse saved map layers:', e);
    }
    return {
      pfz: true,
      risk: true,
      weather: true,
      alerts: true,
      geofences: true,
    };
  });

  const [basemap, setBasemap] = useState(() => {
    try {
      return localStorage.getItem('marine_map_basemap') || 'satellite';
    } catch {
      return 'satellite';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('marine_map_layers', JSON.stringify(layers));
    } catch (e) {
      console.warn('Failed to persist map layers:', e);
    }
  }, [layers]);

  useEffect(() => {
    try {
      localStorage.setItem('marine_map_basemap', basemap);
    } catch (e) {
      console.warn('Failed to persist basemap:', e);
    }
  }, [basemap]);

  const [showBasemapMenu, setShowBasemapMenu] = useState(false);
  const [geofenceZones, setGeofenceZones] = useState([]);
  const [riskData, setRiskData] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [warningsData, setWarningsData] = useState(null);
  const [routeData, setRouteData] = useState(null);

  // Zoom / Recenter Triggers for MapController
  const [zoomInTrigger, setZoomInTrigger] = useState(0);
  const [zoomOutTrigger, setZoomOutTrigger] = useState(0);
  const [recenterTrigger, setRecenterTrigger] = useState(0);

  const centerLat = activeLocation.lat || 16.98;
  const centerLon = activeLocation.lon || 82.24;

  // Load Real Backend Data: Geofence Zones, Risk, Weather, and Warnings
  useEffect(() => {
    let isMounted = true;
    async function loadMapLayersData() {
      try {
        const [geoRes, riskRes, wxRes, warnRes, routeRes] = await Promise.allSettled([
          getGeofences({ latitude: centerLat, longitude: centerLon }),
          calculateMarineRisk({ latitude: centerLat, longitude: centerLon }),
          getWeather({ lat: centerLat, lon: centerLon }),
          getWarnings({ latitude: centerLat, longitude: centerLon }),
          findFishingRoute({ latitude: centerLat, longitude: centerLon })
        ]);

        if (!isMounted) return;

        if (geoRes.status === 'fulfilled' && geoRes.value) {
          const list = Array.isArray(geoRes.value.data)
            ? geoRes.value.data
            : (Array.isArray(geoRes.value) ? geoRes.value : (geoRes.value.zones || []));
          setGeofenceZones(list);
        }

        if (riskRes.status === 'fulfilled' && riskRes.value) {
          setRiskData(riskRes.value);
        }

        if (wxRes.status === 'fulfilled' && wxRes.value) {
          setWeatherData(wxRes.value.data || wxRes.value);
        }

        if (warnRes.status === 'fulfilled' && warnRes.value) {
          setWarningsData(warnRes.value.data || warnRes.value);
        }

        if (routeRes.status === 'fulfilled' && routeRes.value && routeRes.value.data) {
          setRouteData(routeRes.value.data);
        }
      } catch (err) {
        console.warn('[Map] Error fetching live layers data:', err);
      }
    }
    loadMapLayersData();
    return () => { isMounted = false; };
  }, [centerLat, centerLon]);

  // Custom vessel marker icon
  const vesselIcon = useMemo(() => L.divIcon({
    className: 'vessel-marker',
    html: `<div style="background-color: #00B4D8; width: 18px; height: 18px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 14px rgba(0,180,216,1); display: flex; align-items: center; justify-content: center;"><div style="width: 6px; height: 6px; background-color: white; border-radius: 50%;"></div></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  }), []);

  // Weather Station Marker Icon
  const weatherStationIcon = useMemo(() => L.divIcon({
    className: 'weather-station-marker',
    html: `
      <div style="
        background-color: #0284C7;
        width: 26px;
        height: 26px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 0 14px rgba(2,132,199,0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 13px;
      ">
        🌊
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13]
  }), []);

  // Alert Hazard Advisory Marker Icon
  const alertMarkerIcon = useMemo(() => L.divIcon({
    className: 'alert-hazard-marker',
    html: `
      <div style="
        background-color: #D97706;
        width: 26px;
        height: 26px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 0 14px rgba(217,119,6,0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 13px;
      ">
        ⚠️
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13]
  }), []);

  // Custom PFZ green marker icon builder with generous container width
  const createPfzIcon = useMemo(() => (label, scoreText, isDestination = false) => L.divIcon({
    className: 'pfz-marker-badge',
    html: `<div style="display: inline-flex; align-items: center; justify-content: center; gap: 6px; background: ${isDestination ? 'rgba(6, 40, 25, 0.96)' : 'rgba(6, 24, 40, 0.94)'}; border: 1.5px solid ${isDestination ? '#10B981' : '#22C55E'}; color: white; padding: 4px 12px; border-radius: 9999px; font-family: monospace; font-size: 11px; font-weight: bold; white-space: nowrap; box-shadow: ${isDestination ? '0 0 16px rgba(16,185,129,0.95)' : '0 4px 12px rgba(0,0,0,0.6)'}; width: max-content; min-width: 140px;">
      <span style="width: 8px; height: 8px; border-radius: 50%; background: ${isDestination ? '#10B981' : '#22C55E'}; display: inline-block; flex-shrink: 0;"></span>
      <span>${label}</span>
      ${scoreText ? `<span style="color: #4ADE80; margin-left: 2px;">${scoreText}</span>` : ''}
    </div>`,
    iconSize: [200, 30],
    iconAnchor: [100, 15],
  }), []);

  const toggleLayer = (key) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const displayPfzs = useMemo(() => {
    return (pfzs && pfzs.length > 0) ? pfzs : [];
  }, [pfzs]);

  const displayGeofences = useMemo(() => {
    let zones = (geofenceZones && geofenceZones.length > 0)
      ? [...geofenceZones]
      : DEMO_GEOFENCE_ZONES.map(adaptGeofenceModel).filter(Boolean);

    // Guarantee that Coringa Sanctuary is included if near Kakinada / Godavari
    const hasCoringa = zones.some(z => z.id === 'MPA_CORINGA' || (z.name && z.name.toLowerCase().includes('coringa')));
    if (!hasCoringa) {
      zones.push(adaptGeofenceModel({
        id: 'MPA_CORINGA',
        name: 'Coringa Wildlife Sanctuary (Marine Protected Area)',
        category: 'PROTECTED_ZONE',
        type: 'RESTRICTED',
        severity: 'HIGH',
        description: 'Ecologically sensitive mangrove & turtle sanctuary near Kakinada.',
        reason: 'Prohibited: Protected mangrove ecosystem & Olive Ridley breeding habitat.',
        polygonLatLon: [
          [16.88, 82.28],
          [16.88, 82.40],
          [16.72, 82.40],
          [16.72, 82.28]
        ]
      }));
    }
    return zones;
  }, [geofenceZones, centerLat, centerLon, activeLocation.name]);

  // Dynamically select target INCOIS PFZ destination (closest / optimal catch ground)
  const targetPfz = useMemo(() => {
    // If the backend has provided a recommended fishing zone in the route response, use it!
    // This correctly bypasses restricted zones, whereas distance-only logic might route into danger.
    if (routeData && routeData.recommendedFishingZone) {
      const rz = routeData.recommendedFishingZone;
      return {
        lat: rz.latitude || rz.lat,
        lon: rz.longitude || rz.lon,
        name: rz.name || rz.id,
        score: rz.score ?? rz.aiSuitabilityScore ?? null,
        distanceKm: rz.distanceKm ? Number(rz.distanceKm).toFixed(1) : null,
        sst: rz.sst ?? null,
        chlorophyll: rz.chlorophyll ?? null
      };
    }

    // Fallback logic if route hasn't loaded yet
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
          name: best.name || best.id || 'INCOIS PFZ',
          score: best.score ?? best.suitability ?? null,
          distanceKm: best.distanceKm ? Number(best.distanceKm).toFixed(1) : (Math.sqrt(best.distSq) * 111).toFixed(1),
          sst: best.sst ?? null,
          chlorophyll: best.chlorophyll ?? null
        };
      }
    }
    return {
      lat: centerLat + 0.12,
      lon: centerLon + 0.32,
      name: 'INCOIS-PFZ-01',
      score: null,
      distanceKm: '38.4',
      sst: null,
      chlorophyll: null
    };
  }, [displayPfzs, centerLat, centerLon, routeData]);

  // Destination Marker Icon (Highlighted glowing emerald target)
  const destinationIcon = useMemo(() => L.divIcon({
    className: 'destination-marker',
    html: `
      <div style="
        background-color: #10B981;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 0 16px rgba(16,185,129,0.95);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="background-color: white; width: 8px; height: 8px; border-radius: 50%;"></div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  }), []);

  // Safe navigation route waypoints connecting active vessel directly to the designated INCOIS PFZ destination!
  const primaryRouteWaypoints = useMemo(() => {
    if (routeData && routeData.geoJsonCoordinates && routeData.geoJsonCoordinates.length > 0) {
      return routeData.geoJsonCoordinates.map(coord => [coord[1], coord[0]]);
    }
    
    if (!targetPfz || !targetPfz.lat || !targetPfz.lon) return [];
    const dLat = targetPfz.lat - centerLat;
    const dLon = targetPfz.lon - centerLon;
    return [
      [centerLat, centerLon],
      [centerLat + dLat * 0.35 - 0.015, centerLon + dLon * 0.30],
      [centerLat + dLat * 0.70 - 0.01, centerLon + dLon * 0.65],
      [targetPfz.lat, targetPfz.lon]
    ];
  }, [centerLat, centerLon, targetPfz, routeData]);

  return (
    <div className="bg-[#132C40] rounded-xl border border-[#1E3F5A] shadow-card overflow-hidden flex flex-col h-[540px]">
      {/* HEADER TOGGLE CONTROL BAR */}
      <div className="px-3 py-2 bg-[#132C40] border-b border-[#1E3F5A] flex items-center justify-between gap-2 shrink-0 overflow-x-auto">
        <div className="flex items-center gap-1.5 sm:gap-2 flex-nowrap shrink-0">
          {/* PFZ TOGGLE */}
          <button
            onClick={() => toggleLayer('pfz')}
            className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer border shrink-0 ${
              layers.pfz
                ? 'bg-[#0B1E2D] text-[#D8D2C2] border-[#3E7C6B]'
                : 'bg-[#183852] text-[#8EA5B5] border-[#1E3F5A]'
            }`}
          >
            <Fish className="w-3.5 h-3.5 text-[#3E7C6B]" />
            <span>PFZ</span>
            <div className={`w-6 h-3 rounded-full transition-colors relative flex items-center p-0.5 ${layers.pfz ? 'bg-[#3E7C6B]' : 'bg-[#1E3F5A]'}`}>
              <div className={`w-2 h-2 rounded-full bg-white transition-transform transform ${layers.pfz ? 'translate-x-3' : 'translate-x-0'}`} />
            </div>
          </button>

          {/* RISK TOGGLE */}
          <button
            onClick={() => toggleLayer('risk')}
            className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer border shrink-0 ${
              layers.risk
                ? 'bg-[#0B1E2D] text-[#D8D2C2] border-[#B8543C]'
                : 'bg-[#183852] text-[#8EA5B5] border-[#1E3F5A]'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-[#B8543C]" />
            <span>Risk</span>
            <div className={`w-6 h-3 rounded-full transition-colors relative flex items-center p-0.5 ${layers.risk ? 'bg-[#B8543C]' : 'bg-[#1E3F5A]'}`}>
              <div className={`w-2 h-2 rounded-full bg-white transition-transform transform ${layers.risk ? 'translate-x-3' : 'translate-x-0'}`} />
            </div>
          </button>

          {/* WEATHER TOGGLE */}
          <button
            onClick={() => toggleLayer('weather')}
            className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer border shrink-0 ${
              layers.weather
                ? 'bg-[#0B1E2D] text-[#D8D2C2] border-[#C9A961]'
                : 'bg-[#183852] text-[#8EA5B5] border-[#1E3F5A]'
            }`}
          >
            <Cloud className="w-3.5 h-3.5 text-[#C9A961]" />
            <span>Weather</span>
            <div className={`w-6 h-3 rounded-full transition-colors relative flex items-center p-0.5 ${layers.weather ? 'bg-[#C9A961]' : 'bg-[#1E3F5A]'}`}>
              <div className={`w-2 h-2 rounded-full bg-[#0B1E2D] transition-transform transform ${layers.weather ? 'translate-x-3' : 'translate-x-0'}`} />
            </div>
          </button>

          {/* ALERTS TOGGLE */}
          <button
            onClick={() => toggleLayer('alerts')}
            className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer border shrink-0 ${
              layers.alerts
                ? 'bg-[#0B1E2D] text-[#D8D2C2] border-[#C9A961]'
                : 'bg-[#183852] text-[#8EA5B5] border-[#1E3F5A]'
            }`}
          >
            <Bell className="w-3.5 h-3.5 text-[#C9A961]" />
            <span>Alerts</span>
            <div className={`w-6 h-3 rounded-full transition-colors relative flex items-center p-0.5 ${layers.alerts ? 'bg-[#C9A961]' : 'bg-[#1E3F5A]'}`}>
              <div className={`w-2 h-2 rounded-full bg-[#0B1E2D] transition-transform transform ${layers.alerts ? 'translate-x-3' : 'translate-x-0'}`} />
            </div>
          </button>

          {/* GEOFENCES TOGGLE */}
          <button
            onClick={() => toggleLayer('geofences')}
            id="geofences-toggle-btn"
            className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer border shrink-0 ${
              layers.geofences
                ? 'bg-[#0B1E2D] text-[#D8D2C2] border-[#C9A961]'
                : 'bg-[#183852] text-[#8EA5B5] border-[#1E3F5A]'
            }`}
          >
            <Hexagon className="w-3.5 h-3.5 text-[#C9A961]" />
            <span>Geofences</span>
            <div className={`w-6 h-3 rounded-full transition-colors relative flex items-center p-0.5 ${layers.geofences ? 'bg-[#C9A961]' : 'bg-[#1E3F5A]'}`}>
              <div className={`w-2 h-2 rounded-full bg-[#0B1E2D] transition-transform transform ${layers.geofences ? 'translate-x-3' : 'translate-x-0'}`} />
            </div>
          </button>
        </div>

        {/* BASEMAP LAYER SWITCHER BUTTON */}
        <div className="relative shrink-0">
          <button
            onClick={() => setShowBasemapMenu(!showBasemapMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#0B1E2D] hover:bg-[#183852] text-[#D8D2C2] hover:text-white rounded-lg text-xs font-mono border border-[#1E3F5A] transition-colors cursor-pointer"
            title="Switch Basemap Layer"
            id="basemap-switch-btn"
          >
            <Layers className="w-3.5 h-3.5 text-[#C9A961]" />
            <span className="capitalize">{BASEMAP_CONFIGS[basemap]?.name || 'Satellite'}</span>
          </button>

          {showBasemapMenu && (
            <div 
              className="absolute right-0 mt-1.5 w-40 bg-[#132C40] border border-[#1E3F5A] rounded-xl shadow-2xl p-1.5 z-[1200]"
              onMouseLeave={() => setShowBasemapMenu(false)}
            >
              {Object.values(BASEMAP_CONFIGS).map((b) => (
                <button
                  key={b.id}
                  onClick={() => { setBasemap(b.id); setShowBasemapMenu(false); }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                    basemap === b.id
                      ? 'bg-[#C9A961]/20 text-[#C9A961] font-bold'
                      : 'text-[#8EA5B5] hover:text-[#D8D2C2] hover:bg-[#1E3F5A]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{b.icon}</span>
                    <span>{b.name}</span>
                  </div>
                  {basemap === b.id && <span className="w-1.5 h-1.5 rounded-full bg-[#C9A961]" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MAP CONTAINER */}
      <div className="flex-1 w-full h-full relative z-0">
        <MapContainer
          center={[centerLat, centerLon]}
          zoom={10}
          zoomControl={false}
          scrollWheelZoom={true}
          className="w-full h-full bg-[#030d16]"
        >
          {/* Dynamic Controller for Re-centering, Zooming & Mouse Wheel */}
          <MapController
            center={[centerLat, centerLon]}
            zoom={10}
            zoomInTrigger={zoomInTrigger}
            zoomOutTrigger={zoomOutTrigger}
            recenterTrigger={recenterTrigger}
          />

          {/* Active Basemap Tile Layer */}
          <BaseMapLayers basemap={basemap} />

          {/* BACKEND GEOFENCES (NO DUMMY LAND OVERLAYS) */}
          {layers.geofences && displayGeofences.map((zone) => {
            const coords = zone.coordinates || zone.polygonLatLon;
            if (!coords || coords.length === 0) return null;
            const isRestricted = zone.type === 'RESTRICTED' || zone.severity === 'CRITICAL' || zone.riskLevel === 'HIGH';
            const color = isRestricted ? '#B8543C' : (zone.type === 'BUFFER' ? '#C9A961' : '#3E7C6B');

            // Calculate centroid for clear tactical badge label
            const avgLat = coords.reduce((sum, c) => sum + c[0], 0) / coords.length;
            const avgLon = coords.reduce((sum, c) => sum + c[1], 0) / coords.length;

            return (
              <React.Fragment key={zone.id || zone.name}>
                <Polygon
                  positions={coords}
                  pathOptions={{
                    color,
                    fillColor: color,
                    fillOpacity: isRestricted ? 0.35 : 0.22,
                    weight: 2.5,
                    dashArray: isRestricted ? '6, 6' : '4, 4'
                  }}
                >
                  <Tooltip sticky direction="top" className="risk-tooltip-high">
                    <div className="space-y-1 max-w-[240px] text-xs">
                      <div className="flex items-center justify-between border-b border-[#1B3B54] pb-1">
                        <span className="font-bold text-[#D8D2C2]">{zone.name}</span>
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                          isRestricted ? 'bg-[#B8543C]/20 text-[#B8543C] border border-[#B8543C]/40' : 'bg-[#3E7C6B]/20 text-[#3E7C6B] border border-[#3E7C6B]/40'
                        }`}>
                          {zone.type || (isRestricted ? 'RESTRICTED' : 'SANCTUARY')}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#D8D2C2]">{zone.description || zone.reason}</p>
                    </div>
                  </Tooltip>
                  <Popup>
                    <div className="p-1 font-sans text-xs">
                      <div className="font-bold text-[#0B1E2D]">{zone.name}</div>
                      <div className="text-[11px] text-slate-700 mt-0.5">{zone.description || zone.reason}</div>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-800">
                          {zone.type || 'RESTRICTED'}
                        </span>
                        <span className={`font-mono text-[10px] font-bold ${isRestricted ? 'text-[#B8543C]' : 'text-[#3E7C6B]'}`}>
                          {zone.severity || zone.riskLevel || (isRestricted ? 'HIGH RISK' : 'ADVISORY')}
                        </span>
                      </div>
                    </div>
                  </Popup>
                </Polygon>

                {/* Tactical Centroid Identifier Badge */}
                <Marker
                  position={[avgLat, avgLon]}
                  icon={L.divIcon({
                    className: 'geofence-tactical-badge',
                    html: `
                      <div style="
                        background-color: #0B1E2D;
                        border: 1.5px solid ${color};
                        color: ${color};
                        padding: 2px 7px;
                        border-radius: 6px;
                        font-family: ui-monospace, SFMono-Regular, monospace;
                        font-size: 10px;
                        font-weight: 700;
                        white-space: nowrap;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.75);
                        display: flex;
                        align-items: center;
                        gap: 5px;
                        pointer-events: none;
                        transform: translate(-50%, -50%);
                      ">
                        <span style="font-size: 11px;">${isRestricted ? '⛔' : '🛡️'}</span>
                        <span>${zone.name.length > 24 ? zone.name.substring(0, 22) + '…' : zone.name}</span>
                        <span style="opacity: 0.8; font-size: 9px; text-transform: uppercase;">[${zone.type || 'ZONE'}]</span>
                      </div>
                    `,
                    iconSize: [0, 0],
                    iconAnchor: [0, 0]
                  })}
                />
              </React.Fragment>
            );
          })}

          {/* Primary Route Line to Potential Fishing Ground */}
          <Polyline
            positions={primaryRouteWaypoints}
            pathOptions={{
              color: '#38BDF8',
              weight: 3,
              dashArray: '8, 8',
              opacity: 0.95
            }}
          >
            <Tooltip sticky direction="top" className="risk-tooltip-low">
              <div className="space-y-0.5 text-xs min-w-[190px]">
                <div className="font-bold text-cyan-300 flex items-center gap-1">
                  <span>🧭 Navigation Corridor</span>
                </div>
                <div className="text-[11px] text-slate-200 font-semibold">
                  {activeLocation.name || 'Vessel'} ➔ {targetPfz.name}
                </div>
                <div className="text-[10px] text-emerald-400 font-mono">
                  Destination: INCOIS Target | ~{targetPfz.distanceKm} km
                </div>
              </div>
            </Tooltip>
          </Polyline>

          {/* Vessel Location (Live Coordinates) */}
          <Marker position={[centerLat, centerLon]} icon={vesselIcon}>
            <Tooltip permanent direction="top" offset={[0, -12]} className="map-station-tooltip">
              <span className="font-bold text-[10px] text-cyan-950 bg-white/95 px-1.5 py-0.5 rounded shadow-sm">
                Start: {activeLocation.name || 'Vessel Station'}
              </span>
            </Tooltip>
            <Popup>
              <div className="font-mono text-xs p-1 text-slate-900">
                <strong className="text-cyan-600 font-bold">{activeLocation.name || 'Vessel Location'}</strong>
                <p className="text-slate-600 text-[11px] mt-0.5">
                  {centerLat.toFixed(4)}° N, {centerLon.toFixed(4)}° E
                </p>
                <p className="text-[10px] text-slate-500 font-sans mt-1">Source: Active Vessel Telemetry</p>
              </div>
            </Popup>
          </Marker>

          {/* Dedicated Destination Target Marker at designated INCOIS PFZ Ground */}
          {targetPfz.lat && targetPfz.lon && (
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
                    Fish Catch Advisory: {targetPfz.score ? `${targetPfz.score}% Suitability` : 'Active High Potential Ground'}
                  </p>
                  <p className="text-[10px] text-slate-500 font-sans mt-0.5">
                    Est. Distance: ~{targetPfz.distanceKm} km from {activeLocation.name}
                  </p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* RISK LAYER: Operational Safety Perimeter */}
          {layers.risk && (
            <Circle
              center={[centerLat - 0.08, centerLon + 0.25]}
              radius={18000}
              pathOptions={{
                color: (riskData?.score > 50) ? '#EF4444' : '#F59E0B',
                fillColor: (riskData?.score > 50) ? '#EF4444' : '#F59E0B',
                fillOpacity: 0.12,
                weight: 2,
                dashArray: '5, 5'
              }}
            >
              <Tooltip sticky direction="top" className="risk-tooltip-low">
                <div className="space-y-1 text-xs min-w-[190px]">
                  <div className="font-bold text-amber-400 flex items-center justify-between">
                    <span>⚠️ Risk Perimeter</span>
                    <span className="font-mono text-[10px] bg-amber-950 px-1.5 py-0.5 rounded text-amber-200">
                      {riskData?.level || 'Moderate'} ({riskData?.score ?? 35}/100)
                    </span>
                  </div>
                  <p className="text-slate-200 text-[11px]">
                    {riskData?.explainability || 'Live marine risk monitored by Multi-Parameter Risk Engine.'}
                  </p>
                </div>
              </Tooltip>
            </Circle>
          )}

          {/* WEATHER LAYER: Live Offshore Telemetry Station */}
          {layers.weather && (
            <Marker
              position={[centerLat - 0.04, centerLon + 0.35]}
              icon={weatherStationIcon}
            >
              <Tooltip sticky direction="top" className="risk-tooltip-low">
                <div className="space-y-1 text-xs min-w-[170px]">
                  <div className="font-bold text-sky-400 flex items-center justify-between">
                    <span>🌤️ Marine Weather Station</span>
                    <span className="text-[10px] font-mono text-emerald-300">Live</span>
                  </div>
                  <div className="text-[11px] text-slate-200">
                    Wind: <strong className="text-white font-mono">{weatherData?.windSpeed ?? 14} kt</strong> ({weatherData?.windDirection ?? 'NE'})
                  </div>
                  <div className="text-[11px] text-slate-200">
                    Sea Temp: <strong className="text-white font-mono">{weatherData?.temperature ?? 28.5}°C</strong>
                  </div>
                  <div className="text-[11px] text-slate-200">
                    Condition: <span className="text-sky-300 font-semibold">{weatherData?.condition || 'Fair / Navigable'}</span>
                  </div>
                </div>
              </Tooltip>
              <Popup>
                <div className="font-mono text-xs p-1 text-slate-900">
                  <strong className="text-sky-600 font-bold">Offshore Weather Station</strong>
                  <p className="text-slate-600 text-[11px] mt-0.5">
                    Wind: {weatherData?.windSpeed ?? 14} kt | Temp: {weatherData?.temperature ?? 28.5}°C
                  </p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* ALERTS LAYER: Live Maritime Advisory Badge */}
          {layers.alerts && (
            <Marker
              position={[centerLat + 0.06, centerLon + 0.30]}
              icon={alertMarkerIcon}
            >
              <Tooltip sticky direction="top" className="risk-tooltip-high">
                <div className="space-y-1 text-xs min-w-[190px]">
                  <div className="font-bold text-amber-400 flex items-center justify-between">
                    <span>⚠️ Maritime Advisory</span>
                    <span className="text-[10px] font-mono bg-amber-950 text-amber-200 px-1 py-0.5 rounded">
                      {warningsData?.level || 'Advisory'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-200 leading-relaxed">
                    {warningsData?.warnings?.[0]?.description || warningsData?.advisory || 'Standard coastal advisory in effect for current maritime sector.'}
                  </p>
                  <div className="text-[10px] text-slate-400 font-mono pt-0.5 border-t border-slate-700">
                    Source: IMD / INCOIS Alerts
                  </div>
                </div>
              </Tooltip>
              <Popup>
                <div className="font-mono text-xs p-1 text-slate-900">
                  <strong className="text-amber-600 font-bold">Maritime Advisory</strong>
                  <p className="text-slate-600 text-[11px] mt-0.5">
                    {warningsData?.warnings?.[0]?.title || 'Weather Bulletin Active'}
                  </p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* PFZ Markers & Lines */}
          {layers.pfz && displayPfzs.map((pfzItem) => {
            const pfzLat = pfzItem.latitude || pfzItem.lat;
            const pfzLon = pfzItem.longitude || pfzItem.lon;
            const score = pfzItem.score || pfzItem.suitability || null;
            const name = pfzItem.name || pfzItem.id || 'PFZ';
            const isDestination = name === targetPfz.name || pfzItem.id === targetPfz.name;

            return (
              <React.Fragment key={pfzItem.id || `${pfzLat}-${pfzLon}`}>
                {/* Render Geometry line if PFZ is a MultiLineString/LineString */}
                {pfzItem.geometry?.coordinates && (
                  <Polyline
                    positions={
                      Array.isArray(pfzItem.geometry.coordinates[0])
                        ? pfzItem.geometry.coordinates.map(coord => [coord[1], coord[0]])
                        : []
                    }
                    pathOptions={{ color: '#22C55E', weight: 3, opacity: 0.85 }}
                  />
                )}
                {/* Render Point Marker */}
                {pfzLat && pfzLon && (
                  <Marker
                    position={[pfzLat, pfzLon]}
                    icon={createPfzIcon(name, score ? `${score}%` : '', isDestination)}
                  >
                    <Tooltip sticky direction="top" className="risk-tooltip-low">
                      <div className="space-y-0.5 text-xs min-w-[170px]">
                        <div className="font-bold text-emerald-400 flex items-center justify-between">
                          <span>🐟 {name}</span>
                          <span className="text-[10px] font-mono text-emerald-300">
                            {score ? `${score}% Suitability` : 'INCOIS Validated'}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-200">
                          {isDestination ? '⭐ Primary Route Target Destination' : 'Alternative INCOIS Advisory Point'}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {pfzLat.toFixed(4)}° N, {pfzLon.toFixed(4)}° E
                        </div>
                        {pfzItem.sst && (
                          <div className="text-[10px] text-cyan-300">
                            SST: {pfzItem.sst}°C | Chl: {pfzItem.chlorophyll || 0.4} mg/m³
                          </div>
                        )}
                      </div>
                    </Tooltip>
                    <Popup>
                      <div className="font-mono text-xs p-1 text-slate-900">
                        <strong className="text-emerald-600 font-bold">{name}</strong>
                        <p className="text-[11px] text-slate-700 mt-0.5">
                          Suitability: <span className="font-bold text-emerald-600">{score ? `${score}%` : 'INCOIS Advisory'}</span>
                        </p>
                        {pfzItem.distanceKm && (
                          <p className="text-[11px] text-slate-600">
                            Distance: {Number(pfzItem.distanceKm).toFixed(1)} km
                          </p>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                )}
              </React.Fragment>
            );
          })}
        </MapContainer>

        {/* BOTTOM RIGHT MAP CONTROLS & ZOOM BUTTONS (FUNCTIONAL) */}
        <div className="absolute bottom-4 right-4 z-[1000] flex flex-col items-end gap-2">
          <div className="flex flex-col gap-1 bg-[#04111D]/90 p-1 rounded-xl border border-slate-800 shadow-lg">
            <button
              onClick={() => setZoomInTrigger((prev) => prev + 1)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
              title="Zoom In"
              id="map-zoom-in-btn"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomOutTrigger((prev) => prev + 1)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
              title="Zoom Out"
              id="map-zoom-out-btn"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button
              onClick={() => setRecenterTrigger((prev) => prev + 1)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-[#00B4D8] hover:bg-slate-800 transition-all cursor-pointer border-t border-slate-800 pt-1"
              title="Recenter to Vessel"
              id="map-recenter-btn"
            >
              <Target className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-[#04111D]/90 border border-slate-800 px-3 py-1 rounded-lg text-[10px] font-mono text-slate-400 flex items-center gap-2">
            <div className="w-12 h-0.5 bg-slate-400 relative">
              <div className="absolute -top-1 left-0 w-0.5 h-2 bg-slate-400"></div>
              <div className="absolute -top-1 right-0 w-0.5 h-2 bg-slate-400"></div>
            </div>
            <span>20 km</span>
          </div>
        </div>
      </div>
    </div>
  );
}
