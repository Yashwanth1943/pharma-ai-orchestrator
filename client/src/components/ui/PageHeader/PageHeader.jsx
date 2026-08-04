import React from 'react';

export const PageHeader = ({ title, subtitle, actionPrimary, actionSecondary, breadcrumbs }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
      <div>
        {breadcrumbs && (
          <nav className="text-sm text-gray-500 mb-1 flex items-center gap-2">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={index}>
                <span className={crumb.href ? 'hover:text-gray-900 cursor-pointer transition-colors' : 'text-gray-900 font-medium'}>
                  {crumb.label}
                </span>
                {index < breadcrumbs.length - 1 && <span>/</span>}
              </React.Fragment>
            ))}
          </nav>
        )}
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h1>
        {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        {actionSecondary}
        {actionPrimary}
      </div>
    </div>
  );
};
