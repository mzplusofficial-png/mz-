
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Trophy, UserPlus, Zap, Crown } from 'lucide-react';

interface ActivityEvent {
  id: string;
  type: 'gain' | 'join' | 'premium' | 'coaching';
  user: string;
  detail: string;
  time: string;
}

const MOCK_EVENTS: ActivityEvent[] = [
  { id: '1', type: 'gain', user: 'Modou D.', detail: '+5,000 CFA Commission', time: 'À l\'instant' },
  { id: '2', type: 'join', user: 'Serge K.', detail: 'A rejoint le réseau', time: 'Il y a 2 min' },
  { id: '3', type: 'premium', user: 'Alice M.', detail: 'Passage au Niveau MZ+', time: 'Il y a 5 min' },
  { id: '4', type: 'gain', user: 'Ousmane S.', detail: '+12,500 CFA Commission', time: 'Il y a 8 min' },
  { id: '5', type: 'coaching', user: 'Fatou B.', detail: 'Session Élite validée', time: 'Il y a 12 min' },
  { id: '6', type: 'join', user: 'Jean-Paul T.', detail: 'Nouveau membre certifié', time: 'Il y a 15 min' },
  { id: '7', type: 'premium', user: 'Yasmine L.', detail: 'Nouveau membre MZ+ Elite', time: 'Il y a 18 min' },
];

export const LivePulse: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % MOCK_EVENTS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const event = MOCK_EVENTS[currentIndex];

  const getIcon = (type: string) => {
    switch (type) {
      case 'gain': return <Zap size={14} className="text-yellow-500" />;
      case 'join': return <UserPlus size={14} className="text-emerald-500" />;
      case 'premium': return <Crown size={14} className="text-purple-500" />;
      case 'coaching': return <Trophy size={14} className="text-blue-500" />;
      default: return <Sparkles size={14} className="text-yellow-500" />;
    }
  };

  const getBg = (type: string) => {
    switch (type) {
      case 'gain': return 'bg-yellow-500/10 border-yellow-500/20 shadow-yellow-500/5';
      case 'join': return 'bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/5';
      case 'premium': return 'bg-purple-500/10 border-purple-500/20 shadow-purple-500/5';
      case 'coaching': return 'bg-blue-500/10 border-blue-500/20 shadow-blue-500/5';
      default: return 'bg-white/5 border-white/10';
    }
  };

  return (
    <div className="h-10 overflow-hidden flex items-center justify-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={event.id}
          initial={{ y: 30, opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
          animate={{ y: 0, opacity: 1, scale: 1, filter: 'blur(0px)' }}
          exit={{ y: -30, opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
          transition={{ 
            duration: 0.8, 
            ease: [0.22, 1, 0.36, 1] // Custom quint ease out
          }}
          className={`flex items-center gap-3 px-6 py-2 rounded-full border ${getBg(event.type)} backdrop-blur-xl shadow-2xl transition-colors duration-500 group cursor-default`}
        >
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="flex items-center justify-center"
          >
            {getIcon(event.type)}
          </motion.div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-white uppercase tracking-wider">{event.user}</span>
            <span className="text-[10px] font-medium text-neutral-400 normal-case italic group-hover:text-neutral-300 transition-colors">{event.detail}</span>
          </div>
          <div className="h-3 w-px bg-white/10 mx-2"></div>
          <div className="flex items-center gap-1.5 overflow-hidden">
             <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
             <span className="text-[8px] font-black text-neutral-600 uppercase tracking-widest whitespace-nowrap">{event.time}</span>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
