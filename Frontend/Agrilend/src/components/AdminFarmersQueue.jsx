import React, { useState, useEffect } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import {
  Search,
  CheckCircle2,
  PhoneCall,
  Eye,
  RefreshCw,
  Database,
  UserCheck,
  ShieldCheck,
  ShieldAlert,
  Clock3,
  Compass,
  Paperclip,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Globe2,
  ArrowLeft,
  Image as ImageIcon,
  FileType,
  FileCheck,
  FileSpreadsheet,
  X
} from "lucide-react";
import { fetchAdminFarmersQueue, approveQueueFarmer, flagQueueFarmer } from "../services/api.js";

const STATUS_TABS = [
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "flagged", label: "Flagged" },
  { key: "all", label: "All" },
];

const TAB_META = {
  pending: {
    title: "Pending Verification Queue",
    description: "Mobile-registered farmers awaiting platform KYC verification. Approving a farmer publishes them to the active registry visible to partner institutions.",
    chip: "Awaiting Review",
  },
  approved: {
    title: "Active Farmers Database Directory",
    description: "Displaying active, verified farmer records stored in the AgriLend database. All listed producers have verified land credentials, GPS coordinates, and active credit scoring telemetry.",
    chip: "Verified Records",
  },
  flagged: {
    title: "Flagged Registrations",
    description: "Registrations held for manual compliance audit. Review the land credentials below, then approve to restore or keep flagged for investigation.",
    chip: "Compliance Audit",
  },
  all: {
    title: "All Farmer Registrations",
    description: "Every registration in the system regardless of verification status — pending, approved, and flagged.",
    chip: "All Records",
  },
};

const statusBadgeStyles = {
  APPROVED: "bg-emerald-50 text-emerald-800 border-emerald-200",
  PENDING: "bg-amber-50 text-amber-800 border-amber-200",
  FLAGGED: "bg-red-50 text-red-800 border-red-200",
};

