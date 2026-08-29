import React, { useState } from 'react';
import { 
  X, Trophy, Medal, Flame, Award, Users, TrendingUp, Sparkles, Star 
} from 'lucide-react';

const TOP_LEARNERS = [
  {
    rank: 1,
    name: 'Priya Sharma',
    role: 'Junior Data Analyst',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    points: 1240,
    streak: 8,
    verifiedCount: 5,
    department: 'Data & AI'
  },
  {
    rank: 2,
    name: 'Marcus Chen',
    role: 'Frontend Developer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    points: 1120,
    streak: 6,
    verifiedCount: 4,
    department: 'Engineering'
  },
  {
    rank: 3,
    name: 'Sarah Jenkins',
    role: 'Associate PM',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    points: 980,
    streak: 5,
    verifiedCount: 3,
    department: 'Product'
  },
  {
    rank: 4,
    name: 'Elena Rostova',
    role: 'Data Scientist',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    points: 860,
    streak: 4,
    verifiedCount: 3,
    department: 'Data & AI'
  }
];

const DEPARTMENTS = [
  { name: 'Data Analytics & AI', progress: 84, activeLearners: 12, totalHours: 142 },
  { name: 'Software Engineering', progress: 78, activeLearners: 18, totalHours: 186 },
  { name: 'Product Strategy', progress: 71, activeLearners: 8, totalHours: 68 },
  { name: 'Cloud & DevOps', progress: 65, activeLearners: 6, totalHours: 54 }
];

export default function LeaderboardModal({ 
  isOpen, 
  onClose, 
  currentUser 
}) {
  const [activeTab, setActiveTab] = useState('individuals'); // 'individuals' | 'departments'

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-amber-50 via-blue-50 to-indigo-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm shadow-amber-500/25">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-slate-900 font-outfit text-sm">
                  Global Leaderboard & Learning Circles
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-amber-100 text-amber-800">
                  Sprint Season 3
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Recognizing top active learners and department upskilling progress
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 bg-slate-50/60">
          
          {/* Tab Switcher */}
          <div className="flex items-center space-x-2 border-b border-slate-200 pb-3 text-xs font-bold">
            <button
              onClick={() => setActiveTab('individuals')}
              className={`px-3.5 py-1.5 rounded-xl transition flex items-center space-x-1.5 ${
                activeTab === 'individuals'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Star className="w-3.5 h-3.5" />
              <span>Top Individual Learners</span>
            </button>
            <button
              onClick={() => setActiveTab('departments')}
              className={`px-3.5 py-1.5 rounded-xl transition flex items-center space-x-1.5 ${
                activeTab === 'departments'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Department Learning Circles</span>
            </button>
          </div>

          {/* Tab 1: Individuals */}
          {activeTab === 'individuals' && (
            <div className="space-y-3 animate-fadeIn">
              {TOP_LEARNERS.map((learner) => {
                const isFirst = learner.rank === 1;
                const isSecond = learner.rank === 2;
                const isThird = learner.rank === 3;

                return (
                  <div
                    key={learner.name}
                    className={`p-3.5 rounded-2xl bg-white border transition flex items-center justify-between gap-3 ${
                      isFirst
                        ? 'border-amber-400 ring-2 ring-amber-400/20 shadow-xs'
                        : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs ${
                        isFirst ? 'bg-amber-500 text-white shadow-xs' : isSecond ? 'bg-slate-300 text-slate-800' : isThird ? 'bg-amber-700 text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {learner.rank}
                      </div>

                      <img src={learner.avatar} alt={learner.name} className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200" />
                      
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="text-xs font-bold text-slate-900">{learner.name}</h4>
                          <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                            {learner.department}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">{learner.role}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 text-right">
                      <div className="hidden sm:block">
                        <div className="text-[10px] font-bold uppercase text-slate-400">Streak</div>
                        <div className="text-xs font-black text-orange-600 flex items-center space-x-0.5 justify-end">
                          <Flame className="w-3.5 h-3.5 fill-orange-500" />
                          <span>{learner.streak}d</span>
                        </div>
                      </div>

                      <div className="hidden sm:block">
                        <div className="text-[10px] font-bold uppercase text-slate-400">Skills</div>
                        <div className="text-xs font-black text-emerald-700">{learner.verifiedCount} Verified</div>
                      </div>

                      <div className="bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200 text-center min-w-[70px]">
                        <div className="text-[9px] font-bold uppercase text-blue-600">XP Points</div>
                        <div className="text-sm font-black text-blue-900 font-outfit">{learner.points}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tab 2: Departments */}
          {activeTab === 'departments' && (
            <div className="space-y-3 animate-fadeIn">
              {DEPARTMENTS.map((dept, idx) => (
                <div key={dept.name} className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900">#{idx + 1} {dept.name}</span>
                      <span className="text-[10px] font-semibold text-slate-500">({dept.activeLearners} active upskillers)</span>
                    </div>
                    <span className="font-black text-blue-700">{dept.progress}% Goal Match</span>
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
                    <div 
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full" 
                      style={{ width: `${dept.progress}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>Total Team Hours: <strong>{dept.totalHours} hrs</strong></span>
                    <span className="text-emerald-700 font-bold">On-track for Q3 Promotion Goal</span>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-slate-200 bg-slate-50/70 text-xs">
          <span className="text-slate-500">
            Leaderboard resets on the 1st of every month.
          </span>
          <button onClick={onClose} className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs transition">
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
