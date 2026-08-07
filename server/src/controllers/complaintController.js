const Complaint = require('../models/Complaint');

// @desc    Raise a new complaint
// @route   POST /api/complaints
// @access  Private/Customer
const raiseComplaint = async (req, res) => {
  try {
    const { orderId, type, description, priority, assignedDepartment } = req.body;

    const count = await Complaint.countDocuments();
    const complaintNumber = `CMP-${1000 + count}`;

    const complaint = await Complaint.create({
      complaintNumber,
      customerId: req.user._id,
      orderId: orderId || undefined,
      type,
      description,
      priority: priority || 'Medium',
      assignedDepartment: assignedDepartment || 'Unassigned',
      status: 'Open'
    });

    if (req.io) {
      req.io.emit('new_complaint', {
        message: `New complaint raised: ${complaint.type}`,
        complaint
      });
    }

    res.status(201).json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all complaints
// @route   GET /api/complaints
// @access  Private
const getComplaints = async (req, res) => {
  try {
    let complaints;
    const role = req.user.role;

    if (role === 'Customer') {
      // Customers only see their own complaints
      complaints = await Complaint.find({ customerId: req.user._id })
        .populate('customerId', 'name email')
        .populate('orderId', 'orderNumber productName')
        .sort({ createdAt: -1 });
    } else if (role === 'Admin') {
      // Admin sees all complaints
      complaints = await Complaint.find({})
        .populate('customerId', 'name email')
        .populate('orderId', 'orderNumber productName')
        .sort({ createdAt: -1 });
    } else if (role === 'Service Agent') {
      // Service Agents see all complaints (they are the front-line support)
      complaints = await Complaint.find({})
        .populate('customerId', 'name email')
        .populate('orderId', 'orderNumber productName')
        .sort({ createdAt: -1 });
    } else {
      // Specific departments see complaints assigned to them
      // The assignedDepartment values in enum match department role names directly
      const departmentRoleMap = {
        'Production Team': 'Production Team',
        'Quality Control (QC)': 'Quality Control (QC)',
        'Quality Assurance (QA)': 'Quality Assurance (QA)',
        'Warehouse': 'Warehouse',
        'Logistics': 'Logistics',
      };
      const deptValue = departmentRoleMap[role];
      if (deptValue) {
        complaints = await Complaint.find({ assignedDepartment: deptValue })
          .populate('customerId', 'name email')
          .populate('orderId', 'orderNumber productName')
          .sort({ createdAt: -1 });
      } else {
        complaints = [];
      }
    }

    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update complaint (Assign / Status)
// @route   PUT /api/complaints/:id
// @access  Private (Admin only)
const updateComplaint = async (req, res) => {
  try {
    // Only Admin can update complaints
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Only administrators can update complaints.' });
    }

    const { status, assignedDepartment, aiSummary, resolution } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    if (status) complaint.status = status;
    if (assignedDepartment !== undefined) complaint.assignedDepartment = assignedDepartment;
    if (aiSummary) complaint.aiSummary = aiSummary;
    if (resolution !== undefined) complaint.resolution = resolution;

    const updatedComplaint = await complaint.save();

    if (req.io) {
      req.io.emit('complaint_updated', {
        message: `Complaint ${updatedComplaint.complaintNumber} is now ${updatedComplaint.status}`,
        complaint: updatedComplaint
      });
    }

    res.json(updatedComplaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { raiseComplaint, getComplaints, updateComplaint };
