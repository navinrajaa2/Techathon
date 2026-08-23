import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import GapAnalysisView from './components/GapAnalysisView';
import RoadmapView from './components/RoadmapView';
import ManagerDashboard from './components/ManagerDashboard';
import SkillInputModal from './components/SkillInputModal';
import QuizModal from './components/QuizModal';
import AdaptiveNotice from './components/AdaptiveNotice';

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
  const [activeTab, setActiveTab] = useState('roadmap'); // 'roadmap' | 'gap' | 'manager'
  const [personas, setPersonas] = useState(FALLBACK_PERSONAS);
  const [selectedPersona, setSelectedPersona] = useState(FALLBACK_PERSONAS[0]);
  
  const [taxonomy, setTaxonomy] = useState({ skills: [], roles: [] });
  const [currentSkills, setCurrentSkills] = useState(FALLBACK_PERSONAS[0].current_skills);
  const [targetRoleId, setTargetRoleId] = useState(FALLBACK_PERSONAS[0].target_role_id);
  const [weeklyHours, setWeeklyHours] = useState(6);

  const [gapAnalysis, setGapAnalysis] = useState(null);
  const [learningPath, setLearningPath] = useState(null);

  // Modals & Notices
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [activeQuizSkill, setActiveQuizSkill] = useState(null); // { id, name }
  const [adaptiveNotice, setAdaptiveNotice] = useState(null);

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
    setAdaptiveNotice(`Loaded persona profile for ${persona.name}. Gap analysis & roadmap updated.`);
  };

  // Handle Skill Matrix Modal Save
  const handleSaveSkillsAndGoal = ({ skills, targetRoleId: newRole, weeklyHours: newHours }) => {
    setCurrentSkills(skills);
    setTargetRoleId(newRole);
    setWeeklyHours(newHours);
    setAdaptiveNotice(`Updated skill profile and target role. Recalculating roadmap...`);
  };

  // Handle Quiz Trigger
  const handleStartQuiz = (skillId, skillName) => {
    setActiveQuizSkill({ id: skillId, name: skillName });
  };

  // Handle Quiz Completion & Adaptive Path Re-planning
  const handleQuizCompleted = async ({ skillId, passed, scorePercent }) => {
    if (passed) {
      // 1. Update current skill level in local state (+1 level or target level)
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

      setAdaptiveNotice(`🎉 Verification Passed (${scorePercent}%)! Skill level upgraded for '${skillId}'. Remaining roadmap adaptively updated.`);
    } else {
      setAdaptiveNotice(`⚠️ Assessment score was ${scorePercent}%. Path updated with recommended remedial exercises for '${skillId}'.`);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      
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
        
        {activeTab === 'roadmap' && (
          <RoadmapView
            learningPath={learningPath}
            onStartQuiz={handleStartQuiz}
            onReplanClick={() => generatePath(currentSkills, targetRoleId, weeklyHours)}
          />
        )}

        {activeTab === 'gap' && (
          <GapAnalysisView
            gapAnalysis={gapAnalysis}
            onGeneratePathClick={() => setActiveTab('roadmap')}
          />
        )}

        {activeTab === 'manager' && (
          <ManagerDashboard />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-gray-950 py-6 text-center text-xs text-gray-500 glass-panel mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-gray-400 font-outfit">PathCraft AI</span>
            <span>— Employee Learning Recommendation Platform</span>
          </div>
          <div>
            Built with React, Tailwind CSS, Recharts & Node/Express API
          </div>
        </div>
      </footer>

      {/* Modals */}
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

      {/* Toast Notice */}
      <AdaptiveNotice
        message={adaptiveNotice}
        onClose={() => setAdaptiveNotice(null)}
      />

    </div>
  );
}
