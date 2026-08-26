import React, { useState, useMemo } from 'react';
import { useShop } from '../context/ShopContext';
import { Product, Order } from '../types';
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
  FileSpreadsheet
} from 'lucide-react';
import { AddEditProductModal } from '../components/admin/AddEditProductModal';
import { OrderInvoiceModal } from '../components/admin/OrderInvoiceModal';

export const AccountPage: React.FC = () => {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    adjustStock,
    quickAdjustStock,
    resetProductsToDefault,
    allOrders,
    updateOrderStatus,
    deleteOrder,
    formatPrice,
    navigateTo,
    showToast
  } = useShop();

  // Tab navigation
  const [activeTab, setActiveTab] = useState<'inventory' | 'orders' | 'alerts' | 'analytics'>('inventory');

  // Modals state
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);

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
        const matchesCity = order.shippingAddress.city.toLowerCase().includes(q);
        const matchesItems = order.items.some(it => it.name.toLowerCase().includes(q));
        if (!matchesNum && !matchesCustomer && !matchesPhone && !matchesCity && !matchesItems) return false;
      }

      if (orderStatusFilter !== 'all' && order.status !== orderStatusFilter) return false;

      return true;
    });
  }, [allOrders, orderSearchQuery, orderStatusFilter]);

  // Handlers
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
    showToast('Product Duplicated', `Created reserve copy of ${product.name}`, 'gold');
  };

  const handleBatchRestockLow = () => {
    if (lowStockProducts.length === 0 && outOfStockProducts.length === 0) {
      showToast('Inventory Optimal', 'No low stock products to restock at this time', 'info');
      return;
    }
    products.forEach(p => {
      if ((p.stock || 0) <= 5) {
        adjustStock(p.id, (p.stock || 0) + 10);
      }
    });
    showToast('Batch Restock Complete', 'Added +10 units to all low/depleted stock items', 'gold');
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(products, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `oudx_inventory_catalog_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Catalog Exported', 'Downloaded full inventory dataset as JSON', 'gold');
  };

  return (
    <div className="min-h-screen bg-[#070707] text-[#F5F2EA] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Executive Header Banner */}
        <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#12100C] via-[#1A1610] to-[#0D0C0A] border border-[#C9A45C]/35 shadow-2xl overflow-hidden backdrop-blur-xl">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#C9A45C]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-[#C9A45C]/20 border border-[#C9A45C]/50 text-[#E3C27A] text-[10px] uppercase font-bold tracking-[2px] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#C9A45C]" />
                  Master Admin Dashboard
                </span>
                <span className="text-xs text-[#8E713D] hidden sm:inline">• Live Store Inventory Control</span>
              </div>
              <h1 className="font-cinzel text-2xl sm:text-3xl lg:text-4xl font-bold text-[#F5F2EA] tracking-wide">
                OUD_X Stock & Operations Hub
              </h1>
              <p className="text-xs sm:text-sm text-[#A7A29A] max-w-2xl leading-relaxed">
                Direct stock level management, instant inventory replenishment, product additions, catalog modifications, and full customer order fulfillment.
              </p>
            </div>

            {/* Quick Master Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => navigateTo('/shop')}
                className="px-4 py-2.5 rounded-full bg-[#151310] hover:bg-[#1f1b16] border border-[#C9A45C]/30 text-xs font-semibold text-[#E3C27A] flex items-center gap-2 transition-colors"
                title="Preview live customer storefront"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>View Store</span>
              </button>

              <button
                onClick={handleOpenAddModal}
                className="px-5 py-2.5 rounded-full bg-[#C9A45C] hover:bg-[#E3C27A] text-[#070707] font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-[#C9A45C]/20 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Fragrance</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/10">
            {/* Metric 1 */}
            <div className="p-4 rounded-2xl bg-[#070707]/60 border border-[#C9A45C]/20 space-y-1">
              <div className="flex items-center justify-between text-xs text-[#A7A29A]">
                <span className="uppercase tracking-wider text-[10px] font-bold text-[#C9A45C]">Total Stock</span>
                <Boxes className="w-4 h-4 text-[#C9A45C]" />
              </div>
              <div className="font-cinzel text-xl sm:text-2xl font-bold text-[#F5F2EA]">
                {totalStockUnits} <span className="text-xs font-normal text-[#A7A29A]">units</span>
              </div>
              <div className="text-[11px] text-[#8E713D]">
                {products.length} Active Fragrance Products
              </div>
            </div>

            {/* Metric 2 */}
            <div className="p-4 rounded-2xl bg-[#070707]/60 border border-[#C9A45C]/20 space-y-1">
              <div className="flex items-center justify-between text-xs text-[#A7A29A]">
                <span className="uppercase tracking-wider text-[10px] font-bold text-[#C9A45C]">Inventory Value</span>
                <TrendingUp className="w-4 h-4 text-[#C9A45C]" />
              </div>
              <div className="font-cinzel text-xl sm:text-2xl font-bold text-[#F0D9A4]">
                {formatPrice(totalCatalogValue)}
              </div>
              <div className="text-[11px] text-[#8E713D]">Asset evaluation (EGP)</div>
            </div>

            {/* Metric 3 */}
            <div className="p-4 rounded-2xl bg-[#070707]/60 border border-[#C9A45C]/20 space-y-1">
              <div className="flex items-center justify-between text-xs text-[#A7A29A]">
                <span className="uppercase tracking-wider text-[10px] font-bold text-[#C9A45C]">Store Orders</span>
                <ShoppingBag className="w-4 h-4 text-[#C9A45C]" />
              </div>
              <div className="font-cinzel text-xl sm:text-2xl font-bold text-[#F5F2EA]">
                {allOrders.length} <span className="text-xs font-normal text-[#A7A29A]">({pendingOrdersCount} pending)</span>
              </div>
              <div className="text-[11px] text-[#8E713D]">
                Revenue: {formatPrice(totalOrdersRevenue)}
              </div>
            </div>

            {/* Metric 4 */}
            <div className={`p-4 rounded-2xl bg-[#070707]/60 border space-y-1 ${
              lowStockProducts.length > 0 || outOfStockProducts.length > 0
                ? 'border-amber-500/40 bg-amber-950/10'
                : 'border-[#C9A45C]/20'
            }`}>
              <div className="flex items-center justify-between text-xs text-[#A7A29A]">
                <span className="uppercase tracking-wider text-[10px] font-bold text-amber-400">Stock Alerts</span>
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              </div>
              <div className="font-cinzel text-xl sm:text-2xl font-bold text-amber-300">
                {lowStockProducts.length + outOfStockProducts.length} <span className="text-xs font-normal text-[#A7A29A]">items</span>
              </div>
              <div className="text-[11px] text-amber-400/80">
                {outOfStockProducts.length} Out of Stock • {lowStockProducts.length} Low Stock
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
              <span>Stock & Products ({products.length})</span>
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
              <span>Customer Orders ({allOrders.length})</span>
              {pendingOrdersCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-400 text-black text-[9px] font-black flex items-center justify-center">
                  {pendingOrdersCount}
                </span>
              )}
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
              <span>Stock Alerts ({lowStockProducts.length + outOfStockProducts.length})</span>
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
              <span>Analytics & Catalog</span>
            </button>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleExportJSON}
              className="p-2 rounded-lg bg-[#151310] border border-[#C9A45C]/20 text-[#A7A29A] hover:text-[#E3C27A] text-xs flex items-center gap-1.5 transition-colors"
              title="Export catalog as JSON"
            >
              <Download className="w-4 h-4" />
              <span className="hidden md:inline">Export Catalog</span>
            </button>
            <button
              onClick={resetProductsToDefault}
              className="p-2 rounded-lg bg-[#151310] border border-[#C9A45C]/20 text-[#A7A29A] hover:text-red-400 text-xs flex items-center gap-1.5 transition-colors"
              title="Reset products to default factory collection"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden md:inline">Reset Defaults</span>
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
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E713D]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search by perfume name, brand, fragrance family, or notes..."
                  className="w-full pl-10 pr-4 py-2.5 bg-[#151310] border border-[#C9A45C]/30 rounded-xl text-xs text-[#F5F2EA] placeholder-stone-500 focus:outline-none focus:border-[#C9A45C]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#A7A29A] hover:text-white"
                  >
                    Clear
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
                  <option value="all">All Stock Statuses</option>
                  <option value="low">Low Stock (≤ 5 units)</option>
                  <option value="out">Out of Stock (0 units)</option>
                  <option value="healthy">In Stock (&gt; 5 units)</option>
                </select>

                {/* Category Filter */}
                <select
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 bg-[#151310] border border-[#C9A45C]/30 rounded-xl text-xs text-[#F5F2EA] focus:outline-none focus:border-[#C9A45C]"
                >
                  <option value="all">All Fragrance Chapters</option>
                  <option value="oud">Oud Collection</option>
                  <option value="men">Men's Haute</option>
                  <option value="women">Women's Niche</option>
                  <option value="unisex">Unisex Privé</option>
                  <option value="exclusive">VIP Exclusive</option>
                  <option value="gift-set">Gift Sets</option>
                </select>

                {/* Sort By */}
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  className="px-3 py-2 bg-[#151310] border border-[#C9A45C]/30 rounded-xl text-xs text-[#F5F2EA] focus:outline-none focus:border-[#C9A45C]"
                >
                  <option value="stock-asc">Stock: Low to High</option>
                  <option value="stock-desc">Stock: High to Low</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name">Product Name (A-Z)</option>
                </select>

                <button
                  onClick={handleBatchRestockLow}
                  className="px-3.5 py-2 rounded-xl bg-[#C9A45C]/20 border border-[#C9A45C]/40 text-xs font-bold text-[#E3C27A] hover:bg-[#C9A45C]/30 transition-colors"
                >
                  +10 Batch Restock Low Items
                </button>
              </div>
            </div>

            {/* Products Inventory Table */}
            {filteredProducts.length === 0 ? (
              <div className="p-16 text-center rounded-2xl bg-[#0D0C0A] border border-white/5 space-y-4">
                <Boxes className="w-12 h-12 text-[#8E713D] mx-auto opacity-50" />
                <h3 className="font-cinzel text-lg text-[#F5F2EA]">No Fragrances Found</h3>
                <p className="text-xs text-[#A7A29A]">Try clearing search keywords or resetting filters.</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setStockFilter('all');
                    setCategoryFilter('all');
                  }}
                  className="px-4 py-2 rounded-full bg-[#C9A45C] text-[#070707] font-bold text-xs uppercase tracking-wider"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="rounded-2xl border border-[#C9A45C]/25 bg-[#0D0C0A] shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    {/* Table Header */}
                    <thead className="bg-[#151310] text-[#C9A45C] uppercase tracking-wider text-[10px] font-bold border-b border-[#C9A45C]/20">
                      <tr>
                        <th className="py-4 px-4 sm:px-6">Fragrance & Details</th>
                        <th className="py-4 px-4">Chapter & Class</th>
                        <th className="py-4 px-4">Price (EGP)</th>
                        <th className="py-4 px-4 text-center">Live Stock Control</th>
                        <th className="py-4 px-4 text-center">Status</th>
                        <th className="py-4 px-4 sm:px-6 text-right">Actions</th>
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
                                    alt={product.name}
                                    referrerPolicy="no-referrer"
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="space-y-0.5 max-w-xs">
                                  <div className="flex items-center gap-2">
                                    <span className="font-cinzel font-bold text-sm text-[#F5F2EA] hover:text-[#C9A45C] transition-colors cursor-pointer"
                                      onClick={() => navigateTo(`/products/${product.slug}`)}
                                    >
                                      {product.name}
                                    </span>
                                    {product.badge && (
                                      <span className="px-1.5 py-0.5 rounded bg-[#C9A45C]/20 border border-[#C9A45C]/40 text-[9px] font-bold text-[#E3C27A]">
                                        {product.badge}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-[#8E713D]">{product.brand} • {product.size}</div>
                                  <div className="text-[10px] text-[#A7A29A] truncate">{product.subtitle}</div>
                                </div>
                              </div>
                            </td>

                            {/* Category & Concentration */}
                            <td className="py-4 px-4">
                              <div className="space-y-0.5">
                                <div className="text-xs font-semibold text-[#F5F2EA] capitalize">
                                  {product.category} ({product.gender})
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
                                    className="w-7 h-7 rounded-lg bg-[#070707] hover:bg-red-500/20 text-[#A7A29A] hover:text-red-400 font-black text-sm flex items-center justify-center transition-colors"
                                    title="Decrease stock by 1"
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
                                    className="w-7 h-7 rounded-lg bg-[#070707] hover:bg-[#C9A45C]/20 text-[#A7A29A] hover:text-[#E3C27A] font-black text-sm flex items-center justify-center transition-colors"
                                    title="Increase stock by 1"
                                  >
                                    +
                                  </button>
                                </div>

                                {/* Quick Restock Chips */}
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => quickAdjustStock(product.id, 5)}
                                    className="px-2 py-0.5 rounded bg-white/5 hover:bg-[#C9A45C]/20 text-[10px] text-[#A7A29A] hover:text-[#E3C27A] border border-white/5 transition-colors"
                                  >
                                    +5
                                  </button>
                                  <button
                                    onClick={() => quickAdjustStock(product.id, 10)}
                                    className="px-2 py-0.5 rounded bg-white/5 hover:bg-[#C9A45C]/20 text-[10px] text-[#A7A29A] hover:text-[#E3C27A] border border-white/5 transition-colors"
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
                                  <XCircle className="w-3 h-3" /> Out of Stock
                                </span>
                              ) : isLow ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-[10px] uppercase tracking-wider animate-pulse">
                                  <AlertTriangle className="w-3 h-3" /> Low ({product.stock} left)
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-[10px] uppercase tracking-wider">
                                  <CheckCircle2 className="w-3 h-3" /> In Stock ({product.stock})
                                </span>
                              )}
                            </td>

                            {/* Action Buttons */}
                            <td className="py-4 px-4 sm:px-6 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleOpenEditModal(product)}
                                  className="p-2 rounded-lg bg-[#151310] hover:bg-[#C9A45C]/20 border border-white/10 hover:border-[#C9A45C]/40 text-[#A7A29A] hover:text-[#E3C27A] transition-colors"
                                  title="Edit full product details"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  onClick={() => handleDuplicateProduct(product)}
                                  className="p-2 rounded-lg bg-[#151310] hover:bg-white/10 border border-white/10 text-[#A7A29A] hover:text-[#F5F2EA] transition-colors"
                                  title="Duplicate as new product variant"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  onClick={() => navigateTo(`/products/${product.slug}`)}
                                  className="p-2 rounded-lg bg-[#151310] hover:bg-white/10 border border-white/10 text-[#A7A29A] hover:text-[#F5F2EA] transition-colors"
                                  title="Preview product page"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  onClick={() => setProductToDelete(product)}
                                  className="p-2 rounded-lg bg-[#151310] hover:bg-red-500/20 border border-white/10 hover:border-red-500/40 text-[#A7A29A] hover:text-red-400 transition-colors"
                                  title="Delete fragrance from catalog"
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
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E713D]" />
                <input
                  type="text"
                  value={orderSearchQuery}
                  onChange={e => setOrderSearchQuery(e.target.value)}
                  placeholder="Search by order #, customer name, phone number, or city..."
                  className="w-full pl-10 pr-4 py-2.5 bg-[#151310] border border-[#C9A45C]/30 rounded-xl text-xs text-[#F5F2EA] placeholder-stone-500 focus:outline-none focus:border-[#C9A45C]"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <select
                  value={orderStatusFilter}
                  onChange={e => setOrderStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-[#151310] border border-[#C9A45C]/30 rounded-xl text-xs text-[#F5F2EA] focus:outline-none focus:border-[#C9A45C]"
                >
                  <option value="all">All Order Statuses ({allOrders.length})</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
              <div className="p-16 text-center rounded-2xl bg-[#0D0C0A] border border-white/5 space-y-4">
                <ShoppingBag className="w-12 h-12 text-[#8E713D] mx-auto opacity-50" />
                <h3 className="font-cinzel text-lg text-[#F5F2EA]">No Orders Found</h3>
                <p className="text-xs text-[#A7A29A]">No orders match your filter criteria.</p>
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
                            {order.status}
                          </span>
                        </div>
                        <div className="text-xs text-[#A7A29A]">
                          Date: <span className="text-[#F5F2EA]">{order.date}</span> • Payment:{' '}
                          <span className="text-[#C9A45C]">{order.paymentMethod}</span>
                        </div>
                      </div>

                      {/* Status Selector & Actions */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Instant Status Changer */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] uppercase tracking-wider text-[#8E713D] font-bold">
                            Set Status:
                          </span>
                          <select
                            value={order.status}
                            onChange={e => updateOrderStatus(order.id, e.target.value as any)}
                            className="px-2.5 py-1.5 bg-[#151310] border border-[#C9A45C]/30 rounded-lg text-xs text-[#F5F2EA] font-semibold focus:outline-none focus:border-[#C9A45C]"
                          >
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Out for Delivery">Out for Delivery</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>

                        {/* View Invoice Receipt */}
                        <button
                          onClick={() => setSelectedInvoiceOrder(order)}
                          className="px-3 py-1.5 rounded-lg bg-[#C9A45C]/15 hover:bg-[#C9A45C]/30 border border-[#C9A45C]/40 text-xs text-[#E3C27A] font-semibold flex items-center gap-1.5 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Full Invoice</span>
                        </button>

                        {/* Delete Order */}
                        <button
                          onClick={() => setOrderToDelete(order)}
                          className="p-1.5 text-stone-500 hover:text-red-400 transition-colors"
                          title="Delete order archive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Order Details & Items Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                      {/* Items */}
                      <div className="lg:col-span-7 space-y-2">
                        {order.items.map((it, i) => (
                          <div key={i} className="flex items-center gap-3 p-2 rounded-xl bg-[#151310]/50 border border-white/5">
                            <img
                              src={it.image}
                              alt={it.name}
                              referrerPolicy="no-referrer"
                              className="w-10 h-12 object-cover rounded-lg bg-black border border-[#C9A45C]/20 shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-bold text-[#F5F2EA] truncate">{it.name}</div>
                              <div className="text-[11px] text-[#A7A29A]">
                                {it.size} • Qty: <span className="text-[#F5F2EA] font-semibold">{it.quantity}</span>
                              </div>
                            </div>
                            <div className="text-xs font-bold text-[#F0D9A4]">
                              {formatPrice(it.price * it.quantity)}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Customer & Address */}
                      <div className="lg:col-span-5 p-3.5 rounded-xl bg-[#151310]/30 border border-white/5 text-xs space-y-1">
                        <div className="text-[10px] uppercase font-bold text-[#C9A45C] tracking-wider">
                          Recipient & Destination
                        </div>
                        <div className="font-semibold text-[#F5F2EA]">{order.shippingAddress.fullName}</div>
                        <div className="text-[#A7A29A]">{order.shippingAddress.phone}</div>
                        <div className="text-[#A7A29A] text-[11px] truncate">
                          {order.shippingAddress.streetAddress}, {order.shippingAddress.area}, {order.shippingAddress.city}
                        </div>
                        <div className="pt-2 border-t border-white/5 flex justify-between items-center text-xs">
                          <span className="text-[#A7A29A]">Total Order Value:</span>
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

        {/* TAB 3: STOCK ALERTS & RESTOCK PRIORITY */}
        {activeTab === 'alerts' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-[#0D0C0A] border border-amber-500/30 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-cinzel text-lg font-bold text-amber-300">
                    Priority Replenishment & Stock Alerts
                  </h3>
                  <p className="text-xs text-[#A7A29A]">
                    Fragrances with inventory levels equal to 0 (out of stock) or ≤ 5 units (critically low).
                  </p>
                </div>
                <button
                  onClick={handleBatchRestockLow}
                  className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-200 text-xs font-bold rounded-full transition-colors"
                >
                  Restock All (+10 units)
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
                            {isOut ? 'OUT OF STOCK (0 units)' : `LOW STOCK: ${product.stock} units remaining`}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => adjustStock(product.id, (product.stock || 0) + 10)}
                          className="px-3 py-1.5 rounded-lg bg-[#C9A45C] hover:bg-[#E3C27A] text-[#070707] font-bold text-xs shadow-md transition-colors"
                        >
                          +10 Restock
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(product)}
                          className="p-1.5 rounded-lg bg-[#151310] text-[#A7A29A] hover:text-white border border-white/10"
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
                  ✓ All fragrances are currently in healthy stock levels (&gt; 5 units).
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
                <h3 className="font-cinzel text-sm font-bold text-[#F5F2EA]">Fragrance Chapters Breakdown</h3>
                <div className="space-y-2 text-xs">
                  {['oud', 'men', 'women', 'unisex', 'exclusive'].map(cat => {
                    const count = products.filter(p => p.category === cat).length;
                    return (
                      <div key={cat} className="flex justify-between items-center py-1 border-b border-white/5">
                        <span className="capitalize text-[#A7A29A]">{cat} Collection:</span>
                        <span className="font-bold text-[#F0D9A4]">{count} fragrances</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-[#0D0C0A] border border-[#C9A45C]/30 space-y-3">
                <h3 className="font-cinzel text-sm font-bold text-[#F5F2EA]">Order Fulfillment Metrics</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="text-[#A7A29A]">Delivered Orders:</span>
                    <span className="font-bold text-emerald-400">
                      {allOrders.filter(o => o.status === 'Delivered').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="text-[#A7A29A]">In Transit / Dispatched:</span>
                    <span className="font-bold text-amber-300">
                      {allOrders.filter(o => o.status === 'Shipped' || o.status === 'Out for Delivery').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="text-[#A7A29A]">Processing / Queued:</span>
                    <span className="font-bold text-[#F5F2EA]">
                      {allOrders.filter(o => o.status === 'Processing').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="text-[#A7A29A]">Cancelled:</span>
                    <span className="font-bold text-red-400">
                      {allOrders.filter(o => o.status === 'Cancelled').length}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-[#0D0C0A] border border-[#C9A45C]/30 space-y-3">
                <h3 className="font-cinzel text-sm font-bold text-[#F5F2EA]">Catalog Data Management</h3>
                <p className="text-xs text-[#A7A29A]">
                  Export a snapshot of all active products and stock quantities for backups or enterprise spreadsheets.
                </p>
                <div className="pt-2 space-y-2">
                  <button
                    onClick={handleExportJSON}
                    className="w-full py-2 px-3 rounded-xl bg-[#151310] hover:bg-[#C9A45C]/20 border border-[#C9A45C]/40 text-xs text-[#E3C27A] font-bold flex items-center justify-center gap-2 transition-colors"
                  >
                    <Download className="w-4 h-4" /> Download Catalog JSON
                  </button>
                  <button
                    onClick={resetProductsToDefault}
                    className="w-full py-2 px-3 rounded-xl bg-red-950/20 hover:bg-red-950/40 border border-red-500/30 text-xs text-red-300 font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" /> Restore Factory Curated Stock
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

      {/* Order Invoice Receipt Modal */}
      <OrderInvoiceModal
        isOpen={!!selectedInvoiceOrder}
        onClose={() => setSelectedInvoiceOrder(null)}
        order={selectedInvoiceOrder}
      />

      {/* Delete Product Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="p-6 rounded-2xl bg-[#0D0C0A] border border-red-500/40 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="font-cinzel text-base font-bold text-red-400">Delete Fragrance from Catalog?</h3>
            <p className="text-xs text-[#A7A29A] leading-relaxed">
              Are you sure you want to remove <strong className="text-[#F5F2EA]">"{productToDelete.name}"</strong>? This will permanently delete it from live store catalog and search results.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setProductToDelete(null)}
                className="px-4 py-2 rounded-full border border-white/10 text-xs text-[#A7A29A] hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteProduct(productToDelete.id);
                  setProductToDelete(null);
                }}
                className="px-5 py-2 rounded-full bg-red-500 hover:bg-red-600 text-white font-bold text-xs uppercase tracking-wider transition-colors"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Order Confirmation Modal */}
      {orderToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="p-6 rounded-2xl bg-[#0D0C0A] border border-red-500/40 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="font-cinzel text-base font-bold text-red-400">Delete Order Archive?</h3>
            <p className="text-xs text-[#A7A29A] leading-relaxed">
              Remove order <strong className="text-[#F5F2EA]">{orderToDelete.orderNumber}</strong> ({orderToDelete.shippingAddress.fullName}) from records?
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setOrderToDelete(null)}
                className="px-4 py-2 rounded-full border border-white/10 text-xs text-[#A7A29A] hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteOrder(orderToDelete.id);
                  setOrderToDelete(null);
                }}
                className="px-5 py-2 rounded-full bg-red-500 hover:bg-red-600 text-white font-bold text-xs uppercase tracking-wider transition-colors"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
