import React from 'react';
import { FilterState, FragranceFamily } from '../../types';
import { X, RotateCcw, ChevronDown, Check } from 'lucide-react';

interface ProductFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onReset: () => void;
  isMobile?: boolean;
  onCloseMobile?: () => void;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  filters,
  onChange,
  onReset,
  isMobile = false,
  onCloseMobile
}) => {
  const categories = [
    { label: 'All Collections', value: 'all' },
    { label: 'Perfumes', value: '11111111-1111-1111-1111-111111111111' },
    { label: 'Body Splash', value: '22222222-2222-2222-2222-222222222222' },
    { label: 'Oud', value: '33333333-3333-3333-3333-333333333333' },
    { label: 'Body Care', value: '44444444-4444-4444-4444-444444444444' },
    { label: 'Gift Sets', value: '55555555-5555-5555-5555-555555555555' }
  ];

  const fragranceFamilies: FragranceFamily[] = [
    'Smoky Oud',
    'Amber Gourmand',
    'Oriental Woody',
    'Spicy Leather',
    'Floral Citrus',
    'Aromatic Fougere',
    'Warm Resin'
  ];

  const concentrations = ['Extrait de Parfum', 'Eau de Parfum'];

  const toggleGender = (g: string) => {
    const exists = filters.gender.includes(g);
    onChange({
      ...filters,
      gender: exists ? filters.gender.filter(item => item !== g) : [...filters.gender, g]
    });
  };

  const toggleFamily = (f: string) => {
    const exists = filters.fragranceFamily.includes(f);
    onChange({
      ...filters,
      fragranceFamily: exists ? filters.fragranceFamily.filter(item => item !== f) : [...filters.fragranceFamily, f]
    });
  };

  const toggleConcentration = (c: string) => {
    const exists = filters.concentration.includes(c);
    onChange({
      ...filters,
      concentration: exists ? filters.concentration.filter(item => item !== c) : [...filters.concentration, c]
    });
  };

  return (
    <div className={`space-y-6 ${isMobile ? 'p-6 bg-[#0D0C0A]/95 backdrop-blur-2xl' : 'p-5 bg-[#151310]/50 border border-[#C9A45C]/20 rounded-2xl backdrop-blur-xl shadow-lg'}`}>
      {/* Mobile Header */}
      {isMobile && (
        <div className="flex items-center justify-between pb-4 border-b border-[#C9A45C]/15">
          <h3 className="font-cinzel text-base font-bold text-[#F5F2EA] tracking-wider uppercase">
            Filter Fragrances
          </h3>
          <button
            onClick={onCloseMobile}
            className="p-1 text-[#A7A29A] hover:text-[#F5F2EA] rounded-full hover:bg-white/5"
            aria-label="Close filters"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Reset Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-[#C9A45C]/15">
        <span className="text-[11px] uppercase tracking-[2px] text-[#F0D9A4] font-bold">
          Refine Results
        </span>
        <button
          onClick={onReset}
          className="flex items-center gap-1 text-[11px] text-[#A7A29A] hover:text-[#F5F2EA] transition-colors px-2 py-0.5 rounded-full hover:bg-white/5"
        >
          <RotateCcw className="w-3 h-3 text-[#C9A45C]" /> Reset
        </button>
      </div>

      {/* Category Section */}
      <div className="space-y-2">
        <label className="block text-[11px] font-bold uppercase tracking-[2px] text-[#C9A45C]">
          Collection
        </label>
        <div className="space-y-1">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => onChange({ ...filters, category: cat.value })}
              className={`w-full text-left text-xs py-2 px-3 rounded-xl transition-all flex items-center justify-between ${
                filters.category === cat.value
                  ? 'bg-[#C9A45C]/20 text-[#F0D9A4] font-semibold border border-[#C9A45C]/40 backdrop-blur-sm shadow-sm'
                  : 'text-[#A7A29A] hover:text-[#F5F2EA] hover:bg-white/5 border border-transparent'
              }`}
            >
              <span>{cat.label}</span>
              {filters.category === cat.value && <Check className="w-3.5 h-3.5 text-[#C9A45C]" />}
            </button>
          ))}
        </div>
      </div>

      {/* Gender / Silhouette Section */}
      <div className="space-y-2">
        <label className="block text-[11px] font-bold uppercase tracking-[2px] text-[#C9A45C]">
          Gender Silhouette
        </label>
        <div className="flex flex-wrap gap-2">
          {['men', 'women', 'unisex'].map((g) => {
            const isChecked = filters.gender.includes(g);
            return (
              <button
                key={g}
                onClick={() => toggleGender(g)}
                className={`text-xs px-3.5 py-1.5 rounded-full uppercase tracking-[2px] border transition-all ${
                  isChecked
                    ? 'border-[#C9A45C] bg-[#C9A45C]/20 text-[#F0D9A4] font-semibold shadow-sm backdrop-blur-sm'
                    : 'border-white/10 text-[#A7A29A] hover:border-[#C9A45C]/30 bg-[#151310]/40'
                }`}
              >
                {g}
              </button>
            );
          })}
        </div>
      </div>

      {/* Availability Section */}
      <div className="space-y-2">
        <label className="block text-[11px] font-bold uppercase tracking-[2px] text-[#C9A45C]">
          Availability
        </label>
        <button
          onClick={() => onChange({ ...filters, inStockOnly: !filters.inStockOnly })}
          className="flex items-center gap-2 group"
        >
          <div className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-all ${
            filters.inStockOnly 
              ? 'bg-[#C9A45C] border-[#C9A45C]' 
              : 'border-white/20 bg-[#151310] group-hover:border-[#C9A45C]/50'
          }`}>
            {filters.inStockOnly && <Check className="w-3 h-3 text-[#070707]" />}
          </div>
          <span className="text-xs text-[#A7A29A] group-hover:text-[#F5F2EA] transition-colors">
            In Stock Only
          </span>
        </button>
      </div>

      {/* Fragrance Family Section */}
      <div className="space-y-2">
        <label className="block text-[11px] font-bold uppercase tracking-[2px] text-[#C9A45C]">
          Olfactory Family
        </label>
        <div className="space-y-1.5">
          {fragranceFamilies.map((fam) => {
            const isChecked = filters.fragranceFamily.includes(fam);
            return (
              <label
                key={fam}
                onClick={() => toggleFamily(fam)}
                className="flex items-center gap-2.5 text-xs text-[#A7A29A] hover:text-[#F5F2EA] cursor-pointer select-none py-1 px-1.5 rounded-lg hover:bg-white/5 transition-colors"
              >
                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                    isChecked
                      ? 'border-[#C9A45C] bg-[#C9A45C] text-[#070707]'
                      : 'border-[#C9A45C]/30 bg-[#070707]/60'
                  }`}
                >
                  {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <span>{fam}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Concentration Section */}
      <div className="space-y-2">
        <label className="block text-[11px] font-bold uppercase tracking-[2px] text-[#C9A45C]">
          Concentration
        </label>
        <div className="space-y-1.5">
          {concentrations.map((conc) => {
            const isChecked = filters.concentration.includes(conc);
            return (
              <label
                key={conc}
                onClick={() => toggleConcentration(conc)}
                className="flex items-center gap-2.5 text-xs text-[#A7A29A] hover:text-[#F5F2EA] cursor-pointer select-none py-1 px-1.5 rounded-lg hover:bg-white/5 transition-colors"
              >
                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                    isChecked
                      ? 'border-[#C9A45C] bg-[#C9A45C] text-[#070707]'
                      : 'border-[#C9A45C]/30 bg-[#070707]/60'
                  }`}
                >
                  {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <span>{conc}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Price Range Slider */}
      <div className="space-y-3 pt-2 border-t border-[#C9A45C]/15">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold uppercase tracking-[2px] text-[#C9A45C]">Price Cap</span>
          <span className="font-cinzel text-xs text-[#F0D9A4] font-semibold">
            Up to {filters.priceRange[1].toLocaleString()} EGP
          </span>
        </div>
        <input
          type="range"
          min={1000}
          max={6000}
          step={200}
          value={filters.priceRange[1]}
          onChange={(e) =>
            onChange({
              ...filters,
              priceRange: [filters.priceRange[0], parseInt(e.target.value)]
            })
          }
          className="w-full accent-[#C9A45C] bg-[#11100E] cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-[#8E713D]">
          <span>1,000 EGP</span>
          <span>6,000+ EGP</span>
        </div>
      </div>

      {/* Rating & In-Stock */}
      <div className="space-y-2 pt-2 border-t border-[#C9A45C]/15">
        <label
          onClick={() => onChange({ ...filters, inStockOnly: !filters.inStockOnly })}
          className="flex items-center gap-2.5 text-xs text-[#A7A29A] hover:text-[#F5F2EA] cursor-pointer select-none py-1 px-1.5 rounded-lg hover:bg-white/5 transition-colors"
        >
          <div
            className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
              filters.inStockOnly
                ? 'border-[#C9A45C] bg-[#C9A45C] text-[#070707]'
                : 'border-[#C9A45C]/30 bg-[#070707]/60'
            }`}
          >
            {filters.inStockOnly && <Check className="w-3 h-3 stroke-[3]" />}
          </div>
          <span>In-Stock Items Only</span>
        </label>
      </div>

      {/* Mobile Apply Button */}
      {isMobile && (
        <button
          onClick={onCloseMobile}
          className="w-full py-3 bg-[#C9A45C] hover:bg-[#E3C27A] text-[#070707] font-bold text-xs uppercase tracking-[2px] rounded-full mt-4 shadow-lg shadow-[#C9A45C]/20 transition-colors"
        >
          APPLY FILTERS
        </button>
      )}
    </div>
  );
};
