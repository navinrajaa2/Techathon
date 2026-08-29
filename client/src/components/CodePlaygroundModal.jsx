import React, { useState } from 'react';
import { 
  X, Code2, Play, Sparkles, CheckCircle2, AlertTriangle, Terminal, Database, RefreshCw, Award, Copy, Check 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { reviewCode } from '../services/api';

const DEFAULT_CHALLENGES = {
  sql: {
    language: 'sql',
    title: 'SQL Window Function: 7-Day Rolling Revenue',
    prompt: 'Write a query to calculate cumulative running revenue per customer order, ordering by transaction_date with explicit deterministic ROWS frame.',
    initialCode: `-- Write your production SQL query below:
SELECT 
    customer_id,
    transaction_date,
    amount,
    SUM(amount) OVER (
        PARTITION BY customer_id 
        ORDER BY transaction_date, order_id
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS running_total
FROM sales_transactions
ORDER BY customer_id, transaction_date;`,
    mockResult: [
      { customer_id: 'CUST-101', transaction_date: '2026-08-01', amount: '$120.00', running_total: '$120.00' },
      { customer_id: 'CUST-101', transaction_date: '2026-08-05', amount: '$85.00', running_total: '$205.00' },
      { customer_id: 'CUST-101', transaction_date: '2026-08-12', amount: '$310.00', running_total: '$515.00' },
      { customer_id: 'CUST-204', transaction_date: '2026-08-02', amount: '$450.00', running_total: '$450.00' },
      { customer_id: 'CUST-204', transaction_date: '2026-08-14', amount: '$150.00', running_total: '$600.00' }
    ]
  },
  python: {
    language: 'python',
    title: 'Python Pandas: Vectorized Data Normalization',
    prompt: 'Clean raw telemetry payloads, filter outliers beyond 3 standard deviations, and compute moving averages with vectorization.',
    initialCode: `import pandas as pd
import numpy as np

def clean_telemetry(df: pd.DataFrame) -> pd.DataFrame:
    # 1. Fill missing latency values with median
    df['latency_ms'] = df['latency_ms'].fillna(df['latency_ms'].median())
    
    # 2. Vectorized 3-sigma outlier filtering
    mean = df['latency_ms'].mean()
    std = df['latency_ms'].std()
    filtered = df[(df['latency_ms'] >= mean - 3*std) & (df['latency_ms'] <= mean + 3*std)].copy()
    
    # 3. 5-point rolling smoothed trend
    filtered['smoothed_trend'] = filtered['latency_ms'].rolling(window=5, min_periods=1).mean()
    return filtered`,
    mockResult: [
      { timestamp: '18:00:01', latency_ms: '42.1ms', status: '200 OK', smoothed_trend: '42.1ms' },
      { timestamp: '18:00:02', latency_ms: '44.5ms', status: '200 OK', smoothed_trend: '43.3ms' },
      { timestamp: '18:00:03', latency_ms: '41.8ms', status: '200 OK', smoothed_trend: '42.8ms' },
      { timestamp: '18:00:04', latency_ms: '43.2ms', status: '200 OK', smoothed_trend: '42.9ms' }
    ]
  }
};

export default function CodePlaygroundModal({ 
  isOpen, 
  onClose, 
  skillName, 
  onCodePassed 
}) {
  const [selectedLang, setSelectedLang] = useState('sql');
  const [code, setCode] = useState(DEFAULT_CHALLENGES.sql.initialCode);
  const [output, setOutput] = useState(null);
  const [review, setReview] = useState(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isPassed, setIsPassed] = useState(false);

  if (!isOpen) return null;

  const displayName = (typeof skillName === 'string' && skillName.trim()) ? skillName : 'SQL & Data Warehousing';


  const currentChallenge = DEFAULT_CHALLENGES[selectedLang] || DEFAULT_CHALLENGES.sql;

  const handleSwitchLang = (lang) => {
    setSelectedLang(lang);
    setCode(DEFAULT_CHALLENGES[lang]?.initialCode || '');
    setOutput(null);
    setReview(null);
  };

  const handleRunCode = () => {
    setIsRunning(true);
    setTimeout(() => {
      setOutput(currentChallenge.mockResult);
      setIsRunning(false);
    }, 600);
  };

  const handleAIReview = async () => {
    setIsReviewing(true);
    const res = await reviewCode(code, selectedLang, currentChallenge.prompt, skillName);
    setIsReviewing(false);
    if (res) {
      setReview(res);
      if (res.passed) {
        setIsPassed(true);
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#2563eb', '#38bdf8', '#10b981']
        });
        if (onCodePassed) {
          onCodePassed(skillName);
        }
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-500/25">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-slate-900 font-outfit text-sm">
                  Interactive In-Browser Code & SQL Playground
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-blue-100 text-blue-700">
                  Gemini Evaluated
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Practice practical exercises for <strong className="text-slate-800">{displayName}</strong>
              </p>

            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Language Switcher */}
            <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 text-xs font-bold shadow-2xs">
              <button
                onClick={() => handleSwitchLang('sql')}
                className={`px-3 py-1 rounded-lg transition ${
                  selectedLang === 'sql' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                SQL
              </button>
              <button
                onClick={() => handleSwitchLang('python')}
                className={`px-3 py-1 rounded-lg transition ${
                  selectedLang === 'python' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Python
              </button>
            </div>

            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 bg-slate-50/50">
          
          {/* Challenge Description */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
            <div className="text-xs font-bold text-blue-900 font-outfit flex items-center space-x-1.5">
              <Terminal className="w-4 h-4 text-blue-600" />
              <span>{currentChallenge.title}</span>
            </div>
            <p className="text-xs text-slate-600">{currentChallenge.prompt}</p>
          </div>

          {/* Code Editor Container */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-md overflow-hidden flex flex-col">
            <div className="px-4 py-2 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                <span className="pl-2 font-bold text-slate-300">query_workbench.{selectedLang}</span>
              </div>
              <span className="text-[11px] text-slate-500">UTF-8 • Ready</span>
            </div>

            <textarea
              rows="9"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full bg-slate-900 text-emerald-400 p-4 font-mono text-xs focus:outline-none resize-none leading-relaxed selection:bg-blue-600 selection:text-white"
              spellCheck="false"
            />
          </div>

          {/* Action Control Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <button
                onClick={handleRunCode}
                disabled={isRunning}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-xs transition"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>{isRunning ? 'Executing Query...' : 'Run Code'}</span>
              </button>

              <button
                onClick={handleAIReview}
                disabled={isReviewing}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-xs transition disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isReviewing ? 'Gemini Reviewing Code...' : '⚡ Gemini AI Code Review'}</span>
              </button>
            </div>

            {isPassed && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center space-x-1 animate-fadeIn">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified Mastery (+50 XP)</span>
              </span>
            )}
          </div>

          {/* Results Output Terminal Table */}
          {output && (
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2 animate-fadeIn">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center space-x-1.5">
                  <Database className="w-4 h-4 text-blue-600" />
                  <span>Execution Output Table ({output.length} rows returned in 12ms)</span>
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Query Succeeded
                </span>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                    <tr>
                      {Object.keys(output[0] || {}).map((col) => (
                        <th key={col} className="py-2 px-3">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {output.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-50">
                        {Object.values(row).map((val, cIdx) => (
                          <td key={cIdx} className="py-2 px-3">{val}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Gemini AI Code Review Card */}
          {review && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50/90 to-indigo-50/80 border border-blue-200 shadow-2xs space-y-2 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs font-bold text-blue-900">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>Gemini AI Senior Code Review — Score: {review.score}/100</span>
                </div>
                <span className="text-[11px] font-bold text-blue-800 bg-white px-2.5 py-0.5 rounded-full border border-blue-200 shadow-2xs">
                  {review.complexity}
                </span>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed">{review.summary}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <span className="font-bold text-emerald-800 block text-[11px] mb-1">✅ Senior Strengths:</span>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-600 text-[11px]">
                    {review.strengths?.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <span className="font-bold text-blue-800 block text-[11px] mb-1">💡 Senior Advice:</span>
                  <p className="text-slate-600 text-[11px] leading-relaxed">{review.senior_tip || 'Clean implementation ready for staging deployment.'}</p>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
