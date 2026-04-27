
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  Search, 
  Plus, 
  Loader2, 
  Trash2,
  Mail,
  MessageSquare,
  ChevronRight,
  Star
} from 'lucide-react';
import { supabase } from '../../../services/supabase.ts';
import { UserProfile } from '../../../types.ts';
import { GoldText } from '../../UI.tsx';
import { ChatWindow } from './ChatWindow.tsx';
import { UserSearchModal } from './UserSearchModal.tsx';

interface Chat {
  id: string;
  user_a: string;
  user_b: string;
  last_message_at: string;
  otherUser?: {
    id: string;
    full_name: string;
    user_level: string;
  };
  unreadCount: number;
}

export const PrivateMessagingMain: React.FC<{ profile: UserProfile | null; initialTargetUser?: any; onClearTarget?: () => void }> = ({ profile, initialTargetUser, onClearTarget }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [chatSearchTerm, setChatSearchTerm] = useState('');
  
  const activeChatIdRef = useRef<string | null>(null);

  const fetchChats = useCallback(async (isSilent = false, retryCount = 0) => {
    if (!profile?.id) return;
    if (!isSilent) setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('mz_private_chats')
        .select(`
          *,
          user_a_data:user_a(id, full_name, user_level),
          user_b_data:user_b(id, full_name, user_level)
        `)
        .or(`user_a.eq.${profile.id},user_b.eq.${profile.id}`)
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      const chatsWithUnread = await Promise.all((data || []).map(async (chat: any) => {
        const isUserA = chat.user_a === profile.id;
        const otherUser = isUserA ? chat.user_b_data : chat.user_a_data;
        
        const { count } = await supabase
          .from('mz_private_messages')
          .select('*', { count: 'exact', head: true })
          .match({ chat_id: chat.id, is_read: false })
          .neq('sender_id', profile.id);

        return { ...chat, otherUser, unreadCount: count || 0 };
      }));

      setChats(chatsWithUnread);
      
      if (activeChatIdRef.current) {
        const updated = chatsWithUnread.find(c => c.id === activeChatIdRef.current);
        if (updated) {
           setActiveChat(prev => {
             if (prev?.last_message_at !== updated.last_message_at || prev?.unreadCount !== updated.unreadCount) {
               return updated;
             }
             return prev;
           });
        }
      }
    } catch (e: any) {
      console.error("Messaging Fetch Error:", e);
      if (retryCount < 2 && (e.message?.includes('fetch') || e.name === 'TypeError')) {
        setTimeout(() => fetchChats(isSilent, retryCount + 1), 1500);
        return;
      }
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [profile?.id]);

  const handleStartConversationWithUser = async (user: any) => {
    if (!profile?.id || !user?.id) return;
    if (user.id === profile.id) return;

    const sortedIds = [profile.id, user.id].sort();
    
    const { data: existingChat } = await supabase
      .from('mz_private_chats')
      .select('*')
      .eq('user_a', sortedIds[0])
      .eq('user_b', sortedIds[1])
      .maybeSingle();

    if (existingChat) {
      handleSelectChat({ ...existingChat, otherUser: user, unreadCount: 0 });
    } else {
      handleSelectChat({ 
        id: 'new', 
        user_a: sortedIds[0], 
        user_b: sortedIds[1], 
        last_message_at: '', 
        otherUser: user, 
        unreadCount: 0 
      } as any);
    }
  };

  const deleteChatDirect = async (e: React.MouseEvent, chatId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (chatId === 'new') { setActiveChat(null); activeChatIdRef.current = null; return; }
    if (!confirm("Voulez-vous supprimer cette discussion ?")) return;
    setChats(prev => prev.filter(c => c.id !== chatId));
    if (activeChatIdRef.current === chatId) { setActiveChat(null); activeChatIdRef.current = null; }
    try {
      await supabase.from('mz_private_messages').delete().eq('chat_id', chatId);
      await supabase.from('mz_private_chats').delete().eq('id', chatId);
    } catch (err) { fetchChats(true); }
  };

  const handleSelectChat = (chat: Chat) => {
    activeChatIdRef.current = chat.id;
    setChats(prev => prev.map(c => c.id === chat.id ? { ...c, unreadCount: 0 } : c));
    setActiveChat(chat);
  };

  useEffect(() => {
    fetchChats();
    const channel = supabase.channel('chat-list-sync-v2')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mz_private_messages' }, () => fetchChats(true))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mz_private_chats' }, () => fetchChats(true))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchChats, profile?.id]);

  useEffect(() => {
    if (initialTargetUser && profile?.id) {
      handleStartConversationWithUser(initialTargetUser);
      if (onClearTarget) onClearTarget();
    }
  }, [initialTargetUser, profile?.id]);

  const filteredChats = useMemo(() => {
    return chats.filter(c => c.otherUser?.full_name.toLowerCase().includes(chatSearchTerm.toLowerCase()));
  }, [chats, chatSearchTerm]);

  if (loading && chats.length === 0) return <div className="h-[60vh] flex flex-col items-center justify-center opacity-40"><Loader2 className="animate-spin text-yellow-500" size={32} /></div>;

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col animate-fade-in max-w-6xl mx-auto">
      {showSearch && <UserSearchModal onClose={() => setShowSearch(false)} onSelect={(u) => { setShowSearch(false); handleStartConversationWithUser(u); }} currentUserId={profile?.id} />}
      
      <div className="flex items-center justify-between mb-6 px-4 shrink-0">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-yellow-600/10 rounded-2xl text-yellow-600 border border-yellow-600/20 shadow-xl"><Mail size={24} /></div>
          <div><h2 className="text-xl font-black uppercase tracking-tight">Messagerie <GoldText>Privée</GoldText></h2></div>
        </div>
        <button onClick={() => setShowSearch(true)} className="flex items-center gap-2 px-5 py-2.5 bg-white text-black rounded-xl font-black uppercase text-[10px] tracking-widest transition-all active:scale-95 shadow-lg"><Plus size={14} /> Nouveau message</button>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* SIDEBAR : NETTE ET ÉPURÉE */}
        <div className={`flex-1 md:flex-[0.4] flex flex-col bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] overflow-hidden ${activeChat ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-6 border-b border-white/5 bg-white/[0.01]">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600 group-focus-within:text-yellow-600 transition-colors" size={16} />
              <input placeholder="Rechercher une discussion..." className="w-full bg-black border border-white/10 rounded-xl py-3.5 pl-12 text-xs text-white outline-none focus:border-yellow-600/40" value={chatSearchTerm} onChange={e => setChatSearchTerm(e.target.value)} />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="px-6 py-4">
               <p className="text-[9px] font-black uppercase text-neutral-600 tracking-[0.2em]">Discussions Actives</p>
            </div>

            {filteredChats.length === 0 ? (
               <div className="py-20 text-center opacity-20 flex flex-col items-center gap-4">
                 <MessageSquare size={32} />
                 <p className="text-[9px] font-black uppercase tracking-widest">Aucune discussion en cours</p>
                 <button onClick={() => setShowSearch(true)} className="text-yellow-600 text-[8px] font-black uppercase border-b border-yellow-600/30 pb-0.5">Démarrer un échange</button>
               </div>
            ) : (
              filteredChats.map(chat => (
                <div key={chat.id} className="relative group/item">
                  <button onClick={() => handleSelectChat(chat)} className={`w-full p-6 flex items-center gap-4 transition-all hover:bg-white/[0.02] text-left border-l-4 ${activeChat?.id === chat.id ? 'bg-yellow-600/[0.05] border-yellow-600' : 'border-transparent'}`}>
                    <div className="relative">
                      <div className={`w-12 h-12 rounded-2xl bg-neutral-900 border flex items-center justify-center text-white font-black uppercase shadow-xl ${chat.unreadCount > 0 ? 'border-yellow-600 ring-2 ring-yellow-600/20' : 'border-white/5'}`}>{chat.otherUser?.full_name.charAt(0)}</div>
                      {chat.unreadCount > 0 && <div className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-red-600 text-white text-[8px] font-black rounded-full border-2 border-[#0a0a0a] animate-bounce">{chat.unreadCount}</div>}
                    </div>
                    <div className="flex-1 min-w-0 pr-8">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h4 className={`text-[13px] font-black uppercase truncate ${chat.unreadCount > 0 ? 'text-white' : 'text-neutral-400'}`}>{chat.otherUser?.full_name}</h4>
                        {chat.otherUser?.user_level === 'niveau_mz_plus' && <Star size={10} className="text-purple-500 fill-current" />}
                      </div>
                      <p className={`text-[10px] truncate italic ${chat.unreadCount > 0 ? 'text-yellow-500 font-bold' : 'text-neutral-600'}`}>{chat.unreadCount > 0 ? 'Nouveau message reçu' : 'Voir la discussion'}</p>
                    </div>
                  </button>
                  <button onClick={(e) => deleteChatDirect(e, chat.id)} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-neutral-800 hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition-all z-20"><Trash2 size={16}/></button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* CONTENU DE LA DISCUSSION */}
        <div className={`flex-1 md:flex-[0.6] flex flex-col bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl ${activeChat ? 'flex' : 'hidden md:flex'}`}>
          {activeChat ? (
            <ChatWindow 
              key={activeChat.id === 'new' ? `new-${activeChat.otherUser?.id}` : activeChat.id}
              chat={activeChat} 
              currentUserId={profile?.id || ''} 
              onBack={() => { setActiveChat(null); activeChatIdRef.current = null; }} 
              onDelete={(e) => deleteChatDirect(e, activeChat.id)} 
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center opacity-20">
               <div className="w-20 h-20 bg-neutral-900 rounded-[2.5rem] flex items-center justify-center mb-6 shadow-inner border border-white/5">
                  <Mail size={40} />
               </div>
               <h3 className="text-sm font-black uppercase tracking-widest text-white mb-2">Centre de Messagerie</h3>
               <p className="text-[10px] font-bold uppercase tracking-[0.2em] max-w-xs mx-auto leading-relaxed">Sélectionnez une discussion active ou utilisez le bouton pour contacter un Mentor.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
