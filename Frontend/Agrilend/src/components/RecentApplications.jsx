import React, { useState, useEffect } from 'react';
import { MoreVertical, ExternalLink } from 'lucide-react';
import api from '../services/api';

export default function RecentApplications({ onViewDetail }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecent() {
      try {
        const res = await api.get('/loans/?page=1&page_size=5');
        if (res && (res.items || Array.isArray(res))) {
          const itemsList = Array.isArray(res) ? res : (res.items || []);
          setApplications(itemsList);
        }
      } catch (err) {
        console.error('Failed to fetch recent loans:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchRecent();
  }, []);

  const displayList = applications;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'REJECTED':
        return 'bg-red-50 text-red-600 border-red-200';
      case 'DISBURSED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm h-full flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-gray-800">Recent Loan Applications</h3>
          <span className="text-xs font-semibold text-gray-400">Live Backend Queue</span>
        </div>
        
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 text-[10px] font-bold text-gray-400 tracking-wider uppercase">
              <th className="pb-3 font-semibold">Applicant Name</th>
              <th className="pb-3 font-semibold">Loan Amount</th>
              <th className="pb-3 font-semibold">Region</th>
              <th className="pb-3 font-semibold">Score</th>
              <th className="pb-3 font-semibold">Status</th>
              <th className="pb-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="text-xs divide-y divide-gray-50">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-6 text-center text-gray-400 font-medium">
                  Loading applications...
                </td>
              </tr>
            ) : displayList.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-6 text-center text-gray-400 font-medium">
                  No recent applications found.
                </td>
              </tr>
            ) : (
              displayList.map((row, index) => {
                const score = row.credit_score_snapshot ?? row.credit_score_at_application;
                const status = (row.status || "").toUpperCase();
                const name = row.farmer_name || row.farmer?.full_name || row.name || "—";
                const id = row.id || "—";
                const amount = row.amount_requested != null
                  ? `$${Number(row.amount_requested).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                  : row.requested_amount != null
                    ? `$${Number(row.requested_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                    : "—";
                const region = row.region || row.farmer?.region || "—";

                return (
                  <tr key={row.id || index} className="hover:bg-gray-50/50">
                    <td className="py-3.5 font-medium text-gray-900">
                      <div>{name}</div>
                      <div className="text-[10px] text-gray-400 font-mono">ID: {id.substring(0, 12)}</div>
                    </td>
                    <td className="py-3.5 text-gray-700 font-medium">{amount}</td>
                    <td className="py-3.5 text-gray-500">{region}</td>
                    <td className="py-3.5">
                      {typeof score === 'number' && (
                        <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${score >= 600 ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                      )}
                      {score ?? "—"}
                    </td>
                    <td className="py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(status)}`}>{status || "—"}</span>
                    </td>
                    <td className="py-3.5 text-right text-gray-400">
                      <button className="hover:text-[#1A532E] p-1 transition-colors" title="View details">
                        <MoreVertical size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}