# PathCraft AI

### Employee Learning Recommendation & Adaptive Roadmap Platform

PathCraft AI converts a vague career goal such as "I want to become a Data Analyst" into a structured, week-by-week skill development roadmap. The roadmap is built automatically from real course catalogs and adjusts itself as the employee progresses and verifies new skills.

PathCraft AI is an enterprise-grade platform built with React, Tailwind CSS, and Node.js with Express, designed to help organizations close skill gaps efficiently and give employees a clear, personalized path toward their next role.

---

## Table of Contents

1. [Overview](#overview)
2. [Key Features](#key-features)
3. [Tech Stack](#tech-stack)
4. [System Architecture](#system-architecture)
5. [Quick Start](#quick-start)
6. [API Endpoints](#api-endpoints)
7. [Project Structure](#project-structure)
8. [Contributing](#contributing)
9. [License](#license)

---

## Overview

Traditional corporate learning platforms present employees with generic course catalogs and leave them to figure out what to learn, in what order, and why. PathCraft AI removes that guesswork.

Given an employee's current skills and a target role, PathCraft AI:

- Extracts structured skill proficiency levels from plain-English self-descriptions.
- Computes precise skill gaps against role requirements.
- Ranks missing skills by gap magnitude and prerequisite depth.
- Generates a week-by-week learning roadmap using real courses from established providers.
- Explains why each course was recommended.
- Re-plans the roadmap dynamically as the employee completes verification quizzes.
- Gives managers and HR teams an aggregated view of team-wide skill readiness.

The platform is designed with a fallback dataset built in, so it can run fully offline for demonstrations without depending on external APIs or live data connections.

---

## Key Features

### 1. Hackathon Persona Switcher
Instantly switch between preset employee profiles for demonstration purposes:
- Priya Sharma, Junior Data Analyst
- Marcus Chen, Frontend Developer
- Sarah Jenkins, Product Manager

### 2. AI Free-Text Skill Extractor
Converts plain English descriptions of an employee's experience into structured skill proficiency levels, rated from Level 1 to Level 5.

### 3. Rule-Based and AI Skill Gap Engine
Pre-computes skill vector gaps using the formula:

```
gap_score = max(0, required_level - current_level)
```

Missing skills are then ranked by gap magnitude and by how deep they sit in the prerequisite chain for the target role.

### 4. Interactive Skill Radar Chart
A visual spider chart compares an employee's current skill levels against the target role's requirements, making gaps immediately visible.

### 5. Week-by-Week Adaptive Roadmap
- Course cards sourced from Coursera, Udemy, freeCodeCamp, and DeepLearning.AI.
- "Why AI Picked This Course" explainability callouts for every recommendation.
- Dynamic re-planning of the roadmap whenever a verification assessment is completed.

### 6. Skill Verification Quizzes
Each learning module includes a short three-question quiz. Passing the quiz confirms genuine learning before the employee's skill level is upgraded in the system.

### 7. Manager and HR Heatmap Dashboard
- Aggregated skill matrix for all direct reports.
- Org-wide skill deficit warnings.
- Internal mobility readiness metrics to identify employees ready for new roles.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), Tailwind CSS |
| Data Visualization | Recharts (Radar Chart) |
| Icons | Lucide React |
| Backend | Node.js, Express |
| Architecture | Modular REST API with an offline fallback dataset |

---

## System Architecture

PathCraft AI follows a modular client-server architecture:

- The **React client** handles all user interaction, including the persona switcher, skill input, radar chart visualization, roadmap display, and dashboards.
- The **Express API server** exposes REST endpoints for skill parsing, gap analysis, roadmap generation, adaptive re-planning, quizzes, and manager analytics.
- A **fallback dataset** is bundled with the server so that the application remains fully functional even without external network access, ensuring zero-downtime demos.

---

## Quick Start

### Prerequisites
- Node.js (version 18 or higher recommended)
- npm

### 1. Install Dependencies

Install packages for the root project, the server, and the client.

```bash
npm install
cd server && npm install
cd ../client && npm install
```

### 2. Run the Application

Open two terminal windows.

**Terminal 1: Start the Express API Server (Port 5000)**
```bash
npm run server
```

**Terminal 2: Start the Vite React Dev Server (Port 3000)**
```bash
npm run client
```

### 3. Open the App

Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Server health check |
| GET | `/api/taxonomy` | Retrieves skills, roles, and the course catalog |
| GET | `/api/personas` | Retrieves pre-seeded demo personas |
| POST | `/api/parse-skills` | Parses free-text input into structured skill levels |
| POST | `/api/gap-analysis` | Computes rule-based skill gap vectors |
| POST | `/api/generate-path` | Generates a week-by-week learning roadmap |
| POST | `/api/replan-path` | Re-plans the roadmap after module verification |
| GET | `/api/quiz/:skillId` | Generates a module verification quiz for a given skill |
| GET | `/api/manager/heatmap` | Returns team skill matrix and organizational analytics |

---

## Project Structure

```
pathcraft-ai/
├── client/               # React frontend (Vite, Tailwind CSS, Recharts)
├── server/                # Node.js + Express backend and API routes
├── package.json           # Root project configuration
└── README.md
```

---

## Contributing

Contributions, issues, and feature requests are welcome. If you would like to contribute, please fork the repository, create a feature branch, and submit a pull request with a clear description of your changes.

---

## License

This project is provided for hackathon and demonstration purposes. Add your preferred license here (for example, MIT) before distribution.
