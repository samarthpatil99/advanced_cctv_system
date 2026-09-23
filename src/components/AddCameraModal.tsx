import React, { useState } from 'react';
import { Camera, CameraType, UserRole } from '../types';
import {
  PlusCircle,
  X,
  Shield,
  MapPin,
  Camera as CameraIcon,
  Server,
  Layers,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface AddCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCameraAdded: (newCam: Camera) => void;
  userRole: UserRole;
}

export const AddCameraModal: React.FC<AddCameraModalProps> = ({
  isOpen,
  onClose,
  onCameraAdded,
  userRole,
}) => {
  if (!isOpen) return null;

  const [district, setDistrict] = useState('Ahmedabad');
  const [department, setDepartment] = useState('Gujarat Police / Traffic Command');
  const [city, setCity] = useState('Ahmedabad');
  const [landmark, setLandmark] = useState('');
  const [ward, setWard] = useState('Ward 4 - Central Zone');
  const [type, setType] = useState<CameraType>('PTZ');
  const [vendor, setVendor] = useState('CP PLUS');
  const [latitude, setLatitude] = useState('23.0225');
  const [longitude, setLongitude] = useState('72.5714');
  const [resolution, setResolution] = useState('4K UHD (3840x2160)');
  const [protocol, setProtocol] = useState('ONVIF Profile T');
  const [vms, setVms] = useState('Milestone XProtect Corporate');
  const [redundancy, setRedundancy] = useState('MEDIUM');
  const [reason, setReason] = useState('Smart City Surveillance Corridor Expansion');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // District Quick Coordinate Presets
  const districtPresets: Record<string, { lat: string; lng: string; city: string }> = {
    Ahmedabad: { lat: '23.0225', lng: '72.5714', city: 'Ahmedabad' },
    Surat: { lat: '21.1702', lng: '72.8311', city: 'Surat' },
    Vadodara: { lat: '22.3072', lng: '73.1812', city: 'Vadodara' },
    Rajkot: { lat: '22.3039', lng: '70.8022', city: 'Rajkot' },
    Gandhinagar: { lat: '23.2156', lng: '72.6369', city: 'Gandhinagar' },
    Bhavnagar: { lat: '21.7645', lng: '72.1519', city: 'Bhavnagar' },
    Jamnagar: { lat: '22.4707', lng: '70.0577', city: 'Jamnagar' },
    Junagadh: { lat: '21.5222', lng: '70.4579', city: 'Junagadh' },
    'Kutch-Kandla': { lat: '23.0131', lng: '70.1337', city: 'Gandhidham' },
    Anand: { lat: '22.5645', lng: '72.9289', city: 'Anand' },
  };

  const handleDistrictChange = (d: string) => {
    setDistrict(d);
    if (districtPresets[d]) {
      setLatitude(districtPresets[d].lat);
      setLongitude(districtPresets[d].lng);
      setCity(districtPresets[d].city);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!landmark.trim()) {
      setErrorMsg('Please specify a landmark or junction description.');
      return;
    }
    if (!reason.trim()) {
      setErrorMsg('Mandatory governance justification is required for commissioning.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const payload = {
        cameraData: {
          district,
          department,
          city,
          landmark,
          ward,
          type,
          vendor,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          resolution,
          protocol,
          vms,
          redundancy_level: redundancy,
          owner: department,
          status: 'OPERATIONAL',
        },
        who: `${String(userRole || 'STATE_ADMIN').replace(/_/g, ' ')} Commissioning Custodian`,
        role: userRole,
        reason,
      };

      const res = await fetch('/api/cameras', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': userRole,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to commission camera');
      }

      const resData = await res.json();
      onCameraAdded(resData.camera);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error commissioning asset');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border-b border-slate-800 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <PlusCircle className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Register New CCTV Infrastructure Asset
                </h2>
                <span className="bg-blue-500/20 text-blue-300 border border-blue-500/40 text-xs px-2.5 py-0.5 rounded-full font-mono font-semibold">
                  COMMISSIONING FORM
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-0.5">
                Commission a verified surveillance node into Gujarat's Statewide Registry & GIS Digital Twin.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {errorMsg && (
            <div className="bg-rose-950/70 border border-rose-700/80 rounded-lg p-4 flex items-center space-x-3 text-rose-200 text-sm">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Administrative Custodianship & District */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center space-x-2 text-blue-400 font-semibold text-sm uppercase tracking-wider">
              <Shield className="w-4 h-4" />
              <span>1. Administrative Custodianship & District Jurisdiction</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  District Jurisdiction <span className="text-rose-400">*</span>
                </label>
                <select
                  value={district}
                  onChange={e => handleDistrictChange(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  {Object.keys(districtPresets).map(d => (
                    <option key={d} value={d}>
                      {d} District
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Owning Department / Custodian <span className="text-rose-400">*</span>
                </label>
                <select
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="Gujarat Police / Traffic Command">Gujarat Police / Traffic Command</option>
                  <option value="Roads & Buildings Department">Roads & Buildings Department (State Highways)</option>
                  <option value="Municipal Corporation">Municipal Corporation (Urban Smart Grid)</option>
                  <option value="GIDC / Industrial Security">GIDC / Industrial Estate Security</option>
                  <option value="Gujarat Maritime Board">Gujarat Maritime Board / Ports</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Spatial & Geospatial Location */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-sm uppercase tracking-wider">
              <MapPin className="w-4 h-4" />
              <span>2. Geospatial Positioning & Street Placement</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Landmark / Junction Description <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ring Road Circle & Textile Flyover Entry"
                  value={landmark}
                  onChange={e => setLandmark(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Ward / Administrative Sector
                </label>
                <input
                  type="text"
                  value={ward}
                  onChange={e => setWard(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Latitude (WGS84 Decimal) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  step="0.0001"
                  required
                  value={latitude}
                  onChange={e => setLatitude(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Longitude (WGS84 Decimal) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  step="0.0001"
                  required
                  value={longitude}
                  onChange={e => setLongitude(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Hardware Specifications & Protocols */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-sm uppercase tracking-wider">
              <CameraIcon className="w-4 h-4" />
              <span>3. Optical Hardware & Protocol Integration</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Camera Form Factor
                </label>
                <select
                  value={type}
                  onChange={e => setType(e.target.value as CameraType)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="PTZ">PTZ (High-Zoom Pan-Tilt)</option>
                  <option value="FIXED_DOME">Fixed Dome</option>
                  <option value="BULLET">Bullet</option>
                  <option value="ANPR_SPEED_DOME">ANPR Speed Dome</option>
                  <option value="PANORAMIC_360">Panoramic 360 Multisensor</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Hardware Vendor / OEM
                </label>
                <select
                  value={vendor}
                  onChange={e => setVendor(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="CP PLUS">CP PLUS</option>
                  <option value="Hikvision">Hikvision</option>
                  <option value="Dahua">Dahua Technology</option>
                  <option value="Axis Communications">Axis Communications</option>
                  <option value="Bosch Security">Bosch Security</option>
                  <option value="Hanwha Techwin">Hanwha Techwin</option>
                  <option value="Honeywell Commercial">Honeywell Commercial</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Optical Resolution
                </label>
                <select
                  value={resolution}
                  onChange={e => setResolution(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="4K UHD (3840x2160)">4K UHD (3840x2160)</option>
                  <option value="5MP (2592x1944)">5MP (2592x1944)</option>
                  <option value="4MP (2560x1440)">4MP (2560x1440)</option>
                  <option value="1080p FHD (1920x1080)">1080p FHD (1920x1080)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Streaming Protocol
                </label>
                <select
                  value={protocol}
                  onChange={e => setProtocol(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="ONVIF Profile T">ONVIF Profile T (H.265 & Analytics)</option>
                  <option value="ONVIF Profile S">ONVIF Profile S (Standard Video)</option>
                  <option value="ONVIF Profile M">ONVIF Profile M (AI Metadata)</option>
                  <option value="RTSP">Direct RTSP Stream</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  VMS Management System
                </label>
                <select
                  value={vms}
                  onChange={e => setVms(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="Milestone XProtect Corporate">Milestone XProtect Corporate</option>
                  <option value="Genetec Security Center">Genetec Security Center</option>
                  <option value="HikCentral Enterprise">HikCentral Enterprise</option>
                  <option value="Dahua DSS Pro">Dahua DSS Pro</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Corridor Redundancy Level
                </label>
                <select
                  value={redundancy}
                  onChange={e => setRedundancy(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="HIGH">High Redundancy (&ge;3 overlapping angles)</option>
                  <option value="MEDIUM">Medium Redundancy (2 overlapping angles)</option>
                  <option value="LOW">Low Redundancy (1 partial backup)</option>
                  <option value="CRITICAL">Critical (Zero Backup / Single Point of Failure)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 4: Mandatory Governance Justification */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-3">
            <label className="block text-xs font-semibold text-amber-400">
              Mandatory Governance Justification (Audit Recorded) <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Smart City surveillance phase 3 commissioning; sanctioned under GCCTV-2026 work order"
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <p className="text-xs text-slate-500">
              Logged to the immutable state audit ledger under authorized role{' '}
              <span className="font-mono text-blue-400">{userRole}</span>.
            </p>
          </div>

          {/* Modal Footer Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm font-semibold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-bold px-6 py-2.5 rounded-lg shadow-lg shadow-blue-600/30 transition cursor-pointer disabled:opacity-50"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{isSubmitting ? 'Commissioning Asset...' : 'Commission Asset to Registry'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
