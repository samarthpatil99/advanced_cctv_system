import { useState, useEffect, useRef, useCallback } from 'react';
import {
  DemoControllerState,
  DemoStep,
  DemoMode,
  RecordedVideoData,
  VirtualCursorState,
  RecordingLaunchResult,
} from '../types/demoRecorder';
import { DEMO_STEPS, DEMO_PREDEFINED_DATA } from '../utils/demoScript';
import { Camera, EvaluationMode } from '../types';

interface UseDemoControllerProps {
  cameras: Camera[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  setSelectedCamera: (cam: Camera | null) => void;
  evaluationMode: EvaluationMode;
  setEvaluationMode: (mode: EvaluationMode) => Promise<void> | void;
  onInjectFault?: (streamId: string, fault: any) => Promise<any> | void;
}

export function useDemoController({
  cameras,
  activeTab,
  setActiveTab,
  setSelectedCamera,
  evaluationMode,
  setEvaluationMode,
  onInjectFault,
}: UseDemoControllerProps) {
  // State Machine State
  const [state, setState] = useState<DemoControllerState>({
    status: 'IDLE',
    mode: 'REHEARSAL',
    currentStepIndex: 0,
    totalSteps: DEMO_STEPS.length,
    elapsedSeconds: 0,
    speed: 1,
    failedStepIndex: null,
    error: null,
  });

  // Virtual Cursor State
  const [cursor, setCursor] = useState<VirtualCursorState>({
    x: typeof window !== 'undefined' ? window.innerWidth / 2 : 500,
    y: typeof window !== 'undefined' ? window.innerHeight / 2 : 300,
    visible: false,
    clicking: false,
    label: 'AUTOPILOT',
  });

  // Recorded Video & Modals
  const [recordedVideo, setRecordedVideo] = useState<RecordedVideoData | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState<boolean>(false);
  const [isEndCardOpen, setIsEndCardOpen] = useState<boolean>(false);

  // Browser Screen Recording references
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingStartTimeRef = useRef<number>(0);

  // Autopilot loop timer refs
  const stepTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const elapsedTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isExecutingRef = useRef<boolean>(false);

  // Check MediaRecorder & getDisplayMedia browser support
  const isSupported =
    typeof window !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices &&
    typeof navigator.mediaDevices.getDisplayMedia === 'function' &&
    typeof window.MediaRecorder === 'function';

  const currentStep: DemoStep = DEMO_STEPS[state.currentStepIndex] || DEMO_STEPS[0];

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (stepTimeoutRef.current) clearTimeout(stepTimeoutRef.current);
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
      stopMediaRecording();
    };
  }, []);

  // Elapsed time tracker when demo is RUNNING
  useEffect(() => {
    if (state.status === 'RUNNING') {
      elapsedTimerRef.current = setInterval(() => {
        setState(prev => ({ ...prev, elapsedSeconds: prev.elapsedSeconds + 1 }));
      }, 1000);
    } else {
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
    }
    return () => {
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
    };
  }, [state.status]);

  // Helper: animate virtual cursor to a DOM element or coordinate
  const moveCursorTo = useCallback((x: number, y: number, label = 'AUTOPILOT') => {
    setCursor(prev => ({
      ...prev,
      x,
      y,
      visible: true,
      label,
    }));
  }, []);

  const triggerCursorClick = useCallback((x: number, y: number, label?: string) => {
    setCursor(prev => ({
      ...prev,
      x,
      y,
      visible: true,
      clicking: true,
      label: label || prev.label,
    }));
    setTimeout(() => {
      setCursor(prev => ({ ...prev, clicking: false }));
    }, 450);
  }, []);

  const moveCursorToElement = useCallback((selector: string, label?: string) => {
    const el = document.querySelector(selector);
    if (el) {
      const rect = el.getBoundingClientRect();
      const targetX = rect.left + rect.width / 2;
      const targetY = rect.top + rect.height / 2;
      triggerCursorClick(targetX, targetY, label);
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      return true;
    }
    return false;
  }, [triggerCursorClick]);

  // Execute an individual step's side-effects
  const executeStepActions = useCallback(
    async (step: DemoStep) => {
      // 1. Switch Tab if needed
      if (step.targetTab && activeTab !== step.targetTab) {
        setActiveTab(step.targetTab);
      }

      // Short delay to allow component mount
      await new Promise(r => setTimeout(r, 400));

      // 2. Perform step-specific mock and DOM interactions
      switch (step.stepNumber) {
        case 1: // Title card / Command Center
          moveCursorTo(window.innerWidth / 2, 220, 'DRISHTI-NEXUS');
          break;

        case 4: { // Digital Twin Inspection
          const targetCam =
            cameras.find(c => c.global_id === DEMO_PREDEFINED_DATA.selectedCameraId) ||
            cameras[0] ||
            null;
          if (targetCam) {
            setSelectedCamera(targetCam);
          }
          break;
        }

        case 5: // Conflict Resolution
          setSelectedCamera(null);
          break;

        case 8: { // Sub-Second Video Wall
          // Spotlight Slot 1
          setTimeout(() => {
            moveCursorToElement('#video-tile-0', 'FEED 01');
          }, 800);
          break;
        }

        case 10: { // Switch to Live Evaluation Mode
          if (evaluationMode !== 'LIVE') {
            await setEvaluationMode('LIVE');
          }
          setTimeout(() => {
            moveCursorToElement('#live-mode-indicator', 'LIVE WHEP');
          }, 700);
          break;
        }

        case 11: { // WHEP Stream Inspection
          moveCursorToElement('#live-stream-player', 'WHEP 90kHz');
          break;
        }

        case 12: { // Fault Injection & Self-Healing
          if (onInjectFault) {
            try {
              onInjectFault('cam-surat-ring-01', {
                type: 'LATENCY_SPIKE',
                added_ms: 1200,
                duration_sec: 10,
              });
            } catch (err) {
              console.warn('Fault injection triggered via demo autopilot');
            }
          }
          break;
        }

        case 14: { // Evidence Context Card
          // Find Evidence Card button and click it
          setTimeout(() => {
            const btn = document.querySelector('#evidence-card-trigger-btn') as HTMLElement;
            if (btn) {
              const rect = btn.getBoundingClientRect();
              triggerCursorClick(rect.left + rect.width / 2, rect.top + rect.height / 2, 'EVIDENCE CARD');
              btn.click();
            }
          }, 700);
          break;
        }

        case 17: { // Cross-Camera Timeline
          moveCursorToElement('#cross-camera-trajectory', 'TRAJECTORY RECON');
          break;
        }

        case 18: { // Export Investigation Dossier
          setTimeout(() => {
            moveCursorToElement('#dossier-export-btn', 'EXPORT DOSSIER');
          }, 800);
          break;
        }

        case 21: { // Grand Finale End Card
          setIsEndCardOpen(true);
          setCursor(prev => ({ ...prev, visible: false }));
          break;
        }

        default:
          if (step.targetSelector) {
            setTimeout(() => {
              moveCursorToElement(step.targetSelector!, step.featureName);
            }, 600);
          }
          break;
      }
    },
    [activeTab, cameras, evaluationMode, moveCursorTo, moveCursorToElement, onInjectFault, setActiveTab, setEvaluationMode, setSelectedCamera, triggerCursorClick]
  );

  // Advance step runner
  const runStep = useCallback(
    async (stepIndex: number) => {
      if (stepIndex >= DEMO_STEPS.length) {
        // Demo completed
        setState(prev => ({ ...prev, status: 'COMPLETED' }));
        setIsEndCardOpen(true);
        if (state.mode === 'RECORD') {
          stopMediaRecording();
        }
        return;
      }

      const step = DEMO_STEPS[stepIndex];
      setState(prev => ({
        ...prev,
        currentStepIndex: stepIndex,
        status: 'RUNNING',
      }));

      try {
        await executeStepActions(step);

        // Calculate dynamic step duration based on speed multiplier
        const duration = Math.max(3000, (step.durationMs || 10000) / state.speed);

        if (stepTimeoutRef.current) clearTimeout(stepTimeoutRef.current);

        stepTimeoutRef.current = setTimeout(() => {
          runStep(stepIndex + 1);
        }, duration);
      } catch (err: any) {
        console.error('Demo step failed:', err);
        setState(prev => ({
          ...prev,
          status: 'FAILED',
          failedStepIndex: stepIndex,
          error: err?.message || 'Error occurred during automated step execution',
        }));
      }
    },
    [executeStepActions, state.mode, state.speed]
  );

  // MediaRecorder Start
  const startMediaRecording = async (): Promise<RecordingLaunchResult> => {
    if (!isSupported) {
      console.warn('Screen recording not supported in this browser environment');
      return {
        success: false,
        error: 'Screen recording is not supported in this browser environment.',
        errorType: 'NOT_SUPPORTED',
      };
    }

    const isInIframe = typeof window !== 'undefined' && window.self !== window.top;

    try {
      // Prompt screen selection from user with clean options
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });

      mediaStreamRef.current = stream;
      recordedChunksRef.current = [];
      recordingStartTimeRef.current = Date.now();

      // Pick supported mime type
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
        ? 'video/webm;codecs=vp9,opus'
        : MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')
        ? 'video/webm;codecs=vp8,opus'
        : 'video/webm';

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = event => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const durationSec = Math.round((Date.now() - recordingStartTimeRef.current) / 1000);

        setRecordedVideo({
          url,
          blob,
          durationSeconds: durationSec,
          sizeBytes: blob.size,
          timestamp: new Date().toISOString(),
        });
        setIsVideoModalOpen(true);
      };

      // Handle user stopping stream from browser UI
      stream.getVideoTracks()[0].onended = () => {
        stopDemo();
      };

      recorder.start(1000); // 1-second chunks
      return { success: true };
    } catch (err: any) {
      console.warn('Screen recording error / permission not granted:', err);

      const errMessage = err?.message || '';
      const errName = err?.name || '';
      const isPolicyOrSecurity =
        errName === 'SecurityError' ||
        errMessage.toLowerCase().includes('permission') ||
        errMessage.toLowerCase().includes('policy') ||
        errMessage.toLowerCase().includes('disallowed') ||
        (isInIframe && errName === 'NotAllowedError');

      if (isInIframe || isPolicyOrSecurity) {
        return {
          success: false,
          error:
            'The browser blocked the screen capture permission prompt because the app is running inside an embedded preview iFrame.',
          errorType: 'IFRAME_BLOCKED',
        };
      }

      if (errName === 'NotAllowedError') {
        return {
          success: false,
          error: 'Screen share selection was cancelled or permission was denied.',
          errorType: 'CANCELLED',
        };
      }

      return {
        success: false,
        error: errMessage || 'Failed to initialize screen recording.',
        errorType: 'UNKNOWN',
      };
    }
  };

  const stopMediaRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        console.warn('Error stopping media recorder:', e);
      }
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
  };

  // Controller Actions
  const startRecordingAndDemo = async (): Promise<RecordingLaunchResult> => {
    const launchResult = await startMediaRecording();
    if (!launchResult.success) {
      return launchResult;
    }

    setState(prev => ({
      ...prev,
      mode: 'RECORD',
      currentStepIndex: 0,
      elapsedSeconds: 0,
      status: 'RUNNING',
      failedStepIndex: null,
      error: null,
    }));
    runStep(0);
    return { success: true };
  };

  const startRehearsal = () => {
    setState(prev => ({
      ...prev,
      mode: 'REHEARSAL',
      currentStepIndex: 0,
      elapsedSeconds: 0,
      status: 'RUNNING',
      failedStepIndex: null,
      error: null,
    }));
    runStep(0);
  };

  const pauseDemo = () => {
    if (stepTimeoutRef.current) clearTimeout(stepTimeoutRef.current);
    setState(prev => ({ ...prev, status: 'PAUSED' }));
  };

  const resumeDemo = () => {
    setState(prev => ({ ...prev, status: 'RUNNING' }));
    runStep(state.currentStepIndex);
  };

  const stopDemo = () => {
    if (stepTimeoutRef.current) clearTimeout(stepTimeoutRef.current);
    setCursor(prev => ({ ...prev, visible: false }));
    setState(prev => ({ ...prev, status: 'IDLE' }));
    stopMediaRecording();
  };

  const restartDemo = () => {
    if (stepTimeoutRef.current) clearTimeout(stepTimeoutRef.current);
    setIsEndCardOpen(false);
    setState(prev => ({
      ...prev,
      currentStepIndex: 0,
      elapsedSeconds: 0,
      status: 'RUNNING',
    }));
    runStep(0);
  };

  const nextStep = () => {
    if (stepTimeoutRef.current) clearTimeout(stepTimeoutRef.current);
    const nextIdx = Math.min(DEMO_STEPS.length - 1, state.currentStepIndex + 1);
    runStep(nextIdx);
  };

  const prevStep = () => {
    if (stepTimeoutRef.current) clearTimeout(stepTimeoutRef.current);
    const prevIdx = Math.max(0, state.currentStepIndex - 1);
    runStep(prevIdx);
  };

  const setSpeed = (speed: number) => {
    setState(prev => ({ ...prev, speed }));
  };

  const downloadRecording = () => {
    if (!recordedVideo) return;
    const a = document.createElement('a');
    a.href = recordedVideo.url;
    a.download = `drishti-nexus-hackathon-demo-${new Date().toISOString().slice(0, 10)}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return {
    state,
    currentStep,
    cursor,
    recordedVideo,
    isSupported,
    isRecording: state.status === 'RUNNING' && state.mode === 'RECORD',
    isRehearsing: state.status === 'RUNNING' && state.mode === 'REHEARSAL',
    isVideoModalOpen,
    isEndCardOpen,
    closeVideoModal: () => setIsVideoModalOpen(false),
    closeEndCard: () => setIsEndCardOpen(false),
    startRecordingAndDemo,
    startRehearsal,
    pause: pauseDemo,
    resume: resumeDemo,
    stop: stopDemo,
    restart: restartDemo,
    nextStep,
    prevStep,
    setSpeed,
    downloadRecording,
  };
}
