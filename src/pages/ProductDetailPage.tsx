import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { ProductCard } from '../components/products/ProductCard';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import {
  Heart,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  Truck,
  RotateCcw,
  ChevronRight,
  ChevronDown,
  Clock,
  Wind,
  Droplets,
  Layers,
  Award
} from 'lucide-react';

interface ProductDetailPageProps {
  slug: string;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ slug }) => {
  const {
    products,
    getProductBySlug,
    addToCart,
    isInWishlist,
    toggleWishlist,
    formatPrice,
    navigateTo,
    showToast
  } = useShop();

  const product = getProductBySlug(slug) || products[0];

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeAccordion, setActiveAccordion] = useState<'details' | 'shipping' | 'usage' | null>('details');

  if (!product) {
    return (
      <div className="min-h-screen bg-[#070707] text-[#F5F2EA] flex flex-col items-center justify-center p-8 text-center space-y-4">
        <h2 className="font-serif-luxury text-2xl text-[#F5F2EA]">Fragrance Not Found</h2>
        <p className="text-xs text-[#A7A29A]">The requested scent may have been vaulted or moved.</p>
        <button
          onClick={() => navigateTo('/shop')}
          className="px-6 py-3 rounded-full bg-[#C9A45C] text-[#070707] font-bold text-xs uppercase tracking-widest hover:bg-[#E3C27A] transition-colors"
        >
          Return to Boutique
        </button>
      </div>
    );
  }

  const productImages = product.images && product.images.length > 0 ? product.images : [product.image];
  const currentSizeObj = product.availableSizes?.[selectedSizeIndex] || {
    size: product.size,
    price: product.price,
    compareAtPrice: product.compareAtPrice
  };

  const CATEGORY_MAP: Record<string, string> = {
    'all': 'All Collections',
    '11111111-1111-1111-1111-111111111111': 'Perfumes',
    '22222222-2222-2222-2222-222222222222': 'Body Splash',
    '33333333-3333-3333-3333-333333333333': 'Oud',
    '44444444-4444-4444-4444-444444444444': 'Body Care',
    '55555555-5555-5555-5555-555555555555': 'Gift Sets'
  };
  
  const displayCategory = CATEGORY_MAP[product.category] || product.category;

  const isFav = isInWishlist(product.id);

  const relatedProducts = products
    .filter(p => p.id !== product.id && (p.category === product.category || p.fragranceFamily === product.fragranceFamily))
    .slice(0, 4);

  const handleAddToCart = () => {
    addToCart(product, currentSizeObj.size, quantity, true);
  };

  const handleBuyNow = () => {
    addToCart(product, currentSizeObj.size, quantity, false);
    navigateTo('/checkout');
  };

  return (
    <div className="min-h-screen bg-[#070707] text-[#F5F2EA] pb-24">
      {/* Breadcrumb Bar */}
      <div className="bg-[#0D0C0A] border-b border-white/5 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-xs text-[#A7A29A] uppercase tracking-wider flex-wrap">
            <button onClick={() => navigateTo('/')} className="hover:text-[#F5F2EA]">Home</button>
            <ChevronRight className="w-3 h-3 text-[#8E713D]" />
            <button onClick={() => navigateTo('/shop')} className="hover:text-[#F5F2EA]">Shop</button>
            <ChevronRight className="w-3 h-3 text-[#8E713D]" />
            <button onClick={() => navigateTo(`/collections/${product.categoryId || product.category}`)} className="hover:text-[#F5F2EA] capitalize">
              {displayCategory}
            </button>
            <ChevronRight className="w-3 h-3 text-[#8E713D]" />
            <span className="text-[#C9A45C] font-serif truncate max-w-xs">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Main Product Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* Left Media Gallery (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Primary Large Visual Display */}
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-[#C9A45C]/35 bg-[#0D0C0A] shadow-2xl">
              <img
                src={productImages[activeImageIndex] || productImages[0]}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center transition-all duration-500"
              />

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.badge && <Badge variant={product.badge} />}
                <span className="px-2.5 py-1 rounded bg-[#070707]/90 border border-white/10 text-[10px] uppercase tracking-wider text-[#A7A29A]">
                  {product.concentration}
                </span>
              </div>

              {/* Wishlist Button Overlay */}
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md transition-all ${
                  isFav
                    ? 'bg-[#C9A45C] text-[#070707] shadow-lg shadow-[#C9A45C]/30'
                    : 'bg-black/60 text-[#A7A29A] hover:text-[#F5F2EA] border border-white/10'
                }`}
                aria-label="Wishlist"
              >
                <Heart className={`w-5 h-5 ${isFav ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Thumbnail Selectors */}
            {productImages.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                {productImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative aspect-square rounded-lg overflow-hidden border transition-all ${
                      activeImageIndex === idx
                        ? 'border-[#C9A45C] ring-2 ring-[#C9A45C]/40'
                        : 'border-white/10 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Perfume Narrative / Story Block */}
            <div className="p-6 rounded-xl bg-[#0D0C0A] border border-[#C9A45C]/20 space-y-2 mt-6">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#8E713D] font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#C9A45C]" /> The Atelier Story
              </span>
              <h3 className="font-serif-luxury text-xl text-[#F5F2EA]">The Olfactory Inspiration</h3>
              <p className="text-xs sm:text-sm text-[#A7A29A] leading-relaxed italic font-serif">
                &quot;{product.story}&quot;
              </p>
            </div>
          </div>

          {/* Right Product Information & Controls (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Header: Brand, Title, Rating */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs uppercase tracking-widest text-[#C9A45C] font-semibold">
                <span>{product.brand}</span>
                <span className="text-[#8E713D]">{product.fragranceFamily}</span>
              </div>

              <h1 className="font-serif-luxury text-3xl sm:text-4xl font-normal text-[#F5F2EA] leading-tight flex items-center gap-3 flex-wrap">
                {product.name}
                {product.stock <= 0 && (
                  <span className="px-3 py-1 text-xs font-bold tracking-widest text-[#A7A29A] border border-white/20 rounded-full bg-[#151310]/80">
                    OUT OF STOCK
                  </span>
                )}
              </h1>

              {product.subtitle && (
                <p className="text-xs sm:text-sm text-[#E3C27A] font-medium">
                  {product.subtitle}
                </p>
              )}

              {/* Rating & Review counter */}
              <div className="flex items-center gap-3 pt-1">
                <span className="text-xs text-[#A7A29A] italic">No reviews yet.</span>
                <span className="text-neutral-500">•</span>
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> 100% Certified Authentic
                </span>
              </div>
            </div>

            {/* Pricing Area */}
            <div className="p-4 rounded-lg bg-[#0D0C0A] border border-white/10 flex items-baseline justify-between">
              <div className="flex items-baseline gap-3">
                <span className="font-cinzel text-2xl sm:text-3xl font-bold text-[#E3C27A]">
                  {formatPrice(currentSizeObj.price)}
                </span>
                {currentSizeObj.compareAtPrice && currentSizeObj.compareAtPrice > currentSizeObj.price && (
                  <span className="text-sm text-[#A7A29A] line-through">
                    {formatPrice(currentSizeObj.compareAtPrice)}
                  </span>
                )}
              </div>

              {currentSizeObj.compareAtPrice && (
                <span className="text-xs px-2 py-0.5 rounded bg-red-950/40 text-red-300 border border-red-800/40 font-semibold">
                  Save {formatPrice(currentSizeObj.compareAtPrice - currentSizeObj.price)}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-[#A7A29A] leading-relaxed">
              {product.description}
            </p>

            {/* Size Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold uppercase tracking-wider text-[#A7A29A]">
                  Select Flacon Size: <strong className="text-[#F5F2EA]">{currentSizeObj.size}</strong>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {product.availableSizes.map((s, idx) => (
                  <button
                    key={s.size}
                    onClick={() => setSelectedSizeIndex(idx)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      selectedSizeIndex === idx
                        ? 'border-[#C9A45C] bg-[#C9A45C]/15 text-[#E3C27A] shadow-sm shadow-[#C9A45C]/10'
                        : 'border-white/10 bg-[#0D0C0A] text-[#A7A29A] hover:border-white/20'
                    }`}
                  >
                    <div className="text-xs font-semibold">{s.size}</div>
                    <div className="font-cinzel text-xs text-[#E3C27A] mt-1">{formatPrice(s.price)}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Controls & Add to Bag CTAs */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                {/* Quantity */}
                <div className="flex items-center border border-white/20 rounded-md bg-[#0D0C0A] p-1">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-8 h-8 flex items-center justify-center text-[#A7A29A] hover:text-[#F5F2EA] font-bold"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-xs font-semibold text-[#F5F2EA]">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => q + 1)}
                    disabled={quantity >= product.stock}
                    className="w-8 h-8 flex items-center justify-center text-[#A7A29A] hover:text-[#F5F2EA] font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                </div>

                {/* Add to Bag */}
                <Button
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  variant={product.stock <= 0 ? "secondary" : "primary"}
                  size="lg"
                  fullWidth
                  leftIcon={product.stock > 0 ? <ShoppingBag className="w-4 h-4" /> : undefined}
                >
                  {product.stock <= 0 ? 'OUT OF STOCK' : 'ADD TO SHOPPING BAG'}
                </Button>
              </div>

              {/* Buy Now Direct Button */}
              {product.stock > 0 && (
                <Button
                  onClick={handleBuyNow}
                  variant="secondary"
                  size="md"
                  fullWidth
                >
                  BUY NOW WITH 1-CLICK CHECKOUT
                </Button>
              )}
            </div>

            {/* Olfactory Notes Pyramid */}
            <div className="p-5 rounded-xl bg-[#0D0C0A] border border-[#C9A45C]/30 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <h3 className="font-cinzel text-xs font-bold uppercase tracking-widest text-[#E3C27A] flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-[#C9A45C]" /> Fragrance Notes Architecture
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-[#8E713D] block">
                    TOP NOTES (First 15–30 Mins)
                  </span>
                  <span className="text-[#F5F2EA] font-medium">{product.notes.top.join(' • ')}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-[#8E713D] block">
                    HEART NOTES (2–6 Hours)
                  </span>
                  <span className="text-[#F5F2EA] font-medium">{product.notes.heart.join(' • ')}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-[#8E713D] block">
                    BASE NOTES (6–18+ Hours Sillage)
                  </span>
                  <span className="text-[#F5F2EA] font-medium">{product.notes.base.join(' • ')}</span>
                </div>
              </div>
            </div>

            {/* Accordions: Details, Shipping, Usage */}
            <div className="border-t border-white/10 pt-4 space-y-2">
              
              {/* Accordion 1: Details */}
              <div className="border border-white/5 rounded-lg bg-[#0D0C0A] overflow-hidden">
                <button
                  onClick={() => setActiveAccordion(activeAccordion === 'details' ? null : 'details')}
                  className="w-full p-4 flex items-center justify-between text-left text-xs font-semibold uppercase tracking-wider text-[#F5F2EA]"
                >
                  <span className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#C9A45C]" /> Olfactory Performance & Specifications
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${activeAccordion === 'details' ? 'rotate-180 text-[#C9A45C]' : ''}`} />
                </button>
                {activeAccordion === 'details' && (
                  <div className="p-4 pt-0 text-xs text-[#A7A29A] space-y-2 border-t border-white/5 mt-2">
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <div><strong className="text-[#F5F2EA]">Concentration:</strong> {product.concentration}</div>
                      <div><strong className="text-[#F5F2EA]">Longevity:</strong> {product.longevity}</div>
                      <div><strong className="text-[#F5F2EA]">Sillage:</strong> {product.sillage}</div>
                      <div><strong className="text-[#F5F2EA]">Gender:</strong> {product.gender.toUpperCase()}</div>
                      <div><strong className="text-[#F5F2EA]">Best Season:</strong> {product.season.join(', ')}</div>
                      <div><strong className="text-[#F5F2EA]">Batch:</strong> 2026 Vintage Cask</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Accordion 2: Shipping & Returns */}
              <div className="border border-white/5 rounded-lg bg-[#0D0C0A] overflow-hidden">
                <button
                  onClick={() => setActiveAccordion(activeAccordion === 'shipping' ? null : 'shipping')}
                  className="w-full p-4 flex items-center justify-between text-left text-xs font-semibold uppercase tracking-wider text-[#F5F2EA]"
                >
                  <span className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#C9A45C]" /> Shipping & VIP White-Glove Delivery
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${activeAccordion === 'shipping' ? 'rotate-180 text-[#C9A45C]' : ''}`} />
                </button>
                {activeAccordion === 'shipping' && (
                  <div className="p-4 pt-0 text-xs text-[#A7A29A] space-y-2 border-t border-white/5 mt-2">
                    <p>• Complimentary VIP Delivery across Egypt on all orders above 2,500 EGP.</p>
                    <p>• Express 24h delivery for Greater Cairo and Alexandria.</p>
                    <p>• 14-day unopened satisfaction guarantee with full exchange privilege.</p>
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>

        {/* You May Also Like Related Section */}
        {relatedProducts.length > 0 && (
          <div className="pt-24 border-t border-[#C9A45C]/20 mt-20">
            <div className="flex items-end justify-between mb-8">
              <div>
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#8E713D] font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#C9A45C]" /> Scent Pairing
                </span>
                <h2 className="font-serif-luxury text-2xl sm:text-4xl text-[#F5F2EA]">
                  YOU MAY ALSO LIKE
                </h2>
              </div>
              <button
                onClick={() => navigateTo('/shop')}
                className="text-xs uppercase tracking-widest text-[#E3C27A] hover:underline font-semibold"
              >
                VIEW FULL BOUTIQUE →
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
