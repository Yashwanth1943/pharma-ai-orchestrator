import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card/Card';
import { DataTable } from '../components/ui/Table/DataTable';
import { PageHeader } from '../components/ui/PageHeader/PageHeader';
import { Badge } from '../components/ui/Badge/Badge';
import api from '../services/api';

export const SystemSettings = () => {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get('/audit');
        setLogs(res.data);
      } catch (error) {
        console.error('Failed to fetch audit logs', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const columns = [
    { header: 'Timestamp', render: (row) => new Date(row.timestamp).toLocaleString() },
    { header: 'Action', render: (row) => (
      <Badge variant={
        row.action === 'POST' ? 'success' : 
        row.action === 'DELETE' ? 'error' : 'primary'
      }>
        {row.action}
      </Badge>
    )},
    { header: 'Entity', accessor: 'entityType' },
    { header: 'User', render: (row) => row.userId?.name || 'System' },
    { header: 'Role', render: (row) => row.userRole || 'System' },
    { header: 'Details', render: (row) => (
      <span className="text-xs text-gray-500 font-mono truncate max-w-[200px] block">
        {row.details?.path || JSON.stringify(row.details)}
      </span>
    )}
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="System Settings & Audit Logs" 
        subtitle="Immutable, append-only log of all critical system actions."
      />

      <Card className="p-0 overflow-hidden border-gray-200">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Audit Trail</h3>
            <p className="text-sm text-gray-500">View mutations made by users across the system.</p>
          </div>
        </div>
        <DataTable 
          columns={columns} 
          data={logs} 
          isLoading={isLoading}
          emptyTitle="No audit logs found"
          emptyDescription="System events will appear here once actions are performed."
        />
      </Card>
    </div>
  );
};
