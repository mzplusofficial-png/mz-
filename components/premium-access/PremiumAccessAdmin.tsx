
import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase.ts';
import { GoldBorderCard, PrimaryButton, GoldText } from '../UI.tsx';
import { ShieldCheck, Lock, Unlock, Calendar, Loader2, Save } from 'lucide-react';

export const PremiumAccessAdmin: React.FC = () => {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      const { data } = await supabase
        .from('mz_premium_access_config')
        .select('*')
        .eq('id', 'global-config')
        .maybeSingle();
      
      if (data) {
        setConfig(data);
      } else {
        setConfig({ id: 'global-config', is_enabled: true, reopening_date: 'Dimanche 17 mars' });
      }
      setLoading(false);
    };
    fetchConfig();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // On s'assure d'envoyer un objet propre avec l'ID correct pour l'upsert
      const payload = {
        id: 'global-config',
        is_enabled: Boolean(config.is_enabled),
        reopening_date: config.reopening_date || 'Bientôt',
        updated_at: new Date().toISOString()
      };

      console.log("Saving Premium Access Config:", payload);

      const { error } = await supabase
        .from('mz_premium_access_config')
        .upsert(payload, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        });
      
      if (error) throw error;
      
      // On rafraîchit l'état local avec les données confirmées
      setConfig(payload);
      alert("Configuration d'accès Premium mise à jour avec succès !");
    } catch (err: any) {
      console.error("Save error:", err);
      alert("Erreur lors de la sauvegarde : " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || !config) return (
    <div className="flex items-center justify-center p-20">
      <Loader2 className="animate-spin text-purple-500" size={32} />
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-purple-600/10 rounded-2xl border border-purple-500/20">
          <ShieldCheck className="text-purple-500" size={24} />
        </div>
        <div>
          <h3 className="text-xl font-black uppercase tracking-tight">Contrôle d'Accès <GoldText>MZ+ Premium</GoldText></h3>
          <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">Gérer la rareté et les ouvertures de places</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <GoldBorderCard className="p-8 space-y-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-black uppercase text-white">État de l'accès</p>
                <p className="text-[10px] text-neutral-500 font-medium uppercase">Activer ou désactiver les inscriptions</p>
              </div>
              <button 
                onClick={() => setConfig({ ...config, is_enabled: !config.is_enabled })}
                className={`relative w-16 h-8 rounded-full transition-all duration-300 ${config.is_enabled ? 'bg-emerald-600 shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'bg-red-600 shadow-[0_0_20px_rgba(220,38,38,0.4)]'}`}
              >
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-300 shadow-lg flex items-center justify-center ${config.is_enabled ? 'left-9' : 'left-1'}`}>
                  {config.is_enabled ? <Unlock size={12} className="text-emerald-600" /> : <Lock size={12} className="text-red-600" />}
                </div>
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-black/40 border border-white/5 space-y-4">
              <div className="flex items-center gap-3 text-neutral-400">
                <Calendar size={18} />
                <label className="text-[10px] font-black uppercase tracking-widest">Date de réouverture (Affichée si désactivé)</label>
              </div>
              <input 
                type="text"
                className="w-full bg-neutral-900 border border-white/10 rounded-xl p-4 text-sm text-white outline-none focus:border-purple-500 transition-all font-bold"
                placeholder="Ex: Dimanche 17 mars"
                value={config.reopening_date}
                onChange={e => setConfig({ ...config, reopening_date: e.target.value })}
              />
            </div>
          </div>

          <PrimaryButton 
            onClick={handleSave} 
            isLoading={isSaving} 
            fullWidth 
            size="lg"
            className="shadow-2xl"
          >
            <Save size={18} className="mr-2" /> Enregistrer la configuration
          </PrimaryButton>
        </GoldBorderCard>

        <div className="space-y-6">
          <h4 className="text-xs font-black uppercase tracking-widest text-neutral-500 px-2">Aperçu du comportement</h4>
          <div className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] space-y-6">
            <div className="flex items-start gap-4">
              <div className={`p-2 rounded-lg ${config.is_enabled ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                {config.is_enabled ? <Unlock size={16} /> : <Lock size={16} />}
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-black uppercase text-white">
                  {config.is_enabled ? "Accès Ouvert" : "Accès Fermé"}
                </p>
                <p className="text-[9px] text-neutral-500 font-medium leading-relaxed">
                  {config.is_enabled 
                    ? "Les utilisateurs peuvent cliquer sur les boutons de paiement et être redirigés normalement." 
                    : `Les utilisateurs verront le message d'indisponibilité avec la date : ${config.reopening_date}`}
                </p>
              </div>
            </div>

            {!config.is_enabled && (
              <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-xl space-y-2">
                <p className="text-[8px] font-black text-red-500 uppercase tracking-widest">Message affiché :</p>
                <p className="text-[9px] text-neutral-400 italic">
                  "L’accès à MZ+ Premium vient d’être fermé. Les places ont été complétées plus rapidement que prévu..."
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
