import React from 'react';
import { useTranslation } from 'react-i18next';
import { useShop } from '../context/ShopContext';
import { ProductCard } from '../components/products/ProductCard';
import { Button } from '../components/ui/Button';
import { Heart, Sparkles, ChevronRight, ShoppingBag } from 'lucide-react';

export const WishlistPage: React.FC = () => {
  const { t } = useTranslation();
  const { wishlist, products, navigateTo, addToCart, clearWishlist } = useShop();

  const wishlistProducts = products.filter(p => wishlist.includes(p.id));

  const handleAddAllToBag = () => {
    wishlistProducts.forEach(product => {
      addToCart(product, product.availableSizes[0]?.size || product.size, 1, false);
    });
    navigateTo('/cart');
  };

  return (
    <div className="min-h-screen bg-[#070707] text-[#F5F2EA] pb-24">
      {/* Breadcrumb */}
      <div className="bg-[#0D0C0A] border-b border-white/5 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-xs text-[#A7A29A] uppercase tracking-wider">
            <button onClick={() => navigateTo('/')} className="hover:text-[#F5F2EA]">{t('nav.home', 'Home')}</button>
            <ChevronRight className="w-3 h-3 text-[#8E713D] rtl-flip" />
            <span className="text-[#C9A45C]">{t('wishlist.breadcrumb', 'Private Wishlist')}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#8E713D] font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A45C]" /> {t('wishlist.badge', 'Saved Olfactory Gems')}
            </span>
            <h1 className="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl font-normal text-[#F5F2EA]">
              {t('wishlist.title', { count: wishlistProducts.length, defaultValue: `MY PRIVATE WISHLIST (${wishlistProducts.length})` })}
            </h1>
          </div>

          {wishlistProducts.length > 0 && (
            <div className="flex items-center gap-3">
              <Button
                onClick={handleAddAllToBag}
                variant="primary"
                size="md"
                leftIcon={<ShoppingBag className="w-4 h-4" />}
              >
                {t('wishlist.moveAll', 'MOVE ALL TO BAG')}
              </Button>
              <Button
                onClick={clearWishlist}
                variant="ghost"
                size="sm"
                className="text-neutral-400 hover:text-red-400"
              >
                {t('wishlist.clear', 'Clear')}
              </Button>
            </div>
          )}
        </div>

        {wishlistProducts.length === 0 ? (
          <div className="py-24 text-center rounded-xl bg-[#0D0C0A] border border-white/5 max-w-xl mx-auto p-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#11100E] border border-[#C9A45C]/30 mx-auto flex items-center justify-center text-[#C9A45C]">
              <Heart className="w-8 h-8" />
            </div>
            <h2 className="font-serif-luxury text-2xl text-[#F5F2EA]">{t('wishlist.emptyTitle', 'Your wishlist is currently empty')}</h2>
            <p className="text-xs sm:text-sm text-[#A7A29A] max-w-sm mx-auto">
              {t('wishlist.emptyDesc', 'Save your favorite extrait concentrations and oud elixirs to revisit anytime.')}
            </p>
            <Button
              onClick={() => navigateTo('/shop')}
              variant="primary"
              size="lg"
            >
              {t('wishlist.explore', 'EXPLORE FRAGRANCES')}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {wishlistProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
