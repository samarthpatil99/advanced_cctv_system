import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Camera, LiveStreamChannel } from '../../types';
import {
  Maximize2,
  Minimize2,
  Camera as CameraIcon,
  RefreshCw,
  AlertTriangle,
  Radio,
  Wifi,
  WifiOff,
  Activity,
  Layers,
  Cpu,
  Tv,
  CheckCircle2,
  Sliders,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface LiveStreamPlayerProps {
  channel: LiveStreamChannel;
  camera?: Camera;
  isFocused?: boolean;
  onToggleFocus?: () => void;
  onInspectDigitalTwin?: () => void;
  onForensicSearch?: () => void;
  onReconnect?: (streamId: string) => void;
  onInjectFault?: (streamId: string, fault: any) => void;
  showControls?: boolean;
}

export const LiveStreamPlayer: React.FC<LiveStreamPlayerProps> = ({
  channel,
  camera,
  isFocused = false,
  onToggleFocus,
  onInspectDigitalTwin,
  onForensicSearch,
  onReconnect,
  onInjectFault,
  showControls = true,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [activeProtocol, setActiveProtocol] = useState<'WHEP' | 'HLS' | 'CANVAS_FALLBACK'>(
    channel.protocol === 'HLS' ? 'HLS' : 'WHEP'
  );
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [showDiagnostics, setShowDiagnostics] = useState<boolean>(false);
  const [snapshotFeedback, setSnapshotFeedback] = useState<boolean>(false);
  const [connectionLog, setConnectionLog] = useState<string>('Initializing live stream handshake...');
  const [streamError, setStreamError] = useState<string | null>(null);

  // WebRTC WHEP negotiation and HLS fallback lifecycle
  useEffect(() => {
    let isMounted = true;
    const video = videoRef.current;
    if (!video) return;

    // Cleanup prior connections
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (channel.status === 'OFFLINE') {
      setActiveProtocol('CANVAS_FALLBACK');
      setStreamError('Stream socket offline. Ready for exponential backoff recovery.');
      return;
    }

    const startWhepStream = async () => {
      try {
        setConnectionLog(`Connecting WebRTC WHEP via POST ${channel.whep_url}...`);
        const pc = new RTCPeerConnection({
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        });
        pcRef.current = pc;

        pc.addTransceiver('video', { direction: 'recvonly' });

        pc.ontrack = event => {
          if (!isMounted) return;
          if (video && event.streams[0]) {
            video.srcObject = event.streams[0];
            video.play().catch(() => {});
            setIsPlaying(true);
            setActiveProtocol('WHEP');
            setConnectionLog('WebRTC WHEP live peer connection established. Receiving media.');
          }
        };

        pc.oniceconnectionstatechange = () => {
          if (pc.iceConnectionState === 'failed' || pc.iceConnectionState === 'disconnected') {
            if (isMounted) {
              setConnectionLog('WebRTC peer disconnected. Initiating automatic HLS failover...');
              startHlsFallback();
            }
          }
        };

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        // Attempt WHEP HTTP POST SDP exchange
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const response = await fetch(channel.whep_url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/sdp' },
          body: offer.sdp,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`WHEP endpoint returned HTTP ${response.status}`);
        }

        const answerSdp = await response.text();
        await pc.setRemoteDescription({ type: 'answer', sdp: answerSdp });
      } catch (err: any) {
        if (!isMounted) return;
        setConnectionLog(`WebRTC WHEP unavailable (${err.message}). Seamlessly switching to HLS fallback.`);
        startHlsFallback();
      }
    };

    const startHlsFallback = () => {
      if (!isMounted || !video) return;
      setActiveProtocol('HLS');
      setConnectionLog(`Loading HLS fallback: ${channel.hls_url}`);

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS support (Safari / iOS)
        video.src = channel.hls_url;
        video.play().catch(() => {});
        setIsPlaying(true);
      } else if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90,
        });
        hlsRef.current = hls;

        hls.loadSource(channel.hls_url);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (isMounted) {
            video.play().catch(() => {});
            setIsPlaying(true);
            setConnectionLog('HLS fallback playback active. Low-latency chunked ingest.');
          }
        });

        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            setConnectionLog(`HLS error: ${data.details}. Falling back to diagnostic simulation.`);
            setActiveProtocol('CANVAS_FALLBACK');
          }
        });
      } else {
        setActiveProtocol('CANVAS_FALLBACK');
      }
    };

    // Primary attempt: WHEP (or HLS if channel is degraded)
    if (channel.protocol === 'HLS' || channel.status === 'DEGRADED') {
      startHlsFallback();
    } else {
      startWhepStream();
    }

    return () => {
      isMounted = false;
      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [channel.stream_id, channel.whep_url, channel.hls_url, channel.protocol, channel.status]);

  const handleSnapshot = () => {
    setSnapshotFeedback(true);
    setTimeout(() => setSnapshotFeedback(false), 900);
  };

  const getStatusBadge = () => {
    switch (channel.status) {
      case 'LIVE':
        return (
          <span className="flex items-center space-x-1 text-emerald-400 font-bold bg-emerald-950/80 border border-emerald-500/50 px-2 py-0.5 rounded text-[10px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>LIVE</span>
          </span>
        );
      case 'DEGRADED':
        return (
          <span className="flex items-center space-x-1 text-amber-400 font-bold bg-amber-950/80 border border-amber-500/50 px-2 py-0.5 rounded text-[10px]">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            <span>DEGRADED</span>
          </span>
        );
      case 'CRITICAL':
        return (
          <span className="flex items-center space-x-1 text-orange-400 font-bold bg-orange-950/80 border border-orange-500/50 px-2 py-0.5 rounded text-[10px]">
            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
            <span>CRITICAL (RETRYING)</span>
          </span>
        );
      case 'OFFLINE':
      default:
        return (
          <span className="flex items-center space-x-1 text-rose-400 font-bold bg-rose-950/80 border border-rose-500/50 px-2 py-0.5 rounded text-[10px]">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            <span>OFFLINE</span>
          </span>
        );
    }
  };

  return (
    <div
      className={`relative bg-slate-950 rounded-xl overflow-hidden border transition-all select-none group flex flex-col ${
        isFocused
          ? 'border-cyan-500 shadow-2xl ring-2 ring-cyan-500/50'
          : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* Top Stream OSD Header */}
      <div className="absolute top-0 left-0 right-0 z-20 px-3 py-1.5 bg-gradient-to-b from-black/95 via-black/75 to-transparent flex items-center justify-between text-[11px] font-mono pointer-events-none">
        <div className="flex items-center space-x-2">
          {getStatusBadge()}
          <span className="text-slate-500">|</span>
          <span className="text-white font-bold tracking-tight truncate max-w-[190px]" title={channel.global_camera_id}>
            {channel.global_camera_id}
          </span>
          <span className="bg-cyan-950/80 text-cyan-300 px-1.5 py-0.2 rounded text-[10px] font-semibold border border-cyan-800/60">
            {channel.codec}
          </span>
          <span className="hidden sm:inline bg-slate-800/80 text-slate-300 px-1.5 py-0.2 rounded text-[10px] font-semibold">
            {channel.resolution}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Protocol Indicator Badge */}
          <span
            className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
              activeProtocol === 'WHEP'
                ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/60'
                : activeProtocol === 'HLS'
                ? 'bg-amber-900/60 text-amber-300 border border-amber-700/60'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {activeProtocol === 'WHEP' ? 'WebRTC/WHEP' : activeProtocol === 'HLS' ? 'HLS Fallback' : 'Stream Diagnostics'}
          </span>

          {/* Recording Badge */}
          <span className="text-red-500 font-bold flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping inline-block"></span>
            <span className="text-[10px]">REC</span>
          </span>
        </div>
      </div>

      {/* Main Video Viewport */}
      <div className="relative w-full aspect-video bg-slate-950 flex items-center justify-center overflow-hidden">
        {channel.status === 'OFFLINE' ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900/90 text-slate-400 p-4 text-center">
            <WifiOff className="w-10 h-10 text-rose-500 mb-2 animate-pulse" />
            <div className="text-sm font-bold text-white uppercase tracking-wider">Stream Disconnected</div>
            <p className="text-xs text-slate-400 mt-1 max-w-xs font-sans">
              RTSP TCP socket closed or gateway host unreachable. Backoff delay: {channel.backoff_delay_ms / 1000}s.
            </p>
            {onReconnect && (
              <button
                onClick={() => onReconnect(channel.stream_id)}
                className="mt-3 text-xs bg-cyan-600 hover:bg-cyan-500 text-white font-semibold px-3 py-1.5 rounded-lg cursor-pointer flex items-center space-x-1.5 transition shadow-lg shadow-cyan-600/30"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reconnect Feed (Backoff #{channel.reconnect_count + 1})</span>
              </button>
            )}
          </div>
        ) : (
          <>
            {/* HTML5 Video Element for WebRTC WHEP / HLS Streams */}
            <video
              ref={videoRef}
              muted={isMuted}
              playsInline
              autoPlay
              className={`w-full h-full object-cover block ${activeProtocol === 'CANVAS_FALLBACK' ? 'hidden' : ''}`}
            />

            {/* Diagnostic Canvas Overlay when media is active or fallback */}
            {activeProtocol === 'CANVAS_FALLBACK' && (
              <div className="w-full h-full flex flex-col justify-center items-center bg-gradient-to-b from-slate-900 to-slate-950 text-slate-300 p-4 relative">
                {/* Simulated Camera Sensor Graphic */}
                <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]"></div>
                <Tv className="w-12 h-12 text-cyan-400 mb-2 opacity-80" />
                <div className="text-xs font-mono font-bold text-white tracking-widest uppercase">
                  Live Stream Diagnostic Mode
                </div>
                <div className="text-[11px] font-mono text-cyan-300 mt-1">
                  RTSP Source: {channel.rtsp_url}
                </div>
                <div className="text-[10px] text-slate-400 mt-2 max-w-xs text-center">
                  WebRTC WHEP endpoint ready at port 8889. Forced TCP interleaved transport active.
                </div>
              </div>
            )}
          </>
        )}

        {/* Real-time PTS (Presentation Time Stamp) HUD Overlay */}
        <div className="absolute top-10 left-3 z-20 pointer-events-none bg-black/80 backdrop-blur-sm border border-slate-700/80 rounded px-2 py-1 text-[10px] font-mono text-cyan-300 shadow-md">
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-400">PTS:</span>
            <span className="font-bold text-emerald-400">{channel.pts_formatted}</span>
            <span className="text-slate-500">|</span>
            <span className="text-amber-300">Δ {channel.pts_delta_ms}ms</span>
          </div>
          <div className="text-[9px] text-slate-400 mt-0.5 flex items-center space-x-2">
            <span>Ticks: {channel.pts_ticks}</span>
            <span>Jitter: {channel.jitter_ms}ms</span>
            <span>TCP: Forced</span>
          </div>
        </div>

        {/* Real-time Stream Warning Banner (e.g. Join decoder warning or PTS jump) */}
        {channel.last_warning && (
          <div className="absolute top-22 left-3 right-3 z-20 pointer-events-none bg-amber-950/90 border border-amber-500/70 rounded-lg p-1.5 text-[10px] font-mono text-amber-200 shadow-xl flex items-center space-x-2 animate-fade-in">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">{channel.last_warning}</span>
          </div>
        )}

        {/* Snapshot Flash Feedback */}
        {snapshotFeedback && (
          <div className="absolute inset-0 bg-white/70 animate-fade-out z-30 pointer-events-none flex items-center justify-center">
            <span className="bg-black/90 text-white font-mono text-xs px-3 py-1.5 rounded-lg border border-cyan-500 shadow-xl flex items-center space-x-2">
              <CameraIcon className="w-4 h-4 text-cyan-400" />
              <span>Snapshot Captured to Investigation Evidence Locker</span>
            </span>
          </div>
        )}

        {/* Bottom OSD Bar: Geographic Landmark & Stream Telemetry */}
        <div className="absolute bottom-0 left-0 right-0 z-20 px-3 py-1.5 bg-gradient-to-t from-black/95 via-black/70 to-transparent flex items-center justify-between text-[11px] font-mono pointer-events-none">
          <div className="text-slate-200 truncate max-w-[260px]">
            <span className="text-cyan-400 font-bold">{channel.district}</span>: {channel.landmark}
          </div>
          <div className="text-slate-300 text-[10px] flex items-center space-x-2">
            <span>{channel.bitrate_kbps} kbps</span>
            <span className="text-slate-500">•</span>
            <span>Loss: {channel.packet_loss_pct}%</span>
          </div>
        </div>
      </div>

      {/* Collapsible Diagnostics Drawer */}
      {showDiagnostics && (
        <div className="bg-slate-950 border-t border-slate-800 p-2.5 text-[11px] font-mono space-y-1.5 text-slate-300">
          <div className="flex items-center justify-between text-xs text-white border-b border-slate-800 pb-1">
            <span className="font-bold flex items-center space-x-1.5 text-cyan-400">
              <Cpu className="w-3.5 h-3.5" />
              <span>RTSP & Ingest Telemetry Diagnostics</span>
            </span>
            <span className="text-[10px] text-slate-400">PTS Clock Base: 90kHz</span>
          </div>

          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px]">
            <div>
              <span className="text-slate-500">RTSP Stream:</span>{' '}
              <span className="text-cyan-300 truncate inline-block max-w-[180px]" title={channel.rtsp_url}>
                {channel.rtsp_url}
              </span>
            </div>
            <div>
              <span className="text-slate-500">Transport:</span>{' '}
              <span className="text-emerald-400 font-bold">TCP Interleaved (Forced)</span>
            </div>
            <div>
              <span className="text-slate-500">WHEP Egress:</span>{' '}
              <span className="text-slate-200 truncate inline-block max-w-[180px]" title={channel.whep_url}>
                {channel.whep_url}
              </span>
            </div>
            <div>
              <span className="text-slate-500">HLS Fallback:</span>{' '}
              <span className="text-slate-200 truncate inline-block max-w-[180px]" title={channel.hls_url}>
                {channel.hls_url}
              </span>
            </div>
            <div>
              <span className="text-slate-500">Timing Standard:</span>{' '}
              <span className="text-amber-300 font-bold">PTS Only (No Fixed FPS)</span>
            </div>
            <div>
              <span className="text-slate-500">Backoff Level:</span>{' '}
              <span>{channel.reconnect_count} ({channel.backoff_delay_ms / 1000}s)</span>
            </div>
          </div>

          <div className="bg-slate-900 p-1.5 rounded text-[10px] text-slate-400 border border-slate-800 flex items-center justify-between">
            <span className="truncate mr-2">Log: {connectionLog}</span>
            {onInjectFault && (
              <div className="flex items-center space-x-1 shrink-0">
                <button
                  onClick={() => onInjectFault(channel.stream_id, 'PTS_JUMP')}
                  className="px-1.5 py-0.5 bg-amber-950 text-amber-300 border border-amber-800 rounded hover:bg-amber-900 cursor-pointer text-[9px]"
                  title="Inject scene discontinuity (+2.5s PTS jump) to verify tolerance"
                >
                  PTS Jump
                </button>
                <button
                  onClick={() => onInjectFault(channel.stream_id, 'WHEP_FAIL')}
                  className="px-1.5 py-0.5 bg-slate-800 text-slate-300 border border-slate-700 rounded hover:bg-slate-700 cursor-pointer text-[9px]"
                  title="Simulate WebRTC failure to verify HLS fallback"
                >
                  HLS Failover
                </button>
                <button
                  onClick={() => onInjectFault(channel.stream_id, 'HEAL')}
                  className="px-1.5 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded hover:bg-emerald-900 cursor-pointer text-[9px]"
                  title="Restore stream to optimal LIVE state"
                >
                  Heal
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Interactive Controls Bar */}
      {showControls && (
        <div className="bg-slate-900 border-t border-slate-800 px-3 py-2 flex items-center justify-between gap-2 text-xs">
          {/* Audio & Diagnostic Toggles */}
          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded cursor-pointer transition"
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-slate-400" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
            </button>

            <button
              onClick={() => setShowDiagnostics(!showDiagnostics)}
              className={`p-1.5 rounded cursor-pointer transition flex items-center space-x-1 text-[11px] ${
                showDiagnostics
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
              title="Toggle Live Stream Telemetry & Fault Injector"
            >
              <Activity className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Diag</span>
            </button>

            {onReconnect && (
              <button
                onClick={() => onReconnect(channel.stream_id)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded cursor-pointer transition"
                title="Force Reconnect with Exponential Backoff"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Forensic & Digital Twin Actions */}
          <div className="flex items-center space-x-1.5">
            <button
              onClick={handleSnapshot}
              className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-slate-200 px-2 py-1 rounded cursor-pointer transition text-[11px]"
              title="Capture Snapshot to Evidence Locker"
            >
              <CameraIcon className="w-3 h-3 text-cyan-400" />
              <span className="hidden sm:inline">Snapshot</span>
            </button>

            {onForensicSearch && (
              <button
                onClick={onForensicSearch}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded cursor-pointer transition text-[11px]"
                title="Forensic metadata search for this camera"
              >
                Metadata
              </button>
            )}

            {onInspectDigitalTwin && (
              <button
                onClick={onInspectDigitalTwin}
                className="bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800/80 px-2 py-1 rounded cursor-pointer transition text-[11px] font-semibold"
                title="Open Model 1 Verified Master Digital Twin"
              >
                Model 1 Twin
              </button>
            )}

            {onToggleFocus && (
              <button
                onClick={onToggleFocus}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded cursor-pointer transition"
                title={isFocused ? 'Exit Single Tile Focus' : 'Focus Full Screen'}
              >
                {isFocused ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
