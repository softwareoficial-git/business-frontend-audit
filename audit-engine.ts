import { chromium, Browser, BrowserContext, Page } from 'playwright';
import { spawn, ChildProcess } from 'child_process';
import net from 'net';

const DEVICE_PRESETS = {
  mobile: { width: 390, height: 844, name: '📱 Mobile (iPhone 12)' },
  tablet: { width: 768, height: 1024, name: '平板 Tablet (iPad)' },
  local_desktop: { width: 1360, height: 768, name: '🖥️ Local Desktop (User)' },
  desktop: { width: 1920, height: 1080, name: '💻 Desktop (Full HD)' },
};

async function startServer(): Promise<ChildProcess> {
  console.log('🛠️  Iniciando servidor de desarrollo...');
  const server = spawn('npm', ['run', 'dev'], {
    shell: true,
    stdio: 'ignore',
    detached: true
  });

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      try { process.kill(-server.pid!); } catch {}
      reject(new Error('Timeout esperando al servidor de desarrollo (30s)'));
    }, 30000);

    const checkPort = setInterval(() => {
      const socket = new net.Socket();
      socket.setTimeout(1000);
      socket.on('connect', () => {
        clearInterval(checkPort);
        clearTimeout(timeout);
        socket.destroy();
        console.log('✅  Servidor listo en http://localhost:5173');
        resolve(server);
      });
      socket.on('error', () => socket.destroy());
      socket.on('timeout', () => socket.destroy());
      socket.connect(5173, 'localhost');
    }, 1000);
  });
}

async function stopServer(server: ChildProcess) {
  console.log('🛑  Deteniendo servidor...');
  try {
    process.kill(-server.pid!);
  } catch (e) {
    server.kill();
  }
}

interface AuditResult {
  device: string;
  total: number;
  passed: number;
  successRate: string;
  status: '✅' | '❌';
  avgMemoryMB: string;
}

