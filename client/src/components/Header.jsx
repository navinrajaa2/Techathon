import React from 'react';
import { Compass, Users, Sparkles, SlidersHorizontal, Award, Layers } from 'lucide-react';

export default function Header({ 
  activeTab, 
  setActiveTab, 
  selectedPersona, 
  personas, 
  onSelectPersona, 
  onOpenSkillModal 
}) {
  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-gray-800 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Tagline */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Compass className="w-6 h-6 text-white animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-white font-outfit">PathCraft</span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">AI</span>
              </div>
              <p className="text-[11px] text-gray-400 hidden sm:block">Adaptive Enterprise Learning & Skill Gap Engine</p>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => setActiveTab('roadmap')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'roadmap'
                  ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="hidden md:inline">Adaptive Roadmap</span>
            </button>

            <button
              onClick={() => setActiveTab('gap')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'gap'
                  ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40 shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <Layers className="w-4 h-4 text-purple-400" />
              <span className="hidden md:inline">Skill Gap Analysis</span>
            </button>

            <button
              onClick={() => setActiveTab('manager')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'manager'
                  ? 'bg-pink-600/30 text-pink-300 border border-pink-500/40 shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <Users className="w-4 h-4 text-pink-400" />
              <span className="hidden md:inline">Manager Heatmap</span>
            </button>
          </nav>

          {/* Controls: Persona & Edit Skills */}
          <div className="flex items-center space-x-3">
            
            {/* Edit Skills Button */}
            <button
              onClick={onOpenSkillModal}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 transition"
              title="Edit skills or use AI free-text parser"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Edit Skills & Goal</span>
            </button>

            {/* Persona Switcher Pill */}
            <div className="relative group">
              <button className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg bg-gray-900/80 border border-gray-700/80 text-xs text-gray-300 hover:border-indigo-500/50 transition">
                <img 
                  src={selectedPersona?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"} 
                  alt={selectedPersona?.name} 
                  className="w-6 h-6 rounded-full object-cover ring-1 ring-indigo-500/50"
                />
                <div className="text-left hidden lg:block">
                  <div className="font-semibold text-gray-200 leading-none">{selectedPersona?.name || 'Priya Sharma'}</div>
                  <div className="text-[10px] text-gray-400 leading-tight mt-0.5">{selectedPersona?.role}</div>
                </div>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/30">Demo</span>
              </button>

              {/* Dropdown Menu */}
              <div className="absolute right-0 top-full mt-2 w-64 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl p-2 hidden group-hover:block z-50 glass-panel">
                <div className="px-2 py-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Select Hackathon Persona
                </div>
                {personas.map(p => (
                  <button
                    key={p.id}
                    onClick={() => onSelectPersona(p)}
                    className={`w-full text-left flex items-center space-x-3 p-2 rounded-lg transition ${
                      selectedPersona?.id === p.id ? 'bg-indigo-600/20 border border-indigo-500/30' : 'hover:bg-gray-800/60'
                    }`}
                  >
                    <img src={p.avatar} alt={p.name} className="w-8 h-8 rounded-full object-cover" />
                    <div>
                      <div className="text-xs font-semibold text-white">{p.name}</div>
                      <div className="text-[11px] text-gray-400">{p.role} → <span className="text-indigo-300">{p.target_role_id?.replace(/^sr_|^lead_/, '').replace(/_/g, ' ')}</span></div>
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
