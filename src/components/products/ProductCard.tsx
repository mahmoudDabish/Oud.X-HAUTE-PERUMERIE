import React, { useState } from 'react';
import { Product } from '../../types';
import { useShop } from '../../context/ShopContext';
import { Heart, ShoppingBag, Eye } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Rating } from '../ui/Rating';
import { Button } from '../ui/Button';

export interface ProductCardProps {
  product: Product;
  image?: string;
  name?: string;
  brand?: string;
  category?: string;
  size?: string;
  price?: number;
  compareAtPrice?: number;
  rating?: number;
  reviews?: number;
  badge?: 'BEST SELLER' | 'NEW' | 'LIMITED' | 'SALE';
  isFavorite?: boolean;
  onFavorite?: () => void;
  onAddToCart?: () => void;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  image,
  name,
  brand,
  category,
  size,
  price,
  compareAtPrice,
  rating,
  reviews,
  badge,
  isFavorite: controlledIsFavorite,
  onFavorite,
  onAddToCart,
  className = ''
}) => {
  const { isInWishlist, toggleWishlist, addToCart, formatPrice, navigateTo, setQuickViewProduct } = useShop();
  const [isHovered, setIsHovered] = useState(false);
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(0);

  const displayImage = image || product.images[0];
  const displayName = name || product.name;
  const displayBrand = brand || product.brand;
  const displayCategory = category || product.category;
  
  const currentSizeObj = product.availableSizes?.[selectedSizeIndex];
  const displaySize = size || currentSizeObj?.size || product.size;
  const displayPrice = price !== undefined ? price : (currentSizeObj?.price || product.price);
  const displayComparePrice = compareAtPrice !== undefined ? compareAtPrice : (currentSizeObj?.compareAtPrice || product.compareAtPrice);
  
  const displayRating = rating !== undefined ? rating : product.rating;
  const displayReviews = reviews !== undefined ? reviews : product.reviewCount;
  const displayBadge = badge || product.badge;

  const isFav = controlledIsFavorite !== undefined ? controlledIsFavorite : isInWishlist(product.id);

  const handleCardClick = (e: React.MouseEvent) => {
    // If clicking a button or size selector, prevent navigation
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    navigateTo(`/products/${product.slug}`);
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onFavorite) {
      onFavorite();
    } else {
      toggleWishlist(product.id);
    }
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart();
    } else {
      addToCart(product, displaySize, 1, true);
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuickViewProduct(product);
  };

  return (
    <div
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative flex flex-col bg-[#151310]/60 backdrop-blur-md border border-[#C9A45C]/15 hover:border-[#C9A45C]/50 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-[#C9A45C]/10 cursor-pointer ${className}`}
    >
      {/* Top Media Area */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#070707]">
        {/* Product Image */}
        <img
          src={displayImage}
          alt={displayName}
          referrerPolicy="no-referrer"
          loading="lazy"
          className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Soft Frosted Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#151310]/90 via-transparent to-black/20 pointer-events-none" />

        {/* Top Badges & Actions Bar */}
        <div className="absolute top-3 inset-x-3 flex items-start justify-between gap-2 pointer-events-none">
          {displayBadge ? (
            <Badge variant={displayBadge} />
          ) : (
            <div />
          )}

          <div className="flex flex-col gap-1.5 pointer-events-auto">
            {/* Wishlist Button */}
            <button
              onClick={handleWishlistClick}
              className={`p-2 rounded-full backdrop-blur-md transition-all duration-200 ${
                isFav
                  ? 'bg-[#C9A45C] text-[#070707] shadow-md shadow-[#C9A45C]/30'
                  : 'bg-[#070707]/75 text-[#A7A29A] hover:text-[#F5F2EA] hover:bg-[#070707] border border-[#C9A45C]/20'
              }`}
              aria-label={isFav ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
            </button>

            {/* Quick View Button */}
            <button
              onClick={handleQuickView}
              className="p-2 rounded-full bg-[#070707]/75 text-[#A7A29A] hover:text-[#F5F2EA] hover:bg-[#070707] border border-[#C9A45C]/20 backdrop-blur-md transition-all duration-200 opacity-0 group-hover:opacity-100 hidden sm:flex items-center justify-center"
              aria-label="Quick view product"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Quick Add Overlay on Desktop Hover */}
        <div className={`absolute bottom-3 inset-x-3 hidden sm:flex transition-all duration-300 ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0 pointer-events-none'}`}>
          <Button
            onClick={handleQuickAdd}
            variant="primary"
            size="sm"
            fullWidth
            leftIcon={<ShoppingBag className="w-3.5 h-3.5" />}
            className="shadow-xl shadow-black/80 text-[10px] tracking-[2px] font-bold"
          >
            QUICK ADD
          </Button>
        </div>
      </div>

      {/* Product Content Details */}
      <div className="flex flex-col flex-1 p-4 bg-[#151310]/40 backdrop-blur-sm">
        {/* Brand & Category */}
        <div className="flex items-center justify-between text-[10px] uppercase tracking-[2px] text-[#A7A29A] mb-1">
          <span className="text-[#C9A45C] font-semibold">{displayBrand}</span>
          <span className="capitalize text-neutral-400">{displayCategory}</span>
        </div>

        {/* Title */}
        <h3 className="font-serif-luxury text-base sm:text-lg font-medium text-[#F5F2EA] group-hover:text-[#F0D9A4] transition-colors line-clamp-1 mb-1">
          {displayName}
        </h3>

        {/* Subtitle / Key Scent Note */}
        {product.subtitle && (
          <p className="text-[11px] text-[#8E713D] truncate mb-2">
            {product.subtitle}
          </p>
        )}

        {/* Rating */}
        <div className="mb-3">
          <Rating rating={displayRating} reviewCount={displayReviews} />
        </div>

        {/* Available Size Pills if multiple */}
        {product.availableSizes && product.availableSizes.length > 1 && (
          <div className="flex items-center gap-1.5 mb-3 flex-wrap">
            {product.availableSizes.map((s, idx) => (
              <button
                key={s.size}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedSizeIndex(idx);
                }}
                className={`text-[9px] px-2 py-0.5 rounded-full border transition-colors ${
                  selectedSizeIndex === idx
                    ? 'border-[#C9A45C] bg-[#C9A45C]/15 text-[#F0D9A4] font-semibold'
                    : 'border-[#C9A45C]/20 text-[#A7A29A] hover:border-[#C9A45C]/40 bg-[#070707]/50'
                }`}
              >
                {s.size.split('/')[0].trim()}
              </button>
            ))}
          </div>
        )}

        {/* Price and Mobile Add Button */}
        <div className="mt-auto pt-2.5 border-t border-[#C9A45C]/15 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-cinzel text-sm sm:text-base font-bold text-[#E3C27A]">
              {formatPrice(displayPrice)}
            </span>
            {displayComparePrice && displayComparePrice > displayPrice && (
              <span className="text-xs text-[#A7A29A] line-through">
                {formatPrice(displayComparePrice)}
              </span>
            )}
          </div>

          {/* Mobile Cart Button */}
          <button
            onClick={handleQuickAdd}
            className="sm:hidden p-2 rounded-full bg-[#C9A45C] text-[#070707] active:bg-[#E3C27A]"
            aria-label="Add to cart"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
