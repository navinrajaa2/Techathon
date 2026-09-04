import React, { useState, useEffect } from 'react';
import { X, Award, CheckCircle2, AlertCircle, HelpCircle, ArrowRight, RefreshCw, Sparkles, Zap } from 'lucide-react';
import { fetchQuiz, fetchDynamicQuiz } from '../services/api';

export default function QuizModal({ isOpen, onClose, skillId, skillName, onQuizCompleted }) {
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [useDynamicAi, setUseDynamicAi] = useState(true);

  const loadQuestions = (isDynamic) => {
    if (!skillId) return;
    setLoading(true);
    setSubmitted(false);
    setAnswers({});

    if (isDynamic) {
      fetchDynamicQuiz(skillName || 'Engineering', 2, 'Senior Specialist', skillId).then(data => {
        setQuiz(data);
        setLoading(false);
      });
    } else {
      fetchQuiz(skillId).then(data => {
        setQuiz(data);
        setLoading(false);
      });
    }
  };

  useEffect(() => {
    if (isOpen && skillId) {
      loadQuestions(useDynamicAi);
    }
  }, [isOpen, skillId]);

  if (!isOpen) return null;

  const handleSelectAnswer = (qId, optionIdx) => {
    if (submitted) return;
    setAnswers(prev => ({
      ...prev,
      [qId]: optionIdx
    }));
  };

  const calculateResult = () => {
    if (!quiz || !quiz.questions) return { score: 0, passed: false, incorrectConcepts: [] };
    let correct = 0;
    const incorrectConcepts = [];
    quiz.questions.forEach(q => {
      if (answers[q.id] === q.correct_index) {
        correct++;
      } else {
        incorrectConcepts.push(q.question || 'PARTITION BY window framing');
      }
    });
    const percent = Math.round((correct / quiz.questions.length) * 100);
    return {
      correctCount: correct,
      totalCount: quiz.questions.length,
      percent,
      passed: percent >= 66,
      incorrectConcepts
    };
  };

  const handleSubmit = () => {
    setSubmitted(true);
    const result = calculateResult();
    setTimeout(() => {
      onQuizCompleted({
        skillId,
        skillName,
        passed: result.passed,
        scorePercent: result.percent,
        incorrectConcepts: result.incorrectConcepts
      });
    }, 1200);
  };

  const result = submitted ? calculateResult() : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-blue-100 text-blue-700 border border-blue-200">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-outfit">Skill Verification Assessment</h2>
              <p className="text-xs text-slate-500">Verifying competency for <strong className="text-blue-700 font-bold">{skillName}</strong></p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                const nextMode = !useDynamicAi;
                setUseDynamicAi(nextMode);
                loadQuestions(nextMode);
              }}
              className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 text-[11px] font-bold flex items-center space-x-1 shadow-2xs transition"
              title="Toggle between Live Gemini Dynamic Scenarios and standard question banks"
            >
              <Zap className="w-3.5 h-3.5 text-blue-600" />
              <span>{useDynamicAi ? '⚡ Gemini AI Active' : 'Static Bank'}</span>
            </button>

            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {loading ? (
            <div className="p-8 text-center text-slate-500">
              <div className="animate-spin w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full mx-auto mb-3"></div>
              <p className="font-semibold text-slate-700">
                {useDynamicAi ? 'Gemini AI is crafting fresh production scenarios...' : 'Loading assessment questions...'}
              </p>
            </div>
          ) : quiz && quiz.questions ? (
            <div className="space-y-6">
              
              {/* Quiz Banner */}
              <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-center justify-between">
                <span>Pass mark: <strong>66% (2/3 correct)</strong> to unlock adaptive acceleration.</span>
                <span className="font-bold text-blue-700">{Object.keys(answers).length}/{quiz.questions.length} Answered</span>
              </div>

              {/* Questions */}
              {quiz.questions.map((q, qIndex) => {
                const selected = answers[q.id];
                return (
                  <div key={q.id || qIndex} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-start space-x-2">
                      <span className="text-xs font-black text-blue-600">Q{qIndex + 1}.</span>
                      <h3 className="text-xs font-bold text-slate-900 flex-1 leading-relaxed">{q.question}</h3>
                    </div>

                    <div className="space-y-2">
                      {q.options.map((opt, optIndex) => {
                        const isChosen = selected === optIndex;
                        let optionStyle = "border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 bg-white text-slate-700";

                        if (submitted) {
                          if (optIndex === q.correct_index) {
                            optionStyle = "border-emerald-300 bg-emerald-50 text-emerald-800 font-bold";
                          } else if (isChosen && optIndex !== q.correct_index) {
                            optionStyle = "border-rose-300 bg-rose-50 text-rose-800";
                          }
                        } else if (isChosen) {
                          optionStyle = "border-blue-600 bg-blue-50 text-blue-900 font-bold ring-1 ring-blue-600";
                        }

                        return (
                          <button
                            key={optIndex}
                            disabled={submitted}
                            onClick={() => handleSelectAnswer(q.id, optIndex)}
                            className={`w-full text-left p-2.5 rounded-xl border text-xs transition flex items-center justify-between ${optionStyle}`}
                          >
                            <span>{opt}</span>
                            {submitted && optIndex === q.correct_index && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />
                            )}
                            {submitted && isChosen && optIndex !== q.correct_index && (
                              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 ml-2" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {submitted && (
                      <div className="mt-2 text-[11px] p-2.5 rounded-lg bg-white border border-slate-200 text-slate-600">
                        <strong className="text-blue-700">Explanation: </strong>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}

            </div>
          ) : (
            <div className="p-6 text-center text-slate-500">
              No questions found for this skill.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-slate-200 bg-slate-50/70">
          <div className="text-xs text-slate-500">
            {submitted && result && (
              <span className={`font-bold ${result.passed ? 'text-emerald-700' : 'text-amber-700'}`}>
                {result.passed ? `Passed with ${result.percent}%!` : `Score: ${result.percent}%. Remedial path recommended.`}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition"
            >
              {submitted ? 'Close' : 'Cancel'}
            </button>

            {!submitted && (
              <button
                onClick={handleSubmit}
                disabled={Object.keys(answers).length < (quiz?.questions?.length || 1)}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition disabled:opacity-40"
              >
                Submit Answers
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
