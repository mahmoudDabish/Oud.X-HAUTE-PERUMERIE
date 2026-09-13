import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check } from 'lucide-react';

interface LanguageSwitcherProps {
  className?: string;
  isMobile?: boolean;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ className = '', isMobile = false }) => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language === 'ar' ? 'ar' : 'en';
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSwitch = (lang: 'en' | 'ar') => {
    if (currentLang !== lang) {
      i18n.changeLanguage(lang);
    }
    setIsOpen(false);
  };

  // Full card format for inside MobileMenu drawer
  if (isMobile) {
    return (
      <div className={`flex items-center justify-between p-3 rounded-xl bg-[#151310]/80 border border-[#C9A45C]/25 ${className}`}>
        <div className="flex items-center gap-2 text-xs font-semibold text-[#F5F2EA]">
          <Globe className="w-4 h-4 text-[#C9A45C]" />
          <span>{currentLang === 'ar' ? 'اللغة' : 'Language'}</span>
        </div>
        <div className="flex items-center p-0.5 rounded-lg bg-[#070707] border border-[#C9A45C]/25">
          <button
            type="button"
            onClick={() => handleSwitch('en')}
            className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
              currentLang === 'en'
                ? 'bg-[#C9A45C] text-[#070707] shadow-sm'
                : 'text-[#A7A29A] hover:text-[#F5F2EA]'
            }`}
            aria-label="Switch language to English"
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => handleSwitch('ar')}
            className={`px-3 py-1 rounded-md text-xs font-bold transition-all font-sans-clean ${
              currentLang === 'ar'
                ? 'bg-[#C9A45C] text-[#070707] shadow-sm'
                : 'text-[#A7A29A] hover:text-[#F5F2EA]'
            }`}
            aria-label="تغيير اللغة إلى العربية"
          >
            العربية
          </button>
        </div>
      </div>
    );
  }

  // Sleek, luxury icon button with floating micro-dropdown for Navbar
  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`relative flex items-center justify-center w-8.5 h-8.5 xl:w-9 xl:h-9 rounded-full bg-[#151310]/50 hover:bg-[#151310]/80 border transition-all cursor-pointer backdrop-blur-md group ${
          isOpen
            ? 'border-[#C9A45C] text-[#C9A45C] shadow-lg shadow-[#C9A45C]/15 bg-[#151310]'
            : 'border-[#C9A45C]/20 hover:border-[#C9A45C]/40 text-[#A7A29A] hover:text-[#F5F2EA]'
        }`}
        aria-label={currentLang === 'en' ? 'Select language (English active)' : 'اختر اللغة (العربية مفعلة)'}
        title={currentLang === 'en' ? 'Language / اللغة' : 'اللغة / Language'}
        aria-expanded={isOpen}
      >
        <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#C9A45C] group-hover:rotate-12 transition-transform duration-300" />
        <span className="absolute -bottom-1 -right-1 px-1 py-0.2 min-w-[14px] text-[7.5px] font-black uppercase bg-[#C9A45C] text-[#070707] rounded-full shadow-sm leading-none flex items-center justify-center">
          {currentLang === 'en' ? 'EN' : 'ع'}
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 rtl:right-auto rtl:left-0 w-36 bg-[#0D0C0A]/95 border border-[#C9A45C]/30 rounded-xl shadow-2xl p-1.5 backdrop-blur-xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="text-[9px] uppercase tracking-[1.5px] text-[#8E713D] px-2.5 py-1 font-semibold border-b border-white/5 mb-1">
            {currentLang === 'ar' ? 'اختر اللغة' : 'Select Language'}
          </div>
          <button
            type="button"
            onClick={() => handleSwitch('en')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentLang === 'en'
                ? 'bg-[#C9A45C] text-[#070707] shadow-sm font-bold'
                : 'text-[#F5F2EA] hover:bg-[#C9A45C]/15 hover:text-[#E3C27A]'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <span>English</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="text-[9px] opacity-75 font-mono font-bold">EN</span>
              {currentLang === 'en' && <Check className="w-3.5 h-3.5 text-[#070707]" />}
            </span>
          </button>
          <button
            type="button"
            onClick={() => handleSwitch('ar')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 mt-0.5 rounded-lg text-xs font-semibold transition-all font-sans-clean ${
              currentLang === 'ar'
                ? 'bg-[#C9A45C] text-[#070707] shadow-sm font-bold'
                : 'text-[#F5F2EA] hover:bg-[#C9A45C]/15 hover:text-[#E3C27A]'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <span>العربية</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="text-[9px] opacity-75 font-bold">ع</span>
              {currentLang === 'ar' && <Check className="w-3.5 h-3.5 text-[#070707]" />}
            </span>
          </button>
        </div>
      )}
    </div>
  );
};
