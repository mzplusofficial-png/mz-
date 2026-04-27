
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ArrowLeft, 
  Send, 
  MoreVertical, 
  ShieldCheck, 
  Loader2,
  CheckCheck,
  X,
  Trash2,
  AlertTriangle,
  MessageSquare
} from 'lucide-react';
import { supabase } from '../../../services/supabase.ts';
import { GoldText } from '../../UI.tsx';

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
  is_optimistic?: boolean;
}

export const ChatWindow: React.FC<{ chat: any; currentUserId: string; onBack: () => void; onDelete: (e: React.MouseEvent) => void }> = ({ chat, currentUserId, onBack, onDelete }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const prevChatIdRef = useRef<string>(chat.id);
  const isCreatingChat = useRef(false);

  const forceMarkAsRead = useCallback(async () => {
    if (!chat?.id || chat.id === 'new' || !currentUserId) return;
    try {
      const { error } = await supabase
        .from('mz_private_messages')
        .update({ is_read: true })
        .eq('chat_id', chat.id)
        .eq('is_read', false)
        .neq('sender_id', currentUserId);
        
      if (error) console.error("Mark read update failed", error);
    } catch (e) {
      console.error("Read update error", e);
    }
  }, [chat.id, currentUserId]);

  const fetchMessages = useCallback(async () => {
    if (chat.id === 'new') {
      setMessages([]);
      setLoading(false);
      return;
    }

    if (prevChatIdRef.current === 'new' && chat.id !== 'new') {
      prevChatIdRef.current = chat.id;
      return; 
    }

    setLoading(true);
    prevChatIdRef.current = chat.id;
    
    try {
      const { data, error } = await supabase
        .from('mz_private_messages')
        .select('*')
        .eq('chat_id', chat.id)
        .order('created_at', { ascending: true })
        .limit(100);
      
      if (error) throw error;
      setMessages(data || []);
      
      // Immédiatement après avoir récupéré, on marque tout comme lu
      if (data && data.length > 0) {
        forceMarkAsRead();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [chat.id, forceMarkAsRead]);

  useEffect(() => {
    fetchMessages();
    
    if (chat.id !== 'new') {
      const channel = supabase.channel(`chat_active_${chat.id}`)
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'mz_private_messages', 
          filter: `chat_id=eq.${chat.id}` 
        }, (payload) => {
          if (payload.eventType === 'INSERT') {
            const newMsg = payload.new as Message;
            setMessages(prev => {
              const exists = prev.some(m => m.id === newMsg.id || (m.is_optimistic && m.content === newMsg.content));
              if (exists) {
                return prev.map(m => (m.is_optimistic && m.content === newMsg.content) ? newMsg : m);
              }
              return [...prev, newMsg];
            });
            // Si on reçoit un message et qu'on est dedans, on marque lu direct
            if (newMsg.sender_id !== currentUserId) {
              forceMarkAsRead();
            }
          } else if (payload.eventType === 'UPDATE') {
            setMessages(prev => prev.map(m => m.id === payload.new.id ? { ...m, is_read: payload.new.is_read } : m));
          }
        })
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    }
  }, [chat.id, fetchMessages, currentUserId, forceMarkAsRead]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;

    const text = inputText.trim();
    setInputText('');
    
    const tempId = 'temp-' + Date.now();
    const optimisticMsg: Message = {
      id: tempId,
      sender_id: currentUserId,
      content: text,
      created_at: new Date().toISOString(),
      is_read: false,
      is_optimistic: true
    };
    
    setMessages(prev => [...prev, optimisticMsg]);
    setIsSending(true);

    try {
      let currentChatId = chat.id;

      if (currentChatId === 'new') {
        isCreatingChat.current = true;
        const sortedIds = [chat.user_a, chat.user_b].sort();
        const { data: newChat, error: chatError } = await supabase
          .from('mz_private_chats')
          .insert([{ 
            user_a: sortedIds[0], 
            user_b: sortedIds[1], 
            last_message_at: new Date().toISOString() 
          }])
          .select()
          .single();
        
        if (chatError) throw chatError;
        currentChatId = newChat.id;
      }

      const { data, error } = await supabase
        .from('mz_private_messages')
        .insert([{ chat_id: currentChatId, sender_id: currentUserId, content: text }])
        .select()
        .single();

      if (error) throw error;
      
      if (data) {
        setMessages(prev => prev.map(m => m.id === tempId ? data : m));
      }

      await supabase.from('mz_private_chats').update({ last_message_at: new Date().toISOString() }).eq('id', currentChatId);
      
    } catch (e: any) {
      console.error("Send error:", e);
      setMessages(prev => prev.filter(m => m.id !== tempId));
      alert("Échec de l'envoi.");
    } finally {
      setIsSending(false);
      isCreatingChat.current = false;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#080808]">
      <div className="p-4 border-b border-white/5 flex items-center justify-between z-10 bg-[#080808]/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="md:hidden p-2 text-neutral-500 hover:text-white transition-colors"><ArrowLeft size={20} /></button>
          <div className="w-10 h-10 rounded-xl bg-yellow-600/10 border border-yellow-600/20 flex items-center justify-center text-yellow-500 font-black uppercase shadow-lg">
            {chat.otherUser?.full_name.charAt(0)}
          </div>
          <div>
            <h4 className="text-[12px] font-black uppercase text-white leading-none tracking-tight">{chat.otherUser?.full_name}</h4>
            <span className="text-[8px] font-black uppercase text-emerald-500 mt-1.5 flex items-center gap-1">
              <ShieldCheck size={10} /> Discussion sécurisée
            </span>
          </div>
        </div>
        <div className="relative">
           <button onClick={() => setShowMenu(!showMenu)} className={`p-2 transition-colors ${showMenu ? 'text-yellow-500 bg-white/5 rounded-lg' : 'text-neutral-600 hover:text-white'}`}>
             <MoreVertical size={20} />
           </button>
           {showMenu && (
             <>
               <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)}></div>
               <div className="absolute top-full right-0 mt-2 w-52 bg-[#121212] border border-white/10 rounded-2xl shadow-2xl z-50 p-1.5 animate-slide-down">
                  <button onClick={(e) => { setShowMenu(false); onDelete(e); }} className="w-full flex items-center justify-between px-4 py-3 text-red-500 hover:bg-red-600/10 rounded-xl text-[10px] font-black uppercase transition-all">
                    <span>Supprimer la discussion</span>
                    <Trash2 size={14} />
                  </button>
               </div>
             </>
           )}
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar bg-black/40">
        {loading && messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-30 gap-3">
            <Loader2 className="animate-spin text-yellow-500" size={24} />
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-10 gap-4">
            <MessageSquare size={48} />
            <p className="text-[11px] font-black uppercase tracking-widest text-center">Envoyez un message<br/>pour démarrer la discussion</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMine = msg.sender_id === currentUserId;
            return (
              <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'} animate-fade-in ${msg.is_optimistic ? 'opacity-50 grayscale' : ''}`}>
                <div className={`max-w-[85%] flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                  <div className={`p-4 rounded-[1.6rem] text-[13px] leading-relaxed shadow-lg ${isMine ? 'bg-yellow-600 text-black rounded-tr-none border border-yellow-400' : 'bg-neutral-900 text-white border border-white/5 rounded-tl-none'}`}>
                    {msg.content}
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 opacity-30 px-1">
                     <span className="text-[7px] font-mono">{new Date(msg.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                     {isMine && !msg.is_optimistic && (
                       msg.is_read ? (
                         <div className="flex items-center gap-1 text-blue-500"><CheckCheck size={10} /><span className="text-[6px] font-black uppercase">Lu</span></div>
                       ) : <CheckCheck size={10} />
                     )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="p-4 bg-[#080808] border-t border-white/5 shadow-2xl relative">
        {chat.id === 'new' && (
           <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-full max-w-xs px-4 pointer-events-none">
              <div className="bg-yellow-600/10 border border-yellow-600/30 rounded-full py-1.5 px-3 flex items-center justify-center gap-2 backdrop-blur-md">
                 <AlertTriangle size={12} className="text-yellow-600" />
                 <span className="text-[8px] font-black uppercase text-yellow-600">Préparation de la discussion...</span>
              </div>
           </div>
        )}
        <form onSubmit={handleSend} className="flex gap-2 bg-neutral-900 border border-white/10 rounded-2xl p-1.5 focus-within:border-yellow-600/40 transition-all shadow-inner">
          <input 
            type="text" 
            placeholder="Écrivez votre message..." 
            className="flex-1 bg-transparent border-none outline-none px-4 py-3 text-[13px] text-white placeholder:text-neutral-600" 
            value={inputText} 
            onChange={e => setInputText(e.target.value)} 
          />
          <button type="submit" disabled={!inputText.trim() || isSending} className="p-3.5 bg-yellow-600 text-black rounded-xl hover:bg-yellow-500 disabled:opacity-20 active:scale-95 transition-all shadow-lg shrink-0 flex items-center justify-center">
            {isSending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </form>
      </div>
    </div>
  );
};
