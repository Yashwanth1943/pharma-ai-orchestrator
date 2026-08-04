const express = require('express');
const router = express.Router();
const { createOrder, getOrders, updateOrderStatus } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const auditMiddleware = require('../middleware/auditMiddleware');

router.route('/')
  .post(protect, auditMiddleware('Order'), createOrder)
  .get(protect, getOrders);

router.route('/:id/status')
  .put(protect, auditMiddleware('Order'), updateOrderStatus);

module.exports = router;
