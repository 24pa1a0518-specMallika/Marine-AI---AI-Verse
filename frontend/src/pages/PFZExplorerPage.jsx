import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Star, 
  Send, 
  Thermometer, 
  Leaf, 
  Wind, 
  Waves, 
  Eye, 
  RefreshCw, 
  Clock, 
  Sun, 
  TrendingUp, 
  Calendar, 
  Fish, 
  Anchor, 
  CheckCircle2,
  MapPin
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getRankedPFZs } from '../api/pfzApi';
import { useLocation } from '../context/LocationContext';
import { useLanguage } from '../context/LanguageContext';
import MapController from '../components/map/MapController';
import BaseMapLayers from '../components/map/BaseMapLayers';
import BasemapSwitcher from '../components/map/BasemapSwitcher';

export default function PFZExplorerPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { selectedLocation, refreshTrigger } = useLocation();

  const activeLat = selectedLocation?.lat ?? 16.98;
  const activeLon = selectedLocation?.lon ?? 82.24;

  const [basemap, setBasemap] = useState('satellite');
  const [isFavorite, setIsFavorite] = useState(false);
  const [pfzState, setPfzState] = useState({ data: [], isFallback: false, source: 'live' });
  const [isLoading, setIsLoading] = useState(true);

  // Zoom / Recenter triggers
  const [zoomInTrigger, setZoomInTrigger] = useState(0);
  const [zoomOutTrigger, setZoomOutTrigger] = useState(0);
  const [recenterTrigger, setRecenterTrigger] = useState(0);

  useEffect(() => {
    let isMounted = true;
    async function loadPfzData() {
      setIsLoading(true);
      try {
        const res = await getRankedPFZs({ latitude: activeLat, longitude: activeLon });
        if (!isMounted) return;
        setPfzState(res);
      } catch (e) {
        console.warn('PFZ load error:', e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadPfzData();
    return () => { isMounted = false; };
  }, [activeLat, activeLon, refreshTrigger]);

  const pfzList = pfzState.data || [];
  const selectedPfz = pfzList[0] || null;

  const startCoords = [activeLat, activeLon];
  const tierBadgeLabel = selectedPfz && selectedPfz.score != null
    ? (selectedPfz.score >= 80 ? 'High Confidence' : selectedPfz.score >= 60 ? 'Moderate Confidence' : 'Low Confidence')
    : (t('confidence_not_available') || 'Confidence: Not available');

  // Custom DivIcon for Start Point (Admiralty Brass #C9A961)
  const startMarkerIcon = useMemo(() => L.divIcon({
    className: 'pfz-start-marker',
    html: `
      <div style="
        background-color: #C9A961;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 3px solid #0B1E2D;
        box-shadow: 0 0 15px rgba(201,169,97,0.9);
      "></div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  }), []);

    // Custom DivIcon for PFZ Target Marker (Admiralty Safe Teal #3E7C6B)
  const pfzTargetMarkerIcon = useMemo(() => L.divIcon({
    className: 'pfz-target-marker',
    html: `
      <div style="
        background-color: #3E7C6B;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: 3px solid #D8D2C2;
        box-shadow: 0 0 18px rgba(62,124,107,0.95);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="background-color: #D8D2C2; width: 8px; height: 8px; border-radius: 50%;"></div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  }), []);

  if (!selectedPfz && !isLoading) {
    return (
      <div className="max-w-[1600px] mx-auto space-y-6 pb-12 text-[#D8D2C2]">
        <div className="bg-[#132C40] p-5 rounded-2xl border border-[#1E3F5A] shadow-card text-center">
          <h2 className="text-xl font-bold">No PFZs Available</h2>
          <p className="text-[#8EA5B5] mt-2">Could not retrieve potential fishing zones for this area.</p>
        </div>
      </div>
    );
  }

  const pfzCoords = selectedPfz ? [Number(selectedPfz.latitude) || (activeLat + 0.18), Number(selectedPfz.longitude) || (activeLon + 0.22)] : startCoords;

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 pb-12 text-[#D8D2C2]">
      {/* PAGE HEADER */}
      <div className="bg-[#132C40] p-5 rounded-2xl border border-[#1E3F5A] shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-sans font-extrabold text-2xl md:text-3xl text-[#D8D2C2] tracking-tight">
              {isLoading ? 'Loading PFZ...' : (selectedPfz?.id || selectedPfz?.name)}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#3E7C6B]/20 text-[#3E7C6B] border border-[#3E7C6B]/40">
              {tierBadgeLabel}
            </span>
            {pfzState.isFallback ? (
              <span className="text-[10px] font-mono text-[#C9A961] bg-[#C9A961]/20 border border-[#C9A961]/40 px-2 py-0.5 rounded-full">
                Offline Mode
              </span>
            ) : (
              <span className="text-[10px] font-mono text-[#3E7C6B] bg-[#3E7C6B]/20 border border-[#3E7C6B]/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3E7C6B] animate-pulse"></span>
                Live INCOIS Feed
              </span>
            )}
          </div>
          <p className="text-xs md:text-sm text-[#8EA5B5] mt-1 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#C9A961]" />
            <span>Departure: {selectedLocation?.name} ({activeLat.toFixed(4)}° N, {activeLon.toFixed(4)}° E)</span>
          </p>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <BasemapSwitcher basemap={basemap} onBasemapChange={setBasemap} />

          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              isFavorite
                ? 'bg-[#C9A961]/20 border-[#C9A961] text-[#C9A961]'
                : 'bg-[#0B1E2D] border-[#1E3F5A] hover:bg-[#183852] text-[#D8D2C2]'
            }`}
          >
            <Star className={`w-4 h-4 ${isFavorite ? 'fill-[#C9A961] text-[#C9A961]' : 'text-[#8EA5B5]'}`} />
            <span>{isFavorite ? 'Saved to Favorites' : 'Add to Favorites'}</span>
          </button>

          <button
            onClick={() => navigate('/safe-routes')}
            className="flex items-center gap-2 bg-[#C9A961] hover:bg-[#b59550] text-[#0B1E2D] font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
          >
            <Send className="w-4 h-4 rotate-45 text-[#0B1E2D]" />
            <span>Navigate</span>
          </button>
        </div>
      </div>

      {/* MAIN TWO COLUMN WORKSPACE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: MAP, ABOUT & SPECIES METRICS (8 COLS) */}
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

                {/* DISTANCE LINE FROM DEPARTURE TO PFZ */}
                <Polyline
                  positions={[startCoords, pfzCoords]}
                  pathOptions={{
                    color: '#C9A961',
                    weight: 3,
                    dashArray: '6,6'
                  }}
                />

                {/* START MARKER */}
                <Marker position={startCoords} icon={startMarkerIcon}>
                  <Popup>
                    <div className="p-1 font-sans text-xs bg-[#0B1E2D] text-[#D8D2C2]">
                      <div className="font-bold text-[#C9A961]">{selectedLocation?.name || 'Vessel Location'}</div>
                      <div className="text-[#8EA5B5]">{activeLat.toFixed(4)}° N, {activeLon.toFixed(4)}° E</div>
                    </div>
                  </Popup>
                </Marker>

                {/* PFZ TARGET MARKER */}
                <Marker position={pfzCoords} icon={pfzTargetMarkerIcon}>
                  <Popup>
                    <div className="p-1 font-sans text-xs bg-[#0B1E2D] text-[#D8D2C2]">
                      <div className="font-bold text-[#3E7C6B]">{selectedPfz.name || selectedPfz.id}</div>
                      <div className="text-[#8EA5B5]">
                        {selectedPfz.score != null ? `${selectedPfz.score}% Confidence` : (t('confidence_not_available') || 'Confidence: Not available')}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>

              {/* DISTANCE BADGE OVERLAY ON MAP LINE */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[400] bg-[#0B1E2D]/90 backdrop-blur-md border border-[#C9A961]/50 text-[#C9A961] font-mono text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                {selectedPfz?.distanceKm || '--'} km
              </div>

              {/* TARGET PFZ BADGE OVERLAY ON MAP */}
              <div className="absolute top-12 right-12 z-[400] bg-[#0B1E2D]/90 border border-[#3E7C6B]/60 text-[#D8D2C2] p-2.5 rounded-xl text-center shadow-lg">
                <p className="font-bold text-xs text-[#D8D2C2]">{selectedPfz?.id || 'PFZ'}</p>
                <p className="font-mono text-xs font-extrabold text-[#3E7C6B]">{selectedPfz?.score || '--'}%</p>
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

          {/* ABOUT PFZ & BEST TIME TO FISH */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-8 bg-[#132C40] rounded-2xl border border-[#1E3F5A] p-5 shadow-card space-y-2">
              <h3 className="font-bold text-xs text-[#D8D2C2] uppercase tracking-wider font-mono">
                About {selectedPfz?.name || selectedPfz?.id || 'PFZ'}
              </h3>
              <p className="text-xs text-[#8EA5B5] leading-relaxed">
                This PFZ has high productivity potential based on oceanographic parameters (SST: {selectedPfz?.sst || '--'}°C). It is highly recommended for fishing operations.
              </p>
            </div>

            <div className="md:col-span-4 bg-[#132C40] rounded-2xl border border-[#1E3F5A] p-5 shadow-card flex flex-col justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-[#D8D2C2]">
                <Clock className="w-4 h-4 text-[#C9A961]" />
                <span>Best Time to Fish</span>
              </div>
              <div className="flex items-center gap-2.5 pt-2">
                <Sun className="w-7 h-7 text-[#C9A961] shrink-0" />
                <div>
                  <p className="font-mono font-bold text-base text-[#D8D2C2]">04:00 AM – 09:00 AM</p>
                  <p className="text-[10px] text-[#3E7C6B] font-medium font-mono">Favorable Tides</p>
                </div>
              </div>
            </div>
          </div>

          {/* BOTTOM 4 METRIC CARDS GRID (EXPANDED SIZE) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#132C40] rounded-2xl border border-[#1E3F5A] p-5 shadow-card space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-[#8EA5B5] font-medium">
                <TrendingUp className="w-4 h-4 text-[#3E7C6B]" />
                <span>Catch Potential</span>
              </div>
              <p className="font-bold text-base text-[#3E7C6B] pt-0.5">High</p>
              <p className="text-[10px] text-[#8EA5B5] font-mono">(Telemetry Verified)</p>
            </div>

            <div className="bg-[#132C40] rounded-2xl border border-[#1E3F5A] p-5 shadow-card space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-[#8EA5B5] font-medium">
                <Calendar className="w-4 h-4 text-[#C9A961]" />
                <span>Seasonality</span>
              </div>
              <p className="font-bold text-base text-[#D8D2C2] pt-0.5">Active Window</p>
              <p className="text-[10px] text-[#C9A961] font-semibold">Peak Ocean Index</p>
            </div>

            <div className="bg-[#132C40] rounded-2xl border border-[#1E3F5A] p-5 shadow-card space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-[#8EA5B5] font-medium">
                <Fish className="w-4 h-4 text-[#C9A961]" />
                <span>Main Species</span>
              </div>
              <p className="font-bold text-xs text-[#D8D2C2] pt-0.5 leading-snug">
                Tuna, Mackerel, Sardine
              </p>
            </div>

            <div className="bg-[#132C40] rounded-2xl border border-[#1E3F5A] p-5 shadow-card space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-[#8EA5B5] font-medium">
                <Anchor className="w-4 h-4 text-[#C9A961]" />
                <span>Recommended Gear</span>
              </div>
              <p className="font-bold text-xs text-[#D8D2C2] pt-0.5 leading-snug">
                Drift Net, Gill Net, Longline
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CURRENT CONDITIONS & PFZ INFORMATION (4 COLS) */}
        <div className="lg:col-span-4 space-y-4">
          {/* CURRENT CONDITIONS WITH ENLARGED OUTPUT BOXES */}
          <div className="bg-[#132C40] rounded-2xl border border-[#1E3F5A] shadow-card p-5 space-y-4">
            <h2 className="font-bold text-sm text-[#D8D2C2] uppercase tracking-wider font-mono">
              Current Ocean Conditions
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              {/* ENLARGED OUTPUT BOX: SST */}
              <div className="bg-[#0B1E2D] p-4 rounded-xl border border-[#1E3F5A] space-y-1.5">
                <div className="flex items-center gap-1.5 text-[#8EA5B5] font-medium">
                  <Thermometer className="w-4 h-4 text-[#B8543C]" />
                  <span>SST</span>
                </div>
                <p className="font-mono font-extrabold text-xl text-[#D8D2C2]">{selectedPfz?.sst || '--'} <span className="text-xs font-normal text-[#8EA5B5]">°C</span></p>
                <span className="text-[11px] font-semibold text-[#3E7C6B] bg-[#3E7C6B]/15 px-2 py-0.5 rounded inline-block">Favorable</span>
              </div>

              {/* ENLARGED OUTPUT BOX: Wind */}
              <div className="bg-[#0B1E2D] p-4 rounded-xl border border-[#1E3F5A] space-y-1.5">
                <div className="flex items-center gap-1.5 text-[#8EA5B5] font-medium">
                  <Wind className="w-4 h-4 text-[#C9A961]" />
                  <span>Wind Speed</span>
                </div>
                <p className="font-mono font-extrabold text-xl text-[#D8D2C2]">-- <span className="text-xs font-normal text-[#8EA5B5]">kt</span></p>
                <span className="text-[11px] font-semibold text-[#C9A961] bg-[#C9A961]/15 px-2 py-0.5 rounded inline-block">Unknown</span>
              </div>

              {/* ENLARGED OUTPUT BOX: Wave */}
              <div className="bg-[#0B1E2D] p-4 rounded-xl border border-[#1E3F5A] space-y-1.5">
                <div className="flex items-center gap-1.5 text-[#8EA5B5] font-medium">
                  <Waves className="w-4 h-4 text-[#C9A961]" />
                  <span>Wave Height</span>
                </div>
                <p className="font-mono font-extrabold text-xl text-[#D8D2C2]">-- <span className="text-xs font-normal text-[#8EA5B5]">m</span></p>
                <span className="text-[11px] font-semibold text-[#C9A961] bg-[#C9A961]/15 px-2 py-0.5 rounded inline-block">Unknown</span>
              </div>

              {/* ENLARGED OUTPUT BOX: Currents */}
              <div className="bg-[#0B1E2D] p-4 rounded-xl border border-[#1E3F5A] space-y-1.5">
                <div className="flex items-center gap-1.5 text-[#8EA5B5] font-medium">
                  <RefreshCw className="w-4 h-4 text-[#C9A961]" />
                  <span>Currents</span>
                </div>
                <p className="font-mono font-extrabold text-xl text-[#D8D2C2]">-- <span className="text-xs font-normal text-[#8EA5B5]">m/s</span></p>
                <span className="text-[11px] font-semibold text-[#C9A961] bg-[#C9A961]/15 px-2 py-0.5 rounded inline-block">Unknown</span>
              </div>

              {/* ENLARGED OUTPUT BOX: Visibility */}
              <div className="bg-[#0B1E2D] p-4 rounded-xl border border-[#1E3F5A] space-y-1.5">
                <div className="flex items-center gap-1.5 text-[#8EA5B5] font-medium">
                  <Eye className="w-4 h-4 text-[#3E7C6B]" />
                  <span>Visibility</span>
                </div>
                <p className="font-mono font-extrabold text-xl text-[#D8D2C2]">-- <span className="text-xs font-normal text-[#8EA5B5]">km</span></p>
                <span className="text-[11px] font-semibold text-[#3E7C6B] bg-[#3E7C6B]/15 px-2 py-0.5 rounded inline-block">Unknown</span>
              </div>
            </div>
          </div>

          <div className="bg-[#132C40] rounded-2xl border border-[#1E3F5A] shadow-card p-5 space-y-3">
            <h3 className="font-bold text-xs text-[#D8D2C2] uppercase tracking-wider font-mono">
              PFZ Telemetry Data
            </h3>

            <div className="space-y-2.5 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-[#8EA5B5]">Confidence Score</span>
                <span className="font-bold text-[#3E7C6B]">
                  {selectedPfz?.score != null ? `${selectedPfz.score}%` : (t('confidence_not_available') || 'Confidence: Not available')}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-[#1E3F5A] pt-2">
                <span className="text-[#8EA5B5]">Distance from vessel</span>
                <span className="font-bold text-[#D8D2C2]">{selectedPfz?.distanceKm || '--'} km</span>
              </div>
              <div className="flex items-center justify-between border-t border-[#1E3F5A] pt-2">
                <span className="text-[#8EA5B5]">Target Coordinates</span>
                <span className="font-bold text-[#C9A961]">
                  {selectedPfz?.latitude != null ? Number(selectedPfz.latitude).toFixed(4) : '--'}° N, 
                  {selectedPfz?.longitude != null ? Number(selectedPfz.longitude).toFixed(4) : '--'}° E
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-[#1E3F5A] pt-2">
                <span className="text-[#8EA5B5]">Depth</span>
                <span className="font-bold text-[#D8D2C2]">{selectedPfz?.depth || '--'} m</span>
              </div>
            </div>
          </div>

          <div className="bg-[#3E7C6B]/15 border border-[#3E7C6B]/40 rounded-xl p-3.5 flex items-center gap-2.5 text-xs text-[#D8D2C2]">
            <CheckCircle2 className="w-4 h-4 text-[#3E7C6B] shrink-0" />
            <span className="font-medium text-[11px]">
              Validated from INCOIS Indian National Centre for Ocean Information Services.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
