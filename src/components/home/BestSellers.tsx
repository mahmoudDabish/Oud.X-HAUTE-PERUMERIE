import React, { useState } from 'react';
import { useShop } from '../../context/ShopContext';
import { ProductCard } from '../products/ProductCard';
import { ArrowRight, Sparkles } from 'lucide-react';

export const BestSellers: React.FC = () => {
  const { products, isLoadingProducts, navigateTo } = useShop();
  const [activeTab, setActiveTab] = useState<'all' | 'oud' | 'men' | 'unisex'>('all');

  const bestSellerProducts = products.filter(p => p.isBestSeller || p.badge === 'BEST SELLER');

  const filtered = activeTab === 'all'
    ? bestSellerProducts
    : bestSellerProducts.filter(p => p.category === activeTab || p.gender === activeTab);

  return (
    <section className="py-24 bg-[#070707] relative overflow-hidden">
      {/* Background ambient radial aura */}
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-[#C9A45C]/5 rounded-full blur-[100px] pointer-events-none -translate-y-1/2" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header with View All */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div className="space-y-2">
            <span className="text-[11px] uppercase tracking-[3px] text-[#C9A45C] font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A45C]" /> Signature Selection
            </span>
            <h2 className="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl font-normal text-[#F5F2EA]">
              BEST SELLERS
            </h2>
            <p className="text-xs sm:text-sm text-[#A7A29A]">
              Explore our most loved fragrances, celebrated across the globe for supreme sillage and longevity.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Category Filter Tabs - Frosted Glass Pill */}
            <div className="flex items-center gap-1 p-1 rounded-full bg-[#151310]/70 border border-[#C9A45C]/20 backdrop-blur-md">
              {(['all', 'oud', 'men', 'unisex'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-[11px] uppercase tracking-[2px] px-3.5 py-1.5 rounded-full transition-all ${
                    activeTab === tab
                      ? 'bg-[#C9A45C] text-[#070707] font-bold shadow-md shadow-[#C9A45C]/20'
                      : 'text-[#A7A29A] hover:text-[#F5F2EA]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <button
              onClick={() => navigateTo('/shop?filter=bestsellers')}
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[2px] text-[#F0D9A4] hover:text-white transition-colors pl-2"
            >
              <span>VIEW ALL</span>
              <ArrowRight className="w-4 h-4 text-[#C9A45C]" />
            </button>
          </div>
        </div>

        {/* Product Cards Grid: 4 columns desktop, 3 tablet, 2 mobile */}
        {isLoadingProducts ? (
          <div className="py-12 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-[#C9A45C]/30 border-t-[#C9A45C] rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filtered.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

      </div>
    </section>
  );
};
