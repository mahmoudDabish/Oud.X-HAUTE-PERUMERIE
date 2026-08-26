import React from 'react';

interface BadgeProps {
  variant?: 'BEST SELLER' | 'NEW' | 'LIMITED' | 'SALE' | 'EXCLUSIVE' | 'DEFAULT';
  children?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'DEFAULT', children, className = '' }) => {
  const content = children || variant;

  const styles = {
    'BEST SELLER': 'bg-[#151310]/80 text-[#F0D9A4] border-[#C9A45C]/50 shadow-sm shadow-[#C9A45C]/15',
    'NEW': 'bg-[#0D0C0A]/80 text-[#F5F2EA] border-[#C9A45C]/30',
    'LIMITED': 'bg-[#2A1810]/80 text-[#F0D9A4] border-[#C9A45C]/50',
    'SALE': 'bg-[#3A1414]/80 text-[#FFA8A8] border-red-500/40',
    'EXCLUSIVE': 'bg-[#1E170A]/80 text-[#F0D9A4] border-[#C9A45C]/70 shadow-sm shadow-[#C9A45C]/20',
    'DEFAULT': 'bg-[#11100E]/80 text-[#A7A29A] border-white/10'
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 text-[9px] font-bold tracking-[2px] uppercase border rounded-full whitespace-nowrap select-none backdrop-blur-md ${styles[variant] || styles.DEFAULT} ${className}`}
    >
      {content}
    </span>
  );
};
