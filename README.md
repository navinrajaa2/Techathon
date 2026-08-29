# PathCraft AI — Enterprise Adaptive Learning & Internal Mobility Platform

> **"Transforming career aspirations into verified, week-by-week adaptive upskilling roadmaps powered by Google Gemini Generative AI, MongoDB Atlas, and Interactive Engineering Workbenches."**

---

## 🌟 Executive Overview & Key Innovations

**PathCraft AI** is an enterprise-grade AI Employee Learning & Internal Mobility Platform designed to help organizations upskill internal talent, close capability gaps, and accelerate promotion readiness.

Unlike static LMS platforms, PathCraft AI generates **personalized, adaptive, week-by-week roadmaps** with real-time course recommendations, explainable AI rationales, in-browser execution playgrounds, and live verification assessments.

---

## 🚀 Complete Feature Suite

### 1. 💫 Design System & Smooth Navigation
- **Human-Touch White & Royal Blue Palette**: Clean canvas (`#f8fafc`), frosted white glass cards, modern typography (Outfit + Inter), and accessible contrast.
- **Hardware-Accelerated Sliding Pill Navbar**: Smooth macOS/iOS-style gliding pill indicator with `active:scale-95` micro-haptic feedback.
- **`.page-transition` Keyframes**: Upward fade page transitions (`translateY(12px) scale(0.995) → translateY(0px) scale(1)`) across all views.

---

### 2. 🤖 Google Gemini Generative AI Capabilities
- **Live AI Mentor Co-Pilot (`gemini-3.6-flash`)**: Pedagogical mentor explaining complex concepts with real-world analogies, code snippets, production gotchas, and 5-minute challenges.
- **⚡ In-Browser Code Review Engine**: Evaluates student code for time/space complexity (`O(N log N)` Time, `O(1)` Space), edge cases, and senior architectural advice.
- **Dynamic Scenario-Based AI Quiz Generator**: Generates 3 unique, fresh workplace scenario assessments on-demand for any skill level.
- **🎮 "Day in the Life" Career Roleplay Simulator**: Interactive workplace decision simulator evaluating leadership and technical tradeoff choices.
- **Deep Semantic Resume / Profile Scanner**: Drag-and-drop resume parser that extracts technical skills and estimates proficiency (Level 1–5).
- **📊 Executive Promotion Pitch Memo Generator**: AI-generated 1-page business justification document summarizing verified competencies and **$38,000 internal hiring cost savings** for HR/Leadership review.

---

### 3. 💻 Interactive In-Browser Code & SQL Playground
- **Multi-Language Workbench**: In-browser sandbox supporting **SQL** and **Python**.
- **Tabular Result Terminal**: Executes queries against simulated database tables in real-time.
- **One-Click AI Review**: Submits code directly to Gemini for instant grading, feedback, and celebratory mastery unlocks.

---

### 4. 📅 365-Day Activity Heatmap & Gamification
- **GitHub-Style Consistency Grid**: 52-week visual learning activity matrix with interactive hover tooltips (hours logged, modules completed).
- **🔥 Daily Streak & 60-Second Micro-Drill**: Top banner widget tracking active streaks with instant 1-question daily flash drills.
- **🏆 Global Leaderboard & Learning Circles**: Enterprise ranking by XP points, streaks, and department-level upskilling goals.

---

### 5. 🏢 Enterprise Ecosystem & HR Integration
- **💬 Slack & Microsoft Teams Bot Simulator**: Live preview of automated focus reminders, peer kudos celebrations, and manager weekly digests.
- **🤝 Internal Peer Mentorship Network**: Matches employees with senior colleagues for 1-on-1 30-min coffee chat guidance.
- **📅 Calendar Study Focus Sync**: Dynamic `.ics` calendar generation for 1-click sync into Google Calendar, Outlook, and Apple Calendar.
- **🎓 Verifiable Digital Certificate of Mastery**: Cryptographically hashed completion certificate with dual confetti cannons and print/PDF support.
- **📈 Real-Time Market Job Trends & Salary Benchmarks**: Live feed showing quarterly hiring demand surges (+140% QoQ) and open internal job requisitions.
- **👥 Manager Capability Heatmap & Org Deficit Matrix**: Aggregated direct report skill matrix, org bottleneck warnings, and internal mobility readiness metrics.

---

## 🛠️ Architecture & Tech Stack

```
┌─────────────────────────────────────────────────────────────┐
│                   PathCraft AI Frontend                     │
│         React 19 • Vite • Tailwind CSS • Recharts           │
│   Web Speech API • Canvas-Confetti • Sliding Pill Navbar    │
└──────────────────────────────┬──────────────────────────────┘
                               │ REST / JSON
┌──────────────────────────────▼──────────────────────────────┐
│                    Express API Server                       │
│      Node.js • Modular Router • Mongoose ORM Layer          │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
┌──────────────▼──────────────┐┌──────────────▼───────────────┐
│     MongoDB Atlas Cloud     ││   Google Gemini AI SDK       │
│  Users • LearningPaths      ││   gemini-3.6-flash           │
│  QuizResults • Taxonomies   ││   Mentor • Quiz • Review     │
└─────────────────────────────┘└──────────────────────────────┘
```

- **Frontend**: React 19, Vite, Tailwind CSS, Recharts (Radar charts), Lucide Icons, Canvas-Confetti, Web Speech Synthesis.
- **Backend**: Node.js, Express, Mongoose, `@google/generative-ai`.
- **Database**: MongoDB Atlas Cloud Cluster.
- **AI Models**: Google Gemini 3.6 Flash.

---

## 🚀 Quick Start & Installation

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/navinrajaa2/Techathon.git
cd Techathon

# Install root dependencies
npm install

# Install server & client packages
npm run install-all
```

### 2. Environment Configuration
Create a `.env` file in the `server/` directory:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.feryx1a.mongodb.net/pathcraft_ai?retryWrites=true&w=majority
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Run Development Servers
```bash
# Run both Backend (Port 5000) and Frontend (Port 3000) concurrently:
npm run dev
```

* 🌐 **Frontend**: [http://localhost:3000](http://localhost:3000)
* ⚙️ **Backend**: [http://localhost:5000](http://localhost:5000)

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check & connection status |
| `GET` | `/api/taxonomy` | Skills, roles, and course catalog |
| `GET` | `/api/personas` | Pre-seeded demo user profiles |
| `POST` | `/api/mentor/chat` | Live AI Mentor chat powered by Gemini |
| `POST` | `/api/code/review` | Live Code Review & Complexity Analysis |
| `POST` | `/api/quiz/generate-dynamic` | Dynamic scenario-based quiz generator |
| `POST` | `/api/parse-skills` | Semantic resume & free-text skill parser |
| `POST` | `/api/gap-analysis` | Mathematical skill gap vector computation |
| `POST` | `/api/generate-path` | Week-by-week adaptive roadmap generator |
| `POST` | `/api/replan-path` | Adaptive path re-planning after verification |
| `POST` | `/api/quiz/submit` | Quiz results & XP points persistence |
| `GET` | `/api/manager/heatmap` | Department capability matrix & org risks |

---

## 👥 Contributors & Hackathon Team
Built with ❤️ for the Techathon Hackathon.
