import React, { useState, useEffect } from 'react';
import { Camera, AnprHit, WatchlistRecord } from '../../types';
import {
  CreditCard,
  Search,
  Filter,
  ShieldAlert,
  AlertTriangle,
  MapPin,
  Car,
  Route,
  FileText,
  PlusCircle,
  Clock,
  Gauge,
  Compass,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface AnprFeedViewProps {
  cameras: Camera[];
  onSelectCameraForDigitalTwin: (camera: Camera) => void;
  onInvestigateVehicle: (plate: string) => void;
  onTrackVehicleMovement: (plate: string) => void;
  onNavigateToTab?: (tab: string, context?: any) => void;
}

export const AnprFeedView: React.FC<AnprFeedViewProps> = ({
  cameras,
  onSelectCameraForDigitalTwin,
  onInvestigateVehicle,
  onTrackVehicleMovement,
  onNavigateToTab,
}) => {
  const [hits, setHits] = useState<AnprHit[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistRecord[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [watchlistCount, setWatchlistCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Filters
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [watchlistOnly, setWatchlistOnly] = useState<boolean>(false);
  const [plateSearch, setPlateSearch] = useState<string>('');

  // Watchlist modal
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newPlate, setNewPlate] = useState<string>('');
  const [newOwner, setNewOwner] = useState<string>('');
  const [newCategory, setNewCategory] = useState<WatchlistRecord['category']>('STOLEN_VEHICLE');
  const [newFlaggedBy, setNewFlaggedBy] = useState<string>('Ahmedabad Traffic Crime Division');
  const [newNotes, setNewNotes] = useState<string>('');
  const [addSuccessMsg, setAddSuccessMsg] = useState<string | null>(null);

  const fetchHits = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedDistrict !== 'ALL') params.append('district', selectedDistrict);
      if (selectedCategory !== 'ALL') params.append('category', selectedCategory);
      if (watchlistOnly) params.append('watchlistOnly', 'true');
      if (plateSearch) params.append('plateSearch', plateSearch.trim());

      const res = await fetch(`/api/model2/anpr/hits?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setHits(data.items || []);
        setTotalCount(data.total || 0);
        setWatchlistCount(data.watchlist_hits_count || 0);
      }
    } catch (err) {
      console.error('Failed to load ANPR hits:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWatchlist = async () => {
    try {
      const res = await fetch('/api/model2/anpr/watchlist');
      if (res.ok) {
        const data = await res.json();
        setWatchlist(data || []);
      }
    } catch (err) {
      console.error('Failed to load watchlist:', err);
    }
  };

  useEffect(() => {
    fetchHits();
    fetchWatchlist();
  }, [selectedDistrict, selectedCategory, watchlistOnly]);

  const handleCreateWatchlistEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlate || !newCategory) return;

    try {
      const res = await fetch('/api/model2/anpr/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plate_number: newPlate.toUpperCase().trim(),
          owner_name: newOwner,
          category: newCategory,
          flagged_by: newFlaggedBy,
          notes: newNotes,
        }),
      });

      if (res.ok) {
        setAddSuccessMsg(`Vehicle ${newPlate.toUpperCase()} added to Statewide Surveillance Watchlist.`);
        setIsAddModalOpen(false);
        setNewPlate('');
        setNewOwner('');
        setNewNotes('');
        fetchWatchlist();
        fetchHits();
        setTimeout(() => setAddSuccessMsg(null), 3500);
      }
    } catch (err) {
      console.error('Failed to add to watchlist:', err);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & Stats */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-600/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight uppercase">
                Automatic Number Plate Recognition (ANPR)
              </h2>
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-mono px-2 py-0.5 rounded font-bold">
                MODEL 2 TELEMETRY
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live automated plate captures streaming from high-speed ANPR camera junctions across Gujarat highways.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center space-x-1.5 bg-rose-600 hover:bg-rose-500 text-white px-3.5 py-2 rounded-xl font-bold cursor-pointer shadow-lg transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Flag Vehicle to Watchlist</span>
          </button>
        </div>
      </div>

      {/* Metric Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="text-slate-400 font-medium">Total Captures Today</div>
          <div className="text-2xl font-extrabold text-white mt-1 font-mono">18,490</div>
          <div className="text-[11px] text-emerald-400 mt-0.5 flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Streaming in real time</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-rose-900/40 bg-gradient-to-br from-rose-950/20 to-slate-900 rounded-2xl p-4">
          <div className="text-rose-300 font-medium flex items-center justify-between">
            <span>Watchlist Hotlist Hits</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-extrabold text-rose-400 mt-1 font-mono">{watchlistCount}</div>
          <div className="text-[11px] text-rose-300/80 mt-0.5 font-medium">
            Immediate intercept priority
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="text-slate-400 font-medium">Active Watchlist Targets</div>
          <div className="text-2xl font-extrabold text-amber-300 mt-1 font-mono">{watchlist.length}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Stolen / Warrant / Fitness</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="text-slate-400 font-medium">ANPR Camera Nodes</div>
          <div className="text-2xl font-extrabold text-blue-400 mt-1 font-mono">
            {cameras.filter(c => c.type === 'ANPR' || c.capabilities.some(cap => cap.includes('ANPR'))).length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Model 1 Integrated assets</div>
        </div>
      </div>

      {/* Success Notification */}
      {addSuccessMsg && (
        <div className="bg-emerald-950 border border-emerald-800 text-emerald-300 px-4 py-3 rounded-xl text-xs flex items-center space-x-2 shadow-lg">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{addSuccessMsg}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              id="anpr-search-input"
              type="text"
              placeholder="Search plate (e.g. GJ-01 or 4921)..."
              value={plateSearch}
              onChange={e => setPlateSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchHits()}
              className="bg-slate-950 border border-slate-800 text-white rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:border-amber-500 font-mono text-xs w-56"
            />
          </div>

          {/* District */}
          <select
            value={selectedDistrict}
            onChange={e => setSelectedDistrict(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Districts</option>
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

          {/* Vehicle Category */}
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Vehicle Types</option>
            <option value="SEDAN">Sedan</option>
            <option value="SUV">SUV</option>
            <option value="MOTORCYCLE">Motorcycle</option>
            <option value="AUTO_RICKSHAW">Auto-Rickshaw</option>
            <option value="TRUCK">Heavy Commercial Truck</option>
            <option value="BUS">Bus</option>
          </select>

          {/* Watchlist Toggle */}
          <button
            onClick={() => setWatchlistOnly(!watchlistOnly)}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl font-bold cursor-pointer transition ${
              watchlistOnly
                ? 'bg-rose-600 text-white shadow-lg'
                : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Watchlist Hits Only</span>
          </button>
        </div>

        <button
          onClick={fetchHits}
          className="text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 cursor-pointer transition font-medium"
        >
          Refresh Feed
        </button>
      </div>

      {/* ANPR Live Plate Detection Cards */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center text-slate-400">
            <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full mx-auto mb-3"></div>
            <p className="text-sm font-semibold text-white">Streaming Live ANPR Captures...</p>
          </div>
        ) : hits.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center text-slate-400">
            <CreditCard className="w-8 h-8 text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-semibold text-white">No ANPR detections matching filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {hits.map(hit => {
              const matchedCam = cameras.find(c => c.global_id === hit.global_camera_id || c.id === hit.camera_id);
              return (
                <div
                  key={hit.id}
                  id={hit.plate_number === 'GJ-01-AX-9901' || hit.is_watchlist_match ? 'anpr-detection-card' : undefined}
                  className={`bg-slate-900 border rounded-2xl p-4 transition shadow-md flex flex-col justify-between ${
                    hit.is_watchlist_match
                      ? 'border-rose-500/80 bg-gradient-to-br from-rose-950/30 to-slate-900 ring-1 ring-rose-500/40'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    {/* Top Alert / Time Bar */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      {hit.is_watchlist_match ? (
                        <span className="flex items-center space-x-1.5 bg-rose-600 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase animate-pulse">
                          <ShieldAlert className="w-3 h-3" />
                          <span>HOTLIST INTERCEPT ALERT</span>
                        </span>
                      ) : (
                        <span className="bg-slate-950 text-slate-400 text-[10px] font-mono px-2 py-0.5 rounded border border-slate-800">
                          LANE #{hit.lane_number}
                        </span>
                      )}

                      <span className="text-[11px] font-mono text-slate-400">
                        {new Date(hit.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>

                    {/* Realistic Indian Number Plate Display */}
                    <div className="my-2 p-2 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center">
                      <div className="bg-white text-black font-mono font-black text-base sm:text-lg px-3 py-1.5 rounded-md border-2 border-black flex items-center space-x-2 tracking-wider shadow-inner">
                        {/* Blue IND Strip */}
                        <div className="bg-blue-800 text-white text-[8px] font-bold px-1 py-1 rounded-sm flex flex-col items-center leading-none">
                          <span>IND</span>
                        </div>
                        <span className="select-all">{hit.plate_number}</span>
                      </div>
                    </div>

                    {hit.watchlist_reason && (
                      <div className="bg-rose-950/60 border border-rose-800/80 rounded-xl p-2.5 text-[11px] text-rose-200 mb-3 font-medium">
                        ⚠️ <strong>Watchlist Reason:</strong> {hit.watchlist_reason}
                      </div>
                    )}

                    {/* Vehicle Telemetry Details */}
                    <div className="space-y-1.5 text-xs text-slate-400 my-3">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Vehicle Make & Type:</span>
                        <span className="font-semibold text-white">
                          {hit.vehicle_make} ({hit.vehicle_category})
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Color & Confidence:</span>
                        <span className="text-slate-300">
                          {hit.vehicle_color} • <strong className="text-emerald-400">{hit.confidence}% OCR</strong>
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Speed & Direction:</span>
                        <span className="font-mono text-slate-300">
                          <strong className={hit.speed_kmh > 80 ? 'text-amber-400 font-bold' : 'text-slate-300'}>
                            {hit.speed_kmh} km/h
                          </strong>{' '}
                          • {hit.direction}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">RTO Jurisdiction:</span>
                        <span className="text-amber-300/90 font-medium">{hit.rto_division}</span>
                      </div>
                    </div>

                    {/* Camera Node info */}
                    <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2 text-xs text-slate-400 space-y-1 mb-3">
                      <div className="flex items-center space-x-1.5 text-slate-300">
                        <MapPin className="w-3 h-3 text-amber-400 flex-shrink-0" />
                        <span className="truncate font-medium">
                          <strong>{hit.district}</strong>: {hit.location}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-mono pt-1 border-t border-slate-900">
                        <span className="text-slate-500">Camera:</span>
                        <button
                          onClick={() => matchedCam && onSelectCameraForDigitalTwin(matchedCam)}
                          className="text-blue-400 hover:text-blue-300 font-bold truncate max-w-[150px] cursor-pointer"
                          title={hit.global_camera_id}
                        >
                          {hit.global_camera_id}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 pt-2 border-t border-slate-800 text-xs">
                    <button
                      onClick={() => onInvestigateVehicle(hit.plate_number)}
                      className="flex-1 flex items-center justify-center space-x-1 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 py-1.5 rounded-lg font-bold cursor-pointer transition text-[11px]"
                    >
                      <FileText className="w-3 h-3" />
                      <span>Investigate</span>
                    </button>

                    <button
                      onClick={() => onTrackVehicleMovement(hit.plate_number)}
                      className="flex-1 flex items-center justify-center space-x-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 py-1.5 rounded-lg font-bold cursor-pointer transition text-[11px]"
                    >
                      <Route className="w-3 h-3" />
                      <span>Track Path</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Flag Vehicle to Watchlist Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-5 h-5 text-rose-500" />
                <h3 className="text-base font-bold text-white uppercase tracking-tight">
                  Flag Vehicle to Hotlist
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateWatchlistEntry} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Target License Plate</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GJ-01-ER-4921"
                  value={newPlate}
                  onChange={e => setNewPlate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white font-mono uppercase font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-rose-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Target Category / Reason</label>
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-rose-500 cursor-pointer"
                >
                  <option value="STOLEN_VEHICLE">Stolen Vehicle (IPC Sec 379)</option>
                  <option value="WANTED_SUSPECT">Wanted Suspect / Fugitive</option>
                  <option value="CRIMINAL_INVESTIGATION">Active Criminal Investigation</option>
                  <option value="EXPIRED_COMMERCIAL_FITNESS">Expired Commercial Fitness</option>
                  <option value="VIP_ESCORT">VIP / Dignitary Escort Security</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Flagging Authority</label>
                <input
                  type="text"
                  required
                  value={newFlaggedBy}
                  onChange={e => setNewFlaggedBy(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Case Description & Notes</label>
                <textarea
                  rows={3}
                  placeholder="Enter details of incident, suspect description, or warrant number..."
                  value={newNotes}
                  onChange={e => setNewNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-rose-500"
                ></textarea>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-lg cursor-pointer transition"
                >
                  Add to Watchlist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
