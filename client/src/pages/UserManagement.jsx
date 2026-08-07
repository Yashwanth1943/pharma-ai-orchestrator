import { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card/Card';
import { Button } from '../components/ui/Button/Button';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { UserPlus } from 'lucide-react';

import { UserTable } from '../components/users/UserTable';
import { UserFormModal } from '../components/users/UserFormModal';
import { UserDeleteModal } from '../components/users/UserDeleteModal';

export const UserManagement = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editUserId, setEditUserId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null); 
  const [searchQuery, setSearchQuery] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Customer',
    isActive: true
  });

  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/auth/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users', error);
    }
  };

  useEffect(() => {
    if (user && user.role === 'Admin') {
      fetchUsers();
    }
  }, [user]);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleOpenAdd = () => {
    setIsEditMode(false);
    setEditUserId(null);
    setFormData({ name: '', email: '', password: '', role: 'Customer', isActive: true });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (u) => {
    setIsEditMode(true);
    setEditUserId(u._id);
    setFormData({
      name: u.name,
      email: u.email,
      password: '',
      role: u.role,
      isActive: u.isActive
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditMode) {
        await api.put(`/auth/users/${editUserId}`, formData);
      } else {
        await api.post('/auth/users', formData);
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} user`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/auth/users/${deleteConfirm._id}`);
      setDeleteConfirm(null);
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete user');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (user?.role !== 'Admin') {
    return (
      <div className="p-6">
        <Card className="p-8 text-center text-red-600 font-medium">
          Access Denied. Only Admins can view this page.
        </Card>
      </div>
    );
  }

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500">Create and manage accounts and roles. ({users.length} total users)</p>
        </div>
        <Button onClick={handleOpenAdd} className="flex items-center gap-2">
          <UserPlus size={18} /> Add User
        </Button>
      </div>

      <div>
        <input
          type="text"
          placeholder="Search users by name, email, or role..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-sm px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
        />
      </div>

      <Card>
        <UserTable 
          users={filteredUsers} 
          onEdit={handleOpenEdit} 
          onDelete={setDeleteConfirm} 
        />
      </Card>

      <UserFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        formData={formData}
        onChange={handleChange}
        isEditMode={isEditMode}
        loading={loading}
      />

      <UserDeleteModal 
        userToDelete={deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
      />
    </div>
  );
};
