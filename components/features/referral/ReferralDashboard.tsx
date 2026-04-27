
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../services/supabase.ts';
import { UserProfile } from '../../../types.ts';
import { ReferralLayout } from './ReferralLayout.tsx';
import { ReferralStats } from './ReferralStats.tsx';
import { ReferralTools } from './ReferralTools.tsx';
import { ReferralList } from './ReferralList.tsx';

interface Props {
  profile: UserProfile | null;
  teamCount: number;
}

export const ReferralDashboard: React.FC<Props> = ({ profile, teamCount }) => {
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeam = useCallback(async (retryCount = 0) => {
    if (!profile?.referral_code) return;
    if (retryCount === 0) setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, full_name, user_level, created_at')
        .eq('referral_code_used', profile.referral_code)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setTeam(data || []);
    } catch (e: any) {
      console.error("Referral Fetch Error:", e);
      
      if (retryCount < 3 && (e.message?.includes('fetch') || e.name === 'TypeError')) {
        const delay = 1000 * (retryCount + 1);
        console.log(`Retrying referral fetch in ${delay}ms...`);
        setTimeout(() => fetchTeam(retryCount + 1), delay);
        return;
      }
      setError("Erreur de chargement de l'équipe.");
    } finally {
      setLoading(false);
    }
  }, [profile?.referral_code]);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  return (
    <ReferralLayout 
      title="Parrainage" 
      subtitle="Gérez vos parrainages et suivez vos gains."
    >
      <div className="space-y-10">
        {error && (
          <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-[2rem] text-center space-y-4">
            <p className="text-xs font-black uppercase text-red-500">{error}</p>
            <button 
              onClick={() => fetchTeam()}
              className="px-6 py-2 bg-red-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-400 transition-all"
            >
              Réessayer
            </button>
          </div>
        )}
        <ReferralStats teamCount={teamCount} />
        
        <ReferralTools referralCode={profile?.referral_code || ''} />
        
        <div className="pt-6">
           <ReferralList members={team} />
        </div>

        <div className="p-8 border border-dashed border-white/10 rounded-[3rem] text-center opacity-40">
           <p className="text-[8px] text-neutral-500 font-bold uppercase tracking-[0.5em] leading-relaxed">
             Propulsé par le Protocole de Mentorat MZ+ v4.2
           </p>
        </div>
      </div>
    </ReferralLayout>
  );
};
