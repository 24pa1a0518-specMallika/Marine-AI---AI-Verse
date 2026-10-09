import React from 'react';
import { Compass, Route, ShieldCheck, Map, Anchor, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';

export default function AIResponseCard({ data, onViewAnalysis, onShowRoute }) {
  const isSafety = Boolean(
    data?.isSafetyQuery ?? 
    (data?.intent === 'FISHING_SAFETY' || data?.intent === 'RISK' || (data?.decisionStatus && data?.intent !== 'GREETING' && data?.intent !== 'GENERAL_INFO'))
  );
  const status = isSafety ? (data?.decisionStatus || (data?.safetyScore > 60 ? 'SAFE' : (data?.safetyScore > 30 ? 'CAUTION' : 'NOT SAFE'))) : null;
  const score = data?.riskScore || (data?.safetyScore != null ? 100 - data.safetyScore : 25);
  const riskLabel = data?.riskLevel || (score > 60 ? 'High' : (score > 30 ? 'Moderate' : 'Low'));
  const nearestPfz = data?.pfz?.nearest?.name || data?.nearestPfz || 'PFZ-03';
  const pfzDistance = data?.pfz?.nearest?.distanceKm || data?.pfzDistance || '18.4';
  const reason = data?.decisionReason || data?.reason || 'Moderate wave swells and fair surface visibility.';
  const answer = data?.formattedAnswer || data?.answer || 'Coastal telemetry indicates normal fishing conditions within safe bounds.';
  const geofenceStatus = data?.geofence?.status || 'SAFE';

  const getStatusBadge = () => {
    if (!status) return null;
    if (status === 'SAFE') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#3E7C6B]/20 border border-[#3E7C6B]/50 text-[#68BAA4] font-mono text-xs font-extrabold">
          <CheckCircle className="w-3.5 h-3.5 text-[#3E7C6B]" />
          STATUS: SAFE
        </span>
      );
    }
    if (status === 'CAUTION') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#C9A961]/20 border border-[#C9A961]/50 text-[#C9A961] font-mono text-xs font-extrabold">
          <AlertTriangle className="w-3.5 h-3.5 text-[#C9A961]" />
          STATUS: CAUTION
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#B8543C]/20 border border-[#B8543C]/50 text-[#E2B7AE] font-mono text-xs font-extrabold">
        <AlertCircle className="w-3.5 h-3.5 text-[#B8543C]" />
        STATUS: NOT SAFE
      </span>
    );
  };

  return (
    <div className="bg-[#132C40] rounded-xl border border-[#1E3F5A] shadow-card p-5 space-y-4">
      {/* SUMMARY HEADER */}
      <div className={`flex items-start gap-3 ${isSafety ? 'border-b border-[#1E3F5A] pb-3' : ''}`}>
        <div className="w-8 h-8 rounded-lg bg-[#0B1E2D] border border-[#C9A961]/40 flex items-center justify-center shrink-0 mt-0.5">
          <Anchor className="w-4 h-4 text-[#C9A961]" />
        </div>
        <div className="space-y-1.5 flex-1">
          {isSafety && (
            <div className="flex items-center justify-between gap-2 flex-wrap">
              {getStatusBadge()}
              <span className="text-[11px] font-mono text-[#8EA5B5]">
                Geofence: {geofenceStatus === 'SAFE' ? 'Clear (No breach)' : 'RESTRICTED BOUNDARY'}
              </span>
            </div>
          )}
          <p className="text-xs text-[#D8D2C2] leading-relaxed font-sans font-medium whitespace-pre-line">
            {answer}
          </p>
        </div>
      </div>

      {/* 2X2 METRIC SUMMARY CARDS GRID (Only shown for safety queries) */}
      {isSafety && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* CARD 1: RISK LEVEL */}
            <div className="bg-[#0B1E2D] border border-[#1E3F5A] p-3 rounded-lg flex items-center gap-3">
              <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center font-bold shrink-0 font-mono ${
                riskLabel === 'High' ? 'border-[#B8543C] bg-[#B8543C]/20 text-[#E2B7AE]' :
                riskLabel === 'Moderate' ? 'border-[#C9A961] bg-[#C9A961]/20 text-[#C9A961]' :
                'border-[#3E7C6B] bg-[#3E7C6B]/20 text-[#68BAA4]'
              }`}>
                {score}
              </div>
              <div>
                <span className="text-[10px] font-mono text-[#8EA5B5] uppercase font-semibold block">Risk Index</span>
                <span className="font-bold text-[#D8D2C2]">{riskLabel}</span>
              </div>
            </div>

            {/* CARD 2: NEAREST PFZ */}
            <div className="bg-[#0B1E2D] border border-[#1E3F5A] p-3 rounded-lg flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#C9A961]/15 text-[#C9A961] flex items-center justify-center shrink-0">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-[#8EA5B5] uppercase font-semibold block">Nearest PFZ</span>
                <span className="font-bold text-[#D8D2C2] font-mono">{nearestPfz} ({pfzDistance} km)</span>
              </div>
            </div>

            {/* CARD 3: REASON */}
            <div className="bg-[#0B1E2D] border border-[#1E3F5A] p-3 rounded-lg flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#C9A961]/15 text-[#C9A961] flex items-center justify-center shrink-0">
                <Route className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-mono text-[#8EA5B5] uppercase font-semibold block">Primary Factor</span>
                <span className="font-semibold text-[#8EA5B5] text-[11px] truncate block">{reason}</span>
              </div>
            </div>

            {/* CARD 4: GEOFENCE INTEGRITY */}
            <div className="bg-[#0B1E2D] border border-[#1E3F5A] p-3 rounded-lg flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#3E7C6B]/20 text-[#3E7C6B] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-[#8EA5B5] uppercase font-semibold block">Geofence</span>
                <span className="font-bold text-[#3E7C6B]">{geofenceStatus === 'SAFE' ? 'Clear Zone' : 'Active Boundary'}</span>
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onViewAnalysis}
              className="px-4 py-2 bg-[#C9A961] hover:bg-[#D4BA7A] text-[#0B1E2D] font-bold text-xs rounded-lg transition-all cursor-pointer shadow-xs"
            >
              View Full Risk Breakdown
            </button>

            <button
              onClick={onShowRoute}
              className="px-4 py-2 bg-[#132C40] hover:bg-[#1E3F5A] border border-[#C9A961] text-[#C9A961] font-semibold text-xs rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Map className="w-3.5 h-3.5" />
              <span>Show Route on Map</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
