import React, { useState, useEffect } from 'react';
import { GitCompare, MapPin, Calendar, Filter, RefreshCw, Activity, Layers } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { getCurrentsComparison } from '../api/currentsApi';
import { useLocation } from '../context/LocationContext';

export default function CurrentsComparisonPage() {
  const { selectedLocation } = useLocation();

  const [latInput, setLatInput] = useState(selectedLocation?.lat ?? 16.98);
  const [lonInput, setLonInput] = useState(selectedLocation?.lon ?? 82.24);
  const [daysInput, setDaysInput] = useState(30);

  const [seriesData, setSeriesData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Series visibility toggles
  const [showObserved, setShowObserved] = useState(true);
  const [showPersistence, setShowPersistence] = useState(true);
  const [showRfModel, setShowRfModel] = useState(true);

  const loadComparison = async () => {
    setLoading(true);
    try {
      const res = await getCurrentsComparison({ lat: latInput, lon: lonInput, days: daysInput });
      const rawData = res?.data?.data || res?.data || [];
      setSeriesData(Array.isArray(rawData) ? rawData : []);
    } catch (err) {
      console.error('Error loading current comparison data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComparison();
  }, [latInput, lonInput, daysInput]);

  return (
    <div className="max-w-[1680px] mx-auto space-y-6">
      {/* HEADER */}
      <div className="bg-[#091D2C] border border-[#1E3F5A] rounded-2xl p-5 md:p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#C9A961] mb-1">
            <GitCompare className="w-4 h-4" />
            <span className="uppercase font-bold tracking-widest">RESEARCH COMPARISON WORKSPACE</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#D8D2C2] tracking-tight">Historical Comparison</h1>
          <p className="text-xs text-[#8EA5B5] mt-1">
            Compare time-series observations against persistence baselines and Random Forest model predictions.
          </p>
        </div>

        {/* CONTROLS */}
        <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
          <div className="flex items-center gap-2 bg-[#0F2436] border border-[#1E3F5A] px-3 py-1.5 rounded-xl text-white font-bold">
            <Calendar className="w-3.5 h-3.5 text-[#C9A961]" />
            <select
              value={daysInput}
              onChange={(e) => setDaysInput(Number(e.target.value))}
              className="bg-transparent focus:outline-none cursor-pointer"
            >
              <option value={7} className="bg-[#0B1E2D]">Last 7 Days</option>
              <option value={14} className="bg-[#0B1E2D]">Last 14 Days</option>
              <option value={30} className="bg-[#0B1E2D]">Last 30 Days</option>
              <option value={60} className="bg-[#0B1E2D]">Full Coverage (60 Days)</option>
            </select>
          </div>

          <button
            onClick={loadComparison}
            className="p-2 bg-[#0F2436] hover:bg-[#1E3F5A] text-[#8EA5B5] hover:text-white border border-[#1E3F5A] rounded-xl transition-all cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#C9A961]' : ''}`} />
          </button>
        </div>
      </div>

      {/* SERIES TOGGLES BAR */}
      <div className="bg-[#091D2C] border border-[#1E3F5A] rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2 text-[#8EA5B5]">
          <Filter className="w-4 h-4 text-[#C9A961]" />
          <span className="font-bold uppercase">Series Visibility:</span>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer text-[#00F5D4] font-bold">
            <input type="checkbox" checked={showObserved} onChange={(e) => setShowObserved(e.target.checked)} className="rounded accent-[#00F5D4]" />
            <span>Observed Series</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-[#C9A961] font-bold">
            <input type="checkbox" checked={showRfModel} onChange={(e) => setShowRfModel(e.target.checked)} className="rounded accent-[#C9A961]" />
            <span>Random Forest Model</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-slate-300 font-bold">
            <input type="checkbox" checked={showPersistence} onChange={(e) => setShowPersistence(e.target.checked)} className="rounded accent-slate-300" />
            <span>Persistence Baseline</span>
          </label>
        </div>
      </div>

      {/* TIME-SERIES VELOCITY CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* EASTWARD VELOCITY (u) CHART */}
        <div className="bg-[#091D2C] border border-[#1E3F5A] rounded-2xl p-5 shadow-xl space-y-3">
          <h2 className="text-xs font-bold text-[#D8D2C2] uppercase font-mono tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#C9A961]" />
            Eastward Velocity Comparison (u in m/s)
          </h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={seriesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E3F5A" opacity={0.5} />
                <XAxis dataKey="timestamp" stroke="#8EA5B5" tick={{ fontSize: 10 }} />
                <YAxis stroke="#8EA5B5" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#091D2C', borderColor: '#1E3F5A', fontSize: '11px', borderRadius: '8px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                {showObserved && <Line type="monotone" dataKey="u_observed" name="Observed u" stroke="#00F5D4" strokeWidth={2} dot={false} />}
                {showRfModel && <Line type="monotone" dataKey="u_rf_model" name="RF Model u" stroke="#C9A961" strokeWidth={2} strokeDasharray="4 4" dot={false} />}
                {showPersistence && <Line type="monotone" dataKey="u_persistence" name="Persistence u" stroke="#94A3B8" strokeWidth={1.5} strokeDasharray="2 2" dot={false} />}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* NORTHWARD VELOCITY (v) CHART */}
        <div className="bg-[#091D2C] border border-[#1E3F5A] rounded-2xl p-5 shadow-xl space-y-3">
          <h2 className="text-xs font-bold text-[#D8D2C2] uppercase font-mono tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#00F5D4]" />
            Northward Velocity Comparison (v in m/s)
          </h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={seriesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E3F5A" opacity={0.5} />
                <XAxis dataKey="timestamp" stroke="#8EA5B5" tick={{ fontSize: 10 }} />
                <YAxis stroke="#8EA5B5" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#091D2C', borderColor: '#1E3F5A', fontSize: '11px', borderRadius: '8px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                {showObserved && <Line type="monotone" dataKey="v_observed" name="Observed v" stroke="#00F5D4" strokeWidth={2} dot={false} />}
                {showRfModel && <Line type="monotone" dataKey="v_rf_model" name="RF Model v" stroke="#C9A961" strokeWidth={2} strokeDasharray="4 4" dot={false} />}
                {showPersistence && <Line type="monotone" dataKey="v_persistence" name="Persistence v" stroke="#94A3B8" strokeWidth={1.5} strokeDasharray="2 2" dot={false} />}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* RAW DATA COMPARISON TABLE */}
      <div className="bg-[#091D2C] border border-[#1E3F5A] rounded-2xl p-5 shadow-xl space-y-3">
        <h3 className="text-xs font-bold text-[#D8D2C2] uppercase font-mono tracking-wider">
          Aligned Historical Records Table
        </h3>

        <div className="overflow-x-auto font-mono text-xs max-h-72 overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-[#0F2436] text-[#8EA5B5] border-b border-[#1E3F5A]">
              <tr>
                <th className="p-2.5">Date</th>
                <th className="p-2.5">Observed Speed</th>
                <th className="p-2.5">RF Model Speed</th>
                <th className="p-2.5">Persistence Speed</th>
                <th className="p-2.5">RF Residual (u)</th>
                <th className="p-2.5">Persistence Residual (u)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E3F5A]/60">
              {seriesData.map((r, idx) => (
                <tr key={idx} className="hover:bg-[#0F2436]/40">
                  <td className="p-2.5 font-bold text-white">{r.timestamp}</td>
                  <td className="p-2.5 text-[#00F5D4] font-bold">{r.speed_observed} m/s</td>
                  <td className="p-2.5 text-[#C9A961] font-bold">{r.speed_rf_model} m/s</td>
                  <td className="p-2.5 text-slate-300">{r.speed_persistence} m/s</td>
                  <td className="p-2.5 text-[#00F5D4]">{r.residual_u_rf} m/s</td>
                  <td className="p-2.5 text-rose-400">{r.residual_u_pers} m/s</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
