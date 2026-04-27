import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Crown, Diamond, Sparkles, X } from 'lucide-react';
import { supabase } from '../services/supabase';
import { UserProfile, PremiumWelcomePopup } from '../types';

interface PremiumPopupProps {
  user: UserProfile | null;
}

export const PremiumPopup: React.FC<PremiumPopupProps> = ({ user }) => {
  const [popup, setPopup] = useState<PremiumWelcomePopup | null>(null);
  const [config, setConfig] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    
    // Fetch config first
    const { data: configData } = await supabase
      .from('mz_premium_welcome_config')
      .select('*')
      .eq('id', 'premium-welcome-global')
      .maybeSingle();

    if (configData && !configData.is_active) return;
    setConfig(configData);

    const { data, error } = await supabase
      .from('premium_welcome_popups')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_read', false)
      .maybeSingle();

    if (data) {
      setPopup(data);
      // Petit délai pour l'effet d'entrée
      setTimeout(() => setIsVisible(true), 1000);
    }
  };

  const handleClose = async () => {
    if (!popup) return;
    
    setIsVisible(false);
    
    // Marquer comme lu dans la DB
    const { error } = await supabase
      .from('premium_welcome_popups')
      .update({ is_read: true })
      .eq('id', popup.id);

    if (error) {
      console.error('Error marking premium popup as read:', error);
    }
  };

  if (!popup || !user) return null;

  const firstName = user.full_name.split(' ')[0];

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg overflow-hidden bg-[#050505] border border-purple-500/30 rounded-3xl shadow-[0_0_50px_rgba(168,85,247,0.15)]"
          >
            {/* Background Glows */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-purple-600/30 blur-[100px] rounded-full" />
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[60px] rounded-full" />

            {/* Content */}
            <div className="relative p-8 md:p-12 text-center">
              {/* Close Button */}
              <button 
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>

              {/* Icon Header */}
              <motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex justify-center mb-6"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full animate-pulse" />
                  <div className="relative p-4 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg shadow-purple-500/20">
                    <Crown className="w-10 h-10 text-white" />
                  </div>
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-2 -right-2"
                  >
                    <Sparkles className="w-6 h-6 text-purple-400" />
                  </motion.div>
                </div>
              </motion.div>

              {/* Badge */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-1 mb-6 bg-purple-900/30 border border-purple-500/30 rounded-full"
              >
                <Diamond size={14} className="text-purple-400" />
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-purple-300">Membre Privilégié</span>
              </motion.div>

              {/* Title */}
              <motion.h2 
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-3xl md:text-5xl font-black mb-6 bg-gradient-to-b from-white via-purple-200 to-purple-500 bg-clip-text text-transparent leading-tight tracking-tight uppercase italic"
              >
                🎉 Félicitations {firstName} !
              </motion.h2>

              {/* Body Text */}
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="space-y-6 text-gray-300 text-lg leading-relaxed"
              >
                <p className="text-xl font-bold italic opacity-90 text-white">
                  Tu viens officiellement d’accéder à MZ+ Premium. 👑
                </p>
              </motion.div>

              {/* Video Section */}
              {(config?.video_url || config?.youtube_id) && (
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="mt-8 relative aspect-video rounded-2xl overflow-hidden border border-purple-500/20 bg-black shadow-2xl"
                >
                  {config.video_url ? (
                    <video 
                      src={config.video_url} 
                      controls 
                      className="w-full h-full object-cover"
                      poster="https://picsum.photos/seed/premium/800/450"
                    />
                  ) : (
                    <iframe
                      src={`https://www.youtube.com/embed/${config.youtube_id}?autoplay=0&rel=0`}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  )}
                </motion.div>
              )}

              {/* Action Button */}
              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.9 }}
                whileHover={{ scale: 1.02, translateY: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleClose}
                className="group relative mt-10 w-full py-5 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 bg-[length:200%_auto] hover:bg-right transition-all duration-500 text-white font-black rounded-2xl shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:shadow-[0_0_40px_rgba(168,85,247,0.6)] uppercase tracking-[0.25em] text-[10px] overflow-hidden animate-glow-pulse"
              >
                {/* Shimmer Effect */}
                <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.2),transparent)] -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
                
                <span className="relative z-10 flex items-center justify-center gap-3">
                  <Sparkles size={16} className="text-purple-200 animate-pulse" />
                  Découvrir mon espace premium
                  <Sparkles size={16} className="text-purple-200 animate-pulse" />
                </span>
              </motion.button>

              <style dangerouslySetInnerHTML={{ __html: `
                @keyframes shimmer {
                  100% { transform: translateX(100%); }
                }
                @keyframes glow-pulse {
                  0%, 100% { box-shadow: 0 0 30px rgba(168,85,247,0.4); }
                  50% { box-shadow: 0 0 50px rgba(168,85,247,0.7); }
                }
                .animate-glow-pulse {
                  animation: glow-pulse 2s ease-in-out infinite;
                }
              `}} />
            </div>

            {/* Decorative Border Glow */}
            <div className="absolute inset-0 pointer-events-none border border-purple-500/10 rounded-3xl" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
