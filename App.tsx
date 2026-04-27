
import React, { useState, useEffect, useCallback } from 'react';
import { Loader, Sparkles, X, AlertTriangle, Bell, Crown } from 'lucide-react';
import { supabase } from './services/supabase.ts';
import { UserProfile, Wallet, TabId, Product } from './types.ts';
import { LandingPage } from './components/LandingPage.tsx';
import { DashboardLayout } from './components/DashboardLayout.tsx';
import { 
  GlobalView, 
  RevenueTab, 
  TeamTab, 
  RPADashboard, 
  CoachingTab, 
  FormationTab, 
  UpgradeTab, 
  SuggestionsTab,
  GuidesTab,
  ProfileTab
} from './components/DashboardTabs.tsx';
import { motion, AnimatePresence } from 'motion/react';
import { RewardFeature } from './components/features/programme-recompense/RewardFeature.tsx';
import { AffiliationSystem } from './components/AffiliationSystem.tsx';
import { PWAInstallBanner } from './components/ui/PWAInstallBanner.tsx';
import { AdminPanel } from './components/AdminPanel.tsx';
import { ProductSalesPage } from './components/ProductSalesPage.tsx';
import { EspacePrive } from './components/EspacePrive.tsx';
import { MZPlusFlashOfferOverlay } from './components/features/mz-plus-offer/MZPlusFlashOfferOverlay.tsx';
import { MZPlusPresentationOverlay } from './components/features/mz-plus-presentation/MZPlusPresentationOverlay.tsx';
import { LunaChatPage } from './components/LunaChatPage.tsx';
import { SQLConsole } from './components/SQLConsole.tsx';
import { PrivateMessagingMain } from './components/features/messagerie-privee/PrivateMessagingMain.tsx';
import { PushDisplay } from './components/features/admin-push-notifications/PushDisplay.tsx';
import { AnnouncementOverlay } from './components/features/marketing-announcements/AnnouncementOverlay.tsx';
import { AffiliationGuide } from './components/guides/AffiliationGuide.tsx';
import { RPAGuide } from './components/guides/RPAGuide.tsx';
import { TeamGuide } from './components/guides/TeamGuide.tsx';
import { PremiumPopup } from './components/PremiumPopup.tsx';
import { PremiumAccessGate } from './components/premium-access/PremiumAccessGate.tsx';
import { requestNotificationPermission, onMessageListener, auth, db, handleFirestoreError, OperationType } from './services/firebase.ts';
import { signInAnonymously } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

