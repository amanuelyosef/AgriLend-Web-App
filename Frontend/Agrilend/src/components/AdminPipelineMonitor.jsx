import React, { useState, useEffect } from "react";
import { Plus, Satellite, CloudRain, Smartphone, Users2, Loader2 } from "lucide-react";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";
import { fetchPipelineStatus, fetchPipelineRuns, triggerPipeline } from "../services/api";

const iconForName = (name = "") => {
  const n = String(name).toLowerCase();
  if (n.includes("satellite")) return Satellite;
  if (n.includes("weather") || n.includes("climate")) return CloudRain;
  if (n.includes("mobile") || n.includes("payment") || n.includes("wallet") || n.includes("telebirr")) return Smartphone;
  return Users2;
};

const statusTone = (status = "") => {
  const s = String(status).toLowerCase();
  if (s.includes("fail") || s.includes("error") || s.includes("down") || s.includes("inactive")) return { text: "text-red-600", badge: "bg-red-50 text-red-700" };
  if (s.includes("run") || s.includes("pending") || s.includes("process") || s.includes("active")) return { text: "text-blue-600", badge: "bg-blue-50 text-blue-700" };
  if (s.includes("success") || s.includes("complete") || s.includes("ok")) return { text: "text-emerald-600", badge: "bg-emerald-50 text-emerald-700" };
  return { text: "text-gray-500", badge: "bg-gray-100 text-gray-600" };
};

const formatDuration = (secs) => {
  if (secs === null || secs === undefined || secs === "") return "—";
  const s = Number(secs);
  if (Number.isNaN(s)) return "—";
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return m > 0 ? `${m}m ${r}s` : `${r}s`;
};

