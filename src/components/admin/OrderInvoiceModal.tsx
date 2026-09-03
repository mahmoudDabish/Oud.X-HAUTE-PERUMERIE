import React, { useState, useEffect } from 'react';
import { Order, Product } from '../../types';
import { X, Printer, Truck, MapPin, Phone, User, Package } from 'lucide-react';
import { useShop } from '../../context/ShopContext';

interface OrderInvoiceModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export const OrderInvoiceModal: React.FC<OrderInvoiceModalProps> = ({
  order,
  isOpen,
  onClose
}) => {
  const { products, formatPrice, updateOrderStatus, updateOrderShipping, showToast } = useShop();
  const [trackingNumber, setTrackingNumber] = useState(order?.trackingNumber || '');
  const [shippingFeeInput, setShippingFeeInput] = useState<string>(
    order ? String(order.shipping ?? order.shippingFee ?? 0) : '0'
  );
  const [isSavingShipping, setIsSavingShipping] = useState(false);
  const [currentShipping, setCurrentShipping] = useState<number>(
    order ? (order.shipping ?? order.shippingFee ?? 0) : 0
  );
  const [currentTotal, setCurrentTotal] = useState<number>(order?.total ?? 0);

  useEffect(() => {
    if (order) {
      const fee = order.shipping ?? order.shippingFee ?? 0;
      setShippingFeeInput(String(fee));
      setCurrentShipping(fee);
      setCurrentTotal(order.total ?? 0);
      setTrackingNumber(order.trackingNumber || '');
    }
  }, [order]);

  if (!isOpen || !order) return null;

  const handleStatusChange = (newStatus: Order['status']) => {
    updateOrderStatus(order.id, newStatus, trackingNumber);
  };

  const handleUpdateTracking = (e: React.FormEvent) => {
    e.preventDefault();
    updateOrderStatus(order.id, order.status, trackingNumber);
  };

  const handleUpdateShipping = async (e: React.FormEvent) => {
    e.preventDefault();
    const fee = parseFloat(shippingFeeInput);
    if (isNaN(fee) || fee < 0) {
      showToast('Invalid Amount', 'Please enter a valid shipping fee (0 or greater).', 'info');
      return;
    }

    setIsSavingShipping(true);
    try {
      const newTotal = Math.max(0, order.subtotal - (order.discount || 0) + fee);
      setCurrentShipping(fee);
      setCurrentTotal(newTotal);

      await updateOrderShipping(order.id, fee);
    } finally {
      setIsSavingShipping(false);
    }
  };

  const handlePrint = () => {
    // Remove any previous print frame
    const existingFrame = document.getElementById('oudx-print-frame');
    if (existingFrame) existingFrame.remove();

    // Create an isolated hidden iframe dedicated strictly to the invoice
    const iframe = document.createElement('iframe');
    iframe.id = 'oudx-print-frame';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.visibility = 'hidden';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    const itemsHtml = order.items.map(item => {
      const matchedProduct = products.find(
        p => p.name.toLowerCase() === item.name.toLowerCase() || p.id === (item as any).product_id
      );
      const imgUrl = item.imageUrl || item.image || matchedProduct?.images?.[0] || '';

      return `
        <tr style="border-bottom: 1px solid #e8e1d5;">
          <td style="padding: 10px 8px; vertical-align: middle;">
            <div style="display: flex; align-items: center; gap: 12px;">
              ${imgUrl ? `
                <img 
                  src="${imgUrl}" 
                  alt="${item.name}" 
                  style="width: 48px; height: 48px; object-fit: contain; border-radius: 6px; border: 1px solid #C9A45C; background: #fafafa; padding: 2px;"
                />
              ` : `
                <div style="width: 48px; height: 48px; border-radius: 6px; border: 1px solid #C9A45C; background: #fafafa; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #8E713D; font-weight: bold;">OUD.X</div>
              `}
              <div>
                <div style="font-weight: 700; font-size: 13px; color: #111;">${item.name}</div>
                <div style="font-size: 11px; color: #666; margin-top: 2px;">${item.size || '100ml'}</div>
              </div>
            </div>
          </td>
          <td style="padding: 10px 8px; text-align: center; font-weight: 600; font-size: 13px; color: #222; vertical-align: middle;">
            × ${item.quantity}
          </td>
          <td style="padding: 10px 8px; text-align: right; font-weight: 700; font-size: 13px; color: #8E713D; vertical-align: middle;">
            ${(item.price * item.quantity).toLocaleString()} EGP
          </td>
        </tr>
      `;
    }).join('');

    const discountHtml = order.discount > 0 ? `
      <div style="display: flex; justify-content: space-between; font-size: 12px; color: #8E713D; margin-bottom: 5px;">
        <span>Privilege Discount:</span>
        <span>-${order.discount.toLocaleString()} EGP</span>
      </div>
    ` : '';

    const address = order.shippingAddress;
    const addressLine1 = [address.streetAddress, address.building, address.apartment].filter(Boolean).join(', ');
    const addressLine2 = [address.area, address.governorate || address.city, 'Egypt'].filter(Boolean).join(', ');
    const additionalNote = address.additionalDetails ? `
      <div style="font-size: 11px; color: #8E713D; font-style: italic; margin-top: 3px;">Note: ${address.additionalDetails}</div>
    ` : '';

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8">
          <title>Invoice - ${order.orderNumber}</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">
          <style>
            @page {
              size: A4 portrait;
              margin: 8mm 12mm;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            html, body {
              background: #ffffff !important;
              color: #111111 !important;
              font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, sans-serif;
              font-size: 12px;
              line-height: 1.4;
              height: auto !important;
              overflow: visible !important;
            }
            .receipt-container {
              width: 100%;
              max-width: 680px;
              margin: 0 auto;
              padding: 22px 26px;
              border: 2px solid #C9A45C;
              border-radius: 12px;
              background: #ffffff !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
            .brand-title {
              font-family: 'Cinzel', serif;
              font-size: 26px;
              font-weight: 800;
              letter-spacing: 5px;
              color: #070707;
            }
            .brand-subtitle {
              font-size: 10px;
              text-transform: uppercase;
              letter-spacing: 2.5px;
              color: #8E713D;
              font-weight: 700;
              margin-top: 2px;
            }
            .brand-desc {
              font-size: 11px;
              color: #777;
              margin-top: 2px;
            }
            .meta-box {
              text-align: right;
              font-size: 11px;
              color: #444;
              line-height: 1.6;
            }
            .meta-box strong {
              color: #111;
            }
            .section-title {
              font-size: 10px;
              text-transform: uppercase;
              letter-spacing: 1.5px;
              font-weight: 700;
              color: #8E713D;
              margin-bottom: 5px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 14px;
            }
            th {
              background: #fbf9f5;
              border-top: 1px solid #C9A45C;
              border-bottom: 1px solid #C9A45C;
              padding: 8px 10px;
              font-size: 10px;
              text-transform: uppercase;
              letter-spacing: 1.5px;
              color: #8E713D;
              font-weight: 700;
            }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            <!-- Header -->
            <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #e8e1d5; padding-bottom: 14px;">
              <div>
                <div class="brand-title">OUD_X</div>
                <div class="brand-subtitle">Haute Parfumerie & Privé Reserve</div>
                <div class="brand-desc">Tax Invoice & Delivery Manifest</div>
              </div>
              <div class="meta-box">
                <div><strong>Order Ref:</strong> ${order.orderNumber}</div>
                <div><strong>Issue Date:</strong> ${order.date}</div>
                <div><strong>Payment:</strong> ${order.paymentMethod}</div>
                ${order.trackingNumber ? `<div><strong style="color: #8E713D;">Tracking:</strong> ${order.trackingNumber}</div>` : ''}
                <div style="margin-top: 4px;"><span style="display: inline-block; padding: 2px 8px; border-radius: 999px; background: #fbf3e4; border: 1px solid #C9A45C; font-size: 9px; font-weight: 700; color: #8E713D; text-transform: uppercase;">${order.status}</span></div>
              </div>
            </div>

            <!-- Customer & Shipping -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; padding: 14px 0; border-bottom: 1px solid #e8e1d5;">
              <div>
                <div class="section-title">Customer Information</div>
                <div style="font-weight: 700; font-size: 13px; color: #111;">${address.fullName}</div>
                <div style="color: #555; font-size: 12px; margin-top: 2px;">${address.phone}</div>
              </div>
              <div>
                <div class="section-title">Shipping Destination</div>
                <div style="color: #333; font-size: 12px; line-height: 1.5;">
                  ${addressLine1}<br/>
                  ${addressLine2}
                  ${additionalNote}
                </div>
              </div>
            </div>

            <!-- Items Table -->
            <table>
              <thead>
                <tr>
                  <th style="text-align: left;">Fragrance Item</th>
                  <th style="text-align: center; width: 60px;">Qty</th>
                  <th style="text-align: right; width: 110px;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <!-- Financial Summary -->
            <div style="margin-top: 14px; padding-top: 10px; border-top: 1px solid #e8e1d5; display: flex; justify-content: flex-end;">
              <div style="width: 240px;">
                <div style="display: flex; justify-content: space-between; font-size: 12px; color: #555; margin-bottom: 5px;">
                  <span>Subtotal:</span>
                  <span style="font-weight: 600; color: #111;">${order.subtotal.toLocaleString()} EGP</span>
                </div>
                ${discountHtml}
                <div style="display: flex; justify-content: space-between; font-size: 12px; color: #555; margin-bottom: 5px;">
                  <span>Shipping Fee:</span>
                  <span style="font-weight: 600; color: #111;">
                    ${currentShipping === 0 ? '0 EGP (FREE)' : `${currentShipping.toLocaleString()} EGP`}
                  </span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 15px; font-weight: 800; color: #111; padding-top: 8px; border-top: 2px solid #C9A45C; margin-top: 4px;">
                  <span>Total Amount:</span>
                  <span style="font-family: 'Cinzel', serif; color: #8E713D;">${currentTotal.toLocaleString()} EGP</span>
                </div>
              </div>
            </div>

            <!-- Authentic Footer Stamp -->
            <div style="margin-top: 20px; padding-top: 12px; border-top: 1px dashed #d0c4b2; text-align: center;">
              <div style="font-family: 'Cinzel', serif; font-size: 10px; font-weight: 700; letter-spacing: 2px; color: #8E713D;">
                OUD.X PRIVÉ RESERVE • AUTHENTICITY CERTIFIED
              </div>
              <div style="font-size: 10px; color: #888; margin-top: 2px;">
                Handcrafted in Grasse & Dubai • Luxury Perfume Masterpieces • Official Dispatch Receipt
              </div>
            </div>
          </div>
        </body>
      </html>
    `);
    doc.close();

    const trigger = () => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        iframe.remove();
      }, 3000);
    };

    const images = doc.images;
    let loaded = 0;
    const totalImgs = images.length;

    if (totalImgs === 0) {
      setTimeout(trigger, 150);
    } else {
      for (let i = 0; i < totalImgs; i++) {
        if (images[i].complete) {
          loaded++;
        } else {
          images[i].onload = images[i].onerror = () => {
            loaded++;
            if (loaded >= totalImgs) trigger();
          };
        }
      }
      if (loaded >= totalImgs) {
        setTimeout(trigger, 150);
      } else {
        setTimeout(trigger, 1200);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-[#0D0C0A] border border-[#C9A45C]/40 rounded-2xl shadow-2xl flex flex-col overflow-hidden my-auto">
        {/* Modal Bar - Hidden in Print */}
        <div className="no-print p-6 border-b border-[#C9A45C]/20 flex items-center justify-between bg-[#151310]/80 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#C9A45C]/20 border border-[#C9A45C] flex items-center justify-center text-[#E3C27A]">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-cinzel text-lg font-bold text-[#F5F2EA] tracking-wide">
                  Invoice & Order: {order.orderNumber}
                </h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    order.status === 'Delivered'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : order.status === 'Cancelled'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {order.status}
                </span>
              </div>
              <p className="text-xs text-[#A7A29A]">Placed on {order.date} • Luxury Fulfillment Dispatch</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#C9A45C]/30 hover:border-[#C9A45C] text-xs text-[#E3C27A] hover:bg-[#C9A45C]/10 transition-colors cursor-pointer"
              title="Print Luxury Invoice"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print Receipt</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-[#A7A29A] hover:text-[#F5F2EA] hover:bg-white/5 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
          {/* Quick Status Control & Shipping Fee Bar for Admin - Hidden in Print */}
          <div className="no-print p-4 rounded-xl bg-[#151310]/80 border border-[#C9A45C]/30 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase tracking-[2px] font-bold text-[#8E713D] block">
                  Change Order Status
                </span>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  {(['Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'] as Order['status'][]).map(
                    st => (
                      <button
                        key={st}
                        onClick={() => handleStatusChange(st)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wider transition-all cursor-pointer ${
                          order.status === st
                            ? 'bg-[#C9A45C] text-[#070707] shadow-md shadow-[#C9A45C]/30 font-bold'
                            : 'bg-[#070707] text-[#A7A29A] border border-white/10 hover:border-[#C9A45C]/50 hover:text-[#F5F2EA]'
                        }`}
                      >
                        {st}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Courier Tracking Form */}
              <form onSubmit={handleUpdateTracking} className="flex items-center gap-2">
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={e => setTrackingNumber(e.target.value)}
                  placeholder="Courier Tracking #"
                  className="px-3 py-1.5 bg-[#070707] border border-white/15 rounded-lg text-xs text-[#F5F2EA] focus:outline-none focus:border-[#C9A45C]"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-[#C9A45C]/20 border border-[#C9A45C]/40 text-xs text-[#E3C27A] font-bold rounded-lg hover:bg-[#C9A45C]/30 transition-colors cursor-pointer"
                >
                  Save
                </button>
              </form>
            </div>

            {/* Editable Shipping Fee Form */}
            <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase tracking-[2px] font-bold text-[#8E713D] block">
                  Manual Shipping Fee Control
                </span>
                <p className="text-[11px] text-[#A7A29A]">
                  Default is 0 EGP (free delivery). Update fee anytime to recalculate order total.
                </p>
              </div>

              <form onSubmit={handleUpdateShipping} className="flex items-center gap-2 self-start sm:self-auto">
                <div className="flex items-center gap-1.5 bg-[#070707] border border-white/15 focus-within:border-[#C9A45C] rounded-lg px-2.5 py-1 text-xs">
                  <span className="text-[#8E713D] font-bold text-[10px] uppercase tracking-wider whitespace-nowrap">
                    Fee:
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={shippingFeeInput}
                    onChange={e => setShippingFeeInput(e.target.value)}
                    className="w-16 bg-transparent text-[#F5F2EA] focus:outline-none text-right font-semibold text-xs"
                    placeholder="0"
                  />
                  <span className="text-[10px] text-[#A7A29A]">EGP</span>
                </div>
                <button
                  type="submit"
                  disabled={isSavingShipping}
                  className="px-3 py-1.5 bg-[#C9A45C]/20 border border-[#C9A45C]/40 text-xs text-[#E3C27A] font-bold rounded-lg hover:bg-[#C9A45C]/30 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isSavingShipping ? 'Saving...' : 'Save'}
                </button>
              </form>
            </div>
          </div>

          {/* On-screen Luxury Invoice Display */}
          <div className="printable-receipt p-6 rounded-2xl bg-[#151310]/60 border border-[#C9A45C]/30 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/10 pb-6 gap-4">
              <div>
                <span className="font-cinzel text-xl font-bold tracking-[4px] text-[#F5F2EA]">OUD_X</span>
                <p className="text-[10px] uppercase tracking-[2px] text-[#C9A45C]">Haute Parfumerie & Privé Reserve</p>
                <p className="text-xs text-[#A7A29A] mt-1">Tax Invoice & Delivery Manifest</p>
              </div>

              <div className="text-left sm:text-right text-xs text-[#A7A29A] space-y-1">
                <div><strong className="text-[#F5F2EA]">Order Ref:</strong> {order.orderNumber}</div>
                <div><strong className="text-[#F5F2EA]">Issue Date:</strong> {order.date}</div>
                <div><strong className="text-[#F5F2EA]">Payment:</strong> {order.paymentMethod}</div>
                {order.trackingNumber && (
                  <div><strong className="text-[#C9A45C]">Tracking:</strong> {order.trackingNumber}</div>
                )}
              </div>
            </div>

            {/* Customer & Shipping Destination */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#C9A45C]">
                  <User className="w-3.5 h-3.5" /> Customer Information
                </div>
                <div className="text-xs text-[#F5F2EA] font-semibold">{order.shippingAddress.fullName}</div>
                <div className="flex items-center gap-1.5 text-xs text-[#A7A29A]">
                  <Phone className="w-3 h-3 text-[#8E713D]" /> {order.shippingAddress.phone}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#C9A45C]">
                  <MapPin className="w-3.5 h-3.5" /> Shipping Address
                </div>
                <div className="text-xs text-[#A7A29A] leading-relaxed">
                  {order.shippingAddress.streetAddress}
                  {order.shippingAddress.building && `, ${order.shippingAddress.building}`}
                  {order.shippingAddress.apartment && ` • ${order.shippingAddress.apartment}`}
                  {order.shippingAddress.additionalDetails && (
                    <span className="block text-[11px] text-[#C9A45C] mt-0.5">
                      Note: {order.shippingAddress.additionalDetails}
                    </span>
                  )}
                  <br />
                  {order.shippingAddress.area && `${order.shippingAddress.area}, `}
                  {order.shippingAddress.governorate || order.shippingAddress.city}, Egypt
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="border border-[#C9A45C]/20 rounded-xl overflow-hidden mt-6">
              <div className="p-3 bg-[#070707] border-b border-white/10 grid grid-cols-12 text-[10px] uppercase font-bold tracking-wider text-[#C9A45C]">
                <div className="col-span-7">Fragrance Item</div>
                <div className="col-span-2 text-center">Qty</div>
                <div className="col-span-3 text-right">Price</div>
              </div>

              <div className="divide-y divide-white/5 bg-[#151310]/50">
                {order.items.map((item, idx) => {
                  const matchedProduct = products.find(
                    p => p.name.toLowerCase() === item.name.toLowerCase() || p.id === (item as any).product_id
                  );
                  const resolvedImage = item.imageUrl || item.image || matchedProduct?.images?.[0];

                  return (
                    <div key={idx} className="p-3.5 grid grid-cols-12 items-center text-xs">
                      <div className="col-span-7 flex items-center gap-3">
                        {resolvedImage ? (
                          <img
                            src={resolvedImage}
                            alt={item.name}
                            loading="lazy"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                            className="w-12 h-12 object-contain rounded-lg bg-black/60 border border-[#C9A45C]/20 shrink-0 p-0.5"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-black/60 border border-[#C9A45C]/20 flex items-center justify-center text-[#C9A45C]/40 shrink-0">
                            <Package className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-[#F5F2EA]">{item.name}</div>
                          <div className="text-[11px] text-[#A7A29A]">{item.size}</div>
                        </div>
                      </div>
                      <div className="col-span-2 text-center text-[#F5F2EA] font-semibold">
                        × {item.quantity}
                      </div>
                      <div className="col-span-3 text-right font-bold text-[#F0D9A4]">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="flex flex-col items-end space-y-1.5 text-xs pt-4 border-t border-white/10">
              <div className="flex justify-between w-64 text-[#A7A29A]">
                <span>Subtotal:</span>
                <span className="text-[#F5F2EA]">{formatPrice(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between w-64 text-[#E3C27A]">
                  <span>Privilege Discount:</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between w-64 text-[#A7A29A]">
                <span>Shipping Fee:</span>
                <span className="text-[#F5F2EA]">
                  {currentShipping === 0 ? '0 EGP (FREE)' : formatPrice(currentShipping)}
                </span>
              </div>
              <div className="flex justify-between w-64 pt-2 border-t border-[#C9A45C]/30 text-sm font-bold text-[#F0D9A4]">
                <span>Total Amount:</span>
                <span className="font-cinzel text-base text-[#C9A45C]">{formatPrice(currentTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
