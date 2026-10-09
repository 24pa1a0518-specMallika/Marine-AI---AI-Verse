import React from 'react';
import { Wind, Waves, Thermometer, Compass, AlertTriangle, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function BottomTelemetryGrid({ telemetry, alertsCount, isFallback, isLoading }) {
  const navigate = useNavigate();

  const windSpeed = telemetry?.wind?.speed ?? '--';
  const windDir = telemetry?.wind?.direction || 'Unknown';
  const windLabel = telemetry?.wind?.label || 'Unknown';

  const waveHeight = telemetry?.waves?.height ?? '--';
  const waveLabel = telemetry?.waves?.label || 'Unknown';

  const sstValue = telemetry?.sst?.value ?? '--';
  const sstLabel = telemetry?.sst?.label || 'Unknown';

  const currentSpeed = telemetry?.current?.speed ?? '--';
  const currentDir = telemetry?.current?.direction || 'Unknown';
  const currentLabel = telemetry?.current?.label || 'Unknown';

  const countAlerts = alertsCount ?? 0;

  return (
    <div className="space-y-1.5 text-[#D8D2C2]">
      {isFallback && (
        <div className="flex justify-end">
          <span className="text-[10px] font-mono text-[#C9A961] bg-[#C9A961]/15 border border-[#C9A961]/30 px-2 py-0.5 rounded">
            Demo Data (Offline Fallback)
          </span>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* 1. WIND CARD */}
        <div className="bg-[#132C40] rounded-xl border border-[#1E3F5A] p-3.5 flex flex-col justify-between shadow-md hover:border-[#C9A961]/50 transition-all">
          <div className="flex items-center gap-2 text-[#8EA5B5] text-xs font-medium">
            <Wind className="w-4 h-4 text-[#C9A961]" />
            <span>Wind</span>
          </div>
          <div className="mt-3">
            <div className="text-lg font-mono font-extrabold text-[#D8D2C2] tracking-tight">
              {isLoading ? '...' : windSpeed} <span className="text-xs font-semibold text-[#8EA5B5]">kt {windDir}</span>
            </div>
            <div className="text-[11px] font-mono font-bold text-[#C9A961] mt-1">
              {windLabel}
            </div>
          </div>
        </div>

        {/* 2. WAVES CARD */}
        <div className="bg-[#132C40] rounded-xl border border-[#1E3F5A] p-3.5 flex flex-col justify-between shadow-md hover:border-[#C9A961]/50 transition-all">
          <div className="flex items-center gap-2 text-[#8EA5B5] text-xs font-medium">
            <Waves className="w-4 h-4 text-[#C9A961]" />
            <span>Waves</span>
          </div>
          <div className="mt-3">
            <div className="text-lg font-mono font-extrabold text-[#D8D2C2] tracking-tight">
              {isLoading ? '...' : waveHeight} <span className="text-xs font-semibold text-[#8EA5B5]">m</span>
            </div>
            <div className="text-[11px] font-mono font-bold text-[#C9A961] mt-1">
              {waveLabel}
            </div>
          </div>
        </div>

        {/* 3. SST CARD */}
        <div className="bg-[#132C40] rounded-xl border border-[#1E3F5A] p-3.5 flex flex-col justify-between shadow-md hover:border-[#C9A961]/50 transition-all">
          <div className="flex items-center gap-2 text-[#8EA5B5] text-xs font-medium">
            <Thermometer className="w-4 h-4 text-[#C9A961]" />
            <span>SST</span>
          </div>
          <div className="mt-3">
            <div className="text-lg font-mono font-extrabold text-[#D8D2C2] tracking-tight">
              {isLoading ? '...' : sstValue} <span className="text-xs font-semibold text-[#8EA5B5]">°C</span>
            </div>
            <div className="text-[11px] font-mono font-bold text-[#3E7C6B] mt-1">
              {sstLabel}
            </div>
          </div>
        </div>

        {/* 4. CURRENT CARD */}
        <div className="bg-[#132C40] rounded-xl border border-[#1E3F5A] p-3.5 flex flex-col justify-between shadow-md hover:border-[#C9A961]/50 transition-all">
          <div className="flex items-center gap-2 text-[#8EA5B5] text-xs font-medium">
            <Compass className="w-4 h-4 text-[#C9A961]" />
            <span>Current</span>
          </div>
          <div className="mt-3">
            <div className="text-lg font-mono font-extrabold text-[#D8D2C2] tracking-tight">
              {isLoading ? '...' : currentSpeed} <span className="text-xs font-semibold text-[#8EA5B5]">m/s {currentDir}</span>
            </div>
            <div className="text-[11px] font-mono font-bold text-[#C9A961] mt-1">
              {currentLabel}
            </div>
          </div>
        </div>

        {/* 5. ACTIVE ALERTS CARD */}
        <div 
          onClick={() => navigate('/alerts')}
          className="bg-[#B8543C]/15 rounded-xl border border-[#B8543C]/40 p-3.5 flex flex-col justify-between shadow-md hover:border-[#B8543C] transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-2 text-[#B8543C] text-xs font-semibold">
            <AlertTriangle className="w-4 h-4 text-[#B8543C]" />
            <span>Active Alerts</span>
          </div>
          <div className="mt-3 flex items-end justify-between">
            <div className="text-2xl font-mono font-extrabold text-[#B8543C] leading-none">
              {isLoading ? '...' : countAlerts}
            </div>
            <div className="text-[11px] font-mono font-semibold text-[#C9A961] group-hover:underline flex items-center gap-0.5">
              <span>View All</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
