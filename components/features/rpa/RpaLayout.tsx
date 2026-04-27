
import React from 'react';

interface RpaLayoutProps {
  children: React.ReactNode;
}

export const RpaLayout: React.FC<RpaLayoutProps> = ({ children }) => {
  return (
    <div className="rpa-module-container max-w-5xl mx-auto space-y-12 animate-fade-in pb-24 px-2 md:px-4">
      {children}
      
      <style dangerouslySetInnerHTML={{ __html: `
        .rpa-module-container {
          isolation: isolate;
        }
        @keyframes rpa-fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: rpa-fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}} />
    </div>
  );
};
