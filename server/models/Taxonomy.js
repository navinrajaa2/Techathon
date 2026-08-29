import mongoose from 'mongoose';

const TaxonomySchema = new mongoose.Schema({
  doc_type: { type: String, default: 'main_taxonomy', unique: true },
  tracks: [{ type: mongoose.Schema.Types.Mixed }],
  roles: [{ type: mongoose.Schema.Types.Mixed }],
  skills: [{ type: mongoose.Schema.Types.Mixed }],
  courses: [{ type: mongoose.Schema.Types.Mixed }],
  personas: [{ type: mongoose.Schema.Types.Mixed }],
  team_heatmap: [{ type: mongoose.Schema.Types.Mixed }]
}, {
  timestamps: true
});

export default mongoose.models.Taxonomy || mongoose.model('Taxonomy', TaxonomySchema);
