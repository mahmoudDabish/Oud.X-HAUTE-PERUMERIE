import React from 'react';
import { Star } from 'lucide-react';

interface RatingProps {
  rating?: number;
  reviewCount?: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
}

export const Rating: React.FC<RatingProps> = () => {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center text-[#E3C27A]">
        {[1, 2, 3, 4, 5].map((_, i) => (
          <Star key={i} className="w-3.5 h-3.5 text-[#333]" />
        ))}
      </div>
      <span className="text-xs text-[#A7A29A]">No reviews yet.</span>
    </div>
  );
};
