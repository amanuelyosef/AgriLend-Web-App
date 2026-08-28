import React, { useState, useEffect } from "react";
import {
  Globe,
  Save,
  Shield,
  Settings as SettingsIcon,
  CheckCircle2,
} from "lucide-react";
import AdminSidebar from "./AdminSidebar.jsx";
import AdminHeader from "./AdminHeader.jsx";
import { fetchAdminSettings, saveAdminSettings } from "../services/api.js";

export default function AdminSystemSettings({ currentPage = "systemSettings", onNavigate, onLogout }) {
  const [siteName, setSiteName] = useState("");
  const [environment, setEnvironment] = useState("");
  const [currency, setCurrency] = useState("");
  const [minScore, setMinScore] = useState("");
  const [maxLoan, setMaxLoan] = useState("");
  const [loanTerm, setLoanTerm] = useState("");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const applySettings = (s = {}) => {
    if (s.site_name != null) setSiteName(s.site_name);
    if (s.environment != null) setEnvironment(s.environment);
    if (s.currency != null) setCurrency(s.currency);
    if (s.min_credit_score_approval != null) setMinScore(String(s.min_credit_score_approval));
    if (s.max_loan_amount != null) setMaxLoan(String(s.max_loan_amount));
    if (s.default_loan_term_months != null) setLoanTerm(String(s.default_loan_term_months));
    if (s.maintenance_mode != null) setMaintenanceMode(String(s.maintenance_mode).toLowerCase() === "true");
  };

  useEffect(() => {
    async function loadSettings() {
      setLoading(true);
      const res = await fetchAdminSettings();
      if (res && res.success && res.data && res.data.settings) {
        applySettings(res.data.settings);
      }
      setLoading(false);
    }
    loadSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSuccessMsg("");
    setErrorMsg("");

    if (minScore !== "" && (Number(minScore) < 300 || Number(minScore) > 850)) {
      setErrorMsg("Minimum approval score must be between 300 and 850.");
      setSaving(false);
      return;
    }
    if (maxLoan !== "" && Number(maxLoan) <= 0) {
      setErrorMsg("Maximum loan amount must be a positive number.");
      setSaving(false);
      return;
    }
    if (loanTerm !== "" && (Number(loanTerm) < 1 || !Number.isInteger(Number(loanTerm)))) {
      setErrorMsg("Default loan term must be a positive whole number of months.");
      setSaving(false);
      return;
    }

    const res = await saveAdminSettings({
      site_name: siteName,
      environment,
      currency,
      min_credit_score_approval: minScore,
      max_loan_amount: maxLoan,
      default_loan_term_months: loanTerm,
      maintenance_mode: String(maintenanceMode),
    });
    if (res && res.success) {
      if (res.data && res.data.settings) {
        applySettings(res.data.settings);
      }
      setSuccessMsg("System configuration saved successfully!");
    } else {
      setErrorMsg((res && res.error) || "Failed to save settings.");
    }
    setSaving(false);
  };

  return (
    <div className="flex h-screen w-screen bg-[#E6EAE0] overflow-hidden font-sans">
      <AdminSidebar currentPage={currentPage} onNavigate={onNavigate} />

      <main className="flex-1 h-full flex flex-col overflow-y-auto relative">
        <AdminHeader onLogout={onLogout} onNavigate={onNavigate} />

        <div className="p-4 space-y-4 max-w-7xl mx-auto w-full">
          <div className="bg-[#ECEFE5] border border-[#D9DED0] rounded-sm p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Platform System Settings</h1>
                <p className="text-xs text-gray-600 mt-0.5">
                  Configure core governance, security enforcement, AI scoring thresholds, and external API gateways.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving || loading}
                className="flex items-center gap-2 h-9 px-4 rounded bg-[#0B5A22] text-white text-xs font-semibold hover:bg-[#094a1c] cursor-pointer disabled:opacity-60"
              >
                <Save size={14} />
                <span>{saving ? "Saving..." : "Save Settings"}</span>
              </button>
            </div>

            {successMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-xs font-semibold text-emerald-800 flex items-center gap-2">
                <CheckCircle2 size={16} />
                {successMsg}
              </div>
            )}

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-xs font-semibold text-red-800 flex items-center gap-2">
                {errorMsg}
              </div>
            )}

            <div className="bg-white border border-[#D9DED0] rounded-md p-6 space-y-4">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Globe size={18} className="text-[#0B5A22]" /> General Platform Settings
              </h2>

              {loading ? (
                <p className="text-xs text-gray-500">Loading current settings...</p>
              ) : (
                <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">PLATFORM TITLE</label>
                    <input
                      type="text"
                      value={siteName}
                      onChange={(e) => setSiteName(e.target.value)}
                      className="w-full h-9 px-3 border border-[#D9DED0] rounded text-gray-900 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">ENVIRONMENT</label>
                    <select
                      value={environment}
                      onChange={(e) => setEnvironment(e.target.value)}
                      className="w-full h-9 px-3 border border-[#D9DED0] rounded text-gray-900 font-medium cursor-pointer"
                    >
                      <option value="">—</option>
                      <option value="production">Production</option>
                      <option value="staging">Staging</option>
                      <option value="development">Development</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">CURRENCY</label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full h-9 px-3 border border-[#D9DED0] rounded text-gray-900 font-medium cursor-pointer"
                    >
                      <option value="">—</option>
                      <option value="USD">USD ($)</option>
                      <option value="KES">KES (KSh)</option>
                      <option value="ETB">ETB (Br)</option>
                    </select>
                  </div>
                </div>

                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 pt-4 border-t border-[#E2E7DA]">
                  <Shield size={18} className="text-[#0B5A22]" /> Lending & Risk Policy
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">MINIMUM CREDIT SCORE APPROVAL</label>
                    <input
                      type="number" min="300" max="850"
                      value={minScore}
                      onChange={(e) => setMinScore(e.target.value)}
                      placeholder="e.g. 600"
                      className="w-full h-9 px-3 border border-[#D9DED0] rounded text-gray-900 font-medium"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">Applications scoring below this require manual review.</p>
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">MAX LOAN AMOUNT</label>
                    <input
                      type="number" min="1"
                      value={maxLoan}
                      onChange={(e) => setMaxLoan(e.target.value)}
                      placeholder="e.g. 50000"
                      className="w-full h-9 px-3 border border-[#D9DED0] rounded text-gray-900 font-medium"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">Ceiling for any single loan application.</p>
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">DEFAULT LOAN TERM (MONTHS)</label>
                    <input
                      type="number" min="1" step="1"
                      value={loanTerm}
                      onChange={(e) => setLoanTerm(e.target.value)}
                      placeholder="e.g. 12"
                      className="w-full h-9 px-3 border border-[#D9DED0] rounded text-gray-900 font-medium"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">Pre-selected repayment term for new applications.</p>
                  </div>
                </div>

                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 pt-4 border-t border-[#E2E7DA]">
                  <SettingsIcon size={18} className="text-[#0B5A22]" /> Operations
                </h2>
                <label className="flex items-center justify-between border border-gray-200 rounded-lg px-3 py-2.5 cursor-pointer max-w-md">
                  <span className="font-semibold text-gray-800">Maintenance mode</span>
                  <input
                    type="checkbox"
                    checked={maintenanceMode}
                    onChange={(e) => setMaintenanceMode(e.target.checked)}
                    className="accent-[#0B5A22]"
                  />
                </label>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
