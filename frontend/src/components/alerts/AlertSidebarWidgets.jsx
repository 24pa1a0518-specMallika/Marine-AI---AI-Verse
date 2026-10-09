import React from 'react';
import { Radio, MapPin, AlertTriangle, RefreshCw } from 'lucide-react';

export default function AlertSidebarWidgets({ onEmergencyTrigger }) {
  const conduits = [
    {
      name: 'Navtex 518 kHz',
      sub: 'Coast Station 412',
      status: 'Synced (Active)',
      statusClass: 'text-emerald-700 font-bold bg-emerald-50 border-emerald-200'
    },
    {
      name: 'Satellite Inmarsat-C',
      sub: 'IOR SafetyNET II',
      status: 'Connected',
      statusClass: 'text-[#1363DF] font-bold bg-[#1363DF]/10 border-[#1363DF]/20'
    },
    {
      name: 'VHF Ch 16 Monitor',
      sub: '156.800 MHz Relay',
      status: 'Standby',
      statusClass: 'text-slate-600 font-medium bg-slate-100 border-slate-200'
    },
    {
      name: 'Coastal Fisher SMS',
      sub: 'Telugu & English',
      status: '1,420 Subscribed',
      statusClass: 'text-slate-800 font-bold bg-slate-100 border-slate-200'
    }
  ];

  return (
    <div className="space-y-6">
      {/* CHANNEL SYNC CARD */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-1.5 font-bold text-[#0F172A]">
            <Radio className="w-4 h-4 text-[#1363DF]" />
            <span>Channel Sync</span>
          </div>

          <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200 uppercase">
            All Green
          </span>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed font-sans">
          Real-time status of outgoing vessel advisory transmitters and maritime safety broadcast conduits.
        </p>

        {/* CONDUITS LIST */}
        <div className="space-y-2 text-xs">
          {conduits.map((item, idx) => (
            <div
              key={idx}
              className="bg-slate-50 border border-slate-100 p-2.5 rounded-lg flex items-center justify-between gap-2"
            >
              <div>
                <span className="font-bold text-slate-800 block">{item.name}</span>
                <span className="text-[10px] font-mono text-slate-400">{item.sub}</span>
              </div>

              <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${item.statusClass}`}>
                {item.status}
              </span>
            </div>
          ))}
        </div>

        {/* RE-HANDSHAKE BUTTON */}
        <button className="w-full py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5">
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          <span>Force Protocol Re-Handshake</span>
        </button>
      </div>

      {/* SPATIAL OVERVIEW RADAR CARD */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="font-bold text-sm text-[#0F172A]">Spatial Overview</span>
          <span className="text-[10px] font-mono text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 uppercase font-semibold">
            Live Radar
          </span>
        </div>

        <div className="w-full h-36 rounded-lg bg-slate-900 border border-slate-800 relative overflow-hidden flex items-center justify-center">
          <img
            src="https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/10/775/485.png"
            alt="Live Radar Map"
            className="w-full h-full object-cover opacity-70"
          />
          <div className="absolute top-2 right-2 bg-slate-950/80 text-white font-mono text-[9px] px-2 py-0.5 rounded border border-slate-700">
            Target Zone: Godavari Shelf Outfall
          </div>
          <div className="absolute bottom-2 left-2 bg-slate-950/80 text-emerald-400 font-mono text-[9px] px-2 py-0.5 rounded border border-slate-700">
            82.49°E, 16.74°N
          </div>
          <MapPin className="w-6 h-6 text-[#00B4D8] absolute animate-bounce" />
        </div>
      </div>

      {/* PROTECTED EMERGENCY CONTROLS CRIMSON CARD */}
      <div className="bg-[#FEE2E2] border border-[#FCA5A5] rounded-xl p-5 space-y-3 shadow-sm text-[#991B1B]">
        <div className="flex items-center gap-2 font-extrabold text-sm uppercase tracking-tight text-[#DC2626]">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>Protected Emergency Controls</span>
        </div>

        <p className="text-xs leading-relaxed text-[#991B1B]/90 font-medium">
          Authorizes instant high-decibel harbor audio alerts, satellite DSC alerts, and overrides artisanal boat beacons within a 25 NM radius.
        </p>

        <button
          onClick={onEmergencyTrigger}
          className="w-full py-3 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Trigger Coastal Siren / Red Alert (Protected)</span>
        </button>

        <span className="text-[10px] font-mono text-[#991B1B]/70 block text-center">
          Dual authorization may be required upon confirmation click.
        </span>
      </div>
    </div>
  );
}
