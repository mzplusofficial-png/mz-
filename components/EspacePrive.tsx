import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  MessageSquare, 
  Send, 
  ShieldCheck, 
  Crown, 
  Loader2,
  Users,
  CheckCheck,
  TrendingUp,
  Sparkles,
  Info,
  Reply,
  X,
  ArrowDown,
  Star,
  Shield,
  User as UserIcon,
  Lock,
  AlertTriangle,
  Mail,
  UserCheck,
  Lightbulb,
  Heart,
  Trophy,
  Flame,
  LayoutGrid,
  Quote,
  Image as ImageIcon,
  Film,
  FileText,
  Play,
  Download,
  ExternalLink,
  Upload,
  File,
  Eye,
  CheckCircle2,
  ChevronDown,
  Zap,
  Radio,
  Rocket,
  ThumbsUp,
  Calendar,
  Clapperboard,
  Trash2
} from 'lucide-react';
import { supabase } from '../services/supabase.ts';
import { UserProfile } from '../types.ts';
import { GoldBorderCard, GoldText, EliteBadge } from './UI.tsx';

interface GroupMessage {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  reply_to_id?: string;
  sender?: {
    id: string;
    full_name: string;
    user_level: string;
    is_admin: boolean;
    email: string;
  };
  reply_to_msg?: {
    content: string;
    sender_name: string;
    sender_level?: string;
  };
}

interface EliteTip {
  id: string;
  admin_id: string; 
  content: string;
  created_at: string;
  reactions_count: number;
  heart_count: number;
  fire_count: number;
  trophy_count: number;
  zap_count: number;
  rocket_count: number;
  clap_count: number;
  sparkle_count: number;
  media_url?: string;
  media_type?: string; 
  sender?: {
    full_name: string;
    is_admin: boolean;
    user_level: string;
  };
}

