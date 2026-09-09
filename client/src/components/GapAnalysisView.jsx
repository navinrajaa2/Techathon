import React, { useState, useMemo } from 'react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer, Tooltip,
  PieChart, Pie, Cell
} from 'recharts';
import {
  Target, Layers, ArrowUpRight, AlertTriangle, CheckCircle, Sparkles, TrendingUp,
  Clock, Filter, Search, Download, Users, ShieldCheck, ChevronRight, Code,
  Award, BookOpen, MessageSquare, Zap, ExternalLink, RefreshCw, BarChart2
} from 'lucide-react';

export default function GapAnalysisView({
  gapAnalysis,
  roles = [],
  onSelectTargetRole,
  onGeneratePathClick,
  onOpenProjectChallenge,
  onStartQuiz,
  onOpenPlayground,
  onOpenMentorship,
  onOpenPromotionMemo,
  onOpenSlack,
  onRequestManagerReview
}) {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [criticalityFilter, setCriticalityFilter] = useState('ALL'); // 'ALL' | 'CRITICAL' | 'MODERATE' | 'MET'
  const [sortBy, setSortBy] = useState('GAP_DESC'); // 'GAP_DESC' | 'GAP_ASC' | 'NAME' | 'CATEGORY'
  const [searchQuery, setSearchQuery] = useState('');
  const [showTeamBenchmark, setShowTeamBenchmark] = useState(false);
  const [requestedEndorsements, setRequestedEndorsements] = useState({});

  if (!gapAnalysis || !gapAnalysis.gaps) {
    return (
      <div className="p-12 text-center text-slate-500 bg-white border border-slate-200 shadow-sm rounded-2xl">
        <div className="animate-spin w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full mx-auto mb-3"></div>
        <p className="font-semibold text-slate-700">Analyzing your skill matrix against role benchmarks...</p>
      </div>
    );
  }

  const { target_role, readiness_percent, gaps } = gapAnalysis;

  // Extract categories for category pills
  const categories = ['ALL', ...Array.from(new Set(gaps.map(g => g.category || 'General')))];

  // Calculate effort estimation & historical delta
  const totalGapPoints = gaps.reduce((acc, g) => acc + g.gap_score, 0);
  const totalEstimatedHours = totalGapPoints * 6; // ~6 hours of study/practice per gap level
  const estimatedWeeks = Math.ceil(totalEstimatedHours / 8); // Assuming 8 hours/week commitment
  const criticalGapsCount = gaps.filter(g => g.gap_score >= 3).length;
  const moderateGapsCount = gaps.filter(g => g.gap_score >= 1 && g.gap_score < 3).length;
  const metSkillsCount = gaps.filter(g => g.gap_score === 0).length;

  const statusPieData = useMemo(() => [
    { name: 'Met Baseline', value: metSkillsCount, color: '#10b981' },
    { name: 'Moderate Gap', value: moderateGapsCount, color: '#f59e0b' },
    { name: 'Critical Gap', value: criticalGapsCount, color: '#f43f5e' }
  ].filter(d => d.value > 0), [metSkillsCount, moderateGapsCount, criticalGapsCount]);

  // Filter & Sort gaps
  const filteredGaps = gaps
    .filter(g => {
      // Category filter
      if (selectedCategory !== 'ALL' && (g.category || 'General') !== selectedCategory) return false;
      // Criticality filter
      if (criticalityFilter === 'CRITICAL' && g.gap_score < 3) return false;
      if (criticalityFilter === 'MODERATE' && (g.gap_score < 1 || g.gap_score >= 3)) return false;
      if (criticalityFilter === 'MET' && g.gap_score > 0) return false;
      // Search query
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const nameMatch = g.skill_name.toLowerCase().includes(query);
        const descMatch = g.description?.toLowerCase().includes(query);
        const catMatch = g.category?.toLowerCase().includes(query);
        if (!nameMatch && !descMatch && !catMatch) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'GAP_DESC') return b.gap_score - a.gap_score;
      if (sortBy === 'GAP_ASC') return a.gap_score - b.gap_score;
      if (sortBy === 'NAME') return a.skill_name.localeCompare(b.skill_name);
      if (sortBy === 'CATEGORY') return (a.category || '').localeCompare(b.category || '');
      return 0;
    });

  // Prepare radar chart data with Team Average benchmark option
  const radarData = gaps.map(g => ({
    skill: g.skill_name.length > 18 ? g.skill_name.substring(0, 16) + '...' : g.skill_name,
    current: g.current_level,
    required: g.required_level,
    teamAvg: Math.max(1, Math.min(5, Math.round((g.current_level + g.required_level) / 2))), // Peer benchmark baseline
    fullSkillName: g.skill_name
  }));

  const handleRequestEndorsement = (gap) => {
    setRequestedEndorsements(prev => ({ ...prev, [gap.skill_id]: true }));
    if (onRequestManagerReview) {
      onRequestManagerReview(gap);
    }
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fadeIn print:space-y-4 print:p-0">

      {/* Target Role & Readiness Banner */}
      <div className="relative overflow-hidden bg-white rounded-2xl p-6 sm:p-8 text-slate-900 shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-wider flex items-center gap-1.5">

                Skill Gap Vector Engine
              </span>
              <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                +12% Readiness vs Last Quarter
              </span>
            </div>

            {/* Role Title with Interactive "What-If" Role Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold font-outfit text-slate-900 tracking-tight">
                Target Goal:
              </h1>
              {roles && roles.length > 0 ? (
                <div className="relative inline-block">
                  <select
                    value={target_role.id || ''}
                    onChange={(e) => onSelectTargetRole && onSelectTargetRole(e.target.value)}
                    className="bg-slate-50 text-slate-900 font-bold text-lg sm:text-xl px-4 py-2 rounded-xl border border-slate-300 shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer hover:bg-slate-100 transition"
                  >
                    {roles.map(r => (
                      <option key={r.id} value={r.id} className="bg-white text-slate-900 font-medium text-sm">
                        {r.title} ({r.department || 'Engineering'})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <span className="text-2xl sm:text-3xl font-extrabold text-blue-700 font-outfit">
                  {target_role.title}
                </span>
              )}
            </div>

            <p className="text-sm text-slate-600 leading-relaxed font-normal">
              {target_role.description}
            </p>

            {/* Time-to-Readiness & Effort Estimator */}
            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
              <div className="flex items-center space-x-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Est. Effort: <strong className="text-slate-900">{totalEstimatedHours} Hours</strong> (~{estimatedWeeks} wks @ 8h/wk)</span>
              </div>
              <div className="flex items-center space-x-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Critical Gaps: <strong className="text-slate-900">{criticalGapsCount} High Leverage</strong></span>
              </div>
            </div>
          </div>

          {/* Readiness Metric Circle & Export Actions */}
          <div className="flex flex-col items-end gap-3 self-stretch md:self-auto justify-between">
            <div className="flex items-center space-x-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-2xs w-full sm:w-auto">
              <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-200"
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
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={onGeneratePathClick}
                    className="text-xs font-bold px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-1 shadow-2xs transition"
                  >
                    <span>View Roadmap</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Actions: Export PDF & Promotion Pitch */}
            <div className="flex items-center gap-2 w-full justify-end print:hidden">
              <button
                onClick={handlePrintReport}
                className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 flex items-center space-x-1.5 transition"
                title="Print or Save Gap Report as PDF"
              >
                <Download className="w-3.5 h-3.5 text-slate-400" />
                <span>Export PDF</span>
              </button>
              {onOpenPromotionMemo && (
                <button
                  onClick={onOpenPromotionMemo}
                  className="px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl border border-emerald-500 flex items-center space-x-1.5 shadow-sm transition"
                >
                  <Award className="w-3.5 h-3.5 text-emerald-200" />
                  <span>Promotion Pitch</span>
                </button>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* Main Grid: Radar Chart + Gap Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Interactive Radar Chart & Benchmark Toggle (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <h2 className="text-base font-bold text-slate-900 font-outfit flex items-center space-x-2">
                <Target className="w-4 h-4 text-blue-600" />
                <span>Skill Vector Radar</span>
              </h2>

              {/* Peer Benchmark Overlay Toggle */}
              <button
                onClick={() => setShowTeamBenchmark(!showTeamBenchmark)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition flex items-center space-x-1.5 ${showTeamBenchmark
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                  }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>{showTeamBenchmark ? 'Peer Baseline ON' : '+ Peer Baseline'}</span>
              </button>
            </div>

            <div className="w-full h-72 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                  <PolarAngleAxis
                    dataKey="skill"
                    stroke="#64748b"
                    tick={{ fill: '#475569', fontSize: 11, fontWeight: 500 }}
                  />
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
                    fillOpacity={0.2}
                  />
                  {showTeamBenchmark && (
                    <Radar
                      name="Team / Peer Avg Baseline"
                      dataKey="teamAvg"
                      stroke="#10b981"
                      fill="#34d399"
                      fillOpacity={0.25}
                    />
                  )}
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '0.75rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    itemStyle={{ fontSize: 12, fontWeight: 600 }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '12px', fontSize: '11px', color: '#475569' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Donut Chart: Competency Breakdown */}
          <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Competency Breakdown</span>
              <span className="text-[10px] text-slate-500 font-normal">{gaps.length} Total Skills</span>
            </div>
            <div className="grid grid-cols-12 gap-2 items-center">
              <div className="col-span-5 h-24 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={20}
                      outerRadius={34}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {statusPieData.map((entry, index) => (
                        <Cell key={`status-cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '11px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="col-span-7 text-[11px] space-y-1.5 font-semibold text-slate-700">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Met Baseline</span>
                  <span className="font-bold text-slate-900">{metSkillsCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Moderate Gap</span>
                  <span className="font-bold text-slate-900">{moderateGapsCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Critical Gap</span>
                  <span className="font-bold text-slate-900">{criticalGapsCount}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3.5 bg-blue-50/80 rounded-xl border border-blue-100 text-xs text-blue-950 flex items-start space-x-2">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p>
              Vector Arithmetic: <code className="bg-white px-1.5 py-0.5 rounded border border-blue-200 text-blue-700 font-bold">gap_score = max(0, required - current)</code> prioritizes critical bottleneck skills first.
            </p>
          </div>
        </div>

        {/* Right Column: Interactive Filter/Search + Prioritized Gap Cards (7 cols) */}
        <div className="lg:col-span-7 space-y-4">

          {/* Controls Bar: Search, Category Pills, Criticality Filter & Sort */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3 print:hidden">

            {/* Top Row: Search + Sort */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter skill gaps..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-800"
                />
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                <span className="text-xs text-slate-400 font-bold">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="GAP_DESC">Highest Gap First</option>
                  <option value="GAP_ASC">Lowest Gap First</option>
                  <option value="NAME">Skill Name (A-Z)</option>
                  <option value="CATEGORY">Category</option>
                </select>
              </div>
            </div>

            {/* Bottom Row: Category & Criticality Filters */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">

              {/* Criticality Filters */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setCriticalityFilter('ALL')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${criticalityFilter === 'ALL' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                >
                  All ({gaps.length})
                </button>
                <button
                  onClick={() => setCriticalityFilter('CRITICAL')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${criticalityFilter === 'CRITICAL' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                    }`}
                >
                  Critical ({criticalGapsCount})
                </button>
                <button
                  onClick={() => setCriticalityFilter('MODERATE')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${criticalityFilter === 'MODERATE' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                    }`}
                >
                  Moderate ({moderateGapsCount})
                </button>
                <button
                  onClick={() => setCriticalityFilter('MET')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${criticalityFilter === 'MET' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                    }`}
                >
                  Met ({metSkillsCount})
                </button>
              </div>

              {/* Category Pills */}
              {categories.length > 2 && (
                <div className="flex items-center space-x-1 overflow-x-auto py-0.5 max-w-full">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-semibold whitespace-nowrap transition ${selectedCategory === cat ? 'bg-blue-100 text-blue-800 border border-blue-300' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}

            </div>

          </div>

          {/* Gap Cards Stream */}
          <div className="space-y-3">
            {filteredGaps.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
                <p className="text-sm font-semibold">No skill gaps match the selected filters.</p>
                <button
                  onClick={() => { setSelectedCategory('ALL'); setCriticalityFilter('ALL'); setSearchQuery(''); }}
                  className="mt-2 text-xs text-blue-600 font-bold hover:underline"
                >
                  Reset all filters
                </button>
              </div>
            ) : (
              filteredGaps.map((gap, index) => {
                const isMet = gap.gap_score === 0;
                const estSkillHours = gap.gap_score * 6;
                const isRequested = requestedEndorsements[gap.skill_id];

                return (
                  <div
                    key={gap.skill_id}
                    className={`p-4 sm:p-5 rounded-2xl transition bg-white border ${isMet
                      ? 'border-slate-200/90 shadow-2xs'
                      : gap.gap_score >= 3
                        ? 'border-rose-200 shadow-xs hover:border-rose-300'
                        : 'border-blue-200/80 shadow-xs hover:border-blue-300'
                      }`}
                  >
                    {/* Header: Skill Name, Category, Gap Badge & Validation Status */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center flex-wrap gap-2">
                          <span className="text-xs font-bold text-slate-400">#{index + 1}</span>
                          <h3 className="text-sm font-bold text-slate-900 font-outfit">{gap.skill_name}</h3>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                            {gap.category || 'General'}
                          </span>

                          {/* Validation Badge */}
                          {gap.current_level >= 3 ? (
                            <span className="inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200" title="Assessment Verified">
                              <ShieldCheck className="w-3 h-3 text-blue-600" />
                              <span>Verified</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 text-[10px] font-medium px-2 py-0.5 rounded bg-slate-50 text-slate-500 border border-slate-200">
                              <span>Self Assessed</span>
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 font-normal">{gap.description}</p>
                      </div>

                      {/* Gap Score Badge & Skill Effort Estimate */}
                      <div className="text-right shrink-0 space-y-1">
                        {isMet ? (
                          <span className="inline-flex items-center space-x-1 text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Met Benchmark</span>
                          </span>
                        ) : (
                          <span className={`inline-flex items-center space-x-1 text-xs font-bold px-2.5 py-1 rounded-lg border ${gap.gap_score >= 3
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                            }`}>
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>-{gap.gap_score} Level Gap</span>
                          </span>
                        )}
                        {!isMet && (
                          <div className="text-[10px] font-medium text-slate-400 flex items-center justify-end space-x-1">
                            <Clock className="w-3 h-3 text-amber-500" />
                            <span>~{estSkillHours} hrs effort</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Level Comparison Bar */}
                    <div className="mt-3.5 grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <div>
                        <span className="text-slate-400 font-bold block text-[10px] uppercase">Current Proficiency ({gap.current_level}/5)</span>
                        <span className="text-slate-700 font-semibold">{gap.level_description_current}</span>
                      </div>
                      <div className="border-l border-slate-200 pl-3">
                        <span className="text-blue-600 font-bold block text-[10px] uppercase">Required Target ({gap.required_level}/5)</span>
                        <span className="text-blue-900 font-semibold">{gap.level_description_target}</span>
                      </div>
                    </div>

                    {/* Prerequisites Dependency Chain Graph */}
                    {gap.prerequisites && gap.prerequisites.length > 0 && (
                      <div className="mt-2.5 p-2.5 rounded-xl bg-slate-100/70 border border-slate-200 text-[11px] text-slate-600 space-y-1">
                        <span className="font-bold text-slate-700 text-[10px] uppercase tracking-wider block">Dependency Chain & Prerequisites:</span>
                        <div className="flex items-center flex-wrap gap-1.5">
                          {gap.prerequisites.map((p, pIdx) => (
                            <React.Fragment key={p.skill_id || pIdx}>
                              <span className={`px-2 py-0.5 rounded text-xs font-semibold border flex items-center space-x-1 ${p.current_level >= (p.required_level || 2)
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-amber-50 text-amber-800 border-amber-200'
                                }`}>
                                <span>{p.name}</span>
                                <span className="text-[10px] opacity-75">(Lvl {p.current_level})</span>
                              </span>
                              <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                            </React.Fragment>
                          ))}
                          <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-900 border border-blue-300">
                            {gap.skill_name} (Target)
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Multi-Modal Action Hub & Manager Request */}
                    {!isMet && (
                      <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 print:hidden">
                        <div className="flex items-center space-x-2">
                          <span className="text-[11px] text-slate-500 font-medium">Accelerate Growth:</span>
                          <button
                            onClick={() => handleRequestEndorsement(gap)}
                            disabled={isRequested}
                            className={`text-[11px] font-semibold underline transition ${isRequested ? 'text-emerald-600 cursor-default' : 'text-slate-500 hover:text-blue-600'
                              }`}
                          >
                            {isRequested ? '✓ Manager Review Requested' : '+ Request Endorsement'}
                          </button>
                        </div>

                        <div className="flex items-center flex-wrap gap-1.5 w-full sm:w-auto justify-end">
                          {/* Take Quiz Action */}
                          {onStartQuiz && (
                            <button
                              onClick={() => onStartQuiz(gap.skill_id, gap.skill_name)}
                              className="px-2.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold flex items-center space-x-1 transition"
                              title="Take 5-min Adaptive Knowledge Assessment"
                            >
                              <BookOpen className="w-3.5 h-3.5 text-purple-600" />
                              <span>Quiz</span>
                            </button>
                          )}

                          {/* Code Playground Action */}
                          {onOpenPlayground && (
                            <button
                              onClick={() => onOpenPlayground(gap.skill_name)}
                              className="px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold flex items-center space-x-1 transition"
                              title="Practice in Interactive Code Playground"
                            >
                              <Code className="w-3.5 h-3.5 text-indigo-600" />
                              <span>Playground</span>
                            </button>
                          )}

                          {/* Book Mentor Action */}
                          {onOpenMentorship && (
                            <button
                              onClick={() => onOpenMentorship()}
                              className="px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold flex items-center space-x-1 transition"
                              title="Schedule Peer Mentorship Session"
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                              <span>Mentor</span>
                            </button>
                          )}

                          {/* Verify via Real Project Action */}
                          {onOpenProjectChallenge && (
                            <button
                              onClick={() => onOpenProjectChallenge({
                                id: gap.skill_id,
                                name: gap.skill_name,
                                currentLevel: gap.current_level,
                                targetLevel: gap.required_level
                              })}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-2xs transition active:scale-95"
                            >
                              <span> Verify Project</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
