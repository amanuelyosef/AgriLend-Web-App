import React from 'react';
import { Info, Play } from 'lucide-react';

export default function RiskHeatmap() {
  const blocks = [
    'bg-red-700', 'bg-red-400', 'bg-red-200', 'bg-gray-100', 'bg-green-300',
    'bg-red-700', 'bg-purple-700', 'bg-gray-200', 'bg-green-200', 'bg-green-800',
    'bg-red-100', 'bg-gray-100', 'bg-green-100', 'bg-emerald-600', 'bg-green-800',
    'bg-white border', 'bg-white border', 'bg-green-100', 'bg-emerald-500', 'bg-emerald-700',
    'bg-white border', 'bg-white border', 'bg-white border', 'bg-gray-200', 'bg-green-800'
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-gray-800">Risk Heatmap</h3>
        <Info size={14} className="text-gray-400 cursor-pointer" />
      </div>

      <div className="grid grid-cols-5 gap-1.5 aspect-square w-full">
        {blocks.map((color, i) => (
          <div key={i} className={`rounded-sm ${color}`}></div>
        ))}
      </div>

      <div className="text-xs">
        <div className="flex justify-between font-bold text-[11px] mb-1">
          <span className="text-gray-500">Critical Exposure</span>
          <span className="text-red-600">12.5%</span>
        </div>
        <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
          <div className="bg-red-600 h-full w-[12.5%]"></div>
        </div>
      </div>

      <div className="bg-[#FAFBF5] border border-emerald-100 p-3 rounded-lg text-[11px] text-gray-600 flex gap-2">
        <span>💡</span>
        <p>High concentration detected in the Western Kansas irrigation cluster.</p>
      </div>

      <button className="w-full bg-[#1A532E] text-white py-2 rounded-lg text-xs font-semibold hover:bg-[#144023] flex items-center justify-center gap-1.5">
        Run Risk Simulation <Play size={12} fill="currentColor" />
      </button>
    </div>
  );
}