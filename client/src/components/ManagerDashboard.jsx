import React, { useState, useEffect } from 'react';
import { Users, AlertTriangle, ShieldCheck, TrendingUp, Download, Building, Search, ArrowUpRight } from 'lucide-react';
import { fetchManagerHeatmap } from '../services/api';

export default function ManagerDashboard() {
  const [heatmapData, setHeatmapData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchManagerHeatmap().then(data => {
      setHeatmapData(data);
      setLoading(false);
    });
  }, []);

  if (loading || !heatmapData) {
    return (
      <div className="p-8 text-center text-gray-400 glass-card rounded-2xl">
        Loading Enterprise Team Skill Heatmap...
      </div>
    );
  }

  const { team_heatmap, summary } = heatmapData;

  const getLevelColor = (lvl) => {
    if (lvl >= 4) return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    if (lvl === 3) return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
    if (lvl === 2) return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    return 'bg-pink-500/20 text-pink-300 border-pink-500/40';
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-6 border border-pink-500/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl pointer-events-none -mr-10 -mt-10"></div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-pink-500/20 text-pink-300 border border-pink-500/30 flex items-center space-x-1">
                <Building className="w-3.5 h-3.5" />
                <span>Enterprise L&D & HR Dashboard</span>
              </span>
              <span className="text-xs text-gray-400">Aggregated Team Matrix</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-outfit">
              Team Skill Heatmap & Internal Mobility
            </h1>
            <p className="text-sm text-gray-300">
              Identify org-wide skill risks, track employee promotional readiness, and replace costly external hiring with AI-driven internal mobility.
            </p>
          </div>

          <button className="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 text-xs font-semibold text-white flex items-center space-x-2 transition">
            <Download className="w-4 h-4 text-indigo-400" />
            <span>Export Org L&D Report</span>
          </button>
        </div>

        {/* Executive Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-800">
          <div className="p-4 rounded-xl bg-gray-900/80 border border-gray-800">
            <div className="text-xs font-semibold text-gray-400">Total Direct Reports</div>
            <div className="text-2xl font-black text-white font-outfit mt-1">{summary.total_reports} Team Members</div>
            <div className="text-[11px] text-emerald-400 mt-1">100% active in adaptive paths</div>
          </div>

          <div className="p-4 rounded-xl bg-gray-900/80 border border-gray-800">
            <div className="text-xs font-semibold text-gray-400">Avg Target Mobility Readiness</div>
            <div className="text-2xl font-black text-indigo-300 font-outfit mt-1">{summary.avg_readiness}%</div>
            <div className="text-[11px] text-gray-400 mt-1">+12% increase past 30 days</div>
          </div>

          <div className="p-4 rounded-xl bg-gray-900/80 border border-gray-800">
            <div className="text-xs font-semibold text-gray-400">Critical Skill Warnings</div>
            <div className="text-2xl font-black text-pink-400 font-outfit mt-1">{summary.critical_org_gaps.length} Gaps</div>
            <div className="text-[11px] text-pink-300 mt-1">Requires L&D budget allocation</div>
          </div>
        </div>

      </div>

      {/* Main Grid: Heatmap Matrix + Critical Org Warnings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Team Matrix Table (8 cols) */}
        <div className="lg:col-span-8 glass-panel rounded-2xl p-5 border border-gray-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white font-outfit flex items-center space-x-2">
              <Users className="w-4 h-4 text-pink-400" />
              <span>Direct Report Skill Matrix</span>
            </h2>
            <span className="text-xs text-gray-400">Color-coded level ratings</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3">Employee</th>
                  <th className="py-3 px-3">Current → Target Role</th>
                  <th className="py-3 px-3 text-center">Readiness</th>
                  <th className="py-3 px-3 text-center">SQL</th>
                  <th className="py-3 px-3 text-center">Python</th>
                  <th className="py-3 px-3 text-center">LLM / AI</th>
                  <th className="py-3 px-3 text-center">Sys Design</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {team_heatmap.map((emp, idx) => (
                  <tr key={idx} className="hover:bg-gray-800/40 transition">
                    <td className="py-3 px-3 font-semibold text-white">
                      {emp.employee_name}
                    </td>
                    <td className="py-3 px-3 text-gray-300">
                      <div>{emp.current_role}</div>
                      <div className="text-[10px] text-indigo-400">→ Goal: {emp.target_role}</div>
                    </td>
                    <td className="py-3 px-3 text-center font-bold">
                      <span className="px-2 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {emp.readiness_percent}%
                      </span>
                    </td>

                    {/* Skill Pills */}
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${getLevelColor(emp.skills?.sql_mastery || 1)}`}>
                        Lvl {emp.skills?.sql_mastery || 1}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${getLevelColor(emp.skills?.python_analytics || 1)}`}>
                        Lvl {emp.skills?.python_analytics || 1}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${getLevelColor(emp.skills?.llm_engineering || 1)}`}>
                        Lvl {emp.skills?.llm_engineering || 1}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${getLevelColor(emp.skills?.system_design || 1)}`}>
                        Lvl {emp.skills?.system_design || 1}
                      </span>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Critical Org Gaps (4 cols) */}
        <div className="lg:col-span-4 glass-panel rounded-2xl p-5 border border-gray-800 space-y-4">
          <h2 className="text-base font-bold text-white font-outfit flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-pink-400" />
            <span>Org-Wide Skill Deficits</span>
          </h2>

          <div className="space-y-3">
            {summary.critical_org_gaps.map((gap, idx) => (
              <div key={idx} className="p-3 bg-gray-900/60 border border-gray-800 rounded-xl space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-white">{gap.skill_name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-pink-500/20 text-pink-300 font-bold border border-pink-500/30">
                    {gap.severity} Priority
                  </span>
                </div>
                <p className="text-[11px] text-gray-400">
                  {gap.missing_count} team members currently below required target level for Q3 engineering objectives.
                </p>
              </div>
            ))}
          </div>

          <div className="p-4 bg-indigo-950/40 border border-indigo-800/40 rounded-xl text-xs text-indigo-200 space-y-2">
            <div className="font-bold text-indigo-300">L&D Business Pitch One-Liner:</div>
            <p>
              "We turn vague learning goals into week-by-week auto-adjusting skill roadmaps, reducing L&D planning overhead per report from hours to seconds while boosting internal promotion rates."
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
