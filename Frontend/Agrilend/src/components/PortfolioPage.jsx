import React, { useState } from 'react';
import { BarChart3, TrendingUp, TrendingDown, ShieldCheck, PieChart, Download, CalendarDays, Activity } from 'lucide-react';
import { portfolio, riskReport } from '../api/home';
import useAsync from '../hooks/useAsync';

export default function PortfolioPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const port = useAsync(portfolio, [refreshKey]);
  const risk = useAsync(riskReport, [refreshKey]);

  const p = port.data || {};
  const r = risk.data || {};

  const holdings = Array.isArray(p.holdings) && p.holdings.length
    ? p.holdings.map((h, i) => ({
        name: h.name || `Bucket ${i + 1}`,
        value: h.value != null ? h.value : h.exposure,
        change: h.change || '',
        tone: h.tone || 'text-emerald-600',
        bg: h.bg || 'bg-emerald-50',
      }))
    : [
        { name: 'Approved Loans', value: p.approved_total, change: '+8.4%', tone: 'text-emerald-600', bg: 'bg-emerald-50' },
        { name: 'Pending Queue', value: p.pending_total, change: '+2.1%', tone: 'text-amber-600', bg: 'bg-amber-50' },
        { name: 'At Risk Exposure', value: p.at_risk_total, change: '-3.6%', tone: 'text-red-600', bg: 'bg-red-50' },
        { name: 'Recovery Rate', value: p.recovery_rate, change: '+1.2%', tone: 'text-emerald-600', bg: 'bg-emerald-50' },
      ];

  const allocations = Array.isArray(p.allocations) && p.allocations.length
    ? p.allocations.map((a) => ({ label: a.label || a.name || 'Crop', pct: Number(a.pct ?? a.value ?? 0), color: a.color || 'bg-[#1A532E]' }))
    : [];

  const fmt = (v) =>
    v == null ? '—' : typeof v === 'string' ? v : `$${Number(v).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

  return (
    <div className="p-6 space-y-6 max-w-[1600px] w-full mx-auto">
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-emerald-700">Portfolio Monitor</p>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight mt-1">Portfolio</h1>
          <p className="text-xs text-gray-500 mt-1">Watch exposure, performance, and recovery across the lending book.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button type="button" className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-600 hover:bg-gray-50">
            <CalendarDays size={14} /> This Month
          </button>
          <button type="button" className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-600 hover:bg-gray-50">
            <Download size={14} /> Export
          </button>
          <button
            type="button"
            onClick={() => setRefreshKey((k) => k + 1)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1A532E] text-white text-xs font-semibold hover:bg-[#144023]"
          >
            <BarChart3 size={14} /> Refresh Metrics
          </button>
        </div>
      </div>

      {port.loading ? (
        <p className="text-xs text-gray-400 py-12 text-center">Loading portfolio...</p>
      ) : port.error ? (
        <p className="text-xs text-red-500 py-12 text-center">Could not load portfolio: {port.error.message}</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {holdings.map((item, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">{item.name}</p>
                    <h3 className="text-2xl font-extrabold text-gray-900 mt-2">{fmt(item.value)}</h3>
                  </div>
                  {item.change && (
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${item.bg} ${item.tone}`}>
                      {item.change}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {allocations.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-gray-800">Portfolio mix</h2>
                  <p className="text-[11px] text-gray-500 mt-0.5">Exposure by crop and sector.</p>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  <PieChart size={14} className="text-gray-400" /> Allocation overview
                </div>
              </div>
              <div className="mt-5 space-y-3">
                {allocations.map((item, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold text-gray-700">{item.label}</span>
                      <span className="font-bold text-gray-900">{item.pct}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div className={`h-full ${item.color}`} style={{ width: `${item.pct}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-gray-800">Risk & Portfolio Report</h3>
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <Stat label="Default rate" value={r.default_rate != null ? `${(r.default_rate * 100).toFixed(1)}%` : '—'} />
                <Stat label="Active loans" value={r.total_active_loans != null ? r.total_active_loans : '—'} />
                <Stat label="High risk" value={r.high_risk_count != null ? r.high_risk_count : '—'} tone="text-red-600" />
                <Stat label="Low risk" value={r.low_risk_count != null ? r.low_risk_count : '—'} tone="text-emerald-600" />
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#1A532E] flex items-center justify-center text-white">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">Stability signal</p>
                  <h3 className="text-base font-bold text-gray-900">Monitoring</h3>
                </div>
              </div>
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <TrendingUp size={14} className="text-emerald-600" /> Live portfolio tracked from the scoring engine.
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <TrendingDown size={14} className="text-red-600" /> High-risk exposure flagged for review.
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-emerald-700" />
              <h3 className="text-sm font-bold text-gray-800">Geo risk clusters</h3>
            </div>
            <div className="mt-4 space-y-3">
              {Array.isArray(r.geo_risk_clusters) && r.geo_risk_clusters.length ? (
                r.geo_risk_clusters.map((c, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-gray-700">{c.region || `Cluster ${i + 1}`}</span>
                    <span className="text-gray-500">{c.count != null ? `${c.count} farmers` : ''}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400">No cluster data available.</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Stat({ label, value, tone = 'text-gray-900' }) {
  return (
    <div className="bg-[#FAFBF5] border border-gray-200 rounded-lg p-3">
      <p className="text-gray-500">{label}</p>
      <p className={`font-bold mt-1 ${tone}`}>{value}</p>
    </div>
  );
}
