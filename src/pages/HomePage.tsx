import React from 'react';
import { Hero } from '../components/home/Hero';
import { CollectionCards } from '../components/home/CollectionCards';
import { TrustFeatures } from '../components/home/TrustFeatures';
import { BestSellers } from '../components/home/BestSellers';
import { NewArrivals } from '../components/home/NewArrivals';
import { PromoBanner } from '../components/home/PromoBanner';
import { Testimonials } from '../components/home/Testimonials';
import { BrandLogos } from '../components/home/BrandLogos';
import { Newsletter } from '../components/home/Newsletter';

export const HomePage: React.FC = () => {
  return (
    <div className="w-full bg-[#070707]">
      {/* 1. Cinematic Hero */}
      <Hero />

      {/* 2. Collection Categories */}
      <CollectionCards />

      {/* 3. Value Proposition / Trust Features Strip */}
      <TrustFeatures />

      {/* 4. Best Sellers Section */}
      <BestSellers />

      {/* 5. Editorial New Arrivals / Launch */}
      <NewArrivals />

      {/* 6. Exclusive Promotional Offer Banner */}
      <PromoBanner />

      {/* 7. Connoisseur Testimonials */}
      <Testimonials />

      {/* 8. Luxury Brand Houses */}
      <BrandLogos />

      {/* 9. Privé Club VIP Newsletter */}
      <Newsletter />
    </div>
  );
};
