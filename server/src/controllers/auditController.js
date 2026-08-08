const AuditLog = require('../models/AuditLog');

const getAuditLogs = async (req, res) => {
  try {
    const { user, role, action, entity, from, to } = req.query;
    
    let query = {};
    
    if (user) query.userId = user; // assuming user ID is passed
    if (role) query.userRole = role;
    if (action) query.action = action;
    if (entity) query.entityType = entity;
    
    if (from || to) {
      query.timestamp = {};
      if (from) query.timestamp.$gte = new Date(from);
      if (to) query.timestamp.$lte = new Date(to);
    }

    const logs = await AuditLog.find(query)
      .populate('userId', 'name role email')
      .sort({ timestamp: -1 })
      .limit(500); // Limit to prevent overwhelming the browser
      
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

module.exports = {
  getAuditLogs
};
