import { Modal } from '../ui/Modal/Modal';
import { Button } from '../ui/Button/Button';
import { AlertTriangle } from 'lucide-react';

export const UserDeleteModal = ({ 
  userToDelete, 
  onClose, 
  onConfirm, 
  loading 
}) => {
  return (
    <Modal
      isOpen={!!userToDelete}
      onClose={onClose}
      title="Delete User"
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-lg">
          <AlertTriangle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-sm font-medium text-red-800">This action cannot be undone.</p>
            <p className="text-sm text-red-700 mt-1">
              You are about to permanently delete <strong>{userToDelete?.name}</strong> ({userToDelete?.email}).
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            disabled={loading}
            onClick={onConfirm}
          >
            {loading ? 'Deleting...' : 'Yes, Delete User'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
