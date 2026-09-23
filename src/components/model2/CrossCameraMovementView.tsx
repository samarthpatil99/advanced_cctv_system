import React, { useState, useEffect, useRef } from 'react';
import { Camera, CrossCameraJourney, CrossCameraWaypoint } from '../../types';
import {
  Route,
  Play,
  Pause,
  RotateCcw,
  MapPin,
  Clock,
  Gauge,
  Compass,
  AlertTriangle,
  FolderPlus,
  CheckCircle2,
  Navigation,
  Sparkles,
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface CrossCameraMovementViewProps {
  cameras: Camera[];
  targetPlate?: string;
  onSelectCameraForDigitalTwin: (camera: Camera) => void;
  onNavigateToTab?: (tab: string, context?: any) => void;
}

export const CrossCameraMovementView: React.FC<CrossCameraMovementViewProps> = ({
  cameras,
  targetPlate = 'GJ-01-ER-4921',
  onSelectCameraForDigitalTwin,
  onNavigateToTab,
}) => {
  const [plate, setPlate] = useState<string>(targetPlate);
  const [journey, setJourney] = useState<CrossCameraJourney | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [casePinnedMsg, setCasePinnedMsg] = useState<string | null>(null);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);
  const animatedMarkerRef = useRef<L.Marker | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  const fetchJourney = async (plateNumber: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/model2/tracking/journey?plate=${encodeURIComponent(plateNumber)}`);
      if (res.ok) {
        const data = await res.json();
        setJourney(data);
        setActiveStep(0);
        setIsPlaying(false);
      }
    } catch (err) {
      console.error('Failed to fetch cross-camera journey:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJourney(plate);
  }, [plate]);

  // Leaflet Map Initialization and updates
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [23.0225, 72.5714], // Gujarat / Ahmedabad center
        zoom: 12,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CartoDB &copy; OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    if (!map || !journey || journey.waypoints.length === 0) return;

    // Clear previous markers & polyline
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }
    if (animatedMarkerRef.current) {
      animatedMarkerRef.current.remove();
      animatedMarkerRef.current = null;
    }

    const coords: [number, number][] = journey.waypoints.map(w => [w.latitude, w.longitude]);

    // Draw route polyline
    const polyline = L.polyline(coords, {
      color: '#38bdf8',
      weight: 4,
      opacity: 0.85,
      dashArray: '8, 8',
    }).addTo(map);
    polylineRef.current = polyline;

    // Add numbered waypoint markers
    journey.waypoints.forEach((wp, index) => {
      const isStart = index === 0;
      const isEnd = index === journey.waypoints.length - 1;

      const markerHtml = `
        <div style="
          background-color: ${isStart ? '#10b981' : isEnd ? '#ef4444' : '#3b82f6'};
          color: white;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 2px solid white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: monospace;
          font-weight: bold;
          font-size: 11px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.5);
        ">
          ${wp.sequence}
        </div>
      `;

      const icon = L.divIcon({
        className: 'custom-waypoint-icon',
        html: markerHtml,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([wp.latitude, wp.longitude], { icon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; color: #1e293b; min-width: 180px;">
            <strong style="color: #0f172a; font-size: 13px;">#${wp.sequence}: ${wp.camera_name}</strong><br/>
            <span style="font-family: monospace; color: #2563eb;">${wp.global_camera_id}</span><br/>
            <span>Time: <strong>${new Date(wp.timestamp).toLocaleTimeString()}</strong></span><br/>
            <span>Speed: <strong>${wp.speed_kmh} km/h</strong></span><br/>
            <span>Distance: <strong>${Math.round(wp.distance_meters / 100) / 10} km</strong></span>
          </div>
        `);

      markersRef.current.push(marker);
    });

    // Create moving target vehicle marker
    const firstCoord = coords[0];
    const carHtml = `
      <div style="
        background-color: #f59e0b;
        color: black;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 2px solid #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        box-shadow: 0 0 16px #f59e0b;
      ">
        🚗
      </div>
    `;
    const carIcon = L.divIcon({
      className: 'moving-car-icon',
      html: carHtml,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const carMarker = L.marker(firstCoord, { icon: carIcon }).addTo(map);
    animatedMarkerRef.current = carMarker;

    // Fit bounds to show entire route with padding
    map.fitBounds(polyline.getBounds(), { padding: [40, 40] });
  }, [journey]);

  // Simulation playback timer
  useEffect(() => {
    if (!isPlaying || !journey || journey.waypoints.length === 0) return;

    const interval = setInterval(() => {
      setActiveStep(prev => {
        if (prev >= journey.waypoints.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        const next = prev + 1;
        const targetWp = journey.waypoints[next];
        if (animatedMarkerRef.current && mapInstanceRef.current) {
          animatedMarkerRef.current.setLatLng([targetWp.latitude, targetWp.longitude]);
          mapInstanceRef.current.panTo([targetWp.latitude, targetWp.longitude], { animate: true });
        }
        return next;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isPlaying, journey]);

  const handleStepClick = (stepIndex: number) => {
    if (!journey) return;
    setActiveStep(stepIndex);
    const targetWp = journey.waypoints[stepIndex];
    if (animatedMarkerRef.current && mapInstanceRef.current) {
      animatedMarkerRef.current.setLatLng([targetWp.latitude, targetWp.longitude]);
      mapInstanceRef.current.panTo([targetWp.latitude, targetWp.longitude], { animate: true });
    }
  };

  const handlePinTrajectoryToCase = () => {
    setCasePinnedMsg(`Cross-Camera Trajectory for ${plate} pinned to Active Investigation Case.`);
    setTimeout(() => setCasePinnedMsg(null), 3500);
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Route className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight uppercase">
                Cross-Camera Movement Trajectory
              </h2>
              <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[11px] font-mono px-2 py-0.5 rounded font-bold">
                SPATIO-TEMPORAL TRACE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Automated multi-junction route reconstruction across sequential Model 1 camera assets with speed and blindspot profiling.
            </p>
          </div>
        </div>

        {/* Input Switcher */}
        <div className="flex items-center space-x-2 text-xs">
          <input
            type="text"
            placeholder="Target Plate..."
            value={plate}
            onChange={e => setPlate(e.target.value.toUpperCase())}
            className="bg-slate-950 border border-slate-800 text-white font-mono uppercase font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500 text-xs w-44"
          />
          <button
            onClick={() => fetchJourney(plate)}
            className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-3.5 py-2 rounded-xl cursor-pointer transition shadow-md"
          >
            Trace
          </button>
        </div>
      </div>

      {casePinnedMsg && (
        <div className="bg-emerald-950 border border-emerald-800 text-emerald-300 px-4 py-3 rounded-xl text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{casePinnedMsg}</span>
          </div>
          <button
            onClick={() => onNavigateToTab?.('investigations')}
            className="text-emerald-200 font-bold hover:underline"
          >
            Open Investigation Workspace →
          </button>
        </div>
      )}

      {/* Trajectory Stats Card */}
      {journey && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <span className="bg-white text-black font-mono font-black text-sm px-2.5 py-1 rounded border border-black">
                {journey.target_identifier.split(' ')[0]}
              </span>
              <span className="text-white font-bold text-xs">
                Trajectory Direction: <span className="text-cyan-400">{journey.estimated_direction}</span>
              </span>
            </div>

            {/* Playback Simulation Controls */}
            <div className="flex items-center space-x-2 text-xs">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-bold cursor-pointer transition ${
                  isPlaying ? 'bg-amber-600 text-white' : 'bg-cyan-600 text-white hover:bg-cyan-500'
                }`}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlaying ? 'Pause Simulation' : 'Play Path Progression'}</span>
              </button>
              <button
                onClick={() => {
                  setActiveStep(0);
                  setIsPlaying(false);
                  if (journey.waypoints[0] && animatedMarkerRef.current && mapInstanceRef.current) {
                    animatedMarkerRef.current.setLatLng([journey.waypoints[0].latitude, journey.waypoints[0].longitude]);
                    mapInstanceRef.current.panTo([journey.waypoints[0].latitude, journey.waypoints[0].longitude]);
                  }
                }}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl cursor-pointer"
                title="Reset to origin"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handlePinTrajectoryToCase}
                className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-xl font-medium cursor-pointer"
              >
                <FolderPlus className="w-3.5 h-3.5 text-amber-400" />
                <span>Pin to Case Dossier</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
              <span className="text-slate-400">Total Route Distance</span>
              <div className="text-xl font-mono font-extrabold text-white mt-0.5">
                {journey.total_distance_km} km
              </div>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
              <span className="text-slate-400">Average Transit Speed</span>
              <div className="text-xl font-mono font-extrabold text-cyan-400 mt-0.5">
                {journey.average_speed_kmh} km/h
              </div>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
              <span className="text-slate-400">Passage Cameras</span>
              <div className="text-xl font-mono font-extrabold text-emerald-400 mt-0.5">
                {journey.waypoints.length} Nodes
              </div>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
              <span className="text-slate-400">Districts Traversed</span>
              <div className="text-xl font-mono font-extrabold text-amber-300 mt-0.5">
                {journey.districts_traversed.join(', ')}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Map Visualization Stage */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative">
        <div ref={mapContainerRef} className="w-full h-[450px] z-10" />

        {/* Floating Active Waypoint Card Overlay */}
        {journey && journey.waypoints[activeStep] && (
          <div className="absolute top-4 left-4 z-20 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-3.5 text-xs text-white max-w-xs shadow-2xl">
            <div className="flex items-center space-x-2 text-cyan-400 font-bold mb-1">
              <Navigation className="w-4 h-4 animate-bounce" />
              <span>Active Waypoint #{activeStep + 1} of {journey.waypoints.length}</span>
            </div>
            <div className="font-semibold text-white truncate">{journey.waypoints[activeStep].camera_name}</div>
            <div className="text-slate-400 font-mono text-[11px] mt-0.5">
              Node: <strong className="text-cyan-300">{journey.waypoints[activeStep].global_camera_id}</strong>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-800 flex justify-between text-[11px]">
              <span>Speed: <strong>{journey.waypoints[activeStep].speed_kmh} km/h</strong></span>
              <span>Time: <strong>{new Date(journey.waypoints[activeStep].timestamp).toLocaleTimeString()}</strong></span>
            </div>
          </div>
        )}
      </div>

      {/* Step-by-Step Corridor Breakdown Table */}
      {journey && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <h3 className="text-sm font-extrabold text-white uppercase tracking-tight flex items-center space-x-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>Corridor Segment Passage Log</span>
          </h3>

          <div className="space-y-2 text-xs">
            {journey.waypoints.map((wp, index) => {
              const isSelected = activeStep === index;
              const matchedCam = cameras.find(c => c.global_id === wp.global_camera_id || c.id === wp.camera_id);
              const isBlindspotWarning = wp.distance_meters > 3000;

              return (
                <div
                  key={wp.sequence}
                  onClick={() => handleStepClick(index)}
                  className={`p-3.5 rounded-xl border transition cursor-pointer flex flex-wrap items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-cyan-950/40 border-cyan-500 shadow-lg ring-1 ring-cyan-500/40'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center font-mono font-bold text-xs ${
                      index === 0
                        ? 'bg-emerald-600 text-white'
                        : index === journey.waypoints.length - 1
                        ? 'bg-rose-600 text-white'
                        : 'bg-blue-600 text-white'
                    }`}>
                      #{wp.sequence}
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white text-xs">{wp.camera_name}</span>
                        {isBlindspotWarning && (
                          <span className="bg-amber-950 text-amber-300 border border-amber-800 text-[10px] px-1.5 py-0.2 rounded font-medium flex items-center space-x-1">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Blind Spot Gap &gt; 3km</span>
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        Passage: <strong>{new Date(wp.timestamp).toLocaleTimeString()}</strong> • Model 1 Node:{' '}
                        <span className="text-cyan-300">{wp.global_camera_id}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="font-mono text-white font-bold">{wp.speed_kmh} km/h</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        +{Math.round(wp.distance_meters / 100) / 10} km ({Math.round(wp.time_delta_seconds / 60)} min)
                      </div>
                    </div>

                    {matchedCam && (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onSelectCameraForDigitalTwin(matchedCam);
                        }}
                        className="bg-slate-800 hover:bg-slate-700 text-blue-300 border border-slate-700 px-2.5 py-1.5 rounded-lg cursor-pointer transition font-mono text-[11px]"
                        title="Open Model 1 Hardware & Network Specs"
                      >
                        Model 1 Twin
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
