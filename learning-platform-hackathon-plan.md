# Employee Learning Recommendation Platform — Complete Hackathon Playbook

## 1. Reframe the Problem (do this before writing code)

Judges have seen "AI course recommender" ideas before. To stand out, get specific about **who** feels this pain and **why now**:

- **Employee pain:** "I know I should learn something, but I don't know what, in what order, or how it connects to my next promotion."
- **Manager/HR pain:** "I have 40 reports. I can't build a learning plan for each one manually. I also can't tell who's actually improving vs. just clicking through courses."
- **Company pain:** Skills gaps cause missed internal mobility → costly external hiring, and L&D budgets get spent on courses nobody finishes.

**Your one-liner for the pitch:**
> "We turn a vague goal like 'I want to become a Data Analyst' into a week-by-week skill roadmap, auto-picked from real courses, that adjusts itself as the employee actually learns."

Keep repeating this sentence throughout your demo — judges remember taglines, not architecture diagrams.

---

## 2. Core User Flow (MVP scope)

1. **Onboarding:** Employee enters current role, current skills (self-rated or resume upload), and a career goal (dropdown + free text, e.g. "Senior Data Analyst").
2. **Gap Analysis:** System compares current skill vector vs. target role skill vector → outputs a ranked list of missing/weak skills.
3. **Path Generation:** LLM converts the gap list into an ordered learning path (skill → recommended course/resource → estimated time → prerequisite order).
4. **Progress Tracking:** Employee marks modules complete / takes a quick quiz → system recalculates remaining gap and re-orders path if needed.
5. **Manager/HR Dashboard:** Aggregated view — team skill heatmap, who's on track, org-wide skill gaps (this is what makes it "enterprise," not just a personal app).

**Cut for MVP if time-pressed:** resume parsing, quizzes, manager dashboard analytics beyond a simple table. Keep the individual employee flow rock solid — that's what you'll demo live.

---

## 3. System Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Frontend   │────▶│   Backend API     │────▶│   Database       │
│ React/Next   │     │ Node/Express or   │     │ Postgres/Mongo   │
│              │◀────│ FastAPI (Python)  │◀────│                  │
└─────────────┘     └──────────────────┘     └─────────────────┘
                            │
                            ▼
                  ┌──────────────────────┐
                  │  LLM Layer (Claude)   │
                  │ - Gap analysis prompt │
                  │ - Path generation     │
                  │ - Re-planning         │
                  └──────────────────────┘
                            │
                            ▼
                 ┌───────────────────────┐
                 │ Course/Content Source  │
                 │ (curated JSON dataset  │
                 │  or public API)        │
                 └───────────────────────┘
```

### Recommended stack (optimize for speed, not purity)
- **Frontend:** React + Tailwind (or Next.js if you want quick routing). Use a component library (shadcn/ui) to avoid designing from scratch.
- **Backend:** FastAPI (Python) if your team is comfortable with Python — it pairs well with embeddings/ML code. Node/Express is fine too if your team is JS-first.
- **Database:** Postgres if you want structured skill/course relationships; MongoDB if you want to move fast with flexible JSON docs. For a hackathon, **SQLite or even a JSON file** is honestly fine for a demo — don't over-engineer persistence.
- **AI:** Claude API (or any LLM API) for gap analysis + path generation reasoning. Use embeddings (OpenAI/Cohere/sentence-transformers) for skill-similarity matching if you want a "real ML" component judges can ask about.
- **Auth:** Skip real auth. Use a fake login / role switcher (Employee view vs Manager view) to save hours.

---

## 4. The Data Model (this is the heart of the project)

### Skill Taxonomy
You need a structured list of skills, not free text, or your recommendations will be inconsistent. Options, fastest to slowest:
1. **Fastest:** Hardcode a taxonomy of ~100-150 skills across 3-4 tracks (e.g., Data, Product, Engineering, Design) as a JSON file.
2. **Better:** Pull a public taxonomy (e.g., LinkedIn Skills, O*NET, ESCO) and trim it to a subset.
3. **Most impressive but riskiest:** Use LLM to dynamically extract skills from any role description at runtime (cool demo, but harder to guarantee gap analysis is coherent).

**Recommendation:** Do #1 for reliability, but let the LLM handle the free-text-to-taxonomy mapping (e.g., user types "I know some Python" → LLM maps it to your `python_programming` skill node with a proficiency estimate). This gives you both structure and flexibility.

### Core entities
```
Employee { id, name, role, current_skills: [{skill_id, level(1-5)}], goal_role_id }
Role { id, title, required_skills: [{skill_id, min_level}] }
Skill { id, name, category, prerequisite_skill_ids: [] }
Course { id, title, skill_id, level, duration_hrs, source_url, format }
LearningPath { employee_id, ordered_steps: [{skill_id, course_id, status, order_index}] }
```

### Gap calculation logic (simple, explainable — good for judges)
```
gap_score(skill) = required_level(skill, goal_role) - current_level(skill, employee)
sort skills by: (gap_score descending, prerequisite_depth ascending)
```
This gives you a defensible, non-black-box algorithm you can explain in 30 seconds — important because judges distrust "the AI just decides."

---

## 5. Where the LLM Actually Adds Value (be precise about this)

Don't just say "we use AI" — name the exact jobs it does, because judges will ask "what's actually AI here vs. hardcoded?":

1. **Free-text skill extraction:** Turn "I've built a few dashboards in Tableau and know basic SQL" into structured `{tableau: 2, sql: 2}`.
2. **Path narrative generation:** Turn the ranked gap list into a human-readable, motivating explanation ("Start with SQL fundamentals since it unlocks both dashboarding and Python analysis skills...").
3. **Course matching/reranking:** Given multiple candidate courses per skill, pick the best one for this employee's level and stated time budget.
4. **Adaptive re-planning:** After a completed module or quiz result, re-generate the remaining path (e.g., if they struggled, insert a remedial resource).

**Sample prompt structure** (use this pattern, not free-form prompting):
```
System: You are a corporate L&D planning assistant. Given an employee's current
skills, their target role, and a skill gap list, produce an ordered learning path.
Return ONLY valid JSON matching this schema: [...]

