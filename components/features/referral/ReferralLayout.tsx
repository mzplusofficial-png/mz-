
import React from 'react';

interface Props {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export const ReferralLayout: React.FC<Props> = ({ children, title, subtitle }) => {
  return (
    <div className="referral-module-root max-w-6xl mx-auto space-y-12 animate-fade-in pb-32 px-2 md:px-0">
      <header className="space-y-3">
         <div className="flex items-center gap-4">
            <div className="w-10 h-0.5 bg-yellow-600 shadow-[0_0_10px_rgba(202,138,4,0.5)]"></div>
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-white leading-none">{title}</h2>
         </div>
         {subtitle && (
           <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-[0.4em] leading-relaxed italic">
             {subtitle}
           </p>
         )}
      </header>

      <main className="relative">
        {children}
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .referral-module-root {
          isolation: isolate;
        }
        @keyframes ref-fade {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: ref-fade 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}} />
    </div>
  );
};
