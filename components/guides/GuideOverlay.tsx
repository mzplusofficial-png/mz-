
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface GuideOverlayProps {
  targetRect: DOMRect | null;
  isVisible: boolean;
}

export const GuideOverlay: React.FC<GuideOverlayProps> = ({ targetRect, isVisible }) => {
  if (!targetRect) return null;

  const { top, left, width, height, bottom, right } = targetRect;
  const padding = 8;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[9998] pointer-events-none overflow-hidden"
        >
          {/* Top overlay */}
          <div 
            className="absolute top-0 left-0 w-full bg-black/70 backdrop-blur-[4px] pointer-events-auto transition-all duration-500"
            style={{ height: top - padding }}
          />
          {/* Bottom overlay */}
          <div 
            className="absolute bottom-0 left-0 w-full bg-black/70 backdrop-blur-[4px] pointer-events-auto transition-all duration-500"
            style={{ top: bottom + padding }}
          />
          {/* Left overlay */}
          <div 
            className="absolute left-0 bg-black/70 backdrop-blur-[4px] pointer-events-auto transition-all duration-500"
            style={{ top: top - padding, height: height + (padding * 2), width: left - padding }}
          />
          {/* Right overlay */}
          <div 
            className="absolute right-0 bg-black/70 backdrop-blur-[4px] pointer-events-auto transition-all duration-500"
            style={{ top: top - padding, height: height + (padding * 2), left: right + padding }}
          />

          {/* Halo / Glow effect around the hole */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute border border-yellow-500/40 rounded-[2.5rem] shadow-[0_0_60px_rgba(234,179,8,0.2)] pointer-events-none"
            style={{
              top: top - padding,
              left: left - padding,
              width: width + (padding * 2),
              height: height + (padding * 2),
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
