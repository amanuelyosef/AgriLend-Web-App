import React, { useState } from "react";
import Sidebar from "./Sidebar";
import DashboardHeader from "./DashboardHeader";
import {
  Settings,
  ShieldCheck,
  Lock,
  BellRing,
  Save,
  CheckCircle2,
  Loader2,
  Percent,
  Building2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { updateBankSettings } from "../services/api";

export default function SettingsPage({
  currentPage,
  onNavigate,
  onLogout,
  currentUser,
  user: userProp,
}) {
  const { user: authUser, updateProfile } = useAuth();
  const activeUser = currentUser || userProp || authUser;

  const [fullName, setFullName] = useState(activeUser?.full_name || activeUser?.name || "");
  const [interestRate, setInterestRate] = useState(
    activeUser?.bank_interest_rate != null ? String(activeUser.bank_interest_rate) : ""
  );
  const [saving, setSaving] = useState(false);
  const [savingRate, setSavingRate] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const handleSaveProfile = async () => {
    setSaving(true);
    setSuccessMsg("");
    setErrorMsg("");
    try {
      if (updateProfile) {
        await updateProfile({ full_name: fullName.trim() });
        setSuccessMsg("Profile updated successfully!");
      }
    } catch (err) {
      setErrorMsg(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveInterestRate = async () => {
    if (!activeUser?.bank_id) return;
    const rate = parseFloat(interestRate);
    if (!rate || rate <= 0 || rate > 100) {
      setErrorMsg("Interest rate must be between 0.01 and 100.");
      return;
    }
    setSavingRate(true);
    setSuccessMsg("");
    setErrorMsg("");
    try {
      const res = await updateBankSettings(activeUser.bank_id, { interest_rate: rate });
      const appliedRate = res?.data?.interest_rate ?? rate;
      setInterestRate(String(appliedRate));
      setSuccessMsg(`Lending terms updated — new annual interest rate: ${appliedRate}%.`);
    } catch (err) {
      setErrorMsg(err.message || "Failed to update lending terms");
    } finally {
      setSavingRate(false);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-[#F5F7F2] overflow-hidden font-sans">
      <Sidebar currentPage={currentPage} onNavigate={onNavigate} onLogout={onLogout} currentUser={activeUser} />

      <div className="flex-1 h-full flex flex-col overflow-y-auto">
        <DashboardHeader showBack onBack={() => onNavigate("dashboard")} backText="Back to Dashboard" onLogout={onLogout} currentUser={activeUser} onNavigate={onNavigate} />

        <div className="p-6 space-y-6 max-w-[1600px] w-full mx-auto">
          <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-emerald-700">Workspace Configuration</p>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight mt-1">Settings</h1>
              <p className="text-xs text-gray-500 mt-1">
                Manage user profile preferences, security controls, and backend settings.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1A532E] text-white text-xs font-semibold hover:bg-[#144023] cursor-pointer disabled:opacity-60"
              >
                {saving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                <span>Save Changes</span>
              </button>
            </div>
          </div>

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-800 flex items-center gap-2">
              <CheckCircle2 size={16} />
              {successMsg}
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs font-semibold text-red-700">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <p className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">Profile Completion</p>
              <h3 className="text-3xl font-extrabold text-gray-900 mt-2">100%</h3>
              <p className="text-[11px] text-gray-500 mt-2">Verified backend session.</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <p className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">MFA Status</p>
              <h3 className="text-3xl font-extrabold text-emerald-700 mt-2">Active</h3>
              <p className="text-[11px] text-gray-500 mt-2">JWT Authentication Active.</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <p className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">User Role</p>
              <h3 className="text-xl font-extrabold text-[#1A532E] mt-2">{activeUser?.role_name || "Credit Analyst"}</h3>
              <p className="text-[11px] text-gray-500 mt-2">Role permissions active.</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <p className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">Account Status</p>
              <h3 className="text-3xl font-extrabold text-emerald-700 mt-2">Active</h3>
              <p className="text-[11px] text-gray-500 mt-2">Verified Officer Account.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 space-y-6">
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Settings size={16} className="text-emerald-700" />
                  <h2 className="text-sm font-bold text-gray-800">Profile & Identity</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 tracking-wider mb-1.5 uppercase">FULL NAME</label>
                    <input
                      className="w-full bg-[#FAFBF7] border border-gray-200 rounded-lg p-2.5 text-xs text-gray-900 font-semibold focus:outline-none focus:border-[#1A532E]"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 tracking-wider mb-1.5 uppercase">EMAIL</label>
                    <input
                      className="w-full bg-[#FAFBF7] border border-gray-200 rounded-lg p-2.5 text-xs text-gray-500 font-medium cursor-not-allowed"
                      value={activeUser?.email || "user@agrilend.com"}
                      readOnly
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Percent size={16} className="text-emerald-700" />
                  <h2 className="text-sm font-bold text-gray-800">Lending Terms</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 tracking-wider mb-1.5 uppercase flex items-center gap-1">
                      <Building2 size={11} /> INSTITUTION
                    </label>
                    <input
                      className="w-full bg-[#FAFBF7] border border-gray-200 rounded-lg p-2.5 text-xs text-gray-500 font-medium cursor-not-allowed"
                      value={activeUser?.bank_name || "Not linked to an institution"}
                      readOnly
                    />
                    <p className="text-[10px] text-gray-400 mt-1">Institution names are permanent and cannot be changed.</p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 tracking-wider mb-1.5 uppercase">ANNUAL INTEREST RATE (%)</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="0.01"
                        max="100"
                        step="0.01"
                        disabled={!activeUser?.bank_id || savingRate}
                        className="flex-1 bg-[#FAFBF7] border border-gray-200 rounded-lg p-2.5 text-xs text-gray-900 font-semibold focus:outline-none focus:border-[#1A532E] disabled:opacity-60"
                        value={interestRate}
                        onChange={(e) => setInterestRate(e.target.value)}
                        placeholder="e.g. 8.50"
                      />
                      {activeUser?.bank_id && (
                        <button
                          type="button"
                          onClick={handleSaveInterestRate}
                          disabled={savingRate}
                          className="px-3 py-2 rounded-lg bg-[#1A532E] text-white text-xs font-semibold hover:bg-[#144023] cursor-pointer disabled:opacity-60 whitespace-nowrap flex items-center gap-1.5"
                        >
                          {savingRate ? <Loader2 className="animate-spin" size={13} /> : <Save size={13} />}
                          Update Rate
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">
                      Applied to approved loans to compute the total payable amount. Existing approvals keep their original rate.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <BellRing size={16} className="text-emerald-700" />
                  <h2 className="text-sm font-bold text-gray-800">Notification Preferences</h2>
                </div>

                <div className="space-y-3 text-xs">
                  {[
                    "Email alerts for high risk applications",
                    "Daily portfolio summary digest",
                    "SMS alerts for overdue repayments",
                    "Weekly model performance report",
                  ].map((item) => (
                    <label key={item} className="flex items-center justify-between border border-gray-200 rounded-lg px-3 py-2.5">
                      <span className="text-gray-700 font-medium">{item}</span>
                      <input type="checkbox" defaultChecked className="accent-[#1A532E]" />
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck size={16} className="text-emerald-700" />
                  <h3 className="text-sm font-bold text-gray-800">Security Details</h3>
                </div>
                <div className="space-y-3 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <Lock size={14} className="text-gray-400" />
                    JWT OAuth2 Authentication
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={14} className="text-emerald-600" />
                    Role-Based Access Control (RBAC)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
