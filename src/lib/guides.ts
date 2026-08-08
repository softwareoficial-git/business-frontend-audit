import { GuideFlow } from '../components/tour/TourProvider';

export const guides: Record<string, GuideFlow> = {
  newUser: {
    id: 'new-user-guide',
    steps: [
      {
        id: 'step1',
        message: '¡Bienvenido! Empieza creando tu stock.',
        targetSelector: 'button[aria-label="Stock"]',
        triggerEvent: 'navigate_stock',
      },
      // Aquí se pueden añadir nuevos pasos fácilmente
    ],
  },
};
