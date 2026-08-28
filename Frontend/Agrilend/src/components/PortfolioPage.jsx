import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import DashboardHeader from "./DashboardHeader";
import { BarChart3, ShieldCheck, PieChart, Download, CalendarDays, Layers } from "lucide-react";
import api, { fetchPortfolioSummary } from "../services/api";

const segmentStatusBadge = (status) => {
  const s = String(status || "").toLowerCase();
  if (s === "critical") return "bg-red-50 text-red-700";
  if (s === "high") return "bg-orange-50 text-orange-700";
  if (s === "moderate") return "bg-amber-50 text-amber-700";
  return "bg-emerald-50 text-emerald-700";
};

export default function PortfolioPage({ currentPage, onNavigate, onLogout, currentUser, user }) {
  const activeUser = currentUser || user;
  const [summary, setSummary] = useState(null);
  const [dashReport, setDashReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadPortfolio = async () => {
    setLoading(true);
    const [res, dash] = await Promise.allSettled([fetchPortfolioSummary(), api.get("/loans/reports/dashboard")]);
    if (res.status === "fulfilled" && res.value && res.value.success && res.value.data) {
      setSummary(res.value.data);
    }
    if (dash.status === "fulfilled" && dash.value) {
      setDashReport(dash.value);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadPortfolio();
  }, []);

  const holdings = (summary && summary.holdings) || [];
  const allocations = (summary && summary.allocations) || [];
  const segments = (summary && summary.segments) || [];

  // Real portfolio-health metrics derived from backend exposure numbers
  const approvedTotal = Number(summary?.approved_total ?? 0);
  const pendingTotal = Number(summary?.pending_total ?? 0);
  const atRiskTotal = Number(summary?.at_risk_total ?? 0);
  const totalBook = approvedTotal + pendingTotal;
  const atRiskPct = totalBook > 0 ? Math.min(100, Math.round((atRiskTotal / totalBook) * 100)) : 0;
  const maxCropPct = allocations.reduce((mx, a) => Math.max(mx, Number(a.pct) || 0), 0);
  const diversificationScore = maxCropPct > 0 ? Math.max(0, 100 - maxCropPct) : null;
  const concentrationLabel =
    maxCropPct >= 70 ? "Severe" : maxCropPct >= 50 ? "High" : maxCropPct >= 30 ? "Moderate" : maxCropPct > 0 ? "Low" : "—";
  const riskBufferPct = 100 - atRiskPct;

  return (
    <div className="flex h-screen w-screen bg-[#F5F7F2] overflow-hidden">
      <Sidebar currentPage={currentPage} onNavigate={onNavigate} onLogout={onLogout} currentUser={activeUser} />
      <div className="flex-1 h-full flex flex-col overflow-y-auto">
        <DashboardHeader showBack onBack={() => onNavigate("dashboard")} backText="Back to Dashboard" onLogout={onLogout} currentUser={activeUser} onNavigate={onNavigate} />


        <div className="p-6 space-y-6 max-w-[1600px] w-full mx-auto">
          <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-emerald-700">Portfolio Monitor</p>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight mt-1">Portfolio Page</h1>
              <p className="text-xs text-gray-500 mt-1">Watch exposure, performance, and recovery across the lending book.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-600 hover:bg-gray-50"><CalendarDays size={14} /> This Month</button>
              <button type="button" className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-600 hover:bg-gray-50"><Download size={14} /> Export</button>
              <button type="button" onClick={loadPortfolio} disabled={loading} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1A532E] text-white text-xs font-semibold hover:bg-[#144023] disabled:opacity-60"><BarChart3 size={14} /> {loading ? "Loading..." : "Refresh Metrics"}</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {holdings.map((item) => (
              <div key={item.name} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">{item.name}</p>
                    <h3 className="text-3xl font-extrabold text-gray-900 mt-2">{item.value ?? "—"}</h3>
                  </div>
                  {item.change ? (
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${item.bg || "bg-gray-50"} ${item.tone || "text-gray-400"}`}>{item.change}</span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-gray-800">Portfolio mix</h2>
                  <p className="text-[11px] text-gray-500 mt-0.5">Exposure by crop and sector.</p>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider"><PieChart size={14} className="text-gray-400" />Allocation overview</div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 mt-5">
                <div className="lg:col-span-3">
                  {allocations.length === 0 ? (
                    <p className="text-xs text-gray-500 py-4">No allocation data available.</p>
                  ) : (
                    <div className="space-y-3">
                      {allocations.map((item) => (
                        <div key={item.label}>
                          <div className="flex items-center justify-between text-xs mb-1.5"><span className="font-semibold text-gray-700">{item.label}</span><span className="font-bold text-gray-900">{item.pct}%</span></div>
                          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden"><div className={`h-full ${item.color || "bg-emerald-600"}`} style={{ width: `${item.pct}%` }}></div></div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="lg:col-span-2 bg-[#FAFBF5] border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-gray-700"><Layers size={16} className="text-emerald-700" /><h3 className="text-sm font-bold">Portfolio health</h3></div>
                  <div className="mt-4 space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Diversification score</span>
                      <span className="font-semibold text-gray-900">{loading ? "…" : diversificationScore != null ? `${diversificationScore}/100` : "—"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Concentration risk</span>
                      <span className={`font-semibold ${concentrationLabel === "Low" ? "text-emerald-700" : concentrationLabel === "—" ? "text-gray-400" : "text-amber-600"}`}>
                        {loading ? "…" : concentrationLabel === "—" ? "—" : `${concentrationLabel} (${maxCropPct}% top crop)`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Approval coverage</span>
                      <span className="font-semibold text-emerald-700">{loading ? "…" : summary?.recovery_rate != null ? `${summary.recovery_rate}%` : "—"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">At-risk share of book</span>
                      <span className={`font-semibold ${atRiskPct > 25 ? "text-red-600" : "text-emerald-700"}`}>{loading ? "…" : `${atRiskPct}%`}</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2"><span>Risk buffer</span><span>{loading ? "" : `${riskBufferPct}%`}</span></div>
                    <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden"><div className="h-full bg-[#1A532E]" style={{ width: `${totalBook > 0 ? riskBufferPct : 0}%` }}></div></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#1A532E] flex items-center justify-center text-white"><ShieldCheck size={18} /></div>
                  <div><p className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">Stability signal</p><h3 className="text-base font-bold text-gray-900">{loading ? "…" : dashReport?.avg_score != null ? `Avg score ${dashReport.avg_score}` : "No score data"}</h3></div>
                </div>
                <div className="mt-4 space-y-2 text-xs text-gray-500">
                  <p>Based on credit scores snapshotted across your institution's loan applications.</p>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <h3 className="text-sm font-bold text-gray-800">Performance snapshot</h3>
                <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-[#FAFBF5] border border-gray-200 rounded-lg p-3"><p className="text-gray-500">Approved</p><p className="font-bold text-emerald-700 mt-1">{loading ? "…" : dashReport?.approved ?? "—"}</p></div>
                  <div className="bg-[#FAFBF5] border border-gray-200 rounded-lg p-3"><p className="text-gray-500">Pending</p><p className="font-bold text-amber-600 mt-1">{loading ? "…" : dashReport?.pending ?? "—"}</p></div>
                  <div className="bg-[#FAFBF5] border border-gray-200 rounded-lg p-3"><p className="text-gray-500">Rejected</p><p className="font-bold text-gray-900 mt-1">{loading ? "…" : dashReport?.rejected ?? "—"}</p></div>
                  <div className="bg-[#FAFBF5] border border-gray-200 rounded-lg p-3"><p className="text-gray-500">Disbursed</p><p className="font-bold text-blue-700 mt-1">{loading ? "…" : dashReport?.disbursed ?? "—"}</p></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-gray-800">Portfolio exposure table</h2>
                <p className="text-[11px] text-gray-500 mt-0.5">Regional segments ranked by exposure in the current book.</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100"><th className="px-5 py-3">Segment</th><th className="px-5 py-3">Exposure</th><th className="px-5 py-3">Avg Score</th><th className="px-5 py-3">Status</th></tr>
                </thead>
                <tbody className="text-xs">
                  {segments.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-5 py-6 text-center text-gray-400">No segment data available.</td>
                    </tr>
                  ) : (
                    segments.map((row) => (
                      <tr key={row.name} className="border-b border-gray-50 hover:bg-gray-50/60">
                        <td className="px-5 py-4 font-semibold text-gray-900">{row.name ?? "—"}</td>
                        <td className="px-5 py-4 text-gray-600">{row.exposure != null ? `$${Number(row.exposure).toLocaleString()}` : "—"}</td>
                        <td className="px-5 py-4 font-semibold text-gray-900">{row.score > 0 ? row.score : "—"}</td>
                        <td className="px-5 py-4">
                          {row.status ? (
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${segmentStatusBadge(row.status)}`}>{row.status}</span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-gray-50 text-gray-500">—</span>
                          )}
                        </td>
                      </tr>
                    ))
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
