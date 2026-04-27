
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, X } from 'lucide-react';

interface GuideStepProps {
  isVisible: boolean;
  message: string;
  title?: string;
  link?: { label: string; url: string };
  targetRect: DOMRect | null;
  onNext?: () => void;
  onClose?: () => void;
  onLinkClick?: () => void;
  nextLabel?: string;
  variant?: 'tooltip' | 'panel';
}

export const GuideStep: React.FC<GuideStepProps> = ({ 
  isVisible, 
  message, 
  title,
  link,
  targetRect, 
  onNext, 
  onClose,
  onLinkClick,
  nextLabel,
  variant = 'tooltip'
}) => {
  if (!targetRect && variant === 'tooltip') return null;

  const isPanel = variant === 'panel';
  const tooltipWidth = 270;

  // Position calculation
  let top: number | string = 'auto';
  let bottom: number | string = 'auto';
  let left: number | string = '50%';
  let x: string | number = '-50%';
  let arrowLeft: number | string = '50%';

  if (isPanel) {
    top = 40; // Slightly more space from top
    left = '50%';
    x = '-50%';
  } else if (targetRect) {
    const tooltipHeight = onNext ? 240 : 180;
    const isTooLow = targetRect.bottom + 24 + tooltipHeight > window.innerHeight;
    
    if (isTooLow) {
      top = Math.max(10, targetRect.top - tooltipHeight - 24);
    } else {
      top = targetRect.bottom + 24;
    }

    const targetCenter = targetRect.left + targetRect.width / 2;
    const margin = 12;
    const calculatedLeft = Math.max(margin, Math.min(window.innerWidth - tooltipWidth - margin, targetCenter - tooltipWidth / 2));
    
    left = calculatedLeft;
    x = 0;
    arrowLeft = targetCenter - calculatedLeft;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={isPanel ? { opacity: 0, y: -50, x: "-50%" } : { opacity: 0, scale: 0.95, x: "-50%" }}
          animate={{ 
            opacity: 1, 
            y: 0, 
            x,
            scale: 1 
          }}
          exit={isPanel ? { opacity: 0, y: -50, x: "-50%" } : { opacity: 0, scale: 0.95, x: "-50%" }}
          transition={{ 
            type: 'spring', 
            damping: 30, 
            stiffness: 120,
            mass: 0.8
          }}
          style={{ 
            top, 
            bottom, 
            left,
            position: 'fixed'
          }}
          className={`z-[9999] bg-white/95 backdrop-blur-xl shadow-[0_40px_100px_rgba(0,0,0,0.25)] border border-yellow-600/10 ${
            isPanel 
              ? 'w-[calc(100%-32px)] max-w-[460px] rounded-[2.5rem] p-6 md:p-10' 
              : 'w-[280px] rounded-[2.5rem] p-6'
          }`}
        >
          {onClose && (
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-neutral-400 hover:text-neutral-900 transition-colors rounded-full hover:bg-neutral-100"
            >
              <X size={20} />
            </button>
          )}

          <div className={`flex ${isPanel ? 'flex-col items-center gap-6' : 'flex-col gap-5'}`}>
            {!isPanel && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-700 flex items-center justify-center text-black shadow-lg shadow-yellow-600/20">
                    <Sparkles size={14} fill="currentColor" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-neutral-900">Coach MZ+</span>
                    <span className="text-[7px] font-bold uppercase tracking-[0.1em] text-yellow-600/60">Système Élite</span>
                  </div>
                </div>
                <div className="relative">
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-600"></div>
                  <div className="absolute inset-0 w-1.5 h-1.5 rounded-full bg-yellow-600 animate-ping opacity-75"></div>
                </div>
              </div>
            )}
            
            <div className="flex-1">
              {isPanel && (
                <div className="flex items-center gap-3 mb-3.5">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-yellow-500 to-yellow-700 flex items-center justify-center text-black shadow-md shadow-yellow-600/10">
                    <Sparkles size={11} fill="currentColor" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-neutral-900">Coach MZ+</span>
                    <span className="text-[7px] font-bold uppercase tracking-[0.1em] text-yellow-600/60">Accompagnement Stratégique</span>
                  </div>
                </div>
              )}
              
              {title && (
                <h3 className="text-xl font-black text-neutral-900 mb-2 uppercase tracking-tight">
                  {title}
                </h3>
              )}

              <div className={`${isPanel ? 'text-[15px] md:text-[16px] text-center md:text-left' : 'text-[14px]'} font-semibold text-neutral-900 leading-relaxed tracking-tight whitespace-pre-line`}>
                {message}
              </div>

              {link && (
                <div className="mt-8 w-full">
                  <a 
                    href={link.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={() => onLinkClick?.()}
                    className="group/link relative w-full py-6 bg-[#25D366] text-white rounded-[1.5rem] font-black uppercase text-[12px] tracking-[0.2em] text-center hover:bg-[#20bd5b] hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(37,211,102,0.3)] active:scale-[0.98]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/link:animate-shimmer pointer-events-none"></div>
                    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    {link.label}
                  </a>
                </div>
              )}
            </div>

            {onNext ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNext();
                }}
                className={`${isPanel ? 'w-full md:w-auto px-8 py-4' : 'mt-2 w-full py-4'} bg-black text-white rounded-2xl font-black uppercase text-[10px] md:text-[11px] tracking-[0.2em] hover:bg-neutral-800 transition-all active:scale-[0.97] flex items-center justify-center gap-3 pointer-events-auto shadow-xl shadow-black/10 shrink-0 group`}
              >
                {nextLabel || 'Suivant'} 
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            ) : (
              <div className="flex items-center gap-2.5 text-[9px] font-black uppercase tracking-[0.25em] text-yellow-600">
                <span className="animate-pulse">Action Requise</span>
                <ArrowRight size={14} className="animate-bounce-x" />
              </div>
            )}
          </div>

          {/* Arrow pointing to target (only for tooltip) */}
          {!isPanel && targetRect && (
            <div 
              style={{ left: arrowLeft }}
              className={`absolute -translate-x-1/2 w-5 h-5 bg-white/95 backdrop-blur-xl rotate-45 border-yellow-600/10 ${
                (typeof top === 'number' && top < targetRect.top) ? '-bottom-2.5 border-r border-b' : '-top-2.5 border-l border-t'
              }`}
            />
          )}

          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes bounce-x {
              0%, 100% { transform: translateX(0); }
              50% { transform: translateX(4px); }
            }
            .animate-bounce-x { animation: bounce-x 1s infinite; }
          `}} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
