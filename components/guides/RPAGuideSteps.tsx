
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, X } from 'lucide-react';

interface RPAGuideStepsProps {
  isVisible: boolean;
  message: React.ReactNode;
  title?: string;
  targetRect: DOMRect | null;
  onNext?: () => void;
  onClose?: () => void;
  nextLabel?: string;
  variant?: 'tooltip' | 'panel';
}

export const RPAGuideSteps: React.FC<RPAGuideStepsProps> = ({ 
  isVisible, 
  message, 
  title,
  targetRect, 
  onNext, 
  onClose,
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
    top = 40;
    left = '50%';
    x = '-50%';
  } else if (targetRect) {
    const tooltipHeight = onNext ? 220 : 160;
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
          className={`z-[9999] bg-white/95 backdrop-blur-xl shadow-[0_40px_100px_rgba(0,0,0,0.25)] border border-purple-600/10 ${
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
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white shadow-lg shadow-purple-600/20">
                    <Sparkles size={14} fill="currentColor" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-neutral-900">Coach RPA</span>
                    <span className="text-[7px] font-bold uppercase tracking-[0.1em] text-purple-600/60">Guide Vidéo</span>
                  </div>
                </div>
                <div className="relative">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-600"></div>
                  <div className="absolute inset-0 w-1.5 h-1.5 rounded-full bg-purple-600 animate-ping opacity-75"></div>
                </div>
              </div>
            )}
            
            <div className="flex-1">
              {isPanel && (
                <div className="flex items-center gap-3 mb-3.5">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white shadow-md shadow-purple-600/10">
                    <Sparkles size={11} fill="currentColor" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-neutral-900">Coach RPA</span>
                    <span className="text-[7px] font-bold uppercase tracking-[0.1em] text-purple-600/60">Accompagnement</span>
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
              <div className="flex items-center gap-2.5 text-[9px] font-black uppercase tracking-[0.25em] text-purple-600">
                <span className="animate-pulse">Action Requise</span>
                <ArrowRight size={14} className="animate-bounce-x" />
              </div>
            )}
          </div>

          {/* Arrow pointing to target (only for tooltip) */}
          {!isPanel && targetRect && (
            <div 
              style={{ left: arrowLeft }}
              className={`absolute -translate-x-1/2 w-5 h-5 bg-white/95 backdrop-blur-xl rotate-45 border-purple-600/10 ${
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
