import { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card/Card';
import { PageHeader } from '../components/ui/PageHeader/PageHeader';
import { Avatar } from '../components/ui/Avatar/Avatar';
import { Badge } from '../components/ui/Badge/Badge';
import { Mail, Shield, User, MessageCircle } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { useNavigate } from 'react-router-dom';

export const Directory = () => {
  const { user } = useAuth();
  const { setActiveChatUser } = useSocket() || {};
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  useEffect(() => {
    const fetchDirectory = async () => {
      try {
        const response = await api.get('/auth/directory');
        setUsers(response.data);
      } catch (error) {
        console.error('Failed to fetch directory', error);
      } finally {
        setLoading(false);
      }
    };

    if (user && user.role !== 'Customer') {
      fetchDirectory();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (user?.role === 'Customer') {
    return (
      <div className="p-6">
        <Card className="p-8 text-center text-red-600 font-medium">
          Access Denied. Only staff members can view the directory.
        </Card>
      </div>
    );
  }

  const allRoles = ['All', ...new Set(users.map(u => u.role))].sort();

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'All' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Company Directory" 
        subtitle="Find contact information for all staff and customers."
      />

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="relative w-full sm:w-96">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-4 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
          />
        </div>
        <div className="w-full sm:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full sm:w-48 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
          >
            {allRoles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      ) : filteredUsers.length === 0 ? (
        <Card className="p-12 text-center text-gray-500">
          No users found matching your criteria.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredUsers.map(u => (
            <Card key={u._id} className="hover:shadow-md transition-shadow">
              <div className="p-5">
                <div className="flex items-start gap-4">
                  <Avatar name={u.name} size="lg" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-gray-900 truncate">{u.name}</h3>
                    <div className="mt-1 flex items-center gap-1.5 text-sm text-gray-500 truncate">
                      <Mail size={14} className="flex-shrink-0" />
                      <span className="truncate">{u.email}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-5 pt-4 border-t border-gray-100 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                      {u.role === 'Admin' ? <Shield size={14} className="text-red-500" /> : <User size={14} />}
                      <span>Role</span>
                    </div>
                    <Badge variant={
                      u.role === 'Admin' ? 'critical' : 
                      u.role === 'Customer' ? 'neutral' : 'primary'
                    }>
                      {u.role}
                    </Badge>
                  </div>
                  {u._id !== user._id && (
                    <button
                      onClick={() => {
                        setActiveChatUser(u);
                        navigate('/messages');
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-700 rounded-lg text-sm font-medium transition-colors border border-gray-200 hover:border-blue-200"
                    >
                      <MessageCircle size={16} />
                      Message
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
