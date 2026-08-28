import React, { useState } from "react";
import Sidebar from "./Sidebar";
import DashboardHeader from "./DashboardHeader";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import {
  UserPlus,
  MapPin,
  FileCheck,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  ArrowRight,
  Sprout,
  Compass,
  FileText,
  Paperclip,
  UploadCloud,
  Globe2,
  ChevronLeft
} from "lucide-react";
import { registerFarmer } from "../services/api";

export default function RegisterFarmerPage({
  currentPage,
  onNavigate,
  onLogout,
  currentUser,
  user,
  userRole
}) {
  const activeUser = currentUser || user;
  const isAdmin = userRole === "admin" || activeUser?.role === "admin";

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    nationalId: "",
    region: "Oromia",
    cropType: "Teff",
    farmSize: "2.5",
    gpsCoordinates: "8.9806, 38.7578",
    landProofDocument: "https://agrilend.org/docs/land_deed_sample.pdf",
    locale: "en",
    consentGiven: true
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successModalData, setSuccessModalData] = useState(null);

  const [uploadMode, setUploadMode] = useState("local"); // 'local' | 'url'
  const [selectedLocalFile, setSelectedLocalFile] = useState(null);
  const [localFilePreview, setLocalFilePreview] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleLocalFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setSelectedLocalFile(file);
      setFormData((prev) => ({
        ...prev,
        landProofDocument: file.name
      }));

      if (file.type.startsWith("image/")) {
        const previewUrl = URL.createObjectURL(file);
        setLocalFilePreview(previewUrl);
      } else {
        setLocalFilePreview(null);
      }
    }
  };

  const handleAutoGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`;
          setFormData((prev) => ({ ...prev, gpsCoordinates: coords }));
        },
        () => {
          // Default center if geolocation blocked
          setFormData((prev) => ({ ...prev, gpsCoordinates: "9.0300, 38.7400" }));
        }
      );
    } else {
      setFormData((prev) => ({ ...prev, gpsCoordinates: "9.0300, 38.7400" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!formData.fullName.trim()) {
      setErrorMsg("Please enter the farmer's full legal name.");
      return;
    }
    if (!formData.nationalId.trim()) {
      setErrorMsg("National ID card or Kebele ID number is required.");
      return;
    }
    if (!formData.phone.trim()) {
      setErrorMsg("Valid contact phone number is required.");
      return;
    }
    if (!formData.consentGiven) {
      setErrorMsg("Data sharing consent (FR-X-002) is mandatory for regulatory compliance.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await registerFarmer({
        fullName: formData.fullName,
        phone: formData.phone,
        nationalId: formData.nationalId,
        region: formData.region,
        cropType: formData.cropType,
        farmSize: formData.farmSize,
        gpsCoordinates: formData.gpsCoordinates,
        landProofDocument: formData.landProofDocument,
        locale: formData.locale,
      });

      if (res.success) {
        setSuccessModalData(res.data);
      } else {
        setErrorMsg(res.error || "Failed to register farmer. Please check details and try again.");
      }
    } catch (err) {
      setErrorMsg(err.message || "An unexpected error occurred during farmer registration.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setFormData({
      fullName: "",
      phone: "",
      nationalId: "",
      region: "Oromia",
      cropType: "Teff",
      farmSize: "2.5",
      gpsCoordinates: "8.9806, 38.7578",
      landProofDocument: "https://agrilend.org/docs/land_deed_sample.pdf",
      locale: "en",
      consentGiven: true
    });
    setSuccessModalData(null);
    setErrorMsg("");
  };

  return (
    <div className="flex h-screen w-screen bg-[#F4F6F0] overflow-hidden font-sans">
      {isAdmin ? (
        <AdminSidebar currentPage={currentPage} onNavigate={onNavigate} currentUser={activeUser} />
      ) : (
        <Sidebar currentPage={currentPage} onNavigate={onNavigate} onLogout={onLogout} currentUser={activeUser} />
      )}

      <div className="flex-1 h-full flex flex-col overflow-y-auto">
        {isAdmin ? (
          <AdminHeader onLogout={onLogout} onNavigate={onNavigate} activeTabName="Register Farmer" />
        ) : (
          <DashboardHeader
            showBack
            onBack={() => onNavigate("dashboard")}
            backText="Back to Dashboard"
            onLogout={onLogout}
            currentUser={activeUser}
            onNavigate={onNavigate}
          />
        )}

        {/* Page Container */}
        <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
            <div className="absolute right-0 top-0 w-96 h-full bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none"></div>
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#0B5A22] text-white flex items-center justify-center shadow-md shrink-0">
                <UserPlus size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#0B5A22] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                    Bank Analyst Hub
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    FR-X-002 Compliant
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight mt-1">
                  Register New Farmer Profile
                </h1>
                <p className="text-xs text-gray-500 mt-1 max-w-2xl leading-relaxed">
                  Onboard smallholder farmers into the AgriLend digital ecosystem. Synchronizes credentials, land parcel coordinates, and data-sharing consent for AI credit scoring.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => onNavigate("searchFarmers")}
                className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2 cursor-pointer shadow-2xs"
              >
                <ChevronLeft size={14} /> Back to Farmers List
              </button>
            </div>
          </div>

          {/* Form and Preview Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Main Registration Form */}
            <div className="lg:col-span-2 space-y-6">
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-8">
                {errorMsg && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-3 animate-shake">
                    <AlertCircle size={18} className="shrink-0 text-red-600" />
                    <span className="font-semibold">{errorMsg}</span>
                  </div>
                )}

                {/* Section 1: Identity & Contact Information */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-[#0B5A22] flex items-center justify-center font-bold text-xs">
                      1
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-gray-900">Personal & Identity Information</h2>
                      <p className="text-[11px] text-gray-400">Legal credentials & communication details</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Full Legal Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="e.g. Abebe Bikila Demisse"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-[#FAFBF8] text-xs text-gray-900 focus:bg-white focus:border-[#0B5A22] focus:ring-1 focus:ring-[#0B5A22] outline-none transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        National / Kebele ID Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="nationalId"
                        value={formData.nationalId}
                        onChange={handleChange}
                        placeholder="e.g. ETH-98402914-OR"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-[#FAFBF8] text-xs text-gray-900 focus:bg-white focus:border-[#0B5A22] focus:ring-1 focus:ring-[#0B5A22] outline-none transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="e.g. +251 91 123 4567"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-[#FAFBF8] text-xs text-gray-900 focus:bg-white focus:border-[#0B5A22] focus:ring-1 focus:ring-[#0B5A22] outline-none transition-all"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Farm & Geospatial Data */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-[#0B5A22] flex items-center justify-center font-bold text-xs">
                      2
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-gray-900">Farm Parcel & Crop Details</h2>
                      <p className="text-[11px] text-gray-400">Land metrics for satellite NDVI biomass verification</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Administrative Region <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="region"
                        value={formData.region}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-[#FAFBF8] text-xs text-gray-900 font-medium focus:bg-white focus:border-[#0B5A22] focus:ring-1 focus:ring-[#0B5A22] outline-none transition-all"
                      >
                        <option value="Oromia">Oromia Region</option>
                        <option value="Amhara">Amhara Region</option>
                        <option value="SNNPR">SNNPR Region</option>
                        <option value="Sidama">Sidama Region</option>
                        <option value="Tigray">Tigray Region</option>
                        <option value="Somali">Somali Region</option>
                        <option value="Afar">Afar Region</option>
                        <option value="Benishangul">Benishangul-Gumuz</option>
                        <option value="Gambella">Gambella Region</option>
                        <option value="Rift Valley">Rift Valley Cluster</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Primary Commodity Crop <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="cropType"
                        value={formData.cropType}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-[#FAFBF8] text-xs text-gray-900 font-medium focus:bg-white focus:border-[#0B5A22] focus:ring-1 focus:ring-[#0B5A22] outline-none transition-all"
                      >
                        <option value="Teff">Teff</option>
                        <option value="Coffee">Coffee</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Farm Size (Hectares) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        name="farmSize"
                        value={formData.farmSize}
                        onChange={handleChange}
                        placeholder="2.5"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-[#FAFBF8] text-xs text-gray-900 focus:bg-white focus:border-[#0B5A22] focus:ring-1 focus:ring-[#0B5A22] outline-none transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* GPS Field with Auto-detect button */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-gray-700">
                        GPS Centroid Coordinates <span className="text-red-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleAutoGPS}
                        className="text-[11px] font-bold text-[#0B5A22] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Compass size={12} /> Auto-Detect Coordinates
                      </button>
                    </div>
                    <div className="relative">
                      <MapPin size={15} className="absolute left-3.5 top-3 text-gray-400" />
                      <input
                        type="text"
                        name="gpsCoordinates"
                        value={formData.gpsCoordinates}
                        onChange={handleChange}
                        placeholder="Latitude, Longitude (e.g. 8.9806, 38.7578)"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-200 bg-[#FAFBF8] text-xs text-gray-900 font-mono focus:bg-white focus:border-[#0B5A22] focus:ring-1 focus:ring-[#0B5A22] outline-none transition-all"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Document Proof & Regulatory Consent */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-[#0B5A22] flex items-center justify-center font-bold text-xs">
                      3
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-gray-900">Verification & Compliance Gate</h2>
                      <p className="text-[11px] text-gray-400">Land proof documentation & data authorization</p>
                    </div>
                  </div>

                  {/* Dual Upload Mode: Local File Storage vs Document URL */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-gray-800">
                        Land Ownership Proof Document / Photo Attachment
                      </label>
                      <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                        <button
                          type="button"
                          onClick={() => setUploadMode("local")}
                          className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                            uploadMode === "local" ? "bg-[#0B5A22] text-white shadow-2xs" : "text-gray-600 hover:text-gray-900"
                          }`}
                        >
                          Upload Local File
                        </button>
                        <button
                          type="button"
                          onClick={() => setUploadMode("url")}
                          className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                            uploadMode === "url" ? "bg-[#0B5A22] text-white shadow-2xs" : "text-gray-600 hover:text-gray-900"
                          }`}
                        >
                          Web URL / Cloud Link
                        </button>
                      </div>
                    </div>

                    {uploadMode === "local" ? (
                      /* Option A: Local Storage File Picker & Drag-and-Drop Area */
                      <div className="space-y-2">
                        <div className="relative border-2 border-dashed border-emerald-300 hover:border-[#0B5A22] bg-[#FAFBF8] hover:bg-emerald-50/40 rounded-2xl p-5 text-center transition-colors cursor-pointer group">
                          <input
                            type="file"
                            accept="image/*,.pdf,.doc,.docx,.xlsx,.csv"
                            onChange={handleLocalFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          />
                          
                          {selectedLocalFile ? (
                            <div className="flex items-center justify-between bg-white border border-emerald-200 p-3 rounded-xl shadow-2xs relative z-20">
                              <div className="flex items-center gap-3 min-w-0">
                                {localFilePreview ? (
                                  <img src={localFilePreview} alt="Preview" className="w-12 h-12 rounded-lg object-cover border border-gray-200" />
                                ) : (
                                  <div className="w-10 h-10 rounded-lg bg-emerald-100 text-[#0B5A22] flex items-center justify-center font-bold">
                                    <FileCheck size={20} />
                                  </div>
                                )}
                                <div className="text-left min-w-0">
                                  <p className="text-xs font-bold text-gray-900 truncate">{selectedLocalFile.name}</p>
                                  <p className="text-[10px] text-gray-500 font-medium">
                                    {(selectedLocalFile.size / (1024 * 1024)).toFixed(2)} MB • Local File Ready
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedLocalFile(null);
                                  setLocalFilePreview(null);
                                  setFormData((prev) => ({ ...prev, landProofDocument: "" }));
                                }}
                                className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold cursor-pointer transition-colors relative z-30"
                              >
                                Remove
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-2 pointer-events-none">
                              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#0B5A22] mx-auto flex items-center justify-center font-bold shadow-2xs group-hover:scale-105 transition-transform">
                                <UploadCloud size={24} />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-gray-800">
                                  Click or Drag & Drop local file from your computer / phone storage
                                </p>
                                <p className="text-[11px] text-gray-400 mt-0.5">
                                  Supports scanned deeds, photo certificates (PNG, JPG), PDFs, or Kebele permit docs
                                </p>
                              </div>
                              <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-[#0B5A22] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                                Choose Local Storage File
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      /* Option B: Web URL / Cloud Link Input */
                      <div className="space-y-1">
                        <div className="relative">
                          <Paperclip size={15} className="absolute left-3.5 top-3 text-gray-400" />
                          <input
                            type="text"
                            name="landProofDocument"
                            value={formData.landProofDocument}
                            onChange={handleChange}
                            placeholder="Paste cloud document URL (e.g. https://agrilend.org/docs/land_deed.pdf)"
                            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-200 bg-[#FAFBF8] text-xs text-gray-900 focus:bg-white focus:border-[#0B5A22] focus:ring-1 focus:ring-[#0B5A22] outline-none transition-all"
                          />
                        </div>
                        <p className="text-[10px] text-gray-400">
                          Direct web link to land title deed hosted on cloud storage or government server.
                        </p>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1 mt-3">
                        Preferred Mobile Language (Locale)
                      </label>
                      <div className="relative">
                        <Globe2 size={15} className="absolute left-3.5 top-3 text-gray-400" />
                        <select
                          name="locale"
                          value={formData.locale}
                          onChange={handleChange}
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-200 bg-[#FAFBF8] text-xs text-gray-900 font-medium focus:bg-white focus:border-[#0B5A22] focus:ring-1 focus:ring-[#0B5A22] outline-none transition-all"
                        >
                          <option value="en">English (Default)</option>
                          <option value="am">Amharic (አማርኛ)</option>
                          <option value="om">Afaan Oromoo</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Mandatory Consent Checkbox */}
                  <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80 space-y-2">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="consentGiven"
                        checked={formData.consentGiven}
                        onChange={handleChange}
                        className="mt-0.5 rounded border-gray-300 text-[#0B5A22] focus:ring-[#0B5A22] cursor-pointer"
                      />
                      <div className="text-xs text-gray-800">
                        <span className="font-bold text-[#0B5A22]">
                          Mandatory Regulatory Data Consent Gate (FR-X-002)
                        </span>
                        <p className="text-[11px] text-gray-600 mt-0.5 leading-relaxed">
                          The applicant farmer explicitly consents to sharing geospatial telemetry, crop history, and identity verification with AgriLend's AI credit engine and institutional partner banks.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Form Action Controls */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Clear Form
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-7 py-3 rounded-xl bg-[#0B5A22] hover:bg-[#084519] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Registering Farmer...</span>
                      </>
                    ) : (
                      <>
                        <UserPlus size={16} />
                        <span>Complete Farmer Registration</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Right 1 Col: Live Verification Card & Summary */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Live Profile Preview
                  </h3>
                  <span className="flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                    <Sparkles size={11} /> AI Ready
                  </span>
                </div>

                {/* Farmer Card Preview */}
                <div className="bg-gradient-to-br from-[#16201B] to-[#0A120E] text-white p-5 rounded-2xl space-y-4 shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-[#0B5A22] text-white flex items-center justify-center font-bold text-sm">
                      {formData.fullName ? formData.fullName.slice(0, 2).toUpperCase() : "FP"}
                    </div>
                    <span className="text-[10px] font-mono bg-emerald-950 text-emerald-400 px-2 py-1 rounded-md border border-emerald-800/50">
                      STATUS: PENDING
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-bold tracking-tight text-white">
                      {formData.fullName || "Farmer Name Placeholder"}
                    </h4>
                    <p className="text-xs text-emerald-400 font-medium mt-0.5">
                      {formData.region} Region • {formData.cropType}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/10 text-[11px]">
                    <div>
                      <span className="text-gray-400 block text-[10px]">Farm Size</span>
                      <span className="font-semibold text-white">{formData.farmSize} Hectares</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px]">National ID</span>
                      <span className="font-semibold text-white truncate block">{formData.nationalId || "Not set"}</span>
                    </div>
                  </div>
                </div>

                {/* Pre-flight Checklist */}
                <div className="space-y-2 text-xs">
                  <h4 className="font-bold text-gray-800 text-xs">Verification Checklist</h4>
                  
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAFBF8] border border-gray-100">
                    <span className="text-gray-600 font-medium">National ID Validated</span>
                    {formData.nationalId ? (
                      <CheckCircle2 size={16} className="text-emerald-600" />
                    ) : (
                      <span className="text-[10px] text-gray-400">Required</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAFBF8] border border-gray-100">
                    <span className="text-gray-600 font-medium">GPS Coordinates Set</span>
                    {formData.gpsCoordinates ? (
                      <CheckCircle2 size={16} className="text-emerald-600" />
                    ) : (
                      <span className="text-[10px] text-gray-400">Required</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAFBF8] border border-gray-100">
                    <span className="text-gray-600 font-medium">Regulatory Consent Gate</span>
                    {formData.consentGiven ? (
                      <CheckCircle2 size={16} className="text-emerald-600" />
                    ) : (
                      <span className="text-[10px] text-red-500 font-bold">Pending</span>
                    )}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <ShieldCheck size={14} className="text-amber-700" />
                    <span>Instant Credit Readiness</span>
                  </div>
                  <p className="text-amber-800 leading-relaxed">
                    Once submitted, this farmer profile can immediately be selected when creating new credit applications in the Bank Portal.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {successModalData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl text-center relative overflow-hidden border border-gray-100">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#0B5A22] mx-auto flex items-center justify-center shadow-inner">
              <CheckCircle2 size={36} />
            </div>

            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#0B5A22] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                Registration Complete
              </span>
              <h3 className="text-2xl font-bold text-gray-900 tracking-tight mt-2">
                Farmer Account Created!
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {successModalData.full_name || formData.fullName} has been registered in AgriLend.
              </p>
            </div>

            {/* Account Credentials Card */}
            <div className="p-4 rounded-2xl bg-[#FAFBF8] border border-gray-200 text-left space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Farmer Account ID:</span>
                <span className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">{successModalData.farmer_id || "FARM-98402"}</span>
              </div>
              {successModalData.parcel_id && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Farm Parcel ID:</span>
                  <span className="font-mono font-bold text-[#0B5A22]">{successModalData.parcel_id}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Registered Phone:</span>
                <span className="font-semibold text-gray-900">{formData.phone}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                <span className="text-gray-500 font-bold">Temporary Activation PIN:</span>
                <span className="font-mono font-extrabold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md text-sm">
                  {Math.floor(100000 + Math.random() * 900000)}
                </span>
              </div>
            </div>

            {/* SMS Dispatch & Password Activation Notice Box */}
            <div className="p-4 rounded-2xl bg-emerald-950 text-white text-left space-y-2 text-xs relative overflow-hidden">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <Sparkles size={14} />
                <span>Account Password Setup Instructions</span>
              </div>
              <p className="text-gray-300 text-[11px] leading-relaxed">
                An activation SMS containing the <strong>Farmer ID</strong> and <strong>Temporary Activation PIN</strong> has been dispatched to <strong>{formData.phone}</strong>.
              </p>
              <div className="pt-2 border-t border-white/10 text-[10px] text-emerald-300 space-y-1">
                <p>1. Farmer opens the <strong>AgriLend Mobile App</strong> on their phone.</p>
                <p>2. Enters Phone Number + Temporary Activation PIN.</p>
                <p>3. App automatically prompts farmer to <strong>create their permanent private PIN / Password</strong>.</p>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => onNavigate("applications")}
                className="w-full py-3 rounded-xl bg-[#0B5A22] hover:bg-[#084519] text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Create Loan Application for this Farmer</span>
                <ArrowRight size={14} />
              </button>

              <button
                type="button"
                onClick={() => onNavigate("searchFarmers")}
                className="w-full py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                View in Farmer Registry
              </button>

              <button
                type="button"
                onClick={handleResetForm}
                className="text-xs font-bold text-gray-400 hover:text-gray-600 mt-2 block mx-auto cursor-pointer"
              >
                + Register Another Farmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
