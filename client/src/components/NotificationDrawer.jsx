import React, { useState } from 'react';
import {
  X, Bell, CheckCircle2, Sparkles, AlertCircle, MessageSquare,
  Award, ShieldCheck, Headphones, Trash2, CheckCheck
} from 'lucide-react';

export default function NotificationDrawer({
  isOpen,
  onClose,
  notifications = [],
  onMarkAllAsRead,
  onClearAll,
  onOpenFeedback
}) {
  const [filter, setFilter] = useState('all'); // 'all' | 'unread' | 'feedback'

  if (!isOpen) return null;

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'feedback') return n.type === 'feedback' || n.type === 'project_verified' || n.type === 'quiz';
    return true;
  });

  const getIcon = (type) => {
    switch (type) {
      case 'project_verified':
        return <ShieldCheck className="w-4 h-4 text-emerald-600" />;
      case 'quiz':
        return <Award className="w-4 h-4 text-blue-600" />;
      case 'feedback':
        return <MessageSquare className="w-4 h-4 text-purple-600" />;
      case 'podcast':
        return <Headphones className="w-4 h-4 text-indigo-600" />;
      default:
        return <Sparkles className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-50 flex justify-end animate-notifFadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white border-l border-slate-200 w-full max-w-md h-full flex flex-col shadow-2xl animate-notifDrawerSlide overflow-hidden"
      >
        {/* Top Accent Line */}
        <div className="h-[2px] w-full bg-blue-600" />

        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className="w-9 h-9 rounded-xl bg-indigo-600/40 border border-indigo-400/30 flex items-center justify-center relative shadow-sm"
              style={{ animation: 'gentleChime 0.8s ease-in-out 0.15s both' }}
            >
              <Bell className="w-5 h-5 text-indigo-300" />
              {notifications.some(n => !n.read) && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-slate-900 animate-pulse" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base text-white font-bold font-outfit leading-none">Stored Notification Stream</h2>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[9px] text-emerald-400 font-semibold tracking-wide">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">All alerts &amp; AI feedback history</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-all duration-200 hover:rotate-90"
            title="Close notifications"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Bar & Action Buttons */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2">
          <div className="flex space-x-1">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all duration-150 ${filter === 'all' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-200'
                }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all duration-150 ${filter === 'unread' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-200'
                }`}
            >
              Unread ({notifications.filter(n => !n.read).length})
            </button>
            <button
              onClick={() => setFilter('feedback')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all duration-150 ${filter === 'feedback' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-200'
                }`}
            >
              Feedback
            </button>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={onMarkAllAsRead}
              title="Mark all as read"
              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-200 transition active:scale-90"
            >
              <CheckCheck className="w-4 h-4" />
            </button>
            <button
              onClick={onClearAll}
              title="Clear all notifications"
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-200 transition active:scale-90"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notifications List Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="p-8 text-center text-slate-400 space-y-2 animate-fadeIn">
              <Bell className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-semibold text-slate-600">No stored notifications</p>
              <p className="text-[11px]">System notifications &amp; AI feedback will appear here automatically.</p>
            </div>
          ) : (
            filteredNotifications.map((notif, idx) => (
              <div
                key={notif.id}
                onClick={() => {
                  if (onOpenFeedback && (notif.type === 'feedback' || notif.type === 'project_verified')) {
                    onOpenFeedback();
                  }
                }}
                style={{
                  animation: 'notifItemEnter 0.3s cubic-bezier(0.16, 1, 0.3, 1) both',
                  animationDelay: `${Math.min(idx * 0.04, 0.28)}s`
                }}
                className={`p-3.5 rounded-2xl border cursor-pointer relative group transition-all duration-200 ease-out hover:-translate-x-1 hover:shadow-md ${notif.read
                    ? 'bg-white border-slate-200/90 text-slate-700 hover:border-indigo-300'
                    : 'bg-indigo-50/70 border-indigo-200 text-slate-900 shadow-2xs ring-1 ring-indigo-400/20 hover:border-indigo-400'
                  }`}
              >
                {!notif.read && (
                  <span className="absolute top-3.5 right-3.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-60" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600" />
                  </span>
                )}

                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs shrink-0 mt-0.5 group-hover:scale-105 transition-transform duration-200">
                    {getIcon(notif.type)}
                  </div>

                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between pr-4">
                      <span className="text-xs font-bold font-outfit text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {notif.title}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{notif.time || 'Just now'}</span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {notif.message}
                    </p>

                    {(notif.type === 'feedback' || notif.type === 'project_verified') && (
                      <span className="inline-block text-[10px] font-bold text-indigo-600 group-hover:translate-x-0.5 transition-transform duration-150 pt-1">
                        View Detailed Feedback &rarr;
                      </span>
                    )}

                    {notif.type === 'plan' && (
                      <div className="pt-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            alert("Employee marked as Notified!");
                          }}
                          className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold shadow-sm transition-all active:scale-95"
                        >
                          Notified
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Action */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-center">
          <button
            onClick={() => { onClose(); if (onOpenFeedback) onOpenFeedback(); }}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white text-xs font-bold shadow-xs transition-all duration-150"
          >
            Open All Feedback &amp; Evaluation Area
          </button>
        </div>

      </div>
    </div>
  );
}

