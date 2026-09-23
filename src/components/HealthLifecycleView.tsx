import React, { useState } from 'react';
import { Camera } from '../types';
import {
  HeartPulse,
  Clock,
  Sliders,
  AlertTriangle,
  Info,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface HealthLifecycleViewProps {
  cameras: Camera[];
  onSelectCamera: (camera: Camera) => void;
  onNavigate: (tab: string) => void;
}

export const HealthLifecycleView: React.FC<HealthLifecycleViewProps> = ({
  cameras,
  onSelectCamera,
  onNavigate,
}) => {
  // Prototype Interactive Health Formula Sandbox
  const [sliderConn, setSliderConn] = useState<number>(85);
  const [sliderUptime, setSliderUptime] = useState<number>(90);
  const [sliderHeartbeat, setSliderHeartbeat] = useState<number>(95);
  const [sliderMaint, setSliderMaint] = useState<number>(80);
  const [sliderFailures, setSliderFailures] = useState<number>(75);

  const calculatedHealth = Math.round(
    0.30 * sliderConn +
    0.20 * sliderUptime +
    0.20 * sliderHeartbeat +
    0.15 * sliderMaint +
    0.15 * sliderFailures
  );

  // Critical Aging cameras (9+ years)
  const criticalAgingCams = cameras.filter(c => c.age_group === '9+ YRS');
  const agingCams = cameras.filter(c => c.age_group === '6-8 YRS');

  return (
    <div id="health-lifecycle-view" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <HeartPulse className="w-5 h-5 text-rose-400" />
            <span>Health Intelligence & Lifecycle Depreciation</span>
            <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded font-mono">
              PROTOTYPE FORMULA
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Transparent algorithmic health scoring and EOL (End-of-Life) forecasting across statewide hardware tiers.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onNavigate('simulation')}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1.5 rounded transition cursor-pointer font-medium"
          >
            Launch Replacement Simulator →
          </button>
        </div>
      </div>

      {/* Health Scoring Formula Explainer & Interactive Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-blue-400" />
              <span>Interactive Prototype Health Scoring Simulator</span>
            </h3>
            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
              DESIGN BENCHMARK
            </span>
          </div>

          <div className="bg-amber-950/20 border border-amber-800/40 rounded p-3 text-xs text-amber-300 flex items-start space-x-2">
            <Info className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-semibold">PROTOTYPE FORMULA SPECIFICATION:</span>
              <p className="text-slate-300 mt-0.5 font-mono text-[11px]">
                Health Score = 30% Connectivity + 20% Uptime + 20% Heartbeat Freshness + 15% Maintenance Compliance + 15% Failure History.
              </p>
              <p className="text-amber-400 text-[10px] mt-1">
                Notice: Clearly designated as an analytical prototype standard, not an official government policy decree.
              </p>
            </div>
          </div>

          {/* Interactive Sliders */}
          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">1. Connectivity Reliability (30% weight):</span>
                <span className="font-mono text-blue-400 font-bold">{sliderConn}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={sliderConn}
                onChange={e => setSliderConn(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">2. Network Uptime Historical (20% weight):</span>
                <span className="font-mono text-emerald-400 font-bold">{sliderUptime}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={sliderUptime}
                onChange={e => setSliderUptime(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">3. Telemetry Heartbeat Freshness (20% weight):</span>
                <span className="font-mono text-purple-400 font-bold">{sliderHeartbeat}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={sliderHeartbeat}
                onChange={e => setSliderHeartbeat(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">4. SLA Maintenance Compliance (15% weight):</span>
                <span className="font-mono text-amber-400 font-bold">{sliderMaint}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={sliderMaint}
                onChange={e => setSliderMaint(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">5. Failure History Score (15% weight):</span>
                <span className="font-mono text-cyan-400 font-bold">{sliderFailures}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={sliderFailures}
                onChange={e => setSliderFailures(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Real-time Calculation Result Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Simulated Outcome</h3>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 rounded-full border-4 border-blue-500/30 flex items-center justify-center bg-slate-900 shadow-xl mb-2">
                <span className="text-3xl font-black text-white">{calculatedHealth}%</span>
              </div>
              <div className="text-sm font-bold text-slate-200">
                {calculatedHealth >= 80 ? 'HEALTHY OPERATING ASSET' : calculatedHealth >= 60 ? 'DEGRADED WARNING' : 'CRITICAL ASSET ALERT'}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Calculated dynamically according to design weights.
              </p>
            </div>
          </div>

          <div className="space-y-1.5 text-xs text-slate-400 pt-4 border-t border-slate-800">
            <div className="flex justify-between">
              <span>(0.30 × {sliderConn}):</span>
              <span className="font-mono text-white">{(0.30 * sliderConn).toFixed(1)}</span>
            </div>
            <div className="flex justify-between">
              <span>(0.20 × {sliderUptime}):</span>
              <span className="font-mono text-white">{(0.20 * sliderUptime).toFixed(1)}</span>
            </div>
            <div className="flex justify-between">
              <span>(0.20 × {sliderHeartbeat}):</span>
              <span className="font-mono text-white">{(0.20 * sliderHeartbeat).toFixed(1)}</span>
            </div>
            <div className="flex justify-between">
              <span>(0.15 × {sliderMaint}):</span>
              <span className="font-mono text-white">{(0.15 * sliderMaint).toFixed(1)}</span>
            </div>
            <div className="flex justify-between">
              <span>(0.15 × {sliderFailures}):</span>
              <span className="font-mono text-white">{(0.15 * sliderFailures).toFixed(1)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Critical Aging Watchlist (9+ Years) */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Clock className="w-4 h-4 text-rose-400" />
              <span>Critical Aging Watchlist (9+ Years / EOL Replacement Candidates)</span>
              <span className="text-xs bg-rose-950 text-rose-300 border border-rose-800 px-2 py-0.5 rounded font-mono">
                {criticalAgingCams.length} Units Flagged
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Cameras operating past standard 8-year hardware depreciation threshold with degraded optical MTBF.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {criticalAgingCams.slice(0, 6).map(cam => (
            <div
              key={cam.id}
              className="bg-slate-950 border border-rose-900/40 hover:border-rose-700/80 rounded-lg p-3 space-y-2 transition shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-rose-300 text-xs">{cam.global_id}</span>
                <span className="text-[10px] bg-rose-950 text-rose-400 px-1.5 py-0.2 rounded font-bold">
                  {cam.age_years} Years
                </span>
              </div>
              <p className="text-xs text-slate-300 truncate" title={cam.landmark}>{cam.landmark}</p>
              <div className="flex justify-between text-[11px] text-slate-400 border-t border-slate-900 pt-1.5">
                <span>{cam.district} ({String(cam.department || '').split('/')[0].trim()})</span>
                <span className="text-amber-400 font-medium">Health: {cam.health_score}%</span>
              </div>
              <button
                onClick={() => onSelectCamera(cam)}
                className="w-full mt-1 bg-slate-900 hover:bg-slate-800 text-slate-200 text-[11px] py-1 rounded transition border border-slate-700 flex items-center justify-center space-x-1 cursor-pointer"
              >
                <span>Inspect Digital Twin</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
