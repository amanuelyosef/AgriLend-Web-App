import React, { useState, useEffect } from "react";
import {
  Map,
  Landmark,
  Users,
  Leaf,
  CalendarDays,
  SlidersHorizontal,
  Zap,
  Download,
  Loader2,
} from "lucide-react";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";
import api from "../services/api";

const reportEndpoints = {
  FARMERS: "/admin/reports/farmers",
  LOANS: "/admin/reports/loans",
  CREDIT_SCORES: "/admin/reports/credit-scores",
  RISK: "/admin/reports/risk",
};

const monthLabel = (key) => {
  const [y, m] = String(key || "").split("-").map(Number);
  if (!y || !m) return key || "—";
  return new Date(y, m - 1, 1).toLocaleDateString(undefined, { month: "short", year: "numeric" });
};

const REPORT_FIELDS = {
  FARMERS: [
    ["total_registered", "Total Registered Farmers"],
    ["consented", "Consent Signed"],
    ["with_land_proof", "Land Proof Verified"],
    ["with_mobile_money", "Mobile Money Linked"],
  ],
  LOANS: [
    ["total", "Total Applications"],
    ["approved", "Approved"],
    ["rejected", "Rejected"],
    ["pending", "Pending"],
    ["disbursed", "Disbursed"],
  ],
  CREDIT_SCORES: [
    ["average_score", "Average Score"],
    ["min_score", "Minimum Score"],
    ["max_score", "Maximum Score"],
    ["total_farmers_scored", "Farmers Scored"],
  ],
  RISK: [
    ["total_active_loans", "Active Loans"],
    ["high_risk_count", "High Risk"],
    ["medium_risk_count", "Medium Risk"],
    ["low_risk_count", "Low Risk"],
  ],
};

function KVGrid({ fields, data }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {fields.map(([key, label]) => (
        <div key={key} className="bg-[#FAFBF7] border border-gray-200 rounded-lg p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}</p>
          <p className="text-xl font-extrabold text-gray-900 mt-1">{data?.[key] ?? "—"}</p>
        </div>
      ))}
    </div>
  );
}

