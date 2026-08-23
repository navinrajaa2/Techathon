# Techathon - PathCraft AI (Employee Learning Recommendation Platform)

> **"We turn a vague goal like 'I want to become a Data Analyst' into a week-by-week skill roadmap, auto-picked from real courses, that adjusts itself as the employee actually learns."**

PathCraft AI is an enterprise-grade Employee Learning Recommendation & Adaptive Roadmap Platform built with **React**, **Tailwind CSS**, and **Node.js + Express**.

---

## 🌟 Key Features

1. **Hackathon Persona Switcher**: Instant switching between preset employee profiles (*Priya Sharma - Junior Data Analyst*, *Marcus Chen - Frontend Dev*, *Sarah Jenkins - Product Manager*).
2. **AI Free-Text Skill Extractor**: Converts plain English descriptions into structured skill proficiency levels (Level 1 to 5).
3. **Rule-Based & AI Skill Gap Engine**: Pre-computes skill vector mathematical gaps (`gap_score = max(0, required - current)`) and ranks missing skills based on gap magnitude and prerequisite depth.
4. **Interactive Skill Radar Chart**: Visual spider chart comparing current employee skill levels against target role requirements.
5. **Week-by-Week Adaptive Roadmap**:
   - Course cards from Coursera, Udemy, freeCodeCamp, DeepLearning.AI.
   - AI explainability callouts (*"Why AI Picked This Course"*).
   - Dynamic path re-planning when verification assessments are completed.
6. **Skill Verification Quizzes**: 3-question module assessments to confirm learning before upgrading skill levels.
7. **Manager & HR Heatmap Dashboard**: Aggregated direct report skill matrix, org-wide skill deficit warnings, and internal mobility readiness metrics.

---

## 🛠️ Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, Recharts (Radar Chart), Lucide-React Icons.
- **Backend**: Node.js, Express API Server.
- **Architecture**: Modular REST API with fallback dataset for zero-downtime offline demos.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
# Install root, server, and client packages
npm install
cd server && npm install
cd ../client && npm install
```

### 2. Run the Application
```bash
# Terminal 1: Start Express API Server (Port 5000)
npm run server

# Terminal 2: Start Vite React Dev Server (Port 3000)
npm run client
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📡 API Endpoints

- `GET /api/health` - Server health check
- `GET /api/taxonomy` - Skills, roles, and course catalog
- `GET /api/personas` - Pre-seeded demo personas
- `POST /api/parse-skills` - AI free-text skill parsing
- `POST /api/gap-analysis` - Rule-based gap vector computation
- `POST /api/generate-path` - Week-by-week learning roadmap generation
- `POST /api/replan-path` - Adaptive path re-planning after module verification
- `GET /api/quiz/:skillId` - Module verification quiz generator
- `GET /api/manager/heatmap` - Team skill matrix and org analytics
