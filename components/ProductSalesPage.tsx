
import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Zap, 
  Target, 
  Award, 
  Star, 
  Lock, 
  ChevronRight, 
  Flame,
  CheckCircle2,
  ArrowDown,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Smartphone,
  LayoutDashboard,
  Loader2
} from 'lucide-react';
import { Product } from '../types.ts';
import { CurrencyDisplay } from './ui/CurrencyDisplay.tsx';

interface ProductSalesPageProps {
  product: Product;
  onPurchase: () => void;
  purchaseStep: 'view' | 'processing' | 'success';
  countdown: number;
  isLoggedIn?: boolean;
}

export const ProductSalesPage: React.FC<ProductSalesPageProps> = ({ 
  product, 
  onPurchase, 
  purchaseStep, 
  countdown,
  isLoggedIn = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;

  // Seuil pour afficher le bouton "Voir plus"
  const shouldShowToggle = product.description.length > 200;

  return (
    <div className="min-h-screen bg-black text-white selection:bg-yellow-500 selection:text-black font-sans overflow-x-hidden">
      {/* Barre d'urgence supérieure */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 py-2 text-center sticky top-0 z-[100]">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2">
          <Flame size={12} className="animate-pulse" /> 
          Offre exclusive : {minutes}m {seconds}s restantes 
          <Flame size={12} className="animate-pulse" />
        </p>
      </div>

      {/* Bouton de retour pour Ambassadeurs connectés */}
      {isLoggedIn && (
        <div className="absolute top-16 left-6 z-[110] animate-fade-in">
          <button 
            onClick={() => window.location.href = '/'}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
          >
            <LayoutDashboard size={14} className="text-yellow-500" />
            Retour au Dashboard
          </button>
        </div>
      )}

      {/* Hero Section - Format 9:16 visuel */}
      <section className="relative h-[90vh] flex flex-col justify-end p-6 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={product.image_url} 
            alt={product.name} 
            className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
        </div>

        <div className="relative z-10 space-y-4 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500 text-black text-[10px] font-black uppercase tracking-widest rounded-full">
            Édition Limitée
          </div>
          <h1 className="text-5xl font-black uppercase leading-[0.9] tracking-tighter">
            {product.name}
          </h1>
          <div className="flex items-center gap-2 text-yellow-500">
            {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
            <span className="text-white/60 text-[10px] font-bold ml-1 uppercase">4.9/5 par nos clients</span>
          </div>
          <div className="pt-4 flex flex-col gap-3">
             <button 
                onClick={onPurchase}
                disabled={purchaseStep === 'processing'}
                className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all shadow-[0_20px_40px_rgba(255,255,255,0.1)] disabled:opacity-50 disabled:cursor-not-allowed"
             >
                {purchaseStep === 'processing' ? (
                  <><Loader2 size={18} className="animate-spin" /> Traitement...</>
                ) : (
                  <>Obtenir maintenant <ChevronRight size={18} /></>
                )}
             </button>
             <p className="text-center text-[10px] text-white/40 uppercase font-black tracking-widest flex items-center justify-center gap-2">
                <ArrowDown size={12} /> Découvrir les détails
             </p>
          </div>
        </div>
      </section>

      {/* Détails du produit */}
      <main className="p-6 space-y-12 pb-32">
        <div className="animate-fade-in">
          <div className="space-y-6">
            <h2 className="text-2xl font-black uppercase tracking-tight text-yellow-500 flex items-center gap-3">
               <div className="w-8 h-px bg-yellow-500"></div> À propos du produit
            </h2>
            
            <div className="relative flex flex-col items-center lg:items-start">
              {/* Container de texte avec transition de hauteur */}
              <div 
                className={`text-lg text-neutral-300 font-medium leading-relaxed whitespace-pre-wrap transition-all duration-700 ease-in-out overflow-hidden relative ${
                  !isExpanded && shouldShowToggle ? 'max-h-[250px]' : 'max-h-[9999px]'
                }`}
              >
                {product.description}
                
                {/* Overlay de dégradé */}
                {!isExpanded && shouldShowToggle && (
                  <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black via-black/90 to-transparent pointer-events-none z-10"></div>
                )}
              </div>
              
              {/* Bouton Toggle */}
              {shouldShowToggle && (
                <button 
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="mt-4 flex items-center justify-center gap-2 px-6 py-3 bg-yellow-500 text-black font-black uppercase text-[11px] tracking-[0.15em] hover:bg-yellow-400 transition-all active:scale-95 rounded-xl shadow-xl z-20 relative"
                >
                  {isExpanded ? (
                    <><ChevronUp size={16} /> Réduire la description</>
                  ) : (
                    <><ChevronDown size={16} /> Voir la description complète</>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Grille des bénéfices fixes */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { i: Zap, t: "Instant", d: "Accès immédiat" },
            { i: Target, t: "Précis", d: "Haute performance" },
            { i: ShieldCheck, t: "Sécurisé", d: "Protection totale" },
            { i: Award, t: "Qualité", d: "Premium" }
          ].map((feat, i) => (
            <div key={i} className="p-5 bg-neutral-900/30 border border-white/5 rounded-2xl flex flex-col items-center text-center gap-2">
              <feat.i size={20} className="text-yellow-500" />
              <div>
                <p className="text-[10px] font-black uppercase text-white">{feat.t}</p>
                <p className="text-[9px] text-neutral-500 font-bold uppercase">{feat.d}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Checkout Card */}
        <div className="mt-8">
          <div className="bg-gradient-to-br from-neutral-900 to-black p-8 md:p-12 rounded-[2.5rem] border border-yellow-500/20 shadow-2xl relative overflow-hidden">
            {purchaseStep === 'view' && (
              <div className="space-y-8">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                  <div className="text-center sm:text-left">
                    <p className="text-[10px] text-neutral-500 font-black uppercase mb-1">Prix de lancement</p>
                    <div className="flex items-baseline justify-center sm:justify-start whitespace-nowrap">
                      <CurrencyDisplay 
                        amount={product.price} 
                        className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tighter"
                        secondaryClassName="text-sm sm:text-lg text-yellow-500 font-black ml-2"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col items-center sm:items-end gap-1">
                    <CurrencyDisplay 
                      amount={product.price * 1.5} 
                      className="text-sm text-neutral-600 line-through font-bold"
                      secondaryClassName="text-[8px] text-neutral-700 font-bold ml-1 opacity-40"
                    />
                    <div className="bg-red-600 text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase shadow-lg animate-pulse">
                      -33% RÉDUCTION
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <button 
                    onClick={onPurchase}
                    disabled={purchaseStep === 'processing'}
                    className="w-full bg-yellow-500 text-black py-6 rounded-2xl font-black uppercase tracking-widest shadow-[0_10px_30px_rgba(234,179,8,0.3)] active:scale-95 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {purchaseStep === 'processing' ? (
                      <><Loader2 size={18} className="animate-spin" /> Traitement...</>
                    ) : (
                      "Confirmer ma commande"
                    )}
                  </button>
                  
                  <div className="space-y-4">
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex items-center gap-2 text-[10px] text-neutral-500 font-black uppercase tracking-widest">
                        <Lock size={12} className="text-yellow-500" /> Transaction chiffrée SSL
                      </div>
                    </div>

                    {/* Logos de Paiement (Visa, Mastercard, MoMo, PayPal) */}
                    <div className="pt-2 border-t border-white/5 flex flex-col items-center gap-4">
                      <p className="text-[8px] text-neutral-600 font-black uppercase tracking-widest">Méthodes de paiement acceptées</p>
                      <div className="flex items-center justify-center gap-4 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                        {/* Mobile Money Placeholder */}
                        <div className="flex flex-col items-center gap-1">
                          <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center text-black shadow-lg">
                            <Smartphone size={16} />
                          </div>
                          <span className="text-[6px] font-black uppercase text-neutral-500">MoMo</span>
                        </div>
                        {/* Visa Placeholder */}
                        <div className="flex flex-col items-center gap-1">
                          <div className="w-10 h-6 bg-blue-700 rounded flex items-center justify-center text-white font-black italic text-[8px]">
                            VISA
                          </div>
                        </div>
                        {/* Mastercard Placeholder */}
                        <div className="flex flex-col items-center gap-1">
                          <div className="w-10 h-6 flex items-center justify-center relative">
                             <div className="w-5 h-5 bg-red-600 rounded-full absolute left-1"></div>
                             <div className="w-5 h-5 bg-orange-500 rounded-full absolute right-1 mix-blend-screen"></div>
                          </div>
                        </div>
                        {/* PayPal Placeholder */}
                        <div className="flex flex-col items-center gap-1">
                          <div className="w-10 h-6 bg-white/10 border border-white/10 rounded flex items-center justify-center text-[#003087] font-black text-[7px] italic">
                            PayPal
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {purchaseStep === 'processing' && (
              <div className="py-12 text-center space-y-6">
                <div className="w-16 h-16 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin mx-auto"></div>
                <p className="text-sm font-black uppercase tracking-widest animate-pulse">Initialisation du tunnel de paiement...</p>
                <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-widest">Vérification de la passerelle sécurisée</p>
              </div>
            )}

            {purchaseStep === 'success' && (
              <div className="py-12 text-center space-y-6 animate-fade-in">
                <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto border-2 border-green-500">
                  <CheckCircle2 size={40} />
                </div>
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter text-white">Succès !</h3>
                  <p className="text-neutral-400 text-xs mt-2 uppercase font-bold tracking-widest">Redirection en cours...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer Minimaliste */}
      <footer className="p-10 border-t border-white/5 bg-black/50 text-center space-y-6">
        <div className="flex justify-center gap-6 opacity-40">
           <div className="w-8 h-5 bg-white/20 rounded"></div>
           <div className="w-8 h-5 bg-white/20 rounded"></div>
           <div className="w-8 h-5 bg-white/20 rounded"></div>
        </div>
        <p className="text-[9px] text-neutral-600 font-black uppercase tracking-[0.2em]">
          Service Client 24/7 • Paiement Sécurisé • Confidentialité Garantie
        </p>
      </footer>
    </div>
  );
};
