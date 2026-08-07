const mongoose = require('mongoose');

const consentPreferenceSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  channels: {
    email: { type: Boolean, default: false },
    sms: { type: Boolean, default: false },
    push: { type: Boolean, default: false },
  },
  purposes: {
    marketing: { type: Boolean, default: false },
    productUpdates: { type: Boolean, default: false },
    research: { type: Boolean, default: false },
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  notes: {
    type: String,
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ConsentPreference', consentPreferenceSchema);
