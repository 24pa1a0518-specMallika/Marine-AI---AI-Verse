import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  Download, 
  Plus, 
  MoreVertical, 
  TrendingUp, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  ShieldAlert, 
  CloudSun, 
  Route, 
  Calendar, 
  Check,
  FileCheck
} from 'lucide-react';
import { getReports, getReportSummary } from '../api/reportsApi';

const FALLBACK_INITIAL_REPORTS = [
  {
    id: 'rep-1',
    name: 'Risk Assessment Report',
    description: 'High wind and wave analysis',
    type: 'Risk Report',
    typeCategory: 'Risk Reports',
    generatedOn: 'May 20, 2025 10:20 AM',
    location: 'Bay of Bengal, India',
    areaDetail: '1200 km²',
    format: 'PDF',
    size: '2.4 MB',
    status: 'Completed',
    downloadUrl: '#'
  },
  {
    id: 'rep-2',
    name: 'Weather Summary Report',
    description: '7-day weather overview',
    type: 'Weather Report',
    typeCategory: 'Weather Reports',
    generatedOn: 'May 20, 2025 09:15 AM',
    location: 'Bay of Bengal, India',
    areaDetail: '1200 km²',
    format: 'PDF',
    size: '1.8 MB',
    status: 'Completed',
    downloadUrl: '#'
  },
  {
    id: 'rep-3',
    name: 'Route Analysis Report',
    description: 'PFZ-03 route evaluation',
    type: 'Route Report',
    typeCategory: 'Route Reports',
    generatedOn: 'May 19, 2025 04:30 PM',
    location: 'PFZ-03 Route',
    areaDetail: '21.7 km',
    format: 'PDF',
    size: '1.6 MB',
    status: 'Completed',
    downloadUrl: '#'
  },
  {
    id: 'rep-4',
    name: 'Daily Summary Report',
    description: 'Daily insights and alerts',
    type: 'Summary Report',
    typeCategory: 'Summary Reports',
    generatedOn: 'May 19, 2025 08:00 AM',
    location: 'Bay of Bengal, India',
    areaDetail: '1200 km²',
    format: 'PDF',
    size: '1.2 MB',
    status: 'Scheduled',
    downloadUrl: '#'
  },
  {
    id: 'rep-5',
    name: 'Geofence Activity Report',
    description: 'Geofence alerts and events',
    type: 'Risk Report',
    typeCategory: 'Risk Reports',
    generatedOn: 'May 18, 2025 06:45 PM',
    location: 'All Geofences',
    areaDetail: '5 Zones',
    format: 'PDF',
    size: '1.9 MB',
    status: 'Completed',
    downloadUrl: '#'
  },
  {
    id: 'rep-6',
    name: 'INCOIS PFZ Density Audit',
    description: 'SST fish catch overlay',
    type: 'Summary Report',
    typeCategory: 'Summary Reports',
    generatedOn: 'May 17, 2025 11:10 AM',
    location: 'Kakinada Offshore',
    areaDetail: '450 km²',
    format: 'PDF',
    size: '3.1 MB',
    status: 'Completed',
    downloadUrl: '#'
  },
  {
    id: 'rep-7',
    name: 'Monsoon Swell Hazard Report',
    description: 'High wave warning & storm surge analysis',
    type: 'Weather Report',
    typeCategory: 'Weather Reports',
    generatedOn: 'May 16, 2025 02:40 PM',
    location: 'Vizag Coastline',
    areaDetail: '890 km²',
    format: 'PDF',
    size: '2.8 MB',
    status: 'Completed',
    downloadUrl: '#'
  },
  {
    id: 'rep-8',
    name: 'Artisanal Vessel Navigation Logs',
    description: 'Fuel economy & waypoint safety logbook',
    type: 'Route Report',
    typeCategory: 'Route Reports',
    generatedOn: 'May 15, 2025 07:20 AM',
    location: 'Coromandel Fairway',
    areaDetail: '180.5 km',
    format: 'PDF',
    size: '1.5 MB',
    status: 'Scheduled',
    downloadUrl: '#'
  },
  {
    id: 'rep-9',
    name: 'Maritime Boundary Excursion Log',
    description: 'Geofence warning events audit',
    type: 'Risk Report',
    typeCategory: 'Risk Reports',
    generatedOn: 'May 14, 2025 05:00 PM',
    location: 'International Maritime Boundary',
    areaDetail: '3 Zones',
    format: 'PDF',
    size: '2.1 MB',
    status: 'Completed',
    downloadUrl: '#'
  },
  {
    id: 'rep-10',
    name: 'Weekly Operational Overview',
    description: 'Aggregated telemetry and fleet statistics',
    type: 'Summary Report',
    typeCategory: 'Summary Reports',
    generatedOn: 'May 12, 2025 09:00 AM',
    location: 'Bay of Bengal Sector',
    areaDetail: '3500 km²',
    format: 'PDF',
    size: '4.2 MB',
    status: 'Completed',
    downloadUrl: '#'
  }
];

