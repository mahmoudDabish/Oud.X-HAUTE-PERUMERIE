import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { Button } from '../components/ui/Button';
import { Trash2, ShoppingBag, ArrowRight, Sparkles, Tag, ChevronRight, ShieldCheck } from 'lucide-react';

export const CartPage: React.FC = () => {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    subtotal,
    shipping,
    discount,
    appliedPromo,
    applyPromoCode,
    removePromoCode,
    total,
    freeShippingThreshold,
    amountToFreeShipping,
    formatPrice,
    navigateTo
  } = useShop();

  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');

  const progressPercent = Math.min(100, Math.round(((freeShippingThreshold - amountToFreeShipping) / freeShippingThreshold) * 100));

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    const res = applyPromoCode(promoInput);
    if (!res.success) {
      setPromoError(res.message);
    } else {
      setPromoError('');
      setPromoInput('');
    }
  };

  return (
    <div className="min-h-screen bg-[#070707] text-[#F5F2EA] pb-24">
      {/* Breadcrumb */}
      <div className="bg-[#0D0C0A] border-b border-white/5 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-xs text-[#A7A29A] uppercase tracking-wider">
            <button onClick={() => navigateTo('/')} className="hover:text-[#F5F2EA]">Home</button>
            <ChevronRight className="w-3 h-3 text-[#8E713D]" />
            <button onClick={() => navigateTo('/shop')} className="hover:text-[#F5F2EA]">Shop</button>
            <ChevronRight className="w-3 h-3 text-[#8E713D]" />
            <span className="text-[#C9A45C]">Shopping Bag</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="space-y-2 mb-8">
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#8E713D] font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#C9A45C]" /> Your Curated Selection
          </span>
          <h1 className="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl font-normal text-[#F5F2EA]">
            SHOPPING BAG ({cart.reduce((a, b) => a + b.quantity, 0)})
          </h1>
        </div>

        {cart.length === 0 ? (
          <div className="py-20 text-center rounded-xl bg-[#0D0C0A] border border-white/5 max-w-2xl mx-auto p-8 space-y-4">
            <div className="w-20 h-20 rounded-full bg-[#11100E] border border-[#C9A45C]/30 mx-auto flex items-center justify-center text-[#C9A45C]">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <h2 className="font-serif-luxury text-2xl text-[#F5F2EA]">Your shopping bag is empty</h2>
            <p className="text-xs sm:text-sm text-[#A7A29A] max-w-sm mx-auto">
              Indulge in our collection of precious oud wood, smoky leathers, and royal vanilla elixirs.
            </p>
            <Button
              onClick={() => navigateTo('/shop')}
              variant="primary"
              size="lg"
            >
              EXPLORE BOUTIQUE
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
                      <strong className="text-emerald-400">Complimentary VIP Delivery Unlocked!</strong>
                    ) : (
                      <span>Add <strong className="text-[#E3C27A]">{formatPrice(amountToFreeShipping)}</strong> more to receive free shipping</span>
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
                          src={item.product.images[0]}
                          alt={item.product.name}
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
                          {item.product.name}
                        </h3>
                        <p className="text-xs text-[#A7A29A]">
                          Flacon Size: <strong className="text-[#F5F2EA]">{item.selectedSize}</strong>
                        </p>
                        <span className="font-cinzel text-xs text-[#E3C27A] block sm:hidden">
                          {formatPrice(item.price)} each
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
                      <div className="text-right">
                        <span className="font-cinzel text-sm sm:text-base font-bold text-[#E3C27A]">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => removeFromCart(item.product.id, item.selectedSize)}
                        className="text-[#A7A29A] hover:text-red-400 p-2"
                        aria-label="Remove item"
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
                  Order Summary
                </h2>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between text-[#A7A29A]">
                    <span>Subtotal</span>
                    <span className="font-cinzel text-[#F5F2EA]">{formatPrice(subtotal)}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-400 font-semibold">
                      <span className="flex items-center gap-1">
                        <Tag className="w-3 h-3" /> Privilege Discount ({appliedPromo})
                      </span>
                      <span className="font-cinzel">-{formatPrice(discount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-[#A7A29A]">
                    <span>VIP Shipping & Delivery</span>
                    <span>
                      {shipping === 0 ? (
                        <span className="text-emerald-400 font-semibold uppercase">Complimentary</span>
                      ) : (
                        <span className="font-cinzel text-[#F5F2EA]">{formatPrice(shipping)}</span>
                      )}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex justify-between text-base font-bold text-[#F5F2EA]">
                    <span>Total Amount</span>
                    <span className="font-cinzel text-lg text-[#E3C27A]">{formatPrice(total)}</span>
                  </div>
                </div>
              
                {/* Proceed Button */}
                <Button
                  onClick={() => navigateTo('/checkout')}
                  variant="primary"
                  size="lg"
                  fullWidth
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  PROCEED TO CHECKOUT
                </Button>

                <div className="flex items-center justify-center gap-2 text-[10px] text-[#8E713D] pt-2">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Safe & Encrypted 256-bit Checkout</span>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};
