import { test, expect } from '@playwright/test';

/**
 * MOTOR AUDITOR E2E
 * Este motor automatiza el recorrido completo del ciclo de vida del negocio.
 * Valida tanto la funcionalidad (interacciones) como la estética (capturas visuales).
 *
 * ACTUALIZACIÓN: Soporte para modo Offline y Verificación de Sesión.
 */

test.describe('Audit: Full Business Lifecycle', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Ciclo Completo: Auth -> Offline Mode -> Stock -> Sales -> Staff -> Reports', async ({ page, context }) => {
    // --- 1. AUDITORÍA DE AUTENTICACIÓN Y SESIÓN ---
    console.log('Auditing: Authentication flow...');
    await page.locator('input[placeholder*="Usuario"]').fill('admin');
    await page.locator('input[placeholder*="Contraseña"]').fill('password');
    await page.locator('button').filter({ hasText: 'Ingresar' }).click();

    // Validamos que entramos y que el indicador muestra "Sesión Activa" (Verde)
    await expect(page.locator('[data-testid="main-dock"]')).toBeVisible();
    await expect(page.locator('text=Sesión Activa')).toBeVisible();
    await expect(page).toHaveScreenshot('step1-auth-session.png');
    console.log('✓ Auth & Session Audited');

    // --- 2. AUDITORÍA DE MODO OFFLINE ---
    console.log('Auditing: Offline Mode Queue...');
    // Simulamos pérdida de conexión
    await context.setOffline(true);

    // Intentamos agregar un producto sin conexión
    await page.locator('button').filter({ hasText: 'Inventario' }).or(page.locator('[data-testid="nav-stock"]')).click();
    await page.locator('button').filter({ hasText: 'PackagePlus' }).or(page.locator('button').nth(1)).click();
    await page.locator('input[placeholder*="Código"]').fill('OFFLINE_001');
    await page.locator('input[placeholder*="Nombre"]').fill('Producto Offline');
    await page.locator('button').filter({ hasText: 'Guardar' }).click();

    // Validamos que el indicador muestre que hay acciones pendientes
    await expect(page.locator('text=1 Pendientes de Sincronizar')).toBeVisible();
    await expect(page.locator('text=Modo Offline: Acción encolada')).toBeVisible();
    await expect(page).toHaveScreenshot('step2-offline-queue.png');
    console.log('✓ Offline Queue Audited');

    // --- 3. RESTABLECIMIENTO Y SINCRONIZACIÓN ---
    console.log('Auditing: Reconnection & Sync...');
    await context.setOffline(false);

    // Esperamos a que el intervalo de sincronización (10s) procese la cola
    // O forzamos la espera del toast de éxito si el backend responde
    await expect(page.locator('text=1 Pendientes de Sincronizar')).not.toBeVisible({ timeout: 15000 });
    console.log('✓ Sync Audited');

    // --- 4. AUDITORÍA DE INVENTARIO (STOCK) ---
    console.log('Auditing: Stock Panel...');
    await expect(page.locator('text=Total productos')).toBeVisible();
    await expect(page).toHaveScreenshot('step3-stock-audit.png');
    console.log('✓ Stock Audited');

    // --- 5. AUDITORÍA DE VENTAS (SALES) ---
    console.log('Auditing: Sales Panel...');
    await page.locator('[data-testid="nav-sales"]').click();
    await expect(page.locator('text=Carrito')).toBeVisible();
    await page.locator('button').filter({ hasText: 'Coca Cola 500ml' }).first().click();
    await page.locator('input[placeholder*="Teléfono"]').fill('123456789');
    await page.locator('input[placeholder*="Monto"]').fill('100');
    await page.locator('button').filter({ hasText: 'Confirmar' }).click();
    await expect(page.locator('text=Venta procesada')).toBeVisible();
    await expect(page).toHaveScreenshot('step4-sales-audit.png');
    console.log('✓ Sales Audited');

    // --- 6. AUDITORÍA DE PERSONAL (STAFF) ---
    console.log('Auditing: Staff Panel...');
    await page.locator('[data-testid="nav-staff"]').click();
    await expect(page.locator('text=admin_main')).toBeVisible();
    await expect(page).toHaveScreenshot('step5-staff-audit.png');
    console.log('✓ Staff Audited');

    // --- 7. AUDITORÍA de REPORTES (REPORTS) ---
    console.log('Auditing: Reports Panel...');
    await page.locator('[data-testid="nav-reports"]').click();
    await expect(page.locator('text=Ingresos Totales')).toBeVisible();
    await expect(page).toHaveScreenshot('step6-reports-audit.png');
    console.log('✓ Reports Audited');

    console.log('🚀 FULL BUSINESS LIFECYCLE AUDIT WITH OFFLINE SYNC COMPLETED SUCCESSFULLY');
  });
});
