import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import DashboardHeader from "./DashboardHeader";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import ConfirmDialog from "./ConfirmDialog";
import { fetchNotifications, markNotificationAsRead } from "../services/api";
import { 
  Bell, 
  ShieldAlert, 
  Sprout, 
  Cpu, 
  Building2, 
  Check, 
  Trash2, 
  Filter, 
  Loader2, 
  CheckCircle2, 
  Clock, 
  Search,
  ArrowRight,
  Database,
  UserCheck,
  Server
} from "lucide-react";

export default function NotificationsPage({ currentPage, onNavigate, onLogout, userRole = "bank", currentUser, user }) {
  const activeUser = currentUser || user;
  const isAdmin = userRole === "admin";
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmClearAll, setConfirmClearAll] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadNotifications() {
      setIsLoading(true);
      const res = await fetchNotifications(isAdmin ? "admin" : "bank");
      if (isMounted && res.success && Array.isArray(res.data)) {
        setNotifications(res.data);
      }
      if (isMounted) setIsLoading(false);
    }
    loadNotifications();
    return () => { isMounted = false; };
  }, [isAdmin]);

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

  const handleToggleRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
    markNotificationAsRead(id);
  };

  const handleDeleteOne = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const filteredNotifications = notifications.filter((item) => {
    const matchesCategory =
      filterCategory === "all"
        ? true
        : filterCategory === "unread"
        ? !item.read
        : item.type === filterCategory;

    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.message.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;
  const alertCount = notifications.filter((n) => n.type === "alert").length;
  const appCount = notifications.filter((n) => n.type === "application" || n.type === "partner").length;
  const sysCount = notifications.filter((n) => n.type === "system").length;

  const getCategoryBadge = (type) => {
    switch (type) {
      case "alert":
        return { label: "Climate Shock Alert", style: "bg-red-50 text-red-700 border-red-200", icon: ShieldAlert };
      case "application":
        return { label: "Loan Application", style: "bg-emerald-50 text-emerald-800 border-emerald-200", icon: Sprout };
      case "system":
        return { label: isAdmin ? "System Infrastructure" : "GEE AI Model", style: "bg-blue-50 text-blue-800 border-blue-200", icon: Cpu };
      case "partner":
        return { label: "Partner Bank Webhook", style: "bg-purple-50 text-purple-800 border-purple-200", icon: Database };
      default:
        return { label: "System Telemetry", style: "bg-amber-50 text-amber-800 border-amber-200", icon: Building2 };
    }
  };

  return (
    <div className="flex h-screen w-screen bg-[#F5F7F2] overflow-hidden">
      {isAdmin ? (
        <AdminSidebar activeTab="admin" onNavigate={onNavigate} onLogout={onLogout} currentUser={activeUser} />
      ) : (
        <Sidebar currentPage={currentPage} onNavigate={onNavigate} onLogout={onLogout} currentUser={activeUser} />
      )}

      <div className="flex-1 h-full flex flex-col overflow-y-auto">
        {isAdmin ? (
          <AdminHeader onLogout={onLogout} onNavigate={onNavigate} activeTabName="Operations Portal" currentUser={activeUser} />
        ) : (
          <DashboardHeader showBack onBack={() => onNavigate("dashboard")} backText="Back to Dashboard" onLogout={onLogout} onNavigate={onNavigate} currentUser={activeUser} />
        )}


        <div className="p-6 space-y-6 max-w-[1400px] w-full mx-auto">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold tracking-[0.25em] uppercase ${isAdmin ? "text-blue-700" : "text-emerald-700"}`}>
                  {isAdmin ? "Admin System Operations" : "Bank Portfolio Telemetry"}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isAdmin ? "bg-blue-100 text-blue-800" : "bg-emerald-100 text-emerald-800"}`}>
                  {isAdmin ? "Root Channel" : "Analyst Channel"}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight mt-1">
                {isAdmin ? "System Infrastructure Alerts" : "Bank Portfolio & Risk Notifications"}
              </h1>
              <p className="text-xs text-gray-500 mt-1">
                {isAdmin
                  ? "Monitor FastAPI microservice uptime, Earth Engine data pipelines, and partner bank webhooks."
                  : "Monitor farmer loan submissions, satellite biomass anomalies, and credit risk evaluations."}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-emerald-300 bg-emerald-50 text-[#1A532E] text-xs font-bold hover:bg-emerald-100 transition-all cursor-pointer"
                >
                  <Check size={14} /> Mark All as Read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-600 text-xs font-semibold hover:bg-red-50 hover:text-red-600 transition-all cursor-pointer"
                >
                  <Trash2 size={14} /> Clear All
                </button>
              )}
            </div>
          </div>

          {/* Role Specific Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  {isAdmin ? "System Logs" : "Total Alerts"}
                </p>
                <Bell size={16} className="text-gray-400" />
              </div>
              <p className="text-2xl font-extrabold text-gray-900 mt-2">{notifications.length}</p>
              <p className="text-[11px] text-gray-500 mt-1">{isAdmin ? "Infrastructure telemetry events" : "Session alerts"}</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Unread Stream</p>
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              </div>
              <p className="text-2xl font-extrabold text-red-600 mt-2">{unreadCount}</p>
              <p className="text-[11px] text-gray-500 mt-1">{isAdmin ? "Unreviewed system events" : "Requires analyst action"}</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  {isAdmin ? "Microservice Telemetry" : "Climate Risk Shocks"}
                </p>
                {isAdmin ? <Cpu size={16} className="text-blue-600" /> : <ShieldAlert size={16} className="text-red-500" />}
              </div>
              <p className="text-2xl font-extrabold text-gray-900 mt-2">{isAdmin ? sysCount : alertCount}</p>
              <p className="text-[11px] text-gray-500 mt-1">{isAdmin ? "FastAPI & GEE nodes" : "Biomass & NDVI anomalies"}</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  {isAdmin ? "Partner Webhooks" : "Loan Applications"}
                </p>
                {isAdmin ? <Database size={16} className="text-purple-600" /> : <Sprout size={16} className="text-emerald-600" />}
              </div>
              <p className="text-2xl font-extrabold text-gray-900 mt-2">{appCount}</p>
              <p className="text-[11px] text-gray-500 mt-1">{isAdmin ? "API endpoint executions" : "New farmer credit requests"}</p>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden">
            {/* Filter Tabs & Search Bar */}
            <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: "all", label: "All Events" },
                  { id: "unread", label: `Unread (${unreadCount})` },
                  ...(isAdmin
                    ? [
                        { id: "system", label: "Infrastructure Telemetry" },
                        { id: "partner", label: "Partner API Webhooks" },
                      ]
                    : [
                        { id: "alert", label: "Climate Shocks" },
                        { id: "application", label: "Loan Requests" },
                        { id: "system", label: "GEE Telemetry" },
                      ]),
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setFilterCategory(tab.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      filterCategory === tab.id
                        ? "bg-[#1A532E] text-white shadow-xs"
                        : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="relative w-full md:w-64">
                <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search stream notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1A532E]"
                />
              </div>
            </div>

            {/* Notification Stream List */}
            <div className="divide-y divide-gray-100">
              {isLoading ? (
                <div className="p-12 text-center space-y-3">
                  <Loader2 size={26} className="animate-spin text-[#1A532E] mx-auto" />
                  <p className="text-xs font-bold text-gray-800">
                    Connecting to AgriLend {isAdmin ? "Infrastructure API" : "Portfolio API"}...
                  </p>
                  <p className="text-[11px] text-gray-400">Loading live role-tailored telemetry feed</p>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#1A532E] flex items-center justify-center mx-auto">
                    <CheckCircle2 size={24} />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900">No Stream Notifications Found</h3>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">
                    No active telemetry entries match your search criteria. Infrastructure pipelines and regional portfolio clusters are operate normally.
                  </p>
                </div>
              ) : (
                filteredNotifications.map((item) => {
                  const badge = getCategoryBadge(item.type);
                  const BadgeIcon = badge.icon;
                  return (
                    <div
                      key={item.id}
                      className={`p-5 flex items-start gap-4 transition-all hover:bg-gray-50/80 ${
                        !item.read ? "bg-emerald-50/20 font-medium" : ""
                      }`}
                    >
                      <div className={`p-2.5 rounded-xl border shrink-0 ${badge.style}`}>
                        <BadgeIcon size={18} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <h4 className={`text-xs ${!item.read ? "font-bold text-gray-900" : "font-semibold text-gray-800"}`}>
                              {item.title}
                            </h4>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badge.style}`}>
                              {badge.label}
                            </span>
                            {!item.read && (
                              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-gray-400">
                            <Clock size={12} />
                            <span>{item.time}</span>
                          </div>
                        </div>

                        <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
                          {item.message}
                        </p>

                        <div className="flex items-center gap-4 mt-3 pt-2">
                          {!isAdmin && item.type === "application" && (
                            <button
                              type="button"
                              onClick={() => onNavigate("applications")}
                              className="inline-flex items-center gap-1 text-xs font-bold text-[#1A532E] hover:underline cursor-pointer"
                            >
                              <span>View Application</span>
                              <ArrowRight size={13} />
                            </button>
                          )}

                          {!isAdmin && item.type === "alert" && (
                            <button
                              type="button"
                              onClick={() => onNavigate("riskHeatmap")}
                              className="inline-flex items-center gap-1 text-xs font-bold text-red-700 hover:underline cursor-pointer"
                            >
                              <span>Inspect Risk Heatmap</span>
                              <ArrowRight size={13} />
                            </button>
                          )}

                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() => onNavigate(item.type === "partner" ? "institutionalPartners" : "pipelineMonitor")}
                              className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:underline cursor-pointer"
                            >
                              <span>{item.type === "partner" ? "Manage Partners" : "Monitor Pipeline"}</span>
                              <ArrowRight size={13} />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleToggleRead(item.id)}
                            className="text-[11px] font-semibold text-gray-500 hover:text-gray-900 cursor-pointer"
                          >
                            {item.read ? "Mark as Unread" : "Mark as Read"}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteOne(item.id)}
                            className="text-[11px] font-semibold text-gray-400 hover:text-red-600 cursor-pointer ml-auto"
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmClearAll}
        title="Clear All Notifications?"
        message="All notifications will be removed from your inbox. This action cannot be undone."
        confirmLabel="Clear All"
        onConfirm={handleConfirmClearAll}
        onCancel={() => setConfirmClearAll(false)}
      />
    </div>
  );
}
