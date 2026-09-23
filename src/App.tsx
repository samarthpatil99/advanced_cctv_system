import React, { useState, useEffect } from 'react';
import {
  AuditLogEntry,
  Camera,
  ConflictRecord,
  DashboardStats,
  InvestmentCandidate,
  UserRole,
  LiveStreamChannel,
  LiveEvaluationConfig,
  EvaluationMode,
} from './types';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { GisMapView } from './components/GisMapView';
import { RegistryTableView } from './components/RegistryTableView';
import { HealthLifecycleView } from './components/HealthLifecycleView';
import { CoverageRedundancyView } from './components/CoverageRedundancyView';
import { DataQualityView } from './components/DataQualityView';
import { MaintenancePriorityView } from './components/MaintenancePriorityView';
import { IntegrationReadinessView } from './components/IntegrationReadinessView';
import { AskRegistryView } from './components/AskRegistryView';
import { ReplacementSimulatorView } from './components/ReplacementSimulatorView';
import { InvestmentPriorityView } from './components/InvestmentPriorityView';
import { SentinelConnectorView } from './components/SentinelConnectorView';
import { AuditReportsView } from './components/AuditReportsView';
import { DigitalTwinModal } from './components/DigitalTwinModal';
import { AddCameraModal } from './components/AddCameraModal';
import { LoginScreen } from './components/LoginScreen';
import { VideoWallView } from './components/model2/VideoWallView';
import { MetadataSearchView } from './components/model2/MetadataSearchView';
import { AnprFeedView } from './components/model2/AnprFeedView';
import { VehicleInvestigationView } from './components/model2/VehicleInvestigationView';
import { CrossCameraMovementView } from './components/model2/CrossCameraMovementView';
import { EventsAlertsView } from './components/model2/EventsAlertsView';
import { InvestigationWorkspaceView } from './components/model2/InvestigationWorkspaceView';
import { LiveTestDiagnosticsView } from './components/model2/LiveTestDiagnosticsView';
import { LiveEvaluationSettingsModal } from './components/model2/LiveEvaluationSettingsModal';
import { useDemoController } from './hooks/useDemoController';
import { DemoControllerBar } from './components/demo/DemoControllerBar';
import { VirtualCursor } from './components/demo/VirtualCursor';
import { DemoEndCardModal } from './components/demo/DemoEndCardModal';
import { RecordedVideoModal } from './components/demo/RecordedVideoModal';
import { RecordDemoModal } from './components/demo/RecordDemoModal';
import { usePresentationMode } from './context/PresentationContext';
import { ShieldCheck, RefreshCw, PlusCircle, AlertCircle } from 'lucide-react';

interface DemoUser {
  email: string;
  name: string;
  role: UserRole;
  department?: string;
}

