import React from 'react';
import { useShop } from '../../context/ShopContext';
import { Phone, Mail, MapPin, Instagram, Facebook, Youtube, ShieldCheck, Award, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  const { navigateTo } = useShop();

  return (
    <footer className="bg-[#050505] text-[#A7A29A] border-t border-[#C9A45C]/20 pt-16 pb-12 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-[#C9A45C]/30 to-transparent" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[#C9A45C]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-14 border-b border-[#C9A45C]/15">
          {/* Col 1: Brand */}
          <div className="lg:col-span-1 space-y-4">
            <div
              onClick={() => navigateTo('/')}
              className="cursor-pointer select-none"
            >
              <span className="font-cinzel text-2xl font-extrabold tracking-[4px] text-[#C9A45C]">
                OUD_X
              </span>
              <span className="block text-[8px] uppercase tracking-[3px] text-[#8E713D] font-medium -mt-0.5">
                Haute Parfumerie
              </span>
            </div>

            <p className="font-serif-luxury italic text-sm text-[#F0D9A4] leading-relaxed">
              &quot;Scent of luxury, essence of you.&quot;
            </p>

            <p className="text-xs text-[#A7A29A] leading-relaxed">
              Curators of rare Middle Eastern agarwoods, precious ambergris, and exquisite French-Arabian haute perfumery.
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
          <div className="space-y-3">
            <h4 className="font-cinzel text-xs font-bold uppercase tracking-[2px] text-[#F5F2EA] border-b border-[#C9A45C]/30 pb-2 inline-block">
              Shop Fragrances
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => navigateTo('/shop')} className="hover:text-[#F0D9A4] transition-colors">
                  All Products
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('/collections/oud')} className="hover:text-[#F0D9A4] transition-colors text-[#C9A45C] flex items-center gap-1">
                  <span>Oud Collection</span>
                  <Sparkles className="w-2.5 h-2.5 text-[#C9A45C]" />
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('/collections/men')} className="hover:text-[#F0D9A4] transition-colors">
                  Men Collection
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('/collections/women')} className="hover:text-[#F0D9A4] transition-colors">
                  Women Collection
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('/collections/unisex')} className="hover:text-[#F0D9A4] transition-colors">
                  Unisex Elixirs
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('/shop?category=gift-set')} className="hover:text-[#F0D9A4] transition-colors">
                  Gift Sets & Vaults
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Customer Care */}
          <div className="space-y-3">
            <h4 className="font-cinzel text-xs font-bold uppercase tracking-[2px] text-[#F5F2EA] border-b border-[#C9A45C]/30 pb-2 inline-block">
              Customer Care
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => navigateTo('/account')} className="hover:text-[#F0D9A4] text-[#C9A45C] font-semibold transition-colors flex items-center gap-1">
                  <span>Admin & Stock Hub</span>
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('/contact')} className="hover:text-[#F0D9A4] transition-colors">
                  Contact VIP Concierge
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('/contact#faqs')} className="hover:text-[#F0D9A4] transition-colors">
                  Frequently Asked Questions
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('/contact#shipping')} className="hover:text-[#F0D9A4] transition-colors">
                  Shipping & Delivery Info
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('/contact#returns')} className="hover:text-[#F0D9A4] transition-colors">
                  Returns & Guarantees
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('/contact#terms')} className="hover:text-[#F0D9A4] transition-colors">
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('/contact#privacy')} className="hover:text-[#F0D9A4] transition-colors">
                  Privacy Policy
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: About Us */}
          <div className="space-y-3">
            <h4 className="font-cinzel text-xs font-bold uppercase tracking-[2px] text-[#F5F2EA] border-b border-[#C9A45C]/30 pb-2 inline-block">
              Haute Atelier
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => navigateTo('/about')} className="hover:text-[#F0D9A4] transition-colors">
                  Our Heritage & Story
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('/about#sourcing')} className="hover:text-[#F0D9A4] transition-colors">
                  Artisanal Oud Sourcing
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('/about#perfumers')} className="hover:text-[#F0D9A4] transition-colors">
                  Master Nose Collaborations
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('/about#sustainability')} className="hover:text-[#F0D9A4] transition-colors">
                  Ethical Agarwood Forestation
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('/account')} className="hover:text-[#F0D9A4] transition-colors text-[#C9A45C]">
                  OUD_X Privé Club
                </button>
              </li>
            </ul>
          </div>

          {/* Col 5: Boutique & Contact */}
          <div className="space-y-3">
            <h4 className="font-cinzel text-xs font-bold uppercase tracking-[2px] text-[#F5F2EA] border-b border-[#C9A45C]/30 pb-2 inline-block">
              Boutique Concierge
            </h4>
            <div className="space-y-3 text-xs text-[#A7A29A]">
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#C9A45C] shrink-0" />
                <span>01127977819</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#C9A45C] shrink-0" />
                <span>oudx.fragrances@gmail.com</span>
              </div>
              <div className="pt-2 text-[11px] text-[#8E713D]">
                <span>Mon – Sun: 11:00 AM – 11:00 PM CLT</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Payment Badges */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="text-[#A7A29A]/80 text-center sm:text-left">
            © 2026 OUD_X Haute Parfumerie. All Rights Reserved. Crafted with pure devotion to scent.
          </div>

          {/* Supported Payments - Frosted Glass Pills */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <span className="text-[10px] uppercase tracking-wider text-[#8E713D] mr-1">Secured By:</span>
            <div className="px-2.5 py-1 rounded-full bg-[#151310]/70 border border-[#C9A45C]/20 text-[10px] font-bold text-[#F5F2EA] backdrop-blur-sm">
              VISA
            </div>
            <div className="px-2.5 py-1 rounded-full bg-[#151310]/70 border border-[#C9A45C]/20 text-[10px] font-bold text-[#F5F2EA] backdrop-blur-sm">
              MASTERCARD
            </div>
            <div className="px-2.5 py-1 rounded-full bg-[#151310]/70 border border-[#C9A45C]/20 text-[10px] font-bold text-[#F5F2EA] backdrop-blur-sm">
              APPLE PAY
            </div>
            <div className="px-2.5 py-1 rounded-full bg-[#151310]/80 border border-[#C9A45C]/40 text-[10px] font-bold text-[#F0D9A4] backdrop-blur-sm">
              INSTAPAY EGYPT
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
