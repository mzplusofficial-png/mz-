
import React, { useEffect } from 'react';
import { usePremiumAccess } from './usePremiumAccess.ts';
import { PremiumClosedModal } from './PremiumClosedModal.tsx';

export const PremiumAccessGate: React.FC = () => {
  const { config, isModalOpen, setIsModalOpen, checkAccess } = usePremiumAccess();

  useEffect(() => {
    // Intercept window.open for JS-based redirects
    const originalOpen = window.open;
    window.open = function(url?: string | URL, target?: string, features?: string) {
      const urlStr = url?.toString() || '';
      if (urlStr.includes('mzplus.mychariow.shop/prd_iwhpro/checkout')) {
        if (config && !config.is_enabled) {
          setIsModalOpen(true);
          return null;
        }
      }
      return originalOpen.call(window, url, target, features);
    };

    const handleGlobalClick = (e: MouseEvent) => {
      // Find if the clicked element or its parents is a checkout link
      let target = e.target as HTMLElement;
      
      const isCheckoutLink = (el: HTMLElement) => {
        if (el.tagName === 'A') {
          const href = (el as HTMLAnchorElement).href;
          return href && href.includes('mzplus.mychariow.shop/prd_iwhpro/checkout');
        }
        return false;
      };

      let current: HTMLElement | null = target;
      while (current && current !== document.body) {
        if (isCheckoutLink(current)) {
          if (!checkAccess(e)) {
            return;
          }
        }
        current = current.parentElement;
      }
    };

    document.addEventListener('click', handleGlobalClick, true);
    return () => {
      document.removeEventListener('click', handleGlobalClick, true);
      window.open = originalOpen;
    };
  }, [checkAccess, config]);

  if (!config) return null;

  return (
    <PremiumClosedModal 
      isOpen={isModalOpen} 
      onClose={() => setIsModalOpen(false)} 
      reopeningDate={config.reopening_date} 
    />
  );
};
