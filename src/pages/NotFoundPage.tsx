import React from 'react';
import { useTranslation } from 'react-i18next';
import { useShop } from '../context/ShopContext';
import { Sparkles, Compass, ArrowRight } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const { t } = useTranslation();
  const { navigateTo } = useShop();

  return (
    <div className="min-h-screen bg-[#070707] text-[#F5F2EA] flex flex-col items-center justify-center p-6 text-center select-none pb-24">
      <div className="max-w-lg w-full p-8 sm:p-12 rounded-2xl bg-[#0D0C0A] border border-[#C9A45C]/35 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#C9A45C] to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#C9A45C]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="w-16 h-16 rounded-full bg-[#151310] border border-[#C9A45C]/40 mx-auto flex items-center justify-center text-[#E3C27A]">
          <Compass className="w-8 h-8 text-[#C9A45C]" />
        </div>

        <div className="space-y-2">
          <span className="font-cinzel text-xs uppercase tracking-[4px] text-[#C9A45C] font-semibold flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> {t('notFound.badge', '404 • UNCHARTED SCENT')}
          </span>
          <h1 className="font-serif-luxury text-3xl sm:text-4xl text-[#F5F2EA]">
            {t('notFound.title', 'Destination Vaulted')}
          </h1>
          <p className="text-xs text-[#A7A29A] leading-relaxed max-w-sm mx-auto">
            {t('notFound.desc', 'The fragrance journey you are searching for does not exist or has been retired to our private archives.')}
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigateTo('/shop')}
            className="py-3 px-6 rounded-full bg-[#C9A45C] hover:bg-[#E3C27A] text-[#070707] font-bold text-xs uppercase tracking-[2px] transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            {t('notFound.exploreBoutique', 'Explore Boutique')} <ArrowRight className="w-3.5 h-3.5 rtl-flip" />
          </button>
          <button
            onClick={() => navigateTo('/')}
            className="py-3 px-6 rounded-full bg-transparent border border-[#C9A45C]/40 hover:bg-[#C9A45C]/10 text-[#C9A45C] font-semibold text-xs uppercase tracking-[2px] transition-colors cursor-pointer"
          >
            {t('notFound.returnHome', 'Return Home')}
          </button>
        </div>
      </div>
    </div>
  );
};
