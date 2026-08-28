import React from 'react';
import Sidebar from './Sidebar.jsx';
import DashboardHeader from './DashboardHeader.jsx';

export default function AppLayout({ children }) {
  return (
    <div className="flex h-screen w-screen bg-[#F5F7F2] overflow-hidden font-sans antialiased select-none text-gray-800">
      <Sidebar />
      <div className="flex-1 h-full flex flex-col overflow-y-auto">
        <DashboardHeader />
        {children}
      </div>
    </div>
  );
}
