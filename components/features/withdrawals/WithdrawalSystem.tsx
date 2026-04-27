import React, { useState, useEffect } from 'react';
import { ArrowDownToLine, Loader2 } from 'lucide-react';
import { supabase } from '../../../services/supabase.ts';
import { UserProfile, Wallet, WithdrawalRequest } from '../../../types.ts';
import { GoldBorderCard, GoldText } from '../../UI.tsx';
import { WithdrawalForm as WithdrawalFormComp } from './WithdrawalForm.tsx';
import { WithdrawalHistory } from './WithdrawalHistory.tsx';
import { CurrencyDisplay } from '../../ui/CurrencyDisplay.tsx';

interface WithdrawalSystemProps {
  profile: UserProfile | null;
  wallet: Wallet | null;
  onRefresh?: () => void;
}

export const WithdrawalSystem: React.FC<WithdrawalSystemProps> = ({ profile, wallet, onRefresh }) => {
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const totalCash = (wallet?.balance || 0) + (profile?.rpa_balance || 0);

  const fetchWithdrawals = async () => {
    if (!profile?.id) return;
    setLoading(true);
    try {
      const { data } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });
      if (data) setWithdrawals(data);
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, [profile?.id]);

  const isPremium = profile?.user_level === 'niveau_mz_plus';

  return (
    <div className="space-y-12 animate-fade-in pb-20 max-w-4xl mx-auto pt-10">
      <header className="text-center space-y-4">
         <p className="text-[10px] font-black uppercase tracking-[0.5em] text-neutral-600">Comptabilité & Trésorerie</p>
         <h2 className="text-4xl font-black uppercase tracking-tighter text-white">Vos <GoldText>Actifs Élite</GoldText></h2>
      </header>

      <GoldBorderCard id="user-balance-card" className="p-10 md:p-20 relative overflow-hidden text-center bg-[#0a0a0a] border-white/10 shadow-[0_40px_100px_rgba(0,0,0,1)]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-yellow-600/5 blur-[100px] pointer-events-none"></div>
        <p className="text-[10px] text-neutral-500 font-black uppercase tracking-[0.3em] mb-12">Solde Global Disponible</p>
        <div className="flex justify-center">
          <CurrencyDisplay 
            amount={totalCash} 
            className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-black text-white font-mono leading-tight tracking-tighter break-words"
            secondaryClassName="text-sm md:text-base text-neutral-500 font-bold mt-4 opacity-60"
            vertical={true}
          />
        </div>
        
        <div className="mt-16 flex justify-center gap-4">
           <button 
             onClick={() => setShowForm(true)} 
             className="px-12 py-6 bg-yellow-600 text-black rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl hover:bg-yellow-500 active:scale-95 transition-all flex items-center gap-4"
           >
             <ArrowDownToLine size={20} /> Demander un retrait
           </button>
        </div>
      </GoldBorderCard>

      {showForm && (
        <WithdrawalFormComp 
          profile={profile} 
          balance={totalCash} 
          onClose={() => setShowForm(false)} 
          onSuccess={() => {
            setShowForm(false);
            fetchWithdrawals();
            onRefresh?.();
          }} 
        />
      )}

      <WithdrawalHistory withdrawals={withdrawals} loading={loading} />
    </div>
  );
};
