import React, { useState, useEffect } from 'react';
import { Camera, AnprHit } from '../../types';
import {
  FileText,
  Search,
  Route,
  ShieldAlert,
  MapPin,
  Clock,
  Gauge,
  Compass,
  CheckCircle2,
  AlertCircle,
  FolderPlus,
  Share2,
  Calendar,
  Sparkles,
} from 'lucide-react';

interface VehicleInvestigationViewProps {
  cameras: Camera[];
  initialPlate?: string;
  onSelectCameraForDigitalTwin: (camera: Camera) => void;
  onTrackVehicleMovement: (plate: string) => void;
  onNavigateToTab?: (tab: string, context?: any) => void;
}

export const VehicleInvestigationView: React.FC<VehicleInvestigationViewProps> = ({
  cameras,
  initialPlate = 'GJ-01-ER-4921',
  onSelectCameraForDigitalTwin,
  onTrackVehicleMovement,
  onNavigateToTab,
}) => {
  const [targetPlate, setTargetPlate] = useState<string>(initialPlate);
  const [activePlate, setActivePlate] = useState<string>(initialPlate);
  const [sightings, setSightings] = useState<AnprHit[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [casePinnedMsg, setCasePinnedMsg] = useState<string | null>(null);

  const samplePlates = [
    { plate: 'GJ-01-ER-4921', label: 'Silver Creta (Hit & Run Suspect)', hotlist: true },
    { plate: 'GJ-05-BK-8820', label: 'White Scorpio (Wanted Warrant)', hotlist: true },
    { plate: 'GJ-06-TX-3104', label: 'Heavy Truck (Fitness Expired)', hotlist: true },
    { plate: 'GJ-03-VIP-0001', label: 'State Protocol Convoy Pilot', hotlist: false },
  ];

  const fetchSightings = async (plate: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/model2/anpr/hits?plateSearch=${encodeURIComponent(plate)}&limit=100`);
      if (res.ok) {
        const data = await res.json();
        setSightings(data.items || []);
        setActivePlate(plate);
      }
    } catch (err) {
      console.error('Failed to load vehicle sightings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSightings(targetPlate);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (targetPlate.trim()) {
      fetchSightings(targetPlate.trim().toUpperCase());
    }
  };

  const handleSelectSample = (plate: string) => {
    setTargetPlate(plate);
    fetchSightings(plate);
  };

  const isHotlist = sightings.some(s => s.is_watchlist_match);
  const primarySighting = sightings[0];

  // Calculate stats
  const avgSpeed = sightings.length > 0
    ? Math.round(sightings.reduce((sum, s) => sum + s.speed_kmh, 0) / sightings.length)
    : 0;
  const districtsTraversed = Array.from(new Set(sightings.map(s => s.district)));

  const handlePinToCase = () => {
    setCasePinnedMsg(`Vehicle ${activePlate} and ${sightings.length} camera sightings attached to Investigation Case Locker.`);
    setTimeout(() => setCasePinnedMsg(null), 3500);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight uppercase">
                Vehicle Investigation Dossier
              </h2>
              <span className="bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[11px] font-mono px-2 py-0.5 rounded font-bold">
                FORENSIC DOSSIER
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Unified cross-camera chronological timeline and behavioral profiling for target license plates.
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex items-center space-x-2 text-xs">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Enter license plate..."
              value={targetPlate}
              onChange={e => setTargetPlate(e.target.value)}
              className="w-52 bg-slate-950 border border-slate-800 text-white font-mono uppercase font-bold rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl font-bold cursor-pointer transition shadow-md"
          >
            Investigate
          </button>
        </form>
      </div>

      {/* Quick Select Preset Targets */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-400 font-medium px-1">Preset Targets:</span>
        {samplePlates.map(sp => (
          <button
            key={sp.plate}
            onClick={() => handleSelectSample(sp.plate)}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border font-mono text-[11px] cursor-pointer transition ${
              activePlate === sp.plate
                ? 'bg-blue-600 text-white border-blue-500 shadow-md font-bold'
                : sp.hotlist
                ? 'bg-rose-950/40 border-rose-800/60 text-rose-300 hover:bg-rose-900/50'
                : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            {sp.hotlist && <ShieldAlert className="w-3 h-3 text-rose-400" />}
            <span>{sp.plate}</span>
            <span className="text-[10px] text-slate-400 font-sans">({sp.label.split(' ')[0]})</span>
          </button>
        ))}
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

      {/* Main Dossier Summary Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
          {/* Plate Banner */}
          <div className="flex items-center space-x-4">
            <div className="bg-white text-black font-mono font-black text-xl sm:text-2xl px-4 py-2 rounded-lg border-2 border-black flex items-center space-x-2.5 shadow-md">
              <div className="bg-blue-800 text-white text-[9px] font-bold px-1.5 py-1.5 rounded-sm flex flex-col items-center leading-none">
                <span>IND</span>
              </div>
              <span>{activePlate}</span>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="text-white font-bold text-base">
                  {primarySighting ? `${primarySighting.vehicle_make} (${primarySighting.vehicle_category})` : 'Target Vehicle'}
                </span>
                {isHotlist ? (
                  <span className="bg-rose-600 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded flex items-center space-x-1 animate-pulse">
                    <ShieldAlert className="w-3 h-3" />
                    <span>STATE CRIME WATCHLIST HIT</span>
                  </span>
                ) : (
                  <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-mono px-2 py-0.5 rounded">
                    ROUTINE TRAFFIC SIGHTING
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                RTO Authority: <strong className="text-amber-300">{primarySighting?.rto_division || 'Gujarat Transport Dept'}</strong> • Visual Color: <strong className="text-slate-200">{primarySighting?.vehicle_color || 'Unknown'}</strong>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-2 text-xs">
            <button
              onClick={() => onTrackVehicleMovement(activePlate)}
              className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 rounded-xl font-bold cursor-pointer transition shadow-lg"
            >
              <Route className="w-4 h-4" />
              <span>Map Trajectory Track</span>
            </button>
            <button
              onClick={handlePinToCase}
              className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-2 rounded-xl font-semibold cursor-pointer transition"
            >
              <FolderPlus className="w-4 h-4 text-amber-400" />
              <span>Pin to Active Case</span>
            </button>
          </div>
        </div>

        {/* 4-Stat Box */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
            <span className="text-slate-400">Total Sightings</span>
            <div className="text-xl font-mono font-extrabold text-white mt-0.5">
              {sightings.length} Nodes
            </div>
          </div>
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
            <span className="text-slate-400">Average Travel Speed</span>
            <div className="text-xl font-mono font-extrabold text-blue-400 mt-0.5">
              {avgSpeed} km/h
            </div>
          </div>
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
            <span className="text-slate-400">Districts Traversed</span>
            <div className="text-xl font-mono font-extrabold text-amber-300 mt-0.5">
              {districtsTraversed.length} Regions
            </div>
          </div>
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
            <span className="text-slate-400">OCR Confidence</span>
            <div className="text-xl font-mono font-extrabold text-emerald-400 mt-0.5">
              {primarySighting?.confidence || 96}%
            </div>
          </div>
        </div>
      </div>

      {/* Chronological Sighting History Timeline */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-white uppercase tracking-tight flex items-center space-x-2">
            <Clock className="w-4 h-4 text-blue-400" />
            <span>Chronological Camera Passage History</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {sightings.length} sequential detections recorded
          </span>
        </div>

        {sightings.length === 0 ? (
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-8 text-center text-slate-400 text-xs">
            No camera passages recorded for plate <strong className="text-white">{activePlate}</strong> in current index.
          </div>
        ) : (
          <div className="space-y-2.5">
            {sightings.map((s, index) => {
              const matchedCam = cameras.find(c => c.global_id === s.global_camera_id || c.id === s.camera_id);
              return (
                <div
                  key={s.id}
                  className="bg-slate-950 border border-slate-800 hover:border-blue-500/40 rounded-xl p-3.5 transition flex flex-wrap items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-7 h-7 rounded-full bg-blue-600/20 text-blue-300 border border-blue-500/40 flex items-center justify-center font-mono font-bold text-xs">
                      #{index + 1}
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white text-xs">{s.district}</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-300">{s.location}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5 flex items-center space-x-2">
                        <span>Time: <strong className="text-slate-300">{new Date(s.timestamp).toLocaleString()}</strong></span>
                        <span>•</span>
                        <span>Lane: {s.lane_number}</span>
                        <span>•</span>
                        <span>Direction: {s.direction}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="font-mono text-white font-bold">
                        {s.speed_kmh} km/h
                      </div>
                      <div className="text-[10px] text-emerald-400 font-mono">
                        {s.confidence}% OCR
                      </div>
                    </div>

                    {matchedCam && (
                      <button
                        onClick={() => onSelectCameraForDigitalTwin(matchedCam)}
                        className="bg-slate-900 hover:bg-slate-800 text-blue-300 border border-slate-700 px-2.5 py-1.5 rounded-lg cursor-pointer transition font-mono text-[11px]"
                        title={s.global_camera_id}
                      >
                        Model 1 Twin
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
