# PathCraft AI – Comprehensive Feature Overview

## 🎨 Design System & Smooth Navigation
- **Palette & Typography**: Human‑Touch White & Royal Blue, Outfit & Inter fonts, glass‑morphism cards.
- **Sliding Pill Navbar**: Hardware‑accelerated pill indicator with `active:scale-95` micro‑haptic feedback.
- **`.page-transition` Animation**: Upward fade (`translateY(12px) scale(0.995) → translateY(0px) scale(1)`) applied to all major views (Roadmap, Skill Gaps, Career Simulator, Manager Heatmap).

## 🚀 Powerhouse Innovations (New in v2.0)
- **Career What-If Simulator 2.0 (Multi-Role Decision Engine)**:
  - Compare multiple target careers side-by-side (e.g. *Senior Data Analyst* vs *AI Engineer* vs *Data Engineer*).
  - Side-by-side Factor Decision Matrix: Current Skill Match %, Missing Skills count, Estimated Learning Time, Weekly Effort slider, Market Hiring Demand, and Open Internal Requisitions.
  - **"Why this recommendation?" AI Synthesis Box**: Synthesizes fastest internal mobility paths vs highest growth ceilings with trade-off cards and Gemini-powered recommendations.
- **Skill Gap → Real-World Project → Verified Skill**:
  - Upgrades traditional course learning into demonstrated project competency.
  - Practical enterprise project briefs (e.g., *Build an Enterprise Sales Analytics & Retention Dashboard using SQL*).
  - Evaluated on a 4-pillar rubric: Window Functions, Complex JOINs & CTEs, Query Optimization, and Executive Business Insights.
  - Interactive SQL/code workspace with pre-loaded solutions and AI evaluation to officially upgrade verified skill levels and recalculate Target Role Readiness in real-time.
- **AI Learning Companion with Progress & Memory Retention**:
  - Remembers learner context: current role, target role, current roadmap step, verified project submissions, and previous quiz mistakes (e.g. *struggled with PARTITION BY in last quiz*).
  - Pedagogical companion that grounds every answer in the learner's journey: *"Since you are learning SQL for your Senior Data Analyst roadmap, let's use a sales-ranking example. You struggled with PARTITION BY in your last quiz. Let's practice that concept."*

## 🤖 Google Gemini Generative AI
- **Live AI Mentor Co‑Pilot** (`gemini‑3.6‑flash`): Real‑time explanations, code snippets, production gotchas, and 5‑minute challenges.
- **Hands-On Real Project Review & Verification**: Deep code and executive business memo evaluation with automated level progression.
- **In‑Browser Code & SQL Playground**: Write/run Python/SQL, submit to Gemini for instant review & complexity analysis.
- **Dynamic Scenario‑Based Quiz Generator**: Fresh workplace‑scenario questions on‑demand.
- **"Day in the Life" Role‑Play Simulator**: Interactive decision‑making flow for target roles.
- **Resume & Profile Scanner**: Parse resumes, extract skill levels (1‑5).
- **Executive Promotion Pitch Memo Generator**: AI‑crafted 1‑page justification with projected cost‑savings.

## 📊 365‑Day Activity Heatmap & Gamification
- **GitHub‑Style Heatmap**: 52‑week grid visualising daily learning activity, hover tooltips show hours & modules completed.
- **Daily Streak & 60‑Second Micro‑Drill Widget**: Tracks streak, presents a quick practice question each day.
- **Global Leaderboard & Learning Circles**: XP points, streaks, department‑level rankings.

## 🏢 Enterprise Ecosystem & HR Integration
- **Slack & Microsoft Teams Bot Simulator**: Focus reminders, kudos, manager digests.
- **Internal Peer Mentorship Network**: Match‑making for 30‑min coffee chats.
- **Calendar Study Focus Sync**: Generate `.ics` files for Google Calendar, Outlook, Apple Calendar.
- **Verifiable Digital Certificate of Mastery**: Cryptographically hashed PDF with confetti animation.
- **Real‑Time Market Job Trends & Salary Benchmarks**.
- **Manager Capability Heatmap & Org Deficit Matrix**: Skill matrix of direct reports, bottleneck alerts, internal mobility readiness.

## 🛠️ Architecture & Tech Stack
- **Frontend**: React 19, Vite, Tailwind CSS, Recharts, Lucide icons, Canvas‑Confetti, Web Speech API.
- **Backend**: Node.js, Express, Mongoose, `@google/generative-ai`.
- **Database**: MongoDB Atlas.
- **AI Model**: Google Gemini 3.6‑Flash.

## 🚀 Quick‑Start
1. **Clone & Install**
   ```bash
   git clone https://github.com/navinrajaa2/Techathon.git
   cd Techathon
   npm install   # root deps
   npm run install-all   # server + client deps
   ```
2. **Configure** – create `server/.env` with `PORT`, `MONGODB_URI`, `GEMINI_API_KEY`.
3. **Run** – `npm run dev` (frontend @ 3000, backend @ 5000).

## 📡 REST API Reference
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/taxonomy` | Skill & role catalog |
| GET | `/api/personas` | Demo user profiles |
| POST | `/api/mentor/chat` | Gemini‑powered mentor chat |
| POST | `/api/code/review` | Code review & complexity analysis |
| POST | `/api/quiz/generate-dynamic` | Dynamic scenario quiz |
| POST | `/api/parse-skills` | Resume & free‑text skill parser |
| POST | `/api/gap-analysis` | Skill‑gap vector computation |
| POST | `/api/generate-path` | Adaptive roadmap generator |
| POST | `/api/replan-path` | Adaptive replanning |
| POST | `/api/quiz/submit` | Quiz results & XP persistence |
| GET | `/api/manager/heatmap` | Org capability matrix |

## 👥 Contributors
Built with ❤️ for the Techathon Hackathon.
