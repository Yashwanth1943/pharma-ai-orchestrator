import React, { useContext, useEffect, useState } from 'react';
import { SocketContext } from '../../../contexts/SocketContext';
import { AuthContext } from '../../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Package, AlertTriangle, CheckCircle } from 'lucide-react';

export const ToastContainer = () => {
  const { socket, addNotification } = useContext(SocketContext);
  const { user } = useContext(AuthContext);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    if (!socket || !user) return;

    const handleNewToast = (toastParams) => {
      const id = Date.now().toString() + Math.random().toString(36).substring(7);
      setToasts(prev => [...prev, { id, ...toastParams }]);
      
      // Also save to global notifications history
      addNotification({
        title: toastParams.title,
        message: toastParams.message,
        type: toastParams.type,
        timestamp: new Date()
      });

      // Auto-remove after 5 seconds
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 5000);
    };

    socket.on('new_order', (data) => {
      if (user.role === 'Admin') {
        handleNewToast({ title: 'New Order', message: data.message, type: 'info', icon: Package });
      }
    });

    socket.on('new_complaint', (data) => {
      if (user.role === 'Admin') {
        handleNewToast({ title: 'New Complaint', message: data.message, type: 'warning', icon: AlertTriangle });
      }
    });

    socket.on('role_turn_pending', (data) => {
      if (user.role === 'Admin' || user.role === data.targetRole) {
        handleNewToast({ title: 'Action Required', message: data.message, type: 'success', icon: CheckCircle });
      }
    });

    socket.on('order_delivered', (data) => {
      // Notify the customer who made the order, or the Admin
      if (user._id === data.customerId || user.role === 'Admin') {
        handleNewToast({ title: 'Order Delivered 🎉', message: data.message, type: 'success', icon: Package });
      }
    });

    return () => {
      socket.off('new_order');
      socket.off('new_complaint');
      socket.off('role_turn_pending');
      socket.off('order_delivered');
    };
  }, [socket, user]);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map(toast => {
          const Icon = toast.icon || Bell;
          const bgColors = {
            info: 'bg-blue-50 border-blue-200 text-blue-800',
            warning: 'bg-amber-50 border-amber-200 text-amber-800',
            success: 'bg-green-50 border-green-200 text-green-800',
          };
          const iconColors = {
            info: 'text-blue-500',
            warning: 'text-amber-500',
            success: 'text-green-500',
          };
          
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className={`p-4 rounded-lg border shadow-lg flex items-start gap-3 min-w-[300px] max-w-md ${bgColors[toast.type] || bgColors.info}`}
            >
              <div className={`mt-0.5 ${iconColors[toast.type] || iconColors.info}`}>
                <Icon size={20} />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm">{toast.title}</h4>
                <p className="text-sm opacity-90">{toast.message}</p>
              </div>
              <button 
                onClick={() => removeToast(toast.id)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X size={16} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
