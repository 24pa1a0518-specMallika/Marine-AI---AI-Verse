import React from 'react';
import { AlertTriangle, Shield, CheckCircle2, Navigation, MapPin, Bot, Image } from 'lucide-react';

export default function AlertCard({ alert, onPlotMap, onFindRoute }) {
  const isWarning = alert.type === 'warning';
  const isGeofence = alert.type === 'geofence';
  const isClear = alert.type === 'clear';

  return (
    <div
      className={`bg-white rounded-xl border shadow-card p-5 space-y-4 ${
        isWarning
          ? 'border-amber-300 ring-1 ring-amber-400/20'
          : isGeofence
          ? 'border-[#1363DF]/40'
          : 'border-[#E2E8F0]'
      }`}
    >
      {/* HEADER BADGES & TIME */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono font-semibold">
          <span
            className={`px-2.5 py-0.5 rounded border flex items-center gap-1 ${
              isWarning
                ? 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]'
                : isGeofence
                ? 'bg-[#1363DF]/10 text-[#1363DF] border-[#1363DF]/20'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}
          >
            {isWarning && <AlertTriangle className="w-3 h-3 text-amber-600" />}
            {isGeofence && <Shield className="w-3 h-3 text-[#1363DF]" />}
            {isClear && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
            <span>{alert.badgeText}</span>
          </span>

          <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            {alert.category}
          </span>

          {alert.riskContribution && (
            <span className="text-slate-400 font-normal">Risk Contribution: {alert.riskContribution}</span>
          )}
        </div>

        <span className="text-xs font-mono text-slate-400">{alert.timestamp}</span>
      </div>

      {/* TITLE & LOCATION / TIME WINDOW */}
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h3 className="font-extrabold text-lg text-[#0F172A] tracking-tight">{alert.title}</h3>
          {alert.vectorTag && (
            <span className="text-xs font-mono text-[#1363DF] bg-[#1363DF]/10 px-2.5 py-0.5 rounded border border-[#1363DF]/20 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span>{alert.vectorTag}</span>
            </span>
          )}
          {alert.statusTag && (
            <span className="text-xs font-mono font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>{alert.statusTag}</span>
            </span>
          )}
        </div>
        <p className="text-xs text-slate-600 leading-relaxed font-sans">{alert.description}</p>
      </div>

      {/* METRICS GRID */}
      {alert.metrics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-slate-50 border border-slate-100 p-3 rounded-lg font-mono">
          {alert.metrics.map((m, idx) => (
            <div key={idx}>
              <span className="text-[10px] text-slate-400 uppercase block">{m.label}</span>
              <span className={`font-semibold block mt-0.5 ${m.highlight ? 'text-rose-600' : 'text-slate-800'}`}>
                {m.value}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* DIRECTIVE OR AI MITIGATION BOX */}
      {alert.directive && (
        <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-1 text-xs">
          <div className="font-bold text-[#0F172A] flex items-center gap-1.5 uppercase font-mono text-[11px]">
            <span>{alert.directiveTitle}</span>
          </div>
          <p className="text-slate-600 leading-relaxed font-sans">{alert.directive}</p>
        </div>
      )}

      {/* AI AUTOMATED ACTION EXECUTED BOX */}
      {alert.aiAction && (
        <div className="bg-[#04111D] text-white border border-slate-800 p-4 rounded-xl space-y-2 text-xs shadow-md">
          <div className="flex items-center gap-2 font-mono font-bold text-[#00B4D8] text-[11px] uppercase">
            <Bot className="w-4 h-4 text-[#00B4D8]" />
            <span>Automated Routing Action Executed</span>
          </div>
          <p className="text-slate-200 leading-relaxed font-sans">{alert.aiAction}</p>
        </div>
      )}

      {/* ACTION BUTTONS */}
      <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100">
        {alert.primaryBtn && (
          <button
            onClick={() => onPlotMap(alert)}
            className="px-4 py-2 bg-[#06283D] hover:bg-[#04111D] text-white font-semibold text-xs rounded-lg transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
          >
            <Navigation className="w-3.5 h-3.5 text-[#00B4D8]" />
            <span>{alert.primaryBtn}</span>
          </button>
        )}

        {alert.secondaryBtn && (
          <button
            onClick={() => onFindRoute(alert)}
            className="px-4 py-2 bg-white border border-[#1363DF]/40 text-[#1363DF] hover:bg-[#1363DF]/5 font-semibold text-xs rounded-lg transition-all cursor-pointer"
          >
            {alert.secondaryBtn}
          </button>
        )}

        {alert.tertiaryBtn && (
          <button className="px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 transition-all cursor-pointer">
            {alert.tertiaryBtn}
          </button>
        )}

        <div className="ml-auto text-[10px] font-mono text-slate-400">
          Source: {alert.source}
        </div>
      </div>
    </div>
  );
}
