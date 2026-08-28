import React from 'react';
import { useShop } from '../../context/ShopContext';
import { Button } from '../ui/Button';
import { Sparkles, ArrowRight, Award, Flame } from 'lucide-react';

export const NewArrivals: React.FC = () => {
  const { navigateTo, products } = useShop();

  const newProduct = products?.find(p => p.isNew) || products?.[0];
  const perfumeName = newProduct?.name || 'Royal Oud Imperial Reserve';
  const slug = newProduct?.slug || 'royal-oud-imperial';
  const link = `/products/${slug}`;
  const image = newProduct?.images?.[0] || '/src/assets/images/new_arrivals_perfume_1787700509279.jpg';
  const description = newProduct?.description || 'Be the first to discover our latest olfactory creations, distilled from aged Cambodian agarwoods, honeyed Turkish ambergris, and sun-drenched Taif roses.';

  return (
    <section className="py-24 bg-[#0D0C0A] relative overflow-hidden border-t border-[#C9A45C]/15">
      {/* Background glow aura */}
      <div className="absolute top-1/2 right-1/4 w-[500px] h-[500px] bg-[#C9A45C]/5 rounded-full blur-[140px] pointer-events-none -translate-y-1/2" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          
          {/* Left Column: Editorial Copy */}
          <div className="lg:col-span-6 space-y-6 sm:space-y-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#151310]/70 border border-[#C9A45C]/35 backdrop-blur-md">
              <Flame className="w-3.5 h-3.5 text-[#C9A45C]" />
              <span className="text-[10px] font-semibold uppercase tracking-[3px] text-[#C9A45C]">
                HAUTE ATELIER DROP 2026
              </span>
            </div>

            <div className="space-y-3">
              <h2 className="font-serif-luxury text-3xl sm:text-5xl lg:text-6xl font-normal text-[#F5F2EA] leading-tight">
                NEW ARRIVALS: <br />
                <span className="text-[#C9A45C] italic font-serif">THE ROYAL ELIXIRS</span>
              </h2>
              <p className="text-sm sm:text-base text-[#A7A29A] max-w-lg leading-relaxed line-clamp-3">
                {description}
              </p>
            </div>

            {/* Olfactory Highlights Grid with Frosted Glass Cards */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-[#151310]/60 border border-[#C9A45C]/15 backdrop-blur-md hover:border-[#C9A45C]/35 transition-colors">
                <div className="text-[10px] font-semibold uppercase tracking-[2px] text-[#C9A45C] mb-1">
                  EXTRAIT CONCENTRATION
                </div>
                <div className="font-cinzel text-base text-[#F5F2EA] font-semibold">35% Pure Oil</div>
                <p className="text-[11px] text-[#A7A29A] mt-1">Guarantees 14+ hours of rich, velvet sillage.</p>
              </div>

              <div className="p-4 rounded-xl bg-[#151310]/60 border border-[#C9A45C]/15 backdrop-blur-md hover:border-[#C9A45C]/35 transition-colors">
                <div className="text-[10px] font-semibold uppercase tracking-[2px] text-[#C9A45C] mb-1">
                  ARTISANAL AGING
                </div>
                <div className="font-cinzel text-base text-[#F5F2EA] font-semibold">180-Day Cask Maturation</div>
                <p className="text-[11px] text-[#A7A29A] mt-1">Aged inside charred French oak barrels.</p>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-4">
              <Button
                onClick={() => navigateTo('/shop?filter=new')}
                variant="primary"
                size="lg"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="shadow-xl shadow-[#C9A45C]/15 tracking-[2px] font-bold"
              >
                DISCOVER NOW
              </Button>

              <Button
                onClick={() => navigateTo(link)}
                variant="secondary"
                size="lg"
                className="tracking-[2px] font-bold uppercase truncate max-w-[200px]"
              >
                VIEW PRODUCT
              </Button>
            </div>
          </div>

          {/* Right Column: Large Cinematic Visual with Frosted Glass Pod */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-2xl overflow-hidden border border-[#C9A45C]/25 bg-[#151310]/60 backdrop-blur-xl shadow-2xl p-3.5">
              <div className="aspect-[4/3] sm:aspect-[16/11] rounded-xl overflow-hidden relative">
                <img
                  src={image}
                  alt={perfumeName}
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#070707] via-transparent to-transparent pointer-events-none" />

                {/* Floating Capsule Badge - Frosted Glass */}
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-[#0D0C0A]/85 border border-[#C9A45C]/25 backdrop-blur-lg flex items-center justify-between shadow-xl">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-[#C9A45C] tracking-[2px] block">
                      Limited Edition Launch
                    </span>
                    <span className="font-serif-luxury text-base sm:text-lg text-[#F5F2EA] font-medium">
                      {perfumeName}
                    </span>
                  </div>
                  <button
                    onClick={() => navigateTo(link)}
                    className="text-xs uppercase tracking-[2px] text-[#F0D9A4] hover:text-white font-semibold flex items-center gap-1 transition-colors"
                  >
                    <span>Details</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#C9A45C]" />
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
