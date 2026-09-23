import React, { useState } from 'react';
import { Camera, CameraStatus, CameraType, RedundancyLevel } from '../types';
import {
  Search,
  Filter,
  Download,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  AlertOctagon,
  Wrench,
  HelpCircle,
  Database,
  PlusCircle,
} from 'lucide-react';

interface RegistryTableViewProps {
  cameras: Camera[];
  onSelectCamera: (camera: Camera) => void;
  onOpenAddCamera?: () => void;
}

export const RegistryTableView: React.FC<RegistryTableViewProps> = ({
  cameras,
  onSelectCamera,
  onOpenAddCamera,
}) => {
  const [search, setSearch] = useState('');
  const [district, setDistrict] = useState('ALL');
  const [department, setDepartment] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [type, setType] = useState('ALL');
  const [redundancy, setRedundancy] = useState('ALL');
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Filter
  const filtered = cameras.filter(c => {
    if (district !== 'ALL' && c.district.toLowerCase() !== district.toLowerCase()) return false;
    if (department !== 'ALL' && !c.department.toLowerCase().includes(department.toLowerCase())) return false;
    if (status !== 'ALL' && c.status !== status) return false;
    if (type !== 'ALL' && c.type !== type) return false;
    if (redundancy !== 'ALL' && c.redundancy_level !== redundancy) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        c.global_id.toLowerCase().includes(q) ||
        c.original_source_id.toLowerCase().includes(q) ||
        c.landmark.toLowerCase().includes(q) ||
        c.district.toLowerCase().includes(q) ||
        c.vendor.toLowerCase().includes(q) ||
        c.owner.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const exportCSV = () => {
    const headers = [
      'Global_ID',
      'Source_ID',
      'District',
      'Department',
      'Type',
      'Status',
      'Health_Score',
      'Redundancy',
      'Age_Years',
      'Latitude',
      'Longitude',
      'Vendor',
      'Protocol',
      'Data_Confidence',
    ];

    const rows = filtered.map(c => [
      c.global_id,
      c.original_source_id,
      c.district,
      `"${c.department}"`,
      c.type,
      c.status,
      c.health_score,
      c.redundancy_level,
      c.age_years,
      c.latitude,
      c.longitude,
      `"${c.vendor}"`,
      `"${c.protocol}"`,
      c.data_confidence_score,
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `gujarat_master_cctv_registry_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filtered, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `gujarat_master_cctv_registry_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div id="master-registry-table" className="space-y-4">
      {/* Header & Export Actions */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <Database className="w-5 h-5 text-blue-400" />
            <span>Master CCTV Registry Directory</span>
            <span className="text-xs font-mono bg-blue-950 text-blue-300 border border-blue-800 px-2 py-0.5 rounded">
              {filtered.length} of {cameras.length} Records
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Standard Global ID Format: <code className="text-blue-300 font-mono">GJ-&#123;DISTRICT&#125;-&#123;DEPARTMENT&#125;-&#123;TYPE&#125;-&#123;NUMBER&#125;</code>
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          {onOpenAddCamera && (
            <button
              onClick={onOpenAddCamera}
              className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold px-4 py-2 rounded-lg shadow-md shadow-blue-600/30 transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Add CCTV Asset</span>
            </button>
          )}
          <button
            onClick={exportCSV}
            className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs sm:text-sm px-3.5 py-2 rounded-lg transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={exportJSON}
            className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs sm:text-sm px-3.5 py-2 rounded-lg transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-grow max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Search Global ID, Source ID, Landmark, Vendor..."
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-slate-950 border border-slate-700 rounded pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* District */}
          <select
            value={district}
            onChange={e => {
              setDistrict(e.target.value);
              setPage(1);
            }}
            className="bg-slate-950 border border-slate-700 text-slate-200 rounded px-2.5 py-1.5 text-xs focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Districts</option>
            <option value="Ahmedabad">Ahmedabad</option>
            <option value="Surat">Surat</option>
            <option value="Vadodara">Vadodara</option>
            <option value="Rajkot">Rajkot</option>
            <option value="Gandhinagar">Gandhinagar</option>
            <option value="Bhavnagar">Bhavnagar</option>
            <option value="Jamnagar">Jamnagar</option>
            <option value="Junagadh">Junagadh</option>
            <option value="Kutch-Kandla">Kutch-Kandla</option>
            <option value="Anand">Anand</option>
          </select>

          {/* Department */}
          <select
            value={department}
            onChange={e => {
              setDepartment(e.target.value);
              setPage(1);
            }}
            className="bg-slate-950 border border-slate-700 text-slate-200 rounded px-2.5 py-1.5 text-xs focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Departments</option>
            <option value="Police">Gujarat Police</option>
            <option value="Municipal">Municipal Corp</option>
            <option value="Transport">GSRTC / Transport</option>
            <option value="Maritime">Maritime Board</option>
            <option value="Highway">State Highways</option>
          </select>

          {/* Status */}
          <select
            value={status}
            onChange={e => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="bg-slate-950 border border-slate-700 text-slate-200 rounded px-2.5 py-1.5 text-xs focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPERATIONAL">Operational</option>
            <option value="OFFLINE">Offline</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="UNKNOWN">Unknown</option>
          </select>

          {/* Type */}
          <select
            value={type}
            onChange={e => {
              setType(e.target.value);
              setPage(1);
            }}
            className="bg-slate-950 border border-slate-700 text-slate-200 rounded px-2.5 py-1.5 text-xs focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Form Factors</option>
            <option value="PTZ">PTZ</option>
            <option value="FIXED_DOME">Fixed Dome</option>
            <option value="BULLET">Bullet</option>
            <option value="ANPR">ANPR</option>
            <option value="THERMAL">Thermal</option>
            <option value="PANORAMIC_360">Panoramic 360</option>
          </select>

          {/* Redundancy */}
          <select
            value={redundancy}
            onChange={e => {
              setRedundancy(e.target.value);
              setPage(1);
            }}
            className="bg-slate-950 border border-slate-700 text-slate-200 rounded px-2.5 py-1.5 text-xs focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Redundancy</option>
            <option value="CRITICAL">Critical</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>
      </div>

      {/* Table Data Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-x-auto shadow-sm">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Global Registry ID</th>
              <th className="py-3 px-4">Location & Ward</th>
              <th className="py-3 px-4">Department & Owner</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Health</th>
              <th className="py-3 px-4">Redundancy</th>
              <th className="py-3 px-4">Age</th>
              <th className="py-3 px-4">Confidence</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {paginated.length > 0 ? (
              paginated.map(cam => (
                <tr key={cam.id} className="hover:bg-slate-800/50 transition">
                  <td className="py-2.5 px-4 font-mono font-bold text-white whitespace-nowrap">
                    <div>{cam.global_id}</div>
                    <div className="text-[10px] text-slate-500 font-normal">{cam.original_source_id}</div>
                  </td>
                  <td className="py-2.5 px-4 max-w-[200px] truncate" title={cam.landmark}>
                    <div className="font-medium text-slate-200 truncate">{cam.landmark}</div>
                    <div className="text-[10px] text-slate-500">{cam.district}, {cam.ward}</div>
                  </td>
                  <td className="py-2.5 px-4 max-w-[180px] truncate">
                    <div className="text-slate-300 truncate">{cam.department}</div>
                    <div className="text-[10px] text-slate-500 truncate">{cam.vendor}</div>
                  </td>
                  <td className="py-2.5 px-4 whitespace-nowrap font-mono text-[11px]">
                    {String(cam.type || 'N/A').replace(/_/g, ' ')}
                  </td>
                  <td className="py-2.5 px-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        cam.status === 'OPERATIONAL'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800/60'
                          : cam.status === 'OFFLINE'
                          ? 'bg-rose-950 text-rose-300 border-rose-800/60'
                          : cam.status === 'MAINTENANCE'
                          ? 'bg-amber-950 text-amber-300 border-amber-800/60'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {cam.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 whitespace-nowrap">
                    <div className="flex items-center space-x-1.5">
                      <span className="font-bold text-white">{cam.health_score}%</span>
                      <div className="w-12 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            cam.health_score >= 80 ? 'bg-emerald-500' : cam.health_score >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${cam.health_score}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 px-4 whitespace-nowrap">
                    <span
                      className={`text-xs font-semibold ${
                        cam.redundancy_level === 'CRITICAL'
                          ? 'text-rose-400'
                          : cam.redundancy_level === 'LOW'
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {cam.redundancy_level}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 whitespace-nowrap font-mono text-slate-300">
                    {cam.age_years}y
                  </td>
                  <td className="py-2.5 px-4 whitespace-nowrap">
                    <span className="text-emerald-400 font-mono font-medium">{cam.data_confidence_score}%</span>
                  </td>
                  <td className="py-2.5 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => onSelectCamera(cam)}
                      className="bg-blue-900/40 hover:bg-blue-800/70 text-blue-300 border border-blue-700/50 px-2.5 py-1 rounded text-xs transition cursor-pointer flex items-center space-x-1 ml-auto"
                    >
                      <span>Digital Twin</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={10} className="py-12 text-center text-slate-500">
                  No camera assets match the selected registry filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-2">
        <div>
          Showing page <span className="font-bold text-white">{page}</span> of{' '}
          <span className="font-bold text-white">{totalPages}</span> ({filtered.length} records total)
        </div>

        <div className="flex items-center space-x-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="bg-slate-900 border border-slate-700 disabled:opacity-40 text-slate-200 px-2.5 py-1 rounded flex items-center space-x-1 cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Prev</span>
          </button>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
            className="bg-slate-900 border border-slate-700 disabled:opacity-40 text-slate-200 px-2.5 py-1 rounded flex items-center space-x-1 cursor-pointer"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