async function runAudit(deviceMode: keyof typeof DEVICE_PRESETS) {
  const device = DEVICE_PRESETS[deviceMode];
  console.log(`
🚀 INICIANDO AUDITORÍA: ${device.name} (${device.width}x${device.height})`);

  let server: ChildProcess | null = null;
  let browser: Browser | null = null;

  try {
    server = await startServer();

    browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
      viewport: { width: device.width, height: device.height },
    });
    const page = await context.newPage();
    page.setDefaultTimeout(30000);

    const memorySamples: number[] = [];
    const memoryInterval = setInterval(async () => {
      try {
        const used = await page.evaluate(() => (performance as any).memory?.usedJSHeapSize);
        if (used) memorySamples.push(used);
      } catch (e) {
        // Fail silently if performance.memory is not available
      }
    }, 1000);

    let pageCrashed = false;
    page.on('console', msg => {
      console.log(`  🌐 [Browser Console] ${msg.type()}: ${msg.text()}`);
    });

    page.on('pageerror', exception => {
      pageCrashed = true;
      console.error(`  🚨 [JS CRASH] ${exception.message}`);
    });

    page.on('response', response => {
      if (response.status() >= 400) {
        console.error(`  📡 [Network Error] ${response.request().method()} ${response.url()} -> ${response.status()}`);
      }
    });

    const step = async (description: string, fn: () => Promise<any>) => {
      if (pageCrashed) throw new Error(`Ejecución abortada: La aplicación ha sufrido un crash crítico.`);
      try {
        return await fn();
      } catch (e: any) {
        if (description === 'Esperando título de bienvenida') {
          console.log('  🔍 [DIAGNÓSTICO] Fallo en carga inicial. Capturando estado del DOM...');
          const content = await page.content();
          console.log('  📄 HTML Actual:', content.substring(0, 1000) + '...');
          const url = page.url();
          console.log('  🔗 URL Actual:', url);
        }
        throw new Error(`[PASO: ${description}] ${e.message}`);
      }
    };

    const closeModals = async () => {
      try {
        const closeButton = page.locator('button:has(svg[data-lucide="x"])');
        if (await closeButton.isVisible()) {
          await closeButton.click();
        }
        await page.evaluate(() => {
          const overlays = document.querySelectorAll('div[class*="fixed inset-0"]');
          overlays.forEach(el => el.remove());
        });
      } catch (e) {}
    };

    const AUDIT_SUITE = {
      auth: {
        name: 'Autenticación y Registro',
        tests: [
          { id: 'auth_01', name: 'Carga de WelcomeScreen', critical: true, action: async () => {
              await step('Navegando a Home', async () => {
                await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
                await page.evaluate(() => window.localStorage.clear());
                await page.reload({ waitUntil: 'networkidle' });
                await page.waitForTimeout(2000);
              });
              await step('Esperando título de bienvenida', () => page.waitForSelector('[data-testid="welcome-title"]', { timeout: 20000 }));
          } },
          { id: 'auth_02', name: 'Cambio a Registro de Empresa', critical: true, action: async () => {
              await step('Click en Crear Empresa', () => page.click('text=¿No tienes cuenta? Crea tu empresa aquí'));
              await step('Esperando campo Empresa', () => page.waitForSelector('[data-testid="input-company"]'));
          } },
          { id: 'auth_03', name: 'Validación Visual de Contraseña', action: async () => {
              await step('Escribiendo contraseña corta', async () => {
                await page.fill('[data-testid="input-password"]', '123');
                const className = await page.locator('[data-testid="input-password"]').getAttribute('class');
                if (!className?.includes('border-red-500')) {
                  throw new Error('El input no tiene la clase border-red-500 con contraseña corta');
                }
              });
              await step('Escribiendo contraseña válida', async () => {
                await page.fill('[data-testid="input-password"]', 'AuditPass123!');
                const className = await page.locator('[data-testid="input-password"]').getAttribute('class');
                if (!className?.includes('border-green-500')) {
                  throw new Error('El input no tiene la clase border-green-500 con contraseña válida');
                }
              });
          } },
          { id: 'auth_04', name: 'Validación de Usuario en Tiempo Real', action: async () => {
              await step('Escribiendo usuario', async () => {
                await page.fill('[data-testid="input-username"]', 'user_test_audit_' + Date.now());
                await page.waitForSelector('text=Usuario disponible', { timeout: 15000 });
                const isGreen = await page.locator('text=Usuario disponible').isVisible();
                if (!isGreen) throw new Error('No se mostró el indicador de usuario disponible');
              });
          } },
          { id: 'auth_05', name: 'Llenado de Datos de Registro', critical: true, action: async () => {
              const company = 'AuditReal_' + Date.now();
              const user = 'user_' + Date.now();
              await step('Llenando Empresa', () => page.fill('[data-testid="input-company"]', company));
              await step('Llenando Usuario', () => page.fill('[data-testid="input-username"]', user));
              await step('Llenando Contraseña', () => page.fill('[data-testid="input-password"]', 'AuditPass123!'));
          } },
          { id: 'auth_06', name: 'Ejecución de Registro y Auto-Login', critical: true, action: async () => {
              await step('Haciendo clic en Registrar Empresa', () => page.click('button:has-text("Registrar Empresa")'));
              await step('Esperando Dock de navegación (Login automático)', () => page.waitForSelector('[data-testid="main-dock"]', { timeout: 30000 }));
          } },
        ]
      },
      ui_global: {
        name: 'UI Global',
        tests: [
          { id: 'ui_01', name: 'Presencia del Dock', action: async () => {
              await step('Verificando Dock', () => page.waitForSelector('[data-testid="main-dock"]'));
          } },
          { id: 'ui_02', name: 'Botones del Dock', action: async () => {
              await step('Contando botones', async () => {
                const count = await page.locator('[data-testid^="nav-"]').count();
                if (count < 6) throw new Error(`Se encontraron ${count} botones, se esperaban al menos 6 (incluyendo logout)`);
              });
          } },
          { id: 'ui_04', name: 'Contenedor de Toasts', action: async () => {
              await step('Verificando Toast Container', () => page.waitForSelector('[data-testid="toast-container"]', { state: 'attached' }));
          } },
        ]
      },
      stock: {
        name: 'Inventario',
        tests: [
          { id: 'stk_01', name: 'Navegación al Panel', action: async () => {
              await step('Click en botón Inventario (Dock)', () => page.click('[data-testid="nav-stock"]'));
              await step('Esperando título Inventario', () => page.waitForSelector('text=Inventario'));
          } },
          { id: 'stk_02', name: 'Carga de Lista de Productos', action: async () => {
              await step('Esperando texto Total productos', () => page.waitForSelector('text=Total productos'));
          } },
          { id: 'stk_03', name: 'Apertura de Modal Añadir', action: async () => {
              await step('Click en botón Agregar (+)', () => page.click('[data-testid="btn-add-product"]'));
              await step('Esperando modal Agregar Producto', () => page.waitForSelector('h2'));
          } },
          { id: 'stk_04', name: 'Guardado de Producto Real', action: async () => {
              const pCode = 'REAL' + Date.now();
              const pName = 'Producto Audit ' + Date.now();
              await step('Llenando datos', async () => {
                await page.fill('[data-testid="modal-code"]', pCode);
                await page.fill('[data-testid="modal-cat"]', 'Audit');
                await page.fill('[data-testid="modal-name"]', pName);
                await page.fill('[data-testid="modal-price"]', '15.00');
                await page.fill('[data-testid="modal-qty"]', '100');
              });
              await step('Click en Guardar', () => page.click('[data-testid="btn-save-product"]'));
              await step('Esperando toast de éxito', () => page.waitForSelector('[data-testid="toast-item"]'));
              (page as any).lastCreatedProduct = pName;
          } },
          { id: 'stk_05', name: 'Búsqueda del Producto Creado', action: async () => {
              const pName = (page as any).lastCreatedProduct;
              await step('Llenando buscador', () => page.fill('input[placeholder*="Buscar"], input[placeholder*="search"]', pName));
              await step('Esperando resultado del producto', () => page.waitForSelector(`text=${pName}`));
          } },
        ]
      },
      sales: {
        name: 'Ventas',
        tests: [
          { id: 'sls_01', name: 'Navegación al Panel', action: async () => {
              await step('Click en botón Ventas (Dock)', () => page.click('[data-testid="nav-sales"]'));
              await step('Esperando título Ventas', () => page.waitForSelector('text=Ventas'));
          } },
          { id: 'sls_02', name: 'Carga de Carrito Vacío', action: async () => {
              await step('Esperando texto Vacío', () => page.waitForSelector('text=Vacío'));
          } },
          { id: 'sls_03', name: 'Adición del Producto Real al Carrito', action: async () => {
              const pName = (page as any).lastCreatedProduct;
              await step(`Click en producto ${pName}`, () => page.click(`button:has-text("${pName}")`));
              await step('Esperando producto en carrito', () => page.waitForSelector(`text=${pName}`));
          } },
          { id: 'sls_04', name: 'Actualización de Cantidad (+)', action: async () => {
              await step('Click en botón Plus', () => page.locator('div.flex.items-center.gap-2 button').nth(1).click());
          } },
          { id: 'sls_05', name: 'Cobro de Venta Real SIN TELÉFONO', action: async () => {
              await step('Llenando datos (Teléfono Vacío)', async () => {
                await page.fill('[data-testid="input-phone"]', '');
                await page.fill('[data-testid="input-payment"]', '100');
              });
              await step('Click en Cobrar', () => page.click('[data-testid="btn-confirm-sale"]'));
              await step('Esperando toast de éxito', () => page.waitForSelector('[data-testid="toast-item"]'));
          } },
        ]
      },
      staff: {
        name: 'Personal',
        tests: [
          { id: 'stf_01', name: 'Navegación al Panel', action: async () => {
              await step('Click en botón Personal (Dock)', () => page.click('[data-testid="nav-staff"]'));
              await step('Esperando título Personal', () => page.waitForSelector('text=Personal'));
          } },
          { id: 'stf_02', name: 'Apertura de Modal Crear', action: async () => {
              await step('Click en botón Agregar Staff', () => page.click('[data-testid="btn-add-staff"]', { force: true }));
              await step('Esperando modal Nuevo Empleado', () => page.waitForSelector('h2'));
          } },
          { id: 'stf_03', name: 'Creación de Empleado Real', action: async () => {
              await step('Llenando datos', async () => {
                await page.fill('[data-testid="modal-staff-user"]', 'real_emp_' + Date.now());
                await page.fill('[data-testid="modal-staff-pass"]', 'RealPass123!');
                await page.selectOption('[data-testid="modal-staff-role"]', '2');
              });
              await step('Click en Crear Cuenta', () => page.click('[data-testid="btn-save-staff"]'));
              await step('Esperando cierre de modal', () => page.waitForSelector('[data-testid="btn-add-staff"]'));
          } },
        ]
      },
      reports: {
        name: 'Reportes',
        tests: [
          { id: 'rpt_01', name: 'Navegación al Panel', action: async () => {
              await step('Click en botón Reportes (Dock)', () => page.click('[data-testid="nav-reports"]'));
              await step('Esperando título Reportes', () => page.waitForSelector('text=Reportes'));
          } },
          { id: 'rpt_02', name: 'Renderizado de Métricas Reales', action: async () => {
              await step('Esperando texto Ingresos', () => page.waitForSelector('text=Ingresos'));
          } },
          { id: 'ui_03', name: 'Cerrar Sesión (Logout)', action: async () => {
              await step('Click en botón Salir', () => page.click('[data-testid="nav-logout"]'));
              await step('Verificando redirección a WelcomeScreen', () => page.waitForSelector('[data-testid="welcome-title"]', { timeout: 10000 }));
          } },
        ]
      }
    };

    let totalTests = 0;
    let passedTests = 0;

    for (const moduleName in AUDIT_SUITE) {
      const module = AUDIT_SUITE[moduleName];
      await closeModals();

      for (const testCase of module.tests) {
        totalTests++;
        try {
          await testCase.action();
          passedTests++;
          console.log(`  ✅ [${testCase.id}] ${testCase.name} -> PASSED`);
        } catch (e) {
          console.log(`  ❌ [${testCase.id}] ${testCase.name} -> FAILED`);
          console.error(`     Detailed Error: ${e}`);
          if (testCase.critical) {
            throw new Error(`FALLO CRÍTICO: El test ${testCase.id} es bloqueante.`);
          }
        }
      }
    }

    const successRate = totalTests > 0 ? ((passedTests/totalTests)*100).toFixed(2) : '0.00';

    clearInterval(memoryInterval);
    const avgMemory = memorySamples.length > 0
      ? (memorySamples.reduce((a, b) => a + b, 0) / memorySamples.length / 1024 / 1024).toFixed(2)
      : 'N/A';

    return {
      device: device.name,
      total: totalTests,
      passed: passedTests,
      successRate: `${successRate}%`,
      status: passedTests === totalTests ? '✅' : '❌',
      avgMemoryMB: avgMemory
    };
    } catch (error) {
    console.error(`  🚨 Error crítico en ${deviceMode}:`, error);
    return {
      device: device.name,
      total: 0,
      passed: 0,
      successRate: '0.00%',
      status: '❌',
      avgMemoryMB: 'N/A'
    };
    } finally {
    if (browser) await browser.close();
    if (server) await stopServer(server);
    }
    }

