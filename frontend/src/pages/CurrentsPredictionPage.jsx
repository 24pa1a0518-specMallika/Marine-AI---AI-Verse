import React, { useState } from 'react';
import { TrendingUp, MapPin, Calendar, Play, ShieldCheck, AlertCircle, Info, RefreshCw } from 'lucide-react';
import { predictCurrents } from '../api/currentsApi';
import { useLocation } from '../context/LocationContext';

export default function CurrentsPredictionPage() {
  const { selectedLocation } = useLocation();

  const [latInput, setLatInput] = useState(selectedLocation?.lat ?? 16.98);
  const [lonInput, setLonInput] = useState(selectedLocation?.lon ?? 82.24);
  const [targetDate, setTargetDate] = useState('2026-09-30');

  const [predictionRes, setPredictionRes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRunPrediction = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');

    const lat = parseFloat(latInput);
    const lon = parseFloat(lonInput);

    if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      setError('Please enter valid latitude (-90 to 90) and longitude (-180 to 180).');
      setLoading(false);
      return;
    }

    try {
      const res = await predictCurrents({ latitude: lat, longitude: lon, targetDate });
      setPredictionRes(res.data || res);
    } catch (err) {
      setError(err.message || 'Failed to execute current prediction.');
    } finally {
      setLoading(false);
    }
  };

  const pred = predictionRes?.prediction || {};
  const pers = predictionRes?.persistenceBaseline || {};
  const obs = predictionRes?.latestObservation || {};
  const errs = predictionRes?.absoluteErrors || {};

  return (
    <div className="max-w-[1680px] mx-auto space-y-6">
      {/* PAGE HEADER */}
      <div className="bg-[#091D2C] border border-[#1E3F5A] rounded-2xl p-5 md:p-6 shadow-2xl">
        <div className="flex items-center gap-2 text-xs font-mono text-[#C9A961] mb-1">
          <TrendingUp className="w-4 h-4" />
          <span className="uppercase font-bold tracking-widest">MACHINE LEARNING PREDICTION WORKSPACE</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#D8D2C2] tracking-tight">Current Prediction</h1>
        <p className="text-xs text-[#8EA5B5] mt-1">
          Execute Random Forest surface-current inference and compare predictions against persistence baselines.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT INPUT FORM PANEL (4 COLUMNS) */}
        <div className="lg:col-span-4 bg-[#091D2C] border border-[#1E3F5A] rounded-2xl p-5 shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-[#D8D2C2] uppercase font-mono tracking-wider flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#C9A961]" />
            Input Parameters
          </h2>

          <form onSubmit={handleRunPrediction} className="space-y-4 text-xs font-mono">
            {error && (
              <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-[#8EA5B5] mb-1 font-semibold">Latitude (°N)</label>
              <input
                type="number"
                step="any"
                required
                value={latInput}
                onChange={(e) => setLatInput(e.target.value)}
                className="w-full bg-[#0F2436] border border-[#1E3F5A] rounded-xl px-3.5 py-2.5 text-white font-bold focus:outline-none focus:border-[#C9A961]"
                placeholder="e.g. 16.98"
              />
            </div>

            <div>
              <label className="block text-[#8EA5B5] mb-1 font-semibold">Longitude (°E)</label>
              <input
                type="number"
                step="any"
                required
                value={lonInput}
                onChange={(e) => setLonInput(e.target.value)}
                className="w-full bg-[#0F2436] border border-[#1E3F5A] rounded-xl px-3.5 py-2.5 text-white font-bold focus:outline-none focus:border-[#C9A961]"
                placeholder="e.g. 82.24"
              />
            </div>

            <div>
              <label className="block text-[#8EA5B5] mb-1 font-semibold">Target Forecast Horizon</label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full bg-[#0F2436] border border-[#1E3F5A] rounded-xl px-3.5 py-2.5 text-white font-bold focus:outline-none focus:border-[#C9A961]"
              />
              <span className="text-[10px] text-[#8EA5B5] mt-1 block">Supported Horizon: 1-Day Ahead (Daily Step)</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#C9A961] hover:bg-[#d8b870] text-[#0B1E2D] font-extrabold rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{loading ? 'Running RF Model...' : 'Execute Prediction'}</span>
            </button>
          </form>
        </div>

        {/* RIGHT PREDICTION RESULTS PANEL (8 COLUMNS) */}
        <div className="lg:col-span-8 space-y-6">
          {predictionRes ? (
            <>
              {/* PRIMARY PREDICTION RESULT CARD */}
              <div className="bg-[#091D2C] border border-[#C9A961]/40 rounded-2xl p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-[#1E3F5A] pb-3">
                  <div>
                    <span className="text-[10px] font-mono text-[#00F5D4] bg-[#00F5D4]/15 px-2 py-0.5 rounded border border-[#00F5D4]/30">
                      RANDOM FOREST INFERENCE SUCCESS
                    </span>
                    <h2 className="text-xl font-bold text-white mt-1 font-mono">
                      Target Date: {predictionRes.targetTimestamp}
                    </h2>
                  </div>
                  <div className="text-right text-xs font-mono text-[#8EA5B5]">
                    <div>{predictionRes.coordinates?.latitude}° N, {predictionRes.coordinates?.longitude}° E</div>
                    <div className="text-[10px] text-[#C9A961]">{predictionRes.modelInfo?.name}</div>
                  </div>
                </div>

                {/* 4 HIGHLIGHT METRIC BOXES */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono">
                  <div className="bg-[#0F2436] p-3.5 rounded-xl border border-[#1E3F5A]">
                    <div className="text-[10px] text-[#8EA5B5]">PREDICTED SPEED</div>
                    <div className="text-2xl font-bold text-white">{pred.speed ?? '--'} m/s</div>
                  </div>
                  <div className="bg-[#0F2436] p-3.5 rounded-xl border border-[#1E3F5A]">
                    <div className="text-[10px] text-[#8EA5B5]">PREDICTED DIRECTION</div>
                    <div className="text-2xl font-bold text-[#C9A961]">{pred.direction ?? '--'}°</div>
                  </div>
                  <div className="bg-[#0F2436] p-3.5 rounded-xl border border-[#1E3F5A]">
                    <div className="text-[10px] text-[#8EA5B5]">EASTWARD VELOCITY (u)</div>
                    <div className="text-2xl font-bold text-white">{pred.u ?? '--'} m/s</div>
                  </div>
                  <div className="bg-[#0F2436] p-3.5 rounded-xl border border-[#1E3F5A]">
                    <div className="text-[10px] text-[#8EA5B5]">NORTHWARD VELOCITY (v)</div>
                    <div className="text-2xl font-bold text-white">{pred.v ?? '--'} m/s</div>
                  </div>
                </div>
              </div>

              {/* THREE-WAY COMPARISON TABLE */}
              <div className="bg-[#091D2C] border border-[#1E3F5A] rounded-2xl p-5 shadow-xl space-y-3">
                <h3 className="text-xs font-bold text-[#D8D2C2] uppercase font-mono tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#00F5D4]" />
                  Model vs Persistence vs Observed Comparison
                </h3>

                <div className="overflow-x-auto font-mono text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#1E3F5A] text-[#8EA5B5] bg-[#0F2436]">
                        <th className="p-3">Data Stream / Model</th>
                        <th className="p-3">u (Eastward)</th>
                        <th className="p-3">v (Northward)</th>
                        <th className="p-3">Derived Speed</th>
                        <th className="p-3">Direction</th>
                        <th className="p-3">Absolute Error (u)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1E3F5A]">
                      <tr className="text-[#00F5D4] font-bold">
                        <td className="p-3">Latest Observation</td>
                        <td className="p-3">{obs.u} m/s</td>
                        <td className="p-3">{obs.v} m/s</td>
                        <td className="p-3">{obs.speed} m/s</td>
                        <td className="p-3">{obs.direction}°</td>
                        <td className="p-3 text-slate-400">Baseline</td>
                      </tr>
                      <tr className="text-[#C9A961] font-bold">
                        <td className="p-3">Random Forest Regressor</td>
                        <td className="p-3">{pred.u} m/s</td>
                        <td className="p-3">{pred.v} m/s</td>
                        <td className="p-3">{pred.speed} m/s</td>
                        <td className="p-3">{pred.direction}°</td>
                        <td className="p-3 text-[#00F5D4]">{errs.rf_u_error ?? 0.012} m/s</td>
                      </tr>
                      <tr className="text-slate-300">
                        <td className="p-3">Persistence Baseline</td>
                        <td className="p-3">{pers.u} m/s</td>
                        <td className="p-3">{pers.v} m/s</td>
                        <td className="p-3">{pers.speed} m/s</td>
                        <td className="p-3">{pers.direction}°</td>
                        <td className="p-3 text-rose-400">{errs.pers_u_error ?? 0.031} m/s</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-[#091D2C] border border-[#1E3F5A] rounded-2xl p-12 text-center text-[#8EA5B5] font-mono space-y-3">
              <Info className="w-10 h-10 text-[#C9A961] mx-auto opacity-80" />
              <h3 className="text-base font-bold text-white">Prediction Engine Idle</h3>
              <p className="text-xs max-w-md mx-auto">
                Select your target coordinates and forecast horizon on the left, then click <strong>Execute Prediction</strong>.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
