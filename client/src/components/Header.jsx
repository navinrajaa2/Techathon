import React, { useState, useEffect, useRef } from 'react';
import { Compass, Users, Sparkles, SlidersHorizontal, Layers, ChevronDown, Zap, Bell } from 'lucide-react';

const NAV_TABS = [
  { id: 'roadmap', label: 'Adaptive Roadmap', shortLabel: 'Roadmap', icon: Sparkles, color: 'from-violet-500 to-purple-600' },
  { id: 'gap', label: 'Skill Gaps', shortLabel: 'Gaps', icon: Layers, color: 'from-sky-500 to-blue-600' },
  { id: 'simulator', label: 'Career Simulator', shortLabel: 'Simulator', icon: Zap, color: 'from-amber-400 to-orange-500' },
  { id: 'manager', label: 'Manager Heatmap', shortLabel: 'Team', icon: Users, color: 'from-emerald-400 to-teal-600' },
];

export default function Header({
  activeTab,
  setActiveTab,
  selectedPersona,
  personas,
  onSelectPersona,
  onOpenSkillModal,
  unreadCount = 3,
  onOpenNotifications,
  isNotificationOpen = false,
  onOpenFeedback
}) {
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0, height: 0, opacity: 0 });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const tabRefs = useRef({});
  const dropRef = useRef(null);

  // Sliding pill calculation
  useEffect(() => {
    const update = () => {
      const el = tabRefs.current[activeTab];
      if (el) {
        setPillStyle({ left: el.offsetLeft, top: el.offsetTop, width: el.offsetWidth, height: el.offsetHeight, opacity: 1 });
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [activeTab]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropdownOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const activeTab_ = NAV_TABS.find(t => t.id === activeTab);

  return (
    <header className="sticky top-0 z-50 bg-black border-b border-zinc-800 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[62px] gap-4">

          {/* ── Logo ── */}
          <div className="flex items-center gap-3 flex-shrink-0">

            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-extrabold tracking-tight text-white leading-none"
                  style={{ fontFamily: "'Outfit',sans-serif", letterSpacing: '-0.5px' }}>
                  <a href='https://coditetechathon.vercel.app/'>PathCraft</a>
                </span>

              </div>
              <p className="text-[10px] text-zinc-400 hidden sm:block font-medium mt-0.5">
                Adaptive Growth &amp; Career Pathing
              </p>
            </div>
          </div>

          {/* ── Navigation Tabs ── */}
          <nav className="relative flex items-center p-1 rounded-xl flex-shrink-0 bg-zinc-900 border border-zinc-800 overflow-x-auto no-scrollbar max-w-full">

            {/* Sliding pill */}
            <span
              className="absolute rounded-lg pointer-events-none transition-all duration-300 bg-zinc-800 border border-zinc-700 shadow-sm"
              style={{
                left: `${pillStyle.left}px`,
                top: `${pillStyle.top}px`,
                width: `${pillStyle.width}px`,
                height: `${pillStyle.height}px`,
                opacity: pillStyle.opacity,
                transitionTimingFunction: 'cubic-bezier(0.34,1.56,0.64,1)'
              }}
            />

            {NAV_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  ref={(el) => (tabRefs.current[tab.id] = el)}
                  onClick={() => setActiveTab(tab.id)}
                  className="relative z-10 flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200 select-none whitespace-nowrap"
                  style={{ color: isActive ? '#ffffff' : '#a1a1aa' }}
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: isActive ? '#38bdf8' : '#71717a' }} />
                  <span className="hidden md:inline">{tab.label}</span>
                  <span className="md:hidden">{tab.shortLabel}</span>
                </button>
              );
            })}
          </nav>

          {/* ── Right Controls ── */}
          <div className="flex items-center gap-2 flex-shrink-0">

            {/* Feedback & Review Area Button */}
            <button
              onClick={onOpenFeedback}
              title="Central Feedback & Evaluation Area"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 hover:bg-emerald-900/90 transition-all duration-200 active:scale-95 whitespace-nowrap"
            >
              <span>Feedback Hub</span>
            </button>

            {/* Edit Skills */}
            <button
              onClick={onOpenSkillModal}
              title="Edit skills, scan resume, or use AI free-text parser"
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all duration-200 active:scale-95 whitespace-nowrap"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-400" />
              <span className="hidden sm:inline">Profile &amp; Skills</span>
            </button>

            {/* Persona Switcher */}
            <div className="relative" ref={dropRef}>
              <button
                onClick={() => setDropdownOpen(v => !v)}
                className={`flex items-center gap-2 px-2.5 py-2 rounded-xl transition-all duration-200 active:scale-95 bg-zinc-900 border ${dropdownOpen ? 'border-zinc-600 bg-zinc-800' : 'border-zinc-800'
                  }`}
              >
                <div className="relative">
                  <img
                    src={selectedPersona?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                    alt={selectedPersona?.name}
                    className="w-7 h-7 rounded-full object-cover border border-zinc-700"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-black bg-emerald-500" />
                </div>
                <div className="text-left hidden lg:block">
                  <div className="text-xs font-bold text-zinc-100 leading-none">{selectedPersona?.name || 'Priya Sharma'}</div>
                  <div className="text-[10px] text-zinc-400 leading-tight mt-0.5 truncate max-w-[100px]">{selectedPersona?.role}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 transition-transform duration-200"
                  style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
              </button>

              {/* Dropdown */}
              {dropdownOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-72 rounded-2xl p-2 z-50 bg-zinc-900 border border-zinc-800 shadow-2xl"
                  style={{
                    animation: 'slideDown 0.18s cubic-bezier(0.34,1.56,0.64,1)'
                  }}
                >
                  <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                    Switch Learner Persona
                  </div>

                  {personas.map((p, idx) => {
                    const isSel = (selectedPersona?.id === p.id || selectedPersona?._id === p._id);
                    return (
                      <button
                        key={p.id || p._id || idx}
                        onClick={() => { onSelectPersona(p); setDropdownOpen(false); }}
                        className={`w-full text-left flex items-center gap-3 p-2.5 rounded-xl transition-all duration-150 ${isSel ? 'bg-zinc-800 border border-zinc-700' : 'hover:bg-zinc-800/60 border border-transparent'
                          }`}
                      >
                        <div className="relative flex-shrink-0">
                          <img src={p.avatar} alt={p.name} className="w-10 h-10 rounded-full object-cover border border-zinc-700" />
                          {isSel && (
                            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-black flex items-center justify-center text-[8px] font-black text-black">✓</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-zinc-100 truncate">{p.name}</div>
                          <div className="text-[11px] text-zinc-400 truncate mt-0.5">
                            {p.role}
                            <span className="text-sky-400 font-semibold ml-1">
                              → {p.target_role_id?.replace(/^sr_|^lead_/, '').replace(/_/g, ' ')}
                            </span>
                          </div>
                        </div>
                        {isSel && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-zinc-700 text-zinc-200">Active</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Stored Notification Stream Bell Button */}
            <button
              onClick={onOpenNotifications}
              title="Stored Notifications & AI Feedback Stream"
              className={`relative p-2 rounded-xl transition-all duration-200 active:scale-95 flex items-center justify-center bg-zinc-900 border ${isNotificationOpen ? 'border-sky-500/60 text-sky-200 bg-zinc-800' : 'border-zinc-800 text-zinc-300 hover:bg-zinc-800'
                }`}
            >
              <Bell className={`w-4 h-4 ${isNotificationOpen ? 'text-sky-400 animate-pulse' : 'text-zinc-300'}`} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.2 text-[9px] font-black rounded-full bg-rose-500 text-white border border-black shadow-sm animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </header>
  );
}
