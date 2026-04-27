
import React, { useState, useEffect } from 'react';
import { Megaphone, Plus, Trash2, Power, Save, Loader2, X, Users, Target, User, Search, CheckCircle2, MousePointer2, AlertTriangle, FileText, Eye, RefreshCw, Clock, ChevronRight } from 'lucide-react';
import { supabase } from '../../../services/supabase.ts';
import { GoldBorderCard, PrimaryButton, GoldText, EliteBadge } from '../../UI.tsx';

const REDIRECT_TABS = [
  { id: 'dashboard', label: 'Tableau de Bord' },
  { id: 'flash_offer', label: 'PASSEZ AU NIVEAU SUPÉRIEUR' },
  { id: 'upgrade', label: 'Page de Niveau MZ+' },
  { id: 'formation', label: 'Académie (Formation)' },
  { id: 'coaching', label: 'Coaching Personnalisé' },
  { id: 'rpa', label: 'Revenus Vidéo RPA' },
  { id: 'luna_chat', label: 'Intelligence Luna AI' },
  { id: 'affiliation', label: 'Catalogue Affiliation' },
  { id: 'revenus', label: 'Trésorerie & Retraits' },
];

export const AnnouncementAdmin: React.FC = () => {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userResults, setUserResults] = useState<any[]>([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [selectedUserDisplay, setSelectedUserDisplay] = useState<string | null>(null);

  // État pour voir les lecteurs
  const [viewingReadersAnnId, setViewingReadersAnnId] = useState<string | null>(null);
  const [readers, setReaders] = useState<any[]>([]);
  const [loadingReaders, setLoadingReaders] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    button_text: 'DÉCOUVRIR L\'OFFRE',
    is_active: true,
    target_type: 'all', 
    target_value: '',
    target_tab: 'flash_offer'
  });

  const fetchAnnouncements = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const { data, error } = await supabase
        .from('marketing_announcements')
        .select('*, marketing_announcement_reads(count)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnnouncements(data || []);
    } catch (err: any) {
      console.error("Fetch announcements error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReaders = async (annId: string) => {
    setViewingReadersAnnId(annId);
    setLoadingReaders(true);
    setReaders([]);
    
    try {
      // On utilise created_at (corrigé en SQL) et on force l'utilisation de la FK spécifique
      const { data, error } = await supabase
        .from('marketing_announcement_reads')
        .select(`
          created_at,
          users!marketing_announcement_reads_user_id_fkey (
            id,
            full_name, 
            email, 
            user_level
          )
        `)
        .eq('announcement_id', annId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReaders(data || []);
    } catch (err) {
      console.error("Detailed reader fetch error:", err);
    } finally {
      setLoadingReaders(false);
    }
  };

  useEffect(() => { fetchAnnouncements(); }, []);

  useEffect(() => {
    const searchUsers = async () => {
      if (userSearchTerm.length < 2) { setUserResults([]); return; }
      setIsSearchingUsers(true);
      try {
        const { data } = await supabase.from('users').select('id, full_name, email').or(`full_name.ilike.%${userSearchTerm}%,email.ilike.%${userSearchTerm}%`).limit(5);
        setUserResults(data || []);
      } catch (err) { console.error(err); } finally { setIsSearchingUsers(false); }
    };
    const timer = setTimeout(searchUsers, 300);
    return () => clearTimeout(timer);
  }, [userSearchTerm]);

  const selectUser = (user: any) => {
    setFormData({ ...formData, target_type: 'specific', target_value: user.id });
    setSelectedUserDisplay(`${user.full_name} (${user.email})`);
    setUserSearchTerm('');
    setUserResults([]);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg(null);

    try {
      const payload = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        button_text: formData.button_text.trim(),
        is_active: formData.is_active,
        target_type: formData.target_type,
        target_value: formData.target_value || null,
        target_tab: formData.target_tab,
        image_url: null
      };

      const { error } = await supabase.from('marketing_announcements').insert([payload]);
      if (error) throw error;

      setSuccessMsg("L'annonce a été diffusée sur le réseau !");
      setTimeout(() => { resetForm(); fetchAnnouncements(); }, 2000);
    } catch (err: any) { 
      setErrorMsg(err.message || "Erreur lors de l'enregistrement.");
    } finally { 
      setIsSaving(false); 
    }
  };

  const resetForm = () => {
    setFormData({ title: '', content: '', button_text: 'DÉCOUVRIR L\'OFFRE', is_active: true, target_type: 'all', target_value: '', target_tab: 'flash_offer' });
    setUserSearchTerm(''); setSelectedUserDisplay(null); setSuccessMsg(null); setErrorMsg(null); setShowForm(false);
  };

  const toggleActive = async (id: string, currentState: boolean) => {
    try {
      const { error } = await supabase.from('marketing_announcements').update({ is_active: !currentState }).eq('id', id);
      if (error) throw error;
      fetchAnnouncements(true);
    } catch (err) { alert("Erreur."); }
  };

  const deleteAnnouncement = async (id: string) => {
    if (!confirm("Supprimer cette annonce ?")) return;
    try {
      const { error } = await supabase.from('marketing_announcements').delete().eq('id', id);
      if (error) throw error;
      fetchAnnouncements(true);
    } catch (err) { alert("Erreur."); }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* MODAL DES LECTEURS */}
      {viewingReadersAnnId && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-xl animate-fade-in" onClick={() => setViewingReadersAnnId(null)}></div>
          <GoldBorderCard className="relative w-full max-w-xl bg-[#080808] border-white/10 p-0 overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,1)] animate-slide-up">
            <div className="p-6 md:p-8 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-yellow-600/10 rounded-xl text-yellow-600">
                   <Eye size={20} />
                </div>
                <div>
                   <h3 className="text-lg font-black uppercase tracking-tighter">Audit des <GoldText>Lectures</GoldText></h3>
                   <p className="text-[8px] text-neutral-500 font-bold uppercase tracking-widest mt-1">Qui a consulté ce message</p>
                </div>
              </div>
              <button onClick={() => setViewingReadersAnnId(null)} className="p-2 text-neutral-500 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="max-h-[400px] overflow-y-auto custom-scrollbar p-4">
               {loadingReaders ? (
                 <div className="py-20 text-center flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-yellow-500" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Récupération des profils...</p>
                 </div>
               ) : readers.length === 0 ? (
                 <div className="py-20 text-center opacity-20"><p className="text-[10px] font-black uppercase">Aucun lecteur pour le moment</p></div>
               ) : (
                 <div className="space-y-2">
                   {readers.map((r, i) => {
                     const user = r.users || (r as any).users_marketing_announcement_reads_user_id_fkey;
                     return (
                       <div key={i} className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/5 rounded-2xl hover:bg-white/5 transition-all">
                         <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-neutral-900 flex items-center justify-center text-white font-black uppercase text-xs border border-white/5">
                             {user?.full_name?.charAt(0) || '?'}
                           </div>
                           <div>
                              <div className="flex items-center gap-2">
                                <p className="text-xs font-black uppercase text-white tracking-tight">{user?.full_name || 'Membre Inconnu'}</p>
                                {user?.user_level && (
                                  <EliteBadge variant={user.user_level}>{user.user_level === 'niveau_mz_plus' ? 'MZ+' : 'STD'}</EliteBadge>
                                )}
                              </div>
                              <p className="text-[8px] font-mono text-neutral-500 mt-0.5">{user?.email || 'N/A'}</p>
                           </div>
                         </div>
                         <div className="text-right">
                            <p className="text-[9px] font-black text-yellow-600 uppercase flex items-center gap-1.5 justify-end">
                              <Clock size={10} /> {r.created_at ? new Date(r.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}
                            </p>
                            <p className="text-[7px] text-neutral-600 font-mono mt-1">{r.created_at ? new Date(r.created_at).toLocaleDateString() : 'Date inconnue'}</p>
                         </div>
                       </div>
                     );
                   })}
                 </div>
               )}
            </div>
            
            <div className="p-6 border-t border-white/5 text-center">
              <button onClick={() => setViewingReadersAnnId(null)} className="text-[9px] font-black uppercase tracking-widest text-neutral-500 hover:text-white transition-colors">Fermer le rapport</button>
            </div>
          </GoldBorderCard>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 px-2">
        <div className="flex items-center gap-4">
           <div className="p-3 bg-yellow-600/10 rounded-2xl text-yellow-600 border border-yellow-600/20 shadow-xl">
              <Megaphone size={24} />
           </div>
           <div>
             <h3 className="text-xl font-black uppercase tracking-tight">Messages <GoldText>Elite Pop-up</GoldText></h3>
             <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mt-1">Pilotage des alertes réseau</p>
           </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button 
            onClick={() => fetchAnnouncements()} 
            className="p-4 sm:p-3 bg-neutral-900 border border-white/5 rounded-xl text-neutral-500 hover:text-yellow-600 transition-all active:rotate-180"
            title="Rafraîchir les compteurs"
          >
            <RefreshCw size={16} />
          </button>
          <button onClick={() => showForm ? resetForm() : setShowForm(true)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-4 sm:py-3 bg-yellow-600 text-black rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-yellow-500 transition-all shadow-lg active:scale-95">
            {showForm ? <X size={14} /> : <Plus size={14} />} {showForm ? 'Annuler' : 'Nouveau Message'}
          </button>
        </div>
      </div>

      {showForm && (
        <GoldBorderCard className="p-6 md:p-12 border-yellow-600/20 bg-black/40 animate-slide-down overflow-visible mx-2 md:mx-0">
          {errorMsg && (
            <div className="mb-8 p-4 bg-red-600/10 border border-red-500/50 rounded-xl flex items-center gap-3 text-red-500">
               <AlertTriangle size={18} />
               <p className="text-[10px] font-black uppercase tracking-widest">{errorMsg}</p>
            </div>
          )}
          
          {successMsg ? (
            <div className="py-20 text-center space-y-4">
               <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-500 animate-bounce"><CheckCircle2 size={32} /></div>
               <p className="text-sm font-black uppercase text-emerald-400">{successMsg}</p>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-8 md:space-y-10">
              <div className="space-y-4">
                 <label className="text-[10px] font-black uppercase text-neutral-500 tracking-[0.2em] flex items-center gap-2"><FileText size={14} className="text-yellow-600" /> Titre de l'alerte</label>
                 <input required className="w-full bg-neutral-900 border border-white/10 rounded-2xl p-5 text-sm text-white outline-none focus:border-yellow-600 transition-all shadow-inner font-black uppercase" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="EX: MISE À JOUR CRUCIALE..." />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-neutral-500 tracking-[0.2em]">Message de conviction</label>
                <textarea required rows={4} className="w-full bg-neutral-900 border border-white/10 rounded-2xl p-6 text-sm text-white resize-none outline-none focus:border-yellow-600 transition-all shadow-inner font-medium italic" value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} placeholder="Rédigez un message court, percutant et puissant..." />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                 <div className="space-y-4">
                   <label className="text-[10px] font-black uppercase text-neutral-500 tracking-[0.2em] flex items-center gap-2"><MousePointer2 size={12} className="text-yellow-600" /> Destination du clic</label>
                   <select className="w-full bg-neutral-900 border border-white/10 rounded-2xl p-5 text-xs text-white outline-none focus:border-yellow-600 appearance-none cursor-pointer" value={formData.target_tab} onChange={e => setFormData({...formData, target_tab: e.target.value})}>
                     {REDIRECT_TABS.map(tab => <option key={tab.id} value={tab.id}>{tab.label}</option>)}
                   </select>
                 </div>
                 <div className="space-y-4">
                   <label className="text-[10px] font-black uppercase text-neutral-500 tracking-[0.2em]">Texte du bouton</label>
                   <input required className="w-full bg-neutral-900 border border-white/10 rounded-2xl p-5 text-xs text-white outline-none focus:border-yellow-600 transition-all font-black uppercase" value={formData.button_text} onChange={e => setFormData({...formData, button_text: e.target.value})} placeholder="Ex: ACCÉDER À L'OFFRE" />
                 </div>
              </div>

              <div className="p-6 md:p-8 bg-white/5 border border-white/10 rounded-[2rem] md:rounded-[2.5rem] space-y-6 md:space-y-8">
                <div className="flex items-center gap-3"><Target size={18} className="text-yellow-600" /><h4 className="text-[11px] font-black uppercase text-white tracking-[0.3em]">Ciblage Réseau</h4></div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                   <TargetBtn active={formData.target_type === 'all'} icon={Users} label="Tous" onClick={() => setFormData({...formData, target_type: 'all', target_value: ''})} />
                   <TargetBtn active={formData.target_type === 'level'} icon={Target} label="Niveau" onClick={() => setFormData({...formData, target_type: 'level', target_value: 'standard'})} />
                   <TargetBtn active={formData.target_type === 'specific'} icon={User} label="Précis" onClick={() => setFormData({...formData, target_type: 'specific', target_value: ''})} />
                </div>
                {formData.target_type === 'level' && <select className="w-full bg-black border border-white/10 rounded-xl p-4 text-xs text-white" value={formData.target_value} onChange={e => setFormData({...formData, target_value: e.target.value})}><option value="standard">Standard uniquement</option><option value="niveau_mz_plus">MZ+ uniquement</option></select>}
                {formData.target_type === 'specific' && (
                  <div className="relative">
                    {selectedUserDisplay ? (
                      <div className="flex items-center justify-between p-4 bg-yellow-600/10 border border-yellow-600/30 rounded-xl"><div className="flex items-center gap-3"><User size={14} className="text-yellow-500" /><span className="text-[10px] font-black uppercase text-white">{selectedUserDisplay}</span></div><button type="button" onClick={() => { setFormData({...formData, target_value: ''}); setSelectedUserDisplay(null); }} className="text-neutral-500 hover:text-white"><X size={16} /></button></div>
                    ) : (
                      <>
                        <div className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" size={16} /><input className="w-full bg-black border border-white/10 rounded-xl py-4 pl-12 text-xs text-white outline-none focus:border-yellow-600" placeholder="Rechercher membre..." value={userSearchTerm} onChange={e => setUserSearchTerm(e.target.value)} /></div>
                        {userResults.length > 0 && <div className="absolute top-full left-0 w-full bg-[#0c0c0c] border border-white/10 rounded-xl mt-2 overflow-hidden shadow-2xl z-50">{userResults.map(u => <button key={u.id} type="button" onClick={() => selectUser(u)} className="w-full p-4 hover:bg-yellow-600/10 text-left border-b border-white/5 last:border-0"><span className="text-[10px] font-black uppercase text-white block">{u.full_name}</span><span className="text-[8px] font-mono text-neutral-500">{u.email}</span></button>)}</div>}
                      </>
                    )}
                  </div>
                )}
              </div>

              <PrimaryButton type="submit" fullWidth isLoading={isSaving} size="lg">Déclencher le Pop-up</PrimaryButton>
            </form>
          )}
        </GoldBorderCard>
      )}

      <div className="space-y-4 px-2 md:px-0">
        {loading ? (
          <div className="py-20 text-center opacity-40"><Loader2 className="animate-spin text-yellow-500 mx-auto" /></div>
        ) : announcements.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-white/5 rounded-[2rem] md:rounded-[2.5rem] opacity-20"><Megaphone size={40} className="mx-auto mb-4" /><p className="text-[10px] font-black uppercase">Aucune annonce</p></div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {announcements.map(ann => (
              <div key={ann.id} className="p-5 md:p-6 bg-[#0a0a0a] border border-white/5 rounded-[1.5rem] md:rounded-[2rem] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group hover:border-yellow-600/20 transition-all">
                <div className="flex items-center gap-4 md:gap-6 w-full sm:w-auto">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-neutral-900 rounded-xl flex items-center justify-center text-neutral-500 shrink-0"><FileText size={20} /></div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-black uppercase text-white truncate">{ann.title}</h4>
                    <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-1">
                      <p className="text-[8px] text-neutral-600 font-mono uppercase">CIBLE: {ann.target_type}</p>
                      <div className="hidden md:block w-1 h-1 rounded-full bg-neutral-800"></div>
                      <button 
                        onClick={() => fetchReaders(ann.id)}
                        className="flex items-center gap-1.5 px-2.5 py-1 bg-yellow-600/10 border border-yellow-600/20 rounded shadow-sm text-yellow-600 hover:bg-yellow-600 hover:text-black transition-all group/btn"
                      >
                         <Eye size={10} />
                         <span className="text-[10px] font-black font-mono">{(ann.marketing_announcement_reads?.[0]?.count || 0).toLocaleString()} vues</span>
                         <ChevronRight size={10} className="opacity-0 group-hover/btn:opacity-100 transition-all" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-3 sm:pt-0 border-t sm:border-0 border-white/5">
                  <button onClick={() => toggleActive(ann.id, ann.is_active)} className={`flex-1 sm:flex-none p-3 rounded-xl transition-all flex items-center justify-center ${ann.is_active ? 'bg-emerald-600/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-600/10 text-red-500 border border-red-500/20'}`} title={ann.is_active ? "Désactiver" : "Activer"}><Power size={16} /></button>
                  <button onClick={() => deleteAnnouncement(ann.id)} className="flex-1 sm:flex-none p-3 bg-white/5 text-neutral-600 hover:text-red-500 border border-white/5 rounded-xl transition-all flex items-center justify-center"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const TargetBtn = ({ active, icon: Icon, label, onClick }: any) => (
  <button type="button" onClick={onClick} className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all active:scale-95 ${active ? 'bg-yellow-600/10 border-yellow-600 text-yellow-500 shadow-xl' : 'bg-black border-white/5 text-neutral-600 hover:border-white/10'}`}>
    <Icon size={20} /><span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
  </button>
);
