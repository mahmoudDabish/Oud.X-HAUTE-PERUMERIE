import React from 'react';
import { Star, Sparkles, Quote } from 'lucide-react';

const TESTIMONIALS = [
  {
    id: 'test-1',
    author: 'Ahmed M.',
    location: 'Cairo, Egypt',
    rating: 5,
    quote: 'The quality is unmatched. OUD_X is my go-to brand for every occasion.',
    fragrance: "Bade'e Al Oud"
  },
  {
    id: 'test-2',
    author: 'Sara A.',
    location: 'Alexandria, Egypt',
    rating: 5,
    quote: 'Luxury in a bottle. The scents are absolutely captivating, and the packaging is exquisite.',
    fragrance: 'Khamrah Qahwa'
  },
  {
    id: 'test-3',
    author: 'Mostafa H.',
    location: 'Giza, Egypt',
    rating: 5,
    quote: 'Fast delivery and amazing packaging. Highly recommended.',
    fragrance: 'Royal Oud'
  }
];
export const Testimonials: React.FC = () => {
  return (
    <section className="py-24 bg-[#0D0C0A] border-t border-[#C9A45C]/15 relative overflow-hidden">
      {/* Ambient background aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#C9A45C]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
          <span className="text-[11px] uppercase tracking-[3px] text-[#C9A45C] font-semibold flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#C9A45C]" /> Connoisseur Impressions
          </span>
          <h2 className="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl font-normal text-[#F5F2EA]">
            WHAT OUR CLIENTS SAY
          </h2>
          <p className="text-xs sm:text-sm text-[#A7A29A]">
            Genuine reflections from fragrance collectors and esteemed clientele across Egypt & the Gulf.
          </p>
        </div>

        {/* 3 Testimonial Cards - Frosted Glass */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.id}
              className="p-8 rounded-2xl bg-[#151310]/60 border border-[#C9A45C]/15 hover:border-[#C9A45C]/40 backdrop-blur-md transition-all duration-300 shadow-xl flex flex-col justify-between space-y-6 relative group"
            >
              <div className="space-y-4">
                {/* 5 Golden Stars */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[#E3C27A]">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-[#C9A45C] text-[#C9A45C]" />
                    ))}
                  </div>
                  <Quote className="w-6 h-6 text-[#C9A45C]/20 group-hover:text-[#C9A45C]/40 transition-colors" />
                </div>

                {/* Quote Text */}
                <p className="text-sm sm:text-base text-[#F5F2EA] leading-relaxed font-serif-luxury italic">
                  &quot;{t.quote}&quot;
                </p>
              </div>

              {/* Author Info */}
              <div className="pt-4 border-t border-[#C9A45C]/15 flex items-center justify-between">
                <div>
                  <h4 className="font-cinzel text-xs font-bold text-[#F0D9A4] tracking-[2px]">
                    {t.author}
                  </h4>
                  <span className="text-[10px] text-[#A7A29A]">{t.location}</span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] uppercase tracking-wider text-[#8E713D] block font-semibold">
                    Verified Purchase
                  </span>
                  <span className="text-[10px] text-[#C9A45C] font-serif truncate max-w-[120px] block">
                    {t.fragrance}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
