
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Bell, X, Zap, Gift, Info, AlertTriangle, Coins, ArrowRight, Sparkles } from 'lucide-react';
import { supabase } from '../../../services/supabase.ts';

export const PushDisplay: React.FC<{ profile: any }> = ({ profile }) => {
  const [activePush, setActivePush] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<number | null>(null);
  const progressIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
    audioRef.current.volume = 0.3;

    if ("Notification" in window) {
      if (Notification.permission !== "granted" && Notification.permission !== "denied") {
        Notification.requestPermission();
      }
    }
    
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      if (progressIntervalRef.current) window.clearInterval(progressIntervalRef.current);
    };
  }, []);

  const closePush = useCallback(() => {
    setIsVisible(false);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    if (progressIntervalRef.current) window.clearInterval(progressIntervalRef.current);
  }, []);

  const triggerNativeNotification = async (title: string, body: string) => {
    if ("Notification" in window && Notification.permission === "granted") {
      try {
        // Version robuste utilisant le Service Worker pour garantir l'affichage même au premier plan
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.ready;
          registration.showNotification(title, {
            body: body,
            icon: '/firebase-logo.png',
            badge: '/firebase-logo.png',
            tag: 'mz-plus-push',
            renotify: true,
            vibrate: [100, 50, 100],
            data: { url: '/' }
          } as any);
        } else {
          // Fallback simple
          new Notification(title, { body, icon: '/firebase-logo.png' });
        }
      } catch (e) {
        console.error("Native Notification Error:", e);
      }
    }
  };

  const checkNewPush = useCallback(async () => {
    if (!profile?.id || isVisible) return;

    try {
      const { data: notifications } = await supabase
        .from('admin_push_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);

      if (!notifications || notifications.length === 0) return;

      const myPush = notifications.find(n => {
        if (n.target_type === 'all') return true;
        if (n.target_type === 'level') return n.target_value === profile.user_level;
        if (n.target_type === 'user') return n.target_value === profile.id;
        return false;
      });

      if (!myPush) return;

      const { data: receipt } = await supabase
        .from('admin_push_receipts')
        .select('id')
        .match({ notification_id: myPush.id, user_id: profile.id })
        .maybeSingle();

      if (!receipt) {
        setActivePush(myPush);
        setIsVisible(true);
        setProgress(100);
        
        triggerNativeNotification(myPush.title, myPush.body);
        
        if (audioRef.current) {
          audioRef.current.volume = 0.5; // Augmenter un peu le volume
          audioRef.current.play().catch(() => {});
        }
        
        if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
          window.navigator.vibrate([200, 100, 200]);
        }
        
        await supabase.from('admin_push_receipts').insert([{
          notification_id: myPush.id,
          user_id: profile.id
        }]);

        // Gérer la barre de progression
        const duration = 10000; // 10 secondes
        const step = 100;
        progressIntervalRef.current = window.setInterval(() => {
          setProgress(prev => Math.max(0, prev - (step / duration) * 100));
        }, step);

        timerRef.current = window.setTimeout(closePush, duration);
      }
    } catch (e) {
      console.error("Push Check Error:", e);
    }
  }, [profile?.id, profile?.user_level, isVisible, closePush]);

  useEffect(() => {
    const checkInterval = setInterval(checkNewPush, 15000);
    setTimeout(checkNewPush, 3000); 
    return () => clearInterval(checkInterval);
  }, [checkNewPush]);

  if (!activePush || !isVisible) return null;

  const getIcon = () => {
    switch (activePush.icon_type) {
      case 'money': return <Coins className="text-yellow-500" size={18} />;
      case 'gift': return <Gift className="text-emerald-500" size={18} />;
      case 'alert': return <AlertTriangle className="text-red-500" size={18} />;
      default: return <Sparkles className="text-blue-500" size={18} />;
    }
  };

  const getBorderColor = () => {
    switch (activePush.icon_type) {
      case 'money': return 'border-yellow-600/30';
      case 'gift': return 'border-emerald-600/30';
      case 'alert': return 'border-red-600/30';
      default: return 'border-white/10';
    }
  };

  return (
    <div className="fixed top-4 md:top-20 left-0 right-0 z-[20000] flex justify-center px-4 pointer-events-none">
      <div className="w-full max-w-[400px] animate-push-spring pointer-events-auto">
        <div className={`relative bg-neutral-900/90 backdrop-blur-3xl border ${getBorderColor()} rounded-[2rem] p-5 shadow-[0_30px_70px_rgba(0,0,0,0.8)] overflow-hidden group`}>
          
          <div className="flex items-start gap-4 relative z-10">
            <div className="w-12 h-12 bg-black border border-white/10 rounded-2xl flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-500">
               {getIcon()}
            </div>
            
            <div className="flex-1 min-w-0 pr-6 pt-0.5">
               <div className="flex items-center gap-2 mb-1">
                 <h4 className="text-[11px] font-black uppercase text-white tracking-tighter truncate">{activePush.title}</h4>
                 <div className="w-1 h-1 rounded-full bg-neutral-700"></div>
                 <span className="text-[7px] font-black text-neutral-500 uppercase tracking-widest">Maintenant</span>
               </div>
               <p className="text-[10px] md:text-[11px] text-neutral-400 font-medium leading-relaxed line-clamp-2 italic">
                 "{activePush.body}"
               </p>
            </div>

            <button 
              onClick={closePush}
              className="absolute -top-1 -right-1 p-2 text-neutral-600 hover:text-white transition-colors hover:bg-white/5 rounded-full"
            >
              <X size={16}/>
            </button>
          </div>

          {/* Barre de progression temporelle */}
          <div className="absolute bottom-0 left-0 h-1 bg-white/5 w-full">
            <div 
              className={`h-full transition-all duration-100 ease-linear ${
                activePush.icon_type === 'money' ? 'bg-yellow-600' : 
                activePush.icon_type === 'gift' ? 'bg-emerald-600' : 
                activePush.icon_type === 'alert' ? 'bg-red-600' : 'bg-blue-600'
              }`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes push-spring {
          0% { transform: translateY(-100%) scale(0.9); opacity: 0; }
          70% { transform: translateY(10%) scale(1.02); opacity: 1; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        .animate-push-spring {
          animation: push-spring 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}} />
    </div>
  );
};
