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
 * Generates an explainable week-by-week learning roadmap from gap analysis
 */
export function generateLearningPath(gapAnalysis, weeklyHours = 5, userPreferences = {}) {
  const taxonomy = loadTaxonomy();
  const { target_role, gaps } = gapAnalysis;

  // Filter skills that actually have a gap (> 0)
  const skillsToLearn = gaps.filter(g => g.gap_score > 0);

  if (skillsToLearn.length === 0) {
    return {
      message: "Congratulations! You already meet all skill requirements for this target role.",
      total_estimated_weeks: 0,
      phases: [],
      roadmap_steps: []
    };
  }

  let currentCumulativeHours = 0;
  const roadmapSteps = [];

  skillsToLearn.forEach((gap, index) => {
    // Find best course matching this skill
    const matchingCourses = taxonomy.courses.filter(c => c.skill_id === gap.skill_id);
    const chosenCourse = matchingCourses.length > 0
      ? matchingCourses[0]
      : {
          id: `custom_${gap.skill_id}`,
          title: `Mastering ${gap.skill_name} for ${target_role.title}`,
          provider: "Curated Industry Resources & Practice",
          duration_hrs: 10,
          rating: 4.8,
          source_url: `https://www.google.com/search?q=${encodeURIComponent(gap.skill_name + ' course')}`,
          format: "Interactive Tutorials & Projects",
          key_takeaways: `Bridge gap from level ${gap.current_level} (${gap.level_description_current}) to level ${gap.required_level} (${gap.level_description_target}).`
        };

    const duration = chosenCourse.duration_hrs;
    const startWeek = Math.max(1, Math.ceil(currentCumulativeHours / weeklyHours) + 1);
    currentCumulativeHours += duration;
    const endWeek = Math.max(startWeek, Math.ceil(currentCumulativeHours / weeklyHours));

    // AI Explainability Narrative
    let aiReasoning = "";
    if (gap.prerequisites && gap.prerequisites.some(p => p.current_level < 2)) {
      aiReasoning = `Prioritized first because foundational prerequisites for ${gap.skill_name} need strengthening before advanced topics.`;
    } else if (gap.gap_score >= 3) {
      aiReasoning = `High Priority: You have a ${gap.gap_score}-level gap in ${gap.skill_name}. Mastering this will unlock major core responsibilities in ${target_role.title}.`;
    } else if (index === 0) {
      aiReasoning = `Recommended Starting Point: Serves as the key catalyst for your transition to ${target_role.title}.`;
    } else {
      aiReasoning = `Next Step: Builds directly upon previous modules to finalize your target role readiness.`;
    }

    roadmapSteps.push({
      step_number: index + 1,
      skill_id: gap.skill_id,
      skill_name: gap.skill_name,
      category: gap.category,
      current_level: gap.current_level,
      required_level: gap.required_level,
      gap_score: gap.gap_score,
      estimated_hours: duration,
      start_week: startWeek,
      end_week: endWeek,
      course: chosenCourse,
      ai_explanation: aiReasoning,
      status: "not_started" // "not_started" | "in_progress" | "verified"
    });
  });

  const totalWeeks = Math.ceil(currentCumulativeHours / weeklyHours);

  // Group into 3 Phases: Foundation, Core Competency, Mastery
  const phaseCount = Math.min(3, roadmapSteps.length);
  const itemsPerPhase = Math.ceil(roadmapSteps.length / phaseCount);
  
  const phases = [
    {
      phase_number: 1,
      title: "Phase 1: Foundation & Core Prerequisites",
      description: "Establish strong core capabilities and eliminate critical skill dependencies.",
      steps: roadmapSteps.slice(0, itemsPerPhase)
    }
  ];

  if (roadmapSteps.length > itemsPerPhase) {
    phases.push({
      phase_number: 2,
      title: "Phase 2: Core Competencies & Practical Application",
      description: "Bridge mid-level gaps with hands-on projects and domain mastery.",
      steps: roadmapSteps.slice(itemsPerPhase, itemsPerPhase * 2)
    });
  }

  if (roadmapSteps.length > itemsPerPhase * 2) {
    phases.push({
      phase_number: 3,
      title: "Phase 3: Advanced Mastery & Enterprise Leadership",
      description: "Achieve senior-level target skills and leadership competencies.",
      steps: roadmapSteps.slice(itemsPerPhase * 2)
    });
  }

  return {
    target_role_title: target_role.title,
    weekly_hours_budget: weeklyHours,
    total_estimated_hours: currentCumulativeHours,
    total_estimated_weeks: totalWeeks,
    phases,
    roadmap_steps: roadmapSteps,
    ai_summary_narrative: `Based on your goal of becoming a ${target_role.title} with a ${weeklyHours} hrs/week budget, we've designed a ${totalWeeks}-week adaptive learning path focused on closing ${skillsToLearn.length} key skill gaps.`
  };
}

/**
 * Recalculates and re-orders path adaptively when a module is passed/verified
 */
export function replanPath(currentPath, completedSkillId, quizPassed = true, updatedCurrentSkills = {}) {
  const updatedSteps = currentPath.roadmap_steps.map(step => {
    if (step.skill_id === completedSkillId) {
      return {
        ...step,
        status: quizPassed ? "verified" : "needs_review",
        quiz_passed: quizPassed
      };
    }
    return step;
  });

  // Re-group phases
  const remainingSteps = updatedSteps.filter(s => s.status !== "verified");
  const verifiedCount = updatedSteps.filter(s => s.status === "verified").length;

  let adaptiveNote = "";
  if (quizPassed) {
    adaptiveNote = `🎉 Great job! Skill '${completedSkillId}' verified. Remaining path updated: ${remainingSteps.length} modules left.`;
  } else {
    adaptiveNote = `⚠️ Quiz score was below threshold for '${completedSkillId}'. Remedial resources recommended before advancing.`;
  }

  return {
    ...currentPath,
    roadmap_steps: updatedSteps,
    completed_count: verifiedCount,
    remaining_count: remainingSteps.length,
    adaptive_replan_notice: adaptiveNote,
    last_updated: new Date().toISOString()
  };
}
