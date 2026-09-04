import React, { useState } from 'react';
import { Flame, Sparkles, CheckCircle2, Award, Clock, ArrowRight, Zap, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

const DAILY_DRILL = {
  id: 'daily_1',
  topic: 'SQL Window Functions',
  question: 'Which window function frame clause ensures cumulative running totals do NOT aggregate duplicates on matching timestamps?',
  options: [
    'ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW',
    'RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW',
    'GROUPS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW',
    'WINDOW IS ACCUMULATIVE ONLY'
  ],
  correctIdx: 0,
  explanation: 'Explicitly specifying ROWS frame ensures deterministic, row-by-row cumulative summation without grouping identical timestamps.'
};

export default function DailyChallengeWidget({ streakDays = 8, onStreakUp }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [isCompletedToday, setIsCompletedToday] = useState(false);

  const handleSelect = (idx) => {
    if (submitted) return;
    setSelectedIdx(idx);
  };

  const handleSubmit = () => {
    setSubmitted(true);
    if (selectedIdx === DAILY_DRILL.correctIdx) {
      setIsCompletedToday(true);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#2563eb', '#f59e0b', '#10b981']
      });
      if (onStreakUp) {
        onStreakUp();
      }
    }
  };

  return (
    <>
      {/* Top Bar Banner Widget */}
      <div className="bg-gradient-to-r from-orange-50/90 via-amber-50/60 to-blue-50/80 border border-orange-200/80 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fadeIn">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-400 text-white flex items-center justify-center shadow-sm shadow-orange-500/30">
            <Flame className="w-6 h-6 fill-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-black text-orange-900 uppercase tracking-wider font-outfit">
                {streakDays}-Day Learning Streak Active!
              </span>
              <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-orange-100 text-orange-800 border border-orange-200">
                +25 XP Boost
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              {isCompletedToday 
                ? 'Daily micro-drill completed! Streak secured for today.' 
                : 'Complete today\'s 60-second micro-challenge to extend your streak.'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(true)}
          disabled={isCompletedToday}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition shadow-xs ${
            isCompletedToday
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
              : 'bg-orange-600 hover:bg-orange-700 text-white shadow-orange-500/20'
          }`}
        >
          {isCompletedToday ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Completed for Today</span>
            </>
          ) : (
            <>
              <Zap className="w-3.5 h-3.5" />
              <span>Start 60-Sec Micro-Drill</span>
            </>
          )}
        </button>
      </div>

      {/* Challenge Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 p-6 space-y-5">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <span className="p-1.5 rounded-lg bg-orange-100 text-orange-700">
                  <Flame className="w-4 h-4 fill-orange-500" />
                </span>
                <div>
                  <h4 className="font-extrabold text-slate-900 font-outfit text-sm">Today's Daily Micro-Drill</h4>
                  <p className="text-[11px] text-slate-500">Topic: {DAILY_DRILL.topic}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-900 leading-relaxed">
                {DAILY_DRILL.question}
              </p>

              <div className="space-y-2">
                {DAILY_DRILL.options.map((opt, idx) => {
                  const isChosen = selectedIdx === idx;
                  let btnStyle = "bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50 text-slate-700";

                  if (submitted) {
                    if (idx === DAILY_DRILL.correctIdx) {
                      btnStyle = "bg-emerald-50 border-emerald-400 text-emerald-900 font-bold";
                    } else if (isChosen) {
                      btnStyle = "bg-rose-50 border-rose-300 text-rose-800";
                    }
                  } else if (isChosen) {
                    btnStyle = "bg-blue-50 border-blue-600 text-blue-900 font-bold ring-1 ring-blue-600";
                  }

                  return (
                    <button
                      key={idx}
                      disabled={submitted}
                      onClick={() => handleSelect(idx)}
                      className={`w-full text-left p-3 rounded-xl border text-xs transition flex items-center justify-between ${btnStyle}`}
                    >
                      <span>{opt}</span>
                      {submitted && idx === DAILY_DRILL.correctIdx && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      )}
                    </button>
                  );
                })}
              </div>

              {submitted && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
                  <div className="font-bold text-slate-900">
                    {selectedIdx === DAILY_DRILL.correctIdx ? 'Correct Answer!' : 'Explanation:'}
                  </div>
                  <p className="text-[11px] leading-relaxed">{DAILY_DRILL.explanation}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900"
              >
                Close
              </button>
              {!submitted ? (
                <button
                  disabled={selectedIdx === null}
                  onClick={handleSubmit}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition disabled:opacity-40"
                >
                  Submit & Extend Streak
                </button>
              ) : (
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition"
                >
                  Done
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
}
