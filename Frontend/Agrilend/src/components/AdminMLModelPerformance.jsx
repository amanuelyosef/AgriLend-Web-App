import React, { useState, useEffect } from "react";
import { AlertTriangle, RefreshCw, Target, Crosshair, RotateCcw, Activity, CheckCircle2, Terminal } from "lucide-react";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";
import { fetchMLModelMetrics, fetchMLDriftStatus, fetchYieldForecast } from "../services/api";

const levelTone = { INFO: "text-emerald-400", WARN: "text-amber-400", ERROR: "text-red-400" };

export default function AdminMLModelPerformance({ currentPage, onNavigate, onLogout }) {
  const [metricCards, setMetricCards] = useState([]);
  const [driftInfo, setDriftInfo] = useState(null);
  const [isRetraining, setIsRetraining] = useState(false);
  const [retrainSuccess, setRetrainSuccess] = useState(null);
  const [selectedCrop, setSelectedCrop] = useState("All");
  const [yieldPoints, setYieldPoints] = useState([]);
  const [yieldLoading, setYieldLoading] = useState(false);
  const [hoveredYieldRegion, setHoveredYieldRegion] = useState(null);
  const [logsList, setLogsList] = useState([]);

  useEffect(() => {
    async function loadMLMetrics() {
      const [metricsRes, driftRes] = await Promise.all([
        fetchMLModelMetrics(),
        fetchMLDriftStatus(),
      ]);

      if (metricsRes.success && metricsRes.data) {
        const d = metricsRes.data;
        const f1 = d.f1_score != null ? `F1 Score: ${(d.f1_score * 100).toFixed(1)}%` : "F1 Score: —";
        setMetricCards([
          { label: "ACCURACY", value: d.accuracy != null ? `${(d.accuracy * 100).toFixed(1)}%` : "—", note: "Live FastAPI ML model", noteTone: "text-[#1A532E]", icon: Target, highlight: false },
          { label: "PRECISION", value: d.precision != null ? `${(d.precision * 100).toFixed(1)}%` : "—", note: "Validated test set", noteTone: "text-[#1A532E]", icon: Crosshair, highlight: false },
          { label: "RECALL", value: d.recall != null ? `${(d.recall * 100).toFixed(1)}%` : "—", note: f1, noteTone: "text-gray-500", icon: RotateCcw, highlight: false },
          { label: "DRIFT SCORE", value: driftRes.data?.drift_score != null ? driftRes.data.drift_score.toFixed(2) : "—", note: driftRes.data?.recommended_action || "—", noteTone: "text-gray-500", valueTone: "text-emerald-600", icon: Activity, highlight: true },
        ]);
      }
      if (driftRes.success && driftRes.data) {
        setDriftInfo(driftRes.data);
      }
    }
    loadMLMetrics();
  }, []);

  useEffect(() => {
    async function loadYieldForecast() {
      setYieldLoading(true);
      const res = await fetchYieldForecast(selectedCrop);
      if (res && res.success && res.data) {
        setYieldPoints(Array.isArray(res.data.points) ? res.data.points : []);
      } else {
        setYieldPoints([]);
      }
      setYieldLoading(false);
    }
    loadYieldForecast();
  }, [selectedCrop]);

  const handleTriggerRetrain = () => {
    setIsRetraining(true);
    setRetrainSuccess(null);

    const nowStr = () => new Date().toISOString().replace("T", " ").substring(0, 19);

    setLogsList((prev) => [
      ...prev,
      { time: nowStr(), level: "INFO", text: "[SIMULATION] Retrain triggered locally (no backend endpoint exists)." },
      { time: nowStr(), level: "INFO", text: "Simulating a training run in the UI only..." },
    ]);

    setTimeout(() => {
      setLogsList((prev) => [
        ...prev,
        { time: nowStr(), level: "INFO", text: "Simulated epoch 1/3 - placeholder loss values" },
        { time: nowStr(), level: "INFO", text: "Simulated epoch 2/3 - placeholder loss values" },
        { time: nowStr(), level: "INFO", text: "Simulated epoch 3/3 - placeholder loss values" },
      ]);
    }, 800);

    setTimeout(() => {
      setIsRetraining(false);
      setRetrainSuccess("SIMULATION ONLY: The retraining UX completed. No model metrics were changed because the backend does not expose a retrain endpoint.");
    }, 1600);
  };

  const driftDetected = driftInfo && (driftInfo.feature_drift_detected === true || driftInfo.score_drift_detected === true);

  return (
    <div className="flex h-screen w-screen bg-[#E6EAE0] overflow-hidden">
      <AdminSidebar currentPage={currentPage} onNavigate={onNavigate} />
      <main className="flex-1 h-full flex flex-col overflow-y-auto">
        <AdminHeader onLogout={onLogout} onNavigate={onNavigate} />
        <div className="p-3">
          <section className="bg-[#ECEFE5] border border-[#D9DED0] rounded-sm overflow-hidden">
            <div className="p-4 space-y-4">
              {retrainSuccess && (
                <div className="bg-amber-50 border border-amber-300 text-amber-900 rounded-md px-4 py-3 flex items-center gap-3 animate-fadeIn text-xs font-bold shadow-xs">
                  <CheckCircle2 size={18} className="text-amber-600 shrink-0" />
                  <span>{retrainSuccess}</span>
                </div>
              )}

              <div className="bg-[#FDF6E3] border-l-4 border-amber-400 rounded-md px-4 py-3 flex items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle size={16} className="text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-gray-800">{driftDetected ? "Model drift detected" : "Model retraining (simulation)"}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      {driftInfo?.recommended_action || "No retraining endpoint is exposed by the backend. The retrain button below only simulates the retraining UX and does not change any real model metrics."}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleTriggerRetrain}
                  disabled={isRetraining}
                  className="flex items-center gap-2 h-9 px-4 rounded bg-[#0B5A22] text-white text-xs font-semibold hover:bg-[#094a1c] whitespace-nowrap cursor-pointer transition-all disabled:opacity-75 shadow-xs"
                >
                  <RefreshCw size={14} className={isRetraining ? "animate-spin" : ""} />
                  <span>{isRetraining ? "Retraining Engine..." : "Trigger Model Retrain (Simulation)"}</span>
                </button>
              </div>

              <div className="bg-white border border-[#D9DED0] rounded-md p-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">ML Architecture (v1.1)</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm font-bold text-gray-900">GEE + XGBoost / LightGBM</p>
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  </div>
                  <p className="text-[10px] text-gray-500 font-mono mt-0.5">FastAPI on Cloud Run</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">GEE Data Computation</p>
                  <p className="text-xs font-mono font-semibold text-gray-800 mt-2">NDVI, NDWI, Cloud Reflectance</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">PostGIS Farm Polygons</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">Training Environment</p>
                  <p className="text-xs font-semibold text-gray-800 mt-2">Google Colab ML Pipeline</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">Google Cloud Storage Artifacts</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">Deployment Endpoint</p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <CheckCircle2 size={14} className="text-emerald-600" />
                    <p className="text-xs font-mono font-bold text-emerald-700">POST /predict (Cloud Run)</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                {metricCards.length === 0 ? (
                  <div className="col-span-full bg-white rounded-md p-6 text-center text-xs text-gray-500">
                    Loading model metrics...
                  </div>
                ) : (
                  metricCards.map((card) => { const Icon = card.icon; return (
                    <div key={card.label} className={`bg-white rounded-md p-4 border ${card.highlight ? "border-emerald-600 border-2" : "border-[#D9DED0]"}`}>
                      <div className="flex items-center justify-between"><p className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">{card.label}</p><Icon size={15} className="text-gray-400" /></div>
                      <p className={`text-2xl font-bold mt-2 ${card.valueTone || "text-gray-900"}`}>{card.value}</p>
                      <p className={`text-[11px] font-semibold mt-1 ${card.noteTone}`}>{card.note}</p>
                    </div>
                  ); })
                )}
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                <div className="bg-white border border-[#D9DED0] rounded-md p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-bold text-gray-800">Accuracy Stability (30d)</h3>
                      <p className="text-[10px] text-gray-400 font-medium">No time-series accuracy data is provided by the backend.</p>
                    </div>
                  </div>

                  <div className="bg-[#F7F8F4] border border-[#E2E8D8] rounded-md p-8 text-center">
                    <p className="text-xs text-gray-500">No accuracy trend data available. The backend does not expose a time-series source for this chart.</p>
                  </div>
                </div>

                <div className="bg-white border border-[#D9DED0] rounded-md p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-bold text-gray-800">Prediction vs Actual Yield (MT/Ha)</h3>
                      <p className="text-[10px] text-gray-400 font-medium">Crop harvest model variance across key regions</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={selectedCrop}
                        onChange={(e) => setSelectedCrop(e.target.value)}
                        className="h-7 text-[10px] font-bold bg-[#F4F6F0] border border-[#D9DED0] text-gray-700 rounded px-2 outline-none cursor-pointer hover:border-[#0B5A22]"
                      >
                        <option value="All">All Crops</option>
                        <option value="Maize">Maize</option>
                        <option value="Teff">Teff</option>
                        <option value="Coffee">Coffee</option>
                      </select>
                    </div>
                  </div>

                  {/* Legend & Summary Info */}
                  <div className="flex items-center justify-between mb-2 px-1">
                    <div className="flex items-center gap-3 text-[10px] font-bold text-gray-600">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-xs bg-[#A3C9A8]"></span> PREDICTED
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-xs bg-[#0B5A22]"></span> ACTUAL
                      </span>
                    </div>
                    {hoveredYieldRegion && (
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 animate-fadeIn">
                        {hoveredYieldRegion.region} ({hoveredYieldRegion.crop}): Error{" "}
                        {hoveredYieldRegion.actual > 0 ? Math.abs(((hoveredYieldRegion.predicted - hoveredYieldRegion.actual) / hoveredYieldRegion.actual * 100)).toFixed(1) + "%" : "—"}
                      </span>
                    )}
                  </div>

                  {/* Dual Bar Chart */}
                  {yieldLoading ? (
                    <div className="flex items-center justify-center h-36 text-xs text-gray-500">Loading yield forecast...</div>
                  ) : yieldPoints.length === 0 ? (
                    <div className="flex items-center justify-center h-36 text-xs text-gray-500">No yield forecast data available for this crop.</div>
                  ) : (
                    <div className="flex items-end justify-between gap-2 h-36 px-1 relative">
                      {yieldPoints.map((r) => {
                        const pred = Number(r.predicted) || 0;
                        const act = Number(r.actual) || 0;
                        const maxScale = 6.0;
                        const predHeight = (pred / maxScale) * 100;
                        const actHeight = (act / maxScale) * 100;
                        const isHovered = hoveredYieldRegion?.region === r.region;

                        return (
                          <div
                            key={r.region}
                            className="flex-1 flex flex-col items-center gap-1.5 group cursor-pointer"
                            onMouseEnter={() => setHoveredYieldRegion({ ...r, predicted: pred, actual: act })}
                            onMouseLeave={() => setHoveredYieldRegion(null)}
                          >
                            <div className="w-full flex items-end justify-center gap-1 h-28 relative">
                              {/* Predicted Bar */}
                              <div
                                className={`w-1/2 bg-[#A3C9A8] rounded-t-xs transition-all group-hover:bg-[#8FBE95] relative ${
                                  isHovered ? "ring-2 ring-emerald-500" : ""
                                }`}
                                style={{ height: `${predHeight}%` }}
                              >
                                <span className="opacity-0 group-hover:opacity-100 absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-gray-700 bg-white px-1 rounded shadow-xs border border-gray-200 transition-opacity whitespace-nowrap z-10">
                                  {pred.toFixed(1)} MT
                                </span>
                              </div>
                              {/* Actual Bar */}
                              <div
                                className={`w-1/2 bg-[#0B5A22] rounded-t-xs transition-all group-hover:bg-[#084319] relative ${
                                  isHovered ? "ring-2 ring-emerald-600" : ""
                                }`}
                                style={{ height: `${actHeight}%` }}
                              >
                                <span className="opacity-0 group-hover:opacity-100 absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-emerald-800 bg-emerald-50 px-1 rounded shadow-xs border border-emerald-300 transition-opacity whitespace-nowrap z-10">
                                  {act.toFixed(1)} MT
                                </span>
                              </div>
                            </div>
                            <span className={`text-[9px] font-bold text-center leading-tight transition-colors ${isHovered ? "text-[#0B5A22]" : "text-gray-500"}`}>
                              {r.region}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-[#0B0E0D] border border-[#1D2420] rounded-md overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#1D2420]">
                  <div className="flex items-center gap-2 text-white"><Terminal size={14} className="text-emerald-400" /><p className="text-xs font-bold tracking-wide">TRAINING LOGS (SIMULATED)</p></div>
                  <div className="flex items-center gap-3 text-[10px] font-semibold"><span className="text-amber-400">STATUS: SIMULATION ONLY</span></div>
                </div>
                <div className="p-4 font-mono text-[11px] leading-relaxed space-y-0.5 max-h-48 overflow-y-auto flex flex-col-reverse">
                  {logsList.length === 0 ? (
                    <p className="text-gray-500">[IDLE] No training activity recorded. Use the retrain button above to run a simulated run.</p>
                  ) : (
                    [...logsList].reverse().map((log, i) => (
                      <p key={i} className="text-gray-300 animate-fadeIn"><span className="text-gray-500">[{log.time}]</span> <span className={`font-bold ${levelTone[log.level] || "text-emerald-400"}`}>{log.level}</span> {log.text}</p>
                    ))
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
