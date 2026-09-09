import React, { useState } from 'react';
import {
  X, MessageSquare, Star, ShieldCheck, Award, CheckCircle2,
  Send, ThumbsUp, Sparkles, Filter, User, Lightbulb
} from 'lucide-react';

export default function FeedbackAreaModal({ isOpen, onClose, learnerName, onFeedbackSubmitted }) {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'project' | 'quiz' | 'submit'
  const [rating, setRating] = useState(5);
  const [feedbackCategory, setFeedbackCategory] = useState('AI Adaptive Roadmap');
  const [userComment, setUserComment] = useState('');
  const [submittedMessage, setSubmittedMessage] = useState('');

  if (!isOpen) return null;

  // Stored AI Feedback items array
  const STORED_FEEDBACK_ITEMS = [
    {
      id: 'fb_proj_1',
      category: 'AI Project Verification',
      title: 'Real-World Project Challenge Review (SQL & Data Warehousing)',
      score: 94,
      date: 'Today at 10:15 AM',
      verdict: 'Verified Competency (Level 4/5)',
      rubric: [
        { criteria: 'Window Functions', status: 'Passed', note: 'Implemented DENSE_RANK() OVER (PARTITION BY customer_id ORDER BY amount DESC).' },
        { criteria: 'Complex JOINs & CTEs', status: 'Passed', note: 'Clean CTE modularization separating partition logic from analytical query.' },
        { criteria: 'Query Optimization', status: 'Passed', note: 'Pushed down WHERE predicates prior to aggregation, enabling index pruning.' },
        { criteria: 'Executive Business Interpretation', status: 'Passed', note: 'Summary clearly translates cohort metrics into actionable growth strategy.' }
      ],
      strengths: [
        "Clean idiomatic syntax with uppercase SQL keywords",
        "Proper indexing strategy recommendation for Snowflake / BigQuery"
      ],
      senior_tip: "In production data warehouses, leverage clustering keys alongside partition pruning."
    },
    {
      id: 'fb_quiz_1',
      category: 'Assessment Feedback',
      title: 'SQL Window Partitioning & Analytical Functions Assessment',
      score: 88,
      date: 'Yesterday at 4:30 PM',
      verdict: 'Passed Verification',
      weak_concepts: ['PARTITION BY syntax framing', 'Window Frame UNBOUNDED PRECEDING'],
      remedial_tip: 'Reviewed remedial module on Window Frame framing clauses.'
    },
    {
      id: 'fb_mgr_1',
      category: 'Manager Review Note',
      title: 'Quarterly Upskilling & Internal Mobility Review',
      score: 90,
      date: '2 Days Ago',
      verdict: 'On Track for Senior Role',
      manager_note: 'Demonstrated rapid progress in SQL and LLM engineering. Recommended for Senior Tech Lead role transition upon completing System Design module.'
    }
  ];

  const handleSubmitUserFeedback = (e) => {
    e.preventDefault();
    if (!userComment.trim()) return;

    const newFeedbackObj = {
      id: `user_fb_${Date.now()}`,
      category: feedbackCategory,
      comment: userComment,
      rating,
      date: 'Just now',
      user: learnerName || 'Navin Rajaa'
    };

    if (onFeedbackSubmitted) {
      onFeedbackSubmitted(newFeedbackObj);
    }

    setSubmittedMessage('Thank you! Your feedback has been recorded and submitted to the platform team.');
    setUserComment('');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">

        {/* Header - Light Theme */}
        <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 p-6 border-b border-indigo-100 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-white/80 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-800 border border-purple-200 uppercase tracking-wide">
                  Feedback & Review Hub
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Learner: {learnerName || 'Navin Rajaa'}
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 font-outfit mt-0.5">
                Centralized Feedback & Evaluation Area
              </h2>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 flex-1">

          {/* Navigation Tabs */}
          <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${activeTab === 'all' ? 'bg-white text-purple-900 shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              All Feedback Items
            </button>
            <button
              onClick={() => setActiveTab('project')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${activeTab === 'project' ? 'bg-white text-purple-900 shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              AI Project Reviews
            </button>
            <button
              onClick={() => setActiveTab('submit')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${activeTab === 'submit' ? 'bg-white text-purple-900 shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              Submit Platform Feedback
            </button>
          </div>

          {/* Tab 1: All / Project Reviews */}
          {activeTab !== 'submit' && (
            <div className="space-y-4">
              {STORED_FEEDBACK_ITEMS.map((item) => (
                <div key={item.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs space-y-3">

                  <div className="flex items-start justify-between">
                    <div>
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200">
                        {item.category}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 font-outfit mt-1">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-500">{item.date}</p>
                    </div>

                    <div className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-center shadow-2xs">
                      <div className="text-xs font-bold text-slate-400 uppercase">Score</div>
                      <div className="text-lg font-black text-purple-700 font-outfit">{item.score}/100</div>
                    </div>
                  </div>

                  {/* Rubric Grid */}
                  {item.rubric && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {item.rubric.map((r, idx) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs">
                          <div className="flex items-center justify-between font-bold text-slate-800">
                            <span>{r.criteria}</span>
                            <span className="text-emerald-600 font-extrabold text-[11px]">✓ {r.status}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 mt-0.5">{r.note}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {item.manager_note && (
                    <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-950 font-normal">
                      <strong className="font-bold text-indigo-900 block mb-1">Manager Executive Verdict:</strong>
                      {item.manager_note}
                    </div>
                  )}

                  {item.senior_tip && (
                    <div className="p-3 rounded-xl bg-slate-900 text-slate-100 text-xs flex items-start space-x-2">

                      <div>
                        <span className="font-bold text-purple-300">Senior Architect Tip: </span>
                        <span>{item.senior_tip}</span>
                      </div>
                    </div>
                  )}

                </div>
              ))}
            </div>
          )}

          {/* Tab 2: Submit New Feedback Form */}
          {activeTab === 'submit' && (
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">

              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 font-outfit">
                  Submit Feedback & Feature Experience
                </h3>
                <p className="text-xs text-slate-500">
                  Share your experience with adaptive roadmap suggestions, AI Interviewer, or course modules.
                </p>
              </div>

              {submittedMessage && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{submittedMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmitUserFeedback} className="space-y-4">

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Feedback Target Area
                  </label>
                  <select
                    value={feedbackCategory}
                    onChange={(e) => setFeedbackCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 bg-white"
                  >
                    <option value="AI Adaptive Roadmap">AI Adaptive Roadmap</option>
                    <option value="AI Mock Interviewer">AI Mock Interviewer</option>
                    <option value="Lesson Summary Podcast">Lesson Summary Podcast</option>
                    <option value="Code Workbench & SQL">Code Workbench & SQL</option>
                    <option value="Career What-If Simulator">Career What-If Simulator</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Satisfaction Rating
                  </label>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1.5 transition transform active:scale-95"
                      >
                        <Star
                          className={`w-6 h-6 ${star <= rating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-300'
                            }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-slate-700 ml-2">{rating} / 5 Stars</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Your Detailed Feedback & Comments
                  </label>
                  <textarea
                    value={userComment}
                    onChange={(e) => setUserComment(e.target.value)}
                    placeholder="Write your feedback, requests, or feature suggestions here..."
                    rows={4}
                    className="w-full p-3 rounded-xl border border-slate-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-xs text-slate-900 bg-white resize-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-purple-500/20 transition flex items-center space-x-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Feedback</span>
                </button>

              </form>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
