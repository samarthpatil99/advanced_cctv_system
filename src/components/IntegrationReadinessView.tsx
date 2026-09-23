import React, { useState } from 'react';
import { Camera, IntegrationTier } from '../types';
import {
  Layers,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  Server,
  Radio,
} from 'lucide-react';

interface IntegrationReadinessViewProps {
  cameras: Camera[];
  onSelectCamera: (camera: Camera) => void;
}

export const IntegrationReadinessView: React.FC<IntegrationReadinessViewProps> = ({
  cameras,
  onSelectCamera,
}) => {
  const [selectedTier, setSelectedTier] = useState<string>('ALL');

  const readyCams = cameras.filter(
    c => c.integration_tier === 'DIRECT_CLOUD_INGESTION' || (c.integration_tier as any) === 'READY'
  );
  const inProgressCams = cameras.filter(
    c => c.integration_tier === 'EDGE_GATEWAY_REQUIRED' || (c.integration_tier as any) === 'IN_PROGRESS'
  );
  const notReadyCams = cameras.filter(
    c => c.integration_tier === 'LEGACY_UPGRADE_REQUIRED' || (c.integration_tier as any) === 'NOT_READY'
  );

  const total = cameras.length || 1;

  // Protocol compliance stats
  const protoStats = {
    rtsp: Math.round((cameras.filter(c => c.integration_capabilities.rtsp).length / total) * 100),
    onvif: Math.round((cameras.filter(c => c.integration_capabilities.onvif).length / total) * 100),
    rest_api: Math.round((cameras.filter(c => c.integration_capabilities.rest_api).length / total) * 100),
    vendor_sdk: Math.round((cameras.filter(c => c.integration_capabilities.vendor_sdk).length / total) * 100),
    metadata_stream: Math.round((cameras.filter(c => c.integration_capabilities.metadata_stream).length / total) * 100),
    health_endpoint: Math.round((cameras.filter(c => c.integration_capabilities.health_endpoint).length / total) * 100),
    vms_bridge: Math.round((cameras.filter(c => c.integration_capabilities.vms_bridge).length / total) * 100),
    network_accessible: Math.round((cameras.filter(c => c.integration_capabilities.network_accessible).length / total) * 100),
  };

  const filteredCams = cameras.filter(c => {
    if (selectedTier === 'ALL') return true;
    return c.integration_tier === selectedTier;
  });

  return (
    <div id="integration-readiness-view" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <span>Statewide Ingestion Readiness & Protocol Conformance</span>
            <span className="text-xs bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded font-mono">
              EXPLAINABLE SCORE
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Surfaces streaming protocol compliance, ONVIF compliance, and network reachability required for central command center ingestion.
          </p>
        </div>
      </div>

      {/* Readiness Tier KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => setSelectedTier(selectedTier === 'READY' ? 'ALL' : 'READY')}
          className={`p-4 rounded-lg border text-left transition cursor-pointer ${
            selectedTier === 'READY'
              ? 'bg-emerald-950/80 border-emerald-500 shadow-lg'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex justify-between items-center text-xs">
            <span className="text-emerald-400 font-bold">READY (80–100%)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-1">{readyCams.length}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Full RTSP, ONVIF & Metadata Ingestion</p>
        </button>

        <button
          onClick={() => setSelectedTier(selectedTier === 'IN_PROGRESS' ? 'ALL' : 'IN_PROGRESS')}
          className={`p-4 rounded-lg border text-left transition cursor-pointer ${
            selectedTier === 'IN_PROGRESS'
              ? 'bg-amber-950/80 border-amber-500 shadow-lg'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex justify-between items-center text-xs">
            <span className="text-amber-400 font-bold">IN PROGRESS (50–79%)</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-1">{inProgressCams.length}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Missing metadata or health endpoints</p>
        </button>

        <button
          onClick={() => setSelectedTier(selectedTier === 'NOT_READY' ? 'ALL' : 'NOT_READY')}
          className={`p-4 rounded-lg border text-left transition cursor-pointer ${
            selectedTier === 'NOT_READY'
              ? 'bg-rose-950/80 border-rose-500 shadow-lg'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex justify-between items-center text-xs">
            <span className="text-rose-400 font-bold">NOT READY (&lt;50%)</span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-1">{notReadyCams.length}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Legacy proprietary protocols / Unreachable</p>
        </button>
      </div>

      {/* Protocol Conformance Statewide Progress Bars */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center space-x-2">
          <Server className="w-4 h-4 text-cyan-400" />
          <span>Statewide Protocol Conformance Distribution</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-300">RTSP Video Streaming:</span>
              <span className="font-mono text-cyan-400 font-bold">{protoStats.rtsp}%</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-cyan-500 h-full" style={{ width: `${protoStats.rtsp}%` }}></div>
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-300">ONVIF Profile Conformance:</span>
              <span className="font-mono text-cyan-400 font-bold">{protoStats.onvif}%</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-cyan-500 h-full" style={{ width: `${protoStats.onvif}%` }}></div>
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-300">REST / WebSocket API:</span>
              <span className="font-mono text-cyan-400 font-bold">{protoStats.rest_api}%</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-cyan-500 h-full" style={{ width: `${protoStats.rest_api}%` }}></div>
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-300">Vendor Native SDK:</span>
              <span className="font-mono text-cyan-400 font-bold">{protoStats.vendor_sdk}%</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-cyan-500 h-full" style={{ width: `${protoStats.vendor_sdk}%` }}></div>
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-300">Analytics Metadata Stream:</span>
              <span className="font-mono text-cyan-400 font-bold">{protoStats.metadata_stream}%</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-cyan-500 h-full" style={{ width: `${protoStats.metadata_stream}%` }}></div>
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-300">Health Telemetry Endpoint:</span>
              <span className="font-mono text-cyan-400 font-bold">{protoStats.health_endpoint}%</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-cyan-500 h-full" style={{ width: `${protoStats.health_endpoint}%` }}></div>
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-300">VMS Bridge Gateway:</span>
              <span className="font-mono text-cyan-400 font-bold">{protoStats.vms_bridge}%</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-cyan-500 h-full" style={{ width: `${protoStats.vms_bridge}%` }}></div>
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-300">WAN Reachability:</span>
              <span className="font-mono text-cyan-400 font-bold">{protoStats.network_accessible}%</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-cyan-500 h-full" style={{ width: `${protoStats.network_accessible}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtered Camera List */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-3">
        <div className="flex justify-between items-center text-xs">
          <h4 className="font-semibold text-white">
            Integration Audit Queue: {String(selectedTier || '').replace(/_/g, ' ')} ({filteredCams.length} assets)
          </h4>
        </div>

        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[11px] sticky top-0">
              <tr>
                <th className="p-3">Global ID</th>
                <th className="p-3">District</th>
                <th className="p-3">VMS</th>
                <th className="p-3">Streaming Protocol</th>
                <th className="p-3">Score</th>
                <th className="p-3">Readiness Tier</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredCams.slice(0, 30).map(cam => (
                <tr key={cam.id} className="hover:bg-slate-800/40">
                  <td className="p-3 font-mono font-bold text-white">{cam.global_id}</td>
                  <td className="p-3">{cam.district}</td>
                  <td className="p-3">{cam.vms}</td>
                  <td className="p-3 font-mono">{cam.protocol}</td>
                  <td className="p-3 font-bold text-white">{cam.integration_score}%</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      cam.integration_tier === 'DIRECT_CLOUD_INGESTION' || (cam.integration_tier as any) === 'READY'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : cam.integration_tier === 'EDGE_GATEWAY_REQUIRED' || (cam.integration_tier as any) === 'IN_PROGRESS'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-rose-950 text-rose-300 border border-rose-800'
                    }`}>
                      {String(cam.integration_tier || 'UNKNOWN').replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => onSelectCamera(cam)}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2 py-1 rounded text-xs transition cursor-pointer inline-flex items-center space-x-1"
                    >
                      <span>Digital Twin</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
