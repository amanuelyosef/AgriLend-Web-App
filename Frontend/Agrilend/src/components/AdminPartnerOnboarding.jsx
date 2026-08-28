import React, { useState, useEffect } from "react";
import { Plus, Building2, RefreshCw, Percent } from "lucide-react";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";
import { fetchInstitutionalPartners } from "../services/api.js";

export default function AdminPartnerOnboarding({ currentPage, onNavigate, onLogout }) {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadPartners = async () => {
    setLoading(true);
    const res = await fetchInstitutionalPartners();
    if (res && res.success && Array.isArray(res.data)) {
      setPartners(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadPartners();
  }, []);

  const activeCount = partners.filter((p) => String(p.status || "").toLowerCase() === "active").length;
  const avgRate = partners.length
    ? (partners.reduce((s, p) => s + Number(p.interest_rate || 0), 0) / partners.length).toFixed(2)
    : "—";

  return (
    <div className="flex h-screen w-screen bg-[#E6EAE0] overflow-hidden">
      <AdminSidebar currentPage={currentPage} onNavigate={onNavigate} />
      <main className="flex-1 h-full flex flex-col overflow-y-auto">
        <AdminHeader onLogout={onLogout} onNavigate={onNavigate} />
        <div className="p-3">
          <section className="bg-[#ECEFE5] border border-[#D9DED0] rounded-sm overflow-hidden">
            <div className="p-4 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Partner Network</h1>
                  <p className="text-xs text-gray-500 mt-1">
                    Manage institutional bank partners, their lending terms, and analyst accounts.
                  </p>
                </div>
                <button type="button" onClick={() => onNavigate("institutionalPartners")} className="flex items-center gap-2 h-10 px-4 rounded bg-[#0B5A22] text-white text-xs font-semibold hover:bg-[#094a1c] whitespace-nowrap cursor-pointer"><Plus size={14} /> Create Bank Partner</button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white border border-[#D9DED0] rounded-md p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">Active Partners</p>
                    <Building2 size={15} className="text-gray-400" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{loading ? "…" : activeCount}</p>
                  <p className="text-[11px] font-semibold mt-1 text-gray-400">of {partners.length} total</p>
                </div>

                <div className="bg-white border border-[#D9DED0] rounded-md p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">Avg Interest Rate</p>
                    <Percent size={15} className="text-gray-400" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{loading ? "…" : `${avgRate}%`}</p>
                  <p className="text-[11px] font-semibold mt-1 text-gray-400">Across all institutions</p>
                </div>

                <div className="bg-white border border-[#D9DED0] rounded-md p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">Network</p>
                    <RefreshCw size={15} className="text-gray-400" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{loading ? "…" : partners.length}</p>
                  <p className="text-[11px] font-semibold mt-1 text-gray-400">Registered institutions</p>
                </div>
              </div>

              <div className="bg-white border border-[#D9DED0] rounded-md overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#E2E7DA]">
                  <h2 className="text-sm font-bold text-gray-800">Bank Partners</h2>
                  <button type="button" onClick={loadPartners} className="flex items-center gap-1.5 h-8 px-3 border border-[#D9DED0] bg-white text-[11px] font-semibold text-gray-600 rounded hover:bg-gray-50 cursor-pointer"><RefreshCw size={12} className={loading ? "animate-spin" : ""} /> Refresh</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-[9px] font-bold uppercase tracking-wider text-gray-500 bg-[#F7F8F4] border-b border-[#E2E7DA]">
                        <th className="px-4 py-2.5">Bank Name</th><th className="px-4 py-2.5">Onboarding Date</th><th className="px-4 py-2.5">Tier</th><th className="px-4 py-2.5">Interest Rate</th><th className="px-4 py-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="text-[12px]">
                      {loading ? (
                        <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-400">Loading bank partners...</td></tr>
                      ) : partners.length === 0 ? (
                        <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-400">No bank partners registered yet.</td></tr>
                      ) : (
                        partners.map((p) => (
                          <tr key={p.id} className="border-b border-[#E2E7DA] hover:bg-gray-50/60">
                            <td className="px-4 py-3 font-semibold text-gray-900">{p.name || "—"}</td>
                            <td className="px-4 py-3 text-gray-500 font-mono text-[11px]">{p.onboarding_date || "—"}</td>
                            <td className="px-4 py-3"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">{p.subscription_tier || "standard"}</span></td>
                            <td className="px-4 py-3 text-gray-700 font-medium">{p.interest_rate != null ? `${Number(p.interest_rate).toFixed(2)}%` : "—"}</td>
                            <td className="px-4 py-3"><span className={`flex items-center gap-1.5 font-semibold ${String(p.status || "").toLowerCase() === "active" ? "text-emerald-600" : "text-gray-400"}`}><span className={`w-1.5 h-1.5 rounded-full ${String(p.status || "").toLowerCase() === "active" ? "bg-emerald-500" : "bg-gray-300"}`}></span>{String(p.status || "").toLowerCase() === "active" ? "Active" : "Inactive"}</span></td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
