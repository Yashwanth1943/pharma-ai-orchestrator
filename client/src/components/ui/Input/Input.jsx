import React from 'react';

export const Input = ({ label, icon: Icon, rightIcon: RightIcon, onRightIconClick, className = '', ...props }) => {
  return (
    <div className={`flex flex-col gap-1 w-full ${className}`}>
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <div className="relative flex items-center">
        {Icon && <Icon className="absolute left-3 text-gray-400" size={18} />}
        <input
          className={`w-full bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all ${Icon ? 'pl-10' : 'pl-4'} ${RightIcon ? 'pr-10' : 'pr-4'} py-2`}
          {...props}
        />
        {RightIcon && (
          <div className="absolute right-3 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors" onClick={onRightIconClick}>
            <RightIcon size={18} />
          </div>
        )}
      </div>
    </div>
  );
};
