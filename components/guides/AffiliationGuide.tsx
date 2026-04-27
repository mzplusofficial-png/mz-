
import React, { useState, useEffect } from 'react';
import { GuideOverlay } from './GuideOverlay.tsx';
import { GuideStep } from './GuideStep.tsx';
import { useGuidePosition } from './useGuidePosition.ts';

interface AffiliationGuideProps {
  isActive: boolean;
  onComplete: () => void;
  activeCategory?: string;
  activeTab?: string;
}

export const AffiliationGuide: React.FC<AffiliationGuideProps> = ({ isActive, onComplete, activeCategory, activeTab }) => {
  const [step, setStep] = useState(() => {
    const saved = localStorage.getItem('mz_guide_step');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [isReady, setIsReady] = useState(false);

  // Persist step changes
  useEffect(() => {
    if (isActive) {
      localStorage.setItem('mz_guide_step', step.toString());
    } else {
      localStorage.removeItem('mz_guide_step');
    }
  }, [step, isActive]);

  // Reset step when guide is explicitly closed/completed
  useEffect(() => {
    if (!isActive) {
      setStep(0);
      localStorage.removeItem('mz_guide_step');
    }
  }, [isActive]);
  const getTargetId = () => {
    if (step === 0) return 'pillar-business';
    if (step === 1) return null; // No focus for the introductory panel
    if (step === 2) return 'subservice-affiliation';
    if (step === 3) return null; // No focus for the affiliation intro
    if (step === 4) return 'btn-see-products';
    if (step === 5) return 'btn-copy-link';
    if (step === 6) return null; // Confirmation panel
    if (step === 7) return null; // Action Plan panel
    if (step === 8) return 'affiliation-balance-zone';
    if (step === 9) return null; // Withdrawal panel
    return null;
  };

  const targetId = getTargetId();
  const targetRect = useGuidePosition(targetId);

  // Auto-advance from Step 0 to Step 1 when category changes to business
  useEffect(() => {
    if (isActive && step === 0 && activeCategory === 'business') {
      setStep(1);
      setIsReady(false);
    }
  }, [isActive, step, activeCategory]);

  // Auto-advance to Step 3 when activeTab becomes affiliation
  useEffect(() => {
    if (isActive && step === 2 && activeTab === 'affiliation') {
      // Shorter delay for a more responsive feel
      const timer = setTimeout(() => {
        setStep(3);
        setIsReady(false);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isActive, step, activeTab]);

  // Listen for link copy event to advance from Step 5 to Step 6
  useEffect(() => {
    if (!isActive || step !== 5) return;

    const handleCopy = () => {
      // Small delay for natural feel
      setTimeout(() => {
        setStep(6);
        setIsReady(false);
      }, 500);
    };

    window.addEventListener('affiliation_link_copied', handleCopy);
    return () => window.removeEventListener('affiliation_link_copied', handleCopy);
  }, [isActive, step]);

  // Auto-advance to Step 5 if we are at Step 4 and the products are already visible
  useEffect(() => {
    if (isActive && step === 4) {
      const checkInterval = setInterval(() => {
        if (document.getElementById('btn-copy-link')) {
          setStep(5);
          setIsReady(false);
          clearInterval(checkInterval);
        }
      }, 500);
      return () => clearInterval(checkInterval);
    }
  }, [isActive, step]);

  const isTooltipStep = (step === 0 || step === 2 || step === 4 || step === 5 || step === 8);

  useEffect(() => {
    let activeTimer: number | null = null;
    let activeInterval: number | null = null;

    const cleanup = () => {
      if (activeTimer) clearTimeout(activeTimer);
      if (activeInterval) clearInterval(activeInterval);
    };

    if (isActive) {
      // Reset isReady when step changes
      setIsReady(false);

      if (targetId) {
        const checkElement = () => {
          const element = document.getElementById(targetId);
          // For tooltips, we wait until the element is in DOM
          if (element) {
            // Smooth scroll with offset for better visibility
            const yOffset = -200; 
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
            
            // Wait for scroll to finish before showing the guide
            const scrollDelay = step === 5 ? 1500 : 900;
            activeTimer = window.setTimeout(() => {
              setIsReady(true);
            }, scrollDelay);
            return true;
          }
          return false;
        };

        if (!checkElement()) {
          // If element not found, poll for it
          activeInterval = window.setInterval(() => {
            if (checkElement()) {
              if (activeInterval) clearInterval(activeInterval);
            }
          }, 150);
        }
      } else {
        // If no targetId (panel steps), add a small delay so it doesn't appear too abruptly
        activeTimer = window.setTimeout(() => {
          setIsReady(true);
        }, 900);
      }
    } else {
      setIsReady(false);
      setStep(0); // Reset step when guide is closed
    }

    return cleanup;
  }, [isActive, targetId, step]); // Removed targetRect and isTooltipStep from dependencies

  // Listen for clicks on the target to advance (only for steps without a "Next" button)
  useEffect(() => {
    if (!isActive || !isReady) return;

    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Step 2: Click on Affiliation subservice
      if (step === 2) {
        if (target.closest('#subservice-affiliation')) {
          // The tab change will trigger the step advance via the other useEffect
        }
      }

      // Step 4: Click on See Products button
      if (step === 4) {
        if (target.closest('#btn-see-products')) {
          // Advance to step 5 immediately to hide the Step 4 tooltip
          setStep(5);
          setIsReady(false);
        }
      }
    };

    window.addEventListener('click', handleGlobalClick, true);
    return () => window.removeEventListener('click', handleGlobalClick, true);
  }, [isActive, isReady, step, onComplete]);

  if (!isActive || !isReady) return null;

  const messages = [
    "Bienvenue dans MZ+. Pour commencer à générer des revenus, tu dois suivre les étapes dans l’ordre. Clique sur \"Business\".",
    "Félicitations ! Tu as ouvert le pôle Business. 🎯\nC'est ici qu'il y a les différents moyens de gagner de l'argent avec MZ+",
    "Pour commencer simplement, clique sur \"Affiliation\".\n\nC’est la méthode la plus rapide pour encaisser tes premiers gains.",
    "Excellent choix ! 🚀\n\nL'interface d'affiliation est maintenant active. Tu vas pouvoir choisir tes produits.",
    "👉 Clique sur \"Voir les produits à promouvoir\".\n\nC’est ici que tu vas accéder au catalogue réel des produits MZ+.",
    "Choisis un produit dans le catalogue.\n\nEnsuite :\n👉 Clique sur \"Copier le lien\"",
    "Lien copié avec succès ! 🎉\n\nTu es maintenant prêt à diffuser ton offre et à toucher tes commissions.",
    "Tu as maintenant ton lien affilié.\n\nVoici comment l’utiliser pour générer tes premières commissions :\n\n👉 Partage ton lien sur WhatsApp ou tes réseaux sociaux.\n👉 Crée des vidéos autour du produit pour montrer ses avantages.\n👉 Chaque fois que quelqu’un achète via ton lien, tu gagnes une commission automatiquement.",
    "👉 Voici ton solde d’affiliation.\nÀ chaque vente réalisée via ton lien,\nton solde se met à jour automatiquement.",
    "Une fois tes commissions validées,\ntu peux effectuer un retrait via Mobile Money en toute sécurité."
  ];

  return (
    <>
      <GuideOverlay targetRect={targetRect} isVisible={isActive && isReady} />
      <GuideStep 
        isVisible={isActive && isReady} 
        message={messages[step]} 
        targetRect={targetRect}
        variant={(step === 1 || step === 3 || step === 6 || step === 7 || step === 9) ? 'panel' : 'tooltip'}
        onNext={(step === 1 || step === 3 || step === 6 || step === 7 || step === 8 || step === 9) ? () => {
          if (step < messages.length - 1) {
            setStep(step + 1);
            setIsReady(false);
          } else {
            localStorage.setItem('mz_guide_completed', 'true');
            onComplete();
          }
        } : undefined}
        onClose={() => {
          localStorage.setItem('mz_guide_completed', 'true');
          onComplete();
        }}
        nextLabel={step === messages.length - 1 ? "Terminer" : "Suivant"}
      />
    </>
  );
};
