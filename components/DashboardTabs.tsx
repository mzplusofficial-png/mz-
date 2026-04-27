
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag as Bag, 
  Users, 
  UserPlus, 
  Lock,
  Target,
  Crown,
  ChevronRight,
  MessageSquare,
  Zap,
  GraduationCap,
  Video,
  BookOpen,
  ArrowLeft,
  MessagesSquare,
  Shield,
  Mail,
  Facebook,
  Share2,
  ArrowRight,
  Eye,
  EyeOff,
  ChevronDown,
  ArrowDownToLine,
  Sparkles,
  Trophy,
  Link as LinkIcon,
  User,
  LogOut,
  Settings,
  Bell
} from 'lucide-react';
import { UserProfile, RPASubmission, CoachingRequest, WithdrawalRequest, TabId, Wallet } from '../types.ts';
import { SectionTitle, GoldBorderCard, EliteBadge, GoldText, PrimaryButton, UpgradeGate, PurpleText } from './UI.tsx';
import { supabase } from '../services/supabase.ts';
import { AcademieMain } from './features/formation/AcademieMain.tsx';
import { RpaDashboard } from './features/rpa/RpaDashboard.tsx';
import { CoachingDashboard } from './features/coaching/CoachingDashboard.tsx';
import { ReferralDashboard } from './features/referral/ReferralDashboard.tsx';
import { GuidesTab as GuidesTabComponent } from './GuidesTab.tsx';
import { WithdrawalSystem } from './features/withdrawals/WithdrawalSystem.tsx';
import { WithdrawalForm as WithdrawalFormView } from './features/withdrawals/WithdrawalForm.tsx';
import { LivePulse } from './features/LivePulse.tsx';
import { CurrencyDisplay } from './ui/CurrencyDisplay.tsx';
import { useCurrency } from '../hooks/useCurrency.ts';

type HubCategory = 'main' | 'business' | 'academy' | 'community';

