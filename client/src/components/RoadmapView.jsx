import React from 'react';
import { 
  Sparkles, Calendar, Clock, BookOpen, ExternalLink, CheckCircle2, Award, ArrowRight, ShieldCheck, PlayCircle, RotateCw 
} from 'lucide-react';

export default function RoadmapView({ learningPath, onStartQuiz, onReplanClick }) {
  if (!learningPath || !learningPath.phases) {
    return (
      <div className="p-8 text-center text-gray-400 glass-card rounded-2xl">
        Generating Adaptive Learning Roadmap...
      </div>
    );
  }

  const { target_role_title, weekly_hours_budget, total_estimated_weeks, total_estimated_hours, phases, roadmap_steps, ai_summary_narrative } = learningPath;

  const completedCount = roadmap_steps.filter(s => s.status === 'verified').length;
  const progressPercent = Math.round((completedCount / (roadmap_steps.length || 1)) * 100);

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header Summary Banner */}
      <div className="glass-panel rounded-2xl p-6 border border-indigo-500/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -mr-10 -mt-10"></div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>AI-Generated Adaptive Roadmap</span>
              </span>
              <span className="text-xs text-gray-400">Budget: {weekly_hours_budget} hrs/week</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-outfit">
              Learning Path for <span className="gradient-text">{target_role_title}</span>
            </h1>
            <p className="text-sm text-gray-300">
              {ai_summary_narrative}
            </p>
          </div>

          {/* Key Metrics Pill Badges */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="px-4 py-2.5 rounded-xl bg-gray-900/80 border border-gray-800 text-center">
              <div className="text-[10px] text-gray-400 uppercase font-semibold flex items-center space-x-1 justify-center">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                <span>Timeline</span>
              </div>
              <div className="text-base font-black text-white font-outfit">{total_estimated_weeks} Weeks</div>
            </div>

            <div className="px-4 py-2.5 rounded-xl bg-gray-900/80 border border-gray-800 text-center">
              <div className="text-[10px] text-gray-400 uppercase font-semibold flex items-center space-x-1 justify-center">
                <Clock className="w-3.5 h-3.5 text-purple-400" />
                <span>Total Commitment</span>
              </div>
              <div className="text-base font-black text-white font-outfit">{total_estimated_hours} Hours</div>
            </div>

            <div className="px-4 py-2.5 rounded-xl bg-gray-900/80 border border-gray-800 text-center">
              <div className="text-[10px] text-gray-400 uppercase font-semibold flex items-center space-x-1 justify-center">
                <Award className="w-3.5 h-3.5 text-pink-400" />
                <span>Verified Mastery</span>
              </div>
              <div className="text-base font-black text-indigo-300 font-outfit">{completedCount}/{roadmap_steps.length} Modules</div>
            </div>
          </div>

        </div>

        {/* Progress Bar */}
        <div className="mt-6 pt-4 border-t border-gray-800/80 flex items-center space-x-4">
          <span className="text-xs font-semibold text-gray-400 whitespace-nowrap">Overall Path Completion:</span>
          <div className="flex-1 bg-gray-900 rounded-full h-2.5 overflow-hidden border border-gray-800">
            <div 
              className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-full rounded-full transition-all duration-700" 
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <span className="text-xs font-bold text-indigo-300">{progressPercent}%</span>
        </div>

      </div>

      {/* Phases Timeline */}
      <div className="space-y-8">
        {phases.map((phase, pIndex) => (
          <div key={phase.phase_number} className="space-y-4">
            
            {/* Phase Banner */}
            <div className="flex items-center space-x-3 pb-2 border-b border-gray-800">
              <div className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold font-outfit text-sm">
                0{phase.phase_number}
              </div>
              <div>
                <h2 className="text-lg font-bold text-white font-outfit">{phase.title}</h2>
                <p className="text-xs text-gray-400">{phase.description}</p>
              </div>
            </div>

            {/* Steps Cards */}
            <div className="space-y-4 pl-4 border-l-2 border-indigo-900/40">
              {phase.steps.map((step) => {
                const course = step.course;
                const isVerified = step.status === 'verified';

                return (
                  <div 
                    key={step.step_number}
                    className={`relative p-5 rounded-2xl glass-card border transition ${
                      isVerified
                        ? 'border-emerald-500/40 bg-emerald-950/10'
                        : 'border-gray-800 bg-gray-900/40'
                    }`}
                  >
                    {/* Step Timeline Indicator dot */}
                    <div className={`absolute -left-[23px] top-6 w-3 h-3 rounded-full border-2 ${
                      isVerified ? 'bg-emerald-500 border-emerald-300 shadow-md shadow-emerald-500/50' : 'bg-indigo-600 border-gray-900'
                    }`} />

                    <div className="flex flex-col lg:flex-row items-start justify-between gap-4">
                      
                      <div className="space-y-3 flex-1">
                        
                        {/* Tags Header */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            Week {step.start_week}-{step.end_week} ({step.estimated_hours} hrs)
                          </span>
                          <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-gray-800 text-gray-300 border border-gray-700">
                            {course.provider}
                          </span>
                          <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-gray-800 text-gray-300 border border-gray-700">
                            Rating ★ {course.rating || 4.8}
                          </span>
                          
                          {isVerified && (
                            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center space-x-1">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>Verified Mastery</span>
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <div>
                          <h3 className="text-base font-bold text-white font-outfit flex items-center space-x-2">
                            <span>Step {step.step_number}: {course.title}</span>
                          </h3>
                          <p className="text-xs text-gray-400 mt-1">Skill Target: <strong className="text-gray-200">{step.skill_name}</strong> (Lvl {step.current_level} → Lvl {step.required_level})</p>
                        </div>

                        {/* AI Reasoning Explainability Box */}
                        <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/40 text-xs text-indigo-200 flex items-start space-x-2">
                          <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold text-indigo-300">Why AI Picked This Course: </span>
                            <span>{step.ai_explanation}</span>
                          </div>
                        </div>

                        {/* Key Takeaways */}
                        {course.key_takeaways && (
                          <div className="text-xs text-gray-300 bg-gray-950/60 p-3 rounded-xl border border-gray-800/80">
                            <span className="font-semibold text-gray-400 block mb-1">Core Learning Takeaways:</span>
                            {course.key_takeaways}
                          </div>
                        )}

                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-row lg:flex-col items-center lg:items-end gap-2 shrink-0 w-full lg:w-auto pt-2 lg:pt-0">
                        <a
                          href={course.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 lg:flex-initial px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-white border border-gray-700 flex items-center justify-center space-x-1.5 transition"
                        >
                          <PlayCircle className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Open Resource</span>
                          <ExternalLink className="w-3 h-3 text-gray-400" />
                        </a>

                        <button
                          onClick={() => onStartQuiz(step.skill_id, step.skill_name)}
                          disabled={isVerified}
                          className={`flex-1 lg:flex-initial px-4 py-2 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition shadow-lg ${
                            isVerified
                              ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-800 opacity-80 cursor-default'
                              : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-500/20'
                          }`}
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span>{isVerified ? 'Verified with Quiz' : 'Take Verification Quiz'}</span>
                        </button>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
