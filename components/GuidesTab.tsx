
import React from 'react';
import { HelpCircle, Target, Briefcase, Sparkles, ArrowRight, PlayCircle, Users } from 'lucide-react';
import { motion } from 'motion/react';

interface GuidesTabProps {
  onStartAffiliationGuide: () => void;
  onStartRPAGuide: () => void;
  onStartTeamGuide: () => void;
}

export const GuidesTab: React.FC<GuidesTabProps> = ({ onStartAffiliationGuide, onStartRPAGuide, onStartTeamGuide }) => {
  const guides = [
    {
      id: 'affiliation',
      title: 'Guide Affiliation',
      description: 'Apprends à maîtriser le système d\'affiliation, à partager tes liens et à suivre tes commissions.',
      icon: Briefcase,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
      action: onStartAffiliationGuide
    },
    {
      id: 'rpa',
      title: 'Guide RPA (Vidéo)',
      description: 'Découvre comment soumettre tes vidéos TikTok/Reels et transformer tes vues en revenus réels.',
      icon: Target,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
      action: onStartRPAGuide
    },
    {
      id: 'team',
      title: 'Guide Parrainage',
      description: 'Apprends à parrainer de nouveaux membres, partage ton lien unique et gagne des points RPA.',
      icon: Users,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
      action: onStartTeamGuide
    },
    {
      id: 'global',
      title: 'Tour d\'horizon MZ+',
      description: 'Un guide rapide pour comprendre toutes les fonctionnalités de ton espace Elite.',
      icon: Sparkles,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/20',
      action: () => {
        localStorage.removeItem('mz_guide_completed');
        window.location.reload();
      }
    }
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-12 animate-fade-in">
      <header className="space-y-4 text-center md:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
          <HelpCircle size={14} className="text-purple-500" />
          <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Centre d'aide interactif</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white italic leading-none">
          GUIDES <span className="text-purple-600">INTERACTIFS</span>
        </h1>
        <p className="text-neutral-500 text-sm md:text-base max-w-2xl font-medium">
          Besoin d'un rafraîchissement ? Relance n'importe quel guide pour maîtriser parfaitement les outils de Millionnaire Zone Plus.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {guides.map((guide, index) => (
          <motion.div
            key={guide.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`group relative p-8 rounded-[2.5rem] border ${guide.borderColor} ${guide.bgColor} backdrop-blur-sm hover:scale-[1.02] transition-all cursor-pointer overflow-hidden`}
            onClick={guide.action}
          >
            <div className="relative z-10 flex flex-col h-full justify-between gap-8">
              <div className="space-y-6">
                <div className={`w-14 h-14 ${guide.bgColor} border ${guide.borderColor} rounded-2xl flex items-center justify-center ${guide.color} shadow-lg group-hover:scale-110 transition-transform`}>
                  <guide.icon size={28} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black uppercase tracking-tight text-white italic">{guide.title}</h3>
                  <p className="text-neutral-400 text-sm leading-relaxed font-medium">{guide.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white group-hover:gap-4 transition-all">
                Lancer le guide <PlayCircle size={16} className={guide.color} />
              </div>
            </div>

            {/* Decorative element */}
            <div className={`absolute -right-8 -bottom-8 w-32 h-32 ${guide.bgColor} blur-3xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity`}></div>
          </motion.div>
        ))}
      </div>

      <footer className="pt-12 border-t border-white/5 text-center">
        <p className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em]">
          Millionnaire Zone Plus • Système d'Accompagnement v2.0
        </p>
      </footer>
    </div>
  );
};
