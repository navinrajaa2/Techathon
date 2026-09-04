import React from 'react';
import { 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer, Tooltip 
} from 'recharts';
import { Target, Layers, ArrowUpRight, AlertTriangle, CheckCircle, Sparkles, TrendingUp } from 'lucide-react';

export default function GapAnalysisView({ gapAnalysis, onGeneratePathClick, onOpenProjectChallenge }) {
  if (!gapAnalysis || !gapAnalysis.gaps) {
    return (
      <div className="p-12 text-center text-slate-500 bg-white border border-slate-200 shadow-sm rounded-2xl">
        <div className="animate-spin w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full mx-auto mb-3"></div>
        <p className="font-semibold text-slate-700">Analyzing your skill matrix against role benchmarks...</p>
      </div>
    );
  }

  const { target_role, readiness_percent, gaps } = gapAnalysis;

  // Prepare radar chart data
  const radarData = gaps.map(g => ({
    skill: g.skill_name.length > 20 ? g.skill_name.substring(0, 18) + '...' : g.skill_name,
    current: g.current_level,
    required: g.required_level,
    fullSkillName: g.skill_name
  }));

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Target Role & Readiness Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50/40 to-indigo-50/40 rounded-2xl p-6 sm:p-8 border border-blue-200/80 shadow-sm">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200 uppercase tracking-wider">
                Skill Gap Vector Engine
              </span>
              <span className="text-xs font-medium text-slate-500">Benchmark: Industry Standard</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-outfit">
              Target Goal: <span className="gradient-text">{target_role.title}</span>
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed font-normal">
              {target_role.description}
            </p>
          </div>

          {/* Readiness Metric Circle Badge */}
          <div className="flex items-center space-x-4 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-blue-600 transition-all duration-1000 ease-out"
                  strokeDasharray={`${readiness_percent}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-lg font-black text-slate-900 font-outfit">{readiness_percent}%</span>
            </div>

            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Role Match</div>
              <div className="text-sm font-bold text-blue-700">
                {readiness_percent >= 80 ? 'Promotable / Ready' : readiness_percent >= 50 ? 'Moderate Growth Gap' : 'Emerging Trajectory'}
              </div>
              <button
                onClick={onGeneratePathClick}
                className="mt-2 text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center space-x-1 transition"
              >
                <span>View Learning Path</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Main Grid: Radar Chart + Gap Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Radar Chart (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 font-outfit flex items-center space-x-2">
                <Target className="w-4 h-4 text-blue-600" />
                <span>Skill Vector Radar Chart</span>
              </h2>
              <span className="text-[11px] text-slate-400 font-medium">Lvl 1 to 5</span>
            </div>

            <div className="w-full h-72 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                  <PolarAngleAxis dataKey="skill" stroke="#64748b" tick={{ fill: '#475569', fontSize: 11, fontWeight: 500 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 5]} stroke="#cbd5e1" />
                  
                  <Radar
                    name="Your Current Skills"
                    dataKey="current"
                    stroke="#2563eb"
                    fill="#3b82f6"
                    fillOpacity={0.35}
                  />
                  <Radar
                    name="Target Role Benchmark"
                    dataKey="required"
                    stroke="#0284c7"
                    fill="#38bdf8"
                    fillOpacity={0.25}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '0.75rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    itemStyle={{ fontSize: 12, fontWeight: 600 }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '12px', fontSize: '12px', color: '#475569' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 p-3.5 bg-blue-50/80 rounded-xl border border-blue-100 text-xs text-blue-950 flex items-start space-x-2">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p>
              Pre-computed gap arithmetic: <code className="bg-white px-1.5 py-0.5 rounded border border-blue-200 text-blue-700 font-bold">gap_score = max(0, required - current)</code> prioritizing high-leverage foundational skills first.
            </p>
          </div>
        </div>

        {/* Right Column: Ranked Missing & Weak Skills (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 font-outfit flex items-center space-x-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Prioritized Growth Areas ({gaps.filter(g => g.gap_score > 0).length})</span>
            </h2>
            <span className="text-xs text-slate-400 font-medium">Ranked by Criticality</span>
          </div>

          <div className="space-y-3">
            {gaps.map((gap, index) => {
              const isMet = gap.gap_score === 0;
              return (
                <div 
                  key={gap.skill_id}
                  className={`p-4 sm:p-5 rounded-2xl transition bg-white border ${
                    isMet 
                      ? 'border-slate-200/90 shadow-2xs' 
                      : gap.gap_score >= 3
                      ? 'border-rose-200 shadow-xs hover:border-rose-300'
                      : 'border-blue-200/80 shadow-xs hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-400">#{index + 1}</span>
                        <h3 className="text-sm font-bold text-slate-900 font-outfit">{gap.skill_name}</h3>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                          {gap.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-normal">{gap.description}</p>
                    </div>

                    {/* Gap Score Badge */}
                    <div className="text-right shrink-0">
                      {isMet ? (
                        <span className="inline-flex items-center space-x-1 text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Met</span>
                        </span>
                      ) : (
                        <span className={`inline-flex items-center space-x-1 text-xs font-bold px-2.5 py-1 rounded-lg border ${
                          gap.gap_score >= 3 
                            ? 'bg-rose-50 text-rose-700 border-rose-200' 
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>-{gap.gap_score} Level Gap</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Level Comparison Bar */}
                  <div className="mt-3.5 grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-slate-400 font-bold block text-[10px] uppercase">Current Level ({gap.current_level}/5)</span>
                      <span className="text-slate-700 font-semibold">{gap.level_description_current}</span>
                    </div>
                    <div className="border-l border-slate-200 pl-3">
                      <span className="text-blue-600 font-bold block text-[10px] uppercase">Required Level ({gap.required_level}/5)</span>
                      <span className="text-blue-900 font-semibold">{gap.level_description_target}</span>
                    </div>
                  </div>

                  {/* Prerequisites info */}
                  {gap.prerequisites && gap.prerequisites.length > 0 && (
                    <div className="mt-2 text-[11px] text-slate-500 flex items-center space-x-1.5">
                      <span className="font-medium">Prerequisites:</span>
                      <div className="flex flex-wrap gap-1">
                        {gap.prerequisites.map(p => (
                          <span key={p.skill_id} className="px-1.5 py-0.5 rounded bg-white text-slate-700 border border-slate-200 font-medium">
                            {p.name} (Lvl {p.current_level})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Hands-On Project Verification Action */}
                  {!isMet && onOpenProjectChallenge && (
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500 font-medium">
                        Bridge this gap with practical evidence:
                      </span>
                      <button
                        onClick={() => onOpenProjectChallenge({
                          id: gap.skill_id,
                          name: gap.skill_name,
                          currentLevel: gap.current_level,
                          targetLevel: gap.required_level
                        })}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-2xs transition active:scale-95"
                      >
                        <span>🚀 Verify via Real Project</span>
                      </button>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
