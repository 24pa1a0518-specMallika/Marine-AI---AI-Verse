import React, { useState, useEffect } from 'react';
import { Database, Download, Filter, Search, Calendar, RefreshCw, ChevronLeft, ChevronRight, FileText, FileDown } from 'lucide-react';
import { getCurrentsGrid, getExportCSVUrl, getExportPDFUrl } from '../api/currentsApi';

export default function CurrentsExplorerPage() {
  const [latFilter, setLatFilter] = useState('');
  const [lonFilter, setLonFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [recordTypeFilter, setRecordTypeFilter] = useState('ALL');

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const loadExplorerData = async () => {
    setLoading(true);
    try {
      const params = { limit: 400 };
      if (latFilter) params.lat = latFilter;
      if (lonFilter) params.lon = lonFilter;
      if (dateFilter) params.date = dateFilter;

      const res = await getCurrentsGrid(params);
      const rawData = res?.data?.data || res?.data || [];
      let data = Array.isArray(rawData) ? rawData : [];

      if (recordTypeFilter !== 'ALL') {
        data = data.filter(r => r.recordType === recordTypeFilter);
      }

      setRecords(data);
      setPage(1);
    } catch (err) {
      console.error('Error loading currents explorer dataset:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExplorerData();
  }, [latFilter, lonFilter, dateFilter, recordTypeFilter]);

  const totalPages = Math.ceil(records.length / pageSize) || 1;
  const paginatedRecords = records.slice((page - 1) * pageSize, page * pageSize);

  const handleExportPDFReport = () => {
    const params = {};
    if (latFilter) params.lat = latFilter;
    if (lonFilter) params.lon = lonFilter;
    if (dateFilter) params.startDate = dateFilter;

    const url = getExportPDFUrl(params);
    window.open(url, '_blank');
  };

  const handleExportReportCSV = () => {
    const params = { exportType: 'report' };
    if (latFilter) params.lat = latFilter;
    if (lonFilter) params.lon = lonFilter;
    if (dateFilter) params.startDate = dateFilter;

    const url = getExportCSVUrl(params);
    window.open(url, '_blank');
  };

  const handleExportRawCSV = () => {
    const params = { exportType: 'raw' };
    if (latFilter) params.lat = latFilter;
    if (lonFilter) params.lon = lonFilter;
    if (dateFilter) params.startDate = dateFilter;

    const url = getExportCSVUrl(params);
    window.open(url, '_blank');
  };

  return (
    <div className="max-w-[1680px] mx-auto space-y-6">
      {/* HEADER */}
      <div className="bg-[#091D2C] border border-[#1E3F5A] rounded-2xl p-5 md:p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#C9A961] mb-1">
            <Database className="w-4 h-4" />
            <span className="uppercase font-bold tracking-widest">RESEARCHER DATA EXPLORER</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#D8D2C2] tracking-tight">Current Data Explorer</h1>
          <p className="text-xs text-[#8EA5B5] mt-1">
            Filter, inspect, and generate analytical intelligence reports in PDF & CSV formats from ocean current observations.
          </p>
        </div>

        {/* REPORT & RAW DATASET DOWNLOAD BUTTONS */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportPDFReport}
            className="px-4 py-2.5 bg-[#C9A961] hover:bg-[#d8b870] text-[#0B1E2D] font-extrabold text-xs font-mono rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2 uppercase tracking-wider"
            title="Download formatted Analytical Intelligence Document in PDF format with executive summary metrics and severity distribution"
          >
            <FileDown className="w-4 h-4" />
            <span>Download PDF Report</span>
          </button>

          <button
            onClick={handleExportReportCSV}
            className="px-3.5 py-2.5 bg-[#0F2436] hover:bg-[#1E3F5A] border border-[#1E3F5A] text-[#D8D2C2] hover:text-white font-bold text-xs font-mono rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5 uppercase"
            title="Download Analytical Report in CSV format"
          >
            <FileText className="w-4 h-4 text-[#C9A961]" />
            <span>CSV Report</span>
          </button>

          <button
            onClick={handleExportRawCSV}
            className="px-3 py-2.5 bg-[#0F2436] hover:bg-[#1E3F5A] border border-[#1E3F5A] text-[#8EA5B5] hover:text-white font-bold text-xs font-mono rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5 uppercase"
            title="Download raw dataset CSV table"
          >
            <Download className="w-4 h-4" />
            <span>Raw Data</span>
          </button>
        </div>
      </div>

      {/* FILTERS PANEL */}
      <div className="bg-[#091D2C] border border-[#1E3F5A] rounded-2xl p-4 md:p-5 shadow-xl space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-[#1E3F5A] pb-2">
          <div className="flex items-center gap-2 font-bold text-[#D8D2C2] uppercase">
            <Filter className="w-4 h-4 text-[#C9A961]" />
            <span>Search & Query Filters</span>
          </div>
          <button
            onClick={() => { setLatFilter(''); setLonFilter(''); setDateFilter(''); setRecordTypeFilter('ALL'); }}
            className="text-[11px] text-[#8EA5B5] hover:text-white transition-colors cursor-pointer"
          >
            Clear Filters
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-[#8EA5B5] mb-1">Latitude (°N)</label>
            <input
              type="number"
              step="any"
              placeholder="Filter Latitude (e.g. 16.5)"
              value={latFilter}
              onChange={(e) => setLatFilter(e.target.value)}
              className="w-full bg-[#0F2436] border border-[#1E3F5A] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#C9A961]"
            />
          </div>

          <div>
            <label className="block text-[#8EA5B5] mb-1">Longitude (°E)</label>
            <input
              type="number"
              step="any"
              placeholder="Filter Longitude (e.g. 82.5)"
              value={lonFilter}
              onChange={(e) => setLonFilter(e.target.value)}
              className="w-full bg-[#0F2436] border border-[#1E3F5A] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#C9A961]"
            />
          </div>

          <div>
            <label className="block text-[#8EA5B5] mb-1">Observation Date</label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full bg-[#0F2436] border border-[#1E3F5A] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#C9A961]"
            />
          </div>

          <div>
            <label className="block text-[#8EA5B5] mb-1">Record Stream</label>
            <select
              value={recordTypeFilter}
              onChange={(e) => setRecordTypeFilter(e.target.value)}
              className="w-full bg-[#0F2436] border border-[#1E3F5A] rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-[#C9A961] cursor-pointer"
            >
              <option value="ALL">All Streams (Observations & Model)</option>
              <option value="OBSERVATION">Observations Only</option>
              <option value="PREDICTION">Model Predictions Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* DATA EXPLORER TABLE */}
      <div className="bg-[#091D2C] border border-[#1E3F5A] rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between font-mono text-xs">
          <span className="text-[#8EA5B5]">
            Showing <strong className="text-white">{records.length}</strong> matching records (Page {page} of {totalPages})
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 bg-[#0F2436] disabled:opacity-40 border border-[#1E3F5A] rounded-lg text-white cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 bg-[#0F2436] disabled:opacity-40 border border-[#1E3F5A] rounded-lg text-white cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto font-mono text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1E3F5A] text-[#8EA5B5] bg-[#0F2436]">
                <th className="p-3">Timestamp</th>
                <th className="p-3">Latitude</th>
                <th className="p-3">Longitude</th>
                <th className="p-3">u (Eastward)</th>
                <th className="p-3">v (Northward)</th>
                <th className="p-3">Speed (m/s)</th>
                <th className="p-3">Direction (°)</th>
                <th className="p-3">Data Source</th>
                <th className="p-3">Record Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E3F5A]/50">
              {paginatedRecords.map((r, idx) => (
                <tr key={idx} className="hover:bg-[#0F2436]/40 transition-colors">
                  <td className="p-3 text-white font-bold">{r.timestamp}</td>
                  <td className="p-3">{r.latitude}° N</td>
                  <td className="p-3">{r.longitude}° E</td>
                  <td className="p-3 text-white">{r.u}</td>
                  <td className="p-3 text-white">{r.v}</td>
                  <td className="p-3 text-[#00F5D4] font-bold">{r.speed}</td>
                  <td className="p-3 text-[#C9A961] font-bold">{r.direction}°</td>
                  <td className="p-3 text-[#8EA5B5] text-[10px]">{r.source || 'NASA PO.DAAC'}</td>
                  <td className="p-3">
                    <span className="text-[10px] bg-[#00F5D4]/15 border border-[#00F5D4]/30 text-[#00F5D4] px-2 py-0.5 rounded font-bold">
                      {r.recordType || 'OBSERVATION'}
                    </span>
                  </td>
                </tr>
              ))}
              {paginatedRecords.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-[#8EA5B5]">
                    No current records match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
