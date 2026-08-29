import React, { useState } from 'react';
import { 
  X, MessageSquare, Bell, CheckCircle2, Send, Sparkles, Building, Users, Flame, ExternalLink 
} from 'lucide-react';

export default function SlackIntegrationModal({ 
  isOpen, 
  onClose, 
  learnerName, 
  targetRoleTitle 
}) {
  const [activeChannel, setActiveChannel] = useState('learning-alerts');
  const [sentNotice, setSentNotice] = useState(null);

  if (!isOpen) return null;

  const handleSendTestWebhook = (type) => {
    setSentNotice(`✅ Webhook dispatched to #${activeChannel}! In production, this posts directly into your company Slack workspace.`);
    setTimeout(() => setSentNotice(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-sm shadow-purple-500/25">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-slate-900 font-outfit text-sm">
                  Slack & Microsoft Teams Integration
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-purple-100 text-purple-800">
                  Bot Live Preview
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Automate study reminders, milestone kudos, and manager weekly digests
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 bg-slate-50/60">
          
          {/* Channel Switcher */}
          <div className="flex items-center space-x-2 border-b border-slate-200 pb-3 text-xs font-bold">
            <button
              onClick={() => setActiveChannel('learning-alerts')}
              className={`px-3 py-1.5 rounded-xl transition ${
                activeChannel === 'learning-alerts'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              #learning-focus-alerts
            </button>
            <button
              onClick={() => setActiveChannel('team-kudos')}
              className={`px-3 py-1.5 rounded-xl transition ${
                activeChannel === 'team-kudos'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              #team-shoutouts
            </button>
            <button
              onClick={() => setActiveChannel('manager-digest')}
              className={`px-3 py-1.5 rounded-xl transition ${
                activeChannel === 'manager-digest'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              #manager-weekly-digest
            </button>
          </div>

          {/* Mock Slack Channel UI */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-4 font-sans text-xs">
            
            <div className="text-xs font-bold text-slate-500 border-b border-slate-100 pb-2 flex items-center justify-between">
              <span>Channel: #{activeChannel}</span>
              <span className="text-[11px] text-emerald-600 font-semibold">● Bot Connected</span>
            </div>

            {/* Notification 1: Focus Block Reminder */}
            {activeChannel === 'learning-alerts' && (
              <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-200 animate-fadeIn">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 font-bold font-outfit text-xs">
                  PC
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900">PathCraft Bot</span>
                    <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.2 rounded font-bold">APP</span>
                    <span className="text-[10px] text-slate-400">10:00 AM</span>
                  </div>
                  <p className="text-slate-700">
                    🔥 <strong>Hey {learnerName}!</strong> Your scheduled 45-minute focus session for <strong>SQL Window Functions</strong> starts in 15 minutes.
                  </p>
                  <div className="p-2.5 rounded-lg bg-white border border-blue-200 text-blue-950 text-[11px] space-y-1">
                    <div className="font-bold text-blue-800">Target Role: {targetRoleTitle}</div>
                    <div className="text-slate-600">Goal: Practice deterministic running totals and pass the verification quiz.</div>
                  </div>
                </div>
              </div>
            )}

            {/* Notification 2: Team Kudos */}
            {activeChannel === 'team-kudos' && (
              <div className="flex items-start space-x-3 p-3 rounded-xl bg-amber-50/70 border border-amber-200 animate-fadeIn">
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 font-bold font-outfit text-xs">
                  🎉
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900">PathCraft Celebrations</span>
                    <span className="text-[10px] bg-amber-200 text-amber-800 px-1.5 py-0.2 rounded font-bold">BOT</span>
                    <span className="text-[10px] text-slate-400">2:30 PM</span>
                  </div>
                  <p className="text-slate-800 font-medium">
                    🏆 <strong>{learnerName}</strong> just passed the <strong>System Design & Distributed Architecture</strong> verification quiz with a <strong>95% score</strong>!
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    Current Streak: <strong>8 Days 🔥</strong> • Total Verified Skills: <strong>5</strong>. React to congratulate them!
                  </p>
                </div>
              </div>
            )}

            {/* Notification 3: Manager Digest */}
            {activeChannel === 'manager-digest' && (
              <div className="flex items-start space-x-3 p-3 rounded-xl bg-purple-50/70 border border-purple-200 animate-fadeIn">
                <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0 font-bold font-outfit text-xs">
                  📊
                </div>
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900">PathCraft Leadership Digest</span>
                    <span className="text-[10px] text-slate-400">Friday 5:00 PM</span>
                  </div>
                  <p className="text-slate-800 font-semibold">
                    📈 <strong>Weekly Engineering Upskilling Report</strong>
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-white p-2.5 rounded-lg border border-purple-200">
                    <div>
                      <span className="text-slate-500 block">Team Mobility Readiness:</span>
                      <strong className="text-purple-800 font-black text-xs">68% (+14%)</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Total Hours Upskilled:</span>
                      <strong className="text-purple-800 font-black text-xs">48.5 hrs</strong>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Top Performer this week: <strong>{learnerName}</strong> (Completed 3 adaptive modules).
                  </p>
                </div>
              </div>
            )}

          </div>

          {/* Sent notice toast */}
          {sentNotice && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center space-x-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{sentNotice}</span>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-slate-200 bg-slate-50/70">
          <span className="text-xs text-slate-500">
            Webhook Target: <code className="font-mono text-purple-700 bg-white px-1.5 py-0.5 rounded border border-purple-200">https://hooks.slack.com/services/PC...</code>
          </span>

          <div className="flex items-center space-x-2">
            <button onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 transition">
              Close
            </button>
            <button
              onClick={() => handleSendTestWebhook(activeChannel)}
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition flex items-center space-x-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Test Webhook Payload</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
