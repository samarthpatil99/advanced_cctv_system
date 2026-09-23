import React, { useState, useMemo } from 'react';
import { Camera, LiveStreamChannel, EvaluationMode } from '../../types';
import { SimulatedCameraStream } from './SimulatedCameraStream';
import { LiveStreamPlayer } from './LiveStreamPlayer';
import { usePresentationMode } from '../../context/PresentationContext';
import {
  Grid,
  Maximize2,
  Tv,
  Search,
  Filter,
  SlidersHorizontal,
  ChevronRight,
  AlertTriangle,
  Radio,
  Layers,
  Sparkles,
  Sliders,
  RefreshCw,
  Cpu,
} from 'lucide-react';

interface VideoWallViewProps {
  cameras: Camera[];
  liveChannels?: LiveStreamChannel[];
  evaluationMode?: EvaluationMode;
  sentinelHost?: string;
  onSelectCameraForDigitalTwin: (camera: Camera) => void;
  onNavigateToTab?: (tab: string, context?: any) => void;
  onToggleEvaluationMode?: (mode: EvaluationMode) => void;
  onOpenLiveSettings?: () => void;
  onReconnectStream?: (streamId: string) => void;
  onInjectFault?: (streamId: string, fault: any) => void;
}

type GridLayout = '1x1' | '2x2' | '3x3' | '4x4' | '1+5';

