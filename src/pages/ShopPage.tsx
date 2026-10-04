import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useShop } from '../context/ShopContext';
import { ProductCard } from '../components/products/ProductCard';
import { ProductFilters } from '../components/products/ProductFilters';
import { FilterState } from '../types';
import { SlidersHorizontal, ChevronRight, Grid3X3, LayoutGrid, Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { getLocalizedCategory } from '../i18n/presentation';

export const ShopPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const { products, isLoadingProducts, navigateTo, currentRoute } = useShop();

  // Parse initial query/filter from current URL if needed
  const initialCategory = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('category')) return params.get('category') as string;
    
    if (currentRoute.includes('category=55555555-5555-5555-5555-555555555555')) return '55555555-5555-5555-5555-555555555555';
    if (currentRoute.includes('collections/perfumes')) return '11111111-1111-1111-1111-111111111111';
    if (currentRoute.includes('collections/body-splash')) return '22222222-2222-2222-2222-222222222222';
    if (currentRoute.includes('collections/oud')) return '33333333-3333-3333-3333-333333333333';
    if (currentRoute.includes('collections/body-care') || currentRoute.includes('collections/body-spray')) return '44444444-4444-4444-4444-444444444444';
    return 'all';
  }, [currentRoute]);

  const initialFilterSale = currentRoute.includes('filter=sale');
  const initialFilterNew = currentRoute.includes('filter=new');
  const initialFilterBest = currentRoute.includes('filter=bestsellers');

  const [filters, setFilters] = useState<FilterState>(() => {
    const params = new URLSearchParams(window.location.search);
    return {
      category: initialCategory,
      gender: params.get('gender') ? params.get('gender')!.split(',') : [],
      fragranceFamily: [],
      concentration: [],
      brand: [],
      priceRange: [0, 6000],
      minRating: 0,
      availability: (params.get('availability') as any) || 'all',
      searchQuery: '',
      sortBy: initialFilterNew ? 'newest' : initialFilterBest ? 'rating' : 'featured'
    };
  });

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [gridColumns, setGridColumns] = useState<4 | 3>(4);

  const resetFilters = () => {
    setFilters({
      category: 'all',
      gender: [],
      fragranceFamily: [],
      concentration: [],
      brand: [],
      priceRange: [0, 6000],
      minRating: 0,
      availability: 'all',
      searchQuery: '',
      sortBy: 'featured'
    });
  };

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let changed = false;
    
    if (filters.category !== 'all') { params.set('category', filters.category); changed = true; }
    else if (params.has('category')) { params.delete('category'); changed = true; }
    
    if (filters.gender.length > 0) { params.set('gender', filters.gender.join(',')); changed = true; }
    else if (params.has('gender')) { params.delete('gender'); changed = true; }
    
    if (filters.availability !== 'all') { params.set('availability', filters.availability); changed = true; }
    else if (params.has('availability')) { params.delete('availability'); changed = true; }
    
    if (changed) {
      const searchString = params.toString();
      const newUrl = searchString ? `${window.location.pathname}?${searchString}` : window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [filters]);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Category filter
      if (filters.category !== 'all') {
        const isOudFilter =
          filters.category === '33333333-3333-3333-3333-333333333333' ||
          filters.category.toLowerCase() === 'oud';

        if (isOudFilter) {
          const isOudProduct =
            product.categoryId === '33333333-3333-3333-3333-333333333333' ||
            product.category?.toLowerCase() === 'oud' ||
            product.fragranceFamily === 'Smoky Oud' ||
            product.name.toLowerCase().includes('oud');
          if (!isOudProduct) return false;
        } else if (
          filters.category === '44444444-4444-4444-4444-444444444444' ||
          filters.category.toLowerCase().includes('spray') ||
          filters.category.toLowerCase().includes('care')
        ) {
          const isBodySpray =
            product.categoryId === '44444444-4444-4444-4444-444444444444' ||
            product.category?.toLowerCase().includes('spray') ||
            product.category?.toLowerCase().includes('care') ||
            product.name.toLowerCase().includes('spray');
          if (!isBodySpray) return false;
        } else {
          const isCategoryMatch = product.categoryId === filters.category || product.category === filters.category;
          const isUnisexMatch = (filters.category === 'men' || filters.category === 'women') && (product.gender === 'unisex' || product.category === 'unisex');
          if (!isCategoryMatch && !isUnisexMatch) return false;
        }
      }

      // Quick query filters from banner/promos
      if (initialFilterSale && !product.isSale) return false;
      if (initialFilterNew && product.badge !== 'NEW') return false;
      if (initialFilterBest && product.badge !== 'BEST SELLER') return false;

      // Gender silhouette filter (Unisex fragrances are shown when filtering by Men or Women)
      if (filters.gender.length > 0) {
        const matchesGender = filters.gender.some(g => {
          if (product.gender === g) return true;
          if (product.gender === 'unisex' && (g === 'men' || g === 'women')) return true;
          return false;
        });
        if (!matchesGender) return false;
      }

      // Availability
      if (filters.availability === 'in_stock' && product.stock <= 0) return false;
      if (filters.availability === 'out_of_stock' && product.stock > 0) return false;

      // Fragrance family
      if (filters.fragranceFamily.length > 0) {
        if (!filters.fragranceFamily.includes(product.fragranceFamily)) return false;
      }

      // Concentration
      if (filters.concentration.length > 0) {
        if (!filters.concentration.includes(product.concentration)) return false;
      }

      // Price range
      if (product.price > filters.priceRange[1]) return false;

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'price-low') return a.price - b.price;
      if (filters.sortBy === 'price-high') return b.price - a.price;
      if (filters.sortBy === 'rating') return b.rating - a.rating;
      if (filters.sortBy === 'newest') return (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0);
      return 0; // featured default
    });
  }, [products, filters, initialFilterSale, initialFilterNew, initialFilterBest]);

  return (
    <div className="min-h-screen bg-[#070707] pb-24 text-[#F5F2EA]">
      {/* Header Banner */}
      <div className="bg-[#0D0C0A] border-b border-[#C9A45C]/20 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-[#A7A29A] uppercase tracking-wider">
            <button onClick={() => navigateTo('/')} className="hover:text-[#F5F2EA]">{t('shop.breadcrumbHome')}</button>
            <ChevronRight className="w-3 h-3 text-[#8E713D] rtl-flip" />
            <span className="text-[#C9A45C]">{t('shop.breadcrumbShop')}</span>
            {filters.category !== 'all' && (
              <>
                <ChevronRight className="w-3 h-3 text-[#8E713D] rtl-flip" />
                <span className="text-[#F0D9A4] capitalize">{getLocalizedCategory(filters.category, t)}</span>
              </>
            )}
          </nav>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#11100E] border border-[#C9A45C]/30 mb-3">
              <Sparkles className="w-3 h-3 text-[#C9A45C]" />
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#E3C27A] font-semibold">
                {t('shop.portfolio')}
              </span>
            </div>
            <h1 className="font-serif-luxury text-3xl sm:text-5xl font-normal text-[#F5F2EA] leading-tight">
              {filters.category !== 'all' ? getLocalizedCategory(filters.category, t) : t('shop.title')}
            </h1>
            <p className="text-xs sm:text-sm text-[#A7A29A] mt-2 leading-relaxed">
              {t('shop.desc')}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Desktop Left Sidebar Filters (3 Cols) */}
          <aside className="hidden lg:block lg:col-span-3 sticky top-24 max-h-[calc(100vh-7.5rem)] overflow-y-auto custom-scrollbar bg-[#0D0C0A] p-5 rounded-2xl border border-[#C9A45C]/25 shadow-2xl pr-3">
            <ProductFilters
              filters={filters}
              onChange={setFilters}
              onReset={resetFilters}
            />
          </aside>

          {/* Right Product Grid Area (9 Cols) */}
          <div className="lg:col-span-9 space-y-6">
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-[#0D0C0A] border border-white/5">
              {/* Count & Mobile Filter Trigger */}
              <div className="flex items-center justify-between sm:justify-start gap-4">
                <button
                  onClick={() => setIsMobileFiltersOpen(true)}
                  className="lg:hidden flex items-center gap-2 px-3.5 py-2 rounded bg-[#151310] border border-[#C9A45C]/40 text-xs font-semibold uppercase tracking-wider text-[#F5F2EA]"
                >
                  <SlidersHorizontal className="w-4 h-4 text-[#C9A45C]" />
                  <span>{t('shop.filterButton')}</span>
                </button>

                <div className="text-xs text-[#A7A29A]">
                  {t('shop.showingResults', { count: filteredProducts.length })}
                </div>
              </div>

              {/* Sort By & View Controls */}
              <div className="flex items-center gap-4 justify-between sm:justify-end">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-[#8E713D] uppercase tracking-wider text-[11px]">{t('shop.sortBy')}:</span>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
                    className="bg-[#151310] text-[#F5F2EA] border border-white/10 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#C9A45C] cursor-pointer"
                  >
                    <option value="featured">{t('shop.sortOptions.featured')}</option>
                    <option value="rating">{t('shop.sortOptions.rating')}</option>
                    <option value="price-low">{t('shop.sortOptions.priceLow')}</option>
                    <option value="price-high">{t('shop.sortOptions.priceHigh')}</option>
                    <option value="newest">{t('shop.sortOptions.newest')}</option>
                  </select>
                </div>

                {/* Grid layout density toggle (Desktop) */}
                <div className="hidden sm:flex items-center gap-1 border border-white/10 rounded p-0.5 bg-[#151310]">
                  <button
                    onClick={() => setGridColumns(3)}
                    className={`p-1.5 rounded transition-colors cursor-pointer ${gridColumns === 3 ? 'bg-[#C9A45C] text-[#070707]' : 'text-[#A7A29A] hover:text-[#F5F2EA]'}`}
                    aria-label={t('catalog.cols3', '3 columns grid')}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setGridColumns(4)}
                    className={`p-1.5 rounded transition-colors cursor-pointer ${gridColumns === 4 ? 'bg-[#C9A45C] text-[#070707]' : 'text-[#A7A29A] hover:text-[#F5F2EA]'}`}
                    aria-label={t('catalog.cols4', '4 columns grid')}
                  >
                    <Grid3X3 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {isLoadingProducts ? (
              <div className="py-24 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-[#C9A45C]/30 border-t-[#C9A45C] rounded-full animate-spin"></div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="py-24 text-center p-8 rounded-xl bg-[#0D0C0A] border border-white/5 space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#11100E] border border-[#C9A45C]/30 mx-auto flex items-center justify-center text-[#C9A45C]">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h3 className="font-serif-luxury text-2xl text-[#F5F2EA]">{t('shop.empty.title')}</h3>
                <p className="text-xs text-[#A7A29A] max-w-sm mx-auto">
                  {t('shop.empty.desc')}
                </p>
                <button
                  onClick={resetFilters}
                  className="px-6 py-2.5 rounded bg-[#C9A45C] text-[#070707] font-semibold text-xs uppercase tracking-wider"
                >
                  {t('shop.empty.resetButton')}
                </button>
              </div>
            ) : (
              <div
                className={`grid grid-cols-2 ${
                  gridColumns === 3
                    ? 'md:grid-cols-2 xl:grid-cols-3'
                    : 'md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'
                } gap-4 sm:gap-6`}
              >
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Mobile Filters Drawer */}
      <AnimatePresence>
        {isMobileFiltersOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFiltersOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: isRtl ? '100%' : '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: isRtl ? '100%' : '-100%' }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className={`fixed inset-y-0 ${isRtl ? 'right-0 border-l' : 'left-0 border-r'} w-4/5 max-w-sm bg-[#0D0C0A] border-[#C9A45C]/30 shadow-2xl z-10 overflow-y-auto overscroll-contain custom-scrollbar touch-pan-y`}
              data-lenis-prevent
            >
              <ProductFilters
                filters={filters}
                onChange={setFilters}
                onReset={resetFilters}
                isMobile={true}
                onCloseMobile={() => setIsMobileFiltersOpen(false)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
