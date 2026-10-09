import React, { useState } from 'react';
import { ChevronDown, Wind, Waves, Thermometer, Activity, Sparkles } from 'lucide-react';

export default function MarineIntelligenceHUD({ onGeneratePrediction }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="bg-white rounded-xl p-4 shadow-md w-[320px] text-xs space-y-3 border border-[#E2E8F0] z-[1000]">
      {/* HEADER */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between cursor-pointer select-none border-b border-slate-100 pb-2"
      >
        <h3 className="font-bold text-sm text-[#0F172A]">Marine Intelligence</h3>
        <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="space-y-3">
          {/* AREA RISK BADGE */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-medium">Selected Area Risk:</span>
            <span className="font-mono font-bold text-xs bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded border border-amber-200">
              MODERATE
            </span>
          </div>

          {/* 2X2 TELEMETRY GRID */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-50 border border-slate-200/80 p-2.5 rounded-lg space-y-1">
              <span className="text-[10px] font-mono text-slate-500 font-semibold uppercase flex items-center gap-1">
                <Wind className="w-3 h-3 text-[#1363DF]" /> Wind
              </span>
              <div className="font-mono font-bold text-[#0F172A] text-sm">
                -- <span className="text-[10px] font-normal text-slate-500">km/h</span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 p-2.5 rounded-lg space-y-1">
              <span className="text-[10px] font-mono text-slate-500 font-semibold uppercase flex items-center gap-1">
                <Waves className="w-3 h-3 text-[#00B4D8]" /> Wave
              </span>
              <div className="font-mono font-bold text-[#0F172A] text-sm">
                -- <span className="text-[10px] font-normal text-slate-500">m</span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 p-2.5 rounded-lg space-y-1">
              <span className="text-[10px] font-mono text-slate-500 font-semibold uppercase flex items-center gap-1">
                <Thermometer className="w-3 h-3 text-amber-500" /> SST
              </span>
              <div className="font-mono font-bold text-[#0F172A] text-sm">
                -- <span className="text-[10px] font-normal text-slate-500">°C</span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 p-2.5 rounded-lg space-y-1">
              <span className="text-[10px] font-mono text-slate-500 font-semibold uppercase flex items-center gap-1">
                <Activity className="w-3 h-3 text-emerald-600" /> Chl
              </span>
              <div className="font-mono font-bold text-[#0F172A] text-sm">
                -- <span className="text-[10px] font-normal text-slate-500">mg/m³</span>
              </div>
            </div>
          </div>

          {/* ACTION BUTTON */}
          <button
            onClick={onGeneratePrediction}
            className="w-full bg-[#1363DF] hover:bg-[#0D4EB3] text-white font-bold text-xs py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Risk Prediction</span>
          </button>
        </div>
      )}
    </div>
  );
}
