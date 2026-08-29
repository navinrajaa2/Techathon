import React, { useState } from 'react';
import { 
  X, FileText, Sparkles, Download, Copy, Check, Printer, Bot, Building, Award 
} from 'lucide-react';
import { fetchMentorChat } from '../services/api';

export default function PromotionPitchModal({ 
  isOpen, 
  onClose, 
  learnerName, 
  currentRole, 
  targetRoleTitle, 
  verifiedSkillsCount, 
  totalHours 
}) {
  const [memo, setMemo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleGenerateMemo = async () => {
    setLoading(true);
    const prompt = `Write a formal, compelling 1-page Executive Promotion & Internal Mobility Justification Memo from ${learnerName || 'Alex Rivera'} (currently ${currentRole || 'Junior Developer'}) advocating for promotion to ${targetRoleTitle || 'Senior Role'}.
Include:
1. Executive Summary & Intent
2. Verified Technical Competencies & Mastery Milestones (${verifiedSkillsCount || 4} verified skills, ${totalHours || 64} hours logged)
3. Direct Business Value & Cost Savings to the Org (saves ~$38,000 in external hiring costs)
4. Proposed 30-60-90 Day Impact Objectives.
Keep it structured, persuasive, polished, and ready for HR & Executive Leadership review.`;

    try {
      const generated = await fetchMentorChat(prompt, 'Career Promotion Memo', targetRoleTitle);
      setMemo(generated || defaultMemo);
    } catch (err) {
      setMemo(defaultMemo);
    } finally {
      setLoading(false);
    }
  };

  const defaultMemo = `# MEMORANDUM FOR PROMOTION & INTERNAL MOBILITY

**TO**: Executive Leadership & People Operations  
**FROM**: ${learnerName || 'Alex Rivera'} (${currentRole || 'Software Professional'})  
**DATE**: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}  
**SUBJECT**: Formal Promotion Justification for **${targetRoleTitle || 'Senior Specialist'}**

---

### 1. Executive Summary
Over the past continuous learning cycle, I have proactively upskilled and passed verified assessments to transition into the **${targetRoleTitle}** position. By cultivating these capabilities internally, the team retains critical institutional knowledge while saving an estimated **$38,000 in external recruiter and replacement fees**.

### 2. Verified Technical Competencies
- **Verified Skills Count**: ${verifiedSkillsCount || 4} Production-Level Competencies Confirmed
- **Target Skill Mastery**: 100% verified via PathCraft AI assessments and practical modules
- **Dedicated Upskilling**: ${totalHours || 64}+ hours logged in adaptive career tracks

### 3. Immediate Organizational ROI
- **Zero Ramp-up Latency**: Deep familiarity with our internal architecture and stakeholder workflows.
- **Architectural Mentorship**: Ready to mentor junior team members and accelerate internal sprint velocity.

### 4. 30-60-90 Day Deliverables
- **Days 1–30**: Lead optimization of core telemetry and data pipeline bottlenecks.
- **Days 31–60**: Implement automated regression safeguards and CI/CD enhancements.
- **Days 61–90**: Host cross-team knowledge shares and establish standard development playbooks.

*Validated by PathCraft AI Enterprise Learning Authority*`;

  const currentText = memo || defaultMemo;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-500/25">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 font-outfit text-sm">
                Executive Promotion & Mobility Memo
              </h3>
              <p className="text-xs text-slate-500">
                AI-generated executive business case for <strong className="text-slate-800">{learnerName}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold flex items-center space-x-1 shadow-2xs transition"
            >
              <Printer className="w-3.5 h-3.5 text-blue-600" />
              <span>Print</span>
            </button>
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold flex items-center space-x-1 shadow-2xs transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-blue-600" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 bg-slate-50/60">
          
          <div className="flex items-center justify-between bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="text-xs text-slate-600">
              Target Promotion: <strong className="text-blue-900 font-bold">{targetRoleTitle}</strong>
            </div>
            <button
              onClick={handleGenerateMemo}
              disabled={loading}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-xs transition disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{loading ? 'Drafting with Gemini AI...' : 'Regenerate Custom AI Memo'}</span>
            </button>
          </div>

          {/* Memo Preview Box */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs text-xs text-slate-800 leading-relaxed font-mono whitespace-pre-wrap">
            {currentText}
          </div>

        </div>

      </div>
    </div>
  );
}
