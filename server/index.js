import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

import { connectDB, isDBConnected } from './db/connection.js';
import User from './models/User.js';
import LearningPath from './models/LearningPath.js';
import QuizResult from './models/QuizResult.js';
import Taxonomy from './models/Taxonomy.js';

import { calculateSkillGaps } from './services/gapAnalyzer.js';
import { generateLearningPath, replanPath } from './services/aiPathGenerator.js';
import { parseFreeTextSkills } from './services/skillParser.js';
import { getQuizForSkill } from './services/quizGenerator.js';
import { 
  generateMentorChat, 
  parseSkillsWithGemini, 
  generateDynamicQuiz, 
  reviewCodeWithGemini,
  verifyProjectWithGemini,
  generateCareerComparisonSynthesis
} from './services/geminiService.js';

const taxonomyPath = path.join(__dirname, 'data/taxonomy.json');

const app = express();
const PORT = process.env.PORT || 5000;

// Dynamic CORS configuration for local development and production (Render/Vercel)
const allowedOrigins = process.env.CLIENT_URL || process.env.CORS_ORIGIN;
app.use(cors({
  origin: allowedOrigins ? allowedOrigins.split(',').map(o => o.trim()) : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));

function loadTaxonomyData() {
  const raw = fs.readFileSync(taxonomyPath, 'utf8');
  return JSON.parse(raw);
}

// Root endpoint for Render deployment verification
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'PathCraft AI Learning Platform API',
    message: 'PathCraft AI Express Server is live on Render',
    healthCheck: '/api/health',
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'PathCraft AI Learning Platform API',
    database: isDBConnected() ? 'MongoDB Atlas Connected' : 'Fallback Local Mode',
    gemini_ai: process.env.GEMINI_API_KEY ? 'Configured' : 'Local Fallback',
    timestamp: new Date().toISOString()
  });
});

