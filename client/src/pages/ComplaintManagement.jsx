import { useState, useEffect, useCallback } from 'react';
import { Card } from '../components/ui/Card/Card';
import { Button } from '../components/ui/Button/Button';
import { DataTable } from '../components/ui/Table/DataTable';
import { Badge } from '../components/ui/Badge/Badge';
import { Modal } from '../components/ui/Modal/Modal';
import { AIWritingAssistant } from '../components/AI/AIWritingAssistant';
import { AIInsightCard } from '../components/ui/AIInsightCard/AIInsightCard';
import { PageHeader } from '../components/ui/PageHeader/PageHeader';
import { StatusBadge } from '../components/ui/StatusBadge/StatusBadge';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { BrainCircuit } from 'lucide-react';
import { useSocket } from '../contexts/SocketContext';

export const ComplaintManagement = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [complaints, setComplaints] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  
  const [aiInsight, setAiInsight] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(true);

  const [updateData, setUpdateData] = useState({
    status: '',
    assignedDepartment: '',
    resolution: ''
  });

  const fetchComplaints = useCallback(async () => {
    try {
      const response = await api.get('/complaints');
      setComplaints(response.data);
      
      // Fetch AI Insight
      setIsAiLoading(true);
      const aiRes = await api.post('/ai/insights', {
        contextType: 'complaints',
        data: { complaints: response.data.filter(c => c.status !== 'Resolved') },
        role: user.role
      });
      if (aiRes.data?.result) setAiInsight(aiRes.data.result);
      setIsAiLoading(false);
    } catch (_error) {
      console.error('Failed to fetch complaints', _error);
      setIsAiLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  useEffect(() => {
    if (!socket) return;

    const handleComplaintUpdate = () => {
      fetchComplaints();
    };

    socket.on('complaint_updated', handleComplaintUpdate);
    socket.on('new_complaint', handleComplaintUpdate);

    return () => {
      socket.off('complaint_updated', handleComplaintUpdate);
      socket.off('new_complaint', handleComplaintUpdate);
    };
  }, [socket, fetchComplaints]);

  const openModal = (complaint) => {
    setSelectedComplaint(complaint);
    setUpdateData({
      status: complaint.status,
      assignedDepartment: complaint.assignedDepartment,
      resolution: complaint.resolution || ''
    });
    setIsModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/complaints/${selectedComplaint._id}`, updateData);
      setIsModalOpen(false);
      fetchComplaints();
    } catch (_error) {
      alert('Failed to update complaint');
    }
  };

  const generateAISummary = async () => {
    if (!selectedComplaint) return;
    try {
      const response = await api.post('/ai/insights', {
        contextType: 'complaint',
        data: selectedComplaint
      });
      // Immediately update the complaint in DB with AI summary
      await api.put(`/complaints/${selectedComplaint._id}`, {
        aiSummary: response.data.result
      });
      fetchComplaints();
      
      // Update local state for modal
      setSelectedComplaint({...selectedComplaint, aiSummary: response.data.result});
    } catch (_error) {
      alert('Failed to generate AI summary');
    }
  };

  const columns = [
    { header: 'ID', accessor: 'complaintNumber' },
    { header: 'Customer', render: (row) => row.customerId?.name || 'Unknown' },
    { header: 'Type', accessor: 'type' },
    { header: 'Priority', render: (row) => (
      <Badge variant={row.priority === 'Critical' ? 'critical' : row.priority === 'High' ? 'warning' : 'neutral'}>
        {row.priority}
      </Badge>
    )},
    { header: 'Department', accessor: 'assignedDepartment' },
    { header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    { header: 'Actions', render: (row) => (
      <button 
        onClick={(e) => { e.stopPropagation(); openModal(row); }}
        className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
      >
        {user.role === 'Admin' ? 'Manage' : 'View Details'}
      </button>
    )}
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Complaint Management" 
        subtitle="Track, assign, and resolve customer complaints."
      />

      <AIInsightCard insight={aiInsight} isLoading={isAiLoading} />

      <Card className="p-0 overflow-hidden border-gray-200">
        <DataTable 
          columns={columns} 
          data={complaints} 
          emptyTitle="No complaints found"
          emptyDescription="There are currently no active complaints."
        />
      </Card>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={`Manage Complaint: ${selectedComplaint?.complaintNumber}`}
      >
        {selectedComplaint && (
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
              <p className="text-sm font-medium text-gray-700 mb-1">Description:</p>
              <p className="text-sm text-gray-600">{selectedComplaint.description}</p>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-medium text-blue-800 flex items-center gap-2">
                  <BrainCircuit size={16} /> AI Summary & Recommendation
                </p>
                {user.role === 'Admin' && (
                  <Button type="button" variant="ghost" size="sm" onClick={generateAISummary}>
                    Generate
                  </Button>
                )}
              </div>
              <p className="text-sm text-blue-700">
                {selectedComplaint.aiSummary || 'No AI summary generated yet.'}
              </p>
            </div>

            <div className="flex flex-col gap-1 w-full">
              <label className="text-sm font-medium text-gray-700">Assign Department</label>
              <select 
                value={updateData.assignedDepartment}
                onChange={(e) => setUpdateData({...updateData, assignedDepartment: e.target.value})}
                className="w-full bg-white border border-gray-300 rounded-lg text-sm text-gray-900 px-4 py-2 disabled:bg-gray-100 disabled:text-gray-500"
                disabled={user.role !== 'Admin'}
              >
                <option value="Unassigned">Unassigned</option>
                <option value="Quality Control (QC)">Quality Control (QC)</option>
                <option value="Warehouse">Warehouse</option>
                <option value="Logistics">Logistics</option>
                <option value="Production Team">Production Team</option>
              </select>
            </div>

            <div className="flex flex-col gap-1 w-full">
              <label className="text-sm font-medium text-gray-700">Status</label>
              <select 
                value={updateData.status}
                onChange={(e) => setUpdateData({...updateData, status: e.target.value})}
                className="w-full bg-white border border-gray-300 rounded-lg text-sm text-gray-900 px-4 py-2 disabled:bg-gray-100 disabled:text-gray-500"
                disabled={user.role !== 'Admin'}
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>

            <div className="flex flex-col gap-1 w-full relative">
              <label className="text-sm font-medium text-gray-700">Resolution Notes</label>
              <div className="relative">
                <textarea 
                  value={updateData.resolution}
                  onChange={(e) => setUpdateData({...updateData, resolution: e.target.value})}
                  className="w-full bg-white border border-gray-300 rounded-lg text-sm text-gray-900 px-4 py-2 min-h-[120px] pb-10 disabled:bg-gray-100 disabled:text-gray-500"
                  placeholder="Enter details about how this was resolved..."
                  disabled={user.role !== 'Admin'}
                />
                {user.role === 'Admin' && (
                  <AIWritingAssistant 
                    text={updateData.resolution} 
                    onUpdate={(text) => setUpdateData({...updateData, resolution: text})} 
                    context="Resolution note for a customer complaint" 
                  />
                )}
              </div>
            </div>
            
            <div className="pt-4 flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
                {user.role === 'Admin' ? 'Cancel' : 'Close'}
              </Button>
              {user.role === 'Admin' && (
                <Button type="submit">
                  Save Changes
                </Button>
              )}
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
