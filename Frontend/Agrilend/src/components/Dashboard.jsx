import React from 'react';
import Sidebar from './Sidebar';
import DashboardHeader from './DashboardHeader.jsx';
import MetricCards from './MetricCards.jsx';
import RecentApplications from './RecentApplications.jsx';
import BottomMetrics from './BottomMetrics.jsx';
import { Download, Filter, BarChart3, UserPlus } from 'lucide-react';


// Accept onViewDetail from App.jsx so we can forward it to the sidebar
export default function Dashboard({
  currentPage,
  onNavigate,
  onLogout,
  currentUser,
}) {
  return (
    <div className="flex h-screen w-screen bg-[#F9FAF5] overflow-hidden">
      {/* Shared left sidebar across all pages */}
      <Sidebar currentPage={currentPage} onNavigate={onNavigate} onLogout={onLogout} currentUser={currentUser} />


      {/* 2. MAIN SCROLLABLE DASHBOARD CONTENT */}
      <div className="flex-1 h-full flex flex-col overflow-y-auto">
        <DashboardHeader onLogout={onLogout} onNavigate={onNavigate} currentUser={currentUser} />
        
        {/* Main Content Grid Area */}
        <div className="p-6 space-y-6 max-w-[1600px] w-full mx-auto">
          <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-emerald-700">Portfolio Overview</p>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight mt-1">
                Welcome back, {currentUser?.name || currentUser?.fullName || currentUser?.full_name || "Credit Officer"}
              </h1>
              <p className="text-xs text-gray-500 mt-1">Real-time credit analysis and application monitoring.</p>
            </div>


            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onNavigate && onNavigate("registerFarmer")}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0B5A22] hover:bg-[#084519] text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                <UserPlus size={14} /> Register New Farmer
              </button>

              <button
                type="button"
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                <Filter size={14} /> Filters
              </button>
              <button
                type="button"
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                <Download size={14} /> Export
              </button>
              <button
                type="button"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1A532E] text-white text-xs font-semibold hover:bg-[#144023] cursor-pointer"
              >
                <BarChart3 size={14} /> Refresh Metrics
              </button>
            </div>
          </div>

          {/* Top Row Indicators */}
          <MetricCards />

          {/* Recent Applications */}
          <RecentApplications />

          {/* Bottom Performance Logs */}
          <BottomMetrics />
        </div>
      </div>
    </div>
  );
}