const ADMIN_EMAILS = [
  'equipemzplus@gmail.com',
  'millionairezoneplus@gmail.com',
  'admin@mz.plus'
];

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [teamCount, setTeamCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isProductChecked, setIsProductChecked] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [activeCategory, setActiveCategory] = useState<string>('main');
  const [lastUpdateSignal, setLastUpdateSignal] = useState<number>(Date.now());
  const [customerProduct, setCustomerProduct] = useState<Product | null>(null);
  const [referrerId, setReferrerId] = useState<string | null>(null);
  const [purchaseStep, setPurchaseStep] = useState<'view' | 'processing' | 'success'>('view');
  const [isGuideActive, setIsGuideActive] = useState(false);
  const [isRPAGuideActive, setIsRPAGuideActive] = useState(false);
  const [isTeamGuideActive, setIsTeamGuideActive] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ title: string; body: string; type?: 'info' | 'error' | 'warning' } | null>(null);
  const [showPermissionBanner, setShowPermissionBanner] = useState(false);
  const [initSequence, setInitSequence] = useState(true);

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => setInitSequence(false), 3500);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  const setupFCM = async (isManual = false) => {
    // ESSENTIEL : Récupérer la clé VAPID depuis l'environnement ou utiliser une clé de secours
    // Si la notification ne fonctionne pas, l'utilisateur DOIT configurer VITE_FIREBASE_VAPID_KEY
    const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || "BPeext5m41k5huwpZYzaaxvzz4vJjEdh7ZSy6zDXemZENhgEEVtsTxv1wEBwnkF02PefYOw1hArICTEzO4Ab2wg";
    
    if (!VAPID_KEY) {
       console.warn('FCM: No VAPID key provided. Push will not work.');
       return;
    }

    const result = await requestNotificationPermission(VAPID_KEY);
    console.log('FCM Registration Result:', result);
    
    if (result.status === 'unsupported') {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      if (isManual) {
        setNotification({
          title: 'Appareil Non Compatible',
          body: isIOS 
            ? 'Sur iPhone, les notifications nécessitent Safari et "Ajouter à l\'écran d\'accueil".' 
            : 'Votre navigateur actuel ne supporte pas les notifications Push.',
          type: 'warning'
        });
      }
      setShowPermissionBanner(false);
    } else if (result.status === 'denied') {
      if (isManual) {
        setNotification({
          title: 'Notifications Bloquées',
          body: 'Veuillez réactiver les notifications dans les paramètres de votre navigateur.',
          type: 'error'
        });
      }
      setShowPermissionBanner(false);
    } else if (result.token) {
      console.log('FCM Token Generated:', result.token);
      setFcmToken(result.token);
      localStorage.setItem('fcm_token', result.token);
      setShowPermissionBanner(false);
      
      if (session?.user?.id) {
        await supabase.from('users').update({ 
          fcm_token: result.token,
          last_fcm_sync: new Date().toISOString() 
        }).eq('id', session.user.id);
      }
    }
  };

  // Handle FCM Notifications
  useEffect(() => {
    if (session) {
      setupFCM();
    }
  }, [session]);

  // Listen for foreground messages
  useEffect(() => {
    if (!session) return;
    
    const unsubscribe = onMessageListener((payload: any) => {
      if (payload?.notification) {
        setNotification({
          title: payload.notification.title,
          body: payload.notification.body,
        });
        
        // Optionnel: Déclencher une notification système même si l'app est ouverte
        if ('serviceWorker' in navigator && Notification.permission === 'granted') {
          navigator.serviceWorker.ready.then(registration => {
            registration.showNotification(payload.notification.title, {
              body: payload.notification.body,
              icon: '/firebase-logo.png',
              tag: 'mz-plus-push-foreground'
            });
          });
        }

        // Auto-hide in-app notification after 5 seconds
        setTimeout(() => setNotification(null), 5000);
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') (unsubscribe as any)();
    };
  }, [session]);

  useEffect(() => {
    if (session && userProfile && !localStorage.getItem('mz_guide_completed')) {
      const timer = setTimeout(() => {
        setIsGuideActive(true);
        localStorage.setItem('mz_guide_completed', 'true');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [session, userProfile]);

  // Sync PWA Branding from Database
  useEffect(() => {
    const syncBranding = async () => {
      try {
        const { data } = await supabase.from('mz_app_config').select('*').eq('id', 'main-config').maybeSingle();
        if (data) {
          if (data.app_name) {
            localStorage.setItem('pwa_custom_name', data.app_name);
            document.title = data.app_name;
          }
          if (data.icon_base64) {
            localStorage.setItem('pwa_custom_icon', data.icon_base64);
            const iconEl = document.querySelector('link[rel="icon"]');
            if (iconEl) iconEl.setAttribute('href', data.icon_base64);
            const appleIconEl = document.querySelector('link[rel="apple-touch-icon"]');
            if (appleIconEl) appleIconEl.setAttribute('href', data.icon_base64);
          }
        }
      } catch (e) {
        console.warn("Branding sync failed (ignore if table doesn't exist yet):", e);
      }
    };
    syncBranding();
  }, []);

  // Firebase Shadow Sync : Sync Supabase profile to Firestore for real-time features
  useEffect(() => {
    const syncToFirebase = async () => {
      if (!userProfile?.id) return;

      try {
        // 1. Ensure Firebase Auth is signed in (Anonymously for now)
        let firebaseUid = auth.currentUser?.uid;
        if (!auth.currentUser) {
          const cred = await signInAnonymously(auth);
          firebaseUid = cred.user.uid;
          console.log("Firebase: Signed in anonymously for shadow sync", firebaseUid);
        }

        if (!firebaseUid) return;

        // 2. Sync profile to Firestore using Firebase UID as key
        // We store the Supabase ID inside for cross-referencing
        const userRef = doc(db, 'users', firebaseUid);
        await setDoc(userRef, {
          id: firebaseUid,
          supabaseId: userProfile.id,
          fullName: userProfile.full_name,
          email: userProfile.email,
          fcmToken: fcmToken || localStorage.getItem('fcm_token'),
          lastFcmSync: serverTimestamp(),
          userLevel: userProfile.user_level,
          isAdmin: userProfile.is_admin,
          updatedAt: serverTimestamp()
        }, { merge: true });
        
        console.log("Firebase: Profile synced to Firestore (shadow mode)");
      } catch (err) {
        console.error("Firebase: Sync failed", err);
      }
    };

    syncToFirebase();
  }, [userProfile, fcmToken]);

  const fetchUserData = useCallback(async (userId: string, email?: string, fullName?: string, retryCount = 0) => {
    try {
      const userEmail = email?.toLowerCase().trim() || "";
      const isHardcodedAdmin = ADMIN_EMAILS.includes(userEmail);
      
      let { data: profile } = await supabase.from('users').select('*').eq('id', userId).maybeSingle();
      
      if (!profile) {
        const newRefCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        const newProfileData = { 
          id: userId, 
          full_name: fullName || 'Ambassadeur', 
          email: userEmail, 
          referral_code: newRefCode, 
          rank_id: 1, 
          is_admin: isHardcodedAdmin, 
          user_level: 'standard'
        };
        const { data: upsertedProfile } = await supabase.from('users').upsert(newProfileData, { onConflict: 'id' }).select('*').single();
        profile = upsertedProfile || (newProfileData as any);
      }

      const isAdminValue = isHardcodedAdmin || profile?.is_admin === true || !!profile?.admin_role;
      const enrichedProfile: UserProfile = { 
        id: profile?.id || userId, 
        full_name: profile?.full_name || fullName || 'Ambassadeur', 
        referral_code: profile?.referral_code || '---', 
        rank_id: profile?.rank_id || 1, 
        email: profile?.email || userEmail, 
        is_admin: isAdminValue, 
        admin_role: profile?.admin_role || (isHardcodedAdmin ? 'super_admin' : null),
        rpa_balance: Number(profile?.rpa_balance || 0), 
        rpa_points: Number(profile?.rpa_points || 0), 
        user_level: (profile?.user_level as 'standard' | 'niveau_mz_plus') || 'standard', 
        created_at: profile?.created_at 
      };
      setUserProfile(enrichedProfile);

      const [walletRes, teamRes] = await Promise.all([
        supabase.from('wallets').select('*').eq('user_id', userId).maybeSingle(),
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('referral_code_used', enrichedProfile.referral_code)
      ]);

      setWallet(walletRes.data || { id: 'initial', user_id: userId, balance: 0 });
      setTeamCount(teamRes?.count || 0);
    } catch (error: any) {
      console.error("Fetch data error:", error);
      if (retryCount < 2 && (error.message?.includes('fetch') || error.name === 'TypeError')) {
        console.log(`Retrying fetchUserData (${retryCount + 1})...`);
        setTimeout(() => fetchUserData(userId, email, fullName, retryCount + 1), 1500);
        return;
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const getInitialSession = async (retryCount = 0) => {
      try {
        const { data: { session: s } } = await supabase.auth.getSession();
        setSession(s); 
        if (s) fetchUserData(s.user.id, s.user.email, s.user.user_metadata?.full_name); 
        else if (isProductChecked) setLoading(false);
      } catch (error: any) {
        console.error("Initial session fetch error:", error);
        if (retryCount < 3 && (error.message?.includes('fetch') || error.name === 'TypeError')) {
          setTimeout(() => getInitialSession(retryCount + 1), 1000 * (retryCount + 1));
        } else if (isProductChecked) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => { 
      setSession(s); 
      if (s) fetchUserData(s.user.id, s.user.email, s.user.user_metadata?.full_name); 
      else { setUserProfile(null); if (isProductChecked) setLoading(false); } 
    });
    return () => subscription.unsubscribe();
  }, [fetchUserData, isProductChecked]);

  useEffect(() => {
    const checkProduct = async (retryCount = 0) => {
      try {
        const params = new URLSearchParams(window.location.search);
        const prodId = params.get('prod');
        const refCode = params.get('ref');
        const tabParam = params.get('tab') as TabId;

        if (tabParam) {
           setActiveTab(tabParam);
        }

        if (prodId) {
          const { data: product, error } = await supabase.from('products').select('*').eq('id', prodId).maybeSingle();
          if (error) throw error;
          if (product) setCustomerProduct(product);
        }

        if (refCode) {
          const { data: referrer } = await supabase.from('users').select('id').eq('referral_code', refCode).maybeSingle();
          if (referrer && prodId) {
            setReferrerId(referrer.id);
            // Incrémenter le compteur de clics via RPC
            try {
              await supabase.rpc('mz_increment_product_clicks', { 
                p_user_id: referrer.id, 
                p_product_id: prodId 
              });
            } catch (err) {
              console.warn("Erreur incrémentation clics:", err);
            }
          }
        }

        setIsProductChecked(true);
      } catch (error: any) {
        console.error("Check product error:", error);
        if (retryCount < 2 && (error.message?.includes('fetch') || error.name === 'TypeError')) {
          setTimeout(() => checkProduct(retryCount + 1), 1000);
        } else {
          setIsProductChecked(true);
        }
      }
    };
    checkProduct();
  }, []);

  useEffect(() => {
    if (activeTab === 'rpa' && !localStorage.getItem('mz_rpa_guide_completed')) {
      const timer = setTimeout(() => {
        setIsRPAGuideActive(true);
      }, 800);
      return () => clearTimeout(timer);
    }
    if (activeTab === 'team' && !localStorage.getItem('mz_team_guide_completed')) {
      const timer = setTimeout(() => {
        setIsTeamGuideActive(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [activeTab]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const triggerRefresh = () => { 
    if (session?.user?.id) {
      fetchUserData(session.user.id, session.user.email, session.user.user_metadata?.full_name); 
    }
  };

  // GLOBAL HEARTBEAT : Suivi du temps pour le programme de récompense
  useEffect(() => {
    if (!userProfile?.id) return;
    
    const sendHeartbeat = async () => {
      try {
        const { error } = await supabase.rpc('mz_rewards_heartbeat', { p_user_id: userProfile.id });
        if (error) console.warn("Global heartbeat error:", error.message);
      } catch (e) {
        console.warn("Global heartbeat RPC not available");
      }
    };

    // Premier appel immédiat
    sendHeartbeat();
    
    // Puis toutes les 60 secondes (1 minute = 1 point)
    const interval = setInterval(sendHeartbeat, 60000);
    return () => clearInterval(interval);
  }, [userProfile?.id]);

  const handlePurchase = useCallback(async () => {
    setPurchaseStep('processing');
    
    // Enregistrer la commission si un parrain est détecté
    if (referrerId && customerProduct) {
      try {
        const { error: commError } = await supabase.from('commissions').insert([{
          user_id: referrerId,
          product_id: customerProduct.id,
          amount: customerProduct.commission_amount,
          status: 'pending'
        }]);
        
        if (commError) {
          console.error("Erreur lors de l'enregistrement de la commission:", commError);
        } else {
          console.log("Commission enregistrée avec succès pour l'ambassadeur:", referrerId);
        }
      } catch (err) {
        console.error("Exception lors de l'enregistrement de la commission:", err);
      }
    }

    // Redirection vers le lien final du produit
    setTimeout(() => {
      if (customerProduct?.final_link) {
        window.location.href = customerProduct.final_link;
      } else {
        setPurchaseStep('view');
        alert("Lien de redirection manquant pour ce produit.");
      }
    }, 800); // Délai suffisant pour l'enregistrement et l'effet visuel
  }, [customerProduct, referrerId]);

  if (loading || !isProductChecked || initSequence) {
    return <SystemInitiator loading={loading} />;
  }
  
  if (customerProduct) return (<ProductSalesPage product={customerProduct} onPurchase={handlePurchase} purchaseStep={purchaseStep} countdown={900} isLoggedIn={!!session} />);
  if (!session) return <LandingPage />;

  const isAdmin = userProfile?.is_admin === true || !!userProfile?.admin_role;

  return (
    <DashboardLayout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      isAdmin={isAdmin} 
      profile={userProfile}
      isMenuOpen={isMenuOpen}
      setIsMenuOpen={setIsMenuOpen}
    >
      <PremiumAccessGate />
      
      <PushDisplay profile={userProfile} />
      
      {/* Permission Banner for Mobile/Iframe */}
      {showPermissionBanner && (
        <div className="fixed bottom-0 left-0 right-0 z-[10000] bg-yellow-600 p-4 md:p-6 animate-slide-up">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-black/20 rounded-full flex items-center justify-center shrink-0">
                <Bell className="text-white" size={24} />
              </div>
              <div>
                <h4 className="text-white font-black uppercase text-sm tracking-tight">Activer les alertes MZ+</h4>
                <p className="text-yellow-100 text-xs mt-1">Recevez vos gains et bonus en temps réel sur votre mobile.</p>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button 
                onClick={() => setupFCM(true)}
                className="flex-1 md:flex-none bg-white text-yellow-700 font-black uppercase text-[10px] px-6 py-3 rounded-xl shadow-lg hover:bg-neutral-100 transition-all"
              >
                Activer maintenant
              </button>
              <button 
                onClick={() => setShowPermissionBanner(false)}
                className="p-3 text-yellow-200 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>
          {window.self !== window.top && (
            <p className="text-[8px] text-yellow-200/60 text-center mt-3 uppercase font-bold tracking-widest">
              Note: Pour de meilleurs résultats sur mobile, ouvrez le site dans un nouvel onglet.
            </p>
          )}
        </div>
      )}

      {/* Foreground Notification Toast (FCM) */}
      {notification && (
        <div className={`fixed top-4 right-4 z-[9999] bg-neutral-900 border ${notification.type === 'error' ? 'border-red-500/50' : notification.type === 'warning' ? 'border-yellow-500/50' : 'border-yellow-500/30'} p-4 rounded-xl shadow-2xl animate-slide-down max-w-sm pointer-events-auto`}>
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-full ${notification.type === 'error' ? 'bg-red-500/10' : notification.type === 'warning' ? 'bg-yellow-500/10' : 'bg-yellow-500/10'} flex items-center justify-center shrink-0`}>
              {notification.type === 'error' ? (
                <AlertTriangle className="text-red-500" size={20} />
              ) : (
                <Sparkles className="text-yellow-500 animate-pulse" size={20} />
              )}
            </div>
            <div className="flex-1">
              <h4 className={`${notification.type === 'error' ? 'text-red-500' : 'text-yellow-500'} font-bold text-sm`}>{notification.title}</h4>
              <p className="text-neutral-400 text-xs mt-1">{notification.body}</p>
            </div>
            <button 
              onClick={() => setNotification(null)}
              className="text-neutral-500 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
      {/* Désactivation des popups Premium automatiques à la demande de l'utilisateur */}
      {/* <PremiumPopup user={userProfile} /> */}
      {/* <MZPlusPresentationOverlay profile={userProfile} onUpgrade={() => setActiveTab('flash_offer')} /> */}
      <AnnouncementOverlay profile={userProfile} onNavigate={(tab) => setActiveTab(tab as TabId)} />

      {activeTab === 'flash_offer' && <MZPlusFlashOfferOverlay profile={userProfile} onUpgrade={() => setActiveTab('upgrade')} onClose={() => setActiveTab('dashboard')} isFullPage={true} />}
      {activeTab === 'dashboard' && (
        <GlobalView 
          profile={userProfile} 
          onSwitchTab={setActiveTab} 
          onStartGuide={() => {
            if (!localStorage.getItem('mz_guide_completed')) {
              setIsGuideActive(true);
              localStorage.setItem('mz_guide_completed', 'true');
            }
          }}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          wallet={wallet}
        />
      )}
      <AffiliationGuide 
        isActive={isGuideActive} 
        onComplete={() => setIsGuideActive(false)} 
        activeCategory={activeCategory}
        activeTab={activeTab}
      />
      <RPAGuide 
        isActive={isRPAGuideActive} 
        onComplete={() => setIsRPAGuideActive(false)} 
      />
      <TeamGuide 
        isActive={isTeamGuideActive} 
        onComplete={() => setIsTeamGuideActive(false)} 
      />
      {activeTab === 'profile' && <ProfileTab profile={userProfile} onLogout={handleLogout} isAdmin={isAdmin} onSwitchTab={setActiveTab} />}
      {activeTab === 'recompense' && <RewardFeature profile={userProfile} onSwitchTab={setActiveTab} />}
      {activeTab === 'private_chat' && <EspacePrive profile={userProfile} />}
      {activeTab === 'private_messaging' && <PrivateMessagingMain profile={userProfile} />}
      {activeTab === 'revenus' && <RevenueTab profile={userProfile} wallet={wallet} />}
      {activeTab === 'affiliation' && <AffiliationSystem profile={userProfile} lastUpdateSignal={lastUpdateSignal} onSwitchTab={setActiveTab} />}
      {activeTab === 'catalog' && <AffiliationSystem profile={userProfile} lastUpdateSignal={lastUpdateSignal} onSwitchTab={setActiveTab} onlyCatalog={true} />}
      {activeTab === 'team' && <TeamTab profile={userProfile} teamCount={teamCount} onSwitchTab={setActiveTab} />}
      {activeTab === 'coaching' && <CoachingTab profile={userProfile} onSwitchTab={setActiveTab} />}
      {activeTab === 'formation' && <FormationTab profile={userProfile} onSwitchTab={setActiveTab} />}
      {activeTab === 'rpa' && (
        <RPADashboard 
          profile={userProfile} 
          onRefresh={triggerRefresh} 
          onSwitchTab={setActiveTab} 
          onStartGuide={() => {
            localStorage.removeItem('mz_rpa_guide_completed');
            setIsRPAGuideActive(true);
          }}
        />
      )}
      {activeTab === 'suggestions' && <SuggestionsTab profile={userProfile} />}
      {activeTab === 'guides' && (
        <GuidesTab 
          onStartAffiliationGuide={() => {
            localStorage.removeItem('mz_guide_completed');
            setActiveTab('dashboard');
            setIsGuideActive(true);
          }}
          onStartRPAGuide={() => {
            localStorage.removeItem('mz_rpa_guide_completed');
            setActiveTab('rpa');
            setIsRPAGuideActive(true);
          }}
          onStartTeamGuide={() => {
            localStorage.removeItem('mz_team_guide_completed');
            setActiveTab('team');
            setIsTeamGuideActive(true);
          }}
        />
      )}
      {activeTab === 'upgrade' && <UpgradeTab />}
      {activeTab === 'luna_chat' && <LunaChatPage profile={userProfile} onUpgrade={() => setActiveTab('flash_offer')} />}
      {activeTab === 'sql_console' && isAdmin && <SQLConsole profile={userProfile} />}
      {activeTab === 'admin' && isAdmin && <AdminPanel adminProfile={userProfile} lastUpdateSignal={lastUpdateSignal} onRefresh={triggerRefresh} />}
      <PWAInstallBanner />
    </DashboardLayout>
  );
};

const SystemInitiator: React.FC<{ loading: boolean }> = ({ loading }) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Synchronisation du noyau...');

  useEffect(() => {
    if (loading) return;
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    const statusTimers = [
      setTimeout(() => setStatus('Vérification des protocoles de sécurité...'), 800),
      setTimeout(() => setStatus('Accès au réseau neuronal MZ+...'), 1600),
      setTimeout(() => setStatus('Identité Élite confirmée.'), 2400),
      setTimeout(() => setStatus('Initialisation de l\'interface...'), 3000),
    ];

    return () => {
      clearInterval(interval);
      statusTimers.forEach(clearTimeout);
    };
  }, [loading]);

  return (
    <div className="fixed inset-0 z-[1000] bg-[#050505] flex flex-col items-center justify-center p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,16,16,1),rgba(5,5,5,1))]"></div>
      
      <div className="relative z-10 w-full max-w-sm space-y-12 flex flex-col items-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="w-20 h-20 bg-yellow-600 rounded-[2rem] flex items-center justify-center text-black shadow-[0_0_50px_rgba(202,138,4,0.3)] mb-4"
        >
          <Crown size={40} fill="currentColor" />
        </motion.div>

        <div className="space-y-4 w-full text-center">
           <motion.h1 
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             className="text-2xl font-black uppercase tracking-[0.5em] text-white"
           >
             MZ+ Elite System
           </motion.h1>
           <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest animate-pulse">
             {status}
           </p>
        </div>

        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden relative">
          <motion.div 
            className="absolute inset-y-0 left-0 bg-yellow-600 shadow-[0_0_15px_rgba(202,138,4,0.5)]"
            initial={{ width: "0%" }}
            animate={{ width: loading ? "10%" : `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>

        <div className="flex justify-between w-full text-[8px] font-black uppercase tracking-[0.2em] text-neutral-700">
           <span>Core v7.4.2</span>
           <span>Status: Secure</span>
        </div>
      </div>

      <div className="absolute bottom-10 opacity-10">
         <p className="text-[9px] font-black tracking-[1em] text-white uppercase">Neural Link Established</p>
      </div>
    </div>
  );
};

export default App;
