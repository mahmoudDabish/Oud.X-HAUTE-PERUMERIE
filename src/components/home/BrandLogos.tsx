import React, { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useShop } from '../../context/ShopContext';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from 'lucide-react';
import { BrandItem } from '../../types';
import { ICON_PRESETS } from '../../constants/brandPresets';

export const BrandLogos: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { navigateTo, brands } = useShop();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const isRtl = i18n.language === 'ar' || document.documentElement.dir === 'rtl';

  // Active brands sorted by display order
  const displayBrands = React.useMemo(() => {
    return (brands || [])
      .filter(b => b.isActive !== false)
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  }, [brands]);

  const checkScrollState = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    if (isRtl) {
      setCanScrollLeft(Math.abs(scrollLeft) < scrollWidth - clientWidth - 15);
      setCanScrollRight(Math.abs(scrollLeft) > 15);
    } else {
      setCanScrollLeft(scrollLeft > 15);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 15);
    }
  };

  useEffect(() => {
    checkScrollState();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkScrollState, { passive: true });
    window.addEventListener('resize', checkScrollState);
    return () => {
      el.removeEventListener('scroll', checkScrollState);
      window.removeEventListener('resize', checkScrollState);
    };
  }, [isRtl, displayBrands]);

  const scrollByDirection = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const step = 320;
    const factor = (dir === 'left' ? -1 : 1) * (isRtl ? -1 : 1);
    scrollRef.current.scrollBy({ left: step * factor, behavior: 'smooth' });
  };

  const handleBrandClick = (brandName: string) => {
    navigateTo(`/shop?brand=${encodeURIComponent(brandName)}`);
  };

  const renderBrandInsignia = (brand: BrandItem) => {
    if (brand.logoUrl) {
      return (
        <img
          src={brand.logoUrl}
          alt={brand.name}
          className="w-full h-full object-contain rounded-full"
          loading="lazy"
        />
      );
    }
    const preset = (Array.isArray(ICON_PRESETS) ? ICON_PRESETS.find(p => p.id === brand.iconPreset) : null) || (Array.isArray(ICON_PRESETS) ? ICON_PRESETS[0] : null);
    if (preset && typeof preset.renderIcon === 'function') {
      return preset.renderIcon();
    }
    return <Sparkles className="w-8 h-8 text-[#C9A45C]" />;
  };

  if (displayBrands.length === 0) return null;

  return (
    <section id="all-brands" className="py-16 sm:py-24 bg-[#070707] relative overflow-hidden border-t border-[#C9A45C]/15 scroll-mt-24">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-64 bg-[#C9A45C]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header: Title on Left, View All on Right */}
        <div className="flex items-end justify-between mb-8 sm:mb-10 pb-4 border-b border-[#C9A45C]/15">
          <div className="space-y-1.5 text-left rtl:text-right">
            <span className="text-[10px] uppercase tracking-[3px] text-[#C9A45C] font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A45C]" /> {t('brands.subtitle', 'Esteemed Houses & Ateliers')}
            </span>
            <h2 className="font-serif-luxury text-2xl sm:text-3xl lg:text-4xl font-normal text-[#F5F2EA]">
              {t('brands.title', 'All Brands')}
            </h2>
          </div>

          <button
            onClick={() => navigateTo('/shop')}
            className="text-xs sm:text-sm font-semibold tracking-wider text-[#C9A45C] hover:text-[#E3C27A] underline transition-colors flex items-center gap-1.5 pb-1 cursor-pointer group"
          >
            <span>{t('brands.viewAll', 'View All')}</span>
            <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
          </button>
        </div>

        {/* Carousel Container with Overlapping Arrow Controls */}
        <div className="relative group/carousel">
          
          {/* Left Arrow Button */}
          <button
            onClick={() => scrollByDirection('left')}
            disabled={!canScrollLeft}
            aria-label="Previous brands"
            className="absolute -left-2 sm:-left-4 top-[42%] -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#151310]/95 border border-[#C9A45C]/40 text-[#F5F2EA] flex items-center justify-center hover:bg-[#C9A45C] hover:text-[#070707] hover:border-[#C9A45C] transition-all duration-200 shadow-2xl backdrop-blur-md cursor-pointer disabled:opacity-20 disabled:pointer-events-none group/btn"
          >
            <ChevronLeft className="w-5 h-5 rtl:rotate-180 transition-transform group-hover/btn:scale-110" />
          </button>

          {/* Right Arrow Button */}
          <button
            onClick={() => scrollByDirection('right')}
            disabled={!canScrollRight}
            aria-label="Next brands"
            className="absolute -right-2 sm:-right-4 top-[42%] -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#151310]/95 border border-[#C9A45C]/40 text-[#F5F2EA] flex items-center justify-center hover:bg-[#C9A45C] hover:text-[#070707] hover:border-[#C9A45C] transition-all duration-200 shadow-2xl backdrop-blur-md cursor-pointer disabled:opacity-20 disabled:pointer-events-none group/btn"
          >
            <ChevronRight className="w-5 h-5 rtl:rotate-180 transition-transform group-hover/btn:scale-110" />
          </button>

          {/* Horizontal Track of Circular Brand Cards */}
          <div
            ref={scrollRef}
            className="flex items-start gap-5 sm:gap-7 md:gap-9 overflow-x-auto scroll-smooth py-3 px-2 no-scrollbar"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {displayBrands.map((brand) => (
              <div
                key={brand.id}
                onClick={() => handleBrandClick(brand.name)}
                className="flex flex-col items-center group/card cursor-pointer flex-shrink-0 select-none transition-transform duration-300"
              >
                {/* Circular Outer Card with Gold Ring */}
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full p-[2px] bg-gradient-to-b from-[#C9A45C]/50 via-[#8E713D]/25 to-[#C9A45C]/15 group-hover/card:from-[#C9A45C] group-hover/card:to-[#E3C27A] transition-all duration-500 shadow-lg group-hover/card:shadow-[0_0_25px_rgba(201,164,92,0.35)]">
                  
                  {/* Inner Dark Slate Container */}
                  <div className="w-full h-full rounded-full bg-gradient-to-b from-[#1C1915] via-[#151310] to-[#0D0C0A] flex items-center justify-center p-3 relative overflow-hidden transition-transform duration-500 group-hover/card:scale-[0.98]">
                    
                    {/* Subtle Radial Glare */}
                    <div className="absolute inset-0 bg-radial from-[#C9A45C]/12 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    
                    {/* Vector Emblem or Custom Logo */}
                    <div className="relative z-10 w-full h-full flex items-center justify-center text-[#C9A45C] group-hover/card:text-[#F0D9A4] group-hover/card:scale-105 transition-all duration-300">
                      {renderBrandInsignia(brand)}
                    </div>
                  </div>
                </div>

                {/* Brand Name Typography */}
                <div className="mt-3 text-center max-w-[110px] sm:max-w-[125px] space-y-0.5">
                  <span className="block font-cinzel text-xs sm:text-[13px] font-semibold tracking-wide text-[#F5F2EA] group-hover/card:text-[#C9A45C] transition-colors truncate">
                    {brand.name}
                  </span>
                  {brand.nameAr && (
                    <span className="block text-[10px] sm:text-[11px] text-[#A7A29A] group-hover/card:text-[#E3C27A] transition-colors truncate">
                      {brand.nameAr}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
};
