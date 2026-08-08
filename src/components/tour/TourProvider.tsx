'use client';

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from 'react';

export interface GuideStep {
  id: string;
  message: string;
  targetSelector: string; // CSS selector
  triggerEvent: string; // The event that moves to the next step
}

export interface GuideFlow {
  id: string;
  steps: GuideStep[];
}

interface TourContextType {
  isTourActive: boolean;
  startTour: (flow: GuideFlow) => void;
  endTour: () => void;
  toggleTourActivation: () => void;
  triggerEvent: (eventName: string) => void;
  currentStep: GuideStep | null;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

export function TourProvider({ children }: { children: ReactNode }) {
  const [isTourActive, setIsTourActive] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);
  const [currentFlow, setCurrentFlow] = useState<GuideFlow | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Persistencia de si el tour está habilitado por el usuario
  useEffect(() => {
    const saved = localStorage.getItem('tourEnabled');
    if (saved === 'false') setIsEnabled(false);
  }, []);

  const startTour = (flow: GuideFlow) => {
    if (isEnabled) {
      setCurrentFlow(flow);
      setCurrentStepIndex(0);
      setIsTourActive(true);
    }
  };

  const endTour = useCallback(() => {
    setIsTourActive(false);
    setCurrentFlow(null);
    setCurrentStepIndex(0);
  }, []);

  const toggleTourActivation = () => {
    const newState = !isEnabled;
    setIsEnabled(newState);
    localStorage.setItem('tourEnabled', String(newState));
  };

  const triggerEvent = useCallback(
    (eventName: string) => {
      console.log(
        `[Tour Debug] Evento recibido: ${eventName}, Activo: ${isTourActive}`
      );
      if (!isTourActive || !currentFlow) return;

      const currentStep = currentFlow.steps[currentStepIndex];
      console.log(
        `[Tour Debug] Paso actual: ${currentStepIndex}, ID paso: ${currentStep?.id}, Evento esperado: ${currentStep?.triggerEvent}`
      );

      if (currentStep && currentStep.triggerEvent === eventName) {
        if (currentStepIndex < currentFlow.steps.length - 1) {
          console.log(`[Tour Debug] Avanzando al siguiente paso`);
          setCurrentStepIndex((prev) => prev + 1);
        } else {
          console.log(`[Tour Debug] Tour finalizado`);
          endTour(); // Tour completed
        }
      } else {
        console.log(`[Tour Debug] Evento no coincide o paso no encontrado`);
      }
    },
    [isTourActive, currentFlow, currentStepIndex, endTour]
  );

  return (
    <TourContext.Provider
      value={{
        isTourActive,
        startTour,
        endTour,
        toggleTourActivation,
        triggerEvent,
        currentStep: currentFlow?.steps[currentStepIndex] || null,
      }}
    >
      {children}
    </TourContext.Provider>
  );
}

export function useTour() {
  const context = useContext(TourContext);
  if (!context) throw new Error('useTour must be used within a TourProvider');
  return context;
}
