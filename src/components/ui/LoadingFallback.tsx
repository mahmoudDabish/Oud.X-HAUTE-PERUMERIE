import React from 'react';

export const LoadingFallback: React.FC = () => {
  return (
    <div className="w-full min-h-[60vh] flex flex-col items-center justify-center bg-[#070707] py-24">
      <div className="relative flex items-center justify-center">
        {/* Ambient radial blur aura */}
        <div className="absolute w-24 h-24 rounded-full bg-[#C9A45C]/15 blur-xl animate-pulse" />
        
        {/* Luxury Gold Spinner */}
        <div className="w-12 h-12 rounded-full border-2 border-[#C9A45C]/20 border-t-[#C9A45C] border-r-[#C9A45C] animate-spin" />
      </div>
      
      {/* Subtle branding hint */}
      <span className="mt-6 text-[10px] tracking-[4px] uppercase text-[#A7A29A] font-semibold animate-pulse">
        OUD-X HAUTE PARFUMERIE
      </span>
    </div>
  );
};
