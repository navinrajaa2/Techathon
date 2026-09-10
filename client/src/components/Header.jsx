import React, { useState, useEffect, useRef } from 'react';
import { Compass, Users, Sparkles, SlidersHorizontal, Layers, ChevronDown, Zap, Bell, LogOut } from 'lucide-react';

const NAV_TABS = [
  { id: 'roadmap', label: 'Adaptive Roadmap', shortLabel: 'Roadmap', icon: Sparkles },
  { id: 'gap', label: 'Skill Gaps', shortLabel: 'Gaps', icon: Layers },
  { id: 'simulator', label: 'Career Simulator', shortLabel: 'Simulator', icon: Zap },
  { id: 'manager', label: 'Manager Heatmap', shortLabel: 'Team', icon: Users },
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
  onOpenFeedback,
  onLogout
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

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[62px] gap-4">

          {/* ── Logo ── */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-extrabold tracking-tight text-slate-900 leading-none"
                  style={{ fontFamily: "'Outfit',sans-serif", letterSpacing: '-0.5px' }}>
                  <a href='https://coditetechathon.vercel.app/' className="hover:text-blue-600 transition">PathCraft</a>
                </span>

              </div>
              <p className="text-[10px] text-slate-500 hidden sm:block font-medium mt-0.5">
                Adaptive Growth &amp; Career Pathing
              </p>
            </div>
          </div>

          {/* ── Navigation Tabs ── */}
          <nav className="relative flex items-center p-1 rounded-xl flex-shrink-0 bg-slate-100/80 border border-slate-200/80">

            {/* Sliding pill */}
            <span
              className="absolute rounded-lg pointer-events-none transition-all duration-300 bg-blue-600 shadow-xs"
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
                  className="relative z-10 flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200 select-none whitespace-nowrap cursor-pointer"
                  style={{ color: isActive ? '#ffffff' : '#475569' }}
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: isActive ? '#ffffff' : '#64748b' }} />
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
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100/80 transition-all duration-200 active:scale-95 whitespace-nowrap cursor-pointer"
            >
              <span>Feedback Hub</span>
            </button>

            {/* Edit Skills */}
            <button
              onClick={onOpenSkillModal}
              title="Edit skills, scan resume, or use AI free-text parser"
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200/80 transition-all duration-200 active:scale-95 whitespace-nowrap cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Profile &amp; Skills</span>
            </button>

            {/* Persona Switcher & User Profile */}
            <div className="relative" ref={dropRef}>
              <button
                onClick={() => setDropdownOpen(v => !v)}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl transition-all duration-200 active:scale-95 bg-slate-100 border cursor-pointer ${dropdownOpen ? 'border-blue-400 bg-blue-50/50' : 'border-slate-200 hover:bg-slate-200/60'
                  }`}
              >
                <div className="relative">
                  <img
                    src={selectedPersona?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80'}
                    alt={selectedPersona?.name}
                    className="w-7 h-7 rounded-full object-cover border border-slate-200"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-white bg-emerald-500" />
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 transition-transform duration-200"
                  style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
              </button>

              {/* Dropdown */}
              {dropdownOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-72 rounded-2xl p-2 z-50 bg-white border border-slate-200 shadow-xl"
                  style={{
                    animation: 'slideDown 0.18s cubic-bezier(0.34,1.56,0.64,1)'
                  }}
                >
                  <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                    Switch Learner Persona
                  </div>

                  {personas.map((p, idx) => {
                    const isSel = (selectedPersona?.id === p.id || selectedPersona?._id === p._id);
                    return (
                      <button
                        key={p.id || p._id || idx}
                        onClick={() => { onSelectPersona(p); setDropdownOpen(false); }}
                        className={`w-full text-left flex items-center gap-3 p-2 rounded-xl transition-all duration-150 cursor-pointer ${isSel ? 'bg-blue-50/80 border border-blue-200 text-blue-950 font-bold' : 'hover:bg-slate-50 border border-transparent text-slate-700'
                          }`}
                      >
                        <div className="relative flex-shrink-0">
                          <img src={p.avatar} alt={p.name} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                          {isSel && (
                            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center text-[7px] font-black text-white">✓</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold truncate">{p.name}</div>
                          <div className="text-[10px] text-slate-500 truncate">
                            {p.role}
                          </div>
                        </div>
                        {isSel && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700">Active</span>
                        )}
                      </button>
                    );
                  })}

                  <div className="border-t border-slate-100 mt-2 pt-1">
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        if (onLogout) onLogout();
                      }}
                      className="w-full text-left flex items-center gap-2 p-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-600" />
                      <span>Sign Out / Switch Account</span>
                    </button>
                  </div>

                </div>
              )}
            </div>

            {/* Stored Notification Stream Bell Button */}
            <button
              onClick={onOpenNotifications}
              title="Stored Notifications & AI Feedback Stream"
              className={`relative p-2 rounded-xl transition-all duration-200 active:scale-95 flex items-center justify-center bg-slate-100 border cursor-pointer ${isNotificationOpen ? 'border-blue-400 text-blue-700 bg-blue-50' : 'border-slate-200 text-slate-600 hover:bg-slate-200/80'
                }`}
            >
              <Bell className={`w-4 h-4 ${isNotificationOpen ? 'text-blue-600' : 'text-slate-600'}`} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.2 text-[9px] font-black rounded-full bg-rose-500 text-white border border-white shadow-xs">
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

