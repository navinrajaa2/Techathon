import React from 'react';
import { Sparkles, CheckCircle2, X } from 'lucide-react';

export default function AdaptiveNotice({ message, onClose }) {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md bg-white border border-blue-200 rounded-2xl p-4 shadow-xl animate-bounce-short flex items-start space-x-3 text-slate-800">
      <div className="p-2 rounded-xl bg-blue-100 text-blue-700 shrink-0 border border-blue-200">
        <Sparkles className="w-5 h-5 text-blue-600" />
      </div>
      
      <div className="flex-1 space-y-0.5">
        <div className="text-xs font-bold text-blue-700 uppercase tracking-wider">
          AI Adaptive Re-Planner
        </div>
        <p className="text-xs text-slate-600 leading-snug font-normal">
          {message}
        </p>
      </div>

      <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 transition">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
