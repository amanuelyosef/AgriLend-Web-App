import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import { searchFarmers } from '../api/farmers';
import { listBanks } from '../api/banks';
import { createLoan } from '../api/loans';
import { useAuth } from '../auth/useAuth';
import useAsync from '../hooks/useAsync';

export default function NewLoanApplication() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const farmers = useAsync(() => searchFarmers('') || [], []);
  const bankList = useAsync(listBanks, []);

  const [farmerId, setFarmerId] = useState('');
  const [bankId, setBankId] = useState(user?.bank_id || '');
  const [requestedAmount, setRequestedAmount] = useState('');
  const [loanPurpose, setLoanPurpose] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);

  const farmerOptions = farmers.data || [];
  const bankOptions = bankList.data?.items || [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setBusy(true);
    try {
      const payload = {
        farmer_id: farmerId,
        bank_id: bankId || undefined,
        requested_amount: Number(requestedAmount),
        loan_purpose: loanPurpose,
      };
      const created = await createLoan(payload);
      setSuccess(`Application created (${created.id.slice(0, 8)}). Redirecting...`);
      setTimeout(() => navigate(`/applications/${created.id}`), 1200);
    } catch (err) {
      setError(err.message || 'Could not create application.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[900px] w-full mx-auto">
      <button
        type="button"
        onClick={() => navigate('/applications')}
        className="flex items-center gap-2 text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft size={14} /> Back to Applications
      </button>

      <div>
        <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-emerald-700">Credit Workflow</p>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight mt-1">New Loan Application</h2>
        <p className="text-xs text-gray-500 mt-1">Submit a manual loan request for an existing farmer.</p>
      </div>

      {success && (
        <p className="text-xs font-medium text-[#1A532E] bg-emerald-50 border border-emerald-100 rounded-md px-3 py-2">{success}</p>
      )}
      {error && (
        <p className="text-xs font-medium text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">{error}</p>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
        <div>
          <label className="block text-[10px] font-bold text-gray-400 tracking-wider mb-1.5">FARMER</label>
          <select
            value={farmerId}
            onChange={(e) => setFarmerId(e.target.value)}
            required
            className="w-full bg-[#FAFBF7] border border-gray-200 rounded-lg p-2.5 text-xs outline-none focus:ring-1 focus:ring-[#1A532E] font-medium text-gray-700"
          >
            <option value="">Select a farmer...</option>
            {farmerOptions.map((f) => (
              <option key={f.id} value={f.id}>
                {f.full_name} — {f.region || 'Unknown region'} ({f.primary_crop || 'no crop'})
              </option>
            ))}
          </select>
          {farmers.loading && <p className="text-[10px] text-gray-400 mt-1">Loading farmers...</p>}
        </div>

        <div>
          <label className="block text-[10px] font-bold text-gray-400 tracking-wider mb-1.5">BANK</label>
          <select
            value={bankId}
            onChange={(e) => setBankId(e.target.value)}
            className="w-full bg-[#FAFBF7] border border-gray-200 rounded-lg p-2.5 text-xs outline-none focus:ring-1 focus:ring-[#1A532E] font-medium text-gray-700"
          >
            <option value="">Select a bank...</option>
            {bankOptions.map((b) => (
              <option key={b.id} value={b.id}>{b.bank_name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-gray-400 tracking-wider mb-1.5">REQUESTED AMOUNT</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={requestedAmount}
            onChange={(e) => setRequestedAmount(e.target.value)}
            required
            placeholder="e.g. 100000"
            className="w-full bg-[#FAFBF7] border border-gray-200 rounded-lg p-2.5 text-xs outline-none focus:ring-1 focus:ring-[#1A532E] font-medium text-gray-700"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-gray-400 tracking-wider mb-1.5">LOAN PURPOSE</label>
          <input
            type="text"
            value={loanPurpose}
            onChange={(e) => setLoanPurpose(e.target.value)}
            required
            placeholder="e.g. Input financing for the planting season"
            className="w-full bg-[#FAFBF7] border border-gray-200 rounded-lg p-2.5 text-xs outline-none focus:ring-1 focus:ring-[#1A532E] font-medium text-gray-700"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={busy}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#1A532E] text-white text-xs font-semibold hover:bg-[#144023] disabled:opacity-60"
          >
            <Send size={14} /> {busy ? 'Submitting...' : 'Submit Application'}
          </button>
        </div>
      </form>
    </div>
  );
}
