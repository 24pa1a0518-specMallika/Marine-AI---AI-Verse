import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-[#E2E8F0] px-6 py-2.5 text-[11px] font-mono text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 z-10">
      <div>
        <span>Data Source: INCOIS, IMD</span>
        <span className="mx-2 text-slate-300">|</span>
        <span>Last Synced: 2023-10-27 08:42 UTC</span>
      </div>

      <div className="flex items-center gap-4 text-[11px]">
        <span className="flex items-center gap-1.5 text-slate-600">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Live Telemetry
        </span>
        <span className="text-slate-300">|</span>
        <span className="flex items-center gap-1.5 text-slate-600">
          <span className="w-2 h-2 rounded-full bg-[#00B4D8]"></span>
          Prediction Engine Active
        </span>
      </div>
    </footer>
  );
}
