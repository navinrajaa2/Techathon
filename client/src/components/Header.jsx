import React, { useState, useEffect, useRef } from 'react';
import { Compass, Users, Sparkles, SlidersHorizontal, Layers, ChevronDown, Zap } from 'lucide-react';

const NAV_TABS = [
  { id: 'roadmap', label: 'Adaptive Roadmap', shortLabel: 'Roadmap', icon: Sparkles },
  { id: 'gap', label: 'Skill Gaps', shortLabel: 'Gaps', icon: Layers },
  { id: 'simulator', label: 'Career Simulator', shortLabel: 'Simulator', icon: Zap },
  { id: 'manager', label: 'Manager Heatmap', shortLabel: 'Team', icon: Users }
];

export default function Header({ 
  activeTab, 
  setActiveTab, 
  selectedPersona, 
  personas, 
  onSelectPersona, 
  onOpenSkillModal 
}) {
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0, height: 0, opacity: 0 });
  const tabRefs = useRef({});

  // Recalculate sliding pill coordinates smoothly on activeTab or window resize
  useEffect(() => {
    const updatePill = () => {
      const activeEl = tabRefs.current[activeTab];
      if (activeEl) {
        setPillStyle({
          left: activeEl.offsetLeft,
          top: activeEl.offsetTop,
          width: activeEl.offsetWidth,
          height: activeEl.offsetHeight,
          opacity: 1
        });
      }
    };

    updatePill();
    window.addEventListener('resize', updatePill);
    return () => window.removeEventListener('resize', updatePill);
  }, [activeTab]);

  return (
    <header className="sticky top-0 z-40 bg-white/90 border-b border-slate-200/90 backdrop-blur-md shadow-sm shadow-slate-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 flex items-center justify-center shadow-md shadow-blue-500/20">
              <Compass className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-extrabold tracking-tight text-slate-900 font-outfit">PathCraft</span>
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-blue-50 text-blue-600 border border-blue-200 shadow-xs">AI</span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block font-medium">Adaptive Employee Growth & Career Pathing</p>
            </div>
          </div>

          {/* Sliding Pill Navigation Container */}
          <nav className="relative flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/80 shadow-2xs">
            
            {/* Smooth Floating Pill Indicator */}
            <span
              className="absolute bg-white rounded-lg border border-slate-200/90 shadow-sm transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none"
              style={{
                left: `${pillStyle.left}px`,
                top: `${pillStyle.top}px`,
                width: `${pillStyle.width}px`,
                height: `${pillStyle.height}px`,
                opacity: pillStyle.opacity
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
                  className={`relative z-10 flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors duration-200 select-none ${
                    isActive 
                      ? 'text-blue-700' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Icon 
                    className={`w-3.5 h-3.5 transition-colors duration-200 ${
                      isActive ? 'text-blue-600' : 'text-slate-400'
                    }`} 
                  />
                  <span className="hidden md:inline">{tab.label}</span>
                  <span className="md:hidden">{tab.shortLabel}</span>
                </button>
              );
            })}
          </nav>

          {/* Controls: Persona & Edit Skills */}
          <div className="flex items-center space-x-2.5">
            
            {/* Edit Skills Button */}
            <button
              onClick={onOpenSkillModal}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs transition active:scale-95"
              title="Edit skills, scan resume, or use AI free-text parser"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Profile & Skills</span>
            </button>

            {/* Persona Switcher Pill */}
            <div className="relative group">
              <button className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 hover:border-blue-300 hover:bg-blue-50/50 shadow-xs transition active:scale-95">
                <img 
                  src={selectedPersona?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"} 
                  alt={selectedPersona?.name} 
                  className="w-6 h-6 rounded-full object-cover ring-2 ring-blue-500/20"
                />
                <div className="text-left hidden lg:block">
                  <div className="font-bold text-slate-800 leading-none">{selectedPersona?.name || 'Priya Sharma'}</div>
                  <div className="text-[10px] text-slate-500 leading-tight mt-0.5">{selectedPersona?.role}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Dropdown Menu */}
              <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 hidden group-hover:block z-50 animate-fadeIn">
                <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Switch Learner Persona
                </div>
                {personas.map((p, idx) => (
                  <button
                    key={p.id || p._id || idx}
                    onClick={() => onSelectPersona(p)}
                    className={`w-full text-left flex items-center space-x-3 p-2.5 rounded-xl transition ${
                      (selectedPersona?.id === p.id || selectedPersona?._id === p._id)
                        ? 'bg-blue-50/80 border border-blue-200 text-blue-900' 
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <img src={p.avatar} alt={p.name} className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200" />
                    <div>
                      <div className="text-xs font-bold text-slate-800">{p.name}</div>
                      <div className="text-[11px] text-slate-500">{p.role} → <span className="text-blue-600 font-semibold">{p.target_role_id?.replace(/^sr_|^lead_/, '').replace(/_/g, ' ')}</span></div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
}
