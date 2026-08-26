import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { orderService } from '../services/orderService';
import { Button } from '../components/ui/Button';
import {
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  Banknote,
  Smartphone,
  ChevronRight,
  Truck,
  Sparkles,
  Lock
} from 'lucide-react';
import { Order } from '../types';

export const CheckoutPage: React.FC = () => {
  const {
    cart,
    subtotal,
    shipping,
    discount,
    appliedPromo,
    total,
    formatPrice,
    user,
    navigateTo,
    clearCart,
    showToast
  } = useShop();

  const [contactEmail, setContactEmail] = useState(user?.email || 'karim.elsayed@luxury.com');
  const [contactPhone, setContactPhone] = useState(user?.phone || '+20 100 123 4567');
  
  const [fullName, setFullName] = useState(user?.name || 'Karim El-Sayed');
  const [city, setCity] = useState('Cairo');
  const [area, setArea] = useState('New Cairo / 5th Settlement');
  const [streetAddress, setStreetAddress] = useState('Road 90 North, Villa 42');
  const [building, setBuilding] = useState('Villa 42');
  const [apartment, setApartment] = useState('Suite 2');

  const [deliveryMethod, setDeliveryMethod] = useState<'standard' | 'express'>('standard');
  const [paymentMethod, setPaymentMethod] = useState<'Card' | 'Instapay' | 'COD'>('Card');

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  const deliveryFee = deliveryMethod === 'express' ? shipping + 75 : shipping;
  const finalTotal = total + (deliveryMethod === 'express' ? 75 : 0);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0 || isPlacingOrder) return;

    setIsPlacingOrder(true);

    const items = cart.map(item => ({
      product_id: item.product.id,
      size: item.selectedSize,
      quantity: item.quantity
    }));

    const shippingAddress = {
      fullName,
      phone: contactPhone,
      city,
      area,
      streetAddress,
      building,
      apartment,
      isDefault: true
    };

    const actualPaymentMethod = paymentMethod === 'Card'
      ? 'Credit / Debit Card'
      : paymentMethod === 'Instapay'
      ? 'Instapay'
      : 'Cash on Delivery';

    const { data: orderResponse, error } = await orderService.createOrder(
      user?.id || null,
      items,
      shippingAddress,
      actualPaymentMethod,
      deliveryMethod === 'express',
      appliedPromo
    );

    setIsPlacingOrder(false);

    if (error) {
      showToast('Order Failed', error.message || 'Unable to place order', 'info');
      return;
    }

    if (orderResponse) {
      clearCart();
      setPlacedOrder({
        ...orderResponse,
        orderNumber: orderResponse.order_number, // map backend key
        items: [] // In a real app we might want to fetch full items for display, but empty is fine for confirmation
      });
    }
  };

  if (placedOrder) {
    return (
      <div className="min-h-screen bg-[#070707] text-[#F5F2EA] py-20 px-4">
        <div className="max-w-2xl mx-auto p-8 sm:p-12 rounded-2xl bg-[#0D0C0A] border border-[#C9A45C]/40 shadow-2xl text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-[#11100E] border-2 border-[#C9A45C] mx-auto flex items-center justify-center text-[#E3C27A]">
            <CheckCircle2 className="w-10 h-10 text-[#C9A45C]" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] uppercase font-semibold tracking-[0.3em] text-[#C9A45C]">
              ORDER CONFIRMED • OUD_X PRIVÉ
            </span>
            <h1 className="font-serif-luxury text-3xl sm:text-4xl text-[#F5F2EA]">
              Thank You for Your Order
            </h1>
            <p className="text-xs sm:text-sm text-[#A7A29A]">
              Order Number: <strong className="text-[#E3C27A] font-mono">{placedOrder.orderNumber}</strong>
            </p>
          </div>

          <div className="p-4 rounded-lg bg-[#11100E] border border-white/10 text-left text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-[#A7A29A]">Tracking Number:</span>
              <span className="font-mono text-[#F0D9A4]">{placedOrder.trackingNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#A7A29A]">Estimated Delivery:</span>
              <span className="text-[#F5F2EA]">Within 24–48 Hours</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#A7A29A]">Payment Method:</span>
              <span className="text-[#F5F2EA]">{placedOrder.paymentMethod}</span>
            </div>
            <div className="flex justify-between border-t border-white/5 pt-2 font-bold">
              <span className="text-[#F5F2EA]">Total Charged:</span>
              <span className="text-[#E3C27A] font-cinzel text-sm">{formatPrice(placedOrder.total)}</span>
            </div>
          </div>

          <p className="text-xs text-[#A7A29A] leading-relaxed">
            A confirmation receipt has been sent to <strong>{contactEmail}</strong>. Our white-glove courier will contact you via WhatsApp / SMS prior to delivery.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Button
              onClick={() => navigateTo('/account')}
              variant="primary"
              size="md"
            >
              VIEW ORDER IN ACCOUNT
            </Button>
            <Button
              onClick={() => navigateTo('/shop')}
              variant="secondary"
              size="md"
            >
              CONTINUE BROWSING
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070707] text-[#F5F2EA] pb-24">
      {/* Top Breadcrumb */}
      <div className="bg-[#0D0C0A] border-b border-white/5 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-xs text-[#A7A29A] uppercase tracking-wider">
            <button onClick={() => navigateTo('/cart')} className="hover:text-[#F5F2EA]">Shopping Bag</button>
            <ChevronRight className="w-3 h-3 text-[#8E713D]" />
            <span className="text-[#C9A45C]">Secure Checkout</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="mb-8">
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#8E713D] font-semibold flex items-center gap-1.5 mb-1">
            <Lock className="w-3.5 h-3.5 text-[#C9A45C]" /> 256-Bit Encrypted Checkout
          </span>
          <h1 className="font-serif-luxury text-3xl sm:text-4xl text-[#F5F2EA]">
            HAUTE CHECKOUT
          </h1>
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm text-[#A7A29A] mb-4">Your shopping bag is empty.</p>
            <Button onClick={() => navigateTo('/shop')} variant="primary">
              RETURN TO SHOP
            </Button>
          </div>
        ) : (
          <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Left Checkout Forms (7 Cols) */}
            <div className="lg:col-span-7 space-y-8">
              
              {/* Section 1: Contact */}
              <div className="p-6 rounded-xl bg-[#0D0C0A] border border-[#C9A45C]/25 space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h2 className="font-cinzel text-xs font-bold uppercase tracking-widest text-[#E3C27A]">
                    1. Contact Information
                  </h2>
                  <span className="text-[10px] text-[#A7A29A]">Step 1 of 4</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-[#A7A29A] mb-1 font-medium">Email for Order Receipt *</label>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full bg-[#11100E] border border-white/15 focus:border-[#C9A45C] rounded px-3 py-2.5 text-[#F5F2EA] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[#A7A29A] mb-1 font-medium">Phone Number (for Courier) *</label>
                    <input
                      type="tel"
                      required
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full bg-[#11100E] border border-white/15 focus:border-[#C9A45C] rounded px-3 py-2.5 text-[#F5F2EA] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Shipping Address */}
              <div className="p-6 rounded-xl bg-[#0D0C0A] border border-[#C9A45C]/25 space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h2 className="font-cinzel text-xs font-bold uppercase tracking-widest text-[#E3C27A]">
                    2. Shipping Address
                  </h2>
                  <span className="text-[10px] text-[#A7A29A]">Egypt & GCC</span>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block text-[#A7A29A] mb-1 font-medium">Recipient Full Name *</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-[#11100E] border border-white/15 focus:border-[#C9A45C] rounded px-3 py-2.5 text-[#F5F2EA] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[#A7A29A] mb-1 font-medium">Governorate / City *</label>
                      <select
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full bg-[#11100E] border border-white/15 focus:border-[#C9A45C] rounded px-3 py-2.5 text-[#F5F2EA] focus:outline-none cursor-pointer"
                      >
                        <option value="Cairo">Cairo (القاهرة)</option>
                        <option value="Giza">Giza (الجيزة)</option>
                        <option value="Alexandria">Alexandria (الإسكندرية)</option>
                        <option value="Red Sea / Hurghada">Red Sea / Hurghada</option>
                        <option value="South Sinai / Sharm">South Sinai / Sharm</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[#A7A29A] mb-1 font-medium">District / Area *</label>
                      <input
                        type="text"
                        required
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        placeholder="e.g. New Cairo, Zamalek, Sheikh Zayed"
                        className="w-full bg-[#11100E] border border-white/15 focus:border-[#C9A45C] rounded px-3 py-2.5 text-[#F5F2EA] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#A7A29A] mb-1 font-medium">Street Address & Compound *</label>
                    <input
                      type="text"
                      required
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      className="w-full bg-[#11100E] border border-white/15 focus:border-[#C9A45C] rounded px-3 py-2.5 text-[#F5F2EA] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[#A7A29A] mb-1 font-medium">Building / Villa No.</label>
                      <input
                        type="text"
                        value={building}
                        onChange={(e) => setBuilding(e.target.value)}
                        className="w-full bg-[#11100E] border border-white/15 focus:border-[#C9A45C] rounded px-3 py-2.5 text-[#F5F2EA] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[#A7A29A] mb-1 font-medium">Apartment / Suite</label>
                      <input
                        type="text"
                        value={apartment}
                        onChange={(e) => setApartment(e.target.value)}
                        className="w-full bg-[#11100E] border border-white/15 focus:border-[#C9A45C] rounded px-3 py-2.5 text-[#F5F2EA] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Delivery Method */}
              <div className="p-6 rounded-xl bg-[#0D0C0A] border border-[#C9A45C]/25 space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h2 className="font-cinzel text-xs font-bold uppercase tracking-widest text-[#E3C27A]">
                    3. Delivery Speed
                  </h2>
                </div>

                <div className="space-y-3">
                  <label
                    onClick={() => setDeliveryMethod('standard')}
                    className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all ${
                      deliveryMethod === 'standard'
                        ? 'border-[#C9A45C] bg-[#C9A45C]/10 text-[#F5F2EA]'
                        : 'border-white/10 bg-[#11100E] text-[#A7A29A]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Truck className="w-5 h-5 text-[#C9A45C]" />
                      <div>
                        <div className="text-xs font-semibold text-[#F5F2EA]">VIP White-Glove Courier</div>
                        <div className="text-[11px] text-[#A7A29A]">Delivery within 24–48 hours across Egypt</div>
                      </div>
                    </div>
                    <span className="font-cinzel text-xs font-bold text-[#E3C27A]">
                      {shipping === 0 ? 'Complimentary' : formatPrice(shipping)}
                    </span>
                  </label>

                  <label
                    onClick={() => setDeliveryMethod('express')}
                    className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all ${
                      deliveryMethod === 'express'
                        ? 'border-[#C9A45C] bg-[#C9A45C]/10 text-[#F5F2EA]'
                        : 'border-white/10 bg-[#11100E] text-[#A7A29A]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-5 h-5 text-[#E3C27A]" />
                      <div>
                        <div className="text-xs font-semibold text-[#F5F2EA]">Express Same-Day Priority</div>
                        <div className="text-[11px] text-[#A7A29A]">Guaranteed delivery within 6–12 hours (Cairo & Giza)</div>
                      </div>
                    </div>
                    <span className="font-cinzel text-xs font-bold text-[#E3C27A]">
                      +{formatPrice(75)}
                    </span>
                  </label>
                </div>
              </div>

              {/* Section 4: Payment Method */}
              <div className="p-6 rounded-xl bg-[#0D0C0A] border border-[#C9A45C]/25 space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h2 className="font-cinzel text-xs font-bold uppercase tracking-widest text-[#E3C27A]">
                    4. Payment Selection
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Card')}
                    className={`p-4 rounded-lg border text-left transition-all ${
                      paymentMethod === 'Card'
                        ? 'border-[#C9A45C] bg-[#C9A45C]/15 text-[#E3C27A]'
                        : 'border-white/10 bg-[#11100E] text-[#A7A29A]'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 mb-2 text-[#C9A45C]" />
                    <div className="text-xs font-bold text-[#F5F2EA]">Credit / Debit Card</div>
                    <div className="text-[10px] text-neutral-400 mt-0.5">Visa, Mastercard, Amex</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Instapay')}
                    className={`p-4 rounded-lg border text-left transition-all ${
                      paymentMethod === 'Instapay'
                        ? 'border-[#C9A45C] bg-[#C9A45C]/15 text-[#E3C27A]'
                        : 'border-white/10 bg-[#11100E] text-[#A7A29A]'
                    }`}
                  >
                    <Smartphone className="w-5 h-5 mb-2 text-[#C9A45C]" />
                    <div className="text-xs font-bold text-[#F5F2EA]">Instapay Egypt</div>
                    <div className="text-[10px] text-neutral-400 mt-0.5">Instant transfer / IPA</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('COD')}
                    className={`p-4 rounded-lg border text-left transition-all ${
                      paymentMethod === 'COD'
                        ? 'border-[#C9A45C] bg-[#C9A45C]/15 text-[#E3C27A]'
                        : 'border-white/10 bg-[#11100E] text-[#A7A29A]'
                    }`}
                  >
                    <Banknote className="w-5 h-5 mb-2 text-[#C9A45C]" />
                    <div className="text-xs font-bold text-[#F5F2EA]">Cash on Delivery</div>
                    <div className="text-[10px] text-neutral-400 mt-0.5">Pay upon inspection</div>
                  </button>
                </div>
              </div>

            </div>

            {/* Right Order Summary Column (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="p-6 rounded-xl bg-[#0D0C0A] border border-[#C9A45C]/35 shadow-2xl sticky top-28 space-y-6">
                <h3 className="font-cinzel text-xs font-bold uppercase tracking-widest text-[#F5F2EA] border-b border-white/10 pb-3">
                  Summary & Confirmation
                </h3>

                {/* Items preview */}
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div key={`${item.product.id}-${item.selectedSize}`} className="flex items-center gap-3 text-xs">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        referrerPolicy="no-referrer"
                        className="w-12 h-14 rounded object-cover bg-black shrink-0 border border-white/10"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-serif-luxury text-sm text-[#F5F2EA] truncate">{item.product.name}</div>
                        <div className="text-[11px] text-[#A7A29A]">{item.selectedSize} × {item.quantity}</div>
                      </div>
                      <span className="font-cinzel text-xs font-bold text-[#E3C27A]">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Calculation breakdown */}
                <div className="space-y-2 text-xs border-t border-white/10 pt-4">
                  <div className="flex justify-between text-[#A7A29A]">
                    <span>Subtotal</span>
                    <span className="font-cinzel text-[#F5F2EA]">{formatPrice(subtotal)}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-400 font-semibold">
                      <span>Privilege Discount ({appliedPromo})</span>
                      <span className="font-cinzel">-{formatPrice(discount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-[#A7A29A]">
                    <span>Delivery Fee</span>
                    <span>
                      {deliveryFee === 0 ? (
                        <span className="text-emerald-400 font-semibold uppercase">Complimentary</span>
                      ) : (
                        <span className="font-cinzel text-[#F5F2EA]">{formatPrice(deliveryFee)}</span>
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-base font-bold text-[#F5F2EA] border-t border-white/10 pt-3">
                    <span>Grand Total</span>
                    <span className="font-cinzel text-xl text-[#E3C27A]">{formatPrice(finalTotal)}</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  isLoading={isPlacingOrder}
                  className="shadow-xl shadow-[#C9A45C]/20 text-xs tracking-widest font-bold"
                >
                  {isPlacingOrder ? 'CONFIRMING ALLOCATION...' : `CONFIRM ORDER (${formatPrice(finalTotal)})`}
                </Button>

                <div className="flex items-center justify-center gap-2 text-[10px] text-[#8E713D]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Dispatched in temperature-controlled luxury vault packaging</span>
                </div>
              </div>
            </div>

          </form>
        )}
      </div>
    </div>
  );
};
