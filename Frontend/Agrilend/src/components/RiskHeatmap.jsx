import React, { useState, useEffect } from 'react';
import { Info, Play, Loader2, MapPin, Zap } from 'lucide-react';
import { fetchRiskHeatmap } from '../services/api';

export default function RiskHeatmap({ onNavigate }) {
  const [cells, setCells] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCell, setHoveredCell] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      const res = await fetchRiskHeatmap();
      if (isMounted) {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          setCells(res.data);
        }
        setLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, []);

  const total = cells.length || 25;
  const criticalCount = cells.filter(c => (c.exposure || "").toLowerCase() === "critical" || (c.exposure || "").toLowerCase() === "high").length;
  const criticalPct = total > 0 ? ((criticalCount / total) * 100).toFixed(1) : "12.0";

  const displayedBlocks = cells.slice(0, 25);

  const handleRunSimulation = () => {
    if (typeof onNavigate === 'function') {
      onNavigate('riskHeatmap');
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4 relative">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-bold text-gray-800">Risk Heatmap</h3>
          <p className="text-[10px] text-gray-400 font-medium">Real-time regional exposure</p>
        </div>
        <button
          type="button"
          onClick={handleRunSimulation}
          title="Inspect full heatmap"
          className="text-gray-400 hover:text-emerald-700 cursor-pointer transition-colors"
        >
          <Info size={14} />
        </button>
      </div>

      {loading ? (
        <div className="aspect-square w-full flex items-center justify-center bg-gray-50 rounded-xl">
          <Loader2 className="animate-spin text-emerald-700" size={20} />
        </div>
      ) : (
        <div className="relative pt-11">
          {/* Interactive Hover Card Overlay */}
          {hoveredCell && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] p-2 rounded-md shadow-xl z-20 w-48 pointer-events-none animate-fadeIn border border-gray-700">
              <div className="flex items-center justify-between font-bold border-b border-gray-700 pb-1 mb-1">
                <span className="flex items-center gap-1 text-emerald-400">
                  <MapPin size={10} /> {hoveredCell.name || "Cluster Region"}
                </span>
                <span className={`px-1.5 py-0.2 rounded text-[8px] font-black uppercase ${
                  hoveredCell.exposure === "Critical" ? "bg-red-500 text-white" :
                  hoveredCell.exposure === "High" ? "bg-orange-500 text-white" :
                  hoveredCell.exposure === "Moderate" ? "bg-amber-500 text-gray-900" :
                  "bg-emerald-500 text-white"
                }`}>
                  {hoveredCell.exposure}
                </span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Crop: <b>{hoveredCell.crop || "Agricultural"}</b></span>
                <span>Score: <b className="text-white">{hoveredCell.score || 650}</b></span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-5 gap-1.5 aspect-square w-full">
            {displayedBlocks.map((cell, i) => (
              <div
                key={cell.name || i}
                onMouseEnter={() => setHoveredCell(cell)}
                onMouseLeave={() => setHoveredCell(null)}
                className={`rounded-sm transition-all cursor-pointer ${cell.tone || 'bg-emerald-500'} ${
                  hoveredCell?.name === cell.name ? 'ring-2 ring-gray-900 brightness-110 shadow-md' : ''
                }`}
                onClick={handleRunSimulation}
              />
            ))}
          </div>
        </div>
      )}

      <div className="text-xs">
        <div className="flex justify-between font-bold text-[11px] mb-1">
          <span className="text-gray-500">Critical & High Risk Exposure</span>
          <span className="text-red-600 font-extrabold">{criticalPct}%</span>
        </div>
        <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-red-600 h-full transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(5, parseFloat(criticalPct)))}%` }}
          />
        </div>
      </div>

      <div className="bg-[#FAFBF5] border border-emerald-100 p-2.5 rounded-lg text-[11px] text-gray-600 flex items-start gap-2">
        <Zap size={14} className="text-amber-500 mt-0.5 shrink-0" />
        <p className="leading-tight">
          High risk concentration in <b>Awash River Basin</b> & <b>Arsi-Bale Zone</b>.
        </p>
      </div>

      <button
        type="button"
        onClick={handleRunSimulation}
        className="w-full bg-[#1A532E] text-white py-2.5 rounded-lg text-xs font-semibold hover:bg-[#144023] flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-[0.99]"
      >
        <span>Run Risk Simulation</span>
        <Play size={12} fill="currentColor" />
      </button>
    </div>
  );
}