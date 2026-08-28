import React, { useState, useEffect, useRef } from "react";
import { Bell, HelpCircle, LogOut, Search, Check, Trash2, ShieldAlert, Cpu, Database, Sprout, X, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import ConfirmDialog from "./ConfirmDialog";
import { fetchNotifications, markNotificationAsRead } from "../services/api";

const TOP_TAB_ITEMS = [
  { name: "Operations Portal", slug: "admin" },
  { name: "Admin Command", slug: "adminCommand" },
];

const getAdminNotificationIcon = (type) => {
  switch (type) {
    case 'alert':
      return { icon: ShieldAlert, color: 'text-red-700 bg-red-100/60' };
    case 'application':
      return { icon: Sprout, color: 'text-emerald-700 bg-emerald-100/60' };
    case 'system':
      return { icon: Cpu, color: 'text-blue-700 bg-blue-100/60' };
    default:
      return { icon: Database, color: 'text-amber-700 bg-amber-100/60' };
  }
};

export default function AdminHeader({ onLogout, onNavigate, activeTabName = "Operations Portal", currentUser, user: userProp }) {
  const { user: authUser } = useAuth();
  const activeUser = currentUser || userProp || authUser;
  const displayName = activeUser?.full_name || activeUser?.fullName || activeUser?.name || "System Admin";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "SA";

  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  useEffect(() => {
    let isMounted = true;
    async function loadRealNotifications() {
      setIsLoading(true);
      try {
        const res = await fetchNotifications("admin");
        if (isMounted && res && res.success && Array.isArray(res.data)) {
          setNotifications(res.data);
        }
      } catch (err) {
        console.warn("Failed to load admin notifications:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadRealNotifications();
    return () => { isMounted = false; };
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationClick = () => {
    setShowDropdown(false);
    if (onNavigate) {
      onNavigate("notifications");
    }
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClearAll = () => {
    setConfirmClearAll(true);
  };

  const handleConfirmClearAll = () => {
    setNotifications([]);
    setConfirmClearAll(false);
  };

  const handleDismissOne = (e, id) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (typeof markNotificationAsRead === "function") {
      markNotificationAsRead(id);
    }
  };

  const handleTabClick = (slug) => {
    if (onNavigate) {
      onNavigate(slug);
    }
  };

  const handleProfileClick = () => {
    if (onNavigate) {
      onNavigate("adminProfile");
    }
  };

  return (
    <>
<header className="h-16 px-6 border-b border-[#222E27] bg-[#16201B] flex items-center justify-between shrink-0 select-none relative z-30 text-[#E6ECE2] shadow-md">
      {/* Generated 3D Farm Landscape Graphic Background Layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div
        className="absolute inset-0 opacity-25 mix-blend-overlay bg-cover bg-center pointer-events-none transition-opacity duration-500"
        style={{ backgroundImage: `url('/3d_farm_header_banner.png')` }}
      />

      {/* 3D Grass Blades Field Edge Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-25 overflow-hidden">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" viewBox="0 0 1000 100">
          <defs>
            <linearGradient id="adminBladeGrad1" x1="0%" y1="100%" x2="50%" y2="0%">
              <stop offset="0%" stopColor="#0B5A22" />
              <stop offset="60%" stopColor="#22C55E" />
              <stop offset="100%" stopColor="#84CC16" />
            </linearGradient>
          </defs>
          <g fill="url(#adminBladeGrad1)">
            <path d="M 0 100 C 14 45 22 25 28 100 C 36 15 44 2 52 100 C 60 35 68 15 76 100 C 84 20 92 8 100 100 C 108 40 116 18 124 100 C 132 25 140 10 148 100 C 156 35 164 12 172 100 C 180 15 188 5 196 100 C 204 40 212 18 220 100 C 228 25 236 10 244 100 C 252 35 260 15 268 100 C 276 10 284 2 292 100 C 300 30 308 12 316 100 C 324 20 332 8 340 100 C 348 40 356 15 364 100 C 372 15 380 5 388 100 C 396 35 404 12 412 100 C 420 25 428 10 436 100 C 444 40 452 18 460 100 C 468 15 476 5 484 100 C 492 30 500 10 508 100 Z" />
          </g>
        </svg>
      </div>

      {/* Luminous Glow Overlays */}
      <div className="absolute -left-10 top-0 w-48 h-full bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
      </div>

      {/* Top Header Tabs: Operations Portal & Admin Command */}
      <div className="flex items-center gap-3 h-full relative z-10">
        {TOP_TAB_ITEMS.map((tab) => {
          const isActive =
            activeTabName === tab.name ||
            (tab.slug === "admin" && (activeTabName === "Operations Portal" || activeTabName === "Overview Dashboard")) ||
            (tab.slug === "adminCommand" && (activeTabName === "Admin Command" || activeTabName === "Command Center"));
          return (
            <button
              key={tab.slug}
              type="button"
              onClick={() => handleTabClick(tab.slug)}
              className={`h-full text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer px-4 ${
                isActive
                  ? "border-[#0B5A22] text-white font-extrabold bg-[#202C25]/50"
                  : "border-transparent text-[#A2ADA0] hover:text-white hover:bg-[#202C25]/20"
              }`}
            >
              <Sprout size={14} className={isActive ? "text-[#0B5A22]" : "text-[#8E9B8B]"} />
              <span>{tab.name}</span>
              {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#0B5A22] shadow-sm" />}
            </button>
          );
        })}
      </div>

      {/* Right Header Search & Account Controls */}
      <div className="flex items-center gap-3 relative z-10">
        <div className="relative hidden sm:block">
          <input
            type="text"
            placeholder="Search system entities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-56 lg:w-64 h-8 pl-8 pr-3 text-xs bg-[#202C25] border border-[#2E3D34] rounded-xl text-[#E6ECE2] placeholder-[#A2ADA0]/70 focus:bg-[#26352D] focus:outline-none focus:border-[#0B5A22] transition-colors"
          />
          <Search size={13} className="absolute left-2.5 top-2.5 text-[#A2ADA0] pointer-events-none" />
        </div>

        {/* Notifications Dropdown */}
        <div ref={dropdownRef} className="relative">
          <button
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            className="relative p-1.5 text-[#A2ADA0] hover:text-white hover:bg-[#202C25] bg-[#1C2822] rounded-xl transition-colors cursor-pointer border border-[#2E3D34]"
            title="System Notifications"
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-600 text-white rounded-full text-[9px] font-extrabold flex items-center justify-center border border-[#16201B] shadow-md animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white text-gray-900 border border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden text-xs animate-scaleUp">
              <div className="px-4 py-3 bg-[#FAFBF5] border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900 text-sm">System Operations Alerts</span>
                  {unreadCount > 0 ? (
                    <span className="bg-red-100 text-red-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                      {unreadCount} Unread
                    </span>
                  ) : (
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      All Clear
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-[11px] font-semibold">
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllRead}
                      className="text-[#0B5A22] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Check size={12} /> Mark read
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAll}
                      className="text-gray-500 hover:text-red-600 flex items-center gap-1 cursor-pointer ml-1"
                    >
                      <Trash2 size={12} /> Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                {isLoading ? (
                  <div className="p-8 text-center space-y-2">
<Loader2 size={22} className="animate-spin text-[#0B5A22] mx-auto" />
                    <p className="text-xs font-bold text-gray-700">Connecting to Infrastructure API...</p>
                    <p className="text-[10px] text-gray-400">Fetching live telemetry & operational system events</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center space-y-2">
                    <Bell size={24} className="text-gray-300 mx-auto" />
                    <p className="font-bold text-gray-700">No active system alerts</p>
                    <p className="text-[11px] text-gray-400">All infrastructure services are operational.</p>
                  </div>
                ) : (
                  notifications.map((item) => {
                    const { icon: IconComponent, color } = getAdminNotificationIcon(item.type);
                    return (
                      <div
                        key={item.id}
                        onClick={handleNotificationClick}
                        className={`p-3.5 flex items-start gap-3 hover:bg-gray-50 transition-colors group relative cursor-pointer ${
                          !item.read ? "bg-emerald-50/30" : ""
                        }`}
                      >
                        <div className={`p-2 rounded-lg shrink-0 ${color}`}>
                          <IconComponent size={15} />
                        </div>
                        <div className="flex-1 min-w-0 pr-4">
                          <div className="flex items-center justify-between gap-1">
                            <p className={`text-xs ${!item.read ? "font-bold text-gray-900" : "font-semibold text-gray-700"}`}>
                              {item.title}
                            </p>
                            <span className="text-[9px] text-gray-400 font-medium shrink-0">{item.time}</span>
                          </div>
                          <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
                            {item.message}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => handleDismissOne(e, item.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-700 p-1 cursor-pointer absolute top-3 right-3"
                          title="Dismiss"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="p-2.5 bg-[#FAFBF5] border-t border-gray-200 text-center">
                <button
                  type="button"
                  onClick={handleNotificationClick}
                  className="text-xs font-bold text-[#0B5A22] hover:underline cursor-pointer"
                >
                  View All Telemetry & Alerts →
                </button>
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => onNavigate && onNavigate("helpSupport")}
          className="p-1.5 hover:bg-[#202C25] bg-[#1C2822] rounded-xl text-[#A2ADA0] hover:text-white transition-colors cursor-pointer border border-[#2E3D34]"
          title="Admin Help & System Documentation"
        >
          <HelpCircle size={16} />
        </button>

        {/* User Account Avatar */}
        <button
          type="button"
          onClick={handleProfileClick}
          className="flex items-center gap-2 pl-2 border-l border-[#222E27] hover:opacity-90 transition-opacity cursor-pointer text-left"
          title={`View Admin Profile (${displayName})`}
        >
          <div className="w-7.5 h-7.5 rounded-xl bg-[#0B5A22] border border-emerald-500/30 text-white flex items-center justify-center text-xs font-extrabold shadow-sm font-mono">
            {initials}
          </div>
          <div className="hidden xl:block text-left text-xs">
<p className="font-bold text-white leading-none">{displayName}</p>
            <p className="text-[10px] text-[#A2ADA0] font-semibold leading-tight mt-0.5">Root Operational</p>
          </div>
        </button>

        {/* Logout Button */}
        <button
          type="button"
          onClick={onLogout}
          className="flex items-center gap-1.5 h-8 px-3 rounded-xl bg-[#202C25] hover:bg-red-600 border border-[#2E3D34] text-xs font-bold text-[#E6ECE2] hover:text-white transition-colors shadow-2xs cursor-pointer"
        >
          <span>Logout</span>
          <LogOut size={13} />
        </button>
      </div>
    </header>

      <ConfirmDialog
        open={confirmClearAll}
        title="Clear All Notifications?"
        message="All admin notifications will be removed. This action cannot be undone."
        confirmLabel="Clear All"
        onConfirm={handleConfirmClearAll}
        onCancel={() => setConfirmClearAll(false)}
      />
    </>
  );
}