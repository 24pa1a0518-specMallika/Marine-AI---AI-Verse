import React from 'react';
import { Sun, Waves } from 'lucide-react';

export default function WeatherOceanCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* WEATHER CARD */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card p-4 flex flex-col justify-between">
        <div className="flex items-center gap-1.5 border-b border-[#E2E8F0] pb-2 mb-2">
          <Sun className="w-3.5 h-3.5 text-amber-500" />
          <span className="label-caps text-slate-600">Weather</span>
        </div>

        <div>
          <div className="font-extrabold text-2xl text-[#0F172A] tracking-tight">--</div>
          <div className="space-y-1 mt-2 text-xs text-slate-600">
            <div className="flex justify-between">
              <span className="text-slate-400">Wind</span>
              <span className="font-mono font-medium text-slate-800">--</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Rain</span>
              <span className="font-mono font-medium text-slate-800">--</span>
            </div>
          </div>
        </div>
      </div>

      {/* OCEAN CARD */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card p-4 flex flex-col justify-between">
        <div className="flex items-center gap-1.5 border-b border-[#E2E8F0] pb-2 mb-2">
          <Waves className="w-3.5 h-3.5 text-[#00B4D8]" />
          <span className="label-caps text-slate-600">Ocean</span>
        </div>

        <div>
          <div className="font-extrabold text-xl text-[#0F172A] tracking-tight">-- <span className="text-sm font-normal text-slate-500">Wave</span></div>
          <div className="space-y-1 mt-2 text-xs text-slate-600">
            <div className="flex justify-between">
              <span className="text-slate-400">SST</span>
              <span className="font-mono font-medium text-slate-800">--</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Chl-a</span>
              <span className="font-mono font-medium text-slate-800">--</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
