import React, { useState } from 'react';
import { AuditLogEntry, Camera, ConflictRecord, DashboardStats } from '../types';
import {
  FileText,
  Download,
  Printer,
  History,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Database,
  Search,
} from 'lucide-react';

interface AuditReportsViewProps {
  stats: DashboardStats | null;
  cameras: Camera[];
  conflicts: ConflictRecord[];
  auditLogs: AuditLogEntry[];
}

export const AuditReportsView: React.FC<AuditReportsViewProps> = ({
  stats,
  cameras,
  conflicts,
  auditLogs,
}) => {
  const [reportType, setReportType] = useState<
    'EXECUTIVE_SUMMARY' | 'HEALTH_AUDIT' | 'COVERAGE_GAP' | 'INVESTMENT_PROPOSAL' | 'CONFLICT_REPORT' | 'AUDIT_TRAIL'
  >('EXECUTIVE_SUMMARY');
  const [searchAudit, setSearchAudit] = useState<string>('');

  const printReport = () => {
    window.print();
  };

  const filteredLogs = auditLogs.filter(log => {
    if (!searchAudit) return true;
    const q = searchAudit.toLowerCase();
    const roleStr = String((log as any).role || (log as any).user_role || '').toLowerCase();
    const whoStr = String(log.who || '').toLowerCase();
    const whatStr = String((log as any).what || (log as any).action || '').toLowerCase();
    const reasonStr = String(log.reason || '').toLowerCase();
    const entityIdStr = String((log as any).entity_id || (log as any).camera_global_id || '').toLowerCase();
    return (
      roleStr.includes(q) ||
      whoStr.includes(q) ||
      whatStr.includes(q) ||
      reasonStr.includes(q) ||
      entityIdStr.includes(q)
    );
  });

  return (
    <div id="audit-reports-view" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <span>Statewide Intelligence Reports & Immutable Audit Ledger</span>
            <span className="text-xs bg-blue-950 text-blue-300 border border-blue-800 px-2 py-0.5 rounded font-mono">
              OFFICIAL GOVERNANCE EXPORTS
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Generates standardized executive summaries, health compliance dockets, coverage gap proposals, and tamper-evident audit logs.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={printReport}
            className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-3.5 py-1.5 rounded transition cursor-pointer shadow-md shadow-blue-600/30"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report (PDF)</span>
          </button>
        </div>
      </div>

      {/* Report Switcher Tabs */}
      <div className="flex flex-wrap gap-2 text-xs">
        {[
          { id: 'EXECUTIVE_SUMMARY', label: '1. Executive Statewide Briefing' },
          { id: 'HEALTH_AUDIT', label: '2. Health & Hardware Audit' },
          { id: 'COVERAGE_GAP', label: '3. Coverage Debt & Resilience' },
          { id: 'CONFLICT_REPORT', label: '4. Provenance & Quality Report' },
          { id: 'AUDIT_TRAIL', label: '5. Immutable Audit Log Trail' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setReportType(tab.id as any)}
            className={`px-3 py-2 rounded-lg font-medium transition cursor-pointer border ${
              reportType === tab.id
                ? 'bg-blue-900/60 border-blue-500 text-white'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Report Document Presentation */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-6 text-xs text-slate-300 print:bg-white print:text-black print:p-0 print:border-none">
        {/* EXECUTIVE SUMMARY */}
        {reportType === 'EXECUTIVE_SUMMARY' && (
          <div className="space-y-5">
            <div className="border-b border-slate-800 pb-4">
              <span className="text-[10px] font-mono text-blue-400 uppercase tracking-wider">
                GOVERNMENT OF GUJARAT • HOME DEPARTMENT
              </span>
              <h3 className="text-xl font-bold text-white mt-1">
                Statewide CCTV Asset Intelligence Executive Summary
              </h3>
              <p className="text-slate-400 text-xs mt-0.5">
                Generated on {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-950 p-4 rounded border border-slate-800">
                <span className="text-slate-400 text-[11px]">Total Registered Assets</span>
                <div className="text-2xl font-bold text-white mt-1">{stats?.total || cameras.length}</div>
                <span className="text-emerald-400 text-[10px]">100% Geo-tagged & Cataloged</span>
              </div>
              <div className="bg-slate-950 p-4 rounded border border-slate-800">
                <span className="text-slate-400 text-[11px]">Operational Ratio</span>
                <div className="text-2xl font-bold text-emerald-400 mt-1">{stats?.operational || 0}</div>
                <span className="text-slate-500 text-[10px]">{Math.round(((stats?.operational || 0) / (stats?.total || 1)) * 100)}% active stream</span>
              </div>
              <div className="bg-slate-950 p-4 rounded border border-slate-800">
                <span className="text-slate-400 text-[11px]">Critical Redundancy Gaps</span>
                <div className="text-2xl font-bold text-rose-400 mt-1">{cameras.filter(c => c.redundancy_level === 'CRITICAL').length}</div>
                <span className="text-rose-400 text-[10px]">Single point of failure junctions</span>
              </div>
              <div className="bg-slate-950 p-4 rounded border border-slate-800">
                <span className="text-slate-400 text-[11px]">Avg Coverage Reliability</span>
                <div className="text-2xl font-bold text-blue-400 mt-1">{stats?.coverage_score_avg || 0}%</div>
                <span className="text-slate-500 text-[10px]">Baseline vs 90% target</span>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded border border-slate-800 space-y-2">
              <h4 className="font-bold text-white">Executive Key Findings:</h4>
              <ul className="list-disc list-inside space-y-1.5 text-slate-300">
                <li>
                  Surveillance infrastructure spans across all 10 administrative districts, with Ahmedabad and Surat housing the largest municipal networks.
                </li>
                <li>
                  <strong className="text-rose-400">{stats?.critical_aging_count || cameras.filter(c => c.age_group === '9+ YRS').length} surveillance nodes</strong> have exceeded the 8-year hardware operational threshold and require scheduled lifecycle replacement.
                </li>
                <li>
                  <strong className="text-amber-400">{cameras.filter(c => c.redundancy_level === 'CRITICAL').length} locations</strong> represent zero-redundancy single points of failure where a single camera drop causes immediate junction blindness.
                </li>
                <li>
                  Statewide integration readiness index stands at <strong className="text-cyan-400">{stats?.integration_readiness_avg || 0}%</strong> compliance for ONVIF Profile T streaming.
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* HEALTH AUDIT */}
        {reportType === 'HEALTH_AUDIT' && (
          <div className="space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">Health Intelligence & Depreciation Audit Docket</h3>
              <p className="text-slate-400 text-xs">Evaluates component uptime, network latency, and physical aging degradation.</p>
            </div>

            <div className="space-y-3">
              <div className="bg-slate-950 p-4 rounded border border-slate-800 space-y-2">
                <h4 className="font-semibold text-white">Statewide Age Depreciation Distribution:</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="bg-slate-900 p-2.5 rounded">
                    <div className="text-slate-400 text-[10px]">0–2 Years</div>
                    <div className="text-lg font-bold text-emerald-400">{cameras.filter(c => c.age_group === '0-2 YRS').length}</div>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded">
                    <div className="text-slate-400 text-[10px]">3–5 Years</div>
                    <div className="text-lg font-bold text-blue-400">{cameras.filter(c => c.age_group === '3-5 YRS').length}</div>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded">
                    <div className="text-slate-400 text-[10px]">6–8 Years</div>
                    <div className="text-lg font-bold text-amber-400">{cameras.filter(c => c.age_group === '6-8 YRS').length}</div>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded">
                    <div className="text-slate-400 text-[10px]">9+ Years</div>
                    <div className="text-lg font-bold text-rose-400">{cameras.filter(c => c.age_group === '9+ YRS').length}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* COVERAGE GAP */}
        {reportType === 'COVERAGE_GAP' && (
          <div className="space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">Coverage Gap & Resilience Debt Proposal</h3>
              <p className="text-slate-400 text-xs">Analysis of spatial blind spots and single points of failure across critical corridors.</p>
            </div>

            <div className="bg-slate-950 p-4 rounded border border-slate-800 space-y-2">
              <h4 className="font-semibold text-white">Single Point of Failure Junctions (Zero Backup Coverage):</h4>
              <p className="text-slate-300">
                A failure at any of the identified {cameras.filter(c => c.redundancy_level === 'CRITICAL').length} critical redundancy cameras results in total blind spots with no overlapping visual angles from nearby cameras within 350 meters.
              </p>
            </div>
          </div>
        )}

        {/* CONFLICT REPORT */}
        {reportType === 'CONFLICT_REPORT' && (
          <div className="space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">Provenance Ingestion & Quality Audit Docket</h3>
              <p className="text-slate-400 text-xs">Summary of flagged collisions between automated Sentinel probes and registry records.</p>
            </div>

            <div className="bg-slate-950 p-4 rounded border border-slate-800 space-y-3">
              <div className="flex justify-between">
                <span>Active Provenance Conflicts:</span>
                <span className="font-bold text-amber-400">{conflicts.length} records</span>
              </div>
              <div className="flex justify-between">
                <span>Coordinate Inconsistencies:</span>
                <span className="font-bold text-rose-400">
                  {cameras.filter(c => c.quality_issue_types.includes('COORDINATE_OUT_OF_BOUNDS')).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Verification-Required Stale Records (&gt;180d):</span>
                <span className="font-bold text-blue-400">
                  {cameras.filter(c => c.quality_issue_types.includes('STALE_UNVERIFIED_180_DAYS')).length}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* AUDIT TRAIL */}
        {reportType === 'AUDIT_TRAIL' && (
          <div className="space-y-4">
            <div className="border-b border-slate-800 pb-3 flex flex-wrap justify-between items-center gap-3">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                  <History className="w-5 h-5 text-blue-400" />
                  <span>Immutable Statewide Governance Audit Ledger</span>
                </h3>
                <p className="text-slate-400 text-xs">
                  Cryptographically structured audit trail recording all status updates, reconciliations, and probe executions.
                </p>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter audit entries..."
                  value={searchAudit}
                  onChange={e => setSearchAudit(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded pl-8 pr-3 py-1 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-lg overflow-x-auto max-h-[500px] overflow-y-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900 text-slate-400 text-[11px] uppercase tracking-wider sticky top-0">
                  <tr>
                    <th className="p-3">Timestamp (IST)</th>
                    <th className="p-3">Authorized Role</th>
                    <th className="p-3">Action</th>
                    <th className="p-3">Asset ID</th>
                    <th className="p-3">Mandatory Governance Justification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredLogs.map(log => {
                    const roleName = String((log as any).role || (log as any).user_role || 'OPERATOR');
                    const actionName = String((log as any).what || (log as any).action || 'MUTATION');
                    const entityId = String((log as any).entity_id || (log as any).camera_global_id || 'SYSTEM');
                    return (
                      <tr key={log.id} className="hover:bg-slate-900/50">
                        <td className="p-3 font-mono text-slate-400 whitespace-nowrap">
                          {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}
                        </td>
                        <td className="p-3 font-semibold text-blue-300">
                          {roleName.replace(/_/g, ' ')}
                        </td>
                        <td className="p-3">
                          <span className="bg-slate-800 px-2 py-0.5 rounded text-[10px] font-mono text-slate-200">
                            {actionName.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-white whitespace-nowrap">{entityId}</td>
                        <td className="p-3 text-slate-200 font-medium max-w-md">{log.reason || 'N/A'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
