import React, { useState, useEffect } from "react";
import {
  Users,
  FileClock,
  ShieldAlert,
  SlidersHorizontal,
  Link2,
  FileText,
  Settings,
  ArrowUpRight,
  Download,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";
import api, { fetchAdminFarmersQueue, fetchCommandLogs, fetchMLDriftStatus } from "../services/api.js";

const topMetrics = [
  {
    key: "farmerTotal",
    label: "Total Registered Farmers",
    value: "—",
    change: "Live database",
    changeTone: "text-emerald-600",
    icon: Users,
    iconBg: "bg-emerald-50 text-emerald-700",
  },
  {
    key: "kycPending",
    label: "Pending KYC Reviews",
    value: "—",
    change: "Needs attention",
    changeTone: "text-red-600",
    icon: ShieldAlert,
    iconBg: "bg-red-50 text-red-600",
  },
  {
    key: "activeLoans",
    label: "Active Loan Portfolio",
    value: "—",
    change: "Live database",
    changeTone: "text-emerald-600",
    icon: FileClock,
    iconBg: "bg-amber-50 text-amber-600",
  },
];

const modules = [
  { label: "User Management", desc: "Review farmer KYC and verification queue", icon: Users, slug: "userManagement" },
  { label: "Pipeline Monitor", desc: "Track live credit decision processing", icon: FileClock, slug: "pipelineMonitor" },
  { label: "ML Performance", desc: "Model accuracy and drift telemetry", icon: SlidersHorizontal, slug: "mlPerformance" },
  { label: "Partner Onboarding", desc: "Integrate financial institutions", icon: Link2, slug: "partnerOnboarding" },
  { label: "System Reports", desc: "Comprehensive compliance & risk reporting", icon: FileText, slug: "reports" },
  { label: "System Settings", desc: "Platform settings and user profile controls", icon: Settings, slug: "systemSettings" },
];

export default function AdminDashboard({
  currentPage = "admin",
  onNavigate,
  onLogout,
  currentUser,
  user,
}) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [stats, setStats] = useState({ farmerTotal: "—", kycPending: "—", activeLoans: "—" });
  const [activityLog, setActivityLog] = useState([]);
  const [systemAlerts, setSystemAlerts] = useState([]);

  const loadTelemetry = async () => {
    try {
      let farmerTotal = "—";
      try {
        const farmersReport = await api.get("/admin/reports/farmers");
        if (farmersReport && farmersReport.total_registered != null) farmerTotal = farmersReport.total_registered;
      } catch { /* report endpoint may be unavailable */ }

      let kycPending = "—";
      try {
        const queue = await fetchAdminFarmersQueue("PENDING");
        if (queue && queue.success && Array.isArray(queue.data)) kycPending = queue.data.length;
      } catch { /* queue endpoint may be unavailable */ }

      let activeLoans = "—";
      try {
        const loansReport = await api.get("/loans/reports/dashboard");
        if (loansReport) activeLoans = (loansReport.approved || 0) + (loansReport.disbursed || 0);
      } catch { /* dashboard endpoint may be unavailable */ }

      setStats({ farmerTotal, kycPending, activeLoans });
    } catch { /* stats fetch failed */ }

    try {
      const logsRes = await fetchCommandLogs(5);
      if (logsRes && logsRes.success && Array.isArray(logsRes.data)) {
        setActivityLog(
          logsRes.data.map((log) => ({
            text: log.command ? `$ ${log.command}${log.output ? ` — ${log.output}` : ""}` : (log.output || "—"),
            time: log.executed_at ? new Date(log.executed_at).toLocaleString() : "—",
            icon: log.status === "FAILED" ? AlertTriangle : CheckCircle2,
            tone: log.status === "FAILED" ? "text-red-600" : "text-emerald-600",
          }))
        );
      }
    } catch { /* command logs endpoint may be unavailable */ }

    try {
      const driftRes = await fetchMLDriftStatus();
      if (driftRes && driftRes.success && driftRes.data) {
        const d = driftRes.data;
        const next = [];
        if (d.feature_drift_detected || d.score_drift_detected) {
          next.push({ title: "Model Drift Notice", detail: d.recommended_action || "Drift detected", tone: "bg-blue-50 border-blue-200 text-blue-800", target: "mlPerformance" });
        } else if (d.drift_score != null) {
          next.push({ title: "Model Drift Status", detail: `Drift score ${d.drift_score} — ${d.recommended_action || "within bounds"}`, tone: "bg-blue-50 border-blue-200 text-blue-800", target: "mlPerformance" });
        }
        setSystemAlerts(next);
      }
    } catch { /* drift endpoint may be unavailable */ }
  };

  useEffect(() => {
    loadTelemetry();
  }, []);

  const handleRefreshData = async () => {
    setIsRefreshing(true);
    await Promise.all([loadTelemetry()]);
    setTimeout(() => {
      setIsRefreshing(false);
      setToastMessage("Dashboard telemetry updated live from database.");
      setTimeout(() => setToastMessage(null), 3000);
    }, 600);
  };

  const handleExportReport = () => {
    const csvContent = `data:text/csv;charset=utf-8,Metric,Value\nTotal Farmers,${stats.farmerTotal}\nPending KYC Reviews,${stats.kycPending}\nActive Loan Portfolio,${stats.activeLoans}\n`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "agrilend_system_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex h-screen w-screen bg-[#E6EAE0] overflow-hidden font-sans">
      <AdminSidebar currentPage={currentPage} onNavigate={onNavigate} />

      <main className="flex-1 h-full flex flex-col overflow-y-auto">
        <AdminHeader onLogout={onLogout} onNavigate={onNavigate} currentUser={currentUser || user} />

        <div className="p-3">
          <section className="bg-[#ECEFE5] border border-[#D9DED0] rounded-sm overflow-hidden">
            <div className="p-4 space-y-4">
              <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-emerald-700">Technical Command</p>
                  <h1 className="text-2xl font-bold text-gray-900 tracking-tight mt-1">Admin Overview</h1>
                  <p className="text-xs text-gray-500 mt-1">
                    Platform-wide health, backend stats, and operational command.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleExportReport}
                    className="flex items-center gap-2 h-9 px-4 rounded border border-[#CFD5C7] bg-white text-xs font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer transition-all shadow-xs"
                    title="Download System Telemetry Report (CSV)"
                  >
                    <Download size={14} /> Export Report
                  </button>
                  <button
                    type="button"
                    onClick={handleRefreshData}
                    disabled={isRefreshing}
                    className="flex items-center gap-2 h-9 px-4 rounded bg-[#0B5A22] text-white text-xs font-semibold hover:bg-[#094a1c] cursor-pointer transition-all shadow-xs disabled:opacity-75"
                    title="Fetch live updates from database"
                  >
                    <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
                    <span>{isRefreshing ? "Refreshing..." : "Refresh Data"}</span>
                  </button>
                </div>
              </div>

              {toastMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded shadow-sm flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  <span>{toastMessage}</span>
                </div>
              )}

              {/* Top Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {topMetrics.map((m) => {
                  const Icon = m.icon;
                  return (
                    <div key={m.label} className="bg-white border border-[#D9DED0] rounded-md p-4 flex justify-between items-start">
                      <div className="space-y-1">
                        <p className="text-[9px] font-bold text-gray-400 tracking-wider uppercase">{m.label}</p>
                        <h3 className="text-2xl font-bold text-gray-900 tracking-tight">{stats[m.key] ?? m.value}</h3>
                        <p className={`text-[11px] font-semibold ${m.changeTone}`}>{m.change}</p>
                      </div>
                      <div className={`p-2 rounded-lg ${m.iconBg}`}>
                        <Icon size={16} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pending Registration Applications Alert Banner */}              {/* Admin Modules */}
              <div className="bg-white border border-[#D9DED0] rounded-md p-4">
                <h2 className="text-sm font-bold text-gray-800 mb-3">Admin Modules</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  {modules.map((m) => {
                    const Icon = m.icon;
                    return (
                      <button
                        key={m.slug}
                        type="button"
                        onClick={() => onNavigate && onNavigate(m.slug)}
                        className="text-left border border-[#D9DED0] rounded-md p-3 hover:border-[#0B5A22] hover:bg-[#F7F9F4] transition-colors group cursor-pointer"
                      >
                        <div className="flex items-start justify-between">
                          <span className="w-8 h-8 rounded bg-[#EEF2E7] border border-[#D7DDCC] flex items-center justify-center text-[#1E6A3D]">
                            <Icon size={15} />
                          </span>
                          <ArrowUpRight size={14} className="text-gray-300 group-hover:text-[#0B5A22] transition-colors" />
                        </div>
                        <p className="text-xs font-bold text-gray-800 mt-2">{m.label}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5 leading-snug">{m.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Activity + Alerts */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
                <div className="xl:col-span-2 bg-white border border-[#D9DED0] rounded-md p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-bold text-gray-800">Recent Activity</h2>
                    <button
                      type="button"
                      onClick={() => onNavigate && onNavigate("reports")}
                      className="text-[11px] font-semibold text-[#1A532E] hover:underline cursor-pointer"
                    >
                      View Full Log
                    </button>
                  </div>
                  <div className="space-y-0 divide-y divide-[#EEF1E8]">
                    {activityLog.length === 0 ? (
                      <p className="py-6 text-center text-[11px] text-gray-400">No recent command activity.</p>
                    ) : (
                      activityLog.map((a, i) => {
                        const Icon = a.icon;
                        return (
                          <div key={i} className="flex items-start gap-3 py-2.5">
                            <Icon size={14} className={`mt-0.5 shrink-0 ${a.tone}`} />
                            <p className="text-[12px] text-gray-700 flex-1 break-words">{a.text}</p>
                            <span className="text-[10px] text-gray-400 whitespace-nowrap">{a.time}</span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="bg-white border border-[#D9DED0] rounded-md p-4">
                  <h2 className="text-sm font-bold text-gray-800 mb-3">System Alerts</h2>
                  <div className="space-y-2">
                    {systemAlerts.length === 0 ? (
                      <p className="text-[11px] text-gray-400">No active system alerts.</p>
                    ) : (
                      systemAlerts.map((a, i) => (
                        <div
                          key={i}
                          onClick={() => {
                            if (!onNavigate || !a.target) return;
                            onNavigate(a.target);
                          }}
                          className={`border rounded-md px-3 py-2.5 ${a.tone} hover:shadow-sm cursor-pointer transition-all`}
                          title="Click to investigate"
                        >
                          <p className="text-[11px] font-bold flex items-center justify-between">
                            <span>{a.title}</span>
                            <ArrowUpRight size={12} className="opacity-70" />
                          </p>
                          <p className="text-[10px] mt-0.5 opacity-90">{a.detail}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom summary panels */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                {/* 1. Yield Prediction Accuracy Card */}
                <div
                  onClick={() => onNavigate && onNavigate("mlPerformance")}
                  className="bg-white border border-[#D9DED0] rounded-md p-3.5 hover:border-[#0B5A22] hover:shadow-md cursor-pointer transition-all group"
                  title="Click to view full ML Model Performance & Accuracy telemetry"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-gray-800 group-hover:text-[#0B5A22] transition-colors">
                      Yield Prediction Accuracy
                    </p>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                      View telemetry
                    </span>
                  </div>
                  <div className="mt-3 h-28 bg-[#EDF0E8] rounded flex items-center justify-center">
                    <p className="text-[11px] text-gray-500">No yield time-series telemetry available.</p>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-2.5 flex items-center justify-between">
                    <span>Open ML Performance for model accuracy and drift telemetry.</span>
                    <ArrowUpRight size={13} className="text-gray-400 group-hover:text-[#0B5A22] shrink-0" />
                  </p>
                </div>

                {/* 2. Regional Risk Map Card */}
                <div
                  onClick={() => onNavigate && onNavigate("riskHeatmap")}
                  className="bg-white border border-[#D9DED0] rounded-md p-3.5 hover:border-[#0B5A22] hover:shadow-md cursor-pointer transition-all group"
                  title="Click to view interactive Regional Risk Heatmap"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-gray-800 group-hover:text-[#0B5A22] transition-colors">
                      Regional Risk Map
                    </p>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                      Live GIS Stream
                    </span>
                  </div>

                  <div className="mt-3 h-28 bg-gradient-to-r from-[#0B3E4B] via-[#0E5A58] to-[#113942] rounded relative overflow-hidden flex items-center justify-center border border-teal-900/50 group-hover:opacity-95 transition-all">
                    <div
                      className="absolute inset-0 opacity-40"
                      style={{
                        backgroundImage: "radial-gradient(circle, rgba(74,222,128,0.8) 1px, transparent 1px)",
                        backgroundSize: "12px 12px",
                      }}
                    ></div>
                    <div className="relative z-10 text-center px-3">
                      <p className="text-xs font-bold text-emerald-300 font-mono">EAST AFRICA AGRI-GRID</p>
                      <p className="text-[9px] text-teal-100/80 mt-0.5">Click to launch geospatial risk index map</p>
                    </div>
                  </div>

                  <div className="mt-2.5 space-y-1 text-[10px]">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Central Highlands</span>
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        —
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Eastern Borderlands</span>
                      <span className="text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                        —
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
