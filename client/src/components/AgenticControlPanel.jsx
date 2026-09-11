import React, { useState } from 'react';
import { Bot, Calendar, MessageSquare, TrendingUp, ChevronRight, X } from 'lucide-react';

export default function AgenticControlPanel({
  onSchedule,
  onMentorPing,
  onMarketPivot
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [pulse, setPulse] = useState(true);

  if (!isOpen) {
    return (
      <button
        onClick={() => { setIsOpen(true); setPulse(false); }}
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-slate-900 text-white rounded-full shadow-2xl hover:bg-slate-800 hover:scale-105 transition-all duration-300"
        title="Agentic AI Control Panel"
      >
        <Bot className="w-6 h-6" />
        {pulse && (
          <span className="absolute top-0 right-0 w-3 h-3 bg-rose-500 border-2 border-slate-900 rounded-full animate-ping"></span>
        )}
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
      <div className="bg-slate-900 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-white">
          <Bot className="w-5 h-5 text-blue-400" />
          <h3 className="font-bold text-sm">Agentic AI Engine</h3>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition cursor-pointer">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-3">
        <p className="text-[11px] text-slate-500 font-semibold mb-3">
          SIMULATE AUTONOMOUS AGENT ACTIONS
        </p>

        <button
          onClick={onSchedule}
          className="w-full flex items-start space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition text-left group cursor-pointer"
        >
          <div className="p-2 rounded-lg bg-blue-100 text-blue-700 shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <div className="text-xs font-bold text-slate-800">Auto-Scheduler</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Find calendar gap & book session</div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 self-center" />
        </button>

        <button
          onClick={onMentorPing}
          className="w-full flex items-start space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-purple-300 hover:bg-purple-50 transition text-left group cursor-pointer"
        >
          <div className="p-2 rounded-lg bg-purple-100 text-purple-700 shrink-0">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <div className="text-xs font-bold text-slate-800">Proactive Mentor</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Simulate Slack/Teams check-in</div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 self-center" />
        </button>

        <button
          onClick={onMarketPivot}
          className="w-full flex items-start space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 transition text-left group cursor-pointer"
        >
          <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <div className="text-xs font-bold text-slate-800">Market Pivot</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Analyze job boards & update path</div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 self-center" />
        </button>

      </div>
    </div>
  );
}
