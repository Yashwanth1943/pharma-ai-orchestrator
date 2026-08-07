import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card/Card';
import { Badge } from '../components/ui/Badge/Badge';
import api from '../services/api';
import { Shield, Search, Filter, Calendar } from 'lucide-react';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    action: '',
    entity: '',
    from: '',
    to: ''
  });



  const fetchLogs = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (filters.action) queryParams.append('action', filters.action);
      if (filters.entity) queryParams.append('entity', filters.entity);
      if (filters.from) queryParams.append('from', filters.from);
      if (filters.to) queryParams.append('to', filters.to);

      const response = await api.get(`/audit?${queryParams.toString()}`);
      setLogs(response.data);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'POST': return 'bg-green-100 text-green-800 border-green-200';
      case 'PUT': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'DELETE': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const renderDetails = (details) => {
    if (!details || Object.keys(details).length === 0) {
      return <span className="text-slate-400 italic text-xs">No additional details</span>;
    }
    
    if (typeof details !== 'object') {
      return <span className="text-sm text-slate-700">{String(details)}</span>;
    }

    return (
      <div className="flex flex-wrap gap-2">
        {Object.entries(details).map(([key, value]) => {
          // Format key nicely
          const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim();
          
          return (
            <div key={key} className="flex flex-col bg-white border border-slate-200 rounded p-1.5 shadow-sm min-w-[100px] max-w-[200px]">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider truncate" title={formattedKey}>
                {formattedKey}
              </span>
              <span className="text-xs text-slate-700 font-medium truncate" title={typeof value === 'object' ? JSON.stringify(value) : String(value)}>
                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-500">
            System Audit Logs
          </h1>
          <p className="text-slate-500 mt-1">Immutable record of system activities and changes.</p>
        </div>
        <div className="p-3 bg-slate-100 rounded-full border border-slate-200 shadow-sm">
          <Shield className="w-6 h-6 text-slate-600" />
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm overflow-hidden p-0">
        <div className="bg-slate-50/50 border-b border-slate-100 p-6 pb-4">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 space-y-1">
              <label className="text-xs font-medium text-slate-500">Action</label>
              <select 
                name="action" 
                value={filters.action} 
                onChange={handleFilterChange}
                className="w-full text-sm border-slate-200 rounded-md focus:ring-slate-500 focus:border-slate-500 bg-white shadow-sm h-9 px-3"
              >
                <option value="">All Actions</option>
                <option value="POST">Create (POST)</option>
                <option value="PUT">Update (PUT)</option>
                <option value="DELETE">Delete (DELETE)</option>
              </select>
            </div>
            <div className="flex-1 space-y-1">
              <label className="text-xs font-medium text-slate-500">Entity Type</label>
              <select 
                name="entity" 
                value={filters.entity} 
                onChange={handleFilterChange}
                className="w-full text-sm border-slate-200 rounded-md focus:ring-slate-500 focus:border-slate-500 bg-white shadow-sm h-9 px-3"
              >
                <option value="">All Entities</option>
                <option value="User">User</option>
                <option value="Order">Order</option>
                <option value="Complaint">Complaint</option>
                <option value="Campaign">Campaign</option>
              </select>
            </div>
            <div className="flex-1 space-y-1">
              <label className="text-xs font-medium text-slate-500">From Date</label>
              <div className="relative">
                <input 
                  type="date" 
                  name="from" 
                  value={filters.from} 
                  onChange={handleFilterChange}
                  className="w-full text-sm border-slate-200 rounded-md focus:ring-slate-500 focus:border-slate-500 bg-white shadow-sm h-9 px-3 pl-9"
                />
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>
            <div className="flex-1 space-y-1">
              <label className="text-xs font-medium text-slate-500">To Date</label>
              <div className="relative">
                <input 
                  type="date" 
                  name="to" 
                  value={filters.to} 
                  onChange={handleFilterChange}
                  className="w-full text-sm border-slate-200 rounded-md focus:ring-slate-500 focus:border-slate-500 bg-white shadow-sm h-9 px-3 pl-9"
                />
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>
          </div>
        </div>
        <div className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-medium">Timestamp</th>
                  <th className="px-6 py-4 font-medium">User</th>
                  <th className="px-6 py-4 font-medium">Action</th>
                  <th className="px-6 py-4 font-medium">Entity</th>
                  <th className="px-6 py-4 font-medium">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                      <div className="flex justify-center items-center gap-2">
                        <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                        Loading logs...
                      </div>
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                      No audit logs found matching criteria
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-3 whitespace-nowrap text-slate-600">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-3">
                        <div className="font-medium text-slate-900">{log.userId?.name || 'System'}</div>
                        <div className="text-xs text-slate-500">{log.userRole}</div>
                      </td>
                      <td className="px-6 py-3">
                        <Badge variant="outline" className={getActionColor(log.action)}>
                          {log.action}
                        </Badge>
                      </td>
                      <td className="px-6 py-3">
                        <span className="font-medium text-slate-700">{log.entityType}</span>
                      </td>
                      <td className="px-6 py-3">
                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 max-w-lg">
                          {renderDetails(log.details)}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AuditLogs;
