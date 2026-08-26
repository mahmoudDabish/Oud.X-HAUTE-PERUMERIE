import React, { useState, useMemo } from 'react';
import { useShop } from '../context/ShopContext';
import { ProductCard } from '../components/products/ProductCard';
import { ChevronRight, Sparkles, SlidersHorizontal, Shield, Crown, Flame, Gem } from 'lucide-react';
import { Button } from '../components/ui/Button';

interface CollectionPageProps {
  collectionId: 'men' | 'women' | 'unisex' | 'oud';
}

export const CollectionPage: React.FC<CollectionPageProps> = ({ collectionId }) => {
  const { products, navigateTo } = useShop();
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'rating'>('featured');
  const [selectedFamily, setSelectedFamily] = useState<string>('all');

  const metaMap = {
    men: {
      title: 'MEN COLLECTION',
      subtitle: 'Smoky woods, noble birch, and spiced midnight leathers.',
      narrative: 'Commanding, magnetic fragrances formulated with dark woody accords, smoked birch trees, Italian bergamot, and rich ambergris for the modern aristocrat.',
      image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1400&auto=format&fit=crop',
      icon: <Shield className="w-5 h-5 text-[#C9A45C]" />
    },
    women: {
      title: 'WOMEN COLLECTION',
      subtitle: 'Velvety Damask roses, radiant white florals, and sweet amber nectar.',
      narrative: 'Ethereal yet profound feminine compositions balancing blooming Grasse peonies, raspberry nectar, and warm cashmere musks for effortless majesty.',
      image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1400&auto=format&fit=crop',
      icon: <Gem className="w-5 h-5 text-[#C9A45C]" />
    },
    unisex: {
      title: 'UNISEX ELIXIRS',
      subtitle: 'Roasted coffee, dark praline, bourbon vanilla, and golden spices.',
      narrative: 'Fluid olfactory masterworks designed without boundaries. Blending roasted Arabic Qahwa, spicy cardamom, and honeyed amber for unforgettable chemistry on all skin.',
      image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=1400&auto=format&fit=crop',
      icon: <Flame className="w-5 h-5 text-[#C9A45C]" />
    },
    oud: {
      title: 'OUD COLLECTION',
      subtitle: 'Wild Assamese agarwood, aged Cambodian resin, and royal elixirs.',
      narrative: 'The beating heart of Arabian perfumery. Sourced from century-old trees, steam-distilled and maturely rested in charred French oak barrels for hypnotic beast-mode longevity.',
      image: '/src/assets/images/hero_oud_bottle_1787700482747.jpg',
      icon: <Crown className="w-5 h-5 text-[#E3C27A]" />
    }
  };

  const meta = metaMap[collectionId] || metaMap.oud;

  const collectionProducts = useMemo(() => {
    return products.filter(p => {
      if (collectionId === 'oud') {
        return p.category === 'oud' || p.fragranceFamily === 'Smoky Oud';
      }
      return p.gender === collectionId || p.category === collectionId;
    });
  }, [products, collectionId]);

  const families = useMemo(() => {
    const list = Array.from(new Set(collectionProducts.map(p => p.fragranceFamily)));
    return ['all', ...list];
  }, [collectionProducts]);

  const filtered = useMemo(() => {
    return collectionProducts.filter(p => {
      if (selectedFamily !== 'all' && p.fragranceFamily !== selectedFamily) {
        return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0;
    });
  }, [collectionProducts, selectedFamily, sortBy]);

  return (
    <div className="min-h-screen bg-[#070707] text-[#F5F2EA] pb-24">
      {/* Editorial Collection Hero Banner */}
      <div className="relative min-h-[360px] sm:min-h-[420px] flex items-center bg-[#0D0C0A] overflow-hidden border-b border-[#C9A45C]/30">
        {/* Background Image with Dark Gradient Vignette */}
        <div className="absolute inset-0">
          <img
            src={meta.image}
            alt={meta.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#070707] via-[#070707]/85 to-black/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070707] via-transparent to-black/50" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10 w-full">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-[#A7A29A] uppercase tracking-wider mb-6">
            <button onClick={() => navigateTo('/')} className="hover:text-[#F5F2EA]">Home</button>
            <ChevronRight className="w-3 h-3 text-[#8E713D]" />
            <button onClick={() => navigateTo('/shop')} className="hover:text-[#F5F2EA]">Collections</button>
            <ChevronRight className="w-3 h-3 text-[#8E713D]" />
            <span className="text-[#C9A45C]">{meta.title}</span>
          </nav>

          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#11100E]/80 border border-[#C9A45C]/40 backdrop-blur-md">
              {meta.icon}
              <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#E3C27A]">
                Curated Chapter
              </span>
            </div>

            <h1 className="font-serif-luxury text-3xl sm:text-5xl lg:text-6xl font-normal text-[#F5F2EA] leading-tight">
              {meta.title}
            </h1>

            <p className="text-xs sm:text-sm text-[#A7A29A] leading-relaxed">
              {meta.narrative}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-white/5">
          {/* Fragrance Family Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
            {families.map((fam) => (
              <button
                key={fam}
                onClick={() => setSelectedFamily(fam)}
                className={`text-xs px-3.5 py-1.5 rounded uppercase tracking-wider border whitespace-nowrap transition-all ${
                  selectedFamily === fam
                    ? 'border-[#C9A45C] bg-[#C9A45C]/15 text-[#E3C27A] font-semibold'
                    : 'border-white/10 text-[#A7A29A] hover:border-white/20'
                }`}
              >
                {fam === 'all' ? 'All Notes' : fam}
              </button>
            ))}
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-2 self-end sm:self-auto text-xs">
            <span className="text-[#8E713D] uppercase tracking-wider text-[11px]">SORT:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#151310] text-[#F5F2EA] border border-white/10 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-[#C9A45C]"
            >
              <option value="featured">Featured Curations</option>
              <option value="rating">Top Sillage & Reviews</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 pt-8">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};
