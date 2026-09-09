import React, { useState } from 'react';
import {
  X, Sparkles, Sliders, CheckCircle2, Clock, Target, AlertCircle, UploadCloud, FileText, Check
} from 'lucide-react';
import { parseSkillsFreeText } from '../services/api';

export default function SkillInputModal({
  isOpen,
  onClose,
  skills,
  roles,
  currentSkills,
  targetRoleId,
  weeklyHours,
  onSave
}) {
  const [activeMode, setActiveMode] = useState('resume'); // 'resume' | 'freeText' | 'sliders'
  const [freeText, setFreeText] = useState("I know basic Python scripting, have written complex SQL JOINs, built interactive Tableau dashboards, and ran some basic A/B test experiments.");
  const [localSkills, setLocalSkills] = useState(currentSkills || {});
  const [localRole, setLocalRole] = useState(targetRoleId || 'sr_data_analyst');
  const [localHours, setLocalHours] = useState(weeklyHours || 5);
  const [isParsing, setIsParsing] = useState(false);
  const [extractedMentions, setExtractedMentions] = useState([]);
  const [uploadedFileName, setUploadedFileName] = useState(null);

  if (!isOpen) return null;

  const handleParseText = async (textToParse) => {
    const text = textToParse || freeText;
    if (!text.trim()) return;
    setIsParsing(true);
    const res = await parseSkillsFreeText(text);
    setIsParsing(false);

    if (res && res.parsed_skills) {
      setLocalSkills(prev => ({
        ...prev,
        ...res.parsed_skills
      }));
      setExtractedMentions(res.detected_mentions || []);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFileName(file.name);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        await handleParseText(content);
      }
    };
    reader.readAsText(file);
  };

  const handleDemoResumeLoad = async (presetName) => {
    let demoText = "";
    if (presetName === 'data') {
      setUploadedFileName("Priya_Sharma_Resume_2026.pdf");
      demoText = "Senior experience with SQL data warehousing, BigQuery, Snowflake, and Python data analytics (pandas/numpy). Built interactive Tableau executive dashboards and formulated A/B test experimentation hypotheses.";
    } else if (presetName === 'software') {
      setUploadedFileName("Marcus_Chen_Fullstack_Resume.pdf");
      demoText = "Frontend Engineer with 4 years experience in React, JavaScript, TypeScript, TailwindCSS, Node.js, Express microservices, REST APIs, and distributed Docker system architecture.";
    } else {
      setUploadedFileName("Sarah_Jenkins_Product_Resume.pdf");
      demoText = "Product Manager with strong background in product discovery, user research interviews, AI product strategy, roadmapping, SQL query analysis, and data storytelling.";
    }

    setFreeText(demoText);
    await handleParseText(demoText);
  };

  const handleSliderChange = (skillId, val) => {
    setLocalSkills(prev => ({
      ...prev,
      [skillId]: Number(val)
    }));
  };

  const handleSave = () => {
    onSave({
      skills: localSkills,
      targetRoleId: localRole,
      weeklyHours: localHours
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">

        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-blue-100 text-blue-700 border border-blue-200">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-outfit">Skills & Career Goal Matrix</h2>
              <p className="text-xs text-slate-500">Auto-scan resume, describe background, or adjust manual skill levels</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">

          {/* Target Role & Weekly Hours Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-blue-50/60 p-4 rounded-xl border border-blue-100">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center space-x-1.5">
                <Target className="w-3.5 h-3.5 text-blue-600" />
                <span>Target Career Goal / Promotion</span>
              </label>
              <select
                value={localRole}
                onChange={(e) => setLocalRole(e.target.value)}
                className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              >
                {roles.map(r => (
                  <option key={r.id} value={r.id} className="text-slate-800">
                    {r.title} ({r.track_id?.replace(/_/g, ' ')})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>Weekly Time Budget ({localHours} hrs/week)</span>
              </label>
              <input
                type="range"
                min="2"
                max="15"
                step="1"
                value={localHours}
                onChange={(e) => setLocalHours(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>2 hrs (Gentle)</span>
                <span className="font-bold text-blue-700">{localHours} hrs/wk</span>
                <span>15 hrs (Intensive)</span>
              </div>
            </div>
          </div>

          {/* Mode Switcher: Resume Upload vs NLP vs Manual */}
          <div className="flex items-center space-x-2 border-b border-slate-200 pb-3">
            <button
              onClick={() => setActiveMode('resume')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${activeMode === 'resume'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span> Resume / PDF Auto-Scanner</span>
            </button>
            <button
              onClick={() => setActiveMode('freeText')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${activeMode === 'freeText'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Free-Text Extraction</span>
            </button>
            <button
              onClick={() => setActiveMode('sliders')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${activeMode === 'sliders'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Manual Skill Sliders</span>
            </button>
          </div>

          {/* Mode 1: Resume Upload / PDF Drop */}
          {activeMode === 'resume' && (
            <div className="space-y-4 animate-fadeIn">

              {/* Dropzone */}
              <label className="border-2 border-dashed border-blue-200 hover:border-blue-500 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer bg-blue-50/40 hover:bg-blue-50/80 transition text-center space-y-2">
                <input
                  type="file"
                  accept=".txt,.json,.pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div className="text-xs font-bold text-slate-800">
                  {uploadedFileName ? (
                    <span className="text-emerald-700 flex items-center justify-center space-x-1">
                      <FileText className="w-4 h-4" />
                      <span>Loaded: {uploadedFileName}</span>
                    </span>
                  ) : (
                    <span>Click to browse or drop your Resume file (.pdf, .txt, .json)</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500">
                  Instantly extracts all technical capabilities, framework experience, and proficiency levels
                </p>
              </label>

              {/* Sample Quick Demo Resumes */}
              <div className="flex items-center space-x-2 text-xs text-slate-500">
                <span className="font-semibold text-slate-600">Try 1-Click Sample Resumes:</span>
                <button
                  onClick={() => handleDemoResumeLoad('data')}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 text-[11px] font-semibold transition"
                >
                  Data Analyst Resume
                </button>
                <button
                  onClick={() => handleDemoResumeLoad('software')}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 text-[11px] font-semibold transition"
                >
                  Fullstack Dev Resume
                </button>
              </div>

              {/* Extracted Mentions Pill Breakdown */}
              {extractedMentions.length > 0 && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2 animate-fadeIn">
                  <div className="text-xs font-bold text-emerald-800 flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Auto-Extracted Skills & Levels from Resume ({extractedMentions.length}):</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {extractedMentions.map((m, i) => (
                      <span key={i} className="text-[11px] px-2.5 py-1 rounded-md bg-white text-emerald-800 font-bold border border-emerald-200 shadow-2xs">
                        {m.skill_name}: <strong>Lvl {m.inferred_level}</strong>
                      </span>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* Mode 2: AI Free-Text Parser */}
          {activeMode === 'freeText' && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Describe what technologies and skills you know in plain English:
                </label>
                <textarea
                  rows="3"
                  value={freeText}
                  onChange={(e) => setFreeText(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-300 rounded-xl p-3 text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  placeholder="e.g. I have 2 years of experience with Python and SQL, built data pipelines in Docker, and want to learn LLM fine-tuning..."
                />
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => handleParseText(freeText)}
                  disabled={isParsing}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold flex items-center space-x-2 shadow-xs transition disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isParsing ? 'Extracting Skills with NLP...' : 'Extract & Match Skills'}</span>
                </button>

                <span className="text-[11px] text-slate-500">Auto-detects skill levels (1-5) and keywords</span>
              </div>

              {extractedMentions.length > 0 && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
                  <div className="text-xs font-bold text-emerald-800 flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>AI Extracted & Updated Skills:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {extractedMentions.map((m, i) => (
                      <span key={i} className="text-[11px] px-2 py-0.5 rounded-md bg-white text-emerald-800 font-bold border border-emerald-200 shadow-2xs">
                        {m.skill_name}: Lvl {m.inferred_level}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mode 3: Manual Sliders */}
          {activeMode === 'sliders' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
                <span>Current Skill Proficiencies</span>
                <span className="text-slate-500 font-normal">Level 1 (Novice) → Level 5 (Master)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1">
                {skills.map(sk => {
                  const currentVal = localSkills[sk.id] || 0;
                  return (
                    <div key={sk.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800 truncate max-w-[180px]">{sk.name}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${currentVal >= 3 ? 'bg-blue-100 text-blue-700' : currentVal > 0 ? 'bg-slate-200 text-slate-700' : 'bg-slate-100 text-slate-400'
                          }`}>
                          {currentVal === 0 ? 'No Exp' : `Lvl ${currentVal}`}
                        </span>
                      </div>

                      <input
                        type="range"
                        min="0"
                        max="5"
                        step="1"
                        value={currentVal}
                        onChange={(e) => handleSliderChange(sk.id, e.target.value)}
                        className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                      />

                      <div className="text-[10px] text-slate-500 truncate">
                        {sk.levels?.[String(currentVal)] || (currentVal === 0 ? 'No prior experience' : '')}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end space-x-3 p-4 border-t border-slate-200 bg-slate-50/70">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition"
          >
            Apply & Recalculate Roadmap
          </button>
        </div>

      </div>
    </div>
  );
}
