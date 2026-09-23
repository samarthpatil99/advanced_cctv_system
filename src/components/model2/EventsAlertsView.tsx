import React, { useState, useEffect } from 'react';
import { Camera, VideoAnalyticsEvent, EventSeverity, EventStatus, VideoAnalyticsEventType } from '../../types';
import { EvidenceContextModal } from './EvidenceContextModal';
import {
  Bell,
  Search,
  Filter,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Clock,
  UserCheck,
  MapPin,
  FolderPlus,
  RefreshCw,
  Sparkles,
  FileText,
} from 'lucide-react';

interface EventsAlertsViewProps {
  cameras: Camera[];
  onSelectCameraForDigitalTwin: (camera: Camera) => void;
  onTrackVehicle?: (plate: string) => void;
  onNavigateToTab?: (tab: string, context?: any) => void;
}

export const EventsAlertsView: React.FC<EventsAlertsViewProps> = ({
  cameras,
  onSelectCameraForDigitalTwin,
  onTrackVehicle,
  onNavigateToTab,
}) => {
  const [events, setEvents] = useState<VideoAnalyticsEvent[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedEventForEvidence, setSelectedEventForEvidence] = useState<VideoAnalyticsEvent | null>(null);

  // Filters
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedSeverity !== 'ALL') params.append('severity', selectedSeverity);
      if (selectedStatus !== 'ALL') params.append('status', selectedStatus);
      if (selectedType !== 'ALL') params.append('eventType', selectedType);
      if (selectedDistrict !== 'ALL') params.append('district', selectedDistrict);
      if (searchQuery) params.append('search', searchQuery.trim());

      const res = await fetch(`/api/model2/events?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setEvents(data.items || []);
        setTotalCount(data.total || 0);
      }
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [selectedSeverity, selectedStatus, selectedType, selectedDistrict]);

  const handleUpdateStatus = async (eventId: string, newStatus: EventStatus) => {
    try {
      const res = await fetch(`/api/model2/events/${eventId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          officer: newStatus === 'ACKNOWLEDGED' ? 'Officer V. Patel' : undefined,
        }),
      });

      if (res.ok) {
        setNotificationMsg(`Event [${eventId}] status updated to ${newStatus}.`);
        setEvents(prev =>
          prev.map(ev => (ev.id === eventId ? { ...ev, status: newStatus, assigned_officer: 'Officer V. Patel' } : ev))
        );
        setTimeout(() => setNotificationMsg(null), 3000);
      }
    } catch (err) {
      console.error('Failed to update event status:', err);
    }
  };

  const criticalCount = events.filter(e => e.severity === 'CRITICAL').length;
  const newCount = events.filter(e => e.status === 'NEW').length;

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight uppercase">
                AI Video Analytics & Alert Center
              </h2>
              <span className="bg-red-500/20 text-red-300 border border-red-500/40 text-[11px] font-mono px-2 py-0.5 rounded font-bold">
                INCIDENT DISPATCH
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Automated anomaly detection triggers linked to Model 1 physical cameras across Gujarat.
            </p>
          </div>
        </div>

        {/* Status Counters */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            <span className="text-slate-400 font-medium">Critical Alerts:</span>
            <strong className="text-rose-400 font-mono text-sm">{criticalCount}</strong>
          </div>
          <div className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 flex items-center space-x-2">
            <span className="text-slate-400 font-medium">Pending Review:</span>
            <strong className="text-amber-300 font-mono text-sm">{newCount}</strong>
          </div>
        </div>
      </div>

      {notificationMsg && (
        <div className="bg-emerald-950 border border-emerald-800 text-emerald-300 px-4 py-3 rounded-xl text-xs flex items-center space-x-2 shadow-lg">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search title, plate, or camera..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchEvents()}
              className="bg-slate-950 border border-slate-800 text-white rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:border-red-500 text-xs w-56"
            />
          </div>

          {/* Severity */}
          <select
            value={selectedSeverity}
            onChange={e => setSelectedSeverity(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical Only</option>
            <option value="HIGH">High Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="LOW">Low Priority</option>
          </select>

          {/* Status */}
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="NEW">New (Unreviewed)</option>
            <option value="ACKNOWLEDGED">Acknowledged</option>
            <option value="IN_INVESTIGATION">Under Investigation</option>
            <option value="RESOLVED">Resolved</option>
          </select>

          {/* Event Type */}
          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Event Types</option>
            <option value="WATCHLIST_PLATE_HIT">Watchlist Plate Hit</option>
            <option value="WRONG_WAY_DRIVING">Wrong-Way Driving</option>
            <option value="PERIMETER_INTRUSION">Perimeter Intrusion</option>
            <option value="TRAFFIC_CONGESTION">Traffic Gridlock</option>
            <option value="SPEED_VIOLATION">Speed Violation</option>
            <option value="CROWD_GATHERING">Crowd Gathering</option>
            <option value="ABANDONED_OBJECT">Abandoned Object</option>
            <option value="CAMERA_TAMPERING_OCCLUSION">Camera Tampering</option>
          </select>

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
          </select>
        </div>

        <button
          onClick={fetchEvents}
          className="text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 cursor-pointer transition font-medium"
        >
          Refresh Feed
        </button>
      </div>

      {/* Events List */}
      <div id="events-feed-list" className="space-y-3">
        {isLoading ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center text-slate-400">
            <RefreshCw className="w-8 h-8 text-red-500 animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold text-white">Streaming AI Analytics Alerts...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center text-slate-400">
            <Bell className="w-8 h-8 text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-semibold text-white">No active events matching filter</p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((ev, evIdx) => {
              const matchedCam = cameras.find(c => c.global_id === ev.global_camera_id || c.id === ev.camera_id);
              const isCritical = ev.severity === 'CRITICAL';
              const isHigh = ev.severity === 'HIGH';

              return (
                <div
                  key={ev.id}
                  id={evIdx === 0 ? 'primary-ai-event-card' : `event-card-${ev.id}`}
                  className={`bg-slate-900 border rounded-2xl p-4 sm:p-5 transition shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                    isCritical
                      ? 'border-rose-500/80 bg-gradient-to-r from-rose-950/20 via-slate-900 to-slate-900 ring-1 ring-rose-500/40'
                      : isHigh
                      ? 'border-amber-500/60 bg-gradient-to-r from-amber-950/15 via-slate-900 to-slate-900'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Left Column: Icon & Event Description */}
                  <div className="flex items-start space-x-3.5 max-w-2xl">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isCritical ? 'bg-rose-600/20 text-rose-400 border border-rose-500/40' : 'bg-amber-600/20 text-amber-400 border border-amber-500/40'
                    }`}>
                      {isCritical ? <ShieldAlert className="w-5 h-5 animate-pulse" /> : <AlertTriangle className="w-5 h-5" />}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                          isCritical ? 'bg-rose-600 text-white' : isHigh ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-300'
                        }`}>
                          {ev.severity}
                        </span>

                        <span className="bg-slate-950 text-slate-300 text-[10px] font-mono px-2 py-0.5 rounded border border-slate-800">
                          {ev.event_type.replace(/_/g, ' ')}
                        </span>

                        <span className="text-[11px] font-mono text-slate-400">
                          {new Date(ev.timestamp).toLocaleString()}
                        </span>
                      </div>

                      <h4 className="text-white font-bold text-sm mt-1.5">{ev.title}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{ev.description}</p>

                      {/* Location & Metadata Badges */}
                      <div className="flex flex-wrap items-center gap-2 mt-2.5 text-xs">
                        <span className="flex items-center space-x-1 text-slate-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                          <MapPin className="w-3 h-3 text-red-400" />
                          <span><strong>{ev.district}</strong>: {ev.camera_name.split('-')[1] || ev.camera_name}</span>
                        </span>

                        <span className="text-[11px] font-mono text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-900">
                          Model 1: {ev.global_camera_id}
                        </span>

                        {ev.metadata.license_plate && (
                          <span className="bg-amber-950/60 text-amber-300 font-mono font-bold px-2 py-0.5 rounded border border-amber-800">
                            Plate: {ev.metadata.license_plate}
                          </span>
                        )}

                        <span className="text-[11px] text-emerald-400 font-mono">
                          Confidence: {ev.confidence}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Status & Incident Actions */}
                  <div className="flex md:flex-col items-end justify-between md:justify-center gap-2 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-slate-800 text-xs">
                    <div className="flex items-center space-x-2">
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${
                        ev.status === 'NEW'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : ev.status === 'ACKNOWLEDGED'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}>
                        Status: {ev.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center space-x-2">
                      {/* Evidence Context Card Trigger */}
                      <button
                        id={evIdx === 0 ? 'evidence-card-trigger-btn' : undefined}
                        onClick={() => setSelectedEventForEvidence(ev)}
                        className="flex items-center space-x-1 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/80 px-2.5 py-1.5 rounded-lg cursor-pointer transition text-xs font-semibold shadow"
                        title="Open Standardized Evidence Context Card"
                      >
                        <FileText className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Evidence Card</span>
                      </button>

                      {ev.status === 'NEW' && (
                        <button
                          onClick={() => handleUpdateStatus(ev.id, 'ACKNOWLEDGED')}
                          className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-3 py-1.5 rounded-lg cursor-pointer transition text-xs shadow-md"
                        >
                          Acknowledge
                        </button>
                      )}

                      {ev.status === 'ACKNOWLEDGED' && (
                        <button
                          onClick={() => handleUpdateStatus(ev.id, 'RESOLVED')}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg cursor-pointer transition text-xs shadow-md"
                        >
                          Mark Resolved
                        </button>
                      )}

                      {matchedCam && (
                        <button
                          onClick={() => onSelectCameraForDigitalTwin(matchedCam)}
                          className="bg-slate-800 hover:bg-slate-700 text-blue-300 border border-slate-700 px-3 py-1.5 rounded-lg cursor-pointer transition text-xs font-semibold"
                          title="Open Model 1 Verified Master Digital Twin"
                        >
                          Twin Specs
                        </button>
                      )}

                      {ev.metadata.license_plate && onTrackVehicle && (
                        <button
                          onClick={() => onTrackVehicle(ev.metadata.license_plate!)}
                          className="bg-purple-950 hover:bg-purple-900 text-purple-300 border border-purple-800 px-3 py-1.5 rounded-lg cursor-pointer transition text-xs font-semibold"
                        >
                          Track Plate
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Standardized Evidence Context Modal */}
      <EvidenceContextModal
        isOpen={!!selectedEventForEvidence}
        onClose={() => setSelectedEventForEvidence(null)}
        event={selectedEventForEvidence}
        camera={cameras.find(
          c =>
            selectedEventForEvidence &&
            (c.global_id === selectedEventForEvidence.global_camera_id || c.id === selectedEventForEvidence.camera_id)
        )}
        onOpenDigitalTwin={cam => onSelectCameraForDigitalTwin(cam)}
        onTrackVehicle={plate => onTrackVehicle && onTrackVehicle(plate)}
      />
    </div>
  );
};
