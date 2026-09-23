import React, { useEffect, useRef, useState } from 'react';
import { Camera } from '../../types';
import { Maximize2, Minimize2, Camera as CameraIcon, Sun, Moon, RefreshCw, ZoomIn, ZoomOut, AlertOctagon } from 'lucide-react';

interface SimulatedCameraStreamProps {
  camera: Camera;
  isFocused?: boolean;
  onToggleFocus?: () => void;
  onInspectDigitalTwin?: () => void;
  onForensicSearch?: () => void;
  showControls?: boolean;
}

export const SimulatedCameraStream: React.FC<SimulatedCameraStreamProps> = ({
  camera,
  isFocused = false,
  onToggleFocus,
  onInspectDigitalTwin,
  onForensicSearch,
  showControls = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isNightMode, setIsNightMode] = useState<boolean>(camera.type === 'THERMAL');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panX, setPanX] = useState<number>(0);
  const [panY, setPanY] = useState<number>(0);
  const [snapshotTaken, setSnapshotTaken] = useState<boolean>(false);

  const isOffline = camera.status === 'OFFLINE';
  const isMaintenance = camera.status === 'MAINTENANCE';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || isOffline) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let frame = 0;

    // Simulated traffic objects
    const seed = camera.id.charCodeAt(camera.id.length - 1) || 5;
    const cars = [
      { x: 50, y: 140, speed: 1.2 + (seed % 3) * 0.4, color: '#38bdf8', length: 38 },
      { x: 220, y: 155, speed: 1.6 + (seed % 2) * 0.5, color: '#f87171', length: 44 },
      { x: 380, y: 142, speed: 1.0 + (seed % 4) * 0.3, color: '#facc15', length: 32 },
    ];

    const render = () => {
      frame++;
      const w = canvas.width;
      const h = canvas.height;

      // Background color based on mode
      if (isNightMode) {
        ctx.fillStyle = camera.type === 'THERMAL' ? '#180e29' : '#0a0f1d';
      } else {
        ctx.fillStyle = '#0f172a';
      }
      ctx.fillRect(0, 0, w, h);

      // Camera Pan/Zoom transform
      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.scale(zoomLevel, zoomLevel);
      ctx.translate(-w / 2 + panX, -h / 2 + panY);

      // Draw road / scene perspective
      const roadTop = h * 0.42;
      const roadBottom = h * 0.88;

      // Sky / background horizon
      ctx.fillStyle = isNightMode ? '#080d1a' : '#1e293b';
      ctx.fillRect(0, 0, w, roadTop);

      // Buildings / Infrastructure skyline
      ctx.fillStyle = isNightMode ? '#0f172a' : '#334155';
      const bSeed = seed * 12;
      for (let i = 0; i < 7; i++) {
        const bx = i * (w / 6);
        const bh = 40 + ((bSeed * (i + 1)) % 70);
        ctx.fillRect(bx, roadTop - bh, w / 7, bh);

        // Windows
        if (!isNightMode || (i + frame) % 2 === 0) {
          ctx.fillStyle = '#fbbf24';
          ctx.fillRect(bx + 10, roadTop - bh + 15, 6, 8);
          ctx.fillRect(bx + 25, roadTop - bh + 15, 6, 8);
          ctx.fillStyle = isNightMode ? '#0f172a' : '#334155';
        }
      }

      // Asphalt Road
      ctx.fillStyle = isNightMode ? '#0b1120' : '#1e2538';
      ctx.beginPath();
      ctx.moveTo(0, roadBottom);
      ctx.lineTo(0, roadTop);
      ctx.lineTo(w, roadTop);
      ctx.lineTo(w, roadBottom);
      ctx.fill();

      // Road markings (lanes)
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([12, 16]);
      ctx.lineDashOffset = -frame * 1.5;
      ctx.beginPath();
      ctx.moveTo(0, (roadTop + roadBottom) / 2);
      ctx.lineTo(w, (roadTop + roadBottom) / 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw and move cars
      cars.forEach((car, index) => {
        car.x += car.speed;
        if (car.x > w + 60) {
          car.x = -60;
        }

        const yPos = index % 2 === 0 ? roadTop + 20 : roadTop + 45;

        // Vehicle body
        ctx.fillStyle = car.color;
        ctx.fillRect(car.x, yPos, car.length, 18);

        // Vehicle roof / cabin
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(car.x + 8, yPos - 6, car.length - 16, 7);

        // Headlights / Tail lights
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(car.x + car.length, yPos + 3, 3, 4);
        ctx.fillRect(car.x + car.length, yPos + 11, 3, 4);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(car.x - 2, yPos + 3, 2, 4);
        ctx.fillRect(car.x - 2, yPos + 11, 2, 4);

        // Bounding box for AI Detection Simulation
        if (camera.capabilities.some(c => c.includes('Vehicle') || c.includes('ANPR')) || camera.type === 'ANPR') {
          ctx.strokeStyle = '#22c55e';
          ctx.lineWidth = 1;
          ctx.strokeRect(car.x - 4, yPos - 10, car.length + 8, 34);

          ctx.fillStyle = '#22c55e';
          ctx.font = '9px monospace';
          ctx.fillText(`VEHICLE 98% [${camera.type}]`, car.x - 4, yPos - 12);
        }
      });

      // Camera lens crosshair center
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(w / 2 - 15, h / 2);
      ctx.lineTo(w / 2 + 15, h / 2);
      ctx.moveTo(w / 2, h / 2 - 15);
      ctx.lineTo(w / 2, h / 2 + 15);
      ctx.stroke();

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [camera, isOffline, isNightMode, zoomLevel, panX, panY]);

  const handleCaptureSnapshot = () => {
    setSnapshotTaken(true);
    setTimeout(() => setSnapshotTaken(false), 800);
  };

  return (
    <div className={`relative bg-slate-950 rounded-xl overflow-hidden border transition-all select-none group flex flex-col ${
      isFocused ? 'border-blue-500 shadow-2xl ring-2 ring-blue-500/50' : 'border-slate-800 hover:border-slate-700'
    }`}>
      {/* Top OSD Metadata Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 px-3 py-1.5 bg-gradient-to-b from-black/90 via-black/60 to-transparent flex items-center justify-between text-[11px] font-mono pointer-events-none">
        <div className="flex items-center space-x-2">
          {!isOffline ? (
            <span className="flex items-center space-x-1 text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>LIVE</span>
            </span>
          ) : (
            <span className="flex items-center space-x-1 text-rose-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span>OFFLINE</span>
            </span>
          )}
          <span className="text-slate-400">|</span>
          <span className="text-white font-bold tracking-tight truncate max-w-[200px]" title={camera.global_id}>
            {camera.global_id}
          </span>
          <span className="bg-blue-900/60 text-blue-300 px-1.5 py-0.2 rounded text-[10px] font-semibold border border-blue-700/50">
            {camera.type}
          </span>
        </div>

        <div className="flex items-center space-x-2 text-slate-300">
          <span className="hidden sm:inline text-amber-300 font-medium">1080P@30FPS</span>
          <span className="text-red-500 font-bold flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-ping inline-block"></span>
            <span>REC</span>
          </span>
        </div>
      </div>

      {/* Main Stream Canvas / Offline State */}
      <div className="relative w-full aspect-video bg-slate-950 flex items-center justify-center overflow-hidden">
        {isOffline ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900/90 text-slate-400 p-4 text-center">
            <AlertOctagon className="w-10 h-10 text-rose-500 mb-2 animate-bounce" />
            <div className="text-sm font-bold text-white uppercase tracking-wider">Video Signal Lost</div>
            <p className="text-xs text-slate-400 mt-1 max-w-xs font-sans">
              Camera node offline in Master Registry. Check PoE switch & optical cable at {camera.landmark}.
            </p>
            {onInspectDigitalTwin && (
              <button
                onClick={onInspectDigitalTwin}
                className="mt-3 text-xs bg-slate-800 hover:bg-slate-700 text-blue-300 border border-slate-700 px-3 py-1 rounded cursor-pointer"
              >
                Inspect Registry Telemetry
              </button>
            )}
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            width={480}
            height={270}
            className="w-full h-full object-cover block"
          />
        )}

        {/* Snapshot Flash Feedback */}
        {snapshotTaken && (
          <div className="absolute inset-0 bg-white/70 animate-fade-out z-30 pointer-events-none flex items-center justify-center">
            <span className="bg-black/80 text-white font-mono text-xs px-3 py-1.5 rounded-lg border border-slate-700 shadow-xl">
              📸 Snapshot Captured to Forensic Locker
            </span>
          </div>
        )}

        {/* Bottom OSD Bar: Landmark & District */}
        <div className="absolute bottom-0 left-0 right-0 z-20 px-3 py-1 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex items-center justify-between text-[11px] font-mono pointer-events-none">
          <div className="text-slate-300 truncate max-w-[280px]">
            <span className="text-blue-400 font-bold">{camera.district}</span>: {camera.landmark}
          </div>
          <div className="text-slate-400 text-[10px]">
            H:{camera.heading}° • FOV:{camera.fov_angle}°
          </div>
        </div>
      </div>

      {/* Interactive Controls Overlay on Hover or when Focused */}
      {showControls && (
        <div className="bg-slate-900/95 border-t border-slate-800 px-3 py-2 flex items-center justify-between gap-2 text-xs">
          {/* PTZ Zoom / Pan Controls */}
          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setZoomLevel(prev => Math.min(prev + 0.3, 2.5))}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded cursor-pointer transition"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(prev => Math.max(prev - 0.3, 1))}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded cursor-pointer transition"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setZoomLevel(1);
                setPanX(0);
                setPanY(0);
              }}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded cursor-pointer transition"
              title="Reset PTZ"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsNightMode(!isNightMode)}
              className={`p-1.5 rounded cursor-pointer transition ${
                isNightMode ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
              title="Toggle IR Night Vision / Thermal"
            >
              {isNightMode ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Forensic Actions */}
          <div className="flex items-center space-x-1.5">
            <button
              onClick={handleCaptureSnapshot}
              className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-slate-200 px-2 py-1 rounded cursor-pointer transition text-[11px]"
              title="Capture Snapshot to Evidence Locker"
            >
              <CameraIcon className="w-3 h-3 text-blue-400" />
              <span className="hidden sm:inline">Snapshot</span>
            </button>

            {onInspectDigitalTwin && (
              <button
                onClick={onInspectDigitalTwin}
                className="bg-blue-950 hover:bg-blue-900 text-blue-300 border border-blue-800/80 px-2 py-1 rounded cursor-pointer transition text-[11px] font-semibold"
                title="Open Model 1 Verified Master Digital Twin"
              >
                Model 1 Specs
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
