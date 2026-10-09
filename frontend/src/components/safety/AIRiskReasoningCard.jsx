import React from 'react';
import { Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function AIRiskReasoningCard() {
  const checks = [
    {
      id: 1,
      type: 'pass',
      title: 'Wind speed within moderate range',
      desc: '18 km/h steady SE breeze, safely below the 30 km/h critical operational threshold for mechanized trawlers.'
    },
    {
      id: 2,
      type: 'warning',
      title: 'Wave height elevated (Primary driver)',
      desc: '1.4m open sea swell reaching 1.8m near the outer Godavari bank shelf break; creates steep short-period chop requiring hull ballast.'
    },
    {
      id: 3,
      type: 'pass',
      title: 'No cyclone or depression warning',
      desc: 'IMD Deep Depression / Cyclone alert level is currently Normal (Green). Bay of Bengal basin monitoring shows zero vortex formation.'
    },
    {
      id: 4,
      type: 'pass',
      title: 'Low lightning & convective probability',
      desc: 'Atmospheric instability index (CAPE) stands at 14 J/kg with minimal vertical convective shear detected.'
    }
  ];

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card p-5 space-y-4">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#00B4D8]/10 text-[#00B4D8] flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-[#00B4D8]" />
          </div>
          <div>
            <h3 className="font-bold text-[#0F172A]">AI Risk Attribution & Reasoning</h3>
            <span className="text-[10px] font-mono text-slate-400 uppercase">
              Transparent Maritime Inference Pipeline
            </span>
          </div>
        </div>

        <span className="text-xs font-mono font-semibold text-[#1363DF] bg-[#1363DF]/10 px-3 py-1 rounded-full border border-[#1363DF]/20">
          Inference Confidence: 94.6%
        </span>
      </div>

      {/* 2-COLUMN INNER LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: VERIFICATION CHECKS (7 COLS) */}
        <div className="lg:col-span-7 space-y-2.5">
          <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold block">
            Automated Verification Checks
          </span>

          {checks.map((item) => (
            <div
              key={item.id}
              className={`p-3 rounded-lg border text-xs space-y-1 ${
                item.type === 'warning'
                  ? 'bg-[#FEF3C7]/40 border-[#FDE68A] text-slate-900'
                  : 'bg-slate-50 border-slate-100 text-slate-800'
              }`}
            >
              <div className="flex items-center gap-2 font-bold">
                {item.type === 'warning' ? (
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-[#1363DF] shrink-0" />
                )}
                <span>{item.title}</span>
              </div>
              <p className="text-[11px] text-slate-600 pl-6 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* RIGHT COLUMN: MAIN HAZARD FACTOR BOX (5 COLS) */}
        <div className="lg:col-span-5 bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <span className="text-[10px] font-mono font-bold text-red-600 uppercase bg-red-50 border border-red-200 px-2 py-0.5 rounded">
              Main Hazard Factor
            </span>
          </div>

          <h4 className="font-bold text-base text-[#0F172A]">Wave + Current Shear Interaction</h4>
          <p className="text-xs text-slate-600 leading-relaxed font-sans">
            Cross-current wave steepness in the Godavari confluence sector increases roll angle risk for small mechanized craft (&lt;15m length). South-flowing river outflow against 1.8m SE incoming swell elevates localized breaking wave potential.
          </p>

          <div className="pt-2 border-t border-slate-200 grid grid-cols-3 gap-2 text-center text-[10px] font-mono font-semibold text-slate-700">
            <div className="bg-white p-1.5 rounded border border-slate-200">
              <span className="text-slate-400 block text-[9px]">STEEPNESS RATIO</span>
              <span>1:12 (Elevated)</span>
            </div>
            <div className="bg-white p-1.5 rounded border border-slate-200">
              <span className="text-slate-400 block text-[9px]">SIG WAVE HEIGHT</span>
              <span>Hs: 1.62m</span>
            </div>
            <div className="bg-white p-1.5 rounded border border-slate-200">
              <span className="text-slate-400 block text-[9px]">SHEAR VELOCITY</span>
              <span>1.4 kts</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
