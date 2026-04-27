
import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Crown, 
  Medal, 
  Activity, 
  Star, 
  TrendingUp, 
  ShieldCheck, 
  Sparkles, 
  Loader2, 
  Zap,
  CheckCircle2,
  Lock,
  Flame,
  Info,
  Calendar,
  ChevronRight,
  CheckCircle,
  BookOpen,
  X,
  Target,
  ArrowUpRight,
  HelpCircle,
  ChevronDown,
  AlertCircle,
  CheckCheck,
  LockKeyhole
} from 'lucide-react';
import { supabase } from '../../../services/supabase.ts';
import { UserProfile, TabId } from '../../../types.ts';
import { GoldBorderCard, GoldText, EliteBadge, PrimaryButton } from '../../UI.tsx';

interface RewardStats {
  user_id: string;
  full_name: string;
  user_level: string;
  total_minutes: number;
  total_score: number;
  rank?: number;
}

export const RewardFeature: React.FC<{ 
  profile: UserProfile | null;
  onSwitchTab?: (tab: TabId) => void;
}> = ({ profile, onSwitchTab }) => {
  const [leaderboard, setLeaderboard] = useState<RewardStats[]>([]);
  const [myRank, setMyRank] = useState<RewardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async (retryCount = 0) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('mz_rewards_leaderboard_v2')
        .select('*')
        .limit(50);

      if (error) throw error;
      if (data) {
        const ranked = data.map((d, i) => ({ ...d, rank: i + 1 }));
        setLeaderboard(ranked);
        const me = ranked.find(r => r.user_id === profile?.id);
        if (me) setMyRank(me);
        else if (profile?.id) {
            const { data: individual, error: indError } = await supabase.from('mz_rewards_leaderboard_v2').select('*').eq('user_id', profile.id).maybeSingle();
            if (indError) throw indError;
            if (individual) setMyRank({ ...individual, rank: 0 });
        }
      }
    } catch (e: any) {
      console.error("Reward fetch error:", e);
      if (retryCount < 2 && (e.message?.includes('fetch') || e.name === 'TypeError')) {
        setTimeout(() => fetchStats(retryCount + 1), 1500);
        return;
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [profile?.id]);

  const isEligibleLevel = profile?.user_level === 'niveau_mz_plus';
  const myCurrentRank = myRank?.rank || 999;
  const isInTop20 = myCurrentRank > 0 && myCurrentRank <= 20;
  const isUserFullyEligible = isEligibleLevel && isInTop20;

  return (
    <div className="space-y-10 animate-fade-in pb-24 max-w-6xl mx-auto px-4">
      {/* 1. HERO SECTION */}
      <div className="text-center relative py-10 md:py-16">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-yellow-600/10 blur-[100px] pointer-events-none"></div>
        
        <div className="inline-flex items-center gap-3 px-5 py-2 bg-yellow-600/10 border border-yellow-600/20 rounded-full mb-8">
          <Flame size={16} className="text-yellow-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-500">L'Arène Élite MZ+</span>
        </div>

        <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tighter text-white leading-[0.85] mb-10">
          CLASSEMENT <br/><GoldText>TOP 50 MONDIAL</GoldText>
        </h2>
      </div>

      {/* 2. SECTION ÉLIGIBILITÉ */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 px-2">
           <ShieldCheck size={20} className="text-yellow-500" />
           <h3 className="text-xl font-black uppercase tracking-tighter text-white">Conditions de Rémunération</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className={`p-8 rounded-[2.5rem] border-2 transition-all duration-700 relative overflow-hidden group ${isEligibleLevel ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-red-500/5 border-red-500/20'}`}>
              <div className="relative z-10 flex justify-between items-start mb-6">
                 <div className={`p-3 rounded-2xl ${isEligibleLevel ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'bg-red-500/20 text-red-500'}`}>
                    {isEligibleLevel ? <CheckCheck size={24} /> : <LockKeyhole size={24} />}
                 </div>
                 <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg ${isEligibleLevel ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-500 animate-pulse'}`}>
                    {isEligibleLevel ? 'Validé' : 'Requis'}
                 </span>
              </div>
              <div className="space-y-2">
                 <h4 className="text-lg font-black uppercase text-white tracking-tight">Condition 1 : MZ+ Premium</h4>
                 <p className="text-[11px] text-neutral-500 font-medium leading-relaxed uppercase">
                    {isEligibleLevel 
                      ? "🎉 Félicitations ! Ton accès MZ+ Premium est activé. Tu fais maintenant partie des ambassadeurs de l'élite. 🚀" 
                      : "Ton compte est en mode Standard. Tu dois accéder à MZ+ Premium pour être éligible aux gains mensuels."}
                 </p>
              </div>
              {!isEligibleLevel && (
                <button 
                  onClick={() => onSwitchTab?.('flash_offer')} 
                  className="mt-6 w-full py-4 bg-red-600 text-white rounded-xl font-black uppercase text-[9px] tracking-widest hover:bg-red-500 transition-all shadow-xl shadow-red-900/10"
                >
                  Accéder à MZ+ Premium maintenant
                </button>
              )}
           </div>

           <div className={`p-8 rounded-[2.5rem] border-2 transition-all duration-700 relative overflow-hidden group ${isInTop20 ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-orange-500/5 border-orange-500/20'}`}>
              <div className="relative z-10 flex justify-between items-start mb-6">
                 <div className={`p-3 rounded-2xl ${isInTop20 ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'bg-orange-500/20 text-orange-500'}`}>
                    {isInTop20 ? <Trophy size={24} /> : <TrendingUp size={24} />}
                 </div>
                 <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg ${isInTop20 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-orange-500/20 text-orange-400'}`}>
                    {isInTop20 ? 'Eligible' : `Rang #${myCurrentRank || '---'}`}
                 </span>
              </div>
              <div className="space-y-2">
                 <h4 className="text-lg font-black uppercase text-white tracking-tight">Condition 2 : Top 20 Mondial</h4>
                 <p className="text-[11px] text-neutral-500 font-medium leading-relaxed uppercase">
                    {isInTop20 
                      ? "Tu es actuellement dans le cercle des gagnants. Garde ton activité pour rester qualifié !" 
                      : myCurrentRank > 20 
                        ? `Tu es à ${myCurrentRank - 20} places du Top 20 rémunéré. Augmente ton activité pour remonter !`
                        : "Ton activité n'est pas encore enregistrée dans le classement mondial."}
                 </p>
              </div>
              <div className="mt-6 flex items-center gap-3 bg-black/40 p-4 rounded-2xl border border-white/5">
                 <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></div>
                 <span className="text-[8px] font-black uppercase text-neutral-400 tracking-[0.2em]">Score Actuel : {myRank?.total_score || 0} Points d'engagement</span>
              </div>
           </div>
        </div>

        <div className={`p-6 rounded-3xl border text-center transition-all duration-1000 ${isUserFullyEligible ? 'bg-emerald-500 border-emerald-400 text-black shadow-[0_0_50px_rgba(16,185,129,0.3)]' : 'bg-neutral-900/80 border-white/10 text-neutral-500'}`}>
           <p className="text-[11px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3">
              {isUserFullyEligible ? (
                <><CheckCheck size={18} /> Statut final : Félicitations ! Tu vas recevoir ta rémunération ce mois-ci.</>
              ) : (
                <><AlertCircle size={18} /> Statut final : Tu n'es pas encore éligible. Remplis les 2 conditions ci-dessus.</>
              )}
           </p>
        </div>
      </div>

      {/* 3. CLASSEMENT TOP 50 */}
      <div className="space-y-8 mt-16 pt-12 border-t border-white/5">
        <div className="flex items-center justify-between px-2">
           <h3 className="text-2xl font-black uppercase tracking-tighter text-white flex items-center gap-3">
             <Trophy size={24} className="text-yellow-500" /> Le Cercle des <GoldText>50 Meilleurs</GoldText>
           </h3>
           <div className="px-4 py-1.5 bg-yellow-600/10 border border-yellow-600/20 rounded-xl">
              <span className="text-[9px] font-black text-yellow-500 uppercase tracking-widest">Rémunération : Top 20 uniquement</span>
           </div>
        </div>

        <div className="bg-[#080808] border border-white/5 rounded-[3rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.6)]">
          {loading ? (
            <div className="p-40 flex flex-col items-center justify-center gap-6 opacity-40">
              <Loader2 className="animate-spin text-yellow-500" size={48} />
              <p className="text-[10px] font-black uppercase tracking-[0.5em]">Analyse du réseau...</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {leaderboard.map((u) => {
                const isMe = u.user_id === profile?.id;
                const isMzPlus = u.user_level === 'niveau_mz_plus';
                const isEligible = isMzPlus && u.rank! <= 20;
                const progress = Math.min((u.total_score / 2000) * 100, 100);

                return (
                  <div key={u.user_id} className={`flex flex-col sm:flex-row items-center justify-between p-6 md:p-10 transition-all group relative overflow-hidden ${
                    isMe ? 'bg-yellow-600/[0.08] ring-1 ring-inset ring-yellow-600/20' : 'hover:bg-white/[0.03]'
                  }`}>
                    
                    {isMe && (
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0 px-4 py-1 bg-yellow-600 text-black text-[8px] font-black uppercase tracking-widest rounded-b-xl shadow-lg">
                        C'est vous
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row items-center gap-8 w-full sm:w-auto">
                       <div className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl border font-mono font-black text-lg shadow-2xl transition-all ${
                         u.rank! === 1 ? 'bg-yellow-500 border-yellow-400 text-black scale-110' : 
                         u.rank! === 2 ? 'bg-neutral-800 border-neutral-600 text-neutral-400' : 
                         u.rank! === 3 ? 'bg-orange-950 border-orange-800 text-orange-600' : 
                         u.rank! <= 20 ? 'bg-neutral-900 border-yellow-600/30 text-yellow-500' :
                         'bg-neutral-900 border-white/5 text-neutral-600'
                       }`}>
                          #{u.rank}
                       </div>
                       
                       <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-3">
                          <div className="flex flex-col sm:flex-row items-center gap-3">
                             <h4 className={`text-lg font-black uppercase tracking-tight ${isMe ? 'text-white' : 'text-neutral-300'}`}>
                               {u.full_name}
                             </h4>
                             {isMzPlus && (
                               <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-600/10 border border-blue-500/20 rounded-full">
                                  <ShieldCheck size={12} className="text-blue-500" />
                                  <span className="text-[8px] font-black uppercase text-blue-400">MZ+ Premium</span>
                               </div>
                             )}
                          </div>
                          
                          <div className="w-full min-w-[200px] space-y-1.5">
                             <div className="flex justify-between items-center px-1">
                                <span className="text-[8px] font-black uppercase text-neutral-600">Performance</span>
                                <span className="text-[8px] font-mono font-black text-neutral-500">{u.total_score} pts</span>
                             </div>
                             <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full transition-all duration-1000 ${isEligible ? 'bg-gradient-to-r from-emerald-500 to-green-400' : 'bg-gradient-to-r from-yellow-700 to-yellow-500'}`}
                                  style={{ width: `${progress}%` }}
                                ></div>
                             </div>
                          </div>
                       </div>
                    </div>
                    
                    <div className="flex items-center justify-center sm:justify-end gap-10 w-full sm:w-auto mt-8 sm:mt-0 pt-6 sm:pt-0 border-t sm:border-t-0 border-white/5">
                       <div className="text-center sm:text-right space-y-1">
                          <p className="text-2xl font-black font-mono text-white tracking-tighter leading-none">{u.total_minutes}m</p>
                          <p className="text-[9px] font-bold uppercase text-neutral-700 tracking-widest">Temps Actif</p>
                       </div>
                       
                       <div className="flex items-center justify-center w-24">
                          {isEligible ? (
                            <div className="flex flex-col items-center gap-2">
                               <div className="w-12 h-12 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.2)] animate-pulse">
                                  <CheckCircle size={24} />
                               </div>
                               <span className="text-[8px] font-black uppercase text-emerald-500 tracking-widest">Paiement OK</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-2 opacity-20">
                               <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-neutral-800">
                                  <Activity size={24} />
                               </div>
                               <span className="text-[8px] font-black uppercase text-neutral-700 tracking-widest">En attente</span>
                            </div>
                          )}
                       </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 5. FOOTER DISCLAIMER */}
      <div className="p-20 text-center space-y-10 opacity-30">
        <ShieldCheck size={40} className="mx-auto text-neutral-600" />
        <p className="text-[9px] text-neutral-500 font-medium italic max-w-xl mx-auto leading-relaxed">
          "L'Arène MZ+ est soumise à un audit anti-fraude strict. Tout usage de bots ou de simulateurs de présence entraîne une exclusion immédiate du classement. Le classement définitif est arrêté à minuit le dernier jour de chaque mois."
        </p>
      </div>
    </div>
  );
};