const TAB_CATEGORIES = [
  'All Reports',
  'Risk Reports',
  'Weather Reports',
  'Route Reports',
  'Summary Reports'
];

export default function ReportsPage() {
  const [reportsState, setReportsState] = useState({
    reports: FALLBACK_INITIAL_REPORTS,
    summary: null,
    isLoading: true,
    isFallback: false,
    error: null
  });

  const [activeTab, setActiveTab] = useState('All Reports');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [downloadNotice, setDownloadNotice] = useState(null);

  // New Report Form State
  const [formData, setFormData] = useState({
    name: '',
    typeCategory: 'Risk Reports',
    location: 'Bay of Bengal, India',
    format: 'PDF',
    scheduleType: 'Immediate'
  });

  useEffect(() => {
    let isMounted = true;

    Promise.all([
      getReports(),
      getReportSummary()
    ]).then(([reportsRes, summaryRes]) => {
      if (!isMounted) return;
      setReportsState({
        reports: reportsRes.data || FALLBACK_INITIAL_REPORTS,
        summary: summaryRes.data || null,
        isLoading: false,
        isFallback: !!(reportsRes.isFallback || summaryRes.isFallback),
        error: reportsRes.error || summaryRes.error || null
      });
    }).catch((err) => {
      if (!isMounted) return;
      setReportsState({
        reports: FALLBACK_INITIAL_REPORTS,
        summary: null,
        isLoading: false,
        isFallback: true,
        error: err
      });
    });

    return () => { isMounted = false; };
  }, []);

  const reports = reportsState.reports || FALLBACK_INITIAL_REPORTS;
  const isFallbackActive = reportsState.isFallback;

  // Stat Counts
  const completedCount = useMemo(() => reports.filter((r) => r.status === 'Completed').length * 4, [reports]);
  const scheduledCount = useMemo(() => reports.filter((r) => r.status === 'Scheduled').length * 3, [reports]);

  // Filter Reports by Active Tab
  const filteredReports = useMemo(() => {
    if (activeTab === 'All Reports') return reports;
    return reports.filter((r) => r.typeCategory === activeTab);
  }, [reports, activeTab]);

  // Paginated Reports
  const totalPages = Math.ceil(filteredReports.length / pageSize) || 1;
  const paginatedReports = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredReports.slice(start, start + pageSize);
  }, [filteredReports, currentPage]);

  const handleDownload = (report) => {
    setDownloadNotice(`Downloading ${report.name} (${report.size})...`);
    try {
      const reportContent = `# Marine AI Maritime Report\n\nTitle: ${report.name}\nType: ${report.type}\nLocation: ${report.location}\nGenerated On: ${report.generatedOn}\nStatus: ${report.status}\n\nSummary:\n${report.description}\n\nData Authority: INCOIS & Indian Meteorological Department (IMD)\nMarine AI System: V2.4 Authenticated Session`;
      const blob = new Blob([reportContent], { type: 'text/markdown;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${report.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}.md`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.warn('Download error:', e);
    }
    setTimeout(() => {
      setDownloadNotice(null);
    }, 2500);
  };

  const handleGenerateSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    let typeName = 'Risk Report';
    if (formData.typeCategory === 'Weather Reports') typeName = 'Weather Report';
    if (formData.typeCategory === 'Route Reports') typeName = 'Route Report';
    if (formData.typeCategory === 'Summary Reports') typeName = 'Summary Report';

    const newRep = {
      id: `rep-${Date.now()}`,
      name: formData.name,
      description: 'Custom generated analytical report',
      type: typeName,
      typeCategory: formData.typeCategory,
      generatedOn: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      location: formData.location,
      areaDetail: '1200 km²',
      format: formData.format,
      size: '2.1 MB',
      status: formData.scheduleType === 'Scheduled' ? 'Scheduled' : 'Completed',
      downloadUrl: '#'
    };

    setReportsState((prev) => ({
      ...prev,
      reports: [newRep, ...prev.reports]
    }));
    setIsGenerateModalOpen(false);
    setFormData({
      name: '',
      typeCategory: 'Risk Reports',
      location: 'Bay of Bengal, India',
      format: 'PDF',
      scheduleType: 'Immediate'
    });
  };

  // Helper for Type Badges
  const getTypeBadgeStyle = (type) => {
    switch (type) {
      case 'Risk Report':
        return 'bg-red-50 text-red-600 border border-red-200/60';
      case 'Weather Report':
        return 'bg-blue-50 text-blue-600 border border-blue-200/60';
      case 'Route Report':
        return 'bg-emerald-50 text-emerald-600 border border-emerald-200/60';
      case 'Summary Report':
        return 'bg-amber-50 text-amber-600 border border-amber-200/60';
      default:
        return 'bg-slate-100 text-slate-600 border border-slate-200';
    }
  };

  // Helper for Icon in Row
  const getReportIcon = (type) => {
    switch (type) {
      case 'Risk Report':
        return <ShieldAlert className="w-4 h-4 text-red-500" />;
      case 'Weather Report':
        return <CloudSun className="w-4 h-4 text-blue-500" />;
      case 'Route Report':
        return <Route className="w-4 h-4 text-emerald-500" />;
      case 'Summary Report':
        return <Calendar className="w-4 h-4 text-amber-500" />;
      default:
        return <FileText className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 pb-8">
      {/* DOWNLOAD TOAST NOTIFICATION */}
      {downloadNotice && (
        <div className="fixed bottom-6 right-6 z-[1000] bg-slate-900 text-white text-xs font-mono px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-bottom duration-200">
          <FileCheck className="w-4 h-4 text-emerald-400" />
          <span>{downloadNotice}</span>
        </div>
      )}

      {/* PAGE HEADER WITH GENERATE REPORT BUTTON */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-sans font-extrabold text-2xl md:text-3xl text-[#0F172A] tracking-tight">
              Reports
            </h1>
            {isFallbackActive ? (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-amber-50 text-amber-700 border border-amber-200">
                Demo Data (Offline Fallback)
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Live Data
              </span>
            )}
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Generate and download insights on weather, risks, routes, and operational telemetry.
          </p>
        </div>

        <button
          onClick={() => setIsGenerateModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-[#1363DF] hover:bg-[#0D4EB3] text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow-sm transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Generate New Report</span>
        </button>
      </div>

      {/* CATEGORY TABS ROW */}
      <div className="border-b border-[#E2E8F0] flex items-center gap-6 overflow-x-auto text-xs font-medium scrollbar-none">
        {TAB_CATEGORIES.map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setCurrentPage(1);
            }}
            className={`pb-3 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === tab
                ? 'border-b-2 border-[#1363DF] text-[#1363DF] font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* STAT CARDS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CARD 1: TOTAL REPORTS */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#1363DF] flex items-center justify-center shrink-0 border border-blue-100">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Reports</p>
              <p className="font-mono text-xl md:text-2xl font-bold text-[#0F172A] mt-0.5">
                {reportsState.isLoading ? '...' : 42}
              </p>
              <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold mt-1">
                <TrendingUp className="w-3 h-3" />
                <span>12% this month</span>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2: COMPLETED */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Completed</p>
              <p className="font-mono text-xl md:text-2xl font-bold text-[#0F172A] mt-0.5">
                {reportsState.isLoading ? '...' : completedCount}
              </p>
              <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold mt-1">
                <TrendingUp className="w-3 h-3" />
                <span>8% this month</span>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 3: SCHEDULED */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Scheduled</p>
              <p className="font-mono text-xl md:text-2xl font-bold text-[#0F172A] mt-0.5">
                {reportsState.isLoading ? '...' : scheduledCount}
              </p>
              <p className="text-[11px] text-slate-400 font-medium mt-1">No change</p>
            </div>
          </div>
        </div>

        {/* CARD 4: DOWNLOADS */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Downloads</p>
              <p className="font-mono text-xl md:text-2xl font-bold text-[#0F172A] mt-0.5">128</p>
              <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold mt-1">
                <TrendingUp className="w-3 h-3" />
                <span>15% this month</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* REPORTS DATA TABLE CARD */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card p-5 space-y-4">
        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4 font-semibold">Report Name</th>
                <th className="py-3 px-4 font-semibold">Type</th>
                <th className="py-3 px-4 font-semibold">Generated On</th>
                <th className="py-3 px-4 font-semibold">Location/Area</th>
                <th className="py-3 px-4 font-semibold">Format</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedReports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                    No reports found in this category.
                  </td>
                </tr>
              ) : (
                paginatedReports.map((rep) => (
                  <tr key={rep.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* REPORT NAME */}
                    <td className="py-4 px-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-slate-100 shrink-0 mt-0.5">
                          {getReportIcon(rep.type)}
                        </div>
                        <div>
                          <p className="font-bold text-[#0F172A]">{rep.name}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{rep.description}</p>
                        </div>
                      </div>
                    </td>

                    {/* TYPE */}
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-semibold ${getTypeBadgeStyle(rep.type)}`}>
                        {rep.type}
                      </span>
                    </td>

                    {/* GENERATED ON */}
                    <td className="py-4 px-4 text-slate-600 font-mono text-[11px]">
                      {rep.generatedOn}
                    </td>

                    {/* LOCATION / AREA */}
                    <td className="py-4 px-4">
                      <p className="font-medium text-slate-800">{rep.location}</p>
                      <p className="text-[11px] font-mono text-slate-400 mt-0.5">{rep.areaDetail}</p>
                    </td>

                    {/* FORMAT */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5 font-mono text-xs">
                        <span className="text-red-500 font-bold">📄 {rep.format}</span>
                        <span className="text-slate-400 text-[11px]">{rep.size}</span>
                      </div>
                    </td>

                    {/* STATUS */}
                    <td className="py-4 px-4">
                      {rep.status === 'Completed' ? (
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200/70">
                          Completed
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-600 border border-amber-200/70">
                          Scheduled
                        </span>
                      )}
                    </td>

                    {/* ACTIONS */}
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2 text-slate-400">
                        {rep.status === 'Completed' && (
                          <button
                            onClick={() => handleDownload(rep)}
                            className="p-1.5 rounded-lg hover:text-[#1363DF] hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Download Report"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        )}
                        <button className="p-1.5 rounded-lg hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION FOOTER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs text-slate-500">
          <div>
            Showing <span className="font-semibold text-slate-800">{filteredReports.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</span> to{' '}
            <span className="font-semibold text-slate-800">{Math.min(currentPage * pageSize, filteredReports.length)}</span> of{' '}
            <span className="font-semibold text-slate-800">42</span> reports
          </div>

          <div className="flex items-center gap-1 font-mono">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`w-7 h-7 rounded-lg text-xs font-semibold cursor-pointer ${
                  currentPage === p
                    ? 'bg-[#1363DF] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* GENERATE NEW REPORT MODAL */}
      {isGenerateModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-[1000] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-md w-full p-5 space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-[#0F172A]">Generate Analytical Report</h3>
              <button
                onClick={() => setIsGenerateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGenerateSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Report Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Kakinada Weekly Swell & Wave Audit"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-[#1363DF]"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Report Category</label>
                <select
                  value={formData.typeCategory}
                  onChange={(e) => setFormData({ ...formData, typeCategory: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="Risk Reports">Risk Report</option>
                  <option value="Weather Reports">Weather Report</option>
                  <option value="Route Reports">Route Report</option>
                  <option value="Summary Reports">Summary Report</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Target Geographic Sector</label>
                <select
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="Bay of Bengal, India">Bay of Bengal, India</option>
                  <option value="Vizag Offshore Sector">Vizag Offshore Sector</option>
                  <option value="PFZ-03 Route Corridor">PFZ-03 Route Corridor</option>
                  <option value="All Geofences">All Geofences</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Export Format</label>
                  <select
                    value={formData.format}
                    onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none cursor-pointer font-mono"
                  >
                    <option value="PDF">PDF Document</option>
                    <option value="CSV">CSV Data File</option>
                    <option value="JSON">JSON Telemetry</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Execution</label>
                  <select
                    value={formData.scheduleType}
                    onChange={(e) => setFormData({ ...formData, scheduleType: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none cursor-pointer"
                  >
                    <option value="Immediate">Generate Now</option>
                    <option value="Scheduled">Schedule Daily</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsGenerateModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1363DF] hover:bg-[#0D4EB3] text-white rounded-lg font-semibold shadow-xs cursor-pointer"
                >
                  Generate Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
