import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Shield, CheckCircle2, Search, Sprout, RefreshCw } from "lucide-react";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";
import { fetchActiveUsersList, toggleUserStatusAPI, resetUserPassword, searchFarmers } from "../services/api.js";

const initialActiveUsersData = [];

export default function AdminUserManagement({ currentPage, onNavigate, onLogout }) {
  const [userTablePage, setUserTablePage] = useState(1);
  const [approvalMessage, setApprovalMessage] = useState(null);

  // Active Users Queue interactive state
  const [usersList, setUsersList] = useState(initialActiveUsersData);
  const [selectedRole, setSelectedRole] = useState("All Roles");
  const [selectedBranch, setSelectedBranch] = useState("All Branches");
  const [selectedStatus, setSelectedStatus] = useState("Active / All");
  const [activeFilters, setActiveFilters] = useState({ role: "All Roles", branch: "All Branches", status: "Active / All" });

  useEffect(() => {
    async function loadRealData() {
      const resUsers = await fetchActiveUsersList();
      if (resUsers.success && Array.isArray(resUsers.data) && resUsers.data.length > 0) {
        setUsersList(resUsers.data);
      }
    }
    loadRealData();
  }, []);

  // Farmer registry state
  const [farmers, setFarmers] = useState([]);
  const [loadingFarmers, setLoadingFarmers] = useState(true);
  const [farmerQuery, setFarmerQuery] = useState("");

  const loadFarmers = async (q = "") => {
    setLoadingFarmers(true);
    const res = await searchFarmers(q, { limit: "200" });
    if (res.success && Array.isArray(res.data)) {
      setFarmers(res.data);
    }
    setLoadingFarmers(false);
  };

  useEffect(() => {
    loadFarmers();
  }, []);

  const handleApplyFilters = () => {
    setActiveFilters({
      role: selectedRole,
      branch: selectedBranch,
      status: selectedStatus
    });
  };

  const handleToggleUserStatus = async (userObj) => {
    const targetName = typeof userObj === "object" ? userObj.name : userObj;
    const targetEmail = typeof userObj === "object" ? userObj.email : "";
    const targetId = typeof userObj === "object" ? userObj.id : "";

    let nextStatus = "Suspended";
    setUsersList(prev => prev.map(u => {
      if (u.name === targetName || (targetEmail && u.email === targetEmail)) {
        nextStatus = u.status === "Active" ? "Suspended" : "Active";
        return { ...u, status: nextStatus, flagged: nextStatus === "Suspended" };
      }
      return u;
    }));

    if (targetEmail || targetId) {
      await toggleUserStatusAPI(targetId, targetEmail, nextStatus);
    }

    setApprovalMessage(`User status changed to ${nextStatus} for ${targetName}. Updated in database.`);
    setTimeout(() => setApprovalMessage(null), 4000);
  };

  const handleResetUserPass = async (userName, userEmail) => {
    if (userEmail) {
      await resetUserPassword(userEmail, "AgriLend#2026!Reset");
    }
    setApprovalMessage(`Temporary password reset dispatched for ${userName} (${userEmail}). Updated in user credentials database.`);
    setTimeout(() => setApprovalMessage(null), 5000);
  };

  // Compute filtered active users
  const filteredUsers = usersList.filter((row) => {
    if (activeFilters.role !== "All Roles" && row.role !== activeFilters.role) return false;
    if (activeFilters.branch !== "All Branches" && row.branch !== activeFilters.branch) return false;
    if (activeFilters.status === "Active" && row.status !== "Active") return false;
    if (activeFilters.status === "Suspended" && row.status !== "Suspended") return false;
    return true;
  });

  // Calculate dynamic stats
  const activeCount = usersList.filter(u => u.status === "Active").length;
  const suspendedCount = usersList.filter(u => u.status === "Suspended").length;
  const avgSecurityScore = Math.round(usersList.reduce((acc, curr) => acc + curr.score, 0) / (usersList.length || 1));

  return (
    <div className="flex h-screen w-screen bg-[#E6EAE0] overflow-hidden">
      <AdminSidebar currentPage={currentPage} onNavigate={onNavigate} />

      <main className="flex-1 h-full flex flex-col overflow-y-auto">
        <AdminHeader onLogout={onLogout} onNavigate={onNavigate} />

        <div className="p-3 space-y-3">
          {approvalMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-md text-xs font-semibold flex items-center justify-between shadow-xs animate-fadeIn">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                <span>{approvalMessage}</span>
              </div>
            </div>
          )}

          {/* Active System Users & Officers Queue Section */}

          {/* Active System Users & Officers Queue Section */}
          <section className="bg-[#ECEFE5] border border-[#D9DED0] rounded-sm overflow-hidden">
            <div className="p-3 space-y-3">
              <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-gray-500 mb-1">User Role</p>
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="w-full h-8 px-2 border border-[#CFD5C7] bg-white text-[11px] text-gray-700 focus:outline-none focus:border-[#0B5A22] cursor-pointer font-medium"
                    >
                      <option value="All Roles">All Roles</option>
                      <option value="Bank Officer">Bank Officer</option>
                      <option value="Credit Analyst">Credit Analyst</option>
                      <option value="System Admin">System Admin</option>
                    </select>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-gray-500 mb-1">Branch / Hub</p>
                    <select
                      value={selectedBranch}
                      onChange={(e) => setSelectedBranch(e.target.value)}
                      className="w-full h-8 px-2 border border-[#CFD5C7] bg-white text-[11px] text-gray-700 focus:outline-none focus:border-[#0B5A22] cursor-pointer font-medium"
                    >
                      <option value="All Branches">All Branches</option>
                      <option value="Rift Valley Hub">Rift Valley Hub</option>
                      <option value="Central Division">Central Division</option>
                      <option value="West Division">West Division</option>
                      <option value="Central Highlands">Central Highlands</option>
                      <option value="Southern Hub">Southern Hub</option>
                      <option value="Amhara Branch">Amhara Branch</option>
                    </select>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-gray-500 mb-1">Status</p>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full h-8 px-2 border border-[#CFD5C7] bg-white text-[11px] text-gray-700 focus:outline-none focus:border-[#0B5A22] cursor-pointer font-medium"
                    >
                      <option value="Active / All">Active / All</option>
                      <option value="Active">Active Officers</option>
                      <option value="Suspended">Suspended / Hold</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleApplyFilters}
                    className="h-8 px-4 bg-[#0B5A22] hover:bg-[#084519] text-white text-[11px] font-semibold transition-all cursor-pointer shadow-xs active:scale-95"
                  >
                    Apply Filters
                  </button>
                  <div className="h-8 px-3 border border-[#CFD5C7] bg-white flex items-center text-[10px] text-gray-500">
                    Active Users Queue <span className="text-gray-900 font-bold ml-1">{activeCount}</span>
                  </div>
                  <div className="h-8 px-3 border border-[#CFD5C7] bg-white flex items-center text-[10px] text-gray-500">
                    Suspended Alerts <span className="text-red-600 font-bold ml-1">{suspendedCount}</span>
                  </div>
                  <div className="h-8 px-3 border border-[#CFD5C7] bg-white flex items-center text-[10px] text-gray-500">
                    Security Score <span className="text-gray-900 font-bold ml-1">{avgSecurityScore}</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#F7F8F4] border border-[#D9DED0] px-3 py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Shield size={14} className="text-[#0B5A22] shrink-0" />
                  <div>
                    <p className="text-[11px] font-semibold text-gray-800">Active System Users & Registered Officers Queue</p>
                    <p className="text-[10px] text-gray-500">
                      Real-time directory of validated agricultural officers, credit analysts, and portal administrators.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate && onNavigate("roles")}
                  className="h-7 px-3 border border-[#CFD5C7] bg-white hover:bg-gray-100 text-[10px] font-semibold text-gray-700 cursor-pointer transition-colors"
                >
                  Manage Role Permissions
                </button>
              </div>

              <div className="bg-white border border-[#D9DED0] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-[9px] font-bold uppercase tracking-wider text-gray-500 bg-[#EEF1E8] border-b border-[#D9DED0]">
                        <th className="px-3 py-2">User ID</th>
                        <th className="px-3 py-2">Officer Name & Email</th>
                        <th className="px-3 py-2">System Role</th>
                        <th className="px-3 py-2">Branch / Hub</th>
                        <th className="px-3 py-2">Security Score</th>
                        <th className="px-3 py-2">Status</th>
                        <th className="px-3 py-2 text-right">Quick Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-[11px]">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-3 py-6 text-center text-xs text-gray-500 font-medium">
                            No user records found matching the active filter criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((row) => (
                          <tr key={row.id} className={`border-b border-[#E2E7DA] ${row.flagged ? "bg-[#F6EFD9]" : "bg-white"} hover:bg-emerald-50/20 transition-colors`}>
                            <td className="px-3 py-2 font-mono font-bold text-[#0B5A22]">{row.id}</td>
                            <td className="px-3 py-2">
                              <p className="font-semibold text-gray-900">{row.name}</p>
                              <p className="text-[10px] font-mono text-gray-500">{row.email}</p>
                            </td>
                            <td className="px-3 py-2">
                              <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded ${
                                row.role === 'System Admin' ? 'bg-purple-100 text-purple-800 border border-purple-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              }`}>
                                {row.role}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-gray-700 font-medium">{row.branch}</td>
                            <td className={`px-3 py-2 font-bold font-mono ${row.score < 700 ? "text-red-600" : "text-emerald-700"}`}>{row.score}</td>
                            <td className="px-3 py-2">
                              <span
                                className={`px-2 py-0.5 text-[9px] font-bold ${
                                  row.status === "Active" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-100 text-red-700 border border-red-200"
                                }`}
                              >
                                {row.status}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-right">
                              <div className="inline-flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleToggleUserStatus(row)}
                                  className={`h-6 px-2 text-[9px] font-bold cursor-pointer transition-all shadow-xs ${
                                    row.status === "Active" ? "bg-red-50 hover:bg-red-100 text-red-700 border border-red-200" : "bg-[#0B5A22] hover:bg-[#084519] text-white"
                                  }`}
                                >
                                  {row.status === "Active" ? "Suspend" : "Activate"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleResetUserPass(row.name, row.email)}
                                  className="h-6 px-2 border border-gray-300 text-gray-700 text-[9px] font-bold bg-white hover:bg-gray-100 cursor-pointer transition-all"
                                >
                                  Reset Pass
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="px-3 py-2 bg-[#F7F8F4] border-t border-[#D9DED0] flex items-center justify-between text-[10px] text-gray-500">
                  <p>Showing {(userTablePage - 1) * 50 + 1}-{Math.min(userTablePage * 50, filteredUsers.length)} of {filteredUsers.length} records</p>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={userTablePage === 1}
                      onClick={() => setUserTablePage(p => Math.max(p - 1, 1))}
                      className="w-6 h-6 border border-[#CFD5C7] bg-white rounded flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-40 cursor-pointer"
                      title="Previous Page"
                    >
                      <ChevronLeft size={12} />
                    </button>

                    <button
                      type="button"
                      onClick={() => setUserTablePage(1)}
                      className="w-6 h-6 rounded flex items-center justify-center font-bold text-[10px] cursor-pointer bg-[#0B5A22] text-white shadow-xs"
                    >
                      1
                    </button>

                    <button
                      type="button"
                      disabled={userTablePage === 1}
                      onClick={() => setUserTablePage(p => Math.min(p + 1, 1))}
                      className="w-6 h-6 border border-[#CFD5C7] bg-white rounded flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-40 cursor-pointer"
                      title="Next Page"
                    >
                      <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Farmer Registry */}
              <div className="bg-white border border-[#D9DED0] overflow-hidden">
                <div className="px-3 py-2.5 bg-[#F7F8F4] border-b border-[#D9DED0] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Sprout size={14} className="text-[#0B5A22] shrink-0" />
                    <div>
                      <p className="text-[11px] font-semibold text-gray-800">Farmer Registry</p>
                      <p className="text-[10px] text-gray-500">
                        All registered farmers in the database — {loadingFarmers ? "loading…" : `${farmers.length} records`}.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="relative">
                      <Search size={12} className="absolute left-2.5 top-2 text-gray-400 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Search name, phone, ID, email..."
                        value={farmerQuery}
                        onChange={(e) => setFarmerQuery(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") loadFarmers(farmerQuery); }}
                        className="w-full sm:w-56 h-7 pl-7 pr-2 border border-[#CFD5C7] bg-white text-[11px] text-gray-800 focus:outline-none focus:border-[#0B5A22]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => loadFarmers(farmerQuery)}
                      className="h-7 px-3 bg-[#0B5A22] hover:bg-[#084519] text-white text-[10px] font-bold cursor-pointer transition-colors inline-flex items-center gap-1"
                    >
                      <RefreshCw size={11} className={loadingFarmers ? "animate-spin" : ""} /> Search
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-[9px] font-bold uppercase tracking-wider text-gray-500 bg-[#EEF1E8] border-b border-[#D9DED0]">
                        <th className="px-3 py-2">Farmer</th>
                        <th className="px-3 py-2">Contact</th>
                        <th className="px-3 py-2">National / Kebele ID</th>
                        <th className="px-3 py-2">Region & Crop</th>
                        <th className="px-3 py-2">Farm Size</th>
                        <th className="px-3 py-2">Credit Score</th>
                      </tr>
                    </thead>
                    <tbody className="text-[11px]">
                      {loadingFarmers ? (
                        <tr><td colSpan={6} className="px-3 py-6 text-center text-xs text-gray-500">Loading farmer registry...</td></tr>
                      ) : farmers.length === 0 ? (
                        <tr><td colSpan={6} className="px-3 py-6 text-center text-xs text-gray-500">No farmer records found.</td></tr>
                      ) : (
                        farmers.map((f) => (
                          <tr key={f.id || f.farmer_id || f.email} className="bg-white border-b border-[#E2E7DA] hover:bg-emerald-50/20 transition-colors">
                            <td className="px-3 py-2 font-semibold text-gray-900">{f.full_name || "—"}</td>
                            <td className="px-3 py-2 font-mono text-[10px] text-gray-700">{f.phone_number || f.phone || "—"}</td>
                            <td className="px-3 py-2 font-mono text-gray-700">{f.national_id || "—"}</td>
                            <td className="px-3 py-2 text-gray-700">
                              {f.region || f.primary_crop
                                ? `${f.region || "—"} • ${f.primary_crop || f.crop_type || "—"}`
                                : "—"}
                            </td>
                            <td className="px-3 py-2 text-gray-700">{(f.farm_size != null && f.farm_size !== "") ? `${f.farm_size} ha` : "—"}</td>
                            <td className={`px-3 py-2 font-bold font-mono ${Number(f.credit_score) >= 650 ? "text-emerald-700" : Number(f.credit_score) >= 500 ? "text-amber-600" : Number(f.credit_score) ? "text-red-600" : "text-gray-400"}`}>
                              {f.credit_score ?? "—"}
                              {f.risk_tier ? <span className="ml-1 text-[9px] uppercase font-bold">{f.risk_tier}</span> : null}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
