import React, { useState, useEffect } from 'react';
import Header from './components/Header';
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

import {
  fetchTaxonomy, fetchPersonas, calculateGapAnalysis, generatePath, replanPath
} from './services/api';

// Fallback taxonomy data in case backend is loading
const FALLBACK_PERSONAS = [
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
  const [activeTab, setActiveTab] = useState('roadmap'); // 'roadmap' | 'gap' | 'simulator' | 'manager'
  const [personas, setPersonas] = useState(FALLBACK_PERSONAS);
  const [selectedPersona, setSelectedPersona] = useState(FALLBACK_PERSONAS[0]);

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

  // AI Learning Memory (Remembers learning progress, quiz mistakes, verified projects)
  const [learningMemory, setLearningMemory] = useState({
    recentQuizMistakes: ['Struggled with PARTITION BY syntax in SQL assessment'],
    verifiedProjects: []
  });

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

  // Handle Skill Matrix Modal Save
  const handleSaveSkillsAndGoal = ({ skills, targetRoleId: newRole, weeklyHours: newHours }) => {
    setCurrentSkills(skills);
    setTargetRoleId(newRole);
    setWeeklyHours(newHours);
    setAdaptiveNotice(`Updated skill profile and target career goal. Recalculating roadmap...`);
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
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">

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
              onReplanClick={() => generatePath(currentSkills, targetRoleId, weeklyHours)}
            />
          )}

          {activeTab === 'gap' && (
            <GapAnalysisView
              gapAnalysis={gapAnalysis}
              onGeneratePathClick={() => setActiveTab('roadmap')}
              onOpenProjectChallenge={handleOpenProjectChallenge}
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

      {/* Toast Notice */}
      <AdaptiveNotice
        message={adaptiveNotice}
        onClose={() => setAdaptiveNotice(null)}
      />

    </div>
  );
}
