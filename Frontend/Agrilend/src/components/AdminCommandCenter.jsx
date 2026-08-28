import React, { useState, useEffect } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import { executeAdminCommand, fetchCommandLogs } from "../services/api.js";
import {
  Terminal,
  Cpu,
  Server,
  Play,
  CheckCircle2,
  Database,
  Radio
} from "lucide-react";

export default function AdminCommandCenter({ currentPage, onNavigate, onLogout }) {
  const [commandLog, setCommandLog] = useState([]);

  const [commandInput, setCommandInput] = useState("");
  const [triggerStatus, setTriggerStatus] = useState(null);

  const loadCommandLogs = async () => {
    const res = await fetchCommandLogs(50);
    if (res && res.success && Array.isArray(res.data)) {
      const formatted = res.data.map((log) => ({
        id: log.id || `${log.executed_at || "log"}-${log.command || ""}`,
        type: log.status || "SYS",
        msg: log.command
          ? (log.output ? `$ ${log.command} — ${log.output}` : `$ ${log.command}`)
          : (log.output || "—"),
        time: (() => {
          if (!log.executed_at) return "—";
          const d = new Date(log.executed_at);
          return Number.isNaN(d.getTime()) ? log.executed_at : d.toLocaleString();
        })(),
      }));
      setCommandLog(formatted);
    } else {
      setCommandLog([]);
    }
  };

  useEffect(() => {
    loadCommandLogs();
  }, []);

  const handleRunCommand = async (e) => {
    e.preventDefault();
    if (!commandInput.trim()) return;
    const cmd = commandInput;
    const res = await executeAdminCommand(cmd);
    setCommandInput("");
    setTriggerStatus(
      res && res.success
        ? `Command '${cmd}' executed successfully.`
        : `Command '${cmd}' failed${res && res.error ? `: ${res.error}` : ""}.`
    );
    await loadCommandLogs();
    setTimeout(() => setTriggerStatus(null), 3500);
  };

  const handleActionTrigger = async (actionName) => {
    const res = await executeAdminCommand(actionName);
    setTriggerStatus(
      res && res.success
        ? `Command '${actionName}' executed successfully on live production cluster.`
        : `Command '${actionName}' failed${res && res.error ? `: ${res.error}` : ""}.`
    );
    await loadCommandLogs();
    setTimeout(() => setTriggerStatus(null), 3500);
  };

  return (
    <div className="flex h-screen w-screen bg-[#0D1612] text-[#E6ECE2] overflow-hidden font-sans antialiased select-none">
      <AdminSidebar currentPage={currentPage} onNavigate={onNavigate} />

      <main className="flex-1 h-full flex flex-col overflow-y-auto">
        <AdminHeader onLogout={onLogout} onNavigate={onNavigate} activeTabName="Admin Command" />

        <div className="p-6 space-y-6 max-w-7xl w-full mx-auto">
          {/* Header */}
          <div className="bg-[#14211B] border border-[#22352B] rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  ROOT LIVE TERMINAL
                </span>
                <span className="text-xs text-gray-400">Node AWS-EU-WEST-1</span>
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight mt-1 font-sans">Admin Command & Control Center</h1>
              <p className="text-xs text-gray-400 mt-0.5">
                Real-time node diagnostics, emergency system overrides, and live CLI command execution console.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" title="System Live" />
              <span className="text-xs text-emerald-400 font-bold">ALL NODES ONLINE</span>
            </div>
          </div>

          {triggerStatus && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 size={16} className="text-emerald-400" />
              <span>{triggerStatus}</span>
            </div>
          )}

          {/* Quick Override Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <button
              type="button"
              onClick={() => handleActionTrigger("Purge Redis Cache Node")}
              className="p-4 bg-[#14211B] border border-[#22352B] hover:border-emerald-500/50 rounded-xl text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-emerald-400">
                <Database size={18} />
                <Play size={12} className="group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-xs font-bold text-white mt-2 font-sans">Purge Redis Caches</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Invalidate query caches</p>
            </button>

            <button
              type="button"
              onClick={() => handleActionTrigger("Trigger ML Model Retraining")}
              className="p-4 bg-[#14211B] border border-[#22352B] hover:border-emerald-500/50 rounded-xl text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-emerald-400">
                <Cpu size={18} />
                <Play size={12} className="group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-xs font-bold text-white mt-2 font-sans">Retrain ML Scorer</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Run batch learning pipeline</p>
            </button>

            <button
              type="button"
              onClick={() => handleActionTrigger("Ping Satellite Telemetry API")}
              className="p-4 bg-[#14211B] border border-[#22352B] hover:border-emerald-500/50 rounded-xl text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-blue-400">
                <Radio size={18} />
                <Play size={12} className="group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-xs font-bold text-white mt-2 font-sans">Ping Satellite Orbit</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Verify Sentinel-2 feed</p>
            </button>

            <button
              type="button"
              onClick={() => handleActionTrigger("Backup DB Snapshot")}
              className="p-4 bg-[#14211B] border border-[#22352B] hover:border-emerald-500/50 rounded-xl text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-amber-400">
                <Server size={18} />
                <Play size={12} className="group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-xs font-bold text-white mt-2 font-sans">Snapshot Database</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Create immutable backup</p>
            </button>
          </div>

          {/* Terminal Console Log */}
          <div className="bg-[#080D0B] border border-[#1E2D25] rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1E2D25] pb-3 text-xs text-gray-400">
              <span className="flex items-center gap-2 text-emerald-400 font-bold">
                <Terminal size={16} /> Live Kernel Stream
              </span>
              <span>Host: root@agrilend-cluster-01</span>
            </div>

            <div className="h-64 overflow-y-auto space-y-2 text-xs font-mono bg-[#050806] p-4 rounded-xl border border-gray-900">
              {commandLog.length === 0 ? (
                <p className="text-gray-500">No command logs found.</p>
              ) : (
                commandLog.map((log) => (
                  <div key={log.id} className="flex items-start gap-3">
                    <span className="text-gray-600 font-semibold">{log.time}</span>
                    <span className="text-emerald-400 font-bold">[{log.type}]</span>
                    <span className="text-gray-200">{log.msg}</span>
                  </div>
                ))
              )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleRunCommand} className="flex items-center gap-2">
              <span className="text-emerald-400 font-bold">&gt;</span>
              <input
                type="text"
                placeholder="Enter command (e.g. systemctl restart agrilend-ml)..."
                value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
                className="flex-1 bg-[#050806] border border-[#1E2D25] rounded-lg p-2.5 text-xs text-emerald-300 font-mono outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-[#0B5A22] hover:bg-[#094A1C] text-white text-xs font-bold rounded-lg cursor-pointer transition-all"
              >
                Execute
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
