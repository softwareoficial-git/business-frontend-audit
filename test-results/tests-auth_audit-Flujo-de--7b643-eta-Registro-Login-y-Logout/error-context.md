# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests/auth_audit.spec.ts >> Flujo de Autenticación E2E Detallado >> Prueba completa: Registro, Login y Logout
- Location: tests/auth_audit.spec.ts:8:7

# Error details

```
Error: expect(locator).toHaveCount(expected) failed

Locator:  locator('text=Falta este campo')
Expected: 3
Received: 0
Timeout:  5000ms

Call log:
  - Expect "toHaveCount" with timeout 5000ms
  - waiting for locator('text=Falta este campo')
    14 × locator resolved to 0 elements
       - unexpected value "0"

```

# Page snapshot

```yaml
- generic [ref=e1]:
    - main [ref=e2]:
        - heading "Registrarse" [level=1] [ref=e3]
        - generic [ref=e4]:
            - textbox "Usuario" [ref=e5]
            - textbox "Contraseña (mín 6)" [ref=e6]
            - textbox "Nombre de Cliente" [ref=e7]
            - button "Registrarse" [active] [ref=e8]
        - paragraph [ref=e9]:
            - text: ¿Ya tienes cuenta?
            - button "Iniciar Sesión" [ref=e10]
    - generic [ref=e11]:
        - link [ref=e12] [cursor=pointer]:
            - /url: /
            - img [ref=e13]
        - button [ref=e14] [cursor=pointer]:
            - img [ref=e15]
    - generic:
        - generic [ref=e18] [cursor=pointer]:
            - img [ref=e19]
            - generic [ref=e21]: 1 error
            - button "Hide Errors" [ref=e22]:
                - img [ref=e23]
        - status [ref=e26]:
            - generic [ref=e27]:
                - img [ref=e29]
                - generic [ref=e31]:
                    - text: Static route
                    - button "Hide static indicator" [ref=e32] [cursor=pointer]:
                        - img [ref=e33]
    - alert [ref=e36]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  |
  3  | test.describe('Flujo de Autenticación E2E Detallado', () => {
  4  |   const username = `user_${Date.now()}`;
  5  |   const password = 'password123';
  6  |   const nombreCliente = 'Cliente Test';
  7  |
  8  |   test('Prueba completa: Registro, Login y Logout', async ({ page }) => {
  9  |     await page.goto('http://localhost:3005');
  10 |
  11 |     // 1. Registro mal (datos faltantes)
  12 |     await page.click('text=Regístrate');
  13 |     await page.click('button[type="submit"]');
  14 |
  15 |     // Verificar que cada campo faltante tenga su mensaje
> 16 |     await expect(page.locator('text=Falta este campo')).toHaveCount(3);
     |                                                         ^ Error: expect(locator).toHaveCount(expected) failed
  17 |
  18 |     // Verificar que los logs de auditoría detectaron cada campo
  19 |     await page.waitForTimeout(500);
  20 |     await expect(page.locator('div[style*="fixed"]')).toContainText('Validación Registro: Campo username vacío');
  21 |     await expect(page.locator('div[style*="fixed"]')).toContainText('Validación Registro: Campo password vacío');
  22 |     await expect(page.locator('div[style*="fixed"]')).toContainText('Validación Registro: Campo nombreCliente vacío');
  23 |
  24 |     // 2. Registro bien
  25 |     await page.fill('input[placeholder="Usuario"]', username);
  26 |     await page.fill('input[placeholder="Contraseña (mín 6)"]', password);
  27 |     await page.fill('input[placeholder="Nombre de Cliente"]', nombreCliente);
  28 |     await page.click('button[type="submit"]');
  29 |
  30 |     // Debería redirigir al login (h1 vuelve a ser 'Iniciar Sesión')
  31 |     await expect(page.locator('h1')).toHaveText('Iniciar Sesión');
  32 |
  33 |     // 3. Login mal (datos incorrectos)
  34 |     await page.fill('input[placeholder="Usuario"]', 'no_existe');
  35 |     await page.fill('input[placeholder="Contraseña"]', 'password123');
  36 |     await page.click('button[type="submit"]');
  37 |
  38 |     // Selector específico para el error global fuera del formulario
  39 |     await expect(page.locator('main > p:has-text("Usuario o contraseña incorrectos.")')).toBeVisible();
  40 |
  41 |     // Verificar que aparece el Toast de error de autenticación
  42 |     await expect(page.locator('div[style*="fixed"]')).toContainText('Error en login: Usuario o contraseña incorrectos.');
  43 |
  44 |     // 4. Login bien
  45 |     await page.fill('input[placeholder="Usuario"]', username);
  46 |     await page.fill('input[placeholder="Contraseña"]', password);
  47 |     await page.click('button[type="submit"]');
  48 |
  49 |     // Esperar a que la UI cambie a la plataforma
  50 |     await expect(page.locator('h1')).toHaveText('¡BIENVENIDO A LA PLATAFORMA!');
  51 |     await expect(page.locator('text=Sesión iniciada correctamente.')).toBeVisible();
  52 |
  53 |     // 5. Cerrar sesión
  54 |     await page.click('text=Cerrar Sesión');
  55 |     await expect(page.locator('h1')).toHaveText('Iniciar Sesión');
  56 |   });
  57 | });
  58 |
```
