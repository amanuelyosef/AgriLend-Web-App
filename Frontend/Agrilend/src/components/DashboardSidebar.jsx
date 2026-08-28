import React from 'react';
import Sidebar from "./Sidebar";
import { LayoutDashboard, FileText, Users, Map, BarChart3, Settings } from 'lucide-react';

export default function DashboardSidebar({
  currentPage,
  onNavigate,
  onLogout,
}) {
  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, active: true, slug: 'dashboard' },
    { name: 'Loan Applications', icon: FileText, active: false, slug: 'applications' },
    { name: 'Search Farmers', icon: Users, active: false, slug: 'search' },
    { name: 'Risk Heatmap', icon: Map, active: false, slug: 'heatmap' },
    { name: 'Portfolio Monitor', icon: BarChart3, active: false, slug: 'monitor' },
    { name: 'Settings', icon: Settings, active: false, slug: 'settings' },
  ];

  return (
    <div className="flex flex-col h-screen">
         <Sidebar
  currentPage={currentPage}
  onNavigate={onNavigate}
  onLogout={onLogout}
/>

      {/* Analyst Account Footer Block */}
      <div className="p-4 border-t border-gray-800/60 bg-[#1b1e1c] flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center font-bold text-xs text-white">
          AR
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-white truncate">Alex Rivers</p>
          <p className="text-[10px] text-gray-500 truncate">Senior Analyst</p>
        </div>
      </div>
    </div>
  );
}