import { test, expect } from '@playwright/test';

/**
 * MOTOR AUDITOR E2E
 * Este motor automatiza el recorrido completo del ciclo de vida del negocio.
 * Valida tanto la funcionalidad (interacciones) como la estética (capturas visuales).
 */

test.describe('Audit: Full Business Lifecycle', () => {
  
  test.beforeEach(async ({ page }) => {
    // Iniciamos en la raíz
    await page.goto('/');
  });

  test('Ciclo Completo: Auth -> Stock -> Sales -> Staff -> Reports', async ({ page }) => {
    // --- 1. AUDITORÍA DE AUTENTICACIÓN ---
    console.log('Auditing: Authentication flow...');
    const loginBtn = page.locator('button').filter({ hasText: 'Iniciar Sesión' });
    // Si estamos en modo mock, el login es instantáneo.
    // Buscamos los campos de login en la WelcomeScreen
    await page.locator('input[placeholder*="Usuario"]').fill('admin');
    await page.locator('input[placeholder*="Contraseña"]').fill('password');
    await page.locator('button').filter({ hasText: 'Ingresar' }).click();
    
    // Validamos que entramos a los paneles
    await expect(page.locator('[data-testid="main-dock"]')).toBeVisible(); // Dock visible
    await expect(page).toHaveScreenshot('step1-auth-success.png');
    console.log('✓ Auth Audited');

    // --- 2. AUDITORÍA DE INVENTARIO (STOCK) ---
    console.log('Auditing: Stock Panel...');
    // El Dock inicia en stock por defecto, pero forzamos el cambio para testear el motor de navegación
    await page.locator('button').filter({ hasText: 'Inventario' }).click(); // Si el texto no es visible, usamos el índice del Dock
    
    // Validamos carga de productos (usando Mocks)
    await expect(page.locator('text=Total productos')).toBeVisible();
    await expect(page.locator('text=Coca Cola 500ml')).toBeVisible();
    
    // Test de Interacción: Agregar Producto
    await page.locator('button').filter({ hasText: 'PackagePlus' }).or(page.locator('button').nth(1)).click(); // Intentar click en botón añadir
    await page.locator('input[placeholder*="Código"]').fill('P999');
    await page.locator('input[placeholder*="Nombre"]').fill('Producto de Prueba');
    await page.locator('button').filter({ hasText: 'Guardar' }).click();
    
    // Validamos que el Toast de éxito aparezca
    await expect(page.locator('text=Operación exitosa')).or(page.locator('text=Producto agregado')).toBeVisible();
    await expect(page).toHaveScreenshot('step2-stock-audit.png');
    console.log('✓ Stock Audited');

    // --- 3. AUDITORÍA DE VENTAS (SALES) ---
    console.log('Auditing: Sales Panel...');
    // Navegación vía Dock
    await page.locator('button').nth(2).click(); // Click en botón de Ventas del Dock
    
    // Validamos UI de Ventas
    await expect(page.locator('text=Carrito')).toBeVisible();
    
    // Interacción: Agregar al carrito
    await page.locator('button').filter({ hasText: 'Coca Cola 500ml' }).click();
    await expect(page.locator('text=Coca Cola 500ml')).toBeVisible(); // Debe aparecer en el carrito
    
    // Interacción: Cobro
    await page.locator('input[placeholder*="Teléfono"]').fill('123456789');
    await page.locator('input[placeholder*="Monto"]').fill('100');
    await page.locator('button').filter({ hasText: 'Confirmar' }).click();
    
    // Validamos Toast de venta
    await expect(page.locator('text=Venta procesada')).toBeVisible();
    await expect(page).toHaveScreenshot('step3-sales-audit.png');
    console.log('✓ Sales Audited');

    // --- 4. AUDITORÍA DE PERSONAL (STAFF) ---
    console.log('Auditing: Staff Panel...');
    await page.locator('button').nth(3).click(); // Click en Staff del Dock
    
    // Validamos lista de empleados
    await expect(page.locator('text=admin_main')).toBeVisible();
    
    // Interacción: Crear usuario
    await page.locator('button').filter({ hasText: 'UserPlus' }).or(page.locator('button').nth(1)).click();
    await page.locator('input[placeholder*="Usuario"]').fill('nuevo_empleado');
    await page.locator('button').filter({ hasText: 'Crear' }).click();
    
    await expect(page.locator('text=Usuario creado')).toBeVisible();
    await expect(page).toHaveScreenshot('step4-staff-audit.png');
    console.log('✓ Staff Audited');

    // --- 5. AUDITORÍA DE REPORTES (REPORTS) ---
    console.log('Auditing: Reports Panel...');
    await page.locator('button').nth(4).click(); // Click en Reports del Dock
    
    // Validamos métricas
    await expect(page.locator('text=Ingresos Totales')).toBeVisible();
    await expect(page.locator('text=Valor Inventario')).toBeVisible();
    
    await expect(page).toHaveScreenshot('step5-reports-audit.png');
    console.log('✓ Reports Audited');

    console.log('🚀 FULL BUSINESS LIFECYCLE AUDIT COMPLETED SUCCESSFULLY');
  });
});
