const express = require('express');
const router = express.Router();
const { getCampaigns, createCampaign, getSegments } = require('../controllers/marketingController');

// All routes should be protected, but for demo we just route them
router.get('/campaigns', getCampaigns);
router.post('/campaigns', createCampaign);
router.get('/segments', getSegments);

module.exports = router;
