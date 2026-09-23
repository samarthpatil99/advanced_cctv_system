import React, { useState } from 'react';
import { Camera, ConflictRecord, UserRole } from '../types';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileCheck,
  ExternalLink,
  ShieldCheck,
  Clock,
  MapPin,
  HelpCircle,
  Edit3,
} from 'lucide-react';

interface DataQualityViewProps {
  cameras: Camera[];
  conflicts: ConflictRecord[];
  onSelectCamera: (camera: Camera) => void;
  onResolveConflict: (
    conflictId: string,
    action: 'ACCEPT_PROPOSED' | 'KEEP_CURRENT' | 'CUSTOM_VALUE',
    customValue: string | undefined,
    reason: string
  ) => Promise<void>;
  userRole: UserRole;
}

export const DataQualityView: React.FC<DataQualityViewProps> = ({
  cameras,
  conflicts,
  onSelectCamera,
  onResolveConflict,
  userRole,
}) => {
  const [selectedConflict, setSelectedConflict] = useState<ConflictRecord | null>(null);
  const [customValueInput, setCustomValueInput] = useState<string>('');
  const [resolutionReason, setResolutionReason] = useState<string>('');
  const [resolutionAction, setResolutionAction] = useState<
    'ACCEPT_PROPOSED' | 'KEEP_CURRENT' | 'CUSTOM_VALUE'
  >('ACCEPT_PROPOSED');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Group quality issues
  const coordinateAnomalies = cameras.filter(c =>
    c.quality_issue_types.includes('COORDINATE_OUT_OF_BOUNDS')
  );
  const duplicateCandidates = cameras.filter(c =>
    c.quality_issue_types.includes('POTENTIAL_COORDINATE_DUPLICATE')
  );
  const staleRecords = cameras.filter(c =>
    c.quality_issue_types.includes('STALE_UNVERIFIED_180_DAYS')
  );
  const missingFields = cameras.filter(c =>
    c.quality_issue_types.includes('MISSING_FIRMWARE_SPEC') ||
    c.quality_issue_types.includes('INCOMPLETE_CUSTODIAN_CONTACT')
  );

  const pendingConflicts = conflicts.filter(c => c.status === 'PENDING');
  const resolvedConflicts = conflicts.filter(c => c.status !== 'PENDING');

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConflict) return;
    if (!resolutionReason.trim()) {
      alert('Mandatory audit justification reason is required to resolve conflict.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onResolveConflict(
        selectedConflict.id,
        resolutionAction,
        resolutionAction === 'CUSTOM_VALUE' ? customValueInput : undefined,
        resolutionReason
      );
      setSelectedConflict(null);
      setResolutionReason('');
      setCustomValueInput('');
    } catch (err: any) {
      alert(`Conflict resolution error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="data-quality-view" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <span>Data Quality & Provenance Conflict Management</span>
            <span className="text-xs bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded font-mono">
              EXPLAINABLE • NEVER AUTO-MERGES
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Strict governance workbench ensuring field anomalies and telemetry collisions are surfaced with complete provenance before reconciliation.
          </p>
        </div>
      </div>

      {/* Quality Anomaly KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5">
          <div className="text-slate-400 text-xs flex justify-between">
            <span>Coordinate Anomalies</span>
            <MapPin className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400 mt-1">{coordinateAnomalies.length}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Lat/Lng outside Gujarat bounds</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5">
          <div className="text-slate-400 text-xs flex justify-between">
            <span>Potential Duplicates</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 mt-1">{duplicateCandidates.length}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">&lt;15m proximity / same angle</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5">
          <div className="text-slate-400 text-xs flex justify-between">
            <span>Stale Records (&gt;180d)</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-blue-400 mt-1">{staleRecords.length}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Verification required queue</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5">
          <div className="text-slate-400 text-xs flex justify-between">
            <span>Missing Key Fields</span>
            <HelpCircle className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-400 mt-1">{missingFields.length}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Missing firmware/custodian</p>
        </div>
      </div>

      {/* Module 10: Provenance Conflict Resolution Queue */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <FileCheck className="w-4 h-4 text-emerald-400" />
              <span>Provenance Conflict Resolution Queue ({pendingConflicts.length} Pending)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Collisions between Sentinel auto-scans, municipal registries, and police field logs. Never silently overwritten.
            </p>
          </div>
        </div>

        {pendingConflicts.length > 0 ? (
          <div className="space-y-3">
            {pendingConflicts.map(conf => (
              <div
                key={conf.id}
                className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-lg p-4 text-xs transition space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-900 pb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-white">{conf.camera_global_id}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-amber-400 font-semibold uppercase">Conflict Field: {conf.field_name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-400 text-[11px]">Inbound Source:</span>
                    <span className="text-slate-200 font-medium">{conf.source}</span>
                    <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-1.5 py-0.2 rounded font-mono">
                      {conf.confidence}% Confidence
                    </span>
                  </div>
                </div>

                {/* Side-by-side comparison */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
                    <div className="text-slate-400 text-[10px] uppercase font-bold">Current Value in Master Registry:</div>
                    <div className="text-slate-200 font-mono text-sm mt-1">{conf.current_value || '<EMPTY>'}</div>
                  </div>
                  <div className="bg-blue-950/30 p-3 rounded border border-blue-900/60">
                    <div className="text-blue-400 text-[10px] uppercase font-bold">Proposed Inbound Value:</div>
                    <div className="text-blue-200 font-mono text-sm mt-1">{conf.proposed_value}</div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => {
                      setSelectedConflict(conf);
                      setResolutionAction('ACCEPT_PROPOSED');
                    }}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-3 py-1.5 rounded text-xs transition cursor-pointer flex items-center space-x-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Review & Reconcile Conflict</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500 text-xs">
            ✓ All provenance conflicts have been reconciled with audit justifications.
          </div>
        )}
      </div>

      {/* Reconcile Conflict Modal */}
      {selectedConflict && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-lg p-5 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h4 className="text-sm font-bold text-white">Reconcile Field Conflict</h4>
              <button
                onClick={() => setSelectedConflict(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="text-xs space-y-2">
              <p className="text-slate-300">
                Asset: <span className="font-mono text-white font-bold">{selectedConflict.camera_global_id}</span>
              </p>
              <p className="text-slate-300">
                Conflict Field: <span className="text-amber-400 font-bold">{selectedConflict.field_name}</span>
              </p>
            </div>

            <form onSubmit={handleResolve} className="space-y-4 text-xs">
              <div className="space-y-2">
                <label className="text-slate-300 font-semibold block">Choose Resolution Policy:</label>
                <div className="space-y-1.5">
                  <label className="flex items-center space-x-2 p-2 rounded bg-slate-950 border border-slate-800 cursor-pointer">
                    <input
                      type="radio"
                      name="policy"
                      checked={resolutionAction === 'ACCEPT_PROPOSED'}
                      onChange={() => setResolutionAction('ACCEPT_PROPOSED')}
                    />
                    <span>Accept Inbound Proposed Value: <code className="text-blue-300 font-mono">{selectedConflict.proposed_value}</code></span>
                  </label>

                  <label className="flex items-center space-x-2 p-2 rounded bg-slate-950 border border-slate-800 cursor-pointer">
                    <input
                      type="radio"
                      name="policy"
                      checked={resolutionAction === 'KEEP_CURRENT'}
                      onChange={() => setResolutionAction('KEEP_CURRENT')}
                    />
                    <span>Reject Proposed; Keep Current Value: <code className="text-slate-300 font-mono">{selectedConflict.current_value}</code></span>
                  </label>

                  <label className="flex items-center space-x-2 p-2 rounded bg-slate-950 border border-slate-800 cursor-pointer">
                    <input
                      type="radio"
                      name="policy"
                      checked={resolutionAction === 'CUSTOM_VALUE'}
                      onChange={() => setResolutionAction('CUSTOM_VALUE')}
                    />
                    <span>Enter Verified Custom Value</span>
                  </label>
                </div>
              </div>

              {resolutionAction === 'CUSTOM_VALUE' && (
                <div>
                  <label className="text-slate-400 block mb-1">Custom Reconciled Value:</label>
                  <input
                    type="text"
                    required
                    value={customValueInput}
                    onChange={e => setCustomValueInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
                    placeholder="Enter reconciled data..."
                  />
                </div>
              )}

              <div>
                <label className="text-slate-400 block mb-1">
                  Mandatory Audit Justification Reason (Immutable):
                </label>
                <textarea
                  required
                  rows={2}
                  value={resolutionReason}
                  onChange={e => setResolutionReason(e.target.value)}
                  placeholder="E.g., Verified firmware build via Sentinel device inventory sync log..."
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedConflict(null)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white font-bold px-4 py-1.5 rounded cursor-pointer"
                >
                  {isSubmitting ? 'Recording Audit...' : 'Commit Reconciliation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
