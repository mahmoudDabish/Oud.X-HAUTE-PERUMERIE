import React, { useState, useEffect } from 'react';
import { useShop } from '../../context/ShopContext';
import { Search, Heart, ShoppingBag, User, Menu, X, ChevronDown, Sparkles, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  onOpenMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu }) => {
  const {
    cartCount,
    wishlistCount,
    setIsCartDrawerOpen,
    setIsSearchOpen,
    setIsMobileMenuOpen,
    currentRoute,
    navigateTo,
    isLoggedIn,
    user
  } = useShop();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isCollectionsHovered, setIsCollectionsHovered] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleToggleMobileMenu = () => {
    if (onOpenMobileMenu) {
      onOpenMobileMenu();
    } else {
      setIsMobileMenuOpen(true);
    }
  };

  const navLinks = [
    { label: 'HOME', href: '/' },
    { label: 'SHOP', href: '/shop' },
    {
      label: 'COLLECTIONS',
      href: '/shop',
      hasDropdown: true
    },
    { label: 'BEST SELLERS', href: '/shop?filter=bestsellers' },
    { label: 'ABOUT', href: '/about' },
    { label: 'CONTACT', href: '/contact' }
  ];

  const collectionDropdownItems = [
    { label: 'Oud Collection', desc: 'Aged Assamese & Cambodian Agarwood', href: '/collections/oud' },
    { label: 'Men Fragrances', desc: 'Smoky woods, leather & spiced birch', href: '/collections/men' },
    { label: 'Women Fragrances', desc: 'Damask rose, white florals & amber', href: '/collections/women' },
    { label: 'Unisex Elixirs', desc: 'Warm coffee, gourmand vanilla & resins', href: '/collections/unisex' },
    { label: 'Prive Gift Sets', desc: 'Presented in matte obsidian gold vaults', href: '/shop?category=gift-set' }
  ];

  const isLinkActive = (href: string) => {
    if (href === '/') return currentRoute === '/';
    return currentRoute.startsWith(href);
  };

  return (
    <>
      {/* Top Announcement Micro-Bar */}
      <aside aria-label="Announcement" className="bg-[#070707]/80 backdrop-blur-md text-[#A7A29A] text-[11px] py-1.5 px-4 border-b border-[#C9A45C]/15 relative z-40 hidden sm:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#C9A45C]">
            <Sparkles className="w-3 h-3 text-[#E3C27A]" />
            <span className="tracking-[2px] uppercase font-medium text-[10px]">Complimentary Luxury Gift Set with Orders over 3,000 EGP</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigateTo('/contact')}
              className="hover:text-[#F5F2EA] transition-colors uppercase tracking-[2px] text-[10px]"
            >
              Customer Concierge
            </button>
          </div>
        </div>
      </aside>

      {/* Main Sticky Header with Frosted Glass */}
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled
            ? 'bg-[#070707]/85 backdrop-blur-md border-b border-[#C9A45C]/20 shadow-2xl shadow-black/80 py-3.5'
            : 'bg-[#070707]/75 backdrop-blur-md border-b border-[#C9A45C]/15 py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Mobile and Tablet Menu Trigger */}
          <div className="flex items-center gap-3 lg:hidden">
            <button
              onClick={handleToggleMobileMenu}
              type="button"
              className="p-2.5 -ml-1 text-[#F5F2EA] hover:text-[#C9A45C] transition-colors rounded-lg active:bg-white/5 cursor-pointer touch-manipulation"
              aria-label="Open mobile navigation menu"
            >
              <Menu className="w-6 h-6 text-[#E3C27A]" />
            </button>
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-[#A7A29A] hover:text-[#F5F2EA] transition-colors cursor-pointer"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>

          {/* Brand Logo */}
          <div
            onClick={() => navigateTo('/')}
            className="cursor-pointer group flex flex-col items-center select-none"
          >
            <div className="flex items-center gap-2">
              <span className="font-cinzel text-2xl sm:text-3xl font-extrabold tracking-[4px] text-[#C9A45C] group-hover:text-[#E3C27A] transition-colors">
                OUD-X
              </span>
            </div>
            <span className="text-[8px] uppercase tracking-[3px] text-[#8E713D] group-hover:text-[#C9A45C] transition-colors font-medium -mt-0.5">
              Haute Parfumerie
            </span>
          </div>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-9">
            {navLinks.map((link) => {
              if (link.hasDropdown) {
                return (
                  <div
                    key={link.label}
                    className="relative"
                    onMouseEnter={() => setIsCollectionsHovered(true)}
                    onMouseLeave={() => setIsCollectionsHovered(false)}
                  >
                    <button
                      onClick={() => navigateTo('/shop')}
                      className={`flex items-center gap-1 text-xs font-semibold tracking-[2px] transition-colors py-2 uppercase ${
                        isLinkActive(link.href) ? 'text-[#C9A45C]' : 'text-[#A7A29A] hover:text-[#F5F2EA]'
                      }`}
                    >
                      <span>{link.label}</span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isCollectionsHovered ? 'rotate-180 text-[#C9A45C]' : ''}`} />
                    </button>

                    {/* Dropdown Menu - Frosted Glass */}
                    {isCollectionsHovered && (
                      <div className="absolute top-full left-1/2 -translate-x-1/2 w-72 bg-[#0D0C0A]/90 border border-[#C9A45C]/25 rounded-xl shadow-2xl p-2 pt-3 backdrop-blur-xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                        <div className="text-[10px] uppercase tracking-[2px] text-[#8E713D] px-3 pb-2 border-b border-white/5 font-semibold">
                          Fragrance Chapters
                        </div>
                        <div className="flex flex-col py-1">
                          {collectionDropdownItems.map((item) => (
                            <button
                              key={item.label}
                              onClick={() => {
                                setIsCollectionsHovered(false);
                                navigateTo(item.href);
                              }}
                              className="text-left px-3 py-2 rounded-lg hover:bg-[#C9A45C]/15 group transition-colors"
                            >
                              <div className="text-xs font-medium text-[#F5F2EA] group-hover:text-[#E3C27A] transition-colors">
                                {item.label}
                              </div>
                              <div className="text-[10px] text-[#A7A29A] group-hover:text-neutral-300 truncate">
                                {item.desc}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <button
                  key={link.label}
                  onClick={() => navigateTo(link.href)}
                  className={`relative text-xs font-semibold tracking-[2px] uppercase transition-colors py-2 ${
                    isLinkActive(link.href) ? 'text-[#C9A45C]' : 'text-[#A7A29A] hover:text-[#F5F2EA]'
                  }`}
                >
                  <span>{link.label}</span>
                  {isLinkActive(link.href) && (
                    <span className="absolute bottom-0 inset-x-0 h-[1.5px] bg-[#C9A45C] shadow-sm shadow-[#C9A45C]" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Search Icon (Desktop) */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="hidden lg:flex items-center justify-center w-9 h-9 text-[#A7A29A] hover:text-[#F5F2EA] bg-[#151310]/50 hover:bg-[#151310]/80 border border-[#C9A45C]/20 hover:border-[#C9A45C]/40 rounded-full backdrop-blur-md transition-all"
              aria-label="Search fragrances"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Wishlist Icon */}
            <button
              onClick={() => navigateTo('/wishlist')}
              className="relative hidden sm:flex items-center justify-center w-9 h-9 text-[#A7A29A] hover:text-[#F5F2EA] bg-[#151310]/50 hover:bg-[#151310]/80 border border-[#C9A45C]/20 hover:border-[#C9A45C]/40 rounded-full backdrop-blur-md transition-all"
              aria-label="Saved fragrances"
            >
              <Heart className="w-4 h-4" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#C9A45C] text-[#070707] text-[9px] font-bold rounded-full flex items-center justify-center shadow-sm">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Admin Stock Hub Button */}
            <button
              onClick={() => navigateTo('/account')}
              className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all ${
                isLinkActive('/account') || isLinkActive('/admin')
                  ? 'bg-[#C9A45C] text-[#070707] border-[#C9A45C] font-bold shadow-md shadow-[#C9A45C]/30'
                  : 'bg-[#151310]/60 hover:bg-[#151310]/90 text-[#E3C27A] border-[#C9A45C]/30 hover:border-[#C9A45C]/60'
              }`}
              aria-label="Admin Dashboard & Stock Control"
              title="Admin Stock & Orders Hub"
            >
              <ShieldCheck className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider hidden md:inline">
                Admin Hub
              </span>
            </button>

            {/* Shopping Bag / Cart Button with Frosted Glass Pill */}
            <button
              onClick={() => setIsCartDrawerOpen(true)}
              className="relative flex items-center gap-2.5 px-3.5 py-2 bg-[#151310]/70 hover:bg-[#1f1b16]/90 border border-[#C9A45C]/35 hover:border-[#C9A45C] rounded-full backdrop-blur-md transition-all group cursor-pointer shadow-lg shadow-black/40"
              aria-label="Open shopping bag"
            >
              <ShoppingBag className="w-4 h-4 text-[#C9A45C] group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold tracking-[2px] text-[#F5F2EA] hidden sm:inline">
                BAG
              </span>
              <span className="w-5 h-5 bg-[#C9A45C] text-[#070707] text-[10px] font-bold rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            </button>
          </div>
        </div>
      </header>
    </>
  );
};
