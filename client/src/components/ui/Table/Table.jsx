import React from 'react';

export const Table = ({ headers, data, renderRow }) => {
  return (
    <div className="w-full overflow-x-auto bg-white rounded-xl border border-gray-200 shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            {headers.map((header, index) => (
              <th key={index} className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map((item, index) => renderRow(item, index))}
        </tbody>
      </table>
    </div>
  );
};
