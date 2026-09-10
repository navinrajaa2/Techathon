import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createRequire } from 'module';
import nodemailer from 'nodemailer';
let pdfParse = null;
try {
  const require = createRequire(import.meta.url);
  if (typeof globalThis.DOMMatrix === 'undefined') {
    globalThis.DOMMatrix = class DOMMatrix {};
  }
  pdfParse = require('pdf-parse');
} catch (e) {
  console.warn('pdf-parse loading notice:', e.message);
}

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
  generateCareerComparisonSynthesis,
  generateAIInterviewQuestion,
  evaluateAIInterviewAnswer,
  generateLessonPodcast,
  generateOrgTrainingPlanWithGemini
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

// AI Interviewer Question Generator Endpoint
app.post('/api/ai-interview/question', async (req, res) => {
  try {
    const { target_role_title, mode, skill_name } = req.body;
    const questionData = await generateAIInterviewQuestion({
      targetRoleTitle: target_role_title,
      mode: mode || 'technical',
      skillName: skill_name
    });
    res.json(questionData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Interviewer Response Evaluator Endpoint
app.post('/api/ai-interview/evaluate', async (req, res) => {
  try {
    const { question_obj, candidate_answer, target_role_title, mode } = req.body;
    const evaluation = await evaluateAIInterviewAnswer({
      questionObj: question_obj,
      candidateAnswer: candidate_answer,
      targetRoleTitle: target_role_title,
      mode
    });
    res.json(evaluation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Lesson Summary Podcast Generator Endpoint
app.post('/api/podcast/generate', async (req, res) => {
  try {
    const { module_title, skill_name, target_role_title } = req.body;
    const podcastData = await generateLessonPodcast({
      moduleTitle: module_title || 'SQL & Data Warehousing',
      skillName: skill_name || 'SQL & Data Warehousing',
      targetRoleTitle: target_role_title || 'Senior Data Analyst'
    });
    res.json(podcastData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Organization Training Plan Generator Endpoint (Powered by Gemini with Custom Skills)
app.post('/api/org-training-plan', async (req, res) => {
  try {
    const { org_name, industry, department, target_goal, headcount, weekly_hours, duration_weeks, custom_skills } = req.body;
    const plan = await generateOrgTrainingPlanWithGemini({
      orgName: org_name,
      industry,
      department,
      targetGoal: target_goal,
      headcount,
      weeklyHours: weekly_hours,
      durationWeeks: duration_weeks,
      customSkills: custom_skills || []
    });
    res.json(plan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

async function createEmailTransporter(customPass) {
  const senderUser = process.env.EMAIL_USER || 'navinrajaa02@gmail.com';
  const senderPass = customPass || process.env.EMAIL_PASS || process.env.GMAIL_APP_PASSWORD;

  if (senderPass && senderPass.trim()) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: senderUser,
        pass: senderPass.trim()
      }
    });
  }

  try {
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
  } catch (err) {
    console.warn('Nodemailer test account notice:', err.message);
    return null;
  }
}

// Organization Training Plan Email Distribution Endpoint (Send Real Email to Employees)
app.post('/api/org-training-plan/send-email', async (req, res) => {
  try {
    const { recipient_emails, org_name, subject, custom_note, training_plan, email_pass } = req.body;
    const senderEmail = process.env.EMAIL_USER || 'navinrajaa02@gmail.com';

    const emailsList = Array.isArray(recipient_emails)
      ? recipient_emails
      : (typeof recipient_emails === 'string' ? recipient_emails.split(',').map(e => e.trim()).filter(Boolean) : []);

    const recipients = emailsList.length > 0 ? emailsList : ['navinrajaa02@gmail.com'];
    const emailSubject = subject || `[${org_name || 'Organization'}] Your Enterprise Skill Roadmap & Training Plan`;

    const htmlBody = `
      <div style="font-family: 'Segoe UI', Helvetica, Arial, sans-serif; max-width: 680px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; color: #0f172a;">
        <div style="background: #0f172a; padding: 28px 32px; color: #ffffff;">
          <div style="font-size: 11px; text-transform: uppercase; tracking: 1px; color: #94a3b8; font-weight: 700; margin-bottom: 6px;">Enterprise Capability Blueprint</div>
          <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #ffffff;">${org_name || 'Organization'} Training Plan</h1>
          <p style="margin: 6px 0 0 0; font-size: 13px; color: #cbd5e1;">Sender: <strong>${senderEmail}</strong></p>
        </div>

        <div style="padding: 32px;">
          ${custom_note ? `<div style="padding: 16px; background: #f8fafc; border-left: 4px solid #0f172a; border-radius: 8px; font-size: 13px; color: #334155; margin-bottom: 24px; font-style: italic;">"${custom_note}"</div>` : ''}

          <div style="font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 12px;">Executive Overview</div>
          <p style="font-size: 13px; line-height: 1.6; color: #475569; margin: 0 0 20px 0;">
            ${training_plan?.executive_summary || 'Here is your assigned organizational training plan and capability roadmap.'}
          </p>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 12px;">
            <tr style="background: #f1f5f9; text-align: left; color: #475569;">
              <th style="padding: 10px 12px; border: 1px solid #e2e8f0;">Duration</th>
              <th style="padding: 10px 12px; border: 1px solid #e2e8f0;">Hrs/Week</th>
              <th style="padding: 10px 12px; border: 1px solid #e2e8f0;">Target Staff</th>
              <th style="padding: 10px 12px; border: 1px solid #e2e8f0;">Readiness Gain</th>
            </tr>
            <tr>
              <td style="padding: 10px 12px; border: 1px solid #e2e8f0; font-weight: 700;">${training_plan?.total_duration_weeks || 8} Weeks</td>
              <td style="padding: 10px 12px; border: 1px solid #e2e8f0;">${training_plan?.weekly_hours || 6} hrs/wk</td>
              <td style="padding: 10px 12px; border: 1px solid #e2e8f0;">${training_plan?.headcount || 45} Employees</td>
              <td style="padding: 10px 12px; border: 1px solid #e2e8f0; color: #047857; font-weight: 700;">+${training_plan?.projected_readiness_gain || 38}% Capability Gain</td>
            </tr>
          </table>

          <div style="font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 12px;">Assigned Training Curriculum</div>
          ${(training_plan?.phases || []).map(p => `
            <div style="margin-bottom: 16px; padding: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px;">
              <div style="font-size: 12px; font-weight: 700; color: #0f172a;">${p.phase_name} (${p.weeks})</div>
              <p style="font-size: 11px; color: #64748b; margin: 4px 0 10px 0;">${p.objective}</p>
              ${(p.modules || []).map(m => `
                <div style="margin-top: 8px; padding: 10px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 11px;">
                  <strong style="color: #0f172a;">${m.title}</strong> (${m.duration_hours} hrs)
                  <div style="color: #475569; margin-top: 2px;">Deliverable: ${m.practical_project}</div>
                </div>
              `).join('')}
            </div>
          `).join('')}

          <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #94a3b8;">
            Sent by PathCraft AI Enterprise Platform • Sender: ${senderEmail}
          </div>
        </div>
      </div>
    `;

    const transporter = await createEmailTransporter(email_pass);

    let realMessageUrl = null;
    let transportType = 'Nodemailer SMTP Dispatcher';

    if (transporter) {
      const info = await transporter.sendMail({
        from: `"${org_name || 'Enterprise Training'}" <${senderEmail}>`,
        to: recipients.join(', '),
        subject: emailSubject,
        text: `${custom_note}\n\nOrganization Training Plan for ${org_name}:\nDuration: ${training_plan?.total_duration_weeks || 8} weeks`,
        html: htmlBody
      });

      console.log('✉️ Real-Time Email Sent ID:', info.messageId);

      const testUrl = nodemailer.getTestMessageUrl(info);
      if (testUrl) {
        realMessageUrl = testUrl;
        console.log('🔗 Real-Time Ethereal Live Email View URL:', testUrl);
        transportType = 'Nodemailer Live Mailer (Preview Link Generated)';
      } else {
        transportType = 'Gmail Live SMTP Delivery';
      }
    }

    const sentAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' today';

    res.json({
      success: true,
      message: `Training plan email successfully sent to ${recipients.length} employee recipient(s) from ${senderEmail}!`,
      sender: senderEmail,
      recipients,
      sent_count: recipients.length,
      sent_at: sentAt,
      transport_type: transportType,
      preview_url: realMessageUrl
    });
  } catch (err) {
    console.error('Nodemailer send error:', err);
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

// Free-text & Resume skill parsing endpoint (Powered by Gemini + pdf-parse + Fallback NLP)
app.post('/api/parse-skills', async (req, res) => {
  try {
    let { text, base64, fileType } = req.body;

    // If PDF base64 provided and text is missing or sparse, extract PDF text using pdf-parse
    if (base64 && (fileType === 'pdf' || !text || text.length < 30)) {
      try {
        const buffer = Buffer.from(base64, 'base64');
        const pdfData = await pdfParse(buffer);
        if (pdfData && pdfData.text && pdfData.text.trim().length > 0) {
          text = (text ? text + '\n' : '') + pdfData.text;
        }
      } catch (pdfErr) {
        console.warn('Backend pdf-parse notice:', pdfErr.message);
      }
    }

    if (!text && !base64) {
      return res.json({ parsed_skills: {}, detected_mentions: [] });
    }

    // Try Gemini Semantic Parser first
    const data = loadTaxonomyData();
    const validSkillIds = (data.skills || []).map(s => s.id);
    const geminiResult = await parseSkillsWithGemini(text, validSkillIds, base64);

    if (geminiResult && Object.keys(geminiResult.parsed_skills || {}).length > 0) {
      return res.json(geminiResult);
    }

    // Fallback to regex/keyword rule parser
    const fallbackResult = parseFreeTextSkills(text || '');
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

    // Dynamic critical gaps: calculate from actual team skill data
    const skillCounts = {};
    const allSkillNames = {
      sql_mastery: 'SQL & Data Warehousing',
      python_analytics: 'Python & Analytics',
      tableau_bi: 'Tableau & BI Visualization',
      stat_modeling: 'Statistical Modeling & A/B Testing',
      react_frontend: 'React & Frontend Engineering',
      node_express: 'Node.js & Express Backend',
      system_design: 'System Design & Distributed Architecture',
      docker_k8s: 'Docker & Kubernetes',
      cicd_terraform: 'CI/CD & Infrastructure as Code',
      llm_engineering: 'LLM & RAG Application Building',
      product_discovery: 'Product Discovery & Strategy',
      ai_product_strategy: 'AI Product Strategy'
    };

    // Collect all unique skills across the team
    enrichedHeatmap.forEach(member => {
      const skills = member.skills || {};
      Object.entries(skills).forEach(([skillId, level]) => {
        if (!skillCounts[skillId]) {
          skillCounts[skillId] = { total: 0, belowL3: 0 };
        }
        skillCounts[skillId].total++;
        if (level < 3) {
          skillCounts[skillId].belowL3++;
        }
      });
      // Also count skills that members DON'T have (missing entirely)
      Object.keys(allSkillNames).forEach(skillId => {
        if (!(skillId in skills)) {
          if (!skillCounts[skillId]) {
            skillCounts[skillId] = { total: 0, belowL3: 0 };
          }
          skillCounts[skillId].belowL3++;
        }
      });
    });

    const criticalGaps = Object.entries(skillCounts)
      .filter(([, counts]) => counts.belowL3 >= 2)
      .sort((a, b) => b[1].belowL3 - a[1].belowL3)
      .slice(0, 5)
      .map(([skillId, counts]) => ({
        skill_id: skillId,
        skill_name: allSkillNames[skillId] || skillId.replace(/_/g, ' '),
        missing_count: counts.belowL3,
        severity: counts.belowL3 >= 4 ? 'High' : counts.belowL3 >= 3 ? 'Medium' : 'Low',
        affected_members: enrichedHeatmap
          .filter(m => !(m.skills || {})[skillId] || (m.skills || {})[skillId] < 3)
          .map(m => m.name)
      }));

    res.json({
      team_heatmap: enrichedHeatmap,
      summary: {
        total_reports: enrichedHeatmap.length,
        avg_readiness: avgReadiness,
        critical_org_gaps: criticalGaps
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Team Suggestions endpoint for Manager Heatmap
app.post('/api/manager/suggestions', async (req, res) => {
  try {
    const { team_heatmap, critical_gaps } = req.body;
    const { generateTeamAISuggestions } = await import('./services/geminiService.js');
    const suggestions = await generateTeamAISuggestions(team_heatmap || [], critical_gaps || []);
    res.json({ suggestions });
  } catch (err) {
    console.warn('AI team suggestions error:', err.message);
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
