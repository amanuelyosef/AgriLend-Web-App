import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Phone, MapPin, Sprout, Layers,
  CheckCircle2, AlertTriangle, XCircle, ThumbsUp, RefreshCw,
} from 'lucide-react';
import { getLoanDetail, reviewLoan } from '../api/loans';
import useAsync from '../hooks/useAsync';
import { useAuth } from '../auth/useAuth';

export default function ApplicationDetail() {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [actionMsg, setActionMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const detail = useAsync(() => getLoanDetail(applicationId), [applicationId]);

  if (detail.loading) {
    return <div className="p-10 text-xs text-gray-400 text-center">Loading application detail...</div>;
  }

  if (detail.error || !detail.data) {
    return (
      <div className="p-10 text-xs text-red-500 text-center">
        Could not load application: {detail.error?.message}
      </div>
    );
  }

  const d = detail.data;
  const app = {
    id: d.application_id,
    status: d.status,
    requested_amount: d.requested_amount,
    loan_purpose: d.loan_purpose,
    bank_id: d.bank_id,
    submitted_at: d.submitted_at,
    credit_score_at_application: d.credit_score_at_application,
  };

  const handleReview = async (newStatus) => {
    setBusy(true);
    setActionMsg('');
    try {
      await reviewLoan(applicationId, newStatus);
      setActionMsg(`Application ${newStatus.toLowerCase()} successfully.`);
      await refreshUser();
    } catch (e) {
      setActionMsg(`Failed: ${e.message}`);
    } finally {
      setBusy(false);
    }
  };

  const tierText = (t) => t || 'UNKNOWN';

  return (
    <div className="p-6 space-y-5 max-w-[1400px] w-full mx-auto">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/applications')}
          className="flex items-center gap-2 text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Applications
        </button>
        {actionMsg && (
          <span className="text-[11px] font-medium text-[#1A532E] bg-emerald-50 border border-emerald-100 rounded-md px-3 py-1.5">
            {actionMsg}
          </span>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center shadow-sm gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#1A532E] text-white rounded-xl flex items-center justify-center text-xl shadow-inner">🚜</div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">{d.farmer_name}</h2>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 mt-1">
              <span className="flex items-center gap-1"><Phone size={12} /> {d.farmer_phone}</span>
              <span className="flex items-center gap-1"><MapPin size={12} /> {d.farmer_region}</span>
              <span className="flex items-center gap-1"><Sprout size={12} /> {d.farmer_crop}</span>
              {d.farm_size_hectares != null && (
                <span className="flex items-center gap-1"><Layers size={12} /> {d.farm_size_hectares} Ha</span>
              )}
            </div>
          </div>
        </div>
        <div className="text-right shrink-0">
          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2.5 py-1 rounded-md tracking-wider">
            LOAN: {app.id.slice(0, 8)}
          </span>
          <p className="text-[10px] text-gray-400 mt-1.5 font-medium">{app.status}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="text-xs font-bold text-gray-400 tracking-wider uppercase mb-4">Credit Profile</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-[#F9FAF5] p-4 rounded-lg text-center">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Current Score</p>
              <p className="text-3xl font-extrabold text-gray-900 mt-1">
                {d.credit_score_current ?? '—'}
              </p>
            </div>
            <div className="bg-[#F9FAF5] p-4 rounded-lg text-center">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Risk Tier</p>
              <p className={`text-lg font-extrabold mt-1 ${tierText(d.risk_tier) === 'HIGH' ? 'text-red-600' : tierText(d.risk_tier) === 'MEDIUM' ? 'text-amber-600' : 'text-emerald-600'}`}>
                {tierText(d.risk_tier)}
              </p>
            </div>
            <div className="bg-[#F9FAF5] p-4 rounded-lg text-center">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Score at App</p>
              <p className="text-2xl font-extrabold text-gray-900 mt-1">{app.credit_score_at_application}</p>
            </div>
            <div className="bg-[#F9FAF5] p-4 rounded-lg text-center">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Trend</p>
              <p className="text-lg font-extrabold text-emerald-700 mt-1">{d.score_trend || '—'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3">
          <h3 className="text-xs font-bold text-gray-800">Application Details</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Requested Amount</span>
              <span className="font-bold text-gray-900">{Number(app.requested_amount).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Purpose</span>
              <span className="font-semibold text-gray-800">{app.loan_purpose}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Bank ID</span>
              <span className="font-semibold text-gray-800">{app.bank_id.slice(0, 8)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Submitted</span>
              <span className="font-semibold text-gray-800">{new Date(app.submitted_at).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Consent</span>
              <span className={`font-semibold ${d.consent_status ? 'text-emerald-600' : 'text-red-600'}`}>
                {d.consent_status ? 'Granted' : 'Not granted'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Land Verified</span>
              <span className={`font-semibold ${d.land_verified ? 'text-emerald-600' : 'text-gray-600'}`}>
                {d.land_verified ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Application Status</p>
          <p className="text-xs font-bold text-gray-800 mt-0.5">{app.status}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto text-xs font-semibold">
          <button
            type="button"
            disabled={busy}
            onClick={() => handleReview('APPROVED')}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#1A532E] text-white rounded-lg hover:bg-[#144023] shadow-sm disabled:opacity-60"
          >
            <ThumbsUp size={14} /> Approve Loan
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => handleReview('REJECTED')}
            className="flex items-center gap-1.5 px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 shadow-sm disabled:opacity-60"
          >
            <XCircle size={14} /> Reject Application
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => window.location.reload()}
            className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      <div className="bg-[#FAFBF5] border border-gray-100 rounded-xl p-5 text-xs text-gray-500 space-y-2">
        <p className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-600" /> Credit profile sourced from the live scoring engine.</p>
        <p className="flex items-center gap-2"><AlertTriangle size={14} className="text-amber-500" /> Approving or rejecting updates the loan pipeline immediately.</p>
      </div>
    </div>
  );
}
