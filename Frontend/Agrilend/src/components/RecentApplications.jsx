import React from 'react';
import { MoreVertical } from 'lucide-react';

export default function RecentApplications() {
  const rows = [
    { name: 'Samuel Thompson', id: 'APP-4921-X', amount: '$142,000.00', region: 'Nebraska (Central)', score: 745, status: 'APPROVED', statusClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { name: 'Elena Rodriguez', id: 'APP-8820-K', amount: '$85,500.00', region: 'Iowa (South)', score: 512, status: 'REVIEWING', statusClass: 'bg-red-50 text-red-600 border-red-200' },
    { name: 'Miller Farms Inc.', id: 'APP-1193-M', amount: '$2,400,000.00', region: 'Kansas (West)', score: 810, status: 'PENDING', statusClass: 'bg-gray-100 text-gray-600 border-gray-300' },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm h-full flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-gray-800">Recent Loan Applications</h3>
          <button className="text-xs font-semibold text-[#1A532E] hover:underline">View All Records</button>
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
            {rows.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50/50">
                <td className="py-3.5 font-medium text-gray-900">
                  <div>{row.name}</div>
                  <div className="text-[10px] text-gray-400">ID: {row.id}</div>
                </td>
                <td className="py-3.5 text-gray-700 font-medium">{row.amount}</td>
                <td className="py-3.5 text-gray-500">{row.region}</td>
                <td className="py-3.5">
                  <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${row.score > 600 ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                  {row.score}
                </td>
                <td className="py-3.5">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${row.statusClass}`}>{row.status}</span>
                </td>
                <td className="py-3.5 text-right text-gray-400">
                  <button className="hover:text-gray-600"><MoreVertical size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}