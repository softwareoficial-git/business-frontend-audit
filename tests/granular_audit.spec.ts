import { test, expect } from '@playwright/test';

/**
 * MOTOR AUDITOR GRANULAR
 * Este motor descompone cada panel en micro-funciones para obtener un reporte exacto de fallos.
 * No se detiene ante errores, marcando cada función como PASSED o FAILED.
 */

const AUDIT_SUITE = {
  auth: {
    name: 'Autenticación',
    tests: [
      { id: 'auth_01', name: 'Carga de WelcomeScreen', action: async (page) => { await page.goto('/'); await expect(page.locator('text=Bienvenido').or(page.locator('text=Welcome'))).toBeVisible(); } },
      { id: 'auth_02', name: 'Input Usuario válido', action: async (page) => { await page.locator('input[placeholder*="Usuario"]').fill('admin'); } },
      { id: 'auth_03', name: 'Input Contraseña válido', action: async (page) => { await page.locator('input[placeholder*="Contraseña"]').fill('password'); } },
      { id: 'auth_04', name: 'Ejecución de Login', action: async (page) => { await page.locator('[data-testid="btn-submit"]').click(); await expect(page.locator('[data-testid="main-dock"]')).toBeVisible({ timeout: 10000 }); } },
    ]
  },
  ui_global: {
    name: 'UI Global (Dock & Toasts)',
    tests: [
      { id: 'ui_01', name: 'Presencia del Dock', action: async (page) => { await expect(page.locator('[data-testid="main-dock"]')).toBeVisible(); } },
      { id: 'ui_02', name: 'Botones del Dock completos', action: async (page) => {
          const buttons = page.locator('[data-testid^="nav-"]');
          await expect(buttons).toHaveCount(5);
      } },
      { id: 'ui_03', name: 'Contenedor de Toasts presente', action: async (page) => { await expect(page.locator('[data-testid="toast-container"]')).toBeAttached(); } },
    ]
  },
  stock: {
    name: 'Inventario',
    tests: [
      { id: 'stk_01', name: 'Navegación al Panel', action: async (page) => { await page.locator('[data-testid="nav-stock"]').click(); await expect(page.locator('h1').first()).toBeVisible({ timeout: 15000 }); } },
      { id: 'stk_02', name: 'Carga de Lista de Productos', action: async (page) => { await expect(page.locator('text=Total productos').or(page.locator('div.text-sm.text-gray-500'))).toBeVisible({ timeout: 10000 }); } },
      { id: 'stk_03', name: 'Búsqueda de Producto Existente', action: async (page) => { await page.locator('input[type="text"]').fill('Coca'); await expect(page.locator('text=Coca Cola')).toBeVisible(); } },
      { id: 'stk_04', name: 'Apertura de Modal Añadir', action: async (page) => { await page.locator('[data-testid="btn-add-product"]').click(); await expect(page.locator('h2').first()).toBeVisible(); } },
      { id: 'stk_05', name: 'Guardado de Producto y Toast', action: async (page) => {
          await page.locator('input').nth(0).fill('T' + Date.now());
          await page.locator('input').nth(1).fill('Categoria');
          await page.locator('input').nth(2).fill('Test Product ' + Date.now());
          await page.locator('button[data-testid="btn-save-product"]').click();
          await expect(page.locator('[data-testid="toast-item"]')).toBeVisible({ timeout: 5000 });
          await expect(page.locator('div.fixed.inset-0')).not.toBeVisible({ timeout: 10000 });
      } },
    ]
  },
  sales: {
    name: 'Ventas',
    tests: [
      { id: 'sls_01', name: 'Navegación al Panel', action: async (page) => { await page.locator('[data-testid="nav-sales"]').click(); await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 15000 }); } },
      { id: 'sls_02', name: 'Carga de Carrito Vacío', action: async (page) => { await expect(page.locator('text=Vacío')).toBeVisible({ timeout: 10000 }); } },
      { id: 'sls_03', name: 'Adición de Producto al Carrito', action: async (page) => { await page.locator('button').filter({ hasText: 'Coca Cola' }).first().click(); await expect(page.locator('text=Coca Cola')).toBeVisible(); } },
      { id: 'sls_04', name: 'Actualización de Cantidad (+)', action: async (page) => { await page.locator('button').filter({ hasText: 'Plus' }).or(page.locator('button').filter({ hasText: '+' })).first().click(); } },
      { id: 'sls_05', name: 'Cobro de Venta y Toast', action: async (page) => {
          await page.locator('input[placeholder*="Teléfono"]').fill('123');
          await page.locator('input[placeholder*="Monto"]').fill('10');
          await page.locator('button').filter({ hasText: 'Confirmar' }).or(page.locator('button').filter({ hasText: 'Cobrar' })).click();
          await expect(page.locator('[data-testid="toast-item"]')).toBeVisible({ timeout: 5000 });
          await expect(page.locator('text=Venta procesada').or(page.locator('text=Vacío'))).toBeVisible();
      } },
    ]
  },
  staff: {
    name: 'Personal',
    tests: [
      { id: 'stf_01', name: 'Navegación al Panel', action: async (page) => { await page.locator('[data-testid="nav-staff"]').click(); await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 15000 }); } },
      { id: 'stf_02', name: 'Carga de Lista de Staff', action: async (page) => { await expect(page.locator('div.bg-white').first()).toBeVisible(); } },
      { id: 'stf_03', name: 'Apertura de Modal Crear Staff', action: async (page) => { await page.locator('[data-testid="btn-add-staff"]').click(); await expect(page.locator('text=Nuevo Empleado')).toBeVisible(); } },
      { id: 'stf_04', name: 'Creación de Staff y Cierre', action: async (page) => {
          await page.locator('[data-testid="modal-staff-user"]').fill('user_' + Date.now());
          await page.locator('[data-testid="modal-staff-pass"]').fill('Pass123');
          await page.locator('button').filter({ hasText: 'Crear' }).click();
          await expect(page.locator('[data-testid="btn-add-staff"]')).toBeVisible({ timeout: 10000 });
      } },
    ]
  },
  reports: {
    name: 'Reportes',
    tests: [
      { id: 'rpt_01', name: 'Navegación al Panel', action: async (page) => { await page.locator('[data-testid="nav-reports"]').click(); await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 15000 }); } },
      { id: 'rpt_02', name: 'Renderizado de Métricas', action: async (page) => { await expect(page.locator('div.bg-white.p-6.rounded-3xl').first()).toBeVisible({ timeout: 10000 }); } },
      { id: 'rpt_03', name: 'Verificación de Gráficos/Datos', action: async (page) => { await expect(page.locator('text=Ingresos').or(page.locator('text=Ventas'))).toBeVisible(); } },
    ]
  }
};

