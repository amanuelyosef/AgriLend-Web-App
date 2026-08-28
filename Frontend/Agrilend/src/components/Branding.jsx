import React from 'react';
import { Sprout, ShieldCheck, Cpu, Activity, Lock, ArrowUpRight } from 'lucide-react';
import farmImage from '../assets/crop.png'; 

export default function Branding() {
  return (
    <div className="h-full flex flex-col justify-between select-none">
      {/* Upper Segment: Brand Logo & Title */}
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 flex items-center justify-center shadow-lg backdrop-blur-md">
            <Sprout size={22} />
          </div>
          <div>
            <span className="text-2xl font-bold tracking-tight text-white block">AgriLend</span>
            <span className="text-[10px] font-mono tracking-widest text-emerald-400/90 uppercase font-semibold">Institutional Credit Platform</span>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-[11px] font-medium text-emerald-300 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            System Operational • 99.9% Uptime
          </div>
          
          <h1 className="text-3xl xl:text-4xl font-extrabold text-white leading-tight tracking-tight">
            Next-Gen Agricultural Risk Intelligence
          </h1>
          <p className="text-emerald-100/70 text-xs xl:text-sm font-light leading-relaxed max-w-md">
            AI-powered underwriting, satellite biomass analytics, and portfolio telemetry built for agricultural lenders and enterprise risk officers.
          </p>
        </div>

        {/* Feature Pills */}
        <div className="grid grid-cols-2 gap-3 pt-2 max-w-md">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="flex items-center gap-2 text-emerald-400 mb-1">
              <Cpu size={15} />
              <span className="text-xs font-bold text-white">AI Credit Scoring</span>
            </div>
            <p className="text-[11px] text-emerald-100/60 leading-tight">Automated yield & repayment risk modeling</p>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="flex items-center gap-2 text-emerald-400 mb-1">
              <Activity size={15} />
              <span className="text-xs font-bold text-white">Satellite Telemetry</span>
            </div>
            <p className="text-[11px] text-emerald-100/60 leading-tight">Live NDVI biomass & climate tracking</p>
          </div>
        </div>
      </div>

      {/* Middle Image & Verified Indicator */}
      <div className="my-6 space-y-4">
        <div className="relative rounded-2xl overflow-hidden h-44 xl:h-52 border border-emerald-500/20 shadow-2xl group">
          <img 
            src={farmImage} 
            alt="Agricultural telemetry asset" 
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#061F0F] via-[#061F0F]/30 to-transparent"></div>
          
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between p-2.5 rounded-xl bg-[#061F0F]/80 border border-emerald-500/30 backdrop-blur-md">
            <div className="flex items-center gap-2 text-xs text-white font-medium">
              <ShieldCheck size={16} className="text-emerald-400" />
              <span>Multi-Tier Security Protocol</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-300 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40">ISO 27001</span>
          </div>
        </div>
      </div>

      {/* Footer Compliance Badge */}
      <div className="pt-2 border-t border-emerald-800/40 flex items-center justify-between text-[11px] text-emerald-200/60 font-mono">
        <div className="flex items-center gap-1.5">
          <Lock size={12} className="text-emerald-400" />
          <span>256-Bit SSL Encrypted</span>
        </div>
        <span>v2.4 Enterprise</span>
      </div>
    </div>
  );
}