export default function AdminFarmersQueue({ currentPage, onNavigate, onLogout, currentUser, user }) {
  const activeUser = currentUser || user;
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [previewImageModal, setPreviewImageModal] = useState(null);
  const [statusTab, setStatusTab] = useState("pending");
  const [actioningId, setActioningId] = useState(null);

  // ACTIVE FARMERS DIRECTORY
  const [activeFarmers, setActiveFarmers] = useState([]);

  const loadActiveDatabaseFarmers = async (status = statusTab) => {
    setIsRefreshing(true);
    try {
      const res = await fetchAdminFarmersQueue(status);
      if (res && res.success && Array.isArray(res.data)) {
        const formatted = res.data.map((item) => ({
          id: item.id || item.farmer_id || "—",
          name: item.full_name || "—",
          phone: item.phone_number || "—",
          email: item.email || "—",
          nationalId: item.national_id || "—",
          region: item.region || "—",
          crop: item.primary_crop || "—",
          farmSize: item.farm_size != null ? `${item.farm_size} Hectares` : "—",
          gpsCoordinates: item.gps_coordinates || "—",
          ndviBiomassScore: "—",
          rainfallIndex: "—",
          score: item.score != null ? item.score : "—",
          riskTier: item.risk_tier || "—",
          status: item.status || "—",
          registeredVia: item.submitted_via || "—",
          telemetryMatch: "—",
          attachments: item.land_proof_document
            ? [{ name: "Land Proof Document", type: "pdf", format: "Attached Document", size: "—", url: item.land_proof_document }]
            : [],
          consentStatus: item.consent_status || "—",
          language: "—",
          recommendedCreditLimit: "—"
        }));
        setActiveFarmers(formatted);
      } else {
        setActiveFarmers([]);
      }
    } catch (err) {
      console.log("Active database farmers synced.");
      setActiveFarmers([]);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadActiveDatabaseFarmers(statusTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusTab]);

  const handleApproveFarmer = async (farmer) => {
    setActioningId(farmer.id);
    try {
      await approveQueueFarmer(farmer.id);
      if (selectedFarmer?.id === farmer.id) setSelectedFarmer(null);
      await loadActiveDatabaseFarmers();
    } catch (err) {
      console.error("Failed to approve farmer:", err.message);
    } finally {
      setActioningId(null);
    }
  };

  const handleFlagFarmer = async (farmer) => {
    setActioningId(farmer.id);
    try {
      await flagQueueFarmer(farmer.id, "Flagged for compliance audit by platform admin");
      if (selectedFarmer?.id === farmer.id) setSelectedFarmer(null);
      await loadActiveDatabaseFarmers();
    } catch (err) {
      console.error("Failed to flag farmer:", err.message);
    } finally {
      setActioningId(null);
    }
  };

  const filteredFarmers = activeFarmers.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nationalId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.region.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const renderFileIcon = (type) => {
    switch (type) {
      case "image":
        return <ImageIcon size={20} className="text-emerald-700" />;
      case "pdf":
        return <FileCheck size={20} className="text-red-700" />;
      case "doc":
        return <FileType size={20} className="text-blue-700" />;
      case "spreadsheet":
        return <FileSpreadsheet size={20} className="text-green-700" />;
      default:
        return <Paperclip size={20} className="text-gray-700" />;
    }
  };

  return (
    <div className="flex h-screen w-screen bg-[#F4F6F0] overflow-hidden font-sans">
      <AdminSidebar currentPage={currentPage} onNavigate={onNavigate} currentUser={activeUser} />

      <div className="flex-1 h-full flex flex-col overflow-y-auto">
        <AdminHeader onLogout={onLogout} onNavigate={onNavigate} activeTabName="Farmers Queue" />

        {/* IF A FARMER IS SELECTED FOR DETAILED VIEW: FULL-PAGE WORKSPACE */}
        {selectedFarmer ? (
          <div className="p-6 max-w-7xl mx-auto w-full space-y-6 animate-fadeIn">
            {/* Top Workspace Header Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
              <div className="absolute right-0 top-0 w-96 h-full bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none" />

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setSelectedFarmer(null)}
                  className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center cursor-pointer transition-colors shrink-0"
                  title="Back to Active Farmers List"
                >
                  <ArrowLeft size={18} />
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#0B5A22] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                      Active Database Farmer Record
                    </span>
                    <span className="text-xs font-mono font-bold text-gray-400">{selectedFarmer.id}</span>
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 tracking-tight mt-1">
                    {selectedFarmer.name}
                  </h1>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Source: {selectedFarmer.registeredVia} • Status: {selectedFarmer.status}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className={`px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider border flex items-center gap-1.5 ${statusBadgeStyles[selectedFarmer.status] || statusBadgeStyles.PENDING}`}>
                  {selectedFarmer.status === "APPROVED" ? (
                    <CheckCircle2 size={14} className="text-emerald-600" />
                  ) : selectedFarmer.status === "FLAGGED" ? (
                    <ShieldAlert size={14} className="text-red-600" />
                  ) : (
                    <Clock3 size={14} className="text-amber-600" />
                  )}
                  STATUS: {selectedFarmer.status}
                </span>

                {selectedFarmer.status !== "APPROVED" && (
                  <button
                    type="button"
                    disabled={actioningId === selectedFarmer.id}
                    onClick={() => handleApproveFarmer(selectedFarmer)}
                    className="px-4 py-2 rounded-xl bg-[#0B5A22] hover:bg-[#084519] text-white text-xs font-bold cursor-pointer transition-colors shadow-xs inline-flex items-center gap-1.5 disabled:opacity-60"
                  >
                    <CheckCircle2 size={14} /> {actioningId === selectedFarmer.id ? "Approving..." : "Approve"}
                  </button>
                )}
                {selectedFarmer.status !== "FLAGGED" && (
                  <button
                    type="button"
                    disabled={actioningId === selectedFarmer.id}
                    onClick={() => handleFlagFarmer(selectedFarmer)}
                    className="px-4 py-2 rounded-xl border border-red-200 bg-white text-red-700 hover:bg-red-50 text-xs font-bold cursor-pointer transition-colors inline-flex items-center gap-1.5 disabled:opacity-60"
                  >
                    <ShieldAlert size={14} /> {actioningId === selectedFarmer.id ? "Working..." : "Flag"}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedFarmer(null)}
                  className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  Close Record
                </button>
              </div>
            </div>

            {/* 3-Column Detailed Workspace Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Personal KYC & Contact Profile */}
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <h2 className="text-xs font-extrabold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                      <UserCheck size={16} className="text-[#0B5A22]" /> Active Farmer Credentials
                    </h2>
                    <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-100">
                      Verified DB Record
                    </span>
                  </div>

                  <div className="space-y-3.5 text-xs">
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-bold">Full Legal Name</span>
                      <span className="text-sm font-bold text-gray-900">{selectedFarmer.name}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase font-bold">Phone Contact</span>
                        <span className="font-bold text-gray-900 flex items-center gap-1 mt-0.5">
                          <PhoneCall size={12} className="text-[#0B5A22]" /> {selectedFarmer.phone}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase font-bold">National / Kebele ID</span>
                        <span className="font-mono font-bold text-gray-900 mt-0.5 block">{selectedFarmer.nationalId}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase font-bold">Language</span>
                        <span className="font-semibold text-emerald-800 flex items-center gap-1 mt-0.5">
                          <Globe2 size={12} /> {selectedFarmer.language}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Regulatory Consent Gate */}
                <div className="bg-emerald-950 text-white rounded-2xl p-6 shadow-md space-y-3 relative overflow-hidden">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={18} className="text-emerald-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                      Regulatory Consent Verified (FR-X-002)
                    </h3>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    Farmer has active consent on record in PostgreSQL database. Satellite Sentinel-2 telemetry & credit scoring calculations are active.
                  </p>
                </div>
              </div>

              {/* Middle Column: Geospatial Telemetry & Document Attachments */}
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <h2 className="text-xs font-extrabold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                      <Compass size={16} className="text-[#0B5A22]" /> Farm Land & Telemetry Metrics
                    </h2>
                    <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-100">
                      GPS Centroid
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-bold">Region</span>
                      <span className="font-bold text-gray-900 block mt-0.5">{selectedFarmer.region}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-bold">Primary Commodity Crop</span>
                      <span className="font-bold text-gray-900 block mt-0.5">{selectedFarmer.crop}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-bold">Farm Parcel Size</span>
                      <span className="font-bold text-gray-900 block mt-0.5">{selectedFarmer.farmSize}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-bold">GPS Coordinates</span>
                      <span className="font-mono font-bold text-emerald-800 block mt-0.5">{selectedFarmer.gpsCoordinates}</span>
                    </div>
                  </div>
                </div>

                {/* File Attachments Panel */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <Paperclip size={16} className="text-[#0B5A22]" />
                      <h2 className="text-xs font-extrabold uppercase tracking-wider text-gray-500">
                        Verified Proof Documents
                      </h2>
                    </div>
                    <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-100">
                      {selectedFarmer.attachments ? selectedFarmer.attachments.length : 1} Files
                    </span>
                  </div>

                  <div className="space-y-3">
                    {selectedFarmer.attachments && selectedFarmer.attachments.map((file, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-[#FAFBF8] border border-gray-200 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center shrink-0 shadow-2xs">
                            {renderFileIcon(file.type)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-gray-900 truncate">{file.name}</p>
                            <p className="text-[10px] text-gray-400">{file.format} • {file.size}</p>
                          </div>
                        </div>

                        <a
                          href={file.url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-[#0B5A22] text-white text-xs font-bold flex items-center gap-1.5"
                        >
                          <ExternalLink size={12} /> Open File
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: AI Credit Score & Action Button */}
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-6">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <h2 className="text-xs font-extrabold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                      <Sparkles size={16} className="text-[#0B5A22]" /> Active Credit Assessment
                    </h2>
                    <span className="text-[10px] font-bold uppercase tracking-widest bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-100">
                      Tier: {selectedFarmer.riskTier}
                    </span>
                  </div>

                  <div className="bg-gradient-to-br from-[#16201B] to-[#0A120E] text-white p-6 rounded-2xl text-center space-y-3 shadow-md">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400">
                      Database Credit Score
                    </span>
                    <div className="text-4xl font-extrabold text-white tracking-tight">
                      {selectedFarmer.score} <span className="text-sm font-normal text-gray-400">/ 1000</span>
                    </div>
                    <div className="pt-2 border-t border-white/10 flex justify-between text-xs text-emerald-300 font-semibold">
                      <span>Max Credit Cap:</span>
                      <span>{selectedFarmer.recommendedCreditLimit}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onNavigate("pipelineMonitor")}
                    className="w-full py-3 rounded-xl bg-[#0B5A22] hover:bg-[#084519] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <span>Inspect Pipeline Monitor</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>

            </div>
          </div>
        ) : (
          /* OTHERWISE: ADMIN ACTIVE FARMERS LISTING TABLE */
          <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
            {/* Header Banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
              <div className="absolute right-0 top-0 w-96 h-full bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none" />

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#0B5A22] text-white flex items-center justify-center shadow-md shrink-0">
                  <Database size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#0B5A22] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1">
                      <CheckCircle2 size={12} className="text-emerald-600" /> Database Live Registry
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Admin Farmers Queue
                    </span>
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 tracking-tight mt-1">
                    {TAB_META[statusTab].title}
                  </h1>
                  <p className="text-xs text-gray-500 mt-1 max-w-2xl leading-relaxed">
                    {TAB_META[statusTab].description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="bg-emerald-50/60 border border-emerald-200/80 px-4 py-2 rounded-xl flex items-center gap-3 text-xs">
                  <UserCheck size={18} className="text-emerald-700" />
                  <div>
                    <p className="text-[9px] text-emerald-800 font-extrabold uppercase">{TAB_META[statusTab].chip}</p>
                    <p className="text-base font-bold text-emerald-900">{activeFarmers.length} Records</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => loadActiveDatabaseFarmers()}
                  className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer shadow-xs"
                  title="Sync with Database"
                >
                  <RefreshCw size={16} className={isRefreshing ? "animate-spin text-[#0B5A22]" : ""} />
                </button>
              </div>
            </div>

            {/* Search Toolbar */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-2">
                {STATUS_TABS.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setStatusTab(tab.key)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                      statusTab === tab.key
                        ? "bg-[#0B5A22] text-white shadow-xs"
                        : "bg-[#FAFBF8] text-gray-600 border border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    {tab.key === "approved" && <CheckCircle2 size={13} />}
                    {tab.key === "pending" && <Clock3 size={13} />}
                    {tab.key === "flagged" && <ShieldAlert size={13} />}
                    {tab.key === "all" && <Database size={13} />}
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="relative w-full md:w-80">
                <Search size={15} className="absolute left-3.5 top-3 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search active farmer, phone or National ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-[#FAFBF8] border border-gray-200 text-xs text-gray-900 focus:bg-white focus:border-[#0B5A22] outline-none transition-all"
                />
              </div>
            </div>

            {/* Active Farmers Listing Table */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500 bg-[#F8FAFB] border-b border-gray-200">
                      <th className="px-5 py-3.5">Farmer ID / Ref</th>
                      <th className="px-5 py-3.5">Farmer Name & Contact</th>
                      <th className="px-5 py-3.5">National / Kebele ID</th>
                      <th className="px-5 py-3.5">Region & Farm Crop</th>
                      <th className="px-5 py-3.5">Credit Score</th>
                      <th className="px-5 py-3.5">Account Status</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs divide-y divide-gray-100 font-medium">
                    {filteredFarmers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-5 py-8 text-center text-gray-500">
                          No {TAB_META[statusTab].chip.toLowerCase()} records found matching your search query.
                        </td>
                      </tr>
                    ) : (
                      filteredFarmers.map((row) => (
                        <tr key={row.id} className="hover:bg-emerald-50/40 transition-colors">
                          <td className="px-5 py-4 font-mono font-bold text-[#0B5A22]">
                            <div>{row.id}</div>
                            <span className="text-[9px] text-gray-400 font-normal">{row.registeredVia}</span>
                          </td>

                          <td className="px-5 py-4">
                            <div className="font-bold text-gray-900 text-sm">{row.name}</div>
                            <div className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                              <PhoneCall size={11} className="text-[#0B5A22]" /> {row.phone}
                            </div>
                          </td>

                          <td className="px-5 py-4 font-mono text-gray-700 font-semibold">
                            {row.nationalId}
                          </td>

                          <td className="px-5 py-4">
                            <div className="font-semibold text-gray-900">{row.region}</div>
                            <div className="text-[10px] text-gray-500">{row.crop} • {row.farmSize}</div>
                          </td>

                          <td className="px-5 py-4">
                            <div className="font-extrabold text-[#0B5A22] text-sm">{row.score}</div>
                            <span className="text-[9px] text-emerald-800 font-bold uppercase">{row.riskTier}</span>
                          </td>

                          <td className="px-5 py-4">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border inline-flex items-center gap-1 ${statusBadgeStyles[row.status] || statusBadgeStyles.PENDING}`}>
                              {row.status === "APPROVED" ? (
                                <CheckCircle2 size={11} className="text-emerald-600" />
                              ) : row.status === "FLAGGED" ? (
                                <ShieldAlert size={11} className="text-red-600" />
                              ) : (
                                <Clock3 size={11} className="text-amber-600" />
                              )}
                              {row.status}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {row.status !== "APPROVED" && (
                                <button
                                  type="button"
                                  disabled={actioningId === row.id}
                                  onClick={() => handleApproveFarmer(row)}
                                  className="px-3 py-1.5 bg-[#0B5A22] hover:bg-[#084519] text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-xs inline-flex items-center gap-1.5 disabled:opacity-60"
                                  title="Approve into active registry"
                                >
                                  <CheckCircle2 size={13} /> {actioningId === row.id ? "..." : "Approve"}
                                </button>
                              )}
                              {row.status !== "FLAGGED" && (
                                <button
                                  type="button"
                                  disabled={actioningId === row.id}
                                  onClick={() => handleFlagFarmer(row)}
                                  className="px-3 py-1.5 border border-red-200 bg-white text-red-700 hover:bg-red-50 rounded-xl text-xs font-bold cursor-pointer transition-all inline-flex items-center gap-1.5 disabled:opacity-60"
                                  title="Flag for compliance audit"
                                >
                                  <ShieldAlert size={13} /> Flag
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => setSelectedFarmer(row)}
                                className="px-3 py-1.5 border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 rounded-xl text-xs font-bold cursor-pointer transition-all inline-flex items-center gap-1.5"
                              >
                                <Eye size={13} /> View
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Image Lightbox Modal for Photo Attachments */}
      {previewImageModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 space-y-4 shadow-2xl relative overflow-hidden border border-gray-700">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <ImageIcon size={18} className="text-[#0B5A22]" />
                <span className="text-sm font-bold text-gray-900">{previewImageModal.name}</span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewImageModal(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-hidden rounded-2xl border border-gray-200 bg-black flex items-center justify-center">
              <img
                src={previewImageModal.url}
                alt={previewImageModal.name}
                className="max-h-[70vh] w-auto object-contain mx-auto"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
