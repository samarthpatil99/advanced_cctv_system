import React from 'react';
import { DashboardStats } from '../types';
import {
  ShieldCheck,
  AlertOctagon,
  Wrench,
  HelpCircle,
  Clock,
  Radio,
  FileCheck,
  Zap,
  TrendingDown,
  Layers,
  ArrowRight,
  Sparkles,
  PlusCircle,
  Video,
} from 'lucide-react';
import { usePresentationMode } from '../context/PresentationContext';
import { PixelCanvas } from './PixelCanvas';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface DashboardViewProps {
  stats: DashboardStats | null;
  onNavigate: (tab: string) => void;
  onSelectDistrict?: (dist: string) => void;
  onSelectCamera?: (camera: any) => void;
  onOpenAddCamera?: () => void;
  onOpenRecordDemo?: () => void;
  evaluationMode?: 'DEMO' | 'LIVE';
  onToggleEvaluationMode?: (mode: 'DEMO' | 'LIVE') => void;
  sentinelHost?: string;
  isRecordingDemo?: boolean;
  isRehearsingDemo?: boolean;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  onNavigate,
  onOpenAddCamera,
  onOpenRecordDemo,
  evaluationMode = 'DEMO',
  onToggleEvaluationMode,
  sentinelHost = '',
  isRecordingDemo = false,
  isRehearsingDemo = false,
}) => {
  const { isPresentationMode } = usePresentationMode();

  if (!stats) {
    return (
      <div className="flex items-center justify-center p-16 text-slate-400">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm">Querying database-driven statewide telemetry...</p>
        </div>
      </div>
    );
  }

  const operationalPct = Math.round((stats.operational / stats.total) * 100) || 0;
  const offlinePct = Math.round((stats.offline / stats.total) * 100) || 0;
  const maintenancePct = Math.round((stats.maintenance / stats.total) * 100) || 0;

  return (
    <div id="dashboard-view" className="space-y-6">
      {/* Top Banner Notice with Command Center RECORD DEMO & Mode Status */}
      <div className="relative overflow-hidden bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl">
        <PixelCanvas
          colors={["#0B1F3A", "#123B68", "#1E5A8A", "#2B78A8"]}
          speed={0.03}
          gap={7}
          variant="default"
        />
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center space-x-2 tracking-tight">
              <span>Statewide CCTV Asset Intelligence Command Center</span>
            </h2>
            <span className="text-xs bg-emerald-950 text-emerald-300 border border-emerald-700/50 px-2.5 py-0.5 rounded-full font-mono font-bold">
              REAL-TIME REPOSITORY
            </span>

            {/* Prominent DEMO MODE / LIVE MODE Indicators in Command Center - Clean in Presentation Mode */}
            {isPresentationMode ? (
              <div
                id="command-center-live-mode-indicator"
                className="flex items-center space-x-2 bg-emerald-950/90 border border-emerald-500/80 text-emerald-300 px-3 py-1 rounded-lg font-mono text-xs font-bold shadow-md shadow-emerald-950/50"
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="tracking-wider text-emerald-200 font-extrabold">STATEWIDE C&C GRID SYNCHRONIZED</span>
              </div>
            ) : evaluationMode === 'LIVE' ? (
              <div
                id="command-center-live-mode-indicator"
                className="flex items-center space-x-2 bg-emerald-950/90 border border-emerald-500/80 text-emerald-300 px-3 py-1 rounded-lg font-mono text-xs font-bold shadow-md shadow-emerald-950/50"
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="tracking-wider text-white">LIVE EVALUATION MODE</span>
                {sentinelHost && (
                  <>
                    <span className="text-emerald-600">|</span>
                    <span className="text-emerald-300 text-[11px]">{sentinelHost}</span>
                  </>
                )}
              </div>
            ) : (
              <div
                id="command-center-demo-mode-indicator"
                className="flex items-center space-x-2 bg-amber-950/80 border border-amber-500/70 text-amber-300 px-3 py-1 rounded-lg font-mono text-xs font-bold shadow-md shadow-amber-950/50"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
                </span>
                <span className="tracking-wider text-amber-200">DEMO MODE (SYNTHETIC BENCHMARK)</span>
              </div>
            )}
          </div>

          <p className="text-xs text-slate-400">
            Synchronized statewide CCTV infrastructure authority across 10 Gujarat districts and 5 administrative departments.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Prominent RECORD DEMO Button (Hidden in Presentation Mode) */}
          {!isPresentationMode && onOpenRecordDemo && (
            <button
              id="command-center-record-demo-btn"
              onClick={onOpenRecordDemo}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm cursor-pointer transition transform hover:scale-105 shadow-xl border ${
                isRecordingDemo
                  ? 'bg-rose-600 text-white border-rose-400 animate-pulse shadow-rose-900/80'
                  : isRehearsingDemo
                  ? 'bg-cyan-600 text-white border-cyan-400 shadow-cyan-900/80'
                  : 'bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-red-500 text-white border-rose-500 shadow-rose-950/80'
              }`}
              title="Automated 1-Click Hackathon Demo Recorder"
            >
              <Video className="w-4 h-4" />
              <span>{isRecordingDemo ? '● RECORDING IN PROGRESS' : isRehearsingDemo ? '▶ REHEARSAL ACTIVE' : 'RECORD DEMO'}</span>
            </button>
          )}

          {/* Quick Mode Toggle Pill (Hidden in Presentation Mode) */}
          {!isPresentationMode && onToggleEvaluationMode && (
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-0.5 text-xs">
              <button
                onClick={() => onToggleEvaluationMode('DEMO')}
                className={`px-2.5 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  evaluationMode === 'DEMO' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
                title="Switch to Synthetic Demo Mode (No host required)"
              >
                DEMO
              </button>
              <button
                onClick={() => onToggleEvaluationMode('LIVE')}
                className={`px-2.5 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center space-x-1 ${
                  evaluationMode === 'LIVE' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
                title="Switch to Live Evaluation Mode (Requires Sentinel Host)"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span>LIVE EVAL</span>
              </button>
            </div>
          )}

          {onOpenAddCamera && (
            <button
              onClick={onOpenAddCamera}
              className="flex items-center space-x-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold px-4 py-2 rounded-xl shadow-md shadow-blue-600/30 transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Add CCTV Asset</span>
            </button>
          )}
          <button
            onClick={() => onNavigate('gis')}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs sm:text-sm px-3.5 py-2 rounded-xl font-medium transition cursor-pointer border border-slate-700"
          >
            <span>Launch GIS Digital Twin</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onNavigate('ask')}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs sm:text-sm px-3 py-2 rounded-xl font-medium transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Ask Registry NLP</span>
          </button>
        </div>
        </div>
      </div>

      {/* KPI Primary Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Assets */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 shadow-sm hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Total Cameras</span>
            <Layers className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">{stats.total}</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center space-x-1">
            <span className="text-blue-400 font-medium">10 Districts</span>
            <span>• 100% Seeded</span>
          </div>
        </div>

        {/* Operational */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 shadow-sm hover:border-emerald-800/40 transition">
          <div className="flex items-center justify-between text-emerald-400 text-xs mb-1">
            <span>Operational</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 tracking-tight">{stats.operational}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            <span className="text-emerald-400 font-semibold">{operationalPct}%</span> active streaming telemetry
          </div>
        </div>

        {/* Offline */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 shadow-sm hover:border-rose-800/40 transition">
          <div className="flex items-center justify-between text-rose-400 text-xs mb-1">
            <span>Offline</span>
            <AlertOctagon className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400 tracking-tight">{stats.offline}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            <span className="text-rose-400 font-semibold">{offlinePct}%</span> connection loss
          </div>
        </div>

        {/* Maintenance */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 shadow-sm hover:border-amber-800/40 transition">
          <div className="flex items-center justify-between text-amber-400 text-xs mb-1">
            <span>Maintenance</span>
            <Wrench className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 tracking-tight">{stats.maintenance}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            <span className="text-amber-400 font-semibold">{maintenancePct}%</span> under scheduled triage
          </div>
        </div>

        {/* Unknown */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 shadow-sm hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Unknown Telemetry</span>
            <HelpCircle className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-300 tracking-tight">{stats.unknown}</div>
          <div className="text-[11px] text-slate-400 mt-1">Awaiting heartbeat verify</div>
        </div>

        {/* Critical Aging */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 shadow-sm hover:border-orange-800/40 transition">
          <div className="flex items-center justify-between text-orange-400 text-xs mb-1">
            <span>Critical Aging (9+y)</span>
            <Clock className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-bold text-orange-400 tracking-tight">{stats.critical_aging_count}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            Plus <span className="text-amber-300 font-semibold">{stats.aging_count}</span> aging (6-8y)
          </div>
        </div>
      </div>

      {/* Intelligence & Strategy KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Coverage Score & Debt */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
              <Radio className="w-4 h-4 text-indigo-400" />
              <span>Coverage Debt Index</span>
            </span>
            <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
              Target: {stats.coverage_target}%
            </span>
          </div>

          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-white">{stats.coverage_debt}%</span>
            <span className="text-xs text-rose-400 font-medium flex items-center">
              <TrendingDown className="w-3 h-3 mr-0.5" /> Deficit
            </span>
          </div>

          <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-indigo-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, stats.coverage_score_avg)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 mt-1.5">
            <span>Avg Coverage: {stats.coverage_score_avg}%</span>
            <span>Formula: max(90 - Current, 0)</span>
          </div>
        </div>

        {/* Data Quality & Confidence */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
              <FileCheck className="w-4 h-4 text-emerald-400" />
              <span>Data Confidence Avg</span>
            </span>
            <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800/40 px-1.5 py-0.5 rounded">
              High Integrity
            </span>
          </div>

          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-white">{stats.data_confidence_avg}%</span>
            <span className="text-xs text-slate-400">weighted confidence</span>
          </div>

          <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${stats.data_confidence_avg}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 mt-1.5">
            <span className="text-amber-400 font-medium cursor-pointer" onClick={() => onNavigate('data_quality')}>
              {stats.total_conflicts_pending} Pending Conflicts
            </span>
            <span>{stats.total_quality_anomalies} flagged anomalies</span>
          </div>
        </div>

        {/* Integration Readiness */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>Integration Readiness</span>
            </span>
            <span className="text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-800/40 px-1.5 py-0.5 rounded">
              Explainable
            </span>
          </div>

          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-white">{stats.integration_readiness_avg}%</span>
            <span className="text-xs text-cyan-300">RTSP/ONVIF ready</span>
          </div>

          <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-cyan-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${stats.integration_readiness_avg}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 mt-1.5">
            <span>Direct Ingestion Tier</span>
            <span>Evaluates 8 Protocols</span>
          </div>
        </div>

        {/* P1 Critical Maintenance Priority */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-rose-300 flex items-center space-x-1.5">
              <AlertOctagon className="w-4 h-4 text-rose-400" />
              <span>P1 Critical Maintenance</span>
            </span>
            <span className="text-[10px] bg-rose-950 text-rose-300 border border-rose-800/40 px-1.5 py-0.5 rounded animate-pulse">
              Urgent Dispatch
            </span>
          </div>

          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-rose-400">{stats.p1_maintenance_count}</span>
            <span className="text-xs text-slate-400">cameras at zero redundancy</span>
          </div>

          <div className="mt-3">
            <button
              onClick={() => onNavigate('maintenance')}
              className="w-full bg-rose-950/70 hover:bg-rose-900/90 text-rose-200 border border-rose-800/60 text-xs py-1.5 rounded transition font-medium cursor-pointer"
            >
              Open P1 Dispatch Matrix →
            </button>
          </div>
        </div>
      </div>

      {/* Visual Analytics & Breakdown Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* District Status Distribution Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">District-Wise Operational vs. Offline</h3>
              <p className="text-xs text-slate-400">Total camera inventory breakdown across Gujarat districts</p>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.district_distribution} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis
                  dataKey="district"
                  stroke="#64748b"
                  fontSize={11}
                  angle={-25}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="operational" name="Operational" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="offline" name="Offline" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Distribution & Lifecycle Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-semibold text-white">Department Asset Ownership</h3>
              <p className="text-xs text-slate-400">Surveillance asset allocation by state administrative entity</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 h-64 items-center">
            <div className="h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.department_distribution}
                    dataKey="count"
                    nameKey="department"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {stats.department_distribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 text-xs">
              {stats.department_distribution.map((dept, idx) => (
                <div key={dept.department} className="flex items-center justify-between border-b border-slate-800 pb-1">
                  <div className="flex items-center space-x-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                    <span className="text-slate-300 truncate max-w-[130px]" title={dept.department}>
                      {dept.department}
                    </span>
                  </div>
                  <span className="font-semibold text-white">{dept.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Age Groups & Hardware Types Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Age Group Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-white">Hardware Lifecycle & Age Groups</h3>
              <p className="text-xs text-slate-400">Critical replacement candidates cluster in 9+ years bracket</p>
            </div>
            <button
              onClick={() => onNavigate('health')}
              className="text-xs text-blue-400 hover:text-blue-300 cursor-pointer"
            >
              Details →
            </button>
          </div>

          <div className="space-y-3">
            {stats.age_group_distribution.map(item => {
              const pct = Math.round((item.count / stats.total) * 100);
              const isCritical = item.age_group === '9+ YRS';
              const isAging = item.age_group === '6-8 YRS';
              return (
                <div key={item.age_group} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className={`font-medium ${isCritical ? 'text-rose-400 font-bold' : isAging ? 'text-amber-400' : 'text-slate-300'}`}>
                      {item.age_group} {isCritical ? '(Critical Replacement Candidate)' : ''}
                    </span>
                    <span className="text-slate-400">
                      {item.count} units ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCritical ? 'bg-rose-500' : isAging ? 'bg-amber-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Camera Types */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-white">Camera Sensor & Form Factor Profile</h3>
              <p className="text-xs text-slate-400">Optical capabilities across traffic and surveillance nodes</p>
            </div>
            <button
              onClick={() => onNavigate('registry')}
              className="text-xs text-blue-400 hover:text-blue-300 cursor-pointer"
            >
              View Registry →
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {(stats.type_distribution || []).map(t => (
              <div key={t.type} className="bg-slate-800/70 border border-slate-700/60 rounded-md p-2.5 text-center">
                <div className="text-[11px] font-mono text-slate-400 uppercase">{String(t?.type || '').replace(/_/g, ' ')}</div>
                <div className="text-lg font-bold text-white mt-0.5">{t.count}</div>
                <div className="text-[10px] text-slate-400">{Math.round((t.count / stats.total) * 100)}% of total</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
