import React, { useState, useEffect } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import { updateUserProfile } from "../services/api.js";
import {
  ShieldCheck,
  Server,
  Cpu,
  Lock,
  Terminal,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Globe,
  Database,
  Clock,
  User,
  Edit3,
  Save,
  Check,
  Zap,
  RefreshCw,
  Layers
} from "lucide-react";

export default function AdminProfilePage({ currentPage, onNavigate, onLogout, user, currentUser, onUpdateUser }) {
  const activeUser = user || currentUser;
  const [activeTab, setActiveTab] = useState("overview"); // 'overview' | 'security' | 'audit' | 'nodes'
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [adminProfile, setAdminProfile] = useState(() => ({
    adminName: activeUser?.name || activeUser?.fullName || activeUser?.full_name || "System Administrator",
    email: activeUser?.email || "root.admin@agrilend.io",
    title: "Chief Systems Administrator & Technical Lead",
    adminId: activeUser?.adminId || `ROOT-SYSADMIN-${Math.floor(1000 + Math.random() * 9000)}`,
    clearanceLevel: "Level-1 Superuser (Full Root Access)",
    primaryCluster: "AWS eu-west-1a (Primary Node)",
    preferredTerminalTheme: "Dark Matrix Mono",
    mfaMethod: "Hardware YubiKey 5 NFC + TOTP",
  }));

  useEffect(() => {
    if (activeUser) {
      const currentName = activeUser.name || activeUser.fullName || activeUser.full_name;
      if (currentName) {
        setAdminProfile((prev) => ({
          ...prev,
          adminName: currentName,
          email: activeUser.email || prev.email,
        }));
      }
    }
  }, [activeUser]);

  const initials = (adminProfile.adminName || "ADMIN")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "SA";

  const [editForm, setEditForm] = useState({ ...adminProfile });

  const handleStartEditing = () => {
    setEditForm({ ...adminProfile });
    setIsEditing(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setAdminProfile({ ...editForm });
    
    const updatedData = {
      name: editForm.adminName,
      fullName: editForm.adminName,
      full_name: editForm.adminName,
      email: editForm.email,
      title: editForm.title,
    };

    if (onUpdateUser) {
      onUpdateUser(updatedData);
    }

    try {
      await updateUserProfile(updatedData);
    } catch (err) {
      console.warn("Backend update skipped:", err);
    }

    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const adminAuditLogs = [
    { id: 1, action: "ML Model Deployment", detail: "Promoted Model v2.4.1-crop-yield to Production", time: "Today, 09:12 AM", ip: "192.168.1.104", status: "Success" },
    { id: 2, action: "API Secret Rotation", detail: "Rotated M-Pesa Disbursement Gateway Secret Key", time: "Yesterday, 11:45 PM", ip: "10.0.0.12", status: "Verified" },
    { id: 3, action: "System Cache Invalidated", detail: "Purged Redis Cluster & Edge CDN Nodes", time: "Oct 27, 2023", ip: "192.168.1.104", status: "Success" },
    { id: 4, action: "Root Authentication", detail: "Logged in via YubiKey Hardware Token", time: "Oct 26, 2023", ip: "192.168.1.104", status: "Secure" },
  ];

  const nodePrivileges = [
    { name: "Satellite Ingestion Pipeline", access: "Full Control (Read/Write/Trigger)", status: "Active" },
    { name: "Credit Scoring ML Engine", access: "Superuser Override & Model Deployment", status: "Active" },
    { name: "Mobile Money Payout Gateway", access: "Transaction Reversal & Audit", status: "Active" },
    { name: "User KYC & Data Vault", access: "Encrypted DB Admin Privileges", status: "Active" },
  ];

  return (
    <div className="flex h-screen w-screen bg-[#111915] text-[#E6ECE2] overflow-hidden font-sans antialiased select-none">
      <AdminSidebar currentPage={currentPage} onNavigate={onNavigate} />

      <main className="flex-1 h-full flex flex-col overflow-y-auto">
        <AdminHeader onLogout={onLogout} onNavigate={onNavigate} />

        <div className="p-6 space-y-6 max-w-7xl w-full mx-auto">
          {/* Header Banner - Dark High-Tech Technical Command Aesthetic */}
          <div className="bg-gradient-to-r from-[#18261E] via-[#0F1C16] to-[#0A120E] border border-[#27382D] rounded-2xl p-6 lg:p-8 shadow-xl relative overflow-hidden">
            <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>
            <div className="absolute -left-20 -bottom-20 w-72 h-72 rounded-full bg-emerald-400/5 blur-3xl pointer-events-none"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="relative">
                  <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-2xl bg-[#0B5A22] border-2 border-emerald-500/50 flex items-center justify-center text-2xl lg:text-3xl font-extrabold text-white shadow-lg font-mono">
                    {initials}
                  </div>

                  <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-[#18261E] flex items-center justify-center" title="Root Session Active">
                    <ShieldCheck size={14} className="text-[#0A120E]" />
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white">{adminProfile.adminName}</h1>
                    <span className="text-[10px] font-mono font-bold tracking-widest uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 px-2.5 py-0.5 rounded-md">
                      ROOT OPERATIONAL COMMAND
                    </span>
                  </div>
                  <p className="text-xs text-emerald-400/90 font-medium mt-1">{adminProfile.title}</p>
                  <div className="flex items-center gap-4 text-[11px] text-gray-400 mt-2 font-mono">
                    <span>ID: {adminProfile.adminId}</span>
                    <span>•</span>
                    <span>Cluster: {adminProfile.primaryCluster}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => (isEditing ? setIsEditing(false) : handleStartEditing())}
                  className="px-4 py-2 rounded-xl bg-[#223328] hover:bg-[#2B3E31] border border-[#344C3C] text-xs font-semibold text-white flex items-center gap-2 transition-all cursor-pointer shadow-sm"
                >
                  <Edit3 size={14} className="text-emerald-400" />
                  <span>{isEditing ? "Cancel Edit" : "Edit Admin Details"}</span>
                </button>
              </div>
            </div>
          </div>

          {saveSuccess && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fadeIn">
              <Check size={16} className="text-emerald-400" />
              <span>Admin system profile configuration updated successfully!</span>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-[#243529] pb-1">
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "overview"
                  ? "bg-[#0B5A22] text-white shadow-sm"
                  : "text-gray-400 hover:bg-[#1B2821] hover:text-white"
              }`}
            >
              Root Credentials
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("nodes")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "nodes"
                  ? "bg-[#0B5A22] text-white shadow-sm"
                  : "text-gray-400 hover:bg-[#1B2821] hover:text-white"
              }`}
            >
              Node Privileges
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("audit")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "audit"
                  ? "bg-[#0B5A22] text-white shadow-sm"
                  : "text-gray-400 hover:bg-[#1B2821] hover:text-white"
              }`}
            >
              Admin Audit Log
            </button>
          </div>

          {/* TAB 1: Root Credentials */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 bg-[#17221C] border border-[#243529] rounded-2xl p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-[#243529] pb-3">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <User size={16} className="text-emerald-400" /> Root System Credentials
                  </h3>
                  <span className="text-[10px] font-mono font-bold uppercase text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded">
                    SYSADMIN CLEARANCE
                  </span>
                </div>

                {!isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs font-mono">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">ADMIN NAME</p>
                      <p className="font-bold text-white text-sm">{adminProfile.adminName}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">ROOT EMAIL</p>
                      <p className="font-semibold text-emerald-300">{adminProfile.email}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">ADMIN ROLE & TITLE</p>
                      <p className="font-semibold text-white">{adminProfile.title}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">SYSTEM ADMIN ID</p>
                      <p className="font-bold text-emerald-400">{adminProfile.adminId}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">SECURITY CLEARANCE</p>
                      <p className="font-semibold text-gray-300">{adminProfile.clearanceLevel}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">PRIMARY REGION CLUSTER</p>
                      <p className="font-semibold text-gray-300">{adminProfile.primaryCluster}</p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSave} className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-mono font-bold uppercase text-gray-400 mb-1">ADMIN NAME</label>
                        <input
                          type="text"
                          value={editForm.adminName}
                          onChange={(e) => setEditForm({ ...editForm, adminName: e.target.value })}
                          className="w-full bg-[#0F1713] border border-[#2A3D30] rounded-lg p-2.5 text-xs text-white font-mono outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono font-bold uppercase text-gray-400 mb-1">ROOT EMAIL</label>
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                          className="w-full bg-[#0F1713] border border-[#2A3D30] rounded-lg p-2.5 text-xs text-white font-mono outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono font-bold uppercase text-gray-400 mb-1">TITLE</label>
                        <input
                          type="text"
                          value={editForm.title}
                          onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                          className="w-full bg-[#0F1713] border border-[#2A3D30] rounded-lg p-2.5 text-xs text-white font-mono outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono font-bold uppercase text-gray-400 mb-1">PRIMARY CLUSTER</label>
                        <input
                          type="text"
                          value={editForm.primaryCluster}
                          onChange={(e) => setEditForm({ ...editForm, primaryCluster: e.target.value })}
                          className="w-full bg-[#0F1713] border border-[#2A3D30] rounded-lg p-2.5 text-xs text-white font-mono outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-3">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 rounded-lg border border-[#2A3D30] text-xs font-semibold text-gray-400 hover:bg-[#202E24]"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-lg bg-[#0B5A22] hover:bg-[#094A1C] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <Save size={14} /> Save Root Profile
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Status Overview */}
              <div className="space-y-4">
                <div className="bg-[#17221C] border border-[#243529] rounded-2xl p-5 shadow-sm space-y-3">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider font-mono">System Health Overview</h4>
                  <div className="space-y-2 font-mono text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Node Cluster Status</span>
                      <span className="font-bold text-emerald-400">100% Operational</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">MFA Method</span>
                      <span className="font-bold text-emerald-300">YubiKey Hardware</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Last Root Login</span>
                      <span className="font-bold text-gray-300">Today, 09:12 AM</span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#0D1612] border border-emerald-500/30 rounded-2xl p-5 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 font-mono">
                    <ShieldCheck size={16} /> Superuser Mode Active
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed font-mono">
                    Full read/write permissions enabled for ML scoring models, DB maintenance, and API gateway secret rotation.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Node Privileges */}
          {activeTab === "nodes" && (
            <div className="bg-[#17221C] border border-[#243529] rounded-2xl shadow-sm overflow-hidden font-mono">
              <div className="p-5 border-b border-[#243529] flex items-center justify-between">
                <h3 className="text-base font-bold text-white">Infrastructure Node Privileges</h3>
                <span className="text-xs font-semibold text-emerald-400">TIER-1 ACCESS</span>
              </div>
              <div className="divide-y divide-[#243529]">
                {nodePrivileges.map((node, i) => (
                  <div key={i} className="p-4 flex items-center justify-between hover:bg-[#1C2B23] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-950 text-emerald-400 flex items-center justify-center border border-emerald-800">
                        <Server size={15} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{node.name}</p>
                        <p className="text-[11px] text-gray-400">{node.access}</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold uppercase text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded border border-emerald-600/40">
                      {node.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: Admin Audit Log */}
          {activeTab === "audit" && (
            <div className="bg-[#17221C] border border-[#243529] rounded-2xl shadow-sm overflow-hidden font-mono">
              <div className="p-5 border-b border-[#243529] flex items-center justify-between">
                <h3 className="text-base font-bold text-white">System Admin Audit Trail</h3>
                <span className="text-xs font-semibold text-gray-400">Root Operations Log</span>
              </div>
              <div className="divide-y divide-[#243529]">
                {adminAuditLogs.map((log) => (
                  <div key={log.id} className="p-4 flex items-center justify-between hover:bg-[#1C2B23] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-950 text-emerald-400 flex items-center justify-center border border-emerald-800">
                        <Activity size={14} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{log.action}</p>
                        <p className="text-[11px] text-gray-400">{log.detail}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] text-emerald-300">{log.time}</p>
                      <p className="text-[9px] text-gray-500">IP: {log.ip}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
