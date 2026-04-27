import React, { useState, useEffect } from 'react';
import { Crown, Send, Check, Loader2, Search, UserPlus, RefreshCw, Settings, Play, Power, FileVideo, Eye } from 'lucide-react';
import { supabase } from '../../../services/supabase.ts';
import { UserProfile } from '../../../types.ts';
import { GoldBorderCard, PrimaryButton, GoldText } from '../../UI.tsx';

export const PremiumWelcomeAdmin: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [sentPopups, setSentPopups] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Config state
  const [config, setConfig] = useState<any>({
    youtube_id: '',
    video_url: '',
    is_active: true
  });
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  useEffect(() => {
    fetchData();
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const { data } = await supabase
        .from('mz_premium_welcome_config')
        .select('*')
        .eq('id', 'premium-welcome-global')
        .maybeSingle();
      
      if (data) {
        setConfig(data);
      }
    } catch (error) {
      console.error('Error fetching config:', error);
    }
  };

  const handleSaveConfig = async () => {
    setIsSavingConfig(true);
    try {
      const { error } = await supabase
        .from('mz_premium_welcome_config')
        .upsert({
          id: 'premium-welcome-global',
          youtube_id: config.youtube_id,
          video_url: config.video_url,
          is_active: config.is_active,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      alert("Configuration mise à jour !");
    } catch (error: any) {
      alert("Erreur lors de la sauvegarde : " + error.message);
    } finally {
      setIsSavingConfig(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // Récupérer les utilisateurs premium (niveau_mz_plus)
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('user_level', 'niveau_mz_plus')
        .order('full_name');

      // Récupérer les popups déjà envoyés
      const { data: popupData } = await supabase
        .from('premium_welcome_popups')
        .select('user_id');

      if (userData) setUsers(userData as any);
      if (popupData) {
        setSentPopups(new Set(popupData.map(p => p.user_id)));
      }
    } catch (error) {
      console.error('Error fetching premium welcome data:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendPopup = async (userId: string) => {
    setSending(userId);
    try {
      const { error } = await supabase
        .from('premium_welcome_popups')
        .upsert([{ 
          user_id: userId, 
          is_read: false,
          created_at: new Date().toISOString() 
        }], { onConflict: 'user_id' });

      if (error) throw error;

      setSentPopups(prev => {
        const next = new Set(prev);
        next.add(userId);
        return next;
      });
      
      // Optionnel: petit feedback visuel temporaire si c'est un renvoi
      if (sentPopups.has(userId)) {
        console.log("Popup renvoyé avec succès");
      }
    } catch (error: any) {
      alert("Erreur lors de l'envoi : " + error.message);
    } finally {
      setSending(null);
    }
  };

  const filteredUsers = users.filter(u => 
    u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
            <Crown className="text-yellow-500" /> Gestion des <GoldText>Accueils Premium</GoldText>
          </h3>
          <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-widest mt-1">
            Envoyez le popup de bienvenue exclusif aux nouveaux membres Premium
          </p>
        </div>
      </div>

      {/* Configuration Section */}
      <GoldBorderCard className="p-6 md:p-8 border-purple-500/20 bg-black/40">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-600/10 rounded-2xl text-purple-400 shrink-0">
              <Settings size={24} />
            </div>
            <div>
              <h3 className="text-lg font-black uppercase tracking-tight">Configuration <GoldText>Accueil Premium</GoldText></h3>
              <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mt-1">Gérez le contenu vidéo et l'activation du popup</p>
            </div>
          </div>
          
          <button 
            onClick={() => setConfig({...config, is_active: !config.is_active})}
            className={`w-full md:w-auto flex items-center justify-center gap-3 px-6 py-4 md:py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${
              config.is_active ? 'bg-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'bg-red-600/20 text-red-500'
            }`}
          >
            <Power size={14} /> {config.is_active ? 'POPUP ACTIF' : 'POPUP DÉSACTIVÉ'}
          </button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-neutral-500 tracking-widest flex items-center gap-2">
                <Play size={12} className="text-yellow-600" /> ID Vidéo YouTube
              </label>
              <input 
                type="text" 
                className="w-full bg-black border border-white/10 rounded-xl p-4 text-white font-mono text-xs outline-none focus:border-yellow-600 transition-all"
                placeholder="Ex: dQw4w9WgXcQ"
                value={config.youtube_id}
                onChange={e => setConfig({...config, youtube_id: e.target.value})}
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-neutral-500 tracking-widest flex items-center gap-2">
                <FileVideo size={12} className="text-yellow-600" /> URL Vidéo Directe
              </label>
              <input 
                type="text" 
                className="w-full bg-black border border-white/10 rounded-xl p-4 text-white font-mono text-xs outline-none focus:border-yellow-600 transition-all"
                placeholder="https://..."
                value={config.video_url}
                onChange={e => setConfig({...config, video_url: e.target.value})}
              />
            </div>
          </div>

          <PrimaryButton 
            onClick={handleSaveConfig} 
            isLoading={isSavingConfig}
            fullWidth
          >
            Enregistrer la configuration
          </PrimaryButton>
        </div>
      </GoldBorderCard>

      <GoldBorderCard className="p-6">
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" size={18} />
          <input 
            className="w-full bg-black border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-xs text-white outline-none focus:border-yellow-600 transition-all" 
            placeholder="Rechercher un membre Premium..." 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
          />
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="animate-spin text-yellow-500 mx-auto mb-4" size={32} />
            <p className="text-[10px] uppercase font-black tracking-widest text-neutral-500">Chargement des membres...</p>
          </div>
        ) : (
          <div className="bg-black/40 rounded-2xl border border-white/5 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-black/60 text-[9px] font-black uppercase text-neutral-500 border-b border-white/5">
                <tr>
                  <th className="p-6">Membre Premium</th>
                  <th className="p-6">Statut Envoi</th>
                  <th className="p-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-20 text-center opacity-30 uppercase font-black tracking-widest">
                      Aucun membre premium trouvé
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(u => {
                    const isSent = sentPopups.has(u.id);
                    return (
                      <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-6">
                          <div className="font-bold text-white">{u.full_name}</div>
                          <div className="text-[10px] text-neutral-500 font-mono">{u.email}</div>
                        </td>
                        <td className="p-6">
                          {isSent ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-[9px] font-black uppercase">
                              <Check size={10} /> Envoyé
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 text-yellow-500 rounded-full text-[9px] font-black uppercase">
                              En attente
                            </span>
                          )}
                        </td>
                        <td className="p-6 text-right">
                          <button
                            onClick={() => sendPopup(u.id)}
                            disabled={sending === u.id}
                            className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ml-auto ${
                              sending === u.id 
                                ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed' 
                                : isSent
                                  ? 'bg-emerald-600/20 text-emerald-500 border border-emerald-500/30 hover:bg-emerald-600 hover:text-white'
                                  : 'bg-yellow-600 text-black hover:bg-yellow-500 active:scale-95 shadow-lg shadow-yellow-500/10'
                            }`}
                          >
                            {sending === u.id ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : isSent ? (
                              <RefreshCw size={12} />
                            ) : (
                              <Send size={12} />
                            )}
                            {isSent ? 'Renvoyer Popup' : 'Envoyer Popup'}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </GoldBorderCard>

      <div className="p-6 bg-purple-900/10 border border-purple-500/20 rounded-2xl flex items-start gap-4">
        <div className="p-3 bg-purple-500/20 rounded-xl">
          <Crown className="text-purple-400" size={20} />
        </div>
        <div>
          <h4 className="text-sm font-black text-purple-300 uppercase mb-1">Note du Super Admin</h4>
          <p className="text-xs text-purple-200/60 leading-relaxed">
            Le popup premium est une expérience unique. Une fois envoyé, il apparaîtra à la prochaine connexion du membre. 
            Vous pouvez désormais <strong>renvoyer le popup</strong> à tout moment, même si le membre l'a déjà lu. Cela réinitialisera l'état pour qu'il s'affiche à nouveau.
          </p>
        </div>
      </div>
    </div>
  );
};
