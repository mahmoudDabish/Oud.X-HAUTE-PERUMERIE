import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product, CartItem, UserProfile, Order, UserAddress } from '../types';
import { productService } from '../services/productService';
import { authService } from '../services/authService';
import { wishlistService } from '../services/wishlistService';
import { supabase } from '../lib/supabaseClient';

interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'gold';
  title: string;
  message?: string;
}

interface ShopContextType {
  // Products
  products: Product[];
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
  // Navigation & Route state for SPA
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  const navigateTo = (route: string) => {
    setCurrentRoute(route);
    window.history.pushState({}, '', route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(window.location.pathname || '/');
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

  // All Orders (Global Store & Admin Orders with LocalStorage Persistence)
  const [allOrders, setAllOrders] = useState<Order[]>([]);

  useEffect(() => {
    try {
      localStorage.setItem('oudx_admin_orders', JSON.stringify(allOrders));
    } catch {
      // ignore
    }
  }, [allOrders]);

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
        return Array.isArray(parsed) ? parsed : [];
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
      const safeCart = cart.map(item => ({
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
    return cart.map(item => {
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
    switch (currency) {
      case 'USD': {
        const usd = (amountInEGP / 50).toFixed(0);
        return `$${usd}`;
      }
      case 'AED': {
        const aed = (amountInEGP / 13.6).toFixed(0);
        return `${aed} AED`;
      }
      case 'EGP':
      default:
        return `${amountInEGP.toLocaleString('en-US')} EGP`;
    }
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
      const { userProfile } = await authService.getSession();
      if (userProfile) {
        setUser(userProfile);
        loadWishlist(userProfile.id);
      }
      setIsAuthLoading(false);
    }
    loadSession();
  }, [loadWishlist]);

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
      showToast('Out of Stock', 'This item is currently unavailable.', 'info');
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

    showToast('Added to Shopping Bag', `${product.name} (${selectedSize})`, 'gold');
    if (openDrawer) {
      setIsCartDrawerOpen(true);
    }
  };

  const removeFromCart = (productId: string, size: string) => {
    setCart(prev => prev.filter(item => !(item.product.id === productId && item.selectedSize === size)));
    showToast('Item Removed', 'Removed fragrance from bag', 'info');
  };

  const updateQuantity = (productId: string, size: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, size);
      return;
    }
    
    const liveProd = products.find(p => p.id === productId);
    if (liveProd && quantity > liveProd.stock) {
      showToast('Insufficient Stock', `Only ${liveProd.stock} units available.`, 'info');
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
    return { success: false, message: 'Promotional codes are currently disabled.' };
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
    showToast('Promo Code Removed', '', 'info');
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
          showToast('Error', 'Could not update wishlist', 'info');
          return;
        }
      } else {
        const { error } = await wishlistService.addToWishlist(user.id, productId);
        if (error) {
          // Revert on error
          setWishlist(prev => prev.filter(id => id !== productId));
          showToast('Error', 'Could not update wishlist', 'info');
          return;
        }
      }
    }

    if (isSaved) {
      showToast('Removed from Wishlist', 'Item removed from saved fragrances', 'info');
    } else {
      showToast('Saved to Wishlist', 'Added to favorites', 'gold');
    }
  };

  const clearWishlist = () => {
    setWishlist([]);
    showToast('Wishlist Cleared', 'All saved items removed', 'info');
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);
  const wishlistCount = wishlist.length;

  // Authentication
  const login = async (email: string, password?: string) => {
    const { data, error } = await authService.login(email, password);
    if (error || !data?.user) {
      showToast('Authentication Failed', error?.message || 'Invalid credentials', 'info');
      return;
    }
    
    // Refresh session to get profile
    const { userProfile } = await authService.getSession();
    if (userProfile) {
      setUser(userProfile);
      showToast('Welcome to OUD-X Privé', `Signed in as ${userProfile.name}`, 'gold');
    }
  };

  const register = async (name: string, email: string, password?: string) => {
    const { data, error } = await authService.register(email, password, name);
    if (error || !data?.user) {
      showToast('Registration Failed', error?.message || 'Unable to create account', 'info');
      return;
    }
    showToast('Account Created', 'Welcome to OUD-X Private Club. Please sign in.', 'gold');
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setWishlist([]);
    showToast('Signed Out', 'You have been safely signed out', 'info');
  };

  const addOrder = () => {
    // Deprecated in favor of orderService.createOrder in CheckoutPage
    return {} as Order;
  };

  // Admin Product Catalog & Stock Operations
  const addProduct = async (productData: Partial<Product>) => {
    const { data, error } = await productService.createProduct(productData);
    if (error) {
      showToast('Error', error.message || 'Failed to add product', 'info');
      return null;
    }
    
    // Append to local state
    setProducts(prev => [data, ...prev]);
    showToast('Product Added to Boutique', `${data.name} added to live stock`, 'gold');
    return data;
  };

  const updateProduct = async (id: string, updatedFields: Partial<Product>) => {
    const { error } = await productService.updateProduct(id, updatedFields);
    if (error) {
      showToast('Error', error.message || 'Failed to update product', 'info');
      return;
    }

    setProducts(prev =>
      prev.map(p => (p.id === id ? { ...p, ...updatedFields } : p))
    );
    showToast('Product Catalog Updated', 'Changes saved successfully', 'gold');
  };

  const deleteProduct = async (id: string) => {
    const { error } = await productService.deleteProduct(id);
    if (error) {
      showToast('Error', error.message || 'Failed to delete product', 'info');
      return;
    }

    setProducts(prev => prev.filter(p => p.id !== id));
    showToast('Product Removed', 'Product removed from catalog', 'info');
  };

  const adjustStock = async (id: string, newStock: number) => {
    const clamped = Math.max(0, Math.floor(newStock));
    const { error } = await productService.adjustStock(id, clamped);
    if (error) {
      showToast('Error', error.message || 'Failed to update stock', 'info');
      return;
    }

    setProducts(prev =>
      prev.map(p => (p.id === id ? { ...p, stock: clamped } : p))
    );
    showToast('Inventory Updated', `Stock set to ${clamped} units`, 'gold');
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
    showToast('Catalog Sync', 'Synced latest products from database', 'info');
  };

  // Admin Orders Operations
  const updateOrderStatus = (orderId: string, status: Order['status'], trackingNumber?: string) => {
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

    showToast('Order Status Updated', `Order marked as "${status}"`, 'gold');
  };

  const deleteOrder = (orderId: string) => {
    setAllOrders(prev => prev.filter(ord => ord.id !== orderId && ord.orderNumber !== orderId));
    if (user) {
      setUser({
        ...user,
        orders: (user.orders || []).filter(ord => ord.id !== orderId && ord.orderNumber !== orderId)
      });
    }
    showToast('Order Record Removed', 'Order successfully deleted from archive', 'info');
  };

  return (
    <ShopContext.Provider
      value={{
        products,
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
