import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Waves, TrendingUp, ShieldCheck, Activity, RefreshCw, ArrowUpRight, Database, Info } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { getCurrentsOverview, getCurrentsGrid, getCurrentsComparison } from '../api/currentsApi';
import CurrentVectorMap from '../components/currents/CurrentVectorMap';
import { useLocation } from '../context/LocationContext';

export default function CurrentsOverviewPage() {
  const navigate = useNavigate();
  const { selectedLocation } = useLocation();

  const [overview, setOverview] = useState(null);
  const [gridData, setGridData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);

  const activeLoc = {
    lat: selectedLocation?.lat ?? 16.98,
    lon: selectedLocation?.lon ?? 82.24,
    name: selectedLocation?.name ?? 'Kakinada Coast'
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [overviewRes, gridRes, trendRes] = await Promise.all([
        getCurrentsOverview(),
        getCurrentsGrid({ limit: 120, lat: activeLoc.lat, lon: activeLoc.lon }),
        getCurrentsComparison({ lat: activeLoc.lat, lon: activeLoc.lon, days: 14 })
      ]);

      setOverview(overviewRes?.data || overviewRes);
      const rawGrid = gridRes?.data?.data || gridRes?.data || [];
      const rawTrend = trendRes?.data?.data || trendRes?.data || [];
      setGridData(Array.isArray(rawGrid) ? rawGrid : []);
      setTrendData(Array.isArray(rawTrend) ? rawTrend : []);
    } catch (err) {
      console.error('Error loading currents overview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeLoc.lat, activeLoc.lon]);

  const summary = overview?.summary || {};
  const service = overview?.predictionService || {};

  return (
    <div className="max-w-[1680px] mx-auto space-y-6">
      {/* HEADER SECTION */}
      <div className="bg-[#091D2C] border border-[#1E3F5A] rounded-2xl p-5 md:p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#C9A961] mb-1">
            <Compass className="w-4 h-4" />
            <span className="uppercase font-bold tracking-widest">OCEAN CURRENT INTELLIGENCE</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#D8D2C2] tracking-tight">Current Overview</h1>
          <p className="text-xs text-[#8EA5B5] mt-1">
            Monitor observed and predicted ocean-current conditions across the Bay of Bengal and East Coast domain.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#0F2436] border border-[#1E3F5A] px-3.5 py-2 rounded-xl text-xs font-mono text-[#D8D2C2]">
            <div className="text-[10px] text-[#8EA5B5]">DATA SOURCE</div>
            <div className="font-bold text-[#00F5D4] flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-[#00F5D4] animate-pulse" />
              {overview?.dataSource || 'NASA PO.DAAC OSCAR V2.0'}
            </div>
          </div>

          <button
            onClick={loadData}
            className="p-2.5 bg-[#0F2436] hover:bg-[#1E3F5A] text-[#8EA5B5] hover:text-white border border-[#1E3F5A] rounded-xl transition-all cursor-pointer"
            title="Refresh Current Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#C9A961]' : ''}`} />
          </button>
        </div>
      </div>

      {/* SUMMARY STATS CARDS (6 CARDS) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* CURRENT SPEED */}
        <div className="bg-[#091D2C] border border-[#1E3F5A] rounded-xl p-4 space-y-1">
          <div className="text-[11px] font-mono text-[#8EA5B5] uppercase">Current Speed</div>
          <div className="text-xl font-mono font-bold text-white">
            {summary.latestSpeed != null ? `${summary.latestSpeed} m/s` : 'Unavailable'}
          </div>
          <div className="text-[10px] text-[#00F5D4] font-mono">Real-time Surface Speed</div>
        </div>

        {/* DIRECTION */}
        <div className="bg-[#091D2C] border border-[#1E3F5A] rounded-xl p-4 space-y-1">
          <div className="text-[11px] font-mono text-[#8EA5B5] uppercase">Direction</div>
          <div className="text-xl font-mono font-bold text-[#C9A961]">
            {summary.latestDirection != null ? `${summary.latestDirection}°` : 'Unavailable'}
          </div>
          <div className="text-[10px] text-[#8EA5B5] font-mono">Oceanographic Flow</div>
        </div>

        {/* EASTWARD VELOCITY (u) */}
        <div className="bg-[#091D2C] border border-[#1E3F5A] rounded-xl p-4 space-y-1">
          <div className="text-[11px] font-mono text-[#8EA5B5] uppercase">Eastward Velocity (u)</div>
          <div className="text-xl font-mono font-bold text-white">
            {summary.u != null ? `${summary.u} m/s` : 'Unavailable'}
          </div>
          <div className="text-[10px] text-[#8EA5B5] font-mono">Zonal Component</div>
        </div>

        {/* NORTHWARD VELOCITY (v) */}
        <div className="bg-[#091D2C] border border-[#1E3F5A] rounded-xl p-4 space-y-1">
          <div className="text-[11px] font-mono text-[#8EA5B5] uppercase">Northward Velocity (v)</div>
          <div className="text-xl font-mono font-bold text-white">
            {summary.v != null ? `${summary.v} m/s` : 'Unavailable'}
          </div>
          <div className="text-[10px] text-[#8EA5B5] font-mono">Meridional Component</div>
        </div>

        {/* OBSERVATIONS COUNT */}
        <div className="bg-[#091D2C] border border-[#1E3F5A] rounded-xl p-4 space-y-1">
          <div className="text-[11px] font-mono text-[#8EA5B5] uppercase">Observation Count</div>
          <div className="text-xl font-mono font-bold text-[#00F5D4]">
            {summary.observationCount != null ? summary.observationCount.toLocaleString() : 'Unavailable'}
          </div>
          <div className="text-[10px] text-[#8EA5B5] font-mono">Grid Cell Samples</div>
        </div>

        {/* PIPELINE STATUS */}
        <div className="bg-[#091D2C] border border-[#1E3F5A] rounded-xl p-4 space-y-1">
          <div className="text-[11px] font-mono text-[#8EA5B5] uppercase">Model Pipeline</div>
          <div className="text-sm font-mono font-bold text-[#00F5D4]">
            {service.status || 'EVALUATED_READY'}
          </div>
          <div className="text-[10px] text-[#C9A961] font-mono">Random Forest Regressor</div>
        </div>
      </div>

      {/* MAIN CONTENT GRID: VECTOR MAP & TREND CHART */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* MAP PREVIEW (7 COLUMNS) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#D8D2C2] uppercase font-mono tracking-wider flex items-center gap-2">
              <Waves className="w-4 h-4 text-[#C9A961]" />
              Surface Current Field Map
            </h2>
            <button
              onClick={() => navigate('/currents/map')}
              className="text-xs text-[#C9A961] hover:text-white font-mono flex items-center gap-1 transition-colors cursor-pointer"
            >
              Full Interactive Map <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <CurrentVectorMap
            currents={gridData}
            location={activeLoc}
            onSelectLocation={(lat, lon) => navigate(`/currents/prediction?lat=${lat}&lon=${lon}`)}
          />
        </div>

        {/* HISTORICAL TREND CHART & QUICK SHORTCUTS (5 COLUMNS) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-[#091D2C] border border-[#1E3F5A] rounded-2xl p-5 shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-[#D8D2C2] uppercase font-mono tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#00F5D4]" />
              Historical Velocity Trend ({activeLoc.name})
            </h2>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E3F5A" opacity={0.5} />
                  <XAxis dataKey="timestamp" stroke="#8EA5B5" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#8EA5B5" tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
                  <Tooltip contentStyle={{ backgroundColor: '#091D2C', borderColor: '#1E3F5A', fontSize: '11px', borderRadius: '8px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Line type="monotone" dataKey="speed_observed" name="Observed Speed (m/s)" stroke="#00F5D4" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="speed_rf_model" name="RF Predicted Speed" stroke="#C9A961" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* WORKSPACE SHORTCUT BUTTONS */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate('/currents/prediction')}
              className="p-3.5 bg-[#0F2436] hover:bg-[#1E3F5A] border border-[#1E3F5A] rounded-xl text-left transition-all cursor-pointer group"
            >
              <div className="text-xs font-bold text-[#C9A961] group-hover:text-white flex items-center justify-between">
                <span>Current Prediction</span>
                <TrendingUp className="w-4 h-4" />
              </div>
              <p className="text-[11px] text-[#8EA5B5] mt-1">Run RF model forecasts given location & horizon.</p>
            </button>

            <button
              onClick={() => navigate('/currents/evaluation')}
              className="p-3.5 bg-[#0F2436] hover:bg-[#1E3F5A] border border-[#1E3F5A] rounded-xl text-left transition-all cursor-pointer group"
            >
              <div className="text-xs font-bold text-[#00F5D4] group-hover:text-white flex items-center justify-between">
                <span>Model Evaluation</span>
                <ShieldCheck className="w-4 h-4" />
              </div>
              <p className="text-[11px] text-[#8EA5B5] mt-1">Inspect MAE & RMSE vs Persistence baseline.</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
