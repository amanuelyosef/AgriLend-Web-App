import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, ExternalLink, ChevronLeft, ChevronRight, Filter, Download } from 'lucide-react';
import { listLoans } from '../api/loans';
import useAsync from '../hooks/useAsync';

export default function LoanApplications() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const pageSize = 10;

  const loans = useAsync(
    () => listLoans({ page, page_size: pageSize, status: status || undefined }),
    [page, status]
  );

  const rows = loans.data?.items || [];
  const total = loans.data?.total || 0;
  const totalPages = loans.data?.total_pages || 1;

  const tierClass = (score) =>
    score >= 700
      ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
      : score >= 600
        ? 'text-amber-600 bg-amber-50 border-amber-200'
        : 'text-red-600 bg-red-50 border-red-200';

  const applyStatus = (value) => {
    setStatus(value);
    setPage(1);
    if (value) setSearchParams({ status: value });
    else setSearchParams({});
  };

  const initials = (name) =>
    (name || '?').split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className="flex-1 p-6 space-y-6 max-w-[1600px] w-full mx-auto">
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-emerald-700">Credit Workflow</p>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight mt-1">Loan Applications</h2>
          <p className="text-xs text-gray-500 mt-1">Manage and review incoming credit requests.</p>
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
              if (!rows.length) return alert('No applications to export');
              const headers = ['ID', 'Farmer', 'Amount', 'Score', 'Purpose', 'Status', 'Date'];
              const csvRows = rows.map(r => [r.id, `"${r.farmer?.full_name || r.farmer_name || ''}"`, r.requested_amount, r.credit_score_at_application, `"${r.loan_purpose}"`, r.status, r.submitted_at]);
              const csv = [headers.join(','), ...csvRows.map(r => r.join(','))].join('\n');
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `applications_export_${new Date().toISOString().slice(0, 10)}.csv`;
              a.click();
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-600 hover:bg-gray-50 active:bg-gray-100"
          >
            <Download size={14} /> Export CSV
          </button>
          <button
            type="button"
            onClick={() => navigate('/applications/new')}
            className="bg-[#1A532E] text-white text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center gap-1.5 hover:bg-[#144224] transition-colors"
          >
            <Plus size={14} /> Manual Entry
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 tracking-wider mb-1.5">STATUS</label>
            <select
              value={status}
              onChange={(e) => applyStatus(e.target.value)}
              className="w-full bg-[#FAFBF7] border border-gray-200 rounded-lg p-2.5 text-xs outline-none focus:ring-1 focus:ring-[#1A532E] font-medium text-gray-700"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="DISBURSED">Disbursed</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {loans.loading ? (
          <p className="text-xs text-gray-400 py-10 text-center">Loading applications...</p>
        ) : loans.error ? (
          <p className="text-xs text-red-500 py-10 text-center">Could not load applications: {loans.error.message}</p>
        ) : rows.length === 0 ? (
          <p className="text-xs text-gray-400 py-10 text-center">No applications match.</p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-xs font-bold text-gray-700 bg-white">
                <th className="py-4 px-6 font-bold text-gray-600">Application</th>
                <th className="py-4 px-4 font-bold text-gray-600">Credit Score</th>
                <th className="py-4 px-4 font-bold text-gray-600">Amount Requested</th>
                <th className="py-4 px-4 font-bold text-gray-600">Purpose</th>
                <th className="py-4 px-4 font-bold text-gray-600">Submitted</th>
                <th className="py-4 px-6 text-right font-bold text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody className="text-xs font-medium divide-y divide-gray-100 text-gray-700">
              {rows.map((loan) => (
                <tr key={loan.id} className="hover:bg-gray-50/40 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#EBF0EC] text-[#1A532E] text-[11px] font-bold flex items-center justify-center">
                        {initials(loan.farmer?.full_name)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 leading-tight">{loan.farmer_name || loan.id.slice(0, 8)}</p>
                        <p className="text-[10px] text-gray-400 font-normal mt-0.5">ID: {loan.id.slice(0, 8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-wider border ${tierClass(loan.credit_score_at_application)}`}>
                      {loan.credit_score_at_application}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-gray-900 font-bold">
                    {Number(loan.requested_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-4 px-4 text-gray-600">{loan.loan_purpose}</td>
                  <td className="py-4 px-4 text-gray-400 font-normal">
                    {new Date(loan.submitted_at).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      type="button"
                      onClick={() => navigate(`/applications/${loan.id}`)}
                      className="text-[#1A532E] hover:text-[#144224] font-semibold inline-flex items-center gap-1.5 text-[11px]"
                    >
                      View Report <ExternalLink size={14} className="text-emerald-700" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="bg-[#FAFBF8] border-t border-gray-100 px-6 py-3 flex items-center justify-between text-xs font-medium text-gray-500">
          <span>
            Showing {rows.length} of {total} applications
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-1.5 border border-gray-200 rounded bg-white hover:bg-gray-50 text-gray-400 disabled:opacity-40"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="px-2 text-xs text-gray-600">
              Page {page} of {totalPages || 1}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 border border-gray-200 rounded bg-white hover:bg-gray-50 text-gray-400 disabled:opacity-40"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
