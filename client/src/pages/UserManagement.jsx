import { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card/Card';
import { Button } from '../components/ui/Button/Button';
import { Table } from '../components/ui/Table/Table';
import { Badge } from '../components/ui/Badge/Badge';
import { Modal } from '../components/ui/Modal/Modal';
import { Input } from '../components/ui/Input/Input';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { UserPlus, Eye, EyeOff } from 'lucide-react';

export const UserManagement = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editUserId, setEditUserId] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Customer',
    isActive: true
  });
  
  const [loading, setLoading] = useState(false);

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
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (u) => {
    setIsEditMode(true);
    setEditUserId(u._id);
    setFormData({ 
      name: u.name, 
      email: u.email, 
      password: '', // Leave blank to not update
      role: u.role, 
      isActive: u.isActive 
    });
    setShowPassword(false);
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
      fetchUsers(); // Refresh list
    } catch (error) {
      alert(error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} user`);
    } finally {
      setLoading(false);
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500">Create and manage accounts and roles.</p>
        </div>
        <Button onClick={handleOpenAdd} className="flex items-center gap-2">
          <UserPlus size={18} /> Add User
        </Button>
      </div>

      <Card>
        <Table 
          headers={['Name', 'Email', 'Role', 'Status', 'Actions']}
          data={users}
          renderRow={(u, idx) => (
            <tr key={idx} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 font-medium text-gray-900">{u.name}</td>
              <td className="px-6 py-4 text-gray-600">{u.email}</td>
              <td className="px-6 py-4">
                <Badge variant={u.role === 'Admin' ? 'critical' : 'primary'}>
                  {u.role}
                </Badge>
              </td>
              <td className="px-6 py-4">
                <Badge variant={u.isActive ? 'success' : 'neutral'}>
                  {u.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </td>
              <td 
                className="px-6 py-4 text-blue-600 hover:text-blue-800 cursor-pointer text-sm font-medium"
                onClick={() => handleOpenEdit(u)}
              >
                Edit
              </td>
            </tr>
          )}
        />
      </Card>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={isEditMode ? "Edit User" : "Create New User"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <Input 
            label="Email Address"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={isEditMode}
          />
          <Input 
            label={isEditMode ? "New Password (leave blank to keep current)" : "Password"}
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleChange}
            required={!isEditMode}
            rightIcon={showPassword ? EyeOff : Eye}
            onRightIconClick={() => setShowPassword(!showPassword)}
          />
          <div className="flex flex-col gap-1 w-full">
            <label className="text-sm font-medium text-gray-700">Role</label>
            <select 
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full bg-white border border-gray-300 rounded-lg text-sm text-gray-900 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
            >
              <option value="Admin">Admin</option>
              <option value="Production Team">Production Team</option>
              <option value="Quality Control (QC)">Quality Control (QC)</option>
              <option value="Quality Assurance (QA)">Quality Assurance (QA)</option>
              <option value="Warehouse">Warehouse</option>
              <option value="Logistics">Logistics</option>
              <option value="Service Agent">Service Agent</option>
              <option value="Sales Manager">Sales Manager</option>
              <option value="Marketing Manager">Marketing Manager</option>
              <option value="Customer">Customer</option>
            </select>
          </div>
          
          {isEditMode && (
            <div className="flex items-center gap-2 pt-2">
              <input 
                type="checkbox" 
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
              <label htmlFor="isActive" className="text-sm text-gray-700 font-medium">Account is Active</label>
            </div>
          )}
          
          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : isEditMode ? 'Update User' : 'Create User'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
