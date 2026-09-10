import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import LoginPage from './components/LoginPage';
import GapAnalysisView from './components/GapAnalysisView';
import RoadmapView from './components/RoadmapView';
import CareerSimulatorView from './components/CareerSimulatorView';
import ManagerDashboard from './components/ManagerDashboard';
import SkillInputModal from './components/SkillInputModal';
import QuizModal from './components/QuizModal';
import AdaptiveNotice from './components/AdaptiveNotice';
import AIMentorDrawer from './components/AIMentorDrawer';
import CertificateModal from './components/CertificateModal';
import PeerMentorshipModal from './components/PeerMentorshipModal';
import DayInTheLifeModal from './components/DayInTheLifeModal';
import PromotionPitchModal from './components/PromotionPitchModal';
import CodePlaygroundModal from './components/CodePlaygroundModal';
import SlackIntegrationModal from './components/SlackIntegrationModal';
import LeaderboardModal from './components/LeaderboardModal';
import ProjectChallengeModal from './components/ProjectChallengeModal';
import AIInterviewerModal from './components/AIInterviewerModal';
import SummaryPodcastModal from './components/SummaryPodcastModal';
import NotificationDrawer from './components/NotificationDrawer';
import FeedbackAreaModal from './components/FeedbackAreaModal';

import { CheckCircle2, Sparkles, Sliders, X, FileText } from 'lucide-react';
import {
  fetchTaxonomy, fetchPersonas, calculateGapAnalysis, generatePath, replanPath
} from './services/api';

