import React, { useEffect, useState } from 'react';
import { useShop } from '../../context/ShopContext';
import { useTranslation } from 'react-i18next';
import { Sparkles, ArrowRight, Shield, Crown, Flame, Gem } from 'lucide-react';
import { collectionService, HomeCollection } from '../../services/collectionService';

const DEFAULT_HOME_COLLECTIONS: HomeCollection[] = [
  { id: 'men', title: 'MEN COLLECTION', subtitle: 'Powerful woods, smoky birch, and bold spiced resins.', image_url: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1000&auto=format&fit=crop', href: '/collections/men', icon_type: 'men', display_order: 1, is_active: true },
  { id: 'women', title: 'WOMEN COLLECTION', subtitle: 'Velvety Damask roses, radiant florals, and sweet amber nectar.', image_url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1000&auto=format&fit=crop', href: '/collections/women', icon_type: 'women', display_order: 2, is_active: true },
  { id: 'unisex', title: 'UNISEX COLLECTION', subtitle: 'Masterfully balanced gourmand amber, coffee, and golden spices.', image_url: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=1000&auto=format&fit=crop', href: '/collections/unisex', icon_type: 'unisex', display_order: 3, is_active: true },
  { id: 'oud', title: 'OUD COLLECTION', subtitle: 'Pure aged agarwood, rare resin extracts, and imperial elixirs.', image_url: '/images/hero_oud_bottle_1787700482747.jpg', href: '/collections/oud', icon_type: 'oud', display_order: 4, is_active: true }
];

export const CollectionCards: React.FC = () => {
  const { navigateTo } = useShop();
  const { t } = useTranslation();
  const [collections, setCollections] = useState<HomeCollection[]>(DEFAULT_HOME_COLLECTIONS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadCollections() {
      setError(null);
      const { data, error: err } = await collectionService.getHomeCollections();
      if (err) {
        setError(err);
        setCollections(DEFAULT_HOME_COLLECTIONS);
      } else if (data && data.length > 0) {
        setCollections(data);
      } else {
        setCollections(DEFAULT_HOME_COLLECTIONS);
      }
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

  const getLocalizedTitle = (cat: HomeCollection) => {
    if (cat.id === 'men') return t('home.collections.menTitle');
    if (cat.id === 'women') return t('home.collections.womenTitle');
    if (cat.id === 'unisex') return t('home.collections.unisexTitle');
    if (cat.id === 'oud') return t('home.collections.oudTitle');
    return cat.title;
  };

  const getLocalizedSubtitle = (cat: HomeCollection) => {
    if (cat.id === 'men') return t('home.collections.menSub');
    if (cat.id === 'women') return t('home.collections.womenSub');
    if (cat.id === 'unisex') return t('home.collections.unisexSub');
    if (cat.id === 'oud') return t('home.collections.oudSub');
    return cat.subtitle;
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
        <div className="text-[#A7A29A] text-sm">{t('shop.empty.title')}</div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-[#0D0C0A] relative border-t border-[#C9A45C]/15 overflow-hidden">
      {/* Soft background aura */}
      <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-[#C9A45C]/5 rounded-full blur-[100px] pointer-events-none -translate-y-1/2" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4 text-left rtl:text-right">
          <div>
            <span className="text-[11px] uppercase tracking-[3px] text-[#C9A45C] font-semibold flex items-center gap-1.5 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A45C]" /> {t('home.collections.subtitle')}
            </span>
            <h2 className="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl font-normal text-[#F5F2EA]">
              {t('home.collections.title')}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#A7A29A] max-w-md leading-relaxed">
            {t('home.collections.desc')}
          </p>
        </div>

        {/* Cards Grid with Frosted Glass Panels */}
        {collections.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {collections.map((cat) => (
            <div
              key={cat.id}
              onClick={() => navigateTo(cat.href)}
              className="group relative h-96 sm:h-[420px] rounded-2xl overflow-hidden cursor-pointer border border-[#C9A45C]/15 hover:border-[#C9A45C]/50 bg-[#151310]/60 backdrop-blur-md transition-all duration-500 shadow-xl hover:shadow-2xl hover:shadow-[#C9A45C]/10 flex flex-col justify-between p-6 text-left rtl:text-right"
            >
              {/* Background Image with subtle frosted zoom */}
              <img
                src={cat.image_url}
                alt={cat.title}
                referrerPolicy="no-referrer"
                loading="lazy"
                decoding="async"
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
                  {cat.id === 'oud' ? t('nav.precious') : cat.id.toUpperCase()}
                </span>

                <h3 className="font-serif-luxury text-xl sm:text-2xl font-normal text-[#F5F2EA] group-hover:text-[#F0D9A4] transition-colors leading-tight">
                  {getLocalizedTitle(cat)}
                </h3>

                <p className="text-xs text-[#A7A29A] line-clamp-2 leading-relaxed group-hover:text-neutral-300 transition-colors">
                  {getLocalizedSubtitle(cat)}
                </p>

                {/* DISCOVER Link */}
                <div className="pt-1 flex items-center gap-1.5 text-xs font-semibold tracking-[2px] text-[#F0D9A4] group-hover:text-white transition-colors">
                  <span>{t('home.collections.exploreCollection')}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#C9A45C] group-hover:translate-x-1.5 rtl:group-hover:-translate-x-1.5 rtl-flip transition-transform duration-300" />
                </div>
              </div>
            </div>
          ))}
          </div>
        ) : (
          <div className="flex items-center justify-center py-12 text-[#A7A29A]">
            <p>{t('shop.empty.title')}</p>
          </div>
        )}

      </div>
    </section>
  );
};

