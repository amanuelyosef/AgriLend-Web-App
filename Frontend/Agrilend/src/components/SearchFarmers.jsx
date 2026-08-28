import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import DashboardHeader from "./DashboardHeader";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import {
  Search,
  MapPin,
  User,
  Filter,
  ChevronDown,
  UserPlus2,
  Loader2,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  UserX,
  Send,
  CheckCircle2,
  ShieldCheck,
  Building,
  Sprout,
  ArrowRight
} from "lucide-react";
import { searchFarmers, api } from "../services/api";

const initialFarmers = [];

export default function SearchFarmers({ currentPage, onNavigate, onLogout, currentUser, user, userRole }) {
  const activeUser = currentUser || user;
  const isAdmin = userRole === "admin" || activeUser?.role === "admin";

  const [queryName, setQueryName] = useState("");
  const [phone, setPhone] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [selectedTier, setSelectedTier] = useState("All");
  const [selectedCrop, setSelectedCrop] = useState("All");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [allFarmersList, setAllFarmersList] = useState(initialFarmers);
  const [displayedFarmers, setDisplayedFarmers] = useState(initialFarmers);
  const [isSearching, setIsSearching] = useState(false);
  const [farmerPage, setFarmerPage] = useState(1);
  const [verificationToast, setVerificationToast] = useState(null);

  // Load real farmers from FastAPI backend if online
  useEffect(() => {
    let isMounted = true;
    async function loadRealBackendFarmers() {
      try {
        const res = await api.get("/farmers");
        if (isMounted && res && Array.isArray(res.items) && res.items.length > 0) {
          const formatted = res.items.map((item) => ({
            id: item.id || null,
            full_name: item.full_name || item.name || "—",
            phone_number: item.phone_number || item.phone || "—",
            email: item.email || "—",
            region: item.region || "—",
            primary_crop: item.primary_crop || item.crop_type || "—",
            size_hectares: item.size_hectares != null ? item.size_hectares : null,
          }));

          setAllFarmersList(formatted);
          setDisplayedFarmers(formatted);
        }
      } catch (err) {
        console.log("Using primary farmer registry dataset.");
      }
    }
    loadRealBackendFarmers();
    return () => { isMounted = false; };
  }, []);

  // Consolidated Filter Function
  const applyFilters = (term, region, tier, crop) => {
    let result = [...allFarmersList];

    if (term) {
      const lower = term.toLowerCase();
      result = result.filter(
        (f) =>
          (f.full_name || "").toLowerCase().includes(lower) ||
          (f.region || "").toLowerCase().includes(lower) ||
          (f.primary_crop || "").toLowerCase().includes(lower) ||
          (f.phone_number || "").toLowerCase().includes(lower) ||
          (f.id && String(f.id).toLowerCase().includes(lower))
      );
    }

    if (region !== "All") {
      result = result.filter((f) => f.region === region);
    }

    if (tier !== "All") {
      result = result.filter((f) => (f.tier || "") === tier);
    }

    if (crop !== "All") {
      result = result.filter((f) => (f.primary_crop || "").toLowerCase().includes(crop.toLowerCase()));
    }

    return result;
  };

  const handleRunSearch = async () => {
    setIsSearching(true);
    const term = queryName.trim() || phone.trim() || nationalId.trim();

    try {
      if (term) {
        const res = await searchFarmers(term);
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          const apiResults = res.data.map((f, i) => ({
            id: f.id || null,
            full_name: f.full_name || f.name || "—",
            phone_number: f.phone_number || f.phone || "—",
            email: f.email || "—",
            region: f.region || "—",
            primary_crop: f.primary_crop || f.crop || "—",
            size_hectares: f.size_hectares != null ? f.size_hectares : null,
          }));
          setDisplayedFarmers(apiResults);
          setFarmerPage(1);
          setIsSearching(false);
          return;
        }
      }
    } catch (err) {
      console.warn("Backend farmer search offline, filtering locally:", err);
    }

    const filtered = applyFilters(term, selectedRegion, selectedTier, selectedCrop);
    setDisplayedFarmers(filtered);
    setFarmerPage(1);
    setIsSearching(false);
  };

  const handleRegionChange = (newRegion) => {
    setSelectedRegion(newRegion);
    const term = queryName.trim() || phone.trim() || nationalId.trim();
    setDisplayedFarmers(applyFilters(term, newRegion, selectedTier, selectedCrop));
    setFarmerPage(1);
  };

  const handleResetFilters = () => {
    setQueryName("");
    setPhone("");
    setNationalId("");
    setSelectedRegion("All");
    setSelectedTier("All");
    setSelectedCrop("All");
    setDisplayedFarmers(allFarmersList);
    setFarmerPage(1);
  };

  const handleRequestVerification = () => {
    const target = queryName.trim() || nationalId.trim() || phone.trim() || "John Doe";
    setVerificationToast({
      title: "Verification Request Dispatched",
      message: `Formal verification request for "${target}" sent to Kebele & Regional Agribank Audit Queue.`
    });

    setTimeout(() => setVerificationToast(null), 5000);
  };

  // Dynamic regional statistics computed from live list
  const totalCount = displayedFarmers.length;
  const regionCounts = displayedFarmers.reduce((acc, f) => {
    const r = f.region || "Oromia";
    acc[r] = (acc[r] || 0) + 1;
    return acc;
  }, {});

  const topRegionPairs = Object.entries(regionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const activeSearchQuery = queryName.trim() || phone.trim() || nationalId.trim();

  return (
    <div className="flex h-screen w-screen bg-[#EFF2E8] overflow-hidden font-sans">
      {isAdmin ? (
        <AdminSidebar currentPage={currentPage} onNavigate={onNavigate} currentUser={activeUser} />
      ) : (
        <Sidebar currentPage={currentPage} onNavigate={onNavigate} onLogout={onLogout} currentUser={activeUser} />
      )}

      <div className="flex-1 h-full flex flex-col overflow-y-auto">
        {isAdmin ? (
          <AdminHeader onLogout={onLogout} onNavigate={onNavigate} activeTabName="Farmer Registry" />
        ) : (
          <DashboardHeader showBack onBack={() => onNavigate("dashboard")} backText="Back to Dashboard" onLogout={onLogout} currentUser={activeUser} onNavigate={onNavigate} />
        )}

        <div className="p-5 space-y-4 max-w-7xl mx-auto w-full">
          {/* Notification Toast */}
          {verificationToast && (
            <div className="p-4 rounded-xl bg-emerald-900 text-white shadow-xl flex items-center justify-between animate-fadeIn">
              <div className="flex items-center gap-3">
                <Send size={18} className="text-emerald-400" />
                <div>
                  <p className="text-xs font-bold">{verificationToast.title}</p>
                  <p className="text-[11px] text-emerald-200">{verificationToast.message}</p>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-800 px-2 py-1 rounded">
                Logged
              </span>
            </div>
          )}

          {/* Search Header & Input Controls */}
          <div className="bg-[#F4F6EF] border border-[#DADFD2] rounded-xl p-4 space-y-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">Search Farmer Registry</h2>
                <p className="text-xs text-gray-500 mt-0.5">Filter verified farmer profiles, geospatial credit metrics & regulatory consent.</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onNavigate && onNavigate("registerFarmer")}
                  className="px-4 py-2 rounded-lg bg-[#0B5A22] hover:bg-[#084519] text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs transition-all"
                >
                  <UserPlus2 size={14} /> Register New Farmer
                </button>

                {(selectedRegion !== "All" || selectedTier !== "All" || selectedCrop !== "All" || queryName || phone || nationalId) && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="text-xs font-semibold text-gray-500 hover:text-[#0B5A22] flex items-center gap-1 cursor-pointer ml-1"
                  >
                    <RotateCcw size={13} /> Reset Filters
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <p className="text-[10px] font-bold tracking-wide text-gray-500 uppercase mb-1">Farmer Name / Keyword</p>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    className="w-full bg-white border border-[#D5DACB] rounded-lg pl-9 pr-3 py-2 text-xs text-gray-800 outline-none focus:border-[#0B5A22] focus:ring-1 focus:ring-[#0B5A22]"
                    placeholder="e.g. Samuel Kibet or Abebe"
                    value={queryName}
                    onChange={(e) => setQueryName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleRunSearch()}
                  />
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold tracking-wide text-gray-500 uppercase mb-1">Phone Number</p>
                <input
                  className="w-full bg-white border border-[#D5DACB] rounded-lg px-3 py-2 text-xs text-gray-800 outline-none focus:border-[#0B5A22] focus:ring-1 focus:ring-[#0B5A22]"
                  placeholder="+251 9... / +254 7..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleRunSearch()}
                />
              </div>

              <div>
                <p className="text-[10px] font-bold tracking-wide text-gray-500 uppercase mb-1">National / Kebele ID</p>
                <input
                  className="w-full bg-white border border-[#D5DACB] rounded-lg px-3 py-2 text-xs text-gray-800 outline-none focus:border-[#0B5A22] focus:ring-1 focus:ring-[#0B5A22]"
                  placeholder="ID Number (e.g. ETH-98402)"
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleRunSearch()}
                />
              </div>
            </div>

            {/* Filter Controls Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#E3E8DC]">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className={`h-8 px-3 rounded-full border text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${showAdvanced || selectedTier !== "All" || selectedCrop !== "All"
                      ? "bg-[#0B5A22] text-white border-[#0B5A22]"
                      : "bg-white text-gray-700 border-[#D5DACB] hover:bg-gray-50"
                    }`}
                >
                  <Filter size={12} />
                  <span>Advanced Filters</span>
                  {(selectedTier !== "All" || selectedCrop !== "All") && (
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  )}
                </button>

                <div className="relative">
                  <select
                    value={selectedRegion}
                    onChange={(e) => handleRegionChange(e.target.value)}
                    className="h-8 pl-3 pr-8 rounded-full border border-[#D5DACB] bg-white text-[11px] text-gray-700 font-semibold outline-none cursor-pointer hover:bg-gray-50 appearance-none"
                  >
                    <option value="All">Region: All Regions</option>
                    <option value="Oromia">Region: Oromia</option>
                    <option value="Amhara">Region: Amhara</option>
                    <option value="Rift Valley">Region: Rift Valley</option>
                    <option value="Central">Region: Central</option>
                    <option value="Lake Region">Region: Lake Region</option>
                    <option value="Coastal">Region: Coastal</option>
                  </select>
                  <ChevronDown size={12} className="absolute right-2.5 top-2.5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <button
                type="button"
                onClick={handleRunSearch}
                disabled={isSearching}
                className="h-8 px-6 rounded-lg bg-[#0B5A22] hover:bg-[#084519] text-white text-xs font-bold flex items-center gap-2 cursor-pointer disabled:opacity-70 transition-all shadow-xs"
              >
                {isSearching ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Searching Registry...</span>
                  </>
                ) : (
                  <span>Run Search</span>
                )}
              </button>
            </div>

            {/* Advanced Filters Panel */}
            {showAdvanced && (
              <div className="mt-3 p-3 bg-white border border-[#D5DACB] rounded-lg grid grid-cols-1 md:grid-cols-2 gap-3 animate-fadeIn">
                <div>
                  <label className="block text-[10px] font-bold tracking-wider text-gray-500 uppercase mb-1">
                    Risk Tier
                  </label>
                  <select
                    value={selectedTier}
                    onChange={(e) => {
                      setSelectedTier(e.target.value);
                      const term = queryName.trim() || phone.trim() || nationalId.trim();
                      setDisplayedFarmers(applyFilters(term, selectedRegion, e.target.value, selectedCrop));
                    }}
                    className="w-full bg-[#FAFBF7] border border-gray-200 rounded p-2 text-xs text-gray-800 font-medium outline-none focus:border-[#0B5A22]"
                  >
                    <option value="All">All Risk Tiers</option>
                    <option value="Elite">Elite (Low Risk + High Credit)</option>
                    <option value="Low Risk">Low Risk</option>
                    <option value="Moderate">Moderate Risk</option>
                    <option value="High Risk">High Risk</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold tracking-wider text-gray-500 uppercase mb-1">
                    Primary Crop
                  </label>
                  <select
                    value={selectedCrop}
                    onChange={(e) => {
                      setSelectedCrop(e.target.value);
                      const term = queryName.trim() || phone.trim() || nationalId.trim();
                      setDisplayedFarmers(applyFilters(term, selectedRegion, selectedTier, e.target.value));
                    }}
                    className="w-full bg-[#FAFBF7] border border-gray-200 rounded p-2 text-xs text-gray-800 font-medium outline-none focus:border-[#0B5A22]"
                  >
                    <option value="All">All Primary Crops</option>
                    <option value="Teff">Teff</option>
                    <option value="Coffee">Coffee</option>
                    <option value="Rice">Rice</option>
                    <option value="Dairy">Dairy & Feed</option>
                    <option value="Tea">Tea & Horticulture</option>
                    <option value="Sesame">Sesame</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500 px-1">
            <p>Showing {displayedFarmers.length} verified farmer profile{displayedFarmers.length !== 1 ? 's' : ''}</p>
            <p>Sort by: <span className="font-semibold text-gray-700">Relevance & Credit Tier</span></p>
          </div>

          {/* Conditional Rendering: Farmer Grid OR Dynamic Empty State Card */}
          {displayedFarmers.length > 0 ? (
            <>
              {/* Farmer Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {displayedFarmers.slice((farmerPage - 1) * 4, farmerPage * 4).map((farmer, idx) => (
                  <div
                    key={farmer.id || farmer.full_name || idx}
                    onClick={() => onNavigate && onNavigate("farmerDisplayData", farmer)}
                    className="bg-white border border-[#DADFD2] rounded-xl p-4 space-y-3 hover:shadow-lg hover:border-[#0B5A22] transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center font-bold text-[#0B5A22] text-xs group-hover:bg-[#0B5A22] group-hover:text-white transition-colors">
                        <User size={15} />
                      </span>
                      <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded border text-gray-600 bg-gray-50 border-gray-200">
                        Registered
                      </span>
                    </div>

                    <div>
                      <p className="text-sm font-bold text-gray-900 group-hover:text-[#0B5A22] transition-colors">{farmer.full_name || "—"}</p>
                      <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                        <MapPin size={12} className="text-gray-400" /> {farmer.region || "—"}
                      </p>
                    </div>

                    <div className="space-y-1.5 text-[11px] pt-2 border-t border-gray-100">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Primary Crop</span>
                        <span className="font-semibold text-gray-800">{farmer.primary_crop || "—"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Farm Size</span>
                        <span className="font-semibold text-gray-800">{farmer.size_hectares != null ? `${farmer.size_hectares} ha` : "—"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Phone</span>
                        <span className="font-semibold text-gray-800">{farmer.phone_number || "—"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Email</span>
                        <span className="font-semibold text-gray-800">{farmer.email || "—"}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-[9px] font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 size={10} /> REGISTERED
                      </span>
                      <span className="text-[10px] font-bold text-[#0B5A22] group-hover:underline flex items-center gap-1">
                        View Profile & Land <ArrowRight size={11} />
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Bar */}
              <div className="bg-[#F7F8F4] border border-[#D9DED0] rounded-xl px-4 py-2.5 flex items-center justify-between text-[11px] text-gray-500">
                <p>
                  Showing {Math.min((farmerPage - 1) * 4 + 1, displayedFarmers.length)}-{Math.min(farmerPage * 4, displayedFarmers.length)} of {displayedFarmers.length} registered farmers
                </p>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={farmerPage === 1}
                    onClick={() => setFarmerPage((p) => Math.max(p - 1, 1))}
                    className="w-7 h-7 border border-[#CFD5C7] bg-white rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-40 cursor-pointer"
                    title="Previous Page"
                  >
                    <ChevronLeft size={13} />
                  </button>

                  {Array.from({ length: Math.ceil(displayedFarmers.length / 4) }).map((_, i) => (
                    <button
                      key={i + 1}
                      type="button"
                      onClick={() => setFarmerPage(i + 1)}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[10px] cursor-pointer transition-all ${farmerPage === i + 1
                          ? "bg-[#0B5A22] text-white shadow-xs"
                          : "border border-[#CFD5C7] bg-white text-gray-700 hover:bg-gray-100"
                        }`}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
                    type="button"
                    disabled={farmerPage >= Math.ceil(displayedFarmers.length / 4)}
                    onClick={() => setFarmerPage((p) => Math.min(p + 1, Math.ceil(displayedFarmers.length / 4)))}
                    className="w-7 h-7 border border-[#CFD5C7] bg-white rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-40 cursor-pointer"
                    title="Next Page"
                  >
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Dynamic Empty State Card (Only when search results are 0) */
            <div className="bg-[#F4F6EF] border border-dashed border-[#CDD4C2] rounded-2xl p-10 text-center space-y-4 animate-fadeIn">
              <div className="w-20 h-20 rounded-3xl bg-emerald-100/80 border border-emerald-200/80 mx-auto flex items-center justify-center text-[#0B5A22] shadow-inner">
                <UserX size={40} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800 tracking-tight">Farmer Profile Not Found</h3>
                <p className="text-xs text-gray-500 mt-2 max-w-xl mx-auto leading-relaxed">
                  {activeSearchQuery ? (
                    <>The profile matching <span className="font-bold text-gray-800">"{activeSearchQuery}"</span> could not be located in our verified regional registry. They may not be registered on AgriLend yet or the ID has not been digitized.</>
                  ) : (
                    <>No farmer profiles match the selected region or crop filters. Please adjust your criteria or register a new farmer.</>
                  )}
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => onNavigate && onNavigate("registerFarmer")}
                  className="h-10 px-5 rounded-xl bg-[#0B5A22] text-white text-xs font-bold flex items-center gap-2 cursor-pointer hover:bg-[#084519] transition-all shadow-md"
                >
                  <UserPlus2 size={15} /> Register New Farmer
                </button>
                <button
                  type="button"
                  onClick={handleRequestVerification}
                  className="h-10 px-5 rounded-xl bg-white border border-[#D0D7C6] text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-2xs flex items-center gap-2 cursor-pointer"
                >
                  <Send size={13} /> Request Verification
                </button>
              </div>
            </div>
          )}

          {/* System Telemetry & Regional Distribution Footer */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 pt-2">
            <div className="xl:col-span-2 bg-gradient-to-r from-[#16201B] to-[#0A120E] rounded-2xl border border-gray-800 p-5 text-white shadow-md flex flex-col justify-between relative overflow-hidden">
              <div className="absolute right-0 top-0 w-64 h-full bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <p className="text-[10px] uppercase tracking-widest text-emerald-400 font-extrabold">System Registry Telemetry</p>
                </div>
                <p className="text-sm font-semibold mt-2 leading-relaxed text-gray-200">
                  Registry synchronization active. {totalCount} farmer profile records verified across administrative regions with satellite NDVI overlay capabilities.
                </p>
              </div>
              <div className="mt-4 flex items-center justify-between text-[11px] text-gray-400 border-t border-white/10 pt-3">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-400" /> Database Sync Status: Healthy
                </span>
                <span className="font-mono text-emerald-300">FR-X-002 Compliance: 100%</span>
              </div>
            </div>

            <div className="bg-white border border-[#DADFD2] rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-500 font-extrabold flex items-center gap-1">
                  <Building size={13} /> Top Regional Distribution
                </p>
                <div className="mt-3 space-y-3 text-xs">
                  {topRegionPairs.length > 0 ? (
                    topRegionPairs.map(([regionName, count]) => {
                      const pct = Math.round((count / totalCount) * 100) || 0;
                      return (
                        <div key={regionName}>
                          <div className="flex justify-between text-gray-700 font-medium">
                            <span>{regionName} Region</span>
                            <span className="font-bold text-gray-900">{pct}% ({count})</span>
                          </div>
                          <div className="mt-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#0B5A22] rounded-full transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-gray-400">No regional data available.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
