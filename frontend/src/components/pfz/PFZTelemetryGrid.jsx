import React from 'react';
import { Waves, Gauge, Wind, Eye } from 'lucide-react';

export default function PFZTelemetryGrid() {
  const telemetry = [
    {
      id: 1,
      title: 'Tide State (Kakinada Anchorage)',
      value: 'Flood Tide (+0.8m)',
      subtext: 'Next High: 14:22 IST',
      icon: Waves,
      color: 'text-[#1363DF]'
    },
    {
      id: 2,
      title: 'Barometric Pressure',
      value: '1012.4 hPa',
      subtext: 'Stable Barograph (±0.2)',
      icon: Gauge,
      color: 'text-amber-500'
    },
    {
      id: 3,
      title: 'Current Velocity',
      value: '1.2 kts',
      subtext: 'Southerly Surface Drift Layer',
      icon: Wind,
      color: 'text-[#00B4D8]'
    },
    {
      id: 4,
      title: 'Satellite Optical Clarity',
      value: '94.2% (Clear)',
      subtext: 'Cloud Cover: < 5%',
      icon: Eye,
      color: 'text-[#22C55E]'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {telemetry.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.id}
            className="bg-white rounded-xl border border-[#E2E8F0] shadow-card p-4 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold truncate">
                {item.title}
              </span>
              <Icon className={`w-3.5 h-3.5 shrink-0 ${item.color}`} />
            </div>

            <div>
              <div className="font-mono font-bold text-base text-[#0F172A]">{item.value}</div>
              <div className="text-xs text-slate-500 font-mono mt-1">{item.subtext}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
