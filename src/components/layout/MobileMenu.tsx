import React from 'react';
import { useShop } from '../../context/ShopContext';
import { useTranslation } from 'react-i18next';
import { X, Heart, User, ShoppingBag, ChevronRight, Sparkles, Phone, Mail, ShieldCheck } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { LanguageSwitcher } from './LanguageSwitcher';

interface MobileMenuProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen: propIsOpen, onClose: propOnClose }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

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
      title: t('nav.main'),
      links: [
        { label: t('nav.home'), href: '/' },
        { label: t('nav.allFragrances'), href: '/shop' },
        { label: t('nav.bestSellers'), href: '/shop?filter=bestsellers' }
      ]
    },
    {
      title: t('nav.fragranceCollections'),
      links: [
        { label: t('nav.oudCollection'), href: '/collections/oud', badge: t('nav.precious') },
        { label: t('nav.menFragrances'), href: '/collections/men' },
        { label: t('nav.womenFragrances'), href: '/collections/women' },
        { label: t('nav.unisexElixirs'), href: '/collections/unisex' }
      ]
    },
    {
      title: t('nav.maisonAtelier'),
      links: [
        { label: t('nav.ourStoryHeritage'), href: '/about' },
        { label: t('nav.vipConciergeContact'), href: '/contact' }
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
            initial={{ x: isRtl ? '100%' : '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: isRtl ? '100%' : '-100%' }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className={`fixed inset-y-0 ${
              isRtl ? 'right-0 border-l' : 'left-0 border-r'
            } w-[85%] max-w-sm bg-[#0D0C0A] border-[#C9A45C]/30 backdrop-blur-2xl shadow-2xl flex flex-col justify-between overflow-y-auto z-50`}
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
                  className="p-2.5 text-[#A7A29A] hover:text-[#F5F2EA] rounded-full hover:bg-white/10 transition-colors border border-white/5 active:scale-95 cursor-pointer"
                  aria-label={t('nav.closeMenu')}
                >
                  <X className="w-5 h-5 text-[#E3C27A]" />
                </button>
              </div>

              {/* Language Switcher in Mobile Drawer */}
              <div className="px-4 pt-3 pb-1">
                <LanguageSwitcher isMobile={true} />
              </div>

              {/* Admin Hub Highlight Banner */}
              <div className="p-4 pb-1">
                <button
                  onClick={() => handleLinkClick('/account')}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl bg-gradient-to-r from-[#C9A45C]/20 to-[#C9A45C]/10 border border-[#C9A45C]/50 text-left rtl:text-right transition-all hover:border-[#C9A45C] group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-5 h-5 text-[#E3C27A] shrink-0" />
                    <div>
                      <span className="block text-xs font-bold uppercase tracking-[1.5px] text-[#F0D9A4]">
                        {t('nav.adminHub')}
                      </span>
                      <span className="text-[10px] text-[#A7A29A]">
                        {t('nav.adminHubDesc')}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#C9A45C] group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 rtl-flip transition-transform shrink-0" />
                </button>
              </div>

              {/* Navigation Links with Spacious, Luxurious Rhythm */}
              <nav className="p-4 pt-3 space-y-5">
                {navSections.map((section, sIdx) => (
                  <div key={sIdx} className="space-y-2">
                    <div className="text-[10px] uppercase font-bold tracking-[2px] text-[#8E713D] px-2 text-left rtl:text-right">
                      {section.title}
                    </div>
                    <div className="space-y-2">
                      {section.links.map((link) => (
                        <button
                          key={link.label}
                          onClick={() => handleLinkClick(link.href)}
                          className="w-full flex items-center justify-between py-3 px-3.5 rounded-xl text-left rtl:text-right transition-all text-[#F5F2EA] hover:bg-[#181613] border border-white/5 hover:border-[#C9A45C]/30 active:bg-[#C9A45C]/10 cursor-pointer"
                        >
                          <span className="text-sm font-medium tracking-[1px]">{link.label}</span>
                          <div className="flex items-center gap-2">
                            {link.badge && (
                              <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#C9A45C]/20 text-[#E3C27A] font-semibold border border-[#C9A45C]/30">
                                {link.badge}
                              </span>
                            )}
                            <ChevronRight className="w-4 h-4 text-[#C9A45C]/70 rtl-flip shrink-0" />
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
                  className="flex items-center justify-center gap-2 py-3 px-3 rounded-full bg-[#1A1815] border border-[#C9A45C]/30 text-xs font-semibold text-[#F5F2EA] hover:border-[#C9A45C] transition-colors shadow-sm cursor-pointer"
                >
                  <User className="w-4 h-4 text-[#C9A45C]" />
                  <span>{isLoggedIn ? t('nav.account') : t('nav.signIn')}</span>
                </button>

                <button
                  onClick={() => handleLinkClick('/wishlist')}
                  className="flex items-center justify-center gap-2 py-3 px-3 rounded-full bg-[#1A1815] border border-[#C9A45C]/30 text-xs font-semibold text-[#F5F2EA] hover:border-[#C9A45C] transition-colors shadow-sm cursor-pointer"
                >
                  <Heart className="w-4 h-4 text-[#C9A45C]" />
                  <span>{t('nav.wishlist')} ({wishlistCount})</span>
                </button>
              </div>

              {/* Concierge contact */}
              <div className="text-[11px] text-[#A7A29A] space-y-1.5 pt-1 text-left rtl:text-right">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#C9A45C] shrink-0" />
                  <span dir="ltr">VIP Concierge: +20 100 892 4100</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#C9A45C] shrink-0" />
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
