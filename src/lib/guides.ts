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
      {
        id: 'step2',
        message: 'Acá se agrega nuevo producto',
        targetSelector: 'button[style*="position: fixed"]',
        triggerEvent: 'click_add_product',
      },
      {
        id: 'step3',
        message: 'Genera un código aleatorio.',
        // Usamos el selector del botón dentro del div del código
        targetSelector: 'button.btn-primary',
        triggerEvent: 'click_generate_code',
      },
      {
        id: 'step4',
        message: 'Escribe el nombre del producto.',
        targetSelector: 'input[placeholder="Nombre"]',
        triggerEvent: 'input_product_name',
      },
      {
        id: 'step5',
        message: 'Define el precio.',
        targetSelector: 'input[placeholder="Precio"]',
        triggerEvent: 'input_product_price',
      },
      {
        id: 'step6',
        message: 'Cantidad disponible en stock.',
        targetSelector: 'input[placeholder="Cantidad"]',
        triggerEvent: 'input_product_qty',
      },
      {
        id: 'step7',
        message: 'Categoría del producto (ej: gaseosa).',
        targetSelector: 'input[placeholder="Categoría"]',
        triggerEvent: 'input_product_category',
      },
    ],
  },
  salesTour: {
    id: 'sales-guide',
    steps: [
      {
        id: 'sales_step1',
        message: 'Selecciona una categoría.',
        targetSelector: '.categories-area button',
        triggerEvent: 'select_category',
      },
      {
        id: 'sales_step2',
        message: 'Toca un producto para venderlo.',
        targetSelector: '.products-area button',
        triggerEvent: 'select_product',
      },
      {
        id: 'sales_step3',
        message: 'Finaliza la venta aquí.',
        targetSelector: 'button.btn-primary',
        triggerEvent: 'click_checkout',
      },
      {
        id: 'sales_step4',
        message: 'Ve a Empleados para ver el ticket.',
        targetSelector: 'button[aria-label="Empleados"]',
        triggerEvent: 'navigate_employees',
      },
      {
        id: 'sales_step5',
        message: 'Toca el ticket para ver los detalles.',
        targetSelector: '.ticket-header',
        triggerEvent: 'expand_ticket',
      },
      {
        id: 'sales_step6',
        message: '¡Aquí está el resumen del ticket!',
        targetSelector: '.ticket-body',
        triggerEvent: 'finish_sales_tour',
      },
      {
        id: 'theme_step1',
        message: 'Abre el menú para ver temas.',
        targetSelector: 'button[aria-label="Menú"]',
        triggerEvent: 'menu_opened',
      },
      {
        id: 'theme_step2',
        message: 'Aquí puedes cambiar el tema.',
        targetSelector: '.theme-container',
        triggerEvent: 'finish_theme_tour',
      },
    ],
  },
};
