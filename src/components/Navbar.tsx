import React, { useState } from 'react';
import { UserRole } from '../types';
import {
  Shield,
  Activity,
  MapPin,
  Database,
  HeartPulse,
  AlertTriangle,
  Cpu,
  HelpCircle,
  TrendingUp,
  FileText,
  RefreshCw,
  Sliders,
  CheckCircle2,
  Radio,
  Layers,
  PlusCircle,
  ZoomIn,
  LogOut,
  User,
  Tv,
  Search,
  CreditCard,
  Route,
  Bell,
  FolderLock,
  Sparkles,
  Video,
  ExternalLink,
  Monitor,
} from 'lucide-react';
import { usePresentationMode } from '../context/PresentationContext';

interface NavbarProps {
  currentTab?: string;
  activeTab?: string;
  setCurrentTab?: (tab: string) => void;
  setActiveTab?: (tab: string) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  onOpenSentinel?: () => void;
  onResetData?: () => void;
  onOpenAddCamera?: () => void;
  uiScale?: 'normal' | 'large' | 'xlarge';
  onToggleUiScale?: (scale: 'normal' | 'large' | 'xlarge') => void;
  isSyncing?: boolean;
  totalPendingConflicts?: number;
  pendingConflictCount?: number;
  currentUser?: { email: string; name: string; role: UserRole } | null;
  onLogout?: () => void;
  evaluationMode?: 'DEMO' | 'LIVE';
  onToggleEvaluationMode?: (mode: 'DEMO' | 'LIVE') => void;
  sentinelHost?: string;
  onOpenLiveSettings?: () => void;
  onOpenRecordDemo?: () => void;
  isRecordingDemo?: boolean;
  isRehearsingDemo?: boolean;
  demoActive?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  activeTab,
  setCurrentTab,
  setActiveTab,
  userRole,
  setUserRole,
  onOpenSentinel,
  onResetData,
  onOpenAddCamera,
  uiScale = 'normal',
  onToggleUiScale,
  isSyncing = false,
  totalPendingConflicts = 0,
  pendingConflictCount = 0,
  currentUser,
  onLogout,
  evaluationMode = 'DEMO',
  onToggleEvaluationMode,
  sentinelHost = '',
  onOpenLiveSettings,
  onOpenRecordDemo,
  isRecordingDemo = false,
  isRehearsingDemo = false,
  demoActive = false,
}) => {
  const { isPresentationMode, togglePresentationMode } = usePresentationMode();
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  // Safely resolve the tab and tab setter
  const selectedTab = activeTab ?? currentTab ?? 'dashboard';
  const handleTabChange = (tabId: string) => {
    if (typeof setActiveTab === 'function') {
      setActiveTab(tabId);
    } else if (typeof setCurrentTab === 'function') {
      setCurrentTab(tabId);
    }
  };

  const conflictsBadge = pendingConflictCount || totalPendingConflicts || 0;

  const model1Tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'map', label: 'GIS Digital Twin', icon: MapPin },
    { id: 'registry', label: 'Master Registry', icon: Database },
    { id: 'health', label: 'Health & Lifecycle', icon: HeartPulse },
    { id: 'coverage', label: 'Coverage & Debt', icon: Radio },
    { id: 'quality', label: 'Data Quality & Conflicts', icon: AlertTriangle, badge: conflictsBadge },
    { id: 'maintenance', label: 'Maintenance Priority', icon: Sliders },
    { id: 'integration', label: 'Ingestion Readiness', icon: Layers },
    { id: 'ask', label: 'Ask Registry', icon: HelpCircle },
    { id: 'simulation', label: 'Replacement Simulator', icon: Cpu },
    { id: 'investment', label: 'Investment Ranking', icon: TrendingUp },
    { id: 'sentinel', label: 'Sentinel Connector', icon: Radio },
    { id: 'reports', label: 'Reports & Audit', icon: FileText },
  ];

  const model2Tabs = [
    { id: 'video_wall', label: 'Unified Video Wall', icon: Tv },
    { id: 'metadata_search', label: 'Forensic Metadata Search', icon: Search },
    { id: 'anpr', label: 'ANPR Feed & Hotlist', icon: CreditCard, badgeText: 'LIVE' },
    { id: 'vehicle_investigation', label: 'Vehicle Dossier', icon: FileText },
    { id: 'cross_camera', label: 'Cross-Camera Movement', icon: Route },
    { id: 'events', label: 'AI Events & Alerts', icon: Bell, badgeText: 'ALERT' },
    { id: 'investigations', label: 'Investigation Workspace', icon: FolderLock },
    { id: 'live_tests', label: 'Live Evaluation & Tests', icon: Activity, badgeText: 'TESTS' },
  ];

  const model2TabIds = ['video_wall', 'metadata_search', 'anpr', 'vehicle_investigation', 'cross_camera', 'events', 'investigations', 'live_tests'];
  const [preferredModel, setPreferredModel] = useState<'model1' | 'model2'>('model1');

  const activeModel = model2TabIds.includes(selectedTab) ? 'model2' : preferredModel;
  const currentTabs = activeModel === 'model2' ? model2Tabs : model1Tabs;

  const roles: { role: UserRole; title: string; desc: string }[] = [
    { role: 'STATE_ADMIN', title: 'State Admin (Gujarat State Command)', desc: 'Statewide governance, conflict resolution, Sentinel sync' },
    { role: 'DISTRICT_ADMIN', title: 'District Admin (Surat / Ahmedabad)', desc: 'District-level operational and field oversight' },
    { role: 'DEPARTMENT_OFFICER', title: 'Department Officer (Police / Municipal)', desc: 'Asset custodian & department inventory verification' },
    { role: 'MAINTENANCE_OFFICER', title: 'Maintenance Officer', desc: 'P1-P4 priority triage, work orders, telemetry repair' },
    { role: 'AUDITOR', title: 'State Auditor', desc: 'Compliance audit, data quality verification, immutable logs' },
  ];

  const handleOpenSentinel = () => {
    if (onOpenSentinel) {
      onOpenSentinel();
    } else {
      handleTabChange('sentinel');
    }
  };

  return (
    <header id="platform-navbar" className="bg-slate-950 border-b border-slate-800 sticky top-0 z-40 shadow-2xl">
      {/* Top Banner with Strict Governance Labels & Live Evaluation Switch */}
      <div className="bg-slate-900 border-b border-slate-800/80 px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between text-xs sm:text-sm gap-2">
        <div className="flex items-center space-x-3">
          {/* Explicit DEMO MODE & LIVE MODE Indicators - Replaced with Clean Network Status in Presentation Mode */}
          {isPresentationMode ? (
            <div id="presentation-live-indicator" className="flex items-center space-x-2 bg-emerald-950/90 border border-emerald-500/80 text-emerald-300 px-3 py-1 rounded-lg font-mono font-bold shadow-md shadow-emerald-950/50">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              <span className="tracking-wider text-emerald-200">STATEWIDE C&C NETWORK ONLINE</span>
            </div>
          ) : evaluationMode === 'LIVE' ? (
            <div id="live-mode-indicator" className="flex items-center space-x-2 bg-emerald-950/90 border border-emerald-500/80 text-emerald-300 px-3 py-1 rounded-lg font-mono font-bold shadow-md shadow-emerald-950/50">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="tracking-wider text-white">LIVE EVALUATION MODE</span>
              <span className="text-emerald-600">|</span>
              <span className="text-emerald-300 text-[11px]">{sentinelHost || 'Active Gateway'}</span>
            </div>
          ) : (
            <div id="demo-mode-indicator" className="flex items-center space-x-2 bg-amber-950/80 border border-amber-500/70 text-amber-300 px-3 py-1 rounded-lg font-mono font-bold shadow-md shadow-amber-950/50">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
              </span>
              <span className="tracking-wider text-amber-200">DEMO MODE (SYNTHETIC BENCHMARK)</span>
            </div>
          )}

          <span className="text-slate-600">|</span>
          <span className="text-slate-300 font-medium hidden sm:inline">MODEL 1 MASTER REGISTRY & DIGITAL TWIN</span>
          <span className="text-slate-600 hidden md:inline">|</span>
          <span className="text-emerald-400 hidden lg:inline font-semibold">MODEL 2 UNIFIED ANALYTICS & WHEP/HLS STREAMS</span>
        </div>

        <div className="flex items-center space-x-3 text-xs sm:text-sm">
          {/* Top Bar Quick RECORD DEMO Trigger (Hidden in Presentation Mode) */}
          {!isPresentationMode && onOpenRecordDemo && (
            <button
              id="quick-record-demo-btn"
              onClick={onOpenRecordDemo}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg font-mono font-bold text-xs cursor-pointer transition shadow-md border ${
                isRecordingDemo
                  ? 'bg-rose-600 text-white border-rose-400 animate-pulse'
                  : isRehearsingDemo
                  ? 'bg-cyan-600 text-white border-cyan-400'
                  : 'bg-rose-950/80 hover:bg-rose-900 text-rose-300 border-rose-700/80'
              }`}
              title="Automated Hackathon Demo Recorder"
            >
              <Video className="w-3.5 h-3.5" />
              <span>{isRecordingDemo ? '● RECORDING' : isRehearsingDemo ? '▶ REHEARSAL' : 'RECORD DEMO'}</span>
            </button>
          )}

          {/* Mode Switcher Pill (Hidden in Presentation Mode) */}
          {!isPresentationMode && onToggleEvaluationMode && (
            <div className="flex items-center bg-slate-950 border border-slate-700 rounded-lg p-0.5">
              <button
                id="toggle-demo-mode-btn"
                onClick={() => onToggleEvaluationMode('DEMO')}
                className={`px-2.5 py-1 rounded text-xs font-bold transition cursor-pointer ${
                  evaluationMode === 'DEMO'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Switch to Synthetic Demo Mode (No host required)"
              >
                DEMO
              </button>
              <button
                id="toggle-live-mode-btn"
                onClick={() => onToggleEvaluationMode('LIVE')}
                className={`px-2.5 py-1 rounded text-xs font-bold transition cursor-pointer flex items-center space-x-1 ${
                  evaluationMode === 'LIVE'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Switch to Live Evaluation Mode (Requires Sentinel Host)"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span>LIVE EVAL</span>
              </button>
            </div>
          )}

          {/* Sentinel Host Settings Trigger (Hidden in Presentation Mode) */}
          {!isPresentationMode && onOpenLiveSettings && (
            <button
              onClick={onOpenLiveSettings}
              className="flex items-center space-x-1 bg-slate-950 hover:bg-slate-800 border border-slate-700 text-cyan-300 px-2.5 py-1 rounded-lg text-xs font-mono transition cursor-pointer"
              title="Configure Sentinel Host (<SENTINEL_HOST>) and trigger /api/ingest discovery"
            >
              <Radio className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Sentinel:</span>
              <span className="font-bold">{sentinelHost || 'Config (Optional)'}</span>
              <Sliders className="w-3 h-3 text-slate-400 ml-0.5" />
            </button>
          )}

          {/* Dedicated Screenshot / Presentation Mode Toggle Button */}
          <button
            id="toggle-presentation-mode-btn"
            onClick={togglePresentationMode}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer border ${
              isPresentationMode
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/70 shadow-md shadow-emerald-950/50 ring-1 ring-emerald-400/40'
                : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
            }`}
            title="Toggle Presentation / Screenshot Mode (Alt+P): Hides recording, reset, and developer tools for clean executive screenshots"
          >
            <Monitor className={`w-3.5 h-3.5 ${isPresentationMode ? 'text-emerald-400' : 'text-slate-400'}`} />
            <span>{isPresentationMode ? 'PRESENTATION: ON' : 'PRESENTATION MODE'}</span>
          </button>

          {/* UI Scaling / Font Size Toggle */}
          {onToggleUiScale && (
            <div className="flex items-center space-x-1 bg-slate-800/80 border border-slate-700 px-2 py-1 rounded-lg">
              <ZoomIn className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-slate-400 text-xs font-semibold mr-1">Scale:</span>
              <button
                onClick={() => onToggleUiScale('normal')}
                className={`px-1.5 py-0.5 rounded text-xs font-bold transition cursor-pointer ${
                  uiScale === 'normal' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Normal 100% UI"
              >
                100%
              </button>
              <button
                onClick={() => onToggleUiScale('large')}
                className={`px-1.5 py-0.5 rounded text-xs font-bold transition cursor-pointer ${
                  uiScale === 'large' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Comfortable 115% UI"
              >
                115%
              </button>
              <button
                onClick={() => onToggleUiScale('xlarge')}
                className={`px-1.5 py-0.5 rounded text-xs font-bold transition cursor-pointer ${
                  uiScale === 'xlarge' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Large 125% UI"
              >
                125%
              </button>
            </div>
          )}

          {!isPresentationMode && (
            <button
              id="sentinel-sync-btn"
              onClick={handleOpenSentinel}
              className="flex items-center space-x-1.5 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/60 px-3 py-1.5 rounded-lg transition-colors text-xs font-medium cursor-pointer"
              title="Sentinel Gateway integration status"
            >
              <Cpu className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>Sentinel Gateway {isSyncing ? 'Syncing...' : 'Connected'}</span>
            </button>
          )}

          {!isPresentationMode && onResetData && (
            <button
              id="reset-demo-data-btn"
              onClick={onResetData}
              className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-3 py-1.5 rounded-lg transition-colors text-xs font-medium cursor-pointer"
              title="Reload fresh 500+ synthetic camera dataset"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Demo</span>
            </button>
          )}

          {typeof window !== 'undefined' && window.self !== window.top && (
            <a
              href={typeof window !== 'undefined' ? window.location.href : '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-600/50 px-2.5 py-1.5 rounded-lg transition-colors text-xs font-medium cursor-pointer shadow-sm"
              title="Open DRISHTI-NEXUS in a new tab for native screen recording permissions"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Open in Standalone Tab</span>
            </a>
          )}
        </div>
      </div>

      {/* Main Header Bar - Enlarged & High-Contrast */}
      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-500/20 border border-blue-400/40">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight uppercase">
                Gujarat CCTV Asset Intelligence Platform
              </h1>
              <span className="bg-blue-900/80 text-blue-300 border border-blue-600/60 text-xs font-bold px-2.5 py-0.5 rounded-md">
                GJ-CAIP v1.0
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5 font-medium">
              Statewide Digital Twin • Health • Coverage Debt • Provenance • Readiness
            </p>
          </div>
        </div>

        {/* Action Controls: Prominent "RECORD DEMO", "+ Add CCTV Asset" and Role Switcher */}
        <div className="flex items-center space-x-3">
          {/* Prominent RECORD DEMO Button (Hidden in Presentation Mode) */}
          {!isPresentationMode && onOpenRecordDemo && (
            <button
              id="record-demo-btn"
              onClick={onOpenRecordDemo}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-black text-sm shadow-xl transition-all cursor-pointer border ${
                isRecordingDemo
                  ? 'bg-rose-600 text-white border-rose-400 animate-pulse shadow-rose-900/80'
                  : isRehearsingDemo
                  ? 'bg-cyan-600 text-white border-cyan-400 shadow-cyan-900/80'
                  : 'bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-red-500 text-white border-rose-400/60 shadow-rose-950/70 hover:scale-105 active:scale-95'
              }`}
              title="Automated Hackathon Demo Recorder (Press once to record broadcast demo)"
            >
              <span className={`w-2.5 h-2.5 rounded-full ${isRecordingDemo ? 'bg-white animate-ping' : isRehearsingDemo ? 'bg-cyan-200' : 'bg-white animate-pulse'}`} />
              <Video className="w-4 h-4 text-white" />
              <span>
                {isRecordingDemo ? 'RECORDING DEMO...' : isRehearsingDemo ? 'DEMO RUNNING' : 'RECORD DEMO'}
              </span>
            </button>
          )}

          {/* Big, Prominent Add Camera Button */}
          {onOpenAddCamera && (
            <button
              id="open-add-camera-btn"
              onClick={onOpenAddCamera}
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-400 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-600/30 border border-blue-400/30 cursor-pointer transition-all hover:scale-105 active:scale-95"
              title="Commission new CCTV infrastructure asset into registry"
            >
              <PlusCircle className="w-5 h-5 text-white" />
              <span>+ Add CCTV Asset</span>
            </button>
          )}

          {/* User Role Switcher Dropdown & Sign Out */}
          <div className="relative flex items-center space-x-2">
            <button
              id="role-switcher-btn"
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center space-x-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 px-3.5 py-2 rounded-xl text-xs sm:text-sm cursor-pointer transition-colors shadow-sm"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
              <div className="text-left">
                <div className="text-[10px] text-slate-400 font-mono tracking-wider">CURRENT ROLE:</div>
                <div className="font-bold text-blue-300">{String(userRole || 'STATE_ADMIN').replace(/_/g, ' ')}</div>
              </div>
              <span className="text-slate-400 text-xs">▼</span>
            </button>

            {onLogout && (
              <button
                id="sign-out-btn"
                onClick={onLogout}
                className="flex items-center space-x-1.5 bg-slate-900 hover:bg-rose-950/60 hover:text-rose-300 border border-slate-700 hover:border-rose-700/60 text-slate-300 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                title="Sign out of demo session"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            )}

            {showRoleMenu && (
              <div className="absolute right-0 top-full mt-2 w-88 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50">
                {currentUser && (
                  <div className="px-4 py-2 border-b border-slate-800 bg-slate-950/60 flex items-center space-x-2.5">
                    <User className="w-4 h-4 text-blue-400" />
                    <div className="text-xs truncate">
                      <div className="text-white font-bold truncate">{currentUser.name}</div>
                      <div className="text-slate-400 font-mono text-[11px] truncate">{currentUser.email}</div>
                    </div>
                  </div>
                )}
                <div className="px-4 py-2 text-xs font-bold text-slate-400 border-b border-slate-800">
                  SWITCH RBAC SIMULATION ROLE
                </div>
                {roles.map(r => (
                  <button
                    key={r.role}
                    onClick={() => {
                      setUserRole(r.role);
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-xs sm:text-sm transition-colors flex items-start space-x-3 hover:bg-slate-800 cursor-pointer ${
                      userRole === r.role ? 'bg-blue-950/80 text-blue-300 border-l-4 border-blue-500 font-semibold' : 'text-slate-300'
                    }`}
                  >
                    <div className="mt-0.5">
                      {userRole === r.role ? (
                        <CheckCircle2 className="w-4 h-4 text-blue-400" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-600"></div>
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-100">{r.title}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{r.desc}</div>
                    </div>
                  </button>
                ))}

                {onLogout && (
                  <div className="p-2 border-t border-slate-800 mt-1">
                    <button
                      onClick={() => {
                        setShowRoleMenu(false);
                        onLogout();
                      }}
                      className="w-full py-2 px-3 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 rounded-lg text-xs font-semibold flex items-center justify-center space-x-2 cursor-pointer transition"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out from Demo Console</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Architecture Layer Switcher & Nav Bar */}
      <div className="bg-slate-900/90 border-t border-slate-800/90 px-4 sm:px-6 py-2">
        <div className="max-w-[1700px] mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Layer Selector */}
          <div className="flex items-center space-x-2 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              id="model1-tab-group-btn"
              onClick={() => {
                setPreferredModel('model1');
                if (model2TabIds.includes(selectedTab)) {
                  handleTabChange('dashboard');
                }
              }}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                activeModel === 'model1'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <span>🏛️</span>
              <span>MODEL 1: ASSET REGISTRY & DIGITAL TWIN</span>
              <span className="text-[10px] opacity-75 font-mono">(13 Tools)</span>
            </button>

            <button
              id="model2-tab-group-btn"
              onClick={() => {
                setPreferredModel('model2');
                if (!model2TabIds.includes(selectedTab)) {
                  handleTabChange('video_wall');
                }
              }}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                activeModel === 'model2'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <span>🎥</span>
              <span>MODEL 2: UNIFIED VIEWING & METADATA</span>
              <span className="text-[10px] opacity-75 font-mono">(7 Workspaces)</span>
            </button>
          </div>

          {/* Context Badge */}
          <div className="hidden lg:flex items-center space-x-2 text-xs text-slate-400 font-mono">
            <span>SURVEILLANCE LAYER:</span>
            <span className={`px-2 py-0.5 rounded font-bold ${
              activeModel === 'model2'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
            }`}>
              {activeModel === 'model2' ? 'MODEL 2 (OPERATIONAL SURVEILLANCE & AI)' : 'MODEL 1 (INFRASTRUCTURE & DATA GOVERNANCE)'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation Bar - Enlarged with Comfortable Touch Targets */}
      <nav id="platform-nav-tabs" className="max-w-[1700px] mx-auto px-4 sm:px-6 overflow-x-auto flex space-x-1.5 border-t border-slate-800/80 scrollbar-none">
        {currentTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = selectedTab === tab.id || (tab.id === 'map' && selectedTab === 'gis');
          const isM2 = activeModel === 'model2';
          const badgeText = (tab as any).badgeText;
          const badgeCount = (tab as any).badge;

          return (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center space-x-2 px-3.5 py-3 text-xs sm:text-sm font-semibold whitespace-nowrap transition-all border-b-2 cursor-pointer ${
                isActive
                  ? isM2
                    ? 'border-cyan-400 text-cyan-300 bg-cyan-950/30'
                    : 'border-blue-500 text-blue-400 bg-blue-950/30'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? (isM2 ? 'text-cyan-400' : 'text-blue-400') : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {badgeCount && badgeCount > 0 ? (
                <span className="ml-1 px-2 py-0.5 text-xs bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full font-bold">
                  {badgeCount}
                </span>
              ) : null}
              {badgeText ? (
                <span className={`ml-1 px-1.5 py-0.2 text-[10px] font-mono rounded font-extrabold ${
                  badgeText === 'LIVE' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}>
                  {badgeText}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>
    </header>
  );
};
