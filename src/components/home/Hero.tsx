import React, { useState, useEffect } from 'react';
import { useShop } from '../../context/ShopContext';
import { Button } from '../ui/Button';
import { Sparkles, ArrowRight, ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Hero: React.FC = () => {
  const { navigateTo, products, isLoadingProducts } = useShop();
  const [currentSlide, setCurrentSlide] = useState(0);

  const defaultSlides = [
    {
      id: '01',
      eyebrow: 'HAUTE PARFUMERIE & RARE EXTRACTS',
      titleLine1: 'SCENT OF LUXURY,',
      titleLine2: 'ESSENCE OF YOU',
      description: 'Discover mastercrafted fragrances inspired by timeless Arabian elegance and aged Assamese agarwood.',
      primaryCta: 'SHOP PRODUCT',
      primaryLink: '/products/badee-al-oud-oud-for-glory',
      secondaryCta: 'EXPLORE COLLECTIONS',
      secondaryLink: '/shop',
      image: '/src/assets/images/hero_oud_bottle_1787700482747.jpg',
      badge: 'FEATURED MASTERPIECE',
      perfumeName: "Bade'e Al Oud (Oud For Glory)",
      notes: 'Smoked Agarwood • Saffron • Royal Amber'
    },
    {
      id: '02',
      eyebrow: 'GOURMAND ORIENTAL EXTRAIT',
      titleLine1: 'WARM EMBERS,',
      titleLine2: 'SUBLIME SPICES',
      description: 'Intoxicating roasted Arabic coffee, dark dates, and Madagascar bourbon vanilla in an imperial crystal flacon.',
      primaryCta: 'SHOP PRODUCT',
      primaryLink: '/products/khamrah-qahwa',
      secondaryCta: 'EXPLORE COLLECTIONS',
      secondaryLink: '/shop',
      image: '/src/assets/images/new_arrivals_perfume_1787700509279.jpg',
      badge: 'GOURMAND FAVORITE',
      perfumeName: 'Khamrah Qahwa Sublime',
      notes: 'Qahwa Coffee • Candied Dates • Bourbon Vanilla'
    },
    {
      id: '03',
      eyebrow: 'ROYAL RESERVE COLLECTION',
      titleLine1: 'TIMELESS HERITAGE,',
      titleLine2: 'PURE AGED OUD',
      description: 'Handcrafted in numbered batches of 500 bottles. Wild Assam agarwood married with morning-picked Taif rose.',
      primaryCta: 'SHOP PRODUCT',
      primaryLink: '/products/royal-oud-imperial',
      secondaryCta: 'EXPLORE COLLECTIONS',
      secondaryLink: '/shop',
      image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1400&auto=format&fit=crop',
      badge: 'LIMITED TO 500 FLACONS',
      perfumeName: 'Royal Oud Imperial Reserve',
      notes: 'Assam Oud • Taif Rose • Omani Frankincense'
    }
  ];

  const featuredProducts = products?.filter(p => p.isFeatured) || [];

  const presetTitles = [
    { line1: 'TIMELESS HERITAGE,', line2: 'PURE AGED OUD', eyebrow: 'ROYAL RESERVE COLLECTION' },
    { line1: 'SCENT OF LUXURY,', line2: 'ESSENCE OF YOU', eyebrow: 'HAUTE PARFUMERIE & RARE EXTRACTS' },
    { line1: 'WARM EMBERS,', line2: 'SUBLIME SPICES', eyebrow: 'GOURMAND ORIENTAL EXTRAIT' },
  ];

  const dynamicSlides = featuredProducts.length > 0 
    ? featuredProducts.map((p, index) => {
        const preset = presetTitles[index % presetTitles.length];
        
        let notesDisplay = 'Smoked Agarwood • Saffron • Royal Amber';
        if (p.notes && p.notes.top && p.notes.heart && p.notes.base) {
          notesDisplay = [p.notes.top[0], p.notes.heart[0], p.notes.base[0]].filter(Boolean).join(' • ');
        } else if (p.subtitle) {
          notesDisplay = p.subtitle;
        }

        return {
          id: `0${index + 1}`,
          eyebrow: preset.eyebrow,
          titleLine1: preset.line1,
          titleLine2: preset.line2,
          description: p.description || p.subtitle || 'Discover mastercrafted fragrances inspired by timeless Arabian elegance.',
          primaryCta: 'SHOP PRODUCT',
          primaryLink: `/products/${p.slug}`,
          secondaryCta: 'EXPLORE COLLECTIONS',
          secondaryLink: '/shop',
          image: p.images[0] || 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1400&auto=format&fit=crop',
          badge: p.badge || 'FEATURED MASTERPIECE',
          perfumeName: p.name,
          notes: notesDisplay
        };
      })
    : defaultSlides;

  const slides = dynamicSlides;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const active = slides[currentSlide] || slides[0];

  if (isLoadingProducts) {
    return (
      <section className="relative min-h-[85vh] lg:min-h-[92vh] flex items-center bg-[#070707] overflow-hidden">
        <div className="absolute top-1/2 right-1/4 w-[450px] h-[450px] bg-radial from-[#C9A45C]/15 to-transparent rounded-full blur-[60px] pointer-events-none -translate-y-1/2" />
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-[#C9A45C]/10 rounded-full blur-[80px] pointer-events-none -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute top-20 right-[12%] w-[1px] h-[450px] bg-gradient-to-b from-transparent via-[#C9A45C]/30 to-transparent pointer-events-none hidden lg:block" />
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="w-10 h-10 border-2 border-[#C9A45C]/20 border-t-[#C9A45C] rounded-full animate-spin" />
        </div>
      </section>
    );
  }

  return (
    <section className="relative min-h-[85vh] lg:min-h-[92vh] flex items-center bg-[#070707] overflow-hidden">
      {/* Background ambient radial aura and vertical line from design */}
      <div className="absolute top-1/2 right-1/4 w-[450px] h-[450px] bg-radial from-[#C9A45C]/15 to-transparent rounded-full blur-[60px] pointer-events-none -translate-y-1/2" />
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-[#C9A45C]/10 rounded-full blur-[80px] pointer-events-none -translate-x-1/2 -translate-y-1/2" />

      {/* Decorative vertical gold divider line from design */}
      <div className="absolute top-20 right-[12%] w-[1px] h-[450px] bg-gradient-to-b from-transparent via-[#C9A45C]/30 to-transparent pointer-events-none hidden lg:block" />

      {/* Subtle Smoke & Texture overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-10 mix-blend-screen pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E")`
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Hero Content (7 Cols) */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-left">
            {/* Small Eyebrow with Frosted Glass Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#C9A45C]/30 bg-[#151310]/60 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A45C]" />
              <span className="text-[10px] sm:text-xs font-semibold tracking-[4px] text-[#C9A45C] uppercase">
                {active.eyebrow}
              </span>
            </div>

            {/* Main Headline */}
            <div className="space-y-1 sm:space-y-2">
              <h1 className="font-serif-luxury text-4xl sm:text-6xl lg:text-7xl font-normal text-[#F5F2EA] leading-[1.05] tracking-tight">
                <span>{active.titleLine1}</span>
                <br />
                <span className="text-[#C9A45C] font-serif italic">{active.titleLine2}</span>
              </h1>
            </div>

            {/* Supporting Subtext */}
            <p className="text-sm sm:text-base text-[#A7A29A] max-w-xl font-normal leading-relaxed">
              {active.description}
            </p>

            {/* CTA Buttons - Matching Theme Spec */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <Button
                onClick={() => navigateTo(active.primaryLink)}
                variant="primary"
                size="lg"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="shadow-xl shadow-[#C9A45C]/15 tracking-[2px] font-bold"
              >
                {active.primaryCta}
              </Button>

              <Button
                onClick={() => navigateTo(active.secondaryLink)}
                variant="secondary"
                size="lg"
                className="tracking-[2px] font-bold"
              >
                {active.secondaryCta}
              </Button>
            </div>

            {/* Bottom Slide Info & Pagination */}
            <div className="pt-6 sm:pt-8 flex items-center justify-between border-t border-[#C9A45C]/15 max-w-lg">
              {/* 01 / 04 indicator with horizontal line */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-[1px] bg-[#C9A45C]/40" />
                <span className="text-xs font-mono tracking-[3px] text-[#F5F2EA]">
                  {active.id} / 0{slides.length}
                </span>
              </div>

              {/* Fragrance highlight notes */}
              <div className="text-[11px] text-[#A7A29A] hidden sm:block truncate">
                <span className="text-[#C9A45C] font-semibold">{active.perfumeName}</span>
              </div>

              {/* Prev / Next Arrows */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentSlide(prev => (prev === 0 ? slides.length - 1 : prev - 1))}
                  className="p-1.5 rounded border border-[#C9A45C]/20 hover:border-[#C9A45C] bg-[#151310]/50 backdrop-blur-sm text-[#A7A29A] hover:text-[#F5F2EA] transition-colors"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentSlide(prev => (prev + 1) % slides.length)}
                  className="p-1.5 rounded border border-[#C9A45C]/20 hover:border-[#C9A45C] bg-[#151310]/50 backdrop-blur-sm text-[#A7A29A] hover:text-[#F5F2EA] transition-colors"
                  aria-label="Next slide"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Sub-label watermark */}
            <div className="text-[9px] uppercase tracking-[3px] text-[#A7A29A]/50 pt-2">
              EST. 2026 • CAIRO • DUBAI • LONDON
            </div>
          </div>

          {/* Right Hero Cinematic Flacon Media (5 Cols) with Frosted Glass Container */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            {/* Center radial aura behind bottle */}
            <div className="absolute w-72 h-72 rounded-full bg-[#C9A45C]/15 blur-3xl pointer-events-none" />

            {/* Frosted Glass Outer Container */}
            <div className="relative w-full max-w-md aspect-[4/5] rounded-2xl p-3.5 border border-[#C9A45C]/25 bg-[#151310]/60 backdrop-blur-xl shadow-2xl shadow-black">
              
              {/* Inner Image Container */}
              <div className="relative w-full h-full rounded-xl overflow-hidden bg-black/90">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={active.image}
                    src={active.image}
                    alt={active.perfumeName}
                    referrerPolicy="no-referrer"
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                    className="w-full h-full object-cover object-center"
                  />
                </AnimatePresence>

                {/* Dramatic Vignette & Frosted Glaze */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#070707] via-transparent to-black/30 pointer-events-none" />

                {/* Floating Frosted Badge on Image */}
                <div className="absolute top-4 left-4 z-10">
                  <div className="px-3 py-1 rounded-full bg-[#070707]/80 border border-[#C9A45C]/40 text-[10px] uppercase font-semibold tracking-[2px] text-[#F0D9A4] backdrop-blur-md shadow-lg">
                    {active.badge}
                  </div>
                </div>

                {/* Bottom Scent Details Card Overlay - Frosted Glass */}
                <div className="absolute bottom-4 inset-x-4 p-4 rounded-xl bg-[#0D0C0A]/80 border border-[#C9A45C]/25 backdrop-blur-lg shadow-xl">
                  <div className="text-[10px] text-[#C9A45C] font-semibold uppercase tracking-[2px]">
                    {active.eyebrow.split('&')[0]}
                  </div>
                  <h3 className="font-serif-luxury text-lg text-[#F5F2EA] font-medium leading-tight mt-0.5">
                    {active.perfumeName}
                  </h3>
                  <div className="text-[11px] text-[#A7A29A] mt-1 truncate">
                    {active.notes}
                  </div>
                </div>
              </div>

              {/* Decorative Delicate Gold Corner Accents */}
              <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-[#C9A45C]" />
              <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-[#C9A45C]" />
              <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-[#C9A45C]" />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-[#C9A45C]" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
