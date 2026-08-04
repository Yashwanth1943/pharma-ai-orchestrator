
export const Card = ({ children, className = '', ...props }) => {
  return (
    <div className={`bg-white border border-gray-200 rounded-xl shadow-sm p-6 transition-shadow hover:shadow-md ${className}`} {...props}>
      {children}
    </div>
  );
};
