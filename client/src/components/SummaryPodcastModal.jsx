import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Radio, Play, Pause, RotateCw, Volume2, VolumeX, Headphones, 
  Sparkles, CheckCircle2, List, Clock, FastForward, User, MessageCircle
} from 'lucide-react';
import { fetchLessonPodcast } from '../services/api';

export default function SummaryPodcastModal({ isOpen, onClose, moduleTitle, skillName, targetRoleTitle }) {
  const [podcastData, setPodcastData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeDialogueIndex, setActiveDialogueIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1); // 1, 1.25, 1.5, 2
  const [selectedModule, setSelectedModule] = useState(moduleTitle || 'SQL & Data Warehousing');

  const speechSynthRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      loadPodcast(selectedModule);
    } else {
      stopAudio();
    }
  }, [isOpen, selectedModule]);

  const loadPodcast = async (modName) => {
    stopAudio();
    setLoading(true);
    setActiveDialogueIndex(0);

    const data = await fetchLessonPodcast({
      moduleTitle: modName,
      skillName: modName,
      targetRoleTitle: targetRoleTitle || 'Senior Data Analyst'
    });

    if (data) {
      setPodcastData(data);
    } else {
      // High quality fallback podcast
      setPodcastData({
        podcast_id: `pod_${Date.now()}`,
        title: `TechCraft AI Podcast: Mastering ${modName}`,
        duration_seconds: 210,
        formatted_duration: "03:30",
        summary: `Join Alex and Dr. Maya as they break down the core concepts, common pitfalls, and production best practices for ${modName} on the path to ${targetRoleTitle || 'Senior Role'}.`,
        hosts: [
          { name: "Alex", role: "Co-Host & Tech Journalist", avatar: "A" },
          { name: "Dr. Maya", role: "Senior Staff Enterprise Specialist", avatar: "M" }
        ],
        chapters: [
          { time: "00:00", title: "Welcome & High-Level Problem Statement" },
          { time: "01:15", title: "Core Technical Breakdown & Window Functions" },
          { time: "02:30", title: "Enterprise Production & Career Takeaways" }
        ],
        dialogue: [
          {
            speaker: "Alex",
            text: `Welcome back to the PathCraft AI Daily Podcast! Today, we're breaking down a crucial module on your roadmap: ${modName}. Dr. Maya, why is this skill so essential for an engineer aiming for ${targetRoleTitle || 'Senior Role'}?`
          },
          {
            speaker: "Dr. Maya",
            text: `Great question, Alex! At enterprise scale, writing code or SQL that just 'works' isn't enough. When dealing with millions of records, how you partition data with Window Functions like RANK and DENSE_RANK directly impacts database CPU and query execution speed.`
          },
          {
            speaker: "Alex",
            text: `Ah! So window functions let us perform calculations across a set of table rows related to the current row without collapsing everything into a single row like GROUP BY does?`
          },
          {
            speaker: "Dr. Maya",
            text: `Spot on! For example, when calculating customer cohort retention or running sales rep leaderboards per department, PARTITION BY keeps row identities intact while giving you per-group analytical metrics instantly.`
          },
          {
            speaker: "Alex",
            text: `That is super clean. What's the number one mistake you see junior engineers make when building these analytics pipelines?`
          },
          {
            speaker: "Dr. Maya",
            text: `Omitting filter predicates early! Always push down WHERE clauses before applying window framing or sorting. That way, you only process relevant rows rather than performing redundant table scans.`
          },
          {
            speaker: "Alex",
            text: `Awesome takeaway! Make sure to test your code in the Code Workbench or complete the Project Challenge on your roadmap. Thanks for listening!`
          }
        ],
        key_takeaways: [
          "Window functions (RANK, DENSE_RANK, SUM OVER) preserve individual row identities while computing group metrics",
          "Push down filter predicates early to prevent full sequential table scans",
          "Structure complex transformations with readable Common Table Expressions (CTEs)"
        ]
      });
    }
    setLoading(false);
  };

  const stopAudio = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
  };

  const speakCurrentLine = (index) => {
    if (!podcastData || !podcastData.dialogue || index >= podcastData.dialogue.length) {
      setIsPlaying(false);
      setActiveDialogueIndex(0);
      return;
    }

    if (!('speechSynthesis' in window)) {
      setIsPlaying(false);
      return;
    }

    window.speechSynthesis.cancel();

    const line = podcastData.dialogue[index];
    const utterance = new SpeechSynthesisUtterance(line.text);
    utterance.rate = playbackSpeed;

    // Pitch variation per speaker for 2-person podcast feel
    if (line.speaker === 'Alex') {
      utterance.pitch = 1.1;
    } else {
      utterance.pitch = 0.9;
    }

    utterance.onend = () => {
      if (index + 1 < podcastData.dialogue.length) {
        setActiveDialogueIndex(index + 1);
        speakCurrentLine(index + 1);
      } else {
        setIsPlaying(false);
        setActiveDialogueIndex(0);
      }
    };

    utterance.onerror = () => {
      setIsPlaying(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      setIsPlaying(true);
      speakCurrentLine(activeDialogueIndex);
    }
  };

  const handleSelectDialogue = (idx) => {
    setActiveDialogueIndex(idx);
    if (isPlaying) {
      speakCurrentLine(idx);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white border border-slate-200/90 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        
        {/* Header - Clean Light Theme */}
        <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-blue-50 p-6 border-b border-indigo-100/80 relative">
          <button
            onClick={() => { stopAudio(); onClose(); }}
            className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-white/80 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 text-indigo-800 border border-indigo-200 uppercase tracking-wide">
                  AI Lesson Summary Podcast
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  2-Host Audio Breakdown
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 font-outfit mt-0.5">
                Module Summary Audio Podcast
              </h2>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 flex-1">

          {/* Module Selector Pill Bar */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 border-b border-slate-200">
            {['SQL & Data Warehousing', 'Window Functions', 'Statistical Modeling', 'Python Analytics', 'LLM Engineering'].map((mod) => (
              <button
                key={mod}
                onClick={() => setSelectedModule(mod)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  selectedModule === mod
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {mod}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="p-12 text-center bg-slate-50 rounded-2xl border border-slate-200">
              <div className="animate-spin w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full mx-auto mb-3"></div>
              <p className="text-sm font-semibold text-slate-700">Generating AI audio podcast for '{selectedModule}'...</p>
            </div>
          ) : podcastData && (
            <>
              {/* Podcast Audio Player Card - Light Theme */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-950 text-white shadow-lg space-y-5 relative overflow-hidden">
                
                {/* Background glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-widest flex items-center space-x-1.5">
                      <Radio className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                      <span>TechCraft AI Daily Podcast</span>
                    </span>
                    <h3 className="text-lg font-bold font-outfit text-white">
                      {podcastData.title}
                    </h3>
                    <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                      {podcastData.summary}
                    </p>
                  </div>

                  {/* Soundwave animation bars */}
                  <div className="flex items-center space-x-1 h-8 px-3 py-1.5 bg-white/10 rounded-xl backdrop-blur-md border border-white/10">
                    {[40, 70, 30, 90, 50, 80, 40, 60].map((h, i) => (
                      <div
                        key={i}
                        className={`w-1 bg-indigo-400 rounded-full transition-all duration-300 ${
                          isPlaying ? 'animate-bounce' : 'opacity-40'
                        }`}
                        style={{
                          height: isPlaying ? `${Math.max(20, (h * (i + 1) * 17) % 100)}%` : `${h / 3}%`,
                          animationDelay: `${i * 0.15}s`
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Player Controls Bar */}
                <div className="flex items-center justify-between pt-2 border-t border-white/10 relative z-10">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={handleTogglePlay}
                      className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white flex items-center justify-center shadow-lg transition active:scale-95"
                    >
                      {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
                    </button>

                    <div>
                      <span className="text-xs font-bold text-white block">
                        {isPlaying ? `Playing Line ${activeDialogueIndex + 1}/${podcastData.dialogue?.length || 0}` : 'Audio Paused'}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {podcastData.formatted_duration || '03:30'} • 2-Host Dialogue
                      </span>
                    </div>
                  </div>

                  {/* Speed selector */}
                  <div className="flex items-center space-x-1 bg-white/10 p-1 rounded-xl border border-white/10 text-xs">
                    {[1, 1.25, 1.5, 2].map((spd) => (
                      <button
                        key={spd}
                        onClick={() => setPlaybackSpeed(spd)}
                        className={`px-2 py-0.5 rounded-lg font-bold transition ${
                          playbackSpeed === spd
                            ? 'bg-indigo-500 text-white shadow-xs'
                            : 'text-slate-300 hover:text-white'
                        }`}
                      >
                        {spd}x
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Host Avatars Banner - Light Theme */}
              <div className="grid grid-cols-2 gap-3">
                {(podcastData.hosts || []).map((h, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center space-x-2.5">
                    <div className="text-xl">{h.avatar}</div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 font-outfit">{h.name}</div>
                      <div className="text-[11px] text-slate-500">{h.role}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Interactive Dialogue Transcript Section - Light Theme */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                  <MessageCircle className="w-4 h-4 text-indigo-600" />
                  <span>Episode Dialogue Transcript (Click any line to play)</span>
                </h4>

                <div className="space-y-2.5">
                  {(podcastData.dialogue || []).map((line, idx) => {
                    const isActive = idx === activeDialogueIndex && isPlaying;
                    const isAlex = line.speaker === 'Alex';

                    return (
                      <div
                        key={idx}
                        onClick={() => handleSelectDialogue(idx)}
                        className={`p-3.5 rounded-xl transition cursor-pointer border ${
                          isActive
                            ? 'bg-indigo-50/90 border-indigo-300 shadow-xs ring-1 ring-indigo-400/30'
                            : 'bg-white hover:bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-bold flex items-center space-x-1 ${
                            isAlex ? 'text-indigo-700' : 'text-purple-700'
                          }`}>
                            <span>{isAlex ? '🎙️' : '👩‍💻'}</span>
                            <span>{line.speaker}</span>
                          </span>

                          {isActive && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-600 text-white animate-pulse">
                              NOW SPEAKING
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed">
                          {line.text}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Key Takeaways Checklist Card - Light Theme */}
              {podcastData.key_takeaways && (
                <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                  <h4 className="text-xs font-bold text-emerald-900 flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Podcast Core Key Takeaways</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-emerald-950">
                    {podcastData.key_takeaways.map((take, i) => (
                      <li key={i} className="flex items-start space-x-1.5">
                        <span className="text-emerald-600 font-bold">•</span>
                        <span>{take}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}

        </div>

      </div>
    </div>
  );
}