// Taxonomy & catalog endpoint
app.get('/api/taxonomy', async (req, res) => {
  try {
    if (isDBConnected()) {
      const dbTaxonomy = await Taxonomy.findOne({ doc_type: 'main_taxonomy' });
      if (dbTaxonomy) {
        return res.json({
          tracks: dbTaxonomy.tracks,
          roles: dbTaxonomy.roles,
          skills: dbTaxonomy.skills,
          courses: dbTaxonomy.courses
        });
      }
    }
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
app.get('/api/personas', async (req, res) => {
  try {
    if (isDBConnected()) {
      const users = await User.find();
      if (users.length > 0) {
        return res.json(users);
      }
    }
    const data = loadTaxonomyData();
    res.json(data.personas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Mentor Live Interactive Chat Endpoint (Powered by Gemini with Memory & Journey Context)
app.post('/api/mentor/chat', async (req, res) => {
  try {
    const { query, skill_name, target_role_title, learner_context, history } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'query is required' });
    }

    const reply = await generateMentorChat({
      query,
      skillName: skill_name,
      targetRoleTitle: target_role_title,
      learnerContext: learner_context || {},
      history: history || []
    });

    res.json({ reply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Hands-On Real-World Project Verification (Powered by Gemini)
app.post('/api/project/verify', async (req, res) => {
  try {
    const { 
      skill_id, 
      skill_name, 
      target_role_title, 
      current_level, 
      target_level, 
      code_submission, 
      business_insights,
      project_title
    } = req.body;

    const result = await verifyProjectWithGemini({
      skillId: skill_id,
      skillName: skill_name || 'SQL & Data Warehousing',
      targetRoleTitle: target_role_title,
      currentLevel: current_level || 2,
      targetLevel: target_level || 4,
      codeSubmission: code_submission || '',
      businessInsights: business_insights || '',
      projectTitle: project_title
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Career What-If Simulator 2.0 AI Synthesis Recommendation
app.post('/api/career-simulator/recommendation', async (req, res) => {
  try {
    const { current_role_title, roles_data, current_skills } = req.body;
    const recommendation = await generateCareerComparisonSynthesis({
      currentRoleTitle: current_role_title,
      rolesData: roles_data || [],
      currentSkills: current_skills || {}
    });

    res.json(recommendation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Real-Time In-Browser Code & SQL Review (Powered by Gemini)
app.post('/api/code/review', async (req, res) => {
  try {
    const { code, language, problem_prompt, skill_name } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'code is required' });
    }

    const review = await reviewCodeWithGemini({
      code,
      language: language || 'sql',
      problemPrompt: problem_prompt,
      skillName: skill_name
    });

    res.json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Dynamic AI Scenario Assessment Quiz Generator (Powered by Gemini)
app.post('/api/quiz/generate-dynamic', async (req, res) => {
  try {
    const { skill_name, current_level, target_role_title, skill_id } = req.body;
    const dynamicQuiz = await generateDynamicQuiz({
      skillName: skill_name || 'Technical Engineering',
      currentLevel: current_level || 2,
      targetRoleTitle: target_role_title || 'Senior Role'
    });

    if (dynamicQuiz && dynamicQuiz.questions && dynamicQuiz.questions.length > 0) {
      return res.json(dynamicQuiz);
    }

    // Fallback to static quiz generator if dynamic fails
    const staticQuiz = getQuizForSkill(skill_id || 'sql_mastery');
    res.json(staticQuiz);
  } catch (err) {
    const staticQuiz = getQuizForSkill(req.body.skill_id || 'sql_mastery');
    res.json(staticQuiz);
  }
});

// Free-text & Resume skill parsing endpoint (Powered by Gemini + Fallback NLP)
app.post('/api/parse-skills', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.json({ parsed_skills: {}, detected_mentions: [] });
    }

    // Try Gemini Semantic Parser first
    const data = loadTaxonomyData();
    const validSkillIds = (data.skills || []).map(s => s.id);
    const geminiResult = await parseSkillsWithGemini(text, validSkillIds);

    if (geminiResult && Object.keys(geminiResult.parsed_skills || {}).length > 0) {
      return res.json(geminiResult);
    }

    // Fallback to regex/keyword rule parser
    const fallbackResult = parseFreeTextSkills(text);
    res.json(fallbackResult);
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
app.post('/api/generate-path', async (req, res) => {
  try {
    const { current_skills, target_role_id, weekly_hours, user_id, user_name } = req.body;

    if (!target_role_id) {
      return res.status(400).json({ error: 'target_role_id is required' });
    }

    const hours = Number(weekly_hours) || 5;
    const gapAnalysis = calculateSkillGaps(current_skills || {}, target_role_id);
    const learningPath = generateLearningPath(gapAnalysis, hours);

    // Persist to MongoDB if connected
    let savedDoc = null;
    if (isDBConnected()) {
      try {
        savedDoc = await LearningPath.create({
          user_id: user_id || 'demo_user',
          user_name: user_name || 'Alex Rivera',
          target_role_id,
          target_role_title: gapAnalysis.target_role_title,
          weekly_hours: hours,
          gap_analysis: gapAnalysis,
          learning_path: learningPath,
          status: 'active'
        });
      } catch (dbErr) {
        console.warn('Could not persist path to MongoDB:', dbErr.message);
      }
    }

    res.json({
      gap_analysis: gapAnalysis,
      learning_path: learningPath,
      db_id: savedDoc ? savedDoc._id : null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Adaptive Path Re-planning endpoint
app.post('/api/replan-path', async (req, res) => {
  try {
    const { current_path, completed_skill_id, quiz_passed, updated_skills, user_id } = req.body;

    if (!current_path || !completed_skill_id) {
      return res.status(400).json({ error: 'current_path and completed_skill_id are required' });
    }

    const updatedPath = replanPath(current_path, completed_skill_id, quiz_passed, updated_skills);

    // Save updated status in MongoDB
    if (isDBConnected() && user_id) {
      try {
        await LearningPath.findOneAndUpdate(
          { user_id, status: 'active' },
          { $set: { learning_path: updatedPath, status: 're_planned' } },
          { new: true, upsert: false }
        );
      } catch (dbErr) {
        console.warn('MongoDB update notice:', dbErr.message);
      }
    }

    res.json(updatedPath);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Verification Quiz endpoint (static)
app.get('/api/quiz/:skillId', (req, res) => {
  try {
    const { skillId } = req.params;
    const quiz = getQuizForSkill(skillId);
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Submit Quiz Result endpoint (MongoDB persistence)
app.post('/api/quiz/submit', async (req, res) => {
  try {
    const { user_id, skill_id, skill_name, score, total_questions, passed, answers } = req.body;

    let savedResult = null;
    if (isDBConnected()) {
      savedResult = await QuizResult.create({
        user_id: user_id || 'demo_user',
        skill_id,
        skill_name,
        score,
        total_questions,
        passed,
        user_answers: answers
      });

      if (passed && user_id) {
        await User.findOneAndUpdate(
          { $or: [{ _id: user_id }, { name: user_id }] },
          {
            $addToSet: { completed_skills: skill_id },
            $inc: { points: score * 10 }
          }
        );
      }
    }

    res.json({
      success: true,
      passed,
      score,
      total_questions,
      saved_id: savedResult ? savedResult._id : null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get User's Active Learning Path from DB
app.get('/api/learning-paths/:userId?', async (req, res) => {
  try {
    const userId = req.params.userId || 'demo_user';
    if (isDBConnected()) {
      const pathDoc = await LearningPath.findOne({ user_id: userId }).sort({ createdAt: -1 });
      if (pathDoc) {
        return res.json(pathDoc);
      }
    }
    res.json({ message: 'No stored path found' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Manager Team Heatmap & Org Analytics endpoint
app.get('/api/manager/heatmap', async (req, res) => {
  try {
    const data = loadTaxonomyData();
    const rawHeatmap = data.team_heatmap || [];
    
    const enrichedHeatmap = rawHeatmap.map((member, idx) => {
      const name = member.name || member.employee_name || `Employee ${idx + 1}`;
      const targetRole = member.target_role_title || member.target_role || 'Target Role';
      const email = member.email || `${name.toLowerCase().replace(/\s+/g, '.')}@enterprise.com`;
      const avatar = member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D8ABC&color=fff`;

      return {
        ...member,
        name,
        employee_name: name,
        target_role_title: targetRole,
        target_role: targetRole,
        email,
        avatar
      };
    });

    const avgReadiness = enrichedHeatmap.length > 0 
      ? Math.round(enrichedHeatmap.reduce((acc, curr) => acc + (curr.readiness_percent || 0), 0) / enrichedHeatmap.length)
      : 0;

    res.json({
      team_heatmap: enrichedHeatmap,
      summary: {
        total_reports: enrichedHeatmap.length,
        avg_readiness: avgReadiness,
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

// Connect to MongoDB and start server
async function startServer() {
  await connectDB();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 PathCraft AI Express Server listening on port ${PORT} (bound to 0.0.0.0 for Render environment)`);
  });
}

startServer();
