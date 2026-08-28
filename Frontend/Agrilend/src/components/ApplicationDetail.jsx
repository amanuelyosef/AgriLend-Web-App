import React, { useState, useEffect } from 'react';
import Sidebar from "./Sidebar";
import DashboardHeader from "./DashboardHeader";
import { Phone, MapPin, Sprout, Layers, CheckCircle2, AlertTriangle, XCircle, ThumbsUp, Loader2, Download, FileText } from 'lucide-react';
import { fetchApplicationById, updateApplicationStatus } from "../services/api.js";

export default function ApplicationDetail({ application, currentPage, onNavigate, onLogout, onBack, currentUser, user }) {
  const activeUser = currentUser || user;
  const [loading, setLoading] = useState(false);
  const [appData, setAppData] = useState(application || {});
  const [actionStatus, setActionStatus] = useState(null);
  const [downloadingReport, setDownloadingReport] = useState(false);

  useEffect(() => {
    async function loadDetail() {
      if (application?.id) {
        setLoading(true);
        try {
          const res = await fetchApplicationById(application.id);
          if (res && res.success && res.data) {
            setAppData((prev) => ({ ...prev, ...res.data }));
          }
        } catch (err) {
          console.warn("Failed to fetch application detail:", err);
        } finally {
          setLoading(false);
        }
      }
    }
    loadDetail();
  }, [application]);

  const handleDecision = async (decision) => {
    setActionStatus(`Processing ${decision}...`);
    try {
      if (appData?.id) {
        await updateApplicationStatus(appData.id, decision);
        setAppData((prev) => ({ ...prev, status: String(decision).toUpperCase() }));
      }
      setActionStatus(`Loan Application #${appData?.id || appData?.application_id || "—"} marked as ${decision.toUpperCase()} successfully!`);
    } catch (err) {
      console.error(err);
      setActionStatus(`Application decision updated locally to ${decision.toUpperCase()}.`);
    } finally {
      setTimeout(() => setActionStatus(null), 4000);
    }
  };

  const handleDownloadPDFReport = () => {
    setDownloadingReport(true);
    setTimeout(() => {
      setDownloadingReport(false);
      const reportText = `AGRILEND CREDIT EVALUATION REPORT\nApplication ID: ${appId}\nFarmer Name: ${farmerName}\nFarm: ${appData?.farm || "—"}\nCredit Score: ${creditScore}\nRisk Tier: ${riskTier}\nRequested Amount: ${requestedAmount}\nSatellite NDVI Score: Not available\nGenerated: ${new Date().toLocaleString()}`;

      const blob = new Blob([reportText], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `AgriLend_Credit_Report_${appId}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 800);
  };

  const farmerName = appData?.farmer_name || appData?.name || "—";
  const appId = appData?.id || appData?.application_id || "—";
  const phone = appData?.farmer_phone || appData?.phone || "—";
  const region = appData?.farmer_region || appData?.region || "—";
  const crop = appData?.farmer_crop || appData?.crop_type || "—";
  const requestedAmount = appData?.requested_amount != null
    ? `$${Number(appData.requested_amount).toLocaleString()}`
    : appData?.amount_requested != null
      ? `$${Number(appData.amount_requested).toLocaleString()}`
      : "—";
  const repaymentAmount = appData?.repayment_amount != null
    ? `$${Number(appData.repayment_amount).toLocaleString()}`
    : null;
  const interestApplied = appData?.interest_rate_applied != null
    ? `${Number(appData.interest_rate_applied).toFixed(2)}%`
    : null;
  const loanStatus = (appData?.status || "").toUpperCase();
  const creditScore = appData?.credit_score_snapshot ?? appData?.credit_score_at_application ?? appData?.credit_score_current ?? appData?.score ?? "—";
  const riskTier = appData?.risk_tier || "—";
  const initials = farmerName !== "—" && farmerName
    ? farmerName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : "—";

  return (
    <div className="flex h-screen w-screen bg-[#F5F7F2] overflow-hidden font-sans">
      <Sidebar currentPage={currentPage} onNavigate={onNavigate} onLogout={onLogout} currentUser={activeUser} />

      <div className="flex-1 h-full flex flex-col overflow-y-auto">
        <DashboardHeader showBack onBack={onBack} backText="Back to Pipeline" onLogout={onLogout} currentUser={activeUser} onNavigate={onNavigate} />

        <div className="p-6 space-y-5 max-w-[1400px] w-full mx-auto">
          {actionStatus && (
            <div className="bg-[#1A532E] text-white p-3 rounded-lg text-xs font-bold flex items-center justify-between shadow-md animate-fadeIn">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-400" />
                <span>{actionStatus}</span>
              </div>
            </div>
          )}

          {/* Header Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center shadow-sm gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#1A532E] text-white rounded-xl flex items-center justify-center shadow-inner font-bold text-lg">
                {initials}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">{farmerName}</h2>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 mt-1">
                  <span className="flex items-center gap-1"><Phone size={12} /> {phone}</span>
                  <span className="flex items-center gap-1"><MapPin size={12} /> {region}</span>
                  <span className="flex items-center gap-1"><Sprout size={12} /> {crop}</span>
                  <span className="flex items-center gap-1"><Layers size={12} /> Requested: {requestedAmount}</span>
                </div>
              </div>
            </div>
            <div className="text-right shrink-0 flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadPDFReport}
                disabled={downloadingReport}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#EEF2E7] hover:bg-[#E2E7DA] text-[#1A532E] text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                {downloadingReport ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                <span>Export Report</span>
              </button>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md tracking-wider border ${
                ["APPROVED", "DISBURSED"].includes(loanStatus)
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : loanStatus === "REJECTED"
                  ? "bg-red-50 text-red-700 border-red-200"
                  : "bg-amber-50 text-amber-800 border-amber-200"
              }`}>
                {loanStatus || "PENDING"} APPLICATION: #{appId}
              </span>
            </div>
          </div>

          {/* Metric Overview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Credit Score</p>
              <h3 className="text-3xl font-extrabold text-[#1A532E] mt-2">{creditScore}</h3>
              <p className="text-[11px] text-emerald-700 font-semibold mt-1">{riskTier}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Loan Purpose</p>
              <h3 className="text-lg font-bold text-gray-900 mt-2">{appData?.loan_purpose || "—"}</h3>
              <p className="text-[11px] text-gray-500 mt-1">Seasonal Working Capital</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Requested Amount</p>
              <h3 className="text-3xl font-extrabold text-gray-900 mt-2">{requestedAmount}</h3>
              <p className="text-[11px] text-gray-500 mt-1">Repayment Term: 12 Mo</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Payable</p>
              <h3 className={`text-3xl font-extrabold mt-2 ${repaymentAmount ? "text-[#1A532E]" : "text-gray-400"}`}>
                {repaymentAmount || "—"}
              </h3>
              <p className="text-[11px] font-semibold mt-1 text-emerald-700">
                {interestApplied
                  ? `Principal + ${interestApplied} annual interest`
                  : "Computed at loan approval"}
              </p>
            </div>
          </div>

          {/* Officer Decision Action Panel */}
          {["APPROVED", "REJECTED", "DISBURSED"].includes(loanStatus) ? (
            <div className={`rounded-xl p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 border ${
              loanStatus === "REJECTED"
                ? "bg-red-50 border-red-200"
                : loanStatus === "DISBURSED"
                ? "bg-blue-50 border-blue-200"
                : "bg-emerald-50 border-emerald-200"
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  loanStatus === "REJECTED" ? "bg-red-100 text-red-700" : loanStatus === "DISBURSED" ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"
                }`}>
                  {loanStatus === "REJECTED" ? <XCircle size={20} /> : <CheckCircle2 size={20} />}
                </div>
                <div>
                  <h4 className={`text-sm font-bold ${loanStatus === "REJECTED" ? "text-red-900" : loanStatus === "DISBURSED" ? "text-blue-900" : "text-emerald-900"}`}>
                    {loanStatus === "APPROVED" && "Loan Approved"}
                    {loanStatus === "DISBURSED" && "Loan Disbursed"}
                    {loanStatus === "REJECTED" && "Application Rejected"}
                  </h4>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {loanStatus === "REJECTED"
                      ? "This application was rejected and is read-only."
                      : repaymentAmount
                      ? `Total payable: ${repaymentAmount}${interestApplied ? ` (incl. ${interestApplied} annual interest)` : ""}. No further action required.`
                      : "This application has been decided and is read-only."}
                  </p>
                </div>
              </div>

              {loanStatus === "APPROVED" && (
                <button
                  type="button"
                  onClick={() => handleDecision("disbursed")}
                  className="px-5 py-2 bg-[#1A532E] hover:bg-[#144224] text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-md"
                >
                  Mark as Disbursed
                </button>
              )}
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-gray-900">Credit Committee Action Required</h4>
                <p className="text-xs text-gray-500 mt-0.5">Approve or reject this pending application.</p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleDecision("rejected")}
                  className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-bold transition-all cursor-pointer"
                >
                  Reject Application
                </button>
                <button
                  type="button"
                  onClick={() => handleDecision("approved")}
                  className="px-5 py-2 bg-[#1A532E] hover:bg-[#144224] text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-md"
                >
                  Approve Loan Request
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}