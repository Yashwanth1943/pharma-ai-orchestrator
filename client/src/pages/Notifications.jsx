import { useSocket } from '../contexts/SocketContext';
import { Bell, CheckCircle, AlertTriangle, Package, Trash2, CheckCheck } from 'lucide-react';
import { Card } from '../components/ui/Card/Card';
import { Button } from '../components/ui/Button/Button';
import { PageHeader } from '../components/ui/PageHeader/PageHeader';

export const Notifications = () => {
  const { notifications, markAllAsRead } = useSocket() || { notifications: [], markAllAsRead: () => {} };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type) => {
    switch (type) {
      case 'success': return { Icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50' };
      case 'warning': return { Icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50' };
      default:        return { Icon: Package, color: 'text-blue-500', bg: 'bg-blue-50' };
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        subtitle="Stay informed about orders, complaints, and department updates in real-time."
        actionPrimary={
          unreadCount > 0 ? (
            <Button onClick={markAllAsRead} variant="secondary" className="flex items-center gap-2">
              <CheckCheck size={16} />
              Mark All as Read ({unreadCount})
            </Button>
          ) : null
        }
      />

      <Card className="p-0 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Bell size={28} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-1">No notifications yet</h3>
            <p className="text-sm text-gray-500 max-w-sm">
              You'll be notified here when orders are updated, complaints are raised, or actions are required from your department.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {notifications.map((notif) => {
              const { Icon, color, bg } = getIcon(notif.type);
              return (
                <li
                  key={notif.id}
                  className={`flex items-start gap-4 px-6 py-4 transition-colors ${notif.read ? 'bg-white' : 'bg-blue-50/30'}`}
                >
                  <div className={`flex-shrink-0 w-9 h-9 rounded-full ${bg} flex items-center justify-center mt-0.5`}>
                    <Icon size={17} className={color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900 leading-tight">{notif.title}</p>
                      {!notif.read && (
                        <span className="inline-block w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-0.5 leading-snug">{notif.message}</p>
                    <span className="text-xs text-gray-400 mt-1 block">
                      {new Date(notif.timestamp).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {notifications.length > 0 && (
        <p className="text-xs text-center text-gray-400">
          Showing last {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
};
