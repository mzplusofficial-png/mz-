import React, { useState, useEffect } from 'react';
import { useCurrency } from '../../hooks/useCurrency.ts';
import { SUPPORTED_CURRENCIES } from '../../lib/currency/currencyRates.ts';
import { ChevronDown, Globe } from 'lucide-react';

interface CurrencyDisplayProps {
  amount: number; // Amount in XAF (CFA Franc)
  className?: string;
  secondaryClassName?: string;
  showOriginal?: boolean;
  hideXAF?: boolean;
  inline?: boolean;
  hideAmount?: boolean;
  vertical?: boolean;
  preferXAF?: boolean;
}

export const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({ 
  amount, 
  className = "text-white font-black", 
  secondaryClassName = "text-[10px] text-neutral-500 font-bold opacity-60",
  showOriginal = true,
  hideXAF = false,
  inline = false,
  hideAmount = false,
  vertical = false,
  preferXAF = false
}) => {
  const { convertAndFormat } = useCurrency();
  const { formatted, originalFormatted, isXAF } = convertAndFormat(amount);

  const mainPrice = preferXAF ? originalFormatted : formatted;
  const secondaryPrice = preferXAF ? formatted : originalFormatted;
  const showSecondary = preferXAF ? !isXAF : (!isXAF && showOriginal && !hideXAF);

  const content = (
    <>
      {!hideAmount && <span className={className}>{mainPrice}</span>}
      {showSecondary && (
        <span className={`${secondaryClassName} ${!vertical && !inline ? 'ml-2' : ''}`}>
          {preferXAF ? `(≈ ${secondaryPrice})` : `(≈ ${secondaryPrice})`}
        </span>
      )}
    </>
  );

  if (inline) {
    return <>{content}</>;
  }

  return (
    <span className={`inline-flex max-w-full ${vertical ? 'flex-col items-center text-center' : 'items-baseline flex-wrap justify-center'} ${className.includes('break-') ? '' : 'whitespace-nowrap'}`}>
      {content}
    </span>
  );
};

export const CurrencySelector: React.FC = () => {
  const { currency, updateCurrency } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/10 transition-all"
      >
        <Globe size={12} />
        {currency}
        <ChevronDown size={10} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 mt-2 w-48 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-slide-down">
            {SUPPORTED_CURRENCIES.map((c) => (
              <button
                key={c.code}
                onClick={() => {
                  updateCurrency(c.code);
                  setIsOpen(false);
                  // Refresh the page to apply changes globally
                  window.location.reload();
                }}
                className={`w-full px-6 py-4 text-left text-xs font-black uppercase tracking-widest flex items-center justify-between transition-colors ${
                  currency === c.code ? 'bg-yellow-600 text-black' : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span>{c.label}</span>
                <span className="opacity-40">{c.symbol}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
