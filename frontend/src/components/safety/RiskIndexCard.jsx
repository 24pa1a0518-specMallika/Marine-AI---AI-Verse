import React from 'react';
import { ShieldAlert, Info, Settings } from 'lucide-react';

export default function RiskIndexCard() {
  const score = 40;
  const strokeDashoffset = 251.2 - (251.2 * score) / 100;

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card p-5 space-y-4 flex flex-col justify-between h-full">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
        <div>
          <span className="label-caps text-slate-400 block">Telemetry Core Assessment</span>
          <h3 className="font-bold text-lg text-[#0F172A]">Comprehensive Marine Risk Index</h3>
        </div>

        <div className="bg-[#FEF3C7] border border-[#FDE68A] text-[#D97706] px-3 py-1 rounded-lg text-xs font-mono font-bold flex flex-col items-end">
          <span>▲ MODERATE RISK</span>
          <span className="text-[9px] font-sans font-normal opacity-90">STATUS: CAUTION ADVISED</span>
        </div>
      </div>

      {/* GAUGE & NARRATIVE GRID */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center my-2">
        {/* RADIAL GAUGE & SCALE BAR (5 COLS) */}
        <div className="md:col-span-5 flex flex-col items-center justify-center space-y-3">
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="#E2E8F0"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="#F59E0B"
                strokeWidth="10"
                fill="transparent"
                strokeDasharray="251.2"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="font-extrabold text-3xl text-[#0F172A] tracking-tight">{score}</span>
              <span className="text-[10px] font-mono text-slate-400 font-semibold uppercase">/ 100 Index</span>
            </div>
          </div>

          <span className="text-xs font-mono font-semibold text-slate-500">COMPOSITE INDEX RATING</span>

          {/* RISK RANGE CLASSIFICATION BAR */}
          <div className="w-full grid grid-cols-4 gap-1 text-[9px] font-mono text-center font-semibold pt-2">
            <div className="bg-emerald-50 text-emerald-700 p-1 rounded border border-emerald-200">
              0 - 30<br/>LOW
            </div>
            <div className="bg-amber-100 text-amber-800 p-1 rounded border border-amber-300 ring-2 ring-amber-400/30">
              31 - 55<br/>MOD
            </div>
            <div className="bg-orange-50 text-orange-700 p-1 rounded border border-orange-200">
              56 - 85<br/>HIGH
            </div>
            <div className="bg-rose-50 text-rose-700 p-1 rounded border border-rose-200">
              86 - 100<br/>SEVERE
            </div>
          </div>
        </div>

        {/* OPERATIONAL ENVELOPE NARRATIVE (7 COLS) */}
        <div className="md:col-span-7 space-y-3 bg-slate-50 border border-slate-100 p-4 rounded-xl">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0F172A]">
            <Info className="w-4 h-4 text-[#1363DF]" />
            <span>Current Operational Envelope</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-sans">
            Overall operating envelope is constrained primarily by elevated coastal swell and cross-winds in the outer shelf zone. Inshore conditions remain workable with heightened vigilance.
          </p>
        </div>
      </div>

      {/* FOOTER WEIGHTING & ALGORITHM DETAILS */}
      <div className="pt-3 border-t border-slate-100 text-[10px] font-mono text-slate-400 flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-1">
          <Settings className="w-3 h-3 text-slate-400" />
          Model Weighting: Swell Height (45%) • Wind Vector (25%) • Convective (30%)
        </span>
        <span>ALGORITHM: HydroRisk v3.4 [ML-ENCODED]</span>
      </div>
    </div>
  );
}
