import React, { useState, useEffect } from 'react';
import { 
  Sparkles, TrendingUp, Compass, ArrowRight, CheckCircle2, Clock, DollarSign, Award, 
  Layers, Zap, AlertCircle, Building, BarChart3, RefreshCw, ChevronRight, HelpCircle, Briefcase 
} from 'lucide-react';
import { fetchCareerComparisonRecommendation } from '../services/api';

export default function CareerSimulatorView({ 
  currentSkills = {}, 
  taxonomy = {}, 
  currentRole = 'Junior Data Analyst',
  onSelectTargetRole, 
  onNavigateToRoadmap 
}) {
  const roles = taxonomy?.roles || [];
  
  // Available current roles to simulate from
  const currentRoleOptions = [
    'Junior Data Analyst',
    'Frontend Developer',
    'Associate Product Manager',
    'Junior DevOps Engineer',
    'Business Analyst'
  ];

  const [selectedCurrentRole, setSelectedCurrentRole] = useState(currentRole || 'Junior Data Analyst');

  // 3 Target Roles to compare side-by-side
  const [roleA, setRoleA] = useState('sr_data_analyst');
  const [roleB, setRoleB] = useState('lead_ai_eng');
  const [roleC, setRoleC] = useState('data_engineer');

  // Interactive weekly hours per role
  const [weeklyHoursA, setWeeklyHoursA] = useState(6);
  const [weeklyHoursB, setWeeklyHoursB] = useState(8);
  const [weeklyHoursC, setWeeklyHoursC] = useState(7);

  // AI Recommendation Synthesis State
  const [aiRecommendation, setAiRecommendation] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);

  // Helper to normalize required_skills whether array or object
  const getRoleSkillsList = (role) => {
    if (!role) return [];
    if (Array.isArray(role.required_skills)) {
      return role.required_skills.map(item => ({
        skill_id: item.skill_id,
        min_level: item.min_level
      }));
    }
    if (typeof role.required_skills === 'object') {
      return Object.entries(role.required_skills).map(([skill_id, min_level]) => ({
        skill_id,
        min_level
      }));
    }
    return [];
  };

  const calculateRoleMetrics = (roleId, hours) => {
    const role = roles.find(r => r.id === roleId);
    if (!role) return null;

    const skillsList = getRoleSkillsList(role);
    const totalReqSkills = skillsList.length;
    let metSkillsCount = 0;
    let totalGapLevels = 0;
    const missingSkills = [];

    skillsList.forEach(({ skill_id, min_level }) => {
      const curLvl = currentSkills[skill_id] || 0;
      if (curLvl >= min_level) {
        metSkillsCount++;
      } else {
        const gap = min_level - curLvl;
        totalGapLevels += gap;
        const skObj = taxonomy.skills?.find(s => s.id === skill_id);
        missingSkills.push({
          id: skill_id,
          name: skObj?.name || skill_id.replace(/_/g, ' '),
          gap,
          current: curLvl,
          target: min_level
        });
      }
    });

    const overlapPercent = Math.round((metSkillsCount / (totalReqSkills || 1)) * 100);
    // Estimated learning weeks dynamically scales with gap levels and weekly hours
    const totalEstimatedHours = Math.max(20, totalGapLevels * 14);
    const estimatedWeeks = Math.max(3, Math.ceil(totalEstimatedHours / (hours || 6)));

    // Role benchmark metadata
    const compMetadata = {
      sr_data_analyst: {
        marketDemand: 'High',
        demandBadge: 'High (3.4x)',
        internalJobs: 3,
        salaryGrowth: '+26%',
        benchmark: '$130k - $155k',
        verdictCategory: 'Fastest Internal Mobility'
      },
      lead_ai_eng: {
        marketDemand: 'Very High',
        demandBadge: '🔥 Very High (4.9x)',
        internalJobs: 1,
        salaryGrowth: '+42%',
        benchmark: '$175k - $210k',
        verdictCategory: 'Highest Growth & Ceiling'
      },
      data_engineer: {
        marketDemand: 'High',
        demandBadge: 'High (3.8x)',
        internalJobs: 2,
        salaryGrowth: '+32%',
        benchmark: '$145k - $175k',
        verdictCategory: 'Balanced Systems Track'
      },
      sr_fullstack_eng: {
        marketDemand: 'High',
        demandBadge: 'High (3.6x)',
        internalJobs: 3,
        salaryGrowth: '+34%',
        benchmark: '$150k - $185k',
        verdictCategory: 'Balanced Engineering'
      },
      lead_ai_pm: {
        marketDemand: 'Very High',
        demandBadge: '🔥 Very High (4.5x)',
        internalJobs: 1,
        salaryGrowth: '+38%',
        benchmark: '$165k - $195k',
        verdictCategory: 'Strategic Leadership'
      },
      sr_devops_eng: {
        marketDemand: 'High',
        demandBadge: 'High (3.9x)',
        internalJobs: 2,
        salaryGrowth: '+35%',
        benchmark: '$155k - $180k',
        verdictCategory: 'Cloud Infrastructure'
      }
    };

    const comp = compMetadata[roleId] || {
      marketDemand: 'High',
      demandBadge: 'High (3.0x)',
      internalJobs: 2,
      salaryGrowth: '+28%',
      benchmark: '$140k - $165k',
      verdictCategory: 'Growth Opportunity'
    };

    return {
      role,
      overlapPercent,
      missingSkillsCount: missingSkills.length,
      missingSkills: missingSkills.sort((a, b) => b.gap - a.gap),
      totalGapLevels,
      estimatedWeeks,
      weeklyHours: hours,
      comp
    };
  };

  const dataA = calculateRoleMetrics(roleA, weeklyHoursA);
  const dataB = calculateRoleMetrics(roleB, weeklyHoursB);
  const dataC = calculateRoleMetrics(roleC, weeklyHoursC);

  const comparedRoles = [dataA, dataB, dataC].filter(Boolean);

  // Fetch or regenerate Gemini recommendation synthesis
  const fetchRecommendation = async () => {
    setLoadingAi(true);
    const rolesPayload = comparedRoles.map(item => ({
      role_id: item.role.id,
      title: item.role.title,
      skill_match_percent: item.overlapPercent,
      missing_skills_count: item.missingSkillsCount,
      estimated_weeks: item.estimatedWeeks,
      weekly_hours: item.weeklyHours,
      market_demand: item.comp.marketDemand,
      internal_opportunities: item.comp.internalJobs,
      salary_growth: item.comp.salaryGrowth
    }));

    try {
      const rec = await fetchCareerComparisonRecommendation({
        currentRoleTitle: selectedCurrentRole,
        rolesData: rolesPayload,
        currentSkills
      });
      if (rec) {
        setAiRecommendation(rec);
      }
    } catch (err) {
      console.warn('AI recommendation fetch notice:', err);
    } finally {
      setLoadingAi(false);
    }
  };

  useEffect(() => {
    fetchRecommendation();
  }, [roleA, roleB, roleC, selectedCurrentRole]);

  const handleApplyRole = (roleId) => {
    if (onSelectTargetRole) {
      onSelectTargetRole(roleId);
    }
    if (onNavigateToRoadmap) {
      onNavigateToRoadmap();
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-white via-blue-50/50 to-indigo-50/60 rounded-3xl p-6 sm:p-8 border border-blue-200/80 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16"></div>

        <div className="space-y-3 max-w-3xl relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200 flex items-center space-x-1.5 shadow-2xs">
              <Zap className="w-3.5 h-3.5 text-blue-600" />
              <span>Career What-If Simulator 2.0</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              Enterprise Mobility Decision Engine
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-outfit tracking-tight">
            Multi-Role Decision & Trajectory Engine
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed font-normal">
            Analyze multiple promotion and transition paths side-by-side. Our decision engine synthesizes transferable skills, weekly learning commitment, open internal requisitions, and industry compensation ceilings to guide your optimal move.
          </p>
        </div>

        {/* Current Role Selector Bar */}
        <div className="mt-6 pt-5 border-t border-blue-200/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1.5">
              <Briefcase className="w-3.5 h-3.5 text-blue-600" />
              <span>Current Role Baseline:</span>
            </span>
            <select
              value={selectedCurrentRole}
              onChange={(e) => setSelectedCurrentRole(e.target.value)}
              className="text-xs font-bold bg-white border border-blue-300 rounded-xl px-3 py-1.5 text-slate-900 shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {currentRoleOptions.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <button
            onClick={fetchRecommendation}
            disabled={loadingAi}
            className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold flex items-center space-x-1.5 shadow-2xs transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${loadingAi ? 'animate-spin' : ''}`} />
            <span>Re-Analyze with Gemini</span>
          </button>
        </div>
      </div>

      {/* Career Option Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
            Path Option 1
          </label>
          <select
            value={roleA}
            onChange={(e) => setRoleA(e.target.value)}
            className="w-full text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white"
          >
            {roles.map(r => (
              <option key={r.id} value={r.id}>{r.title}</option>
            ))}
          </select>
          <div className="flex items-center justify-between mt-2 px-1 text-[11px] text-slate-500 font-medium">
            <span>Pace:</span>
            <div className="flex items-center space-x-1">
              {[4, 6, 8, 10].map(h => (
                <button
                  key={h}
                  onClick={() => setWeeklyHoursA(h)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    weeklyHoursA === h ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {h}h
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
            Path Option 2
          </label>
          <select
            value={roleB}
            onChange={(e) => setRoleB(e.target.value)}
            className="w-full text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white"
          >
            {roles.map(r => (
              <option key={r.id} value={r.id}>{r.title}</option>
            ))}
          </select>
          <div className="flex items-center justify-between mt-2 px-1 text-[11px] text-slate-500 font-medium">
            <span>Pace:</span>
            <div className="flex items-center space-x-1">
              {[4, 6, 8, 10].map(h => (
                <button
                  key={h}
                  onClick={() => setWeeklyHoursB(h)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    weeklyHoursB === h ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {h}h
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
            Path Option 3
          </label>
          <select
            value={roleC}
            onChange={(e) => setRoleC(e.target.value)}
            className="w-full text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white"
          >
            {roles.map(r => (
              <option key={r.id} value={r.id}>{r.title}</option>
            ))}
          </select>
          <div className="flex items-center justify-between mt-2 px-1 text-[11px] text-slate-500 font-medium">
            <span>Pace:</span>
            <div className="flex items-center space-x-1">
              {[4, 6, 8, 10].map(h => (
                <button
                  key={h}
                  onClick={() => setWeeklyHoursC(h)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    weeklyHoursC === h ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {h}h
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* "Why this recommendation?" AI Synthesis Decision Card */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center space-x-2">
              <span className="w-8 h-8 rounded-xl bg-blue-500 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/30">
                <Sparkles className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-base sm:text-lg font-black font-outfit text-white">
                  Why this recommendation?
                </h3>
                <p className="text-[11px] text-blue-200">
                  AI Talent Mobility Synthesis (Powered by Gemini AI)
                </p>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full bg-blue-800/80 text-blue-200 border border-blue-700 text-xs font-bold flex items-center space-x-1">
              <span>⚡ Live Decision Matrix</span>
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-sm sm:text-base leading-relaxed text-blue-50 font-normal">
            {loadingAi ? (
              <div className="flex items-center space-x-2 text-blue-200 text-xs py-2">
                <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
                <span>Evaluating skill overlap, internal requisition signals, and career ceilings...</span>
              </div>
            ) : (
              <p>
                {aiRecommendation?.narrative || 
                  "Senior Data Analyst is your fastest internal mobility path because you already have strong SQL and Python foundations. AI Engineer offers higher growth potential but requires additional ML and LLM skills. Data Engineer provides a balanced infrastructure pathway."}
              </p>
            )}
          </div>

          {/* Tradeoff Pills */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            {comparedRoles.map((item) => {
              const isFastest = item.overlapPercent === Math.max(...comparedRoles.map(r => r.overlapPercent));
              const isHighestComp = item.comp.salaryGrowth.includes('42');
              const badge = isFastest 
                ? "⚡ Fastest Internal Mobility" 
                : isHighestComp 
                  ? "🚀 Highest Growth Potential" 
                  : "🏗️ Balanced Systems Track";

              return (
                <div key={item.role.id} className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white font-outfit">{item.role.title}</span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                      isFastest ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/30' : 'bg-blue-400/20 text-blue-300 border border-blue-400/30'
                    }`}>
                      {badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-blue-200/90 leading-snug">
                    {isFastest 
                      ? "Direct progression utilizing your existing analytical foundation. 3 open internal jobs."
                      : isHighestComp
                        ? "Maximum market demand (+42% salary growth), requiring stretch effort in LLMs."
                        : "Synergistic path expanding data storage, containerization, and distributed pipelines."}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Factor Comparison Matrix Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 font-outfit">
                Side-by-Side Decision Matrix
              </h2>
              <p className="text-xs text-slate-500">
                Comparing current skills, learning effort, market demand, and internal opportunities
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider w-1/4">
                  Factor
                </th>
                {comparedRoles.map((item) => (
                  <th key={item.role.id} className="py-4 px-6 text-xs font-extrabold text-slate-900 font-outfit w-1/4">
                    <div className="flex items-center space-x-2">
                      <span>{item.role.title}</span>
                      {item.overlapPercent === Math.max(...comparedRoles.map(r => r.overlapPercent)) && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          Best Fit
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              
              {/* Factor: Current Skill Match */}
              <tr className="hover:bg-slate-50/70 transition">
                <td className="py-4 px-6 font-bold text-slate-700 flex items-center space-x-2">
                  <span>Current Skill Match</span>
                </td>
                {comparedRoles.map((item) => (
                  <td key={item.role.id} className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <div className="flex-1 bg-slate-200 rounded-full h-2.5 max-w-[120px] overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            item.overlapPercent >= 60 ? 'bg-emerald-500' : item.overlapPercent >= 45 ? 'bg-blue-600' : 'bg-amber-500'
                          }`}
                          style={{ width: `${item.overlapPercent}%` }}
                        />
                      </div>
                      <span className="font-extrabold text-sm text-slate-900 font-outfit">{item.overlapPercent}%</span>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Factor: Missing Skills */}
              <tr className="hover:bg-slate-50/70 transition">
                <td className="py-4 px-6 font-bold text-slate-700">
                  Missing Skills
                </td>
                {comparedRoles.map((item) => (
                  <td key={item.role.id} className="py-4 px-6">
                    <div className="space-y-1">
                      <span className="font-extrabold text-slate-900 text-sm">{item.missingSkillsCount} skills</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.missingSkills.slice(0, 3).map(s => (
                          <span key={s.id} className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] text-slate-600 font-medium truncate max-w-[130px]">
                            {s.name} (+{s.gap})
                          </span>
                        ))}
                      </div>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Factor: Estimated Learning Time */}
              <tr className="hover:bg-slate-50/70 transition">
                <td className="py-4 px-6 font-bold text-slate-700">
                  Estimated Learning Time
                </td>
                {comparedRoles.map((item) => (
                  <td key={item.role.id} className="py-4 px-6">
                    <span className="font-extrabold text-slate-900 flex items-center space-x-1.5 text-sm">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span>{item.estimatedWeeks} weeks</span>
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Based on {item.weeklyHours} hrs/week
                    </span>
                  </td>
                ))}
              </tr>

              {/* Factor: Weekly Effort */}
              <tr className="hover:bg-slate-50/70 transition">
                <td className="py-4 px-6 font-bold text-slate-700">
                  Weekly Effort
                </td>
                {comparedRoles.map((item) => (
                  <td key={item.role.id} className="py-4 px-6">
                    <span className="font-extrabold text-blue-700 text-sm">
                      {item.weeklyHours} hrs
                    </span>
                  </td>
                ))}
              </tr>

              {/* Factor: Market Demand */}
              <tr className="hover:bg-slate-50/70 transition">
                <td className="py-4 px-6 font-bold text-slate-700">
                  Market Demand
                </td>
                {comparedRoles.map((item) => (
                  <td key={item.role.id} className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${
                      item.comp.marketDemand === 'Very High'
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}>
                      {item.comp.demandBadge}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Factor: Internal Opportunities */}
              <tr className="hover:bg-slate-50/70 transition">
                <td className="py-4 px-6 font-bold text-slate-700">
                  Internal Opportunities
                </td>
                {comparedRoles.map((item) => (
                  <td key={item.role.id} className="py-4 px-6">
                    <span className="font-extrabold text-slate-900 flex items-center space-x-1.5 text-sm">
                      <Building className="w-4 h-4 text-indigo-600" />
                      <span>{item.comp.internalJobs} open positions</span>
                    </span>
                  </td>
                ))}
              </tr>

              {/* Factor: Benchmark Salary Growth */}
              <tr className="hover:bg-slate-50/70 transition">
                <td className="py-4 px-6 font-bold text-slate-700">
                  Salary Growth Potential
                </td>
                {comparedRoles.map((item) => (
                  <td key={item.role.id} className="py-4 px-6">
                    <span className="font-black text-emerald-700 text-sm flex items-center space-x-1">
                      <DollarSign className="w-4 h-4 text-emerald-600" />
                      <span>{item.comp.salaryGrowth}</span>
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Benchmark: {item.comp.benchmark}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Row: Action Selection */}
              <tr className="bg-slate-50/90">
                <td className="py-5 px-6 font-bold text-slate-700">
                  Select Decision
                </td>
                {comparedRoles.map((item) => (
                  <td key={item.role.id} className="py-5 px-6">
                    <button
                      onClick={() => handleApplyRole(item.role.id)}
                      className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow-sm transition active:scale-95"
                    >
                      <span>Select & Build Path</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                ))}
              </tr>

            </tbody>
          </table>
        </div>
      </div>

      {/* Comparison Cards Visual Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {comparedRoles.map((item) => {
          const { role, overlapPercent, estimatedWeeks, missingSkills, comp, weeklyHours } = item;
          const isBestMatch = overlapPercent === Math.max(...comparedRoles.map(r => r.overlapPercent));

          return (
            <div 
              key={role.id}
              className={`bg-white rounded-3xl p-6 border transition flex flex-col justify-between relative shadow-sm ${
                isBestMatch 
                  ? 'border-blue-500 ring-2 ring-blue-500/20' 
                  : 'border-slate-200 hover:border-blue-300'
              }`}
            >
              {isBestMatch && (
                <div className="absolute -top-3.5 right-6 px-3.5 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-[10px] uppercase tracking-wider rounded-full shadow-md">
                  ⚡ Highest Transferable Fit
                </div>
              )}

              <div className="space-y-4">
                
                <div>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 uppercase">
                    {role.track?.replace(/_/g, ' ') || 'Engineering Track'}
                  </span>
                  <h3 className="text-xl font-black text-slate-900 font-outfit mt-2">{role.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">{role.description}</p>
                </div>

                {/* Overlap Gauge */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-600">Current Skill Match</span>
                    <span className="text-blue-700 text-sm font-black font-outfit">{overlapPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-700 ${
                        overlapPercent >= 60 ? 'bg-emerald-500' : overlapPercent >= 45 ? 'bg-blue-600' : 'bg-amber-500'
                      }`}
                      style={{ width: `${overlapPercent}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] block font-bold uppercase">Timeline</span>
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
                    <span className="text-slate-500 text-[11px]">Internal Jobs:</span>
                    <span className="font-bold text-indigo-700 text-[11px]">{comp.internalJobs} Open Requisitions</span>
                  </div>
                </div>

                {/* Growth Skills */}
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                    <span>Critical Growth Skills to Bridge:</span>
                    <span className="text-slate-400 font-normal">{missingSkills.length} remaining</span>
                  </div>

                  <div className="space-y-1.5">
                    {missingSkills.slice(0, 3).map(sk => (
                      <div key={sk.id} className="p-2 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center justify-between text-xs">
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

    </div>
  );
}
