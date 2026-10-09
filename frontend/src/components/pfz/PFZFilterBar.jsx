import React, { useState } from 'react';
import { SlidersHorizontal, Anchor, Compass, Thermometer, Activity, ArrowUpDown, Filter } from 'lucide-react';

export default function PFZFilterBar({ onFilterChange }) {
  const [anchor, setAnchor] = useState('Kakinada 16.98°N');
  const [radius, setRadius] = useState('50');
  const [minSuitability, setMinSuitability] = useState('60');
  const [distanceCutoff, setDistanceCutoff] = useState('60.0');
  const [sstWindow, setSstWindow] = useState('26.0 - 30.0');
  const [chlorophyllMin, setChlorophyllMin] = useState('1.0');
  const [sortBy, setSortBy] = useState('suitability');

  const handleUpdate = (type, val) => {
    if (type === 'anchor') setAnchor(val);
    if (type === 'radius') setRadius(val);
    if (type === 'minSuitability') setMinSuitability(val);
    if (type === 'distanceCutoff') setDistanceCutoff(val);
    if (type === 'sstWindow') setSstWindow(val);
    if (type === 'chlorophyllMin') setChlorophyllMin(val);
    if (type === 'sortBy') setSortBy(val);

    if (onFilterChange) {
      onFilterChange({ anchor, radius, minSuitability, distanceCutoff, sstWindow, chlorophyllMin, sortBy, [type]: val });
    }
  };

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card p-5 space-y-4">
      {/* HEADER WITH UNIFORM MONOSPACED HEADING */}
      <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2.5">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[#1363DF]" />
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-700">
            Hydrographic & Spatial Calibration Filter
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs font-mono text-[#00B4D8] bg-[#00B4D8]/10 px-2.5 py-0.5 rounded-full border border-[#00B4D8]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00B4D8] animate-pulse"></span>
            OceanSat-3 & Sentinel-3 Flow Active
          </span>
        </div>
      </div>

      {/* FILTER CONTROLS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
        {/* REFERENCE ANCHOR */}
        <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg space-y-1">
          <label className="text-[10px] font-mono text-slate-400 uppercase font-semibold flex items-center gap-1">
            <Anchor className="w-3 h-3 text-[#1363DF]" /> Anchor
          </label>
          <select 
            value={anchor} 
            onChange={(e) => handleUpdate('anchor', e.target.value)}
            className="w-full bg-transparent font-mono font-medium text-slate-800 focus:outline-none cursor-pointer truncate"
          >
            <option value="Kakinada 16.98°N">⚓ Kakinada 16.98°N</option>
            <option value="Vizag Port 17.68°N">⚓ Vizag Port 17.68°N</option>
            <option value="Machilipatnam 16.18°N">⚓ Machilipatnam 16.18°N</option>
            <option value="Chennai 13.08°N">⚓ Chennai 13.08°N</option>
          </select>
        </div>

        {/* RADIUS */}
        <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg space-y-1">
          <label className="text-[10px] font-mono text-slate-400 uppercase font-semibold flex items-center gap-1">
            <Compass className="w-3 h-3 text-[#1363DF]" /> Radius
          </label>
          <select
            value={radius}
            onChange={(e) => handleUpdate('radius', e.target.value)}
            className="w-full bg-transparent font-mono font-medium text-slate-800 focus:outline-none cursor-pointer"
          >
            <option value="25">25 km (13 NM)</option>
            <option value="50">50 km (27 NM)</option>
            <option value="100">100 km (54 NM)</option>
            <option value="150">150 km (81 NM)</option>
          </select>
        </div>

        {/* MIN SUITABILITY */}
        <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg space-y-1">
          <label className="text-[10px] font-mono text-slate-400 uppercase font-semibold flex items-center gap-1">
            <Activity className="w-3 h-3 text-[#22C55E]" /> Min Suitability
          </label>
          <select
            value={minSuitability}
            onChange={(e) => handleUpdate('minSuitability', e.target.value)}
            className="w-full bg-transparent font-mono font-semibold text-emerald-700 focus:outline-none cursor-pointer"
          >
            <option value="40">≥ 40% (All)</option>
            <option value="60">≥ 60% (Mod+)</option>
            <option value="75">≥ 75% (High+)</option>
            <option value="85">≥ 85% (Prime)</option>
          </select>
        </div>

        {/* DISTANCE CUTOFF */}
        <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg space-y-1">
          <label className="text-[10px] font-mono text-slate-400 uppercase font-semibold">
            Distance Cutoff
          </label>
          <select
            value={distanceCutoff}
            onChange={(e) => handleUpdate('distanceCutoff', e.target.value)}
            className="w-full bg-transparent font-mono font-medium text-slate-800 focus:outline-none cursor-pointer"
          >
            <option value="40.0">≤ 40.0 km</option>
            <option value="60.0">≤ 60.0 km</option>
            <option value="80.0">≤ 80.0 km</option>
            <option value="120.0">≤ 120.0 km</option>
          </select>
        </div>

        {/* SST WINDOW */}
        <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg space-y-1">
          <label className="text-[10px] font-mono text-slate-400 uppercase font-semibold flex items-center gap-1">
            <Thermometer className="w-3 h-3 text-amber-500" /> SST Window
          </label>
          <select
            value={sstWindow}
            onChange={(e) => handleUpdate('sstWindow', e.target.value)}
            className="w-full bg-transparent font-mono font-medium text-slate-800 focus:outline-none cursor-pointer"
          >
            <option value="26.0 - 30.0">26.0° - 30.0°C</option>
            <option value="25.0 - 28.0">25.0° - 28.0°C</option>
            <option value="27.0 - 29.5">27.0° - 29.5°C</option>
          </select>
        </div>

        {/* CHLOROPHYLL-A */}
        <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg space-y-1">
          <label className="text-[10px] font-mono text-slate-400 uppercase font-semibold">
            Chlorophyll-A
          </label>
          <select
            value={chlorophyllMin}
            onChange={(e) => handleUpdate('chlorophyllMin', e.target.value)}
            className="w-full bg-transparent font-mono font-medium text-slate-800 focus:outline-none cursor-pointer"
          >
            <option value="0.5">≥ 0.5 mg/m³</option>
            <option value="1.0">≥ 1.0 mg/m³</option>
            <option value="1.5">≥ 1.5 mg/m³</option>
            <option value="2.0">≥ 2.0 mg/m³</option>
          </select>
        </div>

        {/* SORT OPTIMIZATION */}
        <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg space-y-1">
          <label className="text-[10px] font-mono text-slate-400 uppercase font-semibold flex items-center gap-1">
            <ArrowUpDown className="w-3 h-3 text-[#1363DF]" /> Sort
          </label>
          <select 
            value={sortBy} 
            onChange={(e) => handleUpdate('sortBy', e.target.value)}
            className="w-full bg-transparent font-mono font-medium text-slate-800 focus:outline-none cursor-pointer"
          >
            <option value="suitability">Suitability Score</option>
            <option value="distance">Nearest Distance</option>
            <option value="chlorophyll">Highest Chlorophyll</option>
          </select>
        </div>
      </div>
    </div>
  );
}
