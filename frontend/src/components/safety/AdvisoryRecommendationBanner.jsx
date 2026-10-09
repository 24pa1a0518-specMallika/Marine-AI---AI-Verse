import React from 'react';
import { ShieldCheck, Radio, CheckSquare } from 'lucide-react';

export default function AdvisoryRecommendationBanner() {
  return (
    <div className="bg-[#04111D] text-white rounded-xl border border-slate-800 p-6 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-[#001F3F] border border-[#00B4D8]/40 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5 text-[#00B4D8]" />
        </div>
        <div className="space-y-1 max-w-3xl">
          <span className="text-[10px] font-mono text-[#00B4D8] uppercase tracking-wider block font-semibold">
            Advisory Guideline • Directive #NAV-2025-044
          </span>
          <h3 className="font-bold text-lg text-white">Operational Safety Recommendation</h3>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            Fishing and transit operations may be possible under current prototype analytical assessment; however, skippers of artisanal and small mechanized craft should exercise heightened vigilance in open waters. Always cross-correlate with official statutory marine warnings, Navtex broadcasts, and local coastal harbor master advisories.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
        <button className="w-full sm:w-auto px-4 py-2.5 bg-white text-[#06283D] hover:bg-slate-100 font-bold text-xs rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm">
          <CheckSquare className="w-4 h-4 text-[#1363DF]" />
          <span>Acknowledge & Log to Station</span>
        </button>

        <button className="w-full sm:w-auto px-4 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2">
          <Radio className="w-4 h-4 text-[#00B4D8]" />
          <span>Tune Navtex 518 kHz</span>
        </button>
      </div>
    </div>
  );
}
