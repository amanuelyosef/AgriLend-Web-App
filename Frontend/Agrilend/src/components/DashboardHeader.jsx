import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, HelpCircle, LogOut } from 'lucide-react';
import { useAuth } from '../auth/useAuth';

export default function DashboardHeader() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 border-b border-gray-200 bg-white px-8 flex items-center justify-between shrink-0">
      <div className="relative w-96">
        <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
        <input
          type="text"
          placeholder="Search application ID, farmer name, or region..."
          className="w-full bg-[#F4F6F0]/60 border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#1A532E]"
        />
      </div>

      <div className="flex items-center gap-4 text-gray-500">
        <button className="p-1.5 hover:bg-gray-100 rounded-full relative">
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
        </button>
        <button className="p-1.5 hover:bg-gray-100 rounded-full">
          <HelpCircle size={16} />
        </button>
        <div className="h-4 w-px bg-gray-200 mx-1"></div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-xs font-medium text-[#1A532E] hover:text-[#144023] transition-colors"
        >
          Logout <LogOut size={14} />
        </button>
      </div>
    </header>
  );
}
