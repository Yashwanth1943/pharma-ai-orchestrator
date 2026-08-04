export const orders = [
  { id: 'ORD-001', customer: 'Mercy Hospital', status: 'Delivered', date: '2023-10-01', amount: 15000 },
  { id: 'ORD-002', customer: 'Global Pharma', status: 'Production', date: '2023-10-15', amount: 45000 },
  { id: 'ORD-003', customer: 'City Clinic', status: 'Quality Control', date: '2023-10-20', amount: 8500 },
  { id: 'ORD-004', customer: 'National Distributors', status: 'Warehouse', date: '2023-10-22', amount: 120000 },
  { id: 'ORD-005', customer: 'Mercy Hospital', status: 'Order Received', date: '2023-10-25', amount: 12500 },
];

export const complaints = [
  { id: 'CMP-101', customer: 'Mercy Hospital', type: 'Late Delivery', priority: 'High', status: 'Resolved', department: 'Logistics', date: '2023-09-10' },
  { id: 'CMP-102', customer: 'Global Pharma', type: 'Packaging Defect', priority: 'Critical', status: 'In Progress', department: 'Quality Control', date: '2023-10-18' },
  { id: 'CMP-103', customer: 'City Clinic', type: 'Billing Error', priority: 'Medium', status: 'Open', department: 'Finance', date: '2023-10-21' },
];

export const users = [
  { id: 'U-001', name: 'Alice Smith', email: 'alice@pharma.com', role: 'Admin', status: 'Active' },
  { id: 'U-002', name: 'Bob Jones', email: 'bob@pharma.com', role: 'Production Manager', status: 'Active' },
  { id: 'U-003', name: 'Carol White', email: 'carol@pharma.com', role: 'QC Inspector', status: 'Inactive' },
  { id: 'U-004', name: 'Dave Brown', email: 'dave@pharma.com', role: 'Sales Manager', status: 'Active' },
];

export const aiRecommendations = [
  { id: 'AI-1', title: 'Expedite ORD-002', description: 'Global Pharma has a history of critical shortages. Expediting production will improve satisfaction by 15%.', confidence: 92, action: 'Approve' },
  { id: 'AI-2', title: 'Recall Batch #4492', description: 'Similar packaging defects reported in CMP-102. Proactive recall advised to prevent further complaints.', confidence: 85, action: 'Review' },
  { id: 'AI-3', title: 'Re-route Delivery', description: 'Traffic delay predicted for National Distributors delivery. Alternate route saves 2 hours.', confidence: 78, action: 'Accept' },
];

export const kpis = {
  activeOrders: 124,
  inProduction: 45,
  qcPending: 12,
  warehouseDispatches: 38,
  customerComplaints: 5,
  revenue: '$1.2M'
};
