
import React from 'react';

interface RpaCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'gold' | 'dark' | 'glass';
}

export const RpaCard: React.FC<RpaCardProps> = ({ children, className = "", variant = 'dark' }) => {
  const baseStyles = "relative rounded-[2.5rem] p-6 transition-all duration-500 overflow-hidden";
  
  const variants = {
    dark: "bg-[#0a0a0a] border border-white/5 shadow-2xl",
    gold: "bg-[#0d0d0d] border border-yellow-600/20 shadow-[0_0_50px_rgba(202,138,4,0.05)]",
    glass: "bg-white/[0.02] backdrop-blur-md border border-white/10"
  };

  return (
    <div className={`${baseStyles} ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
};
