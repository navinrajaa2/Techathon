import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Taxonomy from '../models/Taxonomy.js';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const taxonomyPath = path.join(__dirname, '../data/taxonomy.json');

let isConnected = false;

export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pathcraft_ai';

  try {
    console.log(`Connecting to MongoDB Atlas...`);
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
    });

    isConnected = true;
    console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host} (DB: ${conn.connection.name})`);

    // Auto-seed data if needed
    await seedInitialData();
    return true;
  } catch (error) {
    isConnected = false;
    console.warn(`⚠️ MongoDB Connection Notice: ${error.message}`);
    console.warn(`Continuing in memory/JSON fallback mode.`);
    return false;
  }
}

export function isDBConnected() {
  return isConnected && mongoose.connection.readyState === 1;
}

async function seedInitialData() {
  try {
    if (!fs.existsSync(taxonomyPath)) return;
    const raw = fs.readFileSync(taxonomyPath, 'utf8');
    const data = JSON.parse(raw);

    // Seed Taxonomy if empty
    const existingTaxonomy = await Taxonomy.findOne({ doc_type: 'main_taxonomy' });
    if (!existingTaxonomy) {
      await Taxonomy.create({
        doc_type: 'main_taxonomy',
        tracks: data.tracks || [],
        roles: data.roles || [],
        skills: data.skills || [],
        courses: data.courses || [],
        personas: data.personas || [],
        team_heatmap: data.team_heatmap || []
      });
      console.log('🌱 Seeded initial Taxonomy catalog into MongoDB.');
    }

    // Seed default demo personas as Users if empty
    const userCount = await User.countDocuments();
    if (userCount === 0 && data.personas && data.personas.length > 0) {
      for (const persona of data.personas) {
        await User.create({
          name: persona.name,
          email: `${persona.id}@example.com`,
          avatar: persona.avatar,
          current_role: persona.current_role,
          target_role_id: persona.target_role_id,
          weekly_hours: persona.weekly_hours || 6,
          current_skills: persona.current_skills || {}
        });
      }
      console.log(`🌱 Seeded ${data.personas.length} demo users into MongoDB.`);
    }
  } catch (err) {
    console.error('Error during MongoDB data seeding:', err.message);
  }
}
