const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { raiseComplaint, getComplaints, updateComplaint } = require('../controllers/complaintController');
const { protect } = require('../middleware/authMiddleware');
const auditMiddleware = require('../middleware/auditMiddleware');

const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }
    res.status(400).json({ errors: errors.array() });
  };
};

router.route('/')
  .post(protect, validate([
    body('type').notEmpty().withMessage('Complaint type is required'),
    body('description').notEmpty().withMessage('Description is required')
  ]), auditMiddleware('Complaint'), raiseComplaint)
  .get(protect, getComplaints);

router.route('/:id')
  .put(protect, auditMiddleware('Complaint'), updateComplaint);

module.exports = router;
