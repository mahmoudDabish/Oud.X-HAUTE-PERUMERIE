import React, { useState, useMemo } from 'react';
import { useShop } from '../context/ShopContext';
import { ProductCard } from '../components/products/ProductCard';
import { ProductFilters } from '../components/products/ProductFilters';
import { FilterState } from '../types';
import { SlidersHorizontal, ChevronRight, Grid3X3, LayoutGrid, Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

export const ShopPage: React.FC = () => {
  const { products, navigateTo, currentRoute } = useShop();

  const CATEGORY_MAP: Record<string, string> = {
    'all': 'All Collections',
    '11111111-1111-1111-1111-111111111111': 'Perfumes',
    '22222222-2222-2222-2222-222222222222': 'Body Splash',
    '33333333-3333-3333-3333-333333333333': 'Oud',
    '44444444-4444-4444-4444-444444444444': 'Body Care',
    '55555555-5555-5555-5555-555555555555': 'Gift Sets'
  };

  // Parse initial query/filter from current URL if needed
  const initialCategory = useMemo(() => {
    if (currentRoute.includes('category=55555555-5555-5555-5555-555555555555')) return '55555555-5555-5555-5555-555555555555';
    if (currentRoute.includes('collections/perfumes')) return '11111111-1111-1111-1111-111111111111';
    if (currentRoute.includes('collections/body-splash')) return '22222222-2222-2222-2222-222222222222';
    if (currentRoute.includes('collections/oud')) return '33333333-3333-3333-3333-333333333333';
    if (currentRoute.includes('collections/body-care')) return '44444444-4444-4444-4444-444444444444';
    return 'all';
  }, [currentRoute]);

  const initialFilterSale = currentRoute.includes('filter=sale');
  const initialFilterNew = currentRoute.includes('filter=new');
  const initialFilterBest = currentRoute.includes('filter=bestsellers');

  const [filters, setFilters] = useState<FilterState>({
    category: initialCategory,
    gender: [],
    fragranceFamily: [],
    concentration: [],
    brand: [],
    priceRange: [0, 6000],
    minRating: 0,
    inStockOnly: false,
    searchQuery: '',
    sortBy: initialFilterNew ? 'newest' : initialFilterBest ? 'rating' : 'featured'
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
      inStockOnly: false,
      searchQuery: '',
      sortBy: 'featured'
    });
  };

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Category filter
      if (filters.category !== 'all') {
        if (product.categoryId !== filters.category) return false;
      }

      // Quick query filters from banner/promos
      if (initialFilterSale && !product.isSale && !product.compareAtPrice) return false;
      if (initialFilterNew && !product.isNew && product.badge !== 'NEW') return false;
      if (initialFilterBest && !product.isBestSeller && product.badge !== 'BEST SELLER') return false;

      // Gender filter
      if (filters.gender && filters.gender.length > 0 && !filters.gender.includes(product.gender)) {
        return false;
      }

      // Fragrance family filter
      if (filters.fragranceFamily && filters.fragranceFamily.length > 0 && !filters.fragranceFamily.includes(product.fragranceFamily)) {
        return false;
      }

      // Concentration filter
      if (filters.concentration && filters.concentration.length > 0 && !filters.concentration.includes(product.concentration)) {
        return false;
      }

      // Price filter
      if (product.price > filters.priceRange[1]) {
        return false;
      }

      // In stock
      if (filters.inStockOnly && product.stock <= 0) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'price-low') return a.price - b.price;
      if (filters.sortBy === 'price-high') return b.price - a.price;
      if (filters.sortBy === 'rating') return b.rating - a.rating;
      if (filters.sortBy === 'newest') return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
      return 0; // featured default
    });
  }, [products, filters, initialFilterSale, initialFilterNew, initialFilterBest]);

  return (
    <div className="min-h-screen bg-[#070707] text-[#F5F2EA] pb-24">
      {/* Header Banner */}
      <div className="bg-[#0D0C0A] border-b border-[#C9A45C]/20 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-[#A7A29A] uppercase tracking-wider">
            <button onClick={() => navigateTo('/')} className="hover:text-[#F5F2EA]">Home</button>
            <ChevronRight className="w-3 h-3 text-[#8E713D]" />
            <span className="text-[#C9A45C]">Shop Boutique</span>
            {filters.category !== 'all' && (
              <>
                <ChevronRight className="w-3 h-3 text-[#8E713D]" />
                <span className="text-[#F0D9A4] capitalize">{CATEGORY_MAP[filters.category] || filters.category}</span>
              </>
            )}
          </nav>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#11100E] border border-[#C9A45C]/30 mb-3">
              <Sparkles className="w-3 h-3 text-[#C9A45C]" />
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#E3C27A] font-semibold">
                Haute Fragrance Portfolio
              </span>
            </div>
            <h1 className="font-serif-luxury text-3xl sm:text-5xl font-normal text-[#F5F2EA] leading-tight">
              ALL FRAGRANCES & EXTRACTS
            </h1>
            <p className="text-xs sm:text-sm text-[#A7A29A] mt-2 leading-relaxed">
              Explore our complete catalogue of precious aged ouds, rich spicy ambers, and bespoke unisex perfumes curated for royalty and collectors.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Desktop Left Sidebar Filters (3 Cols) */}
          <div className="hidden lg:block lg:col-span-3 sticky top-28 bg-[#0D0C0A] p-6 rounded-xl border border-[#C9A45C]/25 shadow-xl">
            <ProductFilters
              filters={filters}
              onChange={setFilters}
              onReset={resetFilters}
            />
          </div>

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
                  <span>Filters</span>
                </button>

                <div className="text-xs text-[#A7A29A]">
                  Showing <strong className="text-[#E3C27A]">{filteredProducts.length}</strong> of {products.length} fragrances
                </div>
              </div>

              {/* Sort By & View Controls */}
              <div className="flex items-center gap-4 justify-between sm:justify-end">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-[#8E713D] uppercase tracking-wider text-[11px]">SORT BY:</span>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
                    className="bg-[#151310] text-[#F5F2EA] border border-white/10 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#C9A45C] cursor-pointer"
                  >
                    <option value="featured">Featured Curations</option>
                    <option value="rating">Top Rated (Highest Sillage)</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="newest">Latest Atelier Releases</option>
                  </select>
                </div>

                {/* Grid layout density toggle (Desktop) */}
                <div className="hidden sm:flex items-center gap-1 border border-white/10 rounded p-0.5 bg-[#151310]">
                  <button
                    onClick={() => setGridColumns(3)}
                    className={`p-1.5 rounded transition-colors ${gridColumns === 3 ? 'bg-[#C9A45C] text-[#070707]' : 'text-[#A7A29A] hover:text-[#F5F2EA]'}`}
                    aria-label="3 columns grid"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setGridColumns(4)}
                    className={`p-1.5 rounded transition-colors ${gridColumns === 4 ? 'bg-[#C9A45C] text-[#070707]' : 'text-[#A7A29A] hover:text-[#F5F2EA]'}`}
                    aria-label="4 columns grid"
                  >
                    <Grid3X3 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
              <div className="py-24 text-center p-8 rounded-xl bg-[#0D0C0A] border border-white/5 space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#11100E] border border-[#C9A45C]/30 mx-auto flex items-center justify-center text-[#C9A45C]">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h3 className="font-serif-luxury text-2xl text-[#F5F2EA]">No fragrances match your filters</h3>
                <p className="text-xs text-[#A7A29A] max-w-sm mx-auto">
                  Try adjusting your price range, concentration, or selected olfactory family to discover more perfumes.
                </p>
                <button
                  onClick={resetFilters}
                  className="px-6 py-2.5 rounded bg-[#C9A45C] text-[#070707] font-semibold text-xs uppercase tracking-wider"
                >
                  RESET ALL FILTERS
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
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="fixed inset-y-0 left-0 w-4/5 max-w-sm bg-[#0D0C0A] border-r border-[#C9A45C]/30 shadow-2xl z-10 overflow-y-auto"
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
