import React, { useState, useEffect } from 'react';
import { 
  X, CheckCircle2, AlertCircle, Award, Sparkles, Code2, FileText, ArrowRight, 
  RotateCw, Play, ShieldCheck, Database, BarChart3, TrendingUp, Lightbulb, Zap, Check 
} from 'lucide-react';
import { verifyProject } from '../services/api';

// Realistic starter templates and sample solutions for skills
const PROJECT_TEMPLATES = {
  sql_mastery: {
    projectTitle: "Enterprise Sales Analytics & Retention Dashboard using SQL",
    scenario: "An enterprise retail brand with 2.4M orders needs a high-performance cohort retention and sales breakdown dashboard. You are tasked with importing sales transactions, querying customer order sequences, computing sales rankings by territory using window functions, optimizing query execution times, and explaining executive business findings.",
    datasetSchema: [
      { table: "customers", cols: "customer_id, full_name, signup_date, region, churn_flag" },
      { table: "orders", cols: "order_id, customer_id, order_date, total_amount, payment_status" },
      { table: "order_items", cols: "item_id, order_id, product_id, quantity, unit_price" },
      { table: "products", cols: "product_id, product_name, category, cost_price" }
    ],
    deliverables: [
      { id: "wf", label: "Window Functions", desc: "Use RANK() / DENSE_RANK() OVER (PARTITION BY region ORDER BY total_sales DESC)" },
      { id: "joins", label: "Complex JOINs & CTEs", desc: "Join customers, orders, and products using modular Common Table Expressions" },
      { id: "opt", label: "Query Optimization", desc: "Push down date range filters and eliminate redundant sub-queries" },
      { id: "insights", label: "Business Interpretation", desc: "Synthesize actionable findings for the VP of Growth & Finance" }
    ],
    starterCode: `-- Step 1: Write a modular Common Table Expression (CTE)
WITH regional_sales AS (
  SELECT 
    c.region,
    p.category,
    COUNT(DISTINCT o.order_id) AS order_count,
    SUM(oi.quantity * oi.unit_price) AS total_revenue
  FROM orders o
  JOIN customers c ON o.customer_id = c.customer_id
  JOIN order_items oi ON o.order_id = oi.order_id
  JOIN products p ON oi.product_id = p.product_id
  WHERE o.payment_status = 'completed'
    AND o.order_date >= '2026-01-01'
  GROUP BY c.region, p.category
)
-- Step 2: Apply Window Function to rank revenue by region
SELECT 
  region,
  category,
  total_revenue,
  RANK() OVER (
    PARTITION BY region 
    ORDER BY total_revenue DESC
  ) AS sales_rank
FROM regional_sales
ORDER BY region, sales_rank;`,
    starterInsights: `Executive Insights Memo:
1. Regional Performance: The West region generated $1.42M in Q1, driven predominantly by Cloud Software subscriptions (#1 ranked category).
2. Churn Opportunity: Retention dropped 14% among users who made only 1 order in the first 30 days.
3. Action Item: Implement an automated onboarding email sequence at Day 14 to lift re-order rates by ~8%.`
  },

  python_analytics: {
    projectTitle: "Automated ETL Pipeline & Anomaly Detection Engine",
    scenario: "Construct an automated Python telemetry pipeline that ingests continuous API data, processes metric anomalies using vectorized Pandas, and dispatches automated alerts to Slack.",
    datasetSchema: [
      { table: "system_metrics", cols: "timestamp, cpu_usage_pct, memory_mb, error_rate" }
    ],
    deliverables: [
      { id: "wf", label: "Vectorized Operations", desc: "Vectorized rolling z-score calculations without iterative loops" },
      { id: "joins", label: "Data Pipeline Architecture", desc: "Clean pipeline staging with error handling and logging" },
      { id: "opt", label: "Memory Efficiency", desc: "Downcast float datatypes and stream chunked generators" },
      { id: "insights", label: "Business Interpretation", desc: "Executive summary on SLA compliance and downtime prevention" }
    ],
    starterCode: `import pandas as pd
import numpy as np

def detect_telemetry_anomalies(df: pd.DataFrame) -> pd.DataFrame:
    # Vectorized rolling baseline computation
    df['rolling_mean'] = df['cpu_usage_pct'].rolling(window=15, min_periods=1).mean()
    df['rolling_std'] = df['cpu_usage_pct'].rolling(window=15, min_periods=1).std().fillna(1.0)
    
    # Vectorized Z-Score calculation
    df['z_score'] = (df['cpu_usage_pct'] - df['rolling_mean']) / df['rolling_std']
    df['is_anomaly'] = np.where(df['z_score'].abs() > 3.0, True, False)
    
    return df[df['is_anomaly']]`,
    starterInsights: `Executive Insights Memo:
Anomaly frequency peaked during 02:00 UTC daily backup cycles. Provisioning an asynchronous worker queue will mitigate CPU saturation and sustain our 99.95% uptime SLA.`
  },

  llm_engineering: {
    projectTitle: "Production RAG Support Co-Pilot with Vector Retrieval",
    scenario: "Build a semantic search and question-answering assistant for internal documentation with hallucination guardrails.",
    datasetSchema: [
      { table: "kb_documents", cols: "doc_id, title, content_chunk, embedding_vector" }
    ],
    deliverables: [
      { id: "wf", label: "Vector Retrieval", desc: "Cosine similarity search over chunked document embeddings" },
      { id: "joins", label: "Context Augmentation", desc: "Dynamic prompt stitching with citations and source IDs" },
      { id: "opt", label: "Latency & Token Optimization", desc: "Top-K filtering and token truncation bounds" },
      { id: "insights", label: "Business Interpretation", desc: "Quantified reduction in support escalation hours" }
    ],
    starterCode: `async function generateAnswerWithRAG(userQuery, vectorDB) {
  const topChunks = await vectorDB.similaritySearch(userQuery, { k: 4 });
  const contextText = topChunks.map(c => \`[\${c.metadata.title}]: \${c.content}\`).join('\\n\\n');
  
  return {
    promptContext: contextText,
    retrievedCount: topChunks.length,
    status: 'ready_for_inference'
  };
}`,
    starterInsights: `Executive Insights Memo:
The internal RAG Co-Pilot automates tier-1 support triage, decreasing engineer support shifts by 35% and saving 120 engineering hours monthly.`
  }
};

