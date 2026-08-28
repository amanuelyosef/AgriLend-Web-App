import React, { useState } from "react";
import { 
  Cpu, 
  FileText, 
  Gauge, 
  LifeBuoy, 
  Building2,
  UserCheck, 
  Settings, 
  SlidersHorizontal, 
  Users, 
  Sprout, 
  ChevronLeft, 
  ChevronRight 
} from "lucide-react";

const sideItems = [
  { label: "Overview Dashboard", icon: Gauge, slug: "admin" },
  { label: "Farmers Queue", icon: UserCheck, slug: "farmersQueue" },
  { label: "Institutional Partners", icon: Building2, slug: "institutionalPartners" },
  { label: "User Management", icon: Users, slug: "userManagement" },
  { label: "Pipeline Monitor", icon: SlidersHorizontal, slug: "pipelineMonitor" },
  { label: "ML Model Performance", icon: Cpu, slug: "mlPerformance" },
  { label: "System Reports", icon: FileText, slug: "reports" },
  { label: "System Settings", icon: Settings, slug: "systemSettings" },
];

export default function AdminSidebar({ currentPage, onNavigate, currentUser, user }) {
  const activeUser = currentUser || user;
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem("admin_sidebar_collapsed") === "true";
    } catch {
      return false;
    }
  });

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("admin_sidebar_collapsed", next ? "true" : "false");
      } catch (err) {
        console.error(err);
      }
      return next;
    });
  };

  const handleNavClick = (slug) => {
    if (onNavigate) {
      onNavigate(slug);
    }
  };

  return (
    <aside 
      className={`${
        isCollapsed ? "w-[72px]" : "w-64"
      } h-full shrink-0 bg-[#16201B] text-[#E6ECE2] flex flex-col border-r border-[#222E27] select-none font-sans transition-all duration-300 ease-in-out`}
    >
      {/* Brand & Technical Header + Collapse Toggle */}
      <div className={`p-4 border-b border-[#222E27] flex items-center justify-between gap-2 ${isCollapsed ? "flex-col justify-center py-5" : ""}`}>
        <div 
          className="flex items-center gap-3 min-w-0 cursor-pointer group"
          onClick={() => handleNavClick("admin")}
          title="AgriLend Admin Technical Command"
        >
          <div className="w-8 h-8 rounded-lg bg-[#0B5A22] text-white flex items-center justify-center shadow-md shrink-0 group-hover:scale-105 transition-transform">
            <Sprout size={18} className="pointer-events-none" />
          </div>
          {!isCollapsed && (
            <div className="truncate">
              <p className="text-base font-bold text-[#F7FAF5] leading-tight tracking-tight truncate">AgriLend Admin</p>
              <p className="text-[10px] font-mono uppercase tracking-widest text-[#899786] mt-0.5 truncate">TECHNICAL COMMAND</p>
            </div>
          )}
        </div>

        {/* Minimize / Expand Toggle Button */}
        <button
          type="button"
          onClick={toggleCollapse}
          className="w-7 h-7 rounded-lg bg-[#202C25] text-gray-400 hover:text-white hover:bg-[#2B3B31] border border-[#2D3E34] flex items-center justify-center transition-all shadow-xs shrink-0 cursor-pointer"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight size={15} className="pointer-events-none" /> : <ChevronLeft size={15} className="pointer-events-none" />}
        </button>
      </div>

      {/* Main Navigation Links */}
      <nav className={`py-3 space-y-1.5 flex-1 overflow-y-auto overflow-x-hidden ${isCollapsed ? "px-2" : "px-3"}`}>
        {sideItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            currentPage === item.slug ||
            (item.slug === "admin" &&
              (currentPage === "riskHeatmap" || currentPage === "riskMap" || currentPage === "heatmap")) ||
            (item.slug === "farmersQueue" && currentPage === "verificationQueue") ||
            (item.slug === "pipelineMonitor" &&
              (currentPage === "adminAddPipeline" || currentPage === "admin-add-pipeline"));
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => handleNavClick(item.slug)}
              title={item.label}
              className={`w-full flex items-center transition-all cursor-pointer relative z-10 ${
                isCollapsed 
                  ? "justify-center h-10 w-10 mx-auto rounded-xl" 
                  : "justify-start gap-3 px-3.5 py-2.5 rounded-lg text-xs"
              } ${
                isActive
                  ? "bg-[#0B5A22] text-white font-bold shadow-md"
                  : "text-[#A2ADA0] hover:bg-[#202C25] hover:text-white font-medium"
              }`}
            >
              <Icon size={18} className={`shrink-0 pointer-events-none ${isActive ? "text-white" : "text-[#8E9B8B]"}`} />
              {!isCollapsed && <span className="truncate pointer-events-none">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* System Quick Links & Profile Footer */}
      <div className={`p-3 border-t border-[#222E27] space-y-1 bg-[#121A16] ${isCollapsed ? "flex flex-col items-center" : ""}`}>
        <button
          type="button"
          onClick={() => handleNavClick("adminProfile")}
          title={`View Profile (${activeUser?.name || activeUser?.fullName || activeUser?.full_name || "System Admin"})`}
          className={`w-full flex items-center gap-2.5 rounded-lg p-2 hover:bg-[#202C25] transition-all text-left cursor-pointer group mb-1 ${
            isCollapsed ? "justify-center" : ""
          }`}
        >
          <div className="w-7 h-7 rounded-full bg-[#0B5A22] border border-emerald-500/40 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
            {((activeUser?.name || activeUser?.fullName || activeUser?.full_name || "ADMIN").split(" ").map(n=>n[0]).join("").toUpperCase().slice(0, 2))}
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white group-hover:text-emerald-400 transition-colors truncate">
                {activeUser?.name || activeUser?.fullName || activeUser?.full_name || "System Admin"}
              </p>
              <p className="text-[9px] font-mono text-emerald-400 uppercase tracking-wider truncate">Root Administrator</p>
            </div>
          )}
        </button>

        <button
          type="button"
          onClick={() => handleNavClick("helpSupport")}
          title="Help & Support Desk"
          className={`w-full flex items-center gap-2 rounded-lg text-[11px] font-medium text-[#A2ADA0] hover:bg-[#202C25] hover:text-white transition-colors cursor-pointer ${
            currentPage === "helpSupport" ? "bg-[#0B5A22] text-white font-bold" : ""
          } ${isCollapsed ? "justify-center h-9 w-9 p-0" : "px-3 py-2"}`}
        >
          <LifeBuoy size={16} className="text-[#8E9B8B] shrink-0 pointer-events-none" />
          {!isCollapsed && <span>Help & Support Desk</span>}
        </button>
      </div>
    </aside>
  );
}