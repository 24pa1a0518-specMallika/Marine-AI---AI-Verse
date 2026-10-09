import React from 'react';
import { Bell, ShieldAlert, AlertTriangle, FileText, Wind } from 'lucide-react';

export default function AlertSummaryBar() {
  const metrics = [
    {
      id: 1,
      title: 'ACTIVE ALERTS',
      tag: 'UNREAD',
      value: '3',
      unit: 'live notices',
      subtext: 'Sector IN-COA-04',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-300 font-bold',
      icon: Bell
    },
    {
      id: 2,
      title: 'CRITICAL EMERGENCY',
      tag: '',
      value: '0',
      unit: 'events',
      subtext: 'Zero immediate emergency',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: ShieldAlert
    },
    {
      id: 3,
      title: 'WARNINGS',
      tag: 'Caution',
      value: '2',
      unit: 'elevated',
      subtext: 'High Wave & Wind',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-300 font-bold',
      icon: AlertTriangle
    },
    {
      id: 4,
      title: 'OPERATIONAL NOTICE',
      tag: 'Advisory',
      value: '1',
      unit: 'regulatory',
      subtext: 'Geofence adjusted',
      badgeClass: 'bg-[#1363DF]/10 text-[#1363DF] border-[#1363DF]/20',
      icon: FileText
    },
    {
      id: 5,
      title: 'CYCLONE THREAT',
      tag: 'Normal / Green',
      value: '0',
      unit: 'Active Cyclones',
      subtext: 'Within 350 NM radius',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold',
      icon: Wind
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
      {metrics.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.id}
            className="bg-white rounded-xl border border-[#E2E8F0] p-4 flex flex-col justify-between shadow-card space-y-2"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-1.5">
                <Icon className="w-3.5 h-3.5 text-[#1363DF]" />
                <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">
                  {item.title}
                </span>
              </div>

              {item.tag && (
                <span className={`px-2 py-0.5 rounded text-[9px] font-mono border ${item.badgeClass}`}>
                  {item.tag}
                </span>
              )}
            </div>

            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-extrabold text-2xl text-[#0F172A]">{item.value}</span>
                <span className="text-xs font-mono text-slate-500">{item.unit}</span>
              </div>
              <div className="text-[11px] font-mono text-slate-400 mt-1">{item.subtext}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
