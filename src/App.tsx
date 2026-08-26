import React from 'react';
import { ShopProvider, useShop } from './context/ShopContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { MobileMenu } from './components/layout/MobileMenu';
import { CartDrawer } from './components/cart/CartDrawer';
import { SearchModal } from './components/search/SearchModal';
import { QuickViewModal } from './components/ui/QuickViewModal';
import { Toast } from './components/ui/Toast';

import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { CollectionPage } from './pages/CollectionPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { WishlistPage } from './pages/WishlistPage';
import { AuthPage } from './pages/AuthPage';
import { AccountPage } from './pages/AccountPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';

const AppContent: React.FC = () => {
  const { currentRoute } = useShop();

  const renderCurrentView = () => {
    // Exact routes
    if (currentRoute === '/' || currentRoute === '') {
      return <HomePage />;
    }
    if (currentRoute.startsWith('/shop')) {
      return <ShopPage />;
    }
    if (currentRoute === '/collections/men') {
      return <CollectionPage collectionId="men" />;
    }
    if (currentRoute === '/collections/women') {
      return <CollectionPage collectionId="women" />;
    }
    if (currentRoute === '/collections/unisex') {
      return <CollectionPage collectionId="unisex" />;
    }
    if (currentRoute === '/collections/oud' || currentRoute.startsWith('/collections/oud')) {
      return <CollectionPage collectionId="oud" />;
    }
    if (currentRoute.startsWith('/products/')) {
      const slug = currentRoute.replace('/products/', '').split('?')[0];
      return <ProductDetailPage slug={slug} />;
    }
    if (currentRoute.startsWith('/cart')) {
      return <CartPage />;
    }
    if (currentRoute.startsWith('/checkout')) {
      return <CheckoutPage />;
    }
    if (currentRoute.startsWith('/wishlist')) {
      return <WishlistPage />;
    }
    if (currentRoute.startsWith('/auth') || currentRoute.startsWith('/login') || currentRoute.startsWith('/register')) {
      return <AuthPage />;
    }
    if (currentRoute.startsWith('/account') || currentRoute.startsWith('/admin')) {
      return <AccountPage />;
    }
    if (currentRoute.startsWith('/about')) {
      return <AboutPage />;
    }
    if (currentRoute.startsWith('/contact')) {
      return <ContactPage />;
    }

    // Fallback default
    return <HomePage />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#070707] text-[#F5F2EA] antialiased selection:bg-[#C9A45C] selection:text-black">
      {/* 1. Global Luxury Header */}
      <Header />

      {/* 2. Main Page View Content */}
      <main className="flex-1 w-full">
        {renderCurrentView()}
      </main>

      {/* 3. Global Luxury Footer */}
      <Footer />

      {/* 4. Interactive Drawers & Overlays */}
      <CartDrawer />
      <MobileMenu />
      <SearchModal />
      <QuickViewModal />
      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <ShopProvider>
      <AppContent />
    </ShopProvider>
  );
}
