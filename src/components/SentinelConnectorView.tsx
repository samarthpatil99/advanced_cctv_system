import React, { useState } from 'react';
import { SentinelScanPayload, SentinelScanResult, UserRole } from '../types';
import {
  Radio,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Play,
  Database,
  Layers,
  ArrowRight,
  Terminal,
} from 'lucide-react';

interface SentinelConnectorViewProps {
  onRefreshData: () => Promise<void>;
  userRole: UserRole;
}

export const SentinelConnectorView: React.FC<SentinelConnectorViewProps> = ({
  onRefreshData,
  userRole,
}) => {
  const [district, setDistrict] = useState<string>('Ahmedabad');
  const [sampleCount, setSampleCount] = useState<number>(5);
  const [simulateConflicts, setSimulateConflicts] = useState<boolean>(true);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<SentinelScanResult | null>(null);

  const handleRunScan = async () => {
    setIsScanning(true);
    try {
      const payload: SentinelScanPayload = {
        scan_id: `SCAN-SENTINEL-${Date.now().toString().slice(-6)}`,
        district,
        sample_count: sampleCount,
        simulate_conflicts: simulateConflicts,
      };

      const res = await fetch('/api/sentinel/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data: SentinelScanResult = await res.json();
      setScanResult(data);
      await onRefreshData();
    } catch (err: any) {
      alert(`Sentinel Scan failed: ${err.message}`);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div id="sentinel-connector-view" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <Radio className="w-5 h-5 text-indigo-400" />
            <span>Automated Sentinel Telemetry Connector (Sub-network Probe)</span>
            <span className="text-xs bg-indigo-950 text-indigo-300 border border-indigo-800 px-2 py-0.5 rounded font-mono">
              AUTOMATED DISCOVERY PROTOCOL
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Simulates periodic or on-demand automated network scans (ONVIF WS-Discovery, SNMP probe, RTSP health handshake).
          </p>
        </div>
      </div>

      {/* Trigger Scan Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Play className="w-4 h-4 text-emerald-400" />
              <span>Configure Inbound Discovery Probe</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Dispatches broadcast probe on target subnets</p>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Target District Subnet:</label>
              <select
                value={district}
                onChange={e => setDistrict(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded px-3 py-2 focus:outline-none cursor-pointer"
              >
                <option value="Ahmedabad">Ahmedabad Police & Smart City WAN</option>
                <option value="Surat">Surat Municipal Command Ring</option>
                <option value="Vadodara">Vadodara Traffic Surveillance Trunk</option>
                <option value="Rajkot">Rajkot RMC WAN Backbone</option>
                <option value="Gandhinagar">Gandhinagar Capital Surveillance Net</option>
                <option value="Kutch-Kandla">Kutch-Kandla Port Security Grid</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Probe Batch Size:</label>
              <select
                value={sampleCount}
                onChange={e => setSampleCount(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded px-3 py-2 focus:outline-none cursor-pointer"
              >
                <option value={3}>3 Inbound Node Telemetries</option>
                <option value={5}>5 Inbound Node Telemetries</option>
                <option value={10}>10 Inbound Node Telemetries</option>
              </select>
            </div>

            <div className="pt-1">
              <label className="flex items-center space-x-2 p-2.5 rounded bg-slate-950 border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={simulateConflicts}
                  onChange={e => setSimulateConflicts(e.target.checked)}
                  className="accent-indigo-500 rounded"
                />
                <span className="text-slate-300 font-medium">
                  Simulate Inbound Provenance Conflicts (Updated firmware / new status)
                </span>
              </label>
              <p className="text-[10px] text-slate-500 mt-1 pl-1">
                Demonstrates how conflicts are safely quarantined without silent overwrite.
              </p>
            </div>

            <button
              onClick={handleRunScan}
              disabled={isScanning}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-lg transition cursor-pointer flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/30 text-xs"
            >
              <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Probing Subnets & Ingesting...' : 'Dispatch Automated Sentinel Scan'}</span>
            </button>
          </div>
        </div>

        {/* Scan Results & Execution Log */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
          <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>Ingestion Stream Telemetry Terminal</span>
            </h3>
            {scanResult && (
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 border border-emerald-800 px-2 py-0.5 rounded">
                COMPLETED
              </span>
            )}
          </div>

          {scanResult ? (
            <div className="space-y-4 text-xs">
              {/* Stats row */}
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-400">Total Probed</span>
                  <div className="text-lg font-bold text-white mt-0.5">{scanResult.processed_count}</div>
                </div>
                <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                  <span className="text-[10px] text-emerald-400">Fresh Nodes</span>
                  <div className="text-lg font-bold text-emerald-400 mt-0.5">{scanResult.new_discovered_count}</div>
                </div>
                <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                  <span className="text-[10px] text-blue-400">Updated</span>
                  <div className="text-lg font-bold text-blue-400 mt-0.5">{scanResult.updated_count}</div>
                </div>
                <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                  <span className="text-[10px] text-amber-400">Conflicts</span>
                  <div className="text-lg font-bold text-amber-400 mt-0.5">{scanResult.conflicts_flagged}</div>
                </div>
              </div>

              {/* Execution log lines */}
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1.5 max-h-56 overflow-y-auto">
                <div className="text-indigo-400">[SENTINEL DISCOVERY] Session initialized for district: {scanResult.district}</div>
                <div className="text-slate-500">[PROBE] Broadcasting ONVIF WS-Discovery probe across target VLAN gateways...</div>
                <div className="text-slate-400">[DISCOVERY] Received responses from {scanResult.processed_count} active CCTV nodes.</div>
                {scanResult.conflicts_flagged > 0 ? (
                  <div className="text-amber-400 font-semibold">
                    [PROVENANCE ALERT] Flagged {scanResult.conflicts_flagged} discrepancies with Master Registry. Routed to Conflict Queue.
                  </div>
                ) : (
                  <div className="text-emerald-400">[VALIDATION] All telemetry matches verified baseline without conflict.</div>
                )}
                <div className="text-slate-500">[AUDIT] Appended scan execution to Statewide Registry Audit Ledger.</div>
              </div>

              <p className="text-[11px] text-slate-400 border-t border-slate-800 pt-2">
                All records were ingested under source tag <code className="text-indigo-300 font-mono">Sentinel-Probe-Daemon</code> with immutable audit trail.
              </p>
            </div>
          ) : (
            <div className="py-16 text-center text-slate-500 text-xs">
              Click "Dispatch Automated Sentinel Scan" to trigger a live network discovery and telemetry ingestion cycle.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
