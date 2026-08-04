const express = require('express');
const router = express.Router();
const { raiseComplaint, getComplaints, updateComplaint } = require('../controllers/complaintController');
const { protect } = require('../middleware/authMiddleware');
const auditMiddleware = require('../middleware/auditMiddleware');

router.route('/')
  .post(protect, auditMiddleware('Complaint'), raiseComplaint)
  .get(protect, getComplaints);

router.route('/:id')
  .put(protect, auditMiddleware('Complaint'), updateComplaint);

module.exports = router;
