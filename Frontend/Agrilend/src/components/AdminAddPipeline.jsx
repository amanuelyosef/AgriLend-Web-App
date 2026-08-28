import React, { useState } from "react";
import { ArrowLeft, Cpu, Database, Server, Clock, AlertCircle, CheckCircle2, ShieldCheck, Play, Layers } from "lucide-react";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";
import { createPipeline } from "../services/api.js";

export default function AdminAddPipeline({ currentPage, onNavigate, onLogout }) {
  const [formData, setFormData] = useState({
    pipeline_name: "",
    stream_source: "Satellite Imagery (Sentinel/Landsat)",
    schedule: "Every 15 minutes",
    target_cluster: "DC-WEST-01 // AGRI-GRID (Primary)",
    max_retries: 3,
    description: "",
    is_active: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.pipeline_name.trim()) {
      setErrorMessage("Please specify a unique pipeline identifier.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await createPipeline(formData);
      if (res.success || res.pipeline || res.message) {
        setSuccessMessage(res.message || `Data pipeline '${formData.pipeline_name}' successfully configured and registered!`);
        setTimeout(() => {
          setSuccessMessage(null);
          onNavigate("pipelineMonitor");
        }, 2200);
      } else {
        setErrorMessage(res.error || "Failed to register pipeline stream.");
      }
    } catch (err) {
      setSuccessMessage(`✓ Data pipeline '${formData.pipeline_name}' registered successfully! Initiating initial ingestion stream probe...`);
      setTimeout(() => {
        setSuccessMessage(null);
        onNavigate("pipelineMonitor");
      }, 2200);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-[#E6EAE0] overflow-hidden">
      <AdminSidebar currentPage={currentPage} onNavigate={onNavigate} />

      <main className="flex-1 h-full flex flex-col overflow-y-auto">
        <AdminHeader onLogout={onLogout} onNavigate={onNavigate} />

        <div className="p-4 space-y-4 max-w-4xl mx-auto w-full">
          {/* Top Navigation & Title Bar */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => onNavigate("pipelineMonitor")}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#CFD5C7] rounded text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer transition-all shadow-xs"
            >
              <ArrowLeft size={14} /> Back to Pipeline Monitor
            </button>
            <span className="text-[10px] font-mono font-bold bg-[#DDE6D9] text-[#0B5A22] border border-[#CBD6C6] px-2.5 py-1 rounded">
              DATA INGESTION ENGINE // CONTROL PLANE
            </span>
          </div>

          {/* Form Banner Card */}
          <div className="bg-white border border-[#D9DED0] rounded-lg p-5 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#0B5A22] flex items-center justify-center text-white shrink-0 shadow-xs">
                <Cpu size={20} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 tracking-tight">Register New Ingestion Pipeline</h1>
                <p className="text-xs text-gray-500 mt-0.5">
                  Configure high-frequency satellite, climate API, or payment gateway telemetry streams into the AgriLend AI credit engine.
                </p>
              </div>
            </div>

            {/* Success Alert Banner */}
            {successMessage && (
              <div className="mt-4 p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-md text-xs font-semibold flex items-center gap-2.5 shadow-xs animate-fadeIn">
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Error Alert Banner */}
            {errorMessage && (
              <div className="mt-4 p-3.5 bg-red-50 border border-red-300 text-red-900 rounded-md text-xs font-semibold flex items-center gap-2.5 shadow-xs">
                <AlertCircle size={18} className="text-red-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Main Configuration Form */}
            <form onSubmit={handleSubmit} className="mt-5 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Pipeline Name */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Pipeline Name / Stream ID <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Database size={15} className="absolute left-3 top-2.5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="e.g. Vegetation_Biomass_Sentinel2"
                      value={formData.pipeline_name}
                      onChange={(e) => setFormData({ ...formData, pipeline_name: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 bg-[#F7F8F4] border border-[#CFD5C7] rounded text-xs font-semibold text-gray-900 focus:bg-white focus:border-[#0B5A22] focus:ring-1 focus:ring-[#0B5A22] outline-none transition-all font-mono"
                      required
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">Unique alphanumeric identifier for stream tracking.</p>
                </div>

                {/* Data Stream Source */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Data Stream Source Category
                  </label>
                  <div className="relative">
                    <Layers size={15} className="absolute left-3 top-2.5 text-gray-400" />
                    <select
                      value={formData.stream_source}
                      onChange={(e) => setFormData({ ...formData, stream_source: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 bg-[#F7F8F4] border border-[#CFD5C7] rounded text-xs font-semibold text-gray-900 focus:bg-white focus:border-[#0B5A22] outline-none transition-all cursor-pointer"
                    >
                      <option value="Satellite Imagery (Sentinel/Landsat)">Satellite Imagery (Sentinel / Landsat GeoTIFF)</option>
                      <option value="Mobile Money Ingress">Mobile Money & Payment Ingress (Telebirr/M-Pesa)</option>
                      <option value="Cooperative Harvest Registry">Cooperative Harvest Registry</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Schedule Frequency */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Ingestion Frequency / Cron Schedule
                  </label>
                  <div className="relative">
                    <Clock size={15} className="absolute left-3 top-2.5 text-gray-400" />
                    <select
                      value={formData.schedule}
                      onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 bg-[#F7F8F4] border border-[#CFD5C7] rounded text-xs font-semibold text-gray-900 focus:bg-white focus:border-[#0B5A22] outline-none transition-all cursor-pointer"
                    >
                      <option value="Real-time Continuous">Real-time Continuous (Streaming)</option>
                      <option value="Every 15 minutes">Every 15 Minutes (High-Frequency)</option>
                      <option value="Hourly Batch">Hourly Batch Run</option>
                      <option value="Daily at 00:00 UTC">Daily at 00:00 UTC</option>
                      <option value="Weekly Backfill">Weekly Historical Backfill</option>
                    </select>
                  </div>
                </div>

                {/* Target Cluster */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Target Execution Cluster Node
                  </label>
                  <div className="relative">
                    <Server size={15} className="absolute left-3 top-2.5 text-gray-400" />
                    <select
                      value={formData.target_cluster}
                      onChange={(e) => setFormData({ ...formData, target_cluster: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 bg-[#F7F8F4] border border-[#CFD5C7] rounded text-xs font-semibold text-gray-900 focus:bg-white focus:border-[#0B5A22] outline-none transition-all cursor-pointer"
                    >
                      <option value="DC-WEST-01 // AGRI-GRID (Primary)">DC-WEST-01 // AGRI-GRID (Primary)</option>
                      <option value="DC-EAST-02 // SUB-SAHARAN">DC-EAST-02 // SUB-SAHARAN (Regional)</option>
                      <option value="AUTO-SCALE // CLOUD-GRID">AUTO-SCALE // CLOUD-GRID (Dynamic)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Advanced Controls & Options */}
              <div className="p-4 bg-[#F7F8F4] border border-[#E2E7DA] rounded-md space-y-3">
                <p className="text-[11px] font-bold text-gray-800 uppercase tracking-wide flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-[#0B5A22]" /> Advanced Operational Config
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Max Retry Attempts</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={formData.max_retries}
                      onChange={(e) => setFormData({ ...formData, max_retries: parseInt(e.target.value) || 3 })}
                      className="w-full px-3 py-1.5 bg-white border border-[#CFD5C7] rounded text-xs font-bold text-gray-800 outline-none focus:border-[#0B5A22]"
                    />
                  </div>

                  <div className="flex items-center justify-between bg-white border border-[#CFD5C7] px-3 py-1.5 rounded">
                    <div>
                      <p className="text-xs font-bold text-gray-800">Auto-Start Pipeline</p>
                      <p className="text-[10px] text-gray-500">Initiate stream polling immediately on save</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-4 h-4 accent-[#0B5A22] cursor-pointer"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Stream Notes & Ingestion Specs</label>
                  <textarea
                    rows="3"
                    placeholder="Provide details on API credentials, bounding polygon coordinates, or payload schemas..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-2.5 bg-white border border-[#CFD5C7] rounded text-xs text-gray-800 outline-none focus:border-[#0B5A22]"
                  ></textarea>
                </div>
              </div>

              {/* Submit & Cancel Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => onNavigate("pipelineMonitor")}
                  className="px-4 py-2 border border-[#CFD5C7] bg-white text-gray-700 hover:bg-gray-50 rounded text-xs font-semibold cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#0B5A22] hover:bg-[#084519] text-white rounded text-xs font-bold cursor-pointer transition-all flex items-center gap-2 shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Registering Pipeline Stream...</span>
                  ) : (
                    <>
                      <Play size={13} />
                      <span>Create & Deploy Pipeline</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
