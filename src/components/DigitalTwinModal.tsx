import React, { useState } from 'react';
import { Camera, CameraStatus, UserRole } from '../types';
import {
  X,
  ShieldCheck,
  AlertOctagon,
  Wrench,
  Radio,
  Cpu,
  Database,
  History,
  CheckCircle2,
  FileText,
  Sliders,
  AlertTriangle,
  Info,
  Server,
  Zap,
  Clock,
  Layers,
  MapPin,
  Compass,
  Tv,
  Search,
} from 'lucide-react';

interface DigitalTwinModalProps {
  camera: Camera | null;
  onClose: () => void;
  userRole: UserRole;
  onUpdateCamera: (
    id: string,
    updates: Partial<Camera>,
    reason: string
  ) => Promise<void>;
  onOpenInVideoWall?: (camera: Camera) => void;
  onSearchCameraMetadata?: (camera: Camera) => void;
}

export const DigitalTwinModal: React.FC<DigitalTwinModalProps> = ({
  camera,
  onClose,
  userRole,
  onUpdateCamera,
  onOpenInVideoWall,
  onSearchCameraMetadata,
}) => {
  if (!camera) return null;

  const [activeTab, setActiveTab] = useState<
    'identity' | 'health' | 'lifecycle' | 'coverage' | 'integration' | 'provenance' | 'maintenance'
  >('identity');

  // Edit states for Maintenance or Status update
  const [newStatus, setNewStatus] = useState<CameraStatus>(camera.status);
  const [updateReason, setUpdateReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateReason.trim()) {
      alert('Mandatory governance audit reason is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onUpdateCamera(camera.id, { status: newStatus }, updateReason);
      setActionSuccess(`Status updated to ${newStatus} with audit trail recorded.`);
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      alert(`Update failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: CameraStatus) => {
    switch (status) {
      case 'OPERATIONAL':
        return (
          <span className="bg-emerald-950 text-emerald-300 border border-emerald-700/60 px-2.5 py-1 rounded text-xs font-semibold flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>OPERATIONAL</span>
          </span>
        );
      case 'OFFLINE':
        return (
          <span className="bg-rose-950 text-rose-300 border border-rose-700/60 px-2.5 py-1 rounded text-xs font-semibold flex items-center space-x-1 animate-pulse">
            <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
            <span>OFFLINE</span>
          </span>
        );
      case 'MAINTENANCE':
        return (
          <span className="bg-amber-950 text-amber-300 border border-amber-700/60 px-2.5 py-1 rounded text-xs font-semibold flex items-center space-x-1">
            <Wrench className="w-3.5 h-3.5 text-amber-400" />
            <span>MAINTENANCE</span>
          </span>
        );
      case 'UNKNOWN':
      default:
        return (
          <span className="bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-1 rounded text-xs font-semibold flex items-center space-x-1">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>UNKNOWN</span>
          </span>
        );
    }
  };

  return (
    <div id="digital-twin-modal" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-blue-900/60 border border-blue-500/40 flex items-center justify-center">
              <Cpu className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-mono text-blue-400 uppercase tracking-wider">
                  GIS DIGITAL TWIN ASSET PROFILE
                </span>
                <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded font-mono">
                  {camera.synthetic_label}
                </span>
              </div>
              <h2 className="text-lg font-bold text-white font-mono tracking-tight flex items-center space-x-2">
                <span>{camera.global_id}</span>
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            {onOpenInVideoWall && (
              <button
                onClick={() => {
                  onClose();
                  onOpenInVideoWall(camera);
                }}
                className="hidden sm:flex items-center space-x-1.5 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/60 px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition"
                title="View live simulated stream on Model 2 Video Wall"
              >
                <Tv className="w-3.5 h-3.5" />
                <span>Model 2 Wall</span>
              </button>
            )}

            {onSearchCameraMetadata && (
              <button
                onClick={() => {
                  onClose();
                  onSearchCameraMetadata(camera);
                }}
                className="hidden sm:flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition"
                title="Forensic metadata search for this camera"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Metadata</span>
              </button>
            )}

            {getStatusBadge(camera.status)}
            <button
              id="close-digital-twin-btn"
              onClick={onClose}
              className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-1.5 rounded-md transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation in Digital Twin */}
        <div className="bg-slate-950/60 px-6 border-b border-slate-800 flex space-x-2 overflow-x-auto text-xs">
          {[
            { id: 'identity', label: 'Identity & Hardware', icon: Server },
            { id: 'health', label: 'Health Intelligence', icon: Zap },
            { id: 'lifecycle', label: 'Lifecycle & Age', icon: Clock },
            { id: 'coverage', label: 'Coverage & Redundancy', icon: Radio },
            { id: 'integration', label: 'Integration Readiness', icon: Layers },
            { id: 'provenance', label: 'Provenance & Quality', icon: Database },
            { id: 'maintenance', label: 'Maintenance & Triage', icon: Sliders },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-1.5 py-2.5 px-3 border-b-2 font-medium transition cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'border-blue-500 text-blue-400 bg-blue-950/30'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300">
          {/* TAB 1: IDENTITY & HARDWARE */}
          {activeTab === 'identity' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Hardware Spec */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-4 space-y-2.5">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-2 flex items-center space-x-1.5">
                    <Server className="w-3.5 h-3.5 text-blue-400" />
                    <span>Physical Hardware & Sensor Specifications</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500">Global Registry ID:</span>
                      <p className="font-mono text-white break-all">{camera.global_id}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Original Source ID:</span>
                      <p className="font-mono text-slate-300">{camera.original_source_id}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Manufacturer & Model:</span>
                      <p className="text-slate-200 font-medium">{camera.vendor} ({camera.model})</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Optical Form Factor:</span>
                      <p className="text-slate-200 font-medium">{String(camera.type || 'N/A').replace(/_/g, ' ')}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Serial Number:</span>
                      <p className="font-mono text-slate-300">{camera.serial_number}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">MAC Address:</span>
                      <p className="font-mono text-slate-300">{camera.mac_address}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Firmware Build:</span>
                      <p className="font-mono text-slate-200">
                        {camera.firmware_version || <span className="text-amber-400 font-semibold">Missing (Data Quality Issue)</span>}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500">Static IPv4 Address:</span>
                      <p className="font-mono text-slate-300">{camera.ip_address}</p>
                    </div>
                  </div>
                </div>

                {/* Spatial Geometry & Mount Specs */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-4 space-y-2.5">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-2 flex items-center space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Geospatial Position & Optical Geometry</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500">Latitude & Longitude:</span>
                      <p className="font-mono text-emerald-400 font-semibold">
                        {camera.latitude.toFixed(6)}° N, {camera.longitude.toFixed(6)}° E
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500">Mounting Pole Height:</span>
                      <p className="text-slate-200 font-medium">{camera.mounting_height_m} meters</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Azimuth / Heading:</span>
                      <p className="text-slate-200 font-medium flex items-center space-x-1">
                        <Compass className="w-3.5 h-3.5 text-blue-400" />
                        <span>{camera.heading}° Compass Bear</span>
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500">Horizontal FOV Angle:</span>
                      <p className="text-slate-200 font-medium">{camera.fov_angle}° Coverage Arc</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-500">Landmark & Crossroad:</span>
                      <p className="text-slate-200">{camera.landmark}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Administrative Ward:</span>
                      <p className="text-slate-300">{camera.ward}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">District & City:</span>
                      <p className="text-slate-300 font-semibold">{camera.district}, Gujarat</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ownership & Custodian */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-4 space-y-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-2 flex items-center space-x-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Administrative Ownership & Custodian Contact</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500">Department:</span>
                    <p className="text-slate-200 font-semibold">{camera.department}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Owner Entity:</span>
                    <p className="text-slate-300">{camera.owner}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Designated Custodian Officer:</span>
                    <p className="text-slate-200">
                      {camera.custodian_officer || <span className="text-amber-400">Unassigned (Audit Flag)</span>}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500">Emergency Contact:</span>
                    <p className="font-mono text-slate-300">{camera.custodian_contact || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Registered VMS Headend:</span>
                    <p className="text-slate-300">{camera.vms}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Streaming Protocol:</span>
                    <p className="font-mono text-slate-300">{camera.protocol}</p>
                  </div>
                </div>
              </div>

              {/* Analytics Capabilities */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-4">
                <div className="text-xs font-semibold text-slate-300 mb-2">Enabled Edge Analytics & Capabilities:</div>
                <div className="flex flex-wrap gap-2">
                  {camera.capabilities.map((cap, idx) => (
                    <span
                      key={idx}
                      className="bg-blue-950/60 text-blue-300 border border-blue-800/50 px-2.5 py-1 rounded text-xs"
                    >
                      ✓ {cap}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: HEALTH INTELLIGENCE */}
          {activeTab === 'health' && (
            <div className="space-y-4">
              <div className="bg-amber-950/30 border border-amber-800/40 rounded-lg p-3 text-xs text-amber-300 flex items-start space-x-2">
                <Info className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-bold">PROTOTYPE HEALTH FORMULA (DESIGN STANDARD):</span> Health Score = 30% Connectivity + 20% Uptime + 20% Heartbeat Freshness + 15% Maintenance Compliance + 15% Failure History. Clearly labeled as a design benchmark, not an official government standard.
                </div>
              </div>

              {/* Total Health Score Meter */}
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 rounded-full border-4 border-blue-500/30 flex items-center justify-center bg-slate-900 shadow-lg">
                    <span className="text-2xl font-black text-white">{camera.health_score}%</span>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">Overall Health Reliability Score</div>
                    <p className="text-slate-400 text-xs">
                      {camera.health_score >= 80
                        ? 'Optimal hardware performance; telemetry indicators within green operating thresholds.'
                        : camera.health_score >= 60
                        ? 'Degraded performance; maintenance review recommended.'
                        : 'Critical failure profile; immediate dispatch recommended.'}
                    </p>
                  </div>
                </div>

                <div className="text-right text-xs">
                  <div className="text-slate-400">Current Status:</div>
                  <div className="mt-1">{getStatusBadge(camera.status)}</div>
                </div>
              </div>

              {/* Component breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                  <div className="text-slate-400 text-[10px]">Connectivity (30%)</div>
                  <div className="text-xl font-bold text-white mt-1">{camera.health_breakdown.connectivity}%</div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2">
                    <div
                      className="bg-blue-500 h-full rounded-full"
                      style={{ width: `${camera.health_breakdown.connectivity}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                  <div className="text-slate-400 text-[10px]">Uptime Index (20%)</div>
                  <div className="text-xl font-bold text-white mt-1">{camera.health_breakdown.uptime}%</div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2">
                    <div
                      className="bg-emerald-500 h-full rounded-full"
                      style={{ width: `${camera.health_breakdown.uptime}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                  <div className="text-slate-400 text-[10px]">Heartbeat (20%)</div>
                  <div className="text-xl font-bold text-white mt-1">{camera.health_breakdown.heartbeat_freshness}%</div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2">
                    <div
                      className="bg-purple-500 h-full rounded-full"
                      style={{ width: `${camera.health_breakdown.heartbeat_freshness}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                  <div className="text-slate-400 text-[10px]">Maintenance (15%)</div>
                  <div className="text-xl font-bold text-white mt-1">{camera.health_breakdown.maintenance_compliance}%</div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2">
                    <div
                      className="bg-amber-500 h-full rounded-full"
                      style={{ width: `${camera.health_breakdown.maintenance_compliance}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                  <div className="text-slate-400 text-[10px]">Failure History (15%)</div>
                  <div className="text-xl font-bold text-white mt-1">{camera.health_breakdown.failure_history_score}%</div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2">
                    <div
                      className="bg-cyan-500 h-full rounded-full"
                      style={{ width: `${camera.health_breakdown.failure_history_score}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LIFECYCLE & AGE */}
          {activeTab === 'lifecycle' && (
            <div className="space-y-4">
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-white">Asset Lifecycle Stage</h4>
                  <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                    camera.lifecycle_stage === 'CRITICAL_AGING' || camera.lifecycle_stage === 'REPLACEMENT_CANDIDATE'
                      ? 'bg-rose-950 text-rose-300 border border-rose-800'
                      : camera.lifecycle_stage === 'AGING'
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : 'bg-blue-950 text-blue-300 border border-blue-800'
                  }`}>
                    {String(camera.lifecycle_stage || 'ACTIVE').replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-slate-900 p-3 rounded border border-slate-800">
                    <span className="text-slate-400">Installation Date:</span>
                    <p className="text-base font-bold text-white font-mono mt-0.5">{camera.installation_date}</p>
                  </div>
                  <div className="bg-slate-900 p-3 rounded border border-slate-800">
                    <span className="text-slate-400">Current Operating Age:</span>
                    <p className="text-base font-bold text-white font-mono mt-0.5">{camera.age_years} Years</p>
                  </div>
                  <div className="bg-slate-900 p-3 rounded border border-slate-800">
                    <span className="text-slate-400">Assigned Age Bracket:</span>
                    <p className="text-base font-bold text-indigo-400 font-mono mt-0.5">{camera.age_group}</p>
                  </div>
                </div>
              </div>

              {/* Visual Lifecycle Stepper */}
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-3">
                <div className="text-xs font-semibold text-slate-300">Statewide CCTV Lifecycle Trajectory:</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className={`p-3 rounded border ${camera.age_group === '0-2 YRS' ? 'bg-blue-950/80 border-blue-500' : 'bg-slate-900 border-slate-800'}`}>
                    <div className="font-bold text-white">0–2 Years</div>
                    <div className="text-[11px] text-slate-400">NEW / Active Deployment</div>
                    <div className="text-[10px] text-emerald-400 mt-1">Full OEM Warranty</div>
                  </div>
                  <div className={`p-3 rounded border ${camera.age_group === '3-5 YRS' ? 'bg-blue-950/80 border-blue-500' : 'bg-slate-900 border-slate-800'}`}>
                    <div className="font-bold text-white">3–5 Years</div>
                    <div className="text-[11px] text-slate-400">ACTIVE Stable Service</div>
                    <div className="text-[10px] text-blue-400 mt-1">Annual SLA Maintenance</div>
                  </div>
                  <div className={`p-3 rounded border ${camera.age_group === '6-8 YRS' ? 'bg-amber-950/80 border-amber-500' : 'bg-slate-900 border-slate-800'}`}>
                    <div className="font-bold text-white">6–8 Years</div>
                    <div className="text-[11px] text-amber-300">AGING Node</div>
                    <div className="text-[10px] text-amber-400 mt-1">High failure probability</div>
                  </div>
                  <div className={`p-3 rounded border ${camera.age_group === '9+ YRS' ? 'bg-rose-950/80 border-rose-500' : 'bg-slate-900 border-slate-800'}`}>
                    <div className="font-bold text-white">9+ Years</div>
                    <div className="text-[11px] text-rose-300">CRITICAL AGING</div>
                    <div className="text-[10px] text-rose-400 mt-1">Replacement Priority</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: COVERAGE & REDUNDANCY */}
          {activeTab === 'coverage' && (
            <div className="space-y-4">
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-white">Failure Impact & Redundancy Analysis</h4>
                  <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                    camera.redundancy_level === 'CRITICAL'
                      ? 'bg-rose-950 text-rose-300 border border-rose-800'
                      : camera.redundancy_level === 'LOW'
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  }`}>
                    {camera.redundancy_level} REDUNDANCY
                  </span>
                </div>

                {/* What happens if this camera fails? Callout */}
                <div className="bg-slate-900 border border-amber-700/50 rounded-lg p-4 text-xs space-y-1.5">
                  <div className="text-amber-400 font-bold flex items-center space-x-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>WHAT HAPPENS IF THIS CAMERA FAILS?</span>
                  </div>
                  <p className="text-slate-200 leading-relaxed font-medium">
                    {camera.redundancy_note}
                  </p>
                  <p className="text-[11px] text-slate-400 pt-1">
                    Adjacent cameras within 350m spatial overlap: <span className="text-white font-bold">{camera.redundancy_adjacent_count} units</span>.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2">
                  <div className="bg-slate-900 p-3 rounded border border-slate-800">
                    <span className="text-slate-400">Node Coverage Score:</span>
                    <p className="text-base font-bold text-white mt-0.5">{camera.coverage_score}%</p>
                  </div>
                  <div className="bg-slate-900 p-3 rounded border border-slate-800">
                    <span className="text-slate-400">Coverage Importance:</span>
                    <p className="text-base font-bold text-indigo-300 mt-0.5">{String(camera.coverage_importance || 'STANDARD').replace(/_/g, ' ')}</p>
                  </div>
                  <div className="bg-slate-900 p-3 rounded border border-slate-800">
                    <span className="text-slate-400">Prototype Coverage Debt:</span>
                    <p className="text-base font-bold text-rose-400 mt-0.5">{Math.max(0, 90 - camera.coverage_score)}%</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: INTEGRATION READINESS */}
          {activeTab === 'integration' && (
            <div className="space-y-4">
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-white">Statewide VMS & Analytics Ingestion Readiness</h4>
                    <p className="text-xs text-slate-400">Evaluates protocol conformance for unified command center streaming</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-cyan-400">{camera.integration_score}%</div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono">{String(camera.integration_tier || 'N/A').replace(/_/g, ' ')}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                  {[
                    { key: 'rtsp', label: 'RTSP Stream Support' },
                    { key: 'onvif', label: 'ONVIF Profile S/G/T' },
                    { key: 'rest_api', label: 'REST / WebSocket API' },
                    { key: 'vendor_sdk', label: 'Vendor Native SDK' },
                    { key: 'metadata_stream', label: 'Analytics Metadata' },
                    { key: 'health_endpoint', label: 'Health Ping Telemetry' },
                    { key: 'vms_bridge', label: 'VMS Bridge Gateway' },
                    { key: 'network_accessible', label: 'Secure WAN Reachable' },
                  ].map(proto => {
                    const isSupported = (camera.integration_capabilities as any)[proto.key];
                    return (
                      <div
                        key={proto.key}
                        className={`p-2.5 rounded border text-xs flex items-center justify-between ${
                          isSupported
                            ? 'bg-cyan-950/30 border-cyan-800/50 text-cyan-200'
                            : 'bg-slate-900 border-slate-800 text-slate-500'
                        }`}
                      >
                        <span>{proto.label}</span>
                        {isSupported ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                        ) : (
                          <span className="text-slate-600 font-bold">✕</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: PROVENANCE & DATA QUALITY */}
          {activeTab === 'provenance' && (
            <div className="space-y-4">
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-white">Registry Provenance & Confidence Metrics</h4>
                  <span className="text-emerald-400 font-bold text-base">{camera.data_confidence_score}% Confidence</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500">Ingestion Data Source:</span>
                    <p className="text-slate-200 font-medium">{camera.provenance_source}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Last Telemetry Ingestion:</span>
                    <p className="text-slate-300 font-mono">{camera.provenance_updated_at}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Physical Field Verified Date:</span>
                    <p className="text-slate-300 font-mono">{camera.last_verified_at}</p>
                  </div>
                </div>

                {camera.has_quality_issue && (
                  <div className="bg-rose-950/30 border border-rose-800/60 rounded p-3 space-y-1">
                    <div className="text-rose-400 font-bold text-xs flex items-center space-x-1.5">
                      <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
                      <span>FLAGGED DATA QUALITY ANOMALIES:</span>
                    </div>
                    <ul className="list-disc list-inside text-rose-300 text-xs pl-2">
                      {camera.quality_issue_types.map((issue, idx) => (
                        <li key={idx}>{String(issue || '').replace(/_/g, ' ')}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 7: MAINTENANCE & TRIAGE */}
          {activeTab === 'maintenance' && (
            <div className="space-y-4">
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-white">Maintenance Priority Evaluation</h4>
                    <p className="text-xs text-slate-400">Determined via health, importance, redundancy, and telemetry failure history</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                    camera.maintenance_priority === 'P1_CRITICAL'
                      ? 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse'
                      : camera.maintenance_priority === 'P2_HIGH'
                      ? 'bg-orange-950 text-orange-300 border border-orange-800'
                      : 'bg-blue-950 text-blue-300 border border-blue-800'
                  }`}>
                    {String(camera.maintenance_priority || 'NORMAL').replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-3 rounded text-xs">
                  <span className="text-slate-400 font-semibold">Triage Explanation:</span>
                  <p className="text-slate-200 mt-1 font-medium">{camera.maintenance_reason}</p>
                </div>
              </div>

              {/* Maintenance Update & Governance Form */}
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold text-white">Update Asset Operational Status (RBAC Governed)</h4>
                <p className="text-slate-400 text-xs">
                  Every status mutation requires an explicit justification reason and is immutably appended to the Statewide Audit Log.
                </p>

                {actionSuccess && (
                  <div className="bg-emerald-950 border border-emerald-800 text-emerald-300 p-2.5 rounded text-xs flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{actionSuccess}</span>
                  </div>
                )}

                <form onSubmit={handleStatusSubmit} className="space-y-3 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-400 text-xs block mb-1">Target Operational Status:</label>
                      <select
                        value={newStatus}
                        onChange={e => setNewStatus(e.target.value as CameraStatus)}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500 cursor-pointer"
                      >
                        <option value="OPERATIONAL">OPERATIONAL (Normal Streaming)</option>
                        <option value="OFFLINE">OFFLINE (Telemetry Dropout)</option>
                        <option value="MAINTENANCE">MAINTENANCE (Field Repair / Cleaning)</option>
                        <option value="UNKNOWN">UNKNOWN (Unverified Heartbeat)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-400 text-xs block mb-1">Authorized Role:</label>
                      <input
                        type="text"
                        disabled
                        value={String(userRole || '').replace(/_/g, ' ')}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-blue-300 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-400 text-xs block mb-1">
                      Mandatory Governance Justification / Ticket ID:
                    </label>
                    <textarea
                      required
                      placeholder="E.g., Field technician dispatched under Ticket #GJ-MAINT-8492 to replace power supply..."
                      value={updateReason}
                      onChange={e => setUpdateReason(e.target.value)}
                      rows={2}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white font-semibold text-xs px-4 py-2 rounded transition cursor-pointer flex items-center space-x-1.5"
                  >
                    <span>{isSubmitting ? 'Recording Audit Trail...' : 'Commit Status Update to Registry'}</span>
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex justify-between items-center text-xs text-slate-500">
          <span>Asset ID: {camera.id} • Last Telemetry Ping: Today</span>
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-1.5 rounded transition cursor-pointer"
          >
            Close Digital Twin
          </button>
        </div>
      </div>
    </div>
  );
};
