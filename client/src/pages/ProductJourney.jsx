import { useState, useEffect, useCallback } from 'react';
import { Card } from '../components/ui/Card/Card';
import { Button } from '../components/ui/Button/Button';
import { Modal } from '../components/ui/Modal/Modal';
import { AIWritingAssistant } from '../components/AI/AIWritingAssistant';
import { AIInsightCard } from '../components/ui/AIInsightCard/AIInsightCard';
import { PageHeader } from '../components/ui/PageHeader/PageHeader';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { CheckCircle2, FileText } from 'lucide-react';

export const ProductJourney = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [orders, setOrders] = useState([]);
  const [showCompleted, setShowCompleted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [note, setNote] = useState('');
  const [aiInsight, setAiInsight] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(true);

  const getContextTypeForRole = (role) => {
    if (role === 'Production Team') return 'production';
    if (role === 'Quality Control (QC)' || role === 'Quality Assurance (QA)') return 'quality_control';
    if (role === 'Warehouse' || role === 'Logistics') return 'warehouse_logistics';
    return 'dashboard';
  };

  const fetchOrders = useCallback(async () => {
    try {
      const response = await api.get('/orders');
      setOrders(response.data);
      
      // Fetch AI Insight based on role
      setIsAiLoading(true);
      const aiRes = await api.post('/ai/insights', {
        contextType: getContextTypeForRole(user?.role),
        data: { activeOrders: response.data.filter(o => o.status !== 'Delivered') },
        role: user?.role
      });
      if (aiRes.data?.result) setAiInsight(aiRes.data.result);
      setIsAiLoading(false);
    } catch (error) {
      console.error('Failed to fetch orders', error);
      setIsAiLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    if (!socket) return;
    
    const handleOrderUpdate = () => {
      fetchOrders();
    };

    socket.on('order_updated', handleOrderUpdate);
    socket.on('new_order', handleOrderUpdate);

    return () => {
      socket.off('order_updated', handleOrderUpdate);
      socket.off('new_order', handleOrderUpdate);
    };
  }, [socket, user, fetchOrders]);

  const getAvailableStatuses = (role, currentStatus) => {
    if (currentStatus === 'Delivered') return [];
    if (role === 'Admin') {
      return ['Order Received', 'Production', 'Quality Control', 'Quality Assurance', 'Warehouse', 'Dispatched', 'Delivered'].filter(s => s !== currentStatus);
    }
    if (role === 'Production Team') {
      if (currentStatus === 'Order Received') return ['Production'];
      if (currentStatus === 'Production') return ['Quality Control'];
    }
    if (role === 'Quality Control (QC)') {
      if (currentStatus === 'Quality Control') return ['Quality Assurance'];
    }
    if (role === 'Quality Assurance (QA)') {
      if (currentStatus === 'Quality Assurance') return ['Warehouse'];
    }
    if (role === 'Warehouse') {
      if (currentStatus === 'Warehouse') return ['Dispatched'];
    }
    if (role === 'Logistics') {
      if (currentStatus === 'Dispatched') return ['Delivered'];
    }
    return [];
  };

  const handleOpenModal = (order) => {
    setSelectedOrder(order);
    const statuses = getAvailableStatuses(user?.role, order.status);
    setNewStatus(statuses.length > 0 ? statuses[0] : '');
    setNote('');
    setIsModalOpen(true);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/orders/${selectedOrder._id}/status`, { status: newStatus, note });
      setIsModalOpen(false);
      fetchOrders();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update order status');
    }
  };

  const STAGES = ['Order Received', 'Production', 'Quality Control', 'Quality Assurance', 'Warehouse', 'Dispatched', 'Delivered'];

  // Server already filters orders by role. Client filters 'Delivered' based on toggle.
  const getRoleFilterLabel = (role) => {
    const labels = {
      'Production Team': 'Showing orders in: Order Received, Production',
      'Quality Control (QC)': 'Showing orders in: Quality Control stage',
      'Quality Assurance (QA)': 'Showing orders in: Quality Assurance stage',
      'Warehouse': 'Showing orders in: Warehouse stage',
      'Logistics': 'Showing orders in: Dispatched → Delivered',
    };
    return labels[role] || null;
  };

  const displayedOrders = showCompleted ? orders : orders.filter(o => o.status !== 'Delivered');

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Product Journey" 
        subtitle="Track and update manufacturing and logistics progress."
        actionPrimary={
          <Button variant="secondary" onClick={() => setShowCompleted(!showCompleted)}>
            {showCompleted ? 'Hide Completed' : 'Show Completed'}
          </Button>
        }
      />

      <AIInsightCard insight={aiInsight} isLoading={isAiLoading} />

      {/* Role context indicator */}
      {getRoleFilterLabel(user?.role) && (
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-700 font-medium w-fit">
          <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
          {getRoleFilterLabel(user?.role)}
        </div>
      )}

      <div className="space-y-4">
        {displayedOrders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <h3 className="text-gray-500 font-medium">No active product journeys</h3>
            <p className="text-gray-400 text-sm mt-1">All orders have been delivered.</p>
          </div>
        ) : (
          displayedOrders.map(o => {
            const currentStageIndex = STAGES.indexOf(o.status);
            const canUpdate = getAvailableStatuses(user?.role, o.status).length > 0;

          return (
            <Card key={o._id} className="p-0 overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-gray-900">{o.productName}</h3>
                  <p className="text-xs text-gray-500">Order #{o.orderNumber} • Qty: {o.quantity}</p>
                </div>
                <button 
                  disabled={!canUpdate}
                  onClick={() => handleOpenModal(o)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    canUpdate 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm' 
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Advance Stage
                </button>
              </div>
              
              <div className="p-6 overflow-x-auto">
                <div className="min-w-[700px] flex items-center justify-between relative">
                  {/* Background Line */}
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 rounded-full z-0"></div>
                  
                  {/* Progress Line */}
                  <div 
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-500 rounded-full z-0 transition-all duration-700 ease-in-out"
                    style={{ width: `${(Math.max(0, currentStageIndex) / (STAGES.length - 1)) * 100}%` }}
                  ></div>

                  {/* Nodes */}
                  {STAGES.map((stage, idx) => {
                    const isDelivered = o.status === 'Delivered';
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
            </Card>
          );
        }))}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={`Update Order: ${selectedOrder?.orderNumber}`}
      >
        <form onSubmit={handleUpdateStatus} className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
            <p className="text-sm text-gray-600 mb-1">Product: <span className="font-medium text-gray-900">{selectedOrder?.productName}</span></p>
            <p className="text-sm text-gray-600">Current Status: <span className="font-medium text-gray-900">{selectedOrder?.status}</span></p>
          </div>

          {/* Previous Notes Section */}
          {selectedOrder?.notes && selectedOrder.notes.length > 0 && (
            <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-4 space-y-3 max-h-48 overflow-y-auto">
              <h4 className="text-sm font-semibold text-blue-900 flex items-center gap-2">
                <FileText size={16} /> Previous Transition Notes
              </h4>
              {selectedOrder.notes.slice().reverse().map((n, i) => (
                <div key={i} className="bg-white p-3 rounded shadow-sm border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1 flex justify-between">
                    <span className="font-medium text-blue-700">{n.author}</span>
                    <span>{new Date(n.timestamp).toLocaleDateString()}</span>
                  </p>
                  <p className="text-sm text-gray-800">{n.message}</p>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex flex-col gap-1 w-full mt-4">
            <label className="text-sm font-medium text-gray-700">Advance To</label>
            <select 
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-lg text-sm text-gray-900 px-4 py-2"
              required
            >
              {getAvailableStatuses(user?.role, selectedOrder?.status).map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1 w-full mt-2 relative">
            <label className="text-sm font-medium text-gray-700">Transition Note (Optional)</label>
            <div className="relative">
              <textarea 
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Batch #1024 passed production, please verify packaging seal..."
                className="w-full bg-white border border-gray-300 rounded-lg text-sm text-gray-900 px-4 py-2 min-h-[120px] pb-10"
              />
              <AIWritingAssistant 
                text={note} 
                onUpdate={setNote} 
                context={`Transition note for order advancing to ${newStatus}`} 
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">This note will be visible to the next department.</p>
          </div>
          
          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Confirm Transition
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
