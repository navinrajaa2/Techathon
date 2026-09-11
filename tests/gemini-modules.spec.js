import { test, expect } from '@playwright/test';

test.describe('Gemini API Modules Verification', () => {
  // Test Mentor Chat
  test('Mentor Chat Module should return AI response', async ({ request }) => {
    const response = await request.post('/api/mentor/chat', {
      data: {
        query: 'Can you explain window functions in SQL?',
        skill_name: 'SQL & Data Warehousing',
        target_role_title: 'Senior Data Analyst'
      }
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body).toHaveProperty('reply');
    expect(typeof body.reply).toBe('string');
    expect(body.reply.length).toBeGreaterThan(10);
  });

  // Test Dynamic Quiz
  test('Dynamic Quiz Module should generate valid scenario questions', async ({ request }) => {
    const response = await request.post('/api/quiz/generate-dynamic', {
      data: {
        skill_name: 'Python Analytics',
        current_level: 2,
        target_role_title: 'Data Scientist'
      }
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body).toHaveProperty('skill_name');
    expect(body).toHaveProperty('questions');
    expect(Array.isArray(body.questions)).toBeTruthy();
    if (body.questions.length > 0) {
      expect(body.questions[0]).toHaveProperty('question');
      expect(body.questions[0]).toHaveProperty('options');
      expect(body.questions[0]).toHaveProperty('correct_index');
    }
  });

  // Test Code Review
  test('Code Review Module should return code analysis', async ({ request }) => {
    const response = await request.post('/api/code/review', {
      data: {
        code: 'SELECT * FROM users;',
        language: 'sql',
        problem_prompt: 'Select all users from the database',
        skill_name: 'SQL'
      }
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body).toHaveProperty('passed');
    expect(body).toHaveProperty('score');
    expect(body).toHaveProperty('summary');
  });

  // Test Career Simulator Recommendation
  test('Career Simulator Module should return role synthesis', async ({ request }) => {
    const response = await request.post('/api/career-simulator/recommendation', {
      data: {
        current_role_title: 'Junior Developer',
        roles_data: [
          { title: 'Frontend Developer', skills_overlap: 80 },
          { title: 'Backend Developer', skills_overlap: 50 }
        ]
      }
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body).toHaveProperty('narrative');
    expect(body).toHaveProperty('recommended_role_id');
  });
});
