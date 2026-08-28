import React, { useState, useEffect } from 'react';
import { ShieldCheck, FileClock, Percent, AlertCircle } from 'lucide-react';
import api from '../services/api';

export default function MetricCards() {
  const [data, setData] = useState({
    activeLoans: null,
    pendingApps: null,
    avgScore: null,
    highRisk: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMetrics() {
      try {
        const [dashReport, highRiskList] = await Promise.allSettled([
          api.get('/loans/reports/dashboard'),
          api.get('/loans/reports/high-risk'),
        ]);

        let total = null;
        let pending = null;
        let avgScore = null;

        if (dashReport.status === 'fulfilled' && dashReport.value) {
          const r = dashReport.value;
          total = r.total;
          pending = r.pending;
          avgScore = r.avg_score;
        }

        let highRiskCount = null;
        if (highRiskList.status === 'fulfilled' && Array.isArray(highRiskList.value)) {
          highRiskCount = highRiskList.value.length;
        }

        setData({
          activeLoans: total,
          pendingApps: pending,
          avgScore,
          highRisk: highRiskCount,
        });
      } catch (err) {
        console.error('Failed to fetch metric cards data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMetrics();
  }, []);

  const metrics = [
    { title: 'TOTAL ACTIVE LOANS', value: data.activeLoans, change: 'All statuses', sub: '', icon: ShieldCheck, iconBg: 'bg-emerald-50 text-emerald-600' },
    { title: 'PENDING APPLICATIONS', value: data.pendingApps, change: data.pendingApps ? 'High Urgency' : 'Queue clear', sub: '', icon: FileClock, iconBg: 'bg-amber-50 text-amber-600' },
    { title: 'AVG. CREDIT SCORE', value: data.avgScore, change: 'Portfolio snapshot', sub: '', icon: Percent, iconBg: 'bg-blue-50 text-blue-600' },
    { title: 'HIGH RISK LOANS', value: data.highRisk, change: data.highRisk ? 'Requiring audit' : 'None flagged', sub: '', icon: AlertCircle, iconBg: 'bg-red-50 text-red-600' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((card, i) => {
        const Icon = card.icon;
        return (
          <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 flex justify-between items-start shadow-sm">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">{card.title}</p>
              <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
                {loading ? <span className="animate-pulse opacity-50">...</span> : (card.value ?? "—")}
              </h3>
              <div className="flex items-center gap-1.5 text-[11px]">
                <span className={`font-semibold ${i === 1 || i === 3 ? 'text-red-600' : 'text-emerald-600'}`}>{card.change}</span>
                <span className="text-gray-400">{card.sub}</span>
              </div>
            </div>
            <div className={`p-2 rounded-lg ${card.iconBg}`}>
              <Icon size={18} />
            </div>
          </div>
        );
      })}
    </div>
  );
}