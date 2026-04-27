
import React, { useState, useEffect } from 'react';
import { RPAGuideOverlay } from './RPAGuideOverlay.tsx';
import { RPAGuideSteps } from './RPAGuideSteps.tsx';
import { useGuidePosition } from './useGuidePosition.ts';
import { CurrencyDisplay } from '../ui/CurrencyDisplay';

interface RPAGuideProps {
  isActive: boolean;
  onComplete: () => void;
}

export const RPAGuide: React.FC<RPAGuideProps> = ({ isActive, onComplete }) => {
  const [step, setStep] = useState(0);
  const [isReady, setIsReady] = useState(false);

  const getTargetId = () => {
    if (step === 0) return null; // Introduction panel
    if (step === 1) return null; // Functioning panel
    if (step === 2) return 'rpa-input-link'; // Input link tooltip
    if (step === 3) return 'rpa-submit-btn'; // Validate button tooltip
    if (step === 4) return null; // Analysis panel
    if (step === 5) return 'rpa-balance-card'; // Points area tooltip
    if (step === 6) return 'rpa-cashout-btn'; // Cashout button tooltip
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
            // Smooth scroll to the element
            const yOffset = step === 5 ? -150 : -250; // Adjust offset for balance card to center it better
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
        // Panel steps
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

  const messages: React.ReactNode[] = [
    "Tu es maintenant dans la section RPA (Revenu Par Vidéo).\n\nIci, tu gagnes de l’argent grâce aux vidéos que tu crées et publies sur les réseaux sociaux.",
    "Comment gagner de l’argent avec le RPA ?\n\n👉 C’est très simple :\n\nCopie le lien de la vidéo\n(TikTok / Instagram / Facebook)\navec laquelle tu veux être rémunéré.",
    "Colle le lien de la vidéo ici dans cette section.",
    "👉 Après avoir collé le lien de la vidéo,\nclique sur \"Valider ma vidéo\"",
    "Après la soumission de ta vidéo,\nl’algorithme MZ+ va l’analyser.\n\nLes points (ou récompenses) seront attribués en fonction de la performance de ta vidéo.\n\n💡 Exemple :\n\nUne vidéo qui atteint 10 000 vues\npeut te rapporter jusqu’à 1 000 POINT .",
    "Voici où tu pourras voir\ntes points accumulés.",
    <>
      1 point vaut généralement <CurrencyDisplay amount={5} inline />.
      {"\n\n"}👉 Une fois tes points accumulés,
      {"\n"}tu peux les convertir en argent
      {"\n"}et les retirer directement via Mobile Money.
      {"\n\n"}💡 Clique simplement sur
      {"\n"}"Retirer mes gains"
      {"\n\n"}pour recevoir ton argent en toute sécurité.
    </>
  ];

  const handleNext = () => {
    if (step < messages.length - 1) {
      const nextStep = step + 1;
      setIsReady(false);
      
      // Special delay for step 4 (index 3)
      if (nextStep === 3) {
        setTimeout(() => {
          setStep(nextStep);
        }, 2000);
      } else {
        setStep(nextStep);
      }
    } else {
      localStorage.setItem('mz_rpa_guide_completed', 'true');
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
        variant={(step < 2 || step === 4) ? 'panel' : 'tooltip'}
        onNext={handleNext}
        nextLabel={step === messages.length - 1 ? "Terminer" : "Suivant"}
        onClose={() => {
          localStorage.setItem('mz_rpa_guide_completed', 'true');
          onComplete();
        }}
      />
    </>
  );
};
