import React, { useState } from "react";
import Sidebar from "./Sidebar";
import DashboardHeader from "./DashboardHeader";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import {
  User,
  MapPin,
  Compass,
  PhoneCall,
  Mail,
  ShieldCheck,
  CheckCircle2,
  FileCheck,
  Layers,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Download,
  ExternalLink,
  Globe2,
  Paperclip,
  Image as ImageIcon,
  Maximize2,
  X,
  Sprout,
  BarChart3,
  Calendar,
  Building,
  DollarSign,
  AlertTriangle,
  FileType
} from "lucide-react";

export default function FarmerDisplayData({
  currentPage,
  onNavigate,
  onLogout,
  currentUser,
  user,
  userRole,
  farmerData
}) {
  const activeUser = currentUser || user;
  const isAdmin = userRole === "admin" || activeUser?.role === "admin";

  // Fallback demo farmer if farmerData is not passed
  const farmer = farmerData || {
    id: "ETH-FARM-8091",
    name: "Abebe Bikila Demisse",
    phone: "+251 91 123 4567",
    email: "abebe.bikila@agrilend.org",
    nationalId: "ETH-94827104-OR",
    kebeleRef: "Woreda 04, Kebele 12 (Arsi-Bale)",
    region: "Oromia (Arsi-Bale Zone)",
    crop: "Teff & Wheat",
    farmSize: "3.8 Hectares",
    gpsCoordinates: "8.9806° N, 38.7578° E",
    elevation: "2,350m above sea level",
    soilType: "Nitisols (Rich Clay Loam)",
    ndviBiomassScore: "0.84 (Healthy Canopy Density)",
    rainfallIndex: "Optimal (820mm/annum)",
    score: 785,
    riskTier: "Low Risk",
    status: "Active / Verified",
    consentStatus: "VERIFIED (FR-X-002)",
    language: "Afaan Oromoo / Amharic",
    recommendedCreditLimit: "280,000 ETB",
    bankAccount: "CBE - 1000182948201",
    telebirrMobile: "+251 91 123 4567",
    attachments: [
      {
        name: "Verified_Land_Title_Deed_Certificate.pdf",
        type: "pdf",
        format: "PDF Document",
        size: "2.4 MB",
        url: "https://agrilend.org/docs/land_deed_sample.pdf"
      },
      {
        name: "Kebele_National_ID_Scan.jpg",
        type: "image",
        format: "JPEG Photo",
        size: "1.8 MB",
        url: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=1000&auto=format&fit=crop"
      },
      {
        name: "Farm_Boundary_GPS_Survey.png",
        type: "image",
        format: "PNG Image",
        size: "3.2 MB",
        url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1000&auto=format&fit=crop"
      }
    ],
    loanHistory: [
      { id: "LN-2023-01", amount: "120,000 ETB", term: "12 Months", status: "Paid in Full", score: "Completed" },
      { id: "LN-2024-02", amount: "180,000 ETB", term: "9 Months", status: "Active Repayment", score: "On Time" }
    ]
  };

  const [previewImageModal, setPreviewImageModal] = useState(null);

  const renderFileIcon = (type) => {
    switch (type) {
      case "image":
        return <ImageIcon size={20} className="text-emerald-700" />;
      case "pdf":
        return <FileCheck size={20} className="text-red-700" />;
      default:
        return <Paperclip size={20} className="text-gray-700" />;
    }
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
          <AdminHeader onLogout={onLogout} onNavigate={onNavigate} activeTabName="Farmer Display Data" />
        ) : (
          <DashboardHeader
            showBack
            onBack={() => onNavigate("searchFarmers")}
            backText="Back to Search Farmers"
            onLogout={onLogout}
            currentUser={activeUser}
            onNavigate={onNavigate}
          />
        )}

        {/* MAIN FARMER PROFILE & LAND DATA CONTAINER */}
        <div className="p-6 max-w-7xl mx-auto w-full space-y-6 animate-fadeIn">
          
          {/* Top Banner Navigation Header */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-96 h-full bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none" />

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => onNavigate("searchFarmers")}
                className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center cursor-pointer transition-colors shrink-0"
                title="Back to Search Farmers"
              >
                <ArrowLeft size={18} />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#0B5A22] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1">
                    <CheckCircle2 size={12} className="text-emerald-600" /> Verified Producer Dossier
                  </span>
                  <span className="text-xs font-mono font-bold text-gray-400">{farmer.id}</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight mt-1">
                  {farmer.name}
                </h1>
                <p className="text-xs text-gray-500 mt-0.5">
                  Region: {farmer.region} • National ID: {farmer.nationalId}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => onNavigate("applications")}
                className="px-5 py-2.5 bg-[#0B5A22] hover:bg-[#084519] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md"
              >
                <span>Create Loan Application</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>

          {/* 3-Column Profile Workspace Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Column 1: Personal Profile & Verification Status */}
            <div className="space-y-6">
              {/* KYC Profile Card */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <h2 className="text-xs font-extrabold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                    <User size={16} className="text-[#0B5A22]" /> Farmer Personal Credentials
                  </h2>
                  <span className="text-[10px] font-bold uppercase bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                    VERIFIED
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#0B5A22] text-white font-bold text-xl flex items-center justify-center shadow-md shrink-0">
                    {farmer.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">{farmer.name}</h3>
                    <p className="text-xs font-mono font-bold text-emerald-700">{farmer.id}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">{farmer.kebeleRef}</p>
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-gray-100 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 font-medium">Phone Number:</span>
                    <span className="font-bold text-gray-900 flex items-center gap-1">
                      <PhoneCall size={12} className="text-[#0B5A22]" /> {farmer.phone}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 font-medium">Email Address:</span>
                    <span className="font-semibold text-gray-700">{farmer.email}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 font-medium">National ID (Kebele):</span>
                    <span className="font-mono font-bold text-gray-900">{farmer.nationalId}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 font-medium">Primary Language:</span>
                    <span className="font-semibold text-emerald-800 flex items-center gap-1">
                      <Globe2 size={12} /> {farmer.language}
                    </span>
                  </div>
                </div>
              </div>

              {/* Financial Accounts & Mobile Money */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <h2 className="text-xs font-extrabold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                    <Building size={16} className="text-[#0B5A22]" /> Disbursement Accounts
                  </h2>
                  <span className="text-[10px] font-mono text-gray-400">Payout Destination</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-[#FAFBF8] border border-gray-200 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Bank Account (CBE)</span>
                    <span className="font-mono font-bold text-gray-900 block">{farmer.bankAccount}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FAFBF8] border border-gray-200 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Telebirr Mobile Wallet</span>
                    <span className="font-mono font-bold text-emerald-800 block">{farmer.telebirrMobile}</span>
                  </div>
                </div>
              </div>

              {/* Regulatory Consent Card */}
              <div className="bg-emerald-950 text-white rounded-2xl p-6 shadow-md space-y-3 relative overflow-hidden">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={18} className="text-emerald-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Consent Verification (FR-X-002)
                  </h3>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Explicit data-sharing consent is active on file. Satellite Sentinel-2 crop monitoring and credit scoring telemetry are authorized.
                </p>
              </div>
            </div>

            {/* Column 2: Geospatial Farm Land Location & Satellite Telemetry */}
            <div className="space-y-6">
              {/* Interactive Visual Farm Map Container */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <Compass size={16} className="text-[#0B5A22]" />
                    <h2 className="text-xs font-extrabold uppercase tracking-wider text-gray-500">
                      Geospatial Farm Land Location
                    </h2>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                    GPS Polygon Verified
                  </span>
                </div>

                {/* Simulated Interactive Map Display */}
                <div className="relative h-56 rounded-2xl overflow-hidden border border-gray-300 bg-gray-900 group shadow-inner">
                  <img
                    src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1000&auto=format&fit=crop"
                    alt="Farm Land Satellite Map"
                    className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                  {/* Satellite Boundary Polygon Badge Overlay */}
                  <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md text-white text-[10px] font-mono font-bold px-3 py-1.5 rounded-lg border border-white/20 flex items-center gap-1.5">
                    <MapPin size={12} className="text-emerald-400" />
                    <span>GPS: {farmer.gpsCoordinates}</span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                    <div>
                      <p className="font-bold">{farmer.crop}</p>
                      <p className="text-[10px] text-emerald-300">{farmer.farmSize} • {farmer.region}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-md bg-emerald-600 text-white font-extrabold text-[10px] uppercase">
                      98% Telemetry Match
                    </span>
                  </div>
                </div>

                {/* Farm Field Metrics Table */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Region & Woreda</span>
                    <span className="font-bold text-gray-900 block mt-0.5">{farmer.region}</span>
                  </div>

                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Farm Parcel Size</span>
                    <span className="font-bold text-gray-900 block mt-0.5">{farmer.farmSize}</span>
                  </div>

                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Soil Profile</span>
                    <span className="font-bold text-gray-900 block mt-0.5">{farmer.soilType}</span>
                  </div>

                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Terrain Elevation</span>
                    <span className="font-bold text-gray-900 block mt-0.5">{farmer.elevation}</span>
                  </div>
                </div>

                {/* Sentinel-2 Biomass Breakdown */}
                <div className="p-4 rounded-xl bg-[#FAFBF8] border border-gray-200 space-y-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-800 flex items-center gap-1.5">
                      <Layers size={14} className="text-[#0B5A22]" /> Sentinel-2 Biomass (NDVI)
                    </span>
                    <span className="font-mono font-bold text-emerald-700">{farmer.ndviBiomassScore}</span>
                  </div>

                  {/* Visual Crop Health Progress Meter */}
                  <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-[#0B5A22] h-full rounded-full w-[84%]" />
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-gray-100 text-[11px]">
                    <span className="text-gray-500">Historical Rainfall Metric:</span>
                    <span className="font-semibold text-gray-800">{farmer.rainfallIndex}</span>
                  </div>
                </div>
              </div>

              {/* Uploaded Verification Proof Attachments */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <Paperclip size={16} className="text-[#0B5A22]" />
                    <h2 className="text-xs font-extrabold uppercase tracking-wider text-gray-500">
                      Uploaded Documents & Land Deeds
                    </h2>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                    {farmer.attachments ? farmer.attachments.length : 2} Files
                  </span>
                </div>

                <div className="space-y-3">
                  {farmer.attachments && farmer.attachments.map((file, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-[#FAFBF8] border border-gray-200 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center shrink-0 shadow-2xs">
                          {renderFileIcon(file.type)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-gray-900 truncate">{file.name}</p>
                          <p className="text-[10px] text-gray-400">{file.format} • {file.size}</p>
                        </div>
                      </div>

                      {file.type === "image" ? (
                        <button
                          type="button"
                          onClick={() => setPreviewImageModal(file)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Maximize2 size={12} /> Preview
                        </button>
                      ) : (
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-[#0B5A22] text-white text-xs font-bold flex items-center gap-1"
                        >
                          <ExternalLink size={12} /> Open
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Column 3: AI Credit Score & Loan History */}
            <div className="space-y-6">
              {/* Credit Score Assessment Box */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <h2 className="text-xs font-extrabold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                    <Sparkles size={16} className="text-[#0B5A22]" /> AI Credit Score
                  </h2>
                  <span className="text-[10px] font-bold uppercase tracking-widest bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Tier: {farmer.riskTier}
                  </span>
                </div>

                <div className="bg-gradient-to-br from-[#16201B] to-[#0A120E] text-white p-6 rounded-2xl text-center space-y-3 shadow-md">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400">
                    Credit Rating Index
                  </span>
                  <div className="text-4xl font-extrabold text-white tracking-tight">
                    {farmer.score} <span className="text-sm font-normal text-gray-400">/ 1000</span>
                  </div>
                  <div className="pt-2 border-t border-white/10 flex justify-between text-xs text-emerald-300 font-semibold">
                    <span>Max Recommended Cap:</span>
                    <span>{farmer.recommendedCreditLimit}</span>
                  </div>
                </div>

                {/* Quick Action Button */}
                <button
                  type="button"
                  onClick={() => onNavigate("applications")}
                  className="w-full py-3 rounded-xl bg-[#0B5A22] hover:bg-[#084519] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg"
                >
                  <Sprout size={16} />
                  <span>Start New Loan Application</span>
                </button>
              </div>

              {/* Loan History Table */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <h2 className="text-xs font-extrabold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                    <BarChart3 size={16} className="text-[#0B5A22]" /> Historical Credit Record
                  </h2>
                  <span className="text-[10px] font-mono text-gray-400">2 Cycles</span>
                </div>

                <div className="space-y-3">
                  {farmer.loanHistory && farmer.loanHistory.map((loan, i) => (
                    <div key={i} className="p-3.5 rounded-xl bg-[#FAFBF8] border border-gray-200 space-y-2 text-xs">
                      <div className="flex justify-between items-center font-bold">
                        <span className="text-gray-900">{loan.id}</span>
                        <span className="text-[#0B5A22] font-mono">{loan.amount}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-gray-500">
                        <span>Term: {loan.term}</span>
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded border border-emerald-200 font-bold">
                          {loan.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
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
