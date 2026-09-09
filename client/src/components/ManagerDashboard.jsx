import React, { useState, useEffect, useMemo } from 'react';
import {
  Users, AlertTriangle, ShieldCheck, TrendingUp, Download, Building, Search, ArrowUpRight,
  FileText, Sparkles, ChevronDown, ChevronUp, Filter, SortAsc, X, Zap, Target, UserCheck,
  BookOpen, ArrowRight, Eye
} from 'lucide-react';
import { fetchManagerHeatmap, fetchManagerAISuggestions, DEFAULT_MANAGER_HEATMAP } from '../services/api';
import PromotionPitchModal from './PromotionPitchModal';

// Skill name mapping for display
const SKILL_LABELS = {
  sql_mastery: 'SQL',
  python_analytics: 'Python',
  tableau_bi: 'Tableau',
  stat_modeling: 'Stats/ML',
  react_frontend: 'React',
  node_express: 'Node.js',
  system_design: 'Sys Design',
  docker_k8s: 'Docker/K8s',
  cicd_terraform: 'CI/CD',
  llm_engineering: 'LLM/RAG',
  product_discovery: 'Product',
  ai_product_strategy: 'AI Strategy'
};

export default function ManagerDashboard() {
  const [heatmapData, setHeatmapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMemberForMemo, setSelectedMemberForMemo] = useState(null);
  const [expandedMember, setExpandedMember] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('readiness_desc');
  const [filterTier, setFilterTier] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [aiSuggestionsLoading, setAiSuggestionsLoading] = useState(false);
  const [showCohortModal, setShowCohortModal] = useState(null);
  const [animateReady, setAnimateReady] = useState(false);

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

  // Trigger bar animations after data loads
  useEffect(() => {
    if (!loading && heatmapData) {
      const t = setTimeout(() => setAnimateReady(true), 100);
      return () => clearTimeout(t);
    }
  }, [loading, heatmapData]);

  // Fetch AI suggestions once data is loaded
  useEffect(() => {
    if (!heatmapData) return;
    const safeData = heatmapData || DEFAULT_MANAGER_HEATMAP;
    const team = safeData.team_heatmap || [];
    const gaps = safeData.summary?.critical_org_gaps || [];

    setAiSuggestionsLoading(true);
    fetchManagerAISuggestions(team, gaps)
      .then(suggestions => {
        if (suggestions && suggestions.length > 0) {
          setAiSuggestions(suggestions);
        } else {
          // Use fallback suggestions
          setAiSuggestions(generateLocalSuggestions(team, gaps));
        }
      })
      .catch(() => {
        setAiSuggestions(generateLocalSuggestions(team, gaps));
      })
      .finally(() => setAiSuggestionsLoading(false));
  }, [heatmapData]);

  const safeData = heatmapData || DEFAULT_MANAGER_HEATMAP;
  const team_heatmap = Array.isArray(safeData.team_heatmap) && safeData.team_heatmap.length > 0
    ? safeData.team_heatmap
    : DEFAULT_MANAGER_HEATMAP.team_heatmap;
  const summary = safeData.summary || DEFAULT_MANAGER_HEATMAP.summary;
  const criticalGaps = Array.isArray(summary.critical_org_gaps)
    ? summary.critical_org_gaps
    : DEFAULT_MANAGER_HEATMAP.summary.critical_org_gaps;

  // Collect all unique skills across team for heatmap grid
  const allSkillIds = useMemo(() => {
    const skillSet = new Set();
    team_heatmap.forEach(m => {
      Object.keys(m.skills || {}).forEach(s => skillSet.add(s));
    });
    return Array.from(skillSet);
  }, [team_heatmap]);

  // Filtered + sorted team members
  const filteredTeam = useMemo(() => {
    let result = [...team_heatmap];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(m =>
        (m.name || '').toLowerCase().includes(q) ||
        (m.current_role || '').toLowerCase().includes(q) ||
        (m.target_role_title || '').toLowerCase().includes(q)
      );
    }

    // Tier filter
    if (filterTier === 'at_risk') result = result.filter(m => (m.readiness_percent || 0) < 55);
    else if (filterTier === 'developing') result = result.filter(m => (m.readiness_percent || 0) >= 55 && (m.readiness_percent || 0) < 75);
    else if (filterTier === 'ready') result = result.filter(m => (m.readiness_percent || 0) >= 75);

    // Sort
    if (sortBy === 'readiness_desc') result.sort((a, b) => (b.readiness_percent || 0) - (a.readiness_percent || 0));
    else if (sortBy === 'readiness_asc') result.sort((a, b) => (a.readiness_percent || 0) - (b.readiness_percent || 0));
    else if (sortBy === 'name') result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    return result;
  }, [team_heatmap, searchQuery, sortBy, filterTier]);

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500 bg-white border border-slate-200 shadow-sm rounded-2xl">
        <div className="animate-spin w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full mx-auto mb-3"></div>
        <p className="font-semibold text-slate-700">Loading Enterprise Team Skill Heatmap...</p>
      </div>
    );
  }

  const getRiskBadge = (readiness) => {
    if (readiness >= 75) return { label: 'Ready', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' };
    if (readiness >= 55) return { label: 'Developing', color: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' };
    return { label: 'At Risk', color: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500' };
  };

  const getHeatmapCellColor = (level) => {
    if (level === undefined || level === null) return 'bg-slate-50 text-slate-300 border-slate-100';
    if (level >= 4) return 'bg-emerald-100 text-emerald-800 border-emerald-300 font-black';
    if (level === 3) return 'bg-blue-100 text-blue-800 border-blue-300 font-bold';
    if (level === 2) return 'bg-amber-100 text-amber-800 border-amber-300 font-semibold';
    return 'bg-rose-100 text-rose-800 border-rose-300 font-semibold';
  };

  const getSuggestionIcon = (icon) => {
    switch (icon) {
      case 'promotion': return <ArrowUpRight className="w-4 h-4 text-emerald-600" />;
      case 'risk': return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      case 'cohort': return <Users className="w-4 h-4 text-blue-600" />;
      case 'upskill': return <TrendingUp className="w-4 h-4 text-amber-600" />;
      default: return <Sparkles className="w-4 h-4 text-indigo-600" />;
    }
  };

  const getSuggestionBg = (icon) => {
    switch (icon) {
      case 'promotion': return 'card-mint';
      case 'risk': return 'card-rose';
      case 'cohort': return 'card-sky';
      case 'upskill': return 'card-amber';
      default: return 'card-sky';
    }
  };

  const getPriorityBadge = (icon, priority) => {
    switch (icon) {
      case 'promotion': return 'pill-badge-mint';
      case 'risk': return 'pill-badge-rose';
      case 'cohort': return 'pill-badge-sky';
      case 'upskill': return 'pill-badge-amber';
      default: return 'pill-badge-sky';
    }
  };

  const handleExportReport = () => {
    const date = new Date().toISOString().split('T')[0];
    const lines = [];

    // Header
    lines.push('PATHCRAFT AI — TEAM SKILL HEATMAP REPORT');
    lines.push(`Generated: ${new Date().toLocaleString()}`);
    lines.push(`Total Team Members: ${team_heatmap.length}`);
    lines.push(`Avg Mobility Readiness: ${summary.avg_readiness || 66}%`);
    lines.push(`Critical Org Gaps: ${criticalGaps.length}`);
    lines.push('');

    // Team Capability Matrix CSV
    lines.push('--- TEAM CAPABILITY MATRIX ---');
    const skillCols = allSkillIds.map(s => SKILL_LABELS[s] || s.replace(/_/g, ' '));
    lines.push(['Name', 'Current Role', 'Target Role', 'Readiness %', 'Risk Tier', ...skillCols].join(','));

    team_heatmap.forEach(member => {
      const name = member.name || member.employee_name;
      const risk = (member.readiness_percent || 0) >= 75 ? 'Ready' : (member.readiness_percent || 0) >= 55 ? 'Developing' : 'At Risk';
      const skillValues = allSkillIds.map(s => (member.skills || {})[s] !== undefined ? `L${(member.skills || {})[s]}` : 'N/A');
      lines.push([
        `"${name}"`,
        `"${member.current_role}"`,
        `"${member.target_role_title || member.target_role}"`,
        member.readiness_percent,
        risk,
        ...skillValues
      ].join(','));
    });

    lines.push('');

    // Critical Org Gaps
    lines.push('--- CRITICAL ORG SKILL GAPS ---');
    lines.push(['Skill', 'Missing Count', 'Severity', 'Affected Members'].join(','));
    criticalGaps.forEach(gap => {
      lines.push([
        `"${gap.skill_name}"`,
        gap.missing_count,
        gap.severity,
        `"${(gap.affected_members || []).join('; ')}"`
      ].join(','));
    });

    lines.push('');

    // AI Suggestions
    if (aiSuggestions.length > 0) {
      lines.push('--- AI-POWERED SUGGESTIONS ---');
      lines.push(['Priority', 'Title', 'Description', 'Members'].join(','));
      aiSuggestions.forEach(s => {
        lines.push([
          s.priority,
          `"${s.title}"`,
          `"${s.description}"`,
          `"${(s.members || []).join('; ')}"`
        ].join(','));
      });
    }

    // Download
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `PathCraft_Team_Heatmap_Report_${date}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
            <button
              onClick={handleExportReport}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 flex items-center space-x-2 shadow-xs transition"
            >
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
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-1000 ease-out"
                  style={{ width: animateReady ? `${summary.avg_readiness || 66}%` : '0%' }}
                />
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Critical Org Skill Gaps</div>
            <div className="text-2xl font-black text-rose-600 font-outfit mt-1">{criticalGaps.length} Gaps</div>
            <div className="text-[11px] text-rose-700 font-semibold mt-1">High priority for upskilling</div>
          </div>
        </div>

      </div>

      {/* AI-Powered Suggestions Panel */}
      <div className="bg-gradient-to-br from-indigo-50/80 via-white to-violet-50/50 rounded-2xl p-5 sm:p-6 border border-indigo-200/80 shadow-sm relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-indigo-400/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex items-center justify-between mb-4 relative z-10">
          <h2 className="text-base font-bold text-slate-900 font-outfit flex items-center space-x-2">

            <span>AI-Powered Team Insights</span>
          </h2>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center gap-1">

            AI
          </span>
        </div>

        {aiSuggestionsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="p-4 rounded-xl bg-white/60 border border-slate-200 animate-pulse">
                <div className="h-3 bg-slate-200 rounded w-2/3 mb-3"></div>
                <div className="h-2 bg-slate-100 rounded w-full mb-2"></div>
                <div className="h-2 bg-slate-100 rounded w-4/5"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {aiSuggestions.map((suggestion, idx) => (
              <div
                key={idx}
                className={`p-4 transition-all duration-200 hover:shadow-sm cursor-default ${getSuggestionBg(suggestion.icon)}`}
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="icon-chip">
                    {getSuggestionIcon(suggestion.icon)}
                  </div>
                  <span className={getPriorityBadge(suggestion.icon, suggestion.priority)}>
                    {suggestion.priority}
                  </span>
                </div>
                <div className="font-bold text-sm text-slate-900 mb-1.5 leading-snug">{suggestion.title}</div>
                <p className="text-xs text-slate-600 leading-relaxed">{suggestion.description}</p>
                {suggestion.members && suggestion.members.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {suggestion.members.slice(0, 3).map((name, i) => (
                      <span key={i} className="pill-tag-white">
                        {name.split(' ')[0]}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Visual Heatmap Grid */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900 font-outfit flex items-center space-x-2">
            <Eye className="w-4 h-4 text-indigo-600" />
            <span>Skill Competency Heatmap</span>
          </h2>
          <div className="flex items-center space-x-3 text-[10px] font-semibold text-slate-500">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-rose-100 border border-rose-300"></span> L1</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-100 border border-amber-300"></span> L2</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-100 border border-blue-300"></span> L3</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300"></span> L4+</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-slate-50 border border-slate-100"></span> N/A</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="py-2.5 px-3 text-slate-500 font-bold uppercase tracking-wider text-[10px] rounded-l-lg sticky left-0 bg-slate-50/80 z-10">Team Member</th>
                {allSkillIds.map(skillId => (
                  <th key={skillId} className="py-2.5 px-2 text-center text-slate-500 font-bold uppercase tracking-wider text-[9px] min-w-[60px]">
                    {SKILL_LABELS[skillId] || skillId.replace(/_/g, ' ').substring(0, 8)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {team_heatmap.map((member, idx) => {
                const name = member.name || member.employee_name || `Employee ${idx + 1}`;
                return (
                  <tr key={member.id || idx} className="hover:bg-blue-50/20 transition">
                    <td className="py-2.5 px-3 sticky left-0 bg-white z-10">
                      <div className="flex items-center space-x-2">
                        <img
                          src={member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D8ABC&color=fff`}
                          alt={name}
                          className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-200"
                        />
                        <span className="font-bold text-slate-800 text-[11px] whitespace-nowrap">{name}</span>
                      </div>
                    </td>
                    {allSkillIds.map(skillId => {
                      const level = (member.skills || {})[skillId];
                      return (
                        <td key={skillId} className="py-2.5 px-2 text-center">
                          <div className="group relative">
                            <span className={`inline-flex items-center justify-center w-8 h-7 rounded-md border text-[10px] transition-transform hover:scale-110 ${getHeatmapCellColor(level)}`}>
                              {level !== undefined ? `L${level}` : '—'}
                            </span>
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-20 pointer-events-none">
                              <div className="bg-slate-900 text-white text-[10px] rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                                <div className="font-bold">{SKILL_LABELS[skillId] || skillId.replace(/_/g, ' ')}</div>
                                <div className="text-slate-300 mt-0.5">
                                  {level !== undefined ? `Current: Level ${level}/5` : 'Not assessed'}
                                  {level !== undefined && level < 3 && <span className="text-rose-400 ml-1">• Needs +{3 - level} levels</span>}
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Main Grid: Team Table + Critical Org Warnings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left: Team Matrix Table with Filters (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">

          {/* Search + Filter Bar */}
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-bold text-slate-900 font-outfit flex items-center space-x-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span>Direct Report Capability Matrix</span>
            </h2>
            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search team..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-300 w-36 transition"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2">
                    <X className="w-3 h-3 text-slate-400 hover:text-slate-600" />
                  </button>
                )}
              </div>
              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-1.5 rounded-lg border text-xs transition ${showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}
              >
                <Filter className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Filter Controls */}
          {showFilters && (
            <div className="flex items-center gap-2 flex-wrap animate-fadeIn">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Tier:</span>
              {[
                { value: 'all', label: 'All' },
                { value: 'ready', label: 'Ready' },
                { value: 'developing', label: 'Developing' },
                { value: 'at_risk', label: 'At Risk' }
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setFilterTier(opt.value)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition ${filterTier === opt.value
                      ? 'bg-blue-50 border-blue-300 text-blue-700'
                      : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                >
                  {opt.label}
                </button>
              ))}
              <span className="text-[10px] font-bold text-slate-400 uppercase ml-3">Sort:</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="px-2 py-1 rounded-lg text-[11px] font-semibold border border-slate-200 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              >
                <option value="readiness_desc">Readiness ↓</option>
                <option value="readiness_asc">Readiness ↑</option>
                <option value="name">Name A-Z</option>
              </select>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3 px-3 rounded-l-lg">Team Member</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Current Role</th>
                  <th className="py-3 px-3">Target Role</th>
                  <th className="py-3 px-3">Readiness</th>
                  <th className="py-3 px-3 rounded-r-lg text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTeam.map((member, idx) => {
                  const name = member.name || member.employee_name || `Employee ${idx + 1}`;
                  const targetRole = member.target_role_title || member.target_role || 'Target Role';
                  const email = member.email || `${name.toLowerCase().replace(/\s+/g, '.')}@enterprise.com`;
                  const avatar = member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D8ABC&color=fff`;
                  const risk = getRiskBadge(member.readiness_percent);
                  const isExpanded = expandedMember === (member.id || idx);

                  return (
                    <React.Fragment key={member.id || member._id || idx}>
                      <tr
                        className={`transition cursor-pointer ${isExpanded ? 'bg-blue-50/40' : 'hover:bg-blue-50/30'}`}
                        onClick={() => setExpandedMember(isExpanded ? null : (member.id || idx))}
                      >
                        <td className="py-3 px-3">
                          <div className="flex items-center space-x-2.5">
                            <img src={avatar} alt={name} className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200" />
                            <div>
                              <div className="font-bold text-slate-900">{name}</div>
                              <div className="text-[10px] text-slate-400">{email}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${risk.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${risk.dot}`}></span>
                            {risk.label}
                          </span>
                        </td>

                        <td className="py-3 px-3 font-semibold text-slate-700">
                          {member.current_role}
                        </td>

                        <td className="py-3 px-3 text-blue-700 font-bold">
                          {targetRole}
                        </td>

                        <td className="py-3 px-3">
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                              <div
                                className="h-full rounded-full transition-all duration-1000 ease-out"
                                style={{
                                  width: animateReady ? `${member.readiness_percent}%` : '0%',
                                  background: member.readiness_percent >= 75 ? 'linear-gradient(90deg, #10b981, #059669)'
                                    : member.readiness_percent >= 55 ? 'linear-gradient(90deg, #f59e0b, #d97706)'
                                      : 'linear-gradient(90deg, #f43f5e, #e11d48)'
                                }}
                              ></div>
                            </div>
                            <span className="font-black text-slate-900">{member.readiness_percent}%</span>
                          </div>
                        </td>

                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={(e) => { e.stopPropagation(); setSelectedMemberForMemo({ ...member, name, target_role_title: targetRole, email, avatar }); }}
                              className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[11px] font-bold transition shadow-2xs flex items-center space-x-1"
                              title="Generate Promotion & ROI Justification Memo with Gemini AI"
                            >
                              <FileText className="w-3 h-3 text-blue-600" />
                              <span>Pitch</span>
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); setExpandedMember(isExpanded ? null : (member.id || idx)); }}
                              className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 transition"
                            >
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Detail Row */}
                      {isExpanded && (
                        <tr className="bg-blue-50/20">
                          <td colSpan={6} className="px-3 py-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fadeIn">
                              {/* Full Skill Breakdown */}
                              <div className="space-y-2">
                                <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                                  <BookOpen className="w-3 h-3 text-blue-600" />
                                  Full Skill Breakdown
                                </div>
                                {Object.entries(member.skills || {}).map(([skId, lvl]) => (
                                  <div key={skId} className="flex items-center gap-2">
                                    <span className="text-[10px] font-semibold text-slate-600 w-20 truncate">{SKILL_LABELS[skId] || skId.replace(/_/g, ' ')}</span>
                                    <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                      <div
                                        className="h-full rounded-full transition-all duration-700"
                                        style={{
                                          width: `${(lvl / 5) * 100}%`,
                                          background: lvl >= 4 ? '#10b981' : lvl === 3 ? '#3b82f6' : lvl === 2 ? '#f59e0b' : '#f43f5e'
                                        }}
                                      />
                                    </div>
                                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded border ${getHeatmapCellColor(lvl)}`}>L{lvl}</span>
                                  </div>
                                ))}
                              </div>
                              {/* Recommendations */}
                              <div className="space-y-2">
                                <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                                  <Target className="w-3 h-3 text-indigo-600" />
                                  Recommended Actions
                                </div>
                                <div className="space-y-2">
                                  {Object.entries(member.skills || {}).filter(([, lvl]) => lvl <= 2).slice(0, 3).map(([skId, lvl]) => (
                                    <div key={skId} className="p-2.5 rounded-lg bg-white border border-slate-200 text-[11px]">
                                      <span className="font-bold text-slate-800">{SKILL_LABELS[skId] || skId.replace(/_/g, ' ')}</span>
                                      <span className="text-slate-500 ml-1">— Needs +{3 - lvl} levels to reach competency. Assign targeted modules.</span>
                                    </div>
                                  ))}
                                  {Object.values(member.skills || {}).every(lvl => lvl >= 3) && (
                                    <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-700 font-semibold">
                                      ✅ All skills at competency level or above. Ready for promotion track.
                                    </div>
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-400 font-medium mt-1">
                                  Est. time to readiness: ~{Math.max(2, Math.round((100 - member.readiness_percent) / 8))} weeks at current pace
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
                {filteredTeam.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 text-sm">
                      No team members match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Critical Org Gaps + Cohort Builder (4 cols) */}
        <div className="lg:col-span-4 space-y-4">

          {/* Critical Org Gaps */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
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
                <div
                  key={i}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition cursor-pointer"
                  onClick={() => setShowCohortModal(showCohortModal === i ? null : i)}
                >
                  <div className="flex items-start justify-between">
                    <div className="font-bold text-slate-900 text-xs">{gap.skill_name}</div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${gap.severity === 'High'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}>
                      {gap.severity}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                    <span>{gap.missing_count} team members missing competency</span>
                    <span className="text-blue-600 font-bold flex items-center gap-0.5">
                      <Users className="w-3 h-3" />
                      View Cohort
                    </span>
                  </div>

                  {/* Cohort Expansion */}
                  {showCohortModal === i && (
                    <div className="mt-3 pt-3 border-t border-slate-200 animate-fadeIn">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Suggested Training Cohort</div>
                      <div className="space-y-1.5">
                        {(gap.affected_members || []).map((memberName, j) => {
                          const memberData = team_heatmap.find(m => m.name === memberName);
                          return (
                            <div key={j} className="flex items-center justify-between bg-white rounded-lg p-2 border border-slate-100">
                              <div className="flex items-center gap-2">
                                {memberData && (
                                  <img src={memberData.avatar} alt={memberName} className="w-5 h-5 rounded-full" />
                                )}
                                <span className="text-[11px] font-semibold text-slate-800">{memberName}</span>
                              </div>
                              <span className="text-[9px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                                L{memberData?.skills?.[gap.skill_id] || 0}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      <button className="mt-2 w-full py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-bold flex items-center justify-center gap-1 hover:from-blue-700 hover:to-indigo-700 transition">
                        <ArrowRight className="w-3 h-3" />
                        Launch Cohort Roadmap
                      </button>
                    </div>
                  )}
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

          {/* Team Readiness Distribution */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold text-slate-900 font-outfit flex items-center gap-2 mb-3">
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              Readiness Distribution
            </h3>
            <div className="space-y-2">
              {[
                { label: 'Ready (≥75%)', count: team_heatmap.filter(m => m.readiness_percent >= 75).length, color: 'bg-emerald-500', total: team_heatmap.length },
                { label: 'Developing (55-74%)', count: team_heatmap.filter(m => m.readiness_percent >= 55 && m.readiness_percent < 75).length, color: 'bg-amber-500', total: team_heatmap.length },
                { label: 'At Risk (<55%)', count: team_heatmap.filter(m => m.readiness_percent < 55).length, color: 'bg-rose-500', total: team_heatmap.length }
              ].map((tier, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold text-slate-600 w-28">{tier.label}</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`${tier.color} h-full rounded-full transition-all duration-1000 ease-out`}
                      style={{ width: animateReady ? `${(tier.count / tier.total) * 100}%` : '0%' }}
                    />
                  </div>
                  <span className="text-[11px] font-black text-slate-800 w-6 text-right">{tier.count}</span>
                </div>
              ))}
            </div>
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

// Local fallback for AI suggestions when backend is unavailable
function generateLocalSuggestions(team, gaps) {
  const suggestions = [];
  const sorted = [...team].sort((a, b) => (b.readiness_percent || 0) - (a.readiness_percent || 0));
  const topReady = sorted[0];
  const atRisk = sorted.filter(m => (m.readiness_percent || 0) < 55);
  const developing = sorted.filter(m => (m.readiness_percent || 0) >= 55 && (m.readiness_percent || 0) < 75);

  if (topReady) {
    suggestions.push({
      icon: 'promotion',
      title: `Fast-track ${topReady.name} for Promotion`,
      description: `${topReady.name} is at ${topReady.readiness_percent}% readiness for ${topReady.target_role_title || topReady.target_role}. Initiate internal mobility review this quarter.`,
      priority: 'high',
      members: [topReady.name]
    });
  }

  if (atRisk.length > 0) {
    suggestions.push({
      icon: 'risk',
      title: `Address At-Risk Team Members`,
      description: `${atRisk.map(m => m.name).join(' and ')} ${atRisk.length === 1 ? 'is' : 'are'} below 55% readiness. Assign dedicated mentorship to prevent attrition.`,
      priority: 'high',
      members: atRisk.map(m => m.name)
    });
  }

  if (gaps && gaps.length > 0) {
    suggestions.push({
      icon: 'cohort',
      title: `Launch ${gaps[0].skill_name.split(' ')[0]} Training Cohort`,
      description: `${gaps[0].missing_count} team members lack competency in ${gaps[0].skill_name}. Create a shared learning cohort to close this gap.`,
      priority: 'high',
      members: gaps[0].affected_members || []
    });
  }

  if (developing.length > 0) {
    suggestions.push({
      icon: 'upskill',
      title: `Accelerate Developing Talent`,
      description: `${developing.map(m => m.name).join(', ')} ${developing.length === 1 ? 'is' : 'are'} in the 55-75% readiness zone. Assign stretch assignments and peer mentorship.`,
      priority: 'medium',
      members: developing.map(m => m.name)
    });
  }

  while (suggestions.length < 4) {
    suggestions.push({
      icon: 'upskill',
      title: 'Schedule Quarterly Skill Review',
      description: 'Run a team-wide capability assessment to realign learning roadmaps with evolving business priorities.',
      priority: 'low',
      members: team.map(m => m.name)
    });
  }

  return suggestions.slice(0, 4);
}
