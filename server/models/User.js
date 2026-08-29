import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, sparse: true },
  avatar: { type: String },
  current_role: { type: String, default: 'Junior Developer' },
  target_role_id: { type: String, default: 'senior_ai_eng' },
  weekly_hours: { type: Number, default: 6 },
  current_skills: {
    type: Map,
    of: Number,
    default: {}
  },
  completed_skills: [{ type: String }],
  streak_days: { type: Number, default: 5 },
  points: { type: Number, default: 420 },
  badges: [{ type: String }]
}, {
  timestamps: true
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
