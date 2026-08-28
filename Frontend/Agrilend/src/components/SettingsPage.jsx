import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, Building2, Plus, ShieldCheck } from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { updateMe } from '../api/auth';
import { createBank, listBanks } from '../api/banks';
import useAsync from '../hooks/useAsync';

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState(() => ({
    full_name: user?.full_name || '',
    phone_number: user?.phone_number || '',
    locale: user?.locale || 'en',
  }));
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  // Bank Onboarding State (For Admin)
  const [bankRefresh, setBankRefresh] = useState(0);
  const banks = useAsync(() => listBanks(), [bankRefresh]);
  const [bankForm, setBankForm] = useState({
    bank_name: '',
    interest_rate: '9.50',
    subscription_tier: 'enterprise',
    analyst_full_name: '',
    analyst_email: '',
    analyst_password: '',
  });
  const [bankSaving, setBankSaving] = useState(false);
  const [bankMsg, setBankMsg] = useState('');

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const handleBankChange = (e) => setBankForm((b) => ({ ...b, [e.target.name]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      await updateMe({ full_name: form.full_name, phone_number: form.phone_number || undefined, locale: form.locale });
      await refreshUser();
      setMsg('Profile updated successfully.');
    } catch (err) {
      setMsg(`Update failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateBank = async (e) => {
    e.preventDefault();
    setBankSaving(true);
    setBankMsg('');
    try {
      await createBank({
        bank_name: bankForm.bank_name,
        interest_rate: Number(bankForm.interest_rate),
        subscription_tier: bankForm.subscription_tier,
        analyst_full_name: bankForm.analyst_full_name,
        analyst_email: bankForm.analyst_email,
        analyst_password: bankForm.analyst_password,
      });
      setBankMsg('New bank & analyst account created successfully!');
      setBankForm({
        bank_name: '',
        interest_rate: '9.50',
        subscription_tier: 'enterprise',
        analyst_full_name: '',
        analyst_email: '',
        analyst_password: '',
      });
      setBankRefresh((k) => k + 1);
    } catch (err) {
      setBankMsg(`Failed to create bank: ${err.message}`);
    } finally {
      setBankSaving(false);
    }
  };

  const isAdmin = user?.role_name === 'Platform Admin';

  return (
    <div className="p-6 space-y-6 max-w-[1200px] w-full mx-auto">
      <div>
        <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-emerald-700">Settings & Administration</p>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight mt-1">Platform Management</h1>
        <p className="text-xs text-gray-500 mt-1">User profile configuration and institutional partner onboarding.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-xl bg-[#1A532E] flex items-center justify-center text-white">
            <SettingsIcon size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-800">Account Profile</h3>
            <p className="text-[11px] text-gray-500">Connected as {user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 tracking-wider mb-1.5">FULL NAME</label>
            <input
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              className="w-full bg-[#FAFBF7] border border-gray-200 rounded-lg p-2.5 text-xs outline-none focus:ring-1 focus:ring-[#1A532E] font-medium text-gray-700"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 tracking-wider mb-1.5">PHONE NUMBER</label>
            <input
              name="phone_number"
              value={form.phone_number}
              onChange={handleChange}
              className="w-full bg-[#FAFBF7] border border-gray-200 rounded-lg p-2.5 text-xs outline-none focus:ring-1 focus:ring-[#1A532E] font-medium text-gray-700"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 tracking-wider mb-1.5">LOCALE</label>
            <input
              name="locale"
              value={form.locale}
              onChange={handleChange}
              className="w-full bg-[#FAFBF7] border border-gray-200 rounded-lg p-2.5 text-xs outline-none focus:ring-1 focus:ring-[#1A532E] font-medium text-gray-700"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 tracking-wider mb-1.5">ROLE</label>
            <input
              value={user?.role_name || '—'}
              readOnly
              className="w-full bg-[#F4F6F0] border border-gray-200 rounded-lg p-2.5 text-xs font-medium text-gray-500"
            />
          </div>

          <div className="sm:col-span-2 flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1A532E] text-white text-xs font-semibold hover:bg-[#144023] disabled:opacity-60"
            >
              <Save size={14} /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
            {msg && <span className="text-[11px] font-medium text-[#1A532E]">{msg}</span>}
          </div>
        </form>
      </div>

      {/* Admin Panel: Bank Onboarding */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-xl bg-blue-700 flex items-center justify-center text-white">
            <Building2 size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-800">Partner Bank Institutions & Officers</h3>
            <p className="text-[11px] text-gray-500">
              {isAdmin ? 'Onboard new banks and create analyst login accounts.' : 'Registered partner institutions.'}
            </p>
          </div>
        </div>

        {isAdmin && (
          <form onSubmit={handleCreateBank} className="mb-6 p-4 bg-[#F9FAF5] border border-gray-200 rounded-lg space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-[#1A532E]">
              <Plus size={14} /> Register New Bank Partner & Provision Analyst Login
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 tracking-wider mb-1">BANK NAME</label>
                <input
                  name="bank_name"
                  required
                  placeholder="e.g. Commercial Bank of Ethiopia"
                  value={bankForm.bank_name}
                  onChange={handleBankChange}
                  className="w-full bg-white border border-gray-200 rounded-md p-2 text-xs outline-none focus:ring-1 focus:ring-[#1A532E]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 tracking-wider mb-1">INTEREST RATE (%)</label>
                <input
                  name="interest_rate"
                  type="number"
                  step="0.01"
                  required
                  value={bankForm.interest_rate}
                  onChange={handleBankChange}
                  className="w-full bg-white border border-gray-200 rounded-md p-2 text-xs outline-none focus:ring-1 focus:ring-[#1A532E]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 tracking-wider mb-1">TIER</label>
                <select
                  name="subscription_tier"
                  value={bankForm.subscription_tier}
                  onChange={handleBankChange}
                  className="w-full bg-white border border-gray-200 rounded-md p-2 text-xs outline-none focus:ring-1 focus:ring-[#1A532E]"
                >
                  <option value="enterprise">Enterprise</option>
                  <option value="standard">Standard</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 tracking-wider mb-1">OFFICER FULL NAME</label>
                <input
                  name="analyst_full_name"
                  required
                  placeholder="e.g. Abebe Kebede"
                  value={bankForm.analyst_full_name}
                  onChange={handleBankChange}
                  className="w-full bg-white border border-gray-200 rounded-md p-2 text-xs outline-none focus:ring-1 focus:ring-[#1A532E]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 tracking-wider mb-1">OFFICER EMAIL (LOGIN)</label>
                <input
                  name="analyst_email"
                  type="email"
                  required
                  placeholder="abebe@cbe.com"
                  value={bankForm.analyst_email}
                  onChange={handleBankChange}
                  className="w-full bg-white border border-gray-200 rounded-md p-2 text-xs outline-none focus:ring-1 focus:ring-[#1A532E]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 tracking-wider mb-1">OFFICER PASSWORD</label>
                <input
                  name="analyst_password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={bankForm.analyst_password}
                  onChange={handleBankChange}
                  className="w-full bg-white border border-gray-200 rounded-md p-2 text-xs outline-none focus:ring-1 focus:ring-[#1A532E]"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={bankSaving}
                className="px-4 py-2 rounded-lg bg-[#1A532E] text-white text-xs font-semibold hover:bg-[#144023] disabled:opacity-60 flex items-center gap-1.5"
              >
                <ShieldCheck size={14} /> {bankSaving ? 'Creating...' : 'Register Bank & Provision Officer'}
              </button>
              {bankMsg && <span className={`text-[11px] font-medium ${bankMsg.includes('Failed') ? 'text-red-600' : 'text-emerald-700'}`}>{bankMsg}</span>}
            </div>
          </form>
        )}

        {/* Existing Banks List */}
        <div>
          <h4 className="text-xs font-bold text-gray-700 mb-3">Onboarded Partner Institutions</h4>
          {banks.loading ? (
            <p className="text-xs text-gray-400 py-3">Loading registered banks...</p>
          ) : banks.error ? (
            <p className="text-xs text-red-500 py-3">Could not load banks: {banks.error.message}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {(banks.data?.items || []).map((b) => (
                <div key={b.id} className="p-3.5 border border-gray-200 rounded-lg bg-[#FAFBF7] flex justify-between items-center">
                  <div>
                    <h5 className="text-xs font-bold text-gray-900">{b.bank_name}</h5>
                    <p className="text-[10px] text-gray-500 mt-0.5">Rate: {b.interest_rate}% | Tier: {b.subscription_tier}</p>
                  </div>
                  <span className="px-2 py-0.5 text-[9px] font-bold rounded bg-emerald-100 text-emerald-800">Active</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
