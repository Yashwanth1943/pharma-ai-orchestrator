const Order = require('../models/Order');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private/Customer
const createOrder = async (req, res) => {
  try {
    const { productName, quantity, amount } = req.body;
    
    // Generate a simple Order ID
    const orderCount = await Order.countDocuments();
    const orderNumber = `ORD-${1000 + orderCount}`;

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
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private (Admins see all, Customers see theirs)
const getOrders = async (req, res) => {
  try {
    let orders;
    
    if (req.user.role === 'Customer') {
      orders = await Order.find({ customerId: req.user._id })
        .populate('customerId', 'name email')
        .sort({ createdAt: -1 });
    } else {
      orders = await Order.find({})
        .populate('customerId', 'name email')
        .sort({ createdAt: -1 });
    }
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Department based)
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Role-based strict sequential validation
    const role = req.user.role;
    let authorized = false;

    if (role === 'Admin') {
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

    if (!authorized) {
      return res.status(403).json({ message: `Role '${role}' is not authorized to move order from '${order.status}' to '${status}'` });
    }

    // Handle Notes
    if (req.body.note) {
      order.notes.push({
        message: req.body.note,
        stage: order.status,
        author: req.user.name || role
      });
    }

    order.status = status;
    const updatedOrder = await order.save();
    
    // Map the new status to the role that needs to act next
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

    // Always emit a generic order update event so clients can refresh their UI
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
