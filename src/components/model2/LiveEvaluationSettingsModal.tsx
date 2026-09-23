import React, { useState } from 'react';
import { LiveEvaluationConfig } from '../../types';
import {
  Radio,
  Server,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  X,
  ExternalLink,
  Terminal,
  Shield,
  Layers,
  Cpu,
  Tv,
} from 'lucide-react';

interface LiveEvaluationSettingsModalProps {
  config: LiveEvaluationConfig;
  isOpen: boolean;
  onClose: () => void;
  onUpdateConfig: (newHost: string, newMode: 'DEMO' | 'LIVE') => Promise<void>;
  onTriggerDiscovery: () => Promise<any>;
}

export const LiveEvaluationSettingsModal: React.FC<LiveEvaluationSettingsModalProps> = ({
  config,
  isOpen,
  onClose,
  onUpdateConfig,
  onTriggerDiscovery,
}) => {
  if (!isOpen) return null;

  const [hostInput, setHostInput] = useState<string>(config.sentinel_host || '');
  const [selectedMode, setSelectedMode] = useState<'DEMO' | 'LIVE'>(config.mode || 'DEMO');
  const [isDiscovering, setIsDiscovering] = useState<boolean>(false);
  const [discoveryFeedback, setDiscoveryFeedback] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const presets = [
    { label: 'Local Sentinel Node', host: '127.0.0.1:8080', desc: 'Default local evaluation edge proxy' },
    { label: 'Clear Host (Mock Demo Mode)', host: '', desc: 'Run offline synthetic demo mode without host dependency' },
    { label: 'Gateway VLAN 10.0.2.15', host: '10.0.2.15:8080', desc: 'Secure CCTV control network segment' },
    { label: 'State Command Hub', host: 'sentinel.gujarat-cctv.local:8080', desc: 'Statewide unified edge ingest WAN' },
  ];

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const cleanHost = hostInput.trim();
      const modeToSave: 'DEMO' | 'LIVE' = cleanHost ? selectedMode : 'DEMO';
      await onUpdateConfig(cleanHost, modeToSave);
      onClose();
    } catch (err: any) {
      alert(`Failed to update config: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRunDiscovery = async () => {
    setIsDiscovering(true);
    setDiscoveryFeedback(null);
    try {
      const cleanHost = hostInput.trim();
      const modeToSave: 'DEMO' | 'LIVE' = cleanHost ? 'LIVE' : 'DEMO';
      setSelectedMode(modeToSave);
      await onUpdateConfig(cleanHost, modeToSave);

      const res = await onTriggerDiscovery();
      if (res && res.discoveredCount !== undefined) {
        setDiscoveryFeedback(
          cleanHost
            ? `Discovered ${res.discoveredCount} streams from ${res.source}. Loaded dynamically from http://${cleanHost}/api/ingest.`
            : `Active in Mock/Synthetic Demo Mode with ${res.discoveredCount} synthetic streams. No Sentinel host required.`
        );
      } else {
        setDiscoveryFeedback('Discovery query executed. Catalogue updated.');
      }
    } catch (err: any) {
      setDiscoveryFeedback(`Discovery status: ${err.message}`);
    } finally {
      setIsDiscovering(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white uppercase tracking-tight">
                  Sentinel Gateway & Ingest Configuration
                </h3>
                <span className="bg-cyan-950 text-cyan-300 border border-cyan-700/60 text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                  MODEL 2 LIVE ENGINE
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Dynamic camera catalogue discovery, RTSP TCP transport & WebRTC/HLS live preview
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg cursor-pointer transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Mode Switcher */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Operational Surveillance Mode:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedMode('DEMO')}
                className={`p-3 rounded-xl border text-left cursor-pointer transition flex flex-col justify-between ${
                  selectedMode === 'DEMO'
                    ? 'bg-blue-950/60 border-blue-500 text-white shadow-lg shadow-blue-950/50'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-blue-300">DEMO MODE</span>
                  {selectedMode === 'DEMO' && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                </div>
                <p className="text-[11px] text-slate-400">
                  Mock/Synthetic Demo Mode. Does NOT require SENTINEL_HOST. Uses high-fidelity local synthetic CCTV data.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMode('LIVE')}
                className={`p-3 rounded-xl border text-left cursor-pointer transition flex flex-col justify-between ${
                  selectedMode === 'LIVE'
                    ? 'bg-cyan-950/60 border-cyan-500 text-white shadow-lg shadow-cyan-950/50'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-cyan-300">LIVE EVALUATION MODE</span>
                  {selectedMode === 'LIVE' && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                </div>
                <p className="text-[11px] text-slate-400">
                  Requires SENTINEL_HOST. Loads cameras from http://&lt;SENTINEL_HOST&gt;/api/ingest & mounts live streams.
                </p>
              </button>
            </div>
          </div>

          {/* Configurable SENTINEL_HOST */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
                <Radio className="w-4 h-4 text-cyan-400" />
                <span>Configurable Sentinel Host (&lt;SENTINEL_HOST&gt;):</span>
              </label>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/70 border border-emerald-800/80 px-2 py-0.5 rounded">
                Optional for Demo Mode
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 text-xs font-mono">
                  http://
                </div>
                <input
                  type="text"
                  value={hostInput}
                  onChange={e => setHostInput(e.target.value)}
                  placeholder="Optional in Demo Mode (e.g. 10.0.1.50:8080 or domain:port)"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-16 pr-4 py-2.5 text-xs sm:text-sm font-mono text-white focus:outline-none focus:border-cyan-500 transition"
                />
              </div>

              <button
                type="button"
                onClick={handleRunDiscovery}
                disabled={isDiscovering}
                className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-1.5 transition cursor-pointer shrink-0 shadow-lg shadow-cyan-600/30"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isDiscovering ? 'animate-spin' : ''}`} />
                <span>{isDiscovering ? 'Ingesting...' : 'Test & Discover'}</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-400">
              If omitted, system uses <strong className="text-amber-300">Mock/Synthetic Demo Mode</strong>. If provided, enables <strong className="text-cyan-300">LIVE EVALUATION MODE</strong> and loads cameras from <code className="text-cyan-300 font-mono">http://&lt;SENTINEL_HOST&gt;/api/ingest</code>.
            </p>

            {/* Presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-slate-400 mr-1 font-medium">Quick Presets:</span>
              {presets.map(p => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setHostInput(p.host)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-mono transition cursor-pointer border ${
                    hostInput === p.host
                      ? 'bg-cyan-950 text-cyan-300 border-cyan-600 font-bold'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                  title={p.desc}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {discoveryFeedback && (
              <div className="p-3 bg-slate-950 border border-cyan-800/80 rounded-xl text-xs font-mono text-cyan-300 flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>{discoveryFeedback}</span>
              </div>
            )}
          </div>

          {/* Current Ingest & Architecture Specs */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono space-y-2">
            <div className="text-slate-400 uppercase text-[10px] font-bold tracking-wider">
              Target Ingestion Architecture
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300 text-[11px]">
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Catalogue Discovery:</span>
                <span className="text-cyan-300 font-bold">
                  {hostInput.trim() ? `GET http://${hostInput.trim()}/api/ingest` : 'Mock/Synthetic Demo Mode (No Host)'}
                </span>
              </div>
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Model 1 Authority Key:</span>
                <span className="text-emerald-400 font-bold">global_camera_id</span>
              </div>
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <span className="text-slate-500 block text-[10px]">RTSP Inference (Forced TCP):</span>
                <span className="text-amber-300">
                  {hostInput.trim() ? `rtsp://${hostInput.trim().split(':')[0]}:8554/stream/<id>` : 'rtsp://127.0.0.1:8554/stream/<id> (Mock)'}
                </span>
              </div>
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <span className="text-slate-500 block text-[10px]">WebRTC WHEP Egress:</span>
                <span className="text-cyan-300">
                  {hostInput.trim() ? `http://${hostInput.trim().split(':')[0]}:8889/stream/<id>/whep` : 'http://127.0.0.1:8889/stream/<id>/whep (Mock)'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 font-mono">
            <span>Status: </span>
            <span className={config.is_connected ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
              {config.is_connected ? 'Sentinel Connected' : 'Ready for Ingest Handshake'}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium cursor-pointer transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-cyan-600/30 transition cursor-pointer"
            >
              {isSaving ? 'Applying...' : 'Save Configuration'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
