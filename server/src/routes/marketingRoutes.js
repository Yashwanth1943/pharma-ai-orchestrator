const express = require('express');
const router = express.Router();
const { getCampaigns, createCampaign, getSegments } = require('../controllers/marketingController');
const { protect, authorize } = require('../middleware/authMiddleware');

const MARKETING_ROLES = ['Admin', 'Marketing Manager', 'Sales Manager'];

router.get('/campaigns', protect, authorize(...MARKETING_ROLES), getCampaigns);
router.post('/campaigns', protect, authorize(...MARKETING_ROLES), createCampaign);
router.get('/segments', protect, authorize(...MARKETING_ROLES), getSegments);

module.exports = router;
