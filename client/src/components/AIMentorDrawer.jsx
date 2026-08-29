import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Sparkles, Send, Bot, User, Lightbulb, Code2, Briefcase, HelpCircle, CheckCircle, RefreshCw 
} from 'lucide-react';
import { fetchMentorChat } from '../services/api';

const PRESET_PROMPTS = [
  { id: 'eli5', label: '👶 Explain simply (ELI5)', prompt: 'Can you explain this skill simply with an intuitive real-world analogy?' },
  { id: 'challenge', label: '⚡ 5-Minute Mini Challenge', prompt: 'Give me a quick 5-minute hands-on practice challenge with solution hints.' },
  { id: 'prod', label: '💼 Real-world Production Use', prompt: 'How is this specific skill applied in high-scale industry projects?' },
  { id: 'faq', label: '❓ Common Gotchas & Mistakes', prompt: 'What are the top 3 mistakes engineers make when learning this?' }
];

export default function AIMentorDrawer({ 
  isOpen, 
  onClose, 
  contextSkill, 
  targetRoleTitle 
}) {
  const [messages, setMessages] = useState([]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Initialize greeting on open or skill change
  useEffect(() => {
    if (isOpen) {
      const initialSkill = contextSkill?.name || 'your active roadmap module';
      setMessages([
        {
          id: 'welcome',
          sender: 'ai',
          text: `👋 Hi! I'm your **PathCraft AI Learning Mentor** (Powered by Gemini AI). I'm here to help you master **${initialSkill}** for your path toward **${targetRoleTitle || 'Senior Career Growth'}**.\n\nClick a prompt below or ask me any question!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [isOpen, contextSkill, targetRoleTitle]);

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

    try {
      const liveReply = await fetchMentorChat(
        promptText,
        contextSkill?.name || 'General Engineering',
        targetRoleTitle,
        messages.map(m => ({ role: m.sender === 'ai' ? 'model' : 'user', text: m.text }))
      );

      const reply = liveReply || generateMentorResponse(promptText, contextSkill?.name || 'this skill', targetRoleTitle);
      
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
      const fallback = generateMentorResponse(promptText, contextSkill?.name || 'this skill', targetRoleTitle);
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

  const generateMentorResponse = (query, skillName, role) => {
    const qLower = query.toLowerCase();

    if (qLower.includes('eli5') || qLower.includes('simply') || qLower.includes('analogy')) {
      return `💡 **Intuitive Analogy for ${skillName}**:\n\nThink of **${skillName}** like building an organized kitchen in a busy restaurant. Rather than scrambling around finding ingredients one by one, it gives you standardized recipes and indexed stations so orders flow instantly without bottlenecks.\n\nIn **${role || 'modern engineering'}**, this allows your team to deliver robust systems with zero guesswork.`;
    }

    if (qLower.includes('challenge') || qLower.includes('5-minute') || qLower.includes('practice')) {
      return `🎯 **5-Minute Practice Challenge for ${skillName}**:\n\n**Scenario**: A production service is processing queries with high latency.\n**Task**: \n1. Identify the unindexed filter key causing full scans.\n2. Refactor the logic using batch vectorization or cached memoization.\n\n**Hint**: Focus on isolating I/O bound queries first! Try writing down pseudo-code in 3 lines.`;
    }

    if (qLower.includes('production') || qLower.includes('real-world') || qLower.includes('scale')) {
      return `💼 **How ${skillName} is Used in Top Tech Companies**:\n\nIn companies like Stripe, Netflix, and Google, **${skillName}** is utilized to:\n- Automate real-time event telemetry pipelines\n- Guard against regression with automated CI testing suites\n- Ensure high availability across multi-region clusters.\n\nMastering this elevates you directly into senior architectural discussions.`;
    }

    if (qLower.includes('mistake') || qLower.includes('gotcha')) {
      return `⚠️ **Top 3 Common Mistakes to Avoid with ${skillName}**:\n\n1. **Over-engineering early**: Building generic abstractions before understanding the specific domain requirements.\n2. **Ignoring edge cases**: Not testing for empty payloads, timeout thresholds, and rate limits.\n3. **Skipping monitoring**: Deploying without observability metrics and alerting dashboards.`;
    }

    return `✨ Great question regarding **${skillName}**!\n\nWhen working on this in the context of **${role || 'career advancement'}**, prioritize end-to-end practical execution over pure theory. \n\nI recommend reviewing the practice exercise in your current roadmap step, taking the 3-question verification quiz to confirm mastery, and applying it in an internal pilot project!`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/30 backdrop-blur-xs flex justify-end animate-fadeIn">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-slideLeft">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm shadow-blue-500/25">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h3 className="font-extrabold text-slate-900 font-outfit text-sm">PathCraft AI Mentor</h3>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              <p className="text-[11px] text-slate-500 truncate max-w-[200px]">
                Co-Pilot for {contextSkill?.name || 'Active Module'}
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition"
          >
            <X className="w-5 h-5" />
          </button>
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

                <div className={`p-3.5 rounded-2xl max-w-[85%] leading-relaxed ${
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
              <span className="text-[11px] italic">AI Mentor is thinking...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts Carousel */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/70 space-y-2">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Quick Inquiries
          </div>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_PROMPTS.map(p => (
              <button
                key={p.id}
                onClick={() => handleSendPrompt(p.prompt)}
                className="px-2.5 py-1 rounded-lg bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-[11px] font-semibold text-slate-700 transition flex items-center space-x-1 shadow-2xs"
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
              placeholder="Ask anything about this skill or code concept..."
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