function GenericTable({ title, rows }) {
  if (!rows || (Array.isArray(rows) && rows.length === 0)) return null;
  const entries = Array.isArray(rows)
    ? rows.map((r, i) => [r.name || r.region || r.label || `#${i + 1}`, typeof r === "object" ? Object.entries(r).filter(([k]) => !["name", "region", "label"].includes(k)).map(([k, v]) => `${k}: ${v}`).join(", ") : String(r)])
    : Object.entries(rows);
  if (entries.length === 0) return null;
  return (
    <div className="mt-4">
      <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">{title}</h4>
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#F8FAFB] border-b border-gray-200">
              <th className="px-3 py-2 font-extrabold uppercase tracking-wider text-gray-500">Segment</th>
              <th className="px-3 py-2 font-extrabold uppercase tracking-wider text-gray-500">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {entries.map(([k, v]) => (
              <tr key={String(k)} className="hover:bg-gray-50/60">
                <td className="px-3 py-2 font-semibold text-gray-900">{k}</td>
                <td className="px-3 py-2 text-gray-600 font-mono text-[11px]">{v || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StructuredReport({ reportKey, data }) {
  if (!data) return null;
  const fields = REPORT_FIELDS[reportKey];
  return (
    <div className="space-y-4">
      {fields ? <KVGrid fields={fields} data={data} /> : null}
      {reportKey === "CREDIT_SCORES" && (
        <GenericTable title="Regional Score Distribution" rows={data.regional_distribution} />
      )}
      {reportKey === "RISK" && (
        <GenericTable title="Geo Risk Clusters" rows={data.geo_risk_clusters} />
      )}
    </div>
  );
}

export default function AdminReports({ currentPage, onNavigate, onLogout }) {
  const [selectedReport, setSelectedReport] = useState("MONTHLY");
  const [reportData, setReportData] = useState(null);
  const [monthlyData, setMonthlyData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchMonthly = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/reports/monthly?months=12");
      setMonthlyData(Array.isArray(res) ? res : res?.data || []);
    } catch {
      setMonthlyData(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchReport = async () => {
    setLoading(true);
    try {
      const endpoint = reportEndpoints[selectedReport];
      const res = await api.get(endpoint);
      setReportData(res);
    } catch (err) {
      console.error(`Failed to fetch report ${selectedReport}:`, err);
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedReport === "MONTHLY") {
      fetchMonthly();
    } else {
      fetchReport();
    }
  }, [selectedReport]);

  const exportMonthlyCsv = () => {
    if (!Array.isArray(monthlyData)) return;
    const header = "Month,Farmers Registered,Loans Submitted,Loans Approved,Loans Rejected,Loans Disbursed,Amount Requested,Repayment Total";
    const rows = monthlyData.map((r) =>
      [r.month, r.farmers_registered, r.loans_submitted, r.loans_approved, r.loans_rejected, r.loans_disbursed, r.amount_requested, r.repayment_total].join(",")
    );
    const csvContent = `data:text/csv;charset=utf-8,${[header, ...rows].join("\n")}`;
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "agrilend_monthly_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const maxSubmitted = Array.isArray(monthlyData)
    ? Math.max(1, ...monthlyData.map((r) => Number(r.loans_submitted) || 0))
    : 1;
  const maxFarmers = Array.isArray(monthlyData)
    ? Math.max(1, ...monthlyData.map((r) => Number(r.farmers_registered) || 0))
    : 1;

  return (
    <div className="flex h-screen w-screen bg-[#E6EAE0] overflow-hidden font-sans">
      <AdminSidebar currentPage={currentPage} onNavigate={onNavigate} />

      <main className="flex-1 h-full flex flex-col overflow-y-auto">
        <AdminHeader onLogout={onLogout} onNavigate={onNavigate} />

        <div className="p-3">
          <section className="bg-[#ECEFE5] border border-[#D9DED0] rounded-sm overflow-hidden p-4 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">System Reporting Engine</h1>
                <p className="text-xs text-gray-500 mt-1">
                  Fetch live operational, risk, credit score, and farmer onboarding reports directly from the backend.
                </p>
              </div>
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                BACKEND API READY
              </span>
            </div>

            {/* Report Type Selection Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
              {[
                { key: "MONTHLY", title: "Monthly Report", desc: "Per-month farmer registrations and loan activity for the trailing 12 months.", icon: CalendarDays },
                { key: "FARMERS", title: "Farmer Onboarding", desc: "Farmer registration, consent & land verification metrics.", icon: Users },
                { key: "LOANS", title: "Loan Activity Report", desc: "Submitted, approved, rejected & disbursed loan breakdown.", icon: Landmark },
                { key: "CREDIT_SCORES", title: "Credit Score Distribution", desc: "Min, max, average scores & regional score clusters.", icon: Map },
                { key: "RISK", title: "Portfolio Risk Report", desc: "Default rate, active risk tiers & GeoJSON clusters.", icon: Leaf },
              ].map((r) => {
                const Icon = r.icon;
                const isSelected = selectedReport === r.key;
                return (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => setSelectedReport(r.key)}
                    className={`text-left bg-white rounded-md p-4 border transition-colors cursor-pointer ${
                      isSelected ? "border-l-4 border-l-[#0B5A22] border-t border-r border-b border-[#D9DED0] shadow-sm" : "border-[#D9DED0] hover:border-gray-300"
                    }`}
                  >
                    <Icon size={20} className="text-[#0B5A22]" />
                    <p className="text-sm font-bold text-gray-800 mt-3">{r.title}</p>
                    <p className="text-[11px] text-gray-500 mt-1 leading-snug">{r.desc}</p>
                  </button>
                );
              })}
            </div>

            {/* Monthly Report Viewer */}
            {selectedReport === "MONTHLY" && (
              <div className="bg-white border border-[#D9DED0] rounded-md p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-[#E2E7DA] pb-3">
                  <h2 className="text-base font-bold text-gray-800">MONTHLY ACTIVITY — TRAILING 12 MONTHS</h2>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={exportMonthlyCsv}
                      className="flex items-center gap-1.5 h-8 px-3 border border-[#CFD5C7] bg-white text-xs font-semibold text-gray-600 rounded hover:bg-gray-50 cursor-pointer"
                    >
                      <Download size={13} /> Export CSV
                    </button>
                    <button
                      type="button"
                      onClick={fetchMonthly}
                      className="flex items-center gap-1.5 h-8 px-3 bg-[#0B5A22] text-white text-xs font-semibold rounded hover:bg-[#094a1c] cursor-pointer"
                    >
                      <Zap size={13} /> Refresh Report Data
                    </button>
                  </div>
                </div>

                {loading ? (
                  <div className="py-12 text-center text-gray-400 flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin text-[#0B5A22]" size={18} />
                    <span>Generating monthly report...</span>
                  </div>
                ) : !Array.isArray(monthlyData) || monthlyData.length === 0 ? (
                  <p className="text-xs text-gray-400 py-6 text-center">No monthly data returned.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500 bg-[#F8FAFB] border-b border-[#E2E7DA]">
                          <th className="px-4 py-3">Month</th>
                          <th className="px-4 py-3">Farmers Registered</th>
                          <th className="px-4 py-3">Loans Submitted</th>
                          <th className="px-4 py-3">Approved</th>
                          <th className="px-4 py-3">Rejected</th>
                          <th className="px-4 py-3">Disbursed</th>
                          <th className="px-4 py-3 text-right">Amount Requested</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs divide-y divide-[#EEF1E8]">
                        {monthlyData.map((row) => {
                          const submitted = Number(row.loans_submitted) || 0;
                          const farmers = Number(row.farmers_registered) || 0;
                          return (
                            <tr key={row.month} className="hover:bg-[#F7F9F4] transition-colors">
                              <td className="px-4 py-3 font-bold text-gray-900">{monthLabel(row.month)}</td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-gray-800 w-6">{farmers}</span>
                                  <div className="w-24 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                                    <div className="h-full bg-blue-500" style={{ width: `${(farmers / maxFarmers) * 100}%` }}></div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-gray-800 w-6">{submitted}</span>
                                  <div className="w-24 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                                    <div className="h-full bg-[#0B5A22]" style={{ width: `${(submitted / maxSubmitted) * 100}%` }}></div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 font-semibold text-emerald-700">{row.loans_approved}</td>
                              <td className="px-4 py-3 font-semibold text-red-600">{row.loans_rejected}</td>
                              <td className="px-4 py-3 font-semibold text-blue-700">{row.loans_disbursed}</td>
                              <td className="px-4 py-3 text-right font-mono font-semibold text-gray-900">
                                ${Number(row.amount_requested || 0).toLocaleString()}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Report Data Viewer */}
            {selectedReport !== "MONTHLY" && (
            <div className="bg-white border border-[#D9DED0] rounded-md p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[#E2E7DA] pb-3">
                <h2 className="text-base font-bold text-gray-800">
                  {selectedReport.replace("_", " ")} REPORT OUTPUT
                </h2>
                <button
                  type="button"
                  onClick={fetchReport}
                  className="flex items-center gap-1.5 h-8 px-3 bg-[#0B5A22] text-white text-xs font-semibold rounded hover:bg-[#094a1c] cursor-pointer"
                >
                  <Zap size={13} /> Refresh Report Data
                </button>
              </div>

              {loading ? (
                <div className="py-12 text-center text-gray-400 flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin text-[#0B5A22]" size={18} />
                  <span>Generating backend report...</span>
                </div>
              ) : reportData ? (
                <StructuredReport reportKey={selectedReport} data={reportData} />
              ) : (
                <p className="text-xs text-gray-400 py-6 text-center">No data returned for this report.</p>
              )}
            </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
