
import React, { useState, useEffect, useCallback } from 'react';
import { X, ArrowRight, Zap, Star, ShieldCheck, Crown } from 'lucide-react';
import { supabase } from '../../../services/supabase.ts';

interface AnnouncementOverlayProps {
  profile: any;
  onNavigate?: (tab: string) => void;
}

export const AnnouncementOverlay: React.FC<AnnouncementOverlayProps> = ({ profile, onNavigate }) => {
  const [announcement, setAnnouncement] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  const checkAnnouncements = useCallback(async () => {
    if (!profile?.id) return;

    try {
      const { data: activeAnns, error } = await supabase
        .from('marketing_announcements')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error || !activeAnns || activeAnns.length === 0) return;

      const { data: readAnns } = await supabase
        .from('marketing_announcement_reads')
        .select('announcement_id')
        .eq('user_id', profile.id);

      const readIds = new Set((readAnns || []).map(r => r.announcement_id));

      const firstUnread = activeAnns.find(ann => {
        if (readIds.has(ann.id)) return false;
        if (ann.target_type === 'all') return true;
        if (ann.target_type === 'level') return ann.target_value === profile.user_level;
        if (ann.target_type === 'specific') return ann.target_value === profile.id;
        return false;
      });

      if (firstUnread) {
        setAnnouncement(firstUnread);
        setTimeout(() => setIsVisible(true), 2000); 
      }
    } catch (err) {
      console.error("Announcement check failed:", err);
    }
  }, [profile?.id, profile?.user_level]);

  useEffect(() => {
    checkAnnouncements();
  }, [checkAnnouncements]);

  const markAsRead = async () => {
    if (!announcement || !profile?.id) return;
    setIsVisible(false);
    try {
      await supabase.from('marketing_announcement_reads').upsert([{
        announcement_id: announcement.id,
        user_id: profile.id
      }], { onConflict: 'announcement_id,user_id' });
    } catch (e) {
        console.error("Failed to mark as read:", e);
    }
  };

  const handleAction = () => {
    if (onNavigate && announcement.target_tab) {
      onNavigate(announcement.target_tab);
    }
    markAsRead();
  };

  if (!isVisible || !announcement) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Overlay de fond sombre avec flou artistique */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-[12px] animate-fade-in" onClick={markAsRead}></div>
      
      {/* Lueur dorée en arrière-plan (Neuromarketing: Focus visuel) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-yellow-600/10 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="relative w-full max-w-[420px] animate-pop-in pointer-events-auto">
        {/* Bordure animée "Glow" */}
        <div className="absolute -inset-[1px] bg-gradient-to-b from-yellow-400/50 via-yellow-900/10 to-transparent rounded-[3rem] opacity-70"></div>
        
        <div className="relative bg-[#050505] border border-white/5 p-0 overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,1)] rounded-[3rem] flex flex-col">
           
           {/* Header visuel avec icône flottante */}
           <div className="h-28 bg-gradient-to-b from-yellow-600/10 to-transparent relative flex items-center justify-center">
              <button 
                onClick={markAsRead}
                className="absolute top-6 right-6 z-30 p-2 text-neutral-600 hover:text-white transition-all bg-white/5 rounded-full"
              >
                <X size={18} />
              </button>
              
              <div className="relative">
                <div className="absolute inset-0 bg-yellow-500 blur-2xl opacity-20 animate-pulse"></div>
                <div className="w-16 h-16 bg-[#050505] rounded-2xl border border-yellow-600/30 flex items-center justify-center text-yellow-500 shadow-2xl relative z-10">
                   <Zap size={28} fill="currentColor" />
                </div>
              </div>
           </div>

           <div className="p-8 pt-2 flex flex-col text-center">
              <div className="space-y-5">
                {/* Badge de statut */}
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-600/10 border border-yellow-600/20 rounded-full mx-auto">
                  <Star size={10} className="text-yellow-600 fill-current" />
                  <span className="text-[8px] font-black uppercase tracking-[0.3em] text-yellow-500">Alerte Stratégique MZ+</span>
                </div>

                {/* Titre avec Neuromarketing : Dégradé Gold liquide et Majuscules */}
                <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tighter leading-[0.9] italic" 
                    style={{ 
                      background: 'linear-gradient(135deg, #FFF9C4 0%, #FBC02D 40%, #F57F17 60%, #FFF9C4 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}>
                  {announcement.title}
                </h3>
                
                <div className="h-px w-10 bg-yellow-600/40 mx-auto rounded-full"></div>
                
                {/* Contenu textuel équilibré */}
                <p className="text-neutral-400 text-[14px] leading-relaxed font-medium px-4">
                  {announcement.content}
                </p>
              </div>

              {/* Action massive : Bouton Blanc Pur pour le contraste maximal */}
              <div className="mt-10 mb-2 px-2">
                <button 
                  onClick={handleAction}
                  className="group relative w-full py-5 bg-white text-black rounded-2xl font-black uppercase text-[11px] tracking-[0.3em] shadow-[0_20px_40px_rgba(255,255,255,0.1)] hover:scale-[1.03] active:scale-95 transition-all overflow-hidden"
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    {announcement.button_text || 'Saisir l\'Opportunité'} <ArrowRight size={18} strokeWidth={3} />
                  </span>
                  {/* Effet brillant au survol */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                </button>
                
                <p className="mt-6 text-[7px] font-black uppercase tracking-[0.4em] text-neutral-600 flex items-center justify-center gap-2">
                  <ShieldCheck size={12} /> Certification Système Élite
                </p>
              </div>
           </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pop-in {
          0% { opacity: 0; transform: translateY(30px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-pop-in {
          animation: pop-in 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />
    </div>
  );
};
