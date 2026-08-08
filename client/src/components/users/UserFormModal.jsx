import { useState } from 'react';
import { Modal } from '../ui/Modal/Modal';
import { Button } from '../ui/Button/Button';
import { Input } from '../ui/Input/Input';
import { Eye, EyeOff } from 'lucide-react';

const ALL_ROLES = [
  'Admin', 'Production Team', 'Quality Control (QC)', 'Quality Assurance (QA)',
  'Warehouse', 'Logistics', 'Service Agent', 'Sales Manager', 'Marketing Manager', 'Customer'
];

export const UserFormModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  formData, 
  onChange, 
  isEditMode, 
  loading 
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit User' : 'Create New User'}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          label="Full Name"
          name="name"
          value={formData.name}
          onChange={onChange}
          required
        />
        <Input
          label="Email Address"
          type="email"
          name="email"
          value={formData.email}
          onChange={onChange}
          required
          disabled={isEditMode}
        />
        <Input
          label={isEditMode ? 'New Password (leave blank to keep current)' : 'Password'}
          type={showPassword ? 'text' : 'password'}
          name="password"
          value={formData.password}
          onChange={onChange}
          required={!isEditMode}
          rightIcon={showPassword ? EyeOff : Eye}
          onRightIconClick={() => setShowPassword(!showPassword)}
        />
        <div className="flex flex-col gap-1 w-full">
          <label className="text-sm font-medium text-gray-700">Role</label>
          <select
            name="role"
            value={formData.role}
            onChange={onChange}
            className="w-full bg-white border border-gray-300 rounded-lg text-sm text-gray-900 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
          >
            {ALL_ROLES.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {isEditMode && (
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={onChange}
              className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
            />
            <label htmlFor="isActive" className="text-sm text-gray-700 font-medium">Account is Active</label>
          </div>
        )}

        <div className="pt-4 flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : isEditMode ? 'Update User' : 'Create User'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
