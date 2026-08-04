import { LoadingSkeleton } from '../LoadingSkeleton/LoadingSkeleton';
import { EmptyState } from '../EmptyState/EmptyState';

export const DataTable = ({ 
  columns, 
  data, 
  isLoading, 
  emptyTitle = 'No records found', 
  emptyDescription = 'There are no records to display at this time.',
  onRowClick
}) => {
  if (isLoading) {
    return (
      <div className="w-full">
        <LoadingSkeleton type="table" rows={5} />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full text-left text-sm text-gray-700">
        <thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-gray-200">
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} className={`px-4 py-3 ${col.className || ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {data.map((row, rowIndex) => (
            <tr 
              key={rowIndex} 
              onClick={() => onRowClick && onRowClick(row)}
              className={`group transition-colors ${onRowClick ? 'cursor-pointer hover:bg-gray-50/80' : ''}`}
            >
              {columns.map((col, colIndex) => (
                <td key={colIndex} className={`px-4 py-3 ${col.cellClassName || ''}`}>
                  {col.accessor ? row[col.accessor] : col.render ? col.render(row) : null}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
