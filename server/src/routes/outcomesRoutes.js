const express = require('express');
const router = express.Router();
const { getOutcomes } = require('../controllers/outcomesController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, authorize('Admin', 'Marketing Manager', 'Sales Manager'), getOutcomes);

module.exports = router;
