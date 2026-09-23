import React, { useState } from 'react';
import { Camera, RedundancyLevel } from '../types';
import {
  Radio,
  AlertTriangle,
  Info,
  ShieldCheck,
  TrendingDown,
  ExternalLink,
  Sliders,
  Compass,
} from 'lucide-react';

interface CoverageRedundancyViewProps {
  cameras: Camera[];
  onSelectCamera: (camera: Camera) => void;
  onNavigate: (tab: string) => void;
}

export const CoverageRedundancyView: React.FC<CoverageRedundancyViewProps> = ({
  cameras,
  onSelectCamera,
  onNavigate,
}) => {
  // Configurable Target Coverage (Demo default: 90%)
  const [targetCoverage, setTargetCoverage] = useState<number>(90);
  const [selectedCamId, setSelectedCamId] = useState<string>(cameras[0]?.id || '');
  const [redundancyFilter, setRedundancyFilter] = useState<string>('CRITICAL');

  const selectedCam = cameras.find(c => c.id === selectedCamId) || cameras[0];

  // Statewide coverage calculation
  const total = cameras.length || 1;
  const currentCoverageAvg = Math.round((cameras.reduce((sum, c) => sum + c.coverage_score, 0) / total) * 10) / 10;
  const coverageDebt = Math.max(0, Math.round((targetCoverage - currentCoverageAvg) * 10) / 10);

  // Group by Redundancy
  const criticalRedundancyCams = cameras.filter(c => c.redundancy_level === 'CRITICAL');
  const lowRedundancyCams = cameras.filter(c => c.redundancy_level === 'LOW');
  const mediumRedundancyCams = cameras.filter(c => c.redundancy_level === 'MEDIUM');
  const highRedundancyCams = cameras.filter(c => c.redundancy_level === 'HIGH');

  // Filtered cameras for failure impact list
  const filteredCams = cameras.filter(c => {
    if (redundancyFilter === 'ALL') return true;
    return c.redundancy_level === redundancyFilter;
  });

  return (
    <div id="coverage-redundancy-view" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <Radio className="w-5 h-5 text-indigo-400" />
            <span>Coverage Intelligence & Resilience Debt</span>
            <span className="text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-800 px-2 py-0.5 rounded font-mono">
              PROTOTYPE FORMULA
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Prototype Coverage Debt formula: <code className="text-indigo-300 font-mono">max(Target Coverage − Current Coverage, 0)</code> with configurable benchmark.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onNavigate('simulation')}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1.5 rounded transition cursor-pointer font-medium"
          >
            Run Replacement Sandbox →
          </button>
        </div>
      </div>

      {/* Coverage Debt Sandbox Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-indigo-400" />
              <span>Configurable Coverage Debt Benchmark</span>
            </h3>
            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
              DEMO TARGET ONLY
            </span>
          </div>

          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-semibold">Configurable DEMO Target Coverage:</span>
              <span className="text-base font-bold text-indigo-400 font-mono">{targetCoverage}%</span>
            </div>
            <input
              type="range"
              min="70"
              max="100"
              value={targetCoverage}
              onChange={e => setTargetCoverage(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Min Target: 70%</span>
              <span>Default Benchmark: 90% (Demo)</span>
              <span>Max Target: 100%</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[11px]">Current Avg Coverage</span>
              <div className="text-xl font-bold text-white mt-1">{currentCoverageAvg}%</div>
              <span className="text-[10px] text-slate-500">Statewide empirical</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[11px]">Demo Target Coverage</span>
              <div className="text-xl font-bold text-indigo-400 mt-1">{targetCoverage}%</div>
              <span className="text-[10px] text-slate-500">Configured standard</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[11px]">Resulting Coverage Debt</span>
              <div className="text-xl font-bold text-rose-400 mt-1">{coverageDebt}%</div>
              <span className="text-[10px] text-rose-400/80">Spatial deficit index</span>
            </div>
          </div>
        </div>

        {/* Resilience Distribution Summary */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Redundancy Resilience Profile
            </h3>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2 bg-rose-950/30 border border-rose-900/50 rounded">
                <span className="text-rose-300 font-semibold">Critical (Zero Backup)</span>
                <span className="font-mono text-rose-400 font-bold">{criticalRedundancyCams.length} ({Math.round((criticalRedundancyCams.length / total) * 100)}%)</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-amber-950/30 border border-amber-900/50 rounded">
                <span className="text-amber-300 font-semibold">Low (Minor Overlap)</span>
                <span className="font-mono text-amber-400 font-bold">{lowRedundancyCams.length} ({Math.round((lowRedundancyCams.length / total) * 100)}%)</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-blue-950/30 border border-blue-900/50 rounded">
                <span className="text-blue-300 font-semibold">Medium (Partial Overlap)</span>
                <span className="font-mono text-blue-400 font-bold">{mediumRedundancyCams.length} ({Math.round((mediumRedundancyCams.length / total) * 100)}%)</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-emerald-950/30 border border-emerald-900/50 rounded">
                <span className="text-emerald-300 font-semibold">High (Multi Overlap)</span>
                <span className="font-mono text-emerald-400 font-bold">{highRedundancyCams.length} ({Math.round((highRedundancyCams.length / total) * 100)}%)</span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 pt-3 border-t border-slate-800">
            Critical redundancy nodes represent immediate single points of failure where a device drop causes total junction blackout.
          </p>
        </div>
      </div>

      {/* "What Happens If This Camera Fails?" Deep-Dive Analyzer */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Failure Consequence Engine: "What happens if this camera fails?"</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Select any surveillance node to inspect its exact failure impact, overlapping angle loss, and blind spot severity.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400">Filter Level:</span>
            <select
              value={redundancyFilter}
              onChange={e => setRedundancyFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded px-2 py-1 focus:outline-none cursor-pointer"
            >
              <option value="CRITICAL">Critical (High Risk)</option>
              <option value="LOW">Low Redundancy</option>
              <option value="MEDIUM">Medium Redundancy</option>
              <option value="HIGH">High Redundancy</option>
              <option value="ALL">All Nodes</option>
            </select>
          </div>
        </div>

        {/* Candidate selector and failure impact details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-2">
          {/* List of nodes */}
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-2 max-h-80 overflow-y-auto space-y-1">
            {filteredCams.slice(0, 30).map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedCamId(c.id)}
                className={`w-full text-left p-2 rounded text-xs transition flex items-center justify-between cursor-pointer ${
                  selectedCam.id === c.id
                    ? 'bg-blue-900/60 text-blue-200 border border-blue-500'
                    : 'hover:bg-slate-900 text-slate-300 border border-transparent'
                }`}
              >
                <div className="truncate max-w-[200px]">
                  <div className="font-mono font-bold text-xs">{c.global_id}</div>
                  <div className="text-[10px] text-slate-400 truncate">{c.landmark}</div>
                </div>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                    c.redundancy_level === 'CRITICAL'
                      ? 'bg-rose-950 text-rose-300'
                      : c.redundancy_level === 'LOW'
                      ? 'bg-amber-950 text-amber-300'
                      : 'bg-emerald-950 text-emerald-300'
                  }`}
                >
                  {c.redundancy_level}
                </span>
              </button>
            ))}
          </div>

          {/* Detailed Impact Breakdown */}
          {selectedCam && (
            <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-blue-400 uppercase tracking-wider">
                    SIMULATED NODE OUTAGE IMPACT
                  </span>
                  <button
                    onClick={() => onSelectCamera(selectedCam)}
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center space-x-1 cursor-pointer"
                  >
                    <span>View Digital Twin</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>

                <h4 className="text-base font-bold text-white font-mono mt-1">{selectedCam.global_id}</h4>
                <p className="text-xs text-slate-300">{selectedCam.landmark} ({selectedCam.district})</p>

                {/* The Primary Answer to "What happens if this camera fails?" */}
                <div className="mt-4 bg-slate-900 border border-amber-800/60 rounded-lg p-4 text-xs space-y-2">
                  <div className="text-amber-300 font-bold flex items-center space-x-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>FAILURE CONSEQUENCE ASSESSMENT:</span>
                  </div>
                  <p className="text-slate-100 font-medium leading-relaxed text-sm">
                    {selectedCam.redundancy_note}
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mt-4">
                  <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                    <span className="text-slate-400 text-[10px]">Overlapping Cameras:</span>
                    <p className="text-sm font-bold text-white mt-0.5">{selectedCam.redundancy_adjacent_count} within 350m</p>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                    <span className="text-slate-400 text-[10px]">Importance Rating:</span>
                    <p className="text-sm font-bold text-indigo-400 mt-0.5">{String(selectedCam.coverage_importance || 'STANDARD').split('_')[0]}</p>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                    <span className="text-slate-400 text-[10px]">Current Status:</span>
                    <p className="text-sm font-bold text-emerald-400 mt-0.5">{selectedCam.status}</p>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                    <span className="text-slate-400 text-[10px]">Coverage Score:</span>
                    <p className="text-sm font-bold text-white mt-0.5">{selectedCam.coverage_score}%</p>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 border-t border-slate-900 pt-2 flex items-center justify-between">
                <span>Spatial PostGIS Buffer: 350m Haversine Overlap Zone</span>
                <span className="text-amber-400 font-medium">
                  {selectedCam.redundancy_level === 'CRITICAL' ? '⚠️ High Priority Replacement Node' : '✓ Resilience Buffer Available'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
