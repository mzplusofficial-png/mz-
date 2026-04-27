import React, { useState, useEffect } from 'react';
import { Download, Smartphone, Monitor, CheckCircle2, X, PlusSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const PWAInstallBanner = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Détection iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(ios);

    const isInIframe = window.self !== window.top;

    // Vérifier si déjà installed
    const checkIfInstalled = () => {
      return window.matchMedia('(display-mode: standalone)').matches || 
             (navigator as any).standalone || 
             localStorage.getItem('mz_pwa_installed') === 'true';
    };

    if (checkIfInstalled()) {
      setIsInstalled(true);
      return;
    }

    // Capture initiale du prompt s'il a été bufferisé dans index.html
    if ((window as any).deferredPrompt) {
      console.log('MZ+ PWA: Utilisation du prompt bufferisé');
      setDeferredPrompt((window as any).deferredPrompt);
      setIsVisible(true);
    }

    const handlePromptReady = () => {
      console.log('MZ+ PWA: Prompt prêt via événement');
      setDeferredPrompt((window as any).deferredPrompt);
      setIsVisible(true);
    };

    window.addEventListener('mz-pwa-prompt-ready', handlePromptReady);

    const handleBeforeInstall = (e: any) => {
      console.log('MZ+ PWA: Capture du prompt en direct');
      e.preventDefault();
      setDeferredPrompt(e);
      (window as any).deferredPrompt = e; // Sync back to window
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Apparition forcée après 3s pour laisser le temps au Service Worker de s'activer
    const timer = setTimeout(() => {
      if (!isInstalled) setIsVisible(true);
    }, 3000);

    window.addEventListener('appinstalled', () => {
      console.log('MZ+ PWA: Installation réussie');
      setIsInstalled(true);
      setIsVisible(false);
      localStorage.setItem('mz_pwa_installed', 'true');
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('mz-pwa-prompt-ready', handlePromptReady);
      clearTimeout(timer);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setIsVisible(false);
      }
    }
    // Enregistrer l'action (même pour iOS guide)
    localStorage.setItem('mz_pwa_prompt_timestamp', Date.now().toString());
  };

  const closeBanner = () => {
    setIsVisible(false);
    // On repousse de 24h
    localStorage.setItem('mz_pwa_prompt_timestamp', Date.now().toString());
  };

  if (isInstalled || !isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-24 left-4 right-4 md:left-auto md:right-8 md:bottom-8 md:w-96 z-[60]"
      >
        <div className="bg-neutral-900 border border-yellow-500/30 rounded-2xl shadow-2xl p-4 overflow-hidden relative">
          {/* Background Highlight */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 blur-3xl -z-10" />
          
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shrink-0 shadow-lg">
              <Download className="text-black" size={24} />
            </div>
            
            <div className="flex-1 space-y-1">
              <h3 className="text-white font-black text-sm uppercase tracking-tight">Transformer en App</h3>
              <p className="text-neutral-400 text-xs leading-relaxed">
                Installez MZ+ Elite sur votre écran d'accueil pour un accès instantané et des notifications fluides.
              </p>
              
              <div className="flex flex-col gap-3 pt-2">
                {window.self !== window.top ? (
                  <button
                    onClick={() => window.open(window.location.href, '_blank')}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] uppercase px-4 py-3 rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 w-full"
                  >
                    <Monitor size={14} /> Ouvrir pour installer l'App
                  </button>
                ) : deferredPrompt ? (
                  <button
                    onClick={handleInstall}
                    className="bg-yellow-500 hover:bg-yellow-400 text-black font-black text-xs uppercase px-4 py-3 rounded-xl transition-all shadow-lg active:scale-95 animate-pulse w-full"
                  >
                    Installer maintenant
                  </button>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: isIOS ? 0 : 2 }} // On laisse 2s au browser pour le prompt auto
                    className="bg-neutral-800/80 border border-white/10 p-3 rounded-xl"
                  >
                    <p className="text-[10px] text-yellow-500 font-black uppercase flex items-center gap-2 mb-1">
                       <PlusSquare size={14} /> Installation Manuelle
                    </p>
                    <p className="text-[11px] text-neutral-300 font-medium italic">
                      {isIOS ? 'Appuyez sur "Partager" puis "Sur l\'écran d\'accueil"' : 'Appuyez sur le Menu (3 points) puis "Installer l\'application"'}
                    </p>
                  </motion.div>
                )}
                
                <div className="flex items-center justify-between gap-4 mt-1">
                  <button
                    onClick={closeBanner}
                    className="text-neutral-500 hover:text-white font-black text-[10px] uppercase ml-auto py-1 transition-colors"
                  >
                    Plus tard
                  </button>
                </div>
              </div>
            </div>
            
            <button 
              onClick={closeBanner}
              className="text-neutral-600 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>
          
          {/* iOS Hint */}
          <div className="mt-3 pt-3 border-t border-white/5">
            <p className="text-[10px] text-neutral-500 flex items-center gap-2 italic">
              <Smartphone size={12} className="text-yellow-500/50" />
              Sur iPhone ? "Partager" &gt; "Sur l'écran d'accueil"
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
