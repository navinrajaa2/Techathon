import React, { useState, useEffect } from 'react';
import { 
  Users, AlertTriangle, ShieldCheck, TrendingUp, Download, Building, Search, ArrowUpRight, FileText, Sparkles 
} from 'lucide-react';
import { fetchManagerHeatmap, DEFAULT_MANAGER_HEATMAP } from '../services/api';
import PromotionPitchModal from './PromotionPitchModal';

export default function ManagerDashboard() {
  const [heatmapData, setHeatmapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMemberForMemo, setSelectedMemberForMemo] = useState(null);

  useEffect(() => {
    let isMounted = true;

    // Safety timeout: ensure loading completes within 800ms
    const timer = setTimeout(() => {
      if (isMounted) {
        setHeatmapData(prev => prev || DEFAULT_MANAGER_HEATMAP);
        setLoading(false);
      }
    }, 800);

    fetchManagerHeatmap()
      .then(data => {
        if (isMounted) {
          setHeatmapData(data || DEFAULT_MANAGER_HEATMAP);
          setLoading(false);
        }
      })
      .catch(err => {
        console.warn('Error loading manager heatmap:', err);
        if (isMounted) {
          setHeatmapData(DEFAULT_MANAGER_HEATMAP);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []);

  const safeData = heatmapData || DEFAULT_MANAGER_HEATMAP;
  const team_heatmap = Array.isArray(safeData.team_heatmap) && safeData.team_heatmap.length > 0
    ? safeData.team_heatmap
    : DEFAULT_MANAGER_HEATMAP.team_heatmap;
  const summary = safeData.summary || DEFAULT_MANAGER_HEATMAP.summary;
  const criticalGaps = Array.isArray(summary.critical_org_gaps)
    ? summary.critical_org_gaps
    : DEFAULT_MANAGER_HEATMAP.summary.critical_org_gaps;

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500 bg-white border border-slate-200 shadow-sm rounded-2xl">
        <div className="animate-spin w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full mx-auto mb-3"></div>
        <p className="font-semibold text-slate-700">Loading Enterprise Team Skill Heatmap...</p>
      </div>
    );
  }

  const getLevelColor = (lvl) => {
    if (lvl >= 4) return 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold';
    if (lvl === 3) return 'bg-blue-50 text-blue-700 border-blue-200 font-bold';
    if (lvl === 2) return 'bg-amber-50 text-amber-800 border-amber-200 font-medium';
    return 'bg-rose-50 text-rose-700 border-rose-200 font-medium';
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-white via-blue-50/50 to-indigo-50/50 rounded-2xl p-6 sm:p-8 border border-blue-200/80 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl pointer-events-none -mr-10 -mt-10"></div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200 flex items-center space-x-1.5 shadow-2xs">
                <Building className="w-3.5 h-3.5 text-blue-600" />
                <span>Enterprise L&D & People Analytics</span>
              </span>
              <span className="text-xs font-medium text-slate-500">Live Department Matrix</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-outfit">
              Team Skill Heatmap & Mobility
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed font-normal">
              Empower your team with internal mobility, address skill risks before they become bottlenecks, and cultivate internal talent through adaptive AI roadmaps.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setSelectedMemberForMemo(team_heatmap[0])}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-xs font-bold text-white flex items-center space-x-2 shadow-xs transition"
            >
              <FileText className="w-4 h-4" />
              <span>Generate Promotion Pitch</span>
            </button>
            <button className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 flex items-center space-x-2 shadow-xs transition">
              <Download className="w-4 h-4 text-blue-600" />
              <span>Export Report</span>
            </button>
          </div>
        </div>

        {/* Executive Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-200/80">
          <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Direct Reports</div>
            <div className="text-2xl font-black text-slate-900 font-outfit mt-1">{summary.total_reports || team_heatmap.length} Team Members</div>
            <div className="text-[11px] text-emerald-700 font-semibold mt-1">100% active in learning roadmaps</div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg Mobility Readiness</div>
            <div className="text-2xl font-black text-blue-700 font-outfit mt-1">{summary.avg_readiness || 66}%</div>
            <div className="text-[11px] text-slate-500 font-medium mt-1">+12% increase this quarter</div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Critical Org Skill Gaps</div>
            <div className="text-2xl font-black text-rose-600 font-outfit mt-1">{criticalGaps.length} Gaps</div>
            <div className="text-[11px] text-rose-700 font-semibold mt-1">High priority for upskilling</div>
          </div>
        </div>

      </div>

      {/* Main Grid: Heatmap Matrix + Critical Org Warnings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Team Matrix Table (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 font-outfit flex items-center space-x-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span>Direct Report Capability Matrix</span>
            </h2>
            <span className="text-xs text-slate-400 font-medium">Ratings: Lvl 1 to 5</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3 px-3 rounded-l-lg">Team Member</th>
                  <th className="py-3 px-3">Current Role</th>
                  <th className="py-3 px-3">Target Role</th>
                  <th className="py-3 px-3">Readiness</th>
                  <th className="py-3 px-3">Top Skills</th>
                  <th className="py-3 px-3 rounded-r-lg text-right">Mobility Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {team_heatmap.map((member, idx) => {
                  const name = member.name || member.employee_name || `Employee ${idx + 1}`;
                  const targetRole = member.target_role_title || member.target_role || 'Target Role';
                  const email = member.email || `${name.toLowerCase().replace(/\s+/g, '.')}@enterprise.com`;
                  const avatar = member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D8ABC&color=fff`;

                  return (
                    <tr key={member.id || member._id || idx} className="hover:bg-blue-50/30 transition">
                      
                      <td className="py-3 px-3">
                        <div className="flex items-center space-x-2.5">
                          <img src={avatar} alt={name} className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200" />
                          <div>
                            <div className="font-bold text-slate-900">{name}</div>
                            <div className="text-[10px] text-slate-400">{email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3 font-semibold text-slate-700">
                        {member.current_role}
                      </td>

                      <td className="py-3 px-3 text-blue-700 font-bold">
                        {targetRole}
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-14 bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                            <div 
                              className="bg-blue-600 h-full rounded-full" 
                              style={{ width: `${member.readiness_percent}%` }}
                            ></div>
                          </div>
                          <span className="font-black text-slate-900">{member.readiness_percent}%</span>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(member.skills || {}).slice(0, 2).map(([skId, lvl]) => (
                            <span 
                              key={skId}
                              className={`px-1.5 py-0.5 rounded border text-[10px] ${getLevelColor(lvl)}`}
                            >
                              {skId.replace(/_/g, ' ')}: L{lvl}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => setSelectedMemberForMemo({ ...member, name, target_role_title: targetRole, email, avatar })}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[11px] font-bold transition shadow-2xs flex items-center space-x-1 ml-auto"
                          title="Generate Promotion & ROI Justification Memo with Gemini AI"
                        >
                          <FileText className="w-3 h-3 text-blue-600" />
                          <span>Pitch Memo</span>
                        </button>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Critical Org Gaps (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 font-outfit flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <span>Org Bottlenecks</span>
            </h2>
            <span className="text-xs text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">Action Needed</span>
          </div>

          <p className="text-xs text-slate-500 font-normal">
            Capabilities in high demand across upcoming roadmaps with limited internal supply:
          </p>

          <div className="space-y-3">
            {criticalGaps.map((gap, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition">
                <div className="flex items-start justify-between">
                  <div className="font-bold text-slate-900 text-xs">{gap.skill_name}</div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    gap.severity === 'High' 
                      ? 'bg-rose-50 text-rose-700 border-rose-200' 
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}>
                    {gap.severity}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                  <span>{gap.missing_count} team members missing competency</span>
                  <span className="text-blue-600 font-bold">Auto-cohorting</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3.5 bg-blue-50/80 rounded-xl border border-blue-100 text-xs text-blue-950">
            <div className="font-bold text-blue-900 flex items-center space-x-1.5 mb-1">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span>Internal Mobility ROI</span>
            </div>
            <p className="text-slate-600 font-normal leading-snug">
              Upskilling current employees saves an average of $38,000 in external recruiter and onboarding costs per seat.
            </p>
          </div>

        </div>

      </div>

      {/* Promotion Memo Modal */}
      <PromotionPitchModal
        isOpen={!!selectedMemberForMemo}
        onClose={() => setSelectedMemberForMemo(null)}
        learnerName={selectedMemberForMemo?.name}
        currentRole={selectedMemberForMemo?.current_role}
        targetRoleTitle={selectedMemberForMemo?.target_role_title}
        verifiedSkillsCount={Object.keys(selectedMemberForMemo?.skills || {}).length}
        totalHours={72}
      />

    </div>
  );
}
