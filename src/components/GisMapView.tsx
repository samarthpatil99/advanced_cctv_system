import React, { useEffect, useRef, useState } from 'react';
import { Camera, CameraStatus } from '../types';
import L from 'leaflet';
import {
  Layers,
  Filter,
  Eye,
  Radio,
  MapPin,
  Search,
  ExternalLink,
  RefreshCw,
  ShieldCheck,
  AlertOctagon,
  Wrench,
  HelpCircle,
  Maximize2,
} from 'lucide-react';

interface GisMapViewProps {
  cameras: Camera[];
  onSelectCamera: (camera: Camera) => void;
  selectedCameraId?: string;
}

export const GisMapView: React.FC<GisMapViewProps> = ({
  cameras,
  onSelectCamera,
  selectedCameraId,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const fovLayerRef = useRef<L.LayerGroup | null>(null);

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [districtFilter, setDistrictFilter] = useState<string>('ALL');
  const [redundancyFilter, setRedundancyFilter] = useState<string>('ALL');
  const [showFovCircles, setShowFovCircles] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [inspectedCamera, setInspectedCamera] = useState<Camera | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Re-invalidate Leaflet map dimensions on expand/collapse
  useEffect(() => {
    const timer = setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 200);
    return () => clearTimeout(timer);
  }, [isExpanded]);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Gujarat center
    const map = L.map(mapContainerRef.current, {
      center: [22.45, 71.85],
      zoom: 7.5,
      minZoom: 6,
      maxZoom: 18,
      zoomControl: true,
    });

    // Enterprise-grade Dark Tile Layer (CartoDB Dark Matter)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    const fovGroup = L.layerGroup().addTo(map);

    markersLayerRef.current = markersGroup;
    fovLayerRef.current = fovGroup;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update markers when cameras, filters, or search changes
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current || !fovLayerRef.current) return;

    markersLayerRef.current.clearLayers();
    fovLayerRef.current.clearLayers();

    // Filter cameras
    const filtered = cameras.filter(c => {
      if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
      if (districtFilter !== 'ALL' && c.district.toLowerCase() !== districtFilter.toLowerCase()) return false;
      if (redundancyFilter !== 'ALL' && c.redundancy_level !== redundancyFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const match =
          c.global_id.toLowerCase().includes(q) ||
          c.landmark.toLowerCase().includes(q) ||
          c.district.toLowerCase().includes(q) ||
          c.department.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });

    // Helper to get marker color
    const getStatusColor = (status: CameraStatus) => {
      switch (status) {
        case 'OPERATIONAL':
          return '#10b981'; // Green
        case 'OFFLINE':
          return '#ef4444'; // Red
        case 'MAINTENANCE':
          return '#f59e0b'; // Yellow
        case 'UNKNOWN':
        default:
          return '#6b7280'; // Gray
      }
    };

    filtered.forEach(cam => {
      const color = getStatusColor(cam.status);
      const isSelected = cam.id === selectedCameraId || (inspectedCamera && inspectedCamera.id === cam.id);
      const isCriticalRedundancy = cam.redundancy_level === 'CRITICAL';

      // Create custom SVG HTML Marker
      const markerHtml = `
        <div style="
          width: ${isSelected ? '22px' : '16px'};
          height: ${isSelected ? '22px' : '16px'};
          background-color: ${color};
          border: 2px solid ${isSelected ? '#ffffff' : '#0f172a'};
          border-radius: 50%;
          box-shadow: 0 0 ${isSelected ? '12px' : '6px'} ${color};
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          cursor: pointer;
          transition: all 0.2s ease;
        ">
          ${
            isCriticalRedundancy
              ? `<div style="
                  position: absolute;
                  width: 28px;
                  height: 28px;
                  border: 2px dashed #f43f5e;
                  border-radius: 50%;
                  animation: spin 6s linear infinite;
                "></div>`
              : ''
          }
          ${
            cam.status === 'OFFLINE'
              ? `<div style="
                  position: absolute;
                  width: 24px;
                  height: 24px;
                  border: 1.5px solid #ef4444;
                  border-radius: 50%;
                  opacity: 0.7;
                  animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
                "></div>`
              : ''
          }
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'custom-cctv-marker',
        iconSize: [isSelected ? 22 : 16, isSelected ? 22 : 16],
        iconAnchor: [isSelected ? 11 : 8, isSelected ? 11 : 8],
      });

      const marker = L.marker([cam.latitude, cam.longitude], { icon: customIcon });

      // Interactive popup
      const popupContent = `
        <div style="font-family: sans-serif; font-size: 11px; line-height: 1.4; color: #1e293b; min-width: 180px;">
          <div style="font-weight: bold; color: #0f172a; margin-bottom: 2px;">${cam.global_id}</div>
          <div style="color: #475569; margin-bottom: 4px;">${cam.landmark}</div>
          <div style="display: flex; justify-content: space-between; border-top: 1px solid #e2e8f0; padding-top: 4px; margin-top: 4px;">
            <span>Status:</span>
            <span style="font-weight: bold; color: ${color};">${cam.status}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>Health Score:</span>
            <span style="font-weight: bold;">${cam.health_score}%</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>Redundancy:</span>
            <span style="font-weight: bold; color: ${cam.redundancy_level === 'CRITICAL' ? '#e11d48' : '#334155'};">${cam.redundancy_level}</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('click', () => {
        setInspectedCamera(cam);
      });

      markersLayerRef.current?.addLayer(marker);

      // Add FOV / Coverage Radius Circle if enabled
      if (showFovCircles) {
        const radius = cam.type === 'PTZ' ? 220 : cam.type === 'PANORAMIC_360' ? 280 : 150;
        const circle = L.circle([cam.latitude, cam.longitude], {
          radius,
          color,
          weight: 1,
          opacity: 0.35,
          fillColor: color,
          fillOpacity: 0.08,
        });
        fovLayerRef.current?.addLayer(circle);
      }
    });
  }, [cameras, statusFilter, districtFilter, redundancyFilter, showFovCircles, searchQuery, selectedCameraId]);

  // District Quick Jump Zoom
  const handleDistrictZoom = (distCode: string) => {
    setDistrictFilter(distCode);
    if (!mapInstanceRef.current) return;

    const coords: Record<string, [number, number, number]> = {
      ALL: [22.45, 71.85, 7.5],
      Ahmedabad: [23.0225, 72.5714, 12],
      Surat: [21.1702, 72.8311, 12],
      Vadodara: [22.3072, 73.1812, 12],
      Rajkot: [22.3039, 70.8022, 12],
      Gandhinagar: [23.2156, 72.6369, 13],
      Bhavnagar: [21.7645, 72.1519, 12],
      Jamnagar: [22.4707, 70.0577, 12],
      Junagadh: [21.5222, 70.4579, 12],
      'Kutch-Kandla': [23.0131, 70.1337, 11],
      Anand: [22.5645, 72.9289, 13],
    };

    if (coords[distCode]) {
      const [lat, lng, zoom] = coords[distCode];
      mapInstanceRef.current.flyTo([lat, lng], zoom, { duration: 1.2 });
    }
  };

  // Inspect first camera if none selected
  useEffect(() => {
    if (!inspectedCamera && cameras.length > 0) {
      setInspectedCamera(cameras[0]);
    }
  }, [cameras]);

  return (
    <div id="gis-map-view" className="space-y-4">
      {/* Top Filter & GIS Controls Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2 flex-grow max-w-md">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search camera ID, landmark, ward, or street..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center space-x-1 bg-slate-950 border border-slate-800 rounded px-2 py-1">
            <Filter className="w-3 h-3 text-slate-400" />
            <span className="text-slate-400 text-[11px]">Status:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900">All Statuses</option>
              <option value="OPERATIONAL" className="bg-slate-900 text-emerald-400">Operational</option>
              <option value="OFFLINE" className="bg-slate-900 text-rose-400">Offline</option>
              <option value="MAINTENANCE" className="bg-slate-900 text-amber-400">Maintenance</option>
              <option value="UNKNOWN" className="bg-slate-900 text-slate-400">Unknown</option>
            </select>
          </div>

          {/* District Quick Zoom */}
          <div className="flex items-center space-x-1 bg-slate-950 border border-slate-800 rounded px-2 py-1">
            <MapPin className="w-3 h-3 text-blue-400" />
            <span className="text-slate-400 text-[11px]">District:</span>
            <select
              value={districtFilter}
              onChange={e => handleDistrictZoom(e.target.value)}
              className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900">Gujarat Statewide</option>
              <option value="Ahmedabad" className="bg-slate-900">Ahmedabad</option>
              <option value="Surat" className="bg-slate-900">Surat</option>
              <option value="Vadodara" className="bg-slate-900">Vadodara</option>
              <option value="Rajkot" className="bg-slate-900">Rajkot</option>
              <option value="Gandhinagar" className="bg-slate-900">Gandhinagar</option>
              <option value="Bhavnagar" className="bg-slate-900">Bhavnagar</option>
              <option value="Jamnagar" className="bg-slate-900">Jamnagar</option>
              <option value="Junagadh" className="bg-slate-900">Junagadh</option>
              <option value="Kutch-Kandla" className="bg-slate-900">Kutch-Kandla</option>
              <option value="Anand" className="bg-slate-900">Anand</option>
            </select>
          </div>

          {/* Redundancy Highlight */}
          <div className="flex items-center space-x-1 bg-slate-950 border border-slate-800 rounded px-2 py-1">
            <Radio className="w-3 h-3 text-purple-400" />
            <span className="text-slate-400 text-[11px]">Redundancy:</span>
            <select
              value={redundancyFilter}
              onChange={e => setRedundancyFilter(e.target.value)}
              className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900">All Redundancy</option>
              <option value="CRITICAL" className="bg-slate-900 text-rose-400">Critical (Single Point)</option>
              <option value="LOW" className="bg-slate-900 text-amber-400">Low Redundancy</option>
              <option value="MEDIUM" className="bg-slate-900 text-blue-400">Medium Redundancy</option>
              <option value="HIGH" className="bg-slate-900 text-emerald-400">High Redundancy</option>
            </select>
          </div>

          {/* FOV Circle Toggle */}
          <button
            onClick={() => setShowFovCircles(!showFovCircles)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs sm:text-sm font-medium cursor-pointer transition ${
              showFovCircles
                ? 'bg-blue-950 text-blue-300 border-blue-700/60'
                : 'bg-slate-950 text-slate-400 border-slate-800'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>FOV / Coverage Radius</span>
          </button>

          {/* Maximize / Big Map Mode Toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs sm:text-sm font-bold cursor-pointer transition ${
              isExpanded
                ? 'bg-amber-950 text-amber-300 border-amber-600'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
            title="Toggle Big Fullscreen Map View"
          >
            <Maximize2 className="w-4 h-4" />
            <span>{isExpanded ? 'Normal Size' : 'Make Map Big'}</span>
          </button>
        </div>
      </div>

      {/* Map Layout: GIS Map Canvas + Digital Twin Side Drawer */}
      <div
        className={`grid grid-cols-1 lg:grid-cols-4 gap-4 transition-all ${
          isExpanded
            ? 'fixed inset-2 z-50 bg-slate-950/95 p-3 rounded-xl border border-blue-500/50 shadow-2xl h-[calc(100vh-1rem)]'
            : 'h-[780px] sm:h-[840px]'
        }`}
      >
        {/* Leaflet Map Stage */}
        <div className="lg:col-span-3 bg-slate-950 border border-slate-800 rounded-lg overflow-hidden relative shadow-inner">
          <div ref={mapContainerRef} className="w-full h-full z-0"></div>

          {/* Map Legend Overlay */}
          <div className="absolute bottom-4 left-4 bg-slate-900/95 border border-slate-700/80 rounded-lg p-2.5 text-[11px] z-10 shadow-xl backdrop-blur-sm space-y-1.5">
            <div className="font-semibold text-slate-200 border-b border-slate-800 pb-1 flex items-center justify-between">
              <span>GIS CLUSTER LEGEND</span>
              <span className="text-[10px] text-slate-400">{cameras.length} Active Nodes</span>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1">
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></span>
                <span className="text-slate-300">Operational</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
                <span className="text-slate-300">Offline</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span className="text-slate-300">Maintenance</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span>
                <span className="text-slate-300">Unknown</span>
              </div>
            </div>
            <div className="border-t border-slate-800 pt-1 text-[10px] text-slate-400 flex items-center space-x-1">
              <span className="w-3 h-3 rounded-full border border-dashed border-rose-400 inline-block"></span>
              <span>Dashed halo = Critical Redundancy</span>
            </div>
          </div>
        </div>

        {/* Selected Camera Inspector / Mini Digital Twin Drawer */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col justify-between overflow-y-auto">
          {inspectedCamera ? (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-blue-400 uppercase tracking-wide">
                    INSPECTED GIS ASSET
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      inspectedCamera.status === 'OPERATIONAL'
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-700/60'
                        : inspectedCamera.status === 'OFFLINE'
                        ? 'bg-rose-950 text-rose-300 border-rose-700/60 animate-pulse'
                        : inspectedCamera.status === 'MAINTENANCE'
                        ? 'bg-amber-950 text-amber-300 border-amber-700/60'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {inspectedCamera.status}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white mt-1 break-all">{inspectedCamera.global_id}</h3>
                <p className="text-xs text-slate-400">{inspectedCamera.landmark}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {inspectedCamera.ward}, {inspectedCamera.district}
                </p>
              </div>

              {/* Health Score & Redundancy Overview */}
              <div className="grid grid-cols-2 gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs">
                <div>
                  <div className="text-[10px] text-slate-400">Health Telemetry</div>
                  <div className="text-base font-bold text-white flex items-baseline space-x-1">
                    <span>{inspectedCamera.health_score}%</span>
                    <span className="text-[10px] text-slate-500 font-normal">score</span>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Redundancy</div>
                  <div
                    className={`text-xs font-bold ${
                      inspectedCamera.redundancy_level === 'CRITICAL'
                        ? 'text-rose-400'
                        : inspectedCamera.redundancy_level === 'LOW'
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {inspectedCamera.redundancy_level}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {inspectedCamera.redundancy_adjacent_count} adjacent cams
                  </div>
                </div>
              </div>

              {/* Coordinates & Geometry */}
              <div className="space-y-1 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Coordinates:</span>
                  <span className="font-mono text-slate-200">
                    {inspectedCamera.latitude.toFixed(4)}, {inspectedCamera.longitude.toFixed(4)}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Department:</span>
                  <span className="text-slate-200 truncate max-w-[140px]">{inspectedCamera.department}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Form Factor:</span>
                  <span className="text-slate-200">{String(inspectedCamera.type || 'N/A').replace(/_/g, ' ')}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Lifecycle Age:</span>
                  <span className="text-slate-200">{inspectedCamera.age_years} Years ({inspectedCamera.lifecycle_stage})</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Maintenance Priority:</span>
                  <span className={`font-semibold ${inspectedCamera.maintenance_priority === 'P1_CRITICAL' ? 'text-rose-400' : 'text-slate-300'}`}>
                    {String(inspectedCamera.maintenance_priority || 'NORMAL').replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              {/* What happens if this camera fails? */}
              <div className="bg-slate-950/80 border border-slate-800 rounded p-2.5 text-xs">
                <div className="text-[10px] font-semibold text-amber-300 flex items-center space-x-1 mb-1">
                  <Radio className="w-3 h-3 text-amber-400" />
                  <span>WHAT HAPPENS IF THIS CAMERA FAILS?</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {inspectedCamera.redundancy_note}
                </p>
              </div>

              {/* Full Digital Twin Trigger Button */}
              <button
                id="open-full-digital-twin-btn"
                onClick={() => onSelectCamera(inspectedCamera)}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold py-2 px-3 rounded flex items-center justify-center space-x-1.5 cursor-pointer shadow-md shadow-blue-600/20 transition"
              >
                <span>Open Complete Digital Twin</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500 text-xs text-center">
              Click any camera marker on the map to inspect its real-time Digital Twin profile.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
