import React, { useState } from 'react';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../auth/useAuth';

export default function LoginForm({ onLoginSuccess }) {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const isEmail = identifier.includes('@');
      const credentials = {
        password,
        ...(isEmail ? { email: identifier } : { phone_number: identifier }),
      };
      await login(credentials);
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-[10px] font-bold text-gray-500 tracking-wider mb-1.5">
          OFFICER EMAIL OR PHONE
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-2.5 text-gray-400" size={15} />
          <input
            id="email"
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="name@agrilend.com or +251 ..."
            className="w-full pl-9 pr-4 py-2 bg-[#F9FAF5]/40 border border-gray-200 rounded-md focus:ring-1 focus:ring-[#1A532E] focus:border-[#1A532E] outline-none text-xs text-gray-800 placeholder-gray-400/70 transition-all"
            required
          />
        </div>
      </div>

      <div>
        <div className="flex justify-between mb-1.5">
          <label htmlFor="password" className="block text-[10px] font-bold text-gray-500 tracking-wider">
            PASSWORD
          </label>
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-2.5 text-gray-400" size={15} />
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full pl-9 pr-4 py-2 bg-[#F9FAF5]/40 border border-gray-200 rounded-md focus:ring-1 focus:ring-[#1A532E] focus:border-[#1A532E] outline-none text-xs text-gray-800 placeholder-gray-400/70 transition-all"
            required
          />
        </div>
      </div>



      {error && (
        <p className="text-[11px] font-medium text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#1A532E] text-white py-2.5 rounded-md font-medium hover:bg-[#144224] active:scale-[0.99] transition-all flex items-center justify-center gap-1.5 text-xs shadow-sm mt-5 disabled:opacity-60"
      >
        {loading ? 'Signing in...' : 'Secure Sign In'} <ArrowRight size={14} />
      </button>
    </form>
  );
}
