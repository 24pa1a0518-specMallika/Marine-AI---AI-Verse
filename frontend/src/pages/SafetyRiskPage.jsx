import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup, Tooltip, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Wind, 
  Waves, 
  Zap, 
  AlertTriangle, 
  TrendingUp, 
  MapPin, 
  CheckCircle2, 
  Layers, 
  Send, 
  Compass,
  RotateCcw,
  ShieldAlert,
  Anchor,
  Radio
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getTelemetry } from '../api/weatherApi';
import { calculateMarineRisk, MOCK_RISK_FALLBACK } from '../api/riskApi';
import { useLocation } from '../context/LocationContext';
import MapController from '../components/map/MapController';
import BaseMapLayers from '../components/map/BaseMapLayers';
import BasemapSwitcher from '../components/map/BasemapSwitcher';

// Dynamic Leaflet Map Event Listener to track cursor movement across sectors in real-time
function ZoneHoverMapHandler({ centerCoords, vesselCoords, onHoverZone, activeLocation, baseScore, baseLevel, telemetryState }) {
  useMapEvents({
    mousemove(e) {
      const lat = e.latlng.lat;
      const lon = e.latlng.lng;

      const distToCoreKm = L.latLng(lat, lon).distanceTo(L.latLng(centerCoords[0], centerCoords[1])) / 1000;
      const distToVesselKm = L.latLng(lat, lon).distanceTo(L.latLng(vesselCoords[0], vesselCoords[1])) / 1000;

      const tWind = telemetryState.data?.wind?.speed || 14;
      const tWave = telemetryState.data?.waves?.height || 1.2;
      const tPrecip = telemetryState.data?.precipitation || 15;

      if (distToCoreKm <= 20) {
        // High Risk Hazard Core (<20 km)
        const score = Math.min(98, Math.max(76, Math.round(96 - (distToCoreKm / 20) * 16)));
        onHoverZone({
          id: 'CORE',
          name: 'Offshore Swell Hazard Core (Critical)',
          level: 'High Risk',
          score,
          factor: 'Gale Force Epicenter & Heavy Breakers',
          environment: 'Extreme Swell Convergence & Breakers',
          waves: `${(tWave * 2.8).toFixed(1)} m (Heavy Swell)`,
          wind: `${Math.round(tWind * 2.4)} kt (Gale Force)`,
          radius: `${distToCoreKm.toFixed(1)} km from Core (Inner 20 km)`,
          advisory: 'DO_NOT_SAIL ZONE. Immediate severe danger to all craft. Maintain safe perimeter.',
          color: '#B8543C',
          isHovered: true,
          windVal: Math.min(100, Math.round(score * 0.95)),
          waveVal: Math.min(100, Math.round(score * 0.98)),
          rainVal: Math.min(100, Math.round(tPrecip + 50)),
          cycloneVal: 65,
          currentVal: 80
        });
      } else if (distToCoreKm <= 45) {
        // Moderate Risk Buffer Zone (20 - 45 km)
        const score = Math.min(64, Math.max(34, Math.round(62 - ((distToCoreKm - 20) / 25) * 26)));
        onHoverZone({
          id: 'BUFFER',
          name: 'Moderate Risk Buffer Zone (Intermediate)',
          level: 'Moderate Risk',
          score,
          factor: 'Cross Currents & Coastal Chop',
          environment: 'Coastal Chop & Cross-Currents',
          waves: `${(tWave * 1.6).toFixed(1)} m (Moderate Swell)`,
          wind: `${Math.round(tWind * 1.5)} kt (Fresh Breeze)`,
          radius: `${distToCoreKm.toFixed(1)} km from Core (20–45 km Buffer)`,
          advisory: 'Exercise heightened vigilance. Monitor VHF Marine Ch-16 and secure fishing gear.',
          color: '#C9A961',
          isHovered: true,
          windVal: Math.min(100, Math.round(score * 0.85)),
          waveVal: Math.min(100, Math.round(score * 0.9)),
          rainVal: Math.min(100, Math.round(tPrecip + 25)),
          cycloneVal: 20,
          currentVal: 45
        });
      } else if (distToCoreKm <= 75) {
        // Low Risk Operational Fairway (45 - 75 km)
        const score = Math.min(30, Math.max(12, Math.round(28 - ((distToCoreKm - 45) / 30) * 14)));
        onHoverZone({
          id: 'FAIRWAY',
          name: 'Low Risk Operational Fairway (Outer)',
          level: 'Low Risk',
          score,
          factor: 'Favorable Coastal Fairway',
          environment: 'Favorable Sea State & Open Water',
          waves: `${tWave.toFixed(1)} m (Calm Swell)`,
          wind: `${Math.round(tWind)} kt (Gentle Breeze)`,
          radius: `${distToCoreKm.toFixed(1)} km from Core (45–75 km Outer)`,
          advisory: 'Standard maritime navigation & fishing permitted. Safe fairway operational.',
          color: '#3E7C6B',
          isHovered: true,
          windVal: Math.min(100, Math.round(score * 0.8)),
          waveVal: Math.min(100, Math.round(score * 0.8)),
          rainVal: Math.min(100, Math.round(tPrecip)),
          cycloneVal: 0,
          currentVal: 20
        });
      } else if (distToVesselKm <= 18) {
        // Near Station / Harbor Fairway
        onHoverZone({
          id: 'HARBOR',
          name: `${activeLocation.name} (Harbor Mooring)`,
          level: baseLevel,
          score: baseScore,
          factor: tWind > 15 ? 'Surface Wind' : 'Wave Swell',
          environment: 'Mooring Fairway & Harbor Sector',
          waves: `${tWave.toFixed(1)} m`,
          wind: `${Math.round(tWind)} kt`,
          radius: `${distToVesselKm.toFixed(1)} km from Vessel`,
          advisory: 'Normal operational fairway. Standard navigation vigilance.',
          color: baseScore > 60 ? '#B8543C' : (baseScore > 30 ? '#C9A961' : '#3E7C6B'),
          isHovered: true,
          windVal: Math.min(100, Math.round(tWind * 3)),
          waveVal: Math.min(100, Math.round(tWave * 40)),
          rainVal: Math.min(100, Math.round(tPrecip)),
          cycloneVal: 0,
          currentVal: 25
        });
      }
    }
  });

  return null;
}

