const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  name: { type: String, required: true },
  targetSegment: { type: String, required: true },
  status: { type: String, enum: ['Draft', 'Active', 'Completed', 'Paused'], default: 'Draft' },
  aiGeneratedMessage: { type: String },
  targetCount: { type: Number, default: 0 },
  successRate: { type: Number, default: 0 }, // For propensity/outcomes feedback
  consentRequired: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Campaign', campaignSchema);
