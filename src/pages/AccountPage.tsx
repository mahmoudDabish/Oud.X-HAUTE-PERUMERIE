import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useShop } from '../context/ShopContext';
import { Product, Order, BrandItem } from '../types';
import { orderService } from '../services/orderService';
import {
  Package,
  Boxes,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit3,
  Copy,
  ExternalLink,
  RotateCcw,
  Download,
  CheckCircle2,
  Clock,
  Truck,
  Eye,
  ShieldCheck,
  Sparkles,
  ArrowUpRight,
  Layers,
  BarChart3,
  XCircle,
  FileSpreadsheet,
  UploadCloud,
  LogOut,
  Calendar,
  MapPin,
  Phone,
  CreditCard,
  ChevronRight,
  User as UserIcon,
  Crown,
  Tags,
  Image as ImageIcon
} from 'lucide-react';
import { AddEditProductModal } from '../components/admin/AddEditProductModal';
import { AddEditBrandModal, ICON_PRESETS } from '../components/admin/AddEditBrandModal';
import { OrderInvoiceModal } from '../components/admin/OrderInvoiceModal';
import { StorageMigrationModal } from '../components/admin/StorageMigrationModal';
import {
  getLocalizedCategory,
  getLocalizedGender,
  getLocalizedBadge,
  getLocalizedOrderStatus,
  getLocalizedPaymentMethod,
  getLocalizedGovernorate,
  formatDateLocalized,
  formatPriceLocalized,
  getLocalizedProductName,
  getLocalizedProductSubtitle
} from '../i18n/presentation';

