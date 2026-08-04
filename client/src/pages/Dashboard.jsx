import React, { useState, useEffect, useContext } from 'react';
import { Card } from '../components/ui/Card/Card';
import { Package, Activity, AlertTriangle, Truck, DollarSign, BrainCircuit } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Badge } from '../components/ui/Badge/Badge';
import { DataTable } from '../components/ui/Table/DataTable';
import { AIInsightCard } from '../components/ui/AIInsightCard/AIInsightCard';
import { PageHeader } from '../components/ui/PageHeader/PageHeader';
import { StatusBadge } from '../components/ui/StatusBadge/StatusBadge';
import { Button } from '../components/ui/Button/Button';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const revenueData = [
  { name: 'Jan', value: 4000 },
  { name: 'Feb', value: 3000 },
  { name: 'Mar', value: 5000 },
  { name: 'Apr', value: 4500 },
  { name: 'May', value: 6000 },
  { name: 'Jun', value: 5500 },
];

const complaintData = [
  { name: 'Week 1', value: 12 },
  { name: 'Week 2', value: 8 },
  { name: 'Week 3', value: 15 },
  { name: 'Week 4', value: 5 },
];

export const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [aiInsight, setAiInsight] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);
  
  const [kpis, setKpis] = useState({
    activeOrders: 0,
    inProduction: 0,
    qcPending: 0,
    warehouseDispatches: 0,
    customerComplaints: 0,
    revenue: '$0'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [orderRes, complaintRes] = await Promise.all([
          api.get('/orders'),
          api.get('/complaints')
        ]);
        
        const fetchedOrders = orderRes.data;
        const fetchedComplaints = complaintRes.data;
        
        setOrders(fetchedOrders);
        setComplaints(fetchedComplaints);
        
        let rev = 0;
        fetchedOrders.forEach(o => rev += o.amount);

        const newKpis = {
          activeOrders: fetchedOrders.length,
          inProduction: fetchedOrders.filter(o => o.status === 'Production').length,
          qcPending: fetchedOrders.filter(o => o.status === 'Quality Control').length,
          warehouseDispatches: fetchedOrders.filter(o => o.status === 'Dispatched').length,
          customerComplaints: fetchedComplaints.length,
          revenue: `$${(rev/1000).toFixed(1)}k`
        };
        setKpis(newKpis);

        // Fetch AI Insight based on dashboard data
        if (user) {
          setLoadingAi(true);
          try {
            const aiRes = await api.post('/ai/insights', {
              contextType: 'dashboard',
              role: user.role,
              data: { kpis: newKpis, recentOrders: fetchedOrders.slice(0, 5) }
            });
            if (aiRes.data?.result) setAiInsight(aiRes.data.result);
          } catch (e) {
            console.error("AI Insight fetch failed", e);
          } finally {
            setLoadingAi(false);
          }
        }

      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      }
    };
    
    fetchData();
  }, [user]);

  const recentOrderColumns = [
    { header: 'Order ID', accessor: 'orderNumber' },
    { header: 'Customer', render: (row) => row.customerId?.name || 'Unknown' },
    { header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    { header: 'Date', render: (row) => new Date(row.createdAt).toLocaleDateString() }
  ];

  const pendingApprovalColumns = [
    { header: 'Order ID', accessor: 'orderNumber' },
    { header: 'Customer', render: (row) => row.customerId?.name || 'Unknown' },
    { header: 'Product', accessor: 'productName' },
    { header: 'Qty', accessor: 'quantity' },
    { header: 'Actions', render: (row) => (
      <div className="flex gap-2">
        <Button 
          size="sm"
          onClick={async () => {
            try {
              await api.put(`/orders/${row._id}/status`, { status: 'Production' });
              setOrders(orders.map(o => o._id === row._id ? { ...o, status: 'Production' } : o));
            } catch (e) {
              alert('Failed to approve order');
            }
          }}
        >
          Approve
        </Button>
        <Button 
          variant="danger" 
          size="sm"
          onClick={async () => {
            try {
              await api.put(`/orders/${row._id}/status`, { status: 'Rejected' });
              setOrders(orders.map(o => o._id === row._id ? { ...o, status: 'Rejected' } : o));
            } catch (e) {
              alert('Failed to reject order');
            }
          }}
        >
          Reject
        </Button>
      </div>
    )}
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Dashboard" 
        subtitle="Welcome back, here's what's happening today."
        actionPrimary={
          <Button variant="secondary">
            Download Report
          </Button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { title: 'Active Orders', value: kpis.activeOrders, icon: Package, color: 'text-blue-600', bg: 'bg-blue-100', link: '/journey' },
          { title: 'In Production', value: kpis.inProduction, icon: Activity, color: 'text-indigo-600', bg: 'bg-indigo-100', link: '/journey' },
          { title: 'QC Pending', value: kpis.qcPending, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-100', link: '/journey' },
          { title: 'Dispatches', value: kpis.warehouseDispatches, icon: Truck, color: 'text-green-600', bg: 'bg-green-100', link: '/journey' },
          { title: 'Complaints', value: kpis.customerComplaints, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100', link: '/complaints' },
          { title: 'Revenue', value: kpis.revenue, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-100' },
        ].map((kpi, index) => (
          <Card 
            key={index} 
            className={`p-4 flex flex-col justify-between ${kpi.link ? 'cursor-pointer hover:border-blue-200 hover:bg-gray-50/50' : ''}`}
            onClick={() => kpi.link && navigate(kpi.link)}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm font-medium text-gray-500">{kpi.title}</span>
              <div className={`p-2 rounded-lg ${kpi.bg} ${kpi.color}`}>
                <kpi.icon size={16} />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{kpi.value}</div>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dx={-10} />
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                />
                <Area type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Complaint Trend</h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={complaintData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dx={-10} />
                <Tooltip 
                  cursor={{fill: '#f3f4f6'}}
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                />
                <Bar dataKey="value" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Admin Approval Section */}
      {user?.role === 'Admin' && orders.filter(o => o.status === 'Pending Approval').length > 0 && (
        <Card className="border-amber-200 bg-amber-50/10 p-0 overflow-hidden">
          <div className="p-4 border-b border-amber-100 flex items-center gap-2 bg-amber-50/50">
            <AlertTriangle className="text-amber-600" size={20} />
            <h3 className="text-lg font-semibold text-gray-900">Pending Approvals</h3>
          </div>
          <DataTable 
            columns={pendingApprovalColumns}
            data={orders.filter(o => o.status === 'Pending Approval')}
          />
        </Card>
      )}

      {/* Recent Orders & AI Suggestions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="h-full p-0 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
            </div>
            <DataTable 
              columns={recentOrderColumns}
              data={orders.slice(0, 4)}
            />
          </Card>
        </div>
        
        <div>
          <AIInsightCard insight={aiInsight} isLoading={loadingAi} className="h-full" />
        </div>
      </div>
    </div>
  );
};
