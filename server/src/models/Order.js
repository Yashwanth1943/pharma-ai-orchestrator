const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  productName: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: [
      'Pending Approval',
      'Order Received',
      'Rejected',
      'Production',
      'Quality Control',
      'Quality Assurance',
      'Warehouse',
      'Dispatched',
      'Delivered'
    ],
    default: 'Pending Approval',
  },
  amount: {
    type: Number,
    required: true,
  },
  notes: [{
    message: String,
    stage: String,
    author: String,
    timestamp: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
