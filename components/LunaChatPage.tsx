import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Sparkles, Zap, Crown, Video, Coins, Rocket, ShieldCheck, MessageSquare, ChevronRight, Loader2, Trash2 } from 'lucide-react';
import { UserProfile } from '../types.ts';
import { GoldText, EliteBadge } from './UI.tsx';
import { GoogleGenAI } from "@google/genai";
import { db, auth, handleFirestoreError, OperationType } from '../services/firebase.ts';
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp, getDocs, deleteDoc, doc, limit } from 'firebase/firestore';

interface Message {
  role: 'user' | 'model' | 'system';
  text: string;
  createdAt?: any;
}

// Initialize Gemini
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const LunaChatPage: React.FC<{ profile: UserProfile | null; onUpgrade?: () => void }> = ({ profile, onUpgrade }) => {
  const isMzPlus = profile?.user_level === 'niveau_mz_plus';
  const ambassadorFirstName = profile?.full_name?.split(' ')[0] || 'Ambassadeur';
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // États pour la séquence d'accueil
  const [isLunaTyping, setIsLunaTyping] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const welcomeText = `Salut ${ambassadorFirstName}, je suis Luna 🤖\nJe suis là pour t’aider à augmenter tes résultats avec MZ+.\nQue veux-tu que nous fassions aujourd’hui ?`;

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Firestore History Loading
  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'chats'),
      where('userId', '==', auth.currentUser.uid),
      where('type', '==', 'luna'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const history = snapshot.docs
        .map(doc => ({ ...doc.data() } as Message))
        .reverse();
      
      if (history.length > 0) {
        setMessages(history);
        setIsLunaTyping(false);
        setShowWelcome(true);
      } else {
        // First time welcome sequence
        setIsLunaTyping(true);
        const timer1 = setTimeout(() => {
          setIsLunaTyping(false);
          setShowWelcome(true);
          const welcomeMsg: Message = { role: 'model', text: welcomeText };
          setMessages([welcomeMsg]);
        }, 1200);
        return () => clearTimeout(timer1);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'chats');
    });

    return () => unsubscribe();
  }, [auth.currentUser]);

  const suggestions = [
    { text: "🎬 Créer des vidéos virales", icon: Video, color: "text-blue-400" },
    { text: "💰 Booster mes revenus", icon: Coins, color: "text-yellow-500" },
    { text: "🚀 Accéder à MZ+ Premium", icon: Rocket, color: "text-purple-400" }
  ];

  useEffect(() => {
    if (messages.length === 1 && messages[0].role === 'model') {
      const timer = setTimeout(() => setShowSuggestions(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [messages.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (messages.length > 0) scrollToBottom();
  }, [messages, loading]);

  const handleSuggestionClick = (text: string) => {
    setInput(text);
    if (inputRef.current) inputRef.current.focus();
  };

  const saveMessage = async (message: Message) => {
    if (!auth.currentUser) return;
    try {
      await addDoc(collection(db, 'chats'), {
        ...message,
        userId: auth.currentUser.uid,
        type: 'luna',
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'chats');
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    if (!isMzPlus) {
      setMessages(prev => [...prev, { role: 'user', text: input.trim() }, { 
        role: 'system', 
        text: "Luna est un privilège réservé aux membres ayant un compte MZ+ Premium ✨. Accède à MZ+ Premium pour débloquer toutes les fonctionnalités." 
      }]);
      setInput('');
      return;
    }

    const userMessage = input.trim();
    const newUserMsg: Message = { role: 'user', text: userMessage };
    
    setInput('');
    setShowSuggestions(false);
    setLoading(true);

    // Save user message
    await saveMessage(newUserMsg);

    try {
      // Call Gemini
      const response = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [...messages, newUserMsg].map(m => ({
          role: m.role === 'model' ? 'model' : 'user',
          parts: [{ text: m.text }]
        })),
        config: {
          systemInstruction: `Tu es Luna, une assistante AI experte pour MZ+ Elite Business System. 
          Ton ton est motivant, professionnel et luxueux. 
          Tu aides les "Ambassadeurs" à réussir en affiliation, création de contenu (RPA) et coaching.
          L'utilisateur actuel s'appelle ${ambassadorFirstName}.
          Réponds toujours en français. Sois concise et impactante.`
        }
      });

      const aiText = response.text || "Désolé, j'ai eu un petit problème technique. Peux-tu reformuler ?";
      const aiMsg: Message = { role: 'model', text: aiText };
      
      // Save AI message
      await saveMessage(aiMsg);
      
    } catch (err) {
      console.error("Gemini Error:", err);
      const errorMsg: Message = { role: 'system', text: "Une erreur est survenue lors de la communication avec mon cerveau AI. 🧠⚡" };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = async () => {
    if (!auth.currentUser || !confirm("Voulez-vous réinitialiser votre conversation avec Luna ?")) return;
    try {
      const q = query(collection(db, 'chats'), where('userId', '==', auth.currentUser.uid), where('type', '==', 'luna'));
      const snapshot = await getDocs(q);
      const deletePromises = snapshot.docs.map(d => deleteDoc(doc(db, 'chats', d.id)));
      await Promise.all(deletePromises);
      setMessages([]);
      setIsLunaTyping(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'chats');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#050505] text-white overflow-hidden animate-fade-in relative font-sans">
      {/* Background Luxe Subtil */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
         <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-yellow-600/10 via-transparent to-transparent"></div>
      </div>

      {/* Header Ultra-Compact */}
     <div className="px-5 py-3 border-b border-white/5 bg-black/40 backdrop-blur-xl flex items-center justify-between shrink-0 z-20">
         <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-yellow-600 flex items-center justify-center text-black shadow-lg font-black text-lg">L</div>
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#050505] animate-pulse"></div>
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest leading-none">Luna <GoldText>AI</GoldText></h3>
              <p className="text-[7px] font-bold text-neutral-500 uppercase tracking-widest mt-1">Coach Certifié MZ+</p>
            </div>
         </div>
         <div className="flex items-center gap-4">
            {messages.length > 1 && (
               <button onClick={clearHistory} className="p-2 text-neutral-600 hover:text-red-500 transition-colors" title="Réinitialiser la conversation">
                  <Trash2 size={16} />
               </button>
            )}
            <div className="scale-75 origin-right">
               <EliteBadge variant={profile?.user_level}>{isMzPlus ? 'Accès Illimité' : 'Accès Limité'}</EliteBadge>
            </div>
         </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar relative z-10">
        <div className="max-w-2xl mx-auto flex flex-col gap-5 pb-2">
          
          {/* Séquence Luna Typing */}
          {isLunaTyping && (
            <div className="flex justify-start animate-fade-in">
              <div className="flex gap-2.5 items-center">
                <div className="w-7 h-7 rounded-lg bg-neutral-900 border border-white/5 flex items-center justify-center text-neutral-600 font-black text-[9px]">L</div>
                <div className="p-3 bg-neutral-900/60 border border-white/5 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-yellow-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-1.5 h-1.5 bg-yellow-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1.5 h-1.5 bg-yellow-600 rounded-full animate-bounce"></div>
                </div>
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
              <div className={`flex gap-2.5 max-w-[95%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                {msg.role !== 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-yellow-600/10 border border-yellow-600/20 flex items-center justify-center shrink-0 text-yellow-600 font-black text-[9px]">L</div>
                )}
                
                <div className={`p-4 rounded-[1.4rem] text-[13px] leading-relaxed shadow-xl ${
                  msg.role === 'user' 
                    ? 'bg-yellow-600 text-black rounded-tr-none border border-yellow-400 font-bold' 
                    : msg.role === 'system'
                      ? 'bg-purple-600/5 border-2 border-purple-500/20 text-purple-400 italic rounded-[1.8rem] p-6 text-center'
                      : 'bg-neutral-900/80 text-neutral-100 border border-white/5 rounded-tl-none backdrop-blur-xl'
                }`}>
                  {msg.role === 'system' && (
                    <div className="flex flex-col items-center gap-3 mb-4">
                      <div className="p-2 bg-purple-600 rounded-xl text-white shadow-[0_0_20px_rgba(147,51,234,0.3)]">
                        <Crown size={20} />
                      </div>
                    </div>
                  )}
                  
                  <span className="whitespace-pre-wrap">{msg.text}</span>
                  
                  {msg.role === 'system' && !isMzPlus && (
                     <button 
                      onClick={() => onUpgrade && onUpgrade()} 
                      className="mt-6 w-full py-4 bg-gradient-to-r from-purple-700 to-purple-600 text-white rounded-xl font-black uppercase text-[9px] tracking-widest shadow-xl hover:brightness-110 transition-all active:scale-95 flex items-center justify-center gap-3 border border-purple-400/30"
                    >
                      <Zap size={14} fill="currentColor" /> Accéder à MZ+ Premium
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Suggestions */}
          {showSuggestions && messages.length === 1 && !loading && (
            <div className="animate-fade-in space-y-3 pt-2">
              <div className="flex items-center gap-2 px-1 opacity-40">
                 <p className="text-[7px] font-black text-neutral-400 uppercase tracking-[0.3em]">Suggestions immédiates</p>
                 <div className="h-px flex-1 bg-white/5"></div>
              </div>
              <div className="flex flex-col gap-2">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestionClick(s.text)}
                    className="flex items-center gap-3 p-3 bg-white/[0.03] border border-white/5 rounded-2xl text-left hover:bg-white/[0.08] hover:border-yellow-600/30 transition-all active:scale-[0.98] animate-slide-down group shadow-sm"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <div className={`p-2 bg-black rounded-lg ${s.color} shrink-0 border border-white/5`}>
                      <s.icon size={14} />
                    </div>
                    <span className="text-[10px] font-black text-neutral-300 uppercase tracking-tight group-hover:text-white truncate">{s.text}</span>
                    <ChevronRight size={12} className="ml-auto text-neutral-700 group-hover:text-yellow-600" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {loading && (
            <div className="flex justify-start animate-pulse">
              <div className="flex gap-2.5 items-center">
                <div className="w-7 h-7 rounded-lg bg-yellow-600 flex items-center justify-center text-black font-black text-[9px]">L</div>
                <div className="p-3 bg-neutral-900/60 border border-white/5 rounded-2xl rounded-tl-none flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-yellow-600 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-yellow-600 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 md:p-6 bg-[#080808]/90 backdrop-blur-3xl border-t border-white/5 shrink-0 relative z-20">
        <div className="max-w-2xl mx-auto w-full">
          <form onSubmit={handleSend} className="relative flex items-center gap-2">
            <textarea 
              ref={inputRef}
              rows={1}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Décris ton objectif..."
              className="flex-1 bg-neutral-900 border border-white/10 rounded-2xl py-4 px-5 text-[13px] text-white outline-none focus:border-yellow-600/40 transition-all shadow-inner placeholder:text-neutral-700 font-medium resize-none overflow-hidden h-[54px]"
            />
            <button 
              type="submit" 
              disabled={!input.trim() || loading}
              className="w-13 h-13 aspect-square bg-yellow-600 text-black rounded-xl hover:bg-yellow-500 disabled:opacity-20 transition-all shadow-lg active:scale-90 flex items-center justify-center shrink-0"
            >
              <Send size={22} strokeWidth={2.5} />
            </button>
          </form>
          
          <div className="flex justify-center mt-3 opacity-30">
             <div className="flex items-center gap-4">
                <p className="text-[6px] text-neutral-500 uppercase font-black tracking-[0.4em] flex items-center gap-1">
                  <ShieldCheck size={9} /> Canal Chiffré MZ+
                </p>
                <p className="text-[6px] text-neutral-500 uppercase font-black tracking-[0.4em] flex items-center gap-1">
                  <MessageSquare size={9} /> Luna v2.1 active
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};