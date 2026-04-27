
import React, { useState, useEffect } from 'react';
import { ChevronRight, Lock, ShieldCheck, Crown, Star, X, Zap } from 'lucide-react';

export const GoldText: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <span 
    className={`inline-block ${className}`}
    style={{ 
      background: 'linear-gradient(to right, #C9A84C, #E8C96D, #C9A84C)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      color: 'transparent',
    }}
  >
    {children}
  </span>
);

export const PurpleText: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <span 
    className={`inline-block ${className}`}
    style={{ 
      background: 'linear-gradient(to right, #9B6BFF, #C084FC, #9B6BFF)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      color: 'transparent',
    }}
  >
    {children}
  </span>
);

export const GoldBorderCard = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, className = "", ...props }, ref) => (
    <div 
      ref={ref}
      {...props}
      className={`relative bg-gradient-to-br from-[#111009] to-[#161410] border border-[rgba(201,168,76,0.12)] rounded-[2.5rem] p-6 hover:border-[rgba(201,168,76,0.25)] transition-all duration-500 shadow-xl ${className}`}
    >
      {children}
    </div>
  )
);

export const EliteBadge: React.FC<{ children: React.ReactNode; variant?: 'standard' | 'niveau_mz_plus' }> = ({ children, variant = 'standard' }) => {
  const isMzPlus = variant === 'niveau_mz_plus';
  
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border backdrop-blur-md transition-all duration-500 ${
      isMzPlus 
        ? 'bg-[#9B6BFF]/5 border-[#9B6BFF]/20 text-[#9B6BFF] shadow-[0_0_15px_rgba(155,107,255,0.05)]' 
        : 'bg-[#C9A84C]/5 border-[#C9A84C]/20 text-[#C9A84C]'
    }`}>
      <div className="relative flex items-center justify-center">
        {isMzPlus ? (
          <Crown size={12} fill="currentColor" className="relative z-10 text-[#9B6BFF]" />
        ) : (
          <ShieldCheck size={12} className="relative z-10 text-[#C9A84C]" />
        )}
      </div>
      <span className="text-[8px] font-bold uppercase tracking-[0.1em] whitespace-nowrap">
        {children}
      </span>
    </div>
  );
};

export const PremiumUpgradeButton: React.FC<{ onClick?: () => void }> = ({ onClick }) => (
  <button 
    onClick={(e) => {
      if (onClick) {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }
    }}
    className="group relative flex items-center gap-2.5 px-5 py-2.5 bg-gradient-to-r from-[#C9A84C] to-[#E8C96D] rounded-xl overflow-hidden transition-all active:scale-95 shadow-lg hover:shadow-[0_0_20px_rgba(201,168,76,0.3)]"
  >
    <div className="bg-black/10 p-1 rounded-lg">
      <Crown size={13} className="text-black" />
    </div>
    <span className="text-black text-[9px] font-black uppercase tracking-widest">Upgrade to MZ+</span>
  </button>
);

export const ConversionModal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  onUpgrade?: () => void;
  title?: string;
  description?: string;
  variant?: 'gold' | 'premium';
}> = ({ isOpen, onClose, onUpgrade, title, description, variant = 'gold' }) => {
  if (!isOpen) return null;

  const isPremium = variant === 'premium';

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 h-[100dvh] w-full overflow-hidden font-sans">
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-lg animate-fade-in"
        onClick={onClose}
      ></div>
      
      <div className="relative w-full max-w-[300px] animate-slide-down pointer-events-auto">
        <div className={`relative bg-[#0d0d0c] border rounded-[2rem] p-6 text-center shadow-2xl ${isPremium ? 'border-[#9B6BFF]/20' : 'border-[#C9A84C]/20'}`}>
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-[#6B6050] hover:text-white transition-colors"
          >
            <X size={16}/>
          </button>
          
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto border mb-4 ${
            isPremium 
              ? 'bg-[#9B6BFF]/5 text-[#9B6BFF] border-[#9B6BFF]/10' 
              : 'bg-[#C9A84C]/5 text-[#C9A84C] border-[#C9A84C]/10'
          }`}>
            <Crown size={20} />
          </div>
          
          <div className="space-y-1.5 mb-6">
            <h3 className="text-base font-black uppercase tracking-tight text-white">
              {title || (isPremium ? <><PurpleText>MZ+ Premium</PurpleText></> : <><GoldText>MZ+</GoldText> Elite</>)}
            </h3>
            <p className="text-[9px] text-[#6B6050] font-bold uppercase tracking-wider opacity-80 italic">
              {description || "Activez votre accès Élite."}
            </p>
          </div>

          <div className="flex flex-col gap-2">
             <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (onUpgrade) onUpgrade();
                onClose();
              }}
              className={`w-full py-3.5 rounded-xl font-bold uppercase tracking-widest text-[9px] shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 ${
                isPremium 
                  ? 'bg-gradient-to-r from-[#9B6BFF] to-[#C084FC] text-white' 
                  : 'bg-[#C9A84C] text-black'
              }`}
             >
               <Zap size={12} fill="currentColor" /> {isPremium ? 'DEVENIR PREMIUM' : 'DEBLOQUER'}
             </button>
             <button 
               onClick={onClose} 
               className="text-[7px] font-bold uppercase tracking-[0.2em] text-[#6B6050] hover:text-[#F0EBE0] py-1 transition-colors"
             >
               Plus tard
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const UpgradeGate: React.FC<{ 
  level: string; 
  children: React.ReactNode; 
  onUpgrade?: () => void;
  title?: string;
  description?: string;
  variant?: 'gold' | 'premium';
}> = ({ level, children, onUpgrade, title, description, variant = 'gold' }) => {
  const [showPopup, setShowPopup] = useState(false);
  
  useEffect(() => {
    if (showPopup) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { 
      document.body.style.overflow = '';
    };
  }, [showPopup]);

  if (level === 'niveau_mz_plus') return <>{children}</>;

  return (
    <>
      <div className="relative group overflow-hidden rounded-[2.5rem] h-full flex flex-col bg-[#0A0908] border border-[rgba(201,168,76,0.12)]">
        <div className="transition-all duration-700 h-full relative">
          {children}
          <div className="absolute inset-x-0 bottom-0 h-[40%] bg-gradient-to-t from-black via-black/80 to-transparent backdrop-blur-[2px] pointer-events-none z-10"></div>
        </div>
        
        <div className="absolute inset-x-0 bottom-0 z-20 p-5 flex flex-col items-center justify-end">
          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowPopup(true);
            }}
            className={`w-full py-3.5 rounded-xl font-black uppercase text-[9px] tracking-[0.15em] transition-all active:scale-95 shadow-xl flex items-center justify-center gap-2 ${
              variant === 'premium' 
                ? 'bg-[#9B6BFF] text-white hover:bg-[#C084FC]' 
                : 'bg-[#C9A84C] text-black hover:bg-[#E8C96D]'
            }`}
          >
            <Lock size={12} /> Débloquer l'accès
          </button>
        </div>
      </div>

      <ConversionModal 
        isOpen={showPopup} 
        onClose={() => setShowPopup(false)} 
        onUpgrade={onUpgrade} 
        title={title}
        description={description}
        variant={variant}
      />
    </>
  );
};

export const SectionTitle: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
  <div className="mb-8 font-sans">
    <div className="flex items-center gap-3 mb-2">
      <div className="w-6 h-[1px] bg-[#C9A84C]/30"></div>
      <h2 className="text-xl font-black text-white uppercase tracking-tight">{title}</h2>
    </div>
    {subtitle && <p className="text-[#6B6050] font-medium text-[9px] uppercase tracking-widest leading-relaxed max-w-lg">{subtitle}</p>}
  </div>
);

export const PrimaryButton: React.FC<any> = ({ children, onClick, fullWidth, isLoading, type = "button", size = "md", disabled }) => (
  <button 
    onClick={(e) => {
      if (onClick) {
        e.preventDefault();
        e.stopPropagation();
        onClick(e);
      }
    }}
    type={type}
    disabled={isLoading || disabled}
    className={`${fullWidth ? 'w-full' : ''} ${size === 'lg' ? 'py-4' : 'py-3'} px-6 bg-[#C9A84C] text-black font-black uppercase text-[9px] tracking-[0.15em] hover:bg-[#E8C96D] transition-all rounded-xl disabled:opacity-50 active:scale-95 shadow-lg shadow-[#C9A84C]/10`}
  >
    <span className="flex items-center justify-center gap-2">
      {isLoading ? "Sync..." : <>{children} <ChevronRight size={12} /> </>}
    </span>
  </button>
);

export const InputField: React.FC<any> = ({ icon: Icon, type, placeholder, value, onChange, required = true }) => (
  <div className="relative mb-3 font-sans">
    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B6050]"><Icon size={14} /></div>
    <input 
      type={type} 
      placeholder={placeholder} 
      value={value} 
      onChange={onChange} 
      required={required} 
      className="w-full bg-[#111009]/50 border border-[rgba(201,168,76,0.12)] rounded-xl py-3.5 pl-12 pr-4 text-white focus:border-[#C9A84C]/50 outline-none transition-all placeholder:text-[#6B6050] text-xs" 
    />
  </div>
);

export const SelectField: React.FC<any> = ({ icon: Icon, options, value, onChange, placeholder, required = true }) => (
  <div className="relative mb-3 font-sans">
    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B6050]"><Icon size={14} /></div>
    <select 
      value={value} 
      onChange={onChange} 
      required={required} 
      className="w-full bg-[#111009]/50 border border-[rgba(201,168,76,0.12)] rounded-xl py-3.5 pl-12 pr-4 text-white focus:border-[#C9A84C]/50 outline-none transition-all appearance-none text-xs"
    >
      <option value="" disabled className="bg-[#111009]">{placeholder}</option>
      {options.map((opt: any) => (
        <option key={opt.value} value={opt.value} className="bg-[#111009]">
          {opt.label}
        </option>
      ))}
    </select>
    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#6B6050]">
      <ChevronRight size={12} className="rotate-90" />
    </div>
  </div>
);
