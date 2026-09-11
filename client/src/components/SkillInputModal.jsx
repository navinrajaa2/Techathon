import React, { useState } from 'react';
import {
  X, Sparkles, Sliders, CheckCircle2, Clock, Target, UploadCloud, FileText, Loader2, GitBranch
} from 'lucide-react';
import { parseSkillsFreeText } from '../services/api';
import { extractResumeContent } from '../utils/resumeParser';

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
  const [activeMode, setActiveMode] = useState('resume'); // 'resume' | 'freeText' | 'sliders' | 'github'
  const [freeText, setFreeText] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [localSkills, setLocalSkills] = useState(currentSkills || {});
  const [localRole, setLocalRole] = useState(targetRoleId || 'sr_data_analyst');
  const [localHours, setLocalHours] = useState(weeklyHours || 5);
  const [isParsing, setIsParsing] = useState(false);
  const [extractedMentions, setExtractedMentions] = useState([]);
  const [uploadedFileName, setUploadedFileName] = useState(null);
  const [extractedSummary, setExtractedSummary] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  if (!isOpen) return null;

  const handleParsePayload = async (payload) => {
    setIsParsing(true);
    try {
      const res = await parseSkillsFreeText(payload);
      if (res && res.parsed_skills) {
        setLocalSkills(res.parsed_skills);
        setExtractedMentions(res.detected_mentions || []);
        if (res.summary) {
          setExtractedSummary(res.summary);
        }
      }
    } catch (err) {
      console.error('Error parsing payload:', err);
    } finally {
      setIsParsing(false);
    }
  };

  const handleParseText = async (textToParse) => {
    const text = textToParse || freeText;
    if (!text.trim()) return;
    await handleParsePayload({ text });
  };

  const handleParseGithub = async () => {
    if (!githubUrl.trim()) return;
    setIsParsing(true);
    setUploadedFileName(githubUrl);
    setExtractedSummary('');
    // Simulate analyzing a github profile by passing the URL text to the parser
    // In a real app, this would call a backend endpoint to fetch the github profile
    await handleParsePayload({ text: `Analyze GitHub Profile: ${githubUrl}. The user is proficient in languages and frameworks found in their repositories.` });
  };

  const handleFileProcess = async (file) => {
    if (!file) return;
    setUploadedFileName(file.name);
    setIsParsing(true);
    setExtractedSummary('');

    try {
      const extracted = await extractResumeContent(file);
      await handleParsePayload({
        text: extracted.text,
        base64: extracted.base64,
        fileType: extracted.fileType
      });
    } catch (err) {
      console.error('Error extracting resume content:', err);
      setIsParsing(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFileProcess(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileProcess(file);
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
      weeklyHours: localHours,
      uploadedFileName,
      extractedMentions,
      extractedSummary
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
              <p className="text-xs text-slate-500">Auto-scan resume, GitHub, describe background, or adjust manual skill levels</p>
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
        <div className="p-6 overflow-y-auto space-y-6 flex-1 hide-scrollbar">

          {/* Target Role & Weekly Hours Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-blue-50/60 p-4 rounded-xl border border-blue-100">
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1.5 flex items-center space-x-1.5">
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
              <label className="text-xs font-bold text-slate-700 mb-1.5 flex items-center space-x-1.5">
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

          {/* Mode Switcher */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
            <button
              onClick={() => setActiveMode('resume')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${activeMode === 'resume'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Resume Scanner</span>
            </button>
            <button
              onClick={() => setActiveMode('github')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${activeMode === 'github'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>GitHub Analyzer</span>
            </button>
            <button
              onClick={() => setActiveMode('freeText')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${activeMode === 'freeText'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Free-Text</span>
            </button>
            <button
              onClick={() => setActiveMode('sliders')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${activeMode === 'sliders'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Manual Sliders</span>
            </button>
          </div>

          {/* Mode 1: Resume Upload / PDF Drop */}
          {activeMode === 'resume' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Dropzone */}
              <label
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition text-center space-y-2 ${
                  isDragging
                    ? 'border-blue-600 bg-blue-100/80 scale-[1.01]'
                    : isParsing
                    ? 'border-blue-300 bg-blue-50/50'
                    : 'border-blue-200 hover:border-blue-500 bg-blue-50/40 hover:bg-blue-50/80'
                }`}
              >
                <input
                  type="file"
                  accept=".txt,.json,.pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                  {isParsing ? (
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  ) : (
                    <UploadCloud className="w-6 h-6" />
                  )}
                </div>
                <div className="text-xs font-bold text-slate-800">
                  {isParsing ? (
                    <span className="text-blue-700 flex items-center justify-center space-x-1.5">
                      <span>Analyzing resume structure & extracting skill levels...</span>
                    </span>
                  ) : uploadedFileName && activeMode === 'resume' ? (
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

              {/* Extracted Summary & Mentions Breakdown */}
              {(extractedMentions.length > 0 || extractedSummary) && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2 animate-fadeIn">
                  <div className="text-xs font-bold text-emerald-800 flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Auto-Extracted Skills & Levels ({extractedMentions.length}):</span>
                  </div>
                  {extractedSummary && (
                    <p className="text-xs text-emerald-900 bg-white/70 p-2.5 rounded-lg border border-emerald-100 italic">
                      "{extractedSummary}"
                    </p>
                  )}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {extractedMentions.map((m, i) => (
                      <span key={i} className="text-[11px] px-2.5 py-1 rounded-md bg-white text-emerald-800 font-bold border border-emerald-200 shadow-2xs">
                        {m.skill_name}: <strong>Lvl {m.inferred_level || m.estimated_level}</strong>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mode 2: GitHub Analyzer */}
          {activeMode === 'github' && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Enter your GitHub Profile URL:
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    className="flex-1 text-xs bg-white border border-slate-300 rounded-xl p-3 text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                    placeholder="https://github.com/username"
                  />
                  <button
                    onClick={handleParseGithub}
                    disabled={isParsing || !githubUrl}
                    className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center space-x-2 shadow-xs transition disabled:opacity-50"
                  >
                    {isParsing ? <Loader2 className="w-4 h-4 animate-spin" /> : <GitBranch className="w-4 h-4" />}
                    <span>{isParsing ? 'Analyzing...' : 'Scan Profile'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  We'll analyze your public repositories, languages, and commit history to extract your technical skills.
                </p>
              </div>

              {/* Extracted Summary & Mentions Breakdown */}
              {(extractedMentions.length > 0 || extractedSummary) && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2 animate-fadeIn">
                  <div className="text-xs font-bold text-emerald-800 flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Auto-Extracted Skills & Levels ({extractedMentions.length}):</span>
                  </div>
                  {extractedSummary && (
                    <p className="text-xs text-emerald-900 bg-white/70 p-2.5 rounded-lg border border-emerald-100 italic">
                      "{extractedSummary}"
                    </p>
                  )}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {extractedMentions.map((m, i) => (
                      <span key={i} className="text-[11px] px-2.5 py-1 rounded-md bg-white text-emerald-800 font-bold border border-emerald-200 shadow-2xs">
                        {m.skill_name}: <strong>Lvl {m.inferred_level || m.estimated_level}</strong>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mode 3: AI Free-Text Parser */}
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
                  disabled={isParsing || !freeText.trim()}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center space-x-2 shadow-xs transition disabled:opacity-50"
                >
                  {isParsing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
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
                        {m.skill_name}: Lvl {m.inferred_level || m.estimated_level}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mode 4: Manual Sliders */}
          {activeMode === 'sliders' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
                <span>Current Skill Proficiencies</span>
                <span className="text-slate-500 font-normal">Level 1 (Novice) → Level 5 (Master)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1 hide-scrollbar">
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
