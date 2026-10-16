import React from 'react';
import { useShop } from '../../context/ShopContext';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/Button';
import { Sparkles, ArrowRight, Flame } from 'lucide-react';

export const NewArrivals: React.FC = () => {
  const { navigateTo, products, isLoadingProducts } = useShop();
  const { t } = useTranslation();

  const newProduct = products?.find(p => p.isNew && (p.stock ?? 0) > 0) || products?.find(p => p.isNew) || products?.find(p => (p.stock ?? 0) > 0) || products?.[0];
  const perfumeName = newProduct?.name || '';
  const slug = newProduct?.slug || '';
  const link = `/products/${slug}`;
  const image = newProduct?.images?.[0] || '';
  const description = newProduct?.description || t('home.newArrivals.defaultDesc');

  if (!isLoadingProducts && !newProduct) {
    return null;
  }

  return (
    <section className="py-24 bg-[#0D0C0A] relative overflow-hidden border-t border-[#C9A45C]/15">
      {/* Background glow aura */}
      <div className="absolute top-1/2 right-1/4 w-[500px] h-[500px] bg-[#C9A45C]/5 rounded-full blur-[140px] pointer-events-none -translate-y-1/2" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {isLoadingProducts ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            {/* Left Column Skeleton */}
            <div className="lg:col-span-6 space-y-6 sm:space-y-8 text-left rtl:text-right">
              <div className="w-28 h-6 rounded-full bg-[#151310] border border-[#C9A45C]/20 animate-pulse" />
              <div className="space-y-3">
                <div className="w-3/4 h-12 rounded-lg bg-[#151310] border border-[#C9A45C]/10 animate-pulse" />
                <div className="w-1/2 h-10 rounded-lg bg-[#151310] border border-[#C9A45C]/10 animate-pulse" />
              </div>
              <div className="space-y-2 max-w-lg">
                <div className="w-full h-4 rounded bg-[#151310] animate-pulse" />
                <div className="w-4/5 h-4 rounded bg-[#151310] animate-pulse" />
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="h-24 rounded-xl bg-[#151310]/60 border border-[#C9A45C]/15 animate-pulse" />
                <div className="h-24 rounded-xl bg-[#151310]/60 border border-[#C9A45C]/15 animate-pulse" />
              </div>
              <div className="flex gap-4 pt-2">
                <div className="w-36 h-12 rounded-xl bg-[#C9A45C]/20 border border-[#C9A45C]/30 animate-pulse" />
                <div className="w-36 h-12 rounded-xl bg-[#151310] border border-[#C9A45C]/20 animate-pulse" />
              </div>
            </div>

            {/* Right Column Skeleton */}
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-2xl overflow-hidden border border-[#C9A45C]/25 bg-[#151310]/60 backdrop-blur-xl p-3.5">
                <div className="aspect-[4/3] sm:aspect-[16/11] rounded-xl overflow-hidden bg-black/60 flex flex-col items-center justify-center animate-pulse">
                  <div className="w-10 h-10 rounded-full border-2 border-[#C9A45C]/30 border-t-[#C9A45C] animate-spin mb-3" />
                  <span className="text-[10px] tracking-[3px] uppercase text-[#A7A29A]/70 font-semibold">
                    OUD-X
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            
            {/* Left Column: Editorial Copy */}
            <div className="lg:col-span-6 space-y-6 sm:space-y-8 text-left rtl:text-right">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#151310]/70 border border-[#C9A45C]/35 backdrop-blur-md">
                <Flame className="w-3.5 h-3.5 text-[#C9A45C]" />
                <span className="text-[10px] font-semibold uppercase tracking-[3px] text-[#C9A45C]">
                  {t('home.newArrivals.badge')}
                </span>
              </div>

              <div className="space-y-3">
                <h2 className="font-serif-luxury text-3xl sm:text-5xl lg:text-6xl font-normal text-[#F5F2EA] leading-tight">
                  {t('home.newArrivals.titleLine1')} <br />
                  <span className="text-[#C9A45C] italic font-serif">{t('home.newArrivals.titleLine2')}</span>
                </h2>
                <p className="text-sm sm:text-base text-[#A7A29A] max-w-lg leading-relaxed line-clamp-3">
                  {description}
                </p>
              </div>

              {/* Olfactory Highlights Grid with Frosted Glass Cards */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-[#151310]/60 border border-[#C9A45C]/15 backdrop-blur-md hover:border-[#C9A45C]/35 transition-colors text-left rtl:text-right">
                  <div className="text-[10px] font-semibold uppercase tracking-[2px] text-[#C9A45C] mb-1">
                    {t('home.newArrivals.extraitTitle')}
                  </div>
                  <div className="font-cinzel text-base text-[#F5F2EA] font-semibold">{t('home.newArrivals.extraitValue')}</div>
                  <p className="text-[11px] text-[#A7A29A] mt-1">{t('home.newArrivals.extraitDesc')}</p>
                </div>

                <div className="p-4 rounded-xl bg-[#151310]/60 border border-[#C9A45C]/15 backdrop-blur-md hover:border-[#C9A45C]/35 transition-colors text-left rtl:text-right">
                  <div className="text-[10px] font-semibold uppercase tracking-[2px] text-[#C9A45C] mb-1">
                    {t('home.newArrivals.agingTitle')}
                  </div>
                  <div className="font-cinzel text-base text-[#F5F2EA] font-semibold">{t('home.newArrivals.agingValue')}</div>
                  <p className="text-[11px] text-[#A7A29A] mt-1">{t('home.newArrivals.agingDesc')}</p>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-4">
                <Button
                  onClick={() => navigateTo('/shop?filter=new')}
                  variant="primary"
                  size="lg"
                  rightIcon={<ArrowRight className="w-4 h-4 rtl-flip" />}
                  className="shadow-xl shadow-[#C9A45C]/15 tracking-[2px] font-bold cursor-pointer"
                >
                  {t('home.newArrivals.shopNow')}
                </Button>

                <Button
                  onClick={() => navigateTo(link)}
                  variant="secondary"
                  size="lg"
                  className="tracking-[2px] font-bold uppercase truncate max-w-[200px] cursor-pointer"
                >
                  {t('home.hero.shopProduct')}
                </Button>
              </div>
            </div>

            {/* Right Column: Large Cinematic Visual with Frosted Glass Pod */}
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-2xl overflow-hidden border border-[#C9A45C]/25 bg-[#151310]/60 backdrop-blur-xl shadow-2xl p-3.5">
                <div className="aspect-[4/3] sm:aspect-[16/11] rounded-xl overflow-hidden relative bg-black/60 flex items-center justify-center">
                  {image ? (
                    <img
                      src={image}
                      alt={perfumeName}
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center p-6">
                      <Sparkles className="w-10 h-10 text-[#C9A45C] mb-2 animate-pulse" />
                      <span className="text-xs uppercase tracking-[3px] text-[#A7A29A]">OUD-X Haute Parfumerie</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#070707] via-transparent to-transparent pointer-events-none" />

                  {/* Floating Capsule Badge - Frosted Glass */}
                  <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-[#0D0C0A]/85 border border-[#C9A45C]/25 backdrop-blur-lg flex items-center justify-between shadow-xl text-left rtl:text-right">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-[#C9A45C] tracking-[2px] block">
                        {t('home.hero.limited500')}
                      </span>
                      <span className="font-serif-luxury text-base sm:text-lg text-[#F5F2EA] font-medium">
                        {perfumeName}
                      </span>
                    </div>
                    <button
                      onClick={() => navigateTo(link)}
                      className="text-xs uppercase tracking-[2px] text-[#F0D9A4] hover:text-white font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>{t('home.hero.shopProduct')}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#C9A45C] rtl-flip" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </section>
  );
};
