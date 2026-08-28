import React, { useState } from 'react';
import {
  Search, MapPin, User, Filter, ChevronDown, UserPlus2,
} from 'lucide-react';
import { searchFarmers } from '../api/farmers';
import { getCreditScore } from '../api/farmers';
import useAsync from '../hooks/useAsync';

export default function SearchFarmers() {
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState('');

  const farmers = useAsync(() => searchFarmers(submitted) || [], [submitted]);

  const items = farmers.data || [];

  const runSearch = (e) => {
    e?.preventDefault();
    setSubmitted(query.trim());
  };

  return (
    <div className="p-5 space-y-4 max-w-[1600px] w-full mx-auto">
      <div className="bg-[#F4F6EF] border border-[#DADFD2] rounded-md p-3">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Search Farmer Registry</h2>

        <form onSubmit={runSearch} className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-3">
          <div>
            <p className="text-[9px] font-bold tracking-wide text-gray-500 uppercase mb-1">Farmer Name / ID / Phone</p>
            <div className="relative">
              <Search size={12} className="absolute left-3 top-2.5 text-gray-400" />
              <input
                className="w-full bg-[#EEF1E7] border border-[#D5DACB] rounded-md pl-8 pr-3 py-2 text-xs text-gray-600 outline-none focus:ring-1 focus:ring-[#0B5A22]"
                placeholder="Search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-end gap-2">
            <button type="button" className="h-8 px-3 rounded-full border border-[#D5DACB] bg-white text-[11px] text-gray-600 font-medium flex items-center gap-1.5">
              <Filter size={12} /> Advanced Filters
            </button>
            <button type="button" className="h-8 px-3 rounded-full border border-[#D5DACB] bg-white text-[11px] text-gray-600 font-medium flex items-center gap-1.5">
              Region: All <ChevronDown size={12} />
            </button>
          </div>

          <div className="flex items-end justify-end">
            <button type="submit" className="h-8 px-6 rounded-md bg-[#0B5A22] text-white text-xs font-semibold">
              Run Search
            </button>
          </div>
        </form>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 px-1">
        <p>Showing {items.length} farmers</p>
        <p>Sort by: <span className="font-semibold text-gray-700">Relevance</span></p>
      </div>

      {farmers.loading ? (
        <p className="text-xs text-gray-400 py-10 text-center">Loading farmers...</p>
      ) : farmers.error ? (
        <p className="text-xs text-red-500 py-10 text-center">Search failed: {farmers.error.message}</p>
      ) : items.length === 0 ? (
        <div className="bg-[#F4F6EF] border border-dashed border-[#CDD4C2] rounded-md p-8 text-center">
          <div className="mx-auto w-44 h-36 rounded-md bg-gradient-to-b from-[#E8EFE3] to-[#D5E1D2] border border-[#D1D9C9]"></div>
          <h3 className="text-3xl font-bold text-gray-700 mt-3">No Farmers Found</h3>
          <p className="text-xs text-gray-500 mt-2 max-w-xl mx-auto">
            {submitted
              ? `No profiles matched "${submitted}". Try a different name, ID, or phone number.`
              : 'The registry is empty. Register a new farmer to get started.'}
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <button type="button" className="h-9 px-4 rounded-md bg-[#0B5A22] text-white text-xs font-semibold flex items-center gap-1.5">
              <UserPlus2 size={13} /> Register New Farmer
            </button>
            <button type="button" className="h-9 px-4 rounded-md bg-white border border-[#D0D7C6] text-xs font-semibold text-gray-600">
              Request Verification
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          {items.map((farmer) => (
            <FarmerCard key={farmer.id} farmer={farmer} />
          ))}
        </div>
      )}
    </div>
  );
}

function FarmerCard({ farmer }) {
  const score = useAsync(() => getCreditScore(farmer.id), [farmer.id]);
  const tier = score.data && (score.data.risk_tier || score.data.tier) ? (score.data.risk_tier || score.data.tier) : null;
  const creditScore = score.data
    ? (score.data.score_value ?? score.data.score ?? farmer.credit_score)
    : farmer.credit_score;

  const tone =
    tier === 'HIGH'
      ? 'text-red-700 bg-red-50 border-red-100'
      : tier === 'MEDIUM' || tier === 'MODERATE'
        ? 'text-amber-700 bg-amber-50 border-amber-100'
        : 'text-emerald-700 bg-emerald-50 border-emerald-100';

  return (
    <div className="bg-[#F7F9F4] border border-[#DADFD2] rounded-md p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="w-7 h-7 rounded bg-[#EEF2E7] border border-[#D7DDCC] flex items-center justify-center">
          <User size={13} className="text-[#1E6A3D]" />
        </span>
        <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${tone}`}>
          {farmer.consent_status ? 'Consented' : 'No consent'}
        </span>
      </div>

      <p className="text-sm font-bold text-gray-800">{farmer.full_name}</p>
      <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
        <MapPin size={11} /> {farmer.region || 'Unknown region'}
      </p>

      <div className="mt-3 space-y-1.5 text-[11px]">
        <div className="flex justify-between">
          <span className="text-gray-500">Primary Crop</span>
          <span className="font-semibold text-gray-700">{farmer.primary_crop || '—'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Phone</span>
          <span className="font-semibold text-gray-700">{farmer.phone_number}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Credit Score</span>
          <span className="font-bold text-[#1E6A3D]">{creditScore ?? '—'}</span>
        </div>
        {tier && (
          <div className="flex justify-between">
            <span className="text-gray-500">Risk Tier</span>
            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${tone}`}>{tier}</span>
          </div>
        )}
      </div>
    </div>
  );
}
