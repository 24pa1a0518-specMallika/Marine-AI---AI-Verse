import React, { useState, useEffect } from 'react';
import { Waves, Eye, EyeOff, Layers, MapPin, RefreshCw, Compass, Sliders, Calendar } from 'lucide-react';
import { getCurrentsGrid, predictCurrents } from '../api/currentsApi';
import CurrentVectorMap from '../components/currents/CurrentVectorMap';
import { useLocation } from '../context/LocationContext';

export default function CurrentsMapPage() {
  const { selectedLocation, presets, setSelectedLocationByName } = useLocation();

  const [currents, setCurrents] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Layer Visibility Controls
  const [showObservations, setShowObservations] = useState(true);
  const [showPredictions, setShowPredictions] = useState(true);

  const activeLoc = {
    lat: selectedLocation?.lat ?? 16.98,
    lon: selectedLocation?.lon ?? 82.24,
    name: selectedLocation?.name ?? 'Kakinada Coast'
  };

  const loadMapData = async () => {
    setLoading(true);
    try {
      const gridRes = await getCurrentsGrid({ limit: 250 });
      const rawGrid = gridRes?.data?.data || gridRes?.data || [];
      const gridData = Array.isArray(rawGrid) ? rawGrid : [];

      // Generate predictions for a subset of grid cells
      const predRes = await predictCurrents({ latitude: activeLoc.lat, longitude: activeLoc.lon });
      const predData = predRes.prediction ? [{
        latitude: activeLoc.lat,
        longitude: activeLoc.lon,
        u: predRes.prediction.u,
        v: predRes.prediction.v,
        speed: predRes.prediction.speed,
        direction: predRes.prediction.direction,
        source: 'RF Regressor Model'
      }] : [];

      setCurrents(gridData);
      setPredictions(predData);
    } catch (err) {
      console.error('Error loading current map layers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMapData();
  }, [activeLoc.lat, activeLoc.lon]);

  return (
    <div className="max-w-[1680px] mx-auto space-y-5">
      {/* MAP HEADER */}
      <div className="bg-[#091D2C] border border-[#1E3F5A] rounded-2xl p-5 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#C9A961] mb-1">
            <Waves className="w-4 h-4" />
            <span className="uppercase font-bold tracking-widest">GEOSPATIAL VECTOR MAP</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#D8D2C2] tracking-tight">Ocean Current GIS &amp; Severity Heatmap</h1>
          <p className="text-xs text-[#8EA5B5] mt-1">
            Interactive GIS map with data-driven severity heatmaps, directional velocity vectors ($u, v$), current speed ramps, and RF model forecasts.
          </p>
        </div>

        {/* REGION & LAYER CONTROLS */}
        <div className="flex flex-wrap items-center gap-3">
          {/* LOCATION SELECTOR */}
          <div className="flex items-center gap-1.5 bg-[#0F2436] border border-[#1E3F5A] px-3 py-1.5 rounded-xl text-xs font-mono text-[#D8D2C2]">
            <MapPin className="w-3.5 h-3.5 text-[#C9A961]" />
            <select
              value={selectedLocation?.name || presets[0].name}
              onChange={(e) => setSelectedLocationByName(e.target.value)}
              className="bg-transparent font-bold text-[#D8D2C2] focus:outline-none cursor-pointer"
            >
              {presets.map(p => (
                <option key={p.name} value={p.name} className="bg-[#0B1E2D]">{p.name}</option>
              ))}
            </select>
          </div>

          {/* OBSERVATIONS TOGGLE */}
          <button
            onClick={() => setShowObservations(!showObservations)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
              showObservations ? 'bg-[#00F5D4]/20 border-[#00F5D4] text-[#00F5D4]' : 'bg-[#0F2436] border-[#1E3F5A] text-[#8EA5B5]'
            }`}
          >
            {showObservations ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>Observations</span>
          </button>

          {/* PREDICTIONS TOGGLE */}
          <button
            onClick={() => setShowPredictions(!showPredictions)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
              showPredictions ? 'bg-[#C9A961]/20 border-[#C9A961] text-[#C9A961]' : 'bg-[#0F2436] border-[#1E3F5A] text-[#8EA5B5]'
            }`}
          >
            {showPredictions ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>Predictions</span>
          </button>

          <button
            onClick={loadMapData}
            className="p-2 bg-[#0F2436] hover:bg-[#1E3F5A] text-[#8EA5B5] hover:text-white border border-[#1E3F5A] rounded-xl transition-all cursor-pointer"
            title="Refresh Map Layers"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#C9A961]' : ''}`} />
          </button>
        </div>
      </div>

      {/* FULL LEAFLET VECTOR MAP WITH DATA-DRIVEN HEATMAP OVERLAY */}
      <CurrentVectorMap
        currents={currents}
        predictions={predictions}
        location={activeLoc}
        showObservations={showObservations}
        showPredictions={showPredictions}
        loading={loading}
      />
    </div>
  );
}
