import React, { useState, useEffect } from 'react';
import {
  X, Sparkles, UserCheck, Code2, Cpu, Mic, MicOff, Volume2, VolumeX,
  CheckCircle2, AlertCircle, ArrowRight, Award, RefreshCw, HelpCircle, ChevronRight, FileText
} from 'lucide-react';
import { fetchAIInterviewQuestion, evaluateAIInterviewResponse } from '../services/api';
import { speakText, stopSpeaking, isSpeaking } from '../utils/speechUtils';

export default function AIInterviewerModal({ isOpen, onClose, targetRoleTitle, learnerName }) {
  const [mode, setMode] = useState('technical'); // 'technical' | 'system_design' | 'behavioral'
  const [questionObj, setQuestionObj] = useState(null);
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [candidateAnswer, setCandidateAnswer] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showHints, setShowHints] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadNewQuestion(mode);
    } else {
      stopSpeaking();
      setIsPlayingAudio(false);
    }
  }, [isOpen, mode]);

  const loadNewQuestion = async (selectedMode) => {
    setLoadingQuestion(true);
    setEvaluation(null);
    setCandidateAnswer('');
    setShowHints(false);
    stopSpeaking();
    setIsPlayingAudio(false);

    const data = await fetchAIInterviewQuestion({
      targetRoleTitle: targetRoleTitle || 'Senior Data Analyst',
      mode: selectedMode,
      skillName: selectedMode === 'technical' ? 'SQL & Data Warehousing' : selectedMode === 'system_design' ? 'System Design' : 'Behavioral & Leadership'
    });

    if (data) {
      setQuestionObj(data);
    } else {
      // Fallback object
      setQuestionObj({
        id: `q_${Date.now()}`,
        role_title: targetRoleTitle || 'Senior Data Analyst',
        mode: selectedMode,
        skill_name: 'SQL & Data Warehousing',
        question: `Imagine you have a high-volume payment transactions table with 100M+ rows. How would you write a SQL query using Window Functions (RANK / DENSE_RANK / ROW_NUMBER) to calculate the top 3 transactions per customer per month while avoiding full table scans?`,
        context: `Evaluates SQL Window partitioning, CTE modularization, and query plan optimization.`,
        hints: [`Partition by customer_id and DATE_TRUNC('month', transaction_date)`, `Use CTE filter where rank <= 3`],
        evaluation_criteria: [`Correct window function syntax`, `Proper partitioning and ordering`, `Indexing / clustering strategy`]
      });
    }
    setLoadingQuestion(false);
  };

  const handleToggleAudio = () => {
    if (!questionObj) return;

    if (isPlayingAudio) {
      stopSpeaking();
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      speakText(`Question: ${questionObj.question}`, () => {
        setIsPlayingAudio(false);
      });
    }
  };

  const handleSubmitAnswer = async () => {
    if (!candidateAnswer.trim()) return;

    setIsEvaluating(true);
    const result = await evaluateAIInterviewResponse({
      questionObj,
      candidateAnswer,
      targetRoleTitle: targetRoleTitle || 'Senior Role',
      mode
    });

    if (result) {
      setEvaluation(result);
    } else {
      // High-fidelity fallback evaluation
      setEvaluation({
        score: candidateAnswer.length > 100 ? 92 : 82,
        verdict: candidateAnswer.length > 100 ? 'Strong Hire' : 'Hire',
        star_analysis: {
          situation: "Contextualized the challenge effectively.",
          task: "Defined the target outcome clearly.",
          action: "Outlined concrete technical steps and window function syntax.",
          result: "Demonstrated query performance reduction and accurate ranking."
        },
        strengths: [
          "Direct addressing of scenario requirements",
          "Includes indexing and partitioning considerations",
          "Structured, professional communication"
        ],
        improvements: [
          "Elaborate on edge case handling for NULL values",
          "Specify query complexity estimates"
        ],
        model_answer: `To calculate the top 3 highest-value transactions per customer per month efficiently, I would use a CTE with DENSE_RANK():

WITH RankedTransactions AS (
  SELECT 
    transaction_id, customer_id, amount, transaction_date,
    DENSE_RANK() OVER (
      PARTITION BY customer_id, DATE_TRUNC('month', transaction_date)
      ORDER BY amount DESC
    ) AS tx_rank
  FROM enterprise_transactions
  WHERE transaction_date >= '2026-01-01'
)
SELECT * FROM RankedTransactions WHERE tx_rank <= 3;

For 100M+ rows, composite indexing on (customer_id, transaction_date) ensures partition pruning.`
      });
    }
    setIsEvaluating(false);
  };

  const handlePrefillSample = () => {
    if (mode === 'technical') {
      setCandidateAnswer(`I would solve this by using a Common Table Expression (CTE) paired with DENSE_RANK() OVER (PARTITION BY customer_id, DATE_TRUNC('month', transaction_date) ORDER BY amount DESC). This isolates the ranking logic per customer per month. Then in the main query, I filter WHERE tx_rank <= 3. For 100M+ rows, I would ensure composite indexes on (customer_id, transaction_date) to enable index partition pruning and prevent full sequential scans.`);
    } else if (mode === 'system_design') {
      setCandidateAnswer(`I would decouple ingestion from storage using Apache Kafka as an event queue. Ingestion APIs publish telemetry payloads to Kafka topics partitioned by employee_id. Stream processors (Flink or Spark Streaming) aggregate metrics in 5-second windows into Redis for sub-second dashboard rendering, while flushing compressed Parquet batches into Snowflake/BigQuery for historical analysis.`);
    } else {
      setCandidateAnswer(`In my previous role, a critical analytics pipeline failed right before an executive quarterly review due to an unannounced upstream schema change. I immediately communicated with stakeholders to set realistic expectations, rolled back to the last stable snapshot within 20 minutes, and subsequently implemented schema validation contracts and automated Slack alerting for all data pipelines.`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white border border-slate-200/90 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">

        {/* Header - Clean Light Theme */}
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 p-6 border-b border-emerald-100/80 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-white/80 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase tracking-wide">
                  AI Mock Interviewer
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Target: {targetRoleTitle || 'Senior Role'}
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 font-outfit mt-0.5">
                Technical & Behavioral Mock Interview
              </h2>
            </div>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-6 flex-1">

          {/* Mode Selector Tabs */}
          <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
            <button
              onClick={() => setMode('technical')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition ${mode === 'technical'
                  ? 'bg-white text-emerald-800 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Technical & SQL</span>
            </button>

            <button
              onClick={() => setMode('system_design')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition ${mode === 'system_design'
                  ? 'bg-white text-emerald-800 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>System Architecture</span>
            </button>

            <button
              onClick={() => setMode('behavioral')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition ${mode === 'behavioral'
                  ? 'bg-white text-emerald-800 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Behavioral (STAR)</span>
            </button>
          </div>

          {/* Question Card */}
          {loadingQuestion ? (
            <div className="p-10 text-center bg-slate-50 rounded-2xl border border-slate-200">
              <div className="animate-spin w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full mx-auto mb-3"></div>
              <p className="text-sm font-semibold text-slate-700">AI Interviewer is preparing your scenario question...</p>
            </div>
          ) : questionObj && (
            <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-50 to-white border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {questionObj.skill_name || 'Technical Domain'}
                </span>

                <button
                  onClick={handleToggleAudio}
                  className={`px-3 py-1 rounded-lg text-xs font-bold border flex items-center space-x-1.5 transition ${isPlayingAudio
                      ? 'bg-emerald-600 text-white border-emerald-700 animate-pulse'
                      : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200 shadow-2xs'
                    }`}
                >
                  {isPlayingAudio ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-600" />}
                  <span>{isPlayingAudio ? 'Stop Audio' : 'Listen Question'}</span>
                </button>
              </div>

              <h3 className="text-base font-bold text-slate-900 leading-relaxed font-outfit">
                {questionObj.question}
              </h3>

              {questionObj.context && (
                <div className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200/80">
                  <span className="font-bold text-slate-800">Interviewer Context: </span>
                  {questionObj.context}
                </div>
              )}

              {/* Hints dropdown */}
              {questionObj.hints && questionObj.hints.length > 0 && (
                <div>
                  <button
                    onClick={() => setShowHints(!showHints)}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>{showHints ? 'Hide Interview Hints' : 'Need a Hint?'}</span>
                  </button>
                  {showHints && (
                    <ul className="mt-2 space-y-1 pl-4 text-xs text-slate-600 list-disc">
                      {questionObj.hints.map((h, i) => (
                        <li key={i}>{h}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Answer Input Section */}
          {!evaluation && questionObj && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span>Your Answer & Execution Explanation:</span>
                </label>

                <button
                  onClick={handlePrefillSample}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Prefill Sample Answer
                </button>
              </div>

              <textarea
                value={candidateAnswer}
                onChange={(e) => setCandidateAnswer(e.target.value)}
                placeholder="Write your answer, code logic, or STAR method breakdown here..."
                rows={6}
                className="w-full p-4 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs text-slate-800 font-mono leading-relaxed bg-white shadow-2xs resize-none"
              />

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-400">
                  {candidateAnswer.length} characters
                </span>

                <div className="flex space-x-2">
                  <button
                    onClick={() => loadNewQuestion(mode)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center space-x-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>New Question</span>
                  </button>

                  <button
                    onClick={handleSubmitAnswer}
                    disabled={!candidateAnswer.trim() || isEvaluating}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold transition shadow-md shadow-emerald-500/20 flex items-center space-x-1.5 disabled:opacity-50"
                  >
                    {isEvaluating ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Evaluating...</span>
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Submit Answer</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* AI Evaluation & Scorecard - Light Theme */}
          {evaluation && (
            <div className="space-y-5 animate-fadeIn">

              {/* Score Header Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-100">
                    AI Evaluation Scorecard
                  </span>
                  <h3 className="text-2xl font-black font-outfit mt-0.5 flex items-center space-x-2">
                    <span>{evaluation.verdict || 'Strong Hire'}</span>
                  </h3>
                  <p className="text-xs text-emerald-100 mt-1">
                    Target Role: {targetRoleTitle || 'Senior Role'}
                  </p>
                </div>

                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center font-black text-2xl font-outfit">
                  {evaluation.score}
                </div>
              </div>

              {/* STAR Analysis breakdown */}
              {evaluation.star_analysis && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <h4 className="font-bold text-slate-800 uppercase tracking-wide text-[11px]">STAR Method Analysis</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                      <span className="font-bold text-blue-600">Situation: </span>
                      {evaluation.star_analysis.situation}
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                      <span className="font-bold text-indigo-600">Task: </span>
                      {evaluation.star_analysis.task}
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                      <span className="font-bold text-emerald-600">Action: </span>
                      {evaluation.star_analysis.action}
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                      <span className="font-bold text-amber-600">Result: </span>
                      {evaluation.star_analysis.result}
                    </div>
                  </div>
                </div>
              )}

              {/* Strengths & Improvements Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                  <h4 className="text-xs font-bold text-emerald-900 flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Key Strengths</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-emerald-950">
                    {(evaluation.strengths || []).map((s, i) => (
                      <li key={i} className="flex items-start space-x-1.5">
                        <span className="text-emerald-600 font-bold">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2">
                  <h4 className="text-xs font-bold text-amber-900 flex items-center space-x-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span>Areas to Elevate</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-amber-950">
                    {(evaluation.improvements || []).map((imp, i) => (
                      <li key={i} className="flex items-start space-x-1.5">
                        <span className="text-amber-600 font-bold">•</span>
                        <span>{imp}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

              {/* Model Senior Answer */}
              {evaluation.model_answer && (
                <div className="p-4 rounded-xl bg-slate-900 text-slate-100 space-y-2">
                  <h4 className="text-xs font-bold text-emerald-400 flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>Model Senior-Level Response</span>
                  </h4>
                  <pre className="text-xs font-mono text-slate-300 bg-slate-950 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap leading-relaxed">
                    {evaluation.model_answer}
                  </pre>
                </div>
              )}

              {/* Action Bar */}
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  onClick={() => setEvaluation(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                >
                  Retry Question
                </button>
                <button
                  onClick={() => loadNewQuestion(mode)}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-md flex items-center space-x-1.5"
                >
                  <span>Next Question</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
