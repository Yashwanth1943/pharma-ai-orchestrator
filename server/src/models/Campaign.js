const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  name: { type: String, required: true },
  targetSegment: { type: String, required: true },
  message: { type: String },
  status: { type: String, enum: ['Draft', 'Active', 'Completed', 'Paused'], default: 'Draft' },
  aiGeneratedMessage: { type: String },
  targetCount: { type: Number, default: 0 },
  successRate: { type: Number, default: 0 },
  consentRequired: { type: Boolean, default: true },
}, {
  timestamps: true
});

module.exports = mongoose.model('Campaign', campaignSchema);
