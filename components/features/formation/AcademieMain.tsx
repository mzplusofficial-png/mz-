
import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Lock, 
  Crown, 
  Zap, 
  ShieldCheck, 
  ChevronRight, 
  Loader2, 
  Star,
  Target,
  Rocket,
  ArrowRight,
  Film,
  Sparkles,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Unlock,
  Eye,
  Trophy,
  ArrowUpRight
} from 'lucide-react';
import { supabase } from '../../../services/supabase.ts';
import { UserProfile, Formation } from '../../../types.ts';
import { SectionTitle, GoldText } from '../../UI.tsx';

interface AcademieMainProps {
  profile: UserProfile | null;
  onSwitchTab: (id: any) => void;
}

const PurpleText: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <span 
    className={`inline-block ${className}`}
    style={{ 
      background: 'linear-gradient(to right, #e879f9, #a855f7, #6366f1)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      color: 'transparent',
    }}
  >
    {children}
  </span>
);

export const AcademieMain: React.FC<AcademieMainProps> = ({ profile, onSwitchTab }) => {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [loading, setLoading] = useState(true);
  const isPremium = profile?.user_level === 'niveau_mz_plus';

  const fetchFormations = async () => {
    const { data } = await supabase
      .from('mz_formations')
      .select('*')
      .order('order_index', { ascending: true });
    if (data) setFormations(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchFormations();
    const channel = supabase.channel('formations_realtime_elite_v5')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mz_formations' }, fetchFormations)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  if (loading) return (
    <div className="py-40 flex flex-col items-center gap-8">
      <div className="relative">
        <div className="w-20 h-20 border-[1px] border-purple-500/20 rounded-full animate-ping absolute"></div>
        <Loader2 className="animate-spin text-purple-500" size={40} strokeWidth={1} />
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.6em] text-neutral-600 animate-pulse">Initialisation de l'expertise...</p>
    </div>
  );

  return (
    <div className="animate-fade-in pb-40 px-4 md:px-0 max-w-5xl mx-auto">
      
      {/* 1. HEADER ÉPURÉ & STATUT UNIQUE */}
      <div className="text-center mb-24 space-y-8">
        <div className="space-y-4">
           <div className="inline-flex items-center gap-3 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></div>
              <span className="text-[8px] font-black uppercase tracking-[0.3em] text-neutral-500">Masterclass Élite</span>
           </div>
           <h2 className="text-4xl md:text-8xl font-black text-white uppercase tracking-tighter leading-[0.85]">
             ACADÉMIE <br/><PurpleText>STRATÉGIQUE</PurpleText>
           </h2>
        </div>

        {/* BANDEAU DE STATUT PREMIUM - LE SEUL CTA GLOBAL */}
        {!isPremium && (
          <div className="max-w-2xl mx-auto bg-gradient-to-r from-purple-900/40 via-purple-600/20 to-purple-900/40 border border-purple-500/30 p-6 rounded-[2rem] backdrop-blur-xl animate-slide-down flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
             <div className="flex items-center gap-4 text-left">
                <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0">
                   <Lock size={20} strokeWidth={2.5} />
                </div>
                <div>
                   <p className="text-white text-xs font-black uppercase tracking-tight">Accès Complet Verrouillé</p>
                   <p className="text-purple-300/60 text-[10px] font-medium leading-tight">Débloquez l'intégralité des modules de l'Académie en passant au Niveau MZ+ Premium.</p>
                </div>
             </div>
             <button 
               onClick={() => onSwitchTab('flash_offer')}
               className="px-6 py-3.5 bg-white text-black rounded-xl font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all shadow-xl whitespace-nowrap"
             >
               Activer mon accès
             </button>
          </div>
        )}
      </div>

      {/* 2. LISTE DES MODULES - SANS CTA RÉPÉTITIFS */}
      <div className="space-y-48">
        {formations.length === 0 ? (
          <div className="py-20 text-center opacity-20 italic uppercase tracking-[0.5em] text-xs font-black">Aucune donnée disponible...</div>
        ) : (
          formations.map((f, index) => (
            <EliteModuleCard 
              key={f.id} 
              formation={f} 
              index={index + 1}
              isPremium={isPremium} 
              onUpgrade={() => onSwitchTab('flash_offer')} 
            />
          ))
        )}
      </div>

      {/* FOOTER RAFFINÉ */}
      <div className="mt-40 pt-20 border-t border-white/5 text-center opacity-20">
         <ShieldCheck size={32} className="mx-auto mb-4 text-purple-500" />
         <p className="text-[8px] font-black uppercase tracking-[0.5em]">Certification Millionaire Zone Plus • Tous droits réservés</p>
      </div>
    </div>
  );
};

