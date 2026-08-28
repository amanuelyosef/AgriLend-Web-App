import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <div className="mt-8 pt-4 flex justify-between text-[11px] font-medium text-gray-400">
      <span className="flex items-center gap-1">
        <ShieldCheck size={12} /> ISO 27001 Certified
      </span>
      <div className="flex gap-4">
        <button type="button" className="hover:text-gray-600">System Status</button>
        <button type="button" className="hover:text-gray-600">Support</button>
      </div>
    </div>
  );
}