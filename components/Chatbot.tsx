
import React from 'react';
import { Sparkles, MessageCircle } from 'lucide-react';
import { UserProfile } from '../types.ts';

interface ChatbotProps {
  profile: UserProfile | null;
  onOpenLuna: () => void;
}

export const Chatbot: React.FC<ChatbotProps> = ({ onOpenLuna }) => {
  return (
    <div className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-[200]">
      {/* Bouton Luna - Maintenant un raccourci direct vers l'onglet Luna */}
      <button 
        onClick={() => onOpenLuna()}
        aria-label="Discuter avec Luna"
        className="w-16 h-16 rounded-[1.8rem] bg-yellow-600 text-black shadow-[0_20px_50px_rgba(202,138,4,0.4)] flex items-center justify-center transition-all duration-500 hover:scale-110 active:scale-95 group border-2 border-white/20 relative"
      >
        <div className="relative flex items-center justify-center">
           <MessageCircle size={28} strokeWidth={2.5} />
           <div className="absolute -inset-4 bg-yellow-400/20 blur-2xl rounded-full animate-pulse group-hover:bg-yellow-400/40"></div>
           
           {/* Badge Notification Discret pour attirer l'attention */}
           <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-600 rounded-full border-2 border-yellow-600 animate-bounce"></div>
        </div>
        
        {/* Tooltip flottant au hover pour clarifier l'action */}
        <div className="absolute right-full mr-4 bg-[#0a0a0a] border border-white/10 px-4 py-2.5 rounded-2xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap shadow-2xl translate-x-4 group-hover:translate-x-0 hidden md:block">
           <p className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
             <Sparkles size={12} className="text-yellow-600" /> Discuter avec Luna
           </p>
        </div>
      </button>
    </div>
  );
};
