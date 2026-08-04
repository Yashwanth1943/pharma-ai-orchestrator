const Campaign = require('../models/Campaign');
const User = require('../models/User');

const getCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find().sort({ createdAt: -1 });
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

const createCampaign = async (req, res) => {
  try {
    const campaign = new Campaign(req.body);
    await campaign.save();
    res.status(201).json(campaign);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

const getSegments = async (req, res) => {
  try {
    // Mock segment generation logic for the enterprise demo
    const segments = [
      { id: 'seg-1', name: 'High-Value Clinics', size: 1450, propensityToBuy: 85, lastEngaged: '2 days ago' },
      { id: 'seg-2', name: 'Churn Risk Distributors', size: 320, propensityToBuy: 12, lastEngaged: '3 weeks ago' },
      { id: 'seg-3', name: 'Recent Complaining Customers', size: 85, propensityToBuy: 45, lastEngaged: 'Yesterday' }
    ];
    res.json(segments);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

module.exports = {
  getCampaigns,
  createCampaign,
  getSegments
};
