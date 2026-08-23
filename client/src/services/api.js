const API_BASE = 'http://localhost:5000/api';

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

export async function parseSkillsFreeText(text) {
  try {
    const res = await fetch(`${API_BASE}/parse-skills`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
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

export async function fetchManagerHeatmap() {
  try {
    const res = await fetch(`${API_BASE}/manager/heatmap`);
    if (!res.ok) throw new Error('API error');
    return await res.json();
  } catch (err) {
    console.error('Error fetching heatmap:', err);
    return null;
  }
}
