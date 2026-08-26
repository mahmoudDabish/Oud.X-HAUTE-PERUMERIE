import React, { useState } from 'react';
import { Order } from '../../types';
import { X, Printer, Truck, CheckCircle2, AlertCircle, Clock, MapPin, Phone, User, ShieldCheck } from 'lucide-react';
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
  const { formatPrice, updateOrderStatus } = useShop();
  const [trackingNumber, setTrackingNumber] = useState(order?.trackingNumber || '');

  if (!isOpen || !order) return null;

  const handleStatusChange = (newStatus: Order['status']) => {
    updateOrderStatus(order.id, newStatus, trackingNumber);
  };

  const handleUpdateTracking = (e: React.FormEvent) => {
    e.preventDefault();
    updateOrderStatus(order.id, order.status, trackingNumber);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-[#0D0C0A] border border-[#C9A45C]/40 rounded-2xl shadow-2xl flex flex-col overflow-hidden my-auto">
        {/* Modal Bar */}
        <div className="p-6 border-b border-[#C9A45C]/20 flex items-center justify-between bg-[#151310]/80 backdrop-blur-md shrink-0">
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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#C9A45C]/30 hover:border-[#C9A45C] text-xs text-[#E3C27A] hover:bg-[#C9A45C]/10 transition-colors"
              title="Print Luxury Invoice"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print Receipt</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-[#A7A29A] hover:text-[#F5F2EA] hover:bg-white/5 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
          {/* Quick Status Control Bar for Admin */}
          <div className="p-4 rounded-xl bg-[#151310]/80 border border-[#C9A45C]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
                      className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wider transition-all ${
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
                className="px-3 py-1.5 bg-[#C9A45C]/20 border border-[#C9A45C]/40 text-xs text-[#E3C27A] font-bold rounded-lg hover:bg-[#C9A45C]/30 transition-colors"
              >
                Save
              </button>
            </form>
          </div>

          {/* Printable Invoice Header */}
          <div className="p-6 rounded-2xl bg-[#151310]/40 border border-[#C9A45C]/20 space-y-6">
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
                  {order.shippingAddress.streetAddress}, {order.shippingAddress.building}
                  {order.shippingAddress.apartment && ` • ${order.shippingAddress.apartment}`}<br />
                  {order.shippingAddress.area}, {order.shippingAddress.city}, Egypt
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
                {order.items.map((item, idx) => (
                  <div key={idx} className="p-3.5 grid grid-cols-12 items-center text-xs">
                    <div className="col-span-7 flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        referrerPolicy="no-referrer"
                        className="w-10 h-12 object-cover rounded-lg bg-black border border-[#C9A45C]/20 shrink-0"
                      />
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
                ))}
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
                <span>Courier Express Shipping:</span>
                <span>{order.shipping === 0 ? 'FREE' : formatPrice(order.shipping)}</span>
              </div>
              <div className="flex justify-between w-64 pt-2 border-t border-[#C9A45C]/30 text-sm font-bold text-[#F0D9A4]">
                <span>Total Amount:</span>
                <span className="font-cinzel text-base text-[#C9A45C]">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
