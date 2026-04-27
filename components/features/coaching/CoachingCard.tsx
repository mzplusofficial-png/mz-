
import React from 'react';

interface CoachingCardProps {
  children: React.ReactNode;
  className?: string;
}

export const CoachingCard: React.FC<CoachingCardProps> = ({ children, className = "" }) => {
  return (
    <div className={`relative bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-2xl transition-all duration-500 overflow-hidden ${className}`}>
      {children}
    </div>
  );
};
