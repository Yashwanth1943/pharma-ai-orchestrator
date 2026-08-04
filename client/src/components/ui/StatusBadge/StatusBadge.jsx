
export const StatusBadge = ({ status, className = '' }) => {
  if (!status) return null;

  const getStatusStyles = (status) => {
    const s = status.toLowerCase();
    
    // Delivered / Completed / Resolved
    if (['delivered', 'completed', 'resolved', 'approved'].includes(s)) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    
    // In Progress / Active
    if (['in progress', 'dispatched', 'production', 'quality control', 'quality assurance', 'warehouse'].includes(s)) {
      return 'bg-blue-50 text-blue-700 border-blue-200';
    }
    
    // Warning / Pending
    if (['pending approval', 'open', 'delayed'].includes(s)) {
      return 'bg-amber-50 text-amber-700 border-amber-200';
    }
    
    // Critical / Rejected
    if (['rejected', 'cancelled', 'failed'].includes(s)) {
      return 'bg-red-50 text-red-700 border-red-200';
    }
    
    // Default
    return 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const styles = getStatusStyles(status);

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles} ${className}`}>
      {status}
    </span>
  );
};
