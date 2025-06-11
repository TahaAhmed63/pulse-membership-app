
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Calendar, 
  Settings, 
  FileText, 
  DollarSign,
  BarChart3,
  UserPlus,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const menuItems = [
  { icon: Home, label: 'Dashboard', path: '/dashboard' },
  { icon: Users, label: 'Members', path: '/members' },
  { icon: UserPlus, label: 'Add Member', path: '/members/add' },
  { icon: DollarSign, label: 'Payments', path: '/payments' },
  { icon: Calendar, label: 'Attendance', path: '/attendance' },
  { icon: BarChart3, label: 'Plans', path: '/plans' },
  { icon: Settings, label: 'Batches', path: '/batches' },
  { icon: FileText, label: 'Expenses', path: '/expenses' },
  { icon: Users, label: 'Enquiries', path: '/enquiries' },
];

export const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <div className="bg-gradient-to-b from-slate-900 to-slate-800 text-white w-64 min-h-screen flex flex-col">
      {/* Logo and Gym Name */}
      <div className="p-6 border-b border-slate-700">
        <h2 className="text-xl font-bold text-emerald-400">GymManager</h2>
        <p className="text-sm text-slate-300 mt-1">{user?.gym_name || 'Fitness Center'}</p>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 py-6">
        <ul className="space-y-2 px-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-lg'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile and Logout */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-white">{user?.name}</p>
            <p className="text-xs text-slate-400">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center px-4 py-2 text-slate-300 hover:bg-slate-700 hover:text-white rounded-lg transition-colors duration-200"
        >
          <LogOut className="w-4 h-4 mr-3" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};
