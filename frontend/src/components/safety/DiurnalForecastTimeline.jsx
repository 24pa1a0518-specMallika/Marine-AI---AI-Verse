import React from 'react';
import { Clock } from 'lucide-react';

export default function DiurnalForecastTimeline() {
  const phases = [
    {
      id: 1,
      title: 'MORNING PHASE',
      time: '04:00 - 12:00 IST',
      score: '34',
      scoreLabel: 'Moderate',
      scoreBadge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      wind: '16 km/h SE',
      wave: '1.3 m',
      rain: '15% Chance',
      statusText: 'OPERATIONAL STATUS: FAVORABLE DEPARTURE',
      statusBg: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    {
      id: 2,
      title: 'AFTERNOON PHASE',
      time: '12:00 - 18:00 IST',
      score: '45',
      scoreLabel: 'Peak Risk',
      scoreBadge: 'bg-amber-100 text-amber-800 border-amber-300 font-bold',
      wind: '21 km/h SE',
      wave: '1.6 m',
      rain: '35% Chance',
      statusText: 'OPERATIONAL STATUS: SWELL PEAK - CAUTION',
      statusBg: 'bg-amber-50 text-amber-800 border-amber-300'
    },
    {
      id: 3,
      title: 'EVENING PHASE',
      time: '18:00 - 24:00 IST',
      score: '38',
      scoreLabel: 'Moderate',
      scoreBadge: 'bg-slate-100 text-slate-700 border-slate-200',
      wind: '17 km/h S',
      wave: '1.4 m',
      rain: '20% Chance',
      statusText: 'OPERATIONAL STATUS: CALMING TREND',
      statusBg: 'bg-slate-50 text-slate-700 border-slate-200'
    }
  ];

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card p-5 space-y-4">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2E8F0] pb-3">
        <div>
          <h3 className="font-bold text-lg text-[#0F172A]">Diurnal Forecast Timeline</h3>
          <p className="text-xs text-slate-500">Segmented 24-hour tactical horizon across distinct maritime operating windows.</p>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-mono text-slate-500">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>TIMEZONE: INDIAN STANDARD TIME (UTC +05:30)</span>
        </div>
      </div>

      {/* 3 PHASE CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {phases.map((phase) => (
          <div
            key={phase.id}
            className="bg-slate-50/50 border border-slate-200 rounded-xl p-4 space-y-3 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div>
                <span className="font-bold text-xs text-[#0F172A] block">{phase.title}</span>
                <span className="text-[10px] font-mono text-slate-400">{phase.time}</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${phase.scoreBadge}`}>
                {phase.scoreLabel}
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="font-extrabold text-2xl text-[#0F172A]">{phase.score}</span>
              <span className="text-xs font-mono text-slate-400">/ 100 Risk</span>
            </div>

            <div className="space-y-1.5 text-xs font-mono text-slate-600 bg-white p-2.5 rounded-lg border border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-400">Wind Speed:</span>
                <span className="font-semibold text-slate-800">{phase.wind}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Wave Height:</span>
                <span className="font-semibold text-slate-800">{phase.wave}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Precipitation:</span>
                <span className="font-semibold text-slate-800">{phase.rain}</span>
              </div>
            </div>

            <div className={`p-2 rounded-lg text-center text-[10px] font-mono font-bold border ${phase.statusBg}`}>
              {phase.statusText}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
