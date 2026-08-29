import React, { useState } from 'react';
import { 
  X, Users, Coffee, Calendar, Clock, MessageSquare, CheckCircle2, Star, Sparkles, Send 
} from 'lucide-react';

const DEMO_MENTORS = [
  {
    id: 'm_marcus',
    name: 'Marcus Chen',
    role: 'Senior Fullstack Engineer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    expertSkills: ['React Frontend (Lvl 5)', 'Node/Express (Lvl 4)', 'System Design (Lvl 4)'],
    rating: 4.9,
    sessionsCount: 18,
    availability: 'Tomorrow at 3:00 PM'
  },
  {
    id: 'm_elena',
    name: 'Elena Rostova',
    role: 'Staff Machine Learning Engineer',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    expertSkills: ['LLM & RAG (Lvl 5)', 'Statistical Modeling (Lvl 5)', 'Python Analytics (Lvl 5)'],
    rating: 5.0,
    sessionsCount: 24,
    availability: 'Thursday at 11:30 AM'
  },
  {
    id: 'm_david',
    name: 'David Kim',
    role: 'Principal Cloud / DevOps Architect',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    expertSkills: ['Docker & Kubernetes (Lvl 5)', 'CI/CD & Cloud (Lvl 4)', 'SQL Tuning (Lvl 4)'],
    rating: 4.8,
    sessionsCount: 14,
    availability: 'Friday at 2:00 PM'
  }
];

export default function PeerMentorshipModal({ 
  isOpen, 
  onClose, 
  learnerName, 
  onBooked 
}) {
  const [selectedMentor, setSelectedMentor] = useState(DEMO_MENTORS[0]);
  const [topic, setTopic] = useState('Career advice on transitioning into Senior role & system architecture design');
  const [booked, setBooked] = useState(false);

  if (!isOpen) return null;

  const handleBooking = () => {
    setBooked(true);
    setTimeout(() => {
      if (onBooked) {
        onBooked(`🎉 30-min Coffee Chat scheduled with ${selectedMentor.name} for ${selectedMentor.availability}! Calendar invite sent.`);
      }
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-blue-100 text-blue-700 border border-blue-200">
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-outfit">Internal Peer Mentorship Network</h2>
              <p className="text-xs text-slate-500">Connect with colleagues who have mastered your target skills</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {booked ? (
            <div className="p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 font-outfit">Session Confirmed!</h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                Calendar invite sent to <strong>{selectedMentor.name}</strong> and your inbox. Meeting link and pre-read discussion agenda attached.
              </p>
            </div>
          ) : (
            <>
              {/* Mentors List */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                  <span>Recommended Internal Mentors</span>
                  <span className="text-blue-600 text-[11px] font-bold">100% Free & Internal</span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {DEMO_MENTORS.map((mentor) => {
                    const isSelected = selectedMentor.id === mentor.id;
                    return (
                      <div
                        key={mentor.id}
                        onClick={() => setSelectedMentor(mentor)}
                        className={`p-4 rounded-xl border transition cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-blue-50/70 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                            : 'bg-white border-slate-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <img src={mentor.avatar} alt={mentor.name} className="w-11 h-11 rounded-full object-cover ring-2 ring-slate-200" />
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="text-xs font-bold text-slate-900">{mentor.name}</h4>
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200 flex items-center space-x-0.5">
                                <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-500" />
                                <span>{mentor.rating}</span>
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500">{mentor.role}</p>
                            
                            <div className="flex flex-wrap gap-1 mt-1">
                              {mentor.expertSkills.map((sk, i) => (
                                <span key={i} className="text-[10px] px-1.5 py-0.2 rounded bg-white text-blue-700 font-bold border border-blue-200">
                                  {sk}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0 sm:self-center">
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 block">
                            {mentor.availability}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Booking Details */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Discussion Topic / Focus Area:
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div className="flex items-center justify-between text-slate-500 text-[11px]">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    <span>Duration: 30 Minutes Focus Block</span>
                  </span>
                  <span className="text-slate-400">Includes auto-generated discussion guide</span>
                </div>
              </div>
            </>
          )}

        </div>

        {/* Footer */}
        {!booked && (
          <div className="flex items-center justify-between p-4 border-t border-slate-200 bg-slate-50/70">
            <span className="text-xs text-slate-500">
              Selected Mentor: <strong className="text-slate-800">{selectedMentor.name}</strong>
            </span>

            <div className="flex items-center space-x-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleBooking}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition flex items-center space-x-1.5"
              >
                <Coffee className="w-3.5 h-3.5" />
                <span>Book 30-min Coffee Chat</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
