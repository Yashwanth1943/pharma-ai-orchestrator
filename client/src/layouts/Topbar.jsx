import React, { useContext, useState, useRef, useEffect } from 'react';
import { Menu, Search, Bell, Sparkles, ChevronDown, LogOut, CheckCircle2, AlertTriangle, Package, CheckCircle } from 'lucide-react';
import { Avatar } from '../components/ui/Avatar/Avatar';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { SocketContext } from '../contexts/SocketContext';

export const Topbar = ({ toggleSidebar, toggleAI }) => {
  const { user, logout } = useContext(AuthContext);
  const { notifications, markAllAsRead } = useContext(SocketContext) || { notifications: [], markAllAsRead: () => {} };
  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const unreadCount = notifications ? notifications.filter(n => !n.read).length : 0;

  const handleNotificationsClick = () => {
    setNotificationsOpen(!notificationsOpen);
    setDropdownOpen(false);
    if (!notificationsOpen && unreadCount > 0) {
      markAllAsRead();
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:px-8 z-20">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="md:hidden text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          <Menu size={24} />
        </button>
        <div className="hidden sm:flex items-center relative">
          <Search className="absolute left-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search orders, customers, complaints..."
            className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm w-64 lg:w-96 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative">
          <button 
            onClick={handleNotificationsClick}
            className="relative text-gray-500 hover:text-gray-700 transition-colors p-1"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                {unreadCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-white border border-gray-200 rounded-xl shadow-xl py-2 z-50 overflow-hidden">
              <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
                <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-medium">{notifications.length} Total</span>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-gray-500 text-sm">
                    No notifications yet
                  </div>
                ) : (
                  notifications.map(notif => {
                    const Icon = notif.type === 'success' ? CheckCircle : 
                                 notif.type === 'warning' ? AlertTriangle : 
                                 Package;
                    const color = notif.type === 'success' ? 'text-green-500' :
                                  notif.type === 'warning' ? 'text-amber-500' :
                                  'text-blue-500';
                                  
                    return (
                      <div key={notif.id} className="px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 flex gap-3 items-start transition-colors">
                        <div className={`mt-0.5 ${color}`}>
                          <Icon size={16} />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900 leading-tight">{notif.title}</h4>
                          <p className="text-xs text-gray-600 mt-0.5 line-clamp-2 leading-snug">{notif.message}</p>
                          <span className="text-[10px] text-gray-400 mt-1 block">
                            {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              <div className="px-4 py-2 border-t border-gray-100 bg-gray-50/50 text-center">
                <Link 
                  to="/notifications" 
                  onClick={() => setNotificationsOpen(false)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                >
                  View All Notifications
                </Link>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={toggleAI}
          className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
        >
          <Sparkles size={16} className="text-blue-600" />
          <span className="hidden sm:inline">AI Assistant</span>
        </button>

        <div className="relative">
          <div
            className="flex items-center gap-2 cursor-pointer pl-4 border-l border-gray-200"
            onClick={() => {
              setDropdownOpen(!dropdownOpen);
              setNotificationsOpen(false);
            }}
          >
            <Avatar name={user?.name} size="sm" />
            <div className="hidden sm:block text-sm">
              <p className="font-medium text-gray-700 leading-tight">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-500">{user?.role || 'Role'}</p>
            </div>
            <ChevronDown size={16} className="text-gray-400" />
          </div>

          {dropdownOpen && (
            <div className="absolute right-0 mt-3 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
              <button
                onClick={logout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2 font-medium"
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
