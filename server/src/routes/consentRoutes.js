const express = require('express');
const router = express.Router();
const { getConsents, updateConsent } = require('../controllers/consentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, authorize('Admin', 'Marketing Manager'), getConsents);

router.route('/:id')
  .put(protect, authorize('Admin', 'Marketing Manager'), updateConsent);

module.exports = router;
