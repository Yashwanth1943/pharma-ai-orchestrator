import { Table } from '../ui/Table/Table';
import { Badge } from '../ui/Badge/Badge';
import { Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const UserTable = ({ users, onEdit, onDelete }) => {
  const { user } = useAuth();

  return (
    <Table
      headers={['Name', 'Email', 'Role', 'Status', 'Actions']}
      data={users}
      renderRow={(u, idx) => (
        <tr key={u._id || idx} className="hover:bg-gray-50 transition-colors">
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
          <td className="px-6 py-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => onEdit(u)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
              >
                Edit
              </button>
              {u._id !== user._id && (
                <button
                  onClick={() => onDelete(u)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                  title="Delete user"
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          </td>
        </tr>
      )}
    />
  );
};
