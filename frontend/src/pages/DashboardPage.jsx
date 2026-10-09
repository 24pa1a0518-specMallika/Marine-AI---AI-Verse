import React, { useState, useEffect } from 'react';
import SpatialIntelligenceMap from '../components/dashboard/SpatialIntelligenceMap';
import BottomTelemetryGrid from '../components/dashboard/BottomTelemetryGrid';
import { useNavigate } from 'react-router-dom';
import { getTelemetry } from '../api/weatherApi';
import { getNearbyPFZs } from '../api/pfzApi';
import { getAlerts } from '../api/alertsApi';
import { calculateMarineRisk } from '../api/riskApi';
import { useLocation } from '../context/LocationContext';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { selectedLocation, refreshTrigger } = useLocation();

  const activeLocation = {
    lat: selectedLocation?.lat ?? 16.98,
    lon: selectedLocation?.lon ?? 82.24,
    name: selectedLocation?.name ?? 'Kakinada Coast'
  };

  // Section Loading States
  const [isLoading, setIsLoading] = useState({
    telemetry: true,
    pfz: true,
    alerts: true,
    risk: true
  });

  // Section Data States
  const [telemetryState, setTelemetryState] = useState({ data: null, isFallback: false, source: 'live' });
  const [pfzState, setPfzState] = useState({ data: [], isFallback: false, source: 'live' });
  const [alertsState, setAlertsState] = useState({ data: [], isFallback: false, source: 'live' });
  const [riskState, setRiskState] = useState({ data: null, isFallback: false, source: 'live' });

  useEffect(() => {
    let isMounted = true;

    async function loadDashboardData() {
      setIsLoading({ telemetry: true, pfz: true, alerts: true, risk: true });
      try {
        // 1. Concurrently fetch independent telemetry, PFZs, and active alerts for activeLocation
        const [telemetryRes, pfzRes, alertsRes] = await Promise.all([
          getTelemetry(activeLocation),
          getNearbyPFZs({ latitude: activeLocation.lat, longitude: activeLocation.lon, limit: 5 }),
          getAlerts()
        ]);

        if (!isMounted) return;

        setTelemetryState(telemetryRes);
        setPfzState(pfzRes);
        setAlertsState(alertsRes);

        setIsLoading((prev) => ({ ...prev, telemetry: false, pfz: false, alerts: false }));

        // 2. Compute Marine Risk using live weather and ocean telemetry
        const telemetryData = telemetryRes.data;
        const riskInput = {
          windSpeed: telemetryData?.wind?.speed ?? 14,
          windGust: telemetryData?.wind?.gust ?? 18,
          waveHeight: telemetryData?.waves?.height ?? 1.2,
          rainProbability: telemetryData?.precipitation ?? 0,
          lightning: 0,
          cyclone: 0
        };

        const riskRes = await calculateMarineRisk(riskInput);

        if (!isMounted) return;

        setRiskState(riskRes);
        setIsLoading((prev) => ({ ...prev, risk: false }));
      } catch (err) {
        if (import.meta.env?.DEV) {
          console.warn('[MarineAI Dashboard] Unexpected data load error:', err);
        }
        if (isMounted) {
          setIsLoading({ telemetry: false, pfz: false, alerts: false, risk: false });
        }
      }
    }

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, [activeLocation.lat, activeLocation.lon, refreshTrigger]);

  const isAnyFallback = telemetryState.isFallback || pfzState.isFallback || alertsState.isFallback || riskState.isFallback;

  return (
    <div className="max-w-[1680px] mx-auto">
      {/* OUTER NAUTICAL CHART FRAMING BORDER (MATCHING ADMIRALTY CHART LAYOUT) */}
      <div className="border border-[#1E3F5A] rounded-2xl p-4 md:p-5 bg-[#091D2C]/80 shadow-2xl space-y-4">
        {/* TOP STATUS BAR ROW */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#1E3F5A]">
          <div className="flex items-center gap-2.5 text-xs font-mono text-[#3E7C6B]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#3E7C6B] shadow-[0_0_8px_#3E7C6B]" />
            <span className="font-semibold tracking-wide">
              Live INCOIS & IMD Telemetry Synchronized: {activeLocation.name}
            </span>
            {isAnyFallback && (
              <span className="text-[10px] font-mono text-[#C9A961] bg-[#C9A961]/15 border border-[#C9A961]/40 px-2 py-0.5 rounded ml-2">
                Offline Mode
              </span>
            )}
          </div>
          <div className="text-xs font-mono text-[#8EA5B5] tracking-wider hidden sm:block">
            {activeLocation.lat.toFixed(4)}° N, {activeLocation.lon.toFixed(4)}° E
          </div>
        </div>

        {/* TOP ROW: SPATIAL MAP (FULL WIDTH) */}
        <div className="w-full">
          <SpatialIntelligenceMap
            pfzs={pfzState.data}
            location={activeLocation}
            isLoading={isLoading.pfz}
            isFallback={pfzState.isFallback}
          />
        </div>

        {/* BOTTOM ROW: TELEMETRY & ACTIVE ALERTS BLOCK (7 CARDS HORIZONTAL) */}
        <div className="w-full pt-1">
          <BottomTelemetryGrid
            telemetry={telemetryState.data}
            alertsCount={alertsState.data?.length ?? 0}
            isLoading={isLoading.telemetry}
            isFallback={telemetryState.isFallback}
            source={telemetryState.source}
          />
        </div>
      </div>
    </div>
  );
}
