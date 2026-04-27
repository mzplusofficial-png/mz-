
import React from 'react';
import { Zap, Clock, CheckCircle2 } from 'lucide-react';
import { RpaCard } from './RpaCard.tsx';
import { CurrencyDisplay } from '../../ui/CurrencyDisplay.tsx';

interface RpaStatsProps {
  score: number;
  pendingCount: number;
  totalValid: number;
}

export const RpaStats: React.FC<RpaStatsProps> = ({ score, pendingCount, totalValid }) => {
  return (
    <div className="space-y-6 mb-8">
      {/* Wealth Card */}
      <RpaCard variant="gold" className="p-8 md:p-12 relative group border-yellow-600/20 shadow-[0_0_80px_rgba(202,138,4,0.1)]">
        <div className="absolute top-0 right-0 w-48 h-48 bg-yellow-600/5 blur-[80px] -mr-24 -mt-24"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
          <div className="text-center md:text-left space-y-1">
            <p className="text-[9px] font-black uppercase text-yellow-600/60 tracking-[0.3em]">Mes gains cumulés</p>
            <div className="flex items-baseline justify-center md:justify-start gap-3">
              <CurrencyDisplay 
                amount={score} 
                className="text-5xl md:text-7xl font-black text-white font-mono tracking-tighter leading-none"
                secondaryClassName="text-xs text-neutral-500 font-bold ml-2 opacity-60"
              />
            </div>
          </div>

          <div className="flex gap-8 border-l border-white/5 pl-8 hidden md:flex">
             <div className="text-center">
                <p className="text-[7px] font-black uppercase text-neutral-600 tracking-widest mb-1">En attente</p>
                <p className="text-xl font-black text-white font-mono">{pendingCount}</p>
             </div>
             <div className="text-center">
                <p className="text-[7px] font-black uppercase text-neutral-600 tracking-widest mb-1">Succès</p>
                <p className="text-xl font-black text-emerald-500 font-mono">{totalValid}</p>
             </div>
          </div>
        </div>
      </RpaCard>

      {/* Mobile sub-stats */}
      <div className="grid grid-cols-2 gap-3 md:hidden">
        <div className="bg-white/[0.02] border border-white/5 rounded-[1.5rem] p-4 text-center">
           <p className="text-[7px] font-black uppercase text-neutral-500 tracking-widest mb-1">En attente</p>
           <p className="text-lg font-black text-white font-mono">{pendingCount}</p>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-[1.5rem] p-4 text-center">
           <p className="text-[7px] font-black uppercase text-neutral-500 tracking-widest mb-1">Validées</p>
           <p className="text-lg font-black text-white font-mono">{totalValid}</p>
        </div>
      </div>
    </div>
  );
};
