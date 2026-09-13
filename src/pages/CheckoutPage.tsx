import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
import { getLocalizedGovernorate, getLocalizedPaymentMethod, getLocalizedProductName } from '../i18n/presentation';

const EGYPTIAN_GOVERNORATES = [
  'Cairo',
  'Giza',
  'Alexandria',
  'Qalyubia',
  'Dakahlia',
  'Sharqia',
  'Gharbia',
  'Monufia',
  'Beheira',
  'Kafr El Sheikh',
  'Damietta',
  'Port Said',
  'Ismailia',
  'Suez',
  'North Sinai',
  'South Sinai',
  'Fayoum',
  'Beni Suef',
  'Minya',
  'Assiut',
  'Sohag',
  'Qena',
  'Luxor',
  'Aswan',
  'Red Sea',
  'New Valley',
  'Matrouh'
];

export const CheckoutPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
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

  const [contactEmail, setContactEmail] = useState(user?.email || '');
  const [contactPhone, setContactPhone] = useState(user?.phone || '');
  
  const [fullName, setFullName] = useState(user?.name || '');
  const [governorate, setGovernorate] = useState('Cairo');
  const [cityArea, setCityArea] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [building, setBuilding] = useState('');
  const [apartment, setApartment] = useState('');
  const [additionalDetails, setAdditionalDetails] = useState('');

  // Auto-fill from user profile when logged in
  useEffect(() => {
    if (user) {
      if (user.email && !contactEmail) setContactEmail(user.email);
      if (user.phone && !contactPhone) setContactPhone(user.phone);
      if (user.name && !fullName) setFullName(user.name);

      const defaultAddr = user.addresses?.find(a => a.isDefault) || user.addresses?.[0];
      if (defaultAddr) {
        if (defaultAddr.governorate) setGovernorate(defaultAddr.governorate);
        if (defaultAddr.area) setCityArea(defaultAddr.area);
        if (defaultAddr.streetAddress) setStreetAddress(defaultAddr.streetAddress);
        if (defaultAddr.building) setBuilding(defaultAddr.building);
        if (defaultAddr.apartment) setApartment(defaultAddr.apartment);
      }
    }
  }, [user]);

  const [paymentMethod, setPaymentMethod] = useState<'Card' | 'Instapay' | 'COD'>('Card');

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  const finalTotal = total;

  const hasInsufficientStock = cart.some(item => item.quantity > item.product.stock);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0 || isPlacingOrder || hasInsufficientStock) return;

    setIsPlacingOrder(true);

    const items = cart.map(item => ({
      product_id: item.product.id,
      size: item.selectedSize,
      quantity: item.quantity
    }));

    const shippingAddress = {
      fullName,
      phone: contactPhone,
      governorate,
      city: governorate, // Preserves backward compatibility
      area: cityArea,    // Manual text input
      streetAddress,
      building,
      apartment,
      additionalDetails,
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
      false, // standard delivery only
      appliedPromo
    );

    setIsPlacingOrder(false);

    if (error) {
      showToast(t('checkout.errors.failedOrder', 'Order Failed'), error.message || t('checkout.errors.failedOrder', 'Unable to place order'), 'info');
      return;
    }

    if (orderResponse) {
      clearCart();
      
      setPlacedOrder({
        ...orderResponse,
        orderNumber: orderResponse.order_number,
        paymentMethod: actualPaymentMethod,
        shippingAddress,
        items: cart.map(it => ({
          id: it.product.id,
          name: it.product.name,
          size: it.selectedSize,
          price: it.price,
          quantity: it.quantity,
          image: it.product.images?.[0] || '',
          imageUrl: it.product.images?.[0] || ''
        }))
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
              {t('checkout.success.badge', 'ORDER CONFIRMED • OUD_X PRIVÉ')}
            </span>
            <h1 className="font-serif-luxury text-3xl sm:text-4xl text-[#F5F2EA]">
              {t('checkout.success.title', 'Thank You for Your Order')}
            </h1>
            <p className="text-xs sm:text-sm text-[#A7A29A]">
              {t('checkout.success.orderNumberLabel', 'Order Number:')} <strong className="text-[#E3C27A] font-mono">#{placedOrder.orderNumber}</strong>
            </p>
          </div>

          <div className="p-4 rounded-lg bg-[#11100E] border border-white/10 text-left rtl:text-right text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-[#A7A29A]">{t('checkout.success.trackingNumber', 'Tracking Number:')}</span>
              <span className="font-mono text-[#F0D9A4]">{placedOrder.trackingNumber || t('checkout.success.pendingTracking', 'Pending Assignment')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#A7A29A]">{t('checkout.success.estimatedDelivery', 'Estimated Delivery:')}</span>
              <span className="text-[#F5F2EA]">{t('checkout.success.deliveryTime', 'Within 24–48 Hours')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#A7A29A]">{t('checkout.paymentMethod', 'Payment Method:')}</span>
              <span className="text-[#F5F2EA]">{getLocalizedPaymentMethod(placedOrder.paymentMethod, t)}</span>
            </div>
            <div className="flex justify-between border-t border-white/5 pt-2 font-bold">
              <span className="text-[#F5F2EA]">{t('checkout.success.totalCharged', 'Total Charged:')}</span>
              <span className="text-[#E3C27A] font-cinzel text-sm">{formatPrice(placedOrder.total)}</span>
            </div>
          </div>

          <p className="text-xs text-[#A7A29A] leading-relaxed">
            {t('checkout.success.confirmationReceipt', {
              email: contactEmail,
              defaultValue: `A confirmation receipt has been sent to ${contactEmail}. Our white-glove courier will contact you via WhatsApp / SMS prior to delivery.`
            })}
          </p>

          <div className="flex flex-col gap-3 justify-center pt-4">
            <Button
              onClick={() => {
                const message = isRtl
                  ? `مرحباً OUD.X بريفيه، أود تأكيد طلبي الجديد.\n\n*رقم الطلب:* #${placedOrder.orderNumber}\n*الاسم:* ${fullName}\n*الإجمالي:* ${formatPrice(placedOrder.total)}`
                  : `Hello OUD.X Privé, I would like to confirm my new order.\n\n*Order Number:* #${placedOrder.orderNumber}\n*Name:* ${fullName}\n*Total:* ${formatPrice(placedOrder.total)}`;
                window.open(`https://wa.me/201127977819?text=${encodeURIComponent(message)}`, '_blank');
              }}
              variant="primary"
              size="lg"
              className="bg-[#25D366] text-white hover:bg-[#25D366]/90 border-none font-bold"
            >
              {t('checkout.success.whatsAppButton', 'CONFIRM ORDER VIA WHATSAPP')}
            </Button>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() => navigateTo('/account')}
                variant="primary"
                size="md"
                className="flex-1"
              >
                {t('checkout.success.viewAccount', 'VIEW ORDER IN ACCOUNT')}
              </Button>
              <Button
                onClick={() => navigateTo('/shop')}
                variant="secondary"
                size="md"
                className="flex-1"
              >
                {t('checkout.success.returnBoutique', 'CONTINUE BROWSING')}
              </Button>
            </div>
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
            <button onClick={() => navigateTo('/cart')} className="hover:text-[#F5F2EA]">{t('cart.title', 'Shopping Bag')}</button>
            <ChevronRight className="w-3 h-3 text-[#8E713D] rtl-flip" />
            <span className="text-[#C9A45C]">{t('checkout.breadcrumb', 'Secure Checkout')}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="mb-8">
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#8E713D] font-semibold flex items-center gap-1.5 mb-1">
            <Lock className="w-3.5 h-3.5 text-[#C9A45C]" /> {t('checkout.safeEncrypted', '256-Bit Encrypted Checkout')}
          </span>
          <h1 className="font-serif-luxury text-3xl sm:text-4xl text-[#F5F2EA]">
            {t('checkout.title', 'HAUTE CHECKOUT')}
          </h1>
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm text-[#A7A29A] mb-4">{t('cart.empty', 'Your shopping bag is empty.')}</p>
            <Button onClick={() => navigateTo('/shop')} variant="primary">
              {t('cart.exploreFragrances', 'RETURN TO SHOP')}
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
                    {t('checkout.contactInfo', '1. Contact Information')}
                  </h2>
                  <span className="text-[10px] text-[#A7A29A]">{t('checkout.step1', 'Step 1 of 4')}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-[#A7A29A] mb-1 font-medium">{t('checkout.email', 'Email for Order Receipt')} *</label>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder={t('checkout.emailPlaceholder', 'e.g. client@domain.com')}
                      className="w-full bg-[#11100E] border border-white/15 focus:border-[#C9A45C] rounded px-3 py-2.5 text-[#F5F2EA] focus:outline-none placeholder:text-[#555]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#A7A29A] mb-1 font-medium">{t('checkout.phone', 'Phone Number (for Courier)')} *</label>
                    <input
                      type="tel"
                      required
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder={t('checkout.phonePlaceholder', 'e.g. 0100 123 4567')}
                      className="w-full bg-[#11100E] border border-white/15 focus:border-[#C9A45C] rounded px-3 py-2.5 text-[#F5F2EA] focus:outline-none placeholder:text-[#555]"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Shipping Address */}
              <div className="p-6 rounded-xl bg-[#0D0C0A] border border-[#C9A45C]/25 space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h2 className="font-cinzel text-xs font-bold uppercase tracking-widest text-[#E3C27A]">
                    {t('checkout.shippingAddress', '2. Shipping Address')}
                  </h2>
                  <span className="text-[10px] text-[#A7A29A]">{t('checkout.egyptDelivery', 'Egypt Wide Delivery')}</span>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block text-[#A7A29A] mb-1 font-medium">{t('checkout.fullName', 'Full Name')} *</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={t('checkout.fullNamePlaceholder', 'e.g. Mahmoud Dabish')}
                      className="w-full bg-[#11100E] border border-white/15 focus:border-[#C9A45C] rounded px-3 py-2.5 text-[#F5F2EA] focus:outline-none placeholder:text-[#555]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[#A7A29A] mb-1 font-medium">{t('checkout.governorate', 'Governorate')} *</label>
                      <select
                        value={governorate}
                        onChange={(e) => setGovernorate(e.target.value)}
                        className="w-full bg-[#11100E] border border-white/15 focus:border-[#C9A45C] rounded px-3 py-2.5 text-[#F5F2EA] focus:outline-none cursor-pointer"
                      >
                        {EGYPTIAN_GOVERNORATES.map((gov) => (
                          <option key={gov} value={gov} className="bg-[#11100E] text-[#F5F2EA]">
                            {getLocalizedGovernorate(gov, t)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[#A7A29A] mb-1 font-medium">{t('checkout.cityArea', 'City / Area')} *</label>
                      <input
                        type="text"
                        required
                        value={cityArea}
                        onChange={(e) => setCityArea(e.target.value)}
                        placeholder={t('checkout.cityAreaPlaceholder', 'e.g. Smouha, 6th of October, New Cairo')}
                        className="w-full bg-[#11100E] border border-white/15 focus:border-[#C9A45C] rounded px-3 py-2.5 text-[#F5F2EA] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#A7A29A] mb-1 font-medium">{t('checkout.streetAddress', 'Street Address')} *</label>
                    <input
                      type="text"
                      required
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      placeholder={t('checkout.streetAddressPlaceholder', 'e.g. Example Street, Road 90 North')}
                      className="w-full bg-[#11100E] border border-white/15 focus:border-[#C9A45C] rounded px-3 py-2.5 text-[#F5F2EA] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[#A7A29A] mb-1 font-medium">
                        {t('checkout.building', 'Building / Floor / Apartment')} <span className="text-[#8E713D] text-[10px]">{t('checkout.optional', '(Optional)')}</span>
                      </label>
                      <input
                        type="text"
                        value={building}
                        onChange={(e) => setBuilding(e.target.value)}
                        placeholder={t('checkout.buildingPlaceholder', 'e.g. Villa 42, Floor 3, Apt 12')}
                        className="w-full bg-[#11100E] border border-white/15 focus:border-[#C9A45C] rounded px-3 py-2.5 text-[#F5F2EA] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[#A7A29A] mb-1 font-medium">
                        {t('checkout.additionalDetails', 'Additional Details')} <span className="text-[#8E713D] text-[10px]">{t('checkout.optional', '(Optional)')}</span>
                      </label>
                      <input
                        type="text"
                        value={additionalDetails}
                        onChange={(e) => setAdditionalDetails(e.target.value)}
                        placeholder={t('checkout.additionalDetailsPlaceholder', 'e.g. Landmark, special delivery instructions')}
                        className="w-full bg-[#11100E] border border-white/15 focus:border-[#C9A45C] rounded px-3 py-2.5 text-[#F5F2EA] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 4: Payment Method */}
              <div className="p-6 rounded-xl bg-[#0D0C0A] border border-[#C9A45C]/25 space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h2 className="font-cinzel text-xs font-bold uppercase tracking-widest text-[#E3C27A]">
                    {t('checkout.paymentMethod', '4. Payment Selection')}
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Card')}
                    className={`p-4 rounded-lg border text-left rtl:text-right transition-all ${
                      paymentMethod === 'Card'
                        ? 'border-[#C9A45C] bg-[#C9A45C]/15 text-[#E3C27A]'
                        : 'border-white/10 bg-[#11100E] text-[#A7A29A]'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 mb-2 text-[#C9A45C]" />
                    <div className="text-xs font-bold text-[#F5F2EA]">{t('checkout.card', 'Credit / Debit Card')}</div>
                    <div className="text-[10px] text-neutral-400 mt-0.5">{t('checkout.cardDesc', 'Visa, Mastercard, Amex')}</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Instapay')}
                    className={`p-4 rounded-lg border text-left rtl:text-right transition-all ${
                      paymentMethod === 'Instapay'
                        ? 'border-[#C9A45C] bg-[#C9A45C]/15 text-[#E3C27A]'
                        : 'border-white/10 bg-[#11100E] text-[#A7A29A]'
                    }`}
                  >
                    <Smartphone className="w-5 h-5 mb-2 text-[#C9A45C]" />
                    <div className="text-xs font-bold text-[#F5F2EA]">{t('checkout.instapay', 'Instapay Egypt')}</div>
                    <div className="text-[10px] text-neutral-400 mt-0.5">{t('checkout.instapayDesc', 'Instant transfer / IPA')}</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('COD')}
                    className={`p-4 rounded-lg border text-left rtl:text-right transition-all ${
                      paymentMethod === 'COD'
                        ? 'border-[#C9A45C] bg-[#C9A45C]/15 text-[#E3C27A]'
                        : 'border-white/10 bg-[#11100E] text-[#A7A29A]'
                    }`}
                  >
                    <Banknote className="w-5 h-5 mb-2 text-[#C9A45C]" />
                    <div className="text-xs font-bold text-[#F5F2EA]">{t('checkout.cod', 'Cash on Delivery')}</div>
                    <div className="text-[10px] text-neutral-400 mt-0.5">{t('checkout.codDesc', 'Pay upon inspection')}</div>
                  </button>
                </div>
              </div>

            </div>

            {/* Right Order Summary Column (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="p-6 rounded-xl bg-[#0D0C0A] border border-[#C9A45C]/35 shadow-2xl sticky top-28 space-y-6">
                <h3 className="font-cinzel text-xs font-bold uppercase tracking-widest text-[#F5F2EA] border-b border-white/10 pb-3">
                  {t('checkout.orderSummary', 'Summary & Confirmation')}
                </h3>

                {/* Items preview */}
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div key={`${item.product.id}-${item.selectedSize}`} className="flex items-center gap-3 text-xs">
                      <img
                        src={item.product.images[0]}
                        alt={getLocalizedProductName(item.product, item.product.name)}
                        referrerPolicy="no-referrer"
                        className="w-12 h-14 rounded object-cover bg-black shrink-0 border border-white/10"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-serif-luxury text-sm text-[#F5F2EA] truncate">
                          {getLocalizedProductName(item.product, item.product.name)}
                        </div>
                        <div className="text-[11px] text-[#A7A29A]">{item.selectedSize} × {item.quantity}</div>
                        {item.quantity > item.product.stock && (
                          <div className="text-[10px] text-red-400 font-bold mt-0.5">
                            {item.product.stock === 0 ? t('product.outOfStock', 'Out of stock') : t('product.onlyStockLeft', { count: item.product.stock, defaultValue: `Only ${item.product.stock} available` })}
                          </div>
                        )}
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
                    <span>{t('cart.subtotal', 'Subtotal')}</span>
                    <span className="font-cinzel text-[#F5F2EA]">{formatPrice(subtotal)}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-400 font-semibold">
                      <span>{t('cart.privilegeDiscount', 'Privilege Discount')} ({appliedPromo})</span>
                      <span className="font-cinzel">-{formatPrice(discount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-[#A7A29A]">
                    <span>{t('cart.shipping', 'Delivery Fee')}</span>
                    <span className="text-emerald-400 font-semibold uppercase">{t('cart.complimentary', 'Complimentary')}</span>
                  </div>

                  <div className="flex justify-between text-base font-bold text-[#F5F2EA] border-t border-white/10 pt-3">
                    <span>{t('cart.total', 'Grand Total')}</span>
                    <span className="font-cinzel text-xl text-[#E3C27A]">{formatPrice(finalTotal)}</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  disabled={hasInsufficientStock}
                  isLoading={isPlacingOrder}
                  className="shadow-xl shadow-[#C9A45C]/20 text-xs tracking-widest font-bold"
                >
                  {isPlacingOrder 
                    ? t('checkout.processingOrder', 'PROCESSING...') 
                    : hasInsufficientStock 
                      ? t('checkout.insufficientStockError', 'INSUFFICIENT STOCK IN CART') 
                      : t('checkout.placeOrder', { amount: formatPrice(finalTotal), defaultValue: `PLACE ORDER (${formatPrice(finalTotal)})` })}
                </Button>

                <div className="flex items-center justify-center gap-2 text-[10px] text-[#8E713D]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{t('checkout.vaultPackaging', 'Dispatched in temperature-controlled luxury vault packaging')}</span>
                </div>
              </div>
            </div>

          </form>
        )}
      </div>
    </div>
  );
};
