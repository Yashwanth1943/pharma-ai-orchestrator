import React, { useState, useEffect, useContext } from 'react';
import { Card } from '../components/ui/Card/Card';
import { Button } from '../components/ui/Button/Button';
import { Badge } from '../components/ui/Badge/Badge';
import { Modal } from '../components/ui/Modal/Modal';
import { Input } from '../components/ui/Input/Input';
import { AIWritingAssistant } from '../components/AI/AIWritingAssistant';
import { AIInsightCard } from '../components/ui/AIInsightCard/AIInsightCard';
import { DataTable } from '../components/ui/Table/DataTable';
import { PageHeader } from '../components/ui/PageHeader/PageHeader';
import { StatusBadge } from '../components/ui/StatusBadge/StatusBadge';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import { PackageOpen, AlertTriangle, Plus, Truck, CheckCircle2 } from 'lucide-react';

// Mock product catalog for the demo
const productCatalog = [
  { name: 'Amoxicillin 500mg', price: 15 },
  { name: 'Lisinopril 20mg', price: 25 },
  { name: 'Metformin 1000mg', price: 12 },
  { name: 'Atorvastatin 40mg', price: 30 },
  { name: 'Ibuprofen 800mg', price: 10 }
];

const STAGES = ['Order Received', 'Production', 'Quality Control', 'Quality Assurance', 'Warehouse', 'Dispatched', 'Delivered'];

