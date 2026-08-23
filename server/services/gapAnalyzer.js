import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const taxonomyPath = path.join(__dirname, '../data/taxonomy.json');

function loadTaxonomy() {
  const data = fs.readFileSync(taxonomyPath, 'utf8');
  return JSON.parse(data);
}

/**
 * Calculates depth of prerequisites for a given skill ID
 */
function getPrerequisitesDepth(skillId, skillsMap, visited = new Set()) {
  if (visited.has(skillId)) return 0;
  visited.add(skillId);

  const skill = skillsMap.get(skillId);
  if (!skill || !skill.prerequisites || skill.prerequisites.length === 0) {
    return 0;
  }

  let maxDepth = 0;
  for (const preId of skill.prerequisites) {
    const depth = 1 + getPrerequisitesDepth(preId, skillsMap, visited);
    if (depth > maxDepth) maxDepth = depth;
  }

  return maxDepth;
}

/**
 * Computes skill gaps given current employee skills and a target role ID
 */
export function calculateSkillGaps(currentSkillsMap, targetRoleId) {
  const taxonomy = loadTaxonomy();
  const targetRole = taxonomy.roles.find(r => r.id === targetRoleId);

  if (!targetRole) {
    throw new Error(`Target role ID '${targetRoleId}' not found.`);
  }

  const allSkillsMap = new Map(taxonomy.skills.map(s => [s.id, s]));
  const gapResults = [];
  let totalRequiredLevels = 0;
  let totalCurrentMetLevels = 0;

  for (const req of targetRole.required_skills) {
    const skill = allSkillsMap.get(req.skill_id);
    if (!skill) continue;

    const currentLevel = Number(currentSkillsMap[req.skill_id] || 0);
    const requiredLevel = Number(req.min_level);
    const gapScore = Math.max(0, requiredLevel - currentLevel);

    totalRequiredLevels += requiredLevel;
    totalCurrentMetLevels += Math.min(currentLevel, requiredLevel);

    const preDepth = getPrerequisitesDepth(req.skill_id, allSkillsMap);

    gapResults.push({
      skill_id: req.skill_id,
      skill_name: skill.name,
      category: skill.category,
      description: skill.description,
      current_level: currentLevel,
      required_level: requiredLevel,
      gap_score: gapScore,
      prerequisite_depth: preDepth,
      prerequisites: skill.prerequisites.map(pid => {
        const preSkill = allSkillsMap.get(pid);
        return {
          skill_id: pid,
          name: preSkill ? preSkill.name : pid,
          current_level: Number(currentSkillsMap[pid] || 0)
        };
      }),
      level_description_current: skill.levels[String(currentLevel)] || 'Unrated / Beginner',
      level_description_target: skill.levels[String(requiredLevel)] || 'Mastery'
    });
  }

  // Sort by gap_score descending, prerequisite_depth ascending (build prerequisites first)
  gapResults.sort((a, b) => {
    if (b.gap_score !== a.gap_score) {
      return b.gap_score - a.gap_score;
    }
    return a.prerequisite_depth - b.prerequisite_depth;
  });

  const readinessPercent = Math.round(
    totalRequiredLevels > 0 ? (totalCurrentMetLevels / totalRequiredLevels) * 100 : 0
  );

  return {
    target_role: targetRole,
    readiness_percent: readinessPercent,
    gaps: gapResults,
    all_required_skills: gapResults
  };
}
