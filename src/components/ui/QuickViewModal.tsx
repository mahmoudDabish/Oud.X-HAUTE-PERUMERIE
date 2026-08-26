import React, { useState } from 'react';
import { useShop } from '../../context/ShopContext';
import { X, Heart, ShoppingBag, Check, ShieldCheck, Sparkles, Clock, Wind } from 'lucide-react';
import { Button } from './Button';
import { Badge } from './Badge';
import { Rating } from './Rating';
import { AnimatePresence, motion } from 'motion/react';

export const QuickViewModal: React.FC = () => {
  const {
    quickViewProduct,
    setQuickViewProduct,
    addToCart,
    isInWishlist,
    toggleWishlist,
    formatPrice,
    navigateTo
  } = useShop();

  const product = quickViewProduct;
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!product) return null;

  const productImages = product.images && product.images.length > 0 ? product.images : [product.image];

  const currentSizeObj = product.availableSizes?.[selectedSizeIndex] || {
    size: product.size,
    price: product.price,
    compareAtPrice: product.compareAtPrice
  };

  const isFav = isInWishlist(product.id);

  const handleClose = () => {
    setQuickViewProduct(null);
    setSelectedSizeIndex(0);
    setQuantity(1);
    setActiveImageIndex(0);
  };

  const handleAddToCart = () => {
    addToCart(product, currentSizeObj.size, quantity, true);
    handleClose();
  };

  const handleGoToDetails = () => {
    handleClose();
    navigateTo(`/products/${product.slug}`);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window with Frosted Glass */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-4xl bg-[#151310]/85 border border-[#C9A45C]/30 rounded-2xl backdrop-blur-2xl shadow-2xl overflow-hidden z-10 my-8 max-h-[90vh] flex flex-col md:flex-row"
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 text-[#A7A29A] hover:text-[#F5F2EA] border border-[#C9A45C]/20 backdrop-blur-md transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Left Media Gallery */}
          <div className="w-full md:w-1/2 p-6 flex flex-col justify-between bg-[#0D0C0A]/60 border-b md:border-b-0 md:border-r border-[#C9A45C]/20 backdrop-blur-md">
            <div className="relative aspect-[4/5] rounded-xl overflow-hidden border border-[#C9A45C]/20 bg-black">
              <img
                src={productImages[activeImageIndex] || productImages[0]}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center"
              />
              {product.badge && (
                <div className="absolute top-3 left-3">
                  <Badge variant={product.badge} />
                </div>
              )}
            </div>

            {/* Thumbnail selector */}
            {productImages.length > 1 && (
              <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1">
                {productImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-14 h-16 rounded-lg border overflow-hidden shrink-0 transition-all ${
                      activeImageIndex === idx
                        ? 'border-[#C9A45C] ring-1 ring-[#C9A45C]'
                        : 'border-white/10 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Content */}
          <div className="w-full md:w-1/2 p-6 sm:p-8 overflow-y-auto max-h-[80vh] flex flex-col justify-between">
            <div>
              {/* Brand and Category */}
              <div className="flex items-center justify-between text-xs tracking-[2px] uppercase text-[#C9A45C] font-semibold mb-2">
                <span>{product.brand}</span>
                <span className="text-[#A7A29A] font-normal">{product.concentration}</span>
              </div>

              {/* Title */}
              <h2 className="font-serif-luxury text-2xl sm:text-3xl font-medium text-[#F5F2EA] mb-2 leading-tight">
                {product.name}
              </h2>

              {/* Subtitle */}
              {product.subtitle && (
                <p className="text-xs text-[#8E713D] mb-3 font-medium">
                  {product.subtitle}
                </p>
              )}

              {/* Rating */}
              <div className="mb-4">
                <Rating rating={product.rating} reviewCount={product.reviewCount} />
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-5">
                <span className="font-cinzel text-2xl font-bold text-[#F0D9A4]">
                  {formatPrice(currentSizeObj.price)}
                </span>
                {currentSizeObj.compareAtPrice && currentSizeObj.compareAtPrice > currentSizeObj.price && (
                  <span className="text-sm text-[#A7A29A] line-through">
                    {formatPrice(currentSizeObj.compareAtPrice)}
                  </span>
                )}
                {currentSizeObj.compareAtPrice && (
                  <span className="text-xs text-emerald-400 font-medium">
                    Save {formatPrice(currentSizeObj.compareAtPrice - currentSizeObj.price)}
                  </span>
                )}
              </div>

              {/* Short description */}
              <p className="text-xs sm:text-sm text-[#A7A29A] leading-relaxed mb-5 line-clamp-3">
                {product.description}
              </p>

              {/* Fragrance Notes Highlights with Frosted Glass */}
              <div className="p-3.5 bg-[#151310]/70 rounded-xl border border-[#C9A45C]/20 mb-5 backdrop-blur-md">
                <div className="text-[11px] font-semibold uppercase tracking-[2px] text-[#C9A45C] mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Key Olfactory Pyramid
                </div>
                <div className="grid grid-cols-3 gap-2 text-[10px]">
                  <div>
                    <span className="text-neutral-400 block font-medium">TOP:</span>
                    <span className="text-[#F5F2EA] line-clamp-1">{product.notes.top.join(', ')}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block font-medium">HEART:</span>
                    <span className="text-[#F5F2EA] line-clamp-1">{product.notes.heart.join(', ')}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block font-medium">BASE:</span>
                    <span className="text-[#F5F2EA] line-clamp-1">{product.notes.base.join(', ')}</span>
                  </div>
                </div>
              </div>

              {/* Size Selector */}
              <div className="mb-5">
                <label className="block text-xs font-semibold uppercase tracking-[2px] text-[#A7A29A] mb-2">
                  Select Size: <span className="text-[#F5F2EA]">{currentSizeObj.size}</span>
                </label>
                <div className="flex gap-2">
                  {product.availableSizes.map((s, idx) => (
                    <button
                      key={s.size}
                      onClick={() => setSelectedSizeIndex(idx)}
                      className={`flex-1 py-2 px-3 rounded-xl border text-xs text-center transition-all ${
                        selectedSizeIndex === idx
                          ? 'border-[#C9A45C] bg-[#C9A45C]/20 text-[#F0D9A4] font-semibold backdrop-blur-sm'
                          : 'border-white/10 text-[#A7A29A] hover:border-[#C9A45C]/30 bg-[#151310]/40'
                      }`}
                    >
                      <div>{s.size}</div>
                      <div className="text-[10px] text-neutral-400 font-cinzel mt-0.5">{formatPrice(s.price)}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="flex items-center gap-4 mb-6">
                <label className="text-xs font-semibold uppercase tracking-[2px] text-[#A7A29A]">
                  Quantity:
                </label>
                <div className="flex items-center border border-[#C9A45C]/25 rounded-full bg-[#0D0C0A]/80 px-1">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="px-3 py-1.5 text-[#A7A29A] hover:text-[#F5F2EA] transition-colors"
                  >
                    -
                  </button>
                  <span className="px-3 text-xs font-semibold text-[#F5F2EA]">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => q + 1)}
                    className="px-3 py-1.5 text-[#A7A29A] hover:text-[#F5F2EA] transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2.5 pt-4 border-t border-[#C9A45C]/15">
              <div className="flex gap-3">
                <Button
                  onClick={handleAddToCart}
                  variant="primary"
                  fullWidth
                  leftIcon={<ShoppingBag className="w-4 h-4" />}
                >
                  ADD TO SHOPPING BAG
                </Button>
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`p-3 rounded-full border transition-colors ${
                    isFav
                      ? 'border-[#C9A45C] bg-[#C9A45C]/20 text-[#C9A45C]'
                      : 'border-[#C9A45C]/20 text-[#A7A29A] hover:text-[#F5F2EA] hover:border-[#C9A45C]/40 bg-[#151310]/60'
                  }`}
                  aria-label="Save to wishlist"
                >
                  <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                </button>
              </div>

              <button
                onClick={handleGoToDetails}
                className="text-center text-xs text-[#C9A45C] hover:text-[#F0D9A4] underline tracking-[2px] uppercase pt-1"
              >
                View Full Product Narrative & Reviews →
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
