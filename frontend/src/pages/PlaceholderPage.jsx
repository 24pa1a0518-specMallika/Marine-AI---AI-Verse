import React from 'react';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PlaceholderPage({ title, description, icon: Icon }) {
  const navigate = useNavigate();

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      {/* PAGE HEADER */}
      <div className="flex items-center justify-between bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-card">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="w-10 h-10 rounded-lg bg-[#1363DF]/10 text-[#1363DF] flex items-center justify-center">
              <Icon className="w-5 h-5" />
            </div>
          )}
          <div>
            <h1 className="font-bold text-xl text-[#0F172A] tracking-tight">{title}</h1>
            <p className="text-xs text-slate-500 mt-0.5">{description}</p>
          </div>
        </div>

        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </button>
      </div>

      {/* CARD CONTAINER FOLLOWING MASTER DESIGN */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-16 h-16 rounded-full bg-[#00B4D8]/10 text-[#00B4D8] flex items-center justify-center mb-4">
          <Sparkles className="w-8 h-8" />
        </div>
        <h2 className="font-bold text-lg text-[#0F172A] mb-2">{title} Module Initialized</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed mb-6">
          This area is ready to receive page-specific features. It inherits the exact visual language, 8-point grid, color tokens, and layout system established by the Dashboard.
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono bg-slate-100 text-slate-600 px-3 py-1.5 rounded-md border border-slate-200">
            Route: active
          </span>
          <span className="text-xs font-mono bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-md border border-emerald-200">
            Design Tokens: Locked
          </span>
        </div>
      </div>
    </div>
  );
}
