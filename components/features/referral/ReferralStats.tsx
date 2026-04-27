
import React from 'react';
import { Users, TrendingUp, ShieldCheck, Trophy } from 'lucide-react';
import { ReferralCard } from './ReferralCard.tsx';

interface Props {
  teamCount: number;
}

export const ReferralStats: React.FC<Props> = ({ teamCount }) => {
  return (
    <div id="referral-stats-card">
      <ReferralCard variant="gold" className="flex flex-col sm:flex-row items-center justify-between gap-8 py-10">
        <div className="absolute top-0 right-0 w-48 h-48 bg-yellow-600/5 blur-[80px] -mr-24 -mt-24"></div>
        
        <div className="flex items-center gap-6 relative z-10">
          <div className="p-5 bg-yellow-600/10 rounded-[2rem] text-yellow-600 shadow-2xl border border-yellow-600/20">
            <Users size={36} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-neutral-500 tracking-[0.2em] mb-1">Statistiques Parrainage</p>
            <div className="flex items-baseline gap-3">
               <p className="text-5xl font-black text-white font-mono tracking-tighter">{teamCount}</p>
               <p className="text-xs font-black text-yellow-600 uppercase tracking-widest">Filleuls</p>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-4 px-6 py-3 bg-black/40 rounded-2xl border border-white/5 opacity-50 relative z-10">
           <Trophy size={18} className="text-yellow-600" />
           <p className="text-[8px] font-black uppercase text-neutral-400 tracking-widest leading-tight">
             Propulsion MZ+ <br/> Elite Mentoring
           </p>
        </div>
      </ReferralCard>
    </div>
  );
};