export const GlobalView: React.FC<any> = ({ 
  profile, 
  onSwitchTab, 
  onStartGuide,
  activeCategory,
  setActiveCategory,
  wallet
}) => {
  const [showBalance, setShowBalance] = useState(true);
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
  const { convertAndFormat } = useCurrency();
  const isMzPlus = profile?.user_level === 'niveau_mz_plus';

  const currentBalance = wallet?.balance || 0;
  const todayGain = wallet?.today_gain || 0;
  const totalCash = (wallet?.balance || 0) + (profile?.rpa_balance || 0);

  const { formatted, originalFormatted, isXAF } = convertAndFormat(currentBalance);
  const todayGainFormatted = convertAndFormat(todayGain).formatted;

  // Calcul de la progression (simulée selon le niveau)
  const progressPercent = 62; 
  const currentLevel = "Argent";
  const nextLevel = "Or";

  const categories = [
    { id: 'business', title: 'Business', desc: 'Commissions', emoji: '🎯', badge: 'GAGNER', color: 'bg-red-500/20 text-red-500 border-red-500/10' },
    { id: 'referral', title: 'Inviter & Gagner', desc: 'Gains passifs', emoji: '🔗', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/10' },
    { id: 'academy', title: 'Académie', desc: 'Formations', emoji: '🎓', color: 'bg-purple-500/20 text-purple-400 border-purple-500/10' },
  ];

  const handleShare = async (platform?: string) => {
    const baseUrl = window.location.origin;
    const shareUrl = `${baseUrl}/register?ref=${profile?.referral_code || 'elite'}`;
    const shareText = `Je viens de tomber sur MZ+.\nC’est un système en ligne qui permettrait de générer des revenus en ligne assez simplement.\nJ'ai deja commnecz et franchement ça a l’air intéressant.\nSi tu veux jeter un œil 👇\n\n${shareUrl}`;

    if (platform === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`, '_blank');
    } else if (platform === 'gmail') {
      window.open(`mailto:?subject=Découvre MZ+ Elite&body=${encodeURIComponent(shareText)}`, '_blank');
    } else if (navigator.share) {
      try {
        await navigator.share({
          title: 'MZ+ Elite Business',
          text: shareText,
          url: shareUrl
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(shareText);
      alert("Message de parrainage copié !");
    }
  };

  const copyToClipboard = () => {
    const baseUrl = window.location.origin;
    const shareUrl = `${baseUrl}/register?ref=${profile?.referral_code || 'elite'}`;
    navigator.clipboard.writeText(shareUrl);
    alert("Lien de parrainage copié !");
  };

  const renderCategoryDetails = () => {
    switch(activeCategory) {
      case 'business':
        return (
          <div className="grid grid-cols-2 gap-3 animate-fade-in text-left">
             <SubServiceCard title="Affiliation" desc="Liens" icon={Bag} onClick={() => onSwitchTab('affiliation')} />
             <SubServiceCard title="Vidéo" desc="TikTok/Reels" icon={Video} locked={!isMzPlus} onClick={() => onSwitchTab('rpa')} />
             <SubServiceCard title="Équipe" desc="Parrainage" icon={UserPlus} onClick={() => onSwitchTab('team')} />
          </div>
        );
      case 'referral':
        return (
          <div className="grid grid-cols-1 gap-3 animate-fade-in text-left">
             <div className="grid grid-cols-2 gap-3 pb-2">
                <button 
                  onClick={() => handleShare('whatsapp')}
                  className="flex flex-col items-center gap-2 p-5 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all text-center"
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.319 1.592 5.548 0 10.058-4.51 10.06-10.059.002-2.689-1.047-5.215-2.951-7.121-1.905-1.905-4.432-2.954-7.122-2.956-5.549 0-10.06 4.511-10.063 10.06-.001 2.032.547 3.513 1.488 5.13l-.999 3.648 3.731-.979zm11.367-7.393c-.31-.154-1.829-.903-2.11-.1.282-.102-.338-.204-.984-1.392-.506-.21-.422-.224-.744-.095-.547-.223-2.01-.739-3.344-1.928-1.037-.926-1.74-2.069-1.942-2.422-.204-.353-.021-.544.155-.72.158-.159.352-.412.529-.617.175-.206.234-.352.352-.588.117-.235.059-.441-.03-.617-.089-.176-.744-1.792-1.018-2.454-.267-.643-.538-.556-.744-.567-.19-.009-.41-.01-.63-.01-.22 0-.58.083-.884.412-.303.33-1.157 1.132-1.157 2.76 0 1.629 1.186 3.203 1.353 3.424.167.221 2.335 3.563 5.656 4.996.79.341 1.405.544 1.886.696.791.248 1.512.213 2.081.127.635-.095 1.829-.747 2.086-1.468.257-.721.257-1.341.18-1.468-.077-.127-.282-.204-.593-.352z"/></svg>
                  </div>
                  <p className="text-[10px] font-black text-white uppercase tracking-tighter">WhatsApp</p>
                </button>

                <button 
                  onClick={() => handleShare('facebook')}
                  className="flex flex-col items-center gap-2 p-5 rounded-3xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-all text-center"
                >
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                    <Facebook size={22} />
                  </div>
                  <p className="text-[10px] font-black text-white uppercase tracking-tighter">Facebook</p>
                </button>

                <button 
                  onClick={() => handleShare('gmail')}
                  className="flex flex-col items-center gap-2 p-5 rounded-3xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all text-center"
                >
                  <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center text-white shadow-lg shadow-red-500/20">
                    <Mail size={22} />
                  </div>
                  <p className="text-[10px] font-black text-white uppercase tracking-tighter">Gmail</p>
                </button>

                <button 
                  onClick={() => handleShare()}
                  className="flex flex-col items-center gap-2 p-5 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-center"
                >
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white">
                    <Share2 size={22} />
                  </div>
                  <p className="text-[10px] font-black text-white uppercase tracking-tighter">Autres</p>
                </button>
             </div>

             <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between">
                <div>
                   <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Presse-papier</p>
                   <p className="text-[12px] font-black text-[var(--color-gold-main)] tracking-tight">Code : {profile?.referral_code?.toUpperCase() || 'ELITE'}</p>
                </div>
                <button 
                  onClick={copyToClipboard}
                  className="px-4 py-2 rounded-xl bg-[var(--color-gold-main)] text-black text-[10px] font-black uppercase shadow-lg shadow-yellow-600/20"
                >
                  COPIER LE LIEN
                </button>
             </div>
          </div>
        );
      case 'academy':
        return (
          <div className="grid grid-cols-1 gap-3 animate-fade-in">
             <SubServiceCard title="Formations MZ+" desc="Cours vidéo" icon={BookOpen} locked={!isMzPlus} onClick={() => onSwitchTab('formation')} />
             <SubServiceCard title="Coaching" desc="Expert" icon={Target} locked={!isMzPlus} onClick={() => onSwitchTab('coaching')} />
          </div>
        );
      default: return null;
    }
  };

  if (activeCategory !== 'main') {
    return (
      <div className="max-w-md mx-auto px-6 py-8 space-y-8 animate-fade-in min-h-screen">
        <button 
          onClick={() => setActiveCategory('main')}
          className="flex items-center gap-2 text-[var(--color-text-gray)] hover:text-white transition-colors text-[9px] font-bold uppercase tracking-widest opacity-60"
        >
          <ArrowLeft size={14} /> Retour
        </button>
        
        <div className="space-y-6">
           <div className="flex items-center gap-4">
              <h3 className="text-xl font-black uppercase tracking-tighter text-white">
                {activeCategory}
              </h3>
              <div className="h-[1px] flex-1 bg-gradient-to-r from-[var(--color-gold-main)]/20 to-transparent"></div>
           </div>
           {renderCategoryDetails()}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-24 pt-10 px-5 relative min-h-screen font-sans">
      
      {/* GREETING */}
      <div className="flex items-end justify-between mb-8 mt-6">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-black text-white uppercase tracking-tighter italic leading-tight">
              Salut <span className="relative inline-block">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-gold-light)] to-[var(--color-gold-main)] drop-shadow-[0_4px_8px_rgba(201,168,76,0.3)]">
                  {profile?.full_name?.split(' ')[0] || 'Élite'}
                </span>
                <span className="absolute -bottom-1 left-0 w-full h-[1.5px] bg-gradient-to-r from-[var(--color-gold-main)]/60 to-transparent rounded-full shadow-[0_0_8px_var(--color-gold-main)]"></span>
              </span>, <br />
              <span className="text-[14px] font-bold text-white/90 normal-case tracking-tight not-italic">Ravi de te revoir !</span>
            </h2>
            <motion.div 
              animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }} 
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]"
            />
          </div>
          <p className="text-[11px] font-bold text-[#6B6050] uppercase tracking-[0.25em] opacity-100 italic">Prêt à conquérir le marché, MZ-Elite.</p>
        </div>
      </div>

      {/* 1. CARTE SOLDE (ELITE BUSINESS HUB) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`w-full bg-gradient-to-br from-[#111009] via-[#161410] to-[#0A0908] rounded-[3rem] p-7 border relative overflow-hidden group shadow-[0_30px_60px_rgba(0,0,0,0.6)] ${
          isMzPlus ? 'border-[var(--color-gold-main)]/40 shadow-[0_0_40px_rgba(201,168,76,0.1)]' : 'border-[var(--color-border-gold)]'
        }`}
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--color-gold-main)]/10 blur-[80px] rounded-full -mr-20 -mt-20 group-hover:bg-[var(--color-gold-main)]/20 transition-all duration-1000"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[var(--color-academy-purple)]/5 blur-[60px] rounded-full -ml-10 -mb-10"></div>
        
        <div className="flex justify-between items-start relative z-10 mb-6">
          <div className="space-y-1.5">
            {/* Status Badge (REPOSITIONED & HIGH IMPACT) */}
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border backdrop-blur-xl transition-all duration-500 shadow-lg ${
              isMzPlus 
                ? 'bg-gradient-to-r from-purple-600 to-indigo-700 border-white/20 text-white shadow-[0_0_20px_rgba(147,51,234,0.4)] scale-100' 
                : 'bg-[var(--color-gold-main)]/10 border-[var(--color-gold-main)]/30 text-[var(--color-gold-main)] shadow-[0_0_15px_rgba(201,168,76,0.1)]'
            }`}>
              <Crown size={12} className={isMzPlus ? 'animate-pulse' : 'opacity-70'} />
              <span className="text-[10px] font-black uppercase tracking-[0.1em] italic">
                {isMzPlus ? 'ACCÈS PREMIUM' : 'COMPTE STANDARD'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="mt-2 mb-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-baseline">
              <motion.div 
                key={showBalance ? 'visible' : 'hidden'}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col"
              >
                {showBalance ? (
                  <>
                    <h2 className="text-4xl md:text-5xl font-display text-[var(--color-gold-main)] tracking-tight leading-none drop-shadow-[0_10px_20px_rgba(201,168,76,0.3)] bg-gradient-to-b from-[var(--color-gold-light)] to-[var(--color-gold-main)] bg-clip-text text-transparent">
                      {formatted}
                    </h2>
                    {!isXAF && (
                      <span className="text-[10px] font-black text-white/30 uppercase tracking-widest mt-1">
                        ≈ {originalFormatted}
                      </span>
                    )}
                  </>
                ) : (
                  <h2 className="text-5xl font-display text-[var(--color-gold-main)] tracking-tight leading-none drop-shadow-[0_10px_20px_rgba(201,168,76,0.3)] bg-gradient-to-b from-[var(--color-gold-light)] to-[var(--color-gold-main)] bg-clip-text text-transparent">
                    •••••••
                  </h2>
                )}
              </motion.div>
            </div>
            
            <button 
              onClick={() => setShowBalance(!showBalance)}
              className="p-2.5 bg-white/5 rounded-xl text-[var(--color-text-gray)] hover:text-[var(--color-gold-main)] transition-all border border-white/5 active:scale-95 shadow-lg flex items-center justify-center translate-y-[-4px]"
            >
              {showBalance ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          
          <div className="mt-3 flex items-center gap-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
               <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
               <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">
                 Gains Aujourd'hui : <span className="text-white">+{todayGainFormatted}</span>
               </span>
            </div>
          </div>
        </div>

      </motion.div>

      {/* 2. BOUTON RETIRER (SLEEK) */}
      <motion.button 
        whileHover={{ scale: 1.01, boxShadow: '0 0 20px rgba(201,168,76,0.1)' }}
        whileTap={{ scale: 0.99 }}
        onClick={() => setShowWithdrawForm(true)}
        className="w-full py-3 bg-[var(--color-gold-main)] text-black rounded-xl font-black uppercase text-[9px] tracking-[0.3em] shadow-lg flex items-center justify-center gap-2 transition-all hover:bg-[var(--color-gold-light)]"
      >
        <span className="text-base">💸</span> Retirer mes gains
      </motion.button>

      {showWithdrawForm && (
        <WithdrawalFormView 
          profile={profile}
          balance={totalCash}
          onClose={() => setShowWithdrawForm(false)}
          onSuccess={() => setShowWithdrawForm(false)}
        />
      )}

      {/* 4. ACTIONS (NEW CIRCULAR ALIGNMENT) */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[9px] font-black uppercase text-[var(--color-text-gray)] tracking-[0.4em]">Que veux-tu faire ?</h3>
          <div className="h-[1px] flex-1 ml-4 bg-[var(--color-border-gold)] opacity-20"></div>
        </div>
        
        <div className="flex items-center justify-center gap-8 px-2 py-4">
          {categories.map((cat, idx) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * idx, type: 'spring' }}
              className="flex flex-col items-center gap-3 active:scale-95 transition-transform"
            >
              <button
                onClick={() => cat.id === 'business' ? onSwitchTab('affiliation') : setActiveCategory(cat.id as any)}
                className="w-24 h-24 rounded-full bg-gradient-to-br from-[#1A1814] to-[#0A0908] border border-[var(--color-border-gold)] flex items-center justify-center text-4xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative group transition-all hover:border-[var(--color-gold-main)]/50 hover:shadow-[0_0_30px_rgba(201,168,76,0.1)]"
              >
                <div className="absolute inset-0 rounded-full bg-[var(--color-gold-main)]/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                {cat.emoji}
                {cat.badge && (
                  <span className="absolute -top-1 -right-1 px-2 py-1 bg-[var(--color-gold-main)] text-black text-[7px] font-black rounded-full shadow-lg border border-black/10">
                    {cat.badge}
                  </span>
                )}
              </button>
              <div className="text-center space-y-0.5">
                <span className="text-[11px] font-black uppercase tracking-widest text-[var(--color-text-main)] drop-shadow-sm">{cat.title}</span>
                <p className="text-[8px] font-bold text-[var(--color-text-gray)] opacity-40 uppercase tracking-tighter">{cat.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 5. NOTIFICATION SYSTEM (RETRAITS EN TEMPS RÉEL) */}
      <div className="space-y-4 pt-4 border-t border-white/5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.4)]"></span>
            <h3 className="text-[12px] font-black uppercase text-white tracking-[0.2em]">Retraits en temps réel</h3>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/5 border border-white/5">
              <span className="text-[7px] font-bold text-[var(--color-text-gray)] uppercase tracking-widest">Connecté</span>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-transparent via-purple-500/5 to-transparent py-1 text-center">
          <p className="text-[8px] font-bold text-purple-400/60 uppercase tracking-[0.2em]">Les utilisateurs qui génèrent le plus de revenus sont des membres PREMIUM.</p>
        </div>
        
        <LiveWithdrawalFeed />
      </div>
    </div>
  );
};

const LiveWithdrawalFeed = () => {
  const names = [
    // --- West Africa ---
    "Abdoulaye", "Aminata", "Moussa", "Fatoumata", "Ibrahim", "Mariam", "Ousmane", "Aissatou", "Sekou", "Kadidiatou",
    "Cheick", "Djeneba", "Bakary", "Sira", "Modibo", "Tene", "Lamine", "Awa", "Youssouf", "Fanta",
    "Issa", "Koumba", "Amadou", "Hawa", "Boubacar", "Salimatou", "Adama", "Ouleymatou", "Souleymane", "Djenebou",
    "Aliou", "Bintou", "Mamoudou", "Kadiatou", "Bréhima", "Ramata", "Daouda", "Safiatou", "Sidi", "Rokiatou",
    "Mahamadou", "Nana", "Yaya", "Maimouna", "Ishaq", "Alimatou", "Oumar", "Zeynab", "Yacouba", "Nènè",
    "Seydou", "Aicha", "Tidiane", "Assétou", "Bassirou", "Fatim", "Drissa", "Korotoumou", "Mory", "Mariame",
    "Dramane", "Sali", "Karim", "Zali", "Hamidou", "Penda", "Kalifa", "Kadia", "Ouro", "Binta",
    "Lassina", "Assetou", "Adou", "Oumou", "Demba", "Fadima", "Samba", "Founé", "Mamadou", "Kadi",
    "Aboubacar", "Fatou", "Sidiki", "Hadja", "Yero", "Aïssata", "Alpha", "Djeynabou", "Ibrahima", "Zainab",
    "Karamoko", "Oulèye", "Sékouba", "Nafi", "Tidjani", "Oumi", "Moustapha", "Siré", "Amara", "Aminatou",
    "Habib", "Nene", "Mohamed", "Téning", "Ismael", "Coumba", "Broulaye", "Goundo", "Soumaila", "Nantènè",
    "Gaoussou", "Houlaymatou", "Oury", "Fatima", "Lansana", "Balkissa", "Bafodé", "Soukeyna", "Aly", "M'Mah",
    // --- Central Africa ---
    "Dieudonné", "Marie-Noëlle", "Bienvenu", "Espérance", "Prosper", "Clémence", "Désiré", "Prudence", "Innocent", "Divine",
    "Célestin", "Fidèle", "Aristide", "Chantal", "Rodrigue", "Bernadette", "Florent", "Yvonne", "Gervais", "Félicité",
    "Arsène", "Solange", "Théophile", "Eulalie", "Constant", "Brigitte", "Urbain", "Odette", "Landry", "Chantal",
    "Parfait", "Evelyne", "Gaspard", "Marceline", "Godefroy", "Rosalie", "Léopold", "Germaine", "Pacôme", "Blanche",
    // --- Biblical / Christian ---
    "Victor", "Hélène", "Arnaud", "Esther", "Samuel", "Marthe", "David", "Ruth", "Isaac", "Sarah",
    "Daniel", "Léa", "Joseph", "Rachel", "Noé", "Noémie", "Gédéon", "Déborah", "Élie", "Patience",
    "Joël", "Grâce", "Josué", "Victoire", "Siméon", "Espérance", "Silas", "Miséricorde", "Jonas", "Joie",
    "Barnabé", "Félicité", "Timothée", "Bénédicte", "Stéphane", "Angèle", "Yannick", "Sonia", "Franck", "Carine",
    // --- North Africa / Arabic ---
    "Abdel", "Noura", "Riad", "Layla", "Sami", "Farida", "Omar", "Siham", "Yassin", "Amira",
    "Khaled", "Ines", "Malek", "Dounia", "Walid", "Lina", "Zied", "Myriam", "Mehdi", "Hana",
    "Anas", "Meriem", "Hamza", "Salma", "Sofiane", "Rym", "Oualid", "Nadia", "Bilal", "Asma",
    "Tarek", "Imane", "Fouad", "Faten", "Nabil", "Houda", "Adel", "Zohra", "Wissem", "Latifa",
    // --- French / International ---
    "Thierry", "Nadège", "Olivier", "Mireille", "Christian", "Berthe", "Alain", "Céline", "Patrice", "Muriel",
    "Gilles", "Christelle", "Hervé", "Sylvie", "Laurent", "Isabelle", "Marc", "Françoise", "Eric", "Pascale",
    "Denis", "Béatrice", "Luc", "Véronique", "Guy", "Dominique", "Bruno", "Brigitte", "Didier", "Colette",
    "Richard", "Nicole", "Serge", "Denise", "Dominique", "Jacqueline", "Jean-Pierre", "Janine", "Jean-Claude", "Suzanne",
    "Jean-Marie", "Madeleine", "Jean-Paul", "Josiane", "Jean-Luc", "Gisèle", "Philippe", "Andrée", "Michel", "Paulette",
    "Claude", "Raymonde", "Gérard", "Simone", "Bernard", "Yvette", "Robert", "Renée", "Marcel", "Marcelle",
    // --- New Unique Mix (to reach 500+) ---
    "Aron", "Zora", "Tarik", "Safia", "Yosra", "Majid", "Laila", "Nourdine", "Houria", "Mounir",
    "Sonia", "Farid", "Rania", "Aissa", "Salim", "Fatina", "Rachid", "Dounia", "Malik", "Anissa",
    "Yacine", "Karima", "Faysal", "Leila", "Hakim", "Zahra", "Omar", "Samiha", "Ilias", "Imen",
    "Hassen", "Mouna", "Sofiane", "Rym", "Adel", "Zohra", "Walid", "Alya", "Skander", "Mayssa",
    "Anouar", "Chourouk", "Raouf", "Sawssen", "Faouzi", "Sarra", "Salem", "Wiem", "Jamel", "Linda",
    "Rami", "Amel", "Samir", "Najeh", "Wissem", "Jouda", "Kamel", "Samia", "Fida", "Zouhair",
    "Rokaia", "Lamine", "Malika", "Hafid", "Assia", "Brahim", "Latifa", "Messaoud", "Fatiha", "Aziz",
    "Mina", "Said", "Lila", "Nacer", "Soumaya", "Djamel", "Nora", "Ryad", "Zina", "Slim",
    "Ines", "Mehdi", "Hana", "Anis", "Meriem", "Hamza", "Salma", "Sofiane", "Rym", "Oualid",
    "Nadia", "Bilal", "Asma", "Tarek", "Imane", "Fouad", "Faten", "Nabil", "Houda", "Adel",
    "Zohra", "Wissem", "Latifa", "Skander", "Mounira", "Jalel", "Fafani", "Hassen", "Mina", "Rached",
    "Baya", "Ridha", "Najet", "Chiheb", "Faiza", "Mondher", "Dalila", "Lotfi", "Souad", "Habib",
    "Bassem", "Marwa", "Nizar", "Dorra", "Slim", "Olfa", "Wajdi", "Emna", "Haythem", "Jihene",
    "Makrem", "Sabrine", "Ramzi", "Ichrak", "Chaker", "Wafa", "Mohsen", "Nour", "Fathi", "Ines",
    "Hichem", "Sana", "Ilyes", "Ons", "Rafik", "Maya", "Walid", "Rim", "Akram", "Eya",
    "Bechir", "Yasmine", "Mounir", "Chaima", "Salah", "Hela", "Fares", "Ameni", "Zied", "Sirine",
    "Amine", "Nour", "Hatem", "Yousra", "Slimen", "Ghada", "Sadok", "Islem", "Taieb", "Rania",
    "Tijani", "Donia", "Majdi", "Oumayma", "Marwen", "Rahma", "Wassim", "Molka", "Riadh", "Tasnim",
    "Hechmi", "Hadil", "Slaheddine", "Zeineb", "Moncef", "Sirine", "Lassaad", "Rawia", "Abderrazzak", "Zina",
    "Ferid", "Henda", "Mustapha", "Manel", "Fethi", "Khouloud", "Hedi", "Balkis", "Khelil", "Nourhene",
    "Anouar", "Chourouk", "Raouf", "Mayssa", "Taoufik", "Sawssen", "Faouzi", "Sarra", "Salem", "Nour",
    "Hajji", "Wiem", "Jamel", "Linda", "Rami", "Amel", "Samir", "Najeh", "Wissem", "Jouda",
    "Kamel", "Samia", "Adel", "Fida", "Zouhair", "Rokaia", "Lamine", "Malika", "Hafid", "Assia",
    "Brahim", "Latifa", "Messaoud", "Fatiha", "Aziz", "Mina", "Said", "Lila", "Nacer", "Soumaya",
    "Koffi", "Ama", "Kwame", "Abena", "Kwesi", "Akua", "Kojo", "Yaa", "Ekow", "Afia",
    "Chidi", "Chioma", "Emeka", "Ifunanya", "Nnamdi", "Oluchi", "Obinna", "Amaka", "Uche", "Nkechi",
    "Tunde", "Folake", "Segun", "Bisi", "Femi", "Ronke", "Kunle", "Yinka", "Dapo", "Nike",
    "Moussa", "Khady", "Souleymane", "Fatou", "Cheikh", "Mariama", "Abdou", "Astou", "Ibrahima", "Penda",
    "Diallo", "Sow", "Ba", "Barry", "Sy", "Niang", "Diop", "Fall", "Gueye", "Ndiaye",
    "Camara", "Keita", "Kante", "Traore", "Kourechi", "Dembele", "Coulibaly", "Diakitè", "Sissoko", "Fofana",
    "Ouedraogo", "Sawadogo", "Zongo", "Kabore", "Sore", "Yameogo", "Ouattara", "Sanogo", "Coulibaly", "Koné",
    "Gbagbo", "Ouattara", "Konan", "Bedié", "Soro", "Bakayoko", "Hamed", "Duncan", "Achi", "Tanoh",
    "Sassou", "Nguesso", "Bongo", "Ondimba", "Biya", "Deby", "Patassé", "Bozizé", "Touadera", "Mba",
    "Tshisekedi", "Kabila", "Mobutu", "Lumumba", "Kasavubu", "Gizenga", "Bemba", "Katumbi", "Fayulu", "Matata",
    "Museveni", "Kagame", "Kenyatta", "Ruto", "Odinga", "Magufuli", "Samia", "Nkurunziza", "Ndayishimiye", "Buyoya",
    "Ramaphosa", "Zuma", "Mbeki", "Mandela", "De Klerk", "Botha", "Vorster", "Verwoerd", "Strijdom", "Malan",
    "Lula", "Dilma", "Temer", "Bolsonaro", "Chavez", "Maduro", "Morales", "Arce", "Correa", "Moreno",
    "Petro", "Duque", "Santos", "Uribe", "Pastrana", "Samper", "Gaviria", "Barco", "Betancur", "Turbay",
    "Fernandez", "Macri", "Kirchner", "Duhalde", "Rodriguez", "Puerta", "De la Rua", "Menem", "Alfonsin", "Videla",
    "Pinochet", "Allende", "Frei", "Lagos", "Bachelet", "Piñera", "Boric", "Aylwin", "Alessandri", "Montalva",
    "Castro", "Diaz-Canel", "Ortega", "Murillo", "Hernandez", "Zelaya", "Lobo", "Maduro", "Cortizo", "Varela",
    "Bukele", "Funes", "Saca", "Flores", "Calderon", "Cristiani", "Duarte", "Giammattei", "Morales", "Perez",
    "Arévalo", "Colom", "Berger", "Portillo", "Arzú", "Serrano", "Cerezo", "Rios", "Lucas", "Laugerud",
    "Andres", "Sofia", "Mateo", "Valentina", "Sebastian", "Isabella", "Nicolas", "Camila", "Diego", "Mariana",
    "Samuel", "Luciana", "Daniel", "Daniela", "Alejandro", "Gabriela", "Gabriel", "Victoria", "Joaquin", "Martina",
    "Emmanuel", "Julieta", "Agustin", "Ximena", "Tomas", "Sara", "Benjamin", "Antonella", "Francisco", "Catalina"
  ];

  const reasons = [
    "Identité non conforme",
    "Numéro Mobile Money invalide",
    "Hors zone autorisée",
    "Réseau saturé",
    "Limite quotidienne atteinte",
    "Vérification manuelle requise",
    "Échec opérateur"
  ];

  // Stable Icons for African Mobile Money Providers
  const getIcon = (method: string) => {
    switch(method) {
      case "Orange Money": return "https://brand.orange.com/app/uploads/2016/10/logo-orange.png";
      case "MTN MoMo": return "https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/New-mtn-logo.jpg/200px-New-mtn-logo.jpg";
      case "Wave": return "https://dashboard.wave.com/static/favicon.ico"; // Using favicon or a stable logo if known
      case "Airtel Money": return "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Airtel_logo-01.png/200px-Airtel_logo-01.png";
      case "Moov Money": return "https://www.moov-africa.ml/PublishingImages/Logo/Logo-Moov-Africa.png";
      default: return "";
    }
  };

  const [feed, setFeed] = useState<any[]>([]);
  const [isQuiet, setIsQuiet] = useState(false);

  const generateRichEvent = (initial = false, forceType?: 'pending' | 'validated' | 'rejected') => {
    const name = names[Math.floor(Math.random() * names.length)];
    
    // Amount limited to 1000 - 30000 FCFA according to user request
    const amountTypeRoll = Math.random();
    let amountXAF = 0;
    if (amountTypeRoll > 0.8) {
      amountXAF = (Math.floor(Math.random() * 20) + 11) * 1000; // 11000 to 30000
    } else {
      amountXAF = (Math.floor(Math.random() * 9) + 1) * 1000 + (Math.floor(Math.random() * 10) * 100); // 1000 to 10000
    }
    
    const methods = ["Orange Money", "MTN MoMo", "Wave", "Airtel Money", "Moov Money"];
    const method = methods[Math.floor(Math.random() * methods.length)];
    
    let type = forceType || (Math.random() > 0.4 ? (Math.random() > 0.85 ? 'rejected' : 'validated') : 'pending');
    const reason = type === 'rejected' ? reasons[Math.floor(Math.random() * reasons.length)] : '';
    
    // Choose a random currency for variety in the global feed
    const currencies = ['XAF', 'XOF', 'NGN', 'GHS', 'EUR', 'KES', 'ZAR'];
    const selectedCurrency = currencies[Math.floor(Math.random() * currencies.length)];
    
    // Randomly assign premium status (98% of successful withdrawals are premium as per marketing goal)
    const isPremium = Math.random() > 0.02;
    
    return {
      id: Math.random().toString(36).substr(2, 9),
      name,
      amountXAF,
      currency: selectedCurrency,
      type,
      method,
      reason,
      timestamp: initial ? `${Math.floor(Math.random() * 15) + 1}m` : 'À l\'instant',
      progress: type === 'pending' ? Math.floor(Math.random() * 15) + 5 : 100, // Slower start for realism
      pendingCycles: 0,
      waitThreshold: Math.random() > 0.6 ? (Math.floor(Math.random() * 8) + 10) : (Math.floor(Math.random() * 4) + 3), // Some take longer
      showFlash: false,
      isPremium
    };
  };

  useEffect(() => {
    // Fill initial with 2 events for a more "quiet" start
    setFeed([
      generateRichEvent(true, 'validated'),
      generateRichEvent(true, 'pending')
    ]);

    let timeoutId: NodeJS.Timeout;

    const runFeedProcess = () => {
      setFeed(prev => {
        // 1. Logic for existing events (Status Resolution)
        let pendingFound = false;
        const nextFeed = prev.map(ev => {
           if (ev.type === 'pending') {
             // Increment cycles to ensure longer wait
             const updatedCycles = ev.pendingCycles + 1;
             
             // Dynamic wait requirement for resolution
             if (!pendingFound && updatedCycles >= (ev.waitThreshold || 3) && Math.random() > 0.5) {
               pendingFound = true;
               const isSuccess = Math.random() > 0.15;
               return { 
                 ...ev, 
                 type: isSuccess ? 'validated' : 'rejected' as any, 
                 progress: 100, 
                 timestamp: 'TERMINÉ', 
                 showFlash: true,
                 reason: !isSuccess ? reasons[Math.floor(Math.random() * reasons.length)] : ''
               };
             }
             // Smooth progress increase
             const nextProgress = Math.min(ev.progress + (Math.random() * 15 + 5), 95);
             return { ...ev, progress: nextProgress, pendingCycles: updatedCycles };
           }
           if (ev.showFlash) return { ...ev, showFlash: false };
           return ev;
        });

        // 2. Decide if we add a new event
        const addProbability = isQuiet ? 0.2 : 0.6;
        if (Math.random() < addProbability) {
          const newEvent = generateRichEvent();
          return [newEvent, ...nextFeed.slice(0, 4)];
        }
        
        // 3. Periodically remove oldest events if too many
        return nextFeed.slice(0, 4);
      });

      // 4. Randomly toggle quiet mode
      if (Math.random() > 0.95) setIsQuiet(q => !q);

      // 5. Dynamic interval: bursts vs silence
      const baseDelay = isQuiet ? 15000 : 6000;
      const variableDelay = baseDelay + (Math.random() * 8000 - 4000); // +/- 4s
      
      timeoutId = setTimeout(runFeedProcess, variableDelay);
    };

    timeoutId = setTimeout(runFeedProcess, 5000);

    return () => clearTimeout(timeoutId);
  }, [isQuiet]);

  return (
    <div className="space-y-4">
      <AnimatePresence mode="popLayout">
        {feed.map((ev) => (
          <motion.div
            key={ev.id}
            layout
            initial={{ opacity: 0, scale: 0.8, x: -30, filter: 'blur(10px)' }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              x: 0, 
              filter: 'blur(0px)',
              backgroundColor: ev.showFlash ? 'rgba(16, 185, 129, 0.4)' : '#080808'
            }}
            exit={{ opacity: 0, scale: 0.9, x: 30, filter: 'blur(5px)' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className={`group relative overflow-hidden rounded-[2rem] p-5 border transition-all duration-700 shadow-2xl backdrop-blur-3xl ${
              ev.type === 'validated' ? 'border-emerald-500/40' :
              ev.type === 'rejected' ? 'border-red-500/40' :
              'border-[var(--color-border-gold)]/40 animate-pulse'
            }`}
          >
            {ev.isPremium && (
              <div className="absolute top-3 right-5 flex items-center gap-1.5 z-20 opacity-50">
                <div className="w-[3px] h-[3px] rounded-full bg-purple-500 shadow-[0_0_5px_#a855f7]" />
                <span className="text-[6px] font-black text-purple-400 uppercase tracking-[0.2em]">Membre Premium</span>
              </div>
            )}
            {/* Visual Dopamine Layer */}
            <div className={`absolute inset-0 opacity-[0.03] pointer-events-none ${
              ev.type === 'validated' ? 'bg-[radial-gradient(circle_at_center,white,transparent)]' : ''
            }`}></div>
            
            {/* Liquid Background Pulse */}
            <motion.div 
               animate={{ 
                 scale: [1, 1.2, 1],
                 opacity: [0.05, 0.1, 0.05]
               }}
               transition={{ duration: 4, repeat: Infinity }}
               className={`absolute -right-10 -top-10 w-40 h-40 blur-[50px] rounded-full pointer-events-none ${
                 ev.type === 'validated' ? 'bg-emerald-500' :
                 ev.type === 'rejected' ? 'bg-red-500' :
                 'bg-[var(--color-gold-main)]'
               }`}
            />

            <div className="relative z-10 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                {/* Method Platform Icon */}
                <div className="relative shrink-0">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center p-2 border transition-all duration-500 ${
                    ev.type === 'validated' ? 'bg-emerald-500/10 border-emerald-500/20' :
                    ev.type === 'rejected' ? 'bg-red-500/10 border-red-500/20' :
                    'bg-white/5 border-white/5'
                  }`}>
                    <img 
                      src={getIcon(ev.method)} 
                      alt={ev.method} 
                      className="w-full h-full object-contain" 
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        // Fallback to a financial icon if the logo fails to load
                        (e.target as HTMLImageElement).src = "https://cdn-icons-png.flaticon.com/512/2169/2169864.png";
                        (e.target as HTMLImageElement).onerror = null; // Prevent infinite loop
                      }}
                    />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                       <h4 className="text-[13px] font-black text-white leading-none">{ev.name}</h4>
                    </div>
                    <div className={`px-2 py-0.5 rounded text-[8px] font-black tracking-widest uppercase border ${
                      ev.type === 'validated' ? 'bg-emerald-500 text-black border-emerald-400' :
                      ev.type === 'rejected' ? 'bg-red-500 text-white border-red-400' :
                      'bg-white/10 text-white border-white/10'
                    }`}>
                      {ev.type === 'validated' ? 'REUSSI' : ev.type === 'rejected' ? 'REJETÉ' : 'EN COURS'}
                    </div>
                  </div>
                  
                  <p className="text-[10px] font-medium leading-tight">
                    {ev.type === 'validated' ? (
                      <span className="text-emerald-500">Retrait effectué avec succès via {ev.method}</span>
                    ) : ev.type === 'rejected' ? (
                      <span className="text-red-500">Retrait rejeté : {ev.reason}</span>
                    ) : (
                      <span className="text-[var(--color-gold-main)] animate-pulse">Vérification du retrait en cours...</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="flex flex-col items-end">
                  <CurrencyDisplay 
                    amount={ev.amountXAF} 
                    className={`text-[18px] font-black tracking-tight ${
                      ev.type === 'validated' ? 'text-emerald-500' : 
                      ev.type === 'rejected' ? 'text-red-500' : 
                      'text-white'
                    }`}
                    secondaryClassName="hidden"
                    showOriginal={false}
                  />
                  <span className="text-[8px] font-bold text-neutral-500 uppercase">{ev.timestamp}</span>
                </div>
              </div>
            </div>

            {/* Neural Progress Line */}
            <div className="mt-4 relative h-[3px] w-full bg-white/5 rounded-full overflow-hidden">
               {ev.type === 'pending' && (
                 <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_10px,rgba(255,255,255,0.05)_10px,rgba(255,255,255,0.05)_20px)] opacity-50"></div>
               )}
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${ev.progress}%` }}
                 transition={{ duration: 1.2, ease: "circOut" }}
                 className={`h-full relative ${
                   ev.type === 'validated' ? 'bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_20px_#10b981]' : 
                   ev.type === 'rejected' ? 'bg-red-600' : 
                   'bg-gradient-to-r from-transparent via-[var(--color-gold-main)] to-white'
                 }`}
               >
                 {ev.type === 'pending' && (
                   <motion.div 
                     animate={{ x: ['0%', '200%'] }}
                     transition={{ repeat: Infinity, duration: 1 }}
                     className="absolute inset-0 bg-white/20 blur-sm"
                   />
                 )}
               </motion.div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      <div className="mt-8 p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
         <div className="flex items-center gap-3">
            <Shield size={16} className="text-emerald-500" />
            <p className="text-[10px] font-bold text-white uppercase tracking-tight">Système de paiement sécurisé</p>
         </div>
         <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-tighter">Blockchain MZ+</p>
      </div>
    </div>
  );
};

const PillarCard = ({ title, desc, icon: Icon, color, onClick }: any) => {
  const isGold = color === 'gold';
  const isPurple = color === 'purple';
  return (
    <button 
      onClick={onClick}
      className="group relative h-64 md:h-[400px] w-full rounded-[2.5rem] overflow-hidden border border-white/5 bg-[#0a0a08] transition-all hover:scale-[1.01] active:scale-98 duration-500 shadow-xl"
    >
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-700 ${isGold ? 'bg-[var(--color-gold-main)]' : isPurple ? 'bg-[var(--color-academy-purple)]' : 'bg-emerald-600'}`}></div>
      <div className="absolute top-0 right-0 p-8 opacity-[0.01] rotate-12 group-hover:rotate-0 transition-transform duration-1000">
        <Icon size={240} className={isGold ? 'text-[var(--color-gold-main)]' : isPurple ? 'text-[var(--color-academy-purple)]' : 'text-emerald-600'} />
      </div>
      <div className="relative h-full p-8 flex flex-col justify-between items-start text-left z-10">
        <div className={`p-4 rounded-2xl border transition-all duration-500 ${isGold ? 'bg-[var(--color-gold-main)]/10 border-[var(--color-gold-main)]/20 text-[var(--color-gold-main)] group-hover:bg-[var(--color-gold-main)] group-hover:text-black' : isPurple ? 'bg-[var(--color-academy-purple)]/10 border-[var(--color-academy-purple)]/20 text-purple-400 group-hover:bg-[var(--color-academy-purple)] group-hover:text-white' : 'bg-emerald-600/10 border-emerald-600/20 text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white'}`}>
          <Icon size={24} strokeWidth={2.5} />
        </div>
        <div className="space-y-3">
           <div>
              <h3 className="text-2xl md:text-4xl font-black uppercase tracking-tighter text-white italic group-hover:translate-x-1 transition-transform duration-500">{title}</h3>
              <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#6B6050] mt-1 leading-relaxed max-w-[160px] opacity-80">{desc}</p>
           </div>
           <div className={`flex items-center gap-2 text-[8px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500 ${isGold ? 'text-[var(--color-gold-main)]' : isPurple ? 'text-purple-400' : 'text-emerald-400'}`}>
              Ouvrir <ArrowRight size={10} />
           </div>
        </div>
      </div>
    </button>
  );
};

const SubServiceCard = ({ title, desc, icon: Icon, onClick, locked }: any) => (
  <button onClick={onClick} className="group relative w-full p-5 rounded-2xl bg-[#0d0d0c] border border-[var(--color-border-gold)] transition-all hover:border-[var(--color-gold-main)]/20 active:scale-98 flex items-center justify-between shadow-lg">
    <div className="flex items-center gap-4">
       <div className="p-3 bg-white/5 rounded-xl text-[#6B6050] group-hover:text-[var(--color-gold-main)] group-hover:bg-[var(--color-gold-main)]/10 transition-all border border-transparent group-hover:border-[var(--color-gold-main)]/10">
          <Icon size={20} />
       </div>
       <div className="text-left">
          <h4 className="text-xs font-black uppercase text-white tracking-tight group-hover:text-[var(--color-gold-main)] transition-colors">{title}</h4>
          <p className="text-[8px] font-bold text-[#6B6050] uppercase mt-0.5 tracking-wider opacity-70">{desc}</p>
       </div>
    </div>
    {locked ? (
      <div className="p-1.5 bg-black/40 rounded-lg text-[#6B6050] border border-white/5 opacity-50">
        <Lock size={12} />
      </div>
    ) : (
      <div className="p-1.5 text-[#6B6050]/40 group-hover:text-[var(--color-gold-main)] group-hover:translate-x-1 transition-all">
        <ChevronRight size={16} />
      </div>
    )}
  </button>
);

export const ProfileTab: React.FC<any> = ({ profile, onLogout, isAdmin, onSwitchTab }) => {
  const isMzPlus = profile?.user_level === 'niveau_mz_plus';
  
  return (
    <div className="max-w-xl mx-auto space-y-8 pb-24 pt-10 px-5 animate-fade-in font-sans">
      <SectionTitle 
        title="Mon Espace Élite" 
        subtitle="Gérez votre identité et vos paramètres de compte." 
      />

      {/* Admin Panel Quick Access */}
      {isAdmin && (
        <button 
          onClick={() => onSwitchTab('admin')}
          className="w-full flex items-center gap-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-all border-dashed"
        >
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-500">
            <Lock size={20} />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Accès Prioritaire</p>
            <h4 className="text-sm font-black text-white uppercase tracking-tighter">Panel Administration</h4>
          </div>
          <ChevronRight size={18} className="ml-auto text-amber-500" />
        </button>
      )}

      <div className="relative group">
         <div className="absolute -inset-1 bg-gradient-to-r from-[var(--color-gold-main)] to-purple-600 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
         <div className="relative bg-[#0d0d0c] border border-white/5 rounded-[2.5rem] p-8">
            <div className="flex flex-col items-center text-center gap-6">
               <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#1A1814] to-[#0A0908] border-2 border-[var(--color-gold-main)]/30 flex items-center justify-center shadow-2xl relative z-10">
                     <span className="text-4xl">🤴</span>
                  </div>
                  {isMzPlus && (
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30 z-20">
                       <Crown size={14} fill="currentColor" />
                    </div>
                  )}
               </div>

               <div className="space-y-1">
                  <h3 className="text-xl font-black uppercase tracking-tighter text-white italic">
                    {profile?.full_name || 'Utilisateur Élite'}
                  </h3>
                  <div className="flex items-center justify-center gap-2">
                    <EliteBadge level={isMzPlus ? 'PREMIUM' : 'STANDARD'} />
                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">•</span>
                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">{profile?.email}</span>
                  </div>
               </div>

               <div className="w-full h-[1px] bg-white/5"></div>

               <div className="grid grid-cols-2 w-full gap-4">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
                     <p className="text-[8px] font-black text-neutral-500 uppercase tracking-widest mb-1">Code Parrainage</p>
                     <p className="text-sm font-black text-[var(--color-gold-main)] uppercase tracking-tighter">{profile?.referral_code || '---'}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
                     <p className="text-[8px] font-black text-neutral-500 uppercase tracking-widest mb-1">Membre Depuis</p>
                     <p className="text-sm font-black text-white uppercase tracking-tighter">
                        {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '---'}
                     </p>
                  </div>
               </div>
            </div>
         </div>
      </div>

      <div className="space-y-3">
         <ProfileMenuButton icon={User} label="Informations Personnelles" sub="Nom, Email, Photo" />
         <ProfileMenuButton icon={Shield} label="Sécurité" sub="Mot de passe, 2FA" />
         <ProfileMenuButton icon={Bell} label="Notifications" sub="Push, Email, Alertes" />
         <ProfileMenuButton icon={Settings} label="Préférences" sub="Langue, Devise, Thème" />
      </div>

      <div className="pt-8 border-t border-white/5">
        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 font-black uppercase text-[10px] tracking-[0.2em] transition-all hover:bg-red-500/20 active:scale-95 shadow-lg shadow-red-500/5 group"
        >
          <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" /> 
          Déconnexion Sécurisée
        </button>
        <p className="text-center text-[8px] text-neutral-600 font-bold uppercase tracking-[0.3em] mt-6 opacity-30">
          Millionaire Zone Plus v7.4.2 • Elite Secure Logout
        </p>
      </div>
    </div>
  );
};

const ProfileMenuButton = ({ icon: Icon, label, sub }: any) => (
  <button className="w-full flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all text-left group">
    <div className="flex items-center gap-4">
      <div className="p-2.5 rounded-xl bg-black/40 text-[var(--color-gold-main)] border border-white/5">
        <Icon size={18} />
      </div>
      <div>
        <h4 className="text-[11px] font-black uppercase text-white tracking-tight">{label}</h4>
        <p className="text-[8px] font-bold text-neutral-500 uppercase tracking-wider">{sub}</p>
      </div>
    </div>
    <ChevronRight size={16} className="text-neutral-600 group-hover:text-white transition-colors" />
  </button>
);

export const RevenueTab: React.FC<any> = ({ profile, wallet, onRefresh }) => {
  return (
    <WithdrawalSystem 
      profile={profile} 
      wallet={wallet} 
      onRefresh={onRefresh} 
    />
  );
};

export const TeamTab: React.FC<any> = ({ profile, teamCount }) => (
  <ReferralDashboard profile={profile} teamCount={teamCount} />
);

export const RPADashboard: React.FC<any> = ({ profile, onRefresh, onSwitchTab }) => (
  <RpaDashboard profile={profile} onRefresh={onRefresh} onSwitchTab={onSwitchTab} />
);

export const CoachingTab: React.FC<any> = ({ profile, onSwitchTab }) => (
  <CoachingDashboard profile={profile} onSwitchTab={onSwitchTab} />
);

export const FormationTab: React.FC<any> = ({ profile, onSwitchTab }) => (<AcademieMain profile={profile} onSwitchTab={onSwitchTab} />);

export const SuggestionsTab: React.FC<{ profile: UserProfile | null }> = ({ profile }) => {
  const [suggestion, setSuggestion] = useState('');
  const [isSending, setIsSending] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    try {
      await supabase.from('user_suggestions').insert([{ user_id: profile?.id, suggestion, type: 'suggestion' }]);
      setSuggestion(''); alert("Merci pour votre idée !");
    } catch (e: any) { alert(e.message); } finally { setIsSending(false); }
  };
  return (
    <div className="max-w-3xl mx-auto space-y-12 animate-fade-in pb-20 pt-10">
      <SectionTitle title="Suggestions" subtitle="Aidez-nous à améliorer MZ+." />
      <GoldBorderCard className="p-10 bg-black/40 border-white/5">
        <form onSubmit={handleSubmit} className="space-y-8">
           <textarea required rows={5} placeholder="Votre idée..." className="w-full bg-black border border-white/10 rounded-xl p-6 text-sm text-white resize-none" value={suggestion} onChange={e => setSuggestion(e.target.value)} />
           <PrimaryButton fullWidth isLoading={isSending} type="submit">Envoyer mon message</PrimaryButton>
        </form>
      </GoldBorderCard>
    </div>
  );
};

export const UpgradeTab: React.FC = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 animate-fade-in pt-20">
    <div className="w-20 h-20 bg-yellow-600/10 rounded-[2rem] flex items-center justify-center mb-8 border border-yellow-600/20 shadow-2xl">
      <Crown className="text-yellow-600 animate-pulse" size={32} />
    </div>
    <h3 className="text-2xl md:text-4xl font-black uppercase tracking-tighter text-white leading-tight max-w-2xl">
      L'accès <GoldText>MZ+ Premium</GoldText> est maintenant <GoldText>OUVERT</GoldText>. <br/> Profitez de l'offre flash pour débloquer tout le système.
    </h3>
    <div className="mt-12 p-8 border border-dashed border-white/5 rounded-[3rem] opacity-30">
      <p className="text-[8px] text-neutral-500 font-bold uppercase tracking-[0.5em] leading-relaxed">
        Propulsé par Millionaire Zone Plus Neural Network v6.5
      </p>
    </div>
  </div>
);

export const GuidesTab: React.FC<any> = ({ onStartAffiliationGuide, onStartRPAGuide, onStartTeamGuide }) => (
  <GuidesTabComponent 
    onStartAffiliationGuide={onStartAffiliationGuide} 
    onStartRPAGuide={onStartRPAGuide} 
    onStartTeamGuide={onStartTeamGuide} 
  />
);
