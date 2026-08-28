import React, { useState, useEffect } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import RealRiskMap from "./RealRiskMap";
import { fetchRiskHeatmap, runRiskSimulation } from "../services/api";
import {
  Map,
  Filter,
  TrendingUp,
  AlertTriangle,
  Info,
  ChevronRight,
  Download,
  Play,
  X,
  Loader2,
  Zap,
  CheckCircle2,
  ShieldAlert,
  ArrowLeft,
  RefreshCw,
  Layers,
  Activity
} from "lucide-react";

const initialHeatmapCells = [
  { name: "Arsi-Bale Zone", crop: "Wheat", score: 812, exposure: "Critical", trend: "+9%", tone: "bg-red-700", text: "text-red-700", border: "border-red-200", lat: 7.5000, lng: 39.2000 },
  { name: "West Shewa", crop: "Teff", score: 756, exposure: "High", trend: "+4%", tone: "bg-red-500", text: "text-red-600", border: "border-red-100", lat: 8.9500, lng: 37.8500 },
  { name: "West Gojjam", crop: "Maize", score: 701, exposure: "High", trend: "+2%", tone: "bg-orange-500", text: "text-orange-600", border: "border-orange-100", lat: 11.1000, lng: 37.2000 },
  { name: "Wolaita Cluster", crop: "Root Crops", score: 642, exposure: "Moderate", trend: "-1%", tone: "bg-amber-400", text: "text-amber-600", border: "border-amber-100", lat: 6.8500, lng: 37.7500 },
  { name: "Awash River Basin", crop: "Cotton", score: 835, exposure: "Critical", trend: "+11%", tone: "bg-red-800", text: "text-red-800", border: "border-red-300", lat: 9.2000, lng: 40.1000 },
  { name: "Southern Tigray", crop: "Sorghum", score: 774, exposure: "High", trend: "+6%", tone: "bg-red-600", text: "text-red-700", border: "border-red-200", lat: 13.1500, lng: 39.5000 },
  { name: "Sidama-Yirgacheffe", crop: "Coffee", score: 522, exposure: "Low", trend: "-7%", tone: "bg-emerald-300", text: "text-emerald-700", border: "border-emerald-100", lat: 6.8500, lng: 38.2000 },
  { name: "Borena Zone", crop: "Livestock", score: 798, exposure: "High", trend: "+8%", tone: "bg-red-700", text: "text-red-700", border: "border-red-200", lat: 4.9000, lng: 38.0800 },
  { name: "Jimma-Kaffa", crop: "Coffee", score: 483, exposure: "Low", trend: "-9%", tone: "bg-emerald-500", text: "text-emerald-700", border: "border-emerald-100", lat: 7.6700, lng: 36.8300 },
  { name: "Somali Lowlands", crop: "Livestock", score: 851, exposure: "Critical", trend: "+13%", tone: "bg-red-900", text: "text-red-800", border: "border-red-300", lat: 7.3500, lng: 43.5500 },
  { name: "Ada'a Teff Belt", crop: "Teff", score: 536, exposure: "Low", trend: "-2%", tone: "bg-emerald-300", text: "text-emerald-700", border: "border-emerald-100", lat: 8.7500, lng: 38.9800 },
];

