const express = require('express');
const router = express.Router();
const { getAuditLogs } = require('../controllers/auditController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Only Admin can view audit logs
router.get('/', protect, authorize('Admin'), getAuditLogs);

module.exports = router;