const getNameColor = (name: string, isAdmin: boolean, isMzPlus: boolean) => {
  if (isAdmin) return 'text-yellow-500';
  if (isMzPlus) return 'text-purple-400 font-black';
  const colors = ['text-emerald-400', 'text-orange-400', 'text-purple-400', 'text-pink-400', 'text-cyan-400', 'text-indigo-400', 'text-rose-400', 'text-amber-400'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

const AmbassadorContactModal = ({ user, onClose, onContact }: { user: any; onClose: () => void; onContact: (u: any) => void }) => {
  if (!user) return null;
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-xl animate-fade-in" onClick={onClose}></div>
      <div className="relative w-full max-w-[320px] animate-slide-down">
         <div className="absolute -inset-1 bg-yellow-600/20 rounded-[2.5rem] blur-2xl opacity-50"></div>
         <GoldBorderCard className="relative bg-[#080808] border-white/10 p-0 overflow-hidden shadow-2xl rounded-[2.5rem]">
            <button onClick={onClose} className="absolute top-4 right-4 text-neutral-600 hover:text-white transition-colors z-20"><X size={20}/></button>
            <div className="h-24 bg-gradient-to-br from-yellow-600/10 to-transparent border-b border-white/5"></div>
            <div className="px-6 pb-8 -mt-12 flex flex-col items-center text-center">
               <div className="relative mb-4">
                  <div className="w-24 h-24 rounded-[2rem] bg-neutral-900 border-4 border-[#080808] flex items-center justify-center text-3xl font-black text-white shadow-2xl uppercase">{user.full_name.charAt(0)}</div>
                  <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 rounded-full border-4 border-[#080808] animate-pulse"></div>
               </div>
               <div className="space-y-1 mb-6">
                  <h3 className="text-lg font-black uppercase text-white tracking-tighter">{user.full_name}</h3>
                  <EliteBadge variant={user.user_level}>{user.user_level === 'niveau_mz_plus' ? 'Premium' : 'Standard'}</EliteBadge>
               </div>
               <div className="grid grid-cols-1 w-full gap-3">
                  <button onClick={() => onContact(user)} className="w-full py-4 bg-yellow-600 text-black rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 shadow-xl hover:bg-yellow-500 active:scale-95 transition-all"><Mail size={16} /> Envoyer un message privé</button>
                  <p className="text-[7px] text-neutral-600 font-black uppercase tracking-[0.2em] mt-2 italic">Discussion P2P sécurisée par MZ+ Protocol</p>
               </div>
            </div>
         </GoldBorderCard>
      </div>
    </div>
  );
};

export const EspacePrive: React.FC<{ profile: UserProfile | null; onContactAmbassador?: (user: any) => void }> = ({ profile, onContactAmbassador }) => {
  const [activeInternalTab, setActiveInternalTab] = useState<'salon' | 'conseils'>('salon');
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [tips, setTips] = useState<EliteTip[]>([]);
  const [inputText, setInputText] = useState('');
  const [tipInput, setTipInput] = useState('');
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadType, setUploadType] = useState<'image' | 'video' | 'doc' | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [replyTo, setReplyTo] = useState<GroupMessage | null>(null);
  const [isChatLocked, setIsChatLocked] = useState(false);
  const [selectedAmbassador, setSelectedAmbassador] = useState<any>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [swipingId, setSwipingId] = useState<string | null>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  
  const touchStartX = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const isAdmin = profile?.is_admin === true;

  const fetchMessages = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('group_messages').select('*, sender:users(id, full_name, user_level, is_admin, email)').order('created_at', { ascending: true }).limit(100);
      if (error) throw error;
      if (data) {
        const enriched = data.map(m => {
          if (m.reply_to_id) {
            const original = data.find(prev => prev.id === m.reply_to_id);
            if (original) return { ...m, reply_to_msg: { content: original.content, sender_name: original.sender?.full_name || "Ambassadeur", sender_level: original.sender?.user_level }};
          }
          return m;
        });
        setMessages(enriched as any);
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, []);

  const fetchTips = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('mz_elite_tips')
        .select('*, sender:users(full_name, is_admin, user_level)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setTips(data || []);
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => {
    fetchMessages();
    fetchTips();
    
    const msgChannel = supabase.channel('global_group_chat_v10')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'group_messages' }, async (payload) => {
        if (payload.eventType === 'INSERT') {
          const { data: userData } = await supabase.from('users').select('id, full_name, user_level, is_admin, email').eq('id', payload.new.sender_id).single();
          let replyData = undefined;
          if (payload.new.reply_to_id) {
            const { data: orig } = await supabase.from('group_messages').select('content, sender_id').eq('id', payload.new.reply_to_id).single();
            const { data: origUser } = await supabase.from('users').select('full_name, user_level').eq('id', orig?.sender_id).single();
            if (orig) replyData = { content: orig.content, sender_name: origUser?.full_name || "Ambassadeur", sender_level: origUser?.user_level };
          }
          setMessages(prev => [...prev, { ...payload.new as any, sender: userData, reply_to_msg: replyData }]);
        } else if (payload.eventType === 'DELETE') {
          setMessages(prev => prev.filter(m => m.id !== payload.old.id));
        }
      }).subscribe();

    const tipsChannel = supabase.channel('elite_tips_sync_v4')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mz_elite_tips' }, (payload) => {
        if (payload.eventType === 'DELETE') {
          setTips(prev => prev.filter(t => t.id !== payload.old.id));
        } else {
          fetchTips();
        }
      })
      .subscribe();

    return () => { 
      supabase.removeChannel(msgChannel); 
      supabase.removeChannel(tipsChannel);
    };
  }, [fetchMessages, fetchTips]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !profile?.id || isSending) return;
    if (isChatLocked && !isAdmin) return;
    setIsSending(true);
    const text = inputText.trim();
    const rId = replyTo?.id;
    setInputText('');
    setReplyTo(null);
    try {
      await supabase.from('group_messages').insert([{ sender_id: profile.id, content: text, reply_to_id: rId }]);
      scrollToBottom();
    } catch (e) { console.error(e); } finally { setIsSending(false); }
  };

  const handleDeleteMessage = async (msgId: string) => {
    if (!isAdmin) return;
    if (!confirm("Voulez-vous vraiment supprimer ce message du salon ?")) return;
    try {
      const { error } = await supabase.from('group_messages').delete().eq('id', msgId);
      if (error) throw error;
      setMessages(prev => prev.filter(m => m.id !== msgId));
    } catch (err) {
      alert("Erreur lors de la suppression du message.");
    }
  };

  const handleDeleteTip = async (tipId: string) => {
    if (!isAdmin) return;
    if (!confirm("Supprimer définitivement ce conseil stratégique ?")) return;
    try {
      const { error } = await supabase.from('mz_elite_tips').delete().eq('id', tipId);
      if (error) throw error;
      setTips(prev => prev.filter(t => t.id !== tipId));
    } catch (err) {
      alert("Erreur lors de la suppression du conseil.");
    }
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const distanceToBottom = target.scrollHeight - target.scrollTop - target.clientHeight;
    setShowScrollBottom(distanceToBottom > 300);
  };

  const handlePostTip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tipInput.trim() || !profile?.id || !isAdmin || isSending) return;
    
    setIsSending(true);
    let finalMediaUrl = '';

    try {
      // 1. Upload du média si présent
      if (selectedFile) {
        setIsUploading(true);
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `strategies/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('mz_assets')
          .upload(filePath, selectedFile, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('mz_assets')
          .getPublicUrl(filePath);
        
        finalMediaUrl = publicUrl;
      }

      // 2. Insertion en base
      const { error } = await supabase.from('mz_elite_tips').insert([{ 
        admin_id: profile.id, 
        content: tipInput.trim(),
        media_url: finalMediaUrl || null,
        media_type: uploadType || null,
        heart_count: 0,
        fire_count: 0,
        trophy_count: 0,
        zap_count: 0,
        rocket_count: 0,
        clap_count: 0,
        sparkle_count: 0,
        reactions_count: 0
      }]);

      if (error) throw error;

      // 3. Reset UI
      setTipInput('');
      setSelectedFile(null);
      setPreviewUrl(null);
      setUploadType(null);
      
      // Feedback succès
      fetchTips();
      if (window.navigator.vibrate) window.navigator.vibrate(20);
      
    } catch (e: any) { 
      console.error("Publication Error:", e);
      alert(`Erreur de publication : ${e.message || "Problème serveur"}. Vérifiez votre statut Admin.`);
    } finally { 
      setIsSending(false); 
      setIsUploading(false);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => setPreviewUrl(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const triggerUpload = (type: 'image' | 'video' | 'doc') => {
    setUploadType(type);
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleReactToTip = async (tipId: string, type: 'heart' | 'fire' | 'trophy' | 'zap' | 'rocket' | 'clap' | 'sparkle') => {
    // Optimistic UI
    setTips(prev => prev.map(t => {
      if (t.id === tipId) {
        const key = `${type}_count` as keyof EliteTip;
        return { 
          ...t, 
          [key]: (Number(t[key]) || 0) + 1,
          reactions_count: (t.reactions_count || 0) + 1 
        };
      }
      return t;
    }));

    try {
      const { error } = await supabase.rpc('mz_increment_tip_reaction', { 
        tip_id: tipId, 
        reaction_type: type 
      });
      if (error) throw error;
      if (window.navigator.vibrate) window.navigator.vibrate(10);
    } catch (e) { 
      console.error("Reaction Sync Error:", e);
    }
  };

  const renderTipMedia = (tip: EliteTip) => {
    if (!tip.media_url) return null;
    switch (tip.media_type) {
      case 'image':
        return (
          <div className="mb-6 rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl group-hover:border-purple-500/20 transition-all">
            <img src={tip.media_url} alt="Conseil" className="w-full h-auto object-cover max-h-[400px] group-hover:scale-105 transition-transform duration-700" />
          </div>
        );
      case 'video':
        return (
          <div className="mb-6 rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl aspect-video bg-neutral-950">
            <video src={tip.media_url} controls className="w-full h-full" />
          </div>
        );
      case 'doc':
        return (
          <div className="mb-6">
            <a href={tip.media_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-5 bg-white/5 border border-white/5 rounded-[1.5rem] hover:bg-purple-600/10 hover:border-purple-500/20 transition-all group/doc">
               <div className="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-900/20 group-hover/doc:scale-110 transition-transform">
                  <FileText size={24} />
               </div>
               <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-black uppercase text-white truncate tracking-widest">Ressource Motivation</p>
                  <p className="text-[9px] text-neutral-500 font-mono mt-1">Consulter le dossier stratégique</p>
               </div>
               <Download size={18} className="text-neutral-500 group-hover/doc:text-purple-500" />
            </a>
          </div>
        );
      default:
        return null;
    }
  };

  useEffect(() => {
    if (scrollRef.current && activeInternalTab === 'salon' && !showScrollBottom) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, activeInternalTab, showScrollBottom]);

  return (
    <div className="h-[calc(100dvh-140px)] md:h-[calc(100vh-160px)] flex flex-col animate-fade-in pb-1 max-w-6xl mx-auto overflow-hidden">
      
      {selectedAmbassador && <AmbassadorContactModal user={selectedAmbassador} onClose={() => setSelectedAmbassador(null)} onContact={(u) => { setSelectedAmbassador(null); if (onContactAmbassador) onContactAmbassador(u); }} />}

      {/* HEADER & INTERNAL TABS */}
      <div className="px-2 md:px-3 space-y-3 mb-2 md:mb-4 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 md:w-11 md:h-11 rounded-full flex items-center justify-center text-black shadow-lg border border-white/5 relative shrink-0 transition-colors ${activeInternalTab === 'salon' ? 'bg-yellow-600' : 'bg-purple-600'}`}>
              <Users size={14} className="md:hidden" />
              <Users size={18} className="hidden md:block" />
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#050505] animate-pulse"></div>
            </div>
            <div>
              <h2 className="text-[11px] md:text-sm font-black uppercase tracking-tight text-white leading-none">
                {activeInternalTab === 'salon' ? 'Communauté Privée' : 'Conseils & Motivation'}
              </h2>
              <p className="text-[7px] md:text-[8px] text-neutral-500 font-bold uppercase tracking-widest mt-0.5">
                {activeInternalTab === 'salon' ? 'Échanges en temps réel' : 'Lab de succès MZ+'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
              <ShieldCheck size={12} className={activeInternalTab === 'salon' ? 'text-yellow-600' : 'text-purple-500'} />
              <span className="text-[8px] font-black text-neutral-500 uppercase tracking-widest hidden sm:inline">Protocole Élite</span>
          </div>
        </div>

        <div className="flex bg-neutral-900/50 border border-white/5 p-1 rounded-xl">
           <button onClick={() => setActiveInternalTab('salon')} className={`flex-1 py-2 md:py-2.5 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeInternalTab === 'salon' ? 'bg-yellow-600 text-black shadow-lg' : 'text-neutral-500'}`}>
             <MessageSquare size={14} /> Communauté
           </button>
           <button onClick={() => setActiveInternalTab('conseils')} className={`flex-1 py-2 md:py-2.5 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 relative ${activeInternalTab === 'conseils' ? 'bg-purple-600 text-white shadow-lg' : 'text-neutral-500'}`}>
             <Zap size={14} /> Conseils & Motivation
             <div className="absolute top-0.5 right-1 w-1.5 h-1.5 bg-purple-400 rounded-full border border-black animate-pulse"></div>
           </button>
        </div>
      </div>

      <div className={`flex-1 flex flex-col overflow-hidden bg-[#080808] md:border md:rounded-[2.5rem] md:shadow-2xl relative transition-colors duration-500 ${activeInternalTab === 'salon' ? 'md:border-white/5' : 'md:border-purple-500/20'}`}>
        {activeInternalTab === 'salon' ? (
          /* --- VUE CHAT SALON --- */
          <>
            <div 
              ref={scrollRef} 
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto p-3 md:p-6 space-y-1.5 custom-scrollbar bg-black/20"
            >
              {loading ? (
                <div className="h-full flex flex-col items-center justify-center gap-4 opacity-50"><Loader2 className="animate-spin text-yellow-500" size={24} /><p className="text-[8px] font-black uppercase tracking-widest text-neutral-500">Connexion sécurisée...</p></div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-10 gap-4"><MessageSquare size={40} /><p className="text-[10px] font-black uppercase tracking-widest">Aucun message</p></div>
              ) : (
                messages.map((msg, idx) => {
                  const isMine = msg.sender_id === profile?.id;
                  const isSenderAdmin = msg.sender?.is_admin === true;
                  const isSenderMzPlus = msg.sender?.user_level === 'niveau_mz_plus';
                  const prevMsg = messages[idx - 1];
                  const isFirstInGroup = !prevMsg || prevMsg.sender_id !== msg.sender_id;
                  const isSwipingThis = swipingId === msg.id;
                  return (
                    <div key={msg.id} className={`flex flex-col relative ${isMine ? 'items-end' : 'items-start'} ${isFirstInGroup ? 'mt-4' : 'mt-0.5'}`}>
                      <div 
                        className={`max-w-[85%] md:max-w-[75%] transition-transform ${isSwipingThis ? '' : 'duration-300'} relative group/msg`} 
                        style={{ transform: isSwipingThis ? `translateX(${swipeOffset}px)` : 'translateX(0px)' }} 
                        onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; setSwipingId(msg.id); }} 
                        onTouchMove={(e) => { if(swipingId === msg.id) { const dx = e.touches[0].clientX - touchStartX.current; if(dx > 0) setSwipeOffset(Math.min(dx, 80)); } }} 
                        onTouchEnd={() => { if(swipeOffset >= 50) setReplyTo(msg); setSwipeOffset(0); setSwipingId(null); }}
                      >
                        {isSwipingThis && swipeOffset > 20 && (
                          <div className="absolute -left-8 top-1/2 -translate-y-1/2 text-yellow-500 animate-pulse">
                            <Reply size={16} />
                          </div>
                        )}

                        <div 
                          onClick={() => !isMine && setSelectedAmbassador(msg.sender)} 
                          className={`p-2.5 md:p-3.5 rounded-[1.2rem] text-[13px] md:text-sm shadow-xl border transition-all active:opacity-80 cursor-pointer group relative ${
                            isMine 
                              ? (isAdmin ? 'bg-yellow-600 text-black border-yellow-400 rounded-tr-none' : 'bg-neutral-800 text-white border-white/5 rounded-tr-none') 
                              : (isSenderAdmin ? 'bg-[#1a1400] border-yellow-600/40 text-yellow-500 rounded-tl-none shadow-[0_0_20px_rgba(202,138,4,0.1)]' : (isSenderMzPlus ? 'bg-gradient-to-br from-[#1a0033] to-[#0a0a0a] border-purple-500/60 text-purple-50 shadow-[0_0_30px_rgba(168,85,247,0.15)] rounded-tl-none' : 'bg-[#121212] border-white/5 rounded-tl-none'))
                          }`}
                        >
                          {/* Badge Statut Premium Violet Royal */}
                          {isSenderMzPlus && !isSenderAdmin && !isMine && (
                            <div className="absolute top-0 right-0 px-2.5 py-1 bg-gradient-to-r from-purple-700 to-purple-500 text-[6px] font-black uppercase tracking-widest text-white rounded-bl-xl flex items-center gap-1.5 shadow-lg z-10 border-b border-l border-purple-400/30">
                              <Star size={7} fill="white" /> Premium
                            </div>
                          )}

                          {isFirstInGroup && !isMine && (
                            <div className={`text-[9px] font-black uppercase tracking-tight mb-1.5 flex items-center gap-1.5 ${getNameColor(msg.sender?.full_name || "", isSenderAdmin, isSenderMzPlus)}`}>
                              {msg.sender?.full_name}
                              {isSenderAdmin && <Crown size={9} />}
                              {isSenderMzPlus && !isSenderAdmin && <div className="p-0.5 bg-purple-500/20 rounded-full border border-purple-500/40"><Star size={8} fill="currentColor" className="text-purple-400" /></div>}
                            </div>
                          )}

                          {/* Bouton de suppression Admin Salon */}
                          {isAdmin && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleDeleteMessage(msg.id); }}
                              className="absolute -top-2 -right-2 p-1.5 bg-red-600 text-white rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110 z-20"
                              title="Supprimer ce message"
                            >
                              <Trash2 size={10} />
                            </button>
                          )}
                          
                          {msg.reply_to_msg && (
                            <div className={`mb-2 p-1.5 rounded-lg text-[9px] opacity-70 border-l-2 bg-black/30 ${msg.reply_to_msg.sender_level === 'niveau_mz_plus' ? 'border-purple-500' : 'border-yellow-600'}`}>
                              <p className="font-black uppercase text-[7px] mb-0.5">{msg.reply_to_msg.sender_name}</p>
                              <p className="line-clamp-1 italic">{msg.reply_to_msg.content}</p>
                            </div>
                          )}
                          
                          <p className={`leading-relaxed break-words ${isSenderMzPlus && !isSenderAdmin && !isMine ? 'font-bold' : 'font-medium'}`}>{msg.content}</p>
                        </div>
                        
                        <div className={`flex items-center gap-1.5 mt-1 px-1 opacity-20 group-hover/msg:opacity-60 transition-opacity ${isMine ? 'justify-end' : 'justify-start'}`}>
                          <span className="text-[7px] font-mono">{new Date(msg.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {showScrollBottom && (
              <button 
                onClick={scrollToBottom}
                className="absolute bottom-20 right-4 p-3 bg-yellow-600 text-black rounded-full shadow-2xl hover:bg-yellow-500 transition-all active:scale-90 z-20 animate-bounce border-2 border-black"
              >
                <ChevronDown size={20} strokeWidth={3} />
              </button>
            )}

            <div className="p-2 md:p-4 bg-[#080808] border-t border-white/5 relative shrink-0">
              {replyTo && (
                <div className="mb-2 p-2 bg-neutral-900 border-l-4 border-yellow-600 rounded-xl flex items-center justify-between gap-3 animate-slide-down">
                  <div className="flex-1 min-w-0">
                    <p className="text-[8px] font-black uppercase text-yellow-600 tracking-tight">Répondre à {replyTo.sender?.full_name}</p>
                    <p className="text-[10px] text-neutral-500 truncate italic">{replyTo.content}</p>
                  </div>
                  <button onClick={() => setReplyTo(null)} className="p-1.5 text-neutral-500 hover:text-white"><X size={16}/></button>
                </div>
              )}
              
              <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
                <div className="flex-1 relative group">
                  <input 
                    type="text" 
                    disabled={(isChatLocked && !isAdmin) || isSending} 
                    placeholder={isChatLocked && !isAdmin ? "Discussion suspendue..." : "Écrire un message..."} 
                    className="w-full bg-neutral-900/80 border border-white/10 rounded-2xl py-3 px-4 text-sm text-white outline-none focus:border-yellow-600/50 transition-all shadow-inner" 
                    value={inputText} 
                    onChange={e => setInputText(e.target.value)} 
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={!inputText.trim() || isSending} 
                  className={`p-3 rounded-xl transition-all active:scale-90 shrink-0 shadow-lg ${isAdmin ? 'bg-yellow-600 text-black' : 'bg-neutral-800 text-white'} disabled:opacity-20`}
                >
                  {isSending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
              </form>
            </div>
          </>
        ) : (
          /* --- VUE CONSEILS & MOTIVATION --- */
          <div className="flex-1 flex flex-col overflow-hidden bg-gradient-to-b from-[#0e001a] to-[#080808]">
             <div className="p-4 bg-purple-600/5 border-b border-purple-500/20 flex items-center justify-between shrink-0 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-600/20 rounded-lg text-purple-400">
                    <Zap size={16} />
                  </div>
                  <h4 className="text-[11px] font-black uppercase text-white tracking-[0.2em] italic">Lab de Motivation Élite</h4>
                </div>
                <div className="flex items-center gap-2">
                   <div className="text-[7px] font-black uppercase text-purple-400 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-950/40">Expert Coaching Active</div>
                </div>
             </div>

             <div className="flex-1 overflow-y-auto p-4 md:p-10 space-y-10 custom-scrollbar">
                {tips.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-20 gap-6">
                    <div className="w-24 h-24 rounded-[2.5rem] bg-purple-900/20 flex items-center justify-center border border-purple-500/20 shadow-2xl">
                       <Rocket size={48} className="text-purple-500 animate-pulse" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-purple-300">Synchronisation des stratégies...</p>
                  </div>
                ) : (
                  tips.map(tip => {
                    const isTipAdmin = tip.sender?.is_admin === true;
                    return (
                      <div key={tip.id} className="animate-fade-in group">
                         <GoldBorderCard className={`p-6 md:p-10 bg-[#0a0a0a]/80 backdrop-blur-xl border ${isTipAdmin ? 'border-purple-500/20 shadow-purple-900/10' : 'border-white/5'} rounded-[2.5rem] transition-all hover:scale-[1.01] hover:border-purple-500/40 group relative`}>
                            
                            {/* Bouton de suppression Admin Lab */}
                            {isAdmin && (
                              <button 
                                onClick={() => handleDeleteTip(tip.id)}
                                className="absolute top-6 right-6 p-2.5 bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white rounded-xl transition-all shadow-xl z-20 opacity-0 group-hover:opacity-100 border border-red-500/20"
                                title="Supprimer ce conseil"
                              >
                                <Trash2 size={18} />
                              </button>
                            )}

                            <div className="flex items-center justify-between mb-8">
                               <div className="flex items-center gap-4">
                                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-2xl transition-all group-hover:rotate-6 ${isTipAdmin ? 'bg-gradient-to-br from-purple-600 to-purple-400' : 'bg-neutral-800'}`}>
                                    {isTipAdmin ? <Crown size={22} /> : tip.sender?.full_name?.charAt(0)}
                                  </div>
                                  <div className="min-w-0">
                                     <p className={`text-[10px] md:text-xs font-black uppercase truncate tracking-tighter ${getNameColor(tip.sender?.full_name || "", isTipAdmin, tip.sender?.user_level === 'niveau_mz_plus')}`}>{tip.sender?.full_name}</p>
                                     <p className="text-[8px] text-neutral-600 font-mono mt-1 uppercase tracking-widest flex items-center gap-2">
                                       <Calendar size={10} /> {new Date(tip.created_at).toLocaleDateString('fr-FR', {day:'numeric', month:'short'})} ● MOTIVATION ELITE
                                     </p>
                                  </div>
                               </div>
                               {isTipAdmin && !isAdmin && (
                                 <div className="px-3 py-1 bg-purple-600/10 border border-purple-500/20 rounded-full">
                                    <span className="text-[7px] font-black text-purple-500 uppercase tracking-widest">Coach Certifié</span>
                                 </div>
                               )}
                            </div>
                            
                            {renderTipMedia(tip)}

                            <div className="relative mb-8">
                               <div className="absolute -left-6 top-0 opacity-10">
                                 <Quote size={40} className="text-purple-500" />
                               </div>
                               <p className="text-sm md:text-lg text-neutral-200 leading-relaxed font-semibold italic border-l-4 border-purple-500/30 pl-6 whitespace-pre-wrap">
                                 {tip.content}
                               </p>
                            </div>

                            <div className="flex flex-col gap-6 pt-6 border-t border-white/5">
                               {/* BARRE DE RÉACTIONS */}
                               <div className="flex flex-wrap items-center gap-2 md:gap-3">
                                  <ReactionButton 
                                    icon={<Heart size={14} className="fill-current" />} 
                                    count={tip.heart_count || 0} 
                                    label="Inspirant" 
                                    color="text-rose-500" 
                                    onClick={() => handleReactToTip(tip.id, 'heart')} 
                                  />
                                  <ReactionButton 
                                    icon={<Flame size={14} className="fill-current" />} 
                                    count={tip.fire_count || 0} 
                                    label="Explosif" 
                                    color="text-orange-500" 
                                    onClick={() => handleReactToTip(tip.id, 'fire')} 
                                  />
                                  <ReactionButton 
                                    icon={<Rocket size={14} className="fill-current" />} 
                                    count={tip.rocket_count || 0} 
                                    label="Propulsion" 
                                    color="text-purple-500" 
                                    onClick={() => handleReactToTip(tip.id, 'rocket')} 
                                  />
                                  <ReactionButton 
                                    icon={<Sparkles size={14} className="fill-current" />} 
                                    count={tip.sparkle_count || 0} 
                                    label="Prestige" 
                                    color="text-yellow-400" 
                                    onClick={() => handleReactToTip(tip.id, 'sparkle')} 
                                  />
                                  <ReactionButton 
                                    icon={<ThumbsUp size={14} className="fill-current" />} 
                                    count={tip.clap_count || 0} 
                                    label="Génie" 
                                    color="text-emerald-500" 
                                    onClick={() => handleReactToTip(tip.id, 'clap')} 
                                  />
                                  <ReactionButton 
                                    icon={<Trophy size={14} className="fill-current" />} 
                                    count={tip.trophy_count || 0} 
                                    label="Cash" 
                                    color="text-yellow-600" 
                                    onClick={() => handleReactToTip(tip.id, 'trophy')} 
                                  />
                               </div>
                               
                               <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-xl">
                                     <TrendingUp size={14} className="text-emerald-500" />
                                     <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">{tip.reactions_count || 0} Vibes</span>
                                  </div>
                                  <div className="text-[7px] font-black text-neutral-700 uppercase tracking-[0.3em]">Protocole MZ+ Lab</div>
                               </div>
                            </div>
                         </GoldBorderCard>
                      </div>
                    );
                  })
                )}
             </div>

             {isAdmin && (
               <div className="p-4 bg-[#080808] border-t border-purple-500/20 space-y-4 shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
                  <input type="file" ref={fileInputRef} className="hidden" onChange={onFileChange} accept={uploadType === 'image' ? 'image/*' : uploadType === 'video' ? 'video/*' : '*/*'} />
                  
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                     <button onClick={() => triggerUpload('image')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase shrink-0 transition-all ${uploadType === 'image' ? 'bg-purple-600 text-white shadow-lg' : 'bg-neutral-900 text-neutral-500 border border-white/5 hover:border-purple-500/30'}`}><ImageIcon size={14}/> IMAGE</button>
                     <button onClick={() => triggerUpload('video')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase shrink-0 transition-all ${uploadType === 'video' ? 'bg-purple-600 text-white shadow-lg' : 'bg-neutral-900 text-neutral-500 border border-white/5 hover:border-purple-500/30'}`}><Film size={14}/> VIDÉO</button>
                     <button onClick={() => triggerUpload('doc')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase shrink-0 transition-all ${uploadType === 'doc' ? 'bg-purple-600 text-white shadow-lg' : 'bg-neutral-900 text-neutral-500 border border-white/5 hover:border-purple-500/30'}`}><FileText size={14}/> DOCUMENT</button>
                     {selectedFile && <button onClick={() => { setSelectedFile(null); setPreviewUrl(null); setUploadType(null); }} className="text-red-500 p-2 hover:bg-red-500/10 rounded-full transition-all"><X size={18}/></button>}
                  </div>

                  {selectedFile && (
                    <div className="p-3 bg-purple-600/10 border border-purple-600/20 rounded-2xl flex items-center justify-between animate-fade-in">
                      <div className="flex items-center gap-3 min-w-0">
                         <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-white shrink-0">
                           {uploadType === 'image' ? <ImageIcon size={14}/> : <File size={14}/>}
                         </div>
                         <span className="text-[9px] font-black text-purple-400 truncate uppercase">{selectedFile.name}</span>
                      </div>
                      <CheckCircle2 size={16} className="text-purple-500 shrink-0" />
                    </div>
                  )}

                  <form onSubmit={handlePostTip} className="flex gap-3 items-end">
                     <textarea rows={2} placeholder="Partager une dose de motivation..." className="flex-1 bg-neutral-900/50 border border-white/10 rounded-2xl py-4 px-5 text-sm text-white outline-none focus:border-purple-500/50 resize-none shadow-inner transition-all placeholder:text-neutral-600" value={tipInput} onChange={e => setTipInput(e.target.value)} />
                     <button type="submit" disabled={!tipInput.trim() || isSending || isUploading} className="p-4 bg-purple-600 text-white rounded-2xl hover:bg-purple-500 active:scale-95 shrink-0 shadow-2xl shadow-purple-900/20 transition-all disabled:opacity-20">
                       {(isSending || isUploading) ? <Loader2 size={24} className="animate-spin" /> : <Send size={24} />}
                     </button>
                  </form>
               </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
};

const ReactionButton = ({ icon, count, label, color, onClick }: { icon: React.ReactNode, count: number, label: string, color: string, onClick: () => void }) => {
  const [clicked, setClicked] = useState(false);
  const handleClick = () => { setClicked(true); onClick(); setTimeout(() => setClicked(false), 300); };
  return (
    <button onClick={handleClick} className={`flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-[1.2rem] transition-all active:scale-90 group/btn border border-transparent hover:border-white/10 shadow-sm ${clicked ? 'ring-2 ring-purple-500/50 scale-110' : ''}`}>
       <div className={`${color} group-hover/btn:scale-125 transition-transform duration-300 ${clicked ? 'animate-bounce' : ''}`}>{icon}</div>
       <div className="flex flex-col items-start leading-none">
          <span className="text-[10px] font-black text-white font-mono">{count}</span>
          <span className="text-[6px] font-black uppercase text-neutral-600 tracking-widest">{label}</span>
       </div>
    </button>
  );
};