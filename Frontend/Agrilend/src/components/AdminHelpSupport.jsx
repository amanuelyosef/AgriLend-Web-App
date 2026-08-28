import React, { useState, useEffect } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import { fetchSupportTickets, createSupportTicket } from "../services/api.js";
import {
  CheckCircle2,
  Clock,
  Plus,
  HelpCircle,
  PhoneCall,
  ShieldCheck
} from "lucide-react";

export default function AdminHelpSupport({ currentPage, onNavigate, onLogout }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [ticketCreated, setTicketCreated] = useState(null);

  const [tickets, setTickets] = useState([]);

  const [newTicket, setNewTicket] = useState({ title: "", category: "Telemetry", priority: "Medium", description: "" });

  const loadTickets = async () => {
    const res = await fetchSupportTickets();
    if (res && res.success && Array.isArray(res.data)) {
      setTickets(res.data);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    const res = await createSupportTicket({
      title: newTicket.title,
      category: newTicket.category,
      priority: newTicket.priority,
      description: newTicket.description,
    });
    setShowNewTicketModal(false);
    setNewTicket({ title: "", category: "Telemetry", priority: "Medium", description: "" });
    setTicketCreated(
      res && res.success
        ? "Support ticket submitted to Technical Engineering Ops!"
        : `Ticket submission failed${res && res.error ? `: ${res.error}` : ""}.`
    );
    await loadTickets();
    setTimeout(() => setTicketCreated(null), 4000);
  };

  const faqs = [
    { question: "How do I manual-override a flagged KYC record?", answer: "Navigate to Farmers Queue, locate the flagged record, review satellite yield telemetry vs reported data, and click 'Approve' to bypass." },
    { question: "What happens when Sentinel-2 satellite has high cloud coverage?", answer: "The platform automatically falls back to Landsat-9 infrared optical feeds and historical 3-year historical crop yield averages." },
    { question: "How do I rotate M-Pesa or MTN MoMo API credentials?", answer: "Go to System Settings -> Integrations & APIs, enter the new Secret Key & Shortcode, and click 'Ping Mobile Money Sandbox'." },
  ];

  return (
    <div className="flex h-screen w-screen bg-[#E6EAE0] overflow-hidden font-sans text-gray-900 select-none">
      <AdminSidebar currentPage={currentPage} onNavigate={onNavigate} />

      <main className="flex-1 h-full flex flex-col overflow-y-auto">
        <AdminHeader onLogout={onLogout} onNavigate={onNavigate} />

        <div className="p-4 space-y-4 max-w-7xl w-full mx-auto">
          {/* Header Banner */}
          <div className="bg-[#ECEFE5] border border-[#D9DED0] rounded-sm p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#0B5A22] text-white">
                  Technical Help & Escalation
                </span>
                <span className="text-xs font-mono font-semibold text-emerald-800">24/7 System Support</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight mt-1">Help & Support Command Desk</h1>
              <p className="text-xs text-gray-600 mt-0.5">
                Technical support tickets, system diagnostic FAQs, and direct engineering escalation paths.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowNewTicketModal(true)}
              className="px-4 py-2 bg-[#0B5A22] hover:bg-[#084519] text-white rounded-md text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              <Plus size={15} /> Submit Support Ticket
            </button>
          </div>

          {ticketCreated && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-md text-xs font-semibold flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 size={16} className="text-emerald-600" />
              <span>{ticketCreated}</span>
            </div>
          )}

          {/* SLA Quick Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white border border-[#D9DED0] rounded-md p-4 flex items-center justify-between">
              <div>
                <p className="text-[9px] font-bold uppercase text-gray-400">Guaranteed Response Time</p>
                <p className="text-xl font-bold text-emerald-700 mt-0.5 font-mono">&lt; 15 Minutes</p>
              </div>
              <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-lg">
                <Clock size={18} />
              </div>
            </div>

            <div className="bg-white border border-[#D9DED0] rounded-md p-4 flex items-center justify-between">
              <div>
                <p className="text-[9px] font-bold uppercase text-gray-400">System Uptime SLA</p>
                <p className="text-xl font-bold text-gray-900 mt-0.5 font-mono">99.98%</p>
              </div>
              <div className="p-2.5 bg-blue-50 text-blue-700 rounded-lg">
                <ShieldCheck size={18} />
              </div>
            </div>

            <div className="bg-white border border-[#D9DED0] rounded-md p-4 flex items-center justify-between">
              <div>
                <p className="text-[9px] font-bold uppercase text-gray-400">Engineering Hotline</p>
                <p className="text-sm font-bold text-gray-900 mt-0.5 font-mono">+254 700 AGRILEND</p>
              </div>
              <div className="p-2.5 bg-amber-50 text-amber-700 rounded-lg">
                <PhoneCall size={18} />
              </div>
            </div>
          </div>

          {/* Active Support Tickets */}
          <div className="bg-white border border-[#D9DED0] rounded-md overflow-hidden shadow-xs">
            <div className="p-3 border-b border-[#D9DED0] flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Active System Support Tickets</h3>
              <span className="text-xs font-mono text-gray-500">{tickets.length} Tickets Enrolled</span>
            </div>

            <div className="divide-y divide-gray-100">
              {tickets.length === 0 ? (
                <p className="p-6 text-center text-xs text-gray-500">No support tickets found.</p>
              ) : (
                tickets.map((t) => (
                  <div key={t.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-[#F9FAF6] transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-[#0B5A22]">{t.id}</span>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                          {t.category}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                            String(t.priority || "").toLowerCase().includes("critical")
                              ? "bg-red-100 text-red-700"
                              : String(t.priority || "").toLowerCase().includes("high")
                              ? "bg-amber-100 text-amber-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {t.priority || "—"} Priority
                        </span>
                      </div>
                      <p className="text-xs font-bold text-gray-900">{t.title}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-gray-400 font-mono">{t.updated_at || "—"}</span>
                      <span
                        className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase ${
                          String(t.status || "").toLowerCase().includes("resolved")
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : String(t.status || "").toLowerCase().includes("progress")
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {t.status || "—"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* FAQs Section */}
          <div className="bg-white border border-[#D9DED0] rounded-md p-5 space-y-4">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <HelpCircle size={16} className="text-[#0B5A22]" /> Troubleshooting Knowledge Base
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {faqs.map((f, i) => (
                <div key={i} className="bg-[#F8FAF4] border border-[#E1E6D8] rounded-lg p-4 space-y-2">
                  <p className="text-xs font-bold text-gray-900">{f.question}</p>
                  <p className="text-[11px] text-gray-600 leading-relaxed">{f.answer}</p>
                </div>
              ))}
            </div>
          </div>

          {/* New Ticket Modal */}
          {showNewTicketModal && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white border border-[#D9DED0] rounded-xl p-6 max-w-md w-full shadow-2xl space-y-4">
                <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2">Submit Technical Ticket</h3>
                <form onSubmit={handleCreateTicket} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">ISSUE SUMMARY</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Satellite fetch timeout on Eldoret node"
                      value={newTicket.title}
                      onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                      className="w-full border border-gray-200 rounded p-2 text-xs font-semibold outline-none focus:border-[#0B5A22]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">CATEGORY</label>
                      <select
                        value={newTicket.category}
                        onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                        className="w-full border border-gray-200 rounded p-2 text-xs font-semibold outline-none focus:border-[#0B5A22]"
                      >
                        <option value="Telemetry">Telemetry & GEE</option>
                        <option value="Payment Gateway">Payment Gateway</option>
                        <option value="Verification">Verification & KYC</option>
                        <option value="AI Models">AI Models & Scoring</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">PRIORITY</label>
                      <select
                        value={newTicket.priority}
                        onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                        className="w-full border border-gray-200 rounded p-2 text-xs font-semibold outline-none focus:border-[#0B5A22]"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-3">
                    <button
                      type="button"
                      onClick={() => setShowNewTicketModal(false)}
                      className="px-4 py-2 border border-gray-200 text-xs font-semibold rounded text-gray-600 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#0B5A22] text-white text-xs font-bold rounded hover:bg-[#084519] cursor-pointer"
                    >
                      Submit Ticket
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
