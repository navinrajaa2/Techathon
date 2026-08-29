import mongoose from 'mongoose';

const QuizResultSchema = new mongoose.Schema({
  user_id: { type: String, default: 'demo_user' },
  skill_id: { type: String, required: true },
  skill_name: { type: String },
  score: { type: Number, required: true },
  total_questions: { type: Number, required: true },
  passed: { type: Boolean, required: true },
  user_answers: { type: mongoose.Schema.Types.Mixed }
}, {
  timestamps: true
});

export default mongoose.models.QuizResult || mongoose.model('QuizResult', QuizResultSchema);
