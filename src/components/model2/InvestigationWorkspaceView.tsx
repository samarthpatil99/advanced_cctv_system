import React, { useState, useEffect } from 'react';
import { Camera, InvestigationCase } from '../../types';
import {
  FolderLock,
  PlusCircle,
  FileText,
  Clock,
  ShieldCheck,
  AlertTriangle,
  MapPin,
  Camera as CameraIcon,
  Tv,
  CheckCircle2,
  Send,
  Printer,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface InvestigationWorkspaceViewProps {
  cameras: Camera[];
  onSelectCameraForDigitalTwin: (camera: Camera) => void;
  onNavigateToTab?: (tab: string, context?: any) => void;
}

export const InvestigationWorkspaceView: React.FC<InvestigationWorkspaceViewProps> = ({
  cameras,
  onSelectCameraForDigitalTwin,
  onNavigateToTab,
}) => {
  const [cases, setCases] = useState<InvestigationCase[]>([]);
  const [activeCaseId, setActiveCaseId] = useState<string>('case-1');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // New Note state
  const [newNoteContent, setNewNoteContent] = useState<string>('');
  const [noteAuthor, setNoteAuthor] = useState<string>('Inspector R. V. Zala');

  // New Case Modal state
  const [isNewCaseModalOpen, setIsNewCaseModalOpen] = useState<boolean>(false);
  const [newCaseTitle, setNewCaseTitle] = useState<string>('');
  const [newCasePriority, setNewCasePriority] = useState<InvestigationCase['priority']>('HIGH');
  const [newCaseLocation, setNewCaseLocation] = useState<string>('');
  const [newCaseDesc, setNewCaseDesc] = useState<string>('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const fetchCases = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/model2/cases');
      if (res.ok) {
        const data = await res.json();
        setCases(data || []);
        if (data && data.length > 0 && !activeCaseId) {
          setActiveCaseId(data[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load cases:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const activeCase = cases.find(c => c.id === activeCaseId) || cases[0];

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim() || !activeCase) return;

    try {
      const res = await fetch(`/api/model2/cases/${activeCase.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: noteAuthor,
          content: newNoteContent.trim(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setCases(prev => prev.map(c => (c.id === activeCase.id ? data.case : c)));
        setNewNoteContent('');
        setToastMsg('Investigation note logged to Case Dossier.');
        setTimeout(() => setToastMsg(null), 3000);
      }
    } catch (err) {
      console.error('Failed to add note:', err);
    }
  };

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCaseTitle.trim()) return;

    try {
      const res = await fetch('/api/model2/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newCaseTitle,
          priority: newCasePriority,
          location_summary: newCaseLocation,
          description: newCaseDesc,
          lead_investigator: noteAuthor,
          pinned_camera_ids: cameras.slice(0, 2).map(c => c.global_id),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setCases(prev => [data.case, ...prev]);
        setActiveCaseId(data.case.id);
        setIsNewCaseModalOpen(false);
        setNewCaseTitle('');
        setNewCaseLocation('');
        setNewCaseDesc('');
        setToastMsg(`Case #${data.case.case_number} registered successfully.`);
        setTimeout(() => setToastMsg(null), 3500);
      }
    } catch (err) {
      console.error('Failed to create case:', err);
    }
  };

  const handlePrintDossier = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <FolderLock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight uppercase">
                Investigation Workspace & Evidence Dossier
              </h2>
              <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-[11px] font-mono px-2 py-0.5 rounded font-bold">
                STATE CRIME DOSSIER
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Secure case evidence locker combining Model 1 physical camera nodes, AI detection events, and ANPR passage tracks.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <button
            onClick={() => setIsNewCaseModalOpen(true)}
            className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3.5 py-2 rounded-xl cursor-pointer transition shadow-md"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Open New Case</span>
          </button>
        </div>
      </div>

      {toastMsg && (
        <div className="bg-emerald-950 border border-emerald-800 text-emerald-300 px-4 py-3 rounded-xl text-xs flex items-center space-x-2 shadow-lg">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Main Workspace 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column: Cases Navigator */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs text-slate-400">
            <span className="font-bold text-white uppercase tracking-wider">Active Investigations</span>
            <span className="font-mono text-indigo-400 font-bold">{cases.length} Registered</span>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {cases.map(c => {
              const isSelected = activeCase?.id === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => setActiveCaseId(c.id)}
                  className={`p-3.5 rounded-xl border transition cursor-pointer text-xs ${
                    isSelected
                      ? 'bg-indigo-950/50 border-indigo-500 shadow-md ring-1 ring-indigo-500/40'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-indigo-400 text-[11px]">{c.case_number}</span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                      c.priority === 'URGENT' ? 'bg-rose-600 text-white' : c.priority === 'HIGH' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {c.priority}
                    </span>
                  </div>

                  <div className="font-bold text-white text-xs leading-snug">{c.title}</div>
                  <div className="text-[11px] text-slate-400 mt-1 truncate">{c.location_summary}</div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mt-2 pt-2 border-t border-slate-900">
                    <span>{c.pinned_camera_ids.length} Cameras Pinned</span>
                    <span>Status: <strong className="text-slate-300">{c.status}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Case Dossier Detail */}
        {activeCase ? (
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5 text-xs">
            {/* Dossier Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="bg-indigo-600 text-white font-mono font-bold text-xs px-2.5 py-0.5 rounded">
                    {activeCase.case_number}
                  </span>
                  <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${
                    activeCase.status === 'ACTIVE' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {activeCase.status}
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-white mt-1.5">{activeCase.title}</h3>
                <div className="text-slate-400 mt-0.5 flex items-center space-x-2">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                  <span>{activeCase.location_summary}</span>
                </div>
              </div>

              <button
                id="dossier-export-btn"
                onClick={handlePrintDossier}
                className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500 px-3.5 py-1.5 rounded-xl font-bold cursor-pointer transition shadow-lg"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Export Dossier (PDF / Print)</span>
              </button>
            </div>

            {/* Case Narrative */}
            <div>
              <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[11px] mb-1">
                Incident Summary
              </h4>
              <p className="bg-slate-950 border border-slate-800/80 rounded-xl p-3.5 text-slate-300 leading-relaxed">
                {activeCase.description}
              </p>
              <div className="text-[11px] text-slate-400 mt-1 font-mono">
                Lead Investigator: <strong className="text-white">{activeCase.lead_investigator}</strong> • Opened:{' '}
                {new Date(activeCase.created_at).toLocaleString()}
              </div>
            </div>

            {/* Pinned Model 1 Cameras */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center space-x-1.5">
                  <CameraIcon className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Pinned Model 1 Surveillance Feeds ({activeCase.pinned_camera_ids.length})</span>
                </h4>
                <button
                  onClick={() => onNavigateToTab?.('video_wall')}
                  className="text-indigo-400 hover:text-indigo-300 font-semibold"
                >
                  View on Video Wall →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {activeCase.pinned_camera_ids.map(camId => {
                  const cam = cameras.find(c => c.global_id === camId || c.id === camId);
                  return (
                    <div
                      key={camId}
                      className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-mono font-bold text-white text-xs">{camId}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[200px]">
                          {cam ? `${cam.district} - ${cam.landmark}` : 'Model 1 Verified Node'}
                        </div>
                      </div>

                      {cam && (
                        <button
                          onClick={() => onSelectCameraForDigitalTwin(cam)}
                          className="bg-slate-900 hover:bg-slate-800 text-blue-300 border border-slate-700 px-2 py-1 rounded text-[10px] font-mono font-bold cursor-pointer"
                        >
                          Twin Specs
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Attached Evidence Items */}
            <div id="investigation-evidence-locker">
              <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[11px] mb-2 flex items-center space-x-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                <span>Evidence Locker: AI Alerts & ANPR Hits</span>
              </h4>

              <div className="space-y-2">
                {activeCase.evidence_events.map(ev => (
                  <div
                    key={ev.id}
                    className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-mono text-rose-400 font-bold mr-2">[{ev.severity}]</span>
                      <strong className="text-white">{ev.title}</strong>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Camera: {ev.global_camera_id} • Time: {new Date(ev.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                    <span className="bg-slate-900 border border-slate-800 text-slate-300 font-mono text-[10px] px-2 py-0.5 rounded">
                      Confidence: {ev.confidence}%
                    </span>
                  </div>
                ))}

                {activeCase.evidence_anpr_hits.map(hit => (
                  <div
                    key={hit.id}
                    className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="bg-white text-black font-mono font-bold px-2 py-0.5 rounded text-[11px] border border-black">
                        {hit.plate_number}
                      </span>
                      <div>
                        <strong className="text-white">{hit.vehicle_make}</strong> ({hit.vehicle_category})
                        <div className="text-[11px] text-slate-400">{hit.location} • Speed: {hit.speed_kmh} km/h</div>
                      </div>
                    </div>
                    <span className="text-emerald-400 font-mono text-[11px]">OCR: {hit.confidence}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Case Detective Notes & Activity Log */}
            <div>
              <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[11px] mb-2 flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>Investigation Activity & Investigator Notes</span>
              </h4>

              <div className="space-y-2 mb-3">
                {activeCase.notes.map(note => (
                  <div key={note.id} className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <strong className="text-indigo-300">{note.author}</strong>
                      <span className="font-mono">{new Date(note.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-slate-200">{note.content}</p>
                  </div>
                ))}
              </div>

              {/* Add Note Input */}
              <form onSubmit={handleAddNote} className="space-y-2">
                <textarea
                  rows={2}
                  required
                  placeholder="Record fresh lead, witness statement, or forensic finding..."
                  value={newNoteContent}
                  onChange={e => setNewNoteContent(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 text-xs"
                ></textarea>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-400 text-[11px]">Author:</span>
                    <input
                      type="text"
                      value={noteAuthor}
                      onChange={e => setNoteAuthor(e.target.value)}
                      className="bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-1.5 rounded-xl cursor-pointer transition shadow-md"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Log Note</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
            Select a case to inspect its evidence dossier.
          </div>
        )}
      </div>

      {/* New Case Registration Modal */}
      {isNewCaseModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <FolderLock className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white uppercase tracking-tight">
                  Register New Surveillance Investigation
                </h3>
              </div>
              <button
                onClick={() => setIsNewCaseModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCase} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Case Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Armed Robbery Interception - Ring Road"
                  value={newCaseTitle}
                  onChange={e => setNewCaseTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Priority Level</label>
                  <select
                    value={newCasePriority}
                    onChange={e => setNewCasePriority(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="URGENT">Urgent (Immediate Intercept)</option>
                    <option value="HIGH">High Priority</option>
                    <option value="NORMAL">Normal Priority</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Lead Detective / Officer</label>
                  <input
                    type="text"
                    required
                    value={noteAuthor}
                    onChange={e => setNoteAuthor(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Incident Location / Corridor</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SG Highway Pakwan Junction, Ahmedabad"
                  value={newCaseLocation}
                  onChange={e => setNewCaseLocation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Incident Brief & Scope</label>
                <textarea
                  rows={3}
                  placeholder="Summarize the incident, suspect vehicle descriptions, and target surveillance corridors..."
                  value={newCaseDesc}
                  onChange={e => setNewCaseDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500"
                ></textarea>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsNewCaseModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg cursor-pointer transition"
                >
                  Register Case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
