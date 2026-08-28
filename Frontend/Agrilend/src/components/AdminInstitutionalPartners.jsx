import React, { useState, useEffect } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import ConfirmDialog from "./ConfirmDialog";
import { fetchInstitutionalPartners, createInstitutionalPartner, fetchBankDetail } from "../services/api.js";
import {
  Building2,
  CheckCircle2,
  Plus,
  Search,
  Radio,
  Trash2,
  ArrowLeft,
  Check,
  Zap,
  Building,
  Percent,
  UserCheck,
  Eye,
  ArrowRight
} from "lucide-react";

export default function AdminInstitutionalPartners({ currentPage, onNavigate, onLogout }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreatingPage, setIsCreatingPage] = useState(false);
  const [partnerAdded, setPartnerAdded] = useState(null);
  const [activeStep, setActiveStep] = useState(1);

  const [partners, setPartners] = useState([]);
  const [loadingPartners, setLoadingPartners] = useState(true);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [selectedBank, setSelectedBank] = useState(null);
  const [loadingBankDetail, setLoadingBankDetail] = useState(false);

  const openBankDetail = async (bankId) => {
    setLoadingBankDetail(true);
    setSelectedBank(null);
    const res = await fetchBankDetail(bankId);
    if (res && res.success && res.data) {
      setSelectedBank(res.data);
    }
    setLoadingBankDetail(false);
  };

  // Bank creation form state: institution, lending terms, and its single analyst account
  const [formData, setFormData] = useState({
    bankName: "",
    subscriptionTier: "standard",
    interestRate: "",
    analystFullName: "",
    analystEmail: "",
    analystPassword: "",
  });
  const [formErrors, setFormErrors] = useState({});

  const FIELD_VALIDATORS = {
    bankName: (v) =>
      v.trim().length < 2 ? "Institution name must be at least 2 characters." : "",
    interestRate: (v) => {
      if (String(v).trim() === "") return "Annual interest rate is required.";
      const rate = parseFloat(v);
      if (Number.isNaN(rate)) return "Interest rate must be a number.";
      if (rate <= 0 || rate > 100) return "Interest rate must be between 0.01 and 100.";
      return "";
    },
    analystFullName: (v) =>
      v.trim().length < 2 ? "Analyst full name must be at least 2 characters." : "",
    analystEmail: (v) => {
      const email = v.trim();
      if (!email) return "Analyst email is required.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return "Enter a valid email address (e.g. analyst@bank.com).";
      return "";
    },
    analystPassword: (v) => {
      if (!v) return "Password is required.";
      if (v.length < 6) return "Password must be at least 6 characters.";
      return "";
    },
  };

  const STEP_FIELDS = {
    1: ["bankName"],
    2: ["interestRate"],
    3: ["analystFullName", "analystEmail", "analystPassword"],
  };

  const sanitizeRate = (value) => {
    const cleaned = value.replace(/[^0-9.]/g, "");
    const parts = cleaned.split(".");
    return parts.length > 2 ? `${parts[0]}.${parts.slice(1).join("")}` : cleaned;
  };

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Immediate feedback: validate format on every keystroke (empty-field errors
    // wait for blur / Next so they don't spam while the user is still typing).
    setFormErrors((prev) => {
      const message = FIELD_VALIDATORS[field](value);
      if (message && String(value).trim() !== "") {
        return { ...prev, [field]: message };
      }
      if (!message && prev[field]) {
        const next = { ...prev };
        delete next[field];
        return next;
      }
      return prev;
    });
  };

  const handleFieldBlur = (field) => {
    setFormErrors((prev) => {
      const message = FIELD_VALIDATORS[field](formData[field]);
      if (message) return { ...prev, [field]: message };
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const validateFields = (fields) => {
    const errors = {};
    fields.forEach((field) => {
      const message = FIELD_VALIDATORS[field](formData[field]);
      if (message) errors[field] = message;
    });
    return errors;
  };

  const handleStepNext = () => {
    const errors = validateFields(STEP_FIELDS[activeStep]);
    setFormErrors(errors);
    if (Object.keys(errors).length === 0 && activeStep < 3) {
      setActiveStep(activeStep + 1);
    }
  };

  const handleDeletePartner = (id) => {
    setPendingDelete(partners.find((p) => p.id === id) || null);
  };

  const confirmDeletePartner = () => {
    if (pendingDelete) {
      setPartners((prev) => prev.filter((p) => p.id !== pendingDelete.id));
    }
    setPendingDelete(null);
  };

  async function loadPartners() {
    const res = await fetchInstitutionalPartners();
    if (res && res.success && Array.isArray(res.data)) {
      setPartners(res.data);
    }
    setLoadingPartners(false);
  }

  useEffect(() => {
    loadPartners();
  }, []);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const errors = validateFields(Object.keys(FIELD_VALIDATORS));
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      const firstErrorField = Object.keys(FIELD_VALIDATORS).find((f) => errors[f]);
      const firstInvalidStep = Object.entries(STEP_FIELDS).find(([, fields]) =>
        fields.includes(firstErrorField)
      );
      if (firstInvalidStep) setActiveStep(Number(firstInvalidStep[0]));
      return;
    }
    const res = await createInstitutionalPartner(formData);
    setIsCreatingPage(false);
    setActiveStep(1);
    setFormErrors({});

    if (res && res.success) {
      await loadPartners();
      setPartnerAdded(`Bank '${formData.bankName}' created successfully with analyst account ${formData.analystEmail}.`);
    } else {
      setPartnerAdded(`Failed to create bank: ${(res && res.error) || "unknown error"}`);
    }

    // Reset form
    setFormData({
      bankName: "",
      subscriptionTier: "standard",
      interestRate: "",
      analystFullName: "",
      analystEmail: "",
      analystPassword: "",
    });

    setTimeout(() => setPartnerAdded(null), 5000);
  };

  const activePartnerCount = partners.filter((p) => String(p.status || "").toLowerCase() === "active" || p.status === true).length;

  const filteredPartners = partners.filter(
    (p) =>
      String(p.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(p.subscription_tier || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen w-screen bg-[#F4F6F0] overflow-hidden font-sans">
      <AdminSidebar currentPage={currentPage} onNavigate={onNavigate} />

      <main className="flex-1 h-full flex flex-col overflow-y-auto">
        <AdminHeader onLogout={onLogout} onNavigate={onNavigate} activeTabName="Institutional Partners" />

        {/* FULL PAGE ADDING / ONBOARDING WORKSPACE */}
        {isCreatingPage ? (
          <div className="p-6 max-w-5xl w-full mx-auto space-y-6 animate-fadeIn">
            {/* Navigation Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setIsCreatingPage(false)}
                  className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center cursor-pointer transition-colors shrink-0"
                  title="Back to Partner Network"
                >
                  <ArrowLeft size={18} />
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest bg-emerald-50 text-[#0B5A22] px-2.5 py-0.5 rounded-full border border-emerald-100">
                      Bank Onboarding
                    </span>
                    <span className="text-xs font-mono font-bold text-gray-400">Step {activeStep} of 3</span>
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 tracking-tight mt-1">
                    Create Bank Partner
                  </h1>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Register the institution, set its lending interest rate, and provision its analyst login account.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsCreatingPage(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>

            {/* Wizard Steps Progress Header */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { step: 1, label: "Institution", desc: "Name & Tier", icon: Building },
                { step: 2, label: "Lending Terms", desc: "Interest Rate", icon: Percent },
                { step: 3, label: "Analyst Account", desc: "Login Credentials", icon: UserCheck }
              ].map((s) => {
                const Icon = s.icon;
                const isActive = activeStep === s.step;
                const isPassed = activeStep > s.step;
                return (
                  <button
                    key={s.step}
                    type="button"
                    onClick={() => setActiveStep(s.step)}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#0B5A22] text-white border-[#0B5A22] shadow-md"
                        : isPassed
                        ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                        isActive ? "bg-white/20 text-white" : isPassed ? "bg-emerald-200 text-emerald-900" : "bg-gray-100 text-gray-600"
                      }`}>
                        {isPassed ? <Check size={16} /> : s.step}
                      </div>
                      <Icon size={16} className={isActive ? "text-emerald-300" : isPassed ? "text-emerald-700" : "text-gray-400"} />
                    </div>
                    <p className="text-xs font-bold truncate">{s.label}</p>
                    <p className={`text-[10px] mt-0.5 truncate ${isActive ? "text-emerald-200" : "text-gray-400"}`}>{s.desc}</p>
                  </button>
                );
              })}
            </div>

            {/* Standard Multi-Step Form */}
            <form onSubmit={handleFormSubmit} className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm space-y-8">
              
              {/* STEP 1: INSTITUTION PROFILE */}
              {activeStep === 1 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="pb-4 border-b border-gray-100 flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                        <Building size={18} className="text-[#0B5A22]" /> Institution Identity
                      </h2>
                      <p className="text-xs text-gray-500 mt-1">
                        Enter the registered financial institution name. The name is permanent once created.
                      </p>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                      Step 1 of 3
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        Institution Legal Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Commercial Bank of Ethiopia (CBE)"
                        value={formData.bankName}
                        onChange={(e) => updateField("bankName", e.target.value)}
                        onBlur={() => handleFieldBlur("bankName")}
                        className={`w-full p-3 rounded-xl border text-xs font-semibold text-gray-900 focus:bg-white outline-none transition-all ${
                          formErrors.bankName
                            ? "border-red-400 bg-red-50 focus:border-red-500"
                            : "bg-[#FAFBF8] focus:border-[#0B5A22]"
                        }`}
                      />
                      {formErrors.bankName && (
                        <p className="text-[10px] font-semibold text-red-600 mt-1">{formErrors.bankName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        Subscription Tier
                      </label>
                      <select
                        value={formData.subscriptionTier}
                        onChange={(e) => setFormData({ ...formData, subscriptionTier: e.target.value })}
                        className="w-full p-3 rounded-xl border border-gray-200 bg-[#FAFBF8] text-xs font-semibold text-gray-900 focus:bg-white focus:border-[#0B5A22] outline-none transition-all"
                      >
                        <option value="standard">Standard</option>
                        <option value="enterprise">Enterprise</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      type="button"
                      onClick={handleStepNext}
                      className="px-6 py-2.5 bg-[#0B5A22] hover:bg-[#084519] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md"
                    >
                      Next: Lending Terms <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: LENDING TERMS */}
              {activeStep === 2 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="pb-4 border-b border-gray-100 flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                        <Percent size={18} className="text-[#0B5A22]" /> Lending Interest Rate
                      </h2>
                      <p className="text-xs text-gray-500 mt-1">
                        Annual interest rate applied to approved loans. Used to compute the total amount payable at approval time. Can be changed later in bank settings.
                      </p>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                      Step 2 of 3
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        Annual Interest Rate (%) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        inputMode="decimal"
                        placeholder="e.g. 8.50"
                        value={formData.interestRate}
                        onChange={(e) => updateField("interestRate", sanitizeRate(e.target.value))}
                        onBlur={() => handleFieldBlur("interestRate")}
                        className={`w-full p-3 rounded-xl border text-xs font-bold text-gray-900 focus:bg-white outline-none transition-all ${
                          formErrors.interestRate
                            ? "border-red-400 bg-red-50 focus:border-red-500"
                            : "bg-[#FAFBF8] focus:border-[#0B5A22]"
                        }`}
                      />
                      {formErrors.interestRate && (
                        <p className="text-[10px] font-semibold text-red-600 mt-1">{formErrors.interestRate}</p>
                      )}
                      {!formErrors.interestRate && (
                        <p className="text-[10px] text-gray-400 mt-1.5">
                          Numbers only, between 0.01 and 100. Example: a 10,000 ETB loan at 8.5% requires repaying 10,850 ETB.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between pt-4 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setActiveStep(1)}
                      className="px-5 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleStepNext}
                      className="px-6 py-2.5 bg-[#0B5A22] hover:bg-[#084519] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md"
                    >
                      Next: Analyst Account <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: ANALYST ACCOUNT */}
              {activeStep === 3 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="pb-4 border-b border-gray-100 flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                        <UserCheck size={18} className="text-[#0B5A22]" /> Bank Analyst Login Account
                      </h2>
                      <p className="text-xs text-gray-500 mt-1">
                        Each bank gets exactly one login account. The analyst can rename themselves later but cannot change the institution name.
                      </p>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                      Final Step 3
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        Analyst Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Abebe Kebede"
                        value={formData.analystFullName}
                        onChange={(e) => updateField("analystFullName", e.target.value)}
                        onBlur={() => handleFieldBlur("analystFullName")}
                        className={`w-full p-3 rounded-xl border text-xs font-semibold text-gray-900 focus:bg-white outline-none transition-all ${
                          formErrors.analystFullName
                            ? "border-red-400 bg-red-50 focus:border-red-500"
                            : "bg-[#FAFBF8] focus:border-[#0B5A22]"
                        }`}
                      />
                      {formErrors.analystFullName && (
                        <p className="text-[10px] font-semibold text-red-600 mt-1">{formErrors.analystFullName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        Analyst Email (Login) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        placeholder="e.g. analyst@bank.com.et"
                        value={formData.analystEmail}
                        onChange={(e) => updateField("analystEmail", e.target.value)}
                        onBlur={() => handleFieldBlur("analystEmail")}
                        className={`w-full p-3 rounded-xl border text-xs font-semibold text-gray-900 focus:bg-white outline-none transition-all ${
                          formErrors.analystEmail
                            ? "border-red-400 bg-red-50 focus:border-red-500"
                            : "bg-[#FAFBF8] focus:border-[#0B5A22]"
                        }`}
                      />
                      {formErrors.analystEmail && (
                        <p className="text-[10px] font-semibold text-red-600 mt-1">{formErrors.analystEmail}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        Initial Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        placeholder="Minimum 6 characters"
                        value={formData.analystPassword}
                        onChange={(e) => updateField("analystPassword", e.target.value)}
                        onBlur={() => handleFieldBlur("analystPassword")}
                        className={`w-full p-3 rounded-xl border text-xs font-semibold text-gray-900 focus:bg-white outline-none transition-all ${
                          formErrors.analystPassword
                            ? "border-red-400 bg-red-50 focus:border-red-500"
                            : "bg-[#FAFBF8] focus:border-[#0B5A22]"
                        }`}
                      />
                      {formErrors.analystPassword && (
                        <p className="text-[10px] font-semibold text-red-600 mt-1">{formErrors.analystPassword}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between pt-4 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setActiveStep(2)}
                      className="px-5 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="px-8 py-3 bg-[#0B5A22] hover:bg-[#084519] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-lg hover:shadow-xl"
                    >
                      <Zap size={16} /> Create Bank Partner
                    </button>
                  </div>
                </div>
              )}

            </form>


          </div>
        ) : loadingBankDetail || selectedBank ? (
          /* BANK PARTNER DETAIL VIEW */
          <div className="p-6 max-w-5xl w-full mx-auto space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => { setSelectedBank(null); setLoadingBankDetail(false); }}
                  className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center cursor-pointer transition-colors shrink-0"
                  title="Back to Partner Network"
                >
                  <ArrowLeft size={18} />
                </button>
                <div>
                  {loadingBankDetail || !selectedBank ? (
                    <>
                      <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Loading partner...</h1>
                      <p className="text-xs text-gray-500 mt-0.5">Fetching institution profile from database.</p>
                    </>
                  ) : (
                    <>
                      <span className="text-[10px] font-extrabold uppercase tracking-widest bg-emerald-50 text-[#0B5A22] px-2.5 py-0.5 rounded-full border border-emerald-100">
                        Institutional Partner Record
                      </span>
                      <h1 className="text-2xl font-bold text-gray-900 tracking-tight mt-1">{selectedBank.bank?.bank_name}</h1>
                      <p className="text-xs text-gray-500 mt-0.5 font-mono">{selectedBank.bank?.id}</p>
                    </>
                  )}
                </div>
              </div>

              {!loadingBankDetail && selectedBank && (
                <span className={`px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider border shrink-0 ${selectedBank.bank?.is_active ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-gray-50 text-gray-500 border-gray-200"}`}>
                  {selectedBank.bank?.is_active ? "Active Partner" : "Inactive"}
                </span>
              )}
            </div>

            {!loadingBankDetail && selectedBank && (
              <>
                {/* Institution profile + loan stats */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
                    <h2 className="text-xs font-extrabold uppercase tracking-wider text-gray-500 flex items-center gap-1.5 pb-3 border-b border-gray-100">
                      <Building2 size={16} className="text-[#0B5A22]" /> Institution Profile
                    </h2>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase font-bold">Legal Name</span>
                        <span className="font-bold text-gray-900">{selectedBank.bank?.bank_name}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase font-bold">Subscription Tier</span>
                        <span className="font-semibold text-gray-900 capitalize">{selectedBank.bank?.subscription_tier || "—"}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase font-bold">Annual Interest Rate</span>
                        <span className="font-bold text-[#0B5A22]">{selectedBank.bank?.interest_rate != null ? `${Number(selectedBank.bank.interest_rate).toFixed(2)}%` : "—"}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase font-bold">Onboarded</span>
                        <span className="font-semibold text-gray-700">{selectedBank.bank?.onboarding_date ? new Date(selectedBank.bank.onboarding_date).toLocaleDateString() : "—"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
                    <h2 className="text-xs font-extrabold uppercase tracking-wider text-gray-500 flex items-center gap-1.5 pb-3 border-b border-gray-100">
                      <Percent size={16} className="text-[#0B5A22]" /> Loan Book
                    </h2>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-[#FAFBF8] border border-gray-200 rounded-xl p-3">
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Total Loans</p>
                        <p className="text-lg font-extrabold text-gray-900">{selectedBank.loan_stats?.total_loans ?? 0}</p>
                      </div>
                      <div className="bg-[#FAFBF8] border border-gray-200 rounded-xl p-3">
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Approved</p>
                        <p className="text-lg font-extrabold text-emerald-700">{selectedBank.loan_stats?.approved_loans ?? 0}</p>
                      </div>
                      <div className="bg-[#FAFBF8] border border-gray-200 rounded-xl p-3">
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Requested Volume</p>
                        <p className="text-base font-extrabold text-gray-900">${Number(selectedBank.loan_stats?.total_requested || 0).toLocaleString()}</p>
                      </div>
                      <div className="bg-[#FAFBF8] border border-gray-200 rounded-xl p-3">
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Repayable Total</p>
                        <p className="text-base font-extrabold text-[#0B5A22]">${Number(selectedBank.loan_stats?.repayment_total || 0).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Analyst accounts */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2"><UserCheck size={15} className="text-[#0B5A22]" /> Analyst Login Accounts</h2>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{(selectedBank.analysts || []).length} account(s)</span>
                  </div>
                  {(selectedBank.analysts || []).length === 0 ? (
                    <p className="px-5 py-6 text-center text-xs text-gray-500">No analyst accounts provisioned for this institution yet.</p>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {selectedBank.analysts.map((a) => (
                        <div key={a.id} className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <p className="text-xs font-bold text-gray-900">{a.full_name}</p>
                            <p className="text-[11px] text-gray-500 font-mono">{a.email}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-semibold text-gray-400">Joined {a.created_at ? new Date(a.created_at).toLocaleDateString() : "—"}</span>
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${a.is_active ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-600 border-red-200"}`}>
                              {a.is_active ? "Active" : "Suspended"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ) : (
          /* OTHERWISE: STANDARD INSTITUTIONAL PARTNERS DIRECTORY LISTING */
          <div className="p-6 max-w-7xl w-full mx-auto space-y-6">
            {/* Header Section */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
              <div className="absolute right-0 top-0 w-96 h-full bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none" />

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#0B5A22] text-white flex items-center justify-center shadow-md shrink-0">
                  <Building2 size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest bg-emerald-50 text-[#0B5A22] px-2.5 py-0.5 rounded-full border border-emerald-100">
                      Partner Network Mesh
                    </span>
                    <span className="text-xs font-mono font-bold text-gray-400">{partners.length} Live Gateways</span>
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 tracking-tight mt-1">
                    Institutional Partners & Liquidity Mesh
                  </h1>
                  <p className="text-xs text-gray-500 mt-1 max-w-2xl leading-relaxed">
                    Manage commercial bank partners, regional agricultural credit coops, and digital mobile wallet payout gateways integrated into AgriLend.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => { setFormData({
                    bankName: "",
                    subscriptionTier: "standard",
                    interestRate: "",
                    analystFullName: "",
                    analystEmail: "",
                    analystPassword: "",
                  }); setFormErrors({}); setIsCreatingPage(true); }}
                  className="px-5 py-2.5 bg-[#0B5A22] hover:bg-[#084519] text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md hover:shadow-lg"
                >
                  <Plus size={16} /> Add Institutional Partner
                </button>
              </div>
            </div>

            {partnerAdded && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-3 animate-fadeIn">
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                <span>{partnerAdded}</span>
              </div>
            )}

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Active Gateways</p>
                  <p className="text-2xl font-extrabold text-gray-900 mt-1">{loadingPartners ? "…" : activePartnerCount}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shadow-2xs">
                  <Building2 size={20} />
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Total Partners</p>
                  <p className="text-2xl font-extrabold text-emerald-700 mt-1">{loadingPartners ? "…" : partners.length}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shadow-2xs">
                  <Radio size={20} />
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Avg Interest Rate</p>
                  <p className="text-2xl font-extrabold text-gray-900 mt-1">
                    {loadingPartners
                      ? "…"
                      : partners.length
                      ? `${(partners.reduce((s, p) => s + Number(p.interest_rate || 0), 0) / partners.length).toFixed(2)}%`
                      : "—"}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shadow-2xs">
                  <Percent size={20} />
                </div>
              </div>
            </div>

            {/* Table of Partners */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h3 className="text-xs font-extrabold text-gray-800 uppercase tracking-wider">
                  Integrated Partner Roster
                </h3>
                <div className="relative w-full sm:w-72">
                  <Search size={14} className="absolute left-3.5 top-3 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search partner name or region..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2 bg-[#FAFBF8] border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-[#0B5A22]"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500 bg-[#F8FAFB] border-b border-gray-200">
                      <th className="px-5 py-3.5">Partner ID</th>
                      <th className="px-5 py-3.5">Institution Legal Name</th>
                      <th className="px-5 py-3.5">Subscription Tier</th>
                      <th className="px-5 py-3.5">Interest Rate</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs divide-y divide-gray-100 font-medium">
                    {loadingPartners ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-8 text-center text-gray-400">Loading partners...</td>
                      </tr>
                    ) : filteredPartners.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-8 text-center text-gray-400">No institutional partners found.</td>
                      </tr>
                    ) : (
                      filteredPartners.map((p) => {
                        const isActive = String(p.status || "").toLowerCase() === "active" || p.status === true;
                        return (
                          <tr key={p.id} className="hover:bg-emerald-50/40 transition-colors">
                            <td className="px-5 py-4 font-mono font-bold text-[#0B5A22]">{p.id || "—"}</td>
                            <td className="px-5 py-4 font-bold text-gray-900">
                              <div>{p.name || "—"}</div>
                              <span className="text-[10px] font-mono text-gray-400 font-normal">Onboarded: {p.onboarding_date || "—"}</span>
                            </td>
                            <td className="px-5 py-4 text-gray-600">{p.subscription_tier || "—"}</td>
                            <td className="px-5 py-4 font-mono font-bold text-gray-900">
                              {p.interest_rate != null ? `${Number(p.interest_rate).toFixed(2)}%` : "—"}
                            </td>
                            <td className="px-5 py-4">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase ${isActive ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-gray-50 text-gray-500 border border-gray-200"}`}>
                                {isActive ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => openBankDetail(p.id)}
                                  className="px-3.5 py-1.5 bg-[#0B5A22] hover:bg-[#084519] text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-xs inline-flex items-center gap-1.5"
                                >
                                  <Eye size={13} /> View
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeletePartner(p.id)}
                                  className="text-red-400 hover:text-red-600 inline-flex cursor-pointer transition-colors p-1"
                                  title="Remove Partner"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      <ConfirmDialog
        open={!!pendingDelete}
        title="Remove Institutional Partner?"
        message={`"${pendingDelete?.name || "This partner"}" will be removed from the network. This action cannot be undone.`}
        confirmLabel="Remove Partner"
        onConfirm={confirmDeletePartner}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
