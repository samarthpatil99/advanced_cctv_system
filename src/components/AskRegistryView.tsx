import React, { useState } from 'react';
import { Camera, QueryInterpretation } from '../types';
import {
  HelpCircle,
  Search,
  Sparkles,
  Terminal,
  Filter,
  ExternalLink,
  ShieldCheck,
  AlertOctagon,
  Wrench,
} from 'lucide-react';

interface AskRegistryViewProps {
  onSelectCamera: (camera: Camera) => void;
}

export const AskRegistryView: React.FC<AskRegistryViewProps> = ({ onSelectCamera }) => {
  const [queryInput, setQueryInput] = useState<string>('offline cameras in Surat');
  const [loading, setLoading] = useState<boolean>(false);
  const [interpretation, setInterpretation] = useState<QueryInterpretation | null>(null);
  const [results, setResults] = useState<Camera[]>([]);

  const sampleQueries = [
    'offline cameras in Surat',
    'cameras older than 5 years',
    'P1 critical priority cameras in Ahmedabad',
    'ANPR cameras in Vadodara',
    'critical redundancy cameras in Rajkot',
    'maintenance units in Gandhinagar',
    'PTZ cameras with health below 60',
    'cameras in Kutch-Kandla with low redundancy',
  ];

  const handleAsk = async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/ask-registry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });
      const data = await res.json();
      setInterpretation(data.interpretation);
      setResults(data.results || []);
    } catch (err: any) {
      console.error('Ask registry error:', err);
      alert(`Query error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="ask-registry-view" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>Ask the Registry: Deterministic NLP Query Engine</span>
            <span className="text-xs bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded font-mono">
              NO EXTERNAL LLM REQUIRED • ZERO LATENCY
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Parses operational questions into relational database filters and explicit SQL translations.
          </p>
        </div>
      </div>

      {/* Query Search Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleAsk(queryInput);
          }}
          className="flex gap-2"
        >
          <div className="relative flex-grow">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={queryInput}
              onChange={e => setQueryInput(e.target.value)}
              placeholder="Ask anything, e.g. 'offline cameras in Surat' or 'cameras older than 5 years'..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white font-semibold px-5 py-2 rounded-lg text-xs transition cursor-pointer flex items-center space-x-1.5 shadow-md shadow-blue-600/30"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{loading ? 'Interpreting...' : 'Execute Query'}</span>
          </button>
        </form>

        {/* Quick Sample Queries */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-slate-400 text-[11px] mr-1">Quick examples:</span>
          {sampleQueries.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setQueryInput(sample);
                handleAsk(sample);
              }}
              className="bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 px-2.5 py-1 rounded text-xs transition cursor-pointer"
            >
              {sample}
            </button>
          ))}
        </div>
      </div>

      {/* Interpretation & SQL Translation Output */}
      {interpretation && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 flex items-center space-x-1.5">
                <Filter className="w-3.5 h-3.5 text-blue-400" />
                <span>Interpreted Operational Intent</span>
              </span>
              <span className="text-[10px] bg-blue-950 text-blue-300 border border-blue-800 px-2 py-0.5 rounded font-mono">
                {results.length} Matches
              </span>
            </div>

            <div className="bg-slate-950 p-3 rounded border border-slate-800 text-xs">
              <span className="text-slate-500 block text-[10px]">PARSED INTENT:</span>
              <p className="text-white font-semibold mt-0.5">{interpretation.interpreted_intent}</p>
            </div>

            <div className="bg-slate-950 p-3 rounded border border-slate-800 text-xs">
              <span className="text-slate-500 block text-[10px]">APPLIED DATABASE FILTER DICTIONARY:</span>
              <pre className="text-emerald-400 font-mono text-[11px] mt-1 overflow-x-auto">
                {JSON.stringify(interpretation.applied_filters, null, 2)}
              </pre>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 flex items-center space-x-1.5">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                <span>PostgreSQL / PostGIS Query Translation</span>
              </span>
              <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded font-mono">
                SQL DQL
              </span>
            </div>

            <div className="bg-slate-950 p-3 rounded border border-slate-800 text-xs h-36 overflow-y-auto">
              <pre className="text-blue-300 font-mono text-[11px] leading-relaxed">
                {interpretation.sql_translation}
              </pre>
            </div>
            <p className="text-[10px] text-slate-500">
              Deterministic rule compilation guarantees zero hallucinations and full transparency for audit reporting.
            </p>
          </div>
        </div>
      )}

      {/* Query Results Table */}
      {results.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-sm">
          <div className="p-3 bg-slate-950/80 border-b border-slate-800 flex justify-between items-center text-xs">
            <span className="font-semibold text-white">Matched Registry Records ({results.length})</span>
            <span className="text-slate-400 text-[11px]">Click row to open Digital Twin</span>
          </div>

          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 text-[11px] uppercase tracking-wider sticky top-0">
                <tr>
                  <th className="p-3">Global ID</th>
                  <th className="p-3">Location</th>
                  <th className="p-3">District</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Health</th>
                  <th className="p-3">Redundancy</th>
                  <th className="p-3">Age</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {results.map(cam => (
                  <tr key={cam.id} className="hover:bg-slate-800/50 transition">
                    <td className="p-3 font-mono font-bold text-white">{cam.global_id}</td>
                    <td className="p-3 truncate max-w-[200px]" title={cam.landmark}>{cam.landmark}</td>
                    <td className="p-3">{cam.district}</td>
                    <td className="p-3 truncate max-w-[150px]">{String(cam.department || '').split('/')[0]}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        cam.status === 'OPERATIONAL'
                          ? 'bg-emerald-950 text-emerald-300'
                          : cam.status === 'OFFLINE'
                          ? 'bg-rose-950 text-rose-300'
                          : 'bg-amber-950 text-amber-300'
                      }`}>
                        {cam.status}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-white">{cam.health_score}%</td>
                    <td className="p-3">
                      <span className={cam.redundancy_level === 'CRITICAL' ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                        {cam.redundancy_level}
                      </span>
                    </td>
                    <td className="p-3 font-mono">{cam.age_years}y</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => onSelectCamera(cam)}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2 py-1 rounded text-xs transition cursor-pointer inline-flex items-center space-x-1"
                      >
                        <span>Digital Twin</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
