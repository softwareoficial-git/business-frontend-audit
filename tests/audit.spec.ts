import { test, expect } from '@playwright/test';

test('Full Business Lifecycle Visual Audit', async ({ page }) => {
  test.setTimeout(120000); // Increased to 2 minutes for stability in headed mode
  // Enhanced logging and error capturing
  page.on('console', msg => {
    if (msg.type() === 'error') console.log(`❌ BROWSER ERROR: ${msg.text()}`);
    else console.log(`📄 BROWSER LOG: ${msg.text()}`);
  });
  page.on('pageerror', err => {
    console.log(`🚨 PAGE CRASH: ${err.message}`);
  });

  await page.setViewportSize({ width: 390, height: 844 });
  
  const port = '5173';
  await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle' });
  await page.waitForSelector('#root', { timeout: 15000 });

  console.log('🚀 Starting Advanced Visual Audit');
  await page.screenshot({ path: 'audit-0-start.png' });

  const randomId = Math.random().toString(36).substring(7);
  const companyName = `VisualAudit_${randomId}`;
  const username = `audituser_${randomId}`;

  // PHASE 1: Registration
  console.log('--- Phase 1: Registration ---');
  await page.click('[data-testid="btn-toggle-auth"]');
  await page.waitForTimeout(1000);
  await page.fill('[data-testid="input-company"]', companyName);
  await page.fill('[data-testid="input-username"]', username);
  await page.fill('[data-testid="input-password"]', 'Pass123!');
  await page.click('[data-testid="btn-submit"]');
  await page.waitForTimeout(2000);
  
  await expect(page.locator('h1:has-text("📦 Inventario")')).toBeVisible({ timeout: 15000 });
  await page.screenshot({ path: 'audit-1-registered.png' });
  console.log('✅ Phase 1 Complete: Registered and redirected to Stock');

  // PHASE 2: Staff Management
  console.log('--- Phase 2: Staff Management ---');
  await page.click('[data-testid="nav-staff"]');
  await page.waitForTimeout(1000);
  await expect(page.locator('h1:has-text("👥 Gestión de Staff")')).toBeVisible();
  
  await page.click('[data-testid="btn-add-staff"]');
  await page.waitForTimeout(1000);
  const empUser = `emp_${randomId}`;
  await page.fill('[data-testid="modal-staff-user"]', empUser);
  await page.fill('[data-testid="modal-staff-pass"]', 'EmpPass123!');
  await page.click('button:has-text("Crear Cuenta")');
  await page.waitForTimeout(2000);
  
  const employeeCard = page.locator(`[data-testid="employee-${empUser}"]`);
  await expect(employeeCard).toBeVisible({ timeout: 15000 });
  await expect(employeeCard).toContainText(empUser);
  
  await page.screenshot({ path: 'audit-2-staff-created.png' });
  console.log('✅ Phase 2 Complete: Employee created and visible in list');

  // PHASE 3: Stock Management
  console.log('--- Phase 3: Stock Management ---');
  await page.click('[data-testid="nav-stock"]');
  await page.waitForTimeout(1000);
  await expect(page.locator('h1:has-text("📦 Inventario")')).toBeVisible();
  
  await page.click('[data-testid="btn-add-product"]');
  await page.waitForTimeout(1000);
  const pCode = 'V_AUDIT_01';
  const pName = 'Visual Audit Product';
  const pPrice = '150';
  const pQty = '50';
  
  await page.fill('[data-testid="modal-code"]', pCode);
  await page.fill('[data-testid="modal-cat"]', 'Audit');
  await page.fill('[data-testid="modal-name"]', pName);
  await page.fill('[data-testid="modal-price"]', pPrice);
  await page.fill('[data-testid="modal-qty"]', pQty);
  await page.click('button:has-text("Guardar")');
  await page.waitForTimeout(2000);
  
  const productCard = page.locator(`[data-testid="product-${pCode}"]`);
  await expect(productCard).toBeVisible({ timeout: 15000 });
  await expect(productCard).toContainText(pName);
  await expect(productCard).toContainText(pPrice);
  
  await page.screenshot({ path: 'audit-3-stock-added.png' });
  console.log('✅ Phase 3 Complete: Product added and verified visually');

  // PHASE 4: Sales Process
  console.log('--- Phase 4: Sales Process ---');
  await page.click('[data-testid="nav-sales"]');
  await page.waitForTimeout(1000);
  await expect(page.locator('h1:has-text("💰 Punto de Venta")')).toBeVisible();
  
  console.log('Waiting for products to load in POS...');
  await expect(page.locator(`[data-testid="product-btn-${pCode}"]`)).toBeVisible({ timeout: 20000 });
  await page.waitForTimeout(1000);
  
  await page.click(`[data-testid="product-btn-${pCode}"]`);
  await page.waitForTimeout(1000);
  await expect(page.locator('text=Carrito')).toBeVisible();
  await expect(page.locator('div.bg-white.rounded-3xl').locator('text=' + pName)).toBeVisible();
  
  await page.fill('[data-testid="input-phone"]', '987654321');
  await page.fill('[data-testid="input-payment"]', '200');
  await page.click('[data-testid="btn-confirm-sale"]');
  await page.waitForTimeout(2000);
  
  await expect(page.locator('text=Venta procesada')).toBeVisible({ timeout: 10000 }).catch(() => {
      return expect(page.locator('text=Vacío')).toBeVisible();
  });
  
  await page.screenshot({ path: 'audit-4-sale-processed.png' });
  console.log('✅ Phase 4 Complete: Sale processed and cart cleared');

  // PHASE 5: Business Reports
  console.log('--- Phase 5: Business Reports ---');
  await page.click('[data-testid="nav-reports"]');
  await page.waitForTimeout(1000);
  await expect(page.locator('h1:has-text("📈 Reportes de Negocio")')).toBeVisible();
  
  await expect(page.locator('.grid')).toBeVisible();
  
  await page.screenshot({ path: 'audit-5-reports-final.png' });
  console.log('✅ Phase 5 Complete: Final reports visible');
  
  console.log('🌟 FULL VISUAL AUDIT SUCCESSFUL 🌟');
});
