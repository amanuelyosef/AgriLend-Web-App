import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import DashboardHeader from "./DashboardHeader";
import { updateUserProfile } from "../services/api.js";
import {
  User,
  Mail,
  Building,
  ShieldCheck,
  Key,
  Globe,
  Clock,
  CheckCircle2,
  Lock,
  Smartphone,
  Activity,
  Award,
  Edit3,
  Save,
  Check,
} from "lucide-react";

export default function UserProfilePage({ currentPage, onNavigate, onLogout, user, currentUser, onUpdateUser }) {
  const activeUser = user || currentUser;
  const [activeTab, setActiveTab] = useState("overview"); // 'overview' | 'security' | 'activity'
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [profile, setProfile] = useState(() => ({
    fullName: activeUser?.name || activeUser?.fullName || activeUser?.full_name || "Alex Rivers",
    email: activeUser?.email || "a.rivers@agrilend.com",
    role: activeUser?.role === "admin" ? "System Administrator" : (activeUser?.role === "bank" ? "Senior Credit Analyst" : "Bank Officer"),
    employeeId: activeUser?.employeeId || `AL-OFFICER-${Math.floor(1000 + Math.random() * 9000)}`,
    department: activeUser?.department || "Agricultural Credit & Risk Assessment",
    branch: activeUser?.branch || "Central Division (Regional HQ)",
    language: "English",
    phone: activeUser?.phone || "+254 712 345 678",
    mfaEnabled: true,
    joinedDate: "Just now",
  }));

  useEffect(() => {
    if (activeUser) {
      const currentName = activeUser.name || activeUser.fullName || activeUser.full_name || (activeUser.email === "bank@agrilend.com" ? "Alex Rivers" : "Bank Officer");
      const currentEmail = activeUser.email || "officer@agrilend.com";
      const currentRole = activeUser.role === "admin" ? "System Administrator" : (activeUser.role === "bank" ? "Senior Credit Analyst" : "Bank Officer");

      setProfile({
        fullName: currentName,
        email: currentEmail,
        role: currentRole,
        employeeId: activeUser.employeeId || `AL-OFFICER-7742`,
        department: activeUser.department || "Agricultural Credit & Risk Assessment",
        branch: activeUser.branch || "Central Division (Regional HQ)",
        language: activeUser.language || "English",
        phone: activeUser.phone || "+254 712 345 678",
        mfaEnabled: true,
        joinedDate: "Active Officer",
      });
    }
  }, [activeUser]);

  const initials = (profile.fullName || "OFFICER")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "AL";

  const [editForm, setEditForm] = useState({ ...profile });

  const handleStartEditing = () => {
    setEditForm({ ...profile });
    setIsEditing(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setProfile({ ...editForm });
    
    const updatedData = {
      name: editForm.fullName,
      fullName: editForm.fullName,
      full_name: editForm.fullName,
      email: editForm.email,
      phone: editForm.phone,
      department: editForm.department,
      branch: editForm.branch,
      language: editForm.language,
    };

    if (onUpdateUser) {
      onUpdateUser(updatedData);
    }

    try {
      await updateUserProfile(updatedData);
    } catch (err) {
      console.warn("Backend update error:", err);
    }

    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const auditLogs = [
    { id: 1, action: "Approved Credit Application", detail: "Henderson Grain Estates ($145,000)", time: "Today, 08:30 AM", status: "Verified" },
    { id: 2, action: "Ran Telemetry Risk Heatmap", detail: "Eldoret Cluster (Sentinel-2 GEE Fetch)", time: "Yesterday, 04:15 PM", status: "Success" },
    { id: 3, action: "Updated Farmer Registry", detail: "Verified National ID for Samuel Kibet", time: "Oct 26, 2023", status: "Verified" },
    { id: 4, action: "System Authentication", detail: "2FA Verified via TOTP Authenticator", time: "Oct 25, 2023", status: "Success" },
  ];

  return (
    <div className="flex h-screen w-screen bg-[#F4F6EF] overflow-hidden font-sans antialiased">
      <Sidebar currentPage={currentPage} onNavigate={onNavigate} onLogout={onLogout} currentUser={activeUser} />

      <div className="flex-1 h-full flex flex-col overflow-y-auto">
        <DashboardHeader showBack onBack={() => onNavigate("dashboard")} backText="Back to Dashboard" onLogout={onLogout} currentUser={activeUser} onNavigate={onNavigate} />


        <div className="p-6 space-y-6 max-w-[1500px] w-full mx-auto">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-[#0B5A22] via-[#0D441D] to-[#061F0F] rounded-2xl p-6 lg:p-8 text-white shadow-lg relative overflow-hidden">
            <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none"></div>
            <div className="absolute -left-16 -bottom-16 w-64 h-64 rounded-full bg-emerald-400/10 blur-2xl pointer-events-none"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="relative">
                  <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-2xl bg-emerald-700/80 border-2 border-emerald-400/40 flex items-center justify-center text-2xl lg:text-3xl font-extrabold text-white shadow-md">
                    {initials}
                  </div>

                  <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-[#0B5A22] flex items-center justify-center" title="Online & Verified">
                    <CheckCircle2 size={14} className="text-white" />
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white">{profile.fullName}</h1>
                    <span className="text-[10px] font-mono font-bold tracking-widest uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2.5 py-0.5 rounded-md">
                      VERIFIED OFFICER
                    </span>
                  </div>
                  <p className="text-xs text-emerald-200/90 font-medium mt-1">{profile.role} • {profile.department}</p>
                  <div className="flex items-center gap-4 text-[11px] text-emerald-300/70 mt-2 font-mono">
                    <span>ID: {profile.employeeId}</span>
                    <span>•</span>
                    <span>Branch: {profile.branch}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => (isEditing ? setIsEditing(false) : handleStartEditing())}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-white flex items-center gap-2 transition-all cursor-pointer backdrop-blur-xs"
                >
                  <Edit3 size={14} />
                  <span>{isEditing ? "Cancel Edit" : "Edit Profile"}</span>
                </button>
              </div>
            </div>
          </div>

          {saveSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fadeIn">
              <Check size={16} className="text-emerald-600" />
              <span>Profile details updated successfully!</span>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-gray-200/80 pb-1">
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "overview"
                  ? "bg-[#1A532E] text-white shadow-xs"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Overview & Credentials
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("security")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "security"
                  ? "bg-[#1A532E] text-white shadow-xs"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Security & 2FA
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("activity")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "activity"
                  ? "bg-[#1A532E] text-white shadow-xs"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Audit Activity Log
            </button>
          </div>

          {/* Tab Content 1: Overview */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 bg-white border border-gray-200/80 rounded-2xl p-6 shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h3 className="text-base font-bold text-gray-900">Officer Credentials</h3>
                  <span className="text-[10px] font-mono font-bold uppercase text-gray-400">RESTRICTED ACCESS</span>
                </div>

                {!isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">FULL NAME</p>
                      <p className="font-bold text-gray-900 text-sm">{profile.fullName}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">INSTITUTIONAL EMAIL</p>
                      <p className="font-semibold text-gray-800">{profile.email}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">OFFICER ROLE</p>
                      <p className="font-semibold text-[#1A532E]">{profile.role}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">EMPLOYEE ID</p>
                      <p className="font-mono font-bold text-gray-800">{profile.employeeId}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">DEPARTMENT</p>
                      <p className="font-semibold text-gray-800">{profile.department}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">BRANCH / DIVISION</p>
                      <p className="font-semibold text-gray-800">{profile.branch}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">PHONE NUMBER</p>
                      <p className="font-semibold text-gray-800">{profile.phone}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">PREFERRED LANGUAGE</p>
                      <p className="font-semibold text-gray-800">{profile.language}</p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSave} className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">FULL NAME</label>
                        <input
                          type="text"
                          value={editForm.fullName}
                          onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                          className="w-full bg-[#FAFBF7] border border-gray-200 rounded-lg p-2.5 text-xs font-semibold outline-none focus:ring-1 focus:ring-[#1A532E]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">INSTITUTIONAL EMAIL</label>
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                          className="w-full bg-[#FAFBF7] border border-gray-200 rounded-lg p-2.5 text-xs font-semibold outline-none focus:ring-1 focus:ring-[#1A532E]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">DEPARTMENT</label>
                        <input
                          type="text"
                          value={editForm.department}
                          onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                          className="w-full bg-[#FAFBF7] border border-gray-200 rounded-lg p-2.5 text-xs font-semibold outline-none focus:ring-1 focus:ring-[#1A532E]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">BRANCH / HUB</label>
                        <input
                          type="text"
                          value={editForm.branch}
                          onChange={(e) => setEditForm({ ...editForm, branch: e.target.value })}
                          className="w-full bg-[#FAFBF7] border border-gray-200 rounded-lg p-2.5 text-xs font-semibold outline-none focus:ring-1 focus:ring-[#1A532E]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">PHONE NUMBER</label>
                        <input
                          type="text"
                          value={editForm.phone}
                          onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                          className="w-full bg-[#FAFBF7] border border-gray-200 rounded-lg p-2.5 text-xs font-semibold outline-none focus:ring-1 focus:ring-[#1A532E]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">PREFERRED LANGUAGE</label>
                        <select
                          value={editForm.language}
                          onChange={(e) => setEditForm({ ...editForm, language: e.target.value })}
                          className="w-full bg-[#FAFBF7] border border-gray-200 rounded-lg p-2.5 text-xs font-semibold outline-none focus:ring-1 focus:ring-[#1A532E]"
                        >
                          <option value="English">English</option>
                          <option value="Amharic">Amharic (አማርኛ)</option>
                          <option value="Afaan Oromo">Afaan Oromo</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-3">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-lg bg-[#1A532E] hover:bg-[#144224] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <Save size={14} /> Save Changes
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Stats & Key Performance */}
              <div className="space-y-4">
                <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs space-y-3">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Assigned Portfolio Metrics</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-600 font-medium">Applications Reviewed</span>
                      <span className="font-bold text-gray-900">142 cases</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-600 font-medium">Portfolio Risk Score</span>
                      <span className="font-bold text-emerald-700">742 (Low Risk)</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-600 font-medium">Approved Credit Volume</span>
                      <span className="font-bold text-gray-900">$3.45 Million</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-600 font-medium">Decision Turnaround</span>
                      <span className="font-bold text-emerald-700">1.4 Days</span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#FAFBF5] border border-emerald-200/70 rounded-2xl p-5 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#1A532E]">
                    <ShieldCheck size={16} /> Security Clearance Active
                  </div>
                  <p className="text-[11px] text-gray-600 leading-relaxed">
                    Granted Tier-2 Risk Assessment privileges for satellite telemetry and loan approval up to $500,000.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab Content 2: Security */}
          {activeTab === "security" && (
            <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-xs max-w-3xl space-y-6">
              <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">Security & Identity Management</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-[#FAFBF7] border border-gray-200/80 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-100 text-[#1A532E] flex items-center justify-center">
                      <Smartphone size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">Two-Factor Authentication (2FA)</p>
                      <p className="text-[11px] text-gray-500">TOTP Authenticator app is enabled.</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold uppercase text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                    ENABLED
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-[#FAFBF7] border border-gray-200/80 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center">
                      <Lock size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">Password Settings</p>
                      <p className="text-[11px] text-gray-500">Last changed 42 days ago.</p>
                    </div>
                  </div>
                  <button type="button" className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer">
                    Change Password
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab Content 3: Audit Activity */}
          {activeTab === "activity" && (
            <div className="bg-white border border-gray-200/80 rounded-2xl shadow-xs overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-base font-bold text-gray-900">Recent Audit Logs</h3>
                <span className="text-xs font-semibold text-gray-400">System Activity</span>
              </div>
              <div className="divide-y divide-gray-100">
                {auditLogs.map((log) => (
                  <div key={log.id} className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-50 text-[#1A532E] flex items-center justify-center border border-emerald-100">
                        <Activity size={14} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900">{log.action}</p>
                        <p className="text-[11px] text-gray-500">{log.detail}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] text-gray-400">{log.time}</p>
                      <span className="text-[9px] font-bold uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                        {log.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
