import React, { useState, useEffect } from 'react';
import { Play, CheckCircle2, Crown, Zap, X, Timer, ArrowRight, ShieldCheck } from 'lucide-react';
import { supabase } from '../../../services/supabase.ts';
import { CurrencyDisplay } from '../../ui/CurrencyDisplay.tsx';

// Composant de texte à dégradé violet local
const PurpleText: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <span 
    className={`inline-block ${className}`}
    style={{ 
      background: 'linear-gradient(to right, #e879f9, #a855f7, #6366f1)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      color: 'transparent',
    }}
  >
    {children}
  </span>
);

export const MZPlusPresentationOverlay: React.FC<{ profile: any; onUpgrade: () => void }> = ({ profile, onUpgrade }) => {
  const [config, setConfig] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const { data, error } = await supabase.from('mz_plus_offer_config').select('*').single();
        if (error) throw error;
        if (data && data.is_active && profile?.user_level !== 'niveau_mz_plus') {
          setConfig(data);
          setIsVisible(true);
        }
      } catch (err) {
        console.warn("MZ+ Offer Config table not found or empty.");
      }
    };
    fetchConfig();
  }, [profile]);

  useEffect(() => {
    if (!config?.ends_at) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = new Date(config.ends_at).getTime() - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft(null);
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [config]);

  if (!isVisible || !config) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black overflow-y-auto animate-fade-in custom-scrollbar">
      {/* Header Floating */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/5 p-4 flex justify-between items-center px-6">
        <h2 className="text-xl font-black italic tracking-tighter"><PurpleText>MZ+ PREMIUM</PurpleText></h2>
        <button onClick={() => setIsVisible(false)} className="p-2 text-neutral-500 hover:text-white transition-colors">
          <X size={24} />
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-16">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600/10 border border-purple-600/20 rounded-full">
            <Zap size={14} className="text-purple-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400">Offre Exceptionnelle MZ+</span>
          </div>
          <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9] text-white">
            ARRÊTEZ DE JOUER, <br/><PurpleText>COMMENCEZ À ENCAISSER</PurpleText>
          </h1>
          <p className="text-neutral-400 text-lg md:text-xl font-medium italic max-w-2xl mx-auto">
            "Le système qui transforme votre audience en une machine à commissions automatisée."
          </p>
        </div>

        {/* Action Button & Pricing */}
        <div className="bg-gradient-to-br from-[#0e002a] to-black border border-purple-600/20 rounded-[3rem] p-8 md:p-12 text-center space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] rotate-12"><Crown size={120} className="text-purple-500" /></div>
          
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-500">Tarif Membre Privé</p>
            <div className="flex flex-col items-center gap-2 max-w-full overflow-hidden">
              <CurrencyDisplay 
                amount={150000} 
                className="text-neutral-600 text-xl md:text-2xl line-through font-black break-words" 
                vertical={true}
                preferXAF={true}
              />
              <div className="flex flex-col items-center gap-3 w-full">
                <CurrencyDisplay 
                  amount={20000} 
                  className="text-4xl sm:text-6xl md:text-8xl font-black text-white tracking-tighter font-mono break-words" 
                  vertical={true}
                  preferXAF={true}
                />
              </div>
            </div>
          </div>

          <button 
            onClick={onUpgrade}
            className="w-full max-w-xl mx-auto py-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl font-black uppercase text-sm md:text-lg tracking-widest shadow-[0_20px_50px_rgba(124,58,237,0.4)] hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-4"
          >
            OUI, JE VEUX AVOIR DES RÉSULTATS <ArrowRight size={24} />
          </button>

          {/* Countdown Container */}
          {timeLeft && (
            <div className="pt-6 flex justify-center items-center gap-4 md:gap-8">
               <div className="flex items-center gap-2 text-purple-400 animate-pulse">
                 <Timer size={20} />
                 <span className="text-[10px] font-black uppercase tracking-widest">L'offre expire dans :</span>
               </div>
               <div className="flex gap-4 font-mono">
                  <TimeBlock val={timeLeft.days} unit="J" />
                  <TimeBlock val={timeLeft.hours} unit="H" />
                  <TimeBlock val={timeLeft.minutes} unit="M" />
                  <TimeBlock val={timeLeft.seconds} unit="S" />
               </div>
            </div>
          )}
        </div>

        {/* Features List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-10">
          <FeatureItem title="Retraits Prioritaires" desc="Encaissez vos gains en moins de 24h sur votre Mobile Money." />
          <FeatureItem title="Commissions Élite" desc="Accédez aux services MZ+ avec des marges de profit doublées." />
          <FeatureItem title="Formation Millionnaire" desc={<>Le pack complet pour générer <CurrencyDisplay amount={1000000} inline vertical={true} preferXAF={true} />/mois avec l'IA et TikTok.</>} />
          <FeatureItem title="Coaching Privé" desc="Une session mensuelle avec nos experts pour débloquer vos paliers." />
          <FeatureItem title="Accès L'Arène" desc="Seuls les membres MZ+ sont éligibles aux bonus du Top 20." />
          <FeatureItem title="Support Gold" desc="Une ligne WhatsApp directe et prioritaire pour toutes vos questions." />
        </div>

        {/* Trust Seal */}
        <div className="flex flex-col items-center gap-4 opacity-40 pb-12">
          <ShieldCheck size={40} className="text-purple-400" />
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-center">Système Sécurisé • Satisfaction Garantie • Millionaire Zone Plus</p>
        </div>
      </div>
    </div>
  );
};

const TimeBlock = ({ val, unit }: { val: number; unit: string }) => (
  <div className="flex flex-col items-center">
    <span className="text-2xl font-black text-white">{val.toString().padStart(2, '0')}</span>
    <span className="text-[8px] font-black text-neutral-600 uppercase">{unit}</span>
  </div>
);

const FeatureItem = ({ title, desc }: { title: string; desc: React.ReactNode }) => (
  <div className="flex gap-5 p-6 bg-white/[0.02] border border-white/5 rounded-3xl hover:border-purple-600/20 transition-all group">
    <div className="p-3 bg-purple-600/10 rounded-xl text-purple-400 shrink-0 h-fit group-hover:bg-purple-600 group-hover:text-white transition-all">
      <CheckCircle2 size={20} />
    </div>
    <div className="space-y-1">
      <h4 className="text-sm font-black uppercase text-white tracking-tight">{title}</h4>
      <p className="text-xs text-neutral-500 leading-relaxed font-medium italic">{desc}</p>
    </div>
  </div>
);