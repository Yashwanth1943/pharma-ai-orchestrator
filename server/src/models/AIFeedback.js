const mongoose = require('mongoose');

const aiFeedbackSchema = new mongoose.Schema({
  contextType: {
    type: String,
    required: true,
  },
  model: {
    type: String,
    required: true,
  },
  promptSnapshot: {
    type: Object,
  },
  aiResponse: {
    type: Object,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  userRole: {
    type: String,
  },
  feedback: {
    type: String, // 'positive', 'negative', null
    default: null,
  },
  correction: {
    type: String, // if they overrode it, what did they write
  },
  outcome: {
    type: String, // e.g., 'converted', 'churned', 'resolved'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AIFeedback', aiFeedbackSchema);
