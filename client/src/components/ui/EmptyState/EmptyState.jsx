import React from 'react';
import { FileText } from 'lucide-react';

export const EmptyState = ({ 
  title = 'No Data Available', 
  description = 'There is currently no data to display.', 
  icon: Icon = FileText,
  action
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center border border-dashed border-gray-200 rounded-lg bg-gray-50/30">
      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-4">
        <Icon size={24} />
      </div>
      <h3 className="text-sm font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 max-w-sm mb-4">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};
