import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, UsersRound, Truck,
  MessageSquareWarning, BarChart3, Bell,
  FileClock, Settings, UserCircle,
  ClipboardList, ShieldCheck, Activity, MessageSquare
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { Logo } from '../components/ui/Logo/Logo';

export const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user } = useAuth();
  const { unreadChatCount } = useSocket() || {};

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['Admin', 'Production Team', 'Quality Control (QC)', 'Quality Assurance (QA)', 'Warehouse', 'Logistics', 'Service Agent', 'Sales Manager', 'Marketing Manager'] },
    { name: 'My Portal', path: '/portal', icon: UserCircle, roles: ['Customer'] },
    { name: 'Product Journey', path: '/journey', icon: Truck, roles: ['Admin', 'Production Team', 'Quality Control (QC)', 'Quality Assurance (QA)', 'Warehouse', 'Logistics'] },
    { name: 'Marketing & Outreach', path: '/marketing', icon: UsersRound, roles: ['Admin', 'Marketing Manager', 'Sales Manager'] },
    { name: 'Predictive Analytics', path: '/analytics', icon: BarChart3, roles: ['Admin', 'Marketing Manager', 'Sales Manager'] },
    { name: 'Reports', path: '/reports', icon: FileClock, roles: ['Admin', 'Marketing Manager', 'Sales Manager', 'Quality Assurance (QA)'] },
    { name: 'Directory', path: '/directory', icon: Users, roles: ['Admin', 'Production Team', 'Quality Control (QC)', 'Quality Assurance (QA)', 'Warehouse', 'Logistics', 'Service Agent', 'Sales Manager', 'Marketing Manager'] },
    { name: 'Messages', path: '/messages', icon: MessageSquare, roles: ['Admin', 'Production Team', 'Quality Control (QC)', 'Quality Assurance (QA)', 'Warehouse', 'Logistics', 'Service Agent', 'Sales Manager', 'Marketing Manager'], badge: unreadChatCount > 0 ? unreadChatCount : null },
    { name: 'User Management', path: '/users', icon: Users, roles: ['Admin'] },
    { name: 'Complaints', path: '/complaints', icon: MessageSquareWarning, roles: ['Admin', 'Service Agent', 'Quality Control (QC)', 'Production Team', 'Warehouse', 'Logistics'] },
    { name: 'Audit Logs', path: '/audit', icon: ClipboardList, roles: ['Admin'] },
    { name: 'Consent & Recs', path: '/consent', icon: ShieldCheck, roles: ['Admin', 'Marketing Manager'] },
    { name: 'AI Outcomes', path: '/outcomes', icon: Activity, roles: ['Admin', 'Marketing Manager', 'Sales Manager'] },
    { name: 'System Settings', path: '/settings', icon: Settings },
    { name: 'Notifications', path: '/notifications', icon: Bell },
  ];

  const filteredMenuItems = menuItems.filter(item =>
    !item.roles || (user && item.roles.includes(user.role))
  );

  return (
    <aside className={`fixed inset-y-0 left-0 bg-white border-r border-gray-200 w-64 transform transition-transform duration-200 ease-in-out z-30 ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:inset-0`}>
      <div className="flex items-center gap-2 h-16 border-b border-gray-200 px-4">
        <Logo size={24} />
        <h1 className="text-lg font-bold text-blue-600 truncate">Pharma AI</h1>
      </div>
      <nav className="p-4 space-y-1">
        {filteredMenuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            onClick={() => setIsOpen?.(false)}
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <div className="flex items-center gap-3">
              <item.icon size={20} />
              <span>{item.name}</span>
            </div>
            {item.badge && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
