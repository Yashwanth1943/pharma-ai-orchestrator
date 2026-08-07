const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { createOrder, getOrders, updateOrderStatus } = require('../controllers/orderController');
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
    body('productName').notEmpty().withMessage('Product name is required'),
    body('quantity').isInt({ gt: 0 }).withMessage('Quantity must be a positive integer'),
    body('amount').isNumeric().withMessage('Amount must be a number')
  ]), auditMiddleware('Order'), createOrder)
  .get(protect, getOrders);

router.route('/:id/status')
  .put(protect, auditMiddleware('Order'), updateOrderStatus);

module.exports = router;
