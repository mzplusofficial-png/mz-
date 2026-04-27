
import React from 'react';
import { Video, Share2, Coins, ChevronRight } from 'lucide-react';

export const RpaProcess: React.FC = () => {
  const steps = [
    {
      icon: Video,
      title: "1. Créez",
      desc: "Faites une vidéo TikTok ou Reels sur MZ+",
      color: "text-blue-400",
      bg: "bg-blue-500/10"
    },
    {
      icon: Share2,
      title: "2. Publiez",
      desc: "Postez sur vos réseaux et copiez le lien",
      color: "text-purple-400",
      bg: "bg-purple-500/10"
    },
    {
      icon: Coins,
      title: "3. Gagnez",
      desc: "Collez le lien ici et recevez vos points",
      color: "text-yellow-500",
      bg: "bg-yellow-500/10"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
      {steps.map((step, i) => (
        <div key={i} className="relative group">
          <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-6 flex items-center gap-4 transition-all hover:border-white/10">
            <div className={`w-12 h-12 ${step.bg} ${step.color} rounded-2xl flex items-center justify-center shrink-0 shadow-lg`}>
              <step.icon size={22} />
            </div>
            <div>
              <h4 className="text-[11px] font-black uppercase text-white tracking-widest">{step.title}</h4>
              <p className="text-[9px] text-neutral-500 font-bold uppercase mt-1 leading-tight">{step.desc}</p>
            </div>
            {i < 2 && (
              <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-neutral-800">
                <ChevronRight size={20} strokeWidth={3} />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
