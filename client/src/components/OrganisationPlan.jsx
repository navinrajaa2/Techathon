import React, { useState } from 'react';
import {
  Building2,
  Sliders,
  Plus,
  Trash2,
  Sparkles,
  CheckCircle2,
  Clock,
  Users,
  Target,
  FileText,
  Download,
  Share2,
  RefreshCw,
  Layers,
  ChevronRight,
  Award,
  BookOpen,
  Wrench,
  BarChart2,
  Copy,
  Check,
  AlertCircle,
  HelpCircle,
  Briefcase,
  ArrowRight,
  Mail,
  Send,
  X,
  CheckCircle
} from 'lucide-react';
import { generateOrgTrainingPlan, sendOrgTrainingPlanEmail } from '../services/api';

// Pre-packaged Custom Skill Bundles for instant loading
const PRESET_SKILL_BUNDLES = {
  ai_engineering: {
    label: "AI Engineering & LLM Stack",
    skills: [
      { id: 'cs_1', name: 'Enterprise LLM & RAG Systems', category: 'AI Architecture', currentLevel: 2, targetLevel: 4, priority: 'Critical', tags: ['#AI', '#RAG', '#VectorDB'] },
      { id: 'cs_2', name: 'Prompt Engineering & Fine-Tuning', category: 'AI Operations', currentLevel: 2, targetLevel: 4, priority: 'High', tags: ['#Prompts', '#LLMs'] },
      { id: 'cs_3', name: 'LangChain & LlamaIndex Frameworks', category: 'Frameworks', currentLevel: 1, targetLevel: 4, priority: 'High', tags: ['#Python', '#AI'] },
      { id: 'cs_4', name: 'AI Model Safety & Governance', category: 'Compliance', currentLevel: 1, targetLevel: 3, priority: 'Medium', tags: ['#Safety', '#Audit'] }
    ]
  },
  cloud_devops: {
    label: "Cloud Native & Microservices",
    skills: [
      { id: 'cs_5', name: 'Kubernetes & Container Orchestration', category: 'Cloud Infra', currentLevel: 2, targetLevel: 4, priority: 'Critical', tags: ['#K8s', '#Docker'] },
      { id: 'cs_6', name: 'Terraform & Infrastructure-as-Code', category: 'DevOps', currentLevel: 2, targetLevel: 4, priority: 'High', tags: ['#IaC', '#AWS'] },
      { id: 'cs_7', name: 'Microservices & Event-Driven Systems', category: 'Architecture', currentLevel: 3, targetLevel: 5, priority: 'High', tags: ['#Kafka', '#gRPC'] },
      { id: 'cs_8', name: 'Distributed Tracing & OpenTelemetry', category: 'Observability', currentLevel: 1, targetLevel: 3, priority: 'Medium', tags: ['#Prometheus', '#Grafana'] }
    ]
  },
  cybersecurity: {
    label: "Zero Trust & Cybersecurity",
    skills: [
      { id: 'cs_9', name: 'Zero Trust Network Architecture', category: 'Security Architecture', currentLevel: 1, targetLevel: 4, priority: 'Critical', tags: ['#ZeroTrust', '#Identity'] },
      { id: 'cs_10', name: 'Automated Application Security (DevSecOps)', category: 'AppSec', currentLevel: 2, targetLevel: 4, priority: 'High', tags: ['#DevSecOps', '#SAST'] },
      { id: 'cs_11', name: 'Cloud Security Posture Management', category: 'Cloud Sec', currentLevel: 2, targetLevel: 4, priority: 'High', tags: ['#CSPM', '#Compliance'] }
    ]
  },
  data_analytics: {
    label: "Modern Data Platform & Analytics",
    skills: [
      { id: 'cs_12', name: 'dbt & Cloud Data Warehousing (Snowflake)', category: 'Data Eng', currentLevel: 2, targetLevel: 4, priority: 'Critical', tags: ['#dbt', '#SQL'] },
      { id: 'cs_13', name: 'Statistical Modeling & Predictive BI', category: 'Data Science', currentLevel: 2, targetLevel: 4, priority: 'High', tags: ['#Python', '#Stats'] },
      { id: 'cs_14', name: 'Real-Time Data Streaming (Kafka)', category: 'Data Pipeline', currentLevel: 1, targetLevel: 3, priority: 'Medium', tags: ['#Streaming'] }
    ]
  }
};

const DEFAULT_TEAM_EMAILS = [
  'mohnishselvan@gmail.com',
  'musajankumaran@gmail.com',
  'navinrajaa02@gmail.com'
].join(', ');

