
import React, { useState, useEffect, useMemo } from 'react';
import { ShieldCheck, TrendingUp, ArrowRight, Play, Zap, X, Star, Lock, Clock, Loader2, AlertCircle, PlayCircle } from 'lucide-react';
import { GoldText } from './UI.tsx';
import { AuthForm } from './AuthForm.tsx';
import { supabase } from '../services/supabase.ts';

export const LandingPage: React.FC = () => {
  // Détecter si l'utilisateur a déjà complété ces étapes auparavant
  const hasPassedLanding = localStorage.getItem('mz_landing_passed') === 'true';
  const isTimerDonePreviously = localStorage.getItem('mz_timer_completed') === 'true';

  // Si l'utilisateur a déjà passé la landing, on affiche directement l'Auth
  const [view, setView] = useState<'presentation' | 'auth'>(hasPassedLanding ? 'auth' : 'presentation');
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // États pour le verrouillage du bouton (50 secondes)
  // On démarre à 0 si l'utilisateur l'a déjà fait une fois dans sa vie
  const [timer, setTimer] = useState(isTimerDonePreviously ? 0 : 50);
  const [canClick, setCanClick] = useState(isTimerDonePreviously);

  useEffect(() => {
    let isMounted = true;
    const fetchConfig = async () => {
      try {
        const { data } = await supabase
          .from('mz_home_config')
          .select('*')
          .eq('id', 'home-landing')
          .maybeSingle();
        
        if (isMounted && data) {
          setConfig(data);
        }
      } catch (err) {
        console.error("Config fetch error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchConfig();
    return () => { isMounted = false; };
  }, []);

  // Logique du compte à rebours
  useEffect(() => {
    if (view === 'presentation' && timer > 0 && !canClick) {
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCanClick(true);
            localStorage.setItem('mz_timer_completed', 'true'); // Mémoriser le déblocage
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [view, timer, canClick]);

  const handleStart = () => {
    if (canClick) {
      localStorage.setItem('mz_landing_passed', 'true'); // Mémoriser le passage à l'auth
      setView('auth');
    }
  };

  // Mémorisation du rendu vidéo pour éviter les disparitions au re-render
  const videoPlayer = useMemo(() => {
    if (!config) return null;

    if (config.video_url) {
      return (
        <video 
          key="landing-vid-stable"
          src={config.video_url} 
          className="w-full h-full object-cover" 
          autoPlay muted playsInline loop controls 
        />
      );
    }

    if (config.youtube_iframe) {
      return (
        <div 
          key="landing-yt-stable"
          className="w-full h-full dynamic-video-container" 
          dangerouslySetInnerHTML={{ __html: config.youtube_iframe }} 
        />
      );
    }

    return <div className="w-full h-full flex items-center justify-center opacity-10"><PlayCircle size={48} /></div>;
  }, [config]);

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="w-12 h-12 border-2 border-yellow-600/20 border-t-yellow-500 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="h-[100dvh] bg-[#050505] text-white flex flex-col relative overflow-hidden font-sans select-none">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[80%] h-[80%] bg-yellow-600/5 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[60%] h-[60%] bg-purple-900/10 rounded-full blur-[100px]"></div>
      </div>

      {/* Navigation Header */}
      <nav className="relative z-20 px-6 h-16 flex justify-between items-center shrink-0 border-b border-white/5 bg-black/20 backdrop-blur-md">
        <div 
          className="text-xl font-black tracking-tighter cursor-pointer flex items-center gap-2 group" 
          onClick={() => setView('presentation')}
        >
          <div className="w-8 h-8 bg-yellow-600 rounded-lg flex items-center justify-center text-black shadow-lg group-hover:scale-110 transition-transform">
            <Star size={18} fill="currentColor" />
          </div>
          <GoldText className="italic text-2xl font-black">MZ+</GoldText>
        </div>
        
        {view === 'auth' && (
          <button 
            onClick={() => setView('presentation')}
            className="text-[10px] font-black uppercase tracking-widest text-neutral-500 hover:text-white transition-colors flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10"
          >
            <Play size={12} fill="currentColor" /> Revoir la vidéo
          </button>
        )}
      </nav>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center overflow-hidden">
        {view === 'presentation' ? (
          <div className="w-full h-full flex flex-col items-center justify-between py-6 md:py-10 px-6 max-w-4xl mx-auto text-center animate-fade-in">
            
            <div className="space-y-4 animate-slide-down">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-600/10 border border-yellow-600/20 rounded-full mb-2">
                <Zap size={12} className="text-yellow-500 animate-pulse" />
                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-yellow-500">Système Élite 2025</span>
              </div>
              <h1 className="text-2xl md:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tighter uppercase max-w-3xl mx-auto">
                Enfin un business en ligne <br/>
                <GoldText className="italic">conçu pour réussir en Afrique</GoldText>.
              </h1>
              
              <p className="text-neutral-400 text-[10px] md:text-sm font-medium tracking-wide opacity-80 flex items-center justify-center gap-2">
                <AlertCircle size={14} className="text-yellow-600/60" /> 
                Visionnez cette vidéo stratégique pour débloquer votre accès exclusif.
              </p>
            </div>

            {/* Lecteur Vidéo */}
            <div className="w-full max-w-2xl aspect-video rounded-3xl overflow-hidden border-2 border-white/5 bg-black shadow-[0_0_80px_rgba(202,138,4,0.15)] relative group my-4">
               {videoPlayer}
              <div className="absolute inset-0 pointer-events-none border-2 border-yellow-600/0 group-hover:border-yellow-600/20 rounded-3xl transition-all duration-500"></div>
            </div>

            {/* CTA Persistant avec Barre de Chargement */}
            <div className="w-full max-w-xs space-y-4 animate-slide-up">
               <button 
                onClick={handleStart}
                disabled={!canClick}
                className={`group relative w-full py-5 md:py-6 rounded-2xl font-black uppercase text-xs md:text-sm tracking-[0.2em] transition-all flex flex-col items-center justify-center gap-1 overflow-hidden ${
                  canClick 
                  ? 'bg-gradient-to-r from-yellow-600 to-yellow-500 text-black shadow-[0_20px_50px_rgba(202,138,4,0.3)] hover:scale-[1.03] active:scale-95 border-none' 
                  : 'bg-neutral-900/50 text-neutral-500 border border-white/5 cursor-not-allowed'
                }`}
               >
                  {/* Barre de progression visuelle sur le bouton */}
                  {!canClick && (
                    <div 
                      className="absolute left-0 top-0 bottom-0 bg-yellow-600/20 transition-all duration-1000 ease-linear z-0"
                      style={{ width: `${((50 - timer) / 50) * 100}%` }}
                    />
                  )}
                  
                  <div className="relative z-10 flex items-center justify-center gap-3">
                    <span className={canClick ? 'text-black' : 'opacity-60'}>Commencer maintenant</span>
                    {canClick ? (
                      <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    ) : (
                      <Lock size={16} className="opacity-40" />
                    )}
                  </div>

                  {!canClick && (
                    <span className="relative z-10 text-[9px] font-black opacity-40 flex items-center gap-2">
                       <Clock size={10} /> Déblocage automatique dans {timer}s
                    </span>
                  )}
               </button>
               
               <div className="flex items-center justify-center gap-6 opacity-40 grayscale group-hover:grayscale-0 transition-all">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={14} className="text-yellow-600" />
                    <span className="text-[7px] font-black uppercase tracking-widest">Paiement Mobile</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp size={14} className="text-yellow-600" />
                    <span className="text-[7px] font-black uppercase tracking-widest">Revenus Réels</span>
                  </div>
               </div>
            </div>

          </div>
        ) : (
          <div className="w-full max-w-md animate-slide-down py-8 px-6 overflow-y-auto custom-scrollbar h-full flex items-center justify-center">
             <div className="w-full relative">
                <div className="absolute -inset-10 bg-yellow-600/5 blur-[100px] opacity-20 rounded-full pointer-events-none"></div>
                <AuthForm defaultMode='signup' />
             </div>
          </div>
        )}
      </main>
      
      <footer className="relative z-10 py-4 text-center text-neutral-800 text-[7px] font-black uppercase tracking-[0.5em] opacity-30 border-t border-white/5">
        &copy; {new Date().getFullYear()} Millionaire Zone Plus • Propulsion Économique Africaine
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up { animation: slide-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        
        .dynamic-video-container iframe {
          width: 100% !important;
          height: 100% !important;
          border: none !important;
        }

        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      `}} />
    </div>
  );
};

