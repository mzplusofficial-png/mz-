
import React from 'react';
import { ChevronRight, Loader2 } from 'lucide-react';

interface CoachingButtonProps {
  children: React.ReactNode;
  onClick?: (e: any) => void;
  isLoading?: boolean;
  type?: "button" | "submit";
  disabled?: boolean;
}

export const CoachingButton: React.FC<CoachingButtonProps> = ({ children, onClick, isLoading, type = "button", disabled }) => {
  return (
    <button 
      type={type}
      onClick={onClick}
      disabled={isLoading || disabled}
      className="w-full py-5 px-8 bg-cyan-600 text-white font-black uppercase text-[11px] tracking-[0.2em] rounded-2xl hover:bg-cyan-500 transition-all active:scale-95 disabled:opacity-30 shadow-[0_15px_40px_rgba(8,145,178,0.3)] flex items-center justify-center gap-3"
    >
      {isLoading ? (
        <Loader2 className="animate-spin" size={18} />
      ) : (
        <>
          {children}
          <ChevronRight size={16} strokeWidth={3} />
        </>
      )}
    </button>
  );
};
