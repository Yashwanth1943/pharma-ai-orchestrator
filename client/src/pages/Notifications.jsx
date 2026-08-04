import React, { useContext } from 'react';
import { SocketContext } from '../contexts/SocketContext';
import { Card } from '../components/ui/Card/Card';
import { Bell, CheckCircle, AlertTriangle, Package } from 'lucide-react';

export const Notifications = () => {
  const { notifications, markAllAsRead } = useContext(SocketContext) || { notifications: [], markAllAsRead: () => {} };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="text-blue-600" /> Notifications
          </h1>
          <p className="text-gray-500">View all your recent alerts and updates.</p>
        </div>
        <button 
          onClick={markAllAsRead}
          className="text-sm font-medium text-blue-600 bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
        >
          Mark all as read
        </button>
      </div>

      <Card className="p-0 overflow-hidden bg-white border border-gray-200 shadow-sm rounded-xl">
        {notifications.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
              <Bell className="text-gray-300" size={24} />
            </div>
            <h3 className="text-gray-900 font-medium text-lg">You're all caught up!</h3>
            <p className="text-gray-500 mt-1">No new notifications at the moment.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map(notif => {
              const Icon = notif.type === 'success' ? CheckCircle : 
                           notif.type === 'warning' ? AlertTriangle : 
                           Package;
              const color = notif.type === 'success' ? 'text-green-500 bg-green-50' :
                            notif.type === 'warning' ? 'text-amber-500 bg-amber-50' :
                            'text-blue-500 bg-blue-50';
                            
              return (
                <div 
                  key={notif.id} 
                  className={`p-6 flex gap-4 hover:bg-gray-50 transition-colors ${notif.read ? 'opacity-70' : 'bg-blue-50/10'}`}
                >
                  <div className={`p-3 rounded-full h-fit flex-shrink-0 ${color}`}>
                    <Icon size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="text-base font-semibold text-gray-900">{notif.title}</h4>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md font-medium whitespace-nowrap">
                        {new Date(notif.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1 leading-relaxed">{notif.message}</p>
                  </div>
                  {!notif.read && (
                    <div className="flex-shrink-0 flex items-center justify-center">
                      <div className="w-2.5 h-2.5 bg-blue-600 rounded-full"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};
