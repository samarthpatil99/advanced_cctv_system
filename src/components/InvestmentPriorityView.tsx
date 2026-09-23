import React, { useState } from 'react';
import { InvestmentCandidate } from '../types';
import {
  TrendingUp,
  MapPin,
  ShieldAlert,
  AlertTriangle,
  FileSpreadsheet,
  Download,
  Info,
  ExternalLink,
} from 'lucide-react';

interface InvestmentPriorityViewProps {
  candidates: InvestmentCandidate[];
}

export const InvestmentPriorityView: React.FC<InvestmentPriorityViewProps> = ({ candidates }) => {
  const [districtFilter, setDistrictFilter] = useState<string>('ALL');
  const [selectedCandidate, setSelectedCandidate] = useState<InvestmentCandidate>(candidates[0]);

  const filtered = candidates.filter(c => {
    if (districtFilter !== 'ALL' && c.district.toLowerCase() !== districtFilter.toLowerCase()) return false;
    return true;
  });

  const exportCSV = () => {
    const headers = [
      'Rank',
      'Location_Name',
      'District',
      'Priority_Tier',
      'Composite_Score',
      'Crime_Proxy',
      'Traffic_Accident_Proxy',
      'Blind_Spot_Deficit',
      'Population_Proxy',
      'Strategic_Importance',
      'Recommended_Units',
      'Estimated_Capex_INR',
    ];

    const rows = filtered.map((c, i) => [
      i + 1,
      `"${c.location_name}"`,
      c.district,
      c.priority_tier,
      c.composite_score,
      c.factors.crime_incident_proxy,
      c.factors.traffic_accident_proxy,
      c.factors.blind_spot_deficit,
      c.factors.population_proxy,
      c.factors.strategic_importance,
      c.recommended_camera_count,
      c.estimated_capex_inr,
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `gujarat_cctv_investment_priority_ranking_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="investment-priority-view" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <span>Statewide CCTV Investment & Expansion Priority Ranking</span>
            <span className="text-xs bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded font-mono">
              EXPLAINABLE MULTI-FACTOR INDEX
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Ranks infrastructure gap junctions using multi-hazard risk proxies, transit density, and existing surveillance blind spots.
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs px-3 py-1.5 rounded transition cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CapEx Priority CSV</span>
        </button>
      </div>

      {/* Formula Explanation Callout */}
      <div className="bg-amber-950/20 border border-amber-800/40 rounded-lg p-3.5 text-xs text-amber-300 flex items-start space-x-2">
        <Info className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
        <div>
          <span className="font-bold">PROTOTYPE MULTI-FACTOR INVESTMENT SCORE FORMULA:</span>
          <p className="text-slate-300 mt-0.5 font-mono text-[11px]">
            Composite Score = 25% Crime/Incident Proxy + 25% Traffic/Accident Proxy + 20% Blind Spot Deficit + 15% Population Proxy + 15% Strategic Importance.
          </p>
        </div>
      </div>

      {/* Grid: Candidate Ranking Table (Left) and Explainable Deep-Dive (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Ranked Table */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <h3 className="font-bold text-white">Ranked Candidate Sites ({filtered.length})</h3>
            <select
              value={districtFilter}
              onChange={e => setDistrictFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded px-2.5 py-1 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Districts</option>
              <option value="Ahmedabad">Ahmedabad</option>
              <option value="Surat">Surat</option>
              <option value="Vadodara">Vadodara</option>
              <option value="Rajkot">Rajkot</option>
              <option value="Gandhinagar">Gandhinagar</option>
              <option value="Bhavnagar">Bhavnagar</option>
              <option value="Jamnagar">Jamnagar</option>
              <option value="Kutch-Kandla">Kutch-Kandla</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="p-2.5">Rank</th>
                  <th className="p-2.5">Candidate Site</th>
                  <th className="p-2.5">District</th>
                  <th className="p-2.5">Priority</th>
                  <th className="p-2.5">Score</th>
                  <th className="p-2.5 text-right">CapEx (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filtered.map((c, i) => (
                  <tr
                    key={c.id}
                    onClick={() => setSelectedCandidate(c)}
                    className={`cursor-pointer transition ${
                      selectedCandidate?.id === c.id
                        ? 'bg-blue-900/40 text-blue-200 font-semibold'
                        : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="p-2.5 font-bold font-mono">#{i + 1}</td>
                    <td className="p-2.5 truncate max-w-[200px]" title={c.location_name}>
                      {c.location_name}
                    </td>
                    <td className="p-2.5">{c.district}</td>
                    <td className="p-2.5">
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                        c.priority_tier === 'TOP_PRIORITY'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : c.priority_tier === 'HIGH'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-blue-950 text-blue-300 border border-blue-800'
                      }`}>
                        {String(c.priority_tier || 'NORMAL').replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-2.5 font-bold text-white font-mono">{c.composite_score}</td>
                    <td className="p-2.5 text-right font-mono text-emerald-400">
                      ₹{(c.estimated_capex_inr / 100000).toFixed(1)}L
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Explainable Factor Breakdown for Selected Candidate */}
        {selectedCandidate && (
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">
                SITE EVALUATION REPORT
              </span>
              <h4 className="text-base font-bold text-white mt-0.5">{selectedCandidate.location_name}</h4>
              <p className="text-xs text-slate-400">{selectedCandidate.district}, Gujarat</p>
            </div>

            {/* Composite Score Meter */}
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400">Composite Multi-Factor Score:</span>
                <div className="text-2xl font-black text-white font-mono mt-0.5">
                  {selectedCandidate.composite_score} / 100
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">Recommended Allocation:</span>
                <div className="text-sm font-bold text-emerald-400 mt-0.5">
                  {selectedCandidate.recommended_camera_count} Nodes (₹{(selectedCandidate.estimated_capex_inr / 100000).toFixed(1)} Lakhs)
                </div>
              </div>
            </div>

            {/* Explainable Rationale */}
            <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-1 text-xs">
              <span className="text-slate-400 font-semibold block">Analytical Justification:</span>
              <p className="text-slate-200 leading-relaxed font-medium">
                {selectedCandidate.reason}
              </p>
            </div>

            {/* Component Bar Gauges */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Crime & Incident Proxy (25%):</span>
                <span className="font-mono text-white font-bold">{selectedCandidate.factors.crime_incident_proxy}%</span>
              </div>
              <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full" style={{ width: `${selectedCandidate.factors.crime_incident_proxy}%` }}></div>
              </div>

              <div className="flex justify-between pt-1">
                <span className="text-slate-400">Traffic Hazard & Congestion (25%):</span>
                <span className="font-mono text-white font-bold">{selectedCandidate.factors.traffic_accident_proxy}%</span>
              </div>
              <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full" style={{ width: `${selectedCandidate.factors.traffic_accident_proxy}%` }}></div>
              </div>

              <div className="flex justify-between pt-1">
                <span className="text-slate-400">Surveillance Blind Spot Deficit (20%):</span>
                <span className="font-mono text-white font-bold">{selectedCandidate.factors.blind_spot_deficit}%</span>
              </div>
              <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                <div className="bg-cyan-500 h-full" style={{ width: `${selectedCandidate.factors.blind_spot_deficit}%` }}></div>
              </div>

              <div className="flex justify-between pt-1">
                <span className="text-slate-400">Population Density Multiplier (15%):</span>
                <span className="font-mono text-white font-bold">{selectedCandidate.factors.population_proxy}%</span>
              </div>
              <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full" style={{ width: `${selectedCandidate.factors.population_proxy}%` }}></div>
              </div>

              <div className="flex justify-between pt-1">
                <span className="text-slate-400">Strategic Criticality (15%):</span>
                <span className="font-mono text-white font-bold">{selectedCandidate.factors.strategic_importance}%</span>
              </div>
              <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-full" style={{ width: `${selectedCandidate.factors.strategic_importance}%` }}></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
