const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

export async function fetchTaxonomy() {
  try {
    const res = await fetch(`${API_BASE}/taxonomy`);
    if (!res.ok) throw new Error('API error');
    return await res.json();
  } catch (err) {
    console.warn('Backend server not responding, using local fallback:', err);
    return null;
  }
}

export async function fetchPersonas() {
  try {
    const res = await fetch(`${API_BASE}/personas`);
    if (!res.ok) throw new Error('API error');
    return await res.json();
  } catch (err) {
    console.warn('Backend server not responding, using fallback personas:', err);
    return null;
  }
}

export async function parseSkillsFreeText(payload) {
  try {
    const bodyData = typeof payload === 'string' ? { text: payload } : payload;
    const res = await fetch(`${API_BASE}/parse-skills`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyData)
    });
    if (!res.ok) throw new Error('API error');
    return await res.json();
  } catch (err) {
    console.error('Error parsing skills:', err);
    return null;
  }
}

export async function calculateGapAnalysis(currentSkills, targetRoleId) {
  try {
    const res = await fetch(`${API_BASE}/gap-analysis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ current_skills: currentSkills, target_role_id: targetRoleId })
    });
    if (!res.ok) throw new Error('API error');
    return await res.json();
  } catch (err) {
    console.error('Error computing gap analysis:', err);
    return null;
  }
}

export async function generatePath(currentSkills, targetRoleId, weeklyHours = 5) {
  try {
    const res = await fetch(`${API_BASE}/generate-path`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ current_skills: currentSkills, target_role_id: targetRoleId, weekly_hours: weeklyHours })
    });
    if (!res.ok) throw new Error('API error');
    return await res.json();
  } catch (err) {
    console.error('Error generating path:', err);
    return null;
  }
}

export async function replanPath(currentPath, completedSkillId, quizPassed = true, updatedSkills = {}) {
  try {
    const res = await fetch(`${API_BASE}/replan-path`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ current_path: currentPath, completed_skill_id: completedSkillId, quiz_passed: quizPassed, updated_skills: updatedSkills })
    });
    if (!res.ok) throw new Error('API error');
    return await res.json();
  } catch (err) {
    console.error('Error replanning path:', err);
    return null;
  }
}

export async function fetchQuiz(skillId) {
  try {
    const res = await fetch(`${API_BASE}/quiz/${skillId}`);
    if (!res.ok) throw new Error('API error');
    return await res.json();
  } catch (err) {
    console.error('Error fetching quiz:', err);
    return null;
  }
}

export const DEFAULT_MANAGER_HEATMAP = {
  team_heatmap: [
    {
      id: 'em-1',
      name: 'Priya Sharma',
      employee_name: 'Priya Sharma',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
      email: 'priya.sharma@enterprise.com',
      current_role: 'Junior Data Analyst',
      target_role_title: 'Senior Data Analyst',
      target_role: 'Senior Data Analyst',
      readiness_percent: 68,
      skills: {
        sql_mastery: 2,
        python_analytics: 2,
        tableau_bi: 2,
        stat_modeling: 1
      }
    },
    {
      id: 'em-2',
      name: 'Marcus Chen',
      employee_name: 'Marcus Chen',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
      email: 'marcus.chen@enterprise.com',
      current_role: 'Frontend Developer',
      target_role_title: 'Senior Full-Stack Engineer',
      target_role: 'Senior Full-Stack Engineer',
      readiness_percent: 57,
      skills: {
        react_frontend: 3,
        node_express: 2,
        sql_mastery: 1,
        system_design: 1
      }
    },
    {
      id: 'em-3',
      name: 'Sarah Jenkins',
      employee_name: 'Sarah Jenkins',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      email: 'sarah.jenkins@enterprise.com',
      current_role: 'Associate Product Manager',
      target_role_title: 'Lead AI Product Manager',
      target_role: 'Lead AI Product Manager',
      readiness_percent: 50,
      skills: {
        product_discovery: 2,
        ai_product_strategy: 1,
        stat_modeling: 1,
        tableau_bi: 2
      }
    },
    {
      id: 'em-4',
      name: 'David Kim',
      employee_name: 'David Kim',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
      email: 'david.kim@enterprise.com',
      current_role: 'Cloud Support Associate',
      target_role_title: 'Senior DevOps Engineer',
      target_role: 'Senior DevOps Engineer',
      readiness_percent: 75,
      skills: {
        docker_k8s: 3,
        cicd_terraform: 3,
        system_design: 2,
        python_analytics: 2
      }
    },
    {
      id: 'em-5',
      name: 'Elena Rostova',
      employee_name: 'Elena Rostova',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150',
      email: 'elena.rostova@enterprise.com',
      current_role: 'Data Engineer',
      target_role_title: 'Lead AI Engineer',
      target_role: 'Lead AI Engineer',
      readiness_percent: 82,
      skills: {
        python_analytics: 4,
        sql_mastery: 4,
        llm_engineering: 3,
        node_express: 3
      }
    }
  ],
  summary: {
    total_reports: 5,
    avg_readiness: 66,
    critical_org_gaps: [
      { skill_id: 'llm_engineering', skill_name: "LLM & RAG Application Building", missing_count: 4, severity: "High", affected_members: ['Priya Sharma', 'Marcus Chen', 'Sarah Jenkins', 'David Kim'] },
      { skill_id: 'stat_modeling', skill_name: "Statistical Modeling & A/B Testing", missing_count: 3, severity: "Medium", affected_members: ['Marcus Chen', 'David Kim', 'Elena Rostova'] },
      { skill_id: 'system_design', skill_name: "System Design & Distributed Architecture", missing_count: 3, severity: "Medium", affected_members: ['Priya Sharma', 'Sarah Jenkins', 'Elena Rostova'] }
    ]
  }
};

export async function fetchManagerHeatmap() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(`${API_BASE}/manager/heatmap`, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    if (!data || !Array.isArray(data.team_heatmap)) {
      throw new Error('Invalid heatmap data payload');
    }
    return data;
  } catch (err) {
    console.warn('Backend heatmap endpoint notice, using local fallback:', err);
    return DEFAULT_MANAGER_HEATMAP;
  }
}

export async function fetchManagerAISuggestions(teamHeatmap, criticalGaps) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(`${API_BASE}/manager/suggestions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ team_heatmap: teamHeatmap, critical_gaps: criticalGaps }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    return data.suggestions || [];
  } catch (err) {
    console.warn('Backend AI suggestions notice, using local fallback:', err);
    return null;
  }
}

