import React from 'react';
import { useShop } from '../context/ShopContext';
import { Button } from '../components/ui/Button';
import { Sparkles, Crown, Award, Droplets, ShieldCheck, ChevronRight } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { navigateTo } = useShop();

  return (
    <div className="min-h-screen bg-[#070707] text-[#F5F2EA] pb-24">
      {/* Editorial Hero */}
      <div className="relative min-h-[420px] flex items-center bg-[#0D0C0A] overflow-hidden border-b border-[#C9A45C]/30">
        <div className="absolute inset-0">
          <img
            src="/src/assets/images/hero_oud_bottle_1787700482747.jpg"
            alt="OUD_X Heritage"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#070707] via-[#070707]/90 to-black/70" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
          <nav className="flex items-center gap-2 text-xs text-[#A7A29A] uppercase tracking-wider mb-6">
            <button onClick={() => navigateTo('/')} className="hover:text-[#F5F2EA]">Home</button>
            <ChevronRight className="w-3 h-3 text-[#8E713D]" />
            <span className="text-[#C9A45C]">Haute Atelier Story</span>
          </nav>

          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#11100E] border border-[#C9A45C]/40">
              <Crown className="w-3.5 h-3.5 text-[#E3C27A]" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#E3C27A]">
                Since 2018 • Cairo & Grasse
              </span>
            </div>

            <h1 className="font-serif-luxury text-3xl sm:text-5xl lg:text-6xl font-normal text-[#F5F2EA] leading-tight">
              THE OUD_X HERITAGE: <br />
              <span className="gold-gradient-text italic font-serif">SCENT OF MAJESTY</span>
            </h1>

            <p className="text-xs sm:text-sm text-[#A7A29A] leading-relaxed">
              Where the ancestral mystique of Middle Eastern agarwood merges seamlessly with French classical perfumery traditions.
            </p>
          </div>
        </div>
      </div>

      {/* Main Narrative Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 space-y-20">
        
        {/* Section 1: Philosophy */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#8E713D] font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A45C]" /> The Core Philosophy
            </span>
            <h2 className="font-serif-luxury text-2xl sm:text-3xl text-[#F5F2EA]">
              Fragrance as an Invisible Crown
            </h2>
            <p className="text-xs sm:text-sm text-[#A7A29A] leading-relaxed">
              At OUD_X, we believe a signature scent should never whisper when it can enchant. Each flacon is designed as an olfactory portrait—distilled in limited micro-batches using unadulterated botanical essences, wild-harvested resin, and pure amber crystals.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0D0C0A] border border-[#C9A45C]/30 shadow-2xl space-y-4">
            <div className="font-cinzel text-lg text-[#E3C27A] border-b border-white/10 pb-2">
              Our 4 Atelier Standards
            </div>
            <ul className="space-y-2.5 text-xs text-[#A7A29A]">
              <li className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-[#C9A45C] shrink-0 mt-0.5" />
                <span><strong>No Compromise Concentration:</strong> All blends are bottled at 30% to 38% pure extrait strength.</span>
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-[#C9A45C] shrink-0 mt-0.5" />
                <span><strong>Sustainable Agarwood Cultivation:</strong> We partner exclusively with certified ethical foresters in Assam and Cambodia.</span>
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-[#C9A45C] shrink-0 mt-0.5" />
                <span><strong>French Charred Oak Casking:</strong> Extracts rest for a minimum of 180 days to achieve unparalleled smoothness.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Section 2: Master Nose Collaborations */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#8E713D] font-semibold">
            THE ALCHEMISTS BEHIND THE SCENTS
          </span>
          <h2 className="font-serif-luxury text-3xl sm:text-4xl text-[#F5F2EA]">
            Master Nose Alchemy
          </h2>
          <p className="text-xs sm:text-sm text-[#A7A29A] leading-relaxed">
            Crafted in collaboration with renowned master noses across Paris, Dubai, and Cairo to compose fragrances with unmatched emotional depth and relentless sillage.
          </p>
          <div className="pt-4">
            <Button onClick={() => navigateTo('/shop')} variant="primary" size="lg">
              DISCOVER OUR CREATIONS
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};
