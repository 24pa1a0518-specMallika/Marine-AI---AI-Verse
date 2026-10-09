import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Polygon, Circle, Marker, Popup, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  MoreVertical, 
  Hexagon, 
  CheckCircle2, 
  PauseCircle, 
  AlertTriangle,
  Bell,
  Anchor,
  Compass,
  X,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import { getGeofences, checkGeofence } from '../api/geofenceApi';
import { adaptGeofenceModel } from '../api/adapters';
import { useLocation } from '../context/LocationContext';
import MapController from '../components/map/MapController';
import BaseMapLayers from '../components/map/BaseMapLayers';
import BasemapSwitcher from '../components/map/BasemapSwitcher';

const INITIAL_GEOFENCES = [
  {
    id: 'geo-1',
    name: 'Restricted Area',
    description: 'High risk restricted zone',
    type: 'Restricted',
    status: 'Active',
    createdOn: 'May 19, 2025 09:30 AM',
    area: '120.5 km²',
    alerts: 1,
    coordinates: [
      [16.95, 82.38],
      [17.08, 82.55],
      [16.90, 82.65],
      [16.82, 82.48]
    ]
  },
  {
    id: 'geo-2',
    name: 'Safe Zone',
    description: 'Safe navigation area',
    type: 'Safe',
    status: 'Active',
    createdOn: 'May 18, 2025 03:15 PM',
    area: '98.3 km²',
    alerts: 0,
    coordinates: [
      [16.92, 82.68],
      [17.02, 82.82],
      [16.85, 82.90],
      [16.80, 82.72]
    ]
  },
  {
    id: 'geo-3',
    name: 'Port Area',
    description: 'Port operations zone',
    type: 'Port',
    status: 'Active',
    createdOn: 'May 17, 2025 11:20 AM',
    area: '75.6 km²',
    alerts: 0,
    coordinates: [
      [16.78, 82.35],
      [16.85, 82.45],
      [16.70, 82.50],
      [16.65, 82.38]
    ]
  },
  {
    id: 'geo-4',
    name: 'Fishing Zone',
    description: 'Designated fishing area',
    type: 'Fishing',
    status: 'Inactive',
    createdOn: 'May 16, 2025 08:45 AM',
    area: '60.2 km²',
    alerts: 0,
    isCircle: true,
    center: [16.92, 82.25],
    radius: 12000
  },
  {
    id: 'geo-5',
    name: 'Kakinada Anchorage Zone',
    description: 'Commercial vessel mooring perimeter',
    type: 'Port',
    status: 'Active',
    createdOn: 'May 14, 2025 02:10 PM',
    area: '42.1 km²',
    alerts: 0,
    coordinates: [[16.98, 82.28], [17.04, 82.35], [16.95, 82.40]]
  }
];

