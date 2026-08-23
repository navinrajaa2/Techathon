import React, { useState } from 'react';
import { X, Sparkles, Sliders, CheckCircle2, Clock, Target, AlertCircle } from 'lucide-react';
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
  const [activeMode, setActiveMode] = useState('freeText'); // 'freeText' | 'sliders'
  const [freeText, setFreeText] = useState("I know basic Python scripting, have written complex SQL JOINs, built interactive Tableau dashboards, and ran some basic A/B test experiments.");
  const [localSkills, setLocalSkills] = useState(currentSkills || {});
  const [localRole, setLocalRole] = useState(targetRoleId || 'sr_data_analyst');
  const [localHours, setLocalHours] = useState(weeklyHours || 5);
  const [isParsing, setIsParsing] = useState(false);
  const [extractedMentions, setExtractedMentions] = useState([]);

  if (!isOpen) return null;

  const handleParseText = async () => {
    if (!freeText.trim()) return;
    setIsParsing(true);
    const res = await parseSkillsFreeText(freeText);
    setIsParsing(false);

    if (res && res.parsed_skills) {
      setLocalSkills(prev => ({
        ...prev,
        ...res.parsed_skills
      }));
      setExtractedMentions(res.detected_mentions || []);
    }
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl glass-panel">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-800 bg-gray-900/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-outfit">Skills & Career Goal Matrix</h2>
              <p className="text-xs text-gray-400">Configure your current capabilities and target role budget</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Target Role & Time Budget Selectors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-gray-800/40 border border-gray-700/50">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                <Target className="w-4 h-4 text-indigo-400" />
                <span>Target Career Goal Role</span>
              </label>
              <select
                value={localRole}
                onChange={e => setLocalRole(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                {roles.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.title} ({r.required_skills?.length || 4} key skill metrics)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                <Clock className="w-4 h-4 text-purple-400" />
                <span>Weekly Time Budget (Hours/Week)</span>
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  min="2"
                  max="20"
                  step="1"
                  value={localHours}
                  onChange={e => setLocalHours(Number(e.target.value))}
                  className="w-full accent-indigo-500"
                />
                <span className="px-3 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 text-sm font-bold border border-indigo-500/30 whitespace-nowrap">
                  {localHours} hrs/wk
                </span>
              </div>
            </div>
          </div>

          {/* Mode Tabs: AI Free-Text vs Slider Matrix */}
          <div className="flex border-b border-gray-800 space-x-4">
            <button
              onClick={() => setActiveMode('freeText')}
              className={`pb-2 text-sm font-semibold transition border-b-2 flex items-center space-x-2 ${
                activeMode === 'freeText'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Free-Text Skill Extractor</span>
            </button>

            <button
              onClick={() => setActiveMode('sliders')}
              className={`pb-2 text-sm font-semibold transition border-b-2 flex items-center space-x-2 ${
                activeMode === 'sliders'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Manual Skill Rating Matrix</span>
            </button>
          </div>

          {/* Mode 1: Free Text Extractor */}
          {activeMode === 'freeText' && (
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-400 mb-2">
                  Describe what skills, tools, or projects you've worked on in plain English. The AI engine will parse your input into structured proficiency levels.
                </p>
                <textarea
                  rows="4"
                  value={freeText}
                  onChange={e => setFreeText(e.target.value)}
                  placeholder="e.g. I have 2 years of experience writing SQL queries, created dashboards in Tableau, and wrote basic Python automation scripts..."
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-between items-center">
                <button
                  onClick={handleParseText}
                  disabled={isParsing || !freeText.trim()}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/20 disabled:opacity-50 transition"
                >
                  <Sparkles className={`w-4 h-4 ${isParsing ? 'animate-spin' : ''}`} />
                  <span>{isParsing ? 'Extracting Skills with AI...' : 'Parse Skills with AI'}</span>
                </button>

                {extractedMentions.length > 0 && (
                  <span className="text-xs text-green-400 flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Extracted {extractedMentions.length} skills</span>
                  </span>
                )}
              </div>

              {/* Display Extracted Tags */}
              {extractedMentions.length > 0 && (
                <div className="p-3 bg-indigo-950/40 border border-indigo-800/40 rounded-xl space-y-2">
                  <div className="text-xs font-semibold text-indigo-300">AI Extracted Skill Levels:</div>
                  <div className="flex flex-wrap gap-2">
                    {extractedMentions.map(m => (
                      <div key={m.skill_id} className="px-2.5 py-1 bg-indigo-900/60 border border-indigo-700/50 rounded-lg text-xs flex items-center space-x-1.5">
                        <span className="text-gray-200 font-medium">{m.skill_name}</span>
                        <span className="px-1.5 py-0.2 bg-indigo-500 text-white rounded text-[10px] font-bold">Lvl {m.estimated_level}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mode 2: Manual Sliders */}
          {activeMode === 'sliders' && (
            <div className="space-y-4">
              <p className="text-xs text-gray-400">
                Rate your current level (1 to 5) across taxonomy skills:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {skills.map(s => {
                  const currentLvl = localSkills[s.id] || 0;
                  return (
                    <div key={s.id} className="p-3 bg-gray-800/40 border border-gray-700/40 rounded-xl space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold text-gray-200">{s.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                          currentLvl === 0 ? 'bg-gray-800 text-gray-400' : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        }`}>
                          Level {currentLvl}/5
                        </span>
                      </div>

                      <input
                        type="range"
                        min="0"
                        max="5"
                        step="1"
                        value={currentLvl}
                        onChange={e => handleSliderChange(s.id, e.target.value)}
                        className="w-full accent-indigo-500"
                      />

                      <div className="text-[11px] text-gray-400 italic">
                        {currentLvl > 0 ? (s.levels?.[String(currentLvl)] || 'Basic familiarity') : 'No experience (Level 0)'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-gray-800 bg-gray-900/80 flex items-center justify-between">
          <div className="text-xs text-gray-400 flex items-center space-x-1">
            <AlertCircle className="w-3.5 h-3.5 text-indigo-400" />
            <span>PathCraft AI will dynamically recalculate gaps upon saving.</span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/20 transition"
            >
              Save & Calculate Gap Analysis
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
