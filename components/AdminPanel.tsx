
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { 
  Users, TrendingUp, Search, LayoutGrid, ClipboardList, Package, Star, Check, X, 
  Wallet, Coins, Tv, Flame, CheckCircle2, Megaphone, BellRing, Video, 
  History, GraduationCap, Plus, Trash2, Edit3, Save, ListPlus, AlertTriangle, 
  RefreshCw, UserCog, ExternalLink, ShieldCheck, Loader2, Target, Image as ImageIcon,
  Home, Monitor, Globe, Code, Info, Upload, FileVideo, UserPlus, Clock, Eye, Activity, MousePointer2,
  Crown, Settings
} from 'lucide-react';

import { supabase } from '../services/supabase.ts';
import { UserProfile, RPASubmission, CoachingRequest, WithdrawalRequest, Formation } from '../types.ts';
import { GoldBorderCard, SectionTitle, PrimaryButton, EliteBadge, GoldText } from './UI.tsx';
import { AffiliationSystem } from './AffiliationSystem.tsx';
import { AdminActivityAudit } from './features/programme-recompense/AdminActivityAudit.tsx';
import { CurrencyDisplay } from './ui/CurrencyDisplay.tsx';
import { MZPlusPresentationAdmin } from './features/mz-plus-presentation/MZPlusPresentationAdmin.tsx';
import { MZPlusFlashOfferAdmin } from './features/mz-plus-offer/MZPlusFlashOfferAdmin.tsx';
import { AnnouncementAdmin } from './features/marketing-announcements/AnnouncementAdmin.tsx';
import { PushAdmin } from './features/admin-push-notifications/PushAdmin.tsx';
import { UserBehaviorAdmin } from './features/admin-behavior/UserBehaviorAdmin.tsx';
import { PremiumWelcomeAdmin } from './features/premium-welcome/PremiumWelcomeAdmin.tsx';

import { PremiumAccessAdmin } from './premium-access/PremiumAccessAdmin.tsx';

type AdminTab = 'stats' | 'users' | 'formations' | 'validation' | 'withdrawals' | 'rpa_validations' | 'coaching' | 'catalog' | 'admin_push' | 'marketing_announcements' | 'flash_offer' | 'activity_audit' | 'home_landing' | 'user_behavior' | 'premium_welcome' | 'mz_presentation' | 'premium_access' | 'pwa_branding';

