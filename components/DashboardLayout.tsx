
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  X, 
  LogOut, 
  ChevronRight, 
  GraduationCap, 
  Crown, 
  Trophy,
  Home,
  Sparkles,
  ShieldCheck,
  Mail,
  Target,
  Menu,
  Coins,
  Briefcase,
  Zap,
  Settings,
  HelpCircle,
  Terminal,
  Bell,
  Users,
  Link as LinkIcon,
  User
} from 'lucide-react';
import { GoldText, EliteBadge } from './UI.tsx';
import { TabId, UserProfile } from '../types.ts';
import { supabase } from '../services/supabase.ts';
import { CurrencySelector } from './ui/CurrencyDisplay.tsx';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  isAdmin?: boolean;
  profile: UserProfile | null;
  isMenuOpen?: boolean;
  setIsMenuOpen?: (open: boolean) => void;
}

const NavButton = ({ active, onClick, emoji, label }: any) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-0.5 transition-all outline-none ${active ? 'scale-105' : 'opacity-40 hover:opacity-100'}`}
  >
    <span className="text-xl leading-none">{emoji}</span>
    <span className={`text-[8px] font-bold tracking-widest uppercase ${active ? 'text-[var(--color-gold-main)]' : 'text-[var(--color-text-gray)]'}`}>{label}</span>
  </button>
);

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  activeTab, 
  setActiveTab, 
  isAdmin = false, 
  profile,
  isMenuOpen = false,
  setIsMenuOpen = (_open: boolean) => {}
}) => {
  const [activeMembers, setActiveMembers] = useState(() => Math.floor(Math.random() * (1500 - 800) + 800));

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveMembers(prev => {
        // Changement naturel entre -12 et +12 pour éviter les sauts brusques
        const step = Math.floor(Math.random() * 25) - 12;
        let newValue = prev + step;
        
        // Stabilisation naturelle : si on approche des limites, on "pousse" doucement vers le centre
        if (newValue > 2000) newValue -= Math.abs(step) + 5;
        if (newValue < 200) newValue += Math.abs(step) + 5;
        
        return newValue;
      });
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const menuItems = [
    { id: 'dashboard' as TabId, label: 'Tableau de Bord', icon: Home },
    { id: 'profile' as TabId, label: 'Mon Profil Élite', icon: User },
    { id: 'revenus' as TabId, label: 'Trésorerie & Gains', icon: Coins },
    { id: 'recompense' as TabId, label: "L'Arène Élite", icon: Trophy },
    { id: 'luna_chat' as TabId, label: 'Luna AI', icon: Sparkles },
    { id: 'guides' as TabId, label: 'Guides & Aide', icon: HelpCircle },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[var(--color-main-bg)] text-[var(--color-text-main)] flex flex-col font-sans overflow-hidden selection:bg-[var(--color-gold-main)] selection:text-black">
      {/* GLOBAL ELITE BACKGROUND EFFECTS */}
      <div className="fixed inset-0 pointer-events-none -z-[10] overflow-hidden">
        <div className="absolute inset-0 bg-[var(--color-main-bg)]"></div>
        {/* Animated Orbs */}
        <div className="absolute top-[-5%] left-[-5%] w-[30vw] h-[30vw] bg-[var(--color-gold-main)]/5 blur-[120px] rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-[0%] right-[-5%] w-[40vw] h-[40vw] bg-[var(--color-academy-purple)]/5 blur-[150px] rounded-full animate-pulse-slower"></div>
        
        {/* Subtle Scanlines */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none opacity-5"></div>
      </div>

      {/* HEADER FIXE PRESTIGE */}
      <header className="sticky top-0 z-[100] h-14 bg-[var(--color-main-bg)]/80 backdrop-blur-md border-b border-[var(--color-border-gold)] px-5 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <span className="text-xl font-black italic tracking-tighter text-[var(--color-gold-main)] drop-shadow-[0_0_10px_rgba(201,168,76,0.2)]">MZ+</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block scale-90">
            <CurrencySelector />
          </div>

          {/* COMMUNITY PULSE (EXACT STYLING) */}
          <div className="flex items-center gap-2 px-4 py-1.5 bg-[rgba(201,168,76,0.08)] rounded-[100px] border border-[rgba(201,168,76,0.2)]">
            <div className="w-[7px] h-[7px] rounded-full bg-[#4CAF50] animate-pulse-dot shadow-[0_0_8px_rgba(76,175,80,0.4)]"></div>
            <span className="text-[13px] font-light text-[#F0EBE0] tracking-tight font-sans">
              {activeMembers.toLocaleString()} en ligne maintenant
            </span>
          </div>

          <button 
            className="p-2.5 bg-[var(--color-card-start)]/50 border border-[var(--color-border-gold)] rounded-xl hover:bg-[var(--color-card-end)] transition-all relative flex items-center justify-center group"
          >
            <span className="text-lg group-hover:scale-110 transition-transform">🔔</span>
            <span className="absolute top-2 right-2 w-1 h-1 bg-red-600 rounded-full"></span>
          </button>
        </div>
      </header>

      {/* OVERLAY MENU MOBILE PLEIN ÉCRAN */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[200] flex animate-fade-in">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setIsMenuOpen(false)}></div>
          <div className="relative w-full max-w-[320px] bg-[#080808] h-full border-r border-[var(--color-border-gold)] p-6 flex flex-col animate-slide-right shadow-2xl overflow-y-auto">
            <div className="flex justify-between items-center mb-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[var(--color-gold-main)] rounded-xl flex items-center justify-center text-black">
                  <Crown size={22} fill="currentColor" />
                </div>
                <h2 className="text-xl font-black italic text-white uppercase tracking-tighter">Elite</h2>
              </div>
              <button onClick={() => setIsMenuOpen(false)} className="p-2 text-[#6B6050] hover:text-white transition-colors bg-white/5 rounded-full"><X size={20}/></button>
            </div>

            <div className="flex-1 space-y-1.5">
              {profile?.user_level !== 'niveau_mz_plus' && (
                <div className="mb-6">
                  <button
                    onClick={() => { setActiveTab('flash_offer'); setIsMenuOpen(false); }}
                    className="relative w-full flex flex-col items-center justify-center gap-2 p-6 rounded-3xl font-black uppercase tracking-[0.15em] transition-all overflow-hidden border border-purple-500/30 bg-purple-950/20 shadow-xl group"
                  >
                    <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.05),transparent)] -translate-x-full group-hover:animate-[shimmer_2s_infinite] pointer-events-none" />
                    <div className="p-2 bg-white/5 rounded-xl border border-white/10">
                      <Zap size={18} className="text-purple-300" fill="currentColor" />
                    </div>
                    <div className="text-center">
                      <span className="text-[11px] text-white block">UPGRADE TO ELITE</span>
                      <span className="text-[7px] tracking-[0.3em] text-purple-300/60 font-bold">DEBLOQUER TOUT</span>
                    </div>
                  </button>
                </div>
              )}

              {menuItems.map((item) => (
                <button
                  id={`nav-${item.id}`}
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setIsMenuOpen(false); }}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all ${
                    activeTab === item.id ? 'bg-[var(--color-gold-main)] text-black shadow-lg scale-[1.02]' : 'text-[#6B6050] hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <item.icon size={16} />
                    {item.label}
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t border-[var(--color-border-gold)] space-y-3">
              {isAdmin && (
                <button 
                  onClick={() => { setActiveTab('admin'); setIsMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all ${
                    activeTab === 'admin' ? 'bg-blue-600 text-white shadow-xl' : 'bg-blue-900/10 text-blue-400 border border-blue-500/20'
                  }`}
                >
                  <ShieldCheck size={18} /> ADMIN DASHBOARD
                </button>
              )}
              <button onClick={handleLogout} className="w-full flex items-center gap-3 p-4 rounded-xl font-bold uppercase text-[10px] tracking-widest text-red-500 hover:bg-red-500/5 transition-all">
                <LogOut size={18} /> Déconnexion
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONTENU PRINCIPAL */}
      <main className="flex-1 overflow-y-auto relative custom-scrollbar pb-20 md:pb-0">
        <div className="min-h-full">
          {children}
        </div>
      </main>

      {/* BOTTOM NAVIGATION (MINIMAL & ELITE) */}
      <nav className="fixed bottom-0 left-0 right-0 z-[150] bg-[var(--color-card-start)]/90 backdrop-blur-xl border-t border-[var(--color-border-gold)] h-16 flex items-center justify-around md:hidden px-4">
        <NavButton 
          active={activeTab === 'dashboard'} 
          onClick={() => setActiveTab('dashboard')} 
          emoji="🏠" 
          label="Home" 
        />
        <NavButton 
          active={activeTab === 'affiliation'} 
          onClick={() => setActiveTab('affiliation')} 
          emoji="🔗" 
          label="Lien" 
        />
        <NavButton 
          active={activeTab === 'team'} 
          onClick={() => setActiveTab('team')} 
          emoji="👥" 
          label="Team" 
        />
        <NavButton 
          active={activeTab === 'profile'} 
          onClick={() => setActiveTab('profile')} 
          emoji="👤" 
          label="Profil" 
        />
      </nav>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slide-right {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        @keyframes shimmer {
          from { transform: translateX(-100%); }
          to { transform: translateX(100%); }
        }
        @keyframes pulse-subtle {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        .animate-slide-right { animation: slide-right 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-shimmer { animation: shimmer 2s infinite; }
        .animate-pulse-subtle { animation: pulse-subtle 3s ease-in-out infinite; }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
        }
        @keyframes pulse-slower {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.2); }
        }
        .animate-pulse-slow { animation: pulse-slow 8s infinite ease-in-out; }
        .animate-pulse-slower { animation: pulse-slower 12s infinite ease-in-out; }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.7); }
        }
        .animate-pulse-dot { animation: pulse-dot 1.5s infinite; }
      `}} />
    </div>
  );
};
