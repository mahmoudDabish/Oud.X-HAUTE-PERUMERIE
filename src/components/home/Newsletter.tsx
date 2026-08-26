import React, { useState } from 'react';
import { useShop } from '../../context/ShopContext';
import { Button } from '../ui/Button';
import { Sparkles, Mail, CheckCircle2, ShieldCheck } from 'lucide-react';

export const Newsletter: React.FC = () => {
  const { showToast } = useShop();
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address');
      return;
    }

    setError('');
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setIsSubscribed(true);
      showToast('Welcome to OUD_X Privé', 'A private invitation voucher has been reserved for your inbox.', 'gold');
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
              PRIVATE CLIENTELE ONLY
            </span>
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h2 className="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl font-normal text-[#F5F2EA]">
              JOIN THE OUD_X PRIVATE CLUB
            </h2>
            <p className="text-xs sm:text-sm text-[#A7A29A] max-w-md mx-auto leading-relaxed">
              Be the first to know about new arrivals, private cask releases, exclusive offers and bespoke invitations.
            </p>
          </div>

          {/* Form */}
          {isSubscribed ? (
            <div className="p-6 rounded-xl bg-[#0D0C0A]/90 border border-emerald-500/40 text-emerald-300 max-w-md mx-auto space-y-2 animate-in fade-in zoom-in duration-300 backdrop-blur-md">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <h4 className="font-cinzel text-sm font-bold text-[#F5F2EA]">You are now an OUD_X Privé Member</h4>
              <p className="text-xs text-[#A7A29A]">Check your inbox shortly for your 10% welcome privilege code.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-3">
              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C9A45C]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your private email"
                    className="w-full bg-[#070707]/80 border border-[#C9A45C]/35 focus:border-[#C9A45C] rounded-full py-3 pl-10 pr-4 text-xs sm:text-sm text-[#F5F2EA] placeholder:text-[#A7A29A]/50 focus:outline-none focus:ring-1 focus:ring-[#C9A45C] backdrop-blur-sm"
                  />
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={loading}
                  className="shrink-0 tracking-[2px] font-bold"
                >
                  SUBSCRIBE
                </Button>
              </div>

              {error && <p className="text-xs text-red-400 text-left pl-1">{error}</p>}

              <div className="flex items-center justify-center gap-4 text-[10px] text-[#8E713D] pt-2">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Zero spam
                </span>
                <span>•</span>
                <span>Exclusive private allocations</span>
                <span>•</span>
                <span>Unsubscribe anytime</span>
              </div>
            </form>
          )}

        </div>
      </div>
    </section>
  );
};