test('EJECUCIÓN DE AUDITORÍA MASIVA', async ({ page }) => {
  test.setTimeout(60000);
  let totalTests = 0;
  let passedTests = 0;

  console.log('\n🚀 INICIANDO CICLO DE AUDITORÍA INTEGRAL');

  for (const moduleName in AUDIT_SUITE) {
    const module = AUDIT_SUITE[moduleName];
    console.log(`\n--- 🔍 AUDITANDO MÓDULO: ${module.name} ---`);

    let modulePassed = 0;
    let moduleTotal = module.tests.length;

    for (const testCase of module.tests) {
      totalTests++;
      try {
        await testCase.action(page);
        passedTests++;
        modulePassed++;
        console.log(`  ✅ [${testCase.id}] ${testCase.name} -> PASSED`);
      } catch (e) {
        console.log(`  ❌ [${testCase.id}] ${testCase.name} -> FAILED`);
      }
    }
    console.log(`--- 📊 REPORTE ${module.name}: ${modulePassed}/${moduleTotal} EXITOSOS ---`);
    console.log(`--- 🔒 CIERRE DE MÓDULO: ${module.name} ---\n`);
  }

  console.log('\n' + '='.repeat(40));
  console.log('RESUMEN FINAL DE AUDITORÍA:');
  console.log(`Total funciones testeadas: ${totalTests}`);
  console.log(`Funciones exitosas: ${passedTests}`);
  console.log(`Tasa de éxito: ${((passedTests/totalTests)*100).toFixed(2)}%`);
  console.log('='.repeat(40));
});
