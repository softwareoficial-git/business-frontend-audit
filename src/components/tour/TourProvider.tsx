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
      if (!isTourActive || !currentFlow) return;

      const currentStep = currentFlow.steps[currentStepIndex];
      if (currentStep && currentStep.triggerEvent === eventName) {
        if (currentStepIndex < currentFlow.steps.length - 1) {
          setCurrentStepIndex((prev) => prev + 1);
        } else {
          endTour(); // Tour completed
        }
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
