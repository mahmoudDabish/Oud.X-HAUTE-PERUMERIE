import React, { createContext, useContext, useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { useShop } from './ShopContext';

interface SmoothScrollContextType {
  lenis: Lenis | null;
  scrollTo: (target: string | number | HTMLElement, options?: Parameters<Lenis['scrollTo']>[1]) => void;
}

const SmoothScrollContext = createContext<SmoothScrollContextType>({
  lenis: null,
  scrollTo: () => {}
});

export const useSmoothScroll = () => useContext(SmoothScrollContext);

export const SmoothScrollProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const lenisRef = useRef<Lenis | null>(null);
  const {
    currentRoute,
    isCartDrawerOpen,
    isMobileMenuOpen,
    isSearchOpen,
    quickViewProduct
  } = useShop();

  useEffect(() => {
    // Check if user prefers reduced motion or is on a touch device
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouch = window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
    
    // On mobile / touch screens, mobile operating systems (iOS/Android) have native 120Hz hardware-accelerated
    // momentum scrolling. Intercepting touch in JS causes touch drag latency and frame drops.
    // We only attach Lenis on desktop pointer devices for smooth mouse-wheel physics.
    if (prefersReducedMotion || isTouch) {
      return;
    }

    // Initialize Lenis for desktop mouse wheel
    const lenis = new Lenis({
      duration: 1.0,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.95,
      syncTouch: false,
      infinite: false,
      allowNestedScroll: true,
      prevent: (node: HTMLElement) => {
        return Boolean(
          node.hasAttribute?.('data-lenis-prevent') ||
          node.closest?.('[data-lenis-prevent]') ||
          node.classList?.contains('overflow-y-auto') ||
          node.closest?.('.overflow-y-auto')
        );
      }
    });

    lenisRef.current = lenis;

    // Attach to requestAnimationFrame
    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    // Sync window scroll events if necessary
    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // When route changes, immediately reset scroll position to top
  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [currentRoute]);

  // When any modal or drawer is open, lock body scroll cleanly
  const isAnyModalOpen = isCartDrawerOpen || isMobileMenuOpen || isSearchOpen || !!quickViewProduct;
  useEffect(() => {
    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden';
      lenisRef.current?.stop();
    } else {
      document.body.style.overflow = '';
      lenisRef.current?.start();
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isAnyModalOpen]);

  const scrollTo = (target: string | number | HTMLElement, options?: Parameters<Lenis['scrollTo']>[1]) => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, options);
    } else if (typeof target === 'number') {
      window.scrollTo({ top: target, behavior: 'smooth' });
    } else if (typeof target === 'string') {
      const el = document.querySelector(target);
      el?.scrollIntoView({ behavior: 'smooth' });
    } else if (target instanceof HTMLElement) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <SmoothScrollContext.Provider value={{ lenis: lenisRef.current, scrollTo }}>
      {children}
    </SmoothScrollContext.Provider>
  );
};
