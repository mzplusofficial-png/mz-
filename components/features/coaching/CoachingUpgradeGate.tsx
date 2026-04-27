
import React from 'react';

/**
 * @deprecated 
 * Le CoachingUpgradeGate est obsolète. Le diagnostic stratégique est désormais ouvert à tous.
 * Le verrouillage Premium se fait désormais en aval du formulaire.
 */
export const CoachingUpgradeGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};
