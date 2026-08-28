import React, { useState, useEffect } from 'react';
import Sidebar from "./Sidebar";
import DashboardHeader from "./DashboardHeader";
import { Plus, ExternalLink, ChevronLeft, ChevronRight, Download, Filter, X, Send, Loader2 } from 'lucide-react';
import api, { submitLoanApplication, fetchApplications } from "../services/api";

const initialApplications = [];

export default function LoanApplications({ currentPage = "applications", onNavigate, onViewReport, onLogout, currentUser, user }) {
  const activeUser = currentUser || user;
  const [loans, setLoans] = useState(initialApplications);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [farmerName, setFarmerName] = useState("");
  const [farmName, setFarmName] = useState("");
  const [amount, setAmount] = useState("");
  const [cropType, setCropType] = useState("Maize");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [appPage, setAppPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedRegion, setSelectedRegion] = useState("ALL");
  const [selectedCrop, setSelectedCrop] = useState("ALL");
  const [totalCount, setTotalCount] = useState(0);

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
    if (!farmerName.trim() || !amount) return;
    setIsSubmitting(true);
    try {
      await submitLoanApplication({
        farmerName,
        farmName,
        requested_amount: parseFloat(amount),
        cropType,
      });
      setShowModal(false);
      setFarmerName("");
      setFarmName("");
      setAmount("");
      fetchLoans();
    } catch (err) {
      console.warn("Submit application fallback:", err);
      setShowModal(false);
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
    </div>
  );
}