User: Current skills: {json}
Target role: {role_name}, required skills: {json}
Gap list (pre-computed): {json}
Available courses per skill: {json}
```
Pre-computing the gap list yourself (not asking the LLM to do the math) keeps recommendations consistent and demo-safe — LLMs are unreliable at precise ranking arithmetic.

---

## 6. Feature Prioritization (build in this order)

| Priority | Feature | Why |
|---|---|---|
| P0 | Skill gap calculation (rule-based) | Core logic, must be rock solid |
| P0 | LLM-generated ordered path with reasoning | This is your "wow" moment |
| P0 | Simple employee UI: input → path → progress checklist | This is what you'll demo live |
| P1 | Free-text skill input → LLM parses to taxonomy | Shows AI doing real work, not just a wrapper |
| P1 | Progress tracking + path re-adjustment | Shows the "adaptive" claim is real, not just marketing |
| P2 | Manager dashboard (team skill heatmap) | Great for enterprise narrative, do if time allows |
| P2 | Course completion quiz to verify learning (not just self-report) | Adds credibility, judges love this differentiator |
| P3 | Resume upload/parsing for initial skills | Nice polish, cut first if short on time |
| P3 | Slack/Teams integration for reminders | Stretch goal, mention in "future work" if not built |

---

## 7. Differentiators That Win Hackathons

Most teams tackling this problem statement will stop at "LLM recommends courses." To place higher:

- **Explainability:** Show *why* each course was recommended ("this unlocks 3 downstream skills" or "this matches your stated 5hrs/week budget"). Judges reward transparent AI over black-box AI.
- **Verification, not just self-report:** A tiny 3-question quiz after each module to confirm learning actually happened, not just "mark as done." Shows you thought about real adoption problems (course completion ≠ learning).
- **Org-level insight:** Aggregate individual gaps into a team/company skill-gap heatmap. This turns a personal tool into something HR would actually pay for — a strong enterprise pitch.
- **Time-budget awareness:** Ask "how many hours/week can you commit?" and have the path respect it. Small feature, huge perceived thoughtfulness.
- **Cold-start handling:** Explicitly address "what if we have no course catalog for a company" — show you can bootstrap using public course APIs (Coursera/Udemy catalogs, YouTube, free resources) so the idea doesn't depend on unrealistic data assumptions.

---

## 8. Suggested Team Split (for a 3-5 person team)

- **1 person:** Backend + data model (skills taxonomy, gap logic, DB)
- **1 person:** LLM integration (prompts, path generation, re-planning logic)
- **1-2 people:** Frontend (employee flow is priority, manager dashboard if time)
- **1 person:** Demo/pitch prep + sourcing a real course dataset + polish (this role is often skipped and costs teams points — don't skip it)

---

## 9. Timeline for a Typical 24-36 Hour Hackathon

| Time | Milestone |
|---|---|
| Hour 0-2 | Finalize scope, agree on data model, set up repo, split tasks |
| Hour 2-6 | Skill taxonomy + course dataset ready; backend skeleton + DB running |
| Hour 6-12 | Gap calculation logic working end-to-end (even with dummy data) |
| Hour 12-18 | LLM integration for path generation; frontend employee flow wired up |
| Hour 18-24 | Progress tracking + re-adjustment; start manager dashboard if ahead |
| Hour 24-30 | Feature freeze. Bug fixing only. Seed realistic demo data. |
| Hour 30-34 | Build the pitch deck, rehearse demo, prepare for Q&A |
| Hour 34-36 | Final rehearsal, buffer for last-minute fixes |

**Rule: stop building new features at least 4-6 hours before the deadline.** Most teams lose points because the demo breaks live, not because the idea was weak.

---

## 10. Getting a Realistic Course Dataset Fast

Don't spend hours scraping. Fastest options:
- Hardcode 30-50 real courses (title, provider, URL, skill tag, level, duration) across your chosen skill tracks — pull real course names/links from Coursera, Udemy, freeCodeCamp, YouTube. Takes ~1-2 hours, looks completely legitimate in a demo.
- If you want it to look dynamic, wrap this static list behind a "search" function so it feels like a live catalog, and mention "in production this would integrate with the company's existing LMS or public course APIs" — judges accept this as a reasonable scope cut.

---

## 11. Demo Script (aim for 3-4 minutes)

1. **Hook (15s):** State the problem in one sentence using real numbers if you can find them ("73% of employees say they don't know what to learn next for their career goals" — cite if you find a real stat, otherwise use your own framing).
2. **Live demo (2 min):**
   - Log in as an employee named "Priya, Junior Data Analyst."
   - Enter goal: "Senior Data Analyst."
   - Show the gap analysis appear with a clear visual (radar chart or bar chart of current vs. required skill levels — very "wow" for judges).
   - Show the generated path with reasoning ("Start with SQL — it unlocks 3 other skills").
   - Mark a module complete, show the path adapt.
3. **Switch to manager view (30s):** Show the team heatmap — "now HR can see the whole team's gaps at a glance."
4. **Close (15s):** Repeat your one-liner. State the business impact ("reduces L&D planning time from hours to seconds, per employee").

**Visual tip:** A skill radar/spider chart (current vs. target) is one of the highest-impact visuals you can build for this idea — it's intuitive and looks "AI-native" without needing explanation.

---

## 12. Anticipate Judge Questions

- *"What's actually AI here vs. rules?"* → Have your answer ready from Section 5.
- *"How do you validate the recommendations are good?"* → Mention the verification quiz, and that the path logic (prerequisite-aware, gap-based) is explainable, not a black box.
- *"How does this scale to a real company with thousands of employees?"* → Talk about the aggregation into the manager dashboard, and batch processing of paths overnight rather than real-time for all users.
- *"What happens with bad/incomplete course data?"* → Explain the fallback (generic search-based recommendation, or flag "no course found, recommend internal mentor/project").
- *"Privacy/bias concerns?"* → Have one sentence ready: skill data is self-reported/opt-in, and recommendations are role-based, not comparing employees against each other in ways that could be discriminatory.

---

## 13. Common Pitfalls to Avoid

- **Over-scoping:** Trying to build resume parsing + Slack integration + course scraping + manager analytics all at once. Pick the 3-4 features from the P0/P1 table and make them excellent.
- **Unexplainable AI:** If your gap logic is entirely inside an LLM prompt with no visible math, judges will distrust it. Pre-compute gaps with real logic; use the LLM for language/reasoning/ranking on top.
- **No real data in the demo:** Judges notice when a demo is clearly using one hardcoded example. Prepare 2-3 different employee personas so you can show it's not overfit to one scenario.
- **Ignoring the "why now" story:** Make sure your pitch opens with the business problem, not the tech stack.
- **Fragile live demo:** Have a recorded backup video in case wifi/API fails during judging.

---

## 14. Stretch Ideas (mention as "future work" even if unbuilt)

- Integration with actual LMS platforms (Coursera for Business, Degreed, LinkedIn Learning API) for real completion tracking.
- Peer-based recommendations ("employees with a similar goal completed X first").
- Mentor-matching: pair employees with internal colleagues who already have the target skill.
- Predicted time-to-goal estimate based on employee's historical pace.

---

If you tell me your team's tech comfort (e.g., all-JS vs. Python-friendly, and team size), I can tighten this into a specific tech stack decision plus a starter repo structure or even scaffold the actual code for the core flow.