const EliteModuleCard: React.FC<{ formation: Formation; index: number; isPremium: boolean; onUpgrade: () => void }> = ({ formation, index, isPremium, onUpgrade }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const hasVideo = Boolean(formation.preview_url);

  const getChapters = () => {
    if (formation.chapters && formation.chapters.length > 0) {
      const icons = [Target, Sparkles, TrendingUp, DollarSign, Rocket, Zap, ShieldCheck];
      return formation.chapters.map((ch, idx) => ({
        title: ch.title,
        icon: icons[idx % icons.length]
      }));
    }
    return [
      { title: "🎬 Chapitre 1 : Introduction & Concept", icon: Target },
      { title: "🚀 Chapitre 2 : Mise en place stratégique", icon: Sparkles },
      { title: "💰 Chapitre 3 : Optimisation des revenus", icon: DollarSign }
    ];
  };

  const chapters = getChapters();

  const handlePlay = () => {
    if (showPaywall) return;
    if (!hasVideo && !isPremium) {
      setShowPaywall(true);
      return;
    }
    if (hasVideo) {
      setIsPlaying(true);
      videoRef.current?.play();
    }
  };

  const handleVideoEnded = () => {
    if (!isPremium) {
      setShowPaywall(true);
      setIsPlaying(false);
      if (videoRef.current) videoRef.current.pause();
    }
  };

  return (
    <div className="space-y-12 animate-fade-in group">
      
      {/* 1. TITRE DU MODULE - Épuré */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-2">
         <div className="space-y-2">
            <div className="flex items-center gap-3">
               <span className="text-[10px] font-black uppercase tracking-[0.4em] text-purple-500/80">Module 0{index}</span>
               {index === 1 && <span className="px-2 py-0.5 bg-yellow-600/10 border border-yellow-600/30 text-yellow-600 rounded-md text-[7px] font-black uppercase tracking-widest flex items-center gap-1"><Zap size={8}/> Fondamentaux</span>}
            </div>
            <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white leading-none">
              {formation.title}
            </h3>
         </div>
         <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-600 md:mb-1">
           {isPremium ? "Accès Membre • Débloqué" : "Statut MZ+ • Privé"}
         </p>
      </div>

      {/* 2. MINIATURE - Focus Image, pas de bouton externe */}
      <div className="relative max-w-5xl mx-auto">
        <div className="relative aspect-video rounded-[3rem] overflow-hidden border border-white/10 bg-[#050505] shadow-[0_50px_100px_rgba(0,0,0,0.8)] transition-all duration-1000 group-hover:border-purple-600/20">
          
          {!isPlaying && !showPaywall && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center cursor-pointer group/overlay" onClick={handlePlay}>
              <img 
                src={formation.thumbnail_url} 
                className="absolute inset-0 w-full h-full object-cover opacity-100 transition-all duration-1000 group-hover/overlay:scale-[1.03]" 
                alt={formation.title}
              />
              
              <div className="absolute inset-0 bg-black/10 group-hover/overlay:bg-black/30 transition-colors pointer-events-none"></div>
              
              {/* Badge d'exclusivité raffiné */}
              {!isPremium && (
                <div className="absolute top-8 right-8 px-5 py-2 bg-black/60 backdrop-blur-xl border border-white/10 text-white rounded-2xl text-[8px] font-black uppercase tracking-widest shadow-2xl z-20 flex items-center gap-2">
                   <Lock size={12} className="text-purple-500" /> RÉSERVÉ MZ+ PREMIUM
                </div>
              )}

              {/* Bouton de lecture minimaliste */}
              <div className="relative z-10">
                 <div className={`w-24 h-24 rounded-full border border-white/20 flex items-center justify-center transition-all duration-500 shadow-2xl relative text-white bg-black/40 backdrop-blur-md group-hover/overlay:bg-purple-600 group-hover/overlay:border-purple-400 group-hover/overlay:scale-110`}>
                    {hasVideo ? <Play size={32} fill="currentColor" className="ml-1.5" /> : <Lock size={32} strokeWidth={2.5} />}
                 </div>
              </div>
            </div>
          )}

          {hasVideo && (
            <video 
              ref={videoRef}
              src={formation.preview_url}
              className={`w-full h-full object-cover ${showPaywall ? 'blur-3xl grayscale scale-110' : ''} transition-all duration-1000`}
              onEnded={handleVideoEnded}
              controls={isPlaying && !showPaywall}
              playsInline
            />
          )}

          {/* PAYWALL INTÉGRÉ - Uniquement si clic Standard */}
          {showPaywall && (
            <div className="absolute inset-0 z-20 bg-black/95 backdrop-blur-[100px] flex flex-col items-center justify-center p-8 text-center animate-fade-in">
              <div className="w-20 h-20 bg-purple-600/20 border border-purple-600/40 rounded-[2rem] flex items-center justify-center text-purple-400 mb-8 shadow-2xl animate-bounce">
                 <Lock size={36} strokeWidth={2.5} />
              </div>
              <div className="space-y-4 mb-10">
                 <h5 className="text-3xl md:text-5xl font-black uppercase text-white tracking-tighter italic">
                   CONTENU <PurpleText>RÉSERVÉ</PurpleText>
                 </h5>
                 <p className="text-neutral-500 text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] max-w-sm mx-auto leading-relaxed">
                   Devenez membre MZ+ Premium pour débloquer l'intégralité de notre savoir stratégique.
                 </p>
              </div>
              <button 
                onClick={onUpgrade}
                className="group px-12 py-5 bg-white text-black rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-purple-600 hover:text-white transition-all shadow-2xl flex items-center gap-3 active:scale-95"
              >
                Débloquer tout le système <ArrowRight size={18} strokeWidth={3} />
              </button>
              <button onClick={() => setShowPaywall(false)} className="mt-8 text-neutral-600 text-[8px] font-black uppercase tracking-widest hover:text-white transition-colors">Plus tard</button>
            </div>
          )}
        </div>
      </div>

      {/* 3. PLAN D'ACTION (CHAPITRES) - Épuré et informatif */}
      <div className="max-w-2xl mx-auto space-y-10">
        <div className="flex items-center gap-3 pl-4 border-l-2 border-purple-600/30">
           <Eye size={12} className="text-purple-500" />
           <p className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.4em] italic">
             Aperçu du programme stratégique
           </p>
        </div>

        <div className="grid grid-cols-1 gap-3">
           {chapters.map((chap, i) => (
             <div key={i} className="flex items-center gap-6 p-5 bg-white/[0.01] border border-white/5 rounded-3xl hover:bg-white/[0.03] transition-all">
                <div className="w-10 h-10 rounded-xl bg-neutral-950 flex items-center justify-center text-neutral-700 transition-all shadow-inner shrink-0 group-hover:text-purple-400">
                   <chap.icon size={18} />
                </div>
                <h4 className="text-[10px] md:text-[12px] font-black uppercase text-neutral-500 tracking-widest leading-tight">
                   {chap.title}
                </h4>
                {!isPremium && <Lock size={12} className="ml-auto text-neutral-800" />}
                {isPremium && <CheckCircle2 size={16} className="ml-auto text-purple-600/50" />}
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};
