import React from 'react';
import { Plus, Minus, Target, Layers, AlertTriangle, Route, Ruler } from 'lucide-react';

export default function MapToolToolbar({
  onZoomIn,
  onZoomOut,
  onRecenter,
  toggleRisk,
  toggleRoute,
  showRisk,
  showRoute
}) {
  return (
    <div className="flex flex-col gap-1.5 z-[1000]">
      {/* ZOOM CONTROLS BLOCK - SOLID WHITE BACKGROUND */}
      <div className="bg-white rounded-xl p-1 shadow-md flex flex-col gap-1 border border-[#E2E8F0]">
        <button
          onClick={onZoomIn}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer"
          title="Zoom In"
        >
          <Plus className="w-4 h-4" />
        </button>

        <button
          onClick={onZoomOut}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer"
          title="Zoom Out"
        >
          <Minus className="w-4 h-4" />
        </button>
      </div>

      {/* MAP TOOL OPTIONS BLOCK - SOLID WHITE BACKGROUND */}
      <div className="bg-white rounded-xl p-1 shadow-md flex flex-col gap-1 border border-[#E2E8F0]">
        <button
          onClick={onRecenter}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-700 hover:text-[#1363DF] hover:bg-slate-100 transition-all cursor-pointer"
          title="Recenter Map"
        >
          <Target className="w-4 h-4" />
        </button>

        <button
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-700 hover:text-[#1363DF] hover:bg-slate-100 transition-all cursor-pointer"
          title="Map Layers"
        >
          <Layers className="w-4 h-4" />
        </button>

        <button
          onClick={toggleRisk}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
            showRisk ? 'bg-amber-100 text-amber-700 font-bold' : 'text-slate-700 hover:bg-slate-100'
          }`}
          title="Toggle Risk Zones"
        >
          <AlertTriangle className="w-4 h-4" />
        </button>

        <button
          onClick={toggleRoute}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
            showRoute ? 'bg-[#1363DF]/10 text-[#1363DF] font-bold' : 'text-slate-700 hover:bg-slate-100'
          }`}
          title="Toggle Vessel Route"
        >
          <Route className="w-4 h-4" />
        </button>

        <button
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-700 hover:text-[#1363DF] hover:bg-slate-100 transition-all cursor-pointer"
          title="Spatial Measure"
        >
          <Ruler className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
