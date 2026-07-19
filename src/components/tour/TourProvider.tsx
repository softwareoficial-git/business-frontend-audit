'use client';

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';

interface TourContextType {
  isTourActive: boolean;
  startTour: () => void;
  endTour: () => void;
  toggleTourActivation: () => void;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

export function TourProvider({ children }: { children: ReactNode }) {
  const [isTourActive, setIsTourActive] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);

  // Persistencia de si el tour está habilitado por el usuario
  useEffect(() => {
    const saved = localStorage.getItem('tourEnabled');
    if (saved === 'false') setIsEnabled(false);
  }, []);

  const startTour = () => {
    if (isEnabled) setIsTourActive(true);
  };

  const endTour = () => {
    setIsTourActive(false);
  };

  const toggleTourActivation = () => {
    const newState = !isEnabled;
    setIsEnabled(newState);
    localStorage.setItem('tourEnabled', String(newState));
  };

  return (
    <TourContext.Provider
      value={{ isTourActive, startTour, endTour, toggleTourActivation }}
    >
      {children}
      {/* El componente UI del tour se implementará al final */}
    </TourContext.Provider>
  );
}

export function useTour() {
  const context = useContext(TourContext);
  if (!context) throw new Error('useTour must be used within a TourProvider');
  return context;
}
