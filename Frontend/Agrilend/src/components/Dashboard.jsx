import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Filter, BarChart3 } from 'lucide-react';
import { dashboardReport } from '../api/loans';
import { listLoans } from '../api/loans';
import useAsync from '../hooks/useAsync';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);

  const report = useAsync(dashboardReport, [refreshKey]);
  const loans = useAsync(() => listLoans({ page: 1, page_size: 5 }), [refreshKey]);

  const dash = report.data || { total: 0, approved: 0, rejected: 0, pending: 0, disbursed: 0 };
  const recent = loans.data?.items || [];

  const metrics = [
    { title: 'TOTAL APPLICATIONS', value: String(dash.total || 0), iconBg: 'bg-emerald-50 text-emerald-600' },
    { title: 'PENDING', value: String(dash.pending || 0), iconBg: 'bg-amber-50 text-amber-600' },
    { title: 'APPROVED', value: String(dash.approved || 0), iconBg: 'bg-blue-50 text-blue-600' },
    { title: 'DISBURSED', value: String(dash.disbursed || 0), iconBg: 'bg-red-50 text-red-600' },
  ];

  const tierClass = (score) =>
    score >= 700 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200';

  return (
    <div className="p-6 space-y-6 max-w-[1600px] w-full mx-auto">
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-emerald-700">Portfolio Overview</p>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight mt-1">Dashboard</h1>
          <p className="text-xs text-gray-500 mt-1">Real-time credit analysis and application monitoring.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-600 hover:bg-gray-50"
          >
            <Filter size={14} /> Filters
          </button>
          <button
            type="button"
            onClick={() => {
              if (!recent.length) return alert('No records to export');
              const headers = ['ID', 'Purpose', 'Amount', 'Score', 'Status'];
              const rows = recent.map(r => [r.id, `"${r.loan_purpose}"`, r.requested_amount, r.credit_score_at_application, r.status]);
              const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `loans_export_${new Date().toISOString().slice(0, 10)}.csv`;
              a.click();
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-600 hover:bg-gray-50 active:bg-gray-100"
          >
            <Download size={14} /> Export CSV
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

      {/* Top Row Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((card, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 flex justify-between items-start shadow-sm">
            <div>
              <p className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">{card.title}</p>
              <h3 className="text-2xl font-bold text-gray-900 tracking-tight mt-1">
                {loans.loading ? '—' : card.value}
              </h3>
            </div>
            <div className={`p-2 rounded-lg ${card.iconBg}`}>
              <BarChart3 size={18} />
            </div>
          </div>
        ))}
      </div>

      {/* Main Row: Recent Applications */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-3 bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-gray-800">Recent Loan Applications</h3>
            <button onClick={() => navigate('/applications')} className="text-xs font-semibold text-[#1A532E] hover:underline">
              View All Records
            </button>
          </div>

          {loans.loading ? (
            <p className="text-xs text-gray-400 py-6 text-center">Loading applications...</p>
          ) : loans.error ? (
            <p className="text-xs text-red-500 py-6 text-center">Could not load applications: {loans.error.message}</p>
          ) : recent.length === 0 ? (
            <p className="text-xs text-gray-400 py-6 text-center">No loan applications found.</p>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-[10px] font-bold text-gray-400 tracking-wider uppercase">
                  <th className="pb-3 font-semibold">ID</th>
                  <th className="pb-3 font-semibold">Loan Purpose</th>
                  <th className="pb-3 font-semibold">Amount</th>
                  <th className="pb-3 font-semibold">Score</th>
                  <th className="pb-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-gray-50">
                {recent.map((loan) => (
                  <tr key={loan.id} className="cursor-pointer hover:bg-gray-50/50" onClick={() => navigate(`/applications/${loan.id}`)}>
                    <td className="py-3.5 font-medium text-gray-900">{loan.id.slice(0, 8)}</td>
                    <td className="py-3.5 text-gray-700">{loan.loan_purpose}</td>
                    <td className="py-3.5 text-gray-700 font-medium">
                      {Number(loan.requested_amount).toLocaleString()}
                    </td>
                    <td className="py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${tierClass(loan.credit_score_at_application)}`}>
                        {loan.credit_score_at_application}
                      </span>
                    </td>
                    <td className="py-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold border bg-gray-100 text-gray-600 border-gray-200">
                        {loan.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