export const CustomerPortal = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  
  const [aiInsight, setAiInsight] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(true);

  const [trackOrderId, setTrackOrderId] = useState('');
  const [trackedOrder, setTrackedOrder] = useState(null);
  const [trackError, setTrackError] = useState('');

  const [complaintData, setComplaintData] = useState({
    orderId: '',
    type: 'Late Delivery',
    description: '',
    priority: 'Medium',
    assignedDepartment: 'Unassigned'
  });

  const [orderData, setOrderData] = useState({
    productName: productCatalog[0].name,
    quantity: 100
  });

  const handleTrackOrder = () => {
    setTrackError('');
    if (!trackOrderId.trim()) {
      setTrackedOrder(null);
      return;
    }
    const foundOrder = orders.find(o => o.orderNumber === trackOrderId.trim());
    if (foundOrder) {
      setTrackedOrder(foundOrder);
    } else {
      setTrackedOrder(null);
      setTrackError('Order not found. Please check your Order ID.');
    }
  };

  const fetchData = async () => {
    try {
      const [orderRes, complaintRes] = await Promise.all([
        api.get('/orders'),
        api.get('/complaints')
      ]);
      setOrders(orderRes.data);
      setComplaints(complaintRes.data);
      
      // Fetch AI Insight
      setIsAiLoading(true);
      const aiRes = await api.post('/ai/insights', {
        contextType: 'customer_portal',
        data: { activeOrders: orderRes.data.filter(o => o.status !== 'Delivered'), activeComplaints: complaintRes.data.filter(c => c.status !== 'Resolved') },
        role: user.role
      });
      if (aiRes.data?.result) setAiInsight(aiRes.data.result);
      setIsAiLoading(false);
    } catch (error) {
      console.error('Failed to fetch data', error);
      setIsAiLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmitComplaint = async (e) => {
    e.preventDefault();
    try {
      await api.post('/complaints', complaintData);
      setIsComplaintModalOpen(false);
      fetchData();
      setComplaintData({ orderId: '', type: 'Late Delivery', description: '', priority: 'Medium', assignedDepartment: 'Unassigned' });
    } catch (error) {
      alert('Failed to raise complaint');
    }
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    try {
      const product = productCatalog.find(p => p.name === orderData.productName);
      const amount = product.price * orderData.quantity;

      await api.post('/orders', {
        productName: orderData.productName,
        quantity: orderData.quantity,
        amount: amount
      });
      setIsOrderModalOpen(false);
      fetchData();
      setOrderData({ productName: productCatalog[0].name, quantity: 100 });
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to request product');
    }
  };

  const orderColumns = [
    { header: 'Order ID', accessor: 'orderNumber' },
    { header: 'Product', render: (row) => <>{row.productName} <span className="text-gray-400">x{row.quantity}</span></> },
    { header: 'Status', render: (row) => <StatusBadge status={row.status} /> }
  ];

  const complaintColumns = [
    { header: 'ID', accessor: 'complaintNumber' },
    { header: 'Type', accessor: 'type' },
    { header: 'Status', render: (row) => <StatusBadge status={row.status} /> }
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="My Portal" 
        subtitle="Track your orders and manage complaints."
        actionSecondary={
          <Button onClick={() => setIsComplaintModalOpen(true)} variant="secondary" className="text-amber-700 border-amber-200 hover:bg-amber-50">
            <AlertTriangle size={18} /> Raise Complaint
          </Button>
        }
        actionPrimary={
          <Button onClick={() => setIsOrderModalOpen(true)}>
            <Plus size={18} /> Request Product
          </Button>
        }
      />

      <AIInsightCard insight={aiInsight} isLoading={isAiLoading} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="h-full">
          <div className="flex items-center gap-2 mb-4 text-blue-700">
            <PackageOpen size={20} />
            <h3 className="text-lg font-semibold text-gray-900">My Orders</h3>
          </div>
          <DataTable 
            columns={orderColumns} 
            data={orders} 
            emptyTitle="No orders found" 
            emptyDescription="You haven't placed any orders yet." 
          />
        </Card>

        {/* Track Order Section */}
        <Card className="h-full md:col-span-1 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4 text-blue-700">
            <Truck size={20} />
            <h3 className="text-lg font-semibold text-gray-900">Track Order Journey</h3>
          </div>
          
          <div className="flex gap-3 max-w-md mb-6">
            <Input 
              placeholder="Enter Order ID (e.g. ORD-1001)" 
              value={trackOrderId}
              onChange={(e) => setTrackOrderId(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleTrackOrder}>Track</Button>
          </div>

          {trackedOrder && (
            <div className="p-6 bg-gray-50 border border-gray-200 rounded-xl overflow-x-auto">
              <div className="mb-6 flex justify-between items-center">
                <div>
                  <h4 className="font-semibold text-gray-900">{trackedOrder.productName}</h4>
                  <p className="text-sm text-gray-500">Order #{trackedOrder.orderNumber}</p>
                </div>
                <Badge variant={trackedOrder.status === 'Delivered' ? 'success' : 'primary'}>
                  {trackedOrder.status}
                </Badge>
              </div>

              <div className="min-w-[700px] flex items-center justify-between relative mt-8 mb-4">
                {/* Background Line */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 rounded-full z-0"></div>
                
                {/* Progress Line */}
                <div 
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-500 rounded-full z-0 transition-all duration-700 ease-in-out"
                  style={{ width: `${(Math.max(0, STAGES.indexOf(trackedOrder.status)) / (STAGES.length - 1)) * 100}%` }}
                ></div>

                {/* Nodes */}
                {STAGES.map((stage, idx) => {
                  const currentStageIndex = STAGES.indexOf(trackedOrder.status);
                  const isDelivered = trackedOrder.status === 'Delivered';
                  const isCompleted = isDelivered ? true : idx < currentStageIndex;
                  const isCurrent = !isDelivered && idx === currentStageIndex;
                  
                  return (
                    <div key={stage} className="relative z-10 flex flex-col items-center gap-2 group">
                      <div 
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-500 ${
                          isCompleted 
                            ? 'bg-blue-600 text-white shadow-[0_0_0_4px_rgba(37,99,235,0.2)]' 
                            : isCurrent
                            ? 'bg-white border-2 border-blue-500 text-blue-500 shadow-[0_0_0_4px_rgba(37,99,235,0.1)]'
                            : 'bg-white border-2 border-gray-300 text-gray-400'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 size={12} /> 
                        ) : isCurrent ? (
                          <div className="w-2 h-2 rounded-full bg-blue-500" />
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                        )}
                      </div>
                      <span className={`text-[10px] font-medium uppercase tracking-wider absolute top-8 whitespace-nowrap ${
                        isCurrent ? 'text-blue-700' : isCompleted ? 'text-gray-700' : 'text-gray-400'
                      }`}>
                        {stage}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {trackError && (
            <p className="text-sm text-red-600 font-medium">{trackError}</p>
          )}
        </Card>

        <Card className="h-full">
          <div className="flex items-center gap-2 mb-4 text-amber-600">
            <AlertTriangle size={20} />
            <h3 className="text-lg font-semibold text-gray-900">My Complaints</h3>
          </div>
          <DataTable 
            columns={complaintColumns} 
            data={complaints} 
            emptyTitle="No complaints found" 
            emptyDescription="You have no active complaints." 
          />
        </Card>
      </div>

      {/* Complaint Modal */}
      <Modal 
        isOpen={isComplaintModalOpen} 
        onClose={() => setIsComplaintModalOpen(false)}
        title="Raise a Complaint"
      >
        <form onSubmit={handleSubmitComplaint} className="space-y-4">
          <div className="flex flex-col gap-1 w-full">
            <label className="text-sm font-medium text-gray-700">Related Order (Optional)</label>
            <select 
              value={complaintData.orderId}
              onChange={(e) => setComplaintData({...complaintData, orderId: e.target.value})}
              className="w-full bg-white border border-gray-300 rounded-lg text-sm text-gray-900 px-4 py-2"
            >
              <option value="">None</option>
              {orders.map(o => (
                <option key={o._id} value={o._id}>{o.orderNumber} - {o.productName}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1 w-full">
            <label className="text-sm font-medium text-gray-700">Complaint Type</label>
            <select 
              value={complaintData.type}
              onChange={(e) => setComplaintData({...complaintData, type: e.target.value})}
              className="w-full bg-white border border-gray-300 rounded-lg text-sm text-gray-900 px-4 py-2"
            >
              <option value="Late Delivery">Late Delivery</option>
              <option value="Packaging Defect">Packaging Defect</option>
              <option value="Quality Issue">Quality Issue</option>
              <option value="Billing Error">Billing Error</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="flex flex-col gap-1 w-full">
            <label className="text-sm font-medium text-gray-700">Route To (Department)</label>
            <select 
              value={complaintData.assignedDepartment}
              onChange={(e) => setComplaintData({...complaintData, assignedDepartment: e.target.value})}
              className="w-full bg-white border border-gray-300 rounded-lg text-sm text-gray-900 px-4 py-2"
            >
              <option value="Unassigned">I don't know (Auto-route)</option>
              <option value="Production Team">Production Team</option>
              <option value="Quality Control (QC)">Quality Control (QC)</option>
              <option value="Quality Assurance (QA)">Quality Assurance (QA)</option>
              <option value="Warehouse">Warehouse</option>
              <option value="Logistics">Logistics</option>
              <option value="Finance">Finance</option>
            </select>
          </div>

          <div className="flex flex-col gap-1 w-full relative">
            <label className="text-sm font-medium text-gray-700">Description</label>
            <div className="relative">
              <textarea 
                value={complaintData.description}
                onChange={(e) => setComplaintData({...complaintData, description: e.target.value})}
                required
                className="w-full bg-white border border-gray-300 rounded-lg text-sm text-gray-900 px-4 py-2 min-h-[120px] pb-10"
                placeholder="Please describe the issue in detail..."
              />
              <AIWritingAssistant 
                text={complaintData.description} 
                onUpdate={(val) => setComplaintData({...complaintData, description: val})} 
                context={`Customer complaint about ${complaintData.type}`} 
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsComplaintModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Submit Complaint
            </Button>
          </div>
        </form>
      </Modal>

      {/* Order Modal */}
      <Modal 
        isOpen={isOrderModalOpen} 
        onClose={() => setIsOrderModalOpen(false)}
        title="Request Product"
      >
        <form onSubmit={handleSubmitOrder} className="space-y-4">
          <div className="flex flex-col gap-1 w-full">
            <label className="text-sm font-medium text-gray-700">Select Product</label>
            <select 
              value={orderData.productName}
              onChange={(e) => setOrderData({...orderData, productName: e.target.value})}
              className="w-full bg-white border border-gray-300 rounded-lg text-sm text-gray-900 px-4 py-2"
            >
              {productCatalog.map(p => (
                <option key={p.name} value={p.name}>{p.name} (${p.price} per unit)</option>
              ))}
            </select>
          </div>

          <Input 
            label="Quantity (Units)"
            type="number"
            min="1"
            value={orderData.quantity}
            onChange={(e) => setOrderData({...orderData, quantity: Number(e.target.value)})}
            required
          />

          <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg flex justify-between items-center">
            <span className="text-sm font-medium text-blue-800">Estimated Cost:</span>
            <span className="text-lg font-bold text-blue-900">
              ${(productCatalog.find(p => p.name === orderData.productName)?.price || 0) * orderData.quantity}
            </span>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsOrderModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Submit Request
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