export default function App() {
  const { isPresentationMode } = usePresentationMode();
  const [currentUser, setCurrentUser] = useState<DemoUser | null>(() => {
    try {
      // Auto-login if query parameter ?autologin=1 or ?demo=1 is in URL
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get('autologin') === '1' || searchParams.get('demo') === '1') {
        const autoUser: DemoUser = {
          email: 'demo@drishtinexus.demo',
          name: 'State Command Admin (Demo)',
          role: 'STATE_ADMIN',
          department: 'Gujarat Police & Command Infrastructure',
        };
        localStorage.setItem('cctv_registry_demo_user', JSON.stringify(autoUser));
        return autoUser;
      }

      const saved = localStorage.getItem('cctv_registry_demo_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [userRole, setUserRole] = useState<UserRole>(currentUser?.role || 'STATE_ADMIN');
  const [uiScale, setUiScale] = useState<'normal' | 'large' | 'xlarge'>('large');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  const handleLoginSuccess = (user: DemoUser) => {
    setCurrentUser(user);
    setUserRole(user.role);
    try {
      localStorage.setItem('cctv_registry_demo_user', JSON.stringify(user));
    } catch (e) {
      console.warn('Could not persist demo user', e);
    }
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('cctv_registry_demo_user');
    } catch {}
    setCurrentUser(null);
  };

  // Sync role updates to user profile
  const handleRoleChange = (newRole: UserRole) => {
    setUserRole(newRole);
    if (currentUser) {
      const updatedUser = { ...currentUser, role: newRole };
      setCurrentUser(updatedUser);
      try {
        localStorage.setItem('cctv_registry_demo_user', JSON.stringify(updatedUser));
      } catch {}
    }
  };

  // Application Data States
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [conflicts, setConflicts] = useState<ConflictRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [investmentCandidates, setInvestmentCandidates] = useState<InvestmentCandidate[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastRefreshed, setLastRefreshed] = useState<string>('');
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  // Model 2 Interaction States
  const [targetVehiclePlate, setTargetVehiclePlate] = useState<string>('GJ-01-ER-4921');
  const [initialWallCamera, setInitialWallCamera] = useState<Camera | null>(null);
  const [metadataInitialCamera, setMetadataInitialCamera] = useState<string | undefined>(undefined);

  // Model 2 Live Evaluation & Stream Ingest States
  const [evaluationMode, setEvaluationMode] = useState<EvaluationMode>('DEMO');
  const [liveConfig, setLiveConfig] = useState<LiveEvaluationConfig | null>(null);
  const [liveChannels, setLiveChannels] = useState<LiveStreamChannel[]>([]);
  const [isLiveSettingsOpen, setIsLiveSettingsOpen] = useState<boolean>(false);

  const fetchLiveState = async () => {
    try {
      const [configRes, channelsRes] = await Promise.all([
        fetch('/api/model2/live/config'),
        fetch('/api/model2/live/channels'),
      ]);
      if (configRes.ok) {
        const configData = await configRes.json();
        setLiveConfig(configData);
        if (configData.mode) {
          setEvaluationMode(configData.mode);
        }
      }
      if (channelsRes.ok) {
        const channelsData = await channelsRes.json();
        setLiveChannels(channelsData);
      }
    } catch (err) {
      console.warn('Could not fetch live evaluation state', err);
    }
  };

  const handleToggleEvaluationMode = async (mode: EvaluationMode) => {
    // If switching to LIVE and no sentinel_host is provided yet, prompt user with settings modal to input host
    if (mode === 'LIVE' && !liveConfig?.sentinel_host) {
      setIsLiveSettingsOpen(true);
      return;
    }
    setEvaluationMode(mode);
    try {
      const res = await fetch('/api/model2/live/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode }),
      });
      if (res.ok) {
        const data = await res.json();
        setLiveConfig(data.config);
      }
      await fetchLiveState();
    } catch (err) {
      console.error('Failed to toggle evaluation mode', err);
    }
  };

  const handleUpdateLiveConfig = async (newHost: string, newMode: EvaluationMode) => {
    try {
      const res = await fetch('/api/model2/live/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sentinel_host: newHost, mode: newMode }),
      });
      if (res.ok) {
        const data = await res.json();
        setLiveConfig(data.config);
        setEvaluationMode(newMode);
      }
      await fetchLiveState();
    } catch (err) {
      console.error('Failed to update live config', err);
      throw err;
    }
  };

  const handleTriggerDiscovery = async () => {
    try {
      const res = await fetch('/api/model2/live/discover', { method: 'POST' });
      const data = await res.json();
      await fetchLiveState();
      return data;
    } catch (err) {
      console.error('Failed to trigger discovery', err);
      throw err;
    }
  };

  const handleReconnectStream = async (streamId: string) => {
    try {
      const res = await fetch(`/api/model2/live/reconnect/${streamId}`, { method: 'POST' });
      const data = await res.json();
      await fetchLiveState();
      return data;
    } catch (err) {
      console.error('Failed to reconnect stream', err);
      throw err;
    }
  };

  const handleInjectFault = async (streamId: string, fault: any) => {
    try {
      const res = await fetch('/api/model2/live/inject-fault', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ streamId, fault }),
      });
      const data = await res.json();
      await fetchLiveState();
      return data;
    } catch (err) {
      console.error('Failed to inject fault', err);
      throw err;
    }
  };

  const handleOpenInVideoWall = (cam: Camera) => {
    setInitialWallCamera(cam);
    setActiveTab('video_wall');
  };

  const handleSearchCameraMetadata = (cam: Camera) => {
    setMetadataInitialCamera(cam.global_id);
    setActiveTab('metadata_search');
  };

  const handleTrackVehicle = (plate: string) => {
    setTargetVehiclePlate(plate);
    setActiveTab('cross_camera');
  };

  const handleInvestigateVehicle = (plate: string) => {
    setTargetVehiclePlate(plate);
    setActiveTab('vehicle_investigation');
  };

  // Automated Demo Recorder Controller
  const [isRecordModalOpen, setIsRecordModalOpen] = useState<boolean>(false);
  const demoController = useDemoController({
    cameras,
    activeTab,
    setActiveTab,
    setSelectedCamera,
    evaluationMode,
    setEvaluationMode: handleToggleEvaluationMode,
    onInjectFault: handleInjectFault,
  });

  const fetchData = async () => {
    try {
      const [camRes, statsRes, confRes, auditRes, investRes] = await Promise.all([
        fetch('/api/cameras'),
        fetch('/api/dashboard/stats'),
        fetch('/api/conflicts'),
        fetch('/api/audit-logs'),
        fetch('/api/investment-candidates'),
      ]);

      const [camData, statsData, confData, auditData, investData] = await Promise.all([
        camRes.json(),
        statsRes.json(),
        confRes.json(),
        auditRes.json(),
        investRes.json(),
      ]);

      // Handle raw payloads or nested envelopes gracefully
      const resolvedCameras: Camera[] = Array.isArray(camData)
        ? camData
        : (camData?.items || camData?.cameras || []);

      const resolvedStats: DashboardStats | null =
        statsData && typeof statsData === 'object'
          ? (statsData.stats || statsData)
          : null;

      const resolvedConflicts: ConflictRecord[] = Array.isArray(confData)
        ? confData
        : (confData?.conflicts || []);

      const resolvedLogs: AuditLogEntry[] = Array.isArray(auditData)
        ? auditData
        : (auditData?.logs || []);

      const resolvedInvest: InvestmentCandidate[] = Array.isArray(investData)
        ? investData
        : (investData?.candidates || []);

      setCameras(resolvedCameras);
      setStats(resolvedStats);
      setConflicts(resolvedConflicts);
      setAuditLogs(resolvedLogs);
      setInvestmentCandidates(resolvedInvest);
      setLastRefreshed(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Failed to fetch statewide registry data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchLiveState();

    // Heartbeat poll for live streams
    const liveTimer = setInterval(() => {
      fetchLiveState();
    }, 4000);

    return () => clearInterval(liveTimer);
  }, []);

  // Update Camera Status / Metadata with Mandatory Reason and Audit Metadata
  const handleUpdateCamera = async (
    id: string,
    updates: Partial<Camera>,
    reason: string
  ) => {
    const res = await fetch(`/api/cameras/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': userRole,
      },
      body: JSON.stringify({
        updates,
        who: `${String(userRole || 'STATE_ADMIN').replace(/_/g, ' ')} Operator`,
        role: userRole,
        reason,
        source: 'Registry Digital Twin Console',
      }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to update camera');
    }

    const data = await res.json();
    const updatedCamera: Camera = data.camera || data;

    // Update locally
    setCameras(prev => prev.map(c => (c.id === id ? updatedCamera : c)));
    if (selectedCamera && selectedCamera.id === id) {
      setSelectedCamera(updatedCamera);
    }

    // Refresh stats & audit logs
    await fetchData();
  };

  // Add Camera Handler
  const handleCameraAdded = (newCam: Camera) => {
    setCameras(prev => [newCam, ...prev]);
    setSelectedCamera(newCam);
    setNotificationMsg(`Successfully commissioned asset ${newCam.global_id} at ${newCam.landmark}!`);
    setTimeout(() => setNotificationMsg(null), 5000);
    fetchData();
  };

  // Resolve Data Provenance Conflict
  const handleResolveConflict = async (
    conflictId: string,
    action: 'ACCEPT_PROPOSED' | 'KEEP_CURRENT' | 'CUSTOM_VALUE',
    customValue: string | undefined,
    reason: string
  ) => {
    const res = await fetch(`/api/conflicts/${conflictId}/resolve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': userRole,
      },
      body: JSON.stringify({
        action,
        customValue,
        who: `${String(userRole || 'STATE_ADMIN').replace(/_/g, ' ')} Officer`,
        role: userRole,
        reason,
      }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to resolve conflict');
    }

    await fetchData();
  };

  const scaleClasses =
    uiScale === 'xlarge'
      ? 'text-base sm:text-lg'
      : uiScale === 'large'
      ? 'text-sm sm:text-base'
      : 'text-xs sm:text-sm';

  // If unauthenticated, show the LoginScreen
  if (!currentUser) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white ${scaleClasses}`}>
      {/* Prominent High-Contrast Synthetic Demo Data Header Banner - Transformed in Presentation Mode */}
      {isPresentationMode ? (
        <div className="bg-emerald-950/70 border-b border-emerald-500/30 px-4 sm:px-6 py-1.5 text-xs text-emerald-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <span className="font-mono bg-emerald-900/60 text-emerald-300 px-2.5 py-0.5 rounded border border-emerald-500/40 font-extrabold uppercase tracking-wider text-[11px]">
              STATEWIDE C&C INFRASTRUCTURE
            </span>
            <span className="text-slate-300 hidden sm:inline font-medium">
              GJ-CAIP Enterprise Command Environment • Verified Multi-Agency CCTV Registry • 10 Districts
            </span>
          </div>
          <div className="flex items-center space-x-3 text-[11px] text-slate-400">
            <span className="hidden md:inline">
              Active Command Admin: <strong className="text-white font-mono">{currentUser?.email}</strong>
            </span>
            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-slate-200 underline cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 sm:px-6 py-1.5 text-xs text-amber-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            <span className="font-mono bg-amber-400/25 text-amber-300 px-2.5 py-0.5 rounded border border-amber-400/40 font-extrabold uppercase tracking-wider text-[11px]">
              SYNTHETIC DEMO DATA
            </span>
            <span className="text-slate-300 hidden sm:inline font-medium">
              Model 1 Hackathon Prototype • 500+ Simulated CCTV Nodes across 10 Gujarat Districts
            </span>
          </div>
          <div className="flex items-center space-x-3 text-[11px] text-slate-400">
            <span className="hidden md:inline">
              Active Operator: <strong className="text-white font-mono">{currentUser?.email}</strong>
            </span>
            <button
              onClick={handleLogout}
              className="text-rose-400 hover:text-rose-300 underline font-semibold cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Top Navigation & RBAC Switcher */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userRole={userRole}
        setUserRole={handleRoleChange}
        currentUser={currentUser}
        onLogout={handleLogout}
        pendingConflictCount={conflicts.filter(c => c.status === 'PENDING').length}
        onResetData={fetchData}
        onOpenSentinel={() => setActiveTab('sentinel')}
        onOpenAddCamera={() => setIsAddModalOpen(true)}
        uiScale={uiScale}
        onToggleUiScale={setUiScale}
        evaluationMode={evaluationMode}
        onToggleEvaluationMode={handleToggleEvaluationMode}
        sentinelHost={liveConfig?.sentinel_host || ''}
        onOpenLiveSettings={() => setIsLiveSettingsOpen(true)}
        onOpenRecordDemo={() => setIsRecordModalOpen(true)}
        isRecordingDemo={demoController.isRecording}
        isRehearsingDemo={demoController.isRehearsing}
        demoActive={demoController.state.status === 'RUNNING' || demoController.state.status === 'PAUSED'}
      />

      {/* Role Context & Regulatory Banner */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between text-xs sm:text-sm text-slate-400 gap-3">
        <div className="flex items-center space-x-3">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-slate-300 font-semibold">Session Role:</span>
          <span className="font-mono font-bold text-blue-300 bg-blue-950 px-3 py-1 rounded-md border border-blue-800">
            {String(userRole || 'STATE_ADMIN').replace(/_/g, ' ')}
          </span>
          <span className="hidden sm:inline text-slate-500">|</span>
          <span className="hidden sm:inline text-slate-300 font-medium">
            Scope:{' '}
            {userRole === 'STATE_ADMIN'
              ? 'Full Statewide Gujarat Master Control'
              : userRole === 'DISTRICT_ADMIN'
              ? 'District-Scoped Read/Write'
              : userRole === 'MAINTENANCE_OFFICER'
              ? 'Health & Triage Work Orders'
              : userRole === 'AUDITOR'
              ? 'Read-Only Audit & Export'
              : 'Department-Scoped Custodian'}
          </span>
        </div>

        <div className="flex items-center space-x-4 text-xs sm:text-sm">
          <span className="text-slate-400">
            Telemetry Synced: <strong className="text-slate-200 font-mono">{lastRefreshed || 'Syncing...'}</strong>
          </span>
          <button
            onClick={() => fetchData()}
            className="text-blue-400 hover:text-blue-300 flex items-center space-x-1.5 cursor-pointer font-medium"
            title="Refresh database records"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      {/* Commissioning Success Toast */}
      {notificationMsg && (
        <div className="bg-emerald-950/90 border-b border-emerald-600/80 px-6 py-3 text-emerald-200 text-sm font-semibold flex items-center justify-between shadow-xl">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>{notificationMsg}</span>
          </div>
          <button
            onClick={() => setNotificationMsg(null)}
            className="text-emerald-400 hover:text-white text-xs cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Content Area - Generous Width and Comfortable Spacing */}
      <main className="flex-1 p-4 sm:p-8 max-w-[1750px] w-full mx-auto">
        {isLoading && !stats ? (
          <div className="h-96 flex flex-col items-center justify-center space-y-4 text-slate-400">
            <RefreshCw className="w-10 h-10 animate-spin text-blue-400" />
            <p className="text-base font-semibold">Initializing Statewide CCTV Registry & GIS Digital Twin...</p>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <DashboardView
                stats={stats}
                onSelectCamera={cam => setSelectedCamera(cam)}
                onNavigate={tab => setActiveTab(tab)}
                onOpenAddCamera={() => setIsAddModalOpen(true)}
                onOpenRecordDemo={() => setIsRecordModalOpen(true)}
                evaluationMode={evaluationMode}
                onToggleEvaluationMode={handleToggleEvaluationMode}
                sentinelHost={liveConfig?.sentinel_host || ''}
                isRecordingDemo={demoController.isRecording}
                isRehearsingDemo={demoController.isRehearsing}
              />
            )}

            {(activeTab === 'map' || activeTab === 'gis') && (
              <GisMapView
                cameras={cameras}
                onSelectCamera={cam => setSelectedCamera(cam)}
              />
            )}

            {activeTab === 'registry' && (
              <RegistryTableView
                cameras={cameras}
                onSelectCamera={cam => setSelectedCamera(cam)}
                onOpenAddCamera={() => setIsAddModalOpen(true)}
              />
            )}

            {activeTab === 'health' && (
              <HealthLifecycleView
                cameras={cameras}
                onSelectCamera={cam => setSelectedCamera(cam)}
                onNavigate={tab => setActiveTab(tab)}
              />
            )}

            {activeTab === 'coverage' && (
              <CoverageRedundancyView
                cameras={cameras}
                onSelectCamera={cam => setSelectedCamera(cam)}
                onNavigate={tab => setActiveTab(tab)}
              />
            )}

            {(activeTab === 'quality' || activeTab === 'data_quality') && (
              <DataQualityView
                cameras={cameras}
                conflicts={conflicts}
                onSelectCamera={cam => setSelectedCamera(cam)}
                onResolveConflict={handleResolveConflict}
                userRole={userRole}
              />
            )}

            {activeTab === 'maintenance' && (
              <MaintenancePriorityView
                cameras={cameras}
                onSelectCamera={cam => setSelectedCamera(cam)}
                onUpdateCamera={handleUpdateCamera}
              />
            )}

            {activeTab === 'integration' && (
              <IntegrationReadinessView
                cameras={cameras}
                onSelectCamera={cam => setSelectedCamera(cam)}
              />
            )}

            {activeTab === 'ask' && (
              <AskRegistryView
                onSelectCamera={cam => setSelectedCamera(cam)}
              />
            )}

            {activeTab === 'simulation' && (
              <ReplacementSimulatorView
                cameras={cameras}
                onSelectCamera={cam => setSelectedCamera(cam)}
              />
            )}

            {activeTab === 'investment' && (
              <InvestmentPriorityView
                candidates={investmentCandidates}
              />
            )}

            {activeTab === 'sentinel' && (
              <SentinelConnectorView
                onRefreshData={fetchData}
                userRole={userRole}
              />
            )}

            {activeTab === 'reports' && (
              <AuditReportsView
                stats={stats}
                cameras={cameras}
                conflicts={conflicts}
                auditLogs={auditLogs}
              />
            )}

            {/* MODEL 2: UNIFIED VIEWING & METADATA ANALYTICS WORKSPACES */}
            {activeTab === 'video_wall' && (
              <VideoWallView
                cameras={cameras}
                liveChannels={liveChannels}
                evaluationMode={evaluationMode}
                sentinelHost={liveConfig?.sentinel_host || ''}
                onSelectCameraForDigitalTwin={cam => setSelectedCamera(cam)}
                onNavigateToTab={tab => setActiveTab(tab)}
                onToggleEvaluationMode={handleToggleEvaluationMode}
                onOpenLiveSettings={() => setIsLiveSettingsOpen(true)}
                onReconnectStream={handleReconnectStream}
                onInjectFault={handleInjectFault}
              />
            )}

            {activeTab === 'metadata_search' && (
              <MetadataSearchView
                cameras={cameras}
                onSelectCameraForDigitalTwin={cam => setSelectedCamera(cam)}
                onInvestigateVehicle={handleInvestigateVehicle}
                onTrackVehicleMovement={handleTrackVehicle}
                onNavigateToTab={tab => setActiveTab(tab)}
              />
            )}

            {activeTab === 'anpr' && (
              <AnprFeedView
                cameras={cameras}
                onSelectCameraForDigitalTwin={cam => setSelectedCamera(cam)}
                onInvestigateVehicle={handleInvestigateVehicle}
                onTrackVehicle={handleTrackVehicle}
                onNavigateToTab={tab => setActiveTab(tab)}
              />
            )}

            {activeTab === 'vehicle_investigation' && (
              <VehicleInvestigationView
                cameras={cameras}
                initialPlate={targetVehiclePlate}
                onSelectCameraForDigitalTwin={cam => setSelectedCamera(cam)}
                onTrackVehicleMovement={handleTrackVehicle}
                onNavigateToTab={tab => setActiveTab(tab)}
              />
            )}

            {activeTab === 'cross_camera' && (
              <CrossCameraMovementView
                cameras={cameras}
                targetPlate={targetVehiclePlate}
                onSelectCameraForDigitalTwin={cam => setSelectedCamera(cam)}
                onNavigateToTab={tab => setActiveTab(tab)}
              />
            )}

            {activeTab === 'events' && (
              <EventsAlertsView
                cameras={cameras}
                onSelectCameraForDigitalTwin={cam => setSelectedCamera(cam)}
                onTrackVehicle={handleTrackVehicle}
                onNavigateToTab={tab => setActiveTab(tab)}
              />
            )}

            {activeTab === 'investigations' && (
              <InvestigationWorkspaceView
                cameras={cameras}
                onSelectCameraForDigitalTwin={cam => setSelectedCamera(cam)}
                onNavigateToTab={tab => setActiveTab(tab)}
              />
            )}

            {activeTab === 'live_tests' && (
              <LiveTestDiagnosticsView
                config={
                  liveConfig || {
                    mode: evaluationMode,
                    sentinel_host: '',
                    is_connected: evaluationMode === 'DEMO',
                    last_ingest_time: '',
                    camera_count: liveChannels.length,
                    rtsp_forced_tcp: true,
                    using_pts_timing: true,
                    exponential_backoff_range: '2s – 30s',
                    source_endpoint: 'Mock / Synthetic Demo Dataset',
                  }
                }
                channels={liveChannels}
                cameras={cameras}
                onTriggerDiscovery={handleTriggerDiscovery}
                onReconnectStream={handleReconnectStream}
                onInjectFault={handleInjectFault}
                onOpenSettings={() => setIsLiveSettingsOpen(true)}
                onOpenDigitalTwin={cam => setSelectedCamera(cam)}
              />
            )}
          </>
        )}
      </main>

      {/* Live Evaluation Sentinel Gateway Settings Modal */}
      <LiveEvaluationSettingsModal
        isOpen={isLiveSettingsOpen}
        onClose={() => setIsLiveSettingsOpen(false)}
        config={
          liveConfig || {
            mode: evaluationMode,
            sentinel_host: '',
            is_connected: evaluationMode === 'DEMO',
            last_ingest_time: '',
            camera_count: liveChannels.length,
            rtsp_forced_tcp: true,
            using_pts_timing: true,
            exponential_backoff_range: '2s – 30s',
            source_endpoint: 'Mock / Synthetic Demo Mode',
          }
        }
        onUpdateConfig={handleUpdateLiveConfig}
        onTriggerDiscovery={handleTriggerDiscovery}
      />

      {/* Add / Commission New CCTV Asset Modal */}
      <AddCameraModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onCameraAdded={handleCameraAdded}
        userRole={userRole}
      />

      {/* Global Camera Digital Twin Modal */}
      {selectedCamera && (
        <DigitalTwinModal
          camera={selectedCamera}
          onClose={() => setSelectedCamera(null)}
          userRole={userRole}
          onUpdateCamera={handleUpdateCamera}
          onOpenInVideoWall={handleOpenInVideoWall}
          onSearchCameraMetadata={handleSearchCameraMetadata}
        />
      )}

      {/* Virtual Presenter Autopilot Cursor */}
      <VirtualCursor
        x={demoController.cursor.x}
        y={demoController.cursor.y}
        visible={demoController.cursor.visible}
        clicking={demoController.cursor.clicking}
        label={demoController.cursor.label}
      />

      {/* Floating Demo Controller & Teleprompter HUD */}
      {(demoController.state.status === 'RUNNING' || demoController.state.status === 'PAUSED') && (
        <DemoControllerBar
          state={demoController.state}
          currentStep={demoController.currentStep}
          onPlay={demoController.resume}
          onPause={demoController.pause}
          onRestart={demoController.restart}
          onStop={demoController.stop}
          onNextStep={demoController.nextStep}
          onPrevStep={demoController.prevStep}
          onChangeSpeed={demoController.setSpeed}
        />
      )}

      {/* Launch Demo Recorder Modal */}
      <RecordDemoModal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        onStartRecordingAndDemo={demoController.startRecordingAndDemo}
        onStartRehearsal={() => {
          setIsRecordModalOpen(false);
          demoController.startRehearsal();
        }}
        isSupported={demoController.isSupported}
        totalSteps={demoController.state.totalSteps}
      />

      {/* Demo Grand Finale End Card Modal */}
      <DemoEndCardModal
        isOpen={demoController.isEndCardOpen}
        onClose={demoController.closeEndCard}
        onRestartDemo={demoController.restart}
        onDownloadRecording={demoController.downloadRecording}
        hasRecording={!!demoController.recordedVideo}
        durationSeconds={demoController.state.elapsedSeconds}
      />

      {/* Recorded Video Playback & Download Modal */}
      <RecordedVideoModal
        isOpen={demoController.isVideoModalOpen}
        onClose={demoController.closeVideoModal}
        videoData={demoController.recordedVideo}
      />

      {/* Enterprise Government Footer */}
      <footer className="bg-slate-950 border-t border-slate-800/80 px-6 sm:px-8 py-5 text-xs sm:text-sm text-slate-400 flex flex-wrap items-center justify-between gap-4 mt-auto">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span className="font-medium">
            Statewide CCTV Asset Intelligence Platform • Directorate of Command & Control Infrastructure
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <span className={`${isPresentationMode ? 'text-emerald-400' : 'text-amber-400'} font-medium`}>
            {isPresentationMode
              ? 'STATUS: Unified Statewide CCTV Repository & Model 2 Stream Analytics Connected'
              : 'NOTICE: Registry & GIS Digital Twin only. Not a live CCTV/VMS streaming or recording system.'}
          </span>
          <span className="font-mono text-slate-500">Security Level: RESTRICTED OFFICIAL</span>
        </div>
      </footer>
    </div>
  );
}
