import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { calculateSkillGaps } from './services/gapAnalyzer.js';
import { generateLearningPath, replanPath } from './services/aiPathGenerator.js';
import { parseFreeTextSkills } from './services/skillParser.js';
import { getQuizForSkill } from './services/quizGenerator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const taxonomyPath = path.join(__dirname, 'data/taxonomy.json');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

function loadTaxonomyData() {
  const raw = fs.readFileSync(taxonomyPath, 'utf8');
  return JSON.parse(raw);
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'PathCraft AI Learning Platform API',
    timestamp: new Date().toISOString()
  });
});

// Taxonomy & catalog endpoint
app.get('/api/taxonomy', (req, res) => {
  try {
    const data = loadTaxonomyData();
    res.json({
      tracks: data.tracks,
      roles: data.roles,
      skills: data.skills,
      courses: data.courses
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Personas endpoint for instant live demo
app.get('/api/personas', (req, res) => {
  try {
    const data = loadTaxonomyData();
    res.json(data.personas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Free-text skill parsing endpoint
app.post('/api/parse-skills', (req, res) => {
  try {
    const { text } = req.body;
    const result = parseFreeTextSkills(text || '');
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Skill Gap Analysis endpoint
app.post('/api/gap-analysis', (req, res) => {
  try {
    const { current_skills, target_role_id } = req.body;

    if (!target_role_id) {
      return res.status(400).json({ error: 'target_role_id is required' });
    }

    const gapResult = calculateSkillGaps(current_skills || {}, target_role_id);
    res.json(gapResult);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Path Generation endpoint
app.post('/api/generate-path', (req, res) => {
  try {
    const { current_skills, target_role_id, weekly_hours } = req.body;

    if (!target_role_id) {
      return res.status(400).json({ error: 'target_role_id is required' });
    }

    const hours = Number(weekly_hours) || 5;
    const gapAnalysis = calculateSkillGaps(current_skills || {}, target_role_id);
    const learningPath = generateLearningPath(gapAnalysis, hours);

    res.json({
      gap_analysis: gapAnalysis,
      learning_path: learningPath
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Adaptive Path Re-planning endpoint
app.post('/api/replan-path', (req, res) => {
  try {
    const { current_path, completed_skill_id, quiz_passed, updated_skills } = req.body;

    if (!current_path || !completed_skill_id) {
      return res.status(400).json({ error: 'current_path and completed_skill_id are required' });
    }

    const updatedPath = replanPath(current_path, completed_skill_id, quiz_passed, updated_skills);
    res.json(updatedPath);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Verification Quiz endpoint
app.get('/api/quiz/:skillId', (req, res) => {
  try {
    const { skillId } = req.params;
    const quiz = getQuizForSkill(skillId);
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Manager Team Heatmap & Org Analytics endpoint
app.get('/api/manager/heatmap', (req, res) => {
  try {
    const data = loadTaxonomyData();
    res.json({
      team_heatmap: data.team_heatmap,
      summary: {
        total_reports: data.team_heatmap.length,
        avg_readiness: Math.round(
          data.team_heatmap.reduce((acc, curr) => acc + curr.readiness_percent, 0) / data.team_heatmap.length
        ),
        critical_org_gaps: [
          { skill_name: "LLM & RAG Application Building", missing_count: 4, severity: "High" },
          { skill_name: "Statistical Modeling & A/B Testing", missing_count: 3, severity: "Medium" },
          { skill_name: "System Design & Distributed Architecture", missing_count: 3, severity: "Medium" }
        ]
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`PathCraft AI Express Server listening on http://localhost:${PORT}`);
});
