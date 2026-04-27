
import React, { useState, useEffect, useCallback } from 'react';
import { Video, Send, Loader2, Target, Link, CheckCircle, ArrowRightCircle, Sparkles, ShieldCheck, HelpCircle } from 'lucide-react';
import { supabase } from '../../../services/supabase.ts';
import { UserProfile } from '../../../types.ts';
import { RpaLayout } from './RpaLayout.tsx';
import { RpaStats } from './RpaStats.tsx';
import { RpaHistory } from './RpaHistory.tsx';
import { RpaCard } from './RpaCard.tsx';
import { ConversionModal } from '../../UI.tsx';

interface RpaDashboardProps {
  profile: UserProfile | null;
  onRefresh?: () => void;
  onSwitchTab?: (tab: any) => void;
  onStartGuide?: () => void;
}

export const RpaDashboard: React.FC<RpaDashboardProps> = ({ profile, onRefresh, onSwitchTab, onStartGuide }) => {
  const [link, setLink] = useState('');
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  const isMzPlus = profile?.user_level === 'niveau_mz_plus';

  const fetchRpaData = useCallback(async (retryCount = 0) => {
    if (!profile?.id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('rpa_submissions')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setSubmissions(data || []);
    } catch (e: any) {
      console.error("RPA Fetch Error:", e);
      if (retryCount < 2 && (e.message?.includes('fetch') || e.name === 'TypeError')) {
        setTimeout(() => fetchRpaData(retryCount + 1), 1500);
        return;
      }
    } finally {
      setLoading(false);
    }
  }, [profile?.id]);

  useEffect(() => {
    fetchRpaData();
  }, [fetchRpaData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // VERIFICATION PREMIUM - POPUP VIOLET ROYAL
    if (!isMzPlus) {
      setShowPremiumModal(true);
      return;
    }

    if (!link.trim() || isSending || !profile?.id) return;

    setIsSending(true);
    try {
      const { error } = await supabase
        .from('rpa_submissions')
        .insert([{ 
          user_id: profile.id, 
          type: 'video', 
          data: { link: link.trim() }, 
          status: 'pending' 
        }]);

      if (error) throw error;
      
      setLink('');
      await fetchRpaData();
      if (onRefresh) onRefresh();
      alert("C'est envoyé ! Ton lien est en cours de vérification.");
    } catch (e: any) {
      alert("Erreur: " + e.message);
    } finally {
      setIsSending(false);
    }
  };

  const pending = submissions.filter(s => s.status === 'pending').length;
  const approved = submissions.filter(s => s.status === 'approved').length;
  const submissionsToday = submissions.filter(s => new Date(s.created_at).toDateString() === new Date().toDateString()).length;

  return (
    <RpaLayout>
      {/* Pop-up de restriction Premium - Branding Violet Royal et Responsive SE/Small screen */}
      <ConversionModal 
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        onUpgrade={() => onSwitchTab?.('flash_offer')}
        variant="premium"
        title="Accès Premium Requis"
        description="Le RPA est réservé aux membres MZ+ Premium. Accède à MZ+ Premium pour commencer à être rémunéré pour tes vidéos."
      />

      {/* Simplified Header */}
      <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-2">
         <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
               <Sparkles size={12} className="text-yellow-600 animate-pulse" />
               <span className="text-[8px] font-black uppercase tracking-[0.3em] text-neutral-500 text-center">Gagne de l'argent avec tes vidéos</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white leading-none italic">
               GANNER AVEC LE <span className="text-yellow-600">RPA</span>
            </h2>
         </div>
         
         <div className="flex flex-col items-end gap-4">
            <div id="rpa-cashout-btn">
               <button 
                 onClick={() => isMzPlus ? alert("Préparation du virement...") : setShowPremiumModal(true)}
                 className="flex items-center gap-3 px-6 py-3.5 bg-yellow-600 text-black rounded-xl font-black uppercase text-[9px] tracking-widest shadow-xl hover:bg-yellow-500 transition-all active:scale-95"
               >
                  Retirer mes gains <ArrowRightCircle size={16} />
               </button>
            </div>
         </div>
      </header>

      {/* Stats Display - Simplified Labels */}
      <div id="rpa-balance-card">
        <RpaStats 
          score={profile?.rpa_points || 0} 
          pendingCount={pending} 
          totalValid={approved} 
        />
      </div>

      <div className="max-w-3xl mx-auto space-y-12">
        {/* Simplified Form */}
        <section id="rpa-submission-form" className="space-y-6">
           <div className="flex justify-between items-center px-4">
              <h3 className="text-[10px] font-black uppercase text-white tracking-widest flex items-center gap-2">
                 <Link size={14} className="text-purple-500" /> Ajouter ma vidéo
              </h3>
              <div id="rpa-quota-badge" className="text-[8px] font-black text-neutral-600 uppercase tracking-widest">
                 Limite du jour : <span className="text-white">{3 - submissionsToday} / 3</span>
              </div>
           </div>

           <RpaCard variant="glass" className="p-2 md:p-2.5 border-white/5 shadow-2xl rounded-[2rem]">
              <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-2">
                 <input 
                    required 
                    type="url"
                    id="rpa-input-link"
                    placeholder="Lien TikTok ou Reels..." 
                    className="flex-1 bg-black/40 border border-white/5 rounded-[1.5rem] py-4 px-6 text-sm text-white outline-none focus:border-purple-600/50 transition-all placeholder:text-neutral-700 italic font-medium" 
                    value={link} 
                    onChange={e => setLink(e.target.value)} 
                 />
                 
                 <button 
                    type="submit" 
                    id="rpa-submit-btn"
                    disabled={isSending || submissionsToday >= 3}
                    className="md:px-8 py-4 bg-purple-600 text-white rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest shadow-lg hover:bg-purple-500 transition-all flex items-center justify-center gap-2.5 disabled:opacity-20"
                 >
                    {isSending ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <><CheckCircle size={16} strokeWidth={3} /> Valider ma vidéo</>
                    )}
                 </button>
              </form>
           </RpaCard>
        </section>

        {/* Simple History */}
        <div id="rpa-history-log" className="pt-8 border-t border-white/5">
           <RpaHistory submissions={submissions} />
        </div>
      </div>

      <footer className="mt-16 flex flex-col items-center gap-3 opacity-20">
         <ShieldCheck size={24} className="text-neutral-500" />
         <p className="text-[7px] font-black text-neutral-600 uppercase tracking-[0.4em] text-center">
           MZ+ Verification System v5.2
         </p>
      </footer>

      {/* Floating Guide Button - Maximum Visibility */}
      {onStartGuide && (
        <button 
          onClick={onStartGuide}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-6 py-4 bg-white text-black rounded-full font-black uppercase text-[10px] tracking-widest shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:scale-105 active:scale-95 transition-all border-2 border-purple-600 animate-bounce-subtle"
        >
          <HelpCircle size={18} className="text-purple-600" />
          <span>Guide RPA</span>
        </button>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2s infinite ease-in-out;
        }
      `}} />
    </RpaLayout>
  );
};