export default function SafetyRiskPage() {
  const navigate = useNavigate();
  const { selectedLocation, refreshTrigger } = useLocation();

  const activeLocation = {
    lat: selectedLocation?.lat ?? 16.98,
    lon: selectedLocation?.lon ?? 82.24,
    name: selectedLocation?.name ?? 'Kakinada Sector'
  };

  const [basemap, setBasemap] = useState('satellite');
  const [activeLayer, setActiveLayer] = useState('Risk Heatmap');
  const [isLayersOpen, setIsLayersOpen] = useState(false);

  // Zoom / Recenter state triggers
  const [zoomInTrigger, setZoomInTrigger] = useState(0);
  const [zoomOutTrigger, setZoomOutTrigger] = useState(0);
  const [recenterTrigger, setRecenterTrigger] = useState(0);

  // API State
  const [telemetryState, setTelemetryState] = useState({ data: null, isFallback: false, source: 'live' });
  const [riskState, setRiskState] = useState({ data: null, isFallback: false, source: 'live' });
  const [isLoading, setIsLoading] = useState(true);

  // Dynamic Zone Hover State (cursor moves from zone to zone)
  const [hoveredZone, setHoveredZone] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadSafetyRiskData() {
      setIsLoading(true);
      try {
        // 1. Fetch live weather & ocean telemetry for active vessel coordinates
        const telemetryRes = await getTelemetry({ lat: activeLocation.lat, lon: activeLocation.lon });
        if (!isMounted) return;
        setTelemetryState(telemetryRes);

        const tData = telemetryRes.data;
        const riskInput = {
          latitude: activeLocation.lat,
          longitude: activeLocation.lon,
          windSpeed: tData?.wind?.speed ?? 14,
          windGust: tData?.wind?.gust ?? 18,
          waveHeight: tData?.waves?.height ?? 1.2,
          rainProbability: tData?.precipitation ?? 0,
          lightning: 0,
          cyclone: 0
        };

        // 2. Compute Marine Risk score using backend Risk Engine
        const riskRes = await calculateMarineRisk(riskInput);
        if (!isMounted) return;
        setRiskState(riskRes);
      } catch (e) {
        console.warn('Risk data load error:', e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadSafetyRiskData();
    return () => { isMounted = false; };
  }, [activeLocation.lat, activeLocation.lon, refreshTrigger]);

  const centerCoords = [activeLocation.lat - 0.15, activeLocation.lon + 0.45];
  const vesselCoords = [activeLocation.lat, activeLocation.lon];

  const riskData = riskState.data || MOCK_RISK_FALLBACK;
  const isAnyFallback = telemetryState.isFallback || riskState.isFallback;

  // Custom DivIcon for Center Core Marker - Admiralty Warning Buoy Red (#B8543C)
  const coreMarkerIcon = useMemo(() => L.divIcon({
    className: 'core-marker',
    html: `
      <div style="
        background-color: #B8543C;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 3px solid #D8D2C2;
        box-shadow: 0 0 16px rgba(184,84,60,0.95);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      ">
        <div style="background-color: #D8D2C2; width: 6px; height: 6px; border-radius: 50%;"></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  }), []);

  // Custom DivIcon for Vessel Marker - Admiralty Brass Accent (#C9A961)
  const vesselMarkerIcon = useMemo(() => L.divIcon({
    className: 'vessel-marker',
    html: `
      <div style="
        background-color: #C9A961;
        width: 26px;
        height: 26px;
        border-radius: 50%;
        border: 3px solid #0B1E2D;
        box-shadow: 0 0 16px rgba(201,169,97,0.95);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      ">
        <div style="background-color: #0B1E2D; width: 8px; height: 8px; border-radius: 50%;"></div>
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13]
  }), []);

  // Base station telemetry values
  const windVal = Math.min(100, Math.round((telemetryState.data?.wind?.speed || 14) * 3));
  const waveVal = Math.min(100, Math.round((telemetryState.data?.waves?.height || 1.2) * 40));
  const rainVal = Math.min(100, Math.round(telemetryState.data?.precipitation || 15));

  // Base station baseline score & level
  const baseScore = (riskData.score && riskData.score > 0) ? riskData.score : 28;
  const baseLevel = riskData.level || (baseScore > 60 ? 'High Risk' : (baseScore > 30 ? 'Moderate Risk' : 'Low Risk'));

  // Currently active zone risk: driven by hovered zone if cursor is on a zone, else station baseline
  const activeZone = hoveredZone || {
    name: `${activeLocation.name} (Station Baseline)`,
    level: baseLevel,
    score: baseScore,
    factor: (telemetryState.data?.wind?.speed || 14) > 15 ? 'Surface Wind' : 'Wave Swell',
    environment: 'Favorable Coastal Fairway',
    waves: `${telemetryState.data?.waves?.height ?? 1.2} m`,
    wind: `${telemetryState.data?.wind?.speed ?? 14} kt`,
    radius: 'Station Local Sector',
    advisory: riskData.explainability || 'Normal conditions reported across sector. Maintain standard maritime vigilance.',
    color: baseScore > 60 ? '#B8543C' : (baseScore > 30 ? '#C9A961' : '#3E7C6B'),
    isHovered: false,
    windVal: windVal || 35,
    waveVal: waveVal || 42,
    rainVal: rainVal || 15,
    cycloneVal: 0,
    currentVal: 25
  };

  const activeScore = activeZone.score;
  const activeLevel = activeZone.level;

  // Real-time monitored sectors list for the interactive table
  const monitoredSectors = useMemo(() => {
    const tWind = telemetryState.data?.wind?.speed || 14;
    const tWave = telemetryState.data?.waves?.height || 1.2;
    const tPrecip = telemetryState.data?.precipitation || 15;

    return [
      {
        id: 'HARBOR',
        name: `${activeLocation.name} (Harbor Mooring Fairway)`,
        level: baseLevel,
        score: baseScore,
        factor: tWind > 15 ? 'Surface Wind' : 'Wave Swell',
        environment: 'Harbor Fairway & Mooring Basin',
        waves: `${tWave.toFixed(1)} m (Calm)`,
        wind: `${Math.round(tWind)} kt (Fair)`,
        radius: '0 – 15 km Coastal Perimeter',
        advisory: 'Normal fairway operations. Standard navigational watch.',
        color: baseScore > 60 ? '#B8543C' : (baseScore > 30 ? '#C9A961' : '#3E7C6B'),
        isHovered: true,
        windVal: Math.min(100, Math.round(tWind * 3)),
        waveVal: Math.min(100, Math.round(tWave * 40)),
        rainVal: Math.min(100, Math.round(tPrecip)),
        cycloneVal: 0,
        currentVal: 25
      },
      {
        id: 'FAIRWAY',
        name: 'Low Risk Operational Sector (Outer)',
        level: 'Low Risk',
        score: 22,
        factor: 'Favorable Sea State',
        environment: 'Open Fairway & Favorable Currents',
        waves: `${tWave.toFixed(1)} m (Calm Swell)`,
        wind: `${Math.round(tWind * 1.1)} kt (Gentle)`,
        radius: '45 – 75 km Outer Perimeter',
        advisory: 'Safe navigation permitted. Fishing grounds accessible.',
        color: '#3E7C6B',
        isHovered: true,
        windVal: 24,
        waveVal: 20,
        rainVal: 10,
        cycloneVal: 0,
        currentVal: 18
      },
      {
        id: 'BUFFER',
        name: 'Moderate Risk Buffer Zone (Intermediate)',
        level: 'Moderate Risk',
        score: 48,
        factor: 'Cross-Currents & Swell Chop',
        environment: 'Coastal Chop & Cross-Currents',
        waves: `${(tWave * 1.6).toFixed(1)} m (Moderate)`,
        wind: `${Math.round(tWind * 1.6)} kt (Fresh Breeze)`,
        radius: '20 – 45 km Intermediate Buffer',
        advisory: 'Exercise heightened vigilance. Secure deck gear & listen VHF Ch-16.',
        color: '#C9A961',
        isHovered: true,
        windVal: 52,
        waveVal: 48,
        rainVal: 35,
        cycloneVal: 20,
        currentVal: 42
      },
      {
        id: 'CORE',
        name: 'Offshore Swell Hazard Core (Critical)',
        level: 'High Risk',
        score: 92,
        factor: 'Gale Force Epicenter & Heavy Breakers',
        environment: 'Gale Breakers & Heavy Maritime Chop',
        waves: `${(tWave * 2.8).toFixed(1)} m (Heavy Swell)`,
        wind: `${Math.round(tWind * 2.5)} kt (Gale Force)`,
        radius: 'Inner 20 km Offshore Convergence',
        advisory: 'DO_NOT_SAIL ZONE. Severe maritime hazard. Diversion mandated.',
        color: '#B8543C',
        isHovered: true,
        windVal: 90,
        waveVal: 95,
        rainVal: 70,
        cycloneVal: 65,
        currentVal: 80
      },
      {
        id: 'CORINGA_MPA',
        name: 'Coringa Wildlife Sanctuary (Marine Protected Area)',
        level: 'Restricted',
        score: 85,
        factor: 'Environmental Protection Zone',
        environment: 'Mangrove Estuary & Turtle Breeding Habitat',
        waves: '0.6 m (Protected Estuary)',
        wind: '8 kt (Calm Inlet)',
        radius: 'Designated Coastal MPA Perimeter',
        advisory: 'Mechanized trawling prohibited under Indian Wildlife Protection Act.',
        color: '#B8543C',
        isHovered: true,
        windVal: 15,
        waveVal: 15,
        rainVal: 10,
        cycloneVal: 0,
        currentVal: 10
      }
    ];
  }, [telemetryState.data, activeLocation.name, baseLevel, baseScore]);

  // Semicircle gauge fill calculation: circumference for r=40 is 251.32; semicircle arc = 125.66
  // As activeScore goes from 0 to 100, fill length goes from 0 to 125.66
  const arcFill = Math.min(125.6, Math.max(3, (125.6 * activeScore) / 100));

  const riskContributors = [
    { 
      label: 'Wind', 
      value: activeZone.windVal ?? windVal ?? 35, 
      rawValue: `${telemetryState.data?.wind?.speed ?? 14} kt`, 
      color: (activeZone.windVal ?? windVal) > 60 ? 'bg-[#B8543C]' : ((activeZone.windVal ?? windVal) > 30 ? 'bg-[#C9A961]' : 'bg-[#3E7C6B]'), 
      icon: Wind 
    },
    { 
      label: 'Waves', 
      value: activeZone.waveVal ?? waveVal ?? 42, 
      rawValue: `${telemetryState.data?.waves?.height ?? 1.2} m`, 
      color: (activeZone.waveVal ?? waveVal) > 60 ? 'bg-[#B8543C]' : ((activeZone.waveVal ?? waveVal) > 30 ? 'bg-[#C9A961]' : 'bg-[#3E7C6B]'), 
      icon: Waves 
    },
    { 
      label: 'Precipitation', 
      value: activeZone.rainVal ?? rainVal ?? 15, 
      rawValue: `${telemetryState.data?.precipitation ?? 0}%`, 
      color: (activeZone.rainVal ?? rainVal) > 60 ? 'bg-[#B8543C]' : 'bg-[#C9A961]', 
      icon: Zap 
    },
    { 
      label: 'Cyclone Alert', 
      value: activeZone.cycloneVal ?? 0, 
      rawValue: (activeZone.cycloneVal ?? 0) > 30 ? 'Active Alert' : 'None', 
      color: (activeZone.cycloneVal ?? 0) > 0 ? 'bg-[#B8543C]' : 'bg-[#3E7C6B]', 
      icon: AlertTriangle 
    },
    { 
      label: 'Surface Current', 
      value: activeZone.currentVal ?? 25, 
      rawValue: `${telemetryState.data?.current?.speed ?? 0.3} m/s`, 
      color: (activeZone.currentVal ?? 25) > 60 ? 'bg-[#B8543C]' : 'bg-[#C9A961]', 
      icon: Compass 
    }
  ];

  return (
    <div className="max-w-[1680px] mx-auto pb-12 text-[#D8D2C2]">
      <div className="border border-[#1E3F5A] rounded-2xl p-4 md:p-5 bg-[#091D2C]/80 shadow-2xl space-y-6">
        {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-sans font-extrabold text-2xl md:text-3xl text-[#D8D2C2] tracking-tight">
              Risk Analysis & Safety Evaluation
            </h1>
            {isAnyFallback ? (
              <span className="text-[10px] font-mono text-[#C9A961] bg-[#C9A961]/15 border border-[#C9A961]/40 px-2 py-0.5 rounded-full">
                Offline Mode
              </span>
            ) : (
              <span className="text-[10px] font-mono text-[#3E7C6B] bg-[#3E7C6B]/15 border border-[#3E7C6B]/40 px-2 py-0.5 rounded-full">
                Live INCOIS / IMD Analysis
              </span>
            )}
          </div>
          <p className="text-xs md:text-sm text-[#8EA5B5] mt-0.5">
            Active Station: <strong className="text-[#D8D2C2]">{activeLocation.name}</strong> ({activeLocation.lat.toFixed(4)}° N, {activeLocation.lon.toFixed(4)}° E)
          </p>
        </div>

        {/* HEADER RIGHT: RISK LEGEND TAGS & RISK LAYERS BUTTON */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="hidden sm:flex items-center gap-3 bg-[#132C40] border border-[#1E3F5A] px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#3E7C6B]"></span>
              <span className="text-[#D8D2C2]">Low (&lt;30)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C9A961]"></span>
              <span className="text-[#D8D2C2]">Moderate (30-60)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#B8543C]"></span>
              <span className="text-[#D8D2C2]">High (&gt;60)</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <BasemapSwitcher basemap={basemap} onBasemapChange={setBasemap} />

            <div className="relative">
              <button
                onClick={() => setIsLayersOpen(!isLayersOpen)}
                className="flex items-center gap-1.5 bg-[#132C40] border border-[#1E3F5A] hover:bg-[#183852] text-[#D8D2C2] font-semibold text-xs px-3.5 py-2 rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <Layers className="w-4 h-4 text-[#C9A961]" />
                <span>{activeLayer}</span>
              </button>

              {isLayersOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[#132C40] border border-[#1E3F5A] rounded-xl shadow-xl z-[500] p-2 text-xs font-medium space-y-1">
                  {['Risk Heatmap', 'Wind Vectors', 'Wave Swell Grid', 'Sea Temperature'].map((layer) => (
                    <button
                      key={layer}
                      onClick={() => {
                        setActiveLayer(layer);
                        setIsLayersOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                        activeLayer === layer
                          ? 'bg-[#0B1E2D] text-[#C9A961] font-bold border border-[#1E3F5A]'
                          : 'text-[#D8D2C2] hover:bg-[#183852]'
                      }`}
                    >
                      {layer}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MAIN TWO COLUMN WORKSPACE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: SATELLITE MAP & METRICS BAR (8 COLS) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-[#132C40] rounded-2xl border border-[#1E3F5A] shadow-card overflow-hidden">
            <div className="h-[440px] md:h-[480px] relative w-full">
              <MapContainer
                center={vesselCoords}
                zoom={9}
                zoomControl={false}
                scrollWheelZoom={true}
                className="w-full h-full z-10 bg-[#0B1E2D]"
              >
                <MapController
                  center={vesselCoords}
                  zoom={9}
                  zoomInTrigger={zoomInTrigger}
                  zoomOutTrigger={zoomOutTrigger}
                  recenterTrigger={recenterTrigger}
                />

                <ZoneHoverMapHandler
                  centerCoords={centerCoords}
                  vesselCoords={vesselCoords}
                  onHoverZone={setHoveredZone}
                  activeLocation={activeLocation}
                  baseScore={baseScore}
                  baseLevel={baseLevel}
                  telemetryState={telemetryState}
                />

                <BaseMapLayers basemap={basemap} />

                {/* LOW RISK CONCENTRIC ZONE (OUTER PERIMETER - 75 km) */}
                <Circle
                  center={centerCoords}
                  radius={75000}
                  pathOptions={{
                    color: '#3E7C6B',
                    fillColor: '#3E7C6B',
                    fillOpacity: 0.18,
                    weight: 2
                  }}
                  eventHandlers={{
                    mouseover: (e) => {
                      L.DomEvent.stopPropagation(e);
                      setHoveredZone({
                        name: 'Low Risk Operational Sector',
                        level: 'Low Risk',
                        score: 22,
                        factor: 'Favorable Sea State',
                        environment: 'Favorable Sea State & Open Fairway',
                        waves: '0.8m – 1.3m (Calm Swell)',
                        wind: '8 – 14 knots (Gentle Breeze)',
                        radius: '75 km Outer Perimeter',
                        advisory: 'Standard maritime navigation & fishing permitted. Safe fairway operational.',
                        color: '#3E7C6B',
                        isHovered: true,
                        windVal: 22,
                        waveVal: 18,
                        rainVal: 10,
                        cycloneVal: 0,
                        currentVal: 15
                      });
                    },
                    mouseout: () => {}
                  }}
                >
                  <Tooltip sticky direction="auto" className="risk-tooltip-low">
                    <div className="space-y-1.5 max-w-[260px] text-xs">
                      <div className="flex items-center justify-between border-b border-[#3E7C6B]/40 pb-1">
                        <span className="font-bold text-[#3E7C6B] text-[11px] flex items-center gap-1">
                          🟢 Low Risk Operational Sector
                        </span>
                        <span className="font-mono text-[9px] bg-[#0B1E2D] text-[#3E7C6B] px-1.5 py-0.5 rounded border border-[#3E7C6B]/50 font-bold">
                          Score: 0 – 30
                        </span>
                      </div>
                      <div className="space-y-0.5 text-[11px] text-[#D8D2C2]">
                        <p><strong>Environment:</strong> Favorable Sea State &amp; Open Fairway</p>
                        <p><strong>Significant Waves:</strong> 0.8m – 1.3m (Calm Swell)</p>
                        <p><strong>Wind Velocity:</strong> 8 – 14 knots (Gentle Breeze)</p>
                        <p><strong>Surveillance Range:</strong> 75 km Outer Perimeter</p>
                      </div>
                      <div className="text-[10px] text-[#3E7C6B] bg-[#3E7C6B]/15 p-1.5 rounded border border-[#3E7C6B]/30 font-semibold">
                        Advisory: Standard maritime navigation &amp; fishing permitted.
                      </div>
                    </div>
                  </Tooltip>
                </Circle>

                {/* MODERATE RISK CONCENTRIC ZONE (TRANSITION BUFFER - 45 km) */}
                <Circle
                  center={centerCoords}
                  radius={45000}
                  pathOptions={{
                    color: '#C9A961',
                    fillColor: '#C9A961',
                    fillOpacity: 0.26,
                    weight: 2
                  }}
                  eventHandlers={{
                    mouseover: (e) => {
                      L.DomEvent.stopPropagation(e);
                      setHoveredZone({
                        name: 'Moderate Risk Buffer Zone',
                        level: 'Moderate Risk',
                        score: 48,
                        factor: 'Cross Currents & Coastal Chop',
                        environment: 'Coastal Chop & Cross-Currents',
                        waves: '1.4m – 2.2m (Moderate Swell)',
                        wind: '15 – 22 knots (Fresh Breeze)',
                        radius: '45 km Intermediate Radius',
                        advisory: 'Exercise heightened vigilance. Monitor VHF Marine Ch-16.',
                        color: '#C9A961',
                        isHovered: true,
                        windVal: 52,
                        waveVal: 48,
                        rainVal: 35,
                        cycloneVal: 0,
                        currentVal: 40
                      });
                    },
                    mouseout: () => {}
                  }}
                >
                  <Tooltip sticky direction="auto" className="risk-tooltip-mod">
                    <div className="space-y-1.5 max-w-[260px] text-xs">
                      <div className="flex items-center justify-between border-b border-[#C9A961]/40 pb-1">
                        <span className="font-bold text-[#C9A961] text-[11px] flex items-center gap-1">
                          🟡 Moderate Risk Buffer Zone
                        </span>
                        <span className="font-mono text-[9px] bg-[#0B1E2D] text-[#C9A961] px-1.5 py-0.5 rounded border border-[#C9A961]/50 font-bold">
                          Score: 30 – 60
                        </span>
                      </div>
                      <div className="space-y-0.5 text-[11px] text-[#D8D2C2]">
                        <p><strong>Environment:</strong> Coastal Chop &amp; Cross-Currents</p>
                        <p><strong>Significant Waves:</strong> 1.4m – 2.2m (Moderate Swell)</p>
                        <p><strong>Wind Velocity:</strong> 15 – 22 knots (Fresh Breeze)</p>
                        <p><strong>Buffer Range:</strong> 45 km Intermediate Radius</p>
                      </div>
                      <div className="text-[10px] text-[#C9A961] bg-[#C9A961]/15 p-1.5 rounded border border-[#C9A961]/30 font-semibold">
                        Advisory: Exercise heightened vigilance. Monitor VHF Marine Ch-16.
                      </div>
                    </div>
                  </Tooltip>
                </Circle>

                {/* HIGH RISK CONCENTRIC ZONE (CRITICAL CORE - 20 km) */}
                <Circle
                  center={centerCoords}
                  radius={20000}
                  pathOptions={{
                    color: '#B8543C',
                    fillColor: '#B8543C',
                    fillOpacity: 0.42,
                    weight: 2.5
                  }}
                  eventHandlers={{
                    mouseover: (e) => {
                      L.DomEvent.stopPropagation(e);
                      setHoveredZone({
                        name: 'High Risk Hazard Core',
                        level: 'High Risk',
                        score: 85,
                        factor: 'Severe Swell Convergence',
                        environment: 'Severe Swell Convergence Core',
                        waves: '2.6m – 3.8m (Rough Sea State)',
                        wind: '28 – 36 knots (Near Gale)',
                        radius: '20 km Inner Core',
                        advisory: 'Transit strictly discouraged. High risk of vessel wash/capsize.',
                        color: '#B8543C',
                        isHovered: true,
                        windVal: 84,
                        waveVal: 88,
                        rainVal: 75,
                        cycloneVal: 35,
                        currentVal: 72
                      });
                    },
                    mouseout: () => {}
                  }}
                >
                  <Tooltip sticky direction="auto" className="risk-tooltip-high">
                    <div className="space-y-1.5 max-w-[260px] text-xs">
                      <div className="flex items-center justify-between border-b border-[#B8543C]/40 pb-1">
                        <span className="font-bold text-[#B8543C] text-[11px] flex items-center gap-1">
                          🔴 High Risk Hazard Core
                        </span>
                        <span className="font-mono text-[9px] bg-[#0B1E2D] text-[#B8543C] px-1.5 py-0.5 rounded border border-[#B8543C]/50 font-bold">
                          Score: 60 – 100
                        </span>
                      </div>
                      <div className="space-y-0.5 text-[11px] text-[#D8D2C2]">
                        <p><strong>Environment:</strong> Severe Swell Convergence Core</p>
                        <p><strong>Significant Waves:</strong> 2.6m – 3.8m (Rough Sea State)</p>
                        <p><strong>Wind Velocity:</strong> 28 – 36 knots (Near Gale)</p>
                        <p><strong>Danger Radius:</strong> 20 km Inner Core</p>
                      </div>
                      <div className="text-[10px] text-[#B8543C] bg-[#B8543C]/15 p-1.5 rounded border border-[#B8543C]/30 font-semibold">
                        Advisory: Transit strictly discouraged. High risk of vessel wash/capsize.
                      </div>
                    </div>
                  </Tooltip>
                </Circle>

                {/* OFFSHORE SWELL EPICENTER MARKER */}
                <Marker 
                  position={centerCoords} 
                  icon={coreMarkerIcon}
                  eventHandlers={{
                    mouseover: (e) => {
                      L.DomEvent.stopPropagation(e);
                      setHoveredZone({
                        name: 'Swell Convergence Epicenter',
                        level: 'Critical Risk',
                        score: 94,
                        factor: 'Gale Force Epicenter',
                        environment: 'Extreme Swell Convergence & Heavy Breakers',
                        waves: '3.8m+ (Heavy Swell)',
                        wind: '36+ knots (Gale Force)',
                        radius: 'Zero-Point Epicenter',
                        advisory: 'DO_NOT_SAIL ZONE. Immediate severe danger to all sea craft.',
                        color: '#B8543C',
                        isHovered: true,
                        windVal: 95,
                        waveVal: 96,
                        rainVal: 90,
                        cycloneVal: 60,
                        currentVal: 85
                      });
                    }
                  }}
                >
                  <Tooltip direction="auto" offset={[0, -12]} className="risk-tooltip-high">
                    <div className="space-y-0.5 text-xs min-w-[170px]">
                      <div className="font-bold text-[#B8543C]">Offshore Swell Convergence Core</div>
                      <div className="text-[#D8D2C2] text-[11px]">Sustained Wind: {telemetryState.data?.wind?.speed || 14} kts</div>
                      <div className="text-[#8EA5B5] text-[11px]">Wave Swell: {telemetryState.data?.waves?.height || 1.2} m</div>
                      <div className="font-mono text-[#8EA5B5] text-[10px]">{centerCoords[0].toFixed(4)}° N, {centerCoords[1].toFixed(4)}° E</div>
                    </div>
                  </Tooltip>
                  <Popup>
                    <div className="p-1 font-sans text-xs">
                      <div className="font-bold text-[#B8543C]">Offshore Swell Convergence Core</div>
                      <div className="text-[#D8D2C2]">Sustained Wind: {telemetryState.data?.wind?.speed || 14} kts</div>
                    </div>
                  </Popup>
                </Marker>

                {/* ACTIVE STATION VESSEL MARKER */}
                <Marker 
                  position={vesselCoords} 
                  icon={vesselMarkerIcon}
                  eventHandlers={{
                    mouseover: (e) => {
                      L.DomEvent.stopPropagation(e);
                      setHoveredZone({
                        name: `${activeLocation.name} (Active Station)`,
                        level: baseLevel,
                        score: baseScore,
                        factor: (telemetryState.data?.wind?.speed || 14) > 15 ? 'Surface Wind' : 'Wave Swell',
                        environment: 'Mooring Fairway & Harbor Sector',
                        waves: `${telemetryState.data?.waves?.height ?? 1.2} m`,
                        wind: `${telemetryState.data?.wind?.speed ?? 14} kt`,
                        radius: 'Harbor Perimeter',
                        advisory: riskData.explainability || 'Normal operational fairway. Regular vigilance.',
                        color: baseScore > 60 ? '#B8543C' : (baseScore > 30 ? '#C9A961' : '#3E7C6B'),
                        isHovered: true,
                        windVal: windVal,
                        waveVal: waveVal,
                        rainVal: rainVal,
                        cycloneVal: 0,
                        currentVal: 25
                      });
                    }
                  }}
                >
                  <Tooltip direction="auto" offset={[0, -14]} className="risk-tooltip-low">
                    <div className="space-y-0.5 text-xs min-w-[150px]">
                      <div className="font-bold text-[#C9A961] flex items-center gap-1">
                        <span>🚢 Active Station</span>
                      </div>
                      <div className="text-[#D8D2C2] font-semibold">{activeLocation.name}</div>
                      <div className="font-mono text-[#8EA5B5] text-[10px]">{activeLocation.lat.toFixed(4)}° N, {activeLocation.lon.toFixed(4)}° E</div>
                      <div className="text-[#3E7C6B] text-[10px] font-semibold">Local Condition: {baseLevel} ({baseScore}/100)</div>
                    </div>
                  </Tooltip>
                  <Popup>
                    <div className="p-1 font-sans text-xs">
                      <div className="font-bold text-[#C9A961]">{activeLocation.name}</div>
                      <div className="text-[#8EA5B5]">
                        {activeLocation.lat.toFixed(4)}° N, {activeLocation.lon.toFixed(4)}° E
                      </div>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>

              {/* SEVERITY LEGEND OVERLAY */}
              <div className="absolute bottom-4 left-4 z-[400] bg-[#0B1E2D]/90 backdrop-blur-md border border-[#1E3F5A] text-[#D8D2C2] p-3 rounded-xl shadow-xl text-xs space-y-2 select-none min-w-[130px]">
                <p className="font-bold text-[11px] uppercase tracking-wider text-[#8EA5B5]">Risk Severity</p>
                <div className="space-y-1 text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#3E7C6B]"></span>
                    <span>Low (&lt;30)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#C9A961]"></span>
                    <span>Moderate (30-60)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#B8543C]"></span>
                    <span>High (&gt;60)</span>
                  </div>
                </div>
              </div>

              {/* ZOOM CONTROLS */}
              <div className="absolute bottom-4 right-4 z-[400] flex items-center gap-2">
                <button
                  onClick={() => setZoomInTrigger((p) => p + 1)}
                  className="w-7 h-7 bg-[#132C40] hover:bg-[#183852] text-[#D8D2C2] rounded-lg flex items-center justify-center font-bold text-sm border border-[#1E3F5A] shadow cursor-pointer transition-colors"
                >
                  +
                </button>
                <button
                  onClick={() => setZoomOutTrigger((p) => p + 1)}
                  className="w-7 h-7 bg-[#132C40] hover:bg-[#183852] text-[#D8D2C2] rounded-lg flex items-center justify-center font-bold text-sm border border-[#1E3F5A] shadow cursor-pointer transition-colors"
                >
                  -
                </button>
              </div>
            </div>
          </div>

          {/* BOTTOM 4-CARD METRICS ROW - TIED DYNAMICALLY TO HOVERED ZONE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-[#132C40] rounded-xl border border-[#1E3F5A] p-4 shadow-xs space-y-1">
              <p className="text-xs text-[#8EA5B5] font-medium">Assessed Risk Score</p>
              <div className="flex items-baseline justify-between pt-1">
                <p className="font-mono text-2xl font-bold text-[#D8D2C2]">
                  {isLoading ? '...' : activeScore} <span className="text-xs font-normal text-[#8EA5B5]">/100</span>
                </p>
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                  activeScore > 60 ? 'bg-[#B8543C]/20 text-[#B8543C] border-[#B8543C]/40' :
                  activeScore > 30 ? 'bg-[#C9A961]/20 text-[#C9A961] border-[#C9A961]/40' :
                  'bg-[#3E7C6B]/20 text-[#3E7C6B] border-[#3E7C6B]/40'
                }`}>
                  {activeLevel}
                </span>
              </div>
            </div>

            <div className="bg-[#132C40] rounded-xl border border-[#1E3F5A] p-4 shadow-xs space-y-1">
              <p className="text-xs text-[#8EA5B5] font-medium">Dominant Risk Factor</p>
              <div className="flex items-center gap-2 pt-1">
                <Wind className="w-4 h-4 text-[#C9A961] shrink-0" />
                <p className="font-bold text-xs text-[#D8D2C2] truncate">
                  {activeZone.factor || 'Surface Wind'}
                </p>
              </div>
            </div>

            <div className="bg-[#132C40] rounded-xl border border-[#1E3F5A] p-4 shadow-xs space-y-1">
              <p className="text-xs text-[#8EA5B5] font-medium">Risk Trend</p>
              <div className={`flex items-center gap-2 pt-1 font-bold text-xs ${activeScore > 60 ? 'text-[#B8543C]' : 'text-[#3E7C6B]'}`}>
                <TrendingUp className="w-4 h-4 shrink-0" />
                <span>{activeScore > 60 ? 'Elevated Warning' : 'Stable Fairway'}</span>
              </div>
            </div>

            <div className="bg-[#132C40] rounded-xl border border-[#1E3F5A] p-4 shadow-xs space-y-1">
              <p className="text-xs text-[#8EA5B5] font-medium">Assessed Sector</p>
              <div className="flex items-center gap-2 pt-1 text-[#D8D2C2] font-medium text-xs">
                <MapPin className="w-4 h-4 text-[#C9A961] shrink-0" />
                <div className="min-w-0">
                  <p className="font-semibold text-[#D8D2C2] truncate max-w-[130px]" title={activeZone.name}>{activeZone.name}</p>
                  <p className="font-mono text-[11px] text-[#8EA5B5]">{activeLocation.lat.toFixed(2)}°, {activeLocation.lon.toFixed(2)}°</p>
                </div>
              </div>
            </div>
          </div>

          {/* INTERACTIVE SECTOR RISK EVALUATION MATRIX (HOVER OR CLICK TO INSPECT ON GAUGE METER) */}
          <div className="bg-[#132C40] rounded-xl border border-[#1E3F5A] shadow-card overflow-hidden">
            <div className="px-4 py-3 border-b border-[#1E3F5A] flex items-center justify-between bg-[#0B1E2D]/60">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-[#C9A961]" />
                <h3 className="font-sans font-bold text-xs text-[#D8D2C2] uppercase tracking-wider">
                  Sector Risk Evaluation Matrix (Hover to inspect on meter)
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {activeZone.isHovered && (
                  <button
                    onClick={() => setHoveredZone(null)}
                    className="text-[10px] font-mono text-[#C9A961] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <RotateCcw className="w-2.5 h-2.5" />
                    Reset Baseline
                  </button>
                )}
                <span className="text-[10px] font-mono text-[#8EA5B5]">
                  5 Monitored Sectors
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#1E3F5A] bg-[#0B1E2D]/90 text-[#8EA5B5] font-mono text-[11px]">
                    <th className="py-2.5 px-4">Sector / Zone</th>
                    <th className="py-2.5 px-3">Risk Rating</th>
                    <th className="py-2.5 px-3">Score</th>
                    <th className="py-2.5 px-3">Wave Swell</th>
                    <th className="py-2.5 px-3">Wind Velocity</th>
                    <th className="py-2.5 px-4">Navigation Advisory</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E3F5A]/60">
                  {monitoredSectors.map((sector) => {
                    const isSelected = activeZone.id === sector.id || (activeZone.name && activeZone.name.includes(sector.name.split(' ')[0]));
                    return (
                      <tr
                        key={sector.id}
                        onMouseEnter={() => setHoveredZone(sector)}
                        onClick={() => setHoveredZone(sector)}
                        className={`transition-colors cursor-pointer ${
                          isSelected ? 'bg-[#183852] text-white font-semibold' : 'hover:bg-[#183852]/60 text-[#D8D2C2]'
                        }`}
                      >
                        <td className="py-3 px-4 flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: sector.color }}
                          />
                          <div>
                            <div className="font-semibold text-xs text-[#D8D2C2]">{sector.name}</div>
                            <div className="text-[10px] font-mono text-[#8EA5B5]">{sector.radius}</div>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className="px-2 py-0.5 rounded text-[10px] font-bold border"
                            style={{
                              color: sector.color,
                              borderColor: `${sector.color}66`,
                              backgroundColor: `${sector.color}22`
                            }}
                          >
                            {sector.level}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono font-bold" style={{ color: sector.color }}>
                          {sector.score} <span className="text-[10px] font-normal text-[#8EA5B5]">/100</span>
                        </td>
                        <td className="py-3 px-3 font-mono text-[#D8D2C2]">{sector.waves}</td>
                        <td className="py-3 px-3 font-mono text-[#D8D2C2]">{sector.wind}</td>
                        <td className="py-3 px-4">
                          <div className="text-[11px] text-[#D8D2C2] max-w-[260px] truncate" title={sector.advisory}>
                            {sector.advisory}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: RISK SUMMARY GAUGE & CONTRIBUTORS PANEL (4 COLS) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#132C40] rounded-xl border border-[#1E3F5A] shadow-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-sm text-[#D8D2C2]">
                Safety Risk Summary
              </h2>
              {activeZone.isHovered ? (
                <div className="flex items-center gap-1.5">
                  <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full border border-[#C9A961]/40 bg-[#C9A961]/15 text-[#C9A961] animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C9A961]" />
                    Inspecting Zone
                  </span>
                  <button 
                    onClick={() => setHoveredZone(null)} 
                    title="Reset to Station Baseline"
                    className="text-[#8EA5B5] hover:text-[#D8D2C2] p-1 rounded hover:bg-[#183852] cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <span className="text-[10px] font-mono text-[#8EA5B5]">
                  Station Baseline
                </span>
              )}
            </div>

            {/* SEMICIRCULAR GAUGE METER */}
            <div className="flex flex-col items-center justify-center pt-2">
              <div className="relative w-44 h-24 flex items-center justify-center group cursor-pointer">
                <svg className="w-44 h-44 -rotate-180" viewBox="0 0 100 100">
                  {/* BACKGROUND TRACK */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#1E3F5A"
                    strokeWidth="10"
                    strokeDasharray="125.6 251.2"
                    strokeLinecap="round"
                  />
                  {/* DYNAMIC COLORED ARC */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="url(#admiraltyRiskGradient)"
                    strokeWidth="10"
                    strokeDasharray={`${arcFill} 251.2`}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dasharray 0.4s ease-out' }}
                  />
                  <defs>
                    <linearGradient id="admiraltyRiskGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3E7C6B" />
                      <stop offset="50%" stopColor="#C9A961" />
                      <stop offset="100%" stopColor="#B8543C" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* CENTER METER SCORE VALUE */}
                <div className="absolute top-8 flex flex-col items-center justify-center text-center">
                  <span className="font-mono text-3xl font-extrabold leading-none" style={{ color: activeZone.color }}>
                    {isLoading ? '...' : activeScore}
                  </span>
                  <span className="text-[11px] font-mono text-[#8EA5B5] font-medium mt-0.5">
                    /100
                  </span>
                </div>

                {/* Hover tooltip showing breakdown */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 translate-y-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                  <div className="bg-[#0B1E2D] text-[#D8D2C2] text-[11px] rounded-lg px-3 py-2 shadow-xl border border-[#1E3F5A] min-w-[210px] space-y-1">
                    <div className="font-bold text-[#C9A961] text-xs border-b border-[#1E3F5A] pb-1 mb-1">
                      {activeZone.name}
                    </div>
                    <div className="flex justify-between"><span className="text-[#8EA5B5]">Wind Velocity:</span><span className="font-mono font-bold text-[#D8D2C2]">{activeZone.wind}</span></div>
                    <div className="flex justify-between"><span className="text-[#8EA5B5]">Wave Swell:</span><span className="font-mono font-bold text-[#D8D2C2]">{activeZone.waves}</span></div>
                    <div className="flex justify-between"><span className="text-[#8EA5B5]">Radius Range:</span><span className="font-mono font-bold text-[#D8D2C2]">{activeZone.radius}</span></div>
                    <div className="flex justify-between border-t border-[#1E3F5A] pt-1 mt-1">
                      <span className="text-[#8EA5B5]">Risk Rating:</span>
                      <span className="font-mono font-bold" style={{ color: activeZone.color }}>{activeScore}/100 ({activeLevel})</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* RATING STATUS AND INSPECTED ZONE NAME */}
              <p className="font-bold text-sm mt-2 text-center" style={{ color: activeZone.color }}>
                {activeLevel}
              </p>
              <p className="text-[11px] text-[#8EA5B5] text-center font-medium mt-0.5 max-w-[220px] truncate" title={activeZone.name}>
                {activeZone.name}
              </p>
            </div>
          </div>

          {/* TELEMETRY RISK CONTRIBUTORS PANEL */}
          <div className="bg-[#132C40] rounded-xl border border-[#1E3F5A] shadow-card p-5 space-y-3.5">
            <h2 className="font-bold text-sm text-[#D8D2C2]">
              Telemetry Risk Contributors
            </h2>

            <div className="space-y-3 text-xs">
              {riskContributors.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="space-y-1 group/bar relative cursor-pointer">
                    <div className="flex items-center justify-between text-[#D8D2C2] font-semibold">
                      <div className="flex items-center gap-2">
                        <Icon className="w-3.5 h-3.5 text-[#C9A961]" />
                        <span>{item.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[#8EA5B5] text-[10px] opacity-0 group-hover/bar:opacity-100 transition-opacity">{item.rawValue}</span>
                        <span className="font-mono text-[#D8D2C2]">{item.value}%</span>
                      </div>
                    </div>

                    <div className="w-full bg-[#0B1E2D] rounded-full h-2 overflow-hidden border border-[#1E3F5A]">
                      <div
                        className={`h-full rounded-full ${item.color}`}
                        style={{ width: `${item.value}%`, transition: 'width 0.4s ease-out' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* OPERATIONAL ADVISORY */}
          <div className="bg-[#132C40] rounded-xl border border-[#1E3F5A] shadow-card p-4 space-y-2">
            <h3 className="font-bold text-xs text-[#C9A961] uppercase tracking-wider">
              Operational Advisory
            </h3>
            <p className="text-xs text-[#D8D2C2] leading-relaxed">
              {activeZone.advisory}
            </p>
          </div>

          {/* SAFETY PROTOCOL CHECKLIST */}
          <div className="bg-[#132C40] rounded-xl border border-[#1E3F5A] shadow-card p-4 space-y-3">
            <h3 className="font-bold text-xs text-[#D8D2C2] uppercase tracking-wider">
              Safety Protocol Checklist
            </h3>

            <div className="space-y-2 text-xs text-[#D8D2C2]">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#3E7C6B] shrink-0 mt-0.5" />
                <span>Verify VHF channel 16 communication</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#3E7C6B] shrink-0 mt-0.5" />
                <span>Check live geofences before entering deep water</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#3E7C6B] shrink-0 mt-0.5" />
                <span>Maintain safe distance from restricted anchorage zones</span>
              </div>
            </div>
          </div>

          {/* GENERATE SAFE WAYPOINT ROUTE CTA - DOMINANT BRASS ACCENT (#C9A961) */}
          <button
            onClick={() => navigate('/safe-routes')}
            className="w-full flex items-center justify-center gap-2 bg-[#C9A961] hover:bg-[#B89750] text-[#0B1E2D] font-bold text-xs py-3 rounded-xl shadow-md transition-all cursor-pointer"
          >
            <Send className="w-4 h-4 rotate-45" />
            <span>Generate Safe Waypoint Route</span>
          </button>
        </div>
      </div>
      </div>
    </div>
  );
}
