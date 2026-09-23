export type DemoMode = 'RECORD' | 'REHEARSAL';

export type DemoStatus = 'IDLE' | 'COUNTDOWN' | 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'FAILED';

export interface VirtualCursorState {
  x: number;
  y: number;
  visible: boolean;
  clicking: boolean;
  label?: string;
}

export interface DemoStep {
  stepNumber: number; // 1 to 21
  code: string;
  title: string;
  featureName: string;
  narration: string;
  model: 'model1' | 'model2';
  targetTab: string;
  targetSelector?: string;
  durationMs: number; // base duration in milliseconds at 1x speed
}

export interface DemoControllerState {
  status: DemoStatus;
  mode: DemoMode;
  currentStepIndex: number;
  elapsedSeconds: number;
  totalSteps: number;
  speed: number; // 1, 1.25, 1.5, 2
  failedStepIndex?: number | null;
  error?: string | null;
  cursorPosition?: { x: number; y: number; visible: boolean; clicking: boolean };
}

export interface RecordedVideoData {
  blob: Blob;
  url: string;
  sizeBytes: number;
  durationSeconds: number;
  mimeType?: string;
  timestamp: string;
}

export type RecordingErrorType = 'IFRAME_BLOCKED' | 'PERMISSION_DENIED' | 'NOT_SUPPORTED' | 'CANCELLED' | 'UNKNOWN';

export interface RecordingLaunchResult {
  success: boolean;
  error?: string;
  errorType?: RecordingErrorType;
}