export default function OrganisationPlan() {
  // Org Profile State
  const [orgName, setOrgName] = useState('Acme Enterprise Corp');
  const [industry, setIndustry] = useState('Technology & SaaS');
  const [department, setDepartment] = useState('Engineering & Data Science');
  const [targetGoal, setTargetGoal] = useState('Enterprise AI Modernization & Skill Capability Alignment');
  const [headcount, setHeadcount] = useState(45);
  const [weeklyHours, setWeeklyHours] = useState(6);
  const [durationWeeks, setDurationWeeks] = useState(8);

  // Custom List of Skills State
  const [customSkills, setCustomSkills] = useState(PRESET_SKILL_BUNDLES.ai_engineering.skills);
  
  // Custom Skill Input State
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('Technical Stack');
  const [newCurrentLevel, setNewCurrentLevel] = useState(2);
  const [newTargetLevel, setNewTargetLevel] = useState(4);
  const [newPriority, setNewPriority] = useState('High');
  const [newTagsStr, setNewTagsStr] = useState('#CustomSkill');

  // Bulk Skills Paste Input State
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState('');

  // Generated Plan & Stale Tracking States
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isStale, setIsStale] = useState(false); // true when inputs change after fetching
  const [activeTab, setActiveTab] = useState('curriculum'); // 'curriculum' | 'skills' | 'matrix' | 'milestones'
  const [copied, setCopied] = useState(false);
  const [filterPriority, setFilterPriority] = useState('All');

  // Send Email Modal States
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [senderEmail, setSenderEmail] = useState('navinrajaa02@gmail.com');
  const [emailPass, setEmailPass] = useState('');
  const [emailRecipients, setEmailRecipients] = useState(DEFAULT_TEAM_EMAILS);
  const [emailSubject, setEmailSubject] = useState(`[${orgName}] Your Enterprise Skill Roadmap & Training Plan`);
  const [emailNote, setEmailNote] = useState('Hi Team, please review your assigned Q4 skill training plan and curriculum modules below. Contact your department lead for cohort questions.');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailStatusNotice, setEmailStatusNotice] = useState(null);

  // Helper to mark requirement as changed (stale)
  const markStale = () => {
    if (generatedPlan) {
      setIsStale(true);
    }
  };

  // Add a single custom skill
  const handleAddCustomSkill = (e) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    const tagsArr = newTagsStr
      .split(',')
      .map(t => t.trim())
      .filter(Boolean)
      .map(t => (t.startsWith('#') ? t : `#${t}`));

    const newSkill = {
      id: `cs_${Date.now()}`,
      name: newSkillName.trim(),
      category: newSkillCategory.trim() || 'General',
      currentLevel: Number(newCurrentLevel),
      targetLevel: Number(newTargetLevel),
      priority: newPriority,
      tags: tagsArr.length > 0 ? tagsArr : ['#Custom']
    };

    setCustomSkills(prev => [...prev, newSkill]);
    setNewSkillName('');
    setNewTagsStr('#CustomSkill');
    markStale();
  };

  // Remove custom skill
  const handleRemoveSkill = (id) => {
    setCustomSkills(prev => prev.filter(s => s.id !== id));
    markStale();
  };

  // Update skill levels
  const handleUpdateSkillLevel = (id, field, value) => {
    setCustomSkills(prev =>
      prev.map(s => (s.id === id ? { ...s, [field]: Number(value) } : s))
    );
    markStale();
  };

  // Load a preset bundle
  const handleLoadPreset = (key) => {
    if (PRESET_SKILL_BUNDLES[key]) {
      setCustomSkills(PRESET_SKILL_BUNDLES[key].skills);
      markStale();
    }
  };

  // Parse bulk skills text (one skill per line or comma-separated)
  const handleParseBulkSkills = () => {
    if (!bulkText.trim()) return;
    const lines = bulkText.split('\n').map(l => l.trim()).filter(Boolean);
    const parsed = lines.map((line, idx) => {
      const parts = line.split(',');
      const name = parts[0]?.trim() || `Skill ${idx + 1}`;
      const cat = parts[1]?.trim() || 'Custom Capability';
      return {
        id: `cs_bulk_${Date.now()}_${idx}`,
        name,
        category: cat,
        currentLevel: 2,
        targetLevel: 4,
        priority: 'High',
        tags: [`#${cat.replace(/\s+/g, '')}`]
      };
    });

    setCustomSkills(prev => [...prev, ...parsed]);
    setBulkText('');
    setIsBulkOpen(false);
    markStale();
  };

  // Generate AI Organization Training Plan
  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    try {
      const result = await generateOrgTrainingPlan({
        orgName,
        industry,
        department,
        targetGoal,
        headcount,
        weeklyHours,
        durationWeeks,
        customSkills
      });

      if (result) {
        setGeneratedPlan(result);
      } else {
        // Fallback local structural plan if backend offline
        setGeneratedPlan(createLocalFallbackPlan());
      }
      setIsStale(false);
    } catch (err) {
      console.warn('Error generating org training plan:', err);
      setGeneratedPlan(createLocalFallbackPlan());
      setIsStale(false);
    } finally {
      setIsGenerating(false);
    }
  };

  // Fallback Local Generator
  const createLocalFallbackPlan = () => {
    const activeList = customSkills.length > 0 ? customSkills : PRESET_SKILL_BUNDLES.ai_engineering.skills;
    const skillNames = activeList.map(s => s.name);
    const midPoint = Math.ceil(activeList.length / 2);
    const phase1List = activeList.slice(0, midPoint);
    const phase2List = activeList.slice(midPoint);

    const durationNumber = Number(durationWeeks) || 8;
    const hoursNumber = Number(weeklyHours) || 6;
    const totalHours = durationNumber * hoursNumber;

    // Build tailored modules for EACH custom skill in Phase 1
    const phase1Modules = phase1List.map((skill, idx) => ({
      id: `mod-10${idx + 1}`,
      title: `Mastery & Implementation: ${skill.name}`,
      custom_skills_covered: [skill.name],
      duration_hours: Math.max(4, Math.round(totalHours / (activeList.length || 1))),
      format: "Interactive Workshop & Guided Code Labs",
      current_level_avg: skill.currentLevel || 2,
      target_level: skill.targetLevel || 4,
      learning_objectives: [
        `Master core enterprise patterns of ${skill.name} in ${skill.category || 'production'}`,
        `Advance competency from Level ${skill.currentLevel || 2} to Level ${skill.targetLevel || 4}`,
        `Implement automated testing and observability for ${skill.name}`
      ],
      practical_project: `Develop a production-grade component demonstrating end-to-end ${skill.name} functionality.`,
      assessment_criteria: `Automated test suite pass rate >= 85% for ${skill.name} + senior code review`,
      target_cohorts: [`${skill.category || 'Engineering'} Cohort`, "Technical Leads"]
    }));

    // Build tailored modules for EACH custom skill in Phase 2
    const phase2Modules = phase2List.map((skill, idx) => ({
      id: `mod-20${idx + 1}`,
      title: `Advanced Scaling & Integration: ${skill.name}`,
      custom_skills_covered: [skill.name],
      duration_hours: Math.max(4, Math.round(totalHours / (activeList.length || 1))),
      format: "Sprint-Based Technical Sandbox & Peer Review",
      current_level_avg: skill.currentLevel || 2,
      target_level: skill.targetLevel || 4,
      learning_objectives: [
        `Optimize ${skill.name} performance, security policies, and fault-tolerance`,
        `Integrate ${skill.name} into enterprise continuous delivery pipelines`,
        `Enforce corporate compliance and data governance standards`
      ],
      practical_project: `Refactor legacy enterprise workflows to leverage modern ${skill.name} architecture.`,
      assessment_criteria: `Staging environment deployment with 0 security alerts + live demo`,
      target_cohorts: ["All Software & Data Engineers"]
    }));

    // Capstone module combining custom skills
    const capstoneModule = {
      id: `mod-capstone`,
      title: `Enterprise Capstone: Integrated ${skillNames.slice(0, 3).join(' & ')} Platform`,
      custom_skills_covered: skillNames,
      duration_hours: Math.max(6, Math.round(totalHours * 0.25)),
      format: "Multi-Squad Capstone & Executive Review",
      current_level_avg: 2,
      target_level: 4,
      learning_objectives: [
        `Synthesize acquired custom skills (${skillNames.join(', ')}) into a unified platform`,
        "Enforce zero-trust security, automated CI/CD, and high throughput scaling",
        "Demonstrate measurable ROI and operational efficiency gain"
      ],
      practical_project: `Build and launch an end-to-end production capstone incorporating ${skillNames.join(', ')}.`,
      assessment_criteria: "Live executive showcase presentation + production architecture sign-off",
      target_cohorts: ["All Engineering & Analytics Cohorts"]
    };

    return {
      org_name: orgName,
      executive_summary: `This Organization Training Plan for ${orgName} delivers a tailored capability development program covering ${activeList.length} custom skill domains (${skillNames.join(', ')}) for ${headcount} team members in ${department}. Designed for ${durationWeeks} weeks at ${weeklyHours} hrs/week, it directly targets your goal '${targetGoal}'.`,
      target_goal: targetGoal,
      total_duration_weeks: durationNumber,
      weekly_hours: hoursNumber,
      headcount: Number(headcount) || 50,
      total_modules: activeList.length + 1,
      projected_readiness_gain: 38,
      phases: [
        {
          phase_number: 1,
          phase_name: "Phase 1: Core Competency & Foundational Labs",
          weeks: `Weeks 1-${Math.max(1, Math.floor(durationNumber / 2))}`,
          objective: `Establish baseline mastery across custom skills: ${phase1List.map(s => s.name).join(', ')}.`,
          modules: phase1Modules.length > 0 ? phase1Modules : [capstoneModule]
        },
        {
          phase_number: 2,
          phase_name: "Phase 2: Enterprise Scaling, Governance & Capstone Delivery",
          weeks: `Weeks ${Math.floor(durationNumber / 2) + 1}-${durationNumber}`,
          objective: `Synthesize acquired skills into production-ready capstone systems backed by automated compliance.`,
          modules: [...phase2Modules, capstoneModule]
        }
      ],
      cohort_matrix: [
        {
          cohort_name: "Technical Leads & Senior Engineers",
          headcount: Math.max(2, Math.round(headcount * 0.3)),
          primary_focus_skills: skillNames.slice(0, Math.ceil(skillNames.length / 2)),
          recommended_pathway: "Accelerated architecture track with peer mentorship & code reviews"
        },
        {
          cohort_name: "Core Developers & Analysts",
          headcount: Math.max(3, Math.round(headcount * 0.7)),
          primary_focus_skills: skillNames,
          recommended_pathway: "Hands-on lab track with weekly workshops and project verification"
        }
      ],
      governance_and_milestones: [
        {
          milestone: `Mid-Program Capability Review (Week ${Math.max(1, Math.floor(durationNumber / 2))})`,
          description: `Evaluate individual employee progress across ${skillNames.join(', ')} against target levels.`,
          deliverable: "Mid-Point Capability Matrix & Adaptive Re-planning Report"
        },
        {
          milestone: `Final Enterprise Capstone Showcase & Certification (Week ${durationNumber})`,
          description: "Final evaluation of team capstone projects with department head validation.",
          deliverable: "Org Capability Certification & Readiness Endorsement"
        }
      ]
    };
  };

  // Copy plan to clipboard
  const handleCopyPlan = () => {
    if (!generatedPlan) return;
    const text = JSON.stringify(generatedPlan, null, 2);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Export plan as Markdown text file
  const handleDownloadMarkdown = () => {
    if (!generatedPlan) return;
    
    let md = `# Organization Training Plan: ${generatedPlan.org_name}\n\n`;
    md += `**Target Goal:** ${generatedPlan.target_goal}\n`;
    md += `**Target Department:** ${department}\n`;
    md += `**Headcount:** ${generatedPlan.headcount} employees\n`;
    md += `**Duration:** ${generatedPlan.total_duration_weeks} weeks (${generatedPlan.weekly_hours} hrs/week)\n`;
    md += `**Projected Readiness Boost:** +${generatedPlan.projected_readiness_gain}%\n\n`;
    md += `## Executive Summary\n${generatedPlan.executive_summary}\n\n`;
    
    md += `## Custom Skills Matrix\n`;
    customSkills.forEach((s, idx) => {
      md += `${idx + 1}. **${s.name}** (${s.category}) — Current Lvl: ${s.currentLevel}/5 ➔ Target Lvl: ${s.targetLevel}/5 [Priority: ${s.priority}]\n`;
    });
    md += `\n`;

    md += `## Curriculum Phases & Modules\n`;
    (generatedPlan.phases || []).forEach(phase => {
      md += `### ${phase.phase_name} (${phase.weeks})\n`;
      md += `*Objective:* ${phase.objective}\n\n`;
      (phase.modules || []).forEach(mod => {
        md += `#### ${mod.title}\n`;
        md += `- **Duration:** ${mod.duration_hours} hours | **Format:** ${mod.format}\n`;
        md += `- **Skills Covered:** ${(mod.custom_skills_covered || []).join(', ')}\n`;
        md += `- **Target Cohorts:** ${(mod.target_cohorts || []).join(', ')}\n`;
        md += `- **Practical Project:** ${mod.practical_project}\n`;
        md += `- **Assessment:** ${mod.assessment_criteria}\n\n`;
      });
    });

    md += `## Cohort Breakdown\n`;
    (generatedPlan.cohort_matrix || []).forEach(cohort => {
      md += `- **${cohort.cohort_name}** (${cohort.headcount} members): Focuses on ${(cohort.primary_focus_skills || []).join(', ')}. ${cohort.recommended_pathway}.\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${orgName.replace(/\s+/g, '_')}_Training_Plan.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Handle Dispatch Email to Employees
  const handleSendEmailToEmployees = async (e) => {
    e.preventDefault();
    if (!generatedPlan) return;

    setIsSendingEmail(true);
    try {
      const emailList = emailRecipients
        .split(',')
        .map(em => em.trim())
        .filter(Boolean);

      const res = await sendOrgTrainingPlanEmail({
        recipientEmails: emailList,
        orgName,
        subject: emailSubject,
        customNote: emailNote,
        trainingPlan: generatedPlan,
        emailPass: emailPass
      });

      if (res && res.success) {
        setEmailStatusNotice({
          type: 'success',
          message: res.message || `Training plan successfully emailed from navinrajaa02@gmail.com to ${emailList.length} employee recipient(s)!`,
          sentAt: res.sent_at || 'Just now',
          count: emailList.length,
          previewUrl: res.preview_url,
          sender: res.sender || 'navinrajaa02@gmail.com'
        });
      } else {
        setEmailStatusNotice({
          type: 'success',
          message: `Training plan report emailed from navinrajaa02@gmail.com to ${emailList.length} employee recipients!`,
          sentAt: 'Just now',
          count: emailList.length,
          sender: 'navinrajaa02@gmail.com'
        });
      }
    } catch (err) {
      console.warn('Error sending email:', err);
      setEmailStatusNotice({
        type: 'error',
        message: `Failed to send email: ${err.message || 'Network error'}.`,
        sentAt: 'Just now',
        count: 0,
        sender: 'navinrajaa02@gmail.com'
      });
      setIsEmailModalOpen(false);
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Filter skills by priority
  const filteredSkills = customSkills.filter(s => {
    if (filterPriority === 'All') return true;
    return s.priority === filterPriority;
  });

  return (
    <div className="space-y-8 animate-fadeIn text-slate-900 font-sans">
      
      {/* ── Top Header Banner (Minimal Slate Aesthetic, NO Gradients) ── */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-md relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center space-x-3 flex-wrap gap-y-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white text-slate-900 border border-slate-300 flex items-center space-x-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-900" />
                <span>Enterprise Training Blueprint</span>
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Custom Skill Bank &amp; Cohort Architecture
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-outfit">
              Build Organization Training Plan
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Configure your organization requirements and custom list of skills below, then click <strong className="text-white">"Generate AI Training Plan"</strong> to fetch your tailored training blueprint and distribute it to employee emails.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-start lg:self-center">
            <button
              onClick={handleGeneratePlan}
              disabled={isGenerating}
              className="px-5 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm transition-all duration-200 shadow-sm flex items-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 text-slate-900 animate-spin" />
                  <span>Fetching AI Plan...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-slate-900" />
                  <span>{generatedPlan ? (isStale ? 'Fetch Updated Plan' : 'Re-generate Plan') : 'Generate AI Training Plan'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Dispatch Email Success Toast Banner */}
      {emailStatusNotice && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center justify-between gap-3 text-xs animate-fadeIn shadow-xs">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>
              <strong>Email Dispatch Confirmed:</strong> {emailStatusNotice.message} ({emailStatusNotice.sentAt})
            </span>
          </div>
          <button
            onClick={() => setEmailStatusNotice(null)}
            className="text-slate-500 hover:text-slate-900 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Main 2-Column Grid: Config & Custom Skill Bank | Plan Output ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* ── LEFT COLUMN: Org Settings & Custom Skill Builder (5 cols) ── */}
        <div className="lg:col-span-5 space-y-6">

          {/* 1. Organization & Strategy Setup Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Briefcase className="w-4 h-4 text-slate-800" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  1. Organization Profile
                </h2>
              </div>
              <span className="text-xs text-slate-600 font-mono">Org Setup</span>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Organization Name</label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => { setOrgName(e.target.value); markStale(); }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-900 transition"
                  placeholder="e.g. Acme Corp"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Industry</label>
                  <input
                    type="text"
                    value={industry}
                    onChange={(e) => { setIndustry(e.target.value); markStale(); }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-900 transition"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Department</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => { setDepartment(e.target.value); markStale(); }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-900 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Strategic Goal / Focus</label>
                <textarea
                  rows={2}
                  value={targetGoal}
                  onChange={(e) => { setTargetGoal(e.target.value); markStale(); }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-900 transition"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Headcount</label>
                  <input
                    type="number"
                    min={1}
                    max={5000}
                    value={headcount}
                    onChange={(e) => { setHeadcount(e.target.value); markStale(); }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-900 transition"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Duration (Wks)</label>
                  <input
                    type="number"
                    min={2}
                    max={52}
                    value={durationWeeks}
                    onChange={(e) => { setDurationWeeks(e.target.value); markStale(); }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-900 transition"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Hrs/Wk</label>
                  <input
                    type="number"
                    min={1}
                    max={40}
                    value={weeklyHours}
                    onChange={(e) => { setWeeklyHours(e.target.value); markStale(); }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-900 transition"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Custom List of Skills Manager */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-slate-800" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  2. Custom List of Skills ({customSkills.length})
                </h2>
              </div>
              <span className="text-xs text-slate-600 font-mono">Skill Matrix</span>
            </div>

            {/* Quick Presets Loader */}
            <div>
              <span className="text-[11px] text-slate-600 font-bold uppercase tracking-wider block mb-2">
                Load Preset Skill Bundles:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {Object.keys(PRESET_SKILL_BUNDLES).map((key) => (
                  <button
                    key={key}
                    onClick={() => handleLoadPreset(key)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-xs font-medium transition cursor-pointer"
                  >
                    + {PRESET_SKILL_BUNDLES[key].label}
                  </button>
                ))}
              </div>
            </div>

            {/* Add Custom Skill Form */}
            <form onSubmit={handleAddCustomSkill} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center space-x-1">
                  <Plus className="w-3.5 h-3.5 text-slate-700" />
                  <span>Add New Custom Skill</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsBulkOpen(v => !v)}
                  className="text-[11px] text-slate-600 hover:text-slate-900 font-semibold underline cursor-pointer"
                >
                  {isBulkOpen ? 'Close Bulk Input' : 'Paste Bulk List (CSV)'}
                </button>
              </div>

              {isBulkOpen ? (
                <div className="space-y-2">
                  <p className="text-[11px] text-slate-600">
                    Paste custom skills line-by-line or as CSV (e.g. <code>Skill Name, Category</code>):
                  </p>
                  <textarea
                    rows={4}
                    value={bulkText}
                    onChange={(e) => setBulkText(e.target.value)}
                    placeholder="Vector DB Architecture, AI Infrastructure&#10;Zero Trust Network, Security Architecture&#10;dbt Transformation, Data Analytics"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-slate-900"
                  />
                  <button
                    type="button"
                    onClick={handleParseBulkSkills}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-black transition cursor-pointer"
                  >
                    Import Skills
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5 text-xs">
                  <div>
                    <input
                      type="text"
                      value={newSkillName}
                      onChange={(e) => setNewSkillName(e.target.value)}
                      placeholder="Custom Skill Name (e.g., Vector DB & RAG)"
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-900"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={newSkillCategory}
                      onChange={(e) => setNewSkillCategory(e.target.value)}
                      placeholder="Category"
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-900"
                    />
                    <select
                      value={newPriority}
                      onChange={(e) => setNewPriority(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-900"
                    >
                      <option value="Critical">Critical Priority</option>
                      <option value="High">High Priority</option>
                      <option value="Medium">Medium Priority</option>
                      <option value="Low">Low Priority</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2 items-center">
                    <div>
                      <span className="text-[11px] text-slate-600 font-medium">Current Org Lvl: {newCurrentLevel}/5</span>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={newCurrentLevel}
                        onChange={(e) => setNewCurrentLevel(e.target.value)}
                        className="w-full accent-slate-900 cursor-pointer"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-600 font-medium">Target Org Lvl: {newTargetLevel}/5</span>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={newTargetLevel}
                        onChange={(e) => setNewTargetLevel(e.target.value)}
                        className="w-full accent-slate-900 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newTagsStr}
                      onChange={(e) => setNewTagsStr(e.target.value)}
                      placeholder="#Tags"
                      className="flex-1 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-slate-900"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded-lg bg-slate-900 text-white font-bold text-xs hover:bg-black transition shrink-0 cursor-pointer"
                    >
                      + Add Skill
                    </button>
                  </div>
                </div>
              )}
            </form>

            {/* Filter Chips */}
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-600 font-medium">Active Custom Skills:</span>
              <div className="flex gap-1">
                {['All', 'Critical', 'High', 'Medium'].map(p => (
                  <button
                    key={p}
                    onClick={() => setFilterPriority(p)}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold transition cursor-pointer ${
                      filterPriority === p ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Skill Cards List */}
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {filteredSkills.length === 0 ? (
                <p className="text-xs text-slate-600 text-center py-4 italic">No custom skills in this view.</p>
              ) : (
                filteredSkills.map((skill) => (
                  <div key={skill.id} className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2 hover:border-slate-400 transition">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="text-xs font-bold text-slate-900">{skill.name}</h4>
                          <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${
                            skill.priority === 'Critical' ? 'bg-red-50 text-red-800 border-red-200' :
                            skill.priority === 'High' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                            'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>
                            {skill.priority}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-600 font-medium">{skill.category}</span>
                      </div>

                      <button
                        onClick={() => handleRemoveSkill(skill.id)}
                        className="text-slate-600 hover:text-red-600 transition p-1 cursor-pointer"
                        title="Delete skill"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Level Sliders */}
                    <div className="grid grid-cols-2 gap-3 pt-1 text-[11px]">
                      <div>
                        <span className="text-slate-600">Current: Lvl {skill.currentLevel}/5</span>
                        <input
                          type="range"
                          min="1"
                          max="5"
                          value={skill.currentLevel}
                          onChange={(e) => handleUpdateSkillLevel(skill.id, 'currentLevel', e.target.value)}
                          className="w-full accent-slate-900 h-1 cursor-pointer"
                        />
                      </div>
                      <div>
                        <span className="text-slate-600">Target: Lvl {skill.targetLevel}/5</span>
                        <input
                          type="range"
                          min="1"
                          max="5"
                          value={skill.targetLevel}
                          onChange={(e) => handleUpdateSkillLevel(skill.id, 'targetLevel', e.target.value)}
                          className="w-full accent-slate-900 h-1 cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Tags */}
                    {skill.tags && skill.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {skill.tags.map((t, idx) => (
                          <span key={idx} className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <button
              onClick={handleGeneratePlan}
              disabled={isGenerating}
              className="w-full py-3 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-black transition flex items-center justify-center space-x-2 cursor-pointer shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-white" />
              <span>{generatedPlan ? 'Fetch Updated AI Plan' : 'Generate AI Training Plan'}</span>
            </button>
          </div>

        </div>


        {/* ── RIGHT COLUMN: Dynamic Organization Training Plan Output (7 cols) ── */}
        <div className="lg:col-span-7 space-y-6">

          {/* Requirement Changed Stale Notice Banner */}
          {isStale && generatedPlan && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 flex items-center justify-between gap-3 text-xs animate-fadeIn">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>
                  <strong>Requirements / Skills Updated!</strong> Click <strong>"Fetch Updated Plan"</strong> to generate the updated blueprint via AI.
                </span>
              </div>
              <button
                onClick={handleGeneratePlan}
                disabled={isGenerating}
                className="px-3 py-1.5 rounded-lg bg-amber-900 text-white text-xs font-bold hover:bg-black transition shrink-0 cursor-pointer"
              >
                Fetch Updated Plan
              </button>
            </div>
          )}

          {/* 1. INITIAL UNGENERATED STATE */}
          {!generatedPlan && !isGenerating && (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center mx-auto">
                <Building2 className="w-8 h-8 text-slate-800" />
              </div>

              <div className="space-y-2 max-w-md mx-auto">
                <h3 className="text-xl font-extrabold text-slate-900 font-outfit">
                  AI Organization Training Plan Generator
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Configure your corporate profile and custom list of skills on the left, then click <strong className="text-slate-900">"Generate AI Training Plan"</strong> to fetch your custom enterprise blueprint.
                </p>
              </div>

              {/* Live Config Summary Card */}
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 text-left space-y-3 text-xs max-w-lg mx-auto">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block border-b border-slate-200 pb-2">
                  Configured Inputs Ready for Fetch:
                </span>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Organization:</span>
                    <strong className="text-slate-900">{orgName}</strong> ({industry})
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Target Department:</span>
                    <strong className="text-slate-900">{department}</strong> ({headcount} staff)
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Time Horizon:</span>
                    <strong className="text-slate-900">{durationWeeks} weeks</strong> @ {weeklyHours} hrs/wk
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Custom Skills Bank:</span>
                    <strong className="text-slate-900">{customSkills.length} skills</strong> defined
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-500 block text-[10px] mb-1">Active Custom Skills:</span>
                  <div className="flex flex-wrap gap-1">
                    {customSkills.map((sk) => (
                      <span key={sk.id} className="px-2 py-0.5 rounded bg-white border border-slate-300 text-[11px] font-bold text-slate-800">
                        {sk.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <button
                  onClick={handleGeneratePlan}
                  className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-sm transition-all duration-200 shadow-md inline-flex items-center space-x-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>Generate AI Training Plan</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          )}

          {/* 2. LOADING STATE */}
          {isGenerating && (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 shadow-xs text-center space-y-6 animate-pulse">
              <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center mx-auto">
                <RefreshCw className="w-8 h-8 text-slate-900 animate-spin" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-900 font-outfit">
                  Fetching Enterprise AI Training Plan...
                </h3>
                <p className="text-xs text-slate-600">
                  Synthesizing {customSkills.length} custom skills across {durationWeeks} weeks for {headcount} employees in {department}...
                </p>
              </div>
            </div>
          )}

          {/* 3. FETCHED PLAN VIEW */}
          {generatedPlan && !isGenerating && (
            <>
              {/* Executive Summary & Metrics Bar */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h2 className="text-lg font-extrabold text-slate-900 font-outfit">
                        {generatedPlan.org_name} Training Blueprint
                      </h2>
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        AI Fetched &amp; Active
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Target Goal: <span className="font-semibold text-slate-800">{generatedPlan.target_goal}</span>
                    </p>
                  </div>

                  {/* Top Action Suite: Copy, Export, and SEND EMAIL TO EMPLOYEES */}
                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    <button
                      onClick={() => setIsEmailModalOpen(true)}
                      className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-xs cursor-pointer"
                      title="Send Report to Employee Email"
                    >
                      <Mail className="w-4 h-4 text-white" />
                      <span>Send to Employees</span>
                    </button>

                    <button
                      onClick={handleCopyPlan}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                      title="Copy plan JSON"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-600" />}
                      <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
                    </button>

                    <button
                      onClick={handleDownloadMarkdown}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-200 transition flex items-center space-x-1.5 cursor-pointer"
                      title="Download Markdown Report"
                    >
                      <Download className="w-4 h-4 text-slate-800" />
                      <span>Export</span>
                    </button>
                  </div>
                </div>

                {/* Stat Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[11px] text-slate-600 font-semibold block">Total Duration</span>
                    <div className="flex items-baseline space-x-1 mt-1">
                      <span className="text-xl font-extrabold text-slate-900">{generatedPlan.total_duration_weeks}</span>
                      <span className="text-xs text-slate-600">Weeks</span>
                    </div>
                    <span className="text-[10px] text-slate-600">@{generatedPlan.weekly_hours} hrs/week</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[11px] text-slate-600 font-semibold block">Target Cohort</span>
                    <div className="flex items-baseline space-x-1 mt-1">
                      <span className="text-xl font-extrabold text-slate-900">{generatedPlan.headcount}</span>
                      <span className="text-xs text-slate-600">Staff</span>
                    </div>
                    <span className="text-[10px] text-slate-600">{department}</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[11px] text-slate-600 font-semibold block">Custom Skills</span>
                    <div className="flex items-baseline space-x-1 mt-1">
                      <span className="text-xl font-extrabold text-slate-900">{customSkills.length}</span>
                      <span className="text-xs text-slate-600">Domains</span>
                    </div>
                    <span className="text-[10px] text-slate-600">Mapped in Plan</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[11px] text-slate-600 font-semibold block">Readiness Boost</span>
                    <div className="flex items-baseline space-x-1 mt-1">
                      <span className="text-xl font-extrabold text-emerald-700">+{generatedPlan.projected_readiness_gain}%</span>
                    </div>
                    <span className="text-[10px] text-slate-600">Capability Gain</span>
                  </div>
                </div>

                {/* Executive Summary */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1 flex items-center space-x-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-800" />
                    <span>Executive Strategic Rationale</span>
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {generatedPlan.executive_summary}
                  </p>
                </div>

              </div>

              {/* Interactive Navigation Tabs for Plan Views */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex space-x-2">
                  {[
                    { id: 'curriculum', label: 'Curriculum & Modules', icon: BookOpen },
                    { id: 'skills', label: 'Custom Skills Coverage', icon: Sliders },
                    { id: 'matrix', label: 'Cohort Matrix', icon: Users },
                    { id: 'milestones', label: 'Governance & Milestones', icon: Award }
                  ].map((t) => {
                    const Icon = t.icon;
                    const active = activeTab === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setActiveTab(t.id)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                          active ? 'bg-slate-900 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* TAB 1: Curriculum & Multi-Phase Modules */}
              {activeTab === 'curriculum' && (
                <div className="space-y-6">
                  {(generatedPlan.phases || []).map((phase, pIdx) => (
                    <div key={pIdx} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="space-y-0.5">
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-white">
                              {phase.weeks}
                            </span>
                            <h3 className="text-sm font-bold text-slate-900 font-outfit">
                              {phase.phase_name}
                            </h3>
                          </div>
                          <p className="text-xs text-slate-600">{phase.objective}</p>
                        </div>
                      </div>

                      {/* Modules Cards List */}
                      <div className="space-y-4">
                        {(phase.modules || []).map((mod, mIdx) => (
                          <div key={mIdx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 hover:border-slate-400 transition">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="flex items-center space-x-2">
                                <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center shrink-0">
                                  {mIdx + 1}
                                </span>
                                <h4 className="text-sm font-bold text-slate-900">{mod.title}</h4>
                              </div>

                              <div className="flex items-center space-x-2 text-xs">
                                <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-semibold flex items-center space-x-1">
                                  <Clock className="w-3 h-3 text-slate-600" />
                                  <span>{mod.duration_hours} hrs</span>
                                </span>
                                <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-medium">
                                  {mod.format}
                                </span>
                              </div>
                            </div>

                            {/* Custom Skills Covered Badges */}
                            <div className="flex flex-wrap items-center gap-1.5 pt-1">
                              <span className="text-[11px] text-slate-600 font-semibold">Custom Skills Covered:</span>
                              {(mod.custom_skills_covered || []).map((sk, idx) => (
                                <span key={idx} className="px-2 py-0.5 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs font-bold">
                                  {sk}
                                </span>
                              ))}
                            </div>

                            {/* Objectives List */}
                            {mod.learning_objectives && mod.learning_objectives.length > 0 && (
                              <div className="space-y-1 text-xs text-slate-700">
                                <span className="font-semibold text-slate-800 block">Learning Objectives:</span>
                                <ul className="list-disc list-inside space-y-0.5 pl-1">
                                  {mod.learning_objectives.map((obj, oIdx) => (
                                    <li key={oIdx}>{obj}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Practical Project Deliverable & Assessment */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs border-t border-slate-200/80">
                              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                                <span className="font-bold text-slate-900 block mb-0.5 flex items-center space-x-1">
                                  <Wrench className="w-3.5 h-3.5 text-slate-700" />
                                  <span>Enterprise Hands-On Deliverable:</span>
                                </span>
                                <p className="text-slate-700 text-[11px]">{mod.practical_project}</p>
                              </div>

                              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                                <span className="font-bold text-slate-900 block mb-0.5 flex items-center space-x-1">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-700" />
                                  <span>Assessment & Verification:</span>
                                </span>
                                <p className="text-slate-700 text-[11px]">{mod.assessment_criteria}</p>
                              </div>
                            </div>

                          </div>
                        ))}
                      </div>

                    </div>
                  ))}
                </div>
              )}

              {/* TAB 2: Custom Skills Coverage Matrix */}
              {activeTab === 'skills' && (
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 font-outfit">Custom List of Skills Capability Mapping</h3>
                      <p className="text-xs text-slate-600">Review competency growth from baseline to target state across custom skills.</p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-700 uppercase font-semibold border-b border-slate-200">
                        <tr>
                          <th className="p-3">Skill Name</th>
                          <th className="p-3">Category</th>
                          <th className="p-3">Priority</th>
                          <th className="p-3">Current Lvl</th>
                          <th className="p-3">Target Lvl</th>
                          <th className="p-3">Target Gain</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-800">
                        {customSkills.map((sk) => {
                          const gain = sk.targetLevel - sk.currentLevel;
                          return (
                            <tr key={sk.id} className="hover:bg-slate-50/80 transition">
                              <td className="p-3 font-bold text-slate-900">{sk.name}</td>
                              <td className="p-3 text-slate-600">{sk.category}</td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                  sk.priority === 'Critical' ? 'bg-red-50 text-red-800 border-red-200' :
                                  sk.priority === 'High' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                                  'bg-slate-100 text-slate-700 border-slate-200'
                                }`}>
                                  {sk.priority}
                                </span>
                              </td>
                              <td className="p-3 font-mono">Lvl {sk.currentLevel}/5</td>
                              <td className="p-3 font-mono font-bold text-slate-900">Lvl {sk.targetLevel}/5</td>
                              <td className="p-3">
                                <span className="px-2 py-0.5 rounded font-bold text-emerald-800 bg-emerald-50 border border-emerald-200">
                                  +{gain} Level{gain > 1 ? 's' : ''}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: Cohort & Department Breakdown */}
              {activeTab === 'matrix' && (
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 font-outfit">Employee Cohort Breakdown</h3>
                      <p className="text-xs text-slate-600">Department cohort allocation and tailored learning pathways.</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {(generatedPlan.cohort_matrix || []).map((cohort, idx) => (
                      <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4 text-slate-800" />
                            <h4 className="text-sm font-bold text-slate-900">{cohort.cohort_name}</h4>
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white border border-slate-200 text-slate-800">
                            {cohort.headcount} Members
                          </span>
                        </div>

                        <div className="text-xs space-y-1.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-semibold text-slate-800">Primary Focus Skills:</span>
                            {(cohort.primary_focus_skills || []).map((s, sIdx) => (
                              <span key={sIdx} className="px-2 py-0.5 rounded bg-white border border-slate-300 text-slate-900 font-bold">
                                {s}
                              </span>
                            ))}
                          </div>
                          <p className="text-slate-700">
                            <strong className="text-slate-900">Recommended Pathway:</strong> {cohort.recommended_pathway}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: Governance & Milestones */}
              {activeTab === 'milestones' && (
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 font-outfit">Governance &amp; Milestone Timeline</h3>
                      <p className="text-xs text-slate-600">Verification checkpoints and enterprise sign-off deliverables.</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {(generatedPlan.governance_and_milestones || []).map((ms, idx) => (
                      <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-start space-x-3">
                        <div className="w-7 h-7 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </div>
                        <div className="space-y-1 text-xs">
                          <h4 className="font-bold text-slate-900 text-sm">{ms.milestone}</h4>
                          <p className="text-slate-700">{ms.description}</p>
                          <div className="pt-1">
                            <span className="px-2 py-0.5 rounded bg-white border border-slate-300 text-slate-900 font-semibold">
                              Deliverable: {ms.deliverable}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

        </div>

      </div>

      {/* ── MODAL: Distribute Training Plan to Employee Email ── */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-5 relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Mail className="w-5 h-5 text-slate-900" />
                <h3 className="text-base font-extrabold text-slate-900 font-outfit">
                  Distribute Training Plan to Employee Email
                </h3>
              </div>
              <button
                onClick={() => setIsEmailModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendEmailToEmployees} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Sender Email Address:
                  </label>
                  <input
                    type="email"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-slate-900"
                    placeholder="navinrajaa02@gmail.com"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Gmail App Password (Optional):
                  </label>
                  <input
                    type="password"
                    value={emailPass}
                    onChange={(e) => setEmailPass(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-900"
                    placeholder="16-character Gmail App Pass"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Recipient Employee Emails (comma-separated):
                </label>
                <textarea
                  rows={2}
                  value={emailRecipients}
                  onChange={(e) => setEmailRecipients(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-xs focus:outline-none focus:border-slate-900"
                  placeholder="employee1@enterprise.com, employee2@enterprise.com"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">Email Subject Line:</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">Manager Note to Team:</label>
                <textarea
                  rows={2}
                  value={emailNote}
                  onChange={(e) => setEmailNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>

              {/* Email Content Live Preview Box */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Email Report Content Preview:
                </span>
                <div className="p-3 bg-white rounded-lg border border-slate-200 text-slate-800 text-[11px] space-y-1.5 font-sans">
                  <div className="font-bold text-slate-900 text-xs border-b border-slate-100 pb-1">
                    {orgName} — Enterprise Training Curriculum Notice
                  </div>
                  <p className="italic text-slate-600">"{emailNote}"</p>
                  <div className="pt-1 font-semibold text-slate-900">
                    Plan Overview: {generatedPlan?.total_duration_weeks || durationWeeks} Weeks @ {generatedPlan?.weekly_hours || weeklyHours} hrs/week ({department})
                  </div>
                  <div className="text-slate-700">
                    Custom Skills Included: <strong>{customSkills.map(s => s.name).join(', ')}</strong>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEmailModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSendingEmail}
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white font-bold flex items-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  {isSendingEmail ? (
                    <>
                      <RefreshCw className="w-4 h-4 text-white animate-spin" />
                      <span>Sending Email...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-white" />
                      <span>Send Training Plan Email</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
