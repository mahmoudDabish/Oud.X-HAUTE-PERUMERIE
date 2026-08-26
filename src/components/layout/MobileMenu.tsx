import React from 'react';
import { useShop } from '../../context/ShopContext';
import { X, Heart, User, ShoppingBag, ChevronRight, Sparkles, Phone, Mail, ShieldCheck } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

interface MobileMenuProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen: propIsOpen, onClose: propOnClose }) => {
  const {
    navigateTo,
    wishlistCount,
    cartCount,
    setIsCartDrawerOpen,
    isLoggedIn,
    user,
    isMobileMenuOpen,
    setIsMobileMenuOpen
  } = useShop();

  const isOpen = propIsOpen !== undefined ? propIsOpen : isMobileMenuOpen;
  const handleClose = () => {
    if (propOnClose) {
      propOnClose();
    }
    setIsMobileMenuOpen(false);
  };

  const navSections = [
    {
      title: 'Main',
      links: [
        { label: 'Home', href: '/' },
        { label: 'All Fragrances', href: '/shop' },
        { label: 'Best Sellers', href: '/shop?filter=bestsellers' }
      ]
    },
    {
      title: 'Fragrance Collections',
      links: [
        { label: 'Oud Collection', href: '/collections/oud', badge: 'Precious' },
        { label: 'Men Fragrances', href: '/collections/men' },
        { label: 'Women Fragrances', href: '/collections/women' },
        { label: 'Unisex Elixirs', href: '/collections/unisex' }
      ]
    },
    {
      title: 'Maison & Atelier',
      links: [
        { label: 'Our Story & Heritage', href: '/about' },
        { label: 'VIP Concierge & Contact', href: '/contact' }
      ]
    }
  ];

  const handleLinkClick = (href: string) => {
    handleClose();
    navigateTo(href);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
          />

          {/* Drawer Menu with Frosted Glass */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-y-0 left-0 w-[85%] max-w-sm bg-[#0D0C0A] border-r border-[#C9A45C]/30 backdrop-blur-2xl shadow-2xl flex flex-col justify-between overflow-y-auto z-50"
          >
            {/* Header */}
            <div>
              <div className="p-5 border-b border-[#C9A45C]/20 flex items-center justify-between bg-[#151310]/90 backdrop-blur-md">
                <div onClick={() => handleLinkClick('/')} className="cursor-pointer">
                  <span className="font-cinzel text-xl font-extrabold tracking-[4px] text-[#C9A45C]">
                    OUD-X
                  </span>
                  <span className="block text-[8px] uppercase tracking-[3px] text-[#8E713D]">
                    Haute Parfumerie
                  </span>
                </div>

                <button
                  onClick={handleClose}
                  className="p-2.5 text-[#A7A29A] hover:text-[#F5F2EA] rounded-full hover:bg-white/10 transition-colors border border-white/5 active:scale-95"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5 text-[#E3C27A]" />
                </button>
              </div>

              {/* Admin Hub Highlight Banner */}
              <div className="p-4 pb-1">
                <button
                  onClick={() => handleLinkClick('/account')}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl bg-gradient-to-r from-[#C9A45C]/20 to-[#C9A45C]/10 border border-[#C9A45C]/50 text-left transition-all hover:border-[#C9A45C] group"
                >
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-5 h-5 text-[#E3C27A]" />
                    <div>
                      <span className="block text-xs font-bold uppercase tracking-[1.5px] text-[#F0D9A4]">
                        Admin Stock Hub
                      </span>
                      <span className="text-[10px] text-[#A7A29A]">
                        Live inventory & orders
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#C9A45C] group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>

              {/* Navigation Links with Spacious, Luxurious Rhythm */}
              <nav className="p-4 pt-3 space-y-5">
                {navSections.map((section, sIdx) => (
                  <div key={sIdx} className="space-y-2">
                    <div className="text-[10px] uppercase font-bold tracking-[2px] text-[#8E713D] px-2">
                      {section.title}
                    </div>
                    <div className="space-y-2">
                      {section.links.map((link) => (
                        <button
                          key={link.label}
                          onClick={() => handleLinkClick(link.href)}
                          className="w-full flex items-center justify-between py-3 px-3.5 rounded-xl text-left transition-all text-[#F5F2EA] hover:bg-[#181613] border border-white/5 hover:border-[#C9A45C]/30 active:bg-[#C9A45C]/10"
                        >
                          <span className="text-sm font-medium tracking-[1px]">{link.label}</span>
                          <div className="flex items-center gap-2">
                            {link.badge && (
                              <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#C9A45C]/20 text-[#E3C27A] font-semibold border border-[#C9A45C]/30">
                                {link.badge}
                              </span>
                            )}
                            <ChevronRight className="w-4 h-4 text-[#C9A45C]/70" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </nav>
            </div>

            {/* Bottom Actions & User info */}
            <div className="p-5 border-t border-[#C9A45C]/20 bg-[#151310]/90 backdrop-blur-md space-y-4">
              {/* Account & Wishlist shortcuts */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleLinkClick(isLoggedIn ? '/account' : '/login')}
                  className="flex items-center justify-center gap-2 py-3 px-3 rounded-full bg-[#1A1815] border border-[#C9A45C]/30 text-xs font-semibold text-[#F5F2EA] hover:border-[#C9A45C] transition-colors shadow-sm"
                >
                  <User className="w-4 h-4 text-[#C9A45C]" />
                  <span>{isLoggedIn ? 'Account' : 'Sign In'}</span>
                </button>

                <button
                  onClick={() => handleLinkClick('/wishlist')}
                  className="flex items-center justify-center gap-2 py-3 px-3 rounded-full bg-[#1A1815] border border-[#C9A45C]/30 text-xs font-semibold text-[#F5F2EA] hover:border-[#C9A45C] transition-colors shadow-sm"
                >
                  <Heart className="w-4 h-4 text-[#C9A45C]" />
                  <span>Wishlist ({wishlistCount})</span>
                </button>
              </div>

              {/* Concierge contact */}
              <div className="text-[11px] text-[#A7A29A] space-y-1.5 pt-1">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#C9A45C]" />
                  <span>VIP Concierge: +20 100 892 4100</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#C9A45C]" />
                  <span>prive@oudx-fragrances.com</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