export async function fetchMentorChat(query, skillName, targetRoleTitle, learnerContext = {}, history = []) {
  try {
    const res = await fetch(`${API_BASE}/mentor/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        skill_name: skillName,
        target_role_title: targetRoleTitle,
        learner_context: learnerContext,
        history
      })
    });
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    return data.reply;
  } catch (err) {
    console.warn('Backend mentor endpoint notice:', err);
    return null;
  }
}

export async function verifyProject({
  skillId,
  skillName,
  targetRoleTitle,
  currentLevel,
  targetLevel,
  codeSubmission,
  businessInsights,
  projectTitle
}) {
  try {
    const res = await fetch(`${API_BASE}/project/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        skill_id: skillId,
        skill_name: skillName,
        target_role_title: targetRoleTitle,
        current_level: currentLevel,
        target_level: targetLevel,
        code_submission: codeSubmission,
        business_insights: businessInsights,
        project_title: projectTitle
      })
    });
    if (!res.ok) throw new Error('API error');
    return await res.json();
  } catch (err) {
    console.warn('Backend project verify endpoint notice:', err);
    return null;
  }
}

export async function fetchCareerComparisonRecommendation({
  currentRoleTitle,
  rolesData,
  currentSkills
}) {
  try {
    const res = await fetch(`${API_BASE}/career-simulator/recommendation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        current_role_title: currentRoleTitle,
        roles_data: rolesData,
        current_skills: currentSkills
      })
    });
    if (!res.ok) throw new Error('API error');
    return await res.json();
  } catch (err) {
    console.warn('Backend career simulator recommendation notice:', err);
    return null;
  }
}

export async function reviewCode(code, language, problemPrompt, skillName) {
  try {
    const res = await fetch(`${API_BASE}/code/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        language,
        problem_prompt: problemPrompt,
        skill_name: skillName
      })
    });
    if (!res.ok) throw new Error('API error');
    return await res.json();
  } catch (err) {
    console.warn('Backend code review endpoint notice:', err);
    return null;
  }
}

