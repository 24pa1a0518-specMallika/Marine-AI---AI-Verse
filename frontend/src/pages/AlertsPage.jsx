import React, { useState, useEffect, useMemo } from 'react';
import { 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  CloudRain, 
  Wind, 
  Waves, 
  MapPin, 
  ChevronRight, 
  ChevronLeft, 
  Filter,
  RefreshCw,
  Bell,
  ShieldAlert
} from 'lucide-react';
import { getAlerts, getActiveWarnings, evaluateAlerts } from '../api/alertsApi';
import { adaptAlertModel, adaptWarningsModel } from '../api/adapters';
import { useLocation } from '../context/LocationContext';

const FALLBACK_INITIAL_ALERTS = [
  {
    id: 'alt-1',
    title: 'High Wind Speed Detected',
    description: 'Sustained wind speed of 32 kt detected in your current area.',
    location: 'Bay of Bengal, India',
    timestamp: '10:20 AM IST',
    severity: 'Critical',
    icon: Wind
  },
  {
    id: 'alt-2',
    title: 'Cyclone Activity Nearby',
    description: 'Cyclone "Mocha" is 120 km away from your location.',
    location: 'Bay of Bengal, India',
    timestamp: '09:45 AM IST',
    severity: 'High',
    icon: RefreshCw
  },
  {
    id: 'alt-3',
    title: 'High Wave Height',
    description: 'Wave height of 4.5 m detected in your area.',
    location: 'Bay of Bengal, India',
    timestamp: '08:30 AM IST',
    severity: 'Medium',
    icon: Waves
  },
  {
    id: 'alt-4',
    title: 'Heavy Rainfall Expected',
    description: 'Heavy rainfall expected in the next 6 hours.',
    location: 'Bay of Bengal, India',
    timestamp: '07:15 AM IST',
    severity: 'Low',
    icon: CloudRain
  },
  {
    id: 'alt-5',
    title: 'System Update',
    description: 'New weather model data is now available.',
    location: 'Bay of Bengal, India',
    timestamp: 'Yesterday, 11:30 PM',
    severity: 'Info',
    icon: Info
  },
  {
    id: 'alt-6',
    title: 'Geofence Boundary Warning',
    description: 'Vessel approach within 1.5 nm of Restricted Firing Zone B.',
    location: 'Kakinada Offshore Sector',
    timestamp: 'Yesterday, 09:15 PM',
    severity: 'Critical',
    icon: AlertTriangle
  },
  {
    id: 'alt-7',
    title: 'PFZ Advisory Released',
    description: 'INCOIS Chlorophyll-a satellite telemetry updated for PFZ-03.',
    location: 'Godavari Outer Plume',
    timestamp: 'Yesterday, 06:40 PM',
    severity: 'Info',
    icon: CheckCircle2
  },
  {
    id: 'alt-8',
    title: 'Squall Line Formation',
    description: 'Convective storm cloud formation detected north-east.',
    location: 'Vizag Deep Sea Fairway',
    timestamp: 'May 18, 2025 04:20 PM',
    severity: 'High',
    icon: Wind
  },
  {
    id: 'alt-9',
    title: 'Low Sea Surface Pressure',
    description: 'Barometric pressure dropped to 998 hPa rapidly.',
    location: 'Coromandel Basin',
    timestamp: 'May 18, 2025 02:00 PM',
    severity: 'Medium',
    icon: AlertTriangle
  },
  {
    id: 'alt-10',
    title: 'Navigational Light Beacon Fault',
    description: 'Machilipatnam outer fairway buoy #4 signal lost.',
    location: 'Machilipatnam Approach',
    timestamp: 'May 17, 2025 11:10 AM',
    severity: 'Low',
    icon: Info
  },
  {
    id: 'alt-11',
    title: 'Subsea Seismic Disturbance Advisory',
    description: 'INCOIS National Tsunami Early Warning Centre recorded M5.8 offshore tremor. Minor wave surges up to 0.6 m expected along shallow reefs.',
    location: 'Andaman Basin & Coromandel Shelf',
    timestamp: 'Just now',
    severity: 'High',
    icon: Waves
  },
  {
    id: 'alt-12',
    title: 'Dense Sea Fog & Low Visibility Notice',
    description: 'Advection marine fog reducing horizontal visibility below 0.5 NM. Keep masthead and sidelights active, sound foghorn per Rule 35.',
    location: 'Kakinada Anchorage Approach',
    timestamp: '15 mins ago',
    severity: 'Medium',
    icon: CloudRain
  },
  {
    id: 'alt-13',
    title: 'Naval Live Firing Range Active',
    description: 'Eastern Naval Command live-fire gunnery exercise active in Sector Charlie-4. Civilian crafts ordered to keep 10 NM clear perimeter.',
    location: 'Offshore Sector Charlie-4',
    timestamp: '45 mins ago',
    severity: 'Critical',
    icon: AlertTriangle
  },
  {
    id: 'alt-14',
    title: 'Harmful Algal Bloom (HAB) Detection',
    description: 'Satellite ocean color index shows localized nocturnal bioluminescent red-tide plankton bloom. Potential dissolved oxygen depletion.',
    location: 'Machilipatnam Coastal Shelf',
    timestamp: '2 hours ago',
    severity: 'Low',
    icon: Info
  },
  {
    id: 'alt-15',
    title: 'Spring Tide Coastal Surge Warning',
    description: 'Perigean spring tide compounding with 2.8 m swell. Estuary river mouths and shallow sandbars highly hazardous for small-craft docking.',
    location: 'Godavari River Plume',
    timestamp: '3 hours ago',
    severity: 'High',
    icon: Waves
  },
  {
    id: 'alt-16',
    title: 'VHF DSC Distress Channel 16 Relay',
    description: 'Coast Guard MRCC relayed Pan-Pan broadcast regarding disabled motorized craft 14 NM south-east. Mariners requested to maintain radio watch.',
    location: 'Bay of Bengal Fairway',
    timestamp: '5 hours ago',
    severity: 'Medium',
    icon: ShieldAlert
  }
];

