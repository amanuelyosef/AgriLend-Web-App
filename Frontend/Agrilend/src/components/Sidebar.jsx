import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Users, Map, BarChart3, Settings } from 'lucide-react';
import { useAuth } from '../auth/useAuth';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Loan Applications', icon: FileText, path: '/applications' },
    { name: 'Search Farmers', icon: Users, path: '/farmers' },
    { name: 'Risk Heatmap', icon: Map, path: '/heatmap' },
    { name: 'Portfolio Monitor', icon: BarChart3, path: '/portfolio' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  const initials = user?.full_name
    ? user.full_name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'AR';

  return (
    <div className="w-64 bg-[#212925] h-full text-gray-300 flex flex-col shrink-0 border-r border-gray-800/40 select-none">
      <div className="flex-1">
        <div className="p-6">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-left"
          >
            <span className="text-xl">🚜</span>
            <span className="text-lg font-bold text-[#4ade80] tracking-wide">AgriLend</span>
          </button>
          <p className="text-[10px] text-gray-500 mt-0.5 tracking-wider font-semibold uppercase">Credit Analyst Portal</p>
        </div>

        <nav className="px-4 py-2 space-y-1">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <button
                key={index}
                type="button"
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs transition-all ${
                  isActive
                    ? 'bg-[#1A532E]/20 text-[#4ade80] border-l-4 border-[#1A532E] font-semibold'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white font-medium'
                }`}
              >
                <Icon size={16} />
                {item.name}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-gray-800/60 bg-[#1b1e1c] flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center font-bold text-xs text-white">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-white truncate">{user?.full_name || 'User'}</p>
          <p className="text-[10px] text-gray-500 truncate">{user?.role_name || 'Analyst'}</p>
        </div>
      </div>
    </div>
  );
}