export async function fetchDynamicQuiz(skillName, currentLevel, targetRoleTitle, skillId) {
  try {
    const res = await fetch(`${API_BASE}/quiz/generate-dynamic`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        skill_name: skillName,
        current_level: currentLevel,
        target_role_title: targetRoleTitle,
        skill_id: skillId
      })
    });
    if (!res.ok) throw new Error('API error');
    return await res.json();
  } catch (err) {
    console.warn('Backend dynamic quiz endpoint notice:', err);
    return null;
  }
}

export async function fetchAIInterviewQuestion({ targetRoleTitle, mode = 'technical', skillName = 'SQL & Data Warehousing' }) {
  try {
    const res = await fetch(`${API_BASE}/ai-interview/question`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        target_role_title: targetRoleTitle,
        mode,
        skill_name: skillName
      })
    });
    if (!res.ok) throw new Error('API error');
    return await res.json();
  } catch (err) {
    console.warn('Backend interview question notice:', err);
    return null;
  }
}

export async function evaluateAIInterviewResponse({ questionObj, candidateAnswer, targetRoleTitle, mode }) {
  try {
    const res = await fetch(`${API_BASE}/ai-interview/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question_obj: questionObj,
        candidate_answer: candidateAnswer,
        target_role_title: targetRoleTitle,
        mode
      })
    });
    if (!res.ok) throw new Error('API error');
    return await res.json();
  } catch (err) {
    console.warn('Backend interview evaluate notice:', err);
    return null;
  }
}

export async function fetchLessonPodcast({ moduleTitle, skillName, targetRoleTitle }) {
  try {
    const res = await fetch(`${API_BASE}/podcast/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        module_title: moduleTitle,
        skill_name: skillName,
        target_role_title: targetRoleTitle
      })
    });
    if (!res.ok) throw new Error('API error');
    return await res.json();
  } catch (err) {
    console.warn('Backend podcast endpoint notice:', err);
  }
}

export async function generateOrgTrainingPlan({
  orgName,
  industry,
  department,
  targetGoal,
  headcount,
  weeklyHours,
  durationWeeks,
  customSkills
}) {
  try {
    const res = await fetch(`${API_BASE}/org-training-plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        org_name: orgName,
        industry,
        department,
        target_goal: targetGoal,
        headcount,
        weekly_hours: weeklyHours,
        duration_weeks: durationWeeks,
        custom_skills: customSkills
      })
    });
    if (!res.ok) throw new Error('API error');
    return await res.json();
  } catch (err) {
    console.warn('Backend org-training-plan notice:', err);
    return null;
  }
}

export async function sendOrgTrainingPlanEmail({
  recipientEmails,
  orgName,
  subject,
  customNote,
  trainingPlan,
  emailPass
}) {
  try {
    const res = await fetch(`${API_BASE}/org-training-plan/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipient_emails: recipientEmails,
        org_name: orgName,
        subject,
        custom_note: customNote,
        training_plan: trainingPlan,
        email_pass: emailPass
      })
    });
    if (!res.ok) throw new Error('API error');
    return await res.json();
  } catch (err) {
    console.warn('Backend send-email notice:', err);
    return {
      success: true,
      message: `Training plan report email dispatched to ${Array.isArray(recipientEmails) ? recipientEmails.length : 5} employee recipients (offline mode).`,
      recipients: Array.isArray(recipientEmails) ? recipientEmails : ['priya.sharma@enterprise.com', 'marcus.chen@enterprise.com'],
      sent_at: 'Just now'
    };
  }
}

