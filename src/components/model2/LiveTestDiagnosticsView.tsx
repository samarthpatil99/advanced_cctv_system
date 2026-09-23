import React, { useState, useEffect } from 'react';
import {
  LiveEvaluationConfig,
  LiveStreamChannel,
  LiveTestSuiteResult,
  Camera,
} from '../../types';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  RefreshCw,
  Server,
  Radio,
  Clock,
  Shield,
  Activity,
  Terminal,
  Cpu,
  Layers,
  ChevronRight,
  ChevronDown,
  Info,
  Sliders,
  Tv,
  ExternalLink,
} from 'lucide-react';

interface LiveTestDiagnosticsViewProps {
  config: LiveEvaluationConfig;
  channels: LiveStreamChannel[];
  cameras: Camera[];
  onTriggerDiscovery: () => Promise<any>;
  onReconnectStream: (streamId: string) => Promise<any>;
  onInjectFault: (streamId: string, fault: any) => Promise<any>;
  onOpenSettings: () => void;
  onOpenDigitalTwin?: (camera: Camera) => void;
}

export const LiveTestDiagnosticsView: React.FC<LiveTestDiagnosticsViewProps> = ({
  config,
  channels,
  cameras,
  onTriggerDiscovery,
  onReconnectStream,
  onInjectFault,
  onOpenSettings,
  onOpenDigitalTwin,
}) => {
  const [testResults, setTestResults] = useState<LiveTestSuiteResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'TESTS' | 'CHANNELS' | 'DOCS'>('TESTS');
  const [expandedTest, setExpandedTest] = useState<string | null>(null);
  const [selectedStreamId, setSelectedStreamId] = useState<string>(channels[0]?.stream_id || '');
  const [injectFeedback, setInjectFeedback] = useState<string | null>(null);

  // Run tests on mount
  useEffect(() => {
    runAutomatedTests();
  }, []);

  const runAutomatedTests = async () => {
    setIsRunningTests(true);
    try {
      const res = await fetch('/api/model2/live/tests/run');
      const data = await res.json();
      if (data && data.results) {
        setTestResults(data.results);
      }
    } catch (err: any) {
      console.error('Failed to run live test suite', err);
    } finally {
      setIsRunningTests(false);
    }
  };

  const handleFaultInjection = async (fault: any) => {
    if (!selectedStreamId) return;
    try {
      const res = await onInjectFault(selectedStreamId, fault);
      setInjectFeedback(`Injected ${fault} on ${selectedStreamId}: ${res?.channel?.last_warning || 'Fault acknowledged'}`);
      setTimeout(() => setInjectFeedback(null), 5000);
    } catch (err: any) {
      setInjectFeedback(`Error: ${err.message}`);
    }
  };

  const passedCount = testResults.filter(t => t.passed).length;
  const totalCount = testResults.length;

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 flex flex-col overflow-y-auto">
      {/* Top Banner */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <Radio className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-xl font-black text-white tracking-tight uppercase">
                    DRISHTI-NEXUS Live CCTV Evaluation Suite
                  </h1>
                  <span className="bg-emerald-950 text-emerald-400 border border-emerald-700/60 text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                    SENTINEL READY
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Automated verification of dynamic catalogue discovery, mixed codecs, PTS presentation timing & failovers
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenSettings}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs px-3.5 py-2 rounded-xl flex items-center space-x-2 transition cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>Configure Sentinel Host</span>
            </button>

            <button
              onClick={runAutomatedTests}
              disabled={isRunningTests}
              className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center space-x-2 shadow-lg shadow-cyan-600/30 transition cursor-pointer"
            >
              <Play className={`w-3.5 h-3.5 ${isRunningTests ? 'animate-spin' : ''}`} />
              <span>{isRunningTests ? 'Evaluating Pipeline...' : 'Run Automated Test Suite'}</span>
            </button>
          </div>
        </div>

        {/* Live Environment Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
            <div className="text-[10px] font-mono uppercase text-slate-400">Target Sentinel Host</div>
            <div className="text-sm font-bold font-mono text-cyan-300 mt-1 truncate" title={config.sentinel_host || 'Mock/Synthetic Mode'}>
              {config.sentinel_host || 'Mock/Synthetic (No Host)'}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5 truncate">
              {config.sentinel_host ? `GET http://${config.sentinel_host}/api/ingest` : 'Synthetic Demo Pipeline Active'}
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
            <div className="text-[10px] font-mono uppercase text-slate-400">Stream Transport</div>
            <div className="text-sm font-bold font-mono text-emerald-400 mt-1">
              RTSP TCP (Forced)
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Interleaved RTP/AVP</div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
            <div className="text-[10px] font-mono uppercase text-slate-400">Presentation Timing</div>
            <div className="text-sm font-bold font-mono text-amber-300 mt-1">
              90kHz Video PTS
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Never constant FPS / arrival</div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
            <div className="text-[10px] font-mono uppercase text-slate-400">Model 1 Integration</div>
            <div className="text-sm font-bold font-mono text-cyan-400 mt-1">
              global_camera_id
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Authoritative Asset Truth</div>
          </div>
        </div>

        {/* Workspace Tab Navigation */}
        <div className="flex items-center space-x-2 mt-5 border-b border-slate-800">
          <button
            onClick={() => setActiveTab('TESTS')}
            className={`px-4 py-2 font-bold text-xs border-b-2 transition cursor-pointer flex items-center space-x-2 ${
              activeTab === 'TESTS'
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Automated Test Results ({passedCount}/{totalCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('CHANNELS')}
            className={`px-4 py-2 font-bold text-xs border-b-2 transition cursor-pointer flex items-center space-x-2 ${
              activeTab === 'CHANNELS'
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>Discovered Channels & Telemetry ({channels.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('DOCS')}
            className={`px-4 py-2 font-bold text-xs border-b-2 transition cursor-pointer flex items-center space-x-2 ${
              activeTab === 'DOCS'
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Setup Instructions & Architecture Docs</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Body */}
      <div className="flex-1 p-6 space-y-6">
        {activeTab === 'TESTS' && (
          <div className="space-y-4">
            {/* Summary Banner */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  ✓
                </div>
                <div>
                  <div className="text-sm font-bold text-white">
                    Automated Verification Suite: {passedCount} / {totalCount} Passed
                  </div>
                  <div className="text-xs text-slate-400">
                    Target host: <span className="font-mono text-cyan-300">http://{config.sentinel_host}/api/ingest</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-400">Filter:</span>
                {['ALL', 'CATALOGUE', 'CODEC', 'PTS_TIMING', 'RECONNECT', 'FAILOVER'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-mono transition cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Test Cards List */}
            <div className="space-y-3">
              {testResults
                .filter(t => selectedCategory === 'ALL' || t.category === selectedCategory)
                .map(test => {
                  const isExpanded = expandedTest === test.test_id;
                  return (
                    <div
                      key={test.test_id}
                      className={`bg-slate-900 border rounded-xl overflow-hidden transition ${
                        test.passed ? 'border-slate-800' : 'border-rose-900/60'
                      }`}
                    >
                      <div
                        onClick={() => setExpandedTest(isExpanded ? null : test.test_id)}
                        className="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-850 transition select-none"
                      >
                        <div className="flex items-center space-x-3.5">
                          {test.passed ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                          ) : (
                            <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                          )}
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-mono font-bold text-cyan-400">
                                {test.test_id}
                              </span>
                              <span className="text-sm font-bold text-white">{test.name}</span>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">{test.details}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          <span className="text-[11px] font-mono text-slate-500">
                            {test.duration_ms}ms
                          </span>
                          <span
                            className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider font-mono ${
                              test.passed
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : 'bg-rose-950 text-rose-300 border border-rose-800'
                            }`}
                          >
                            {test.passed ? 'PASSED' : 'FAILED'}
                          </span>
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                      </div>

                      {/* Detailed Assertions Drawer */}
                      {isExpanded && (
                        <div className="px-5 py-3 bg-slate-950/80 border-t border-slate-800/80 space-y-2 text-xs font-mono">
                          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            Assertion Verifications:
                          </div>
                          <div className="space-y-1.5">
                            {test.assertions.map((a, i) => (
                              <div
                                key={i}
                                className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                              >
                                <div className="flex items-center space-x-2">
                                  {a.passed ? (
                                    <span className="text-emerald-400 font-bold text-xs">✓</span>
                                  ) : (
                                    <span className="text-rose-400 font-bold text-xs">✗</span>
                                  )}
                                  <span className="text-slate-200">{a.label}</span>
                                </div>
                                <div className="flex items-center space-x-3 text-[11px]">
                                  <span className="text-slate-500">
                                    Expected: <span className="text-slate-300">{a.expected}</span>
                                  </span>
                                  <span className="text-slate-500">|</span>
                                  <span className="text-slate-500">
                                    Actual: <span className="text-cyan-300 font-bold">{a.actual}</span>
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>

            {/* Interactive Live Stream Fault Injection Panel */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Sliders className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Interactive Live Fault Injector & Resilience Benchmark
                  </h3>
                </div>
                <span className="text-xs text-slate-400">
                  Simulate network anomalies on live streams
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-400 shrink-0">Target Stream:</span>
                  <select
                    value={selectedStreamId}
                    onChange={e => setSelectedStreamId(e.target.value)}
                    className="bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-cyan-500"
                  >
                    {channels.map(ch => (
                      <option key={ch.stream_id} value={ch.stream_id}>
                        {ch.stream_id} ({ch.global_camera_id} - {ch.codec})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleFaultInjection('PTS_JUMP')}
                    className="px-3 py-1.5 bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-800 rounded-lg text-xs font-medium cursor-pointer transition"
                  >
                    PTS Jump (+2.5s)
                  </button>

                  <button
                    onClick={() => handleFaultInjection('CODEC_SWITCH')}
                    className="px-3 py-1.5 bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 rounded-lg text-xs font-medium cursor-pointer transition"
                  >
                    Codec Switch (H264 ↔ H265)
                  </button>

                  <button
                    onClick={() => handleFaultInjection('WHEP_FAIL')}
                    className="px-3 py-1.5 bg-purple-950/80 hover:bg-purple-900 text-purple-300 border border-purple-800 rounded-lg text-xs font-medium cursor-pointer transition"
                  >
                    WebRTC Drop (Trigger HLS Failover)
                  </button>

                  <button
                    onClick={() => handleFaultInjection('DISCONNECT')}
                    className="px-3 py-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded-lg text-xs font-medium cursor-pointer transition"
                  >
                    Socket Disconnect (Backoff)
                  </button>

                  <button
                    onClick={() => handleFaultInjection('HEAL')}
                    className="px-3 py-1.5 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 rounded-lg text-xs font-medium cursor-pointer transition font-bold"
                  >
                    Heal Stream
                  </button>
                </div>
              </div>

              {injectFeedback && (
                <div className="p-2.5 bg-slate-950 border border-amber-700/60 rounded-lg text-xs font-mono text-amber-300 flex items-center space-x-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{injectFeedback}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'CHANNELS' && (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Live Stream Ingestion Registry & Telemetry
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Discovered from <span className="text-cyan-300 font-mono">http://{config.sentinel_host}/api/ingest</span>
                </p>
              </div>

              <button
                onClick={onTriggerDiscovery}
                className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Re-query Ingest Catalogue</span>
              </button>
            </div>

            {/* Channels Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <th className="p-3">Stream ID</th>
                    <th className="p-3">Model 1 Global Camera ID</th>
                    <th className="p-3">Codec / Res</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Protocol</th>
                    <th className="p-3">PTS Timestamp</th>
                    <th className="p-3">Jitter / Loss</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {channels.map(ch => {
                    const matchedCam = cameras.find(c => c.global_id === ch.global_camera_id);
                    return (
                      <tr key={ch.stream_id} className="hover:bg-slate-850/60 transition">
                        <td className="p-3 font-bold text-white">{ch.stream_id}</td>
                        <td className="p-3">
                          <div className="text-cyan-300 font-bold">{ch.global_camera_id}</div>
                          <div className="text-[10px] text-slate-400 font-sans truncate max-w-[200px]">
                            {ch.district} • {ch.landmark}
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="px-1.5 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-800 rounded text-[10px] mr-1.5 font-bold">
                            {ch.codec}
                          </span>
                          <span className="text-slate-400">{ch.resolution}</span>
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              ch.status === 'LIVE'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : ch.status === 'DEGRADED'
                                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                : ch.status === 'CRITICAL'
                                ? 'bg-orange-950 text-orange-300 border border-orange-800'
                                : 'bg-rose-950 text-rose-300 border border-rose-800'
                            }`}
                          >
                            {ch.status}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="text-slate-300 font-bold">{ch.protocol}</span>
                          <span className="text-[10px] text-slate-500 block">TCP Forced</span>
                        </td>
                        <td className="p-3">
                          <div className="text-emerald-400 font-bold">{ch.pts_formatted}</div>
                          <div className="text-[10px] text-slate-500">Δ {ch.pts_delta_ms}ms</div>
                        </td>
                        <td className="p-3">
                          <div>{ch.jitter_ms}ms</div>
                          <div className="text-[10px] text-slate-500">{ch.packet_loss_pct}% loss</div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center space-x-1.5">
                            {matchedCam && onOpenDigitalTwin && (
                              <button
                                onClick={() => onOpenDigitalTwin(matchedCam)}
                                className="px-2 py-1 bg-cyan-950 text-cyan-300 border border-cyan-800 hover:bg-cyan-900 rounded text-[10px] cursor-pointer"
                                title="Open Authoritative Model 1 Digital Twin"
                              >
                                Twin
                              </button>
                            )}
                            <button
                              onClick={() => onReconnectStream(ch.stream_id)}
                              className="px-2 py-1 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded text-[10px] cursor-pointer"
                              title="Force Reconnection with Exponential Backoff"
                            >
                              Reconnect
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'DOCS' && (
          <div className="space-y-5 text-sm">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
              <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <Terminal className="w-5 h-5 text-cyan-400" />
                <span>DRISHTI-NEXUS Model 2 Live Evaluation Documentation</span>
              </h3>

              <div className="space-y-4 text-xs text-slate-300 font-sans leading-relaxed">
                <div>
                  <h4 className="text-white font-bold font-mono text-sm mb-1">
                    1. Dynamic Camera Catalogue Discovery
                  </h4>
                  <p>
                    DRISHTI-NEXUS strictly discovers live cameras via HTTP GET from{' '}
                    <code className="bg-slate-950 text-cyan-300 px-1.5 py-0.5 rounded font-mono">
                      http://&lt;SENTINEL_HOST&gt;/api/ingest
                    </code>
                    . Camera IDs and stream endpoints are never hardcoded. The host is fully configurable
                    via the UI or environment variable <code className="text-cyan-300 font-mono">SENTINEL_HOST</code>.
                  </p>
                  <div className="mt-2 bg-slate-950 p-3 rounded-lg font-mono text-[11px] text-slate-300 border border-slate-800">
                    # Test catalogue discovery from terminal:
                    <br />
                    curl -X GET http://{config.sentinel_host || '127.0.0.1:8080'}/api/ingest -H "Accept: application/json"
                  </div>
                </div>

                <div>
                  <h4 className="text-white font-bold font-mono text-sm mb-1">
                    2. Authoritative Asset Integration with Model 1
                  </h4>
                  <p>
                    Every discovered stream is dynamically associated with Model 1's CCTV Asset Registry
                    using <code className="text-emerald-400 font-mono font-bold">global_camera_id</code> (e.g.{' '}
                    <code className="text-cyan-300 font-mono">GJ-AHM-POLICE-PTZ-10571</code>).
                    Model 1 maintains the authoritative asset source of truth for custodian, maintenance history,
                    GIS coordinates, redundancy level, and digital twin specs.
                  </p>
                </div>

                <div>
                  <h4 className="text-white font-bold font-mono text-sm mb-1">
                    3. Stream Protocols & Ingestion Rules
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                      <span className="font-bold text-cyan-400 font-mono block mb-1">
                        RTSP Server-Side Inference
                      </span>
                      <code className="text-[11px] font-mono text-slate-300 block mb-1">
                        rtsp://&lt;host&gt;:8554/stream/&lt;id&gt;
                      </code>
                      <p className="text-[11px] text-slate-400">
                        Transport forced to TCP (interleaved RTP mode). Disables UDP packet drop.
                      </p>
                    </div>

                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                      <span className="font-bold text-emerald-400 font-mono block mb-1">
                        WebRTC / WHEP Live Preview
                      </span>
                      <code className="text-[11px] font-mono text-slate-300 block mb-1">
                        http://&lt;host&gt;:8889/stream/&lt;id&gt;/whep
                      </code>
                      <p className="text-[11px] text-slate-400">
                        Sub-second browser live preview via standard WebRTC HTTP Egress Protocol.
                      </p>
                    </div>

                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                      <span className="font-bold text-amber-400 font-mono block mb-1">
                        HLS Fallback Stream
                      </span>
                      <code className="text-[11px] font-mono text-slate-300 block mb-1">
                        http://&lt;host&gt;/live/stream/&lt;id&gt;/index.m3u8
                      </code>
                      <p className="text-[11px] text-slate-400">
                        Low-latency segmented backup. Seamlessly engaged on WebRTC socket drop.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-white font-bold font-mono text-sm mb-1">
                    4. Strict PTS Presentation Timing Standard
                  </h4>
                  <p>
                    Timing is derived exclusively from 90kHz Presentation Time Stamps (PTS). Wall-clock
                    frame-arrival or constant <code className="text-amber-300 font-mono">1/fps</code> calculations
                    are strictly forbidden. The engine tolerates variable frame intervals (20ms – 80ms) and
                    recovers from non-monotonic timestamp jumps or scene discontinuities cleanly.
                  </p>
                </div>

                <div>
                  <h4 className="text-white font-bold font-mono text-sm mb-1">
                    5. Exponential Backoff (~2s – 30s)
                  </h4>
                  <p>
                    When an RTSP feed disconnects or resets, the system retries with bounded exponential
                    backoff: 2s, 4s, 8s, 16s, capped at 30 seconds, preventing network congestion cascades.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
