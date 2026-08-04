import { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card/Card';
import { PageHeader } from '../components/ui/PageHeader/PageHeader';
import { DataTable } from '../components/ui/Table/DataTable';
import { Button } from '../components/ui/Button/Button';
import { Badge } from '../components/ui/Badge/Badge';
import { Download } from 'lucide-react';
import api from '../services/api';

export const Reports = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders');
        setOrders(res.data);
      } catch (error) {
        console.error('Failed to fetch orders for report', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleExportCSV = () => {
    if (!orders || orders.length === 0) return;
    
    const headers = ['Order ID', 'Product', 'Batch', 'Quantity', 'Status', 'Delivery Date'];
    const csvContent = [
      headers.join(','),
      ...orders.map(o => {
        const batchNum = o.orderNumber ? `B-${o.orderNumber.replace('ORD-', '')}` : 'N/A';
        const deliveryDate = o.updatedAt ? new Date(o.updatedAt).toLocaleDateString() : 'N/A';
        return `"${o.orderNumber || ''}","${o.productName || ''}","${batchNum}","${o.quantity || ''}","${o.status || ''}","${deliveryDate}"`;
      })
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `pharma_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns = [
    { header: 'Order ID', accessor: 'orderNumber' },
    { header: 'Product', accessor: 'productName' },
    { 
      header: 'Batch', 
      render: (row) => row.orderNumber ? `B-${row.orderNumber.replace('ORD-', '')}` : 'N/A' 
    },
    { header: 'Quantity', accessor: 'quantity' },
    { header: 'Status', render: (row) => (
      <Badge variant={row.status === 'Delivered' ? 'success' : 'primary'}>
        {row.status}
      </Badge>
    )}
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Reports & Analytics Export" 
        subtitle="Generate, view, and export detailed business reports."
        actionPrimary={
          <Button onClick={handleExportCSV} className="flex items-center gap-2">
            <Download size={16} /> Export to CSV
          </Button>
        }
      />

      <Card className="p-0 overflow-hidden border-gray-200">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Current Orders Report</h3>
            <p className="text-sm text-gray-500">Live view of all orders in the system.</p>
          </div>
        </div>
        <DataTable 
          columns={columns} 
          data={orders} 
          isLoading={isLoading}
          emptyTitle="No data available"
        />
      </Card>
    </div>
  );
};
