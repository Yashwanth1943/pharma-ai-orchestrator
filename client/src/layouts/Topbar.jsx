import { useState, useEffect, useRef } from 'react';
import { Menu, Search, Bell, Sparkles, ChevronDown, LogOut, AlertTriangle, Package, CheckCircle, X, UserCircle } from 'lucide-react';
import { Avatar } from '../components/ui/Avatar/Avatar';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import api from '../services/api';

export const Topbar = ({ toggleSidebar, toggleAI }) => {
  const { user, logout } = useAuth();
  const { notifications, markAllAsRead } = useSocket() || { notifications: [], markAllAsRead: () => {} };
  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ orders: [], complaints: [], users: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  
  const searchRef = useRef(null);
  const notificationsRef = useRef(null);
  const profileRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdowns if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search effect
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ orders: [], complaints: [] });
      setIsSearching(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await api.get(`/search?q=${searchQuery}`);
        setSearchResults(res.data);
      } catch (error) {
        console.error('Search failed', error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSearchClick = (path) => {
    setSearchOpen(false);
    setSearchQuery('');
    navigate(path);
  };

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
        <div className="hidden sm:flex items-center relative" ref={searchRef}>
          <Search className="absolute left-3 text-gray-400" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => { if (searchQuery) setSearchOpen(true); }}
            placeholder="Search orders, customers, complaints..."
            className="pl-10 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm w-64 lg:w-96 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
          />
          {searchQuery && (
            <button 
              onClick={() => { setSearchQuery(''); setSearchOpen(false); }}
              className="absolute right-3 text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          )}

          {searchOpen && searchQuery && (
            <div className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-50">
              {isSearching ? (
                <div className="p-4 text-center text-sm text-gray-500">
                  <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  Searching...
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  {searchResults.orders?.length === 0 && searchResults.complaints?.length === 0 && searchResults.users?.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-500">No results found for "{searchQuery}"</div>
                  ) : (
                    <>
                      {searchResults.users?.length > 0 && (
                        <div>
                          <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                            Users
                          </div>
                          {searchResults.users.map(u => (
                            <div 
                              key={u._id}
                              onClick={() => handleSearchClick('/directory')}
                              className="px-4 py-3 hover:bg-purple-50/50 cursor-pointer border-b border-gray-50 last:border-0 flex items-center gap-3 transition-colors"
                            >
                              <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                                <UserCircle size={16} />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{u.name}</p>
                                <p className="text-xs text-gray-500">{u.email} • {u.role}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {searchResults.orders?.length > 0 && (
                        <div>
                          <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                            Orders
                          </div>
                          {searchResults.orders.map(order => (
                            <div 
                              key={order._id}
                              onClick={() => handleSearchClick(user?.role === 'Customer' ? '/portal' : '/journey')}
                              className="px-4 py-3 hover:bg-blue-50/50 cursor-pointer border-b border-gray-50 last:border-0 flex items-center gap-3 transition-colors"
                            >
                              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                <Package size={16} />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{order.orderNumber}</p>
                                <p className="text-xs text-gray-500">{order.productName} • {order.customerId?.name}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {searchResults.complaints?.length > 0 && (
                        <div>
                          <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100 border-t">
                            Complaints
                          </div>
                          {searchResults.complaints.map(complaint => (
                            <div 
                              key={complaint._id}
                              onClick={() => handleSearchClick(user?.role === 'Customer' ? '/portal' : '/complaints')}
                              className="px-4 py-3 hover:bg-amber-50/50 cursor-pointer border-b border-gray-50 last:border-0 flex items-center gap-3 transition-colors"
                            >
                              <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                                <AlertTriangle size={16} />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{complaint.complaintNumber}</p>
                                <p className="text-xs text-gray-500">{complaint.type} • {complaint.customerId?.name}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative" ref={notificationsRef}>
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

        <div className="relative" ref={profileRef}>
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
