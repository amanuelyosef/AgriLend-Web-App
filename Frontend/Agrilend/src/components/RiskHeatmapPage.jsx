import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Play, RefreshCw } from 'lucide-react';
import { heatmap, simulateHeatmap } from '../api/loans';
import useAsync from '../hooks/useAsync';

const EXPOSURE_COLOR = {
  HIGH: '#EA580C',
  CRITICAL: '#DC2626',
  MEDIUM: '#D97706',
  MODERATE: '#D97706',
  LOW: '#16A34A',
};

export default function RiskHeatmapPage() {
  const mapRef = useRef(null);
  const mapEl = useRef(null);
  const [points, setPoints] = useState(null);
  const [simulating, setSimulating] = useState(false);
  const [message, setMessage] = useState('');

  const data = useAsync(() => heatmap(), []);
  const effectivePoints = points || data.data || [];

  useEffect(() => {
    if (!mapEl.current) return;
    if (mapRef.current) return;

    mapRef.current = L.map(mapEl.current).setView([9, 38.75], 6.4);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; OpenStreetMap &mdash; AgriLend Telemetry',
    }).addTo(mapRef.current);
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !Array.isArray(effectivePoints) || effectivePoints.length === 0) return;

    effectivePoints.forEach((p) => {
      const color = EXPOSURE_COLOR[p.risk_tier?.toUpperCase()] || EXPOSURE_COLOR.MEDIUM;
      const radius = Math.min(24, 8 + (p.avg_score || 500) / 40);
      L.circleMarker([p.lat, p.lng], {
        radius,
        color,
        fillColor: color,
        fillOpacity: 0.55,
        weight: 2,
      })
        .bindPopup(
          `<b>${p.region || 'Zone'}</b><br/>Farmers: ${p.farmer_count}<br/>Avg score: ${Math.round(p.avg_score)}<br/>Tier: ${p.risk_tier}`
        )
        .addTo(map);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectivePoints, data.data]);

  const runSimulation = async () => {
    setSimulating(true);
    setMessage('');
    try {
      const res = await simulateHeatmap({});
      if (Array.isArray(res)) setPoints(res);
      else if (res?.points) setPoints(res.points);
      setMessage('Simulation complete. Risk markers updated.');
    } catch (e) {
      setMessage(`Simulation failed: ${e.message}`);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="p-6 space-y-5 max-w-[1600px] w-full mx-auto">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-emerald-700">Risk Heatmap</p>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight mt-1">Geospatial Risk Map</h1>
          <p className="text-xs text-gray-500 mt-1">
            Track climate, repayment, and portfolio stress across the lending footprint.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setPoints(null)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-600 hover:bg-gray-50"
          >
            <RefreshCw size={14} /> Reset
          </button>
          <button
            type="button"
            disabled={simulating}
            onClick={runSimulation}
            className="flex items-center gap-1.5 bg-[#1A532E] text-white py-2 px-4 rounded-lg text-xs font-semibold hover:bg-[#144023] disabled:opacity-60"
          >
            <Play size={12} fill="currentColor" /> {simulating ? 'Simulating...' : 'Run Risk Simulation'}
          </button>
        </div>
      </div>

      {message && (
        <p className="text-xs font-medium text-[#1A532E] bg-emerald-50 border border-emerald-100 rounded-md px-3 py-2">
          {message}
        </p>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm space-y-3">
        <div className="flex items-center gap-4 text-[11px] text-gray-600 px-2 pt-1">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full inline-block" style={{ background: EXPOSURE_COLOR.LOW }} /> Low
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full inline-block" style={{ background: EXPOSURE_COLOR.MEDIUM }} /> Moderate
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full inline-block" style={{ background: EXPOSURE_COLOR.HIGH }} /> High
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full inline-block" style={{ background: EXPOSURE_COLOR.CRITICAL }} /> Critical
          </span>
        </div>

        {data.loading ? (
          <p className="text-xs text-gray-400 py-16 text-center">Loading heatmap data...</p>
        ) : data.error ? (
          <p className="text-xs text-red-500 py-16 text-center">Could not load heatmap: {data.error.message}</p>
        ) : (
          <div ref={mapEl} className="w-full h-[520px] rounded-lg overflow-hidden z-0" />
        )}
      </div>
    </div>
  );
}
