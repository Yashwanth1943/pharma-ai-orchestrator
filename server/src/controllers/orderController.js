const Order = require('../models/Order');

// Helper to generate unique order numbers safely
const generateOrderNumber = async () => {
  const maxRetries = 5;
  for (let i = 0; i < maxRetries; i++) {
    const count = await Order.countDocuments();
    const candidate = `ORD-${1000 + count + i}`;
    const exists = await Order.findOne({ orderNumber: candidate });
    if (!exists) return candidate;
  }
  // Fallback: use timestamp-based unique ID
  return `ORD-${Date.now()}`;
};

// Role → which order stages they should see
const getRoleStages = (role) => {
  switch (role) {
    case 'Admin':
    case 'Sales Manager':
      return null; // null means all
    case 'Production Team':
      return ['Order Received', 'Production', 'Quality Control'];
    case 'Quality Control (QC)':
      return ['Production', 'Quality Control', 'Quality Assurance'];
    case 'Quality Assurance (QA)':
      return ['Quality Control', 'Quality Assurance', 'Warehouse'];
    case 'Warehouse':
      return ['Quality Assurance', 'Warehouse', 'Dispatched'];
    case 'Logistics':
      return ['Warehouse', 'Dispatched', 'Delivered'];
    case 'Customer':
      return null; // filtered by customerId, not status
    default:
      return null;
  }
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private/Customer
const createOrder = async (req, res) => {
  try {
    const { productName, quantity, amount } = req.body;

    // Only Customers can place orders
    if (req.user.role !== 'Customer') {
      return res.status(403).json({ message: 'Only customers can place orders.' });
    }

    const orderNumber = await generateOrderNumber();

    const order = await Order.create({
      orderNumber,
      customerId: req.user._id,
      productName,
      quantity,
      amount,
      status: 'Pending Approval'
    });

    if (req.io) {
      req.io.emit('new_order', {
        message: `New order placed: ${order.productName} (${order.quantity} units)`,
        order
      });
    }

    res.status(201).json(order);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Order ID conflict. Please try again.' });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders (role-filtered)
// @route   GET /api/orders
// @access  Private
const getOrders = async (req, res) => {
  try {
    let query = {};
    const role = req.user.role;

    if (role === 'Customer') {
      query = { customerId: req.user._id };
    } else {
      const stages = getRoleStages(role);
      if (stages) {
        query = { status: { $in: stages } };
      }
      // If stages is null (Admin, etc.) → fetch all
    }

    const orders = await Order.find(query)
      .populate('customerId', 'name email')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status (strict sequential, role-enforced)
// @route   PUT /api/orders/:id/status
// @access  Private (Department based)
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const role = req.user.role;
    let authorized = false;

    if (role === 'Admin') {
      // Admin can move order to any valid status
      authorized = true;
    } else if (role === 'Production Team') {
      if (order.status === 'Order Received' && status === 'Production') authorized = true;
      if (order.status === 'Production' && status === 'Quality Control') authorized = true;
    } else if (role === 'Quality Control (QC)') {
      if (order.status === 'Quality Control' && status === 'Quality Assurance') authorized = true;
    } else if (role === 'Quality Assurance (QA)') {
      if (order.status === 'Quality Assurance' && status === 'Warehouse') authorized = true;
    } else if (role === 'Warehouse') {
      if (order.status === 'Warehouse' && status === 'Dispatched') authorized = true;
    } else if (role === 'Logistics') {
      if (order.status === 'Dispatched' && status === 'Delivered') authorized = true;
    }

    // Admin-only: approve pending orders
    if (role === 'Admin' && order.status === 'Pending Approval') {
      if (status !== 'Order Received' && status !== 'Rejected') {
        return res.status(400).json({
          message: `Pending orders must be moved to 'Order Received' or 'Rejected'. Got '${status}'.`
        });
      }
      authorized = true;
    }

    if (!authorized) {
      return res.status(403).json({
        message: `Role '${role}' is not authorized to move order from '${order.status}' to '${status}'`
      });
    }

    // Append transition note if provided
    if (req.body.note) {
      order.notes.push({
        message: req.body.note,
        stage: order.status,
        author: req.user.name || role
      });
    }

    order.status = status;
    const updatedOrder = await order.save();

    // Notify the next department
    const targetRoleMap = {
      'Order Received': 'Production Team',
      'Production': 'Production Team',
      'Quality Control': 'Quality Control (QC)',
      'Quality Assurance': 'Quality Assurance (QA)',
      'Warehouse': 'Warehouse',
      'Dispatched': 'Logistics'
    };

    const targetRole = targetRoleMap[status];

    if (targetRole && req.io) {
      req.io.emit('role_turn_pending', {
        targetRole,
        message: `Order ${updatedOrder.orderNumber} is now in ${status}. It is your turn to process it.`,
        order: updatedOrder
      });
    }

    if (status === 'Delivered' && req.io) {
      req.io.emit('order_delivered', {
        customerId: updatedOrder.customerId,
        message: `Your order ${updatedOrder.orderNumber} has been successfully delivered!`,
        order: updatedOrder
      });
    }

    if (req.io) {
      req.io.emit('order_updated', {
        orderId: updatedOrder._id,
        status: updatedOrder.status
      });
    }

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createOrder, getOrders, updateOrderStatus };
