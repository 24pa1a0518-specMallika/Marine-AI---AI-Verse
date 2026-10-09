import React from 'react';
import { Anchor, ShieldAlert, CheckCircle2, AlertTriangle, MapPin } from 'lucide-react';

export default function CraftToleranceCard() {
  const craftClasses = [
    {
      id: 1,
      name: 'Small Artisanal (<12m)',
      type: 'Trawlers, Outboard Motorized',
      status: 'RESTRICTED',
      statusBg: 'bg-[#FEE2E2] text-[#DC2626] border-[#FCA5A5]',
      icon: ShieldAlert
    },
    {
      id: 2,
      name: 'Mechanized (12m - 24m)',
      type: 'Inshore Gillnetters, Longliners',
      status: 'CAUTION REQ.',
      statusBg: 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]',
      icon: AlertTriangle
    },
    {
      id: 3,
      name: 'Deep Sea Patrol >25m',
      type: 'Naval Auxiliaries & Merchant',
      status: 'NORMAL OPS',
      statusBg: 'bg-[#F0FDF4] text-[#166534] border-[#DCFCE7]',
      icon: CheckCircle2
    }
  ];

  return (
    <div className="space-y-4">
      {/* CRAFT TOLERANCE CARD */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
          <span className="label-caps text-slate-700 tracking-wider">Class Feasibility</span>
          <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Craft Tolerance</span>
        </div>

        {/* CLASSES LIST */}
        <div className="space-y-2">
          {craftClasses.map((craft) => {
            const Icon = craft.icon;
            return (
              <div
                key={craft.id}
                className="bg-slate-50 border border-slate-100 p-2.5 rounded-lg flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-bold text-[#0F172A]">{craft.name}</div>
                  <div className="text-[10px] font-mono text-slate-400">{craft.type}</div>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold border flex items-center gap-1 shrink-0 ${craft.statusBg}`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{craft.status}</span>
                </span>
              </div>
            );
          })}
        </div>

        {/* PERMISSIBLE ROLL METRIC */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
          <span>Max Permissible Roll</span>
          <span className="font-bold text-slate-800">14.2° at Angle 6.8s</span>
        </div>
      </div>

      {/* STATION SECTOR THUMBNAIL CARD */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card p-3.5 flex items-center gap-3">
        <div className="w-14 h-14 rounded-lg bg-slate-200 border border-slate-300 relative overflow-hidden shrink-0 flex items-center justify-center">
          <img
            src="https://cartodb-basemaps-a.global.ssl.fastly.net/light_all/10/775/485.png"
            alt="Station Sector Map"
            className="w-full h-full object-cover opacity-80"
          />
          <MapPin className="w-5 h-5 text-[#1363DF] absolute drop-shadow-md" />
        </div>

        <div className="space-y-0.5 text-xs">
          <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold block">Station Sector</span>
          <h4 className="font-bold text-slate-900">Godavari Outer Spit</h4>
          <p className="text-[11px] font-mono text-slate-500">Depth: 18m - 42m littoral drop</p>
          <p className="text-[11px] font-mono text-slate-500">Tide: +0.8m Flooding</p>
        </div>
      </div>
    </div>
  );
}
