import React, { useState, useEffect, useRef } from 'react';
import { useShop } from '../../context/ShopContext';
import { Search, X, TrendingUp, History, Sparkles, ArrowRight } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Rating } from '../ui/Rating';

export const SearchModal: React.FC = () => {
  const {
    isSearchOpen,
    setIsSearchOpen,
    products,
    recentSearches,
    addRecentSearch,
    clearRecentSearches,
    formatPrice,
    navigateTo
  } = useShop();

  const [inputVal, setInputVal] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setInputVal('');
    }
  }, [isSearchOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  if (!isSearchOpen) return null;

  const popularSearches = ['Oud For Glory', 'Khamrah Qahwa', 'Extrait de Parfum', 'Amber Gourmand', 'Rose Noire', 'Smoky Leather'];

  const popularCategories = [
    { label: 'Oud Collection', href: '/collections/oud' },
    { label: 'Men Fragrances', href: '/collections/men' },
    { label: 'Women Fragrances', href: '/collections/women' },
    { label: 'Unisex Elixirs', href: '/collections/unisex' }
  ];

  const searchResults = inputVal.trim()
    ? products.filter(p => {
        const q = inputVal.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.fragranceFamily.toLowerCase().includes(q) ||
          p.notes.top.some(n => n.toLowerCase().includes(q)) ||
          p.notes.heart.some(n => n.toLowerCase().includes(q)) ||
          p.notes.base.some(n => n.toLowerCase().includes(q)) ||
          p.description.toLowerCase().includes(q)
        );
      })
    : [];

  const handleProductSelect = (slug: string) => {
    if (inputVal.trim()) {
      addRecentSearch(inputVal.trim());
    }
    setIsSearchOpen(false);
    navigateTo(`/products/${slug}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    addRecentSearch(inputVal.trim());
    setIsSearchOpen(false);
    navigateTo(`/shop?q=${encodeURIComponent(inputVal.trim())}`);
  };

  const handleQuickTagClick = (tag: string) => {
    setInputVal(tag);
    addRecentSearch(tag);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex flex-col justify-start">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsSearchOpen(false)}
          className="fixed inset-0 bg-black/90 backdrop-blur-md"
        />

        {/* Search Bar Container - Frosted Glass */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative z-10 w-full bg-[#0D0C0A]/90 border-b border-[#C9A45C]/25 backdrop-blur-2xl shadow-2xl pt-6 pb-8 px-4 sm:px-6 lg:px-8"
        >
          <div className="max-w-4xl mx-auto">
            {/* Top Close Row */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] uppercase tracking-[3px] text-[#C9A45C] font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#C9A45C]" /> OUD_X Fragrance Search
              </span>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="flex items-center gap-1.5 text-xs text-[#A7A29A] hover:text-[#F5F2EA] transition-colors px-2.5 py-1 rounded-full border border-white/5 hover:border-white/20 bg-[#151310]/60 backdrop-blur-sm"
                aria-label="Close search"
              >
                <span className="text-[10px] uppercase tracking-wider hidden sm:inline">ESC to close</span>
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-[#C9A45C]" />
              <input
                ref={inputRef}
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Search fragrances, notes (e.g. Saffron, Coffee, Oud), or collections..."
                className="w-full bg-[#151310]/80 border border-[#C9A45C]/35 focus:border-[#C9A45C] rounded-full py-3.5 pl-12 pr-12 text-sm sm:text-base text-[#F5F2EA] placeholder:text-[#A7A29A]/60 focus:outline-none focus:ring-1 focus:ring-[#C9A45C] backdrop-blur-md shadow-inner"
              />
              {inputVal && (
                <button
                  type="button"
                  onClick={() => setInputVal('')}
                  className="absolute right-4 text-[#A7A29A] hover:text-[#F5F2EA] p-1"
                  aria-label="Clear query"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </form>

            {/* Quick Navigation / Results Area */}
            <div className="mt-6 max-h-[60vh] overflow-y-auto pr-2 space-y-6">
              {inputVal.trim() ? (
                <div>
                  <div className="flex items-center justify-between mb-3 text-xs uppercase tracking-wider text-[#A7A29A]">
                    <span>Results Found ({searchResults.length})</span>
                    {searchResults.length > 0 && (
                      <button
                        onClick={handleSearchSubmit}
                        className="text-[#C9A45C] hover:underline flex items-center gap-1 text-[11px]"
                      >
                        View all in shop <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {searchResults.length === 0 ? (
                    <div className="py-12 text-center text-neutral-400 space-y-2">
                      <p className="font-serif-luxury text-lg text-[#F5F2EA]">No fragrances found for &quot;{inputVal}&quot;</p>
                      <p className="text-xs text-[#A7A29A]">Try searching for &quot;Oud&quot;, &quot;Amber&quot;, &quot;Rose&quot;, or &quot;Coffee&quot;.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {searchResults.slice(0, 6).map((product) => (
                        <div
                          key={product.id}
                          onClick={() => handleProductSelect(product.slug)}
                          className="flex items-center gap-3 p-3 bg-[#151310]/60 border border-[#C9A45C]/15 hover:border-[#C9A45C]/50 rounded-xl cursor-pointer transition-all backdrop-blur-md group shadow-md"
                        >
                          <img
                            src={product.images?.[0] || product.image}
                            alt={product.name}
                            referrerPolicy="no-referrer"
                            className="w-14 h-16 object-cover rounded-lg bg-black shrink-0 border border-[#C9A45C]/20"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="text-[9px] text-[#C9A45C] font-bold uppercase tracking-[2px] truncate">
                              {product.brand}
                            </div>
                            <h4 className="font-serif-luxury text-sm text-[#F5F2EA] group-hover:text-[#F0D9A4] truncate">
                              {product.name}
                            </h4>
                            <div className="flex items-center justify-between mt-1">
                              <span className="font-cinzel text-xs font-bold text-[#F0D9A4]">
                                {formatPrice(product.price)}
                              </span>
                              <Rating rating={product.rating} showCount={false} size="sm" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                  {/* Recent Searches */}
                  {recentSearches.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-[#A7A29A] font-semibold">
                        <span className="flex items-center gap-1.5">
                          <History className="w-3.5 h-3.5 text-[#C9A45C]" /> Recent
                        </span>
                        <button
                          onClick={clearRecentSearches}
                          className="text-[10px] text-[#8E713D] hover:text-[#C9A45C] lowercase hover:underline"
                        >
                          clear
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {recentSearches.map((s) => (
                          <button
                            key={s}
                            onClick={() => handleQuickTagClick(s)}
                            className="px-3 py-1 rounded-full bg-[#151310]/70 border border-[#C9A45C]/20 hover:border-[#C9A45C] text-[#F5F2EA] text-[11px] transition-colors backdrop-blur-sm"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Popular Searches */}
                  <div className="space-y-3">
                    <div className="text-[11px] uppercase tracking-[2px] text-[#A7A29A] font-semibold flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-[#C9A45C]" /> Trending Scents
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {popularSearches.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => handleQuickTagClick(tag)}
                          className="px-3 py-1 rounded-full bg-[#151310]/70 border border-[#C9A45C]/25 hover:border-[#C9A45C] text-[#F0D9A4] text-[11px] transition-colors backdrop-blur-sm"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Curated Categories */}
                  <div className="space-y-3">
                    <div className="text-[11px] uppercase tracking-[2px] text-[#A7A29A] font-semibold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#C9A45C]" /> Featured Collections
                    </div>
                    <div className="space-y-1.5">
                      {popularCategories.map((cat) => (
                        <button
                          key={cat.label}
                          onClick={() => {
                            setIsSearchOpen(false);
                            navigateTo(cat.href);
                          }}
                          className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-[#151310]/50 border border-[#C9A45C]/15 hover:border-[#C9A45C]/40 text-left text-[11px] text-[#F5F2EA] hover:text-[#F0D9A4] transition-colors backdrop-blur-sm"
                        >
                          <span>{cat.label}</span>
                          <ArrowRight className="w-3 h-3 text-[#C9A45C]" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
