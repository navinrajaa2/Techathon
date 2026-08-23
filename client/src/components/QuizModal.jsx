import React, { useState, useEffect } from 'react';
import { X, Award, CheckCircle2, AlertCircle, HelpCircle, ArrowRight, RefreshCw, Sparkles } from 'lucide-react';
import { fetchQuiz } from '../services/api';

export default function QuizModal({ isOpen, onClose, skillId, skillName, onQuizCompleted }) {
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && skillId) {
      setLoading(true);
      setSubmitted(false);
      setAnswers({});
      fetchQuiz(skillId).then(data => {
        setQuiz(data);
        setLoading(false);
      });
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
    if (!quiz || !quiz.questions) return { score: 0, passed: false };
    let correct = 0;
    quiz.questions.forEach(q => {
      if (answers[q.id] === q.correct_index) {
        correct++;
      }
    });
    const percent = Math.round((correct / quiz.questions.length) * 100);
    return {
      correctCount: correct,
      totalCount: quiz.questions.length,
      percent,
      passed: percent >= 66
    };
  };

  const handleSubmit = () => {
    setSubmitted(true);
    const result = calculateResult();
    setTimeout(() => {
      onQuizCompleted({
        skillId,
        passed: result.passed,
        scorePercent: result.percent
      });
    }, 1200);
  };

  const result = submitted ? calculateResult() : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl glass-panel">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-800 bg-gray-900/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-outfit">Skill Verification Assessment</h2>
              <p className="text-xs text-gray-400">Verifying competency for <strong className="text-indigo-300">{skillName}</strong></p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading Assessment Questions...</div>
          ) : quiz && quiz.questions ? (
            <>
              {/* Quiz Questions */}
              {quiz.questions.map((q, idx) => {
                const isSelected = answers[q.id] !== undefined;
                return (
                  <div key={q.id} className="space-y-3 p-4 bg-gray-800/40 border border-gray-700/40 rounded-xl">
                    <div className="flex items-start space-x-2">
                      <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold text-xs">Q{idx + 1}</span>
                      <h3 className="text-sm font-semibold text-white">{q.question}</h3>
                    </div>

                    <div className="space-y-2 pl-6">
                      {q.options.map((opt, optIdx) => {
                        const isChosen = answers[q.id] === optIdx;
                        const isCorrect = q.correct_index === optIdx;

                        let style = "border-gray-800 bg-gray-900/60 text-gray-300 hover:bg-gray-800/80";
                        if (submitted) {
                          if (isCorrect) style = "border-emerald-500/60 bg-emerald-950/40 text-emerald-200 font-semibold";
                          else if (isChosen && !isCorrect) style = "border-pink-500/60 bg-pink-950/40 text-pink-200";
                        } else if (isChosen) {
                          style = "border-indigo-500 bg-indigo-950/40 text-indigo-200 font-medium";
                        }

                        return (
                          <button
                            key={optIdx}
                            disabled={submitted}
                            onClick={() => handleSelectAnswer(q.id, optIdx)}
                            className={`w-full text-left p-3 rounded-xl border text-xs transition flex items-center justify-between ${style}`}
                          >
                            <span>{opt}</span>
                            {submitted && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />}
                          </button>
                        );
                      })}
                    </div>

                    {submitted && (
                      <div className="mt-2 text-xs text-gray-400 bg-gray-950/60 p-2.5 rounded-lg border border-gray-800">
                        <span className="font-semibold text-indigo-300 block mb-0.5">Explanation:</span>
                        {q.explanation}
                      </div>
                    )}

                  </div>
                );
              })}
            </>
          ) : (
            <div className="p-4 text-gray-400">Failed to load quiz.</div>
          )}
        </div>

        {/* Result Banner / Footer */}
        <div className="p-4 border-t border-gray-800 bg-gray-900/80 flex items-center justify-between">
          {submitted ? (
            <div className="flex items-center space-x-3 w-full justify-between">
              <div className="flex items-center space-x-2">
                {result.passed ? (
                  <span className="text-xs font-bold text-emerald-400 flex items-center space-x-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Passed! Score: {result.percent}% — Re-planning roadmap...</span>
                  </span>
                ) : (
                  <span className="text-xs font-bold text-pink-400 flex items-center space-x-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>Score: {result.percent}%. Recommended remedial review.</span>
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-white rounded-xl"
              >
                Close & View Updated Roadmap
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-gray-400">
                Answer all {quiz?.questions?.length || 3} questions to verify skill.
              </span>
              <button
                onClick={handleSubmit}
                disabled={Object.keys(answers).length < (quiz?.questions?.length || 3)}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-indigo-500/20 transition"
              >
                Submit Assessment & Verify
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