export const VideoWallView: React.FC<VideoWallViewProps> = ({
  cameras,
  liveChannels = [],
  evaluationMode = 'DEMO',
  sentinelHost = '',
  onSelectCameraForDigitalTwin,
  onNavigateToTab,
  onToggleEvaluationMode,
  onOpenLiveSettings,
  onReconnectStream,
  onInjectFault,
}) => {
  const { isPresentationMode } = usePresentationMode();
  const [layout, setLayout] = useState<GridLayout>('2x2');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [targetSlot, setTargetSlot] = useState<number>(0);

  // Initialize slots with operational cameras across Gujarat
  const [slottedCameraIds, setSlottedCameraIds] = useState<string[]>(() => {
    const operational = cameras.filter(c => c.status === 'OPERATIONAL');
    const selected = operational.slice(0, 16);
    return selected.map(c => c.id);
  });

  // Calculate required slots based on grid layout
  const maxSlots = layout === '1x1' ? 1 : layout === '2x2' ? 4 : layout === '3x3' ? 9 : layout === '1+5' ? 6 : 16;

  // Resolve camera objects for current active slots
  const activeCameras = useMemo(() => {
    return slottedCameraIds.slice(0, maxSlots).map((id, index) => {
      const found = cameras.find(c => c.id === id);
      return found || cameras[index % cameras.length];
    });
  }, [slottedCameraIds, maxSlots, cameras]);

  // Resolve matching live stream channels for active slots
  const activeChannels = useMemo(() => {
    return activeCameras.map((camera, index) => {
      if (!camera) return liveChannels[index % (liveChannels.length || 1)];
      const match = liveChannels.find(
        ch => ch.global_camera_id === camera.global_id || ch.global_camera_id === camera.id
      );
      if (match) return match;
      // Fallback to indexed channel
      const fallback = liveChannels[index % (liveChannels.length || 1)];
      if (fallback) {
        return {
          ...fallback,
          global_camera_id: camera.global_id,
          name: `${camera.district} - ${camera.landmark}`,
          district: camera.district,
          landmark: camera.landmark,
        };
      }
      return undefined;
    });
  }, [activeCameras, liveChannels]);

  // Filtered cameras for drawer selection
  const drawerCameras = useMemo(() => {
    return cameras.filter(c => {
      const matchesDistrict = selectedDistrict === 'ALL' || c.district.toLowerCase() === selectedDistrict.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        c.global_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.landmark.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.type.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesDistrict && matchesSearch;
    });
  }, [cameras, selectedDistrict, searchQuery]);

  const handleAssignCameraToSlot = (camera: Camera) => {
    setSlottedCameraIds(prev => {
      const copy = [...prev];
      copy[targetSlot] = camera.id;
      return copy;
    });
    setIsDrawerOpen(false);
  };

  const applyPresetCorridor = (corridorName: string) => {
    let presetCams: Camera[] = [];
    if (corridorName === 'AHMEDABAD_SG') {
      presetCams = cameras.filter(c => c.district === 'Ahmedabad' && c.status === 'OPERATIONAL');
    } else if (corridorName === 'SURAT_RING') {
      presetCams = cameras.filter(c => c.district === 'Surat' && c.status === 'OPERATIONAL');
    } else if (corridorName === 'HIGH_RISK_SPOF') {
      presetCams = cameras.filter(c => c.redundancy_level === 'CRITICAL' || c.coverage_importance === 'A_CRITICAL_JUNCTION');
    } else if (corridorName === 'ANPR_INTERCEPT') {
      presetCams = cameras.filter(c => c.type === 'ANPR' || c.capabilities.some(cap => cap.includes('ANPR')));
    }

    if (presetCams.length > 0) {
      setSlottedCameraIds(presetCams.slice(0, 16).map(c => c.id));
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Controls & Matrix Header */}
      <div id="video-wall-header" className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <Tv className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight uppercase">
                Unified Video Wall Matrix
              </h2>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-mono px-2 py-0.5 rounded font-bold">
                MODEL 2 VIEWING ENGINE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Real-time multi-channel surveillance synchronized with Model 1 verified <code className="text-blue-300">global_camera_id</code> assets.
            </p>
          </div>
        </div>

        {/* Live Evaluation vs Demo Mode Switcher & Host Pill (Hidden in Presentation Mode) */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Mode Switcher */}
          {!isPresentationMode && onToggleEvaluationMode && (
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1">
              <button
                onClick={() => onToggleEvaluationMode('DEMO')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  evaluationMode === 'DEMO'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                DEMO MODE
              </button>
              <button
                onClick={() => onToggleEvaluationMode('LIVE')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 ${
                  evaluationMode === 'LIVE'
                    ? 'bg-cyan-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>LIVE EVALUATION</span>
              </button>
            </div>
          )}

          {/* Sentinel Host Badge */}
          {!isPresentationMode && onOpenLiveSettings && (
            <button
              onClick={onOpenLiveSettings}
              className="flex items-center space-x-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 px-3 py-1.5 rounded-xl font-mono text-[11px] transition cursor-pointer"
              title="Click to configure Sentinel Host and trigger catalogue discovery"
            >
              <Radio className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-500">Sentinel:</span>
              <span className="text-cyan-300 font-bold">{sentinelHost || 'Demo Mode (Local)'}</span>
              <Sliders className="w-3 h-3 text-slate-400 ml-1" />
            </button>
          )}

          {/* Preset Corridor Selector */}
          <div className="hidden xl:flex items-center space-x-1 bg-slate-950 border border-slate-800 rounded-xl p-1">
            <span className="text-slate-400 px-2 font-medium text-[11px]">Corridors:</span>
            <button
              onClick={() => applyPresetCorridor('AHMEDABAD_SG')}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg cursor-pointer transition text-[11px]"
            >
              Ahmedabad SG
            </button>
            <button
              onClick={() => applyPresetCorridor('SURAT_RING')}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg cursor-pointer transition text-[11px]"
            >
              Surat Ring
            </button>
            <button
              onClick={() => applyPresetCorridor('ANPR_INTERCEPT')}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg cursor-pointer transition text-[11px]"
            >
              ANPR Grid
            </button>
          </div>

          {/* Layout Grid Buttons */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1">
            {(['1x1', '2x2', '3x3', '4x4', '1+5'] as GridLayout[]).map(l => (
              <button
                key={l}
                onClick={() => {
                  setLayout(l);
                  setFocusedIndex(null);
                }}
                className={`px-2.5 py-1 rounded-lg font-mono font-bold transition cursor-pointer ${
                  layout === l
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          {/* Camera Drawer Button */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-xl font-semibold cursor-pointer shadow-lg transition"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Select Feeds</span>
          </button>
        </div>
      </div>

      {/* Main Multi-Tile Grid Container */}
      <div id="video-wall-grid" className="bg-slate-950 border border-slate-800/80 rounded-2xl p-3 sm:p-4 min-h-[550px] shadow-2xl">
        {focusedIndex !== null && activeCameras[focusedIndex] ? (
          /* Focused Single-Tile View */
          <div id="video-wall-focused-slot" className="space-y-3">
            <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs">
              <div className="flex items-center space-x-2 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                <span className="font-semibold text-white">Full-Screen Focus Mode:</span>
                <span className="font-mono text-cyan-300">{activeCameras[focusedIndex].global_id}</span>
                <span>({activeCameras[focusedIndex].landmark})</span>
              </div>
              <button
                onClick={() => setFocusedIndex(null)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1 rounded-lg font-semibold cursor-pointer"
              >
                Exit Focus (Return to {layout} Grid)
              </button>
            </div>
            <div className="max-w-5xl mx-auto">
              {evaluationMode === 'LIVE' && activeChannels[focusedIndex] ? (
                <LiveStreamPlayer
                  channel={activeChannels[focusedIndex]!}
                  camera={activeCameras[focusedIndex]}
                  isFocused={true}
                  onToggleFocus={() => setFocusedIndex(null)}
                  onInspectDigitalTwin={() => onSelectCameraForDigitalTwin(activeCameras[focusedIndex])}
                  onForensicSearch={() => onNavigateToTab && onNavigateToTab('METADATA_SEARCH', { cameraId: activeCameras[focusedIndex].global_id })}
                  onReconnect={onReconnectStream}
                  onInjectFault={onInjectFault}
                />
              ) : (
                <SimulatedCameraStream
                  camera={activeCameras[focusedIndex]}
                  isFocused={true}
                  onToggleFocus={() => setFocusedIndex(null)}
                  onInspectDigitalTwin={() => onSelectCameraForDigitalTwin(activeCameras[focusedIndex])}
                />
              )}
            </div>
          </div>
        ) : (
          /* Multi-Tile Responsive Grid */
          <div
            className={`grid gap-3 sm:gap-4 ${
              layout === '1x1'
                ? 'grid-cols-1'
                : layout === '2x2'
                ? 'grid-cols-1 md:grid-cols-2'
                : layout === '3x3'
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                : layout === '1+5'
                ? 'grid-cols-1 md:grid-cols-3'
                : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
            }`}
          >
            {activeCameras.map((camera, index) => {
              const isHeroInFocusLayout = layout === '1+5' && index === 0;
              const channel = activeChannels[index];
              return (
                <div
                  key={`${camera.id}-${index}`}
                  id={`video-tile-${index}`}
                  className={`${isHeroInFocusLayout ? 'md:col-span-2 md:row-span-2' : ''} relative`}
                >
                  {evaluationMode === 'LIVE' && channel ? (
                    <LiveStreamPlayer
                      channel={channel}
                      camera={camera}
                      isFocused={false}
                      onToggleFocus={() => setFocusedIndex(index)}
                      onInspectDigitalTwin={() => onSelectCameraForDigitalTwin(camera)}
                      onForensicSearch={() => onNavigateToTab && onNavigateToTab('METADATA_SEARCH', { cameraId: camera.global_id })}
                      onReconnect={onReconnectStream}
                      onInjectFault={onInjectFault}
                    />
                  ) : (
                    <SimulatedCameraStream
                      camera={camera}
                      isFocused={false}
                      onToggleFocus={() => setFocusedIndex(index)}
                      onInspectDigitalTwin={() => onSelectCameraForDigitalTwin(camera)}
                    />
                  )}

                  {/* Slot Change Trigger */}
                  <button
                    onClick={() => {
                      setTargetSlot(index);
                      setIsDrawerOpen(true);
                    }}
                    className="absolute top-2 right-2 z-20 bg-slate-900/90 hover:bg-blue-600 text-slate-300 hover:text-white p-1 rounded-md text-[10px] font-mono border border-slate-700 shadow-md transition cursor-pointer"
                    title={`Reassign Slot #${index + 1}`}
                  >
                    Slot #{index + 1}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Camera Selection Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] p-5 shadow-2xl flex flex-col space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white uppercase tracking-tight">
                  Assign Feed to Matrix Slot #{targetSlot + 1}
                </h3>
                <p className="text-xs text-slate-400">
                  Select an operational CCTV camera from Model 1 Master Registry
                </p>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="text-slate-400 hover:text-white text-sm font-bold bg-slate-800 px-3 py-1.5 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search landmark, global_id, type..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <select
                value={selectedDistrict}
                onChange={e => setSelectedDistrict(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">All Gujarat Districts</option>
                <option value="Ahmedabad">Ahmedabad</option>
                <option value="Surat">Surat</option>
                <option value="Vadodara">Vadodara</option>
                <option value="Rajkot">Rajkot</option>
                <option value="Gandhinagar">Gandhinagar</option>
                <option value="Bhavnagar">Bhavnagar</option>
                <option value="Jamnagar">Jamnagar</option>
              </select>
            </div>

            {/* Camera List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {drawerCameras.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-xs">
                  No cameras match your search filter.
                </div>
              ) : (
                drawerCameras.slice(0, 50).map(cam => (
                  <div
                    key={cam.id}
                    onClick={() => handleAssignCameraToSlot(cam)}
                    className="p-3 bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-blue-500/50 rounded-xl cursor-pointer transition flex items-center justify-between group"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono font-bold text-white group-hover:text-blue-300">
                          {cam.global_id}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                          cam.status === 'OPERATIONAL' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'
                        }`}>
                          {cam.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        <strong className="text-slate-300">{cam.district}</strong> • {cam.landmark}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Type: {cam.type} • Vendor: {cam.vendor} • Dept: {cam.department}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400" />
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
