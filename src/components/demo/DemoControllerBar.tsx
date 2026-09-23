import React, { useState } from 'react';
import { DemoControllerState, DemoStep } from '../../types/demoRecorder';
import {
  Play,
  Pause,
  RotateCcw,
  Square,
  SkipForward,
  SkipBack,
  Gauge,
  Tv,
  Radio,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Volume2,
} from 'lucide-react';

interface DemoControllerBarProps {
  state: DemoControllerState;
  currentStep: DemoStep;
  onPlay: () => void;
  onPause: () => void;
  onRestart: () => void;
  onStop: () => void;
  onNextStep: () => void;
  onPrevStep: () => void;
  onChangeSpeed: (speed: number) => void;
}

export const DemoControllerBar: React.FC<DemoControllerBarProps> = ({
  state,
  currentStep,
  onPlay,
  onPause,
  onRestart,
  onStop,
  onNextStep,
  onPrevStep,
  onChangeSpeed,
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const progressPercent = Math.round(((currentStep.stepNumber - 1) / state.totalSteps) * 100);

  return (
    <div
      id="demo-controller-hud"
      className="fixed bottom-3 left-1/2 -translate-x-1/2 z-[9980] w-[96%] max-w-5xl transition-all duration-300 pointer-events-auto"
    >
      <div className="bg-slate-950/95 backdrop-blur-xl border-2 border-cyan-500/50 rounded-2xl shadow-2xl shadow-cyan-950/80 overflow-hidden text-slate-100">
        {/* Top Progress Bar Line */}
        <div className="w-full bg-slate-800 h-1.5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(2, progressPercent))}%` }}
          />
        </div>

        {/* HUD Content */}
        <div className="px-4 py-2.5 sm:px-6 sm:py-3">
          {/* Header Row: Badges, Step Number, Timer, and Controls */}
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            {/* Left Badges */}
            <div className="flex items-center space-x-2.5">
              {/* Record / Rehearsal Status Pill */}
              {state.mode === 'RECORD' ? (
                <div className="flex items-center space-x-1.5 bg-rose-950/90 text-rose-300 border border-rose-600 px-2.5 py-1 rounded-full text-xs font-mono font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                  <span>REC</span>
                  <span className="text-white font-mono">{formatTime(state.elapsedSeconds)}</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1.5 bg-cyan-950/90 text-cyan-300 border border-cyan-600 px-2.5 py-1 rounded-full text-xs font-mono font-bold">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span>REHEARSAL</span>
                  <span className="text-white font-mono">{formatTime(state.elapsedSeconds)}</span>
                </div>
              )}

              {/* Model Pill */}
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded font-mono ${
                  currentStep.model === 'model1'
                    ? 'bg-blue-900/80 text-blue-300 border border-blue-700'
                    : 'bg-emerald-900/80 text-emerald-300 border border-emerald-700'
                }`}
              >
                {currentStep.model === 'model1' ? 'MODEL 1: ASSET REGISTRY' : 'MODEL 2: UNIFIED OPS'}
              </span>

              {/* Step Counter */}
              <div className="hidden sm:flex items-center space-x-1 text-xs text-slate-300 font-mono">
                <span className="text-cyan-400 font-bold">
                  STEP {String(currentStep.stepNumber).padStart(2, '0')}
                </span>
                <span className="text-slate-500">/</span>
                <span>{state.totalSteps}</span>
              </div>
            </div>

            {/* Middle Feature Name */}
            <div className="hidden md:block text-center flex-1 mx-2">
              <div className="text-xs font-bold text-white truncate max-w-md mx-auto">
                {currentStep.title}
              </div>
              <div className="text-[10px] text-cyan-300/90 truncate font-mono">
                {currentStep.featureName}
              </div>
            </div>

            {/* Right Playback Action Buttons */}
            <div className="flex items-center space-x-1.5">
              {/* Prev */}
              <button
                onClick={onPrevStep}
                disabled={currentStep.stepNumber <= 1}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition"
                title="Previous step"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              {/* Play / Pause */}
              {state.status === 'RUNNING' ? (
                <button
                  onClick={onPause}
                  className="bg-amber-600 hover:bg-amber-500 text-white p-2 rounded-xl font-bold shadow-md cursor-pointer transition flex items-center space-x-1"
                  title="Pause sequence"
                >
                  <Pause className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={onPlay}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white p-2 rounded-xl font-bold shadow-md cursor-pointer transition flex items-center space-x-1"
                  title="Resume sequence"
                >
                  <Play className="w-4 h-4 fill-current" />
                </button>
              )}

              {/* Next */}
              <button
                onClick={onNextStep}
                disabled={currentStep.stepNumber >= state.totalSteps}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition"
                title="Next step"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              {/* Restart */}
              <button
                onClick={onRestart}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer transition"
                title="Restart demo from beginning"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Speed Switcher */}
              <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-[11px] font-mono">
                {[1, 1.5, 2].map(s => (
                  <button
                    key={s}
                    onClick={() => onChangeSpeed(s)}
                    className={`px-1.5 py-0.5 rounded cursor-pointer transition ${
                      state.speed === s ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>

              {/* Stop Button */}
              <button
                onClick={onStop}
                className="flex items-center space-x-1 bg-rose-900/80 hover:bg-rose-800 text-rose-200 border border-rose-700 px-2.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition"
                title="Stop demo & finalize recording"
              >
                <Square className="w-3.5 h-3.5 fill-current text-rose-400" />
                <span className="hidden sm:inline">Stop</span>
              </button>

              {/* Collapse/Expand */}
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 cursor-pointer"
                title={isCollapsed ? 'Expand teleprompter' : 'Collapse teleprompter'}
              >
                {isCollapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Collapsible Teleprompter Narration Bar */}
          {!isCollapsed && (
            <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-start space-x-2.5">
              <div className="w-5 h-5 rounded-md bg-cyan-950 border border-cyan-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Volume2 className="w-3 h-3 text-cyan-400 animate-pulse" />
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                {currentStep.narration}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