export default function AdminPipelineMonitor({ currentPage = "pipelineMonitor", onNavigate, onLogout }) {
  const [pipelines, setPipelines] = useState([]);
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(null);
  const [actionMsg, setActionMsg] = useState("");
  const [actionError, setActionError] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const [statusRes, runsRes] = await Promise.all([fetchPipelineStatus(), fetchPipelineRuns()]);
    if (statusRes && statusRes.success && Array.isArray(statusRes.data)) {
      setPipelines(statusRes.data);
    }
    if (runsRes && runsRes.success && Array.isArray(runsRes.data)) {
      setRuns(runsRes.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTriggerPipeline = async (pipelineName) => {
    setTriggering(pipelineName);
    setActionMsg("");
    setActionError(false);
    const res = await triggerPipeline(pipelineName);
    if (res && res.success) {
      setActionMsg(res.data && res.data.detail ? res.data.detail : `Pipeline '${pipelineName}' triggered successfully!`);
    } else {
      setActionError(true);
      setActionMsg(`Pipeline '${pipelineName}' could not be triggered: ${(res && res.error) || "unknown error"}`);
    }
    await loadData();
    setTriggering(null);
  };

  return (
    <div className="flex h-screen w-screen bg-[#E6EAE0] overflow-hidden font-sans">
      <AdminSidebar currentPage={currentPage} onNavigate={onNavigate} />
      <main className="flex-1 h-full flex flex-col overflow-y-auto">
        <AdminHeader onLogout={onLogout} onNavigate={onNavigate} />
        <div className="p-3">
          <section className="bg-[#ECEFE5] border border-[#D9DED0] rounded-sm overflow-hidden p-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Data Pipeline Monitor</h1>
                <p className="text-xs text-gray-500 mt-1">Real-time status of satellite, weather, and financial data ingestion streams.</p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onNavigate && onNavigate("adminAddPipeline")}
                  className="flex items-center gap-2 h-9 px-4 rounded bg-[#0B5A22] text-white text-xs font-semibold hover:bg-[#094a1c] cursor-pointer shadow-xs"
                >
                  <Plus size={14} /> Add Data Pipeline
                </button>
              </div>
            </div>

            {actionMsg && (
              <div className={`p-3 border rounded text-xs font-semibold flex items-center justify-between ${actionError ? "bg-red-50 border-red-200 text-red-800" : "bg-emerald-50 border-emerald-200 text-emerald-800"}`}>
                <span>{actionMsg}</span>
                <button onClick={() => setActionMsg("")} className="text-gray-400 text-xs">✕</button>
              </div>
            )}

            {/* Ingestion Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
              {loading && pipelines.length === 0 ? (
                <div className="col-span-full flex items-center justify-center gap-2 py-8 text-xs text-gray-500">
                  <Loader2 size={14} className="animate-spin" /> Loading pipeline status...
                </div>
              ) : pipelines.length === 0 ? (
                <div className="col-span-full bg-white border border-[#D9DED0] rounded-md p-8 text-center text-xs text-gray-500">
                  No pipeline status available.
                </div>
              ) : (
                pipelines.map((p) => {
                  const Icon = iconForName(p.pipeline_name);
                  const tone = statusTone(p.status);
                  return (
                    <div key={p.pipeline_name || p.id} className="bg-white border border-[#D9DED0] rounded-md p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon size={16} className="text-[#0B5A22]" />
                          <span className="text-xs font-bold text-gray-800">{p.pipeline_name || "—"}</span>
                        </div>
                        <span className={`text-[10px] font-bold ${tone.text}`}>{p.status || "—"}</span>
                      </div>

                      <div className="space-y-1 text-[11px]">
                        <div className="flex justify-between text-gray-600"><span>Last Run</span><span className="font-semibold text-gray-900">{p.last_run || "—"}</span></div>
                        <div className="flex justify-between text-gray-600"><span>Success Rate</span><span className="font-semibold text-gray-900">{p.success_rate != null ? `${p.success_rate}%` : "—"}</span></div>
                        <div className="flex justify-between text-gray-600"><span>Total Runs</span><span className="font-semibold text-gray-900">{p.total_runs ?? "—"}</span></div>
                        <div className="flex justify-between text-gray-600"><span>Failed Runs</span><span className="font-semibold text-gray-900">{p.failed_runs ?? "—"}</span></div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleTriggerPipeline(p.pipeline_name)}
                        disabled={triggering}
                        className="w-full py-1.5 bg-[#EEF2E7] hover:bg-[#E2E7DA] text-[#0B5A22] text-[11px] font-bold rounded cursor-pointer transition-colors disabled:opacity-60"
                      >
                        {triggering === p.pipeline_name ? "Triggering..." : "Sync Stream Now"}
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Execution History */}
            <div className="bg-white border border-[#D9DED0] rounded-md overflow-hidden">
              <div className="px-4 py-3 border-b border-[#E2E7DA] flex items-center justify-between">
                <h2 className="text-sm font-bold text-gray-800">Pipeline Execution Runs</h2>
                <span className="text-xs font-bold text-[#0B5A22]">{runs.length} Runs</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[9px] font-bold uppercase tracking-wider text-gray-500 bg-[#F7F8F4] border-b border-[#E2E7DA]">
                      <th className="px-4 py-2.5">Run ID</th>
                      <th className="px-4 py-2.5">Pipeline Name</th>
                      <th className="px-4 py-2.5">Start Time</th>
                      <th className="px-4 py-2.5">Duration</th>
                      <th className="px-4 py-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs divide-y divide-[#E2E7DA]">
                    {loading && runs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-6 text-center text-gray-400">Loading runs...</td>
                      </tr>
                    ) : runs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-6 text-center text-gray-400">No pipeline runs yet.</td>
                      </tr>
                    ) : (
                      runs.map((run) => {
                        const tone = statusTone(run.status);
                        return (
                          <tr key={run.id} className="hover:bg-gray-50/60">
                            <td className="px-4 py-3 font-mono font-bold text-gray-900">{run.id ?? "—"}</td>
                            <td className="px-4 py-3 font-medium text-gray-800">{run.pipeline_name || "—"}</td>
                            <td className="px-4 py-3 text-gray-500 font-mono text-[11px]">{run.started_at || "—"}</td>
                            <td className="px-4 py-3 text-gray-600">{formatDuration(run.duration_seconds)}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${tone.badge}`}>{run.status || "—"}</span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
