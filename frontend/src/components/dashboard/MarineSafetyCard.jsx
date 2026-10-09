import React from 'react';
import { Shield, AlertTriangle } from 'lucide-react';

export default function MarineSafetyCard({ onWhyRiskClick }) {
  // Score = 40 (Moderate)
  const score = 40;
  const maxScore = 100;
  const strokeDashoffset = 251.2 - (251.2 * score) / maxScore;

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card p-5 flex flex-col justify-between">
      {/* CARD HEADER */}
      <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#1363DF]" />
          <span className="label-caps text-slate-700 tracking-wider">Marine Safety</span>
        </div>

        <span className="flex items-center gap-1 text-xs font-semibold bg-[#FEF3C7] text-[#D97706] px-2.5 py-0.5 rounded-md border border-[#FDE68A]">
          <AlertTriangle className="w-3 h-3" />
          <span>MODERATE</span>
        </span>
      </div>

      {/* CIRCULAR RISK SCORE GAUGE */}
      <div className="flex items-center justify-center gap-6 my-2">
        <div className="relative w-24 h-24 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Track Circle */}
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="#E2E8F0"
              strokeWidth="10"
              fill="transparent"
            />
            {/* Progress Arc */}
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
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-bold text-2xl text-[#0F172A]">{score}</span>
          </div>
        </div>

        <div className="flex-1">
          <span className="text-xs font-medium text-slate-500 block">Risk Score (100=Max)</span>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-2">
            <div className="bg-[#F59E0B] h-full rounded-full" style={{ width: `${score}%` }}></div>
          </div>
        </div>
      </div>

      {/* 2X2 TELEMETRY GRID */}
      <div className="grid grid-cols-2 gap-2 my-4 text-xs">
        <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-lg">
          <span className="text-[11px] font-mono text-slate-400 uppercase block">Wind</span>
          <span className="font-semibold text-slate-800 text-sm mt-0.5 block">Moderate</span>
        </div>

        <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-lg">
          <span className="text-[11px] font-mono text-slate-400 uppercase block">Wave</span>
          <span className="font-semibold text-slate-800 text-sm mt-0.5 block">Elevated</span>
        </div>

        <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-lg">
          <span className="text-[11px] font-mono text-slate-400 uppercase block">Lightning</span>
          <span className="font-semibold text-slate-800 text-sm mt-0.5 block">Low</span>
        </div>

        <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-lg">
          <span className="text-[11px] font-mono text-slate-400 uppercase block">Cyclone</span>
          <span className="font-semibold text-slate-800 text-sm mt-0.5 block">None</span>
        </div>
      </div>

      {/* WHY THIS RISK BUTTON */}
      <button
        onClick={onWhyRiskClick}
        className="w-full py-2 bg-white border border-[#1363DF]/30 text-[#1363DF] hover:bg-[#1363DF]/5 font-semibold text-xs rounded-lg transition-all cursor-pointer text-center"
      >
        Why this risk?
      </button>
    </div>
  );
}
