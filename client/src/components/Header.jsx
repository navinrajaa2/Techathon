import React, { useState, useEffect, useRef } from 'react';
import { Compass, Users, Sparkles, SlidersHorizontal, Layers, ChevronDown, Zap, Bell } from 'lucide-react';

const NAV_TABS = [
  { id: 'roadmap',   label: 'Adaptive Roadmap', shortLabel: 'Roadmap',   icon: Sparkles, color: 'from-violet-500 to-purple-600' },
  { id: 'gap',       label: 'Skill Gaps',        shortLabel: 'Gaps',      icon: Layers,   color: 'from-sky-500 to-blue-600'    },
  { id: 'simulator', label: 'Career Simulator',  shortLabel: 'Simulator', icon: Zap,      color: 'from-amber-400 to-orange-500'},
  { id: 'manager',   label: 'Manager Heatmap',   shortLabel: 'Team',      icon: Users,    color: 'from-emerald-400 to-teal-600'},
];

export default function Header({ activeTab, setActiveTab, selectedPersona, personas, onSelectPersona, onOpenSkillModal }) {
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0, height: 0, opacity: 0 });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const tabRefs   = useRef({});
  const dropRef   = useRef(null);

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
    <header style={{ background: 'linear-gradient(135deg,#0f0f1a 0%,#0d1b2e 60%,#0a1628 100%)' }}
      className="sticky top-0 z-50 border-b border-white/[0.06] shadow-2xl"
    >
      {/* Top accent bar */}
      <div className="h-[2px] w-full" style={{ background: 'linear-gradient(90deg,#6366f1,#06b6d4,#8b5cf6,#ec4899)' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[62px] gap-4">

          {/* ── Logo ── */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
                style={{ background: 'linear-gradient(135deg,#6366f1,#06b6d4)' }}>
                <Compass className="w-5 h-5 text-white" />
              </div>
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-[#0f0f1a]"
                style={{ background: 'linear-gradient(135deg,#34d399,#10b981)' }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-extrabold tracking-tight text-white leading-none"
                  style={{ fontFamily: "'Outfit',sans-serif", letterSpacing: '-0.5px' }}>
                  PathCraft
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md border"
                  style={{ background: 'rgba(99,102,241,.15)', borderColor: 'rgba(99,102,241,.35)', color: '#818cf8' }}>
                  AI
                </span>
              </div>
              <p className="text-[10px] text-slate-500 hidden sm:block font-medium mt-0.5">
                Adaptive Growth &amp; Career Pathing
              </p>
            </div>
          </div>

          {/* ── Navigation Tabs ── */}
          <nav className="relative flex items-center p-1 rounded-xl flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>

            {/* Sliding pill */}
            <span
              className="absolute rounded-lg pointer-events-none transition-all duration-300"
              style={{
                left:    `${pillStyle.left}px`,
                top:     `${pillStyle.top}px`,
                width:   `${pillStyle.width}px`,
                height:  `${pillStyle.height}px`,
                opacity:  pillStyle.opacity,
                background: 'linear-gradient(135deg,rgba(99,102,241,.25),rgba(6,182,212,.18))',
                border: '1px solid rgba(99,102,241,.35)',
                boxShadow: '0 0 16px rgba(99,102,241,.2)',
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
                  style={{ color: isActive ? '#c7d2fe' : 'rgba(148,163,184,.7)' }}
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: isActive ? '#818cf8' : 'rgba(100,116,139,.7)' }} />
                  <span className="hidden md:inline">{tab.label}</span>
                  <span className="md:hidden">{tab.shortLabel}</span>
                </button>
              );
            })}
          </nav>

          {/* ── Right Controls ── */}
          <div className="flex items-center gap-2 flex-shrink-0">

            {/* Edit Skills */}
            <button
              onClick={onOpenSkillModal}
              title="Edit skills, scan resume, or use AI free-text parser"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 active:scale-95 whitespace-nowrap"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(203,213,225,.85)'
              }}
              onMouseEnter={e => { e.currentTarget.style.background='rgba(99,102,241,.18)'; e.currentTarget.style.borderColor='rgba(99,102,241,.4)'; e.currentTarget.style.color='#c7d2fe'; }}
              onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.1)'; e.currentTarget.style.color='rgba(203,213,225,.85)'; }}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" style={{ color: '#818cf8' }} />
              <span className="hidden sm:inline">Profile &amp; Skills</span>
            </button>

            {/* Persona Switcher */}
            <div className="relative" ref={dropRef}>
              <button
                onClick={() => setDropdownOpen(v => !v)}
                className="flex items-center gap-2 px-2.5 py-2 rounded-xl transition-all duration-200 active:scale-95"
                style={{
                  background: dropdownOpen ? 'rgba(99,102,241,.18)' : 'rgba(255,255,255,0.06)',
                  border: `1px solid ${dropdownOpen ? 'rgba(99,102,241,.4)' : 'rgba(255,255,255,0.1)'}`,
                }}
              >
                <div className="relative">
                  <img
                    src={selectedPersona?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                    alt={selectedPersona?.name}
                    className="w-7 h-7 rounded-full object-cover"
                    style={{ boxShadow: '0 0 0 2px rgba(99,102,241,.5)' }}
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-[#0f0f1a]"
                    style={{ background: '#34d399' }} />
                </div>
                <div className="text-left hidden lg:block">
                  <div className="text-xs font-bold text-slate-200 leading-none">{selectedPersona?.name || 'Priya Sharma'}</div>
                  <div className="text-[10px] text-slate-500 leading-tight mt-0.5 truncate max-w-[100px]">{selectedPersona?.role}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 transition-transform duration-200"
                  style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
              </button>

              {/* Dropdown */}
              {dropdownOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-72 rounded-2xl p-2 z-50"
                  style={{
                    background: 'linear-gradient(135deg,#0f0f1a,#0d1b2e)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(99,102,241,.1)',
                    animation: 'slideDown 0.18s cubic-bezier(0.34,1.56,0.64,1)'
                  }}
                >
                  <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest"
                    style={{ color: 'rgba(148,163,184,.4)' }}>
                    Switch Learner Persona
                  </div>

                  {personas.map((p, idx) => {
                    const isSel = (selectedPersona?.id === p.id || selectedPersona?._id === p._id);
                    return (
                      <button
                        key={p.id || p._id || idx}
                        onClick={() => { onSelectPersona(p); setDropdownOpen(false); }}
                        className="w-full text-left flex items-center gap-3 p-2.5 rounded-xl transition-all duration-150"
                        style={{
                          background: isSel ? 'rgba(99,102,241,.15)' : 'transparent',
                          border: isSel ? '1px solid rgba(99,102,241,.3)' : '1px solid transparent',
                        }}
                        onMouseEnter={e => { if (!isSel) { e.currentTarget.style.background = 'rgba(255,255,255,.05)'; }}}
                        onMouseLeave={e => { if (!isSel) { e.currentTarget.style.background = 'transparent'; }}}
                      >
                        <div className="relative flex-shrink-0">
                          <img src={p.avatar} alt={p.name} className="w-10 h-10 rounded-full object-cover"
                            style={{ boxShadow: isSel ? '0 0 0 2px rgba(99,102,241,.6)' : '0 0 0 1px rgba(255,255,255,.1)' }} />
                          {isSel && (
                            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 flex items-center justify-center"
                              style={{ background: '#34d399', borderColor: '#0f0f1a', fontSize: 7 }}>✓</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-slate-200 truncate">{p.name}</div>
                          <div className="text-[11px] text-slate-500 truncate mt-0.5">
                            {p.role}
                            <span className="text-indigo-400 font-semibold ml-1">
                              → {p.target_role_id?.replace(/^sr_|^lead_/, '').replace(/_/g, ' ')}
                            </span>
                          </div>
                        </div>
                        {isSel && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                            style={{ background: 'rgba(99,102,241,.25)', color: '#a5b4fc' }}>Active</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
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
