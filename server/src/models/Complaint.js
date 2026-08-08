const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  complaintNumber: {
    type: String,
    required: true,
    unique: true,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
  },
  type: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium',
  },
  assignedDepartment: {
    type: String,
    enum: [
      'Unassigned',
      'Production Team',
      'Quality Control (QC)',
      'Quality Assurance (QA)',
      'Warehouse',
      'Logistics',
      'Service Agent',
      'Finance'
    ],
    default: 'Unassigned',
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Approved', 'Rejected', 'Resolved', 'Closed'],
    default: 'Open',
  },
  aiSummary: {
    type: String,
  },
  resolution: {
    type: String,
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Complaint', complaintSchema);
