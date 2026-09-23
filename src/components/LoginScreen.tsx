import React, { useState } from 'react';
import { UserRole } from '../types';
import { PixelCanvas } from './PixelCanvas';
import {
  Shield,
  Lock,
  Mail,
  Zap,
  CheckCircle2,
  Database,
  MapPin,
  HeartPulse,
  Radio,
  HelpCircle,
  AlertCircle,
  Cpu,
} from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (user: {
    email: string;
    name: string;
    role: UserRole;
    department?: string;
  }) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('demo@drishtinexus.demo');
  const [password, setPassword] = useState('Demo@123');
  const [role, setRole] = useState<UserRole>('STATE_ADMIN');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          requestedRole: role,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to authenticate');
      }

      onLoginSuccess(data.user);
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLaunch = (chosenRole: UserRole = 'STATE_ADMIN') => {
    setIsLoading(true);
    setErrorMsg(null);

    // Instant bypass for zero-friction evaluation
    setTimeout(() => {
      onLoginSuccess({
        email: 'demo@drishtinexus.demo',
        name:
          chosenRole === 'STATE_ADMIN'
            ? 'State Command Admin (Demo)'
            : chosenRole === 'DISTRICT_ADMIN'
            ? 'District Surveillance Officer'
            : chosenRole === 'MAINTENANCE_OFFICER'
            ? 'Lead Maintenance Engineer'
            : 'State Compliance Auditor',
        role: chosenRole,
        department: 'Gujarat Police & Command Infrastructure',
      });
      setIsLoading(false);
    }, 200);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* Top Prominent Hackathon & Synthetic Data Alert */}
      <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-2 text-center text-xs sm:text-sm font-semibold text-amber-300 flex items-center justify-center space-x-2">
        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
        <span className="font-mono bg-amber-400/20 text-amber-200 px-2 py-0.5 rounded border border-amber-400/40">
          SYNTHETIC DEMO DATA
        </span>
        <span className="hidden sm:inline">
          • Official Gujarat CCTV Asset Intelligence Platform Model 1 Prototype Sandbox
        </span>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 relative overflow-hidden">
        <PixelCanvas
          colors={["#0B1F3A", "#123B68", "#1E5A8A", "#2B78A8"]}
          speed={0.03}
          gap={7}
          variant="default"
        />
        <div className="relative z-10 max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Platform Overview & Feature Checklist */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center space-x-2 bg-blue-950/80 border border-blue-800 text-blue-300 px-3 py-1 rounded-full text-xs font-semibold">
                <Shield className="w-3.5 h-3.5 text-blue-400" />
                <span>MODEL 1 HACKATHON PROTOTYPE</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
                Gujarat CCTV Asset Intelligence Platform
              </h1>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                Statewide multi-department registry, GIS digital twin, coverage debt scoring, redundancy analysis, and health lifecycle triage across Gujarat.
              </p>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex items-start space-x-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-200">GIS Digital Twin</div>
                  <div className="text-slate-400 text-[11px]">500+ active nodes across 10 districts</div>
                </div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex items-start space-x-2.5">
                <Radio className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-200">Coverage & Redundancy</div>
                  <div className="text-slate-400 text-[11px]">FOV overlap & junction debt audit</div>
                </div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex items-start space-x-2.5">
                <HeartPulse className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-200">Health & P1 Triage</div>
                  <div className="text-slate-400 text-[11px]">Predictive MTBF & failure queue</div>
                </div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex items-start space-x-2.5">
                <HelpCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-200">Ask the Registry</div>
                  <div className="text-slate-400 text-[11px]">Deterministic NLP query engine</div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 text-xs text-slate-400 flex items-center space-x-3">
              <Database className="w-5 h-5 text-blue-400 shrink-0" />
              <span>
                Simulates multi-source ingestion (Police, Municipal, GSRTC, Ports, Tollways) with data conflict resolution and immutable audit ledgers.
              </span>
            </div>
          </div>

          {/* Right Column: Demo Authentication Card */}
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
            {/* Ambient subtle glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider">
                  SECURE DEMO PORTAL
                </span>
                <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  PUBLIC PREVIEW
                </span>
              </div>
              <h2 className="text-xl font-bold text-white">Sign In to Model 1 Console</h2>
              <p className="text-xs text-slate-400">
                Test the prototype with pre-authorized hackathon credentials or 1-click instant access.
              </p>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="bg-rose-950/80 border border-rose-800 text-rose-300 p-3 rounded-xl text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Quick 1-Click Launch Button */}
            <div className="bg-blue-950/40 border border-blue-800/60 rounded-xl p-4 text-center space-y-3">
              <div className="flex items-center justify-between text-xs text-blue-300 font-semibold">
                <span>⚡ Instant Team Evaluation:</span>
                <span className="text-emerald-400 font-mono">No Typing Required</span>
              </div>
              <button
                type="button"
                id="instant-demo-btn"
                onClick={() => handleQuickDemoLaunch(role)}
                disabled={isLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-400 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/30 border border-blue-400/40 cursor-pointer flex items-center justify-center space-x-2 transition-transform active:scale-95"
              >
                <Zap className="w-4 h-4 fill-current text-amber-300" />
                <span>1-Click Instant Demo Login (State Admin)</span>
              </button>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-800"></div>
              <span className="flex-shrink mx-3 text-[11px] text-slate-500 font-mono uppercase">
                OR SIGN IN WITH CREDENTIALS
              </span>
              <div className="flex-grow border-t border-slate-800"></div>
            </div>

            {/* Form with Pre-filled Demo Credentials */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Demo Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    id="demo-email-input"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl pl-9 pr-3 py-2.5 text-xs sm:text-sm text-slate-200 font-mono focus:outline-none"
                    placeholder="demo@drishtinexus.demo"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Demo Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    id="demo-password-input"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl pl-9 pr-3 py-2.5 text-xs sm:text-sm text-slate-200 font-mono focus:outline-none"
                    placeholder="Demo@123"
                  />
                </div>
              </div>

              {/* Initial Role Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Initial Evaluation Role (Switchable anytime):
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'STATE_ADMIN', label: 'State Admin (Full)' },
                    { id: 'DISTRICT_ADMIN', label: 'District Admin' },
                    { id: 'MAINTENANCE_OFFICER', label: 'Maintenance Eng' },
                    { id: 'AUDITOR', label: 'State Auditor' },
                  ].map(r => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRole(r.id as UserRole)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium border text-left transition-colors cursor-pointer ${
                        role === r.id
                          ? 'bg-blue-900/60 border-blue-500 text-blue-200 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                id="submit-login-btn"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs sm:text-sm rounded-xl border border-slate-700 cursor-pointer flex items-center justify-center space-x-2 transition"
              >
                {isLoading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-blue-400" />
                    <span>Enter Console ({role.replace(/_/g, ' ')})</span>
                  </>
                )}
              </button>
            </form>

            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between font-mono">
              <span>Default Credentials:</span>
              <span className="text-blue-300 font-bold">demo@drishtinexus.demo / Demo@123</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800/80 px-4 py-3 text-center text-xs text-slate-500">
        Gujarat Directorate of Command & Control Infrastructure • Model 1 Hackathon Prototype • Synthetic Registry Engine
      </footer>
    </div>
  );
};