export const AccountPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    adjustStock,
    quickAdjustStock,
    resetProductsToDefault,
    brands,
    addBrand,
    updateBrand,
    deleteBrand,
    resetBrandsToDefault,
    allOrders,
    updateOrderStatus,
    deleteOrder,
    formatPrice,
    navigateTo,
    showToast,
    user,
    logout
  } = useShop();

  // Customer state
  const [customerOrders, setCustomerOrders] = useState<Order[]>(user?.orders || []);
  const [isLoadingCustomerOrders, setIsLoadingCustomerOrders] = useState(false);
  const [customerActiveTab, setCustomerActiveTab] = useState<'orders' | 'privileges'>('orders');
  const [customerInvoiceOrder, setCustomerInvoiceOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      setIsLoadingCustomerOrders(true);
      orderService.getUserOrders(user.id).then(({ data, error }) => {
        if (!error && data) {
          setCustomerOrders(data);
        }
        setIsLoadingCustomerOrders(false);
      });
    }
  }, [user]);

  // Guest State: Not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-[#070707] text-[#F5F2EA] py-24 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center">
        <div className="max-w-md w-full p-8 sm:p-10 rounded-2xl bg-[#0D0C0A] border border-[#C9A45C]/35 shadow-2xl text-center space-y-6 relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#C9A45C] to-transparent" />
          <div className="w-16 h-16 rounded-full bg-[#151310] border border-[#C9A45C]/40 mx-auto flex items-center justify-center text-[#E3C27A]">
            <Crown className="w-8 h-8 text-[#C9A45C]" />
          </div>
          <div className="space-y-2">
            <span className="font-cinzel text-xs uppercase tracking-[3px] text-[#C9A45C] font-semibold">
              {t('account.memberAtelier', 'OUD_X PRIVÉ ATELIER')}
            </span>
            <h1 className="font-serif-luxury text-2xl sm:text-3xl text-[#F5F2EA]">
              {t('account.clientAuth', 'Client Authentication')}
            </h1>
            <p className="text-xs text-[#A7A29A] leading-relaxed">
              {t('account.clientAuthDesc', 'Sign in to view your orders, tracking status, private acquisitions, and member privileges.')}
            </p>
          </div>
          <div className="pt-4 flex flex-col gap-3">
            <button
              onClick={() => navigateTo('/auth')}
              className="w-full py-3 rounded-full bg-[#C9A45C] hover:bg-[#E3C27A] text-[#070707] font-bold text-xs uppercase tracking-[2px] transition-colors cursor-pointer"
            >
              {t('account.signInRegister', 'Sign In / Register')}
            </button>
            <button
              onClick={() => navigateTo('/shop')}
              className="w-full py-3 rounded-full bg-transparent border border-white/15 hover:border-[#C9A45C]/50 text-[#A7A29A] hover:text-[#F5F2EA] font-semibold text-xs uppercase tracking-[2px] transition-colors cursor-pointer"
            >
              {t('cart.exploreFragrances', 'Return to Boutique')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Customer Account Portal (Non-Admin View)
  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#070707] text-[#F5F2EA] pb-24">
        {/* Breadcrumb */}
        <div className="bg-[#0D0C0A] border-b border-white/5 py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <nav className="flex items-center gap-2 text-xs text-[#A7A29A] uppercase tracking-wider">
              <button onClick={() => navigateTo('/')} className="hover:text-[#F5F2EA]">{t('nav.home', 'Home')}</button>
              <ChevronRight className="w-3 h-3 text-[#8E713D] rtl-flip" />
              <span className="text-[#C9A45C]">{t('account.clientProfile', 'Client Portal')}</span>
            </nav>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 text-xs text-[#A7A29A] hover:text-red-400 transition-colors uppercase tracking-wider cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 rtl-flip" /> {t('account.signOut', 'Sign Out')}
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-8">
          {/* Profile Overview Card */}
          <div className="p-6 sm:p-8 rounded-2xl bg-[#0D0C0A] border border-[#C9A45C]/30 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#C9A45C]/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#C9A45C]/30 to-[#151310] border border-[#C9A45C] flex items-center justify-center text-[#E3C27A] font-cinzel text-2xl font-bold">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'P'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#C9A45C]/15 border border-[#C9A45C]/40 text-[10px] font-bold tracking-wider text-[#E3C27A] uppercase flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> {user.tier || t('account.privileges.tier', 'Oud Privé Member')}
                    </span>
                  </div>
                  <h1 className="font-serif-luxury text-2xl sm:text-3xl text-[#F5F2EA] mt-1">
                    {user.name}
                  </h1>
                  <p className="text-xs text-[#A7A29A]">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 border-t sm:border-t-0 sm:border-l rtl:sm:border-l-0 rtl:sm:border-r border-white/10 pt-4 sm:pt-0 sm:pl-6 rtl:sm:pl-0 rtl:sm:pr-6">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#A7A29A] block">{t('account.privileges.points', 'Privilege Points')}</span>
                  <span className="font-cinzel text-2xl font-bold text-[#E3C27A]">{user.points || 250}</span>
                </div>
                <button
                  onClick={() => navigateTo('/shop')}
                  className="px-5 py-2.5 rounded-full bg-[#C9A45C] hover:bg-[#E3C27A] text-[#070707] font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shrink-0"
                >
                  {t('nav.shop', 'Explore Boutique')}
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-white/10 gap-6 text-xs uppercase font-semibold tracking-wider">
            <button
              onClick={() => setCustomerActiveTab('orders')}
              className={`pb-3 transition-colors relative flex items-center gap-2 cursor-pointer ${
                customerActiveTab === 'orders'
                  ? 'text-[#E3C27A] border-b-2 border-[#C9A45C]'
                  : 'text-[#A7A29A] hover:text-[#F5F2EA]'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>{t('account.tabs.orders', 'Acquisition History')}</span>
              <span className="px-2 py-0.5 rounded-full bg-[#151310] border border-white/10 text-[10px] font-mono">
                {customerOrders.length}
              </span>
            </button>
            <button
              onClick={() => setCustomerActiveTab('privileges')}
              className={`pb-3 transition-colors relative flex items-center gap-2 cursor-pointer ${
                customerActiveTab === 'privileges'
                  ? 'text-[#E3C27A] border-b-2 border-[#C9A45C]'
                  : 'text-[#A7A29A] hover:text-[#F5F2EA]'
              }`}
            >
              <Crown className="w-4 h-4" />
              <span>{t('account.tabs.privileges', 'Privé Concierge & Benefits')}</span>
            </button>
          </div>

          {/* Orders Tab */}
          {customerActiveTab === 'orders' && (
            <div className="space-y-6">
              {isLoadingCustomerOrders ? (
                <div className="py-20 flex flex-col items-center justify-center space-y-4">
                  <div className="w-10 h-10 border-4 border-[#C9A45C]/30 border-t-[#C9A45C] rounded-full animate-spin" />
                  <p className="text-xs text-[#A7A29A]">{t('account.loadingOrders', 'Retrieving your private order vault...')}</p>
                </div>
              ) : customerOrders.length === 0 ? (
                <div className="py-16 text-center rounded-2xl bg-[#0D0C0A] border border-white/5 p-8 space-y-4 max-w-lg mx-auto">
                  <div className="w-16 h-16 rounded-full bg-[#151310] border border-[#C9A45C]/20 mx-auto flex items-center justify-center text-[#C9A45C]">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <h3 className="font-serif-luxury text-xl text-[#F5F2EA]">{t('account.ordersEmpty', 'No Past Acquisitions')}</h3>
                  <p className="text-xs text-[#A7A29A] leading-relaxed">
                    {t('account.ordersEmptyDesc', 'You have not placed any orders yet. Experience our mastercrafted French-Arabian fragrances.')}
                  </p>
                  <button
                    onClick={() => navigateTo('/shop')}
                    className="px-6 py-2.5 rounded-full bg-[#C9A45C] hover:bg-[#E3C27A] text-[#070707] font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    {t('cart.exploreFragrances', 'Browse Collections')}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {customerOrders.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-6 rounded-2xl bg-[#0D0C0A] border border-[#C9A45C]/20 hover:border-[#C9A45C]/40 transition-colors shadow-lg space-y-5"
                    >
                      {/* Order Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-4 gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="font-mono text-sm font-bold text-[#E3C27A]">
                              {ord.orderNumber}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider border bg-[#C9A45C]/10 border-[#C9A45C]/30 text-[#E3C27A]">
                              {getLocalizedOrderStatus(ord.status, t)}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#A7A29A]">
                            {t('account.date', { date: formatDateLocalized(ord.date, i18n.language), defaultValue: `Acquired on ${ord.date}` })}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-cinzel text-lg font-bold text-[#F5F2EA]">
                            {formatPrice(ord.total)}
                          </span>
                          <button
                            onClick={() => setCustomerInvoiceOrder(ord)}
                            className="px-3.5 py-1.5 rounded-lg bg-[#151310] border border-[#C9A45C]/30 hover:border-[#C9A45C] text-xs text-[#E3C27A] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>{t('account.viewInvoice', 'Invoice')}</span>
                          </button>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="divide-y divide-white/5">
                        {ord.items.map((it, idx) => {
                          const matched = products.find(
                            p => p.name.toLowerCase() === it.name.toLowerCase() || p.id === (it as any).product_id
                          );
                          const resolvedName = getLocalizedProductName(matched, it.name);

                          return (
                            <div key={idx} className="py-3 flex items-center justify-between text-xs gap-4">
                              <div className="flex items-center gap-3 min-w-0">
                                {it.imageUrl || it.image ? (
                                  <img
                                    src={it.imageUrl || it.image}
                                    alt={resolvedName}
                                    className="w-12 h-14 object-contain rounded bg-black border border-white/10 shrink-0"
                                  />
                                ) : (
                                  <div className="w-12 h-14 rounded bg-black border border-white/10 flex items-center justify-center text-[#C9A45C]/50 shrink-0 font-cinzel text-xs font-bold">
                                    OUD
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <h4 className="font-semibold text-[#F5F2EA] truncate">{resolvedName}</h4>
                                  <p className="text-[11px] text-[#A7A29A]">
                                    {it.size} • {t('admin.orders.tableHeaders.items', 'Qty')}: {it.quantity}
                                  </p>
                                </div>
                              </div>
                              <span className="font-cinzel font-bold text-[#E3C27A] shrink-0">
                                {formatPrice(it.price * it.quantity)}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Details & Destination */}
                      <div className="pt-3 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[#A7A29A] gap-3">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#C9A45C] shrink-0" />
                          <span className="truncate">
                            {ord.shippingAddress?.streetAddress || ''}
                            {ord.shippingAddress?.area ? `, ${ord.shippingAddress.area}` : ''}
                            {ord.shippingAddress?.governorate ? `, ${getLocalizedGovernorate(ord.shippingAddress.governorate, t)}` : ''}
                          </span>
                        </div>

                        {ord.trackingNumber && (
                          <div className="flex items-center gap-1.5 text-xs text-[#E3C27A]">
                            <Truck className="w-3.5 h-3.5 rtl-flip" />
                            <span>{t('account.tracking', { number: ord.trackingNumber, defaultValue: `Tracking: ${ord.trackingNumber}` })}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Privileges Tab */}
          {customerActiveTab === 'privileges' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-[#0D0C0A] border border-[#C9A45C]/30 space-y-3">
                <ShieldCheck className="w-8 h-8 text-[#C9A45C]" />
                <h3 className="font-cinzel text-base font-bold text-[#F5F2EA]">{t('account.privileges.benefit1Title', '100% Certified Authentic')}</h3>
                <p className="text-xs text-[#A7A29A] leading-relaxed">
                  {t('account.privileges.benefit1Desc', 'Every flacon is bottled from private reserve distillations in Grasse and Dubai, certified with individual batch serialization.')}
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#0D0C0A] border border-[#C9A45C]/30 space-y-3">
                <Truck className="w-8 h-8 text-[#C9A45C] rtl-flip" />
                <h3 className="font-cinzel text-base font-bold text-[#F5F2EA]">{t('account.privileges.benefit2Title', 'White-Glove VIP Delivery')}</h3>
                <p className="text-xs text-[#A7A29A] leading-relaxed">
                  {t('account.privileges.benefit2Desc', 'Complimentary secure courier delivery across all 27 Egyptian governorates on orders above 2,500 EGP.')}
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#0D0C0A] border border-[#C9A45C]/30 space-y-3">
                <Sparkles className="w-8 h-8 text-[#C9A45C]" />
                <h3 className="font-cinzel text-base font-bold text-[#F5F2EA]">{t('account.privileges.benefit3Title', 'Private WhatsApp Concierge')}</h3>
                <p className="text-xs text-[#A7A29A] leading-relaxed">
                  {t('account.privileges.benefit3Desc', 'Direct access to our olfactory sommelier for bespoke fragrance consultations and early access to vintage casks.')}
                </p>
                <button
                  onClick={() => window.open('https://wa.me/201127977819?text=Hello%20OUD.X%20Sommelier,%20I%20would%20like%20a%20private%20fragrance%20consultation.', '_blank')}
                  className="pt-2 text-xs font-bold text-[#C9A45C] hover:text-[#E3C27A] flex items-center gap-1 cursor-pointer"
                >
                  {t('account.privileges.contactConcierge', 'Contact Concierge →')}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Customer Invoice Modal */}
        {customerInvoiceOrder && (
          <OrderInvoiceModal
            isOpen={!!customerInvoiceOrder}
            order={customerInvoiceOrder}
            onClose={() => setCustomerInvoiceOrder(null)}
          />
        )}
      </div>
    );
  }

  // Tab navigation
  const [activeTab, setActiveTab] = useState<'inventory' | 'orders' | 'brands' | 'alerts' | 'analytics'>('inventory');

  // Modals state
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [isMigrationModalOpen, setIsMigrationModalOpen] = useState(false);

  // Brands State
  const [isAddEditBrandModalOpen, setIsAddEditBrandModalOpen] = useState(false);
  const [brandToEdit, setBrandToEdit] = useState<BrandItem | null>(null);
  const [brandToDelete, setBrandToDelete] = useState<BrandItem | null>(null);
  const [brandSearchQuery, setBrandSearchQuery] = useState('');
  const [brandStatusFilter, setBrandStatusFilter] = useState<'all' | 'active' | 'hidden'>('all');

  // Inventory Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out' | 'healthy'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'stock-asc' | 'stock-desc' | 'price-asc' | 'price-desc' | 'name'>('stock-asc');

  // Orders Filters
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');

  // Computed Metrics
  const totalStockUnits = useMemo(() => {
    return products.reduce((acc, p) => acc + (p.stock || 0), 0);
  }, [products]);

  const totalCatalogValue = useMemo(() => {
    return products.reduce((acc, p) => acc + (p.price * (p.stock || 0)), 0);
  }, [products]);

  const lowStockProducts = useMemo(() => {
    return products.filter(p => (p.stock || 0) > 0 && (p.stock || 0) <= 5);
  }, [products]);

  const outOfStockProducts = useMemo(() => {
    return products.filter(p => (p.stock || 0) === 0);
  }, [products]);

  const totalOrdersRevenue = useMemo(() => {
    return allOrders.reduce((acc, ord) => (ord.status !== 'Cancelled' ? acc + ord.total : acc), 0);
  }, [allOrders]);

  const pendingOrdersCount = useMemo(() => {
    return allOrders.filter(ord => ord.status === 'Processing' || ord.status === 'Shipped' || ord.status === 'Out for Delivery').length;
  }, [allOrders]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(q);
        const matchesBrand = product.brand.toLowerCase().includes(q);
        const matchesFamily = product.fragranceFamily.toLowerCase().includes(q);
        const matchesNotes =
          product.notes?.top?.some(n => n.toLowerCase().includes(q)) ||
          product.notes?.heart?.some(n => n.toLowerCase().includes(q)) ||
          product.notes?.base?.some(n => n.toLowerCase().includes(q));
        if (!matchesName && !matchesBrand && !matchesFamily && !matchesNotes) return false;
      }

      // Stock filter
      if (stockFilter === 'low' && ((product.stock || 0) > 5 || (product.stock || 0) === 0)) return false;
      if (stockFilter === 'out' && (product.stock || 0) > 0) return false;
      if (stockFilter === 'healthy' && (product.stock || 0) <= 5) return false;

      // Category filter
      if (categoryFilter !== 'all' && product.category !== categoryFilter) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'stock-asc') return (a.stock || 0) - (b.stock || 0);
      if (sortBy === 'stock-desc') return (b.stock || 0) - (a.stock || 0);
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });
  }, [products, searchQuery, stockFilter, categoryFilter, sortBy]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return allOrders.filter(order => {
      if (orderSearchQuery.trim()) {
        const q = orderSearchQuery.toLowerCase();
        const matchesNum = order.orderNumber.toLowerCase().includes(q);
        const matchesCustomer = order.shippingAddress.fullName.toLowerCase().includes(q);
        const matchesPhone = order.shippingAddress.phone.toLowerCase().includes(q);
        const matchesGov = (order.shippingAddress.governorate || '').toLowerCase().includes(q);
        const matchesCity = (order.shippingAddress.city || '').toLowerCase().includes(q);
        const matchesArea = (order.shippingAddress.area || '').toLowerCase().includes(q);
        const matchesItems = order.items.some(it => it.name.toLowerCase().includes(q));
        if (!matchesNum && !matchesCustomer && !matchesPhone && !matchesGov && !matchesCity && !matchesArea && !matchesItems) return false;
      }

      if (orderStatusFilter !== 'all' && order.status !== orderStatusFilter) return false;

      return true;
    });
  }, [allOrders, orderSearchQuery, orderStatusFilter]);

  // Filtered Brands
  const filteredBrands = useMemo(() => {
    return brands
      .filter(brand => {
        if (brandSearchQuery.trim()) {
          const q = brandSearchQuery.toLowerCase();
          const matchesEn = brand.name.toLowerCase().includes(q);
          const matchesAr = (brand.nameAr || '').toLowerCase().includes(q);
          const matchesTag = (brand.tag || '').toLowerCase().includes(q);
          if (!matchesEn && !matchesAr && !matchesTag) return false;
        }
        if (brandStatusFilter === 'active' && !brand.isActive) return false;
        if (brandStatusFilter === 'hidden' && brand.isActive) return false;
        return true;
      })
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }, [brands, brandSearchQuery, brandStatusFilter]);

  // Handlers
  const handleOpenAddBrandModal = () => {
    setBrandToEdit(null);
    setIsAddEditBrandModalOpen(true);
  };

  const handleOpenEditBrandModal = (brand: BrandItem) => {
    setBrandToEdit(brand);
    setIsAddEditBrandModalOpen(true);
  };

  const handleSaveBrand = (brandData: Omit<BrandItem, 'id'>) => {
    if (brandToEdit) {
      updateBrand(brandToEdit.id, brandData);
      showToast(
        t('toast.brandUpdated', 'Brand Updated'),
        t('toast.brandUpdatedMsg', { name: brandData.name, defaultValue: `${brandData.name} updated successfully` }),
        'gold'
      );
    } else {
      addBrand(brandData);
      showToast(
        t('toast.brandAdded', 'Brand Added'),
        t('toast.brandAddedMsg', { name: brandData.name, defaultValue: `${brandData.name} added to luxury collections` }),
        'gold'
      );
    }
    setIsAddEditBrandModalOpen(false);
    setBrandToEdit(null);
  };

  const handleToggleBrandActive = (brand: BrandItem) => {
    updateBrand(brand.id, { isActive: !brand.isActive });
    showToast(
      brand.isActive ? t('toast.brandHidden', 'Brand Hidden') : t('toast.brandActivated', 'Brand Activated'),
      brand.name,
      'info'
    );
  };

  const handleOpenAddModal = () => {
    setProductToEdit(null);
    setIsAddEditModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setProductToEdit(product);
    setIsAddEditModalOpen(true);
  };

  const handleSaveProduct = (productData: Partial<Product>) => {
    if (productToEdit) {
      updateProduct(productToEdit.id, productData);
    } else {
      addProduct(productData);
    }
  };

  const handleDuplicateProduct = (product: Product) => {
    const duplicated: Partial<Product> = {
      ...product,
      name: `${product.name} (Reserve Batch)`,
      slug: `${product.slug}-reserve-${Math.floor(100 + Math.random() * 900)}`,
      stock: 15,
      isNew: true,
      badge: 'LIMITED'
    };
    addProduct(duplicated);
    showToast(
      t('toast.productDuplicated', 'Product Duplicated'),
      t('toast.productDuplicatedMsg', { name: product.name, defaultValue: `Created reserve copy of ${product.name}` }),
      'gold'
    );
  };

  const handleBatchRestockLow = () => {
    if (lowStockProducts.length === 0 && outOfStockProducts.length === 0) {
      showToast(
        t('toast.inventoryOptimal', 'Inventory Optimal'),
        t('toast.inventoryOptimalMsg', 'No low stock products to restock at this time'),
        'info'
      );
      return;
    }
    products.forEach(p => {
      if ((p.stock || 0) <= 5) {
        adjustStock(p.id, (p.stock || 0) + 10);
      }
    });
    showToast(
      t('toast.batchRestockComplete', 'Batch Restock Complete'),
      t('toast.batchRestockCompleteMsg', 'Added +10 units to all low/depleted stock items'),
      'gold'
    );
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(products, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `oudx_inventory_catalog_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast(
      t('toast.catalogExported', 'Catalog Exported'),
      t('toast.catalogExportedMsg', 'Downloaded full inventory dataset as JSON'),
      'gold'
    );
  };

  return (
    <div className="min-h-screen bg-[#070707] text-[#F5F2EA] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Executive Header Banner */}
        <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#12100C] via-[#1A1610] to-[#0D0C0A] border border-[#C9A45C]/35 shadow-2xl overflow-hidden backdrop-blur-xl">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#C9A45C]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20 rtl:right-auto rtl:left-0 rtl:-ml-20" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-[#C9A45C]/20 border border-[#C9A45C]/50 text-[#E3C27A] text-[10px] uppercase font-bold tracking-[2px] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#C9A45C]" />
                  {t('admin.badge', 'Master Admin Dashboard')}
                </span>
                <span className="text-xs text-[#8E713D] hidden sm:inline">• {t('admin.liveControl', 'Live Store Inventory Control')}</span>
              </div>
              <h1 className="font-cinzel text-2xl sm:text-3xl lg:text-4xl font-bold text-[#F5F2EA] tracking-wide">
                {t('admin.title', 'OUD_X Stock & Operations Hub')}
              </h1>
              <p className="text-xs sm:text-sm text-[#A7A29A] max-w-2xl leading-relaxed">
                {t('admin.desc', 'Direct stock level management, instant inventory replenishment, product additions, catalog modifications, and full customer order fulfillment.')}
              </p>
            </div>

            {/* Quick Master Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => navigateTo('/shop')}
                className="px-4 py-2.5 rounded-full bg-[#151310] hover:bg-[#1f1b16] border border-[#C9A45C]/30 text-xs font-semibold text-[#E3C27A] flex items-center gap-2 transition-colors cursor-pointer"
                title={t('admin.actions.viewStoreTitle', 'Preview live customer storefront')}
              >
                <ExternalLink className="w-3.5 h-3.5 rtl-flip" />
                <span>{t('admin.actions.viewStore', 'View Store')}</span>
              </button>

              <button
                onClick={handleOpenAddModal}
                className="px-5 py-2.5 rounded-full bg-[#C9A45C] hover:bg-[#E3C27A] text-[#070707] font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-[#C9A45C]/20 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{t('admin.actions.addProduct', 'Add Fragrance')}</span>
              </button>

              <button
                onClick={() => setIsMigrationModalOpen(true)}
                className="px-4 py-2.5 rounded-full bg-[#1A1610] hover:bg-[#251F16] border border-[#C9A45C]/50 text-xs font-bold text-[#E3C27A] flex items-center gap-2 transition-all cursor-pointer shadow-md hover:border-[#E3C27A]"
                title={t('admin.actions.storageMigrationTitle', 'Migrate Base64 images to Supabase Storage')}
              >
                <UploadCloud className="w-4 h-4 text-[#C9A45C]" />
                <span>{t('admin.actions.storageMigration', 'Migrate Images to Storage')}</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/10">
            {/* Metric 1 */}
            <div className="p-4 rounded-2xl bg-[#070707]/60 border border-[#C9A45C]/20 space-y-1">
              <div className="flex items-center justify-between text-xs text-[#A7A29A]">
                <span className="uppercase tracking-wider text-[10px] font-bold text-[#C9A45C]">
                  {t('admin.metrics.totalUnits', 'Total Stock')}
                </span>
                <Boxes className="w-4 h-4 text-[#C9A45C]" />
              </div>
              <div className="font-cinzel text-xl sm:text-2xl font-bold text-[#F5F2EA]">
                {totalStockUnits} <span className="text-xs font-normal text-[#A7A29A]">{t('common.units', 'units')}</span>
              </div>
              <div className="text-[11px] text-[#8E713D]">
                {products.length} {t('admin.metrics.activeFragrances', 'Active Fragrance Products')}
              </div>
            </div>

            {/* Metric 2 */}
            <div className="p-4 rounded-2xl bg-[#070707]/60 border border-[#C9A45C]/20 space-y-1">
              <div className="flex items-center justify-between text-xs text-[#A7A29A]">
                <span className="uppercase tracking-wider text-[10px] font-bold text-[#C9A45C]">
                  {t('admin.metrics.totalValue', 'Inventory Value')}
                </span>
                <TrendingUp className="w-4 h-4 text-[#C9A45C]" />
              </div>
              <div className="font-cinzel text-xl sm:text-2xl font-bold text-[#F0D9A4]">
                {formatPrice(totalCatalogValue)}
              </div>
              <div className="text-[11px] text-[#8E713D]">{t('admin.metrics.assetEvaluation', 'Asset evaluation (EGP)')}</div>
            </div>

            {/* Metric 3 */}
            <div className="p-4 rounded-2xl bg-[#070707]/60 border border-[#C9A45C]/20 space-y-1">
              <div className="flex items-center justify-between text-xs text-[#A7A29A]">
                <span className="uppercase tracking-wider text-[10px] font-bold text-[#C9A45C]">
                  {t('admin.metrics.storeOrders', 'Store Orders')}
                </span>
                <ShoppingBag className="w-4 h-4 text-[#C9A45C]" />
              </div>
              <div className="font-cinzel text-xl sm:text-2xl font-bold text-[#F5F2EA]">
                {allOrders.length} <span className="text-xs font-normal text-[#A7A29A]">({pendingOrdersCount} {t('admin.metrics.pending', 'pending')})</span>
              </div>
              <div className="text-[11px] text-[#8E713D]">
                {t('common.revenue', 'Revenue')}: {formatPrice(totalOrdersRevenue)}
              </div>
            </div>

            {/* Metric 4 */}
            <div className={`p-4 rounded-2xl bg-[#070707]/60 border space-y-1 ${
              lowStockProducts.length > 0 || outOfStockProducts.length > 0
                ? 'border-amber-500/40 bg-amber-950/10'
                : 'border-[#C9A45C]/20'
            }`}>
              <div className="flex items-center justify-between text-xs text-[#A7A29A]">
                <span className="uppercase tracking-wider text-[10px] font-bold text-amber-400">
                  {t('admin.metrics.lowStock', 'Stock Alerts')}
                </span>
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              </div>
              <div className="font-cinzel text-xl sm:text-2xl font-bold text-amber-300">
                {lowStockProducts.length + outOfStockProducts.length} <span className="text-xs font-normal text-[#A7A29A]">{t('common.items', 'items')}</span>
              </div>
              <div className="text-[11px] text-amber-400/80">
                {outOfStockProducts.length} {t('admin.inventory.outOfStockOnly', 'Out of Stock')} • {lowStockProducts.length} {t('admin.inventory.lowStockOnly', 'Low Stock')}
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 overflow-x-auto gap-4">
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('inventory')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-[2px] transition-all cursor-pointer ${
                activeTab === 'inventory'
                  ? 'bg-[#C9A45C] text-[#070707] shadow-lg shadow-[#C9A45C]/20'
                  : 'bg-[#151310] text-[#A7A29A] hover:text-[#F5F2EA] border border-[#C9A45C]/20'
              }`}
            >
              <Boxes className="w-4 h-4" />
              <span>{t('admin.tabs.inventory', 'Stock & Products')} ({products.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-[2px] transition-all cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-[#C9A45C] text-[#070707] shadow-lg shadow-[#C9A45C]/20'
                  : 'bg-[#151310] text-[#A7A29A] hover:text-[#F5F2EA] border border-[#C9A45C]/20'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{t('admin.tabs.orders', 'Customer Orders')} ({allOrders.length})</span>
              {pendingOrdersCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-400 text-black text-[9px] font-black flex items-center justify-center">
                  {pendingOrdersCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('brands')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-[2px] transition-all cursor-pointer ${
                activeTab === 'brands'
                  ? 'bg-[#C9A45C] text-[#070707] shadow-lg shadow-[#C9A45C]/20'
                  : 'bg-[#151310] text-[#A7A29A] hover:text-[#F5F2EA] border border-[#C9A45C]/20'
              }`}
            >
              <Tags className="w-4 h-4" />
              <span>{t('admin.tabs.brands', 'Brands & Categories')} ({brands.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('alerts')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-[2px] transition-all cursor-pointer ${
                activeTab === 'alerts'
                  ? 'bg-[#C9A45C] text-[#070707] shadow-lg shadow-[#C9A45C]/20'
                  : 'bg-[#151310] text-[#A7A29A] hover:text-[#F5F2EA] border border-[#C9A45C]/20'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>{t('admin.tabs.alerts', 'Stock Alerts')} ({lowStockProducts.length + outOfStockProducts.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-[2px] transition-all cursor-pointer ${
                activeTab === 'analytics'
                  ? 'bg-[#C9A45C] text-[#070707] shadow-lg shadow-[#C9A45C]/20'
                  : 'bg-[#151310] text-[#A7A29A] hover:text-[#F5F2EA] border border-[#C9A45C]/20'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>{t('admin.tabs.analytics', 'Analytics & Catalog')}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleExportJSON}
              className="p-2 rounded-lg bg-[#151310] border border-[#C9A45C]/20 text-[#A7A29A] hover:text-[#E3C27A] text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title={t('admin.actions.exportJsonTitle', 'Export catalog as JSON')}
            >
              <Download className="w-4 h-4" />
              <span className="hidden md:inline">{t('admin.actions.exportJson', 'Export Catalog')}</span>
            </button>
            <button
              onClick={resetProductsToDefault}
              className="p-2 rounded-lg bg-[#151310] border border-[#C9A45C]/20 text-[#A7A29A] hover:text-red-400 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title={t('admin.actions.resetDefaultsTitle', 'Reset products to default factory collection')}
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden md:inline">{t('admin.actions.resetDefaults', 'Reset Defaults')}</span>
            </button>
          </div>
        </div>

        {/* TAB 1: INVENTORY & STOCK MANAGER */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            {/* Search & Filters Controls */}
            <div className="p-4 rounded-2xl bg-[#0D0C0A] border border-[#C9A45C]/25 flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E713D] rtl:left-auto rtl:right-3.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={t('admin.inventory.searchPlaceholder', 'Search by perfume name, brand, fragrance family, or notes...')}
                  className="w-full pl-10 pr-4 rtl:pl-4 rtl:pr-10 py-2.5 bg-[#151310] border border-[#C9A45C]/30 rounded-xl text-xs text-[#F5F2EA] placeholder-stone-500 focus:outline-none focus:border-[#C9A45C]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rtl:right-auto rtl:left-3 text-xs text-[#A7A29A] hover:text-white cursor-pointer"
                  >
                    {t('search.clear', 'Clear')}
                  </button>
                )}
              </div>

              {/* Filter Dropdowns & Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Stock Level Filter */}
                <select
                  value={stockFilter}
                  onChange={e => setStockFilter(e.target.value as any)}
                  className="px-3 py-2 bg-[#151310] border border-[#C9A45C]/30 rounded-xl text-xs text-[#F5F2EA] focus:outline-none focus:border-[#C9A45C]"
                >
                  <option value="all">{t('admin.inventory.allStock', 'All Stock Statuses')}</option>
                  <option value="low">{t('admin.inventory.lowStockOnly', 'Low Stock (≤ 5 units)')}</option>
                  <option value="out">{t('admin.inventory.outOfStockOnly', 'Out of Stock (0 units)')}</option>
                  <option value="healthy">{t('admin.inventory.healthyStock', 'In Stock (> 5 units)')}</option>
                </select>

                {/* Category Filter */}
                <select
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 bg-[#151310] border border-[#C9A45C]/30 rounded-xl text-xs text-[#F5F2EA] focus:outline-none focus:border-[#C9A45C]"
                >
                  <option value="all">{t('categories.all', 'All Fragrance Chapters')}</option>
                  <option value="oud">{t('categories.oud', 'Oud Collection')}</option>
                  <option value="men">{t('categories.men', "Men's Haute")}</option>
                  <option value="women">{t('categories.women', "Women's Niche")}</option>
                  <option value="unisex">{t('categories.unisex', 'Unisex Privé')}</option>
                  <option value="exclusive">{t('categories.exclusive', 'VIP Exclusive')}</option>
                  <option value="gift-set">{t('categories.giftSets', 'Gift Sets')}</option>
                </select>

                {/* Sort By */}
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  className="px-3 py-2 bg-[#151310] border border-[#C9A45C]/30 rounded-xl text-xs text-[#F5F2EA] focus:outline-none focus:border-[#C9A45C]"
                >
                  <option value="stock-asc">{t('admin.inventory.sortStockAsc', 'Stock: Low to High')}</option>
                  <option value="stock-desc">{t('admin.inventory.sortStockDesc', 'Stock: High to Low')}</option>
                  <option value="price-asc">{t('admin.inventory.sortPriceAsc', 'Price: Low to High')}</option>
                  <option value="price-desc">{t('admin.inventory.sortPriceDesc', 'Price: High to Low')}</option>
                  <option value="name">{t('admin.inventory.sortName', 'Product Name (A-Z)')}</option>
                </select>

                <button
                  onClick={handleBatchRestockLow}
                  className="px-3.5 py-2 rounded-xl bg-[#C9A45C]/20 border border-[#C9A45C]/40 text-xs font-bold text-[#E3C27A] hover:bg-[#C9A45C]/30 transition-colors cursor-pointer"
                >
                  {t('admin.actions.batchRestock', '+10 Batch Restock Low Items')}
                </button>
              </div>
            </div>

            {/* Products Inventory Table */}
            {filteredProducts.length === 0 ? (
              <div className="p-16 text-center rounded-2xl bg-[#0D0C0A] border border-white/5 space-y-4">
                <Boxes className="w-12 h-12 text-[#8E713D] mx-auto opacity-50" />
                <h3 className="font-cinzel text-lg text-[#F5F2EA]">{t('admin.inventory.noFragrances', 'No Fragrances Found')}</h3>
                <p className="text-xs text-[#A7A29A]">{t('admin.inventory.noFragrancesDesc', 'Try clearing search keywords or resetting filters.')}</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setStockFilter('all');
                    setCategoryFilter('all');
                  }}
                  className="px-4 py-2 rounded-full bg-[#C9A45C] text-[#070707] font-bold text-xs uppercase tracking-wider cursor-pointer"
                >
                  {t('admin.inventory.clearFilters', 'Clear Filters')}
                </button>
              </div>
            ) : (
              <div className="rounded-2xl border border-[#C9A45C]/25 bg-[#0D0C0A] shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left rtl:text-right text-xs">
                    {/* Table Header */}
                    <thead className="bg-[#151310] text-[#C9A45C] uppercase tracking-wider text-[10px] font-bold border-b border-[#C9A45C]/20">
                      <tr>
                        <th className="py-4 px-4 sm:px-6">{t('admin.inventory.tableHeaders.fragranceDetails', 'Fragrance & Details')}</th>
                        <th className="py-4 px-4">{t('admin.inventory.tableHeaders.chapterClass', 'Chapter & Class')}</th>
                        <th className="py-4 px-4">{t('admin.inventory.tableHeaders.priceEgp', 'Price (EGP)')}</th>
                        <th className="py-4 px-4 text-center">{t('admin.inventory.tableHeaders.stockControl', 'Live Stock Control')}</th>
                        <th className="py-4 px-4 text-center">{t('admin.inventory.tableHeaders.status', 'Status')}</th>
                        <th className="py-4 px-4 sm:px-6 text-right rtl:text-left">{t('admin.inventory.tableHeaders.actions', 'Actions')}</th>
                      </tr>
                    </thead>

                    {/* Table Body */}
                    <tbody className="divide-y divide-white/5">
                      {filteredProducts.map(product => {
                        const isLow = (product.stock || 0) > 0 && (product.stock || 0) <= 5;
                        const isOut = (product.stock || 0) === 0;

                        return (
                          <tr
                            key={product.id}
                            className={`hover:bg-[#151310]/60 transition-colors ${
                              isOut ? 'bg-red-950/10' : isLow ? 'bg-amber-950/10' : ''
                            }`}
                          >
                            {/* Product Info */}
                            <td className="py-4 px-4 sm:px-6">
                              <div className="flex items-center gap-3">
                                <div className="relative w-12 h-14 rounded-lg overflow-hidden border border-[#C9A45C]/30 bg-black shrink-0">
                                  <img
                                    src={product.images?.[0] || product.image}
                                    alt={getLocalizedProductName(product, product.name)}
                                    referrerPolicy="no-referrer"
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="space-y-0.5 max-w-xs">
                                  <div className="flex items-center gap-2">
                                    <span
                                      className="font-cinzel font-bold text-sm text-[#F5F2EA] hover:text-[#C9A45C] transition-colors cursor-pointer"
                                      onClick={() => navigateTo(`/products/${product.slug}`)}
                                    >
                                      {getLocalizedProductName(product, product.name)}
                                    </span>
                                    {product.badge && (
                                      <span className="px-1.5 py-0.5 rounded bg-[#C9A45C]/20 border border-[#C9A45C]/40 text-[9px] font-bold text-[#E3C27A]">
                                        {getLocalizedBadge(product.badge, t)}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-[#8E713D]">{product.brand} • {product.size}</div>
                                  <div className="text-[10px] text-[#A7A29A] truncate">
                                    {getLocalizedProductSubtitle(product, product.subtitle)}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Category & Concentration */}
                            <td className="py-4 px-4">
                              <div className="space-y-0.5">
                                <div className="text-xs font-semibold text-[#F5F2EA] capitalize">
                                  {getLocalizedCategory(product.category, t)} ({getLocalizedGender(product.gender, t)})
                                </div>
                                <div className="text-[11px] text-[#C9A45C]">{product.concentration}</div>
                                <div className="text-[10px] text-[#A7A29A]">{product.fragranceFamily}</div>
                              </div>
                            </td>

                            {/* Price */}
                            <td className="py-4 px-4">
                              <div className="space-y-0.5">
                                <div className="font-bold text-[#F0D9A4] text-sm">
                                  {formatPrice(product.price)}
                                </div>
                                {product.compareAtPrice && (
                                  <div className="text-[10px] text-[#A7A29A] line-through">
                                    {formatPrice(product.compareAtPrice)}
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* Live Stock Adjuster */}
                            <td className="py-4 px-4">
                              <div className="flex flex-col items-center gap-1.5">
                                <div className="flex items-center gap-1 bg-[#151310] border border-[#C9A45C]/30 rounded-xl p-1 shadow-inner">
                                  {/* Decrement */}
                                  <button
                                    onClick={() => quickAdjustStock(product.id, -1)}
                                    className="w-7 h-7 rounded-lg bg-[#070707] hover:bg-red-500/20 text-[#A7A29A] hover:text-red-400 font-black text-sm flex items-center justify-center transition-colors cursor-pointer"
                                    title={t('admin.inventory.decreaseStock', 'Decrease stock by 1')}
                                  >
                                    -
                                  </button>

                                  {/* Direct Input */}
                                  <input
                                    type="number"
                                    min="0"
                                    value={product.stock ?? 0}
                                    onChange={e => adjustStock(product.id, Number(e.target.value))}
                                    className={`w-14 text-center py-1 bg-transparent text-xs font-bold focus:outline-none ${
                                      isOut
                                        ? 'text-red-400'
                                        : isLow
                                        ? 'text-amber-400'
                                        : 'text-[#E3C27A]'
                                    }`}
                                  />

                                  {/* Increment */}
                                  <button
                                    onClick={() => quickAdjustStock(product.id, 1)}
                                    className="w-7 h-7 rounded-lg bg-[#070707] hover:bg-[#C9A45C]/20 text-[#A7A29A] hover:text-[#E3C27A] font-black text-sm flex items-center justify-center transition-colors cursor-pointer"
                                    title={t('admin.inventory.increaseStock', 'Increase stock by 1')}
                                  >
                                    +
                                  </button>
                                </div>

                                {/* Quick Restock Chips */}
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => quickAdjustStock(product.id, 5)}
                                    className="px-2 py-0.5 rounded bg-white/5 hover:bg-[#C9A45C]/20 text-[10px] text-[#A7A29A] hover:text-[#E3C27A] border border-white/5 transition-colors cursor-pointer"
                                  >
                                    +5
                                  </button>
                                  <button
                                    onClick={() => quickAdjustStock(product.id, 10)}
                                    className="px-2 py-0.5 rounded bg-white/5 hover:bg-[#C9A45C]/20 text-[10px] text-[#A7A29A] hover:text-[#E3C27A] border border-white/5 transition-colors cursor-pointer"
                                  >
                                    +10
                                  </button>
                                </div>
                              </div>
                            </td>

                            {/* Status Pill */}
                            <td className="py-4 px-4 text-center">
                              {isOut ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 font-bold text-[10px] uppercase tracking-wider">
                                  <XCircle className="w-3 h-3" /> {t('admin.inventory.outOfStockOnly', 'Out of Stock')}
                                </span>
                              ) : isLow ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-[10px] uppercase tracking-wider animate-pulse">
                                  <AlertTriangle className="w-3 h-3" /> {t('admin.inventory.lowStock', 'Low')} ({product.stock} {t('common.left', 'left')})
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-[10px] uppercase tracking-wider">
                                  <CheckCircle2 className="w-3 h-3" /> {t('admin.inventory.healthyStock', 'In Stock')} ({product.stock})
                                </span>
                              )}
                            </td>

                            {/* Action Buttons */}
                            <td className="py-4 px-4 sm:px-6 text-right rtl:text-left">
                              <div className="flex items-center justify-end rtl:justify-start gap-1.5">
                                <button
                                  onClick={() => handleOpenEditModal(product)}
                                  className="p-2 rounded-lg bg-[#151310] hover:bg-[#C9A45C]/20 border border-white/10 hover:border-[#C9A45C]/40 text-[#A7A29A] hover:text-[#E3C27A] transition-colors cursor-pointer"
                                  title={t('admin.inventory.editProduct', 'Edit full product details')}
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  onClick={() => handleDuplicateProduct(product)}
                                  className="p-2 rounded-lg bg-[#151310] hover:bg-white/10 border border-white/10 text-[#A7A29A] hover:text-[#F5F2EA] transition-colors cursor-pointer"
                                  title={t('admin.inventory.duplicateProduct', 'Duplicate as new product variant')}
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  onClick={() => navigateTo(`/products/${product.slug}`)}
                                  className="p-2 rounded-lg bg-[#151310] hover:bg-white/10 border border-white/10 text-[#A7A29A] hover:text-[#F5F2EA] transition-colors cursor-pointer"
                                  title={t('admin.inventory.previewProduct', 'Preview product page')}
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  onClick={() => setProductToDelete(product)}
                                  className="p-2 rounded-lg bg-[#151310] hover:bg-red-500/20 border border-white/10 hover:border-red-500/40 text-[#A7A29A] hover:text-red-400 transition-colors cursor-pointer"
                                  title={t('admin.inventory.deleteProduct', 'Delete fragrance from catalog')}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ORDERS MANAGEMENT HUB */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {/* Orders Filter Bar */}
            <div className="p-4 rounded-2xl bg-[#0D0C0A] border border-[#C9A45C]/25 flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
              {/* Search Orders */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E713D] rtl:left-auto rtl:right-3.5" />
                <input
                  type="text"
                  value={orderSearchQuery}
                  onChange={e => setOrderSearchQuery(e.target.value)}
                  placeholder={t('admin.orders.searchPlaceholder', 'Search by order #, customer name, phone number, or city...')}
                  className="w-full pl-10 pr-4 rtl:pl-4 rtl:pr-10 py-2.5 bg-[#151310] border border-[#C9A45C]/30 rounded-xl text-xs text-[#F5F2EA] placeholder-stone-500 focus:outline-none focus:border-[#C9A45C]"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <select
                  value={orderStatusFilter}
                  onChange={e => setOrderStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-[#151310] border border-[#C9A45C]/30 rounded-xl text-xs text-[#F5F2EA] focus:outline-none focus:border-[#C9A45C]"
                >
                  <option value="all">{t('admin.orders.allStatuses', 'All Order Statuses')} ({allOrders.length})</option>
                  <option value="Processing">{getLocalizedOrderStatus('Processing', t)}</option>
                  <option value="Shipped">{getLocalizedOrderStatus('Shipped', t)}</option>
                  <option value="Out for Delivery">{getLocalizedOrderStatus('Out for Delivery', t)}</option>
                  <option value="Delivered">{getLocalizedOrderStatus('Delivered', t)}</option>
                  <option value="Cancelled">{getLocalizedOrderStatus('Cancelled', t)}</option>
                </select>
              </div>
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
              <div className="p-16 text-center rounded-2xl bg-[#0D0C0A] border border-white/5 space-y-4">
                <ShoppingBag className="w-12 h-12 text-[#8E713D] mx-auto opacity-50" />
                <h3 className="font-cinzel text-lg text-[#F5F2EA]">{t('admin.orders.empty', 'No Orders Found')}</h3>
                <p className="text-xs text-[#A7A29A]">{t('admin.orders.emptyDesc', 'No orders match your filter criteria.')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map(order => (
                  <div
                    key={order.id}
                    className="p-5 sm:p-6 rounded-2xl bg-[#0D0C0A] border border-[#C9A45C]/30 shadow-lg space-y-4 hover:border-[#C9A45C]/60 transition-all"
                  >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <span className="font-cinzel text-base font-bold text-[#F5F2EA]">
                            {order.orderNumber}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              order.status === 'Delivered'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : order.status === 'Cancelled'
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}
                          >
                            {getLocalizedOrderStatus(order.status, t)}
                          </span>
                        </div>
                        <div className="text-xs text-[#A7A29A]">
                          {t('admin.orders.date', 'Date')}: <span className="text-[#F5F2EA]">{formatDateLocalized(order.date, i18n.language)}</span> • {t('admin.orders.payment', 'Payment')}:{' '}
                          <span className="text-[#C9A45C]">{getLocalizedPaymentMethod(order.paymentMethod, t)}</span>
                        </div>
                      </div>

                      {/* Status Selector & Actions */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Instant Status Changer */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] uppercase tracking-wider text-[#8E713D] font-bold">
                            {t('admin.orders.setStatus', 'Set Status:')}
                          </span>
                          <select
                            value={order.status}
                            onChange={e => updateOrderStatus(order.id, e.target.value as any)}
                            className="px-2.5 py-1.5 bg-[#151310] border border-[#C9A45C]/30 rounded-lg text-xs text-[#F5F2EA] font-semibold focus:outline-none focus:border-[#C9A45C]"
                          >
                            <option value="Processing">{getLocalizedOrderStatus('Processing', t)}</option>
                            <option value="Shipped">{getLocalizedOrderStatus('Shipped', t)}</option>
                            <option value="Out for Delivery">{getLocalizedOrderStatus('Out for Delivery', t)}</option>
                            <option value="Delivered">{getLocalizedOrderStatus('Delivered', t)}</option>
                            <option value="Cancelled">{getLocalizedOrderStatus('Cancelled', t)}</option>
                          </select>
                        </div>

                        {/* View Invoice Receipt */}
                        <button
                          onClick={() => setSelectedInvoiceOrder(order)}
                          className="px-3 py-1.5 rounded-lg bg-[#C9A45C]/15 hover:bg-[#C9A45C]/30 border border-[#C9A45C]/40 text-xs text-[#E3C27A] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{t('admin.orders.fullInvoice', 'Full Invoice')}</span>
                        </button>

                        {/* Delete Order */}
                        <button
                          onClick={() => setOrderToDelete(order)}
                          className="p-1.5 text-stone-500 hover:text-red-400 transition-colors cursor-pointer"
                          title={t('admin.orders.deleteOrder', 'Delete order archive')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Order Details & Items Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                      {/* Items */}
                      <div className="lg:col-span-7 space-y-2">
                        {order.items.map((it, i) => {
                          const matchedProduct = products.find(
                            p => p.name.toLowerCase() === it.name.toLowerCase()
                          );
                          const itemImage = it.image || matchedProduct?.images?.[0];

                          return (
                            <div key={i} className="flex items-center gap-3 p-2 rounded-xl bg-[#151310]/50 border border-white/5">
                              {itemImage ? (
                                <img
                                  src={itemImage}
                                  alt={it.name}
                                  referrerPolicy="no-referrer"
                                  className="w-10 h-12 object-cover rounded-lg bg-black border border-[#C9A45C]/20 shrink-0"
                                />
                              ) : (
                                <div className="w-10 h-12 rounded-lg bg-black border border-[#C9A45C]/20 flex items-center justify-center text-[#C9A45C] shrink-0">
                                  <Package className="w-5 h-5" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-bold text-[#F5F2EA] truncate">{it.name}</div>
                                <div className="text-[11px] text-[#A7A29A]">
                                  {it.size} • {t('common.quantity', 'Qty')}: <span className="text-[#F5F2EA] font-semibold">{it.quantity}</span>
                                </div>
                              </div>
                              <div className="text-xs font-bold text-[#F0D9A4]">
                                {formatPrice(it.price * it.quantity)}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Customer & Address */}
                      <div className="lg:col-span-5 p-3.5 rounded-xl bg-[#151310]/30 border border-white/5 text-xs space-y-1">
                        <div className="text-[10px] uppercase font-bold text-[#C9A45C] tracking-wider">
                          {t('admin.orders.recipientDestination', 'Recipient & Destination')}
                        </div>
                        <div className="font-semibold text-[#F5F2EA]">{order.shippingAddress.fullName}</div>
                        <div className="text-[#A7A29A]">{order.shippingAddress.phone}</div>
                        <div className="text-[#A7A29A] text-[11px] truncate">
                          {order.shippingAddress.streetAddress}, {order.shippingAddress.area ? `${order.shippingAddress.area}, ` : ''}{getLocalizedGovernorate(order.shippingAddress.governorate || order.shippingAddress.city, t)}
                        </div>
                        <div className="pt-2 border-t border-white/5 flex justify-between items-center text-xs">
                          <span className="text-[#A7A29A]">{t('admin.orders.totalOrderValue', 'Total Order Value:')}</span>
                          <span className="font-cinzel font-bold text-[#C9A45C] text-sm">{formatPrice(order.total)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: BRANDS & CATEGORIES / HOUSES MANAGER */}
        {activeTab === 'brands' && (
          <div className="space-y-6">
            {/* Header / Filter Toolbar */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#0D0C0A] border border-[#C9A45C]/25 space-y-4">
              <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
                {/* Search Bar */}
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E713D] rtl:left-auto rtl:right-3.5" />
                  <input
                    type="text"
                    value={brandSearchQuery}
                    onChange={e => setBrandSearchQuery(e.target.value)}
                    placeholder={t('admin.brands.searchPlaceholder', 'Search brand by name, Arabic title, or collection tag...')}
                    className="w-full pl-10 pr-4 rtl:pl-4 rtl:pr-10 py-2.5 bg-[#151310] border border-[#C9A45C]/30 rounded-xl text-xs text-[#F5F2EA] placeholder-stone-500 focus:outline-none focus:border-[#C9A45C]"
                  />
                  {brandSearchQuery && (
                    <button
                      onClick={() => setBrandSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rtl:right-auto rtl:left-3 text-xs text-[#A7A29A] hover:text-white cursor-pointer"
                    >
                      {t('search.clear', 'Clear')}
                    </button>
                  )}
                </div>

                {/* Filter & Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full lg:w-auto justify-between lg:justify-end">
                  {/* Status Pills */}
                  <div className="flex items-center gap-1 bg-[#151310] p-1 rounded-xl border border-white/5">
                    <button
                      onClick={() => setBrandStatusFilter('all')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        brandStatusFilter === 'all'
                          ? 'bg-[#C9A45C] text-[#070707] font-bold'
                          : 'text-[#A7A29A] hover:text-[#F5F2EA]'
                      }`}
                    >
                      {t('admin.brands.allBrands', 'All')} ({brands.length})
                    </button>
                    <button
                      onClick={() => setBrandStatusFilter('active')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        brandStatusFilter === 'active'
                          ? 'bg-[#C9A45C] text-[#070707] font-bold'
                          : 'text-[#A7A29A] hover:text-[#F5F2EA]'
                      }`}
                    >
                      {t('admin.brands.activeOnly', 'Active')} ({brands.filter(b => b.isActive).length})
                    </button>
                    <button
                      onClick={() => setBrandStatusFilter('hidden')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        brandStatusFilter === 'hidden'
                          ? 'bg-[#C9A45C] text-[#070707] font-bold'
                          : 'text-[#A7A29A] hover:text-[#F5F2EA]'
                      }`}
                    >
                      {t('admin.brands.hiddenOnly', 'Hidden')} ({brands.filter(b => !b.isActive).length})
                    </button>
                  </div>

                  {/* Add Brand Master Button */}
                  <button
                    onClick={handleOpenAddBrandModal}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#C9A45C] to-[#E3C27A] hover:brightness-110 text-[#070707] font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-[#C9A45C]/25 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>{t('admin.brands.addBrand', 'Add Brand / Atelier')}</span>
                  </button>

                  {/* Reset to Defaults */}
                  <button
                    onClick={() => {
                      if (window.confirm('Reset all brand categories to default curated luxury houses?')) {
                        resetBrandsToDefault();
                        showToast(
                          t('toast.brandsReset', 'Brands Restored'),
                          t('toast.brandsResetMsg', 'Brand catalog restored to factory curated luxury collections'),
                          'gold'
                        );
                      }
                    }}
                    className="p-2.5 rounded-xl bg-[#151310] hover:bg-red-950/30 border border-white/10 hover:border-red-500/40 text-[#A7A29A] hover:text-red-400 text-xs transition-colors cursor-pointer"
                    title={t('admin.brands.resetDefaults', 'Reset to Default Brands')}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Explanatory Info Card */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#151310]/70 border border-[#C9A45C]/20 text-xs text-[#A7A29A]">
                <Sparkles className="w-4 h-4 text-[#C9A45C] shrink-0" />
                <p className="leading-relaxed">
                  {t('admin.brands.subtitle', 'Manage storefront brand showcase circles, brand names, Arabic typography, and custom high-resolution logos. Brands marked Active appear in the home circular carousel.')}
                </p>
              </div>
            </div>

            {/* Brands Grid */}
            {filteredBrands.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-[#0D0C0A] border border-white/10 space-y-4">
                <Tags className="w-12 h-12 text-[#8E713D] mx-auto opacity-50" />
                <h3 className="font-cinzel text-lg text-[#F5F2EA]">
                  {t('admin.brands.empty', 'No brands found matching your search.')}
                </h3>
                <p className="text-xs text-[#A7A29A] max-w-md mx-auto">
                  {brandSearchQuery
                    ? 'Try adjusting your search query or reset the filter status.'
                    : 'Click "+ Add Brand / Atelier" to introduce a new perfume house to your collection.'}
                </p>
                {brandSearchQuery ? (
                  <button
                    onClick={() => {
                      setBrandSearchQuery('');
                      setBrandStatusFilter('all');
                    }}
                    className="px-4 py-2 rounded-full bg-[#151310] border border-[#C9A45C]/30 text-xs text-[#E3C27A] font-semibold cursor-pointer"
                  >
                    {t('search.clear', 'Clear Filters')}
                  </button>
                ) : (
                  <button
                    onClick={handleOpenAddBrandModal}
                    className="px-5 py-2.5 rounded-full bg-[#C9A45C] text-[#070707] text-xs font-bold uppercase tracking-wider cursor-pointer"
                  >
                    {t('admin.brands.addBrand', 'Add Brand / Atelier')}
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredBrands.map(brand => {
                  const linkedCount = products.filter(
                    p => p.brand && p.brand.toLowerCase() === brand.name.toLowerCase()
                  ).length;
                  const preset = (Array.isArray(ICON_PRESETS) ? ICON_PRESETS.find(p => p.id === brand.iconPreset) : null) || (Array.isArray(ICON_PRESETS) ? ICON_PRESETS[0] : null);

                  return (
                    <div
                      key={brand.id}
                      className={`group relative rounded-2xl p-5 bg-[#0D0C0A] border transition-all duration-300 flex flex-col justify-between ${
                        brand.isActive
                          ? 'border-[#C9A45C]/25 hover:border-[#C9A45C]/70 shadow-lg shadow-black/40 hover:shadow-[#C9A45C]/10'
                          : 'border-white/5 opacity-60 hover:opacity-100 bg-[#090807]'
                      }`}
                    >
                      {/* Top Bar: Order & Active Switch */}
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <span className="px-2 py-0.5 rounded-md bg-[#151310] border border-white/10 text-[10px] font-mono text-[#8E713D]">
                          #{brand.displayOrder}
                        </span>

                        <button
                          onClick={() => handleToggleBrandActive(brand)}
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors ${
                            brand.isActive
                              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25'
                              : 'bg-stone-800/80 border border-stone-700 text-stone-400 hover:bg-stone-700'
                          }`}
                          title={brand.isActive ? 'Click to hide from carousel' : 'Click to show in carousel'}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${brand.isActive ? 'bg-emerald-400' : 'bg-stone-500'}`} />
                          {brand.isActive
                            ? t('admin.brands.activeBadge', 'Visible')
                            : t('admin.brands.hiddenBadge', 'Hidden')}
                        </button>
                      </div>

                      {/* Circular Brand Avatar Preview */}
                      <div className="flex flex-col items-center text-center my-2">
                        <div
                          onClick={() => handleOpenEditBrandModal(brand)}
                          className="relative w-24 h-24 rounded-full p-[2px] bg-gradient-to-br from-[#E3C27A] via-[#C9A45C] to-[#8E713D] shadow-xl cursor-pointer group-hover:scale-105 transition-transform duration-300"
                          title={t('admin.brands.changeLogo', 'Click to edit brand or change logo')}
                        >
                          <div className="w-full h-full rounded-full bg-[#12100C] overflow-hidden flex items-center justify-center relative">
                            {brand.logoUrl ? (
                              <img
                                src={brand.logoUrl}
                                alt={brand.name}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover rounded-full"
                              />
                            ) : (
                              <div className="text-[#E3C27A] w-12 h-12 flex items-center justify-center">
                                {preset && typeof preset.renderIcon === 'function' ? preset.renderIcon() : null}
                              </div>
                            )}

                            {/* Hover Overlay "Change Logo" */}
                            <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-[10px] font-bold text-[#E3C27A] uppercase tracking-wider gap-1">
                              <ImageIcon className="w-4 h-4" />
                              <span>{t('admin.brands.changeLogo', 'Change Logo')}</span>
                            </div>
                          </div>
                        </div>

                        {/* Brand Name & Arabic Name */}
                        <h4 className="font-cinzel text-base font-bold text-[#F5F2EA] mt-3 group-hover:text-[#E3C27A] transition-colors truncate max-w-full">
                          {brand.name}
                        </h4>
                        {brand.nameAr && (
                          <div className="font-serif-luxury text-sm text-[#C9A45C] mt-0.5 truncate max-w-full">
                            {brand.nameAr}
                          </div>
                        )}

                        {/* Tag Pill & Products Count */}
                        <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2.5">
                          {brand.tag && (
                            <span className="px-2 py-0.5 rounded-full bg-[#151310] border border-[#C9A45C]/30 text-[9px] font-bold uppercase tracking-[1.5px] text-[#E3C27A]">
                              {brand.tag}
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded-full bg-[#151310] border border-white/5 text-[9px] text-[#A7A29A]">
                            {t('admin.brands.linkedProducts', { count: linkedCount, defaultValue: `${linkedCount} Products` })}
                          </span>
                        </div>
                      </div>

                      {/* Card Bottom Actions */}
                      <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between gap-2">
                        {/* Edit & Logo Button */}
                        <button
                          onClick={() => handleOpenEditBrandModal(brand)}
                          className="flex-1 py-1.5 px-3 rounded-lg bg-[#151310] hover:bg-[#C9A45C]/20 border border-[#C9A45C]/30 hover:border-[#C9A45C] text-xs font-semibold text-[#E3C27A] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>{t('common.edit', 'Edit')}</span>
                        </button>

                        {/* Link to Shop filter */}
                        <button
                          onClick={() => navigateTo(`/shop?brand=${encodeURIComponent(brand.name)}`)}
                          className="p-2 rounded-lg bg-[#151310] hover:bg-[#1f1c16] border border-white/10 hover:border-[#C9A45C]/40 text-[#A7A29A] hover:text-[#F5F2EA] transition-colors cursor-pointer"
                          title="View brand in Boutique"
                        >
                          <ExternalLink className="w-3.5 h-3.5 rtl-flip" />
                        </button>

                        {/* Delete Brand */}
                        <button
                          onClick={() => setBrandToDelete(brand)}
                          className="p-2 rounded-lg bg-[#151310] hover:bg-red-500/20 border border-white/10 hover:border-red-500/40 text-[#A7A29A] hover:text-red-400 transition-colors cursor-pointer"
                          title={t('admin.brands.deleteBrand', 'Delete brand from collections')}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: STOCK ALERTS & RESTOCK PRIORITY */}
        {activeTab === 'alerts' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-[#0D0C0A] border border-amber-500/30 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-cinzel text-lg font-bold text-amber-300">
                    {t('admin.alerts.title', 'Priority Replenishment & Stock Alerts')}
                  </h3>
                  <p className="text-xs text-[#A7A29A]">
                    {t('admin.alerts.desc', 'Fragrances with inventory levels equal to 0 (out of stock) or ≤ 5 units (critically low).')}
                  </p>
                </div>
                <button
                  onClick={handleBatchRestockLow}
                  className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-200 text-xs font-bold rounded-full transition-colors cursor-pointer shrink-0"
                >
                  {t('admin.alerts.restockAll', 'Restock All (+10 units)')}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {[...outOfStockProducts, ...lowStockProducts].map(product => {
                  const isOut = (product.stock || 0) === 0;
                  return (
                    <div
                      key={product.id}
                      className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
                        isOut
                          ? 'bg-red-950/20 border-red-500/40'
                          : 'bg-amber-950/20 border-amber-500/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={product.images?.[0] || product.image}
                          alt={product.name}
                          referrerPolicy="no-referrer"
                          className="w-12 h-14 object-cover rounded-lg bg-black border border-white/10 shrink-0"
                        />
                        <div>
                          <div className="text-xs font-bold text-[#F5F2EA]">{product.name}</div>
                          <div className="text-[11px] text-[#A7A29A]">{product.brand} • {product.size}</div>
                          <div className={`text-xs font-bold mt-1 ${isOut ? 'text-red-400' : 'text-amber-400'}`}>
                            {isOut
                              ? t('admin.alerts.outOfStockAlert', 'OUT OF STOCK (0 units)')
                              : t('admin.alerts.lowStockAlert', { count: product.stock, defaultValue: `LOW STOCK: ${product.stock} units remaining` })
                            }
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => adjustStock(product.id, (product.stock || 0) + 10)}
                          className="px-3 py-1.5 rounded-lg bg-[#C9A45C] hover:bg-[#E3C27A] text-[#070707] font-bold text-xs shadow-md transition-colors cursor-pointer"
                        >
                          {t('admin.alerts.restockTen', '+10 Restock')}
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(product)}
                          className="p-1.5 rounded-lg bg-[#151310] text-[#A7A29A] hover:text-white border border-white/10 cursor-pointer"
                          title={t('admin.inventory.editProduct', 'Edit full product details')}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {lowStockProducts.length === 0 && outOfStockProducts.length === 0 && (
                <div className="p-8 text-center text-xs text-emerald-400">
                  {t('admin.alerts.allHealthy', '✓ All fragrances are currently in healthy stock levels (> 5 units).')}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: ANALYTICS & CATALOG BACKUP */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-[#0D0C0A] border border-[#C9A45C]/30 space-y-3">
                <h3 className="font-cinzel text-sm font-bold text-[#F5F2EA]">
                  {t('admin.analytics.chaptersBreakdown', 'Fragrance Chapters Breakdown')}
                </h3>
                <div className="space-y-2 text-xs">
                  {['oud', 'men', 'women', 'unisex', 'exclusive'].map(cat => {
                    const count = products.filter(p => p.category === cat).length;
                    return (
                      <div key={cat} className="flex justify-between items-center py-1 border-b border-white/5">
                        <span className="capitalize text-[#A7A29A]">{getLocalizedCategory(cat, t)}:</span>
                        <span className="font-bold text-[#F0D9A4]">{count} {t('admin.analytics.fragrancesCount', 'fragrances')}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-[#0D0C0A] border border-[#C9A45C]/30 space-y-3">
                <h3 className="font-cinzel text-sm font-bold text-[#F5F2EA]">
                  {t('admin.analytics.fulfillmentMetrics', 'Order Fulfillment Metrics')}
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="text-[#A7A29A]">{t('orderStatus.delivered', 'Delivered Orders')}:</span>
                    <span className="font-bold text-emerald-400">
                      {allOrders.filter(o => o.status === 'Delivered').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="text-[#A7A29A]">{t('admin.analytics.inTransit', 'In Transit / Dispatched')}:</span>
                    <span className="font-bold text-amber-300">
                      {allOrders.filter(o => o.status === 'Shipped' || o.status === 'Out for Delivery').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="text-[#A7A29A]">{t('admin.analytics.processingQueued', 'Processing / Queued')}:</span>
                    <span className="font-bold text-[#F5F2EA]">
                      {allOrders.filter(o => o.status === 'Processing').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="text-[#A7A29A]">{t('orderStatus.cancelled', 'Cancelled')}:</span>
                    <span className="font-bold text-red-400">
                      {allOrders.filter(o => o.status === 'Cancelled').length}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-[#0D0C0A] border border-[#C9A45C]/30 space-y-3">
                <h3 className="font-cinzel text-sm font-bold text-[#F5F2EA]">
                  {t('admin.analytics.dataManagement', 'Catalog Data Management')}
                </h3>
                <p className="text-xs text-[#A7A29A]">
                  {t('admin.analytics.dataManagementDesc', 'Export a snapshot of all active products and stock quantities for backups or enterprise spreadsheets.')}
                </p>
                <div className="pt-2 space-y-2">
                  <button
                    onClick={handleExportJSON}
                    className="w-full py-2 px-3 rounded-xl bg-[#151310] hover:bg-[#C9A45C]/20 border border-[#C9A45C]/40 text-xs text-[#E3C27A] font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" /> {t('admin.analytics.downloadJson', 'Download Catalog JSON')}
                  </button>
                  <button
                    onClick={resetProductsToDefault}
                    className="w-full py-2 px-3 rounded-xl bg-red-950/20 hover:bg-red-950/40 border border-red-500/30 text-xs text-red-300 font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" /> {t('admin.analytics.restoreDefaults', 'Restore Factory Curated Stock')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      <AddEditProductModal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        onSave={handleSaveProduct}
        productToEdit={productToEdit}
      />

      {/* Add / Edit Brand Modal */}
      <AddEditBrandModal
        isOpen={isAddEditBrandModalOpen}
        onClose={() => {
          setIsAddEditBrandModalOpen(false);
          setBrandToEdit(null);
        }}
        onSave={handleSaveBrand}
        brandToEdit={brandToEdit}
      />

      {/* Delete Brand Confirmation Modal */}
      {brandToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="p-6 rounded-2xl bg-[#0D0C0A] border border-red-500/40 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="font-cinzel text-base font-bold text-red-400">
              {t('admin.brands.deleteConfirmTitle', 'Delete Brand / Collection?')}
            </h3>
            <p className="text-xs text-[#A7A29A] leading-relaxed">
              {t('admin.brands.deleteConfirmDesc', {
                name: brandToDelete.name,
                defaultValue: `Are you sure you want to remove "${brandToDelete.name}"? This brand will no longer appear in the circular storefront showcase or filter collections.`
              })}
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setBrandToDelete(null)}
                className="px-4 py-2 rounded-full border border-white/10 text-xs text-[#A7A29A] hover:text-white cursor-pointer"
              >
                {t('common.cancel', 'Cancel')}
              </button>
              <button
                onClick={() => {
                  deleteBrand(brandToDelete.id);
                  setBrandToDelete(null);
                  showToast(
                    t('toast.brandDeleted', 'Brand Removed'),
                    brandToDelete.name,
                    'info'
                  );
                }}
                className="px-5 py-2 rounded-full bg-red-500 hover:bg-red-600 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                {t('admin.inventory.confirmDelete', 'Confirm Delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Invoice Receipt Modal */}
      <OrderInvoiceModal
        isOpen={!!selectedInvoiceOrder}
        onClose={() => setSelectedInvoiceOrder(null)}
        order={allOrders.find(o => o.id === selectedInvoiceOrder?.id) || selectedInvoiceOrder}
      />

      {/* Delete Product Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="p-6 rounded-2xl bg-[#0D0C0A] border border-red-500/40 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="font-cinzel text-base font-bold text-red-400">
              {t('admin.inventory.deleteModalTitle', 'Delete Fragrance from Catalog?')}
            </h3>
            <p className="text-xs text-[#A7A29A] leading-relaxed">
              {t('admin.inventory.deleteModalDesc', {
                name: productToDelete.name,
                defaultValue: `Are you sure you want to remove "${productToDelete.name}"? This will permanently delete it from live store catalog and search results.`
              })}
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setProductToDelete(null)}
                className="px-4 py-2 rounded-full border border-white/10 text-xs text-[#A7A29A] hover:text-white cursor-pointer"
              >
                {t('common.cancel', 'Cancel')}
              </button>
              <button
                onClick={() => {
                  deleteProduct(productToDelete.id);
                  setProductToDelete(null);
                }}
                className="px-5 py-2 rounded-full bg-red-500 hover:bg-red-600 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                {t('admin.inventory.confirmDelete', 'Confirm Delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Order Confirmation Modal */}
      {orderToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="p-6 rounded-2xl bg-[#0D0C0A] border border-red-500/40 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="font-cinzel text-base font-bold text-red-400">
              {t('admin.orders.deleteModalTitle', 'Delete Order Archive?')}
            </h3>
            <p className="text-xs text-[#A7A29A] leading-relaxed">
              {t('admin.orders.deleteModalDesc', {
                number: orderToDelete.orderNumber,
                name: orderToDelete.shippingAddress.fullName,
                defaultValue: `Remove order ${orderToDelete.orderNumber} (${orderToDelete.shippingAddress.fullName}) from records?`
              })}
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setOrderToDelete(null)}
                className="px-4 py-2 rounded-full border border-white/10 text-xs text-[#A7A29A] hover:text-white cursor-pointer"
              >
                {t('common.cancel', 'Cancel')}
              </button>
              <button
                onClick={() => {
                  deleteOrder(orderToDelete.id);
                  setOrderToDelete(null);
                }}
                className="px-5 py-2 rounded-full bg-red-500 hover:bg-red-600 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                {t('admin.orders.confirmDelete', 'Confirm Delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Storage Migration Modal */}
      <StorageMigrationModal
        isOpen={isMigrationModalOpen}
        onClose={() => setIsMigrationModalOpen(false)}
        onMigrationComplete={() => {
          window.location.reload();
        }}
      />
    </div>
  );
};
