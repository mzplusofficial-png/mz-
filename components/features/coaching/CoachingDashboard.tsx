
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Target, Rocket, Zap, Star, Heart, UserCheck, 
  ChevronRight, ChevronLeft, ShieldCheck, CheckCircle2, 
  Loader2, Sparkles, Trophy, Lightbulb, MessageSquare,
  ArrowRight, Crown, ShieldAlert, Sparkle, Lock, X,
  Clock, History, Calendar, LayoutDashboard, FileText, AlertCircle
} from 'lucide-react';
import { supabase } from '../../../services/supabase.ts';
import { UserProfile } from '../../../types.ts';
import { CoachingLayout } from './CoachingLayout.tsx';
import { CoachingCard } from './CoachingCard.tsx';
import { CoachingButton } from './CoachingButton.tsx';
import { GoldText, PurpleText, EliteBadge } from '../../UI.tsx';
import { CurrencyDisplay } from '../../ui/CurrencyDisplay.tsx';

interface Props {
  profile: UserProfile | null;
  onSwitchTab: (id: any) => void;
}

type StepId = 0 | 1 | 2 | 3 | 4;

export const CoachingDashboard: React.FC<Props> = ({ profile, onSwitchTab }) => {
  const [showIntro, setShowIntro] = useState(true);
  const [currentStep, setCurrentStep] = useState<StepId>(0);
  const [formData, setFormData] = useState({ 
    objective: '', 
    difficulty: '', 
    experience: 'debutant',
    expectations: '',
    results_90_days: ''
  });
  
  const [requestsHistory, setRequestsHistory] = useState<any[]>([]);
  const [requestsTodayCount, setRequestsTodayCount] = useState(0);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const isMzPlus = profile?.user_level === 'niveau_mz_plus';

  const fetchCoachingHistory = useCallback(async () => {
    if (!profile?.id) return;
    setLoadingStatus(true);
    try {
      const { data, error } = await supabase
        .from('coaching_requests')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });
      
      if (data) {
        setRequestsHistory(data);
        
        // Compter les demandes d'aujourd'hui
        const today = new Date().toDateString();
        const todayCount = data.filter(r => new Date(r.created_at).toDateString() === today).length;
        setRequestsTodayCount(todayCount);

        if (data.length > 0) {
          setShowIntro(false);
        }
      }
    } catch (e) {
      console.error("Coaching history fetch error:", e);
    } finally {
      setLoadingStatus(false);
    }
  }, [profile?.id]);

  useEffect(() => {
    fetchCoachingHistory();
  }, [fetchCoachingHistory]);

  const handleNext = () => {
    if (currentStep < 4) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep((prev) => (prev + 1) as StepId);
        setIsAnimating(false);
      }, 300);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep((prev) => (prev - 1) as StepId);
        setIsAnimating(false);
      }, 300);
    }
  };

  const handleSubmit = async () => {
    if (!profile?.id || isSending) return;

    // Limite de 2 par jour
    if (requestsTodayCount >= 2) {
      alert("Limite atteinte : Vous pouvez soumettre maximum 2 demandes de diagnostic par jour.");
      return;
    }

    setIsSending(true);
    try {
      const aggregatedMessage = `
        OBJECTIF: ${formData.objective}
        DIFFICULTÉS: ${formData.difficulty}
        EXPÉRIENCE: ${formData.experience}
        ATTENTES: ${formData.expectations}
        VISION 90j: ${formData.results_90_days}
      `;

      const { error } = await supabase
        .from('coaching_requests')
        .insert([{ 
          user_id: profile.id, 
          objective: formData.objective, 
          difficulty: formData.difficulty,
          message: aggregatedMessage,
          experience: formData.experience,
          status: 'pending' 
        }]);

      if (error) throw error;
      
      setShowSuccessModal(true);
      await fetchCoachingHistory();
    } catch (e: any) {
      console.error("Coaching Submit Error:", e);
      alert("Erreur technique lors de l'envoi.");
    } finally {
      setIsSending(false);
    }
  };

  const steps = [
    {
      title: "Ambition",
      label: "Ton prochain palier financier ?",
      icon: <Rocket size={20} className="text-yellow-600" />,
      tip: "La MZ+ propulse vers le sommet.",
      content: (
        <div className="grid grid-cols-1 gap-3">
          {[
            { id: "100k", label: "Mes premiers 100 000", amount: 100000, prefix: "Mes premiers ", suffix: "", sub: "Lancer la machine" },
            { id: "500k", label: "Atteindre 500 000 / mois", amount: 500000, prefix: "Atteindre ", suffix: " / mois", sub: "Liberté naissante" },
            { id: "1M", label: "Viser le Million et plus", amount: null, prefix: "", suffix: "", sub: "Statut Ambassadeur Élite" }
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={() => { setFormData({...formData, objective: opt.label}); handleNext(); }}
              className={`p-6 rounded-2xl border-2 text-left transition-all group ${formData.objective === opt.label ? 'bg-yellow-600/10 border-yellow-600 shadow-xl' : 'bg-black border-white/5 hover:border-white/10'}`}
            >
              <div className="flex justify-between items-center">
                 <div>
                    <p className={`text-[11px] font-black uppercase tracking-widest ${formData.objective === opt.label ? 'text-white' : 'text-neutral-400'}`}>
                      {opt.amount ? (
                        <>
                          {opt.prefix}
                          <CurrencyDisplay amount={opt.amount} inline />
                          {opt.suffix}
                        </>
                      ) : opt.label}
                    </p>
                    <p className="text-[9px] text-neutral-600 font-bold uppercase mt-1">{opt.sub}</p>
                 </div>
                 <ChevronRight size={18} className={`transition-transform group-hover:translate-x-1 ${formData.objective === opt.label ? 'text-yellow-600' : 'text-neutral-800'}`} />
              </div>
            </button>
          ))}
        </div>
      )
    },
    {
      title: "Blocages",
      label: "Tes obstacles actuels ?",
      icon: <Zap size={20} className="text-yellow-600" />,
      tip: "Brise tes barrières techniques.",
      content: (
        <div className="space-y-4">
          <textarea 
            autoFocus
            className="w-full bg-black border border-white/10 rounded-3xl p-8 text-sm text-white outline-none focus:border-yellow-600/50 resize-none transition-all shadow-inner placeholder:text-neutral-700 italic font-medium min-h-[140px]"
            placeholder="Ex: Difficultés à attirer des clients..."
            value={formData.difficulty}
            onChange={e => setFormData({...formData, difficulty: e.target.value})}
          />
          <CoachingButton onClick={handleNext} disabled={!formData.difficulty.trim()}>Continuer</CoachingButton>
        </div>
      )
    },
    {
      title: "Expérience",
      label: "Ton niveau actuel ?",
      icon: <Star size={20} className="text-yellow-600" />,
      tip: "Pour adapter ton mentor.",
      content: (
        <div className="grid grid-cols-1 gap-3">
          {[
            { id: 'debutant', label: 'Débutant', desc: 'Je pars de zéro' },
            { id: 'intermediaire', label: 'Intermédiaire', desc: 'Déjà fait quelques ventes' },
            { id: 'avance', label: 'Avancé', desc: 'Je veux automatiser mon système' }
          ].map((lvl) => (
            <button
              key={lvl.id}
              onClick={() => { setFormData({...formData, experience: lvl.id as any}); handleNext(); }}
              className={`p-6 rounded-2xl border-2 text-left transition-all group ${formData.experience === lvl.id ? 'bg-yellow-600/10 border-yellow-600 shadow-xl' : 'bg-black border-white/5 hover:border-white/10'}`}
            >
              <div className="flex justify-between items-center">
                 <div>
                    <p className={`text-[11px] font-black uppercase tracking-widest ${formData.experience === lvl.id ? 'text-white' : 'text-neutral-400'}`}>{lvl.label}</p>
                    <p className="text-[9px] text-neutral-600 font-bold uppercase mt-1">{lvl.desc}</p>
                 </div>
                 <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${formData.experience === lvl.id ? 'border-yellow-600 bg-yellow-600 text-black' : 'border-neutral-800 text-transparent'}`}>
                    <CheckCircle2 size={12} strokeWidth={3} />
                 </div>
              </div>
            </button>
          ))}
        </div>
      )
    },
    {
      title: "Attentes",
      label: "Besoin spécifique ?",
      icon: <Heart size={20} className="text-yellow-600" />,
      tip: "Pour un impact chirurgical.",
      content: (
        <div className="space-y-4">
          <textarea 
            autoFocus
            className="w-full bg-black border border-white/10 rounded-3xl p-8 text-sm text-white outline-none focus:border-yellow-600/50 resize-none transition-all shadow-inner placeholder:text-neutral-700 italic font-medium min-h-[140px]"
            placeholder="Ex: Une stratégie WhatsApp complète..."
            value={formData.expectations}
            onChange={e => setFormData({...formData, expectations: e.target.value})}
          />
          <CoachingButton onClick={handleNext} disabled={!formData.expectations.trim()}>Presque fini</CoachingButton>
        </div>
      )
    },
    {
      title: "Vision",
      label: "MZ+ dans 90 jours ?",
      icon: <UserCheck size={20} className="text-yellow-600" />,
      tip: "Le succès commence par la vision.",
      content: (
        <div className="space-y-6">
          <textarea 
            autoFocus
            className="w-full bg-black border border-white/10 rounded-3xl p-8 text-sm text-white outline-none focus:border-yellow-600/50 resize-none transition-all shadow-inner placeholder:text-neutral-700 italic font-medium min-h-[140px]"
            placeholder="Ex: Être indépendant financièrement..."
            value={formData.results_90_days}
            onChange={e => setFormData({...formData, results_90_days: e.target.value})}
          />
          <div className="space-y-3">
             <button 
                onClick={handleSubmit}
                disabled={isSending || !formData.results_90_days.trim() || requestsTodayCount >= 2}
                className="w-full py-6 bg-yellow-600 text-black font-black uppercase text-xs tracking-[0.2em] rounded-2xl shadow-[0_20px_50px_rgba(202,138,4,0.3)] hover:bg-yellow-500 transition-all flex items-center justify-center gap-3 disabled:opacity-30 active:scale-95"
              >
                {isSending ? <Loader2 className="animate-spin" /> : <><Sparkles size={18} /> Finaliser mon Diagnostic</>}
              </button>
              {requestsTodayCount >= 2 && (
                <p className="text-[9px] text-red-500 font-black uppercase text-center tracking-widest">
                  Limite quotidienne de 2 demandes atteinte.
                </p>
              )}
          </div>
        </div>
      )
    }
  ];

  const currentProgress = ((currentStep + 1) / steps.length) * 100;

  return (
    <CoachingLayout 
      title="Accompagnement Élite" 
      subtitle="Bâtissons ensemble ton empire financier."
    >
      {/* 1. INTRODUCTION MINI-POPUP */}
      {showIntro && requestsHistory.length === 0 && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/98 backdrop-blur-xl animate-fade-in"></div>
          <div className="relative w-full max-w-[420px] animate-slide-down">
             <div className="absolute -inset-1 bg-yellow-600/10 rounded-[3rem] blur-3xl opacity-50"></div>
             
             <div className="relative bg-[#080808] border border-white/5 rounded-[3rem] p-10 md:p-12 text-center shadow-2xl overflow-hidden">
                <div className="w-16 h-16 bg-yellow-600/10 rounded-2xl flex items-center justify-center mx-auto mb-10 border border-yellow-600/20 text-yellow-600 shadow-xl">
                   <ShieldCheck size={32} />
                </div>
                <div className="space-y-8 mb-12">
                   <p className="text-[14px] text-neutral-200 font-bold leading-relaxed uppercase tracking-widest italic px-4">
                     👉 « Pour un accompagnement sur mesure, nous aurons besoin que vous répondiez à quelques questions. »
                   </p>
                </div>
                <button 
                  onClick={() => setShowIntro(false)}
                  className="group w-full py-6 bg-yellow-600 text-black rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-[0_20px_50px_rgba(202,138,4,0.3)] hover:bg-yellow-500 transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                  Continuer <ChevronRight size={18} strokeWidth={3} />
                </button>
             </div>
          </div>
        </div>
      )}

      {/* 2. ÉTAT DU DOSSIER (SI DÉJÀ ENVOYÉ) */}
      {!loadingStatus && requestsHistory.length > 0 ? (
        <div className="max-w-3xl mx-auto space-y-10 animate-fade-in">
           <div className="flex items-center justify-between px-2">
              <h3 className="text-[10px] font-black uppercase text-neutral-500 tracking-[0.3em] flex items-center gap-3">
                 <History size={14} className="text-yellow-600" /> Historique Coaching
              </h3>
              <div className="flex items-center gap-4">
                 <span className="text-[8px] font-black text-neutral-700 uppercase tracking-widest">Aujourd'hui : {requestsTodayCount}/2</span>
                 <button onClick={() => setRequestsHistory([])} className="text-[8px] font-black text-yellow-600 border border-yellow-600/20 px-3 py-1 rounded-lg uppercase tracking-widest hover:bg-yellow-600 hover:text-black transition-all">Nouveau diagnostic</button>
              </div>
           </div>

           <div className="space-y-6">
              {requestsHistory.slice(0, 3).map((req, idx) => (
                <CoachingCard key={req.id} className={`p-0 overflow-hidden bg-gradient-to-br ${idx === 0 ? 'from-[#0a0a0a] to-[#050505]' : 'from-[#050505] to-[#030303] opacity-60 scale-95 origin-top'}`}>
                   <div className="p-8 md:p-10 border-b border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
                      <div className="flex items-center gap-6">
                         <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center border-2 transition-all duration-1000 ${
                           isMzPlus 
                             ? (req.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' : 'bg-blue-500/10 text-blue-500 border-blue-500/30 shadow-[0_0_40px_rgba(59,130,246,0.2)]')
                             : 'bg-yellow-600/10 text-yellow-600 border-yellow-600/20'
                         }`}>
                            {isMzPlus ? (req.status === 'completed' ? <CheckCircle2 size={32} /> : <Clock size={32} className="animate-pulse" />) : <FileText size={32} />}
                         </div>
                         <div>
                            <p className="text-[8px] font-black uppercase text-neutral-600 tracking-widest mb-1">Diagnostic #{idx + 1}</p>
                            <h4 className="text-xl font-black text-white uppercase tracking-tighter italic">
                               {isMzPlus ? (req.status === 'pending' ? 'Entretien en file d\'attente' : req.status === 'in_progress' ? 'Session en cours' : 'Coaching Terminé') : 'Coaching en attente'}
                            </h4>
                         </div>
                      </div>

                      {!isMzPlus && (
                        <div className="px-5 py-2.5 bg-red-600/10 border border-red-500/30 rounded-xl flex items-center gap-3">
                           <AlertCircle size={14} className="text-red-500" />
                           <span className="text-[8px] font-black uppercase text-red-500 tracking-widest">Traitement bloqué</span>
                        </div>
                      )}
                   </div>

                   <div className="p-8 md:p-10 space-y-10">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div className="space-y-1">
                            <p className="text-[7px] font-black uppercase text-neutral-500 tracking-[0.3em]">Ambition cible</p>
                            <p className="text-md font-bold text-yellow-600 uppercase italic leading-tight">« {req.objective} »</p>
                         </div>
                         <div className="space-y-1">
                            <p className="text-[7px] font-black uppercase text-neutral-500 tracking-[0.3em]">Niveau détecté</p>
                            <p className="text-md font-bold text-white uppercase italic">{req.experience || 'Débutant'}</p>
                         </div>
                      </div>

                      <div className="bg-white/[0.02] border border-white/5 p-6 md:p-8 rounded-[2rem] relative group">
                         <div className="absolute top-6 right-8 opacity-20"><Sparkles size={20} className="text-yellow-600" /></div>
                         <h5 className="text-[8px] font-black uppercase text-neutral-400 tracking-[0.3em] mb-4">Statut de l'Analyse Humaine</h5>
                         <p className="text-[12px] text-neutral-300 leading-relaxed font-medium italic">
                            {isMzPlus 
                             ? (req.status === 'pending' 
                                ? "Ton profil est entre les mains d'un coach certifié. Tu seras contacté par messagerie privée sous 12h à 24h pour fixer ton créneau d'accompagnement." 
                                : req.status === 'in_progress' 
                                  ? "Un coach travaille actuellement sur ta stratégie. Vérifie tes messages privés MZ+ pour les instructions."
                                  : "Cette session est terminée. Tu peux soumettre un nouveau diagnostic si tes objectifs ont évolué.")
                             : "Votre coaching est actuellement en attente. Votre diagnostic a bien été enregistré par notre système, mais il ne sera pris en compte qu'après votre passage à MZ+ Premium."}
                         </p>
                      </div>

                      {!isMzPlus && (
                        <div className="pt-2">
                           <button 
                             onClick={() => onSwitchTab('flash_offer')}
                             className="w-full py-5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-2xl hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3 border border-purple-400/30"
                           >
                              Passer Premium pour débloquer <Crown size={16} fill="white" />
                           </button>
                        </div>
                      )}
                   </div>
                </CoachingCard>
              ))}
           </div>
        </div>
      ) : loadingStatus ? (
        <div className="py-40 flex flex-col items-center gap-6 opacity-30">
           <Loader2 className="animate-spin text-yellow-600" size={32} />
           <p className="text-[9px] font-black uppercase tracking-[0.3em]">Synchronisation Élite...</p>
        </div>
      ) : (
        /* 3. FORMULAIRE DE DIAGNOSTIC */
        <div className="max-w-3xl mx-auto">
          <div className="mb-14 space-y-4">
             <div className="flex justify-between items-end px-2">
                <span className="text-[9px] font-black uppercase text-yellow-600 tracking-widest">Diagnostic Élite</span>
                <span className="text-[9px] font-mono text-neutral-600 uppercase tracking-widest">{currentStep + 1} / 5</span>
             </div>
             <div className="h-0.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-yellow-600 transition-all duration-700 ease-out shadow-[0_0_15px_#ca8a04]"
                  style={{ width: `${currentProgress}%` }}
                />
             </div>
          </div>

          <CoachingCard className={`relative min-h-[440px] flex flex-col justify-between transition-all duration-300 ${isAnimating ? 'opacity-0 scale-98 translate-y-2' : 'opacity-100 scale-100 translate-y-0'}`}>
             <div className="space-y-12">
                <div className="flex items-start justify-between gap-6">
                   <div className="space-y-3">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 bg-yellow-600/10 rounded-lg border border-yellow-600/20 flex items-center justify-center text-yellow-600">
                            {steps[currentStep].icon}
                         </div>
                         <h3 className="text-[10px] font-black uppercase text-neutral-500 tracking-widest">{steps[currentStep].title}</h3>
                      </div>
                      <h2 className="text-xl md:text-2xl font-black text-white leading-tight tracking-tight uppercase italic">{steps[currentStep].label}</h2>
                   </div>
                   
                   <div className="hidden lg:flex flex-col items-end max-w-[180px] text-right">
                      <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl rounded-tr-none mb-2">
                         <p className="text-[9px] text-neutral-500 font-bold italic leading-relaxed uppercase tracking-widest">"{steps[currentStep].tip}"</p>
                      </div>
                      <span className="text-[7px] font-black uppercase text-neutral-700 tracking-widest mr-2 flex items-center gap-1.5"><div className="w-1 h-1 bg-yellow-600 rounded-full"></div> Luna AI</span>
                   </div>
                </div>

                <div className="animate-fade-in-up">
                   {steps[currentStep].content}
                </div>
             </div>

             <div className="mt-12 flex items-center justify-between pt-8 border-t border-white/5">
                <button 
                  onClick={handlePrev} 
                  disabled={currentStep === 0 || isSending}
                  className={`flex items-center gap-2 text-[9px] font-black uppercase tracking-widest transition-all ${currentStep === 0 ? 'opacity-0 pointer-events-none' : 'text-neutral-500 hover:text-white'}`}
                >
                  <ChevronLeft size={16} /> Retour
                </button>
                
                <div className="flex gap-2.5">
                  {[0,1,2,3,4].map(i => (
                    <div key={i} className={`w-1 h-1 rounded-full transition-all duration-500 ${i === currentStep ? 'bg-yellow-600 scale-[2]' : 'bg-neutral-800'}`} />
                  ))}
                </div>

                <div className="w-16"></div>
             </div>
          </CoachingCard>
        </div>
      )}

      {/* MODAL DE SUCCÈS - STANDARD VS PREMIUM */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/98 backdrop-blur-3xl animate-fade-in" onClick={() => setShowSuccessModal(false)}></div>
          <div className="relative w-full max-w-[440px] animate-slide-down">
             <div className={`absolute -inset-1 rounded-[3rem] blur-3xl opacity-40 ${isMzPlus ? 'bg-emerald-600' : 'bg-purple-600'}`}></div>
             
             <div className="relative bg-[#080808] border border-white/10 rounded-[3rem] p-10 md:p-14 text-center shadow-2xl overflow-hidden">
                <button onClick={() => setShowSuccessModal(false)} className="absolute top-6 right-6 text-neutral-600 hover:text-white transition-colors"><X size={24}/></button>
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] -mr-10 -mt-10 rotate-12"><Trophy size={180} className="text-white" /></div>

                <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-10 border transition-all duration-1000 ${
                   isMzPlus 
                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.2)]' 
                    : 'bg-purple-600/10 text-purple-500 border-purple-500/30 shadow-[0_0_40px_rgba(168,85,247,0.2)]'
                }`}>
                   {isMzPlus ? <CheckCircle2 size={40} /> : <Lock size={36} className="animate-pulse" />}
                </div>

                <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-white mb-6 leading-tight">
                  {isMzPlus ? 'Diagnostic Reçu !' : <>Profil <PurpleText>Enregistré</PurpleText></>}
                </h3>

                <p className="text-[12px] text-neutral-400 font-bold leading-relaxed uppercase tracking-widest mb-12 italic border-l-2 border-yellow-600/30 pl-6 mx-auto max-w-[300px] text-left">
                  {isMzPlus 
                    ? "Félicitations ! Ton diagnostic est entre les mains d'un coach. Tu recevras un message privé d'ici 12h pour fixer ton créneau d'accompagnement."
                    : "Votre coaching est actuellement en attente. Votre diagnostic a bien été enregistré par notre système, mais il ne sera pris en compte qu'après votre passage à MZ+ Premium."}
                </p>

                <div className="space-y-4 relative z-10">
                   {isMzPlus ? (
                     <button 
                      onClick={() => setShowSuccessModal(false)}
                      className="w-full py-6 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3"
                     >
                       Prêt pour le Million <ArrowRight size={18} />
                     </button>
                   ) : (
                     <>
                        <button 
                          onClick={() => { onSwitchTab('flash_offer'); setShowSuccessModal(false); }}
                          className="w-full py-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-[0_20px_50px_rgba(124,58,237,0.4)] flex items-center justify-center gap-3 hover:brightness-110 active:scale-95 transition-all border border-purple-400/30"
                        >
                          Accéder à MZ+ Premium <ChevronRight size={18} strokeWidth={3} />
                        </button>
                        <button 
                          onClick={() => setShowSuccessModal(false)}
                          className="text-[9px] font-black uppercase text-neutral-700 hover:text-white transition-colors py-2 tracking-[0.2em]"
                        >
                          Plus tard
                        </button>
                     </>
                   )}
                </div>
             </div>
          </div>
        </div>
      )}
    </CoachingLayout>
  );
};
