import React from 'react';
import { 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer, Tooltip 
} from 'recharts';
import { Target, Layers, ArrowUpRight, AlertTriangle, CheckCircle, ShieldAlert, Sparkles } from 'lucide-react';

export default function GapAnalysisView({ gapAnalysis, onGeneratePathClick }) {
  if (!gapAnalysis || !gapAnalysis.gaps) {
    return (
      <div className="p-8 text-center text-gray-400 glass-card rounded-2xl">
        Loading Skill Gap Analysis...
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
      <div className="relative overflow-hidden glass-panel rounded-2xl p-6 sm:p-8 border border-indigo-500/30">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
                Gap Analysis Vector
              </span>
              <span className="text-xs text-gray-400">Rule-Based + AI Pre-computed</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-outfit">
              Goal Target: <span className="gradient-text">{target_role.title}</span>
            </h1>
            <p className="text-sm text-gray-300">
              {target_role.description}
            </p>
          </div>

          {/* Readiness Metric Circle Badge */}
          <div className="flex items-center space-x-4 bg-gray-900/80 p-4 rounded-2xl border border-gray-800 shadow-xl">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-gray-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-indigo-500 transition-all duration-1000 ease-out"
                  strokeDasharray={`${readiness_percent}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-lg font-black text-white font-outfit">{readiness_percent}%</span>
            </div>

            <div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Role Readiness</div>
              <div className="text-sm font-bold text-indigo-300">
                {readiness_percent >= 80 ? 'Near Mastery' : readiness_percent >= 50 ? 'Moderate Gap' : 'Substantial Opportunity'}
              </div>
              <button
                onClick={onGeneratePathClick}
                className="mt-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
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
        <div className="lg:col-span-5 glass-panel rounded-2xl p-5 border border-gray-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white font-outfit flex items-center space-x-2">
                <Target className="w-4 h-4 text-indigo-400" />
                <span>Skill Vector Spider Chart</span>
              </h2>
              <span className="text-[11px] text-gray-400">Target vs Current (Lvl 1-5)</span>
            </div>

            <div className="w-full h-72 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#374151" strokeDasharray="3 3" />
                  <PolarAngleAxis dataKey="skill" stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 5]} stroke="#4b5563" />
                  
                  <Radar
                    name="Current Skill Vector"
                    dataKey="current"
                    stroke="#818cf8"
                    fill="#6366f1"
                    fillOpacity={0.4}
                  />
                  <Radar
                    name="Required Target Vector"
                    dataKey="required"
                    stroke="#f472b6"
                    fill="#ec4899"
                    fillOpacity={0.25}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '0.75rem' }}
                    itemStyle={{ fontSize: 12 }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 p-3 bg-gray-900/60 rounded-xl border border-gray-800 text-xs text-gray-400 flex items-start space-x-2">
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <p>
              Pre-computed gap arithmetic ensures consistent ranking: <code className="text-indigo-300">gap_score = max(0, required - current)</code> sorted by gap magnitude and prerequisite order.
            </p>
          </div>
        </div>

        {/* Right Column: Ranked Missing & Weak Skills (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white font-outfit flex items-center space-x-2">
              <Layers className="w-4 h-4 text-purple-400" />
              <span>Ranked Missing & Weak Skills ({gaps.filter(g => g.gap_score > 0).length})</span>
            </h2>
            <span className="text-xs text-gray-400">Sorted by Priority & Dependency</span>
          </div>

          <div className="space-y-3">
            {gaps.map((gap, index) => {
              const isMet = gap.gap_score === 0;
              return (
                <div 
                  key={gap.skill_id}
                  className={`p-4 rounded-xl glass-card transition border ${
                    isMet 
                      ? 'border-gray-800/60 bg-gray-900/30' 
                      : gap.gap_score >= 3
                      ? 'border-pink-500/30 bg-pink-950/10'
                      : 'border-indigo-500/20 bg-indigo-950/10'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-gray-500">#{index + 1}</span>
                        <h3 className="text-sm font-bold text-white font-outfit">{gap.skill_name}</h3>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700">
                          {gap.category}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">{gap.description}</p>
                    </div>

                    {/* Gap Score Badge */}
                    <div className="text-right shrink-0">
                      {isMet ? (
                        <span className="inline-flex items-center space-x-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Met</span>
                        </span>
                      ) : (
                        <span className={`inline-flex items-center space-x-1 text-xs font-bold px-2.5 py-1 rounded-lg border ${
                          gap.gap_score >= 3 
                            ? 'bg-pink-500/20 text-pink-300 border-pink-500/40 animate-pulse-slow' 
                            : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                        }`}>
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>-{gap.gap_score} Level Gap</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Level Comparison Bar */}
                  <div className="mt-3 grid grid-cols-2 gap-3 text-xs bg-gray-900/60 p-2.5 rounded-lg border border-gray-800">
                    <div>
                      <span className="text-gray-500 block text-[10px]">Current Level ({gap.current_level}/5)</span>
                      <span className="text-gray-300 font-medium">{gap.level_description_current}</span>
                    </div>
                    <div className="border-l border-gray-800 pl-3">
                      <span className="text-indigo-400 block text-[10px]">Required Target Level ({gap.required_level}/5)</span>
                      <span className="text-indigo-200 font-medium">{gap.level_description_target}</span>
                    </div>
                  </div>

                  {/* Prerequisites info */}
                  {gap.prerequisites && gap.prerequisites.length > 0 && (
                    <div className="mt-2 text-[11px] text-gray-400 flex items-center space-x-1">
                      <span className="text-gray-500 font-medium">Prerequisites:</span>
                      <div className="flex flex-wrap gap-1">
                        {gap.prerequisites.map(p => (
                          <span key={p.skill_id} className="px-1.5 py-0.5 rounded bg-gray-800 text-gray-300 border border-gray-700">
                            {p.name} (Lvl {p.current_level})
                          </span>
                        ))}
                      </div>
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
