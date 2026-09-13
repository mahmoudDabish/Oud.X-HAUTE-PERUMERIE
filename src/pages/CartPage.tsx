import React from 'react';
import { useTranslation } from 'react-i18next';
import { useShop } from '../context/ShopContext';
import { Button } from '../components/ui/Button';
import { Trash2, ShoppingBag, ArrowRight, Sparkles, Tag, ChevronRight, ShieldCheck } from 'lucide-react';
import { getLocalizedProductName } from '../i18n/presentation';

export const CartPage: React.FC = () => {
  const { t } = useTranslation();
  const {
    cart,
    removeFromCart,
    updateQuantity,
    subtotal,
    shipping,
    discount,
    appliedPromo,
    total,
    amountToFreeShipping,
    formatPrice,
    navigateTo
  } = useShop();

  const progressPercent = Math.min(100, Math.round(((3000 - amountToFreeShipping) / 3000) * 100));

  return (
    <div className="min-h-screen bg-[#070707] text-[#F5F2EA] pb-24">
      {/* Breadcrumb */}
      <div className="bg-[#0D0C0A] border-b border-white/5 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-xs text-[#A7A29A] uppercase tracking-wider">
            <button onClick={() => navigateTo('/')} className="hover:text-[#F5F2EA]">{t('shop.breadcrumbHome')}</button>
            <ChevronRight className="w-3 h-3 text-[#8E713D] rtl-flip" />
            <button onClick={() => navigateTo('/shop')} className="hover:text-[#F5F2EA]">{t('shop.breadcrumbShop')}</button>
            <ChevronRight className="w-3 h-3 text-[#8E713D] rtl-flip" />
            <span className="text-[#C9A45C]">{t('cart.breadcrumb')}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="space-y-2 mb-8">
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#8E713D] font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#C9A45C]" /> {t('cart.curatedSelection')}
          </span>
          <h1 className="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl font-normal text-[#F5F2EA]">
            {t('cart.title', { count: cart.reduce((a, b) => a + b.quantity, 0) })}
          </h1>
        </div>

        {cart.length === 0 ? (
          <div className="py-20 text-center rounded-xl bg-[#0D0C0A] border border-white/5 max-w-2xl mx-auto p-8 space-y-4">
            <div className="w-20 h-20 rounded-full bg-[#11100E] border border-[#C9A45C]/30 mx-auto flex items-center justify-center text-[#C9A45C]">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <h2 className="font-serif-luxury text-2xl text-[#F5F2EA]">{t('cart.emptyTitle')}</h2>
            <p className="text-xs sm:text-sm text-[#A7A29A] max-w-sm mx-auto">
              {t('cart.emptyDesc')}
            </p>
            <Button
              onClick={() => navigateTo('/shop')}
              variant="primary"
              size="lg"
            >
              {t('cart.continueShopping')}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* Left Items Column (8 Cols) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Free Shipping Meter */}
              <div className="p-4 bg-[#11100E] border border-[#C9A45C]/30 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#A7A29A]">
                    {amountToFreeShipping === 0 ? (
                      <strong className="text-emerald-400">{t('cart.freeShippingUnlocked')}</strong>
                    ) : (
                      <span>{t('cart.addMoreForFreeShipping', { amount: formatPrice(amountToFreeShipping) })}</span>
                    )}
                  </span>
                  <span className="text-[11px] font-mono text-[#8E713D]">{progressPercent}%</span>
                </div>
                <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#8E713D] via-[#C9A45C] to-[#E3C27A] transition-all duration-500 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Items List */}
              <div className="divide-y divide-white/5 border border-white/5 rounded-xl bg-[#0D0C0A] overflow-hidden">
                {cart.map((item) => (
                  <div
                    key={`${item.product.id}-${item.selectedSize}`}
                    className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div
                        onClick={() => navigateTo(`/products/${item.product.slug}`)}
                        className="w-20 h-24 rounded-lg bg-black overflow-hidden border border-white/10 shrink-0 cursor-pointer"
                      >
                        <img
                          src={item.product?.images?.[0] || (item.product as any)?.image || '/images/hero_oud_bottle_1787700482747.jpg'}
                          alt={getLocalizedProductName(item.product, item.product?.name || 'Fragrance')}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="space-y-1 min-w-0">
                        <span className="text-[10px] uppercase font-semibold text-[#C9A45C]">
                          {item.product.brand}
                        </span>
                        <h3
                          onClick={() => navigateTo(`/products/${item.product.slug}`)}
                          className="font-serif-luxury text-base sm:text-lg text-[#F5F2EA] truncate cursor-pointer hover:text-[#E3C27A]"
                        >
                          {getLocalizedProductName(item.product, item.product.name)}
                        </h3>
                        <p className="text-xs text-[#A7A29A]">
                          {t('product.selectSize')}: <strong className="text-[#F5F2EA]">{item.selectedSize}</strong>
                        </p>
                        <span className="font-cinzel text-xs text-[#E3C27A] block sm:hidden">
                          {formatPrice(item.price)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                      {/* Quantity Selector */}
                      <div className="flex items-center border border-white/20 rounded bg-[#11100E]">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.selectedSize, item.quantity - 1)}
                          className="px-3 py-1 text-xs text-[#A7A29A] hover:text-[#F5F2EA]"
                        >
                          -
                        </button>
                        <span className="px-2 text-xs font-semibold text-[#F5F2EA]">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.selectedSize, item.quantity + 1)}
                          className="px-3 py-1 text-xs text-[#A7A29A] hover:text-[#F5F2EA]"
                        >
                          +
                        </button>
                      </div>

                      {/* Line Item Total */}
                      <div className="text-right rtl:text-left">
                        <span className="font-cinzel text-sm sm:text-base font-bold text-[#E3C27A]">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => removeFromCart(item.product.id, item.selectedSize)}
                        className="text-[#A7A29A] hover:text-red-400 p-2 transition-colors"
                        aria-label={t('common.remove')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Order Summary (4 Cols) */}
            <div className="lg:col-span-4 space-y-6">
              <div className="p-6 rounded-xl bg-[#0D0C0A] border border-[#C9A45C]/30 shadow-xl space-y-5">
                <h2 className="font-cinzel text-sm font-bold uppercase tracking-widest text-[#F5F2EA] border-b border-white/10 pb-3">
                  {t('checkout.orderSummary')}
                </h2>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between text-[#A7A29A]">
                    <span>{t('cart.subtotal')}</span>
                    <span className="font-cinzel text-[#F5F2EA]">{formatPrice(subtotal)}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-400 font-semibold">
                      <span className="flex items-center gap-1">
                        <Tag className="w-3 h-3" /> {t('cart.privilegeDiscount')} ({appliedPromo})
                      </span>
                      <span className="font-cinzel">-{formatPrice(discount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-[#A7A29A]">
                    <span>{t('cart.shipping')}</span>
                    <span>
                      {shipping === 0 ? (
                        <span className="text-emerald-400 font-semibold uppercase">{t('cart.complimentary')}</span>
                      ) : (
                        <span className="font-cinzel text-[#F5F2EA]">{formatPrice(shipping)}</span>
                      )}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex justify-between text-base font-bold text-[#F5F2EA]">
                    <span>{t('cart.total')}</span>
                    <span className="font-cinzel text-lg text-[#E3C27A]">{formatPrice(total)}</span>
                  </div>
                </div>
              
                {/* Proceed Button */}
                <Button
                  onClick={() => navigateTo('/checkout')}
                  variant="primary"
                  size="lg"
                  fullWidth
                  rightIcon={<ArrowRight className="w-4 h-4 rtl-flip" />}
                >
                  {t('cart.proceedToCheckout')}
                </Button>

                <div className="flex items-center justify-center gap-2 text-[10px] text-[#8E713D] pt-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#C9A45C]" />
                  <span>{t('checkout.safeEncrypted')}</span>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};
