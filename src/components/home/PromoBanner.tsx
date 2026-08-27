import React from 'react';
import { useShop } from '../../context/ShopContext';
import { Button } from '../ui/Button';
import { Sparkles, ArrowRight, Tag } from 'lucide-react';

export const PromoBanner: React.FC = () => {
  const { navigateTo, applyPromoCode } = useShop();

  const handleApplyPromo = () => {
    navigateTo('/shop?filter=sale');
  };

  return (
    <section className="py-20 bg-[#070707] relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 right-1/4 w-[500px] h-[500px] bg-[#C9A45C]/10 rounded-full blur-[120px] pointer-events-none -translate-y-1/2" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="relative rounded-2xl overflow-hidden border border-[#C9A45C]/25 bg-[#151310]/60 backdrop-blur-xl shadow-2xl shadow-black">
          
          {/* Background Image with Frosted Dark Vignette */}
          <div className="absolute inset-0">
            <img
              src="/src/assets/images/luxury_gift_box_1787700496704.jpg"
              alt="Exclusive Offer Luxury Gift Set"
              referrerPolicy="no-referrer"
              loading="lazy"
              className="w-full h-full object-cover object-center opacity-70"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#070707] via-[#070707]/85 to-black/60" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#070707] via-transparent to-black/40" />
          </div>

          {/* Content Container */}
          <div className="relative z-10 p-8 sm:p-14 lg:p-16 max-w-2xl space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#070707]/80 border border-[#C9A45C]/35 backdrop-blur-md">
              <Tag className="w-3.5 h-3.5 text-[#C9A45C]" />
              <span className="text-[10px] font-semibold uppercase tracking-[3px] text-[#C9A45C]">
                SEASONAL PRIVILEGE
              </span>
            </div>

            <div className="space-y-2">
              <span className="text-xs uppercase tracking-[3px] text-[#A7A29A] font-semibold block">
                EXCLUSIVE OFFER
              </span>
              <h2 className="font-serif-luxury text-3xl sm:text-5xl lg:text-6xl font-normal text-[#F5F2EA] leading-tight">
                UP TO 20% OFF <br />
                <span className="text-[#C9A45C] italic font-serif">ON SELECTED ITEMS</span>
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-[#A7A29A] leading-relaxed max-w-lg">
              Indulge in our curated private vaults and bespoke travel atomizers. <strong className="text-[#F0D9A4]">Discounts are applied automatically</strong> to selected items in the shop. No code required.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <Button
                onClick={handleApplyPromo}
                variant="primary"
                size="lg"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="shadow-xl shadow-[#C9A45C]/15 tracking-[2px] font-bold"
              >
                SHOP THE SALE
              </Button>

              <Button
                onClick={() => navigateTo('/products/prive-gift-vault')}
                variant="secondary"
                size="lg"
                className="tracking-[2px] font-bold"
              >
                EXPLORE GIFT VAULT
              </Button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
