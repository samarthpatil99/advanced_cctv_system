import React, { useState } from 'react';
import { Camera, MaintenancePriority } from '../types';
import {
  Sliders,
  AlertOctagon,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ExternalLink,
  Wrench,
  ShieldAlert,
} from 'lucide-react';

interface MaintenancePriorityViewProps {
  cameras: Camera[];
  onSelectCamera: (camera: Camera) => void;
  onUpdateCamera: (id: string, updates: Partial<Camera>, reason: string) => Promise<void>;
}

export const MaintenancePriorityView: React.FC<MaintenancePriorityViewProps> = ({
  cameras,
  onSelectCamera,
  onUpdateCamera,
}) => {
  const [priorityTab, setPriorityTab] = useState<string>('P1_CRITICAL');

  const p1Cams = cameras.filter(c => c.maintenance_priority === 'P1_CRITICAL');
  const p2Cams = cameras.filter(c => c.maintenance_priority === 'P2_HIGH');
  const p3Cams = cameras.filter(c => c.maintenance_priority === 'P3_MEDIUM');
  const p4Cams = cameras.filter(c => c.maintenance_priority === 'P4_LOW');

  const getFilteredList = () => {
    switch (priorityTab) {
      case 'P1_CRITICAL':
        return p1Cams;
      case 'P2_HIGH':
        return p2Cams;
      case 'P3_MEDIUM':
        return p3Cams;
      case 'P4_LOW':
        return p4Cams;
      case 'ALL':
      default:
        return cameras;
    }
  };

  const list = getFilteredList();

  const handleDispatchTicket = async (cam: Camera) => {
    const reason = prompt(
      `Enter field dispatch work order number / reason for ${cam.global_id}:`,
      `Scheduled urgent field repair under Ticket #DISP-${Math.floor(1000 + Math.random() * 9000)}`
    );
    if (!reason) return;

    try {
      await onUpdateCamera(cam.id, { status: 'MAINTENANCE' }, reason);
      alert(`Work order assigned and asset placed in MAINTENANCE status.`);
    } catch (err: any) {
      alert(`Error assigning dispatch: ${err.message}`);
    }
  };

  return (
    <div id="maintenance-priority-view" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-rose-400" />
            <span>Statewide Maintenance Priority Matrix (P1–P4)</span>
            <span className="text-xs bg-rose-950 text-rose-300 border border-rose-800 px-2 py-0.5 rounded font-mono">
              EXPLAINABLE TRIAGE
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Algorithmic priority assignment evaluated using health, junction importance, spatial redundancy deficit, age, and failure frequency.
          </p>
        </div>
      </div>

      {/* Priority Summary Cards / Tab Selectors */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          onClick={() => setPriorityTab('P1_CRITICAL')}
          className={`p-3.5 rounded-lg border text-left transition cursor-pointer ${
            priorityTab === 'P1_CRITICAL'
              ? 'bg-rose-950/80 border-rose-500 shadow-lg shadow-rose-950/50'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-rose-400">P1 Critical</span>
            <AlertOctagon className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-1">{p1Cams.length}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Zero redundancy / Critical Junction</p>
        </button>

        <button
          onClick={() => setPriorityTab('P2_HIGH')}
          className={`p-3.5 rounded-lg border text-left transition cursor-pointer ${
            priorityTab === 'P2_HIGH'
              ? 'bg-orange-950/80 border-orange-500 shadow-lg shadow-orange-950/50'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-orange-400">P2 High</span>
            <AlertTriangle className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-1">{p2Cams.length}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Connection loss / Low redundancy</p>
        </button>

        <button
          onClick={() => setPriorityTab('P3_MEDIUM')}
          className={`p-3.5 rounded-lg border text-left transition cursor-pointer ${
            priorityTab === 'P3_MEDIUM'
              ? 'bg-amber-950/80 border-amber-500 shadow-lg shadow-amber-950/50'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-amber-400">P3 Medium</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-1">{p3Cams.length}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Degraded telemetry / 6-8y aging</p>
        </button>

        <button
          onClick={() => setPriorityTab('P4_LOW')}
          className={`p-3.5 rounded-lg border text-left transition cursor-pointer ${
            priorityTab === 'P4_LOW'
              ? 'bg-blue-950/80 border-blue-500 shadow-lg shadow-blue-950/50'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-blue-400">P4 Low</span>
            <CheckCircle2 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-1">{p4Cams.length}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Routine scheduled maintenance</p>
        </button>
      </div>

      {/* Priority Table & Explainable Reasoning */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <span>Active Priority Triage Queue: {String(priorityTab || 'P1_CRITICAL').replace(/_/g, ' ')}</span>
            <span className="text-xs text-slate-400 font-normal">({list.length} assets)</span>
          </h3>
        </div>

        <div className="space-y-3">
          {list.slice(0, 25).map(cam => (
            <div
              key={cam.id}
              className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-lg p-4 text-xs transition space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-900 pb-2">
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold text-white text-sm">{cam.global_id}</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-300 font-medium">{cam.landmark} ({cam.district})</span>
                </div>

                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                      cam.status === 'OPERATIONAL'
                        ? 'bg-emerald-950 text-emerald-300'
                        : cam.status === 'OFFLINE'
                        ? 'bg-rose-950 text-rose-300 animate-pulse'
                        : 'bg-amber-950 text-amber-300'
                    }`}
                  >
                    {cam.status}
                  </span>
                  <span className="text-slate-400">Health: <strong className="text-white">{cam.health_score}%</strong></span>
                </div>
              </div>

              {/* Explainable Priority Reason Card */}
              <div className="bg-slate-900/90 border border-slate-800 p-3 rounded text-xs space-y-1">
                <div className="text-slate-400 font-semibold text-[11px]">Why this priority was assigned:</div>
                <p className="text-slate-200 font-medium leading-relaxed">
                  {cam.maintenance_reason}
                </p>
                <div className="flex flex-wrap gap-4 text-[10px] text-slate-400 pt-1">
                  <span>Redundancy: <strong className="text-white">{cam.redundancy_level}</strong></span>
                  <span>Junction Rating: <strong className="text-white">{String(cam.coverage_importance || 'STANDARD').split('_')[0]}</strong></span>
                  <span>Age: <strong className="text-white">{cam.age_years} yrs</strong></span>
                  <span>Custodian: <strong className="text-slate-300">{cam.custodian_officer || 'Unassigned'}</strong></span>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-1">
                <button
                  onClick={() => onSelectCamera(cam)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded transition cursor-pointer flex items-center space-x-1"
                >
                  <span>Digital Twin</span>
                  <ExternalLink className="w-3 h-3" />
                </button>

                {cam.status !== 'MAINTENANCE' && (
                  <button
                    onClick={() => handleDispatchTicket(cam)}
                    className="bg-rose-600 hover:bg-rose-500 text-white font-semibold px-3 py-1.5 rounded transition cursor-pointer flex items-center space-x-1 shadow-sm shadow-rose-600/30"
                  >
                    <Wrench className="w-3 h-3" />
                    <span>Assign Field Dispatch Ticket</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
