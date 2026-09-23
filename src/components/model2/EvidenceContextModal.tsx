import React from 'react';
import { VideoAnalyticsEvent, Camera } from '../../types';
import {
  X,
  ShieldCheck,
  MapPin,
  Clock,
  Fingerprint,
  FileCheck2,
  Tv,
  CheckCircle2,
  ExternalLink,
  Layers,
  AlertTriangle,
} from 'lucide-react';

interface EvidenceContextModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: VideoAnalyticsEvent | null;
  camera?: Camera | null;
  onOpenDigitalTwin?: (camera: Camera) => void;
  onTrackVehicle?: (plate: string) => void;
}

export const EvidenceContextModal: React.FC<EvidenceContextModalProps> = ({
  isOpen,
  onClose,
  event,
  camera,
  onOpenDigitalTwin,
  onTrackVehicle,
}) => {
  if (!isOpen || !event) return null;

  const mockHash = `0x9f82c4${event.id.replace(/[^0-9]/g, '') || '4829'}a107ef4c892b1928374d6e901a`;

  return (
    <div
      id="evidence-context-card"
      className="fixed inset-0 z-[9990] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      <div className="max-w-2xl w-full bg-slate-900 border-2 border-cyan-500/60 rounded-3xl shadow-2xl shadow-cyan-950/50 overflow-hidden flex flex-col text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-950 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-white font-extrabold text-base sm:text-lg">
                  Standardized Evidence Context Card
                </h3>
                <span className="bg-cyan-950 text-cyan-300 border border-cyan-700 text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                  VERIFIED FORENSIC
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Event ID: {event.id} • {new Date(event.timestamp).toLocaleString()}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 cursor-pointer transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5">
          {/* Simulated Detection Frame with Bounding Box */}
          <div className="relative aspect-video bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center">
            {/* Visual simulation of camera scene */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900 to-slate-800 opacity-90" />
            
            {/* Grid overlay */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />

            {/* AI Bounding Box */}
            <div className="relative border-2 border-emerald-400 bg-emerald-500/10 rounded-lg p-6 flex flex-col items-center justify-center animate-pulse">
              <div className="absolute -top-3 left-3 bg-emerald-500 text-slate-950 text-[10px] font-mono font-black px-2 py-0.5 rounded uppercase shadow">
                {event.metadata.license_plate ? `TARGET: ${event.metadata.license_plate}` : event.event_type} (98.4%)
              </div>
              <Tv className="w-16 h-16 text-cyan-300/40 mb-2" />
              <div className="text-xs font-mono text-emerald-300 font-bold">
                Optical Frame Capture • Bounding Coordinates: [x: 210, y: 140, w: 320, h: 180]
              </div>
            </div>

            {/* Timestamp & PTS Watermark */}
            <div className="absolute bottom-2 left-3 text-[10px] font-mono text-emerald-400 bg-slate-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
              PTS: 161046773521201 • 90kHz Clock Verified
            </div>
          </div>

          {/* Key Evidentiary Metadata Table */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 space-y-1">
              <div className="text-slate-400 text-[11px] font-mono flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-red-400" />
                <span>LOCATION & SENSOR</span>
              </div>
              <div className="font-bold text-white text-sm">{event.camera_name}</div>
              <div className="text-cyan-300 font-mono text-[11px]">Model 1 ID: {event.global_camera_id}</div>
              <div className="text-slate-400 text-[11px]">{event.district} District Corridor</div>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 space-y-1">
              <div className="text-slate-400 text-[11px] font-mono flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>INCIDENT CLASSIFICATION</span>
              </div>
              <div className="font-bold text-amber-300 text-sm">{event.title}</div>
              <div className="text-slate-300 text-[11px]">Severity: <span className="text-rose-400 font-bold">{event.severity}</span></div>
              <div className="text-slate-400 text-[11px]">Type: {event.event_type.replace(/_/g, ' ')}</div>
            </div>
          </div>

          {/* Cryptographic Integrity & Chain of Custody */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-400 flex items-center space-x-1">
                <Fingerprint className="w-3.5 h-3.5 text-purple-400" />
                <span>SHA-256 INTEGRITY HASH:</span>
              </span>
              <span className="text-emerald-400 font-bold flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>IMMUTABLE PROVENANCE</span>
              </span>
            </div>
            <div className="bg-slate-900 px-3 py-1.5 rounded font-mono text-[11px] text-slate-300 break-all border border-slate-800">
              {mockHash}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-950 border-t border-slate-800 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            {camera && onOpenDigitalTwin && (
              <button
                onClick={() => {
                  onClose();
                  onOpenDigitalTwin(camera);
                }}
                className="bg-slate-800 hover:bg-slate-700 text-blue-300 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition"
              >
                Inspect Digital Twin
              </button>
            )}

            {event.metadata.license_plate && onTrackVehicle && (
              <button
                onClick={() => {
                  onClose();
                  onTrackVehicle(event.metadata.license_plate!);
                }}
                className="bg-purple-950 hover:bg-purple-900 text-purple-300 border border-purple-800 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition"
              >
                Track Trajectory
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs cursor-pointer transition"
          >
            Acknowledge Evidence
          </button>
        </div>
      </div>
    </div>
  );
};
