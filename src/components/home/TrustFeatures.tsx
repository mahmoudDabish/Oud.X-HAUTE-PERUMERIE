import React from 'react';
import { ShieldCheck, Truck, Lock, Sparkles } from 'lucide-react';

export const TrustFeatures: React.FC = () => {
  const features = [
    {
      icon: <ShieldCheck className="w-6 h-6 text-[#C9A45C]" />,
      title: '100% AUTHENTIC',
      description: 'Original niche fragrances directly sourced & guaranteed.'
    },
    {
      icon: <Truck className="w-6 h-6 text-[#C9A45C]" />,
      title: 'FAST DELIVERY',
      description: 'Express 24–48h white-glove delivery across Egypt.'
    },
    {
      icon: <Lock className="w-6 h-6 text-[#C9A45C]" />,
      title: 'SECURE PAYMENT',
      description: 'Safe & encrypted checkout via Card, Instapay or Cash.'
    },
    {
      icon: <Sparkles className="w-6 h-6 text-[#C9A45C]" />,
      title: 'PREMIUM QUALITY',
      description: 'Finest natural oils & aged agarwood extracts crafted to perfection.'
    }
  ];

  return (
    <section className="py-12 bg-[#070707] border-y border-[#C9A45C]/15 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, idx) => (
            <div
              key={idx}
              className="p-5 rounded-xl bg-[#151310]/60 border border-[#C9A45C]/15 hover:border-[#C9A45C]/40 backdrop-blur-md transition-all duration-300 flex items-start gap-4 shadow-lg hover:shadow-xl hover:shadow-[#C9A45C]/5"
            >
              <div className="p-2.5 rounded-lg bg-[#070707]/70 border border-[#C9A45C]/25 backdrop-blur-sm shrink-0">
                {feat.icon}
              </div>
              <div className="space-y-1">
                <h4 className="font-cinzel text-xs font-bold tracking-[2px] text-[#F0D9A4] uppercase">
                  {feat.title}
                </h4>
                <p className="text-xs text-[#A7A29A] leading-relaxed">
                  {feat.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
