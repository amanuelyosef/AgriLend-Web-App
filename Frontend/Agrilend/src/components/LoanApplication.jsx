import React, { useState, useEffect } from 'react';
import Sidebar from "./Sidebar";
import DashboardHeader from "./DashboardHeader";
import { Plus, ExternalLink, ChevronLeft, ChevronRight, Download, Filter, X, Send, Loader2, CheckCircle2, User } from 'lucide-react';
import api, { submitLoanApplication, fetchApplications, searchFarmers } from "../services/api";

const initialApplications = [];

export default function LoanApplications({ currentPage = "applications", onNavigate, onViewReport, onLogout, currentUser, user }) {
  const activeUser = currentUser || user;
  const [loans, setLoans] = useState(initialApplications);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [farmersList, setFarmersList] = useState([]);
  const [selectedFarmerId, setSelectedFarmerId] = useState("");
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("");
  const [tenure, setTenure] = useState("12");
  const [gracePeriod, setGracePeriod] = useState("0");
  const [repaymentSchedule, setRepaymentSchedule] = useState("monthly");
  const [cropType, setCropType] = useState("Maize");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const [appPage, setAppPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedRegion, setSelectedRegion] = useState("ALL");
  const [selectedCrop, setSelectedCrop] = useState("ALL");
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    async function loadFarmers() {
      try {
        const res = await searchFarmers("", { limit: 100 });
        const list = res.success && Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : (res?.items || []);
        setFarmersList(list);
        if (list.length > 0) {
          setSelectedFarmerId(list[0].id);
          if (list[0].crop_type || list[0].primary_crop) {
            setCropType(list[0].crop_type || list[0].primary_crop);
          }
        }
      } catch (err) {
        console.warn("Failed to load farmers for modal:", err);
      }
    }
    loadFarmers();
  }, []);

  const fetchLoans = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', appPage);
      params.append('page_size', 10);
      if (selectedStatus !== 'ALL') params.append('status', selectedStatus);
      if (selectedRegion !== 'ALL') params.append('region', selectedRegion);
      if (selectedCrop !== 'ALL') params.append('crop_type', selectedCrop);

      const res = await api.get(`/loans/?${params.toString()}`);
      if (res && (res.items || Array.isArray(res))) {
        const itemsList = Array.isArray(res) ? res : (res.items || []);
        const count = Array.isArray(res) ? res.length : (res.total || itemsList.length);
        setLoans(itemsList);
        setTotalCount(count);
      } else {
        const fallbackRes = await fetchApplications();
        if (fallbackRes && fallbackRes.success && Array.isArray(fallbackRes.data)) {
          setLoans(fallbackRes.data);
          setTotalCount(fallbackRes.data.length);
        }
      }
    } catch (err) {
      console.warn("Failed to fetch loans from API:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, [appPage, selectedStatus, selectedRegion, selectedCrop]);

  const handleResetFilters = () => {
    setSelectedStatus("ALL");
    setSelectedRegion("ALL");
    setSelectedCrop("ALL");
    setAppPage(1);
  };

  const handleNewApplicationSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFarmerId) {
      setFormError("Please select a registered farmer.");
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      setFormError("Please enter a valid loan amount.");
      return;
    }
    setIsSubmitting(true);
    setFormError("");
    setFormSuccess("");

    try {
      const res = await submitLoanApplication({
        farmer_id: selectedFarmerId,
        requested_amount: parseFloat(amount),
        purpose: purpose.trim() || `Seasonal credit for ${cropType} production`,
        tenure_months: parseInt(tenure, 10) || 12,
        grace_period_months: parseInt(gracePeriod, 10) || 0,
        repayment_schedule: repaymentSchedule,
      });

      if (res.success || res.id) {
        setFormSuccess("Loan application created successfully!");
        setTimeout(() => {
          setShowModal(false);
          setFormSuccess("");
          setAmount("");
          setPurpose("");
          fetchLoans();
        }, 1200);
      } else {
        setFormError(res.error || "Failed to create loan application.");
      }
    } catch (err) {
      console.warn("Submit application error:", err);
      setFormError(err.message || "Failed to submit loan application.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-[#F5F7F2] overflow-hidden font-sans">
      <Sidebar currentPage={currentPage} onNavigate={onNavigate} onLogout={onLogout} currentUser={activeUser} />

      <div className="flex-1 h-full flex flex-col overflow-y-auto">
        <DashboardHeader
          searchPlaceholder="Search application IDs or farmer names..."
          onLogout={onLogout}
          onNavigate={onNavigate}
          currentUser={activeUser}
        />

        <div className="flex-1 p-6 space-y-6 max-w-[1600px] w-full mx-auto">
          <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-emerald-700">Credit Workflow</p>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight mt-1">Loan Applications Queue</h2>
              <p className="text-xs text-gray-500 mt-1">Manage and review incoming credit requests from regional agricultural sectors.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={handleResetFilters} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"><Filter size={14} /> Reset Filters</button>
              <button type="button" onClick={fetchLoans} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"><Download size={14} /> Refresh List</button>
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="bg-[#1A532E] text-white text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center gap-1.5 hover:bg-[#144224] transition-colors shadow-xs cursor-pointer"
              >
                <Plus size={14} /> Manual Entry
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 tracking-wider mb-1.5 uppercase">STATUS</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => { setSelectedStatus(e.target.value); setAppPage(1); }}
                  className="w-full bg-[#FAFBF7] border border-gray-200 rounded-lg p-2.5 text-xs outline-none focus:ring-1 focus:ring-[#1A532E] font-medium text-gray-700 cursor-pointer"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="DISBURSED">Disbursed</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 tracking-wider mb-1.5 uppercase">CROP TYPE</label>
                <select
                  value={selectedCrop}
                  onChange={(e) => { setSelectedCrop(e.target.value); setAppPage(1); }}
                  className="w-full bg-[#FAFBF7] border border-gray-200 rounded-lg p-2.5 text-xs outline-none focus:ring-1 focus:ring-[#1A532E] font-medium text-gray-700 cursor-pointer"
                >
                  <option value="ALL">All Crops</option>
                  <option value="Maize">Maize</option>
                  <option value="Coffee">Coffee</option>
                  <option value="Sugarcane">Sugarcane</option>
                  <option value="Teff">Teff</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table Card */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 bg-[#FAFBF7] text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Application ID</th>
                    <th className="py-3 px-4">Applicant Name</th>
                    <th className="py-3 px-4">Credit Score</th>
                    <th className="py-3 px-4">Requested Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-700">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-400">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="animate-spin text-[#1A532E]" size={16} />
                          <span>Loading loan application queue...</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    loans.map((item) => {
                      const status = (item.status || "").toUpperCase();
                      return (
                        <tr key={item.id || item.application_id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-gray-900">{item.id || item.application_id || "—"}</td>
                          <td className="py-3.5 px-4 font-semibold text-gray-900">{item.farmer_name || item.name || "—"}</td>
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-[#1A532E] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              {item.credit_score_at_application || item.credit_score_snapshot || item.score || "—"}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-gray-900">
                            {item.requested_amount != null
                              ? `$${Number(item.requested_amount).toLocaleString()}`
                              : item.amount_requested != null
                                ? `$${Number(item.amount_requested).toLocaleString()}`
                                : "—"}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700' :
                              status === 'REJECTED' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                            }`}>
                              {status || "—"}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => onViewReport && onViewReport(item)}
                              className="inline-flex items-center gap-1 text-xs font-bold text-[#1A532E] hover:underline cursor-pointer"
                            >
                              <span>View Evaluation</span>
                              <ExternalLink size={13} />
                            </button>
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
      </div>

      {/* Manual Entry Loan Application Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 animate-fadeIn">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#1A532E] flex items-center justify-center font-bold">
                  <Plus size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Manual Loan Origination</h3>
                  <p className="text-xs text-gray-500">Create a loan application for a verified producer.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {formSuccess && (
              <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>{formSuccess}</span>
              </div>
            )}

            {formError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleNewApplicationSubmit} className="mt-4 space-y-4 text-xs font-sans">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Registered Farmer <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedFarmerId}
                  onChange={(e) => {
                    setSelectedFarmerId(e.target.value);
                    const chosen = farmersList.find(f => f.id === e.target.value);
                    if (chosen && (chosen.primary_crop || chosen.crop_type)) {
                      setCropType(chosen.primary_crop || chosen.crop_type);
                    }
                  }}
                  className="w-full bg-[#FAFBF7] border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#1A532E]/20 focus:border-[#1A532E] font-medium text-gray-800"
                  required
                >
                  {farmersList.length === 0 && <option value="">No registered farmers found</option>}
                  {farmersList.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.full_name || f.name} — {f.region || "Region"} ({f.primary_crop || f.crop_type || "Crop"})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Requested Amount ($/ETB) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    placeholder="e.g. 5000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-[#FAFBF7] border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#1A532E]/20 focus:border-[#1A532E] font-medium text-gray-800"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Target Crop
                  </label>
                  <select
                    value={cropType}
                    onChange={(e) => setCropType(e.target.value)}
                    className="w-full bg-[#FAFBF7] border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#1A532E]/20 focus:border-[#1A532E] font-medium text-gray-800"
                  >
                    <option value="Teff">Teff</option>
                    <option value="Maize">Maize</option>
                    <option value="Coffee">Coffee</option>
                    <option value="Wheat">Wheat</option>
                    <option value="Sugarcane">Sugarcane</option>
                    <option value="Sesame">Sesame</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Loan Purpose / Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. High-yield hybrid seeds and drip irrigation kit"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full bg-[#FAFBF7] border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#1A532E]/20 focus:border-[#1A532E] font-medium text-gray-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Tenure (Months)
                  </label>
                  <select
                    value={tenure}
                    onChange={(e) => setTenure(e.target.value)}
                    className="w-full bg-[#FAFBF7] border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#1A532E]/20 focus:border-[#1A532E] font-medium text-gray-800"
                  >
                    <option value="6">6 Months</option>
                    <option value="12">12 Months (1 Year)</option>
                    <option value="18">18 Months</option>
                    <option value="24">24 Months (2 Years)</option>
                    <option value="36">36 Months (3 Years)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Repayment Schedule
                  </label>
                  <select
                    value={repaymentSchedule}
                    onChange={(e) => setRepaymentSchedule(e.target.value)}
                    className="w-full bg-[#FAFBF7] border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#1A532E]/20 focus:border-[#1A532E] font-medium text-gray-800"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="at_harvest">At Harvest (Bullet)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#1A532E] hover:bg-[#144224] text-white font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-md disabled:opacity-60 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send size={13} />
                      <span>Submit Application</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}