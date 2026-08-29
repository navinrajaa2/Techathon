import React, { useState } from 'react';
import { 
  Sparkles, Calendar, Clock, BookOpen, ExternalLink, CheckCircle2, Award, ArrowRight, 
  ShieldCheck, PlayCircle, RotateCw, Lightbulb, Bot, Download, Coffee, FileCheck, Volume2, VolumeX, Zap, FileText, Code2, MessageSquare, Trophy 
} from 'lucide-react';
import { generateAndDownloadICS } from '../utils/calendarUtils';
import { speakText, stopSpeaking, isSpeaking } from '../utils/speechUtils';
import YearHeatmap from './YearHeatmap';
import DailyChallengeWidget from './DailyChallengeWidget';

export default function RoadmapView({ 
  learningPath, 
  onStartQuiz, 
  onOpenMentor, 
  onOpenCertificate, 
  onOpenMentorship,
  onOpenRoleplay,
  onOpenPromotionMemo,
  onOpenPlayground,
  onOpenSlack,
  onOpenLeaderboard,
  learnerName
}) {
  const [activeSpeakingStep, setActiveSpeakingStep] = useState(null);

  if (!learningPath || !learningPath.phases) {
    return (
      <div className="p-12 text-center text-slate-500 bg-white border border-slate-200 shadow-sm rounded-2xl">
        <div className="animate-spin w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full mx-auto mb-3"></div>
        <p className="font-semibold text-slate-700">Generating your personalized adaptive roadmap...</p>
        <p className="text-xs text-slate-400 mt-1">Analyzing skill requirements, course prerequisites, and learning pace</p>
      </div>
    );
  }

  const { target_role_title, weekly_hours_budget, total_estimated_weeks, total_estimated_hours, phases, roadmap_steps, ai_summary_narrative } = learningPath;

  const completedCount = roadmap_steps.filter(s => s.status === 'verified').length;
  const progressPercent = Math.round((completedCount / (roadmap_steps.length || 1)) * 100);

  const handleDownloadCalendar = () => {
    generateAndDownloadICS({
      roleTitle: target_role_title,
      weeklyHours: weekly_hours_budget,
      roadmapSteps: roadmap_steps
    });
  };

  const handleToggleVoice = (step) => {
    if (activeSpeakingStep === step.step_number) {
      stopSpeaking();
      setActiveSpeakingStep(null);
    } else {
      setActiveSpeakingStep(step.step_number);
      const textToRead = `Lesson for step ${step.step_number}. ${step.course?.title}. Target skill: ${step.skill_name}. Why this course was chosen: ${step.ai_explanation}. Core learning takeaways: ${step.course?.key_takeaways || 'Practical industry implementation.'}`;
      speakText(textToRead, () => {
        setActiveSpeakingStep(null);
      });
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Daily Challenge & Streak Widget */}
      <DailyChallengeWidget streakDays={8} />

      {/* Header Summary Banner */}
      <div className="bg-gradient-to-br from-white via-blue-50/40 to-indigo-50/50 rounded-2xl p-6 sm:p-8 border border-blue-200/80 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16"></div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          
          <div className="space-y-2.5 max-w-3xl">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200 flex items-center space-x-1.5 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>AI Adaptive Career Roadmap</span>
              </span>
              <span className="text-xs font-medium text-slate-500 bg-white/80 px-2.5 py-0.5 rounded-full border border-slate-200">
                Pace: {weekly_hours_budget} hrs/week
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-outfit">
              Learning Roadmap for <span className="gradient-text">{target_role_title}</span>
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed font-normal">
              {ai_summary_narrative}
            </p>

            {/* Quick Action Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <button
                onClick={() => onOpenPlayground('SQL & Data Warehousing')}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-xs transition active:scale-95"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>💻 Code & SQL Playground</span>
              </button>


              <button
                onClick={onOpenRoleplay}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold flex items-center space-x-1.5 shadow-2xs transition"
              >
                <Zap className="w-3.5 h-3.5 text-blue-600" />
                <span>🎮 Roleplay Simulator</span>
              </button>

              <button
                onClick={onOpenLeaderboard}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-center space-x-1.5 shadow-2xs transition"
              >
                <Trophy className="w-3.5 h-3.5 text-amber-600" />
                <span>🏆 Leaderboard</span>
              </button>

              <button
                onClick={onOpenSlack}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-purple-50 border border-purple-200 text-purple-900 text-xs font-bold flex items-center space-x-1.5 shadow-2xs transition"
              >
                <MessageSquare className="w-3.5 h-3.5 text-purple-600" />
                <span>💬 Slack Bot</span>
              </button>

              <button
                onClick={onOpenPromotionMemo}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold flex items-center space-x-1.5 shadow-2xs transition"
              >
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                <span>📊 Promotion Pitch</span>
              </button>

              <button
                onClick={handleDownloadCalendar}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold flex items-center space-x-1.5 shadow-2xs transition"
                title="Sync weekly study blocks into Google Calendar, Outlook or Apple Calendar"
              >
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>Sync Calendar (.ics)</span>
              </button>

              <button
                onClick={onOpenCertificate}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold flex items-center space-x-1.5 shadow-2xs transition"
              >
                <FileCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Verified Certificate</span>
              </button>

              <button
                onClick={onOpenMentorship}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-center space-x-1.5 shadow-2xs transition"
              >
                <Coffee className="w-3.5 h-3.5 text-amber-600" />
                <span>Peer Mentorship</span>
              </button>

              <button
                onClick={() => onOpenMentor({ name: 'Roadmap & Career Strategy' })}
                className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-bold flex items-center space-x-1.5 transition"
              >
                <Bot className="w-3.5 h-3.5 text-blue-600" />
                <span>AI Mentor Co-Pilot</span>
              </button>
            </div>
          </div>

          {/* Key Metrics Badges */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="px-4 py-3 rounded-xl bg-white border border-slate-200/80 shadow-xs text-center min-w-[110px]">
              <div className="text-[11px] text-slate-400 uppercase font-bold flex items-center space-x-1 justify-center">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>Timeline</span>
              </div>
              <div className="text-lg font-black text-slate-900 font-outfit mt-0.5">{total_estimated_weeks} Weeks</div>
            </div>

            <div className="px-4 py-3 rounded-xl bg-white border border-slate-200/80 shadow-xs text-center min-w-[110px]">
              <div className="text-[11px] text-slate-400 uppercase font-bold flex items-center space-x-1 justify-center">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                <span>Total Time</span>
              </div>
              <div className="text-lg font-black text-slate-900 font-outfit mt-0.5">{total_estimated_hours} Hours</div>
            </div>

            <div className="px-4 py-3 rounded-xl bg-white border border-blue-200/80 shadow-xs text-center min-w-[110px]">
              <div className="text-[11px] text-blue-600 uppercase font-bold flex items-center space-x-1 justify-center">
                <Award className="w-3.5 h-3.5 text-blue-600" />
                <span>Mastered</span>
              </div>
              <div className="text-lg font-black text-blue-700 font-outfit mt-0.5">{completedCount}/{roadmap_steps.length} Skills</div>
            </div>
          </div>

        </div>

        {/* Progress Bar */}
        <div className="mt-6 pt-5 border-t border-slate-200/80 flex items-center space-x-4">
          <span className="text-xs font-bold text-slate-600 whitespace-nowrap">Roadmap Progress:</span>
          <div className="flex-1 bg-slate-200/70 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 h-full rounded-full transition-all duration-700 shadow-xs" 
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <span className="text-xs font-black text-blue-700">{progressPercent}%</span>
        </div>

      </div>

      {/* 365-Day Learning Activity Heatmap */}
      <YearHeatmap learnerName={learnerName} />

      {/* Phases Timeline */}
      <div className="space-y-8">
        {phases.map((phase, pIndex) => (
          <div key={phase.phase_number} className="space-y-4">
            
            {/* Phase Banner */}
            <div className="flex items-center space-x-3 pb-2 border-b border-slate-200">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold font-outfit text-sm shadow-sm shadow-blue-500/20">
                0{phase.phase_number}
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 font-outfit">{phase.title}</h2>
                <p className="text-xs text-slate-500 font-medium">{phase.description}</p>
              </div>
            </div>

            {/* Steps Cards */}
            <div className="space-y-4 pl-4 border-l-2 border-blue-200">
              {phase.steps.map((step) => {
                const course = step.course;
                const isVerified = step.status === 'verified';
                const isThisStepSpeaking = activeSpeakingStep === step.step_number;

                return (
                  <div 
                    key={step.step_number}
                    className={`relative p-5 sm:p-6 rounded-2xl transition bg-white border ${
                      isVerified
                        ? 'border-emerald-200 shadow-sm shadow-emerald-900/5 ring-1 ring-emerald-400/20'
                        : 'border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md'
                    }`}
                  >
                    {/* Step Timeline Indicator dot */}
                    <div className={`absolute -left-[23px] top-7 w-3 h-3 rounded-full border-2 ${
                      isVerified 
                        ? 'bg-emerald-500 border-white shadow-md ring-2 ring-emerald-200' 
                        : 'bg-blue-600 border-white ring-2 ring-blue-100'
                    }`} />

                    <div className="flex flex-col lg:flex-row items-start justify-between gap-5">
                      
                      <div className="space-y-3.5 flex-1">
                        
                        {/* Tags Header */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            Week {step.start_week}-{step.end_week} ({step.estimated_hours} hrs)
                          </span>
                          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                            {course.provider}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 flex items-center space-x-1">
                            <span>★</span>
                            <span>{course.rating || 4.8}</span>
                          </span>
                          
                          {isVerified && (
                            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Verified Mastery</span>
                            </span>
                          )}

                          {/* Voice Narration Button */}
                          <button
                            onClick={() => handleToggleVoice(step)}
                            className={`px-2 py-0.5 rounded-md text-[11px] font-bold border flex items-center space-x-1 transition ${
                              isThisStepSpeaking
                                ? 'bg-indigo-600 text-white border-indigo-700 animate-pulse'
                                : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                            title="Listen to 1-minute voice audio summary of this module"
                          >
                            {isThisStepSpeaking ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3 text-blue-600" />}
                            <span>{isThisStepSpeaking ? 'Stop Audio' : '🎙️ Listen (Audio)'}</span>
                          </button>
                        </div>

                        {/* Title */}
                        <div>
                          <h3 className="text-base font-bold text-slate-900 font-outfit flex items-center space-x-2">
                            <span>Step {step.step_number}: {course.title}</span>
                          </h3>
                          <p className="text-xs text-slate-500 mt-1">
                            Target Skill: <strong className="text-slate-800 font-semibold">{step.skill_name}</strong> (Current Lvl {step.current_level} → Target Lvl {step.required_level})
                          </p>
                        </div>

                        {/* AI Reasoning Explainability Box */}
                        <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200/70 text-xs text-blue-950 flex items-start space-x-2.5">
                          <Lightbulb className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-blue-900">Why this was chosen: </span>
                            <span className="text-blue-800 font-normal leading-relaxed">{step.ai_explanation}</span>
                          </div>
                        </div>

                        {/* Key Takeaways */}
                        {course.key_takeaways && (
                          <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                            <span className="font-bold text-slate-700 block mb-1">What you'll master:</span>
                            {course.key_takeaways}
                          </div>
                        )}

                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-row lg:flex-col items-center lg:items-end gap-2.5 shrink-0 w-full lg:w-auto pt-2 lg:pt-0">
                        <button
                          onClick={() => onOpenPlayground(step.skill_name)}
                          className="flex-1 lg:flex-initial px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white flex items-center justify-center space-x-1.5 transition shadow-xs"
                          title="Open in-browser SQL & code execution workbench"
                        >
                          <Code2 className="w-3.5 h-3.5 text-blue-400" />
                          <span>Code Workbench</span>
                        </button>

                        <button
                          onClick={() => onOpenMentor({ id: step.skill_id, name: step.skill_name })}
                          className="flex-1 lg:flex-initial px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-xs font-bold text-blue-800 border border-blue-200 flex items-center justify-center space-x-1.5 transition"
                          title="Ask AI Mentor for simplified analogies, code hints, or practice questions"
                        >
                          <Bot className="w-3.5 h-3.5 text-blue-600" />
                          <span>Ask AI Mentor</span>
                        </button>

                        <a
                          href={course.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 lg:flex-initial px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 border border-slate-200 shadow-xs flex items-center justify-center space-x-1.5 transition"
                        >
                          <PlayCircle className="w-4 h-4 text-blue-600" />
                          <span>Open Resource</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </a>

                        <button
                          onClick={() => onStartQuiz(step.skill_id, step.skill_name)}
                          disabled={isVerified}
                          className={`flex-1 lg:flex-initial px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition shadow-xs ${
                            isVerified
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 opacity-90 cursor-default'
                              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-500/20'
                          }`}
                        >
                          <Award className="w-4 h-4" />
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
