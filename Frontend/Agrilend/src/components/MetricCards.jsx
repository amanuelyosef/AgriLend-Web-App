import React from 'react';
import { ShieldCheck, FileClock, Percent, AlertCircle } from 'lucide-react';

export default function MetricCards() {
  const metrics = [
    { title: 'TOTAL ACTIVE LOANS', value: '1,284', change: '+4.2%', sub: 'vs. previous quarter', icon: ShieldCheck, iconBg: 'bg-emerald-50 text-emerald-600' },
    { title: 'PENDING APPLICATIONS', value: '42', change: 'High Urgency', sub: 'Action required', icon: FileClock, iconBg: 'bg-amber-50 text-amber-600' },
    { title: 'AVG. CREDIT SCORE', value: '712', change: 'Tier 1 A+', sub: 'System-wide weighted average', icon: Percent, iconBg: 'bg-blue-50 text-blue-600' },
    { title: 'HIGH RISK LOANS', value: '18', change: '-2.1%', sub: 'Requiring immediate audit', icon: AlertCircle, iconBg: 'bg-red-50 text-red-600' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((card, i) => {
        const Icon = card.icon;
        return (
          <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 flex justify-between items-start shadow-sm">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">{card.title}</p>
              <h3 className="text-2xl font-bold text-gray-900 tracking-tight">{card.value}</h3>
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