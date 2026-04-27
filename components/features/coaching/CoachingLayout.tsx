
import React from 'react';

interface Props {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export const CoachingLayout: React.FC<Props> = ({ children, title, subtitle }) => {
  return (
    <div className="coaching-module-root max-w-4xl mx-auto space-y-12 animate-fade-in pb-32 px-4 md:px-0">
      <header className="space-y-3">
         <div className="flex items-center gap-3">
            <div className="w-8 h-0.5 bg-cyan-600"></div>
            <h2 className="text-2xl font-black uppercase tracking-tighter text-white leading-none">{title}</h2>
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
        .coaching-module-root {
          isolation: isolate;
        }
        @keyframes coaching-fade {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: coaching-fade 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}} />
    </div>
  );
};
