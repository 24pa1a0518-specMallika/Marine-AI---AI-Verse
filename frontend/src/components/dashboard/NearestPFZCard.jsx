import React from 'react';
import { Target, MapPin, Map, Route } from 'lucide-react';

export default function NearestPFZCard({ onMapClick, onRouteClick }) {
  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card p-5 flex flex-col justify-between">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3 mb-3">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-[#22C55E]" />
          <span className="label-caps text-slate-700 tracking-wider">Nearest PFZ</span>
        </div>

        <span className="text-xs font-semibold bg-[#F0FDF4] text-[#15803D] px-2.5 py-0.5 rounded-full border border-[#DCFCE7]">
          82% Suitable
        </span>
      </div>

      {/* CONTENT */}
      <div className="my-2">
        <div className="font-extrabold text-xl text-[#0F172A] tracking-tight">PFZ-001</div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono mt-1">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          <span>31.8 km SE</span>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        <button
          onClick={onMapClick}
          className="flex items-center justify-center gap-1.5 py-2 bg-[#06283D] hover:bg-[#04111D] text-white font-semibold text-xs rounded-lg transition-all cursor-pointer shadow-xs"
        >
          <Map className="w-3.5 h-3.5 text-[#00B4D8]" />
          <span>Map</span>
        </button>

        <button
          onClick={onRouteClick}
          className="flex items-center justify-center gap-1.5 py-2 bg-white border border-[#1363DF]/40 text-[#1363DF] hover:bg-[#1363DF]/5 font-semibold text-xs rounded-lg transition-all cursor-pointer"
        >
          <Route className="w-3.5 h-3.5" />
          <span>Route</span>
        </button>
      </div>
    </div>
  );
}
