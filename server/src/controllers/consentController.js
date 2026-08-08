const ConsentPreference = require('../models/ConsentPreference');
const User = require('../models/User');

// @desc    Get all consent preferences
// @route   GET /api/consent
// @access  Private
const getConsents = async (req, res) => {
  try {
    // Get all customers and their consents
    const customers = await User.find({ role: 'Customer' }).select('name email');
    const consents = await ConsentPreference.find();
    
    // Merge data for frontend
    const mergedData = customers.map(customer => {
      const consent = consents.find(c => c.customerId.toString() === customer._id.toString()) || {
        channels: { email: false, sms: false, push: false },
        purposes: { marketing: false, productUpdates: false, research: false }
      };
      return {
        _id: consent._id || null, // null if it doesn't exist yet
        customerId: customer._id,
        customerName: customer.name,
        customerEmail: customer.email,
        channels: consent.channels,
        purposes: consent.purposes,
        notes: consent.notes
      };
    });
    
    res.json(mergedData);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

// @desc    Update consent preferences for a customer
// @route   PUT /api/consent/:id (this is customerId, not consentId)
// @access  Private
const updateConsent = async (req, res) => {
  try {
    const customerId = req.params.id;
    const { channels, purposes, notes } = req.body;
    
    let consent = await ConsentPreference.findOne({ customerId });
    
    if (consent) {
      consent.channels = channels || consent.channels;
      consent.purposes = purposes || consent.purposes;
      consent.notes = notes !== undefined ? notes : consent.notes;
      consent.lastUpdatedBy = req.user._id;
      
      const updatedConsent = await consent.save();
      res.json(updatedConsent);
    } else {
      consent = await ConsentPreference.create({
        customerId,
        channels,
        purposes,
        notes,
        lastUpdatedBy: req.user._id
      });
      res.status(201).json(consent);
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

module.exports = { getConsents, updateConsent };