// Fallback taxonomy data in case backend is loading
const FALLBACK_PERSONAS = [
  {
    id: "p_navin",
    username: "navinrajaa",
    name: "Navin Rajaa",
    role: "Senior Tech Lead & AI Engineer",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    target_role_id: "lead_ai_eng",
    weekly_hours: 8,
    current_skills: {
      sql_mastery: 4,
      python_analytics: 4,
      llm_engineering: 3,
      node_express: 3,
      system_design: 3
    }
  },
  {
    id: "p_priya",
    name: "Priya Sharma",
    role: "Junior Data Analyst",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    target_role_id: "sr_data_analyst",
    weekly_hours: 6,
    current_skills: {
      sql_mastery: 2,
      python_analytics: 2,
      tableau_bi: 2,
      stat_modeling: 1,
      llm_engineering: 1
    }
  },
  {
    id: "p_marcus",
    name: "Marcus Chen",
    role: "Frontend Developer",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    target_role_id: "sr_fullstack_eng",
    weekly_hours: 8,
    current_skills: {
      react_frontend: 3,
      node_express: 2,
      sql_mastery: 1,
      system_design: 1
    }
  },
  {
    id: "p_sarah",
    name: "Sarah Jenkins",
    role: "Associate Product Manager",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    target_role_id: "lead_ai_pm",
    weekly_hours: 5,
    current_skills: {
      product_discovery: 2,
      ai_product_strategy: 1,
      stat_modeling: 1,
      tableau_bi: 2
    }
  }
];

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('roadmap'); // 'roadmap' | 'gap' | 'simulator' | 'manager'
  const [personas, setPersonas] = useState(FALLBACK_PERSONAS);
  const [selectedPersona, setSelectedPersona] = useState(FALLBACK_PERSONAS[0]);

  const handleLogin = (userData) => {
    setCurrentUser(userData);
    if (userData.persona) {
      setSelectedPersona(userData.persona);
      setCurrentSkills(userData.persona.current_skills || FALLBACK_PERSONAS[0].current_skills);
      setTargetRoleId(userData.persona.target_role_id || FALLBACK_PERSONAS[0].target_role_id);
    }
    setIsAuthenticated(true);
    setAdaptiveNotice(`Welcome back, ${userData.name}! Your career roadmap and skill matrix are ready.`);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  const [taxonomy, setTaxonomy] = useState({ skills: [], roles: [] });
  const [currentSkills, setCurrentSkills] = useState(FALLBACK_PERSONAS[0].current_skills);
  const [targetRoleId, setTargetRoleId] = useState(FALLBACK_PERSONAS[0].target_role_id);
  const [weeklyHours, setWeeklyHours] = useState(6);

  const [gapAnalysis, setGapAnalysis] = useState(null);
  const [learningPath, setLearningPath] = useState(null);

  // Modals & Drawers
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [activeQuizSkill, setActiveQuizSkill] = useState(null); // { id, name }
  const [adaptiveNotice, setAdaptiveNotice] = useState(null);
  const [isMentorOpen, setIsMentorOpen] = useState(false);
  const [mentorContextSkill, setMentorContextSkill] = useState(null);
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);
  const [isMentorshipOpen, setIsMentorshipOpen] = useState(false);
  const [isRoleplayOpen, setIsRoleplayOpen] = useState(false);
  const [isPromotionMemoOpen, setIsPromotionMemoOpen] = useState(false);

  // Powerhouse Modals
  const [isPlaygroundOpen, setIsPlaygroundOpen] = useState(false);
  const [playgroundSkillName, setPlaygroundSkillName] = useState('SQL & Data Warehousing');
  const [isSlackOpen, setIsSlackOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);

  // Real-World Project Challenge Modal & Skill Verification State
  const [isProjectChallengeOpen, setIsProjectChallengeOpen] = useState(false);
  const [activeProjectSkill, setActiveProjectSkill] = useState({
    id: 'sql_mastery',
    name: 'SQL & Data Warehousing',
    currentLevel: 2,
    targetLevel: 4
  });

  // AI Interviewer & Lesson Summary Podcast Modals
  const [isAIInterviewerOpen, setIsAIInterviewerOpen] = useState(false);
  const [isSummaryPodcastOpen, setIsSummaryPodcastOpen] = useState(false);
  const [podcastModuleTitle, setPodcastModuleTitle] = useState('SQL & Data Warehousing');

  // Notification Stream & Feedback Hub Modals
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  // Stored Notification & Feedback Stream Array
  const [notifications, setNotifications] = useState([
    {
      id: 'n_proj_1',
      title: 'AI Project Challenge Verified (94/100)',
      message: 'Your SQL & Data Warehousing submission passed window function rubric checks. Skill level upgraded to Level 4/5.',
      time: '10:15 AM',
      type: 'project_verified',
      read: false
    },
    {
      id: 'n_pod_1',
      title: 'New AI Summary Podcast Ready',
      message: 'Listen to the 2-host audio breakdown for Window Functions & CTEs on your roadmap.',
      time: '09:30 AM',
      type: 'podcast',
      read: false
    },
    {
      id: 'n_quiz_1',
      title: 'Adaptive Re-planning Notice',
      message: 'Competency verified for SQL Window Partitioning. Remaining roadmap adaptively updated.',
      time: 'Yesterday',
      type: 'quiz',
      read: true
    }
  ]);

  // AI Learning Memory (Remembers learning progress, quiz mistakes, verified projects)
  const [learningMemory, setLearningMemory] = useState({
    recentQuizMistakes: ['Struggled with PARTITION BY syntax in SQL assessment'],
    verifiedProjects: []
  });

  const handleOpenSummaryPodcast = (modTitle) => {
    const valid = (typeof modTitle === 'string' && modTitle.trim()) ? modTitle : 'SQL & Data Warehousing';
    setPodcastModuleTitle(valid);
    setIsSummaryPodcastOpen(true);
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  // Initialize Taxonomy & Personas
  useEffect(() => {
    fetchTaxonomy().then(taxData => {
      if (taxData) {
        setTaxonomy(taxData);
      }
    });

    fetchPersonas().then(pData => {
      if (pData && pData.length > 0) {
        setPersonas(pData);
        setSelectedPersona(pData[0]);
        setCurrentSkills(pData[0].current_skills);
        setTargetRoleId(pData[0].target_role_id);
        setWeeklyHours(pData[0].weekly_hours || 6);
      }
    });
  }, []);

  // Recalculate Gap Analysis & Path whenever persona / skills / target role changes
  useEffect(() => {
    if (!targetRoleId) return;

    calculateGapAnalysis(currentSkills, targetRoleId).then(gapData => {
      if (gapData) {
        setGapAnalysis(gapData);
      }
    });

    generatePath(currentSkills, targetRoleId, weeklyHours).then(pathData => {
      if (pathData && pathData.learning_path) {
        setLearningPath(pathData.learning_path);
      }
    });
  }, [currentSkills, targetRoleId, weeklyHours]);

  // Handle Persona Switching
  const handleSelectPersona = (persona) => {
    setSelectedPersona(persona);
    setCurrentSkills(persona.current_skills);
    setTargetRoleId(persona.target_role_id);
    setWeeklyHours(persona.weekly_hours || 6);
    setAdaptiveNotice(`Loaded learner profile for ${persona.name}. Gap analysis & roadmap updated.`);
  };

  const [extractedResumeInfo, setExtractedResumeInfo] = useState(null);

  // Handle Skill Matrix Modal Save
  const handleSaveSkillsAndGoal = ({
    skills,
    targetRoleId: newRole,
    weeklyHours: newHours,
    uploadedFileName,
    extractedMentions,
    extractedSummary
  }) => {
    setCurrentSkills(skills);
    setTargetRoleId(newRole);
    setWeeklyHours(newHours);

    if (uploadedFileName || (extractedMentions && extractedMentions.length > 0)) {
      setExtractedResumeInfo({
        fileName: uploadedFileName || 'Uploaded_Resume.pdf',
        mentions: extractedMentions || [],
        summary: extractedSummary || '',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    }

    setAdaptiveNotice(`Extracted resume skills & updated target career matrix. Roadmap recalculated!`);
  };

  // Handle Quiz Trigger
  const handleStartQuiz = (skillId, skillName) => {
    setActiveQuizSkill({ id: skillId, name: skillName });
  };

  // Handle Opening AI Mentor
  const handleOpenMentor = (skillObj) => {
    setMentorContextSkill(skillObj);
    setIsMentorOpen(true);
  };

  // Handle Opening Code Playground
  const handleOpenPlayground = (skillName) => {
    const validName = (typeof skillName === 'string' && skillName.trim()) ? skillName : 'SQL & Data Warehousing';
    setPlaygroundSkillName(validName);
    setIsPlaygroundOpen(true);
  };


  // Handle Opening Real-World Project Challenge
  const handleOpenProjectChallenge = (skillObj) => {
    const skId = skillObj?.id || 'sql_mastery';
    setActiveProjectSkill({
      id: skId,
      name: skillObj?.name || 'SQL & Data Warehousing',
      currentLevel: currentSkills[skId] || 2,
      targetLevel: skillObj?.targetLevel || 4
    });
    setIsProjectChallengeOpen(true);
  };

  // Handle Real-World Project Verification & Readiness Score Recalculation
  const handleProjectVerified = async ({ skillId, skillName, newVerifiedLevel, readinessIncrease, score }) => {
    // 1. Upgrade skill proficiency level
    const updatedSkills = {
      ...currentSkills,
      [skillId]: Math.max(newVerifiedLevel, (currentSkills[skillId] || 2) + 2)
    };
    setCurrentSkills(updatedSkills);

    // 2. Mark corresponding roadmap step as project_verified
    if (learningPath && learningPath.roadmap_steps) {
      const updatedSteps = learningPath.roadmap_steps.map(s => {
        if (s.skill_id === skillId) {
          return { ...s, status: 'project_verified' };
        }
        return s;
      });

      const updatedPhases = (learningPath.phases || []).map(phase => ({
        ...phase,
        steps: phase.steps.map(s => s.skill_id === skillId ? { ...s, status: 'project_verified' } : s)
      }));

      setLearningPath({
        ...learningPath,
        roadmap_steps: updatedSteps,
        phases: updatedPhases
      });
    }

    // 3. Record in AI learning memory so mentor remembers hands-on mastery
    setLearningMemory(prev => ({
      ...prev,
      verifiedProjects: [
        ...prev.verifiedProjects,
        { skillId, skillName, verifiedLevel: newVerifiedLevel, score, timestamp: new Date().toISOString() }
      ]
    }));

    setAdaptiveNotice(`Real-World Project Verified (${score}/100)! Competency for '${skillName}' upgraded to Level ${newVerifiedLevel}/5. Target Role Readiness boosted (+${readinessIncrease}%)!`);
  };

  // Handle Quiz Completion & Adaptive Path Re-planning
  const handleQuizCompleted = async ({ skillId, skillName, passed, scorePercent, incorrectConcepts = [] }) => {
    // Track weak concepts in learning memory
    if (incorrectConcepts && incorrectConcepts.length > 0) {
      setLearningMemory(prev => ({
        ...prev,
        recentQuizMistakes: [
          `Struggled with ${incorrectConcepts[0]} in ${skillName || skillId} assessment`,
          ...prev.recentQuizMistakes.slice(0, 3)
        ]
      }));
    }

    if (passed) {
      // 1. Update current skill level in local state (+1 or +2 levels)
      const currentLvl = currentSkills[skillId] || 1;
      const updatedSkills = {
        ...currentSkills,
        [skillId]: Math.min(5, currentLvl + 2)
      };
      setCurrentSkills(updatedSkills);

      // 2. Call adaptive replan API
      if (learningPath) {
        const replanned = await replanPath(learningPath, skillId, true, updatedSkills);
        if (replanned) {
          setLearningPath(replanned);
        }
      }

      setAdaptiveNotice(`Verification Passed (${scorePercent}%)! Mastery confirmed for '${skillId}'. Remaining roadmap adaptively updated.`);
    } else {
      setAdaptiveNotice(`Assessment score was ${scorePercent}%. Path refreshed with helpful remedial modules for '${skillId}'.`);
    }
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} personas={personas} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-blue-600 selection:text-white">

      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedPersona={selectedPersona}
        personas={personas}
        onSelectPersona={handleSelectPersona}
        onOpenSkillModal={() => setIsSkillModalOpen(true)}
        unreadCount={notifications.filter(n => !n.read).length}
        onOpenNotifications={() => setIsNotificationOpen(true)}
        isNotificationOpen={isNotificationOpen}
        onOpenFeedback={() => setIsFeedbackOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Extracted Resume Capabilities Display Banner */}
        {extractedResumeInfo && (
          <div className="mb-6 p-5 rounded-2xl bg-white border border-blue-200/90 text-slate-800 shadow-sm relative overflow-hidden animate-fadeIn">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
              
              <div className="space-y-2 max-w-3xl">
                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100/80 text-emerald-800 border border-emerald-200 flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Resume Content Extracted & Active</span>
                  </span>
                  <span className="text-xs text-slate-600 flex items-center space-x-1">
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    <span>File: <strong className="text-slate-900">{extractedResumeInfo.fileName}</strong></span>
                  </span>
                  <span className="text-xs text-slate-400">• Updated {extractedResumeInfo.timestamp}</span>
                </div>

                {extractedResumeInfo.summary && (
                  <p className="text-xs text-slate-700 italic bg-blue-50/60 p-2.5 rounded-xl border border-blue-100">
                    "{extractedResumeInfo.summary}"
                  </p>
                )}

                {/* Extracted Skill Badges on Display */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {extractedResumeInfo.mentions.map((m, idx) => {
                    const skillObj = (taxonomy.skills || []).find(s => s.id === (m.skill_id || m.id));
                    const skillName = m.skill_name || skillObj?.name || m.skill_id;
                    const level = m.inferred_level || m.estimated_level || currentSkills[m.skill_id] || 2;
                    return (
                      <div key={idx} className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800 transition">
                        <Sparkles className="w-3 h-3 text-blue-600" />
                        <span>{skillName}:</span>
                        <span className="text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.5 rounded text-[10px]">
                          Lvl {level}/5
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center space-x-2 self-start md:self-center shrink-0">
                <button
                  onClick={() => setIsSkillModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-xs cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Re-scan / Adjust Matrix</span>
                </button>
                <button
                  onClick={() => setExtractedResumeInfo(null)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition cursor-pointer"
                  title="Dismiss banner"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>
        )}

        <div key={activeTab} className="page-transition">
          {activeTab === 'roadmap' && (
            <RoadmapView
              learningPath={learningPath}
              learnerName={selectedPersona?.name}
              onStartQuiz={handleStartQuiz}
              onOpenProjectChallenge={handleOpenProjectChallenge}
              onOpenMentor={handleOpenMentor}
              onOpenCertificate={() => setIsCertificateOpen(true)}
              onOpenMentorship={() => setIsMentorshipOpen(true)}
              onOpenRoleplay={() => setIsRoleplayOpen(true)}
              onOpenPromotionMemo={() => setIsPromotionMemoOpen(true)}
              onOpenPlayground={handleOpenPlayground}
              onOpenSlack={() => setIsSlackOpen(true)}
              onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
              onOpenAIInterviewer={() => setIsAIInterviewerOpen(true)}
              onOpenSummaryPodcast={handleOpenSummaryPodcast}
              onReplanClick={() => generatePath(currentSkills, targetRoleId, weeklyHours)}
            />
          )}

          {activeTab === 'gap' && (
            <GapAnalysisView
              gapAnalysis={gapAnalysis}
              roles={taxonomy.roles || []}
              onSelectTargetRole={(roleId) => setTargetRoleId(roleId)}
              onGeneratePathClick={() => setActiveTab('roadmap')}
              onOpenProjectChallenge={handleOpenProjectChallenge}
              onStartQuiz={handleStartQuiz}
              onOpenPlayground={handleOpenPlayground}
              onOpenMentorship={() => setIsMentorshipOpen(true)}
              onOpenPromotionMemo={() => setIsPromotionMemoOpen(true)}
              onOpenSlack={() => setIsSlackOpen(true)}
              onRequestManagerReview={(gap) => setAdaptiveNotice(`Manager endorsement request logged for '${gap.skill_name}'.`)}
            />
          )}

          {activeTab === 'simulator' && (
            <CareerSimulatorView
              currentSkills={currentSkills}
              taxonomy={taxonomy}
              currentRole={selectedPersona?.role}
              onSelectTargetRole={(roleId) => setTargetRoleId(roleId)}
              onNavigateToRoadmap={() => setActiveTab('roadmap')}
            />
          )}

          {activeTab === 'manager' && (
            <ManagerDashboard />
          )}
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/90 bg-white/90 py-6 text-xs text-slate-500 glass-panel mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-blue-600 font-outfit text-sm">PathCraft AI</span>
            <span>— Enterprise Adaptive Upskilling & Internal Mobility</span>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <SkillInputModal
        isOpen={isSkillModalOpen}
        onClose={() => setIsSkillModalOpen(false)}
        skills={taxonomy.skills || []}
        roles={taxonomy.roles || []}
        currentSkills={currentSkills}
        targetRoleId={targetRoleId}
        weeklyHours={weeklyHours}
        onSave={handleSaveSkillsAndGoal}
      />

      <QuizModal
        isOpen={!!activeQuizSkill}
        onClose={() => setActiveQuizSkill(null)}
        skillId={activeQuizSkill?.id}
        skillName={activeQuizSkill?.name}
        onQuizCompleted={handleQuizCompleted}
      />

      <AIMentorDrawer
        isOpen={isMentorOpen}
        onClose={() => setIsMentorOpen(false)}
        contextSkill={mentorContextSkill}
        targetRoleTitle={learningPath?.target_role_title}
        learnerProfile={selectedPersona}
        learningMemory={learningMemory}
      />

      <ProjectChallengeModal
        isOpen={isProjectChallengeOpen}
        onClose={() => setIsProjectChallengeOpen(false)}
        skillId={activeProjectSkill?.id}
        skillName={activeProjectSkill?.name}
        targetRoleTitle={learningPath?.target_role_title}
        currentLevel={activeProjectSkill?.currentLevel || 2}
        targetLevel={activeProjectSkill?.targetLevel || 4}
        onProjectVerified={handleProjectVerified}
      />

      <CertificateModal
        isOpen={isCertificateOpen}
        onClose={() => setIsCertificateOpen(false)}
        learnerName={selectedPersona?.name}
        targetRoleTitle={learningPath?.target_role_title}
        completedSkillsCount={learningPath?.roadmap_steps?.filter(s => s.status === 'verified')?.length || 0}
        totalSkillsCount={learningPath?.roadmap_steps?.length || 0}
      />

      <PeerMentorshipModal
        isOpen={isMentorshipOpen}
        onClose={() => setIsMentorshipOpen(false)}
        learnerName={selectedPersona?.name}
        onBooked={(msg) => setAdaptiveNotice(msg)}
      />

      <DayInTheLifeModal
        isOpen={isRoleplayOpen}
        onClose={() => setIsRoleplayOpen(false)}
        targetRoleTitle={learningPath?.target_role_title}
        learnerName={selectedPersona?.name}
      />

      <PromotionPitchModal
        isOpen={isPromotionMemoOpen}
        onClose={() => setIsPromotionMemoOpen(false)}
        learnerName={selectedPersona?.name}
        currentRole={selectedPersona?.role}
        targetRoleTitle={learningPath?.target_role_title}
        verifiedSkillsCount={learningPath?.roadmap_steps?.filter(s => s.status === 'verified')?.length || 0}
        totalHours={learningPath?.total_estimated_hours || 64}
      />

      <CodePlaygroundModal
        isOpen={isPlaygroundOpen}
        onClose={() => setIsPlaygroundOpen(false)}
        skillName={playgroundSkillName}
        onCodePassed={(skName) => setAdaptiveNotice(`Practical workbench exercise verified for ${skName}! (+50 XP)`)}
      />

      <SlackIntegrationModal
        isOpen={isSlackOpen}
        onClose={() => setIsSlackOpen(false)}
        learnerName={selectedPersona?.name}
        targetRoleTitle={learningPath?.target_role_title}
      />

      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        currentUser={selectedPersona}
      />

      <AIInterviewerModal
        isOpen={isAIInterviewerOpen}
        onClose={() => setIsAIInterviewerOpen(false)}
        targetRoleTitle={learningPath?.target_role_title}
        learnerName={selectedPersona?.name}
      />

      <SummaryPodcastModal
        isOpen={isSummaryPodcastOpen}
        onClose={() => setIsSummaryPodcastOpen(false)}
        moduleTitle={podcastModuleTitle}
        skillName={podcastModuleTitle}
        targetRoleTitle={learningPath?.target_role_title}
      />

      <NotificationDrawer
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={handleMarkAllAsRead}
        onClearAll={handleClearNotifications}
        onOpenFeedback={() => setIsFeedbackOpen(true)}
      />

      <FeedbackAreaModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        learnerName={selectedPersona?.name}
        onFeedbackSubmitted={(fbObj) => {
          setNotifications(prev => [
            {
              id: fbObj.id,
              title: `New Feedback Recorded (${fbObj.category})`,
              message: fbObj.comment,
              time: 'Just now',
              type: 'feedback',
              read: false
            },
            ...prev
          ]);
        }}
      />

      {/* Toast Notice */}
      <AdaptiveNotice
        message={adaptiveNotice}
        onClose={() => setAdaptiveNotice(null)}
      />

    </div>
  );
}
