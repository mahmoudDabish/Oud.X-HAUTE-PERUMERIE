import React from 'react';
import { useTranslation } from 'react-i18next';
import { useShop } from '../../context/ShopContext';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/Button';
import { AnimatePresence, motion } from 'motion/react';
import { getLocalizedProductName } from '../../i18n/presentation';

export const CartDrawer: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const {
    cart,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    removeFromCart,
    updateQuantity,
    subtotal,
    formatPrice,
    navigateTo
  } = useShop();

  if (!isCartDrawerOpen) return null;

  const hasInsufficientStock = cart.some(item => item.quantity > item.product.stock);

  const handleCheckout = () => {
    setIsCartDrawerOpen(false);
    navigateTo('/checkout');
  };

  const handleViewCart = () => {
    setIsCartDrawerOpen(false);
    navigateTo('/cart');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsCartDrawerOpen(false)}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Drawer panel with Frosted Glass */}
        <motion.div
          data-lenis-prevent
          initial={{ x: isRtl ? '-100%' : '100%' }}
          animate={{ x: 0 }}
          exit={{ x: isRtl ? '-100%' : '100%' }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={`fixed inset-y-0 ${isRtl ? 'left-0 border-r' : 'right-0 border-l'} w-full max-w-md bg-[#0D0C0A]/90 border-[#C9A45C]/25 backdrop-blur-2xl shadow-2xl flex flex-col justify-between`}
        >
          {/* Header */}
          <div className="p-5 border-b border-[#C9A45C]/15 flex items-center justify-between bg-[#151310]/80 backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#151310] border border-[#C9A45C]/30 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-[#C9A45C]" />
              </div>
              <h2 className="font-serif-luxury text-xl font-medium tracking-wide text-[#F5F2EA]">
                {t('cart.title', { count: cart.reduce((a, b) => a + b.quantity, 0) })}
              </h2>
            </div>
            <button
              onClick={() => setIsCartDrawerOpen(false)}
              className="p-2 text-[#A7A29A] hover:text-[#F5F2EA] rounded-full hover:bg-white/5 transition-colors border border-transparent hover:border-white/10"
              aria-label={t('common.close')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>


          {/* Cart Items List */}
          <div data-lenis-prevent className="flex-1 overflow-y-auto overscroll-contain p-5 space-y-3 custom-scrollbar touch-pan-y">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#151310]/80 border border-[#C9A45C]/25 flex items-center justify-center text-[#C9A45C] backdrop-blur-md">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif-luxury text-xl text-[#F5F2EA]">{t('cart.emptyTitle')}</h3>
                  <p className="text-xs text-[#A7A29A] max-w-xs leading-relaxed">
                    {t('cart.emptyDesc')}
                  </p>
                </div>
                <Button
                  onClick={() => {
                    setIsCartDrawerOpen(false);
                    navigateTo('/shop');
                  }}
                  variant="secondary"
                  size="sm"
                  className="tracking-[2px]"
                >
                  {t('cart.exploreFragrances')}
                </Button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={`${item.product.id}-${item.selectedSize}`}
                  className="flex gap-4 p-3.5 bg-[#151310]/60 border border-[#C9A45C]/15 rounded-xl hover:border-[#C9A45C]/35 backdrop-blur-md transition-all shadow-md"
                >
                  {/* Thumbnail */}
                  <div
                    onClick={() => {
                      setIsCartDrawerOpen(false);
                      navigateTo(`/products/${item.product.slug}`);
                    }}
                    className="w-20 h-24 rounded-lg overflow-hidden bg-black shrink-0 border border-[#C9A45C]/20 cursor-pointer"
                  >
                    <img
                      src={item.product?.images?.[0] || (item.product as any)?.image || '/images/hero_oud_bottle_1787700482747.jpg'}
                      alt={getLocalizedProductName(item.product, item.product?.name || 'Fragrance')}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="text-[9px] text-[#C9A45C] font-bold uppercase tracking-[2px]">
                        {item.product.brand}
                      </div>
                      <h4
                        onClick={() => {
                          setIsCartDrawerOpen(false);
                          navigateTo(`/products/${item.product.slug}`);
                        }}
                        className="font-serif-luxury text-sm text-[#F5F2EA] truncate cursor-pointer hover:text-[#F0D9A4] transition-colors"
                      >
                        {getLocalizedProductName(item.product, item.product.name)}
                      </h4>
                      <p className="text-[10px] text-[#A7A29A] mt-0.5">
                        {t('product.selectSize')}: <span className="text-[#F5F2EA]">{item.selectedSize}</span>
                      </p>
                      {item.quantity > item.product.stock && (
                        <p className="text-[10px] text-red-400 mt-0.5 font-bold">
                          {item.product.stock === 0 ? t('products.outOfStock') : t('product.unitsRemaining', { count: item.product.stock })}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#C9A45C]/15">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-[#C9A45C]/25 rounded-full bg-[#070707]/80 px-1">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.selectedSize, item.quantity - 1)}
                          className="px-2 py-0.5 text-xs text-[#A7A29A] hover:text-[#F5F2EA]"
                        >
                          -
                        </button>
                        <span className="px-2 text-xs font-semibold text-[#F5F2EA]">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.selectedSize, item.quantity + 1)}
                          className="px-2 py-0.5 text-xs text-[#A7A29A] hover:text-[#F5F2EA]"
                        >
                          +
                        </button>
                      </div>

                      {/* Item Total Price */}
                      <div className="text-right rtl:text-left">
                        <span className="font-cinzel text-xs font-bold text-[#F0D9A4]">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => removeFromCart(item.product.id, item.selectedSize)}
                        className="text-[#A7A29A] hover:text-red-400 p-1.5 transition-colors"
                        aria-label={t('common.remove')}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Summary */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-[#C9A45C]/15 bg-[#151310]/80 backdrop-blur-md space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-[#A7A29A]">
                  <span>{t('cart.subtotal')}</span>
                  <span className="font-cinzel font-semibold text-[#F5F2EA]">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold pt-2 border-t border-[#C9A45C]/15 text-[#F5F2EA]">
                  <span>{t('cart.total')}</span>
                  <span className="font-cinzel text-base text-[#F0D9A4]">
                    {formatPrice(subtotal)}
                  </span>
                </div>
              </div>

              {/* CTAs */}
              <div className="space-y-2.5">
                <Button
                  onClick={handleCheckout}
                  variant="primary"
                  fullWidth
                  disabled={hasInsufficientStock}
                  rightIcon={<ArrowRight className="w-4 h-4 rtl-flip" />}
                >
                  {hasInsufficientStock ? t('cart.updateQuantities') : t('cart.proceedToCheckout')}
                </Button>

                <Button
                  onClick={handleViewCart}
                  variant="secondary"
                  fullWidth
                >
                  {t('cart.viewBag')}
                </Button>
              </div>

              <div className="flex items-center justify-center gap-2 text-[10px] text-[#8E713D] pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C9A45C]" />
                <span>{t('product.authenticityGuaranteed')}</span>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
