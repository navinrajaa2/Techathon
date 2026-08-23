import React from 'react';
import { Sparkles, CheckCircle2, X } from 'lucide-react';

export default function AdaptiveNotice({ message, onClose }) {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md bg-gray-900 border border-indigo-500/50 rounded-2xl p-4 shadow-2xl glass-panel animate-bounce-short flex items-start space-x-3">
      <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 shrink-0">
        <Sparkles className="w-5 h-5 animate-spin-slow" />
      </div>
      
      <div className="flex-1 space-y-1">
        <div className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
          AI Adaptive Re-Planner
        </div>
        <p className="text-xs text-gray-200 leading-snug">
          {message}
        </p>
      </div>

      <button onClick={onClose} className="p-1 text-gray-400 hover:text-white transition">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
