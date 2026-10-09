import React from 'react';
import { ShieldCheck, CheckCircle2, AlertTriangle, Sparkles, Navigation } from 'lucide-react';

export default function RouteAssessmentCard() {
  const rationaleItems = [
    {
      title: 'Avoids Severe Godavari Shoal Convergence',
      desc: 'Circumvents breaking shoals where wave height exceeds 2.4m, eliminating hull shock.'
    },
    {
      title: 'Standoff From Restricted Zone IN-EXZ-88',
      desc: 'Maintains a mandatory 2.4 Nautical Mile buffer south of active live-fire naval perimeter.'
    },
    {
      title: 'Stable Depth Bathymetry Corridor',
      desc: 'Directs the hull through 42m continental shelf depression, dampening cross-roll dynamics.'
    },
    {
      title: 'Plume Entry Vector Alignment',
      desc: 'Approaches PFZ-001 along chlorophyll gradient core for immediate fishing gear deployment.'
    }
  ];

  return (
    <div className="space-y-4">
      {/* ROUTE ALPHA-SAFE-01 ASSESSMENT CARD */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold block">
              RECOMMENDED AI PATH
            </span>
            <h3 className="font-extrabold text-xl text-[#0F172A]">Route Alpha-Safe-01</h3>
          </div>

          <span className="text-xs font-mono font-bold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
            <span>RISK SCORE: 18 / 100</span>
          </span>
        </div>

        {/* 2X2 METRICS GRID */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Total Distance</span>
            <div className="font-extrabold text-lg text-[#0F172A] font-mono mt-0.5">36.4 <span className="text-xs font-normal text-slate-500">km</span></div>
            <span className="text-[10px] font-mono text-slate-400">19.65 Nautical Miles</span>
          </div>

          <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Travel Time</span>
            <div className="font-extrabold text-lg text-[#0F172A] font-mono mt-0.5">2h 15m</div>
            <span className="text-[10px] font-mono text-slate-400">@ Cruising 9.5 kts</span>
          </div>

          <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Detour Penalty</span>
            <div className="font-extrabold text-lg text-[#1363DF] font-mono mt-0.5">+8.2%</div>
            <span className="text-[10px] font-mono text-slate-400">+4.3 km for avoidance</span>
          </div>

          <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Arrival ETA</span>
            <div className="font-extrabold text-lg text-[#0F172A] font-mono mt-0.5">08:35 IST</div>
            <span className="text-[10px] font-mono text-slate-400">Depart: 06:20 IST</span>
          </div>
        </div>

        {/* TRAJECTORY TRADE-OFF ASSESSMENT BOX */}
        <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-2 text-xs">
          <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block border-b border-slate-200 pb-1">
            Trajectory Trade-Off Assessment
          </span>

          <div className="space-y-1.5 font-mono">
            <div className="flex items-center justify-between p-2 rounded bg-white border border-slate-200 text-rose-700">
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span className="font-bold">Direct Shortest Path</span>
              </div>
              <div className="text-right">
                <span>32.1 km • 1h 48m</span>
                <span className="font-bold block text-[10px] text-rose-600">Risk 84/100 (Severe Geofence Breach)</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-2 rounded bg-emerald-50 border border-emerald-200 text-emerald-800">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-bold">Recommended Safe Route</span>
              </div>
              <div className="text-right">
                <span>36.4 km • 2h 15m</span>
                <span className="font-bold block text-[10px] text-emerald-700">Risk 18/100 (100% Compliant)</span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-600 leading-relaxed font-sans pt-1">
            <strong>Trade-off:</strong> +27 minutes extra running time eliminates 100% of military firing zone and shallow shoal risks.
          </p>
        </div>
      </div>

      {/* AI ROUTING ENGINE RATIONALE CARD */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
          <div className="flex items-center gap-2 font-bold text-[#0F172A] text-sm">
            <Sparkles className="w-4 h-4 text-[#00B4D8]" />
            <span>AI Routing Engine Rationale</span>
          </div>
          <span className="text-[10px] font-mono text-[#1363DF] bg-[#1363DF]/10 px-2 py-0.5 rounded border border-[#1363DF]/20">
            AI HydroRoute v2.4
          </span>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed font-sans">
          System synthesized 14 bathymetric soundings, naval geofence coordinates, and satellite swell telemetry to calculate this route:
        </p>

        <div className="space-y-2 text-xs">
          {rationaleItems.map((item, idx) => (
            <div key={idx} className="flex items-start gap-2.5 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <CheckCircle2 className="w-4 h-4 text-[#1363DF] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#0F172A] block">{item.title}</span>
                <span className="text-[11px] text-slate-600 leading-relaxed">{item.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
