import { test, expect } from '@playwright/test';

test.describe('Visual Audit - Motor de UI', () => {
  test.beforeEach(async ({ page }) => {
    // Simulamos el login para entrar a los paneles
    // En un entorno real, usaríamos cookies o un bypass de auth para tests visuales
    await page.goto('/');
  });

  test('El Dock debe ser visible y centrado en Mobile', async ({ page }) => {
    const dock = page.locator('div.fixed.bottom-6');
    await expect(dock).toBeVisible();

    const box = await dock.boundingBox();
    if (box) {
      // El dock debe estar centrado horizontalmente (aprox)
      const pageWidth = page.viewportSize()?.width || 0;
      const centerOffset = (pageWidth - box.width) / 2;
      expect(box.x).toBeCloseTo(centerOffset, 5);
    }
  });

  test('Cambio de panel activo en el Dock', async ({ page }) => {
    const stockBtn = page.locator('button').filter({ hasText: 'Inventario' }); // Nota: El texto está en el span animado
    // Como el texto solo aparece al estar activo, buscamos por el icono o la posición
    const buttons = page.locator('button');
    await buttons.nth(1).click(); // Clic en Stock

    // Verificar que el botón tiene el estilo de activo (bg-blue-500)
    await expect(buttons.nth(1)).toHaveClass(/bg-blue-500/);
  });

  test('Visual Snapshot - Layout General', async ({ page }) => {
    // Captura visual para regresión
    await expect(page).toHaveScreenshot('layout-general.png');
  });
});
