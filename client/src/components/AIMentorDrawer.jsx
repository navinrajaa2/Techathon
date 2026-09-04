import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Sparkles, Send, Bot, User, Lightbulb, Code2, Briefcase, HelpCircle, 
  CheckCircle, RefreshCw, Brain, History, AlertCircle, ArrowRight 
} from 'lucide-react';
import { fetchMentorChat } from '../services/api';

const PRESET_PROMPTS = [
  { 
    id: 'window_fn', 
    label: '💡 Explain window functions', 
    prompt: 'Explain window functions.' 
  },
  { 
    id: 'weak_spot', 
    label: '🎯 Practice my quiz weak spot', 
    prompt: 'Can we practice the concept I struggled with in my last quiz?' 
  },
  { 
    id: 'eli5', 
    label: '👶 Explain simply (ELI5)', 
    prompt: 'Can you explain this skill simply with an intuitive real-world analogy?' 
  },
  { 
    id: 'prod', 
    label: '💼 Real-world Production Use', 
    prompt: 'How is this specific skill applied in high-scale industry projects for my target role?' 
  }
];

export default function AIMentorDrawer({ 
  isOpen, 
  onClose, 
  contextSkill, 
  targetRoleTitle = 'Senior Data Analyst',
  learnerProfile = {},
  learningMemory = {}
}) {
  const [messages, setMessages] = useState([]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showMemoryDetails, setShowMemoryDetails] = useState(false);
  const messagesEndRef = useRef(null);

  const currentRole = learnerProfile?.role || 'Junior Data Analyst';
  const activeSkillName = contextSkill?.name || 'SQL & Data Warehousing';
  const recentMistakes = learningMemory?.recentQuizMistakes?.length > 0 
    ? learningMemory.recentQuizMistakes 
    : ['Struggled with PARTITION BY syntax in SQL assessment'];

  // Initialize greeting on open or skill change
  useEffect(() => {
    if (isOpen) {
      setMessages([
        {
          id: 'welcome',
          sender: 'ai',
          text: `👋 Hi ${learnerProfile?.name ? learnerProfile.name.split(' ')[0] : 'there'}! I'm your **PathCraft AI Learning Companion** (powered by Gemini).

I'm continuously tracking your journey from **${currentRole}** → **${targetRoleTitle}**. 

I noticed in your recent quiz you had a question on **PARTITION BY window framing**. I'm here to help you bridge that gap!

Click **"Explain window functions"** below or ask me any question about your active module.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [isOpen, contextSkill, targetRoleTitle, currentRole]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!isOpen) return null;

  const handleSendPrompt = async (promptText) => {
    if (!promptText.trim()) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: promptText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputVal('');
    setIsTyping(true);

    const learnerContext = {
      currentRole,
      targetRoleTitle,
      activeRoadmapStep: activeSkillName,
      recentMistakes,
      currentSkills: learnerProfile?.current_skills || {}
    };

    try {
      const liveReply = await fetchMentorChat(
        promptText,
        activeSkillName,
        targetRoleTitle,
        learnerContext,
        messages.map(m => ({ role: m.sender === 'ai' ? 'model' : 'user', text: m.text }))
      );

      const reply = liveReply || generateContextualFallback(promptText, activeSkillName, targetRoleTitle, learnerContext);
      
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      const fallback = generateContextualFallback(promptText, activeSkillName, targetRoleTitle, learnerContext);
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: fallback,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const generateContextualFallback = (query, skillName, role, context) => {
    const qLower = query.toLowerCase();

    if (qLower.includes('window function') || qLower.includes('explain window')) {
      return `💡 **Mastering Window Functions for ${role}**

Since you are currently learning **SQL** for your **${role}** roadmap, let's use a sales-ranking example.

You struggled with **PARTITION BY** in your last quiz. Let's practice that concept!

### The Core Concept:
Unlike \`GROUP BY\` (which collapses rows together), a **Window Function** computes aggregations across rows while preserving each individual row's details.

\`\`\`sql
SELECT 
  employee_id,
  department,
  quarterly_sales,
  -- Creates a partition per department and ranks each rep within their team
  RANK() OVER (
    PARTITION BY department 
    ORDER BY quarterly_sales DESC
  ) AS sales_rank
FROM enterprise_sales;
\`\`\`

### How \`PARTITION BY\` Works:
1. **Partitioning**: It creates an isolated boundary (like the sales department vs marketing department).
2. **Ordering**: It sorts rows *within* that partition by sales amount descending.
3. **Ranking**: The ranking restarts at **1** for each new department.

**Quick Question**: If you wanted continuous ranking without gaps in ties (e.g., 1, 2, 2, 3), which function would you use instead of \`RANK()\`? (Hint: Think *dense*!)`;
    }

    if (qLower.includes('quiz') || qLower.includes('weak spot') || qLower.includes('struggle')) {
      return `🎯 **Addressing Your Recent Assessment Point**:

In your last quiz, you missed the question regarding **PARTITION BY vs GROUP BY** performance.

Remember:
- Use \`GROUP BY\` when you want a high-level summary table (e.g. Total Revenue by Quarter).
- Use **Window Functions with PARTITION BY** when you need row-level fidelity with relative rankings (e.g. Finding the Top 3 Sales Reps in each region).

Would you like to write a quick query to test this in the **Code Workbench**?`;
    }

    return `✨ Great question regarding **${skillName}** for your **${role}** path!

Because you are advancing from **${currentRole}**, focusing on end-to-end practical execution is key. I recommend completing the Hands-On Project Challenge for this module to verify your mastery and boost your Target Role Readiness score!`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end animate-fadeIn">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-slideLeft">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h3 className="font-extrabold text-slate-900 font-outfit text-sm">PathCraft AI Mentor</h3>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              <p className="text-[11px] text-slate-500 truncate max-w-[240px]">
                Active Companion for {currentRole} → {targetRoleTitle}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => setShowMemoryDetails(!showMemoryDetails)}
              className="p-1.5 rounded-lg text-blue-700 hover:bg-blue-100/60 transition text-xs flex items-center space-x-1 font-bold"
              title="View learner context and memory retained by AI"
            >
              <Brain className="w-4 h-4 text-blue-600" />
            </button>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* AI Learning Memory & Context Strip */}
        <div className="bg-blue-50/80 border-b border-blue-200/70 p-2.5 px-4 text-[11px] text-blue-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5 font-bold">
              <Brain className="w-3.5 h-3.5 text-blue-600" />
              <span>Learner Memory Active:</span>
            </div>
            <span className="text-[10px] bg-blue-200/70 text-blue-800 px-2 py-0.5 rounded-full font-bold">
              Context Synced
            </span>
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px]">
            <span className="px-2 py-0.5 rounded bg-white border border-blue-200 text-slate-700 font-semibold">
              Current: <strong>{currentRole}</strong>
            </span>
            <span className="px-2 py-0.5 rounded bg-white border border-blue-200 text-slate-700 font-semibold">
              Target: <strong>{targetRoleTitle}</strong>
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-900 font-semibold flex items-center space-x-1">
              <AlertCircle className="w-2.5 h-2.5 text-amber-600" />
              <span>Quiz Memory: PARTITION BY syntax</span>
            </span>
          </div>

          {showMemoryDetails && (
            <div className="mt-2 p-2 rounded-xl bg-white border border-blue-200 text-[10px] space-y-1 text-slate-600 animate-fadeIn">
              <div className="font-bold text-slate-800">Retained Learning Signals:</div>
              <div>• Active Roadmap Milestone: <strong>{activeSkillName}</strong></div>
              <div>• Recent Quiz Struggle: <strong>PARTITION BY window framing</strong></div>
              <div>• Target Competency: <strong>Level 4 (Senior Analytics)</strong></div>
            </div>
          )}
        </div>

        {/* Message Log */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
          {messages.map((msg) => {
            const isAi = msg.sender === 'ai';
            return (
              <div 
                key={msg.id}
                className={`flex items-start space-x-2.5 ${isAi ? '' : 'flex-row-reverse space-x-reverse'}`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                  isAi ? 'bg-blue-100 text-blue-700' : 'bg-slate-800 text-white'
                }`}>
                  {isAi ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                <div className={`p-3.5 rounded-2xl max-w-[88%] leading-relaxed ${
                  isAi 
                    ? 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-none whitespace-pre-line' 
                    : 'bg-blue-600 text-white rounded-tr-none'
                }`}>
                  {msg.text}
                  <div className={`text-[9px] mt-1.5 ${isAi ? 'text-slate-400' : 'text-blue-200'} text-right`}>
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-center space-x-2 text-slate-400 text-xs pl-9">
              <span className="inline-flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]"></span>
              </span>
              <span className="text-[11px] italic">AI Mentor is connecting your learning journey...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Context-Aware Prompts */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/80 space-y-2">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <span>Adaptive Suggestions</span>
            <span className="text-blue-600 font-semibold">Tailored to your progress</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_PROMPTS.map(p => (
              <button
                key={p.id}
                onClick={() => handleSendPrompt(p.prompt)}
                className="px-2.5 py-1 rounded-lg bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-[11px] font-semibold text-slate-700 transition flex items-center space-x-1 shadow-2xs active:scale-95"
              >
                <span>{p.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-200 bg-white">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendPrompt(inputVal);
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Ask anything (AI remembers your role and quiz progress)..."
              className="flex-1 text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white transition"
            />
            <button
              type="submit"
              disabled={!inputVal.trim()}
              className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 transition shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
