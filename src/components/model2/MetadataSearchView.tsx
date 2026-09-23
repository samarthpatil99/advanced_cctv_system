import React, { useState, useEffect } from 'react';
import { Camera, MetadataSearchResult, MetadataSearchFilter } from '../../types';
import {
  Search,
  Filter,
  Car,
  User,
  SlidersHorizontal,
  Clock,
  MapPin,
  Camera as CameraIcon,
  Route,
  FolderPlus,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

interface MetadataSearchViewProps {
  cameras: Camera[];
  onSelectCameraForDigitalTwin: (camera: Camera) => void;
  onTrackVehicle?: (plate: string) => void;
  onNavigateToTab?: (tab: string, context?: any) => void;
}

export const MetadataSearchView: React.FC<MetadataSearchViewProps> = ({
  cameras,
  onSelectCameraForDigitalTwin,
  onTrackVehicle,
  onNavigateToTab,
}) => {
  const [targetType, setTargetType] = useState<'ALL' | 'VEHICLE' | 'PERSON'>('ALL');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');
  const [vehicleType, setVehicleType] = useState<string>('ALL');
  const [colorFilter, setColorFilter] = useState<string>('ALL');
  const [plateQuery, setPlateQuery] = useState<string>('');
  const [speedMin, setSpeedMin] = useState<number>(0);
  const [timeRange, setTimeRange] = useState<MetadataSearchFilter['time_range']>('LAST_24_HOURS');

  const [results, setResults] = useState<MetadataSearchResult[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [pinnedToCaseMsg, setPinnedToCaseMsg] = useState<string | null>(null);

  // Fetch search results from Model 2 API
  const performSearch = async () => {
    setIsLoading(true);
    try {
      const payload: MetadataSearchFilter = {
        target_type: targetType,
        district: selectedDistrict,
        vehicle_type: vehicleType !== 'ALL' ? vehicleType : undefined,
        color: colorFilter !== 'ALL' ? colorFilter : undefined,
        plate_query: plateQuery ? plateQuery.trim() : undefined,
        speed_min: speedMin > 0 ? speedMin : undefined,
        time_range: timeRange,
      };

      const res = await fetch('/api/model2/search/metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        setResults(data.items || []);
        setTotalCount(data.total || 0);
      }
    } catch (err) {
      console.error('Metadata search failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    performSearch();
  }, [targetType, selectedDistrict, vehicleType, colorFilter]);

  const handleResetFilters = () => {
    setTargetType('ALL');
    setSelectedDistrict('ALL');
    setVehicleType('ALL');
    setColorFilter('ALL');
    setPlateQuery('');
    setSpeedMin(0);
  };

  const handlePinToCase = (item: MetadataSearchResult) => {
    setPinnedToCaseMsg(`Attached detection [${item.id}] from ${item.global_camera_id} to Active Case Locker.`);
    setTimeout(() => setPinnedToCaseMsg(null), 3000);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight uppercase">
                Forensic Metadata Search
              </h2>
              <span className="bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[11px] font-mono px-2 py-0.5 rounded font-bold">
                MODEL 2 ANALYTICS
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Deep attribute search across video analytics streams indexed from Model 1 camera nodes statewide.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-400">Time Window:</span>
          <select
            value={timeRange}
            onChange={e => setTimeRange(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-1.5 focus:outline-none cursor-pointer font-medium"
          >
            <option value="LAST_1_HOUR">Last 1 Hour</option>
            <option value="LAST_6_HOURS">Last 6 Hours</option>
            <option value="LAST_24_HOURS">Last 24 Hours</option>
            <option value="LAST_7_DAYS">Last 7 Days</option>
            <option value="ALL">All Available Logs</option>
          </select>
        </div>
      </div>

      {/* Filter Control Console */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4 text-xs">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 space-x-1">
            <button
              onClick={() => setTargetType('ALL')}
              className={`px-3 py-1.5 rounded-lg font-semibold cursor-pointer transition ${
                targetType === 'ALL' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Targets
            </button>
            <button
              onClick={() => setTargetType('VEHICLE')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold cursor-pointer transition ${
                targetType === 'VEHICLE' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Car className="w-3.5 h-3.5" />
              <span>Vehicles</span>
            </button>
            <button
              onClick={() => setTargetType('PERSON')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold cursor-pointer transition ${
                targetType === 'PERSON' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Persons</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleResetFilters}
              className="text-slate-400 hover:text-white px-2.5 py-1 rounded-lg border border-slate-800 hover:bg-slate-800 cursor-pointer transition font-medium"
            >
              Reset Filters
            </button>
            <button
              onClick={performSearch}
              disabled={isLoading}
              className="flex items-center space-x-1.5 bg-purple-600 hover:bg-purple-500 text-white px-4 py-1.5 rounded-xl font-semibold cursor-pointer shadow-md transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Scanning...' : 'Apply Filters'}</span>
            </button>
          </div>
        </div>

        {/* Multi-Attribute Filter Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {/* District */}
          <div>
            <label className="block text-slate-400 font-medium mb-1">State District</label>
            <select
              value={selectedDistrict}
              onChange={e => setSelectedDistrict(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              <option value="ALL">All Gujarat Districts</option>
              <option value="Ahmedabad">Ahmedabad</option>
              <option value="Surat">Surat</option>
              <option value="Vadodara">Vadodara</option>
              <option value="Rajkot">Rajkot</option>
              <option value="Gandhinagar">Gandhinagar</option>
              <option value="Bhavnagar">Bhavnagar</option>
              <option value="Jamnagar">Jamnagar</option>
              <option value="Junagadh">Junagadh</option>
              <option value="Kutch-Kandla">Kutch-Kandla</option>
              <option value="Anand">Anand</option>
            </select>
          </div>

          {/* Vehicle Category */}
          {targetType !== 'PERSON' && (
            <div>
              <label className="block text-slate-400 font-medium mb-1">Vehicle Classification</label>
              <select
                value={vehicleType}
                onChange={e => setVehicleType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="ALL">All Vehicle Types</option>
                <option value="SUV">SUV / Compact SUV</option>
                <option value="SEDAN">Sedan / Hatchback</option>
                <option value="MOTORCYCLE">Motorcycle / Scooter</option>
                <option value="TRUCK">Heavy Commercial Truck</option>
                <option value="AUTO_RICKSHAW">Auto-Rickshaw</option>
                <option value="BUS">Transit Bus / Volvo</option>
              </select>
            </div>
          )}

          {/* Color Filter */}
          <div>
            <label className="block text-slate-400 font-medium mb-1">Visual Color Palette</label>
            <select
              value={colorFilter}
              onChange={e => setColorFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              <option value="ALL">Any Color</option>
              <option value="White">White / Off-White</option>
              <option value="Silver">Silver / Metallic Grey</option>
              <option value="Black">Black / Dark Charcoal</option>
              <option value="Red">Red / Maroon</option>
              <option value="Dark Blue">Blue / Navy</option>
              <option value="Grey">Grey</option>
              <option value="Golden Yellow">Yellow</option>
            </select>
          </div>

          {/* Plate Query */}
          <div>
            <label className="block text-slate-400 font-medium mb-1">License Plate Query</label>
            <input
              type="text"
              placeholder="e.g. GJ-01 or 4921"
              value={plateQuery}
              onChange={e => setPlateQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500 font-mono"
            />
          </div>

          {/* Speed Min Filter */}
          {targetType !== 'PERSON' && (
            <div>
              <label className="block text-slate-400 font-medium mb-1">Min Speed ({speedMin} km/h)</label>
              <input
                type="range"
                min="0"
                max="120"
                step="10"
                value={speedMin}
                onChange={e => setSpeedMin(Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer mt-2"
              />
            </div>
          )}
        </div>
      </div>

      {/* Feedback Toast */}
      {pinnedToCaseMsg && (
        <div className="bg-emerald-950 border border-emerald-800 text-emerald-300 px-4 py-2.5 rounded-xl text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{pinnedToCaseMsg}</span>
          </div>
          <button
            onClick={() => onNavigateToTab?.('investigations')}
            className="text-emerald-200 hover:underline font-bold"
          >
            Open Investigation Workspace →
          </button>
        </div>
      )}

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <div>
          Showing <strong className="text-white">{results.length}</strong> forensic detections (out of {totalCount} indexed)
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>Index synchronized with Model 1 Master Registry</span>
        </div>
      </div>

      {/* Results Grid */}
      {isLoading ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
          <RefreshCw className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-white">Scanning Video Analytics Index...</p>
          <p className="text-xs text-slate-500 mt-1">Cross-referencing camera streams and metadata vectors.</p>
        </div>
      ) : results.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
          <Search className="w-8 h-8 text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-semibold text-white">No detections match the selected forensic filters</p>
          <p className="text-xs text-slate-500 mt-1">Try widening the color palette, district or time window.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map(item => {
            const isVehicle = item.category === 'VEHICLE';
            const matchedCam = cameras.find(c => c.global_id === item.global_camera_id || c.id === item.camera_id);

            return (
              <div
                key={item.id}
                className="bg-slate-900 border border-slate-800 hover:border-purple-500/50 rounded-2xl p-4 transition shadow-lg flex flex-col justify-between group"
              >
                <div>
                  {/* Top Header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center space-x-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isVehicle ? 'bg-blue-600/20 text-blue-400' : 'bg-amber-600/20 text-amber-400'
                      }`}>
                        {isVehicle ? <Car className="w-4 h-4" /> : <User className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="font-bold text-white text-xs">
                          {isVehicle ? item.attributes.make || item.attributes.type : 'Pedestrian / Citizen'}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Confidence: <strong className="text-emerald-400">{item.confidence}%</strong>
                        </div>
                      </div>
                    </div>

                    <span className="bg-slate-950 border border-slate-800 text-slate-400 text-[10px] font-mono px-2 py-0.5 rounded">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Simulated Visual Crop Box */}
                  <div className="relative w-full h-32 bg-slate-950 rounded-xl border border-slate-800/80 overflow-hidden mb-3 flex items-center justify-center select-none">
                    {/* Visual silhouette and bounding box */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10"></div>
                    
                    <div className="w-28 h-20 border-2 border-dashed border-purple-500/80 rounded-lg flex flex-col items-center justify-center p-2 bg-purple-950/20">
                      {isVehicle ? (
                        <Car className="w-10 h-10 text-purple-300" />
                      ) : (
                        <User className="w-10 h-10 text-purple-300" />
                      )}
                      <span className="text-[9px] font-mono text-purple-300 mt-1 uppercase font-bold">
                        {isVehicle ? item.attributes.color : item.attributes.clothing_upper}
                      </span>
                    </div>

                    <div className="absolute bottom-2 left-2 z-20 text-[10px] font-mono text-slate-300">
                      ID: {item.id}
                    </div>

                    {item.attributes.speed_kmh && (
                      <div className="absolute bottom-2 right-2 z-20 text-[10px] font-mono bg-blue-950 text-blue-300 px-1.5 py-0.5 rounded border border-blue-800">
                        {item.attributes.speed_kmh} km/h
                      </div>
                    )}
                  </div>

                  {/* Attributes Badges */}
                  <div className="flex flex-wrap gap-1.5 mb-3 text-[11px]">
                    {isVehicle ? (
                      <>
                        <span className="bg-slate-950 text-slate-300 px-2 py-0.5 rounded border border-slate-800">
                          Color: <strong className="text-white">{item.attributes.color}</strong>
                        </span>
                        <span className="bg-slate-950 text-slate-300 px-2 py-0.5 rounded border border-slate-800">
                          Type: <strong className="text-white">{item.attributes.type}</strong>
                        </span>
                        {item.attributes.plate && (
                          <span className="bg-amber-950/60 text-amber-300 font-mono font-bold px-2 py-0.5 rounded border border-amber-800/60">
                            {item.attributes.plate}
                          </span>
                        )}
                      </>
                    ) : (
                      <>
                        <span className="bg-slate-950 text-slate-300 px-2 py-0.5 rounded border border-slate-800">
                          Upper: <strong className="text-white">{item.attributes.clothing_upper}</strong>
                        </span>
                        <span className="bg-slate-950 text-slate-300 px-2 py-0.5 rounded border border-slate-800">
                          Lower: <strong className="text-white">{item.attributes.clothing_lower}</strong>
                        </span>
                        {item.attributes.has_helmet && (
                          <span className="bg-blue-950 text-blue-300 px-2 py-0.5 rounded border border-blue-800">
                            Helmet Detected
                          </span>
                        )}
                        {item.attributes.has_backpack && (
                          <span className="bg-amber-950 text-amber-300 px-2 py-0.5 rounded border border-amber-800">
                            Backpack
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  {/* Location & Model 1 Camera Reference */}
                  <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-2.5 text-xs text-slate-400 space-y-1 mb-3">
                    <div className="flex items-center space-x-1.5 text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                      <span className="truncate font-medium">
                        <strong className="text-white">{item.district}</strong>: {item.landmark}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-mono pt-1 border-t border-slate-900">
                      <span className="text-slate-500">Model 1 Node:</span>
                      <button
                        onClick={() => matchedCam && onSelectCameraForDigitalTwin(matchedCam)}
                        className="text-blue-400 hover:text-blue-300 font-bold truncate max-w-[160px] cursor-pointer"
                        title={item.global_camera_id}
                      >
                        {item.global_camera_id}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="flex items-center space-x-2 pt-2 border-t border-slate-800/80 text-xs">
                  {item.attributes.plate && (
                    <button
                      onClick={() => onTrackVehicle?.(item.attributes.plate!)}
                      className="flex-1 flex items-center justify-center space-x-1 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 py-1.5 rounded-lg font-semibold cursor-pointer transition"
                      title="Generate Cross-Camera Spatio-Temporal Path"
                    >
                      <Route className="w-3 h-3" />
                      <span>Track Path</span>
                    </button>
                  )}

                  {matchedCam && (
                    <button
                      onClick={() => onSelectCameraForDigitalTwin(matchedCam)}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer transition font-medium text-[11px]"
                      title="Inspect Model 1 Hardware & Network Specs"
                    >
                      Inspect Twin
                    </button>
                  )}

                  <button
                    onClick={() => handlePinToCase(item)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg cursor-pointer transition"
                    title="Pin Detection into Investigation Case Locker"
                  >
                    <FolderPlus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
