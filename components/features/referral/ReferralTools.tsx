
import React, { useState } from 'react';
import { Share2, Check, Zap } from 'lucide-react';
import { ReferralCard } from './ReferralCard.tsx';

interface Props {
  referralCode: string;
}

export const ReferralTools: React.FC<Props> = ({ referralCode }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  
  const refLink = `${window.location.origin}/?ref=${referralCode}`;

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div id="referral-link-card" className="max-w-2xl mx-auto w-full">
      <ReferralCard variant="dark" className="space-y-8 p-10 md:p-12 border-white/10 bg-gradient-to-br from-[#0a0a0a] to-[#050505]">
         <div className="flex flex-col items-center text-center space-y-4">
            <div className="p-4 bg-yellow-600/10 rounded-2xl text-yellow-600 border border-yellow-600/20 shadow-xl">
               <Zap size={32} fill="currentColor" className="animate-pulse" />
            </div>
            <div>
               <h3 className="text-xl font-black uppercase text-white tracking-tighter">Votre Lien de Parrainage</h3>
               <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-[0.3em] mt-1">Diffusez ce lien pour parrainer de nouveaux membres</p>
            </div>
         </div>

         <div className="space-y-6">
            <div className="bg-black/80 p-5 rounded-2xl border border-white/5 group hover:border-yellow-600/30 transition-all">
               <p className="text-xs font-mono text-neutral-400 truncate text-center select-all">{refLink}</p>
            </div>
            
            <button 
              onClick={() => handleCopy(refLink)}
              className={`w-full py-5 rounded-[1.5rem] font-black uppercase text-xs tracking-[0.2em] transition-all flex items-center justify-center gap-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] active:scale-95 ${
                copiedLink 
                  ? 'bg-emerald-600 text-white shadow-emerald-900/20' 
                  : 'bg-yellow-600 text-black hover:bg-yellow-500 shadow-yellow-900/20'
              }`}
            >
              {copiedLink ? (
                <><Check size={20} strokeWidth={3} /> Prêt à être partagé</>
              ) : (
                <><Share2 size={20} /> Copier mon lien unique</>
              )}
            </button>
         </div>

         <div className="pt-4 flex items-center justify-center gap-6 opacity-30">
            <div className="h-px flex-1 bg-white/5"></div>
            <p className="text-[7px] font-black uppercase tracking-[0.4em] text-neutral-500 whitespace-nowrap text-center">
              Le code est intégré automatiquement
            </p>
            <div className="h-px flex-1 bg-white/5"></div>
         </div>
      </ReferralCard>
    </div>
  );
};
