import React from 'react';

export default function MapLegendWidget() {
  const legendItems = [
    { label: 'Low Risk Zone', color: 'bg-emerald-500' },
    { label: 'Moderate Risk Zone', color: 'bg-amber-500' },
    { label: 'High Risk Zone', color: 'bg-rose-500' },
    { label: 'Restricted Zone', color: 'bg-rose-600 border border-rose-300' }
  ];

  return (
    <div className="bg-white rounded-xl p-3.5 shadow-md min-w-[180px] text-xs space-y-2 border border-[#E2E8F0] z-[1000]">
      <span className="label-caps text-slate-700 tracking-wider block border-b border-slate-100 pb-1.5 font-bold">
        Map Legend
      </span>

      <div className="space-y-1.5 font-medium text-slate-700">
        {legendItems.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-sm ${item.color} shrink-0`}></span>
            <span className="text-[11px]">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