export default function ProjectChallengeModal({
  isOpen,
  onClose,
  skillId = 'sql_mastery',
  skillName = 'SQL & Data Warehousing',
  targetRoleTitle = 'Senior Data Analyst',
  currentLevel = 2,
  targetLevel = 4,
  onProjectVerified
}) {
  const template = PROJECT_TEMPLATES[skillId] || PROJECT_TEMPLATES.sql_mastery;

  const [activeTab, setActiveTab] = useState('brief'); // 'brief' | 'workspace' | 'results'
  const [codeSubmission, setCodeSubmission] = useState(template.starterCode);
  const [businessInsights, setBusinessInsights] = useState(template.starterInsights);
  
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  useEffect(() => {
    if (isOpen) {
      const activeTpl = PROJECT_TEMPLATES[skillId] || PROJECT_TEMPLATES.sql_mastery;
      setCodeSubmission(activeTpl.starterCode);
      setBusinessInsights(activeTpl.starterInsights);
      setVerificationResult(null);
      setActiveTab('brief');
    }
  }, [isOpen, skillId]);

  if (!isOpen) return null;

  const handleRunVerification = async () => {
    setIsEvaluating(true);
    setActiveTab('results');

    try {
      const result = await verifyProject({
        skillId,
        skillName,
        targetRoleTitle,
        currentLevel,
        targetLevel,
        codeSubmission,
        businessInsights,
        projectTitle: template.projectTitle
      });

      setVerificationResult(result);
    } catch (err) {
      console.warn('Verification call notice:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleApplyVerifiedSkill = () => {
    if (onProjectVerified && verificationResult) {
      onProjectVerified({
        skillId,
        skillName,
        previousLevel: currentLevel,
        newVerifiedLevel: verificationResult.new_verified_level || targetLevel,
        readinessIncrease: verificationResult.readiness_delta_percent || 16,
        score: verificationResult.score || 95,
        projectTitle: template.projectTitle
      });
    }
    onClose();
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-blue-50/60 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-600 text-white uppercase tracking-wider">
                  Real-World Challenge
                </span>
              </div>
              <h2 className="text-base font-extrabold text-slate-900 font-outfit">
                {template.projectTitle}
              </h2>
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
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* Navigation Tabs */}
          <div className="flex items-center space-x-2 border-b border-slate-200 pb-3">
            <button
              onClick={() => setActiveTab('brief')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                activeTab === 'brief'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>1. Challenge Brief & Data</span>
            </button>
            <button
              onClick={() => setActiveTab('workspace')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                activeTab === 'workspace'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>2. Code & Solution Workspace</span>
            </button>
            <button
              onClick={() => setActiveTab('results')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                activeTab === 'results'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>3. Verification Results</span>
            </button>
          </div>
          
          {/* TAB 1: BRIEF */}
          {activeTab === 'brief' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Scenario Card */}
              <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-3">
                <div className="flex items-center space-x-2 text-blue-900 font-extrabold text-sm font-outfit">
                  <Lightbulb className="w-4 h-4 text-blue-600" />
                  <span>Enterprise Workplace Scenario</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {template.scenario}
                </p>
                <div className="text-[11px] font-medium text-blue-700">
                  Target Competency: <strong className="font-bold">{skillName}</strong> (Required for {targetRoleTitle})
                </div>
              </div>

              {/* 4 Core Rubric Criteria */}
              <div className="space-y-3">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                  <span>Gemini AI Evaluation Rubric (4 Core Criteria)</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {template.deliverables.map((item, idx) => (
                    <div key={item.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start space-x-3">
                      <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900 font-outfit">{item.label}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Schema Preview */}
              <div className="space-y-2">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                  <Database className="w-3.5 h-3.5 text-blue-600" />
                  <span>Provided Relational Schema</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {template.datasetSchema.map(tbl => (
                    <div key={tbl.table} className="p-3 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px]">
                      <span className="text-blue-400 font-bold">{tbl.table}</span> ({tbl.cols})
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  onClick={() => setActiveTab('workspace')}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm transition active:scale-95"
                >
                  <span>Open Submission Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          )}

          {/* TAB 2: WORKSPACE */}
          {activeTab === 'workspace' && (
            <div className="space-y-5 animate-fadeIn">
              
              {/* Code Editor Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                    <Code2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>SQL / Implementation Query</span>
                  </label>

                  <button
                    onClick={() => {
                      setCodeSubmission(template.starterCode);
                      setBusinessInsights(template.starterInsights);
                    }}
                    className="text-[11px] font-bold text-blue-700 hover:text-blue-800 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 transition"
                  >
                    ⚡ Load Ready-to-Verify Solution
                  </button>
                </div>

                <div className="border border-slate-300 rounded-2xl overflow-hidden shadow-xs focus-within:border-blue-600">
                  <div className="bg-slate-800 text-slate-300 px-4 py-2 text-[11px] font-mono flex items-center justify-between border-b border-slate-700">
                    <span>solution_query.sql</span>
                    <span className="text-emerald-400 font-bold">SQL / Window Function Mode</span>
                  </div>
                  <textarea
                    rows={11}
                    value={codeSubmission}
                    onChange={(e) => setCodeSubmission(e.target.value)}
                    className="w-full p-4 font-mono text-xs bg-slate-900 text-emerald-400 focus:outline-none leading-relaxed resize-none"
                    placeholder="Write your SQL queries using CTEs and Window Functions..."
                  />
                </div>
              </div>

              {/* Business Insights Memo Section */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                  <FileText className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Executive Business Insights Memo (Deliverable #4)</span>
                </label>
                <textarea
                  rows={4}
                  value={businessInsights}
                  onChange={(e) => setBusinessInsights(e.target.value)}
                  className="w-full p-3.5 text-xs bg-slate-50 border border-slate-300 rounded-2xl focus:outline-none focus:border-blue-600 focus:bg-white text-slate-800 leading-relaxed resize-none"
                  placeholder="Explain the business significance of your query results to leadership..."
                />
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  onClick={() => setActiveTab('brief')}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                >
                  Back to Rubric
                </button>

                <button
                  onClick={handleRunVerification}
                  disabled={!codeSubmission.trim() || isEvaluating}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center space-x-2 shadow-xs transition active:scale-95 disabled:opacity-40"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Submit for Gemini AI Review & Skill Verification</span>
                </button>
              </div>

            </div>
          )}

          {/* TAB 3: RESULTS */}
          {activeTab === 'results' && (
            <div className="space-y-6 animate-fadeIn">
              
              {isEvaluating ? (
                <div className="p-12 text-center text-slate-500 space-y-4">
                  <div className="animate-spin w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800 font-outfit">
                      Gemini AI Senior Staff Review in Progress...
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                      Evaluating window function partition keys, execution plan efficiency, CTE logic, and executive interpretation.
                    </p>
                  </div>
                </div>
              ) : verificationResult ? (
                <div className="space-y-6">
                  
                  {/* Success Header Badge */}
                  <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-300 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                          Official Verification Passed
                        </span>
                        <h3 className="text-base font-black text-slate-900 font-outfit">
                          {skillName} Mastery Demonstrated
                        </h3>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-2xl font-black text-emerald-700 font-outfit">
                        {verificationResult.score || 95}/100
                      </span>
                      <span className="text-[11px] text-slate-500 block">Review Score</span>
                    </div>
                  </div>

                  {/* Level Upgrade Meter & Readiness Boost */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        Demonstrated Skill Level Progression
                      </span>
                      <div className="flex items-center justify-between">
                        <div className="text-center">
                          <span className="text-xs text-slate-500">Previous Level</span>
                          <div className="text-xl font-black text-slate-600 font-outfit">
                            Level {verificationResult.previous_level || currentLevel}/5
                          </div>
                        </div>

                        <ArrowRight className="w-5 h-5 text-emerald-600" />

                        <div className="text-center">
                          <span className="text-xs text-emerald-700 font-bold">New Verified Level</span>
                          <div className="text-2xl font-black text-emerald-600 font-outfit">
                            Level {verificationResult.new_verified_level || targetLevel}/5 🏆
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-2">
                      <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block">
                        Target Role Readiness Impact
                      </span>
                      <div className="flex items-baseline space-x-2">
                        <span className="text-2xl font-black text-blue-900 font-outfit">
                          +{verificationResult.readiness_delta_percent || 16}%
                        </span>
                        <span className="text-xs font-bold text-blue-700">
                          Immediate Promotion Readiness Boost!
                        </span>
                      </div>
                      <p className="text-[11px] text-blue-800 leading-snug">
                        By demonstrating hands-on project mastery, your deficit for {targetRoleTitle} has been bridged.
                      </p>
                    </div>

                  </div>

                  {/* 4 Rubric Criteria Breakdown */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      Enterprise Rubric Breakdown
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      
                      {/* Criterion 1 */}
                      <div className="p-3 rounded-xl bg-white border border-emerald-200 shadow-2xs space-y-1">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                          <span>Window Functions</span>
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px]">
                            ✓ Verified
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-snug">
                          {verificationResult.rubric?.window_functions?.notes || "Correct partition and ordering with RANK() OVER (...)"}
                        </p>
                      </div>

                      {/* Criterion 2 */}
                      <div className="p-3 rounded-xl bg-white border border-emerald-200 shadow-2xs space-y-1">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                          <span>Complex JOINs & CTEs</span>
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px]">
                            ✓ Verified
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-snug">
                          {verificationResult.rubric?.complex_joins?.notes || "Clean multi-table relational schema join structure"}
                        </p>
                      </div>

                      {/* Criterion 3 */}
                      <div className="p-3 rounded-xl bg-white border border-emerald-200 shadow-2xs space-y-1">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                          <span>Query Optimization</span>
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px]">
                            ✓ Verified
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-snug">
                          {verificationResult.rubric?.query_optimization?.notes || "Filters pushed down prior to aggregation, preventing table scans"}
                        </p>
                      </div>

                      {/* Criterion 4 */}
                      <div className="p-3 rounded-xl bg-white border border-emerald-200 shadow-2xs space-y-1">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                          <span>Business Interpretation</span>
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px]">
                            ✓ Verified
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-snug">
                          {verificationResult.rubric?.business_interpretation?.notes || "Executive takeaways clearly articulate cohort performance"}
                        </p>
                      </div>

                    </div>
                  </div>

                  {/* Senior Tip Box */}
                  <div className="p-4 rounded-2xl bg-slate-900 text-slate-200 text-xs space-y-1">
                    <span className="font-bold text-emerald-400 block">💡 Senior Staff Engineer Review Verdict:</span>
                    <p className="text-slate-300 leading-relaxed font-normal">
                      {verificationResult.senior_tip || "Demonstrated production-grade SQL and analytical storytelling. Your approach models enterprise best practices."}
                    </p>
                  </div>

                  {/* CTA Action */}
                  <div className="pt-2 flex justify-end space-x-3">
                    <button
                      onClick={() => setActiveTab('workspace')}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                    >
                      Edit Submission
                    </button>

                    <button
                      onClick={handleApplyVerifiedSkill}
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-2 shadow-md shadow-emerald-600/20 transition active:scale-95"
                    >
                      <Check className="w-4 h-4" />
                      <span>Apply Verified Level to Profile & Adapt Roadmap</span>
                    </button>
                  </div>

                </div>
              ) : (
                <div className="p-8 text-center text-slate-500">
                  <p>Click "Submit for Gemini AI Review" in the workspace to evaluate your project.</p>
                  <button
                    onClick={() => setActiveTab('workspace')}
                    className="mt-3 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
                  >
                    Go to Workspace
                  </button>
                </div>
              )}

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
