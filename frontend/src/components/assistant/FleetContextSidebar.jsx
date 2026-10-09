import React from 'react';
import { Globe, Anchor, AlertTriangle } from 'lucide-react';

export default function FleetContextSidebar() {
  return (
    <div className="space-y-4">
      {/* LANGUAGE SELECTOR */}
      <div className="bg-[#132C40] rounded-xl border border-[#1E3F5A] p-3 flex items-center justify-between">
        <span className="text-xs font-medium text-[#8EA5B5] flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-[#C9A961]" />
          Language
        </span>
        <select className="text-xs font-semibold text-[#D8D2C2] bg-[#0B1E2D] border border-[#1E3F5A] rounded px-2 py-1 focus:outline-none cursor-pointer">
          <option>English</option>
          <option>Telugu (తెలుగు)</option>
          <option>Tamil (தமிழ்)</option>
          <option>Hindi (हिन्दी)</option>
        </select>
      </div>

      {/* CURRENT FLEET CONTEXT CARD */}
      <div className="bg-[#132C40] rounded-xl border border-[#1E3F5A] p-4 space-y-3">
        <div className="flex items-center gap-2 border-b border-[#1E3F5A] pb-2">
          <Anchor className="w-3.5 h-3.5 text-[#C9A961]" />
          <span className="text-[10px] font-mono text-[#8EA5B5] uppercase font-semibold">
            Current Fleet Context
          </span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-[#8EA5B5]">Active Vessels</span>
            <span className="font-mono font-bold text-[#D8D2C2]">12/15</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-[#8EA5B5]">Avg Risk Score</span>
            <span className="font-mono font-bold text-[#C9A961]">42 (Mod)</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-[#8EA5B5]">Weather Status</span>
            <span className="font-semibold text-[#3E7C6B]">Clear</span>
          </div>
        </div>
      </div>

      {/* ACTIVE SAFETY ALERTS CRIMSON BOX */}
      <div className="bg-[#B8543C]/15 border border-[#B8543C]/40 rounded-xl p-4 space-y-2 text-xs text-[#E2B7AE]">
        <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px] text-[#B8543C]">
          <AlertTriangle className="w-4 h-4 text-[#B8543C]" />
          <span>Active Safety Alerts</span>
        </div>
        <p className="text-[11px] leading-relaxed font-medium">
          Gale warning in sector 7. All vessels advised to maintain minimum distance of 5NM from central anomaly.
        </p>
      </div>
    </div>
  );
}
