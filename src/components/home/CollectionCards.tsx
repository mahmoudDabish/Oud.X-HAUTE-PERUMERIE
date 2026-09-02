import React, { useEffect, useState } from 'react';
import { useShop } from '../../context/ShopContext';
import { Sparkles, ArrowRight, Shield, Crown, Flame, Gem } from 'lucide-react';
import { collectionService, HomeCollection } from '../../services/collectionService';

export const CollectionCards: React.FC = () => {
  const { navigateTo, products } = useShop();
  const [collections, setCollections] = useState<HomeCollection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadCollections() {
      setIsLoading(true);
      setError(null);
      const { data, error: err } = await collectionService.getHomeCollections();
      if (err) {
        setError(err);
      } else if (data) {
        setCollections(data);
      }
      setIsLoading(false);
    }
    loadCollections();
  }, []);

  const getCollectionIcon = (iconType: string) => {
    switch (iconType) {
      case 'men':
        return <Shield className="w-5 h-5 text-[#C9A45C]" />;
      case 'women':
        return <Gem className="w-5 h-5 text-[#C9A45C]" />;
      case 'unisex':
        return <Flame className="w-5 h-5 text-[#C9A45C]" />;
      case 'oud':
      default:
        return <Crown className="w-5 h-5 text-[#E3C27A]" />;
    }
  };

  if (isLoading && collections.length === 0) {
    return (
      <section className="py-20 bg-[#0D0C0A] relative border-t border-[#C9A45C]/15 overflow-hidden min-h-[600px] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#C9A45C]/30 border-t-[#C9A45C] rounded-full animate-spin"></div>
      </section>
    );
  }

  if (error && collections.length === 0) {
    return (
      <section className="py-20 bg-[#0D0C0A] relative border-t border-[#C9A45C]/15 overflow-hidden min-h-[600px] flex items-center justify-center">
        <div className="text-[#A7A29A] text-sm">Unable to load collections at this time.</div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-[#0D0C0A] relative border-t border-[#C9A45C]/15 overflow-hidden">
      {/* Soft background aura */}
      <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-[#C9A45C]/5 rounded-full blur-[100px] pointer-events-none -translate-y-1/2" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-[11px] uppercase tracking-[3px] text-[#C9A45C] font-semibold flex items-center gap-1.5 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A45C]" /> Olfactory Universe
            </span>
            <h2 className="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl font-normal text-[#F5F2EA]">
              COLLECTION CATEGORIES
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#A7A29A] max-w-md">
            Explore carefully partitioned scent profiles tailored for distinguished taste and lasting signatures.
          </p>
        </div>

        {/* Cards Grid with Frosted Glass Panels */}
        {collections.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {collections.map((cat) => (
            <div
              key={cat.id}
              onClick={() => navigateTo(cat.href)}
              className="group relative h-96 sm:h-[420px] rounded-2xl overflow-hidden cursor-pointer border border-[#C9A45C]/15 hover:border-[#C9A45C]/50 bg-[#151310]/60 backdrop-blur-md transition-all duration-500 shadow-xl hover:shadow-2xl hover:shadow-[#C9A45C]/10 flex flex-col justify-between p-6"
            >
              {/* Background Image with subtle frosted zoom */}
              <img
                src={cat.image_url}
                alt={cat.title}
                referrerPolicy="no-referrer"
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover object-center opacity-80 group-hover:opacity-95 transition-all duration-700 ease-out group-hover:scale-105"
              />

              {/* Frosted Dark Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#070707] via-[#070707]/60 to-black/30 group-hover:via-[#070707]/50 transition-colors duration-500" />

              {/* Card Top: Frosted Icon & Count Pill */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="w-10 h-10 rounded-full bg-[#070707]/75 border border-[#C9A45C]/30 backdrop-blur-md flex items-center justify-center group-hover:border-[#E3C27A] group-hover:scale-105 transition-all">
                  {getCollectionIcon(cat.icon_type)}
                </div>
              </div>

              {/* Card Bottom Content */}
              <div className="relative z-10 space-y-2.5 p-4 rounded-xl bg-[#0D0C0A]/75 border border-[#C9A45C]/15 backdrop-blur-md group-hover:border-[#C9A45C]/35 transition-colors">
                <span className="text-[10px] font-sans tracking-[2px] text-[#C9A45C] uppercase font-bold block">
                  {cat.id === 'oud' ? 'ANCIENT HERITAGE' : cat.id.toUpperCase()}
                </span>

                <h3 className="font-serif-luxury text-xl sm:text-2xl font-normal text-[#F5F2EA] group-hover:text-[#F0D9A4] transition-colors leading-tight">
                  {cat.title}
                </h3>

                <p className="text-xs text-[#A7A29A] line-clamp-2 leading-relaxed group-hover:text-neutral-300 transition-colors">
                  {cat.subtitle}
                </p>

                {/* DISCOVER → Link from Design HTML */}
                <div className="pt-1 flex items-center gap-1.5 text-xs font-semibold tracking-[2px] text-[#F0D9A4] group-hover:text-white transition-colors">
                  <span>DISCOVER</span>
                  <span className="text-[#C9A45C] group-hover:translate-x-1.5 transition-transform duration-300">→</span>
                </div>
              </div>
            </div>
          ))}
          </div>
        ) : (
          <div className="flex items-center justify-center py-12 text-[#A7A29A]">
            <p>No collections currently available.</p>
          </div>
        )}

      </div>
    </section>
  );
};