export default function GeofencesPage() {
  const { selectedLocation, refreshTrigger } = useLocation();
  const activeLat = selectedLocation?.lat ?? 16.98;
  const activeLon = selectedLocation?.lon ?? 82.24;

  const [basemap, setBasemap] = useState('satellite');
  const [geofences, setGeofences] = useState(INITIAL_GEOFENCES);
  const [isFallback, setIsFallback] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4;

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingGeofence, setEditingGeofence] = useState(null);

  // New Geofence Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'Restricted',
    status: 'Active',
    area: '50.0 km²'
  });

  useEffect(() => {
    let isMounted = true;
    async function loadGeofenceData() {
      try {
        const res = await getGeofences({ latitude: activeLat, longitude: activeLon });
        if (!isMounted) return;
        setIsFallback(res.isFallback);
        if (res.data && res.data.length > 0) {
          const adapted = res.data.map(adaptGeofenceModel).filter(Boolean);
          if (adapted.length > 0) {
            setGeofences(adapted);
          }
        }
      } catch {
        // Fallback is handled inside service
      }
    }
    loadGeofenceData();
    return () => { isMounted = false; };
  }, [activeLat, activeLon, refreshTrigger]);

  // Calculate Summary Statistics
  const totalGeofences = geofences.length;
  const activeGeofences = geofences.filter(g => g.status === 'Active').length;
  const inactiveGeofences = geofences.filter(g => g.status === 'Inactive').length;
  const triggeredGeofences = geofences.filter(g => g.alerts > 0).length;

  // Filter Geofences
  const filteredGeofences = useMemo(() => {
    return geofences.filter((g) => {
      const matchesSearch = 
        g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = 
        statusFilter === 'All Status' ||
        (statusFilter === 'Triggered' ? g.alerts > 0 : g.status === statusFilter);

      const matchesType = 
        typeFilter === 'All Types' || g.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [geofences, searchQuery, statusFilter, typeFilter]);

  // Paginated Geofences
  const totalPages = Math.ceil(filteredGeofences.length / pageSize) || 1;
  const paginatedGeofences = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredGeofences.slice(start, start + pageSize);
  }, [filteredGeofences, currentPage]);

  // Handle Delete
  const handleDelete = (id) => {
    setGeofences(prev => prev.filter(g => g.id !== id));
  };

  // Handle Form Submit (Create / Edit)
  const handleSaveGeofence = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingGeofence) {
      setGeofences(prev => prev.map(g => g.id === editingGeofence.id ? {
        ...g,
        name: formData.name,
        description: formData.description,
        type: formData.type,
        status: formData.status,
        area: formData.area
      } : g));
      setEditingGeofence(null);
    } else {
      const newGeo = {
        id: `geo-${Date.now()}`,
        name: formData.name,
        description: formData.description || 'Custom user boundary zone',
        type: formData.type,
        status: formData.status,
        createdOn: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        area: formData.area,
        alerts: 0,
        coordinates: [
          [16.91, 82.35],
          [17.00, 82.48],
          [16.88, 82.55]
        ]
      };
      setGeofences(prev => [newGeo, ...prev]);
    }

    setIsCreateModalOpen(false);
    setFormData({ name: '', description: '', type: 'Restricted', status: 'Active', area: '50.0 km²' });
  };

  const getTypeBadgeStyle = (type) => {
    switch (type) {
      case 'Restricted':
        return 'bg-[#B8543C]/20 text-[#E2B7AE] border border-[#B8543C]/50 font-medium';
      case 'Safe':
        return 'bg-[#3E7C6B]/20 text-[#68BAA4] border border-[#3E7C6B]/50 font-medium';
      case 'Port':
        return 'bg-[#C9A961]/20 text-[#C9A961] border border-[#C9A961]/50 font-medium';
      case 'Fishing':
        return 'bg-[#143B5C]/60 text-[#8EA5B5] border border-[#1E3F5A] font-medium';
      default:
        return 'bg-[#132C40] text-[#8EA5B5] border border-[#1E3F5A] font-medium';
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 pb-8">
      {/* PAGE HEADER WITH ACTION BUTTON */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-sans font-extrabold text-2xl md:text-3xl text-[#D8D2C2] tracking-tight">
              Geofences
            </h1>
            {isFallback && (
              <span className="text-[10px] font-mono text-[#C9A961] bg-[#C9A961]/15 border border-[#C9A961]/30 px-2 py-0.5 rounded-full">
                Demo Data (Offline Fallback)
              </span>
            )}
          </div>
          <p className="text-xs md:text-sm text-[#8EA5B5] mt-0.5">
            Create, manage, and monitor geofenced areas.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingGeofence(null);
            setFormData({ name: '', description: '', type: 'Restricted', status: 'Active', area: '50.0 km²' });
            setIsCreateModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 bg-[#C9A961] hover:bg-[#D4BA7A] text-[#0B1E2D] font-bold text-xs px-4 py-2.5 rounded-lg shadow-sm transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create Geofence</span>
        </button>
      </div>

      {/* STAT CARDS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#132C40] rounded-xl border border-[#1E3F5A] p-4 flex items-center justify-between shadow-card">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#0B1E2D] text-[#C9A961] flex items-center justify-center shrink-0 border border-[#1E3F5A]">
              <Hexagon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-[#8EA5B5] font-medium">Total Geofences</p>
              <p className="font-mono text-xl md:text-2xl font-bold text-[#D8D2C2] mt-0.5">{totalGeofences}</p>
            </div>
          </div>
        </div>

        <div className="bg-[#132C40] rounded-xl border border-[#1E3F5A] p-4 flex items-center justify-between shadow-card">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#0B1E2D] text-[#3E7C6B] flex items-center justify-center shrink-0 border border-[#3E7C6B]/40">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-[#8EA5B5] font-medium">Active</p>
              <p className="font-mono text-xl md:text-2xl font-bold text-[#D8D2C2] mt-0.5">{activeGeofences}</p>
            </div>
          </div>
        </div>

        <div className="bg-[#132C40] rounded-xl border border-[#1E3F5A] p-4 flex items-center justify-between shadow-card">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#0B1E2D] text-[#C9A961] flex items-center justify-center shrink-0 border border-[#C9A961]/40">
              <PauseCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-[#8EA5B5] font-medium">Inactive</p>
              <p className="font-mono text-xl md:text-2xl font-bold text-[#D8D2C2] mt-0.5">{inactiveGeofences}</p>
            </div>
          </div>
        </div>

        <div className="bg-[#132C40] rounded-xl border border-[#1E3F5A] p-4 flex items-center justify-between shadow-card">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#0B1E2D] text-[#B8543C] flex items-center justify-center shrink-0 border border-[#B8543C]/40">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-[#8EA5B5] font-medium">Triggered</p>
              <p className="font-mono text-xl md:text-2xl font-bold text-[#E2B7AE] mt-0.5">{triggeredGeofences}</p>
            </div>
          </div>
        </div>
      </div>

      {/* MAP OVERLAY DISPLAY */}
      <div className="bg-[#132C40] rounded-xl border border-[#1E3F5A] shadow-card overflow-hidden">
        <div className="h-[340px] md:h-[380px] relative w-full">
          {/* FLOATING BASEMAP SWITCHER */}
          <div className="absolute top-3 right-3 z-[400]">
            <BasemapSwitcher basemap={basemap} onBasemapChange={setBasemap} />
          </div>

          <MapContainer
            center={[activeLat, activeLon]}
            zoom={9}
            zoomControl={false}
            scrollWheelZoom={true}
            className="w-full h-full z-10"
          >
            <MapController center={[activeLat, activeLon]} zoom={9} />
            <BaseMapLayers basemap={basemap} />

            {geofences.map((g) => {
              const tooltipClass = g.type === 'Restricted' ? 'risk-tooltip-high' : g.type === 'Safe' ? 'risk-tooltip-low' : 'risk-tooltip-mod';

              if (g.isCircle && g.center) {
                return (
                  <Circle
                    key={g.id}
                    center={g.center}
                    radius={g.radius || 12000}
                    pathOptions={{ color: '#C9A961', fillColor: '#C9A961', fillOpacity: 0.18, weight: 2 }}
                  >
                    <Tooltip sticky direction="top" className={tooltipClass}>
                      <div className="space-y-1 max-w-[220px] text-xs">
                        <div className="flex items-center justify-between border-b border-[#1E3F5A] pb-1">
                          <span className="font-bold text-[#D8D2C2]">{g.name}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded font-bold bg-[#143B5C] text-[#C9A961]">
                            {g.type}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#8EA5B5] space-y-0.5">
                          <p>Radius: <span className="font-semibold text-[#D8D2C2]">{((g.radius || 12000) / 1000).toFixed(1)} km</span></p>
                          <p>Status: <span className="text-[#3E7C6B] font-semibold">{g.status}</span></p>
                          {g.description && <p className="text-[10px] text-[#8EA5B5]/70 italic">{g.description}</p>}
                        </div>
                      </div>
                    </Tooltip>
                    <Popup><div className="font-mono text-xs font-bold">{g.name}</div></Popup>
                  </Circle>
                );
              }
              if (g.coordinates && g.coordinates.length > 0) {
                return (
                  <Polygon
                    key={g.id}
                    positions={g.coordinates}
                    pathOptions={{
                      color: g.type === 'Restricted' ? '#B8543C' : g.type === 'Safe' ? '#3E7C6B' : '#C9A961',
                      fillColor: g.type === 'Restricted' ? '#B8543C' : g.type === 'Safe' ? '#3E7C6B' : '#C9A961',
                      fillOpacity: 0.20,
                      weight: 2
                    }}
                  >
                    <Tooltip sticky direction="top" className={tooltipClass}>
                      <div className="space-y-1 max-w-[220px] text-xs">
                        <div className="flex items-center justify-between border-b border-[#1E3F5A] pb-1">
                          <span className="font-bold text-[#D8D2C2]">{g.name}</span>
                          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                            g.type === 'Restricted' ? 'bg-[#B8543C]/20 text-[#E2B7AE]' : g.type === 'Safe' ? 'bg-[#3E7C6B]/20 text-[#68BAA4]' : 'bg-[#C9A961]/20 text-[#C9A961]'
                          }`}>
                            {g.type}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#8EA5B5] space-y-0.5">
                          <p>Area: <span className="font-semibold text-[#D8D2C2]">{g.area || 'Designated Zone'}</span></p>
                          <p>Status: <span className="text-[#3E7C6B] font-semibold">{g.status}</span></p>
                          {g.description && <p className="text-[10px] text-[#8EA5B5]/70 italic">{g.description}</p>}
                        </div>
                      </div>
                    </Tooltip>
                    <Popup><div className="font-mono text-xs font-bold">{g.name}</div></Popup>
                  </Polygon>
                );
              }
              return null;
            })}
          </MapContainer>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-[#132C40] rounded-xl border border-[#1E3F5A] shadow-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-[#8EA5B5] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search geofences..."
            className="w-full bg-[#0B1E2D] border border-[#1E3F5A] rounded-lg pl-9 pr-4 py-2 text-xs text-[#D8D2C2] placeholder-[#8EA5B5]/60 focus:outline-none focus:border-[#C9A961]"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#0B1E2D] border border-[#1E3F5A] rounded-lg px-3 py-2 text-xs text-[#D8D2C2] focus:outline-none cursor-pointer font-mono"
          >
            <option className="bg-[#0B1E2D]">All Status</option>
            <option className="bg-[#0B1E2D]">Active</option>
            <option className="bg-[#0B1E2D]">Inactive</option>
            <option className="bg-[#0B1E2D]">Triggered</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-[#0B1E2D] border border-[#1E3F5A] rounded-lg px-3 py-2 text-xs text-[#D8D2C2] focus:outline-none cursor-pointer font-mono"
          >
            <option className="bg-[#0B1E2D]">All Types</option>
            <option className="bg-[#0B1E2D]">Restricted</option>
            <option className="bg-[#0B1E2D]">Safe</option>
            <option className="bg-[#0B1E2D]">Port</option>
            <option className="bg-[#0B1E2D]">Fishing</option>
          </select>
        </div>
      </div>

      {/* GEOFENCE LIST CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {paginatedGeofences.map((geo) => (
          <div key={geo.id} className="bg-[#132C40] rounded-xl border border-[#1E3F5A] shadow-card p-5 space-y-3 flex flex-col justify-between">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-[#D8D2C2]">{geo.name}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider ${getTypeBadgeStyle(geo.type)}`}>
                    {geo.type}
                  </span>
                </div>
                <p className="text-xs text-[#8EA5B5] mt-1">{geo.description}</p>
              </div>

              <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold shrink-0 ${geo.status === 'Active' ? 'bg-[#3E7C6B]/20 text-[#68BAA4] border border-[#3E7C6B]/40' : 'bg-[#143B5C]/60 text-[#8EA5B5] border border-[#1E3F5A]'}`}>
                {geo.status}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs font-mono text-[#8EA5B5] border-t border-[#1E3F5A] pt-3">
              <span>Area: <strong className="text-[#D8D2C2]">{geo.area}</strong></span>
              <span>Alerts: <strong className={geo.alerts > 0 ? 'text-[#B8543C] font-bold' : 'text-[#D8D2C2]'}>{geo.alerts}</strong></span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditingGeofence(geo);
                    setFormData({ name: geo.name, description: geo.description, type: geo.type, status: geo.status, area: geo.area });
                    setIsCreateModalOpen(true);
                  }}
                  className="p-1.5 hover:bg-[#1E3F5A] rounded text-[#8EA5B5] hover:text-[#D8D2C2] cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(geo.id)}
                  className="p-1.5 hover:bg-[#B8543C]/20 rounded text-[#8EA5B5] hover:text-[#B8543C] cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-[#132C40] px-4 py-3 rounded-xl border border-[#1E3F5A] shadow-xs text-xs font-mono text-[#8EA5B5]">
          <span>Page {currentPage} of {totalPages}</span>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="p-1 rounded hover:bg-[#1E3F5A] text-[#D8D2C2] disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="p-1 rounded hover:bg-[#1E3F5A] text-[#D8D2C2] disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* CREATE / EDIT GEOFENCE MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-[#132C40] border border-[#1E3F5A] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#1E3F5A] pb-3">
              <h2 className="text-base font-bold text-[#D8D2C2] flex items-center gap-2">
                <Hexagon className="w-5 h-5 text-[#C9A961]" />
                {editingGeofence ? 'Edit Geofence' : 'Create New Geofence'}
              </h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-[#8EA5B5] hover:text-[#D8D2C2] p-1 rounded-lg hover:bg-[#1E3F5A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGeofence} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-[#8EA5B5] uppercase mb-1">Zone Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Visakha Deep Sea Perimeter"
                  className="w-full bg-[#0B1E2D] border border-[#1E3F5A] rounded-lg px-3 py-2 text-xs text-[#D8D2C2] focus:outline-none focus:border-[#C9A961]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#8EA5B5] uppercase mb-1">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Buffer zone for international maritime route"
                  className="w-full bg-[#0B1E2D] border border-[#1E3F5A] rounded-lg px-3 py-2 text-xs text-[#D8D2C2] focus:outline-none focus:border-[#C9A961]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-[#8EA5B5] uppercase mb-1">Zone Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-[#0B1E2D] border border-[#1E3F5A] rounded-lg px-3 py-2 text-xs text-[#D8D2C2] focus:outline-none focus:border-[#C9A961]"
                  >
                    <option value="Restricted">Restricted</option>
                    <option value="Safe">Safe</option>
                    <option value="Port">Port</option>
                    <option value="Fishing">Fishing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-[#8EA5B5] uppercase mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-[#0B1E2D] border border-[#1E3F5A] rounded-lg px-3 py-2 text-xs text-[#D8D2C2] focus:outline-none focus:border-[#C9A961]"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-[#8EA5B5] uppercase mb-1">Estimated Area</label>
                <input
                  type="text"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  placeholder="e.g. 64.5 km²"
                  className="w-full bg-[#0B1E2D] border border-[#1E3F5A] rounded-lg px-3 py-2 text-xs text-[#D8D2C2] focus:outline-none focus:border-[#C9A961]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1E3F5A]">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-[#0B1E2D] border border-[#1E3F5A] text-[#8EA5B5] hover:text-[#D8D2C2] text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#C9A961] hover:bg-[#D4BA7A] text-[#0B1E2D] text-xs font-bold rounded-lg transition-all"
                >
                  {editingGeofence ? 'Update Zone' : 'Save Zone'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
