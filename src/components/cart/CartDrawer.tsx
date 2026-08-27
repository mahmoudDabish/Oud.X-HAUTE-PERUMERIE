import React from 'react';
import { useShop } from '../../context/ShopContext';
import { X, Trash2, ShoppingBag, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/Button';
import { AnimatePresence, motion } from 'motion/react';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    removeFromCart,
    updateQuantity,
    subtotal,
    freeShippingThreshold,
    amountToFreeShipping,
    formatPrice,
    navigateTo
  } = useShop();

  if (!isCartDrawerOpen) return null;

  const progressPercent = Math.min(100, Math.round(((freeShippingThreshold - amountToFreeShipping) / freeShippingThreshold) * 100));

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
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed inset-y-0 right-0 w-full max-w-md bg-[#0D0C0A]/90 border-l border-[#C9A45C]/25 backdrop-blur-2xl shadow-2xl flex flex-col justify-between"
        >
          {/* Header */}
          <div className="p-5 border-b border-[#C9A45C]/15 flex items-center justify-between bg-[#151310]/80 backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#151310] border border-[#C9A45C]/30 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-[#C9A45C]" />
              </div>
              <h2 className="font-serif-luxury text-xl font-medium tracking-wide text-[#F5F2EA]">
                Your Shopping Bag ({cart.reduce((a, b) => a + b.quantity, 0)})
              </h2>
            </div>
            <button
              onClick={() => setIsCartDrawerOpen(false)}
              className="p-2 text-[#A7A29A] hover:text-[#F5F2EA] rounded-full hover:bg-white/5 transition-colors border border-transparent hover:border-white/10"
              aria-label="Close bag"
            >
              <X className="w-5 h-5" />
            </button>
          </div>


          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#151310]/80 border border-[#C9A45C]/25 flex items-center justify-center text-[#C9A45C] backdrop-blur-md">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif-luxury text-xl text-[#F5F2EA]">Your bag is empty</h3>
                  <p className="text-xs text-[#A7A29A] max-w-xs leading-relaxed">
                    Discover our collection of rare aged agarwoods, spiced extracts, and royal perfumes.
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
                  EXPLORE FRAGRANCES
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
                      src={item.product.images[0]}
                      alt={item.product.name}
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
                        {item.product.name}
                      </h4>
                      <p className="text-[10px] text-[#A7A29A] mt-0.5">
                        Size: <span className="text-[#F5F2EA]">{item.selectedSize}</span>
                      </p>
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
                      <div className="text-right">
                        <span className="font-cinzel text-xs font-bold text-[#F0D9A4]">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => removeFromCart(item.product.id, item.selectedSize)}
                        className="text-[#A7A29A] hover:text-red-400 p-1.5 transition-colors"
                        aria-label="Remove item"
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
                  <span>Subtotal</span>
                  <span className="font-cinzel font-semibold text-[#F5F2EA]">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold pt-2 border-t border-[#C9A45C]/15 text-[#F5F2EA]">
                  <span>Total Amount</span>
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
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  PROCEED TO CHECKOUT
                </Button>

                <Button
                  onClick={handleViewCart}
                  variant="secondary"
                  fullWidth
                >
                  VIEW FULL BAG
                </Button>
              </div>

              <div className="flex items-center justify-center gap-2 text-[10px] text-[#8E713D] pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C9A45C]" />
                <span>100% Guaranteed Authentic & Secured Checkout</span>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