async function main() {
  const deviceArg = process.argv[2];

  if (deviceArg === 'all') {
    console.log('🌍 INICIANDO AUDITORÍA MULTI-DISPOSITIVO');
    const results: AuditResult[] = [];

    for (const mode of Object.keys(DEVICE_PRESETS) as (keyof typeof DEVICE_PRESETS)[]) {
      const res = await runAudit(mode);
      results.push(res);
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 MATRIZ de RESULTADOS MULTI-DISPOSITIVO');
    console.log('='.repeat(60));
    console.log('Dispositivo          | Total | Pasados | Tasa % | Memoria Avg | Estado');
    console.log('-'.repeat(60));
    results.forEach(r => {
      console.log(`${r.device.padEnd(20)} | ${r.total.toString().padEnd(5)} | ${r.passed.toString().padEnd(7)} | ${r.successRate.padEnd(6)} | ${r.avgMemoryMB.padEnd(11)} | ${r.status}`);
    });
    console.log('='.repeat(60));

    const overallPassed = results.every(r => r.status === '✅');
    process.exit(overallPassed ? 0 : 1);
  } else {
    const mode = (deviceArg && DEVICE_PRESETS[deviceArg as keyof typeof DEVICE_PRESETS])
      ? deviceArg as keyof typeof DEVICE_PRESETS
      : 'mobile';

    const result = await runAudit(mode);
    console.log('\n' + '='.repeat(40));
    console.log('RESUMEN FINAL de AUDITORÍA:');
    console.log(`Dispositivo: ${result.device}`);
    console.log(`Total funciones testeadas: ${result.total}`);
    console.log(`Funciones exitosas: ${result.passed}`);
    console.log(`Tasa de éxito: ${result.successRate}`);
    console.log(`Consumo RAM Promedio: ${result.avgMemoryMB} MB`);
    console.log('='.repeat(40));
    process.exit(result.status === '✅' ? 0 : 1);
  }
}

main().catch(async (error) => {
  console.error('Error fatal:', error);
  process.exit(1);
});
