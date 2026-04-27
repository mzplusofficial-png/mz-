
import React from 'react';

interface ReferralCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'gold' | 'dark' | 'glass';
}

export const ReferralCard: React.FC<ReferralCardProps> = ({ children, className = "", variant = 'dark' }) => {
  const variants = {
    dark: "bg-[#0a0a0a] border border-white/5 shadow-2xl",
    gold: "bg-[#0d0d0d] border border-yellow-600/20 shadow-[0_0_50px_rgba(202,138,4,0.05)]",
    glass: "bg-white/[0.02] backdrop-blur-md border border-white/10"
  };

  return (
    <div className={`relative rounded-[2.5rem] p-6 md:p-8 transition-all duration-500 overflow-hidden ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
};
