import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  UserPlus,
  UserCheck,
  Map, 
  BarChart3, 
  Settings, 
  Sprout, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({
  currentPage,
  onNavigate,
  onLogout,
  currentUser,
  user: userProp,
}) {
  const { user: authUser } = useAuth();
  const activeUser = currentUser || userProp || authUser;
  const displayName = activeUser?.full_name || activeUser?.name || activeUser?.fullName || "Bank User";
  const displayRole = activeUser?.role_name || (activeUser?.role === "admin" ? "System Admin" : "Credit Analyst");
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "BU";

  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem("bank_sidebar_collapsed") === "true";
    } catch {
      return false;
    }
  });

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("bank_sidebar_collapsed", next ? "true" : "false");
      } catch (err) {
        console.error(err);
      }
      return next;
    });
  };

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, slug: "dashboard" },
    { name: "Loan Applications", icon: FileText, slug: "applications" },
    { name: "Search Farmers", icon: Users, slug: "searchFarmers" },
    { name: "Register Farmer", icon: UserPlus, slug: "registerFarmer" },
    { name: "Portfolio Monitor", icon: BarChart3, slug: "portfolio" },
    { name: "Settings", icon: Settings, slug: "settings" },
  ];

  const handleNavClick = (slug) => {
    if (onNavigate) {
      onNavigate(slug);
    }
  };

  return (
    <div 
      className={`${
        isCollapsed ? "w-[72px]" : "w-64"
      } bg-[#16201B] h-full text-[#E6ECE2] flex flex-col shrink-0 border-r border-[#222E27] select-none font-sans antialiased transition-all duration-300 ease-in-out`}
    >
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {/* Brand Identity Header & Collapse Toggle */}
        <div className={`p-4 border-b border-[#222E27] flex items-center justify-between gap-2 ${isCollapsed ? "flex-col justify-center py-5" : ""}`}>
          <button
            type="button"
            onClick={() => handleNavClick("dashboard")}
            className="flex items-center gap-3 text-left min-w-0 cursor-pointer group"
            title="AgriLend Dashboard"
          >
            <div className="w-8 h-8 rounded-lg bg-[#0B5A22] text-white flex items-center justify-center shadow-sm shrink-0 group-hover:scale-105 transition-transform">
              <Sprout size={18} className="pointer-events-none" />
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <span className="text-base font-bold text-white tracking-wide block leading-tight truncate">AgriLend</span>
                <p className="text-[10px] text-[#A2ADA0] tracking-wider font-semibold uppercase mt-0.5 truncate">Credit Analyst Portal</p>
              </div>
            )}
          </button>

          {/* Minimize / Expand Toggle Button */}
          <button
            type="button"
            onClick={toggleCollapse}
            className="w-7 h-7 rounded-lg bg-[#202C25] text-[#A2ADA0] hover:text-white border border-[#2E3D34] flex items-center justify-center transition-all shadow-xs shrink-0 cursor-pointer"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight size={15} className="pointer-events-none" /> : <ChevronLeft size={15} className="pointer-events-none" />}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className={`py-3 space-y-1.5 ${isCollapsed ? "px-2" : "px-3"}`}>
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = currentPage === item.slug;

            return (
              <button
                key={index}
                type="button"
                onClick={() => handleNavClick(item.slug)}
                title={item.name}
                className={`w-full flex items-center transition-all cursor-pointer relative z-10 ${
                  isCollapsed 
                    ? "justify-center h-10 w-10 mx-auto rounded-xl" 
                    : "justify-start gap-3 px-3.5 py-2.5 rounded-lg text-xs"
                } ${
                  isActive
                    ? 'bg-[#0B5A22] text-white font-bold shadow-md'
                    : 'text-[#A2ADA0] hover:bg-[#202C25] hover:text-white font-medium'
                }`}
              >
                <Icon size={18} className={`shrink-0 pointer-events-none ${isActive ? "text-white" : "text-[#8E9B8B]"}`} />
                {!isCollapsed && <span className="truncate pointer-events-none">{item.name}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Account Footer Block */}
      <div className={`p-3 border-t border-[#222E27] bg-[#121A16] flex items-center ${isCollapsed ? "flex-col justify-center py-4" : "justify-between gap-3 p-4"}`}>
        <div 
          onClick={() => handleNavClick("profile")}
          className="flex items-center gap-3 min-w-0 cursor-pointer group"
          title={`View Profile (${displayName})`}
        >
          <div className="w-8 h-8 rounded-full bg-[#0B5A22] flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-sm group-hover:ring-2 group-hover:ring-emerald-400/50 transition-all">
            {initials}
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white group-hover:text-emerald-400 transition-colors truncate">{displayName}</p>
              <p className="text-[10px] text-[#A2ADA0] truncate">
                {activeUser?.bank_name ? `${activeUser.bank_name} · ${displayRole}` : displayRole}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}