const AIFeedback = require('../models/AIFeedback');
const Order = require('../models/Order');
const Complaint = require('../models/Complaint');
const User = require('../models/User');

// @desc    Get AI model outcomes and aggregate metrics
// @route   GET /api/outcomes
// @access  Private
const getOutcomes = async (req, res) => {
  try {
    // 1. Get Acceptance Rate / Feedback Stats
    const totalRuns = await AIFeedback.countDocuments();
    const positiveRuns = await AIFeedback.countDocuments({ feedback: 'positive' });
    const negativeRuns = await AIFeedback.countDocuments({ feedback: 'negative' });
    
    let acceptanceRate = 0;
    if (totalRuns > 0) {
      acceptanceRate = Math.round((positiveRuns / (positiveRuns + negativeRuns || 1)) * 100);
    }
    
    // 2. Get AI Avg Confidence
    const feedbacks = await AIFeedback.find();
    let totalConfidence = 0;
    let confidenceCount = 0;
    
    feedbacks.forEach(f => {
      if (f.aiResponse && f.aiResponse.confidence) {
        totalConfidence += f.aiResponse.confidence;
        confidenceCount++;
      }
    });
    
    const avgConfidence = confidenceCount > 0 ? Math.round(totalConfidence / confidenceCount) : 0;
    
    // 3. Get Recent Feedbacks for table
    const recentFeedbacks = await AIFeedback.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('userId', 'name role');

    // 4. Return aggregate data
    res.json({
      metrics: {
        acceptanceRate,
        avgConfidence,
        totalRuns,
        positiveRuns,
        negativeRuns
      },
      recentFeedbacks
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

module.exports = { getOutcomes };
