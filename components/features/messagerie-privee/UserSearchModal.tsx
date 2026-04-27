
import React, { useState, useEffect } from 'react';
import { Search, X, Loader2, UserPlus, Check, Star, Users, Trophy, Sparkles, ChevronRight, MessageSquare, ShieldCheck } from 'lucide-react';
import { supabase } from '../../../services/supabase.ts';
import { GoldBorderCard, GoldText, EliteBadge } from '../../UI.tsx';

interface Mentor {
  user_id: string;
  full_name: string;
  user_level: string;
  rank: number;
}

export const UserSearchModal: React.FC<{ onClose: () => void; onSelect: (user: any) => void; currentUserId?: string }> = ({ onClose, onSelect, currentUserId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMentors, setLoadingMentors] = useState(true);

  useEffect(() => {
    const fetchMentors = async () => {
      setLoadingMentors(true);
      try {
        const { data, error } = await supabase
          .from('mz_rewards_leaderboard_v2')
          .select('user_id, full_name, user_level')
          .limit(10);

        if (error) throw error;
        if (data) {
          setMentors(data.map((d, i) => ({ ...d, rank: i + 1 })) as Mentor[]);
        }
      } catch (e) {
        console.error("Error fetching mentors:", e);
      } finally {
        setLoadingMentors(false);
      }
    };
    fetchMentors();
  }, []);

  useEffect(() => {
    if (searchTerm.length < 2) {
      setResults([]);
      return;
    }

    const searchUsers = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, full_name, email, user_level')
          .or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
          .neq('id', currentUserId || '')
          .limit(5);
        
        if (error) throw error;
        setResults(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(searchUsers, 400);
    return () => clearTimeout(timer);
  }, [searchTerm, currentUserId]);

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-xl animate-fade-in" onClick={onClose}></div>
      
      <GoldBorderCard className="relative w-full max-w-2xl bg-[#080808] border-white/10 p-0 overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,1)] animate-slide-down flex flex-col max-h-[90vh]">
        {/* HEADER MODALE */}
        <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-yellow-600/10 rounded-xl text-yellow-600 border border-yellow-600/20">
               <MessageSquare size={20} />
            </div>
            <h3 className="text-lg font-black uppercase tracking-tighter">Démarrer une <GoldText>Conversation</GoldText></h3>
          </div>
          <button onClick={onClose} className="p-2 text-neutral-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 space-y-10">
          
          {/* SECTION APPEL À L'ACTION MENTORAT */}
          <section className="space-y-6">
            <div className="bg-yellow-600/5 border border-yellow-600/20 rounded-[2rem] p-6 md:p-8 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-[0.03] -mr-4 -mt-4"><Trophy size={80} className="text-yellow-600" /></div>
               <div className="relative z-10 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-600 text-black rounded-lg">
                    <Sparkles size={12} fill="currentColor" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Conseils d'Experts</span>
                  </div>
                  <h4 className="text-xl md:text-2xl font-black uppercase tracking-tighter text-white leading-tight">Besoin de conseils stratégiques ?</h4>
                  <p className="text-xs md:text-sm text-neutral-400 font-medium leading-relaxed italic max-w-lg">
                    Ne restez pas bloqué. Contactez l'un de nos <span className="text-yellow-500 font-bold">10 Meilleurs Ambassadeurs</span> pour bénéficier de leur expérience et propulser vos revenus vers le million.
                  </p>
               </div>
            </div>

            <div className="space-y-3">
               <div className="flex items-center justify-between px-2">
                  <p className="text-[9px] font-black uppercase text-neutral-500 tracking-[0.3em] flex items-center gap-2">
                    <Trophy size={12} className="text-yellow-600" /> Le Cercle des 10 Meilleurs
                  </p>
                  <span className="text-[7px] font-black text-neutral-700 uppercase tracking-widest">Disponibles pour vous aider</span>
               </div>

               {loadingMentors ? (
                 <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-yellow-600" size={24} /></div>
               ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                   {mentors.map((mentor) => (
                     <button 
                        key={mentor.user_id}
                        disabled={mentor.user_id === currentUserId}
                        onClick={() => onSelect({ id: mentor.user_id, full_name: mentor.full_name, user_level: mentor.user_level })}
                        className={`p-4 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center justify-between group hover:bg-yellow-600/10 hover:border-yellow-600/30 transition-all text-left ${mentor.user_id === currentUserId ? 'opacity-30 grayscale' : ''}`}
                     >
                        <div className="flex items-center gap-4">
                           <div className="relative">
                              <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-white/5 flex items-center justify-center text-white font-black uppercase text-xs">
                                 {mentor.full_name.charAt(0)}
                              </div>
                              <div className="absolute -top-1.5 -right-1.5 bg-yellow-600 text-black text-[7px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-[#080808] shadow-lg">#{mentor.rank}</div>
                           </div>
                           <div className="min-w-0">
                              <p className="text-xs font-black uppercase text-white truncate tracking-tight group-hover:text-yellow-500">{mentor.full_name}</p>
                              <p className="text-[7px] font-black text-neutral-600 uppercase tracking-widest mt-0.5">Top Ambassadeur</p>
                           </div>
                        </div>
                        <ChevronRight size={14} className="text-neutral-700 group-hover:text-yellow-600 group-hover:translate-x-1 transition-all" />
                     </button>
                   ))}
                 </div>
               )}
            </div>
          </section>

          {/* SECTION RECHERCHE MANUELLE */}
          <section className="space-y-4 pt-10 border-t border-white/5">
            <div className="flex items-center gap-2 px-2 mb-4">
              <UserPlus size={14} className="text-neutral-600" />
              <p className="text-[9px] font-black uppercase text-neutral-600 tracking-[0.3em]">Ou rechercher un membre spécifique</p>
            </div>
            
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" size={18} />
              <input 
                placeholder="Nom ou adresse email..." 
                className="w-full bg-black border border-white/10 rounded-2xl py-4 pl-14 pr-4 text-sm text-white outline-none focus:border-yellow-600/40 transition-all shadow-inner"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              {loading && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <Loader2 className="animate-spin text-yellow-500" size={16} />
                </div>
              )}
            </div>

            <div className="space-y-2">
              {searchTerm.length >= 2 && results.length === 0 && !loading && (
                <p className="p-4 text-center text-[10px] font-black uppercase text-red-500 opacity-50">Aucun ambassadeur trouvé</p>
              )}
              {results.map(user => (
                <button 
                  key={user.id}
                  onClick={() => onSelect(user)}
                  className="w-full p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between group hover:bg-white/5 hover:border-white/20 transition-all shadow-lg active:scale-95"
                >
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-white/5 flex items-center justify-center text-white font-black text-xs uppercase">
                      {user.full_name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase text-white tracking-tight group-hover:text-yellow-500 transition-colors">
                        {user.full_name}
                      </h4>
                      <p className="text-[8px] text-neutral-600 font-mono mt-0.5 truncate max-w-[200px]">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                     {user.user_level === 'niveau_mz_plus' && (
                        <div className="p-1.5 bg-blue-500/10 text-blue-400 rounded-lg">
                           <Star size={10} fill="currentColor" />
                        </div>
                     )}
                     <div className="p-2 bg-neutral-800 text-neutral-500 rounded-lg group-hover:bg-yellow-600 group-hover:text-black transition-all">
                        <Check size={14} />
                     </div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="p-6 bg-black border-t border-white/5 text-center shrink-0">
           <div className="flex items-center justify-center gap-4 opacity-30">
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={12} className="text-emerald-500" />
                <span className="text-[8px] font-black uppercase text-neutral-500 tracking-[0.2em]">Canal Sécurisé</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-neutral-800"></div>
              <span className="text-[8px] font-black uppercase text-neutral-500 tracking-[0.2em]">Protocole MZ+ Elite</span>
           </div>
        </div>
      </GoldBorderCard>
    </div>
  );
};
