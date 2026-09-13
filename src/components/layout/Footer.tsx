import React from 'react';
import { useShop } from '../../context/ShopContext';
import { useTranslation } from 'react-i18next';
import { Phone, Mail, Instagram, Facebook, Youtube, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  const { navigateTo } = useShop();
  const { t } = useTranslation();

  return (
    <footer className="bg-[#050505] text-[#A7A29A] border-t border-[#C9A45C]/20 pt-16 pb-12 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-[#C9A45C]/30 to-transparent" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[#C9A45C]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-14 border-b border-[#C9A45C]/15">
          {/* Col 1: Brand */}
          <div className="lg:col-span-1 space-y-4 text-left rtl:text-right">
            <div
              onClick={() => navigateTo('/')}
              className="cursor-pointer select-none"
            >
              <span className="font-cinzel text-2xl font-extrabold tracking-[4px] text-[#C9A45C]">
                OUD-X
              </span>
              <span className="block text-[8px] uppercase tracking-[3px] text-[#8E713D] font-medium -mt-0.5">
                {t('footer.brandSubtitle')}
              </span>
            </div>

            <p className="font-serif-luxury italic text-sm text-[#F0D9A4] leading-relaxed">
              {t('footer.tagline')}
            </p>

            <p className="text-xs text-[#A7A29A] leading-relaxed">
              {t('footer.desc')}
            </p>

            <div className="pt-2 flex items-center gap-3">
              <a
                href="#instagram"
                className="w-8 h-8 rounded-full bg-[#151310]/70 border border-[#C9A45C]/20 hover:border-[#C9A45C] text-[#A7A29A] hover:text-[#F0D9A4] backdrop-blur-md flex items-center justify-center transition-colors shadow-sm"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#facebook"
                className="w-8 h-8 rounded-full bg-[#151310]/70 border border-[#C9A45C]/20 hover:border-[#C9A45C] text-[#A7A29A] hover:text-[#F0D9A4] backdrop-blur-md flex items-center justify-center transition-colors shadow-sm"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="#youtube"
                className="w-8 h-8 rounded-full bg-[#151310]/70 border border-[#C9A45C]/20 hover:border-[#C9A45C] text-[#A7A29A] hover:text-[#F0D9A4] backdrop-blur-md flex items-center justify-center transition-colors shadow-sm"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Shop */}
          <div className="space-y-3 text-left rtl:text-right">
            <h4 className="font-cinzel text-xs font-bold uppercase tracking-[2px] text-[#F5F2EA] border-b border-[#C9A45C]/30 pb-2 inline-block">
              {t('footer.shopTitle')}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => navigateTo('/shop')} className="hover:text-[#F0D9A4] transition-colors cursor-pointer">
                  {t('footer.allProducts')}
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('/collections/oud')} className="hover:text-[#F0D9A4] transition-colors text-[#C9A45C] flex items-center gap-1 cursor-pointer">
                  <span>{t('footer.oudCollection')}</span>
                  <Sparkles className="w-2.5 h-2.5 text-[#C9A45C]" />
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('/collections/men')} className="hover:text-[#F0D9A4] transition-colors cursor-pointer">
                  {t('footer.menCollection')}
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('/collections/women')} className="hover:text-[#F0D9A4] transition-colors cursor-pointer">
                  {t('footer.womenCollection')}
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('/collections/unisex')} className="hover:text-[#F0D9A4] transition-colors cursor-pointer">
                  {t('footer.unisexElixirs')}
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('/shop?category=gift-set')} className="hover:text-[#F0D9A4] transition-colors cursor-pointer">
                  {t('footer.giftSets')}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Customer Care */}
          <div className="space-y-3 text-left rtl:text-right">
            <h4 className="font-cinzel text-xs font-bold uppercase tracking-[2px] text-[#F5F2EA] border-b border-[#C9A45C]/30 pb-2 inline-block">
              {t('footer.customerCareTitle')}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => navigateTo('/account')} className="hover:text-[#F0D9A4] text-[#C9A45C] font-semibold transition-colors flex items-center gap-1 cursor-pointer">
                  <span>{t('footer.adminHub')}</span>
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('/contact')} className="hover:text-[#F0D9A4] transition-colors cursor-pointer">
                  {t('footer.contactConcierge')}
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('/account')} className="hover:text-[#F0D9A4] transition-colors cursor-pointer">
                  {t('footer.trackOrder')}
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('/contact')} className="hover:text-[#F0D9A4] transition-colors cursor-pointer">
                  {t('footer.shippingReturns')}
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('/contact')} className="hover:text-[#F0D9A4] transition-colors cursor-pointer">
                  {t('footer.faq')}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: About Us */}
          <div className="space-y-3 text-left rtl:text-right">
            <h4 className="font-cinzel text-xs font-bold uppercase tracking-[2px] text-[#F5F2EA] border-b border-[#C9A45C]/30 pb-2 inline-block">
              {t('footer.maisonTitle')}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => navigateTo('/about')} className="hover:text-[#F0D9A4] transition-colors cursor-pointer">
                  {t('footer.ourStory')}
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('/about')} className="hover:text-[#F0D9A4] transition-colors cursor-pointer">
                  {t('footer.artisanalCraft')}
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('/about')} className="hover:text-[#F0D9A4] transition-colors cursor-pointer">
                  {t('footer.sustainableOud')}
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('/about')} className="hover:text-[#F0D9A4] transition-colors cursor-pointer">
                  {t('footer.privateEvents')}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 5: Boutique & Contact */}
          <div className="space-y-3 text-left rtl:text-right">
            <h4 className="font-cinzel text-xs font-bold uppercase tracking-[2px] text-[#F5F2EA] border-b border-[#C9A45C]/30 pb-2 inline-block">
              {t('contact.title')}
            </h4>
            <div className="space-y-3 text-xs text-[#A7A29A]">
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#C9A45C] shrink-0" />
                <span dir="ltr">+20 100 892 4100</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#C9A45C] shrink-0" />
                <span>prive@oudx-fragrances.com</span>
              </div>
              <div className="pt-2 text-[11px] text-[#8E713D]">
                <span>{t('contact.hoursValue')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Payment Badges */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="text-[#A7A29A]/80 text-center sm:text-left rtl:sm:text-right">
            © 2026 OUD-X Haute Parfumerie. {t('footer.rights')}
          </div>

          {/* Supported Payments - Frosted Glass Pills */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <div className="px-2.5 py-1 rounded-full bg-[#151310]/70 border border-[#C9A45C]/20 text-[10px] font-bold text-[#F5F2EA] backdrop-blur-sm">
              VISA
            </div>
            <div className="px-2.5 py-1 rounded-full bg-[#151310]/70 border border-[#C9A45C]/20 text-[10px] font-bold text-[#F5F2EA] backdrop-blur-sm">
              MASTERCARD
            </div>
            <div className="px-2.5 py-1 rounded-full bg-[#151310]/80 border border-[#C9A45C]/40 text-[10px] font-bold text-[#F0D9A4] backdrop-blur-sm">
              INSTAPAY
            </div>
            <div className="px-2.5 py-1 rounded-full bg-[#151310]/70 border border-[#C9A45C]/20 text-[10px] font-bold text-neutral-300 backdrop-blur-sm">
              CASH ON DELIVERY
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
