import React from 'react';
import { ShieldCheck, Tv, Database, Download, RotateCcw, CheckCircle2, Award, Sparkles } from 'lucide-react';

interface DemoEndCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestartDemo: () => void;
  onDownloadRecording?: () => void;
  hasRecording: boolean;
  durationSeconds: number;
}

export const DemoEndCardModal: React.FC<DemoEndCardModalProps> = ({
  isOpen,
  onClose,
  onRestartDemo,
  onDownloadRecording,
  hasRecording,
  durationSeconds,
}) => {
  if (!isOpen) return null;

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div
      id="demo-end-card-overlay"
      className="fixed inset-0 z-[9990] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      <div className="max-w-3xl w-full bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-2 border-cyan-500/40 rounded-3xl p-8 sm:p-12 shadow-2xl relative text-center">
        {/* Glowing Ambient Halo */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
          <span className="bg-blue-950/80 text-blue-300 border border-blue-700/60 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider flex items-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>GUJARAT STATE SURVEILLANCE COMMAND</span>
          </span>
          <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider flex items-center space-x-1.5">
            <Award className="w-3.5 h-3.5 text-emerald-400" />
            <span>HACKATHON GRAND FINALE</span>
          </span>
        </div>

        {/* Main Title */}
        <div className="space-y-2 mb-6">
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight uppercase">
            DRISHTI-NEXUS
          </h1>
          <div className="inline-block bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 border border-cyan-500/40 rounded-xl px-4 py-1.5 mt-2">
            <span className="text-cyan-300 font-extrabold text-sm sm:text-base tracking-wider uppercase">
              MODEL 1 + MODEL 2 UNIFIED PLATFORM
            </span>
          </div>
          <p className="text-lg sm:text-xl text-slate-300 italic font-medium pt-3">
            “From Camera Registry to Investigation Intelligence”
          </p>
        </div>

        {/* Core Architecture Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left my-8">
          <div className="bg-slate-900/90 border border-blue-900/60 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center space-x-2 text-blue-400 font-bold text-sm mb-2">
              <Database className="w-4 h-4" />
              <span>MODEL 1: ASSET INTELLIGENCE</span>
            </div>
            <ul className="text-xs text-slate-300 space-y-1.5">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                <span>500+ Verified Master Registry Assets</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                <span>Statewide GIS Geospatial Digital Twin</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                <span>Multi-Department Conflict & Debt Resolution</span>
              </li>
            </ul>
          </div>

          <div className="bg-slate-900/90 border border-cyan-900/60 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center space-x-2 text-cyan-400 font-bold text-sm mb-2">
              <Tv className="w-4 h-4" />
              <span>MODEL 2: UNIFIED OPERATIONS</span>
            </div>
            <ul className="text-xs text-slate-300 space-y-1.5">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                <span>2x2 Sub-Second WebRTC/WHEP Video Wall</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                <span>Statewide ANPR & Cross-Camera Journey</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                <span>Real-time AI Alerts & Evidence Dossiers</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Team Credits */}
        <div className="border-t border-slate-800 pt-6 pb-6">
          <div className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-1">
            ENGINEERED & PRESENTED BY
          </div>
          <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-300 to-indigo-400 tracking-wider">
            TEAM APEX
          </div>
          <div className="text-xs text-slate-500 mt-1 font-mono">
            Elapsed Demo Run: {formatDuration(durationSeconds)}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {hasRecording && onDownloadRecording && (
            <button
              onClick={onDownloadRecording}
              className="flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black px-6 py-3 rounded-xl shadow-lg shadow-cyan-500/30 text-sm cursor-pointer transition transform hover:scale-105"
            >
              <Download className="w-4 h-4 text-slate-950" />
              <span>DOWNLOAD DEMO RECORDING (.WEBM)</span>
            </button>
          )}

          <button
            onClick={onRestartDemo}
            className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-4 py-3 rounded-xl border border-slate-700 text-sm cursor-pointer transition"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Replay Sequence</span>
          </button>

          <button
            onClick={onClose}
            className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold px-4 py-3 rounded-xl border border-slate-800 text-sm cursor-pointer transition"
          >
            <span>Return to App</span>
          </button>
        </div>
      </div>
    </div>
  );
};
