import mongoose from 'mongoose';

const LearningPathSchema = new mongoose.Schema({
  user_id: { type: String, default: 'demo_user' },
  user_name: { type: String, default: 'Alex Rivera' },
  target_role_id: { type: String, required: true },
  target_role_title: { type: String },
  weekly_hours: { type: Number, default: 5 },
  gap_analysis: { type: mongoose.Schema.Types.Mixed },
  learning_path: { type: mongoose.Schema.Types.Mixed },
  status: {
    type: String,
    enum: ['active', 'completed', 'paused', 're_planned'],
    default: 'active'
  },
  progress_percent: { type: Number, default: 0 },
  completed_modules: [{ type: String }]
}, {
  timestamps: true
});

export default mongoose.models.LearningPath || mongoose.model('LearningPath', LearningPathSchema);
