import React, { useState } from 'react';
import logoImg from '../../assets/logo.png';
import { 
  MapPin, 
  Clock, 
  MessageSquare, 
  AlertTriangle, 
  RotateCw, 
  User,
  LogOut,
  Check,
  Shield
} from 'lucide-react';
import { useLocation } from '../../context/LocationContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Header({ onAskAIClick, onEmergencyClick, onChatWithAIClick, onAlertsClick }) {
  const { selectedLocation, setSelectedLocationByName, presets, refreshLocationData } = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();

  const handleChatClick = onChatWithAIClick || onAskAIClick;
  const handleAlertsClick = onAlertsClick || onEmergencyClick;

  // Preserved dataMode state and logic (hidden from UI per Req 4)
  const [dataMode, setDataMode] = useState('Real-time Data');
  const [lastSync, setLastSync] = useState('Just now');
  const [isSyncing, setIsSyncing] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleRefresh = () => {
    setIsSyncing(true);
    refreshLocationData();
    setTimeout(() => {
      setIsSyncing(false);
      setLastSync('Just now');
    }, 600);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  const displayName = userProfile?.displayName || currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Mariner';
  const displayEmail = currentUser?.email || 'mariner@marineai.gov';
  const photoURL = userProfile?.photoURL || currentUser?.photoURL;

  return (
    <header className="h-16 bg-[#0B1E2D] border-b border-[#1E3F5A] px-4 md:px-6 flex items-center justify-between sticky top-0 z-20 shadow-sm text-[#D8D2C2]">
      {/* LEFT CONTENT */}
      <div className="flex items-center gap-3 md:gap-5">
        <div className="flex items-center gap-3 text-xs text-[#8EA5B5]">
          {/* LOCATION SELECTOR */}
          <div className="flex items-center gap-1.5 bg-[#0F2436] border border-[#1E3F5A] px-3 py-1.5 rounded-lg shadow-2xs">
            <MapPin className="w-3.5 h-3.5 text-[#C9A961]" />
            <select
              value={selectedLocation?.name || presets[0].name}
              onChange={(e) => setSelectedLocationByName(e.target.value)}
              className="bg-transparent font-semibold text-[#D8D2C2] focus:outline-none cursor-pointer text-xs"
              id="header-location-select"
            >
              {presets.map((preset) => (
                <option key={preset.name} value={preset.name} className="bg-[#0B1E2D] text-[#D8D2C2]">
                  {preset.name}
                </option>
              ))}
              {selectedLocation?.isCustom && (
                <option value={selectedLocation.name} className="bg-[#0B1E2D] text-[#D8D2C2]">
                  {selectedLocation.name} (Custom)
                </option>
              )}
            </select>
          </div>

          {/* TIMESTAMP SYNC */}
          <div className="hidden sm:flex items-center gap-1.5 text-[#8EA5B5] font-mono bg-[#0F2436] border border-[#1E3F5A] px-3 py-1.5 rounded-lg">
            <Clock className="w-3.5 h-3.5 text-[#C9A961]" />
            <span>{t('updated') || 'Updated'} {lastSync}</span>
          </div>

          {/* LANGUAGE SELECTOR */}
          <div className="hidden sm:flex items-center gap-1 text-[#D8D2C2] font-medium font-mono cursor-pointer hover:text-white bg-[#0F2436] border border-[#1E3F5A] px-2.5 py-1.5 rounded-lg shadow-2xs">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer font-bold text-xs text-[#D8D2C2]"
              id="header-language-select"
            >
              <option value="EN" className="bg-[#0B1E2D] text-[#D8D2C2]">EN (English)</option>
              <option value="TE" className="bg-[#0B1E2D] text-[#D8D2C2]">TE (తెలుగు)</option>
              <option value="TA" className="bg-[#0B1E2D] text-[#D8D2C2]">TA (தமிழ்)</option>
              <option value="HI" className="bg-[#0B1E2D] text-[#D8D2C2]">HI (हिन्दी)</option>
            </select>
          </div>
        </div>
      </div>

      {/* RIGHT CONTENT */}
      <div className="flex items-center gap-2 md:gap-3">
        <div className="hidden md:flex items-center gap-2 text-xs font-mono">
          <span className="px-3 py-1.5 bg-[#0F2436] border border-[#1E3F5A] text-[#D8D2C2] font-semibold rounded-lg truncate max-w-[150px]">
            {selectedLocation?.zone || selectedLocation?.name}
          </span>
        </div>

        {/* CHAT WITH AI ACTION BUTTON */}
        <button
          onClick={handleChatClick}
          className="flex items-center gap-1.5 bg-[#C9A961]/15 hover:bg-[#C9A961]/25 text-[#C9A961] border border-[#C9A961] font-bold text-xs px-3 md:px-3.5 py-2 rounded-lg shadow-sm transition-all cursor-pointer"
          title={t('chat_with_ai') || 'Chat with AI'}
          id="header-chat-with-ai-btn"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t('chat_with_ai') || 'Chat with AI'}</span>
          <span className="sm:hidden">{t('chat') || 'Chat'}</span>
        </button>

        {/* ALERTS ACTION BUTTON */}
        <button
          onClick={handleAlertsClick}
          className="flex items-center gap-1.5 bg-[#B8543C]/20 hover:bg-[#B8543C]/30 text-[#B8543C] border border-[#B8543C] font-bold text-xs px-3 md:px-3.5 py-2 rounded-lg shadow-sm transition-all cursor-pointer"
          title={t('alerts') || 'Alerts'}
          id="header-alerts-btn"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t('alerts') || 'Alerts'}</span>
          <span className="sm:hidden">{t('alerts') || 'Alerts'}</span>
        </button>

        {/* REFRESH ICON BUTTON */}
        <button
          onClick={handleRefresh}
          className="p-2 rounded-lg text-[#8EA5B5] hover:text-[#D8D2C2] bg-[#0F2436] border border-[#1E3F5A] hover:border-[#C9A961]/50 transition-all cursor-pointer hidden sm:block"
          title={t('refresh') || 'Refresh Marine Data'}
        >
          <RotateCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-[#C9A961]' : ''}`} />
        </button>

        {/* USER PROFILE ICON & DROPDOWN */}
        <div className="relative">
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-8 h-8 rounded-full bg-[#0F2436] text-[#D8D2C2] hover:text-white border border-[#1E3F5A] transition-all cursor-pointer flex items-center justify-center overflow-hidden"
            title="User Profile & Session"
            id="user-profile-button"
          >
            {photoURL ? (
              <img
                src={photoURL}
                alt={displayName}
                className="w-6 h-6 rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <User className="w-4 h-4 m-0.5" />
            )}
          </button>

          {showUserMenu && (
            <div 
              className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-3 text-slate-200 z-50 animate-in fade-in zoom-in-95 duration-100"
              onMouseLeave={() => setShowUserMenu(false)}
            >
              <div className="pb-2.5 mb-2.5 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  {photoURL ? (
                    <img
                      src={photoURL}
                      alt={displayName}
                      className="w-8 h-8 rounded-full object-cover border border-cyan-500/40"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs">
                      {displayName[0]?.toUpperCase() || 'M'}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{displayName}</p>
                    <p className="text-[11px] text-slate-400 font-mono truncate">{displayEmail}</p>
                  </div>
                </div>
                {currentUser?.uid && (
                  <div className="mt-2 text-[10px] font-mono text-slate-500 truncate flex items-center gap-1">
                    <Shield className="w-3 h-3 text-cyan-500 shrink-0" />
                    <span>UID: {currentUser.uid.slice(0, 14)}...</span>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <button
                  onClick={() => { setShowUserMenu(false); navigate('/settings'); }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-800 text-slate-300 hover:text-white transition-colors flex items-center justify-between"
                >
                  <span>{t('settings') || 'Settings'}</span>
                  <span className="text-[10px] text-slate-500">{language}</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-2"
                  id="header-logout-btn"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{t('logout') || 'Log Out'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
