import React, { useState } from 'react';
import {
  Video,
  Play,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  X,
  Film,
  ExternalLink,
  AlertTriangle,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { RecordingLaunchResult } from '../../types/demoRecorder';

interface RecordDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartRecordingAndDemo: () => Promise<RecordingLaunchResult>;
  onStartRehearsal: () => void;
  isSupported: boolean;
  totalSteps: number;
}

export const RecordDemoModal: React.FC<RecordDemoModalProps> = ({
  isOpen,
  onClose,
  onStartRecordingAndDemo,
  onStartRehearsal,
  isSupported,
  totalSteps,
}) => {
  const [isRequesting, setIsRequesting] = useState<boolean>(false);
  const [launchError, setLaunchError] = useState<{
    message: string;
    isIframeBlocked: boolean;
  } | null>(null);

  if (!isOpen) return null;

  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;

  const handleStartRecording = async () => {
    setIsRequesting(true);
    setLaunchError(null);

    try {
      const result = await onStartRecordingAndDemo();
      if (result.success) {
        onClose();
      } else {
        setLaunchError({
          message:
            result.error ||
            'The browser did not display the screen capture permission prompt. This commonly occurs inside embedded preview frames.',
          isIframeBlocked: result.errorType === 'IFRAME_BLOCKED' || isInIframe,
        });
      }
    } catch (err: any) {
      setLaunchError({
        message: err?.message || 'Screen capture permission failed or was blocked by the browser.',
        isIframeBlocked: isInIframe,
      });
    } finally {
      setIsRequesting(false);
    }
  };

  const handleOpenInNewTab = () => {
    if (typeof window !== 'undefined') {
      window.open(window.location.href, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      id="record-demo-modal-overlay"
      className="fixed inset-0 z-[9990] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      <div className="max-w-2xl w-full bg-slate-900 border-2 border-cyan-500/50 rounded-3xl shadow-2xl shadow-cyan-950/80 overflow-hidden flex flex-col text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-950 border-b border-slate-800 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-600 to-red-800 border border-rose-500/60 flex items-center justify-center shadow-lg shadow-rose-900/50">
              <Video className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-white font-black text-lg sm:text-xl tracking-tight">
                  Automated Hackathon Demo Recorder
                </h2>
                <span className="bg-rose-950 text-rose-300 border border-rose-700/80 text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase">
                  AUTOPILOT
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Record a broadcast-ready video presentation of DRISHTI-NEXUS Model 1 + Model 2.
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

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Permission Blocked Alert */}
          {launchError && (
            <div className="bg-rose-950/90 border-2 border-rose-500/80 rounded-2xl p-4 text-xs text-rose-100 space-y-3 shadow-xl">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <strong className="text-white font-bold text-sm block">
                    Browser Permission Prompt Blocked by iFrame Policy
                  </strong>
                  <p className="text-rose-200 leading-relaxed">
                    By browser security policy (W3C), Google Chrome and Chromium browsers forbid screen capture permission prompts inside embedded preview frames.
                  </p>
                </div>
              </div>

              <div className="bg-slate-950/80 border border-rose-900/60 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-white font-bold block text-xs">Solution 1: Open in Standalone Tab</span>
                  <span className="text-[11px] text-slate-400">Opens the app in a full browser tab where the screen recording prompt works natively.</span>
                </div>
                <button
                  onClick={handleOpenInNewTab}
                  className="flex items-center space-x-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold px-3.5 py-1.5 rounded-lg text-xs shadow-md transition cursor-pointer"
                >
                  <span>Open in Standalone Tab</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="bg-slate-950/80 border border-rose-900/60 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-white font-bold block text-xs">Solution 2: Run Autopilot Rehearsal</span>
                  <span className="text-[11px] text-slate-400">Plays all 21 automated steps, camera switching, cursor animations, & teleprompter right here with no permissions required.</span>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onStartRehearsal();
                  }}
                  className="flex items-center space-x-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-3.5 py-1.5 rounded-lg text-xs shadow-md transition cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Start Rehearsal Now</span>
                </button>
              </div>
            </div>
          )}

          {/* Embedded iFrame Notice if not yet errored */}
          {!launchError && isInIframe && (
            <div className="bg-amber-950/70 border border-amber-500/70 text-amber-200 p-4 rounded-2xl text-xs space-y-2.5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start space-x-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-amber-300 font-bold text-xs">
                      Live Preview iFrame Detected
                    </strong>
                    <p className="text-[11px] text-amber-200/90 mt-0.5 leading-relaxed">
                      Browsers enforce strict security that prevents screen recording permission prompts inside embedded preview iframes.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleOpenInNewTab}
                  className="flex-shrink-0 flex items-center space-x-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-3 py-1.5 rounded-xl text-xs shadow-md transition cursor-pointer"
                  title="Open app in a top-level tab where getDisplayMedia works natively"
                >
                  <span>Open in New Tab</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="text-[11px] text-amber-300/80 border-t border-amber-900/60 pt-2 flex items-center justify-between">
                <span>Want to record your screen? Open in a standalone tab.</span>
                <span>Want hands-free demonstration? Click <strong>"Rehearse Demo"</strong>.</span>
              </div>
            </div>
          )}

          {/* Browser Support Check */}
          {!isSupported && (
            <div className="bg-amber-950/80 border border-amber-800 text-amber-200 p-4 rounded-2xl text-xs flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Screen Capture API Notice:</strong> Screen recording requires a modern browser (Chrome, Edge, Firefox). You can still run the 21-step automated sequence in Rehearsal Mode without screen recording!
              </div>
            </div>
          )}

          {/* Value Prop Banner */}
          <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 sm:p-5">
            <h3 className="text-white font-bold text-sm flex items-center space-x-2 mb-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Broadcast-Grade Automated Presentation</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              When triggered, the Autopilot State Machine sequentially transitions through all{' '}
              <strong className="text-cyan-300">{totalSteps} directed steps</strong>, moves a presenter cursor, spotlights key infrastructure telemetry, demonstrates live sub-second WebRTC video, highlights ANPR hotlists, inspects standardized digital twins, and finalizes with a closing credits end-card.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 text-xs">
              <div className="flex items-center space-x-2 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Zero manual clicking required</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Instant WebM download upon completion</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Interactive HUD with pause/step controls</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Synchronized teleprompter narration</span>
              </div>
            </div>
          </div>

          {/* Workflow Notice */}
          <div className="bg-cyan-950/40 border border-cyan-800/50 rounded-2xl p-4 text-xs text-slate-300 space-y-1.5">
            <div className="font-bold text-cyan-300 flex items-center space-x-1.5">
              <Film className="w-4 h-4 text-cyan-400" />
              <span>How Screen Recording Works:</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-slate-400 text-[11px] leading-relaxed pl-1">
              <li>Click <strong>Start Recording & Run Demo</strong> below (or open in standalone tab).</li>
              <li>When the browser prompt appears, select <strong>"This Tab"</strong> or <strong>"Entire Screen"</strong>.</li>
              <li>The demo runs hands-free. When finished, preview and download your video!</li>
            </ol>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-950 border-t border-slate-800 px-6 py-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                onClose();
                onStartRehearsal();
              }}
              className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm cursor-pointer transition"
            >
              <Play className="w-4 h-4 text-cyan-400" />
              <span>Rehearse Demo (No Recording)</span>
            </button>

            {isInIframe && (
              <button
                onClick={handleOpenInNewTab}
                className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-700/60 font-bold px-3 py-2.5 rounded-xl text-xs cursor-pointer transition"
                title="Open in new tab to bypass iframe permissions restriction"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in New Tab</span>
              </button>
            )}
          </div>

          <button
            disabled={isRequesting}
            onClick={handleStartRecording}
            className={`flex items-center space-x-2 bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-red-500 text-white font-extrabold px-6 py-2.5 rounded-xl text-xs sm:text-sm shadow-xl shadow-rose-950/80 cursor-pointer transition transform hover:scale-105 border border-rose-500 ${
              isRequesting ? 'opacity-80 cursor-wait' : ''
            }`}
          >
            {isRequesting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
                <span>REQUESTING SCREEN PERMISSION...</span>
              </>
            ) : launchError ? (
              <>
                <RefreshCw className="w-4 h-4 mr-1" />
                <span>RETRY SCREEN RECORDING</span>
              </>
            ) : (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping mr-1" />
                <Video className="w-4 h-4" />
                <span>START RECORDING & RUN DEMO</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
