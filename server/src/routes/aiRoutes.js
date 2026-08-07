const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { getInsights, submitFeedback, getFeedbackHistory } = require('../controllers/aiController');
const { protect, authorize } = require('../middleware/authMiddleware');

const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // 20 requests per minute
  message: { message: 'Too many AI requests from this IP, please try again later.' }
});

router.post('/insights', protect, aiLimiter, getInsights);
router.post('/feedback', protect, submitFeedback);
router.get('/feedback', protect, authorize('Admin', 'Marketing Manager', 'Sales Manager'), getFeedbackHistory);

module.exports = router;
