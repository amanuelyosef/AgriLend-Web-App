import React from 'react';
import { RefreshCw } from 'lucide-react';

export default function BottomMetrics() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
      {/* Left Circle Performance Section */}
      <div className="md:col-span-3 bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-center gap-6">
        <div className="relative w-16 h-16 shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path className="text-gray-100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            <path className="text-emerald-500" strokeDasharray="82, 100" strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center font-bold text-gray-800 text-xs">82%</div>
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-gray-800">System Performance</h4>
          <p className="text-xs text-gray-500">Automated credit scoring is running at peak efficiency for Tier 2 loans.</p>
          <div className="flex gap-2 pt-1 text-[10px] font-bold">
            <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">LATENCY: 42ms</span>
            <span className="bg-emerald-50 px-1.5 py-0.5 rounded text-emerald-700">UPTIME: 99.9%</span>
          </div>
        </div>
      </div>

      {/* Right Sync Area Section */}
      <div className="md:col-span-2 bg-[#232724] text-white border border-gray-800 rounded-xl p-5 shadow-sm flex items-center gap-4">
        <div className="p-3 bg-gray-800 rounded-xl text-emerald-400">
          <RefreshCw size={16} />
        </div>
        <div>
          <h4 className="text-sm font-bold">External Data Feeds</h4>
          <p className="text-xs text-gray-400">NOAA Weather & USDA Price Index updated 14 minutes ago.</p>
          <p className="text-[10px] font-bold text-emerald-400 tracking-wide mt-1">LAST SYNC: 14:02 UTC</p>
        </div>
      </div>
    </div>
  );
}