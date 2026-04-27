
import { useState, useEffect, useCallback } from 'react';

export const useGuidePosition = (targetId: string | null) => {
  const [rect, setRect] = useState<DOMRect | null>(null);

  const updateRect = useCallback(() => {
    if (!targetId) {
      setRect(null);
      return;
    }
    const element = document.getElementById(targetId);
    if (element) {
      const newRect = element.getBoundingClientRect();
      // Only update if the rect has actually changed significantly to avoid unnecessary re-renders
      setRect(prev => {
        if (!prev) return newRect;
        if (Math.abs(prev.top - newRect.top) < 0.5 && 
            Math.abs(prev.left - newRect.left) < 0.5 && 
            Math.abs(prev.width - newRect.width) < 0.5 && 
            Math.abs(prev.height - newRect.height) < 0.5) {
          return prev;
        }
        return newRect;
      });
    }
  }, [targetId]);

  useEffect(() => {
    updateRect();
    
    // If element not found, poll for it briefly (useful for dynamic content)
    let pollInterval: number | null = null;
    if (targetId && !document.getElementById(targetId)) {
      pollInterval = window.setInterval(() => {
        const el = document.getElementById(targetId);
        if (el) {
          updateRect();
          if (pollInterval) clearInterval(pollInterval);
        }
      }, 100);
    }

    const element = targetId ? document.getElementById(targetId) : null;
    if (!element) {
      const handleEvent = () => updateRect();
      window.addEventListener('resize', handleEvent);
      window.addEventListener('scroll', handleEvent, true);
      return () => {
        if (pollInterval) clearInterval(pollInterval);
        window.removeEventListener('resize', handleEvent);
        window.removeEventListener('scroll', handleEvent, true);
      };
    }

    const observer = new ResizeObserver(updateRect);
    observer.observe(element);
    window.addEventListener('scroll', updateRect, true);

    return () => {
      if (pollInterval) clearInterval(pollInterval);
      observer.disconnect();
      window.removeEventListener('scroll', updateRect, true);
    };
  }, [targetId, updateRect]);

  return rect;
};
