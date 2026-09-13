import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useShop } from '../../context/ShopContext';
import { Button } from '../ui/Button';
import { Sparkles, Mail, CheckCircle2, ShieldCheck } from 'lucide-react';

export const Newsletter: React.FC = () => {
  const { t } = useTranslation();
  const { showToast } = useShop();
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@') || !email.includes('.')) {
      setError(t('home.newsletter.invalidEmail'));
      return;
    }

    setError('');
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setIsSubscribed(true);
      showToast(t('home.newsletter.successTitle'), t('home.newsletter.successDesc'), 'gold');
    }, 600);
  };

  return (
    <section className="py-24 bg-[#070707] relative border-t border-[#C9A45C]/15 overflow-hidden">
      {/* Background aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#C9A45C]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="p-8 sm:p-14 rounded-2xl bg-[#151310]/60 border border-[#C9A45C]/25 backdrop-blur-xl shadow-2xl text-center space-y-6 relative overflow-hidden">
          
          {/* Subtle Ambient Gold Glow */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#C9A45C] to-transparent" />

          {/* Eyebrow with Frosted Glass Pill */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#070707]/80 border border-[#C9A45C]/35 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-[#C9A45C]" />
            <span className="text-[10px] font-semibold uppercase tracking-[3px] text-[#C9A45C]">
              {t('home.newsletter.badge')}
            </span>
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h2 className="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl font-normal text-[#F5F2EA]">
              {t('home.newsletter.title')}
            </h2>
            <p className="text-xs sm:text-sm text-[#A7A29A] max-w-md mx-auto leading-relaxed">
              {t('home.newsletter.desc')}
            </p>
          </div>

          {/* Form */}
          {isSubscribed ? (
            <div className="p-6 rounded-xl bg-[#0D0C0A]/90 border border-emerald-500/40 text-emerald-300 max-w-md mx-auto space-y-2 animate-in fade-in zoom-in duration-300 backdrop-blur-md">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <h4 className="font-cinzel text-sm font-bold text-[#F5F2EA]">{t('home.newsletter.successTitle')}</h4>
              <p className="text-xs text-[#A7A29A]">{t('home.newsletter.successDesc')}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-3">
              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <Mail className="absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C9A45C]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('home.newsletter.placeholder')}
                    className="w-full bg-[#070707]/80 border border-[#C9A45C]/35 focus:border-[#C9A45C] rounded-full py-3 pl-10 rtl:pl-4 rtl:pr-10 pr-4 text-xs sm:text-sm text-[#F5F2EA] placeholder:text-[#A7A29A]/50 focus:outline-none focus:ring-1 focus:ring-[#C9A45C] backdrop-blur-sm"
                  />
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={loading}
                  className="shrink-0 tracking-[2px] font-bold"
                >
                  {t('home.newsletter.subscribe')}
                </Button>
              </div>

              {error && <p className="text-xs text-red-400 text-left rtl:text-right pl-1 rtl:pr-1">{error}</p>}

              <div className="flex items-center justify-center gap-4 text-[10px] text-[#8E713D] pt-2">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> {t('home.newsletter.zeroSpam')}
                </span>
                <span>•</span>
                <span>{t('home.newsletter.privateAllocations')}</span>
                <span>•</span>
                <span>{t('home.newsletter.unsubscribeAnytime')}</span>
              </div>
            </form>
          )}

        </div>
      </div>
    </section>
  );
};
