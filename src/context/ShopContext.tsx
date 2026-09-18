import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product, CartItem, UserProfile, Order, UserAddress } from '../types';
import { productService } from '../services/productService';
import { orderService } from '../services/orderService';
import { authService } from '../services/authService';
import { wishlistService } from '../services/wishlistService';
import { supabase } from '../lib/supabaseClient';
import i18n from '../i18n';
import { formatPriceLocalized } from '../i18n/presentation';

interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'gold';
  title: string;
  message?: string;
}

interface ShopContextType {
  // Products
  products: Product[];
  isLoadingProducts: boolean;
  getProductBySlug: (slug: string) => Product | undefined;
  
  // Cart
  cart: CartItem[];
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
  addToCart: (product: Product, size?: string, quantity?: number, openDrawer?: boolean) => void;
  removeFromCart: (productId: string, size: string) => void;
  updateQuantity: (productId: string, size: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  subtotal: number;
  shipping: number;
  discount: number;
  appliedPromo: string | null;
  applyPromoCode: (code: string) => { success: boolean; message: string };
  removePromoCode: () => void;
  freeShippingThreshold: number;
  amountToFreeShipping: number;
  total: number;
  
  // Wishlist
  wishlist: string[]; // Product IDs
  toggleWishlist: (productId: string) => void;
  clearWishlist: () => void;
  isInWishlist: (productId: string) => boolean;
  wishlistCount: number;
  
  // Quick View
  quickViewProduct: Product | null;
  setQuickViewProduct: (product: Product | null) => void;
  
  // Search
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  recentSearches: string[];
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  
  // Mobile Menu
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;

  // Currency
  currency: 'EGP' | 'USD' | 'AED';
  setCurrency: (c: 'EGP' | 'USD' | 'AED') => void;
  formatPrice: (amountInEGP: number) => string;
  
  // User Auth & Account
  user: UserProfile | null;
  orders: Order[];
  isLoggedIn: boolean;
  login: (email: string, password?: string) => Promise<void>;
  register: (name: string, email: string, password?: string) => Promise<void>;
  logout: () => void;
  addOrder: (order: Omit<Order, 'id' | 'orderNumber' | 'date'>) => Order;

  // Admin & Catalog Stock Management
  addProduct: (productData: Partial<Product>) => Product;
  updateProduct: (id: string, updatedFields: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  adjustStock: (id: string, newStock: number) => void;
  quickAdjustStock: (id: string, delta: number) => void;
  resetProductsToDefault: () => void;

  // Admin & Order Fulfillment
  allOrders: Order[];
  updateOrderStatus: (orderId: string, status: Order['status'], trackingNumber?: string) => void;
  updateOrderShipping: (orderId: string, shippingFee: number) => Promise<void>;
  deleteOrder: (orderId: string) => void;
  
  // Toast
  toasts: ToastMessage[];
  showToast: (title: string, message?: string, type?: 'success' | 'info' | 'gold') => void;
  removeToast: (id: string) => void;

  // Active View / Route Navigation Helper
  currentRoute: string;
  navigateTo: (route: string) => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

const FREE_SHIPPING_THRESHOLD = 2500; // EGP

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation & Route state for SPA (including search query params)
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    if (typeof window === 'undefined') return '/';
    return (window.location.pathname || '/') + (window.location.search || '');
  });

