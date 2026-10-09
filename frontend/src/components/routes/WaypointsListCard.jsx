import React from 'react';
import { Navigation, Radio, FileText } from 'lucide-react';

export default function WaypointsListCard() {
  const waypoints = [
    {
      id: 1,
      title: 'Kakinada Anchorage (Dep)',
      distEta: '00.0 km • 06:20 IST',
      notes: 'Co: 142°T • Speed 8.0 kts • Depart port limits into outer fairway'
    },
    {
      id: 2,
      title: 'WP-01: Fairway Buoy Clear',
      distEta: '08.4 km • 06:52 IST',
      notes: 'Alter heading to 118°T • Increase speed to 9.5 kts • Depths > 25m'
    },
    {
      id: 3,
      title: 'WP-02: IN-EXZ-88 Clear Turn',
      distEta: '19.2 km • 07:31 IST',
      notes: 'Alter heading to 138°T • 2.4 NM clearance from firing sector boundary'
    },
    {
      id: 4,
      title: 'WP-03: Continental Shelf Channel',
      distEta: '28.7 km • 08:04 IST',
      notes: 'Steer 148°T • Entering 50m bathymetric contour • Wind SE 14 kts'
    },
    {
      id: 5,
      title: 'PFZ-001 Harvesting Center',
      distEta: '36.4 km • 08:35 IST',
      notes: 'Arrive target station • Reduce to trawling speed (3.2 kts)'
    }
  ];

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
        <div className="flex items-center gap-2">
          <Navigation className="w-4 h-4 text-[#1363DF]" />
          <h3 className="font-bold text-base text-[#0F172A]">Sequential Waypoints</h3>
        </div>

        <span className="text-xs font-mono font-bold bg-[#1363DF]/10 text-[#1363DF] px-2.5 py-0.5 rounded-full border border-[#1363DF]/20">
          5 Legs Platted
        </span>
      </div>

      {/* WAYPOINTS STACK */}
      <div className="space-y-3 relative pl-4 border-l-2 border-[#00B4D8]/40">
        {waypoints.map((wp) => (
          <div key={wp.id} className="relative space-y-0.5">
            {/* Bullet Point Marker */}
            <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#00B4D8] border-2 border-white ring-2 ring-[#00B4D8]/30"></span>
            
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-[#0F172A]">{wp.title}</span>
              <span className="text-slate-500 font-medium">{wp.distEta}</span>
            </div>
            <p className="text-[11px] font-mono text-slate-500">{wp.notes}</p>
          </div>
        ))}
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-3 border-t border-slate-100">
        <button className="w-full sm:w-auto flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg border border-slate-200 transition-all cursor-pointer flex items-center justify-center gap-1.5">
          <FileText className="w-3.5 h-3.5" />
          <span>Detailed Logsheet</span>
        </button>

        <button className="w-full sm:w-auto flex-1 py-2.5 bg-[#1363DF] hover:bg-[#003366] text-white font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5">
          <Radio className="w-3.5 h-3.5" />
          <span>Push to ECDIS / AIS</span>
        </button>
      </div>
    </div>
  );
}
