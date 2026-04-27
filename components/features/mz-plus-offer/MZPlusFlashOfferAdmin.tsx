
import React, { useState, useEffect, useRef } from 'react';
import { Power, RefreshCw, Zap, Code, Loader2, Save, AlertCircle, Eye, Coins, Timer, TimerOff, CheckCircle2, Tag, Percent, Users, Image as ImageIcon, Trash2, Plus, X, User, Clock, Upload, Video } from 'lucide-react';
import { supabase } from '../../../services/supabase.ts';
import { GoldBorderCard, PrimaryButton, GoldText } from '../../UI.tsx';
import { CurrencyDisplay } from '../../ui/CurrencyDisplay.tsx';

export const MZPlusFlashOfferAdmin: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [showTimer, setShowTimer] = useState(true);
  const [pricePromo, setPricePromo] = useState('15000');
  const [priceNormal, setPriceNormal] = useState('20000'); // Défini à 20000 comme ancrage principal
  const [urgencyHours, setUrgencyHours] = useState('24');
  const [youtubeIframe, setYoutubeIframe] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Gestion des preuves dynamiques
  const [proofs, setProofs] = useState<any[]>([]);
  const [showProofForm, setShowProofForm] = useState(false);
  const [isSavingProof, setIsSavingProof] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{before: boolean, after: boolean}>({before: false, after: false});
  
  const [proofForm, setProofForm] = useState({
    name: '',
    before_amount: '',
    after_amount: '',
    time_frame: '',
    before_image_url: '',
    after_image_url: ''
  });

  const fileInputBeforeRef = useRef<HTMLInputElement>(null);
  const fileInputAfterRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchConfig();
    fetchProofs();
  }, []);

  const fetchConfig = async (retryCount = 0) => {
    try {
      const { data, error } = await supabase.from('mz_flash_offer_v2').select('*').eq('id', 'flash-offer-global').maybeSingle();
      if (error) throw error;
      if (data) {
        setIsActive(Boolean(data.is_active));
        setShowTimer(Boolean(data.show_timer ?? true));
        setPriceNormal(String(data.price_normal || '20000'));
        setPricePromo(String(data.price_promo || '15000'));
        setYoutubeIframe(data.youtube_iframe || '');
        setVideoUrl(data.video_url || '');
      }
    } catch (e: any) { 
      console.error("Flash Offer Config Fetch Error:", e);
      if (retryCount < 2 && (e.message?.includes('fetch') || e.name === 'TypeError')) {
        setTimeout(() => fetchConfig(retryCount + 1), 1500);
        return;
      }
    } finally { 
      setLoading(false); 
    }
  };

  const fetchProofs = async (retryCount = 0) => {
    try {
      const { data, error } = await supabase.from('mz_premium_proofs').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      if (data) setProofs(data);
    } catch (e: any) {
      console.error("Proofs Fetch Error:", e);
      if (retryCount < 2 && (e.message?.includes('fetch') || e.name === 'TypeError')) {
        setTimeout(() => fetchProofs(retryCount + 1), 1500);
        return;
      }
    }
  };

  const handleFileUpload = async (file: File, type: 'before' | 'after') => {
    try {
      setUploadProgress(prev => ({ ...prev, [type]: true }));
      const fileExt = file.name.split('.').pop();
      const fileName = `proof_${Date.now()}_${type}.${fileExt}`;
      const filePath = `proofs/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('mz_assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('mz_assets')
        .getPublicUrl(filePath);

      setProofForm(prev => ({ 
        ...prev, 
        [type === 'before' ? 'before_image_url' : 'after_image_url']: publicUrl 
      }));
    } catch (err: any) {
      alert("Erreur upload image : " + err.message);
    } finally {
      setUploadProgress(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleSaveProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofForm.before_image_url || !proofForm.after_image_url) {
      alert("Veuillez charger les deux captures d'écran avant d'enregistrer.");
      return;
    }

    setIsSavingProof(true);
    try {
      const { error } = await supabase.from('mz_premium_proofs').insert([proofForm]);
      if (error) throw error;
      
      setShowProofForm(false);
      setProofForm({ name: '', before_amount: '', after_amount: '', time_frame: '', before_image_url: '', after_image_url: '' });
      fetchProofs();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSavingProof(false);
    }
  };

  const deleteProof = async (id: string) => {
    if (!confirm("Voulez-vous supprimer cette preuve ?")) return;
    try {
      await supabase.from('mz_premium_proofs').delete().eq('id', id);
      fetchProofs();
    } catch (err: any) { console.error(err); }
  };

  const handleSaveConfig = async (resetTimer: boolean = false) => {
    setIsSaving(true);
    try {
      const updates: any = { 
        id: 'flash-offer-global',
        is_active: isActive, 
        show_timer: showTimer,
        price_promo: parseInt(pricePromo),
        price_normal: parseInt(priceNormal),
        youtube_iframe: youtubeIframe,
        video_url: videoUrl
      };

      if (resetTimer) {
        const hours = parseInt(urgencyHours) || 24;
        updates.ends_at = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
      }

      const { error } = await supabase.from('mz_flash_offer_v2').upsert(updates);
      if (error) throw error;

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e: any) { alert(e.message); } finally { setIsSaving(false); }
  };

  if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin text-yellow-500" size={32} /></div>;

  return (
    <div className="space-y-12 animate-fade-in max-w-5xl mx-auto pb-20">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 px-2 md:px-0">
         <GoldBorderCard className="p-4 md:p-6 bg-black/40 border-purple-500/10 flex items-center gap-4 md:gap-6">
            <div className="p-3 md:p-4 bg-purple-600/10 rounded-xl md:rounded-2xl text-purple-400 shadow-xl"><ImageIcon size={24} className="md:w-[28px] md:h-[28px]" /></div>
            <div>
               <p className="text-[8px] md:text-[9px] font-black uppercase text-neutral-500 tracking-widest mb-1">Preuves enregistrées</p>
               <p className="text-2xl md:text-3xl font-black text-white font-mono">{proofs.length}</p>
            </div>
         </GoldBorderCard>
         <GoldBorderCard className="p-4 md:p-6 bg-black/40 border-yellow-600/10 flex items-center gap-4 md:gap-6">
            <div className="p-3 md:p-4 bg-yellow-600/10 rounded-xl md:rounded-2xl text-yellow-600 shadow-xl"><Zap size={24} className="md:w-[28px] md:h-[28px]" /></div>
            <div>
               <p className="text-[8px] md:text-[9px] font-black uppercase text-neutral-500 tracking-widest mb-1">Status Offre</p>
               <p className={`text-xs md:text-sm font-black uppercase ${isActive ? 'text-emerald-500' : 'text-red-500'}`}>{isActive ? 'En ligne' : 'Désactivée'}</p>
            </div>
         </GoldBorderCard>
      </div>

      <GoldBorderCard className="p-6 md:p-8 border-yellow-600/20 bg-black/40 mx-2 md:mx-0">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8 md:mb-10 border-b border-white/5 pb-8">
           <h3 className="text-xl font-black uppercase"><Zap className="inline mr-2 text-yellow-600"/> Piloter l'offre <GoldText>Premium</GoldText></h3>
           <div className="flex flex-wrap gap-3 w-full lg:w-auto">
              <button onClick={() => setShowTimer(!showTimer)} className={`flex-1 lg:flex-none px-4 py-3 rounded-xl font-black uppercase text-[10px] flex items-center justify-center gap-2 ${showTimer ? 'bg-yellow-600 text-black' : 'bg-neutral-800 text-neutral-500'}`}>
                {showTimer ? <Timer size={14}/> : <TimerOff size={14}/>} {showTimer ? 'CHRONO ON' : 'CHRONO OFF'}
              </button>
              <button onClick={() => setIsActive(!isActive)} className={`flex-1 lg:flex-none px-6 py-3 rounded-xl font-black uppercase text-[10px] ${isActive ? 'bg-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'bg-red-600/20 text-red-500'}`}>
                {isActive ? 'OFFRE ACTIVE' : 'OFFRE INACTIVE'}
              </button>
           </div>
        </div>
        <div className="space-y-8">
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-neutral-500 tracking-widest flex items-center gap-2"><Tag size={12}/> Prix à barrer (Ancrage Marketing)</label>
                <input type="number" className="w-full bg-black border border-white/10 rounded-xl p-4 text-white outline-none focus:border-yellow-600 transition-all font-mono" value={priceNormal} onChange={e => setPriceNormal(e.target.value)} />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-yellow-600 tracking-widest flex items-center gap-2"><Coins size={12}/> Prix Promotionnel Actuel</label>
                <input type="number" className="w-full bg-black border border-white/10 rounded-xl p-4 text-white outline-none focus:border-yellow-600 transition-all font-mono" value={pricePromo} onChange={e => setPricePromo(e.target.value)} />
             </div>
           </div>

           <div className="p-5 md:p-6 bg-red-600/5 border border-red-500/10 rounded-2xl space-y-4">
              <label className="text-[10px] font-black uppercase text-red-500 tracking-widest flex items-center gap-2">
                <Clock size={14} /> Durée de l'urgence (Heures)
              </label>
              <div className="flex flex-col sm:flex-row gap-4">
                <input 
                  type="number" 
                  className="w-full sm:w-32 bg-black border border-white/10 rounded-xl p-4 text-white outline-none focus:border-red-600 transition-all font-mono" 
                  value={urgencyHours} 
                  onChange={e => setUrgencyHours(e.target.value)} 
                  placeholder="Ex: 24"
                />
                <button onClick={() => handleSaveConfig(true)} className="flex-1 flex items-center justify-center gap-3 py-4 bg-red-600 text-white rounded-xl font-black uppercase text-[10px] hover:bg-red-500 transition-all shadow-lg shadow-red-900/20">
                  <RefreshCw size={14} className={isSaving ? 'animate-spin' : ''}/> Relancer le compte à rebours ({urgencyHours}h)
                </button>
              </div>
           </div>

           <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-neutral-500 tracking-widest flex items-center gap-2">
                <Video size={14} className="text-yellow-600" /> Iframe Vidéo de Vente (YouTube/Vimeo)
              </label>
              <textarea 
                rows={3}
                className="w-full bg-black border border-white/10 rounded-xl p-5 text-white font-mono text-xs outline-none focus:border-yellow-600 transition-all shadow-inner"
                value={youtubeIframe}
                onChange={e => setYoutubeIframe(e.target.value)}
              />
           </div>

           <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-neutral-500 tracking-widest flex items-center gap-2">
                <Video size={14} className="text-yellow-600" /> URL Vidéo Directe (MP4, etc.)
              </label>
              <input 
                type="text"
                className="w-full bg-black border border-white/10 rounded-xl p-5 text-white font-mono text-xs outline-none focus:border-yellow-600 transition-all shadow-inner"
                value={videoUrl}
                onChange={e => setVideoUrl(e.target.value)}
                placeholder="Entrez l'URL directe de la vidéo..."
              />
              <p className="text-[8px] text-neutral-600 font-bold uppercase tracking-widest">Si renseignée, cette vidéo sera prioritaire sur l'Iframe.</p>
           </div>

           <PrimaryButton fullWidth onClick={() => handleSaveConfig(false)} isLoading={isSaving}>Mettre à jour les paramètres</PrimaryButton>
           
           {success && (
             <div className="p-3 bg-emerald-600/10 border border-emerald-500/20 rounded-xl flex items-center justify-center gap-3 animate-fade-in">
               <CheckCircle2 size={16} className="text-emerald-500" />
               <span className="text-[9px] font-black uppercase text-emerald-500">Modifications appliquées avec succès</span>
             </div>
           )}
        </div>
      </GoldBorderCard>

      <div className="space-y-6 px-2 md:px-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-xl font-black uppercase"><ImageIcon className="inline mr-2 text-purple-500"/> Bibliothèque de <GoldText>Preuves Sociales</GoldText></h3>
          <button onClick={() => setShowProofForm(!showProofForm)} className="w-full sm:w-auto px-5 py-3 bg-white/5 border border-white/10 rounded-xl font-black uppercase text-[10px] hover:bg-white/10 transition-all">
            {showProofForm ? 'Fermer' : 'Nouvelle Preuve'}
          </button>
        </div>

        {showProofForm && (
          <GoldBorderCard className="p-6 md:p-8 bg-[#080808] border-purple-500/20 animate-slide-down">
            <form onSubmit={handleSaveProof} className="space-y-8">
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-neutral-500">Ambassadeur</label>
                    <input required className="w-full bg-black border border-white/10 rounded-xl p-4 text-white text-xs" placeholder="Ex: Valdes" value={proofForm.name} onChange={e => setProofForm({...proofForm, name: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-neutral-500">Délai des résultats</label>
                    <input required className="w-full bg-black border border-white/10 rounded-xl p-4 text-white text-xs" placeholder="Ex: 14 jours" value={proofForm.time_frame} onChange={e => setProofForm({...proofForm, time_frame: e.target.value})} />
                  </div>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-4">
                     <p className="text-[10px] font-black uppercase text-center text-neutral-500 tracking-widest">AVANT (MODE STANDARD)</p>
                     <input required className="w-full bg-black border border-white/10 rounded-xl p-3 text-center text-[10px] text-white" placeholder="Gains (Ex: 0)" value={proofForm.before_amount} onChange={e => setProofForm({...proofForm, before_amount: e.target.value})} />
                     <div onClick={() => fileInputBeforeRef.current?.click()} className="aspect-[9/16] border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 overflow-hidden group">
                        {uploadProgress.before ? <Loader2 className="animate-spin text-yellow-500" /> : proofForm.before_image_url ? <img src={proofForm.before_image_url} className="w-full h-full object-cover" /> : <><Upload size={24} className="text-neutral-700 group-hover:text-yellow-600 transition-colors"/><span className="text-[8px] font-black uppercase mt-2 text-neutral-600 text-center px-4">Capture Standard</span></>}
                     </div>
                     <input type="file" ref={fileInputBeforeRef} className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'before')} />
                  </div>

                  <div className="space-y-4">
                     <p className="text-[10px] font-black uppercase text-center text-purple-400 tracking-widest">APRÈS (MODE PREMIUM)</p>
                     <input required className="w-full bg-black border border-white/10 rounded-xl p-3 text-center text-[10px] text-white" placeholder="Gains (Ex: 95000)" value={proofForm.after_amount} onChange={e => setProofForm({...proofForm, after_amount: e.target.value})} />
                     <div onClick={() => fileInputAfterRef.current?.click()} className="aspect-[9/16] border-2 border-dashed border-purple-500/20 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-purple-600/5 overflow-hidden group">
                        {uploadProgress.after ? <Loader2 className="animate-spin text-purple-500" /> : proofForm.after_image_url ? <img src={proofForm.after_image_url} className="w-full h-full object-cover" /> : <><Upload size={24} className="text-neutral-700 group-hover:text-purple-700 transition-colors"/><span className="text-[8px] font-black uppercase mt-2 text-purple-700 text-center px-4">Capture Premium</span></>}
                     </div>
                     <input type="file" ref={fileInputAfterRef} className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'after')} />
                  </div>
               </div>
               <PrimaryButton type="submit" fullWidth isLoading={isSavingProof}>Publier cette transformation</PrimaryButton>
            </form>
          </GoldBorderCard>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {proofs.map(p => (
            <div key={p.id} className="p-4 bg-neutral-900/40 border border-white/5 rounded-2xl flex items-center justify-between group hover:border-purple-500/20 transition-all">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-black shrink-0 border border-white/5"><img src={p.after_image_url} className="w-full h-full object-cover" /></div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase text-white truncate">{p.name}</p>
                  <p className="text-[8px] text-neutral-600 uppercase font-bold">
                    {isNaN(parseInt(p.after_amount)) ? p.after_amount : <CurrencyDisplay amount={parseInt(p.after_amount)} inline />}
                  </p>
                </div>
              </div>
              <button onClick={() => deleteProof(p.id)} className="p-2 text-neutral-700 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