  const navigateTo = (route: string) => {
    setCurrentRoute(route);
    window.history.pushState({}, '', route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute((window.location.pathname || '/') + (window.location.search || ''));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Products (Admin Stock & Catalog State with Supabase)
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      setIsLoadingProducts(true);
      const { data, error } = await productService.getProducts();
      if (error) {
        console.error('Failed to load products from Supabase:', error);
        // Do NOT fallback to mock products. Let the UI handle empty states.
      } else if (data) {
        setProducts(data);
      }
      setIsLoadingProducts(false);
    }
    loadProducts();

    // Subscribe to realtime updates for products
    const channel = supabase
      .channel('public:products')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, payload => {
        // Just reload the products to ensure we get joined data (categories, etc.) correctly
        // We could optimize this by manually updating the state, but fetching guarantees correctness
        loadProducts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // All Orders (Admin Orders)
  const [allOrders, setAllOrders] = useState<Order[]>([]);

  // We will fetch all orders if the user is an admin
  const loadAllOrders = useCallback(async () => {
    const { data, error } = await orderService.getAllOrders();
    if (!error && data) {
      setAllOrders(data);
    }
  }, []);

  const getProductBySlug = (slug: string) => {
    return products.find(p => p.slug === slug || p.id === slug);
  };

  // Cart state
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      if (typeof window === 'undefined') return [];
      const saved = localStorage.getItem('oudx_cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(item => item && item.product && typeof item.product === 'object' && item.product.id);
        }
      }
      return [];
    } catch (e) {
      console.error("Failed to parse cart from localStorage:", e);
      return [];
    }
  });
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);

  useEffect(() => {
    try {
      // Strip out massive base64 images to prevent localStorage QuotaExceededError
      // Safely handle cases where images might be undefined
      const safeCart = cart
        .filter(item => item && item.product && item.product.id)
        .map(item => ({
          ...item,
          product: {
            ...item.product,
            images: Array.isArray(item.product.images) 
              ? item.product.images.map(img => 
                  (typeof img === 'string' && img.startsWith('data:image') && img.length > 100000)
                    ? 'https://images.unsplash.com/photo-1615631648086-325025c9e51e?q=80&w=600&auto=format&fit=crop' 
                    : img
                )
              : []
          }
        }));
      localStorage.setItem('oudx_cart', JSON.stringify(safeCart));
    } catch (e) {
      console.error("Failed to save cart to localStorage:", e);
    }
  }, [cart]);

  // Compute live cart by syncing with live products data to fix stock/price sync issues
  const liveCart = React.useMemo(() => {
    return cart
      .filter(item => item && item.product && item.product.id)
      .map(item => {
        const liveProd = products.find(p => p.id === item.product.id);
        if (liveProd) {
          return { ...item, product: liveProd };
        }
        return item;
      });
  }, [cart, products]);

  // Wishlist state
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('oudx_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('oudx_wishlist', JSON.stringify(wishlist));
    } catch {
      // ignore
    }
  }, [wishlist]);

  // Quick View
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Search
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'Oud For Glory',
    'Khamrah',
    'Amber Nuit',
    'Smoky Leather',
    'Rose'
  ]);

  const addRecentSearch = (query: string) => {
    if (!query.trim()) return;
    setRecentSearches(prev => [query.trim(), ...prev.filter(q => q.toLowerCase() !== query.toLowerCase())].slice(0, 6));
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
  };

  // Mobile Menu State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Currency
  const [currency, setCurrency] = useState<'EGP' | 'USD' | 'AED'>('EGP');

  const formatPrice = (amountInEGP: number) => {
    return formatPriceLocalized(amountInEGP, i18n.language);
  };

  // User state
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const isLoggedIn = !!user;

  const loadWishlist = useCallback(async (userId: string) => {
    const { data, error } = await wishlistService.getUserWishlist(userId);
    if (!error && data) {
      setWishlist(data);
    }
  }, []);

  useEffect(() => {
    async function loadSession() {
      setIsAuthLoading(true);
      try {
        const { userProfile } = await authService.getSession();
        if (userProfile) {
          if (userProfile.role === 'admin') {
            loadAllOrders();
          } else {
            const { data: userOrders } = await orderService.getUserOrders(userProfile.id);
            userProfile.orders = userOrders || [];
          }
          setUser(userProfile);
          loadWishlist(userProfile.id);
        }
      } catch (err) {
        console.error('Session loading error:', err);
      } finally {
        setIsAuthLoading(false);
      }
    }
    loadSession();
  }, [loadWishlist, loadAllOrders]);

  // Toast
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (title: string, message?: string, type: 'success' | 'info' | 'gold' = 'gold') => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 4);
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Cart operations
  const addToCart = (product: Product, size?: string, quantity: number = 1, openDrawer: boolean = true) => {
    const liveProd = products.find(p => p.id === product.id) || product;
    
    if (liveProd.stock <= 0) {
      showToast(i18n.t('toast.outOfStock', 'Out of Stock'), i18n.t('toast.outOfStockMsg', 'This item is currently unavailable.'), 'info');
      return;
    }

    const selectedSize = size || liveProd.size;
    const sizeConfig = liveProd.availableSizes?.find(s => s.size === selectedSize);
    const itemPrice = sizeConfig ? sizeConfig.price : liveProd.price;

    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.product.id === product.id && item.selectedSize === selectedSize);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [...prev, { product, selectedSize, price: itemPrice, quantity }];
      }
    });

    showToast(i18n.t('toast.productAdded', 'Added to Shopping Bag'), `${product.name} (${selectedSize})`, 'gold');
    if (openDrawer) {
      setIsCartDrawerOpen(true);
    }
  };

  const removeFromCart = (productId: string, size: string) => {
    setCart(prev => prev.filter(item => !(item.product.id === productId && item.selectedSize === size)));
    showToast(i18n.t('toast.itemRemoved', 'Item Removed'), i18n.t('toast.fragranceRemovedMsg', 'Removed fragrance from bag'), 'info');
  };

  const updateQuantity = (productId: string, size: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, size);
      return;
    }
    
    const liveProd = products.find(p => p.id === productId);
    if (liveProd && quantity > liveProd.stock) {
      showToast(i18n.t('toast.insufficientStock', 'Insufficient Stock'), i18n.t('toast.insufficientStockMsg', { stock: liveProd.stock, defaultValue: `Only ${liveProd.stock} units available.` }), 'info');
      return;
    }

    setCart(prev => prev.map(item => {
      if (item.product.id === productId && item.selectedSize === size) {
        return { ...item, quantity };
      }
      return item;
    }));
  };

  const clearCart = () => {
    setCart([]);
    setAppliedPromo(null);
  };

  // Calculations using liveCart
  const cartCount = liveCart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = liveCart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  
  const discount = 0; // Disabled as requested
  const shipping = 0; // Free delivery as requested
  const amountToFreeShipping = 0;
  const total = Math.max(0, subtotal);

  const applyPromoCode = (code: string) => {
    return { success: false, message: i18n.t('toast.promoDisabled', 'Promotional codes are currently disabled.') };
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
    showToast(i18n.t('toast.promoRemoved', 'Promo Code Removed'), '', 'info');
  };

  // Wishlist operations
  const toggleWishlist = async (productId: string) => {
    const isSaved = wishlist.includes(productId);
    
    // Optimistic UI for guest, real update for authenticated
    setWishlist(prev => 
      isSaved ? prev.filter(id => id !== productId) : [...prev, productId]
    );

    if (user) {
      if (isSaved) {
        const { error } = await wishlistService.removeFromWishlist(user.id, productId);
        if (error) {
          // Revert on error
          setWishlist(prev => [...prev, productId]);
          showToast(i18n.t('common.error', 'Error'), i18n.t('toast.wishlistError', 'Could not update wishlist'), 'info');
          return;
        }
      } else {
        const { error } = await wishlistService.addToWishlist(user.id, productId);
        if (error) {
          // Revert on error
          setWishlist(prev => prev.filter(id => id !== productId));
          showToast(i18n.t('common.error', 'Error'), i18n.t('toast.wishlistError', 'Could not update wishlist'), 'info');
          return;
        }
      }
    }

    if (isSaved) {
      showToast(i18n.t('toast.wishlistRemoved', 'Removed from Wishlist'), i18n.t('toast.wishlistRemovedMsg', 'Item removed from saved fragrances'), 'info');
    } else {
      showToast(i18n.t('toast.wishlistAdded', 'Saved to Wishlist'), i18n.t('toast.wishlistAddedMsg', 'Added to favorites'), 'gold');
    }
  };

  const clearWishlist = () => {
    setWishlist([]);
    showToast(i18n.t('toast.wishlistCleared', 'Wishlist Cleared'), i18n.t('toast.wishlistClearedMsg', 'All saved items removed'), 'info');
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);
  const wishlistCount = wishlist.length;

  // Authentication
  const login = async (email: string, password?: string) => {
    const { data, error } = await authService.login(email, password);
    if (error || !data?.user) {
      const msg = error?.message?.toLowerCase() || '';
      if (msg.includes('email not confirmed')) {
        showToast(i18n.t('toast.verificationRequired', 'Verification Required'), i18n.t('toast.verificationRequiredMsg', 'Please confirm your email address. Check your inbox for the activation link.'), 'info');
      } else if (msg.includes('invalid login credentials')) {
        showToast(i18n.t('toast.authFailed', 'Authentication Failed'), i18n.t('toast.authFailedMsg', 'Invalid email or password. Please verify your credentials.'), 'info');
      } else {
        showToast(i18n.t('toast.authFailed', 'Authentication Failed'), error?.message || i18n.t('toast.authFailedMsg', 'Invalid credentials'), 'info');
      }
      return;
    }
    
    // Refresh session to get profile
    const { userProfile } = await authService.getSession();
    if (userProfile) {
      if (userProfile.role === 'admin') {
        loadAllOrders();
      } else {
        const { data: userOrders } = await orderService.getUserOrders(userProfile.id);
        userProfile.orders = userOrders || [];
      }
      setUser(userProfile);
      loadWishlist(userProfile.id);
      showToast(i18n.t('toast.welcomePrive', 'Welcome to OUD-X Privé'), i18n.t('toast.signedInAs', { name: userProfile.name, defaultValue: `Signed in as ${userProfile.name}` }), 'gold');
    }
  };

  const register = async (name: string, email: string, password?: string) => {
    const { data, error } = await authService.register(email, password, name);
    if (error || !data?.user) {
      showToast(i18n.t('toast.regFailed', 'Registration Failed'), error?.message || i18n.t('toast.regFailedMsg', 'Unable to create account'), 'info');
      return;
    }
    if (data.session) {
      const { userProfile } = await authService.getSession();
      if (userProfile) {
        setUser(userProfile);
        loadWishlist(userProfile.id);
      }
      showToast(i18n.t('toast.accountCreated', 'Account Created'), i18n.t('toast.welcomePriveUser', { name, defaultValue: `Welcome to OUD-X Privé, ${name}` }), 'gold');
    } else {
      showToast(i18n.t('toast.accountCreated', 'Account Created'), i18n.t('toast.accountCreatedVerify', 'If required by your provider, please verify your email before signing in.'), 'gold');
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setWishlist([]);
    showToast(i18n.t('toast.signedOut', 'Signed Out'), i18n.t('toast.signedOutMsg', 'You have been safely signed out'), 'info');
  };

  const addOrder = () => {
    // Deprecated in favor of orderService.createOrder in CheckoutPage
    return {} as Order;
  };

  // Admin Product Catalog & Stock Operations
  const addProduct = async (productData: Partial<Product>) => {
    const { data, error } = await productService.createProduct(productData);
    if (error) {
      showToast(i18n.t('common.error', 'Error'), error.message || i18n.t('toast.failedAddProduct', 'Failed to add product'), 'info');
      return null;
    }
    
    // Append to local state
    setProducts(prev => [data, ...prev]);
    showToast(i18n.t('toast.productAddedBoutique', 'Product Added to Boutique'), i18n.t('toast.productAddedBoutiqueMsg', { name: data.name, defaultValue: `${data.name} added to live stock` }), 'gold');
    return data;
  };

  const updateProduct = async (id: string, updatedFields: Partial<Product>) => {
    const { error } = await productService.updateProduct(id, updatedFields);
    if (error) {
      showToast(i18n.t('common.error', 'Error'), error.message || i18n.t('toast.failedUpdateProduct', 'Failed to update product'), 'info');
      return;
    }

    setProducts(prev =>
      prev.map(p => (p.id === id ? { ...p, ...updatedFields } : p))
    );
    showToast(i18n.t('toast.productCatalogUpdated', 'Product Catalog Updated'), i18n.t('toast.productCatalogUpdatedMsg', 'Changes saved successfully'), 'gold');
  };

  const deleteProduct = async (id: string) => {
    const { error } = await productService.deleteProduct(id);
    if (error) {
      showToast(i18n.t('common.error', 'Error'), error.message || i18n.t('toast.failedDeleteProduct', 'Failed to delete product'), 'info');
      return;
    }

    setProducts(prev => prev.filter(p => p.id !== id));
    showToast(i18n.t('toast.productRemoved', 'Product Removed'), i18n.t('toast.productRemovedMsg', 'Product removed from catalog'), 'info');
  };

  const adjustStock = async (id: string, newStock: number) => {
    const clamped = Math.max(0, Math.floor(newStock));
    const { error } = await productService.adjustStock(id, clamped);
    if (error) {
      showToast(i18n.t('common.error', 'Error'), error.message || i18n.t('toast.failedUpdateStock', 'Failed to update stock'), 'info');
      return;
    }

    setProducts(prev =>
      prev.map(p => (p.id === id ? { ...p, stock: clamped } : p))
    );
    showToast(i18n.t('toast.inventoryUpdated', 'Inventory Updated'), i18n.t('toast.inventoryUpdatedMsg', { stock: clamped, defaultValue: `Stock set to ${clamped} units` }), 'gold');
  };

  const quickAdjustStock = async (id: string, delta: number) => {
    const prod = products.find(p => p.id === id);
    if (!prod) return;
    
    const nextStock = Math.max(0, (prod.stock || 0) + delta);
    await adjustStock(id, nextStock);
  };

  const resetProductsToDefault = async () => {
    // Cannot reset to mock data anymore. Only fetch from Supabase.
    const { data } = await productService.getProducts();
    if (data) setProducts(data);
    showToast(i18n.t('toast.catalogSync', 'Catalog Sync'), i18n.t('toast.catalogSyncMsg', 'Synced latest products from database'), 'info');
  };

  // Admin Orders Operations
  const updateOrderStatus = async (orderId: string, status: Order['status'], trackingNumber?: string) => {
    // Optimistic update in UI
    setAllOrders(prev =>
      prev.map(ord => {
        if (ord.id === orderId || ord.orderNumber === orderId) {
          return {
            ...ord,
            status,
            trackingNumber: trackingNumber !== undefined ? trackingNumber : ord.trackingNumber
          };
        }
        return ord;
      })
    );

    // Also update if present in user state
    if (user) {
      setUser({
        ...user,
        orders: (user.orders || []).map(ord => {
          if (ord.id === orderId || ord.orderNumber === orderId) {
            return {
              ...ord,
              status,
              trackingNumber: trackingNumber !== undefined ? trackingNumber : ord.trackingNumber
            };
          }
          return ord;
        })
      });
    }

    // Backend update
    const { error } = await orderService.updateOrderStatus(orderId, status, trackingNumber);
    if (error) {
      console.error('Failed to update order status:', error);
      showToast(i18n.t('common.error', 'Error'), i18n.t('toast.failedUpdateOrder', 'Failed to update order status on the server.'), 'info');
      // Ideally revert the optimistic update here
    } else {
      showToast(i18n.t('toast.statusUpdated', 'Order Status Updated'), i18n.t('toast.statusUpdatedMsgSimple', { status, defaultValue: `Order marked as "${status}"` }), 'gold');
    }
  };

  const deleteOrder = async (orderId: string) => {
    // Optimistic UI update
    setAllOrders(prev => prev.filter(ord => ord.id !== orderId && ord.orderNumber !== orderId));
    
    if (user) {
      setUser({
        ...user,
        orders: (user.orders || []).filter(ord => ord.id !== orderId && ord.orderNumber !== orderId)
      });
    }

    // Backend update
    const { error } = await orderService.deleteOrder(orderId);
    if (error) {
      console.error('Failed to delete order:', error);
      showToast(i18n.t('common.error', 'Error'), i18n.t('toast.failedDeleteOrder', 'Failed to delete order on the server.'), 'info');
    } else {
      showToast(i18n.t('toast.orderDeleted', 'Order Deleted'), i18n.t('toast.orderDeletedMsg', 'The order has been removed.'), 'info');
    }
  };

  const updateOrderShipping = async (orderId: string, shippingFee: number) => {
    const fee = Math.max(0, Number(shippingFee) || 0);

    // Optimistic UI update
    const updater = (ord: Order) => {
      if (ord.id === orderId || ord.orderNumber === orderId) {
        const newTotal = Math.max(0, ord.subtotal - (ord.discount || 0) + fee);
        return {
          ...ord,
          shipping: fee,
          shippingFee: fee,
          total: newTotal
        };
      }
      return ord;
    };

    setAllOrders(prev => prev.map(updater));
    if (user && user.orders) {
      setUser({
        ...user,
        orders: user.orders.map(updater)
      });
    }

    // Backend update
    const { error } = await orderService.updateOrderShipping(orderId, fee);
    if (error) {
      console.error('Failed to update shipping fee on server:', error);
      showToast(i18n.t('common.error', 'Error'), i18n.t('toast.failedUpdateShipping', 'Failed to update shipping fee on server.'), 'info');
    } else {
      showToast(i18n.t('toast.shippingUpdated', 'Shipping Fee Updated'), i18n.t('toast.shippingUpdatedMsgSimple', { fee, defaultValue: `Shipping fee set to ${fee} EGP` }), 'gold');
    }
  };

  return (
    <ShopContext.Provider
      value={{
        products,
        isLoadingProducts,
        getProductBySlug,
        cart: liveCart,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        subtotal,
        shipping,
        discount,
        appliedPromo,
        applyPromoCode,
        removePromoCode,
        freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
        amountToFreeShipping,
        total,
        wishlist,
        toggleWishlist,
        clearWishlist,
        isInWishlist,
        wishlistCount,
        quickViewProduct,
        setQuickViewProduct,
        isSearchOpen,
        setIsSearchOpen,
        searchQuery,
        setSearchQuery,
        recentSearches,
        addRecentSearch,
        clearRecentSearches,
        isMobileMenuOpen,
        setIsMobileMenuOpen,
        currency,
        setCurrency,
        formatPrice,
        user,
        orders: allOrders,
        allOrders,
        isLoggedIn,
        login,
        register,
        logout,
        addOrder,
        addProduct,
        updateProduct,
        deleteProduct,
        adjustStock,
        quickAdjustStock,
        resetProductsToDefault,
        updateOrderStatus,
        updateOrderShipping,
        deleteOrder,
        toasts,
        showToast,
        removeToast,
        currentRoute,
        navigateTo
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};