export default function AlertsPage() {
  const { selectedLocation, refreshTrigger } = useLocation();
  const activeLat = selectedLocation?.lat ?? 16.98;
  const activeLon = selectedLocation?.lon ?? 82.24;

  const [alertsState, setAlertsState] = useState({
    alerts: FALLBACK_INITIAL_ALERTS,
    isLoading: true,
    isFallback: false,
    error: null
  });
  const [warningsState, setWarningsState] = useState({
    warnings: [],
    isLoading: true,
    isFallback: false,
    error: null
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('All Alerts');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Load Alerts & Warnings from Centralized API Layer
  const loadAlertData = async (isMounted = true) => {
    const locationParams = { lat: activeLat, lon: activeLon };

    // 1. Fetch Active Alerts
    try {
      const alertsRes = await getAlerts();
      if (!isMounted) return;
      
      let liveList = alertsRes.data || [];

      // Also evaluate telemetry alerts if live engine is available
      try {
        const evalRes = await evaluateAlerts({
          latitude: 16.9241,
          longitude: 80.1985,
          windSpeed: 28,
          waveHeight: 3.5
        });
        if (evalRes.data && evalRes.data.length > 0) {
          // Merge evaluated alerts without duplicating IDs
          const existingIds = new Set(liveList.map(a => a.id));
          evalRes.data.forEach(item => {
            if (!existingIds.has(item.id)) {
              liveList.push(item);
            }
          });
        }
      } catch (e) {
        // Silent evaluation fallback
      }

      // If live API succeeds, retain live alerts list (even if empty)
      if (!alertsRes.isFallback) {
        setAlertsState({
          alerts: liveList,
          isLoading: false,
          isFallback: false,
          error: null
        });
      } else {
        setAlertsState({
          alerts: FALLBACK_INITIAL_ALERTS,
          isLoading: false,
          isFallback: true,
          error: alertsRes.error
        });
      }
    } catch (err) {
      if (!isMounted) return;
      setAlertsState({
        alerts: FALLBACK_INITIAL_ALERTS,
        isLoading: false,
        isFallback: true,
        error: err
      });
    }

    // 2. Fetch IMD Marine Warnings
    try {
      const warnRes = await getActiveWarnings(locationParams);
      if (!isMounted) return;
      const adaptedWarn = adaptWarningsModel(warnRes.data);

      setWarningsState({
        warnings: adaptedWarn.warnings || [],
        isLoading: false,
        isFallback: !!warnRes.isFallback,
        error: warnRes.error
      });
    } catch (err) {
      if (!isMounted) return;
      setWarningsState({
        warnings: [],
        isLoading: false,
        isFallback: true,
        error: err
      });
    }
  };

  useEffect(() => {
    let isMounted = true;
    loadAlertData(isMounted);
    return () => { isMounted = false; };
  }, [activeLat, activeLon, refreshTrigger]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadAlertData(true);
    setIsRefreshing(false);
  };

  const alerts = alertsState.alerts || FALLBACK_INITIAL_ALERTS;
  const isFallbackActive = alertsState.isFallback || warningsState.isFallback;

  // Dynamic Counts Calculation
  const criticalCount = useMemo(() => alerts.filter((a) => a.severity === 'Critical').length, [alerts]);
  const highCount = useMemo(() => alerts.filter((a) => a.severity === 'High').length, [alerts]);
  const mediumCount = useMemo(() => alerts.filter((a) => a.severity === 'Medium').length, [alerts]);
  const lowCount = useMemo(() => alerts.filter((a) => a.severity === 'Low' || a.severity === 'Info').length, [alerts]);
  const totalCount = alerts.length;

  // Filter Alerts
  const filteredAlerts = useMemo(() => {
    if (selectedFilter === 'All Alerts') return alerts;
    return alerts.filter((a) => a.severity === selectedFilter);
  }, [alerts, selectedFilter]);

  // Paginated Alerts
  const totalPages = useMemo(() => Math.max(1, Math.ceil(filteredAlerts.length / pageSize)), [filteredAlerts, pageSize]);
  const paginatedAlerts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAlerts.slice(start, start + pageSize);
  }, [filteredAlerts, currentPage, pageSize]);

  // Helper for Icon Selection
  const getAlertIcon = (alert) => {
    if (alert.icon) return alert.icon;
    const title = (alert.title || '').toLowerCase();
    const desc = (alert.description || '').toLowerCase();
    if (title.includes('wind') || desc.includes('wind') || title.includes('squall')) return Wind;
    if (title.includes('wave') || desc.includes('wave') || title.includes('sea')) return Waves;
    if (title.includes('rain') || desc.includes('rain') || title.includes('precip')) return CloudRain;
    if (title.includes('cyclone') || title.includes('storm')) return RefreshCw;
    if (title.includes('geofence') || alert.severity === 'Critical') return AlertTriangle;
    if (title.includes('pfz') || title.includes('update')) return CheckCircle2;
    return Info;
  };

  // Helper for Severity Badges & Icon Styles
  const getSeverityStyle = (severity) => {
    switch (severity) {
      case 'Critical':
        return {
          badge: 'bg-[#B8543C]/20 text-[#E2B7AE] border border-[#B8543C]/50 font-bold',
          iconBg: 'bg-[#B8543C]/20 text-[#B8543C] border border-[#B8543C]/40',
          leftBorder: 'border-l-4 border-l-[#B8543C]'
        };
      case 'High':
        return {
          badge: 'bg-[#C9A961]/20 text-[#C9A961] border border-[#C9A961]/50 font-bold',
          iconBg: 'bg-[#C9A961]/20 text-[#C9A961] border border-[#C9A961]/40',
          leftBorder: 'border-l-4 border-l-[#C9A961]'
        };
      case 'Medium':
        return {
          badge: 'bg-[#C9A961]/15 text-[#D4BA7A] border border-[#C9A961]/30 font-bold',
          iconBg: 'bg-[#C9A961]/15 text-[#D4BA7A] border border-[#C9A961]/30',
          leftBorder: 'border-l-4 border-l-[#C9A961]/70'
        };
      case 'Low':
        return {
          badge: 'bg-[#3E7C6B]/20 text-[#68BAA4] border border-[#3E7C6B]/50 font-bold',
          iconBg: 'bg-[#3E7C6B]/20 text-[#3E7C6B] border border-[#3E7C6B]/40',
          leftBorder: 'border-l-4 border-l-[#3E7C6B]'
        };
      case 'Info':
      default:
        return {
          badge: 'bg-[#143B5C]/50 text-[#8EA5B5] border border-[#1E3F5A] font-bold',
          iconBg: 'bg-[#132C40] text-[#8EA5B5] border border-[#1E3F5A]',
          leftBorder: 'border-l-4 border-l-[#1E3F5A]'
        };
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 pb-12">
      {/* PAGE HEADER & FILTER DROPDOWN */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-sans font-extrabold text-2xl md:text-3xl text-[#D8D2C2] tracking-tight">
              Alerts & Advisories
            </h1>
            {isFallbackActive ? (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-[#C9A961]/15 text-[#C9A961] border border-[#C9A961]/30">
                Demo Data (Offline Fallback)
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-[#3E7C6B]/15 text-[#68BAA4] border border-[#3E7C6B]/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3E7C6B] animate-pulse"></span>
                Live Data
              </span>
            )}
          </div>
          <p className="text-xs md:text-sm text-[#8EA5B5] mt-0.5">
            Stay updated with critical events, IMD warnings, and maritime safety notifications.
          </p>
        </div>

        {/* CONTROLS: REFRESH & FILTER DROPDOWN */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 bg-[#132C40] border border-[#1E3F5A] px-3 py-2 rounded-xl text-xs font-semibold text-[#D8D2C2] hover:bg-[#1E3F5A] cursor-pointer shadow-xs disabled:opacity-50"
            title="Refresh & Evaluate Marine Alerts"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#C9A961] ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <div className="flex items-center gap-2 bg-[#132C40] border border-[#1E3F5A] px-3.5 py-2 rounded-xl shadow-xs">
            <Filter className="w-4 h-4 text-[#8EA5B5]" />
            <select
              value={selectedFilter}
              onChange={(e) => {
                setSelectedFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent font-semibold text-xs text-[#D8D2C2] focus:outline-none cursor-pointer"
            >
              <option value="All Alerts" className="bg-[#0B1E2D] text-[#D8D2C2]">All Alerts</option>
              <option value="Critical" className="bg-[#0B1E2D] text-[#D8D2C2]">Critical Alerts</option>
              <option value="High" className="bg-[#0B1E2D] text-[#D8D2C2]">High Severity</option>
              <option value="Medium" className="bg-[#0B1E2D] text-[#D8D2C2]">Medium Severity</option>
              <option value="Low" className="bg-[#0B1E2D] text-[#D8D2C2]">Low Severity</option>
              <option value="Info" className="bg-[#0B1E2D] text-[#D8D2C2]">System Info</option>
            </select>
          </div>
        </div>
      </div>

      {/* STAT CARDS ROW (5 STAT CARDS GRID) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* CRITICAL */}
        <div
          onClick={() => { setSelectedFilter('Critical'); setCurrentPage(1); }}
          className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
            selectedFilter === 'Critical' ? 'bg-[#B8543C]/25 border-[#B8543C] shadow-sm' : 'bg-[#132C40] border-[#1E3F5A] hover:border-[#B8543C]/60'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0B1E2D] text-[#B8543C] flex items-center justify-center shrink-0 border border-[#B8543C]/40 shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="font-mono text-xl font-bold text-[#E2B7AE]">{alertsState.isLoading ? '...' : criticalCount}</p>
              <p className="text-xs text-[#B8543C] font-semibold">Critical</p>
            </div>
          </div>
        </div>

        {/* HIGH */}
        <div
          onClick={() => { setSelectedFilter('High'); setCurrentPage(1); }}
          className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
            selectedFilter === 'High' ? 'bg-[#C9A961]/25 border-[#C9A961] shadow-sm' : 'bg-[#132C40] border-[#1E3F5A] hover:border-[#C9A961]/60'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0B1E2D] text-[#C9A961] flex items-center justify-center shrink-0 border border-[#C9A961]/40 shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="font-mono text-xl font-bold text-[#C9A961]">{alertsState.isLoading ? '...' : highCount}</p>
              <p className="text-xs text-[#C9A961] font-semibold">High</p>
            </div>
          </div>
        </div>

        {/* MEDIUM */}
        <div
          onClick={() => { setSelectedFilter('Medium'); setCurrentPage(1); }}
          className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
            selectedFilter === 'Medium' ? 'bg-[#C9A961]/20 border-[#C9A961] shadow-sm' : 'bg-[#132C40] border-[#1E3F5A] hover:border-[#C9A961]/60'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0B1E2D] text-[#D4BA7A] flex items-center justify-center shrink-0 border border-[#C9A961]/30 shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="font-mono text-xl font-bold text-[#D4BA7A]">{alertsState.isLoading ? '...' : mediumCount}</p>
              <p className="text-xs text-[#D4BA7A] font-semibold">Medium</p>
            </div>
          </div>
        </div>

        {/* LOW */}
        <div
          onClick={() => { setSelectedFilter('Low'); setCurrentPage(1); }}
          className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
            selectedFilter === 'Low' ? 'bg-[#3E7C6B]/25 border-[#3E7C6B] shadow-sm' : 'bg-[#132C40] border-[#1E3F5A] hover:border-[#3E7C6B]/60'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0B1E2D] text-[#3E7C6B] flex items-center justify-center shrink-0 border border-[#3E7C6B]/40 shadow-xs">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <p className="font-mono text-xl font-bold text-[#68BAA4]">{alertsState.isLoading ? '...' : lowCount}</p>
              <p className="text-xs text-[#3E7C6B] font-semibold">Low</p>
            </div>
          </div>
        </div>

        {/* ALL ALERTS */}
        <div
          onClick={() => { setSelectedFilter('All Alerts'); setCurrentPage(1); }}
          className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
            selectedFilter === 'All Alerts' ? 'bg-[#143B5C] border-[#C9A961] shadow-sm' : 'bg-[#132C40] border-[#1E3F5A] hover:border-[#C9A961]/60'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0B1E2D] text-[#8EA5B5] flex items-center justify-center shrink-0 border border-[#1E3F5A] shadow-xs">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="font-mono text-xl font-bold text-[#D8D2C2]">{alertsState.isLoading ? '...' : totalCount}</p>
              <p className="text-xs text-[#8EA5B5] font-semibold">All Alerts</p>
            </div>
          </div>
        </div>
      </div>

      {/* ALERT LIST CONTAINER CARD */}
      <div className="bg-[#132C40] rounded-xl border border-[#1E3F5A] shadow-card p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[#1E3F5A] pb-3">
          <h2 className="font-bold text-sm text-[#D8D2C2]">
            Active Marine Alert Console
          </h2>
          <span className="text-xs text-[#8EA5B5] font-mono">
            Filtered: {filteredAlerts.length} item{filteredAlerts.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* ALERT ROWS LIST */}
        <div className="space-y-3">
          {paginatedAlerts.length === 0 ? (
            <div className="py-8 text-center text-[#8EA5B5] text-xs">
              No alerts found for this filter severity.
            </div>
          ) : (
            paginatedAlerts.map((alt) => {
              const styles = getSeverityStyle(alt.severity);
              const Icon = getAlertIcon(alt);
              return (
                <div
                  key={alt.id}
                  className={`p-4 rounded-xl border border-[#1E3F5A] bg-[#0B1E2D] hover:bg-[#143B5C]/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer shadow-2xs ${styles.leftBorder}`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className={`p-2.5 rounded-xl shrink-0 ${styles.iconBg}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xs md:text-sm text-[#D8D2C2]">{alt.title}</h3>
                      <p className="text-xs text-[#8EA5B5] mt-0.5">{alt.description}</p>
                      <div className="flex items-center gap-1 text-[11px] text-[#8EA5B5] mt-1.5 font-mono">
                        <MapPin className="w-3 h-3 text-[#C9A961]" />
                        <span>{alt.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                    <span className="font-mono text-xs text-[#8EA5B5]">{alt.timestamp}</span>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs ${styles.badge}`}>
                        {alt.severity}
                      </span>
                      <ChevronRight className="w-4 h-4 text-[#8EA5B5]" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* PAGINATION FOOTER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 text-xs text-[#8EA5B5] border-t border-[#1E3F5A]">
          <div>
            Showing <span className="font-semibold text-[#D8D2C2]">{filteredAlerts.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</span> to{' '}
            <span className="font-semibold text-[#D8D2C2]">{Math.min(currentPage * pageSize, filteredAlerts.length)}</span> of{' '}
            <span className="font-semibold text-[#D8D2C2]">{filteredAlerts.length}</span> alerts
          </div>

          <div className="flex items-center gap-1 font-mono">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-[#1E3F5A] bg-[#0B1E2D] text-[#D8D2C2] hover:bg-[#132C40] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`w-7 h-7 rounded-lg text-xs font-semibold cursor-pointer ${
                  currentPage === p
                    ? 'bg-[#C9A961] text-[#0B1E2D] font-bold shadow-xs'
                    : 'text-[#8EA5B5] hover:bg-[#132C40] border border-[#1E3F5A]'
                }`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-[#1E3F5A] bg-[#0B1E2D] text-[#D8D2C2] hover:bg-[#132C40] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
