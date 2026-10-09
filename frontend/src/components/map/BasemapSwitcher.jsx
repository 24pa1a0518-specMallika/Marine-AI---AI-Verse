import React, { useState } from 'react';
import { Layers } from 'lucide-react';
import { BASEMAP_CONFIGS } from './BaseMapLayers';

export default function BasemapSwitcher({ basemap = 'satellite', onBasemapChange, className = '' }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0B1E2D] hover:bg-[#183852] text-[#D8D2C2] hover:text-white rounded-lg text-xs font-mono font-semibold shadow-md border border-[#1E3F5A] transition-all cursor-pointer"
        title="Switch Map Style (Satellite / Terrain / Standard)"
        id="basemap-layer-switcher-btn"
      >
        <Layers className="w-3.5 h-3.5 text-[#C9A961]" />
        <span className="capitalize">{BASEMAP_CONFIGS[basemap]?.name || 'Satellite'}</span>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-1.5 w-44 bg-[#132C40] border border-[#1E3F5A] rounded-xl shadow-2xl p-1.5 z-[1100] text-xs space-y-1 animate-in fade-in zoom-in-95 duration-100"
          onMouseLeave={() => setIsOpen(false)}
        >
          <div className="px-2 py-1 text-[10px] font-bold text-[#8EA5B5] uppercase tracking-wider font-mono">
            Map View
          </div>
          {Object.values(BASEMAP_CONFIGS).map((config) => {
            const isSelected = basemap === config.id;
            return (
              <button
                key={config.id}
                type="button"
                onClick={() => {
                  if (onBasemapChange) onBasemapChange(config.id);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#C9A961]/20 text-[#C9A961] font-bold'
                    : 'text-[#8EA5B5] hover:text-[#D8D2C2] hover:bg-[#1E3F5A] font-medium'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{config.icon}</span>
                  <span>{config.name}</span>
                </div>
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#C9A961]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
