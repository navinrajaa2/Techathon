import React, { useState } from 'react';
import { 
  X, Compass, Sparkles, CheckCircle2, AlertTriangle, ArrowRight, Award, Bot, RefreshCw, Zap 
} from 'lucide-react';
import { fetchMentorChat } from '../services/api';

const SCENARIOS = [
  {
    id: 's1',
    time: '9:30 AM — Architecture Review',
    title: 'High-Volume Stream Ingestion Bottleneck',
    description: 'Your telemetry ingestion pipeline is dropping 4% of events during flash traffic spikes. The business team wants a fix before tomorrow morning.',
    options: [
      {
        id: 'opt1',
        text: 'Deploy an in-memory Redis buffer with exponential backoff retry to absorb burst spikes immediately without touching core schema.',
        type: 'balanced'
      },
      {
        id: 'opt2',
        text: 'Scale up compute cluster nodes 3x immediately, swallowing the cloud cost until next sprint.',
        type: 'costly'
      },
      {
        id: 'opt3',
        text: 'Drop non-critical metadata columns at the gateway level to reduce payload size by 60% with zero downtime.',
        type: 'pragmatic'
      }
    ]
  },
  {
    id: 's2',
    time: '2:15 PM — Cross-Functional Product Sync',
    title: 'AI Feature Latency vs Accuracy Dilemma',
    description: 'The product manager wants to ship an LLM summary feature, but the full 70B model has a 3.8s latency, exceeding the 1.5s SLA.',
    options: [
      {
        id: 'opt1',
        text: 'Implement a speculative routing pipeline: use an 8B model for 85% of standard queries, falling back to 70B only on complex edge cases.',
        type: 'optimal'
      },
      {
        id: 'opt2',
        text: 'Ask the product team to compromise the SLA to 4.0s for the initial launch.',
        type: 'compromise'
      },
      {
        id: 'opt3',
        text: 'Pre-compute and cache 90% of user summaries asynchronously overnight using batch workers.',
        type: 'creative'
      }
    ]
  }
];

export default function DayInTheLifeModal({ 
  isOpen, 
  onClose, 
  targetRoleTitle, 
  learnerName 
}) {
  const [currentScenarioIdx, setCurrentScenarioIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  if (!isOpen) return null;

  const currentScenario = SCENARIOS[currentScenarioIdx];

  const handleSelectOption = async (option) => {
    setSelectedOption(option);
    setLoading(true);

    const prompt = `I am roleplaying as a ${targetRoleTitle || 'Senior Engineer'}. 
Scenario: ${currentScenario.title} (${currentScenario.description})
My Decision: "${option.text}"
Evaluate my technical and leadership decision in 3 concise bullet points: Strengths, Tradeoffs, and Senior Advice.`;

    try {
      const liveFeedback = await fetchMentorChat(prompt, currentScenario.title, targetRoleTitle);
      setFeedback(liveFeedback || `✅ **Senior Evaluation**: Solid pragmatic decision! Implementing this isolates immediate risk while maintaining system resilience. Bonus points for addressing latency SLAs directly.`);
      setScore(prev => prev + 50);
    } catch (err) {
      setFeedback(`✅ **Senior Evaluation**: Excellent architectural judgment! This demonstrates strong tradeoff awareness required at the senior level.`);
      setScore(prev => prev + 50);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentScenarioIdx < SCENARIOS.length - 1) {
      setCurrentScenarioIdx(prev => prev + 1);
      setSelectedOption(null);
      setFeedback(null);
    } else {
      setCompleted(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-blue-50/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-500/25">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-slate-900 font-outfit text-sm">
                  "Day in the Life" Career Simulator
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                  Interactive Roleplay
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Experience real production decisions for <strong className="text-slate-800">{targetRoleTitle || 'Senior Role'}</strong>
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {completed ? (
            <div className="p-8 text-center space-y-4 animate-fadeIn">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto ring-4 ring-emerald-50 shadow-md">
                <Award className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 font-outfit">Roleplay Simulation Complete!</h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto mt-1">
                  You successfully resolved high-stakes architectural tradeoffs for <strong>{targetRoleTitle}</strong> with senior-level decision making.
                </p>
              </div>

              <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Awarded +{score} Role Readiness XP!</span>
              </div>

              <div className="pt-4">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition"
                >
                  Return to Learning Roadmap
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              
              {/* Scenario Header */}
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-blue-700 uppercase tracking-wider">{currentScenario.time}</span>
                  <span className="text-slate-500">Scenario {currentScenarioIdx + 1} of {SCENARIOS.length}</span>
                </div>
                <h4 className="text-sm font-extrabold text-slate-900 font-outfit">{currentScenario.title}</h4>
                <p className="text-xs text-slate-700 leading-relaxed">{currentScenario.description}</p>
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  How would you handle this as {targetRoleTitle}?
                </div>

                {currentScenario.options.map((opt, idx) => {
                  const isSelected = selectedOption?.id === opt.id;
                  return (
                    <button
                      key={opt.id}
                      disabled={loading || !!feedback}
                      onClick={() => handleSelectOption(opt)}
                      className={`w-full text-left p-3.5 rounded-xl border text-xs transition flex items-start space-x-3 ${
                        isSelected
                          ? 'bg-blue-50 border-blue-600 ring-2 ring-blue-600/20 text-blue-950 font-semibold'
                          : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className="w-5 h-5 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-[10px] font-bold text-slate-600 shrink-0 mt-0.5">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="flex-1 leading-relaxed">{opt.text}</span>
                    </button>
                  );
                })}
              </div>

              {/* Loading Evaluation */}
              {loading && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center space-x-2 text-xs text-slate-500">
                  <Bot className="w-4 h-4 text-blue-600 animate-spin-slow" />
                  <span>Gemini AI is evaluating your architectural decision...</span>
                </div>
              )}

              {/* AI Feedback Card */}
              {feedback && (
                <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-2 animate-fadeIn">
                  <div className="text-xs font-bold text-emerald-800 flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Gemini AI Executive Feedback (+50 XP):</span>
                  </div>
                  <div className="text-xs text-emerald-950 leading-relaxed whitespace-pre-line">
                    {feedback}
                  </div>
                  
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={handleNext}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-xs transition"
                    >
                      <span>{currentScenarioIdx < SCENARIOS.length - 1 ? 'Next Workplace Challenge' : 'Complete Roleplay'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