export const AdminPanel: React.FC<{ 
  adminProfile: UserProfile | null; 
  lastUpdateSignal?: number;
  onRefresh?: () => void;
}> = ({ adminProfile, lastUpdateSignal, onRefresh }) => {
  const isSuperAdmin = adminProfile?.admin_role === 'super_admin' || (adminProfile?.is_admin === true && !adminProfile?.admin_role);
  const isMarketing = adminProfile?.admin_role === 'marketing_admin';
  const isAnyAdmin = isSuperAdmin || isMarketing;

  const [activeSubTab, setActiveSubTab] = useState<AdminTab>('stats');
  const [users, setUsers] = useState<any[]>([]);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [activitySummary, setActivitySummary] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<RPASubmission[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [coachingRequests, setCoachingRequests] = useState<CoachingRequest[]>([]);
  const [stats, setStats] = useState({ totalUsers: 0, totalSales: 0, totalVolume: 0, pendingSales: 0, pendingRpa: 0, pendingWithdrawals: 0, pendingCoaching: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAdminData = useCallback(async (retryCount = 0) => {
    if (retryCount === 0) setLoading(true);
    setError(null);
    try {
      const queries = [
        supabase.from('users').select('*, wallets(balance)').order('created_at', { ascending: false }),
        supabase.from('commissions').select('*, products(name), users:user_id(full_name)').order('created_at', { ascending: false }),
        supabase.from('withdrawals').select('*, users(full_name, email)').order('created_at', { ascending: false }),
        supabase.from('rpa_submissions').select('*, users(full_name, email, rpa_points, rpa_balance)').order('created_at', { ascending: false }),
        supabase.from('coaching_requests').select('*, users(full_name, email, user_level)').order('created_at', { ascending: false }),
        supabase.from('mz_admin_activity_summary').select('*')
      ];

      const [uRes, cRes, wRes, rRes, coachRes, actRes] = await Promise.all(queries);

      // Check for errors in any of the responses
      const errors = [uRes.error, cRes.error, wRes.error, rRes.error, coachRes.error, actRes.error].filter(Boolean);
      if (errors.length > 0) throw errors[0];

      setUsers(uRes.data || []);
      setCommissions(cRes.data || []);
      setActivitySummary(actRes.data || []);
      setWithdrawals(wRes.data || []);
      setSubmissions(rRes.data || []);
      setCoachingRequests(coachRes.data || []);

      const approvedComms = (cRes.data || []).filter((c: any) => c.status === 'approved');
      setStats({
        totalUsers: uRes.data?.length || 0,
        totalSales: approvedComms.length,
        totalVolume: approvedComms.reduce((acc: number, c: any) => acc + (Number(c.amount) || 0), 0),
        pendingSales: (cRes.data || []).filter((c: any) => c.status === 'pending').length,
        pendingWithdrawals: (wRes.data || []).filter((w: any) => w.status === 'pending').length,
        pendingRpa: (rRes.data || []).filter((r: any) => r.status === 'pending').length,
        pendingCoaching: (coachRes.data || []).filter((coach: any) => coach.status === 'pending').length
      });
    } catch (e: any) { 
      console.error("Admin Fetch Error:", e);
      if (retryCount < 3 && (e.message?.includes('fetch') || e.name === 'TypeError')) {
        const delay = 1000 * (retryCount + 1);
        console.log(`Retrying admin fetch in ${delay}ms...`);
        setTimeout(() => fetchAdminData(retryCount + 1), delay);
        return;
      }
      setError("Erreur de chargement des données administratives.");
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { fetchAdminData(); }, [fetchAdminData, lastUpdateSignal]);

  const TabButton = ({ active, onClick, icon: Icon, label, badge, color, hidden }: any) => {
    if (hidden) return null;
    return (
      <button onClick={onClick} className={`flex items-center gap-2.5 px-6 py-3.5 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap active:scale-95 ${active ? 'bg-white text-black shadow-2xl' : `text-neutral-500 hover:text-white bg-neutral-800/30 ${color || ''}`}`}>
        <Icon size={14} strokeWidth={3} /> {label} {badge > 0 && <span className="ml-2 px-1.5 py-0.5 bg-red-600 text-white rounded-md text-[8px] animate-pulse">{badge}</span>}
      </button>
    );
  };

  return (
    <div className="space-y-10 animate-fade-in pb-24 text-white">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 mb-12">
        <SectionTitle 
            title={isSuperAdmin ? "Cercle Décisionnel" : "Marketing Console"} 
            subtitle={isSuperAdmin ? "Gestion intégrale de l'écosystème MZ+" : "Gestion des contenus et de la communication"} 
        />
        <div className="flex flex-wrap bg-neutral-900 border border-neutral-800 p-1.5 rounded-3xl gap-1.5 shadow-2xl overflow-x-auto max-w-full">
          <TabButton active={activeSubTab === 'stats'} onClick={() => setActiveSubTab('stats')} icon={LayoutGrid} label="Synthèse" />
          <TabButton hidden={!isAnyAdmin} active={activeSubTab === 'user_behavior'} onClick={() => setActiveSubTab('user_behavior')} icon={MousePointer2} label="Comportement" color="text-emerald-400" />
          <TabButton active={activeSubTab === 'home_landing'} onClick={() => setActiveSubTab('home_landing')} icon={Home} label="Landing Page" color="text-yellow-500" />
          <TabButton hidden={!isAnyAdmin} active={activeSubTab === 'users'} onClick={() => setActiveSubTab('users')} icon={Users} label="Membres" />
          <TabButton hidden={!isSuperAdmin} active={activeSubTab === 'withdrawals'} onClick={() => setActiveSubTab('withdrawals')} icon={Wallet} label="Retraits" badge={stats.pendingWithdrawals} />
          <TabButton hidden={!isSuperAdmin} active={activeSubTab === 'validation'} onClick={() => setActiveSubTab('validation')} icon={ClipboardList} label="Ventes" badge={stats.pendingSales} />
          <TabButton hidden={!isSuperAdmin} active={activeSubTab === 'rpa_validations'} onClick={() => setActiveSubTab('rpa_validations')} icon={Video} label="RPA" badge={stats.pendingRpa} />
          <TabButton hidden={!isAnyAdmin} active={activeSubTab === 'activity_audit'} onClick={() => setActiveSubTab('activity_audit')} icon={History} label="Audit Temps" />
          <TabButton active={activeSubTab === 'formations'} onClick={() => setActiveSubTab('formations')} icon={GraduationCap} label="Académie" color="text-purple-400" />
          <TabButton active={activeSubTab === 'coaching'} onClick={() => setActiveSubTab('coaching')} icon={Target} label="Coaching" badge={stats.pendingCoaching} />
          <TabButton active={activeSubTab === 'catalog'} onClick={() => setActiveSubTab('catalog')} icon={Package} label="Catalogue" />
          <TabButton active={activeSubTab === 'admin_push'} onClick={() => setActiveSubTab('admin_push')} icon={BellRing} label="Push" />
          <TabButton active={activeSubTab === 'marketing_announcements'} onClick={() => setActiveSubTab('marketing_announcements')} icon={Megaphone} label="Pop-ups" />
          <TabButton active={activeSubTab === 'premium_welcome'} onClick={() => setActiveSubTab('premium_welcome')} icon={Crown} label="Accueil Premium" color="text-purple-500" />
          <TabButton active={activeSubTab === 'premium_access'} onClick={() => setActiveSubTab('premium_access')} icon={ShieldCheck} label="Accès Premium" color="text-red-500" />
          <TabButton active={activeSubTab === 'mz_presentation'} onClick={() => setActiveSubTab('mz_presentation')} icon={Video} label="Offre MZ+" color="text-blue-400" />
          <TabButton active={activeSubTab === 'flash_offer'} onClick={() => setActiveSubTab('flash_offer')} icon={Flame} label="PASSEZ AU NIVEAU SUPÉRIEUR" />
          <TabButton active={activeSubTab === 'pwa_branding'} onClick={() => setActiveSubTab('pwa_branding')} icon={Settings} label="PWA & Branding" color="text-emerald-500" />
        </div>
      </div>

      <div className="animate-fade-in">
        {error && (
          <div className="mb-8 p-6 bg-red-500/10 border border-red-500/20 rounded-[2rem] text-center space-y-4">
            <p className="text-xs font-black uppercase text-red-500">{error}</p>
            <button 
              onClick={() => fetchAdminData()}
              className="px-6 py-2 bg-red-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-400 transition-all"
            >
              Réessayer
            </button>
          </div>
        )}
        {activeSubTab === 'stats' && (
          <div className="space-y-10">
            <AdminStatsOverview stats={stats} isSuperAdmin={isSuperAdmin} />
            
            {isSuperAdmin && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div className="flex items-center justify-between px-2">
                    <h4 className="text-xs font-black uppercase tracking-widest text-neutral-500 flex items-center gap-2">
                      <History size={14} /> Flux des Ventes Récentes
                    </h4>
                    <button onClick={() => setActiveSubTab('validation')} className="text-[9px] font-black uppercase text-yellow-500 hover:underline">Voir tout</button>
                  </div>
                  
                  <div className="bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] overflow-hidden">
                    <div className="divide-y divide-white/5">
                      {commissions.length === 0 ? (
                        <div className="p-12 text-center opacity-20 uppercase text-[10px] font-black tracking-widest">Aucune activité de vente</div>
                      ) : (
                        commissions.slice(0, 5).map((c: any) => (
                          <div key={c.id} className="p-6 flex items-center justify-between hover:bg-white/[0.01] transition-colors">
                            <div className="flex items-center gap-4">
                              <div className={`w-2 h-2 rounded-full ${c.status === 'approved' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : c.status === 'pending' ? 'bg-orange-500 animate-pulse' : 'bg-red-500'}`}></div>
                              <div>
                                <p className="text-[11px] font-black uppercase text-white tracking-tight">{c.users?.full_name || 'Inconnu'}</p>
                                <p className="text-[8px] font-bold text-neutral-600 uppercase tracking-widest mt-0.5">{c.products?.name || 'Service MZ+'}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <CurrencyDisplay amount={c.amount} className="text-xs font-black text-yellow-500 font-mono" vertical={true} />
                              <p className="text-[7px] text-neutral-700 font-bold uppercase mt-1">{new Date(c.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h4 className="text-xs font-black uppercase tracking-widest text-neutral-500 px-2">Performance</h4>
                  <div className="p-8 bg-emerald-600/5 border border-emerald-500/20 rounded-[2.5rem] flex flex-col items-center text-center space-y-4">
                    <TrendingUp className="text-emerald-500" size={32} />
                    <div>
                      <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">Conversion Globale</p>
                      <p className="text-4xl font-black text-white">{stats.totalUsers > 0 ? Math.round((stats.totalSales / stats.totalUsers) * 100) : 0}%</p>
                    </div>
                    <p className="text-[8px] text-neutral-500 font-bold uppercase leading-relaxed">
                      Ratio entre le nombre de membres et les ventes validées.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        {activeSubTab === 'user_behavior' && <UserBehaviorAdmin />}
        {activeSubTab === 'home_landing' && <HomeLandingAdmin />}
        {activeSubTab === 'users' && isAnyAdmin && <AdminUserManagement users={users} activitySummary={activitySummary} searchTerm={searchTerm} setSearchTerm={setSearchTerm} onRefresh={fetchAdminData} />}
        {activeSubTab === 'formations' && <FormationAdmin />}
        {activeSubTab === 'withdrawals' && isSuperAdmin && <AdminWithdrawalRequests withdrawals={withdrawals} onRefresh={fetchAdminData} />}
        {activeSubTab === 'rpa_validations' && isSuperAdmin && <AdminRPASubmissions submissions={submissions} onRefresh={fetchAdminData} />}
        {activeSubTab === 'validation' && isSuperAdmin && <AffiliationSystem profile={adminProfile} isAdminView={true} showValidations={true} showCatalog={false} />}
        {activeSubTab === 'catalog' && <AffiliationSystem profile={adminProfile} isAdminView={true} showValidations={false} showCatalog={true} />}
        {activeSubTab === 'coaching' && <AdminCoachingRequests coachingRequests={coachingRequests} onRefresh={fetchAdminData} />}
        {activeSubTab === 'admin_push' && <PushAdmin />}
        {activeSubTab === 'marketing_announcements' && <AnnouncementAdmin />}
        {activeSubTab === 'premium_welcome' && <PremiumWelcomeAdmin />}
        {activeSubTab === 'premium_access' && <PremiumAccessAdmin />}
        {activeSubTab === 'mz_presentation' && <MZPlusPresentationAdmin />}
        {activeSubTab === 'flash_offer' && <MZPlusFlashOfferAdmin />}
        {activeSubTab === 'pwa_branding' && <PWABrandingAdmin />}
        {activeSubTab === 'activity_audit' && isAnyAdmin && <AdminActivityAudit />}
      </div>
    </div>
  );
};

const AdminStatsOverview: React.FC<{ stats: any; isSuperAdmin: boolean }> = ({ stats, isSuperAdmin }) => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
    <div className="p-4 md:p-6 bg-[#0a0a0a] border border-white/5 rounded-2xl md:rounded-[2rem]">
      <Users className="text-blue-500 mb-3 md:mb-4 w-5 h-5 md:w-6 md:h-6" />
      <p className="text-xl md:text-2xl font-black">{stats.totalUsers}</p>
      <p className="text-[7px] md:text-[8px] font-black uppercase text-neutral-500">Membres</p>
    </div>
    {isSuperAdmin && (
      <>
        <div className="p-4 md:p-6 bg-[#0a0a0a] border border-white/5 rounded-2xl md:rounded-[2rem] overflow-hidden">
          <TrendingUp className="text-emerald-500 mb-3 md:mb-4 w-5 h-5 md:w-6 md:h-6" />
          <CurrencyDisplay amount={stats.totalVolume} className="text-lg md:text-xl font-black break-words" vertical={true} />
          <p className="text-[7px] md:text-[8px] font-black uppercase text-neutral-500 mt-1">Volume Ventes</p>
        </div>
        <div className="p-4 md:p-6 bg-[#0a0a0a] border border-white/5 rounded-2xl md:rounded-[2rem]">
          <ClipboardList className="text-yellow-500 mb-3 md:mb-4 w-5 h-5 md:w-6 md:h-6" />
          <p className="text-xl md:text-2xl font-black">{stats.pendingSales}</p>
          <p className="text-[7px] md:text-[8px] font-black uppercase text-neutral-500">Ventes en attente</p>
        </div>
        <div className="p-4 md:p-6 bg-[#0a0a0a] border border-white/5 rounded-2xl md:rounded-[2rem]">
          <Wallet className="text-orange-500 mb-3 md:mb-4 w-5 h-5 md:w-6 md:h-6" />
          <p className="text-xl md:text-2xl font-black">{stats.pendingWithdrawals}</p>
          <p className="text-[7px] md:text-[8px] font-black uppercase text-neutral-500">Retraits en attente</p>
        </div>
      </>
    )}
  </div>
);

const HomeLandingAdmin = () => {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    supabase.from('mz_home_config').select('*').eq('id', 'home-landing').maybeSingle().then(({ data }) => {
      const defaultConfig = { id: 'home-landing', video_url: '', youtube_iframe: '' };
      if (data) {
        setConfig({ ...defaultConfig, ...data, video_url: data.video_url || '', youtube_iframe: data.youtube_iframe || '' });
      } else {
        setConfig(defaultConfig);
      }
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    await supabase.from('mz_home_config').upsert(config);
    setIsSaving(false);
    alert("Configuration Landing page mise à jour");
  };

  if (loading) return null;
  return (
    <GoldBorderCard className="p-8 space-y-6">
      <h3 className="text-xl font-black uppercase">Configuration <GoldText>Landing Page</GoldText></h3>
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-neutral-500">URL Vidéo Directe</label>
          <input className="w-full bg-black p-4 rounded-xl border border-white/10 text-xs text-white" value={config.video_url} onChange={e => setConfig({...config, video_url: e.target.value})} />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-neutral-500">Iframe YouTube (Optionnel)</label>
          <textarea className="w-full bg-black p-4 rounded-xl border border-white/10 text-xs text-white" value={config.youtube_iframe} onChange={e => setConfig({...config, youtube_iframe: e.target.value})} />
        </div>
      </div>
      <PrimaryButton onClick={handleSave} isLoading={isSaving} fullWidth>Enregistrer les modifications</PrimaryButton>
    </GoldBorderCard>
  );
};

const PWABrandingAdmin = () => {
  const [config, setConfig] = useState<{ icon_base64: string; app_name: string }>({ 
    icon_base64: '', 
    app_name: 'MZ+ Elite' 
  });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      const { data } = await supabase.from('mz_app_config').select('*').eq('id', 'main-config').maybeSingle();
      if (data) {
        setConfig({
          icon_base64: data.icon_base64 || '',
          app_name: data.app_name || 'MZ+ Elite'
        });
        // Sync local storage for faster future loads
        if (data.app_name) localStorage.setItem('pwa_custom_name', data.app_name);
        if (data.icon_base64) localStorage.setItem('pwa_custom_icon', data.icon_base64);
      }
      setLoading(false);
    };
    fetchConfig();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("L'image est trop lourde (max 2 Mo)");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setConfig(prev => ({ ...prev, icon_base64: base64String }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase.from('mz_app_config').upsert({
        id: 'main-config',
        app_name: config.app_name,
        icon_base64: config.icon_base64,
        updated_at: new Date().toISOString()
      });

      if (error) throw error;

      localStorage.setItem('pwa_custom_icon', config.icon_base64);
      localStorage.setItem('pwa_custom_name', config.app_name);
      
      alert("Identité visuelle mise à jour avec succès !");
      window.location.reload();
    } catch (err: any) {
      alert("Erreur lors de la sauvegarde : " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return null;

  return (
    <GoldBorderCard className="p-8 space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
          <Settings className="text-emerald-500" size={24} />
        </div>
        <div>
          <h3 className="text-xl font-black uppercase">Configuration <GoldText>Web to App</GoldText></h3>
          <p className="text-[10px] text-neutral-500 font-bold uppercase">Personnalisez l'identité visuelle stockée en base de données</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-neutral-500">Nom de l'application</label>
            <input 
              className="w-full bg-black p-4 rounded-xl border border-white/10 text-xs text-white outline-none focus:border-emerald-500 transition-all" 
              value={config.app_name} 
              onChange={e => setConfig({...config, app_name: e.target.value})}
              placeholder="Ex: MZ+ Elite"
            />
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase text-neutral-500 block">Icône de l'application (Import direct)</label>
            <div className="relative group">
              <input 
                type="file" 
                accept="image/png, image/jpeg, image/webp"
                onChange={handleFileChange}
                className="hidden"
                id="pwa-icon-upload"
              />
              <label 
                htmlFor="pwa-icon-upload"
                className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-[2rem] p-10 cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all group"
              >
                <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-500 mb-4 group-hover:scale-110 transition-transform">
                  <Upload size={24} />
                </div>
                <p className="text-[10px] font-black uppercase text-neutral-400 group-hover:text-emerald-400 transition-colors">Cliquez pour importer une image</p>
                <p className="text-[8px] text-neutral-600 mt-2">PNG ou JPG recommandés (Max 2Mo)</p>
              </label>
            </div>
            
            <p className="text-[8px] text-neutral-600 font-medium italic">
              L'image sera stockée en base de données et servira d'icône pour les notifications et l'écran d'accueil.
            </p>
          </div>

          <PrimaryButton onClick={handleSave} isLoading={isSaving} fullWidth size="lg">Enregistrer et Appliquer</PrimaryButton>
        </div>

        <div className="bg-neutral-900 shadow-inner rounded-3xl p-8 border border-white/5 flex flex-col items-center justify-center text-center space-y-4">
          <p className="text-[9px] font-black text-neutral-500 uppercase tracking-widest mb-2">Aperçu Mobile</p>
          <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-neutral-800 to-neutral-950 border border-white/10 p-4 transition-all overflow-hidden flex items-center justify-center shadow-2xl">
            {config.icon_base64 ? (
              <img src={config.icon_base64} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
            ) : (
              <Monitor size={32} className="text-neutral-700" />
            )}
          </div>
          <div>
            <p className="text-sm font-black uppercase text-white">{config.app_name}</p>
            <p className="text-[10px] text-emerald-500 font-bold uppercase mt-1">Status : Stocké en BDD ✅</p>
          </div>
        </div>
      </div>

      <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
        <h4 className="text-[10px] font-black uppercase text-emerald-500 mb-2 flex items-center gap-2">
          <Info size={12} /> Informations Techniques
        </h4>
        <div className="text-[9px] text-neutral-400 font-medium leading-relaxed">
          <p>Le système utilise le stockage local pour un affichage instantané, mais se synchronise à la base de données à chaque démarrage pour garantir que tous vos administrateurs et utilisateurs voient la même identité visuelle.</p>
        </div>
      </div>
    </GoldBorderCard>
  );
};

const AdminUserManagement = ({ users, activitySummary, searchTerm, setSearchTerm, onRefresh }: any) => {
  const filteredUsers = users.filter((u: any) => 
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const updateUser = async (id: string, updates: any) => {
    await supabase.from('users').update(updates).eq('id', id);
    onRefresh();
  };

  return (
    <div className="space-y-6">
      <div className="relative px-2 md:px-0">
        <Search className="absolute left-6 md:left-4 top-1/2 -translate-y-1/2 text-neutral-600" size={18} />
        <input className="w-full bg-neutral-900 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-xs text-white outline-none focus:border-yellow-600" placeholder="Rechercher un membre..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
      </div>
      
      {/* Mobile View: Cards */}
      <div className="grid grid-cols-1 gap-4 md:hidden px-2">
        {filteredUsers.map((u: any) => (
          <div key={u.id} className="p-5 bg-[#0a0a0a] border border-white/5 rounded-2xl space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-bold text-sm">{u.full_name}</div>
                <div className="text-[10px] opacity-50 font-mono truncate max-w-[150px]">{u.email}</div>
              </div>
              <EliteBadge variant={u.user_level}>{u.user_level === 'niveau_mz_plus' ? 'MZ+' : 'Standard'}</EliteBadge>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-white/5">
              <CurrencyDisplay amount={u.wallets?.[0]?.balance || 0} className="font-mono text-yellow-500 text-xs font-black" vertical={true} />
              <div className="flex gap-2">
                <button onClick={() => updateUser(u.id, { user_level: u.user_level === 'standard' ? 'niveau_mz_plus' : 'standard' })} className="p-2.5 bg-white/5 rounded-xl border border-white/10 text-neutral-400" title="Basculer Niveau"><RefreshCw size={14}/></button>
                <button onClick={() => updateUser(u.id, { is_admin: !u.is_admin })} className="p-2.5 bg-white/5 rounded-xl border border-white/10 text-neutral-400" title="Basculer Admin"><ShieldCheck size={14} className={u.is_admin ? 'text-blue-500' : ''}/></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop View: Table */}
      <div className="hidden md:block bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-black/40 text-[9px] font-black uppercase text-neutral-500 border-b border-neutral-800">
            <tr><th className="p-6">Ambassadeur</th><th className="p-6">Status</th><th className="p-6">Solde</th><th className="p-6 text-right">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/50">
            {filteredUsers.map((u: any) => (
              <tr key={u.id} className="hover:bg-white/[0.01]">
                <td className="p-6">
                  <div className="font-bold">{u.full_name}</div>
                  <div className="text-[10px] opacity-50 font-mono">{u.email}</div>
                </td>
                <td className="p-6"><EliteBadge variant={u.user_level}>{u.user_level === 'niveau_mz_plus' ? 'MZ+' : 'Standard'}</EliteBadge></td>
                <td className="p-6">
                  <CurrencyDisplay amount={u.wallets?.[0]?.balance || 0} className="font-mono text-yellow-500" vertical={true} />
                </td>
                <td className="p-6 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => updateUser(u.id, { user_level: u.user_level === 'standard' ? 'niveau_mz_plus' : 'standard' })} className="p-2 bg-white/5 rounded-lg border border-white/10 hover:bg-yellow-600 hover:text-black transition-all" title="Basculer Niveau"><RefreshCw size={14}/></button>
                    <button onClick={() => updateUser(u.id, { is_admin: !u.is_admin })} className="p-2 bg-white/5 rounded-lg border border-white/10 hover:bg-blue-600 hover:text-white transition-all" title="Basculer Admin"><ShieldCheck size={14} className={u.is_admin ? 'text-blue-500' : ''}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const FormationAdmin = () => {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<any>({ title: '', description: '', thumbnail_url: '', preview_url: '', order_index: 0 });

  const fetchFormations = async () => {
    const { data } = await supabase.from('mz_formations').select('*').order('order_index');
    if (data) setFormations(data);
  };

  useEffect(() => { fetchFormations(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from('mz_formations').upsert(formData);
    setShowForm(false);
    setFormData({ title: '', description: '', thumbnail_url: '', preview_url: '', order_index: 0 });
    fetchFormations();
  };

  return (
    <div className="space-y-8 px-2 md:px-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-xl font-black uppercase tracking-tight">Gestion <GoldText>Académie</GoldText></h3>
        <button onClick={() => setShowForm(!showForm)} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 sm:py-3 bg-yellow-600 text-black rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-yellow-500 transition-all shadow-lg">
          {showForm ? <X size={14}/> : <Plus size={14}/>} {showForm ? 'Annuler' : 'Nouveau Module'}
        </button>
      </div>

      {showForm && (
        <GoldBorderCard className="p-6 md:p-8 bg-black/40 border-yellow-600/20">
          <form onSubmit={handleSave} className="space-y-4">
            <input required className="w-full bg-black border border-white/10 rounded-xl p-4 text-xs text-white" placeholder="Titre du module" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
            <textarea required className="w-full bg-black border border-white/10 rounded-xl p-4 text-xs text-white h-24" placeholder="Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            <input className="w-full bg-black border border-white/10 rounded-xl p-4 text-xs text-white" placeholder="URL Miniature" value={formData.thumbnail_url} onChange={e => setFormData({...formData, thumbnail_url: e.target.value})} />
            <input className="w-full bg-black border border-white/10 rounded-xl p-4 text-xs text-white" placeholder="URL Vidéo Preview" value={formData.preview_url} onChange={e => setFormData({...formData, preview_url: e.target.value})} />
            <PrimaryButton type="submit" fullWidth size="lg">Enregistrer le module</PrimaryButton>
          </form>
        </GoldBorderCard>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {formations.map(f => (
          <div key={f.id} className="p-4 md:p-5 bg-[#0a0a0a] border border-white/5 rounded-2xl flex justify-between items-center group hover:border-yellow-600/20 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-neutral-900 overflow-hidden shrink-0"><img src={f.thumbnail_url} className="w-full h-full object-cover opacity-50" /></div>
              <span className="font-bold uppercase text-[11px] md:text-xs text-white truncate max-w-[150px] sm:max-w-none">{f.title}</span>
            </div>
            <button onClick={async () => { if(confirm("Supprimer ?")) { await supabase.from('mz_formations').delete().eq('id', f.id); fetchFormations(); } }} className="p-2 text-neutral-600 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
          </div>
        ))}
      </div>
    </div>
  );
};

const AdminWithdrawalRequests = ({ withdrawals, onRefresh }: any) => {
  const updateStatus = async (id: string, status: string) => {
    await supabase.from('withdrawals').update({ status }).eq('id', id);
    onRefresh();
  };

  return (
    <div className="space-y-4">
      {/* Mobile View */}
      <div className="grid grid-cols-1 gap-4 md:hidden px-2">
        {withdrawals.length === 0 ? (
          <div className="p-10 text-center opacity-30 uppercase text-[10px]">Aucun retrait</div>
        ) : (
          withdrawals.map((w: any) => (
            <div key={w.id} className="p-5 bg-[#0a0a0a] border border-white/5 rounded-2xl space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold text-sm">{w.users?.full_name}</div>
                  <div className="text-[10px] opacity-50 font-mono">{w.users?.email}</div>
                </div>
                <div className="text-right">
                  <CurrencyDisplay amount={w.amount} className="font-mono text-yellow-500 font-black text-sm" vertical={true} />
                  <div className="text-[8px] font-black uppercase text-neutral-500 mt-1">{w.method}</div>
                </div>
              </div>
              <div className="pt-3 border-t border-white/5 flex justify-between items-center">
                <div className="text-[9px] font-mono text-neutral-400 truncate max-w-[180px]">{w.account}</div>
                <div className="flex gap-2">
                  {w.status === 'pending' ? (
                    <>
                      <button onClick={() => updateStatus(w.id, 'approved')} className="p-2.5 bg-emerald-600 rounded-xl"><Check size={14}/></button>
                      <button onClick={() => updateStatus(w.id, 'rejected')} className="p-2.5 bg-red-600 rounded-xl"><X size={14}/></button>
                    </>
                  ) : (
                    <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-md ${w.status === 'approved' ? 'bg-emerald-600/20 text-emerald-500' : 'bg-red-600/20 text-red-500'}`}>{w.status}</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop View */}
      <div className="hidden md:block bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-black/40 text-[9px] font-black uppercase text-neutral-500 border-b border-neutral-800">
            <tr><th className="p-6">Ambassadeur</th><th className="p-6">Montant</th><th className="p-6">Détails</th><th className="p-6 text-right">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/50">
            {withdrawals.length === 0 ? (<tr><td colSpan={4} className="p-20 text-center opacity-30 uppercase">Aucun retrait</td></tr>) : 
              withdrawals.map((w: any) => (
                <tr key={w.id} className="hover:bg-white/[0.01]">
                  <td className="p-6"><div>{w.users?.full_name}</div><div className="opacity-50 text-[10px]">{w.users?.email}</div></td>
                  <td className="p-6">
                    <CurrencyDisplay amount={w.amount} className="font-mono text-yellow-500 font-bold" vertical={true} />
                  </td>
                  <td className="p-6"><div className="text-[10px] font-black uppercase text-neutral-400">{w.method}</div><div className="opacity-50 font-mono">{w.account}</div></td>
                  <td className="p-6 text-right">
                    {w.status === 'pending' ? (
                      <div className="flex justify-end gap-2">
                        <button onClick={() => updateStatus(w.id, 'approved')} className="p-2 bg-emerald-600 rounded-lg shadow-lg hover:scale-105 transition-all"><Check size={14}/></button>
                        <button onClick={() => updateStatus(w.id, 'rejected')} className="p-2 bg-red-600 rounded-lg shadow-lg hover:scale-105 transition-all"><X size={14}/></button>
                      </div>
                    ) : (
                      <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-md ${w.status === 'approved' ? 'bg-emerald-600/20 text-emerald-500' : 'bg-red-600/20 text-red-500'}`}>{w.status}</span>
                    )}
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AdminRPASubmissions = ({ submissions, onRefresh }: any) => {
  const [pointsInputs, setPointsInputs] = useState<Record<string, number>>({});
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const updateStatus = async (submission: any, status: string) => {
    if (isProcessing) return;
    setIsProcessing(submission.id);
    
    try {
      const points = status === 'approved' ? (pointsInputs[submission.id] || 50) : 0;
      
      // 1. Mettre à jour le statut de la soumission
      const { error: subError } = await supabase
        .from('rpa_submissions')
        .update({ status, points_awarded: points })
        .eq('id', submission.id);

      if (subError) throw subError;

      // 2. Si approuvé, créditer les points sur le profil de l'utilisateur
      if (status === 'approved' && points > 0) {
        // On récupère les valeurs actuelles pour assurer la cohérence (même si Supabase permet l'incrément raw)
        const currentPoints = Number(submission.users?.rpa_points || 0);
        const currentBalance = Number(submission.users?.rpa_balance || 0);

        const { error: userError } = await supabase
          .from('users')
          .update({ 
            rpa_points: currentPoints + points,
            rpa_balance: currentBalance + points // On suppose 1 point = 1 CFA pour la balance retirable
          })
          .eq('id', submission.user_id);

        if (userError) throw userError;
      }

      onRefresh();
    } catch (e: any) {
      alert("Erreur lors de la validation : " + e.message);
    } finally {
      setIsProcessing(null);
    }
  };

  const handlePointsChange = (id: string, val: string) => {
    const num = parseInt(val) || 0;
    setPointsInputs(prev => ({ ...prev, [id]: num }));
  };

  return (
    <div className="space-y-4">
      {/* Mobile View */}
      <div className="grid grid-cols-1 gap-4 md:hidden px-2">
        {submissions.length === 0 ? (
          <div className="p-10 text-center opacity-30 uppercase text-[10px]">Aucune soumission</div>
        ) : (
          submissions.map((s: any) => (
            <div key={s.id} className="p-5 bg-[#0a0a0a] border border-white/5 rounded-2xl space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold text-sm">{s.users?.full_name}</div>
                  <div className="text-[10px] opacity-50 font-mono truncate max-w-[150px]">{s.users?.email}</div>
                </div>
                <a href={s.data?.link} target="_blank" className="p-2 bg-blue-600/10 text-blue-400 rounded-lg flex items-center gap-1.5 text-[9px] font-black uppercase">
                  Lien <ExternalLink size={10}/>
                </a>
              </div>
              
              <div className="pt-3 border-t border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {s.status === 'pending' ? (
                    <div className="relative w-20">
                      <input 
                        type="number" 
                        className="w-full bg-black border border-white/10 rounded-lg p-2 text-[10px] font-mono text-yellow-500 outline-none"
                        value={pointsInputs[s.id] ?? 50}
                        onChange={(e) => handlePointsChange(s.id, e.target.value)}
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[7px] text-neutral-600 font-black">PTS</span>
                    </div>
                  ) : (
                    <span className="font-mono text-yellow-500 font-black text-[10px]">{s.points_awarded} PTS</span>
                  )}
                </div>
                
                <div className="flex gap-2">
                  {s.status === 'pending' ? (
                    <>
                      <button 
                        onClick={() => updateStatus(s, 'approved')} 
                        disabled={isProcessing === s.id}
                        className="p-2.5 bg-emerald-600 rounded-xl disabled:opacity-50"
                      >
                        {isProcessing === s.id ? <Loader2 size={14} className="animate-spin"/> : <Check size={14}/>}
                      </button>
                      <button 
                        onClick={() => updateStatus(s, 'rejected')} 
                        disabled={isProcessing === s.id}
                        className="p-2.5 bg-red-600 rounded-xl disabled:opacity-50"
                      >
                        <X size={14}/>
                      </button>
                    </>
                  ) : (
                    <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-md ${s.status === 'approved' ? 'bg-emerald-600/20 text-emerald-500' : 'bg-red-600/20 text-red-500'}`}>{s.status}</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop View */}
      <div className="hidden md:block bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-black/40 text-[9px] font-black uppercase text-neutral-500 border-b border-neutral-800">
            <tr><th className="p-6">Ambassadeur</th><th className="p-6">Vidéo</th><th className="p-6">Points à attribuer</th><th className="p-6 text-right">Validation</th></tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/50">
            {submissions.length === 0 ? (<tr><td colSpan={4} className="p-20 text-center opacity-30 uppercase">Aucune soumission</td></tr>) : 
              submissions.map((s: any) => (
                <tr key={s.id} className="hover:bg-white/[0.01]">
                  <td className="p-6"><div>{s.users?.full_name}</div><div className="opacity-50 text-[10px]">{s.users?.email}</div></td>
                  <td className="p-6"><a href={s.data?.link} target="_blank" className="flex items-center gap-2 text-blue-400 hover:text-blue-300 font-bold uppercase text-[10px]">Voir Lien <ExternalLink size={12}/></a></td>
                  <td className="p-6">
                    {s.status === 'pending' ? (
                      <div className="relative w-24">
                          <input 
                            type="number" 
                            placeholder="Points"
                            className="w-full bg-black border border-white/10 rounded-lg p-2 text-[10px] font-mono text-yellow-500 outline-none focus:border-yellow-600 transition-all"
                            value={pointsInputs[s.id] ?? 50}
                            onChange={(e) => handlePointsChange(s.id, e.target.value)}
                          />
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] text-neutral-600 font-black">PTS</div>
                      </div>
                    ) : (
                      <span className="font-mono text-yellow-500 font-black">{s.points_awarded} PTS</span>
                    )}
                  </td>
                  <td className="p-6 text-right">
                    {s.status === 'pending' ? (
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => updateStatus(s, 'approved')} 
                          disabled={isProcessing === s.id}
                          className="p-2 bg-emerald-600 rounded-lg shadow-lg hover:scale-105 transition-all disabled:opacity-50" 
                          title="Valider avec points"
                        >
                          {isProcessing === s.id ? <Loader2 size={14} className="animate-spin"/> : <Check size={14}/>}
                        </button>
                        <button 
                          onClick={() => updateStatus(s, 'rejected')} 
                          disabled={isProcessing === s.id}
                          className="p-2 bg-red-600 rounded-lg shadow-lg hover:scale-105 transition-all disabled:opacity-50" 
                          title="Refuser"
                        >
                          <X size={14}/>
                        </button>
                      </div>
                    ) : (
                      <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-md ${s.status === 'approved' ? 'bg-emerald-600/20 text-emerald-500' : 'bg-red-600/20 text-red-500'}`}>{s.status}</span>
                    )}
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AdminCoachingRequests = ({ coachingRequests, onRefresh }: any) => {
  const updateStatus = async (id: string, status: string) => {
    await supabase.from('coaching_requests').update({ status }).eq('id', id);
    onRefresh();
  };

  return (
    <div className="space-y-4">
      {/* Mobile View */}
      <div className="grid grid-cols-1 gap-4 md:hidden px-2">
        {coachingRequests.length === 0 ? (
          <div className="p-10 text-center opacity-30 uppercase text-[10px]">Aucune demande</div>
        ) : (
          coachingRequests.map((c: any) => (
            <div key={c.id} className="p-5 bg-[#0a0a0a] border border-white/5 rounded-2xl space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold text-sm">{c.users?.full_name}</div>
                  <EliteBadge variant={c.users?.user_level}>{c.users?.user_level === 'niveau_mz_plus' ? 'MZ+' : 'STD'}</EliteBadge>
                </div>
                <div className="text-right">
                  <div className="font-black uppercase text-yellow-600 text-[9px] mb-1">{c.objective}</div>
                  <div className="text-[8px] text-neutral-500 uppercase">{new Date(c.created_at).toLocaleDateString()}</div>
                </div>
              </div>
              <p className="text-[10px] text-neutral-400 italic bg-black/40 p-3 rounded-xl border border-white/5">{c.message}</p>
              <div className="pt-2 flex justify-end gap-2">
                <button onClick={() => updateStatus(c.id, 'in_progress')} className="p-2.5 bg-blue-600 rounded-xl"><RefreshCw size={14}/></button>
                <button onClick={() => updateStatus(c.id, 'completed')} className="p-2.5 bg-emerald-600 rounded-xl"><Check size={14}/></button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop View */}
      <div className="hidden md:block bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-black/40 text-[9px] font-black uppercase text-neutral-500 border-b border-neutral-800">
            <tr><th className="p-6">Membre</th><th className="p-6">Objectif</th><th className="p-6 text-right">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/50">
            {coachingRequests.length === 0 ? (<tr><td colSpan={3} className="p-20 text-center opacity-30 uppercase">Aucune demande</td></tr>) : 
              coachingRequests.map((c: any) => (
                <tr key={c.id} className="hover:bg-white/[0.01]">
                  <td className="p-6">
                    <div className="font-bold">{c.users?.full_name}</div>
                    <EliteBadge variant={c.users?.user_level}>{c.users?.user_level}</EliteBadge>
                  </td>
                  <td className="p-6"><div className="font-black uppercase text-yellow-600 text-[10px] mb-1">{c.objective}</div><p className="opacity-50 italic truncate max-w-xs">{c.message}</p></td>
                  <td className="p-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => updateStatus(c.id, 'in_progress')} className="p-2 bg-blue-600 rounded-lg hover:scale-105 transition-all"><RefreshCw size={14}/></button>
                      <button onClick={() => updateStatus(c.id, 'completed')} className="p-2 bg-emerald-600 rounded-lg hover:scale-105 transition-all"><Check size={14}/></button>
                    </div>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
};
