
import React, { useState, useEffect } from 'react';
import { RPAGuideOverlay } from './RPAGuideOverlay.tsx';
import { RPAGuideSteps } from './RPAGuideSteps.tsx';
import { useGuidePosition } from './useGuidePosition.ts';

interface TeamGuideProps {
  isActive: boolean;
  onComplete: () => void;
}

export const TeamGuide: React.FC<TeamGuideProps> = ({ isActive, onComplete }) => {
  const [step, setStep] = useState(0);
  const [isReady, setIsReady] = useState(false);

  const getTargetId = () => {
    if (step === 0) return null; // Welcome
    if (step === 1) return 'referral-link-card'; // Link card
    if (step === 2) return 'referral-stats-card'; // Stats card
    if (step === 3) return 'referral-list-container'; // List container
    if (step === 4) return null; // Conclusion
    return null;
  };

  const targetId = getTargetId();
  const targetRect = useGuidePosition(targetId);

  useEffect(() => {
    let activeTimer: number | null = null;
    let activeInterval: number | null = null;

    const cleanup = () => {
      if (activeTimer) clearTimeout(activeTimer);
      if (activeInterval) clearInterval(activeInterval);
    };

    if (isActive) {
      if (targetId) {
        const checkElement = () => {
          const element = document.getElementById(targetId);
          if (element && targetRect) {
            const yOffset = -200;
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
            
            activeTimer = window.setTimeout(() => {
              setIsReady(true);
            }, 800);
            return true;
          }
          return false;
        };

        if (!checkElement()) {
          activeInterval = window.setInterval(() => {
            if (checkElement()) {
              if (activeInterval) clearInterval(activeInterval);
            }
          }, 150);
        }
      } else {
        activeTimer = window.setTimeout(() => {
          setIsReady(true);
        }, 500);
      }
    } else {
      setIsReady(false);
      setStep(0);
    }

    return cleanup;
  }, [isActive, targetId, step, targetRect]);

  if (!isActive || !isReady) return null;

  const messages = [
    "Bienvenue dans ton Espace Parrainage !\n\nC'est ici que tu vas parrainer de nouveaux membres pour rejoindre Millionnaire Zone Plus.",
    "Voici ton Lien de Parrainage unique.\n\nCopie-le et partage-le. Chaque personne qui s'inscrit via ce lien devient ton filleul.",
    "Ici, tu peux suivre tes statistiques de parrainage.\n\nLe nombre de partenaires affiche toutes les personnes que tu as parrainées.",
    "Le Journal du Parrainage te permet de voir tes filleuls, leur niveau et leur date d'entrée.\n\n💡 IMPORTANT :\nLorsqu'un de tes filleuls passe au niveau MZ+ PREMIUM, tu reçois DIRECTEMENT 700 POINTS RPA convertissables en argent !",
    "Félicitations ! Tu as maintenant toutes les clés pour réussir ton parrainage.\n\nPlus tu parraines de membres actifs, plus tes gains augmentent. À toi de jouer !"
  ];

  const handleNext = () => {
    if (step < messages.length - 1) {
      setStep(step + 1);
      setIsReady(false);
    } else {
      localStorage.setItem('mz_team_guide_completed', 'true');
      onComplete();
    }
  };

  return (
    <>
      <RPAGuideOverlay targetRect={targetRect} isVisible={isActive && isReady} />
      <RPAGuideSteps 
        isVisible={isActive && isReady} 
        message={messages[step]} 
        targetRect={targetRect}
        variant={(step === 0 || step === 4) ? 'panel' : 'tooltip'}
        onNext={handleNext}
        nextLabel={step === messages.length - 1 ? "C'est parti !" : "Suivant"}
        onClose={() => {
          localStorage.setItem('mz_team_guide_completed', 'true');
          onComplete();
        }}
      />
    </>
  );
};
