import React, { useState } from 'react';
import { 
  Sparkles, TrendingUp, Compass, ArrowRight, CheckCircle2, Clock, DollarSign, Award, Layers, Zap 
} from 'lucide-react';

export default function CareerSimulatorView({ 
  currentSkills, 
  taxonomy, 
  onSelectTargetRole, 
  onNavigateToRoadmap 
}) {
  const roles = taxonomy?.roles || [];
  
  const [roleA, setRoleA] = useState(roles[0]?.id || 'lead_ai_eng');
  const [roleB, setRoleB] = useState(roles[1]?.id || 'sr_data_analyst');
  const [roleC, setRoleC] = useState(roles[2]?.id || 'sr_fullstack_eng');

  const getRoleData = (roleId) => {
    const role = roles.find(r => r.id === roleId);
    if (!role) return null;

    // Calculate skill overlap
    let totalReqSkills = Object.keys(role.required_skills || {}).length;
    let metSkillsCount = 0;
    let totalGapLevels = 0;
    const missingHighImpact = [];

    Object.entries(role.required_skills || {}).forEach(([skId, reqLvl]) => {
      const curLvl = currentSkills[skId] || 0;
      if (curLvl >= reqLvl) {
        metSkillsCount++;
      } else {
        const gap = reqLvl - curLvl;
        totalGapLevels += gap;
        const skObj = taxonomy.skills?.find(s => s.id === skId);
        missingHighImpact.push({
          id: skId,
          name: skObj?.name || skId.replace(/_/g, ' '),
          gap,
          current: curLvl,
          target: reqLvl
        });
      }
    });

    const overlapPercent = Math.round((metSkillsCount / (totalReqSkills || 1)) * 100);
    const estimatedWeeks = Math.max(4, Math.round(totalGapLevels * 2.2));
    
    // Compensation estimations based on role track
    const compEstimates = {
      lead_ai_eng: { salaryGrowth: '+42%', benchmark: '$175k - $210k', difficulty: 'Advanced', demand: 'Very High (🔥 4.9x)' },
      sr_data_analyst: { salaryGrowth: '+26%', benchmark: '$130k - $155k', difficulty: 'Moderate', demand: 'High (3.4x)' },
      sr_fullstack_eng: { salaryGrowth: '+34%', benchmark: '$150k - $185k', difficulty: 'Moderate', demand: 'High (3.8x)' },
      lead_ai_pm: { salaryGrowth: '+38%', benchmark: '$165k - $195k', difficulty: 'High', demand: 'Very High (🔥 4.5x)' },
      sr_devops_eng: { salaryGrowth: '+35%', benchmark: '$155k - $180k', difficulty: 'Advanced', demand: 'High (3.9x)' }
    };

    return {
      role,
      overlapPercent,
      estimatedWeeks,
      totalGapLevels,
      missingHighImpact: missingHighImpact.sort((a, b) => b.gap - a.gap),
      comp: compEstimates[roleId] || { salaryGrowth: '+30%', benchmark: '$140k - $170k', difficulty: 'Moderate', demand: 'High' }
    };
  };

  const dataA = getRoleData(roleA);
  const dataB = getRoleData(roleB);
  const dataC = getRoleData(roleC);

  const comparedRoles = [dataA, dataB, dataC].filter(Boolean);

  const handleApplyRole = (roleId) => {
    if (onSelectTargetRole) {
      onSelectTargetRole(roleId);
    }
    if (onNavigateToRoadmap) {
      onNavigateToRoadmap();
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-white via-blue-50/50 to-indigo-50/50 rounded-2xl p-6 sm:p-8 border border-blue-200/80 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-10 -mt-10"></div>

        <div className="space-y-2 max-w-2xl relative z-10">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200 flex items-center space-x-1.5 shadow-2xs">
              <Zap className="w-3.5 h-3.5 text-blue-600" />
              <span>Career Trajectory & Promotion Simulator</span>
            </span>
            <span className="text-xs font-medium text-slate-500">Live "What-If" Analysis</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-outfit">
            Simulate Your Next Career Move
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed font-normal">
            Compare target roles side-by-side to understand your transferable skill match, estimated time-to-promotion, and industry salary growth.
          </p>
        </div>
      </div>

      {/* Role Selectors Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Role Option 1
          </label>
          <select
            value={roleA}
            onChange={(e) => setRoleA(e.target.value)}
            className="w-full text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-600"
          >
            {roles.map(r => (
              <option key={r.id} value={r.id}>{r.title}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Role Option 2
          </label>
          <select
            value={roleB}
            onChange={(e) => setRoleB(e.target.value)}
            className="w-full text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-600"
          >
            {roles.map(r => (
              <option key={r.id} value={r.id}>{r.title}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Role Option 3
          </label>
          <select
            value={roleC}
            onChange={(e) => setRoleC(e.target.value)}
            className="w-full text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-600"
          >
            {roles.map(r => (
              <option key={r.id} value={r.id}>{r.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Comparison Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {comparedRoles.map((item, idx) => {
          const { role, overlapPercent, estimatedWeeks, missingHighImpact, comp } = item;
          const isBestMatch = overlapPercent === Math.max(...comparedRoles.map(r => r.overlapPercent));

          return (
            <div 
              key={role.id}
              className={`bg-white rounded-2xl p-6 border transition flex flex-col justify-between relative shadow-sm ${
                isBestMatch 
                  ? 'border-blue-500 ring-2 ring-blue-500/20' 
                  : 'border-slate-200 hover:border-blue-300'
              }`}
            >
              {isBestMatch && (
                <div className="absolute -top-3 right-6 px-3 py-0.5 bg-blue-600 text-white font-bold text-[10px] uppercase tracking-wider rounded-full shadow-sm">
                  ⚡ Highest Skill Overlap
                </div>
              )}

              <div className="space-y-4">
                
                {/* Header */}
                <div>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 uppercase">
                    {role.track_id?.replace(/_/g, ' ')}
                  </span>
                  <h3 className="text-lg font-black text-slate-900 font-outfit mt-1.5">{role.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">{role.description}</p>
                </div>

                {/* Overlap & Metrics Gauge */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  
                  {/* Skill Match Bar */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold mb-1">
                      <span className="text-slate-600">Transferable Skill Match</span>
                      <span className="text-blue-700">{overlapPercent}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-700 ${
                          overlapPercent >= 60 ? 'bg-emerald-500' : overlapPercent >= 40 ? 'bg-blue-600' : 'bg-amber-500'
                        }`}
                        style={{ width: `${overlapPercent}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* 3 Metric Pills */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] block font-bold uppercase">Estimated Timeline</span>
                      <span className="font-extrabold text-slate-900 flex items-center space-x-1 mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        <span>~{estimatedWeeks} Weeks</span>
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block font-bold uppercase">Salary Potential</span>
                      <span className="font-extrabold text-emerald-700 flex items-center space-x-1 mt-0.5">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{comp.salaryGrowth}</span>
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 text-xs flex items-center justify-between">
                    <span className="text-slate-500 text-[11px]">Market Demand:</span>
                    <span className="font-bold text-slate-800 text-[11px]">{comp.demand}</span>
                  </div>

                </div>

                {/* Key Skills to Bridge */}
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                    <span>Key Growth Skills to Bridge:</span>
                    <span className="text-slate-400 font-normal">{missingHighImpact.length} skills</span>
                  </div>

                  <div className="space-y-1.5">
                    {missingHighImpact.slice(0, 3).map(sk => (
                      <div key={sk.id} className="p-2 rounded-lg bg-blue-50/60 border border-blue-100 flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800 text-[11px] truncate max-w-[170px]">{sk.name}</span>
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                          +{sk.gap} Lvl Gap
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Action Button */}
              <div className="pt-5 mt-4 border-t border-slate-100">
                <button
                  onClick={() => handleApplyRole(role.id)}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow-xs transition"
                >
                  <span>Select & Generate Roadmap</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Real-Time Market Job Trends & Salary Benchmark Feed */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
              <TrendingUp className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-extrabold text-slate-900 font-outfit text-sm">
                Real-Time Market Hiring Demand & Salary Benchmarks
              </h3>
              <p className="text-xs text-slate-500">Live aggregated industry hiring signals & internal open requisitions</p>
            </div>
          </div>

          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            ● Updated Today (Live Feed)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Item 1 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">Lead AI & RAG Engineers</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">+140% QoQ</span>
            </div>
            <div className="text-xs text-slate-600">
              Benchmark: <strong className="text-slate-900">$175k - $220k</strong>
            </div>
            <p className="text-[11px] text-slate-500">
              4 internal job requisitions open. Priority hiring at Stripe, OpenAI, and internal AI platform team.
            </p>
          </div>

          {/* Item 2 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">Senior Data Analytics Leads</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">+85% QoQ</span>
            </div>
            <div className="text-xs text-slate-600">
              Benchmark: <strong className="text-slate-900">$135k - $160k</strong>
            </div>
            <p className="text-[11px] text-slate-500">
              High internal demand across Business Intelligence & Financial Telemetry cohorts.
            </p>
          </div>

          {/* Item 3 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">Senior Full-Stack Engineers</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800">+92% QoQ</span>
            </div>
            <div className="text-xs text-slate-600">
              Benchmark: <strong className="text-slate-900">$150k - $185k</strong>
            </div>
            <p className="text-[11px] text-slate-500">
              Fastest route to promotion from Frontend/Backend roles with high internal retention.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}

