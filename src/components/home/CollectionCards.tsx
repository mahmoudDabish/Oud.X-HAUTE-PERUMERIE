import React from 'react';
import { useShop } from '../../context/ShopContext';
import { Sparkles, ArrowRight, Shield, Crown, Flame, Gem } from 'lucide-react';

const COLLECTION_CATEGORIES = [
  {
    id: 'men',
    title: 'MEN COLLECTION',
    subtitle: 'Powerful woods, smoky birch, and bold spiced resins.',
    image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1000&auto=format&fit=crop',
    href: '/collections/men',
    itemCount: 18
  },
  {
    id: 'women',
    title: 'WOMEN COLLECTION',
    subtitle: 'Velvety Damask roses, radiant florals, and sweet amber nectar.',
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1000&auto=format&fit=crop',
    href: '/collections/women',
    itemCount: 22
  },
  {
    id: 'unisex',
    title: 'UNISEX COLLECTION',
    subtitle: 'Masterfully balanced gourmand amber, coffee, and golden spices.',
    image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=1000&auto=format&fit=crop',
    href: '/collections/unisex',
    itemCount: 26
  },
  {
    id: 'oud',
    title: 'OUD COLLECTION',
    subtitle: 'Pure aged agarwood, rare resin extracts, and imperial elixirs.',
    image: '/src/assets/images/hero_oud_bottle_1787700482747.jpg',
    href: '/collections/oud',
    itemCount: 15
  }
];

export const CollectionCards: React.FC = () => {
  const { navigateTo, products } = useShop();

  const getCollectionIcon = (id: string) => {
    switch (id) {
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

  const getDynamicItemCount = (id: string) => {
    switch (id) {
      case 'men':
        return products.filter(p => p.gender === 'Men').length;
      case 'women':
        return products.filter(p => p.gender === 'Women').length;
      case 'unisex':
        return products.filter(p => p.gender === 'Unisex').length;
      case 'oud':
        return products.filter(p => 
          p.categoryId === '33333333-3333-3333-3333-333333333333' || 
          p.category === 'Oud' || 
          p.category === '33333333-3333-3333-3333-333333333333'
        ).length;
      default:
        return 0;
    }
  };

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

        {/* 4 Cards Grid with Frosted Glass Panels */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {COLLECTION_CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              onClick={() => navigateTo(cat.href)}
              className="group relative h-96 sm:h-[420px] rounded-2xl overflow-hidden cursor-pointer border border-[#C9A45C]/15 hover:border-[#C9A45C]/50 bg-[#151310]/60 backdrop-blur-md transition-all duration-500 shadow-xl hover:shadow-2xl hover:shadow-[#C9A45C]/10 flex flex-col justify-between p-6"
            >
              {/* Background Image with subtle frosted zoom */}
              <img
                src={cat.image}
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
                  {getCollectionIcon(cat.id)}
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

      </div>
    </section>
  );
};
