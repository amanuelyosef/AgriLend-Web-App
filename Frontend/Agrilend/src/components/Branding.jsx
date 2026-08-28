import React from 'react';
// Import your local image from the assets folder
import farmImage from '../assets/crop.png'; 

export default function Branding() {
  return (
    <>
      {/* Upper Segment: Typography & Main Header */}
      <div className="space-y-10">
        <div className="flex items-center gap-2">
          <span className="text-2xl" role="img" aria-label="tractor">🚜</span>
          <span className="text-xl font-bold tracking-wide">AgriLend</span>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-3xl xl:text-4xl font-semibold leading-tight tracking-tight max-w-sm">
            Agricultural Credit Intelligence
          </h1>
          <p className="text-emerald-100/60 text-[13px] max-w-sm font-light leading-relaxed">
            Institutional-grade risk assessment and portfolio management tools 
            designed specifically for the unique complexities of agricultural finance.
          </p>
        </div>
      </div>

      {/* Lower Segment: Image and verified metadata indicator */}
      <div className="space-y-6 mt-12">
        <div className="rounded-xl overflow-hidden h-52 xl:h-60 shadow-lg border border-[#11381E]">
          {/* Display your crop image asset */}
          <img 
            src={farmImage} 
            alt="Agricultural green fields asset" 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="flex items-center gap-3 text-[10px] tracking-widest font-bold text-emerald-500/80">
          <span className="w-8 h-[1.5px] bg-emerald-500/60"></span>
          TRUSTED BY 45+ CREDIT INSTITUTIONS
        </div>
      </div>
    </>
  );
}