import React from 'react';
import { Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { WithdrawalRequest } from '../../../types.ts';
import { CurrencyDisplay } from '../../ui/CurrencyDisplay.tsx';

interface WithdrawalHistoryProps {
  withdrawals: WithdrawalRequest[];
  loading: boolean;
}

export const WithdrawalHistory: React.FC<WithdrawalHistoryProps> = ({ withdrawals, loading }) => {
  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-yellow-600" size={32} />
      </div>
    );
  }

  if (withdrawals.length === 0) {
    return (
      <div className="text-center py-20 opacity-30">
        <p className="text-[10px] font-black uppercase tracking-[0.5em]">Aucun historique de retrait</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 px-2">
        <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-white whitespace-nowrap">Historique des Retraits</h3>
        <div className="h-px flex-1 bg-white/5"></div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {withdrawals.map((w) => (
          <div key={w.id} className="p-6 bg-[#0a0a0a] border border-white/5 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-white/10 transition-colors">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                w.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' : 
                w.status === 'rejected' ? 'bg-red-500/10 text-red-500' : 
                'bg-orange-500/10 text-orange-500'
              }`}>
                {w.status === 'approved' ? <CheckCircle2 size={24} /> : 
                 w.status === 'rejected' ? <XCircle size={24} /> : 
                 <Clock size={24} />}
              </div>
              <div>
                <CurrencyDisplay 
                  amount={w.amount} 
                  className="text-sm font-black text-white uppercase tracking-tight"
                  secondaryClassName="text-[8px] text-neutral-600 font-bold ml-1 opacity-60"
                />
                <p className="text-[9px] text-neutral-600 font-bold uppercase tracking-widest mt-0.5">
                  {w.method} • {w.account}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1">
              <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                w.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' : 
                w.status === 'rejected' ? 'bg-red-500/10 text-red-500' : 
                'bg-orange-500/10 text-orange-500'
              }`}>
                {w.status === 'approved' ? 'Validé' : 
                 w.status === 'rejected' ? 'Refusé' : 
                 'En attente'}
              </span>
              <span className="text-[8px] text-neutral-700 font-mono">
                {new Date(w.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
