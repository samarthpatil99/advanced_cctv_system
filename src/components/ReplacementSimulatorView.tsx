import React, { useState } from 'react';
import { Camera } from '../types';
import {
  Cpu,
  Zap,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  AlertTriangle,
  Info,
  Sliders,
  Sparkles,
  Layers,
} from 'lucide-react';

interface ReplacementSimulatorViewProps {
  cameras: Camera[];
  onSelectCamera: (camera: Camera) => void;
}

export const ReplacementSimulatorView: React.FC<ReplacementSimulatorViewProps> = ({
  cameras,
  onSelectCamera,
}) => {
  // Preselect a critical or aging camera for demonstration
  const defaultCandidate =
    cameras.find(c => c.age_group === '9+ YRS' || c.redundancy_level === 'CRITICAL') ||
    cameras[0];

  const [selectedCamId, setSelectedCamId] = useState<string>(defaultCandidate?.id || '');
  const selectedCam = cameras.find(c => c.id === selectedCamId) || defaultCandidate;

  // Simulator hardware options
  const [newVendor, setNewVendor] = useState<string>('Axis Communications');
  const [newModel, setNewModel] = useState<string>('Q6315-LE 4K IR PTZ');
  const [newResolution, setNewResolution] = useState<string>('4K (3840x2160)');
  const [newFovAngle, setNewFovAngle] = useState<number>(120);
  const [selectedAnalytics, setSelectedAnalytics] = useState<string[]>([
    'ANPR (Automatic Number Plate)',
    'Vehicle Speed Classification',
    'Wrong-Way Driving Detection',
    'Crowd Surge Detection',
  ]);
  const [newProtocol, setNewProtocol] = useState<string>('ONVIF Profile S/T/M + RTSP (H.265)');

  const toggleAnalytic = (name: string) => {
    if (selectedAnalytics.includes(name)) {
      setSelectedAnalytics(selectedAnalytics.filter(a => a !== name));
    } else {
      setSelectedAnalytics([...selectedAnalytics, name]);
    }
  };

  // Recalculate simulated outcomes
  const simulatedHealth = 98; // Fresh OEM hardware
  const healthDelta = selectedCam ? simulatedHealth - selectedCam.health_score : 0;

  const simulatedCoverage = selectedCam
    ? Math.min(100, Math.round(selectedCam.coverage_score + (newFovAngle - selectedCam.fov_angle) * 0.25 + selectedAnalytics.length * 3))
    : 95;
  const coverageDelta = selectedCam ? simulatedCoverage - selectedCam.coverage_score : 0;

  const simulatedIntegration = 100;
  const integrationDelta = selectedCam ? simulatedIntegration - selectedCam.integration_score : 0;

  // Cost estimate calculation in INR
  const baseHardwareCost = newResolution.includes('4K') ? 75000 : 45000;
  const fovCost = newFovAngle > 90 ? 15000 : 8000;
  const analyticsLicenseCost = selectedAnalytics.length * 6500;
  const laborAndMountingCost = 18000;
  const totalCostINR = baseHardwareCost + fovCost + analyticsLicenseCost + laborAndMountingCost;

  return (
    <div id="replacement-simulator-view" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <span>Camera Replacement & Modernization Simulator</span>
            <span className="text-xs bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded font-mono">
              PROTOTYPE PLANNING SIMULATION ONLY
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Evaluate simulated coverage gains, telemetry health revitalization, protocol compliance, and estimated capital expenditure prior to procurement.
          </p>
        </div>
      </div>

      {/* Main Grid: Inputs (Left) and Simulated Results (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Simulator Controls */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>Target Asset & Modernization Spec</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">DESIGN BENCHMARK</span>
          </div>

          {/* Target Camera Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Select Camera Node for Upgrade Simulation:
            </label>
            <select
              value={selectedCamId}
              onChange={e => setSelectedCamId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-xs text-slate-100 rounded px-3 py-2 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              {cameras.slice(0, 50).map(c => (
                <option key={c.id} value={c.id}>
                  {c.global_id} ({c.district} - {c.age_years}y - Health: {c.health_score}%)
                </option>
              ))}
            </select>
            {selectedCam && (
              <p className="text-[11px] text-slate-500 mt-1">
                Current: {selectedCam.vendor} {selectedCam.model} ({selectedCam.type}) at {selectedCam.landmark}
              </p>
            )}
          </div>

          {/* Replacement Model */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Target Vendor:</label>
              <select
                value={newVendor}
                onChange={e => setNewVendor(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded p-1.5 focus:outline-none cursor-pointer"
              >
                <option value="Axis Communications">Axis Communications</option>
                <option value="Bosch Security">Bosch Security</option>
                <option value="Hanwha Vision">Hanwha Vision</option>
                <option value="Dahua WizMind">Dahua WizMind Enterprise</option>
                <option value="Hikvision Ultra">Hikvision Ultra AI</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Resolution Standard:</label>
              <select
                value={newResolution}
                onChange={e => setNewResolution(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded p-1.5 focus:outline-none cursor-pointer"
              >
                <option value="4MP QHD (2560x1440)">4MP QHD (2560x1440)</option>
                <option value="4K (3840x2160)">4K UHD (3840x2160)</option>
                <option value="12MP Multi-Sensor">12MP Multi-Sensor 180°</option>
                <option value="Dual Thermal+Optical">Dual Thermal + 4K Optical</option>
              </select>
            </div>
          </div>

          {/* FOV Slider */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300 font-medium">Upgraded Optical Field of View (FOV):</span>
              <span className="font-mono text-cyan-400 font-bold">{newFovAngle}° Arc</span>
            </div>
            <input
              type="range"
              min="60"
              max="180"
              step="15"
              value={newFovAngle}
              onChange={e => setNewFovAngle(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>Standard (60°)</span>
              <span>Wide Junction (120°)</span>
              <span>Panoramic (180°)</span>
            </div>
          </div>

          {/* Edge AI Analytics Checkboxes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">
              Enable Edge AI Analytic Packages:
            </label>
            <div className="grid grid-cols-1 gap-1.5 text-xs">
              {[
                'ANPR (Automatic Number Plate)',
                'Vehicle Speed Classification',
                'Wrong-Way Driving Detection',
                'Crowd Surge Detection',
                'Fire & Smoke Thermal Alert',
                'Abandoned Baggage Detection',
              ].map(analytic => {
                const isSelected = selectedAnalytics.includes(analytic);
                return (
                  <label
                    key={analytic}
                    className={`flex items-center space-x-2 p-2 rounded border cursor-pointer transition ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-800/60 text-cyan-200'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleAnalytic(analytic)}
                      className="rounded accent-cyan-500"
                    />
                    <span>{analytic}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Protocol */}
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Statewide Protocol Interoperability:</label>
            <input
              type="text"
              disabled
              value={newProtocol}
              className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-300 font-mono"
            />
          </div>
        </div>

        {/* Right Column: Simulated Outcomes & Explainable Benefits */}
        <div className="lg:col-span-7 space-y-4">
          {/* Simulated Impact Scoreboard */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Simulated Performance Delta & ROI Projections</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Health Improvement */}
              <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-xs">Health Score</span>
                <div className="flex items-baseline space-x-2 mt-1">
                  <span className="text-2xl font-bold text-white">{simulatedHealth}%</span>
                  <span className="text-xs font-bold text-emerald-400 font-mono">
                    +{healthDelta}%
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Baseline: {selectedCam?.health_score}% → New: 98%
                </div>
              </div>

              {/* Coverage Gain */}
              <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-xs">Spatial Coverage</span>
                <div className="flex items-baseline space-x-2 mt-1">
                  <span className="text-2xl font-bold text-white">{simulatedCoverage}%</span>
                  <span className={`text-xs font-bold font-mono ${coverageDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {coverageDelta >= 0 ? `+${coverageDelta}%` : `${coverageDelta}%`}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Baseline: {selectedCam?.coverage_score}% → New: {simulatedCoverage}%
                </div>
              </div>

              {/* Integration Readiness */}
              <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-xs">Integration Index</span>
                <div className="flex items-baseline space-x-2 mt-1">
                  <span className="text-2xl font-bold text-cyan-400">100%</span>
                  <span className="text-xs font-bold text-emerald-400 font-mono">
                    +{integrationDelta}%
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Unified ONVIF Profile T Ready
                </div>
              </div>
            </div>

            {/* Estimated Capex in INR */}
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 font-semibold">Estimated Upgrade Cost (INR):</span>
                <div className="text-2xl font-extrabold text-emerald-400 font-mono mt-0.5">
                  ₹{totalCostINR.toLocaleString('en-IN')}
                </div>
                <div className="text-[11px] text-slate-500">
                  Includes hardware unit (₹{baseHardwareCost.toLocaleString()}) + optical mount (₹{fovCost.toLocaleString()}) + {selectedAnalytics.length} AI licenses (₹{analyticsLicenseCost.toLocaleString()}) + field labor (₹{laborAndMountingCost.toLocaleString()}).
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
                  BUDGET ESTIMATE
                </span>
              </div>
            </div>
          </div>

          {/* Explainable "What Changes" & "Why This Helps" */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Explainable Impact Assessment: Why This Upgrade Helps</span>
            </h4>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-1">
                <div className="font-semibold text-emerald-300">1. Eliminates Aging Failure Vulnerability</div>
                <p className="text-slate-300 leading-relaxed">
                  Replacing the current <span className="text-white font-mono">{selectedCam?.age_years}-year-old</span> node resets hardware mean time between failures (MTBF) from 18,000 hours to 120,000 hours, removing it from the Statewide P1/P2 maintenance backlog.
                </p>
              </div>

              <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-1">
                <div className="font-semibold text-cyan-300">2. Expands Optical Coverage & Blind Spot Elimination</div>
                <p className="text-slate-300 leading-relaxed">
                  Upgrading optical arc from <span className="text-white font-mono">{selectedCam?.fov_angle}°</span> to <span className="text-white font-mono">{newFovAngle}°</span> reduces junction blind spots by an estimated 42%, increasing situational awareness at {selectedCam?.landmark}.
                </p>
              </div>

              <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-1">
                <div className="font-semibold text-purple-300">3. Edge AI Ingestion for Automated Traffic Governance</div>
                <p className="text-slate-300 leading-relaxed">
                  Enabling {selectedAnalytics.length} automated Edge AI algorithms offloads real-time processing from the central VMS cluster to the camera edge, reducing WAN streaming bandwidth by up to 60% through metadata-only alert publishing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
