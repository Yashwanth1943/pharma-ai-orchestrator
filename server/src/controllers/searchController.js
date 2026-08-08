const Order = require('../models/Order');
const Complaint = require('../models/Complaint');
const User = require('../models/User');

// Copied from orderController to apply correct visibility
const getOrderRoleStages = (role) => {
  switch (role) {
    case 'Admin':
    case 'Sales Manager':
      return null; 
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
      return null; // filtered by customerId
    default:
      return null;
  }
};

// @desc    Global Search for Orders and Complaints
// @route   GET /api/search?q=query
// @access  Private
const globalSearch = async (req, res) => {
  try {
    const queryStr = req.query.q;
    const role = req.user.role;

    if (!queryStr || queryStr.trim().length === 0) {
      return res.json({ orders: [], complaints: [] });
    }

    const regex = new RegExp(queryStr, 'i');

    // 1. Order Search Criteria
    let orderQuery = {
      $or: [
        { orderNumber: regex },
        { productName: regex }
      ]
    };

    if (role === 'Customer') {
      orderQuery.customerId = req.user._id;
    } else {
      const stages = getOrderRoleStages(role);
      if (stages) {
        orderQuery.status = { $in: stages };
      }
    }

    // 2. Complaint Search Criteria
    let complaintQuery = {
      $or: [
        { complaintNumber: regex },
        { type: regex },
        { description: regex }
      ]
    };

    if (role === 'Customer') {
      complaintQuery.customerId = req.user._id;
    } else if (role !== 'Admin' && role !== 'Service Agent') {
      // Specific departments only see complaints assigned to them
      const departmentRoleMap = {
        'Production Team': 'Production Team',
        'Quality Control (QC)': 'Quality Control (QC)',
        'Quality Assurance (QA)': 'Quality Assurance (QA)',
        'Warehouse': 'Warehouse',
        'Logistics': 'Logistics',
      };
      const deptValue = departmentRoleMap[role];
      if (deptValue) {
        complaintQuery.assignedDepartment = deptValue;
      } else {
        // Fallback for roles that shouldn't see complaints (e.g. some marketing roles if unassigned)
        complaintQuery._id = null; // force empty
      }
    }

    // 3. User Search Criteria (Only for internal staff)
    let userQuery = null;
    if (role !== 'Customer') {
      userQuery = {
        $or: [
          { name: regex },
          { email: regex }
        ]
      };
    }

    // Execute queries in parallel
    const [orders, complaints, users] = await Promise.all([
      Order.find(orderQuery)
        .populate('customerId', 'name')
        .sort({ createdAt: -1 })
        .limit(5), // limit quick search results
      Complaint.find(complaintQuery)
        .populate('customerId', 'name')
        .sort({ createdAt: -1 })
        .limit(5),
      userQuery ? User.find(userQuery).select('-password').limit(5) : Promise.resolve([])
    ]);

    res.json({ orders, complaints, users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { globalSearch };
