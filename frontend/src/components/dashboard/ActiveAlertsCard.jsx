import React from 'react';
import { Bell, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function ActiveAlertsCard() {
  const alerts = [
    {
      id: 1,
      type: 'warning',
      text: 'High wave conditions expected in outer zone.',
      icon: AlertTriangle,
      bg: 'bg-[#FEF3C7]',
      border: 'border-[#FDE68A]',
      textCol: 'text-[#92400E]'
    },
    {
      id: 2,
      type: 'warning',
      text: 'Strong wind gusts likely after 14:00.',
      icon: AlertTriangle,
      bg: 'bg-[#FEF3C7]',
      border: 'border-[#FDE68A]',
      textCol: 'text-[#92400E]'
    },
    {
      id: 3,
      type: 'safe',
      text: 'No active cyclone warnings in region.',
      icon: CheckCircle2,
      bg: 'bg-[#F0FDF4]',
      border: 'border-[#DCFCE7]',
      textCol: 'text-[#166534]'
    },
    {
      id: 4,
      type: 'muted',
      text: 'Restricted military zone 12km East.',
      icon: ShieldAlert,
      bg: 'bg-[#F8FAFC]',
      border: 'border-[#E2E8F0]',
      textCol: 'text-slate-600'
    }
  ];

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card p-5 flex flex-col justify-between">
      {/* HEADER */}
      <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-3 mb-3">
        <Bell className="w-4 h-4 text-[#1363DF]" />
        <span className="label-caps text-slate-700 tracking-wider">Active Alerts</span>
      </div>

      {/* ALERT LIST */}
      <div className="space-y-2">
        {alerts.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className={`p-3 rounded-lg border text-xs font-medium flex items-center gap-2.5 transition-all ${item.bg} ${item.border} ${item.textCol}`}
            >
              <Icon className="w-4 h-4 shrink-0 opacity-80" />
              <span className="leading-snug">{item.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
