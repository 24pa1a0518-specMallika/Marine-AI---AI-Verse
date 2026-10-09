import React from 'react';
import { Wind, Waves, CloudRain, Zap, AlertCircle } from 'lucide-react';

export default function RiskBreakdownRow() {
  const riskFactors = [
    {
      id: 1,
      title: 'SURFACE WIND',
      value: '18 km/h SE',
      subtext: 'Gusts up to 24 km/h',
      badge: 'MODERATE',
      badgeClass: 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]',
      weight: '25%',
      icon: Wind
    },
    {
      id: 2,
      title: 'WAVE / SWELL',
      isPrimary: true,
      value: '1.4 - 1.8 m',
      subtext: 'Period: 7.2s • Shelf chop',
      badge: 'ELEVATED',
      badgeClass: 'bg-amber-500 text-white font-bold',
      weight: '45%',
      icon: Waves
    },
    {
      id: 3,
      title: 'PRECIPITATION',
      value: '30% Prob',
      subtext: 'Light coastal mist',
      badge: 'LOW',
      badgeClass: 'bg-[#F0FDF4] text-[#166534] border-[#DCFCE7]',
      weight: '10%',
      icon: CloudRain
    },
    {
      id: 4,
      title: 'CONVECTIVE CELLS',
      value: 'CAPE 14 J/kg',
      subtext: 'No lightning detected',
      badge: 'LOW',
      badgeClass: 'bg-[#F0FDF4] text-[#166534] border-[#DCFCE7]',
      weight: '10%',
      icon: Zap
    },
    {
      id: 5,
      title: 'TROPICAL STORM',
      value: '0 Active',
      subtext: 'No alert within 350 NM',
      badge: 'NONE',
      badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
      weight: '10%',
      icon: AlertCircle
    }
  ];

  return (
    <div className="space-y-3">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="font-bold text-lg text-[#0F172A]">Risk Factors Breakdown</h2>
          <span className="text-xs font-mono font-bold bg-[#1363DF]/10 text-[#1363DF] px-2.5 py-0.5 rounded-full border border-[#1363DF]/20">
            5 SENSORS ACTIVE
          </span>
        </div>

        <span className="text-xs font-mono text-slate-400">CALIBRATED AGAINST IMO STANDARDS</span>
      </div>

      {/* 5-COLUMN CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {riskFactors.map((factor) => {
          const Icon = factor.icon;
          return (
            <div
              key={factor.id}
              className={`bg-white rounded-xl border p-4 flex flex-col justify-between space-y-3 shadow-card ${
                factor.isPrimary ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-[#E2E8F0]'
              }`}
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <Icon className={`w-4 h-4 ${factor.isPrimary ? 'text-amber-500' : 'text-[#1363DF]'}`} />
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${factor.badgeClass}`}>
                  {factor.badge}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold block">
                  {factor.title}
                </span>
                <div className="font-extrabold text-lg text-[#0F172A] mt-0.5 tracking-tight">{factor.value}</div>
                <div className="text-[11px] font-mono text-slate-500 mt-1">{factor.subtext}</div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>Risk Weight</span>
                <span className="font-bold text-slate-700">{factor.weight}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
