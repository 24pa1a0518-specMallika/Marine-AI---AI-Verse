import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import logoImg from '../../assets/logo.png';
import { 
  LayoutDashboard, 
  Fish,
  Route, 
  CloudSun, 
  ShieldAlert, 
  Hexagon,
  Settings,
  MapPin,
  Pencil,
  Menu,
  X,
  Check,
  Anchor,
  Waves,
  Compass,
  TrendingUp,
  GitCompare,
  BarChart3,
  Database,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { useLocation } from '../../context/LocationContext';
import { useLanguage } from '../../context/LanguageContext';

export default function Sidebar({ mobileOpen, onCloseMobile, collapsed, onToggleCollapse }) {
  const { selectedLocation, presets, setLocationPreset, setCustomCoordinates } = useLocation();
  const { t } = useLanguage();

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customLat, setCustomLat] = useState('');
  const [customLon, setCustomLon] = useState('');
  const [customError, setCustomError] = useState('');
  const [currentsExpanded, setCurrentsExpanded] = useState(true);

  const NAV_ITEMS = [
    { path: '/', label: t('overview') || 'PFZ', icon: Fish },
    { path: '/weather', label: t('weather') || 'Weather', icon: CloudSun },
    { path: '/safety-risk', label: t('safetyRisk') || 'Safety & Risk', icon: ShieldAlert },
    { path: '/geofences', label: t('geofences') || 'Geofences', icon: Hexagon },
  ];

  const CURRENTS_NAV_ITEMS = [
    { path: '/currents/overview', label: t('currentOverview') || 'Current Overview', icon: Compass },
    { path: '/currents/prediction', label: t('currentPrediction') || 'Current Prediction', icon: TrendingUp },
    { path: '/currents/comparison', label: t('historicalComparison') || 'Historical Comparison', icon: GitCompare },
    { path: '/currents/evaluation', label: t('modelEvaluation') || 'Model Evaluation', icon: BarChart3 },
    { path: '/currents/explorer', label: t('currentDataExplorer') || 'Current Data Explorer', icon: Database },
  ];

  const handleSelectPreset = (preset) => {
    setLocationPreset(preset);
    setIsLocationModalOpen(false);
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    setCustomError('');
    const lat = parseFloat(customLat);
    const lon = parseFloat(customLon);

    if (isNaN(lat) || isNaN(lon)) {
      setCustomError('Please enter valid numeric latitude and longitude.');
      return;
    }

    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      setCustomError('Latitude must be between -90 and 90, Longitude between -180 and 180.');
      return;
    }

    setCustomCoordinates(lat, lon, customName.trim() || undefined);
    setIsLocationModalOpen(false);
    setCustomName('');
    setCustomLat('');
    setCustomLon('');
  };

  return (
    <>
      {/* MOBILE BACKDROP OVERLAY */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* SIDEBAR CONTAINER WITH DYNAMIC WIDTH */}
      <aside
        className={`bg-[#132C40] text-[#D8D2C2] flex flex-col justify-between h-screen fixed lg:sticky top-0 border-r border-[#1E3F5A] z-50 select-none transition-all duration-300 ease-in-out ${
          collapsed ? 'w-20' : 'w-64'
        } ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* BRAND & TOP HEADER SECTION */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="p-3.5 border-b border-[#1E3F5A] flex items-center justify-between">
            {!collapsed ? (
              <div className="flex items-center gap-3">
                <img src={logoImg} alt="Marine AI Logo" className="w-9 h-9 object-contain shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="font-sans font-extrabold text-lg text-[#D8D2C2] tracking-tight leading-tight">
                    Marine AI
                  </span>
                  <span className="text-[11px] text-[#8EA5B5] font-medium leading-tight truncate mt-0.5">
                    {t('copilot_title') || 'Marine Intelligence Copilot'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="mx-auto" title="Marine AI">
                <img src={logoImg} alt="Marine AI Logo" className="w-9 h-9 object-contain" />
              </div>
            )}

            {/* COLLAPSE TOGGLE WITH STANDARD ☰ HAMBURGER MENU ICON (REQ 17) */}
            <div className="flex items-center gap-1 ml-auto">
              <button
                onClick={onToggleCollapse}
                className="hidden lg:flex p-1.5 rounded-lg text-[#8EA5B5] hover:text-[#D8D2C2] hover:bg-[#1E3F5A] transition-colors cursor-pointer"
                title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                aria-label="Toggle Sidebar"
              >
                <span className="text-lg font-bold leading-none select-none">☰</span>
              </button>
              <button
                onClick={onCloseMobile}
                className="lg:hidden text-[#8EA5B5] hover:text-[#D8D2C2] p-1 rounded-md cursor-pointer"
                aria-label="Close Mobile Sidebar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* NAVIGATION LINKS */}
          <nav className="p-3 space-y-1">
            {/* OCEAN CURRENT INTELLIGENCE SECTION (TOP OF SIDEBAR) */}
            <div className="pb-2">
              {!collapsed ? (
                <button
                  onClick={() => setCurrentsExpanded(!currentsExpanded)}
                  className="w-full flex items-center justify-between px-3.5 py-2 text-xs font-bold text-[#C9A961] uppercase tracking-wider hover:text-white transition-colors cursor-pointer border-b border-[#1E3F5A]/50 pb-2 mb-1"
                >
                  <div className="flex items-center gap-2">
                    <Waves className="w-3.5 h-3.5 text-[#C9A961]" />
                    <span>{t('currentsSection') || 'Ocean Current Intelligence'}</span>
                  </div>
                  {currentsExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </button>
              ) : (
                <div className="h-px bg-[#1E3F5A] my-2" title="Ocean Current Intelligence" />
              )}

              {(currentsExpanded || collapsed) && (
                <div className="space-y-0.5 mt-1">
                  {CURRENTS_NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={onCloseMobile}
                        title={collapsed ? item.label : undefined}
                        className={({ isActive }) =>
                          `flex items-center ${collapsed ? 'justify-center px-0' : 'gap-3 px-3.5'} py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
                            isActive
                              ? 'bg-[#C9A961] text-[#0B1E2D] shadow-md font-bold'
                              : 'text-[#8EA5B5] hover:text-[#D8D2C2] hover:bg-[#1E3F5A]/50'
                          }`
                        }
                      >
                        <Icon className="w-4 h-4 shrink-0 text-[#C9A961]/80" />
                        {!collapsed && <span className="truncate">{item.label}</span>}
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="h-px bg-[#1E3F5A] my-1 opacity-60" />

            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onCloseMobile}
                  title={collapsed ? item.label : undefined}
                  className={({ isActive }) =>
                    `flex items-center ${collapsed ? 'justify-center px-0' : 'justify-between px-3.5'} py-2.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-[#C9A961] text-[#0B1E2D] shadow-md font-bold'
                        : 'text-[#8EA5B5] hover:text-[#D8D2C2] hover:bg-[#1E3F5A]/50'
                    }`
                  }
                >
                  <div className="relative flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    {collapsed && item.hasAlert && (
                      <span className="absolute -top-1 -right-1 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#B8543C] opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#B8543C]" />
                      </span>
                    )}
                    {!collapsed && <span>{item.label}</span>}
                  </div>

                  {!collapsed && item.hasAlert && (
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#B8543C] opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#B8543C]" />
                    </span>
                  )}
                </NavLink>
              );
            })}

            <NavLink
              to="/settings"
              onClick={onCloseMobile}
              title={collapsed ? (t('settings') || "Settings") : undefined}
              className={({ isActive }) =>
                `flex items-center ${collapsed ? 'justify-center px-0' : 'gap-3 px-3.5'} py-2.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-[#C9A961] text-[#0B1E2D] shadow-md font-bold'
                    : 'text-[#8EA5B5] hover:text-[#D8D2C2] hover:bg-[#1E3F5A]/50'
                }`
              }
            >
              <Settings className="w-4 h-4 shrink-0" />
              {!collapsed && <span>{t('settings') || 'Settings'}</span>}
            </NavLink>
          </nav>
        </div>

        {/* MY LOCATION CARD AT BOTTOM - SYNCHRONIZED TO LOCATION CONTEXT */}
        <div className="p-3 border-t border-[#1E3F5A] bg-[#0B1E2D] space-y-3">
          {collapsed ? (
            <div 
              onClick={() => setIsLocationModalOpen(true)}
              className="flex justify-center p-1 text-[#C9A961] cursor-pointer hover:text-white transition-colors" 
              title={`${selectedLocation?.coordsText} - ${selectedLocation?.name}`}
            >
              <MapPin className="w-5 h-5" />
            </div>
          ) : (
            <div className="bg-[#132C40] border border-[#1E3F5A] rounded-xl p-3 space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#D8D2C2]">
                  <MapPin className="w-3.5 h-3.5 text-[#C9A961]" />
                  <span>{t('my_location') || 'My Location'}</span>
                </div>
                <button 
                  onClick={() => setIsLocationModalOpen(true)}
                  className="text-[#8EA5B5] hover:text-[#D8D2C2] transition-colors cursor-pointer"
                  title={t('change_location') || 'Change Location'}
                  id="sidebar-edit-location-btn"
                >
                  <Pencil className="w-3 h-3" />
                </button>
              </div>
              <div className="text-[11px] font-mono text-[#C9A961] leading-snug font-bold">
                {selectedLocation?.coordsText || (selectedLocation?.lat != null ? `${Number(selectedLocation.lat).toFixed(4)}° N, ${Number(selectedLocation.lon).toFixed(4)}° E` : '16.9800° N, 82.2400° E')}
              </div>
              <div className="text-[10px] text-[#8EA5B5] truncate font-medium">
                {selectedLocation?.name || 'Kakinada Coast'}
              </div>
              <button 
                onClick={() => setIsLocationModalOpen(true)}
                className="w-full mt-1 py-1.5 px-2 bg-transparent hover:bg-[#C9A961]/15 text-[#C9A961] border border-[#C9A961]/40 rounded-lg text-[11px] font-semibold transition-all cursor-pointer text-center"
                id="sidebar-change-location-btn"
              >
                {t('change_location') || 'Change Location'}
              </button>
            </div>
          )}

          {/* NAUTICAL ANCHOR FOOTER (MATCHING DESIGN) */}
          {!collapsed ? (
            <div className="relative overflow-hidden pt-2 pb-1 px-1 border-t border-[#1E3F5A]/50 flex items-center gap-3 select-none">
              <svg className="absolute inset-0 w-full h-full opacity-15 pointer-events-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60">
                <path d="M0 35 Q 50 15, 100 35 T 200 35" fill="none" stroke="#C9A961" strokeWidth="1" />
                <path d="M0 48 Q 50 28, 100 48 T 200 48" fill="none" stroke="#8EA5B5" strokeWidth="1" />
                <path d="M0 20 Q 50 0, 100 20 T 200 20" fill="none" stroke="#1E3F5A" strokeWidth="1" />
              </svg>
              <Anchor className="w-6 h-6 text-[#8EA5B5]/60 shrink-0 relative z-10" />
              <div className="text-[9px] font-mono tracking-widest leading-tight uppercase font-bold text-[#8EA5B5]/75 relative z-10">
                <div>SAFER SEAS</div>
                <div>BRIGHTER TOMORROWS</div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center pt-2 text-[#8EA5B5]/50 border-t border-[#1E3F5A]/50">
              <Anchor className="w-5 h-5" />
            </div>
          )}
        </div>
      </aside>

      {/* CHANGE LOCATION MODAL */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 bg-[#0B1E2D]/80 backdrop-blur-xs z-[1000] flex items-center justify-center p-4">
          <div className="bg-[#132C40] border border-[#1E3F5A] rounded-xl shadow-2xl max-w-md w-full p-5 text-[#D8D2C2] space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-[#1E3F5A] pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#C9A961]" />
                <h3 className="font-bold text-sm text-[#D8D2C2]">{t('change_location') || 'Change Active Location'}</h3>
              </div>
              <button
                onClick={() => setIsLocationModalOpen(false)}
                className="text-[#8EA5B5] hover:text-[#D8D2C2] p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* PRESET LOCATION OPTIONS */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-300">{t('select_coastal_station') || 'Select Coastal Station / Preset:'}</p>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {presets.map((preset) => {
                  const isSelected = selectedLocation?.name === preset.name;
                  return (
                    <button
                      key={preset.name}
                      onClick={() => handleSelectPreset(preset)}
                      className={`w-full text-left p-2.5 rounded-lg border text-xs flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#1363DF]/30 border-[#1363DF] text-white font-semibold'
                          : 'bg-[#04111D] border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-white flex items-center gap-1.5">
                          {preset.name}
                          {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">{preset.coordsText}</div>
                      </div>
                      <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-mono">
                        {preset.zone}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CUSTOM COORDINATES FORM */}
            <form onSubmit={handleCustomSubmit} className="pt-2 border-t border-slate-800 space-y-3 text-xs">
              <p className="text-xs font-semibold text-slate-300">{t('custom_coords') || 'Custom Coordinates'}:</p>
              
              {customError && (
                <div className="p-2 bg-rose-500/15 border border-rose-500/30 rounded-lg text-rose-400 text-xs">
                  {customError}
                </div>
              )}

              <div>
                <input
                  type="text"
                  placeholder={t('location_name') || 'Location Name (e.g. Bay of Bengal Sector 4)'}
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full bg-[#04111D] border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-[#00B4D8]"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  step="any"
                  required
                  placeholder={`${t('latitude') || 'Latitude'} (e.g. 16.98)`}
                  value={customLat}
                  onChange={(e) => setCustomLat(e.target.value)}
                  className="bg-[#04111D] border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-[#00B4D8]"
                />
                <input
                  type="number"
                  step="any"
                  required
                  placeholder={`${t('longitude') || 'Longitude'} (e.g. 82.24)`}
                  value={customLon}
                  onChange={(e) => setCustomLon(e.target.value)}
                  className="bg-[#04111D] border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-[#00B4D8]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsLocationModalOpen(false)}
                  className="px-3 py-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  {t('cancel') || 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#1363DF] hover:bg-[#00B4D8] text-white font-medium rounded-lg transition-colors cursor-pointer shadow-sm"
                >
                  {t('apply') || 'Apply Location'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
