import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Bell, 
  Ruler, 
  Map, 
  Database, 
  Users, 
  Code, 
  User, 
  Lock, 
  Globe, 
  Clock, 
  Calendar, 
  Layout, 
  RefreshCw, 
  Radio, 
  AlertCircle, 
  Check, 
  Save,
  Shield,
  Key,
  Anchor,
  Wind,
  Waves,
  LogOut,
  Mail,
  Fingerprint,
  MessageSquare,
  Trash2,
  AlertTriangle,
  Bot,
  Sparkles,
  Volume2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useChat } from '../context/ChatContext';
import { useNavigate } from 'react-router-dom';

const SETTINGS_NAV = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'vessel', label: 'Vessel & Safety Thresholds', icon: Anchor },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'units', label: 'Units & Measurement', icon: Ruler },
  { id: 'map', label: 'Map Preferences', icon: Map },
  { id: 'chat', label: 'Chat & AI Assistant', icon: MessageSquare },
  { id: 'data', label: 'Data Preferences', icon: Database },
  { id: 'users', label: 'Users & Access', icon: Users },
  { id: 'api', label: 'API & Integrations', icon: Code },
  { id: 'account', label: 'Account', icon: User },
  { id: 'security', label: 'Security', icon: Lock }
];

export default function SettingsPage() {
  const { currentUser, userProfile, logout, resetPassword, isFirebaseConfigured } = useAuth();
  const { language: activeLanguage, setLanguage: setActiveLanguage } = useLanguage();
  const { messages, clearChat } = useChat();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('general');
  const [savedNotice, setSavedNotice] = useState(false);
  const [chatDeletedNotice, setChatDeletedNotice] = useState(false);
  const [showConfirmDeleteChat, setShowConfirmDeleteChat] = useState(false);
  const [voiceResponsesEnabled, setVoiceResponsesEnabled] = useState(true);
  const [responseDetailLevel, setResponseDetailLevel] = useState('Detailed Marine Advisory');
  const [autoPlotRoutes, setAutoPlotRoutes] = useState(true);
  const [securityMessage, setSecurityMessage] = useState('');
  const [securityError, setSecurityError] = useState('');

  // General Form States
  const [language, setLanguage] = useState('English');
  const [timezone, setTimezone] = useState('(GMT+05:30) Asia/Kolkata');
  const [dateFormat, setDateFormat] = useState('DD MMM YYYY (20 May 2025)');
  
  const [defaultDashboardView, setDefaultDashboardView] = useState('Overview');
  const [refreshInterval, setRefreshInterval] = useState('5 minutes');

  const [liveDataToggle, setLiveDataToggle] = useState(true);
  const [dataUpdateAlertsToggle, setDataUpdateAlertsToggle] = useState(true);
  const [dataRetention, setDataRetention] = useState('90 Days');

  // Vessel & Safety Risk Thresholds
  const [vesselType, setVesselType] = useState('Artisanal Trawler');
  const [vesselLength, setVesselLength] = useState('14.5 m');
  const [maxWaveTolerance, setMaxWaveTolerance] = useState('3.0 m');
  const [maxWindTolerance, setMaxWindTolerance] = useState('25 kt');

  // Additional tab states
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [cycloneAlerts, setCycloneAlerts] = useState(true);
  const [speedUnit, setSpeedUnit] = useState('Knots (kts)');
  const [coordFormat, setCoordFormat] = useState('Decimal Degrees (DD)');

  // Load saved settings from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('marine_ai_user_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.language) setLanguage(parsed.language);
        if (parsed.timezone) setTimezone(parsed.timezone);
        if (parsed.dateFormat) setDateFormat(parsed.dateFormat);
        if (parsed.defaultDashboardView) setDefaultDashboardView(parsed.defaultDashboardView);
        if (parsed.refreshInterval) setRefreshInterval(parsed.refreshInterval);
        if (typeof parsed.liveDataToggle === 'boolean') setLiveDataToggle(parsed.liveDataToggle);
        if (typeof parsed.dataUpdateAlertsToggle === 'boolean') setDataUpdateAlertsToggle(parsed.dataUpdateAlertsToggle);
        if (parsed.dataRetention) setDataRetention(parsed.dataRetention);
        if (parsed.vesselType) setVesselType(parsed.vesselType);
        if (parsed.vesselLength) setVesselLength(parsed.vesselLength);
        if (parsed.maxWaveTolerance) setMaxWaveTolerance(parsed.maxWaveTolerance);
        if (parsed.maxWindTolerance) setMaxWindTolerance(parsed.maxWindTolerance);
        if (typeof parsed.emailAlerts === 'boolean') setEmailAlerts(parsed.emailAlerts);
        if (typeof parsed.smsAlerts === 'boolean') setSmsAlerts(parsed.smsAlerts);
        if (typeof parsed.cycloneAlerts === 'boolean') setCycloneAlerts(parsed.cycloneAlerts);
        if (parsed.speedUnit) setSpeedUnit(parsed.speedUnit);
        if (parsed.coordFormat) setCoordFormat(parsed.coordFormat);
      }
    } catch (e) {
      // LocalStorage unavailable fallback
    }
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    const settingsObj = {
      language,
      timezone,
      dateFormat,
      defaultDashboardView,
      refreshInterval,
      liveDataToggle,
      dataUpdateAlertsToggle,
      dataRetention,
      vesselType,
      vesselLength,
      maxWaveTolerance,
      maxWindTolerance,
      emailAlerts,
      smsAlerts,
      cycloneAlerts,
      speedUnit,
      coordFormat,
      updatedAt: new Date().toISOString()
    };
    try {
      localStorage.setItem('marine_ai_user_settings', JSON.stringify(settingsObj));
    } catch (e) {}

    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleDeleteChatHistory = () => {
    try {
      clearChat();
      sessionStorage.removeItem('marine_ai_chat_session');
      localStorage.removeItem('marine_ai_chat_session');
      setChatDeletedNotice(true);
      setShowConfirmDeleteChat(false);
      setTimeout(() => setChatDeletedNotice(false), 4000);
    } catch (e) {
      console.warn('Failed to delete chat history:', e);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 pb-12">
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-sans font-extrabold text-2xl md:text-3xl text-[#D8D2C2] tracking-tight">
            Settings
          </h1>
          <p className="text-xs md:text-sm text-[#8EA5B5] mt-0.5">
            Manage your operational preferences, safety risk parameters, notifications, and navigation units.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {savedNotice && (
            <div className="flex items-center gap-1.5 bg-[#3E7C6B]/20 text-[#3E7C6B] border border-[#3E7C6B]/50 text-xs px-3.5 py-2 rounded-lg font-semibold animate-in fade-in">
              <Check className="w-4 h-4 text-[#3E7C6B]" />
              <span>Settings saved successfully!</span>
            </div>
          )}

          {chatDeletedNotice && (
            <div className="flex items-center gap-1.5 bg-[#3E7C6B]/20 text-[#3E7C6B] border border-[#3E7C6B]/50 text-xs px-3.5 py-2 rounded-lg font-semibold animate-in fade-in">
              <Check className="w-4 h-4 text-[#3E7C6B]" />
              <span>Chat history deleted successfully!</span>
            </div>
          )}
        </div>
      </div>

      {/* SETTINGS LAYOUT: LEFT SUB-SIDEBAR + RIGHT CONTENT AREA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT SUB-SIDEBAR TABS */}
        <div className="lg:col-span-3 bg-[#132C40] rounded-xl border border-[#1E3F5A] shadow-card p-2 space-y-1">
          {SETTINGS_NAV.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#C9A961]/20 text-[#C9A961] border border-[#C9A961]/40 font-bold shadow-sm'
                    : 'text-[#8EA5B5] hover:text-[#D8D2C2] hover:bg-[#183852] border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#C9A961]' : 'text-[#8EA5B5]'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* RIGHT CONTENT WORKSPACE AREA */}
        <div className="lg:col-span-9 space-y-6">
          <form onSubmit={handleSave} className="space-y-6">
            {/* GENERAL TAB CONTENT */}
            {activeTab === 'general' && (
              <>
                {/* SECTION 1: GENERAL PREFERENCES */}
                <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card p-5 space-y-4">
                  <h2 className="font-bold text-sm text-[#0F172A] border-b border-slate-100 pb-2.5">
                    General Preferences
                  </h2>

                  <div className="space-y-4 text-xs">
                    {/* LANGUAGE */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 font-semibold text-slate-800">
                          <Globe className="w-4 h-4 text-slate-500" />
                          <span>Language</span>
                        </div>
                        <p className="text-slate-400 text-[11px] mt-0.5">Select your preferred interface language</p>
                      </div>
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full sm:w-64 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-[#1363DF] cursor-pointer"
                      >
                        <option value="English">English</option>
                        <option value="Telugu">Telugu (తెలుగు)</option>
                        <option value="Tamil">Tamil (தமிழ்)</option>
                        <option value="Hindi">Hindi (हिन्दी)</option>
                      </select>
                    </div>

                    {/* TIMEZONE */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-50">
                      <div>
                        <div className="flex items-center gap-2 font-semibold text-slate-800">
                          <Clock className="w-4 h-4 text-slate-500" />
                          <span>Timezone</span>
                        </div>
                        <p className="text-slate-400 text-[11px] mt-0.5">Select your operating timezone</p>
                      </div>
                      <select
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        className="w-full sm:w-64 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-[#1363DF] cursor-pointer font-mono"
                      >
                        <option value="(GMT+05:30) Asia/Kolkata">(GMT+05:30) Asia/Kolkata</option>
                        <option value="(GMT+00:00) UTC">(GMT+00:00) UTC</option>
                        <option value="(GMT+08:00) Asia/Singapore">(GMT+08:00) Asia/Singapore</option>
                      </select>
                    </div>

                    {/* DATE FORMAT */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-50">
                      <div>
                        <div className="flex items-center gap-2 font-semibold text-slate-800">
                          <Calendar className="w-4 h-4 text-slate-500" />
                          <span>Date Format</span>
                        </div>
                        <p className="text-slate-400 text-[11px] mt-0.5">Choose how dates are displayed</p>
                      </div>
                      <select
                        value={dateFormat}
                        onChange={(e) => setDateFormat(e.target.value)}
                        className="w-full sm:w-64 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-[#1363DF] cursor-pointer font-mono"
                      >
                        <option value="DD MMM YYYY (20 May 2025)">DD MMM YYYY (20 May 2025)</option>
                        <option value="YYYY-MM-DD (2025-05-20)">YYYY-MM-DD (2025-05-20)</option>
                        <option value="MM/DD/YYYY (05/20/2025)">MM/DD/YYYY (05/20/2025)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* SECTION 2: DASHBOARD PREFERENCES */}
                <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card p-5 space-y-4">
                  <h2 className="font-bold text-sm text-[#0F172A] border-b border-slate-100 pb-2.5">
                    Dashboard Preferences
                  </h2>

                  <div className="space-y-4 text-xs">
                    {/* DEFAULT DASHBOARD VIEW */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 font-semibold text-slate-800">
                          <Layout className="w-4 h-4 text-slate-500" />
                          <span>Default Dashboard View</span>
                        </div>
                        <p className="text-slate-400 text-[11px] mt-0.5">Choose your default landing page</p>
                      </div>
                      <select
                        value={defaultDashboardView}
                        onChange={(e) => setDefaultDashboardView(e.target.value)}
                        className="w-full sm:w-64 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-[#1363DF] cursor-pointer"
                      >
                        <option value="Overview">Overview</option>
                        <option value="Map">GIS Map</option>
                        <option value="PFZ Explorer">PFZ Explorer</option>
                        <option value="Route Planner">Route Planner</option>
                      </select>
                    </div>

                    {/* REFRESH INTERVAL */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-50">
                      <div>
                        <div className="flex items-center gap-2 font-semibold text-slate-800">
                          <RefreshCw className="w-4 h-4 text-slate-500" />
                          <span>Refresh Interval</span>
                        </div>
                        <p className="text-slate-400 text-[11px] mt-0.5">Auto-refresh live telemetry</p>
                      </div>
                      <select
                        value={refreshInterval}
                        onChange={(e) => setRefreshInterval(e.target.value)}
                        className="w-full sm:w-64 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-[#1363DF] cursor-pointer font-mono"
                      >
                        <option value="1 minute">1 minute (High Frequency)</option>
                        <option value="5 minutes">5 minutes</option>
                        <option value="15 minutes">15 minutes</option>
                        <option value="Manual">Manual Refresh Only</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* SECTION 3: DATA PREFERENCES */}
                <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card p-5 space-y-4">
                  <h2 className="font-bold text-sm text-[#0F172A] border-b border-slate-100 pb-2.5">
                    Data Preferences
                  </h2>

                  <div className="space-y-4 text-xs">
                    {/* LIVE DATA TOGGLE */}
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 font-semibold text-slate-800">
                          <Radio className="w-4 h-4 text-slate-500" />
                          <span>Live Data Connection</span>
                        </div>
                        <p className="text-slate-400 text-[11px] mt-0.5">Enable or disable Express backend live telemetry</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setLiveDataToggle(!liveDataToggle)}
                        className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                          liveDataToggle ? 'bg-[#1363DF]' : 'bg-slate-300'
                        }`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                            liveDataToggle ? 'translate-x-6' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* DATA UPDATE ALERTS TOGGLE */}
                    <div className="flex items-center justify-between gap-4 pt-2 border-t border-slate-50">
                      <div>
                        <div className="flex items-center gap-2 font-semibold text-slate-800">
                          <AlertCircle className="w-4 h-4 text-slate-500" />
                          <span>Data Update Notifications</span>
                        </div>
                        <p className="text-slate-400 text-[11px] mt-0.5">Get notified when new satellite SST/PFZ data is ingested</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setDataUpdateAlertsToggle(!dataUpdateAlertsToggle)}
                        className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                          dataUpdateAlertsToggle ? 'bg-[#1363DF]' : 'bg-slate-300'
                        }`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                            dataUpdateAlertsToggle ? 'translate-x-6' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* DATA RETENTION */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-50">
                      <div>
                        <div className="flex items-center gap-2 font-semibold text-slate-800">
                          <Database className="w-4 h-4 text-slate-500" />
                          <span>Data Retention</span>
                        </div>
                        <p className="text-slate-400 text-[11px] mt-0.5">Choose how long local telemetry history is stored</p>
                      </div>
                      <select
                        value={dataRetention}
                        onChange={(e) => setDataRetention(e.target.value)}
                        className="w-full sm:w-64 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-[#1363DF] cursor-pointer font-mono"
                      >
                        <option value="30 Days">30 Days</option>
                        <option value="60 Days">60 Days</option>
                        <option value="90 Days">90 Days</option>
                        <option value="180 Days">180 Days</option>
                        <option value="1 Year">1 Year</option>
                      </select>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* VESSEL & SAFETY RISK THRESHOLDS TAB */}
            {activeTab === 'vessel' && (
              <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card p-5 space-y-4">
                <h2 className="font-bold text-sm text-[#0F172A] border-b border-slate-100 pb-2.5">
                  Vessel Specification & Safety Risk Parameters
                </h2>

                <div className="space-y-4 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-slate-800">Vessel Class</p>
                      <p className="text-slate-400 text-[11px]">Primary craft specification used for risk calculations</p>
                    </div>
                    <select
                      value={vesselType}
                      onChange={(e) => setVesselType(e.target.value)}
                      className="w-full sm:w-64 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none cursor-pointer"
                    >
                      <option value="Artisanal Trawler">Artisanal Trawler (Motorized)</option>
                      <option value="Deep Sea Gillnetter">Deep Sea Gillnetter</option>
                      <option value="Mechanized Purse Seiner">Mechanized Purse Seiner</option>
                      <option value="Coastal Patrol Craft">Coastal Patrol Craft</option>
                    </select>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-50">
                    <div>
                      <p className="font-semibold text-slate-800">Maximum Wave Height Tolerance</p>
                      <p className="text-slate-400 text-[11px]">Swell threshold before risk engine triggers Severe status</p>
                    </div>
                    <select
                      value={maxWaveTolerance}
                      onChange={(e) => setMaxWaveTolerance(e.target.value)}
                      className="w-full sm:w-64 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none cursor-pointer font-mono"
                    >
                      <option value="1.5 m">1.5 m (Cautious)</option>
                      <option value="2.5 m">2.5 m (Standard)</option>
                      <option value="3.0 m">3.0 m (Moderate)</option>
                      <option value="4.0 m">4.0 m (Heavy Sea)</option>
                    </select>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-50">
                    <div>
                      <p className="font-semibold text-slate-800">Maximum Wind Speed Tolerance</p>
                      <p className="text-slate-400 text-[11px]">Wind gust limit for safe fishing operations</p>
                    </div>
                    <select
                      value={maxWindTolerance}
                      onChange={(e) => setMaxWindTolerance(e.target.value)}
                      className="w-full sm:w-64 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none cursor-pointer font-mono"
                    >
                      <option value="15 kt">15 kt (Light)</option>
                      <option value="20 kt">20 kt (Moderate)</option>
                      <option value="25 kt">25 kt (Standard Trawler)</option>
                      <option value="35 kt">35 kt (Heavy Craft)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* NOTIFICATIONS TAB */}
            {activeTab === 'notifications' && (
              <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card p-5 space-y-4">
                <h2 className="font-bold text-sm text-[#0F172A] border-b border-slate-100 pb-2.5">
                  Notification Dispatch Controls
                </h2>

                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-800">High Swell & Cyclone Push Alerts</p>
                      <p className="text-slate-400 text-[11px]">Instant emergency warnings for storm surges & rough sea states</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCycloneAlerts(!cycloneAlerts)}
                      className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                        cycloneAlerts ? 'bg-[#1363DF]' : 'bg-slate-300'
                      }`}
                    >
                      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${cycloneAlerts ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                    <div>
                      <p className="font-semibold text-slate-800">Email Daily Digest</p>
                      <p className="text-slate-400 text-[11px]">Receive daily PDF operational reports at 08:00 AM IST</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEmailAlerts(!emailAlerts)}
                      className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                        emailAlerts ? 'bg-[#1363DF]' : 'bg-slate-300'
                      }`}
                    >
                      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${emailAlerts ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* UNITS & MEASUREMENT TAB */}
            {activeTab === 'units' && (
              <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card p-5 space-y-4">
                <h2 className="font-bold text-sm text-[#0F172A] border-b border-slate-100 pb-2.5">
                  Maritime Units & Navigation Metrics
                </h2>

                <div className="space-y-4 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-slate-800">Vessel Speed Units</p>
                      <p className="text-slate-400 text-[11px]">Calibration for ETA and speed logs</p>
                    </div>
                    <select
                      value={speedUnit}
                      onChange={(e) => setSpeedUnit(e.target.value)}
                      className="w-full sm:w-64 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none cursor-pointer font-mono"
                    >
                      <option value="Knots (kts)">Knots (kts)</option>
                      <option value="Km/h">Kilometers / hour (km/h)</option>
                      <option value="Meters/sec">Meters / second (m/s)</option>
                    </select>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-50">
                    <div>
                      <p className="font-semibold text-slate-800">Coordinate Display Format</p>
                      <p className="text-slate-400 text-[11px]">Latitude and Longitude representation</p>
                    </div>
                    <select
                      value={coordFormat}
                      onChange={(e) => setCoordFormat(e.target.value)}
                      className="w-full sm:w-64 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none cursor-pointer font-mono"
                    >
                      <option value="Decimal Degrees (DD)">Decimal Degrees (16.9241° N, 80.1985° E)</option>
                      <option value="Degrees Minutes Seconds (DMS)">Degrees Minutes Seconds (16° 55' 26" N)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* ACCOUNT TAB CONTENT */}
            {activeTab === 'account' && (
              <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card p-5 space-y-5">
                <h2 className="font-bold text-sm text-[#0F172A] border-b border-slate-100 pb-2.5 flex items-center justify-between">
                  <span>User Account & Profile</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-[#1363DF] border border-blue-200">
                    {isFirebaseConfigured ? 'Firebase Auth & Firestore' : 'Local Auth Session'}
                  </span>
                </h2>

                <div className="flex items-center gap-4 pb-2">
                  {userProfile?.photoURL || currentUser?.photoURL ? (
                    <img
                      src={userProfile?.photoURL || currentUser?.photoURL}
                      alt={userProfile?.displayName || 'User'}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-[#1363DF]/30 shadow-md"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1363DF] to-cyan-500 text-white flex items-center justify-center font-extrabold text-xl shadow-md">
                      {(userProfile?.displayName || currentUser?.displayName || currentUser?.email || 'M')[0].toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="font-bold text-base text-[#0F172A]">
                      {userProfile?.displayName || currentUser?.displayName || 'Mariner Operator'}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono">
                      {currentUser?.email || 'mariner@marineai.gov'}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Verified Marine User
                      </span>
                      {currentUser?.providerData?.[0]?.providerId === 'google.com' || (currentUser?.uid && currentUser?.uid.startsWith('google-')) ? (
                        <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                          Google Account
                        </span>
                      ) : (
                        <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          Email/Password
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] text-slate-400 font-mono font-semibold block">User ID (UID)</span>
                    <span className="font-mono text-slate-800 text-[11px] truncate block font-bold">
                      {currentUser?.uid || 'loc-mariner-session'}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] text-slate-400 font-mono font-semibold block">Registered Email</span>
                    <span className="font-mono text-slate-800 text-[11px] truncate block font-bold">
                      {currentUser?.email || 'mariner@marineai.gov'}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] text-slate-400 font-mono font-semibold block">Member Since</span>
                    <span className="font-mono text-slate-800 text-[11px] block">
                      {userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : 'May 2025'}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] text-slate-400 font-mono font-semibold block">Last Session Sync</span>
                    <span className="font-mono text-slate-800 text-[11px] block">
                      {userProfile?.lastLogin ? new Date(userProfile.lastLogin).toLocaleTimeString() : 'Just now'}
                    </span>
                  </div>
                </div>

                {/* LOGOUT BUTTON */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <p className="text-xs text-slate-500">
                    Sign out of this session on this terminal
                  </p>
                  <button
                    type="button"
                    onClick={async () => {
                      await logout();
                      navigate('/login');
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs"
                    id="settings-logout-btn"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}

            {/* SECURITY TAB CONTENT */}
            {activeTab === 'security' && (
              <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card p-5 space-y-5">
                <h2 className="font-bold text-sm text-[#0F172A] border-b border-slate-100 pb-2.5">
                  Security & Access Controls
                </h2>

                {securityMessage && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-semibold flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>{securityMessage}</span>
                  </div>
                )}
                {securityError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    <span>{securityError}</span>
                  </div>
                )}

                <div className="space-y-4 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">Password Management</h4>
                      <p className="text-slate-500 text-xs mt-0.5">
                        Trigger a secure reset link to {currentUser?.email || 'your registered address'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        setSecurityMessage('');
                        setSecurityError('');
                        try {
                          await resetPassword(currentUser?.email || 'mariner@marineai.gov');
                          setSecurityMessage('Password reset instructions dispatched to your email.');
                        } catch (err) {
                          setSecurityError(err.message || 'Could not send reset email.');
                        }
                      }}
                      className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-semibold rounded-lg text-xs transition-all cursor-pointer shrink-0 shadow-xs"
                    >
                      Request Password Reset
                    </button>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-slate-800">
                      <Shield className="w-4 h-4 text-[#1363DF]" />
                      <span>Security & Encryption Protocol</span>
                    </div>
                    <p className="text-slate-600 text-xs leading-relaxed">
                      All marine communications and session tokens utilize TLS 1.3 encryption. Passwords are never stored in plaintext and are hashed using industry standard Bcrypt / PBKDF2 via Firebase Auth.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* CHAT & AI ASSISTANT SETTINGS TAB */}
            {activeTab === 'chat' && (
              <div className="space-y-6">
                {/* NOTICES */}
                {chatDeletedNotice && (
                  <div className="flex items-center gap-2 bg-[#3E7C6B]/20 text-[#3E7C6B] border border-[#3E7C6B]/50 text-xs px-4 py-3 rounded-xl font-semibold animate-in fade-in">
                    <Check className="w-4 h-4 text-[#3E7C6B] shrink-0" />
                    <span>Chat conversation history has been completely cleared and reset.</span>
                  </div>
                )}

                {/* SECTION 1: CONVERSATION HISTORY & MEMORY */}
                <div className="bg-[#132C40] rounded-xl border border-[#1E3F5A] shadow-card p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#1E3F5A] pb-3">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-[#C9A961]" />
                      <h2 className="font-bold text-sm text-[#D8D2C2]">
                        Conversation History & Memory
                      </h2>
                    </div>
                    <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-md bg-[#0B1E2D] text-[#C9A961] border border-[#1E3F5A]">
                      {messages?.length || 0} messages stored
                    </span>
                  </div>

                  <p className="text-xs text-[#8EA5B5] leading-relaxed">
                    Marine AI persists your advisory queries, safe routing questions, and ocean telemetry responses locally in your browser session for continuity during your voyages.
                  </p>

                  <div className="p-4 bg-[#0B1E2D] rounded-xl border border-[#1E3F5A] space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-xs text-[#D8D2C2]">Clear Chat History</p>
                        <p className="text-[11px] text-[#8EA5B5] mt-0.5">
                          Permanently wipe all past messages, prompt logs, and telemetry cards from this terminal.
                        </p>
                      </div>

                      {!showConfirmDeleteChat ? (
                        <button
                          type="button"
                          onClick={() => setShowConfirmDeleteChat(true)}
                          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#B8543C]/20 hover:bg-[#B8543C]/30 text-[#B8543C] border border-[#B8543C] rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0"
                          id="delete-chat-history-btn"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete History</span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => setShowConfirmDeleteChat(false)}
                            className="px-3 py-1.5 rounded-lg text-xs text-[#8EA5B5] hover:text-[#D8D2C2] bg-[#183852] border border-[#1E3F5A] transition-all cursor-pointer font-medium"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleDeleteChatHistory}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#B8543C] hover:bg-[#A3432D] text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-md"
                            id="confirm-delete-chat-btn"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Confirm Delete</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {showConfirmDeleteChat && (
                      <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#B8543C]/10 border border-[#B8543C]/30 text-[#B8543C] text-[11px]">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>Are you sure? This action will permanently erase all chat messages from session storage.</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* SECTION 2: AI ADVISORY & VOICE PREFERENCES */}
                <div className="bg-[#132C40] rounded-xl border border-[#1E3F5A] shadow-card p-5 space-y-4">
                  <div className="flex items-center gap-2 border-b border-[#1E3F5A] pb-3">
                    <Bot className="w-4 h-4 text-[#C9A961]" />
                    <h2 className="font-bold text-sm text-[#D8D2C2]">
                      AI Assistant Configuration
                    </h2>
                  </div>

                  <div className="space-y-4 text-xs">
                    {/* SPEECH SYNTHESIS TOGGLE */}
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 font-semibold text-[#D8D2C2]">
                          <Volume2 className="w-4 h-4 text-[#C9A961]" />
                          <span>Voice Audio Readback</span>
                        </div>
                        <p className="text-[#8EA5B5] text-[11px] mt-0.5">
                          Enable Web Speech text-to-speech for critical vessel navigation advisories
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setVoiceResponsesEnabled(!voiceResponsesEnabled)}
                        className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                          voiceResponsesEnabled ? 'bg-[#3E7C6B]' : 'bg-[#1E3F5A]'
                        }`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                            voiceResponsesEnabled ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* RESPONSE DETAIL LEVEL */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 border-t border-[#1E3F5A]">
                      <div>
                        <p className="font-semibold text-[#D8D2C2]">Response Detail Level</p>
                        <p className="text-[#8EA5B5] text-[11px] mt-0.5">Adjust advisory complexity and telemetry depth</p>
                      </div>
                      <select
                        value={responseDetailLevel}
                        onChange={(e) => setResponseDetailLevel(e.target.value)}
                        className="w-full sm:w-64 bg-[#0B1E2D] border border-[#1E3F5A] rounded-lg px-3 py-2 text-[#D8D2C2] font-medium focus:outline-none focus:border-[#C9A961] cursor-pointer"
                      >
                        <option value="Detailed Marine Advisory">Detailed Marine Advisory (Standard)</option>
                        <option value="Concise Tactical Briefing">Concise Tactical Briefing</option>
                        <option value="Raw Oceanographic Telemetry">Raw Oceanographic Telemetry</option>
                      </select>
                    </div>

                    {/* AUTO PLOT ROUTES */}
                    <div className="flex items-center justify-between gap-4 pt-3 border-t border-[#1E3F5A]">
                      <div>
                        <div className="flex items-center gap-2 font-semibold text-[#D8D2C2]">
                          <Sparkles className="w-4 h-4 text-[#C9A961]" />
                          <span>Auto-Suggest Safe Waypoints</span>
                        </div>
                        <p className="text-[#8EA5B5] text-[11px] mt-0.5">
                          Automatically offer one-click route plotting for high-risk zones
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAutoPlotRoutes(!autoPlotRoutes)}
                        className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                          autoPlotRoutes ? 'bg-[#3E7C6B]' : 'bg-[#1E3F5A]'
                        }`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                            autoPlotRoutes ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* DATA PREFERENCES TAB */}
            {activeTab === 'data' && (
              <div className="space-y-6">
                {chatDeletedNotice && (
                  <div className="flex items-center gap-2 bg-[#3E7C6B]/20 text-[#3E7C6B] border border-[#3E7C6B]/50 text-xs px-4 py-3 rounded-xl font-semibold animate-in fade-in">
                    <Check className="w-4 h-4 text-[#3E7C6B] shrink-0" />
                    <span>Chat conversation history has been completely cleared and reset.</span>
                  </div>
                )}

                <div className="bg-[#132C40] rounded-xl border border-[#1E3F5A] shadow-card p-5 space-y-4">
                  <h2 className="font-bold text-sm text-[#D8D2C2] border-b border-[#1E3F5A] pb-2.5">
                    Data Telemetry & Retention Controls
                  </h2>

                  <div className="space-y-4 text-xs">
                    {/* LIVE DATA TOGGLE */}
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 font-semibold text-[#D8D2C2]">
                          <Radio className="w-4 h-4 text-[#C9A961]" />
                          <span>Live Data Connection</span>
                        </div>
                        <p className="text-[#8EA5B5] text-[11px] mt-0.5">Enable or disable Express backend live telemetry synchronization</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setLiveDataToggle(!liveDataToggle)}
                        className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                          liveDataToggle ? 'bg-[#3E7C6B]' : 'bg-[#1E3F5A]'
                        }`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                            liveDataToggle ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* DATA UPDATE NOTIFICATIONS */}
                    <div className="flex items-center justify-between gap-4 pt-3 border-t border-[#1E3F5A]">
                      <div>
                        <div className="flex items-center gap-2 font-semibold text-[#D8D2C2]">
                          <AlertCircle className="w-4 h-4 text-[#C9A961]" />
                          <span>Satellite Ingestion Alerts</span>
                        </div>
                        <p className="text-[#8EA5B5] text-[11px] mt-0.5">Get notified when new satellite SST/PFZ data is ingested</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setDataUpdateAlertsToggle(!dataUpdateAlertsToggle)}
                        className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                          dataUpdateAlertsToggle ? 'bg-[#3E7C6B]' : 'bg-[#1E3F5A]'
                        }`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                            dataUpdateAlertsToggle ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* DATA RETENTION */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 border-t border-[#1E3F5A]">
                      <div>
                        <div className="flex items-center gap-2 font-semibold text-[#D8D2C2]">
                          <Database className="w-4 h-4 text-[#C9A961]" />
                          <span>Telemetry Retention Window</span>
                        </div>
                        <p className="text-[#8EA5B5] text-[11px] mt-0.5">Choose how long local telemetry history is cached</p>
                      </div>
                      <select
                        value={dataRetention}
                        onChange={(e) => setDataRetention(e.target.value)}
                        className="w-full sm:w-64 bg-[#0B1E2D] border border-[#1E3F5A] rounded-lg px-3 py-2 text-[#D8D2C2] font-medium focus:outline-none focus:border-[#C9A961] cursor-pointer font-mono"
                      >
                        <option value="30 Days">30 Days</option>
                        <option value="60 Days">60 Days</option>
                        <option value="90 Days">90 Days</option>
                        <option value="180 Days">180 Days</option>
                        <option value="1 Year">1 Year</option>
                      </select>
                    </div>

                    {/* CHAT HISTORY PURGE OPTION IN DATA TAB AS WELL */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#1E3F5A]">
                      <div>
                        <div className="flex items-center gap-2 font-semibold text-[#D8D2C2]">
                          <MessageSquare className="w-4 h-4 text-[#B8543C]" />
                          <span>AI Chat History & Transcripts</span>
                        </div>
                        <p className="text-[#8EA5B5] text-[11px] mt-0.5">
                          Currently holding {messages?.length || 0} messages in active browser session
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleDeleteChatHistory}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#B8543C]/20 hover:bg-[#B8543C]/30 text-[#B8543C] border border-[#B8543C] rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Chat History</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* OTHER TABS FALLBACK GENERIC CARD */}
            {['map', 'users', 'api'].includes(activeTab) && (
              <div className="bg-[#132C40] rounded-xl border border-[#1E3F5A] shadow-card p-5 space-y-4">
                <h2 className="font-bold text-sm text-[#D8D2C2] border-b border-[#1E3F5A] pb-2.5 uppercase tracking-wider font-mono">
                  {SETTINGS_NAV.find(n => n.id === activeTab)?.label}
                </h2>
                <div className="py-8 text-center text-[#8EA5B5] text-xs space-y-2">
                  <div className="w-10 h-10 mx-auto rounded-full bg-[#0B1E2D] border border-[#1E3F5A] flex items-center justify-center text-[#C9A961]">
                    <Shield className="w-5 h-5" />
                  </div>
                  <p className="font-semibold text-[#D8D2C2]">Active Operational Configuration</p>
                  <p className="max-w-md mx-auto text-[#8EA5B5]">
                    Settings in this category are managed according to Indian Coast Guard & ISRO INCOIS telemetry standards.
                  </p>
                </div>
              </div>
            )}

            {/* BOTTOM SAVE CHANGES BUTTON */}
            <div className="flex items-center justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 bg-[#C9A961] hover:bg-[#B89750] text-[#0B1E2D] font-bold text-xs px-6 py-2.5 rounded-lg shadow-sm transition-all cursor-pointer"
              >
                <Save className="w-4 h-4 text-[#0B1E2D]" />
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
