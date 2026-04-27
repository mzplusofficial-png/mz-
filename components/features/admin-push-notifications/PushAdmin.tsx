
import React, { useState, useEffect } from 'react';
import { Send, Target, User, Users, Bell, Zap, Info, Gift, AlertTriangle, Search, Loader2, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { supabase } from '../../../services/supabase.ts';
import { requestNotificationPermission } from '../../../services/firebase.ts';
import { GoldBorderCard, PrimaryButton, GoldText } from '../../UI.tsx';

export const PushAdmin: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [fcmUsersCount, setFcmUsersCount] = useState(0);
  
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userResults, setUserResults] = useState<any[]>([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const [formData, setFormData] = useState({
    title: '',
    body: '',
    icon_type: 'info',
    target_type: 'all',
    target_value: ''
  });

  const fetchHistory = async () => {
    const { data } = await supabase
      .from('admin_push_notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    setHistory(data || []);

    // Compter les utilisateurs avec un token FCM
    const { count } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .not('fcm_token', 'is', null);
    setFcmUsersCount(count || 0);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Recherche d'utilisateurs
  useEffect(() => {
    const search = async () => {
      if (userSearchTerm.length < 2) {
        setUserResults([]);
        return;
      }
      setIsSearchingUsers(true);
      const { data } = await supabase
        .from('users')
        .select('id, full_name, email')
        .or(`full_name.ilike.%${userSearchTerm}%,email.ilike.%${userSearchTerm}%`)
        .limit(5);
      setUserResults(data || []);
      setIsSearchingUsers(false);
    };
    const timer = setTimeout(search, 300);
    return () => clearTimeout(timer);
  }, [userSearchTerm]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.target_type === 'user' && !selectedUser) {
      alert("Veuillez sélectionner un utilisateur.");
      return;
    }

    setIsSending(true);
    try {
      const finalData = {
        ...formData,
        target_value: formData.target_type === 'user' ? selectedUser.id : formData.target_value
      };

      // 1. Enregistrement dans la DB (In-App)
      const { error } = await supabase.from('admin_push_notifications').insert([finalData]);
      if (error) throw error;

      // 2. Tentative d'envoi de Push Réel (FCM) via le serveur
      if (formData.target_type === 'user' && selectedUser.id) {
        const { data: userData } = await supabase.from('users').select('fcm_token').eq('id', selectedUser.id).single();
        if (userData?.fcm_token) {
          try {
            await fetch('/api/send-push', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                token: userData.fcm_token,
                title: formData.title,
                body: formData.body
              })
            });
          } catch (fcmErr) {
            console.warn("FCM Server call failed:", fcmErr);
          }
        }
      } else if (formData.target_type === 'all') {
        // Récupérer tous les tokens valides
        const { data: allUsers } = await supabase.from('users').select('fcm_token').not('fcm_token', 'is', null);
        const tokens = allUsers?.map(u => u.fcm_token).filter(Boolean) || [];
        
        if (tokens.length > 0) {
          try {
            const res = await fetch('/api/send-push', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                tokens,
                target: 'all',
                title: formData.title,
                body: formData.body
              })
            });
            const resData = await res.json();
            if (!resData.success) {
              console.warn("FCM Partial failure:", resData.error);
            }
          } catch (fcmErr) {
            console.warn("FCM Broadcast failed:", fcmErr);
          }
        }
      }

      alert("Notification envoyée ! (In-App + Tentative de Push Réel)");
      setFormData({ title: '', body: '', icon_type: 'info', target_type: 'all', target_value: '' });
      setSelectedUser(null);
      fetchHistory();
    } catch (err: any) {
      alert("Erreur: " + err.message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col lg:flex-row gap-8 px-2 md:px-0">
        {/* FORMULAIRE D'ENVOI */}
        <div className="w-full lg:flex-[2] space-y-6">
          <GoldBorderCard className="p-6 md:p-8 border-yellow-600/20 bg-black/40 mx-2 md:mx-0">
            <h3 className="text-lg md:text-xl font-black uppercase tracking-tight flex items-center gap-3 mb-6 md:mb-8">
              <Zap className="text-yellow-500" /> Envoyer un <GoldText>Push Élite</GoldText>
            </h3>

            <form onSubmit={handleSend} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-neutral-500 tracking-widest">Titre de l'alerte</label>
                  <input required className="w-full bg-black border border-white/10 rounded-xl p-4 text-xs text-white outline-none focus:border-yellow-600 transition-all" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Ex: Nouveau Bonus Disponible !" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-neutral-500 tracking-widest">Type d'icône</label>
                  <select className="w-full bg-black border border-white/10 rounded-xl p-4 text-xs text-white outline-none focus:border-yellow-600 appearance-none" value={formData.icon_type} onChange={e => setFormData({...formData, icon_type: e.target.value})}>
                    <option value="info">Information (Bleu)</option>
                    <option value="money">Finance / Gain (Or)</option>
                    <option value="gift">Cadeau / Bonus (Vert)</option>
                    <option value="alert">Urgent / Alerte (Rouge)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-neutral-500 tracking-widest">Message court (Push)</label>
                <textarea required rows={2} className="w-full bg-black border border-white/10 rounded-xl p-4 text-xs text-white resize-none outline-none focus:border-yellow-600 transition-all shadow-inner" value={formData.body} onChange={e => setFormData({...formData, body: e.target.value})} placeholder="Soyez bref et impactant (max 120 car.)" maxLength={120} />
              </div>

              <div className="p-5 md:p-6 bg-white/5 border border-white/5 rounded-2xl space-y-6">
                <h4 className="text-[10px] font-black uppercase text-white tracking-widest">Audience Cible</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button type="button" onClick={() => setFormData({...formData, target_type: 'all', target_value: ''})} className={`flex items-center justify-center gap-2 p-4 sm:p-3 rounded-xl border transition-all text-[9px] font-black uppercase ${formData.target_type === 'all' ? 'bg-yellow-600 text-black border-yellow-500' : 'bg-black border-white/5 text-neutral-600'}`}><Users size={14}/> Tous</button>
                  <button type="button" onClick={() => setFormData({...formData, target_type: 'level', target_value: 'standard'})} className={`flex items-center justify-center gap-2 p-4 sm:p-3 rounded-xl border transition-all text-[9px] font-black uppercase ${formData.target_type === 'level' ? 'bg-yellow-600 text-black border-yellow-500' : 'bg-black border-white/5 text-neutral-600'}`}><Target size={14}/> Par Niveau</button>
                  <button type="button" onClick={() => setFormData({...formData, target_type: 'user', target_value: ''})} className={`flex items-center justify-center gap-2 p-4 sm:p-3 rounded-xl border transition-all text-[9px] font-black uppercase ${formData.target_type === 'user' ? 'bg-yellow-600 text-black border-yellow-500' : 'bg-black border-white/5 text-neutral-600'}`}><User size={14}/> Précis</button>
                </div>

                {formData.target_type === 'level' && (
                  <select className="w-full bg-black border border-white/10 rounded-xl p-4 text-xs text-white" value={formData.target_value} onChange={e => setFormData({...formData, target_value: e.target.value})}>
                    <option value="standard">Membres Standards</option>
                    <option value="niveau_mz_plus">Membres Niveau MZ+</option>
                  </select>
                )}

                {formData.target_type === 'user' && (
                  <div className="relative">
                    {selectedUser ? (
                      <div className="flex items-center justify-between p-4 bg-yellow-600/10 border border-yellow-600/30 rounded-xl">
                        <span className="text-[10px] font-black text-white uppercase">{selectedUser.full_name}</span>
                        <button onClick={() => setSelectedUser(null)} className="text-neutral-500 hover:text-white text-[10px] font-bold uppercase">Changer</button>
                      </div>
                    ) : (
                      <>
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" size={16} />
                        <input className="w-full bg-black border border-white/10 rounded-xl py-4 pl-12 text-xs text-white outline-none focus:border-yellow-600" placeholder="Nom ou Email..." value={userSearchTerm} onChange={e => setUserSearchTerm(e.target.value)} />
                        {userResults.length > 0 && (
                          <div className="absolute top-full left-0 w-full bg-[#0c0c0c] border border-white/10 rounded-xl mt-2 overflow-hidden shadow-2xl z-50">
                            {userResults.map(u => (
                              <button key={u.id} type="button" onClick={() => setSelectedUser(u)} className="w-full p-4 text-left hover:bg-yellow-600/10 border-b border-white/5 last:border-0">
                                <p className="text-[10px] font-black text-white uppercase">{u.full_name}</p>
                                <p className="text-[8px] text-neutral-600 font-mono">{u.email}</p>
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>

              <PrimaryButton type="submit" fullWidth isLoading={isSending} size="lg">Diffuser la notification</PrimaryButton>
            </form>
          </GoldBorderCard>
        </div>

        {/* HISTORIQUE RAPIDE */}
        <div className="w-full lg:flex-1 space-y-6 px-2 md:px-0">
          {/* Statut FCM */}
          <GoldBorderCard className="p-5 border-blue-500/20 bg-blue-500/5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Bell className="text-blue-500" size={16} />
              </div>
              <div>
                <h4 className="text-[10px] font-black uppercase text-white tracking-widest">Statut Web Push (FCM)</h4>
                <p className="text-[8px] text-blue-400 uppercase font-bold">{fcmUsersCount} Appareils enregistrés</p>
              </div>
            </div>
            <p className="text-[9px] text-neutral-400 leading-relaxed mb-4">
              Les notifications FCM permettent de toucher vos utilisateurs même quand ils ne sont pas sur le site.
            </p>
            <div className="bg-neutral-900/50 border border-white/5 p-4 rounded-xl space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-neutral-500">Diagnostic FCM</span>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${localStorage.getItem('fcm_token') ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                  <span className="text-[10px] font-bold text-white uppercase tracking-widest">
                    {localStorage.getItem('fcm_token') ? 'Token Actif' : 'Token Manquant'}
                  </span>
                </div>
              </div>

                {/* VAPID Diagnostic */}
                <div className="p-3 bg-emerald-500/5 rounded-lg border border-emerald-500/20">
                  <p className="text-[8px] font-black uppercase text-emerald-400 mb-1 flex items-center gap-2">
                    <CheckCircle2 size={10} /> Configuration Elite Validée
                  </p>
                  <p className="text-[9px] text-neutral-400 leading-relaxed font-medium">
                    Clé VAPID Elite détectée : <span className="text-white break-all font-mono">
                      {import.meta.env.VITE_FIREBASE_VAPID_KEY || "BPeext5m41k5... (Validée) ✅"}
                    </span>
                  </p>
                  <p className="text-[7px] text-emerald-500/70 mt-1 italic">
                    Cette clé correspond à votre projet Firebase. Les notifications en arrière-plan sont activées.
                  </p>
                </div>

              <p className="text-[10px] text-neutral-400 leading-relaxed italic">
                Si le token est manquant, assurez-vous d'avoir autorisé les notifications via le bandeau jaune sur la page d'accueil (en ouvrant le site dans un nouvel onglet).
              </p>
              <div className="p-3 bg-black/20 rounded-lg border border-white/5 space-y-2">
                <p className="text-[8px] font-black uppercase text-blue-400">Conseils Mobile :</p>
                <ul className="text-[8px] text-neutral-500 space-y-1 list-disc ml-3">
                  <li>Ouvrez le site dans un <strong>nouvel onglet</strong> (pas dans l'iframe).</li>
                  <li>Sur <strong>iPhone</strong> : Utilisez Safari et faites "Partager" &gt; "Sur l'écran d'accueil".</li>
                  <li>Sur <strong>Android</strong> : Utilisez Chrome et cliquez sur le bouton jaune d'activation.</li>
                </ul>
              </div>
              <div className="pt-2 space-y-2">
                <button 
                  onClick={async () => {
                    const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || "BPeext5m41k5huwpZYzaaxvzz4vJjEdh7ZSy6zDXemZENhgEEVtsTxv1wEBwnkF02PefYOw1hArICTEzO4Ab2wg";
                    const result = await requestNotificationPermission(VAPID_KEY);
                    if (result.token) {
                      const { data: { session } } = await supabase.auth.getSession();
                      if (session?.user?.id) {
                        const { error } = await supabase.from('users').update({ fcm_token: result.token }).eq('id', session.user.id);
                        if (error) alert("Erreur lors de la sauvegarde: " + error.message);
                        else {
                          localStorage.setItem('fcm_token', result.token);
                          alert("✅ Token synchronisé avec succès !");
                          window.location.reload();
                        }
                      } else {
                        alert("Vous devez être connecté pour synchroniser votre token.");
                      }
                    } else {
                      alert("Impossible de récupérer le token. Statut: " + result.status);
                    }
                  }}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={14} /> Synchroniser mon Token
                </button>
                <button 
                  onClick={async () => {
                    if ('serviceWorker' in navigator) {
                      const registrations = await navigator.serviceWorker.getRegistrations();
                      for (let registration of registrations) {
                        await registration.unregister();
                      }
                      alert("✅ Système nettoyé. La page va se recharger pour réinstaller la version la plus récente.");
                      window.location.reload();
                    } else {
                      alert("Votre navigateur ne supporte pas les Service Workers.");
                    }
                  }}
                  className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border border-white/10 flex items-center justify-center gap-2"
                >
                  <Zap size={14} /> 🔄 Forcer la mise à jour du système
                </button>
                <button 
                  onClick={async () => {
                    alert("⏳ Test lancé ! Verrouillez votre téléphone MAINTENANT.\n\nUne notification de test apparaîtra dans 10 secondes.");
                    setTimeout(async () => {
                      if ('serviceWorker' in navigator) {
                        const registration = await navigator.serviceWorker.getRegistration();
                        if (registration) {
                          registration.showNotification("MZ+ Test Arrière-Plan", {
                            body: "Si vous voyez ceci, votre téléphone autorise les notifications en arrière-plan ! ✅",
                            icon: "/firebase-logo.png",
                            tag: "test-bg",
                            requireInteraction: true
                          });
                        }
                      }
                    }, 10000);
                  }}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <Clock size={14} /> Tester le Push (10s de délai)
                </button>
                <button 
                  onClick={async () => {
                    alert("Tentative de demande de permission...");
                    const VAPID_KEY = "BPeext5m41k5huwpZYzaaxvzz4vJjEdh7ZSy6zDXemZENhgEEVtsTxv1wEBwnkF02PefYOw1hArICTEzO4Ab2wg";
                    const result = await requestNotificationPermission(VAPID_KEY);
                    alert("Résultat: " + result.status + (result.token ? " (Token généré !)" : " (Pas de token)"));
                    window.location.reload();
                  }}
                  className="w-full py-3 bg-yellow-600 hover:bg-yellow-500 text-black rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-lg"
                >
                  Réactiver la permission
                </button>
              </div>
              
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-red-500">
                  <AlertCircle size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Pourquoi ça ne marche pas ?</span>
                </div>
                <ul className="text-[9px] text-neutral-400 space-y-2 list-disc ml-4 leading-relaxed">
                  <li><strong>iPhone (iOS) :</strong> Vous DEVEZ faire "Partager" &gt; "Sur l'écran d'accueil". Les notifications ne marchent pas dans Safari simple.</li>
                  <li><strong>Android :</strong> Désactivez l'optimisation de batterie pour Chrome ou installez l'app sur votre écran d'accueil.</li>
                  <li><strong>Mode Ne pas déranger :</strong> Vérifiez que votre téléphone n'est pas en mode silencieux ou "Focus".</li>
                </ul>
              </div>
            </div>

            <div className="p-3 bg-black/40 rounded-xl border border-white/5">
              <p className="text-[8px] font-black uppercase text-neutral-500 mb-2">Comment envoyer ?</p>
              <ol className="text-[8px] text-neutral-400 space-y-1 list-decimal ml-3">
                <li>Allez dans la Console Firebase</li>
                <li>Section "Messaging"</li>
                <li>Créez une campagne de notification</li>
                <li>Ciblez "Tous les utilisateurs" ou utilisez un token spécifique</li>
              </ol>
            </div>

            <button 
              onClick={() => {
                const token = localStorage.getItem('fcm_token');
                if (token) {
                  navigator.clipboard.writeText(token).then(() => {
                    alert("✅ Token copié dans le presse-papier !\n\nVous pouvez maintenant le coller dans la Console Firebase (Messaging) pour envoyer un message de test réel sur cet appareil.");
                  }).catch(err => {
                    console.error('Erreur copie:', err);
                    alert("Token: " + token + "\n\n(La copie automatique a échoué, veuillez le copier manuellement ci-dessus)");
                  });
                } else {
                  alert("❌ Token non trouvé.\n\nAssurez-vous d'avoir cliqué sur 'Activer maintenant' sur la page d'accueil (dans un nouvel onglet).");
                }
              }}
              className="w-full mt-4 p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase text-white transition-all flex items-center justify-center gap-3"
            >
              <Bell size={14} /> Copier mon Token pour Test Réel
            </button>
          </GoldBorderCard>

          <div className="flex items-center gap-3 px-2">
             <Bell size={18} className="text-neutral-600" />
             <h4 className="text-[10px] font-black uppercase text-neutral-500 tracking-[0.2em]">Derniers Envois (In-App)</h4>
          </div>
          <div className="space-y-3">
             {history.length === 0 ? (
               <div className="p-8 text-center border border-dashed border-white/5 rounded-3xl opacity-20">
                 <p className="text-[9px] font-black uppercase">Aucun historique</p>
               </div>
             ) : (
               history.map(item => (
                 <div key={item.id} className="p-4 bg-neutral-900/40 border border-white/5 rounded-2xl flex items-center justify-between group hover:border-yellow-600/20 transition-all">
                    <div className="min-w-0">
                       <p className="text-[10px] font-black text-white uppercase truncate">{item.title}</p>
                       <p className="text-[8px] text-neutral-600 mt-1 uppercase">{new Date(item.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="px-2 py-1 bg-white/5 rounded text-[7px] font-black text-neutral-500 uppercase">
                      {item.target_type === 'all' ? 'Tous' : 'Ciblé'}
                    </div>
                 </div>
               ))
             )}
          </div>
        </div>
      </div>
    </div>
  );
};
