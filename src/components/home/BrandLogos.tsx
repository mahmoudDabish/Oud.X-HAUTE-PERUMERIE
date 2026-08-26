import React from 'react';

const LUXURY_BRANDS = [
  { name: 'CREED', tag: 'PARIS' },
  { name: 'TOM FORD', tag: 'PRIVATE BLEND' },
  { name: 'MAISON FRANCIS KURKDJIAN', tag: 'PARIS' },
  { name: 'BYREDO', tag: 'STOCKHOLM' },
  { name: 'DIOR PRIVE', tag: 'PARIS' },
  { name: 'OUD_X ATELIER', tag: 'HAUTE PARFUMERIE' }
];

export const BrandLogos: React.FC = () => {
  return (
    <section className="py-14 bg-[#070707] border-t border-[#C9A45C]/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="text-[10px] uppercase tracking-[4px] text-[#C9A45C] font-semibold">
            ESTEEMED HOUSES & ATELIERS WE CURATE
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 items-center">
          {LUXURY_BRANDS.map((brand, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-[#C9A45C]/15 bg-[#151310]/60 backdrop-blur-md flex flex-col items-center justify-center text-center group hover:border-[#C9A45C]/50 hover:bg-[#151310]/80 transition-all duration-300 shadow-md"
            >
              <span className="font-cinzel text-xs sm:text-sm font-bold tracking-[2px] text-[#F5F2EA] group-hover:text-[#F0D9A4] transition-colors">
                {brand.name}
              </span>
              <span className="text-[8px] uppercase tracking-[2px] text-[#8E713D] mt-0.5">
                {brand.tag}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

