import React, { Suspense, lazy } from 'react';
import { ShopProvider, useShop } from './context/ShopContext';
import { SmoothScrollProvider } from './context/SmoothScrollProvider';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { MobileMenu } from './components/layout/MobileMenu';
import { CartDrawer } from './components/cart/CartDrawer';
import { SearchModal } from './components/search/SearchModal';
import { QuickViewModal } from './components/ui/QuickViewModal';
import { Toast } from './components/ui/Toast';
import { LoadingFallback } from './components/ui/LoadingFallback';

// Route-level code-splitting for high acceleration & reduced initial bundle
const HomePage = lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })));
const ShopPage = lazy(() => import('./pages/ShopPage').then(m => ({ default: m.ShopPage })));
const CollectionPage = lazy(() => import('./pages/CollectionPage').then(m => ({ default: m.CollectionPage })));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage').then(m => ({ default: m.ProductDetailPage })));
const CartPage = lazy(() => import('./pages/CartPage').then(m => ({ default: m.CartPage })));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage').then(m => ({ default: m.CheckoutPage })));
const WishlistPage = lazy(() => import('./pages/WishlistPage').then(m => ({ default: m.WishlistPage })));
const AuthPage = lazy(() => import('./pages/AuthPage').then(m => ({ default: m.AuthPage })));
const AccountPage = lazy(() => import('./pages/AccountPage').then(m => ({ default: m.AccountPage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then(m => ({ default: m.AboutPage })));
const ContactPage = lazy(() => import('./pages/ContactPage').then(m => ({ default: m.ContactPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

const AppContent: React.FC = () => {
  const { currentRoute } = useShop();

  const renderCurrentView = () => {
    // Clean route path without query parameters or trailing slash
    const cleanPath = (currentRoute.split('?')[0] || '/').toLowerCase().replace(/\/+$/, '') || '/';

    // Exact and prefix matching
    if (cleanPath === '/' || cleanPath === '') {
      return <HomePage />;
    }
    if (cleanPath === '/shop' || cleanPath.startsWith('/shop/')) {
      return <ShopPage />;
    }
    if (
      cleanPath === '/collections' ||
      cleanPath === '/collections/all' ||
      cleanPath.startsWith('/collections/perfumes') ||
      cleanPath.startsWith('/collections/body-splash') ||
      cleanPath.startsWith('/collections/body-care') ||
      cleanPath.startsWith('/collections/body-spray')
    ) {
      return <ShopPage />;
    }
    if (cleanPath === '/collections/men') {
      return <CollectionPage collectionId="men" />;
    }
    if (cleanPath === '/collections/women') {
      return <CollectionPage collectionId="women" />;
    }
    if (cleanPath === '/collections/unisex') {
      return <CollectionPage collectionId="unisex" />;
    }
    if (cleanPath === '/collections/oud' || cleanPath.startsWith('/collections/oud/')) {
      return <CollectionPage collectionId="oud" />;
    }
    if (cleanPath.startsWith('/products/')) {
      const slug = currentRoute.replace(/^\/products\//i, '').split('?')[0];
      return <ProductDetailPage slug={slug} />;
    }
    if (cleanPath === '/cart' || cleanPath.startsWith('/cart/')) {
      return <CartPage />;
    }
    if (cleanPath === '/checkout' || cleanPath.startsWith('/checkout/')) {
      return <CheckoutPage />;
    }
    if (cleanPath === '/wishlist' || cleanPath.startsWith('/wishlist/')) {
      return <WishlistPage />;
    }
    if (cleanPath === '/auth' || cleanPath === '/login' || cleanPath === '/register') {
      return <AuthPage />;
    }
    if (cleanPath === '/account' || cleanPath.startsWith('/account/') || cleanPath === '/admin' || cleanPath.startsWith('/admin/')) {
      return <AccountPage />;
    }
    if (cleanPath === '/about' || cleanPath.startsWith('/about/')) {
      return <AboutPage />;
    }
    if (cleanPath === '/contact' || cleanPath.startsWith('/contact/')) {
      return <ContactPage />;
    }

    // High-end fallback 404
    return <NotFoundPage />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#070707] text-[#F5F2EA] antialiased selection:bg-[#C9A45C] selection:text-black">
      {/* 1. Global Luxury Header */}
      <Header />

      {/* 2. Main Page View Content with Suspense */}
      <main className="flex-1 w-full">
        <Suspense fallback={<LoadingFallback />}>
          {renderCurrentView()}
        </Suspense>
      </main>

      {/* 3. Global Luxury Footer */}
      <Footer />

      {/* 4. Interactive Drawers & Overlays - Hidden during print */}
      <div className="no-print">
        <CartDrawer />
        <MobileMenu />
        <SearchModal />
        <QuickViewModal />
        <Toast />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <ShopProvider>
        <SmoothScrollProvider>
          <AppContent />
        </SmoothScrollProvider>
      </ShopProvider>
    </ErrorBoundary>
  );
}
