import React from 'react';
import { Star, MapPin, Route, Map } from 'lucide-react';

export default function PFZCard({ pfz, isSelected, onSelect, onFindRoute }) {
  const isRecommended = pfz.isRecommended;

  return (
    <div
      className={`bg-white rounded-xl border transition-all shadow-card overflow-hidden ${
        isSelected
          ? 'border-[#1363DF] ring-2 ring-[#1363DF]/20'
          : isRecommended
          ? 'border-[#1363DF]/60'
          : 'border-[#E2E8F0] hover:border-slate-300'
      }`}
    >
      {/* AI RECOMMENDATION BANNER */}
      {isRecommended && (
        <div className="bg-[#06283D] text-white px-4 py-1.5 text-[11px] font-mono font-semibold flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[#00B4D8]">
            <Star className="w-3.5 h-3.5 fill-[#00B4D8]" />
            <span className="tracking-wider uppercase">AI Recommended • Optimal Harvest Convergence</span>
          </div>
          <span className="text-[10px] text-slate-300">HIGH CONFIDENCE</span>
        </div>
      )}

      <div className="p-4 space-y-3">
        {/* TOP ROW: ID, NAME, SCORE */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
              {pfz.id}
            </span>
            <div>
              <h3 className="font-bold text-base text-[#0F172A] leading-snug">{pfz.name}</h3>
              <p className="text-xs font-mono text-slate-500 mt-0.5">
                Coords: {pfz.coords} • {pfz.boundaryType}
              </p>
            </div>
          </div>

          {/* CIRCULAR / PILL SCORE BADGE */}
          <div
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-full border text-xs font-mono font-bold shrink-0 ${
              pfz.score >= 80
                ? 'bg-[#F0FDF4] border-[#DCFCE7] text-[#15803D]'
                : pfz.score >= 60
                ? 'bg-[#FEF3C7] border-[#FDE68A] text-[#D97706]'
                : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}
          >
            <span>{pfz.score}%</span>
            <span className="text-[9px] font-sans font-normal opacity-80">SCORE</span>
          </div>
        </div>

        {/* METRICS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs bg-slate-50 border border-slate-100 p-2.5 rounded-lg">
          <div>
            <span className="text-[10px] font-mono text-slate-400 block uppercase">Distance & Vector</span>
            <span className="font-mono font-semibold text-slate-800 block mt-0.5">{pfz.distance}</span>
          </div>

          <div>
            <span className="text-[10px] font-mono text-slate-400 block uppercase">Sea Surface Temp</span>
            <span className="font-mono font-semibold text-slate-800 block mt-0.5">{pfz.sst}</span>
          </div>

          <div>
            <span className="text-[10px] font-mono text-slate-400 block uppercase">Transit Est.</span>
            <span className="font-mono font-semibold text-slate-800 block mt-0.5">{pfz.transit}</span>
          </div>
        </div>

        {/* OCEANOGRAPHIC STATUS & ALERT */}
        <div className="text-xs text-slate-600 font-medium flex items-center justify-between pt-1">
          <span className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${pfz.score >= 70 ? 'bg-emerald-500' : pfz.score >= 50 ? 'bg-amber-500' : 'bg-slate-400'}`}></span>
            {pfz.statusText}
          </span>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={() => onSelect(pfz)}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              isSelected
                ? 'bg-[#06283D] text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
            }`}
          >
            <Map className="w-3.5 h-3.5 text-[#00B4D8]" />
            <span>{isSelected ? 'Selected on Map' : 'View on Map'}</span>
          </button>

          <button
            onClick={() => onFindRoute(pfz)}
            className="flex-1 py-2 px-3 bg-[#1363DF] hover:bg-[#003366] text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <Route className="w-3.5 h-3.5" />
            <span>Find Safe Route</span>
          </button>
        </div>
      </div>
    </div>
  );
}