export default function AdminRiskHeatmap({ currentPage, onNavigate, onLogout }) {
  const [heatmapCells, setHeatmapCells] = useState(initialHeatmapCells);
  const [selectedCluster, setSelectedCluster] = useState(initialHeatmapCells[0]);
  const [selectedExposureFilter, setSelectedExposureFilter] = useState("ALL");
  const [showSimModal, setShowSimModal] = useState(false);
  const [simScenario, setSimScenario] = useState("drought");
  const [isSimulating, setIsSimulating] = useState(false);
  const [simResults, setSimResults] = useState(null);
  const [activeSimulationBanner, setActiveSimulationBanner] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function initHeatmap() {
      const res = await fetchRiskHeatmap();
      if (isMounted && res.success && Array.isArray(res.data) && res.data.length > 0) {
        setHeatmapCells(res.data);
        setSelectedCluster(res.data[0]);
      }
    }
    initHeatmap();
    return () => { isMounted = false; };
  }, []);

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    const res = await runRiskSimulation({ scenario: simScenario });
    if (res.success && res.data) {
      setSimResults(res.data);
    }
    setIsSimulating(false);
  };

  const handleApplySimulation = () => {
    if (!simResults) return;
    setActiveSimulationBanner(`Applied Live Scenario: ${simResults.name}`);
    setShowSimModal(false);
  };

  const filteredCells = heatmapCells.filter((cell) => {
    if (selectedExposureFilter === "ALL") return true;
    return cell.exposure.toUpperCase() === selectedExposureFilter;
  });

  return (
    <div className="flex h-screen w-screen bg-[#E6EAE0] overflow-hidden font-sans text-gray-900 select-none">
      <AdminSidebar currentPage={currentPage} onNavigate={onNavigate} />

      <main className="flex-1 h-full flex flex-col overflow-y-auto">
        <AdminHeader onLogout={onLogout} onNavigate={onNavigate} activeTabName="Operations Portal" />

        <div className="p-4 space-y-4 max-w-7xl w-full mx-auto">
          {/* Back Header & Title */}
          <div className="bg-[#ECEFE5] border border-[#D9DED0] rounded-md p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onNavigate && onNavigate("admin")}
                className="w-8 h-8 rounded-lg bg-white border border-[#D9DED0] flex items-center justify-center text-gray-700 hover:text-[#0B5A22] hover:bg-emerald-50 transition-all cursor-pointer shadow-xs shrink-0"
                title="Return to Admin Overview Dashboard"
              >
                <ArrowLeft size={16} />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#0B5A22] text-white">
                    GIS Regional Intelligence
                  </span>
                  <span className="text-xs font-mono font-semibold text-emerald-800">Live Satellite Stream</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight mt-1">Regional Risk Heatmap</h1>
                <p className="text-xs text-gray-600">
                  Track geospatial climate stress, drought index, and agricultural portfolio risk.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowSimModal(true)}
                className="px-3.5 py-2 rounded bg-[#0B5A22] hover:bg-[#084519] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
              >
                <Zap size={14} />
                <span>Run Stress Simulation</span>
              </button>
            </div>
          </div>

          {activeSimulationBanner && (
            <div className="p-3 bg-amber-50 border border-amber-300 text-amber-900 rounded-md text-xs font-bold flex items-center justify-between animate-fadeIn">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-amber-700" />
                <span>{activeSimulationBanner}</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveSimulationBanner(null)}
                className="text-xs text-amber-700 hover:underline cursor-pointer font-semibold"
              >
                Reset Filter
              </button>
            </div>
          )}

          {/* Filter Bar */}
          <div className="bg-white border border-[#D9DED0] rounded-md p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mr-1">Filter Exposure:</span>
              {["ALL", "CRITICAL", "HIGH", "MODERATE", "LOW"].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setSelectedExposureFilter(level)}
                  className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                    selectedExposureFilter === level
                      ? "bg-[#0B5A22] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>

            <div className="text-xs font-mono font-semibold text-gray-500">
              Showing <span className="text-gray-900 font-bold">{filteredCells.length}</span> Clusters
            </div>
          </div>

          {/* Main Content Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left 2 Cols: GIS Interactive Map */}
            <div className="lg:col-span-2 bg-white border border-[#D9DED0] rounded-md p-4 flex flex-col shadow-xs min-h-[480px]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Map size={16} className="text-[#0B5A22]" />
                  <h3 className="text-sm font-bold text-gray-900">Geospatial Risk GIS Map</h3>
                </div>
                <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                  Sentinel-2 Biomass Feed Active
                </span>
              </div>

              <div className="flex-1 rounded-md overflow-hidden border border-[#D9DED0] relative min-h-[400px]">
                <RealRiskMap
                  clusters={filteredCells}
                  selectedCluster={selectedCluster}
                  onSelectCluster={(cell) => setSelectedCluster(cell)}
                />
              </div>
            </div>

            {/* Right Col: Selected Cluster Drilldown */}
            <div className="bg-white border border-[#D9DED0] rounded-md p-4 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Selected Region</p>
                    <h3 className="text-lg font-bold text-gray-900 mt-0.5">{selectedCluster?.name || "Arsi-Bale Zone"}</h3>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase ${
                      selectedCluster?.exposure === "Critical"
                        ? "bg-red-50 text-red-700 border border-red-200"
                        : selectedCluster?.exposure === "High"
                        ? "bg-amber-50 text-amber-800 border border-amber-200"
                        : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    }`}
                  >
                    {selectedCluster?.exposure || "Critical"} Risk
                  </span>
                </div>

                <div className="mt-4 space-y-3 text-xs">
                  <div className="flex justify-between py-2 border-b border-gray-50">
                    <span className="text-gray-500 font-medium">Primary Crop</span>
                    <span className="font-bold text-gray-900">{selectedCluster?.crop || "Wheat"}</span>
                  </div>

                  <div className="flex justify-between py-2 border-b border-gray-50">
                    <span className="text-gray-500 font-medium">Risk Score Index</span>
                    <span className="font-bold font-mono text-red-700">{selectedCluster?.score || 812} / 1000</span>
                  </div>

                  <div className="flex justify-between py-2 border-b border-gray-50">
                    <span className="text-gray-500 font-medium">YoY Trend</span>
                    <span className="font-bold text-red-600">{selectedCluster?.trend || "+9%"}</span>
                  </div>

                  <div className="flex justify-between py-2 border-b border-gray-50">
                    <span className="text-gray-500 font-medium">Latitude / Longitude</span>
                    <span className="font-mono text-gray-700">{selectedCluster?.lat}, {selectedCluster?.lng}</span>
                  </div>
                </div>

                <div className="mt-5 p-3 rounded bg-[#F7F9F4] border border-[#E1E6D8] space-y-1">
                  <p className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">Automated Policy Recommendation</p>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {selectedCluster?.exposure === "Critical"
                      ? "Mandate 20% collateral buffer for unhedged wheat applications in this cluster."
                      : selectedCluster?.exposure === "High"
                      ? "Recommend weather-indexed crop insurance validation prior to credit approval."
                      : "Standard risk tier. Automated underwriting approval enabled."}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 space-y-2">
                <button
                  type="button"
                  onClick={() => onNavigate && onNavigate("farmersQueue")}
                  className="w-full h-9 rounded bg-[#0B5A22] hover:bg-[#084519] text-white text-xs font-bold cursor-pointer transition-all shadow-xs flex items-center justify-center gap-1.5"
                >
                  <span>Review Applications in this Region</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Stress Simulation Modal */}
      {showSimModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Zap size={18} className="text-emerald-700" />
                <h3 className="text-base font-bold text-gray-900">Run Climate Stress Simulation</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSimModal(false)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-full cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-gray-600">
                Select a shock scenario to project impact across regional loan portfolios:
              </p>

              <div className="space-y-2">
                {[
                  { id: "drought", label: "Severe Regional Drought (El Niño)", desc: "Biomass density drops up to 38% in Awash & Somali basins." },
                  { id: "locust", label: "Desert Locust Outbreak", desc: "Crop health degradation across Teff & Wheat belts in Oromia." },
                  { id: "rates", label: "Macro Credit Stress (+250 bps Rate Surge)", desc: "Default probability increases across unhedged smallholders." },
                ].map((scen) => (
                  <label
                    key={scen.id}
                    onClick={() => setSimScenario(scen.id)}
                    className={`block p-3 rounded-lg border cursor-pointer transition-all ${
                      simScenario === scen.id
                        ? "border-[#0B5A22] bg-emerald-50/50 text-gray-900"
                        : "border-gray-200 hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">{scen.label}</span>
                      <input type="radio" checked={simScenario === scen.id} onChange={() => {}} className="accent-[#0B5A22]" />
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1">{scen.desc}</p>
                  </label>
                ))}
              </div>
            </div>

            {simResults && (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 space-y-1">
                <p className="text-xs font-bold text-amber-900">{simResults.name}</p>
                <p className="text-[11px] text-amber-800">
                  Critical Exposure Increase: <span className="font-bold">{simResults.newCriticalPct}</span> ({simResults.pctChange})
                </p>
                <p className="text-[11px] text-amber-800">
                  At-Risk Portfolio Capital: <span className="font-bold">{simResults.atRiskCapital}</span>
                </p>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setShowSimModal(false)}
                className="px-4 py-2 rounded border border-gray-300 text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={simResults ? handleApplySimulation : handleRunSimulation}
                disabled={isSimulating}
                className="px-4 py-2 rounded bg-[#0B5A22] hover:bg-[#084519] text-white text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5"
              >
                {isSimulating ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Simulating...</span>
                  </>
                ) : simResults ? (
                  <span>Apply to Map View</span>
                ) : (
                  <span>Run Scenario Model</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
