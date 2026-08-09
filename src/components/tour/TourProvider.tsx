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

  // Listener global para detectar clics en elementos objetivo
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!isTourActive || !currentFlow) return;

      const currentStep = currentFlow.steps[currentStepIndex];
      if (!currentStep) return;

      const target = e.target as HTMLElement;

      // Verificar si el clic fue en el elemento objetivo o uno de sus hijos
      const isTarget =
        target.matches(currentStep.targetSelector) ||
        target.closest(currentStep.targetSelector);

      // Verificar si el clic fue sobre el tooltip de la guía
      const isTooltip = target.closest('[data-tour-tooltip="true"]');

      if (isTarget) {
        console.log(
          `[Tour Debug] Clic detectado en elemento objetivo: ${currentStep.targetSelector}`
        );
        triggerEvent(currentStep.triggerEvent);
      } else if (!isTooltip) {
        // Clic fuera, cerrar guía
        console.log(`[Tour Debug] Clic fuera, cerrando guía`);
        endTour();
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [isTourActive, currentFlow, currentStepIndex, triggerEvent, endTour]);

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
