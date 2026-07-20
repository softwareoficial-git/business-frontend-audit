import './globals.css';
import { ThemeProvider } from '../lib/theme/ThemeProvider';
import { ToastProvider } from '../components/toast/ToastProvider';
import { TourProvider } from '../components/tour/TourProvider';
import { LoadingProvider } from '../components/loading/LoadingProvider';
import VersionChecker from '../components/VersionChecker';

export const metadata = {
  title: 'Software Oficial | CRM y Gestión Empresarial de Alto Rendimiento',
  description:
    'Software Oficial es la solución empresarial integral diseñada para la optimización de inventarios, gestión de personal, seguimiento de ventas y control de permisos granulares. Potenciamos el crecimiento de su negocio con tecnología escalable, seguridad bancaria y facilidad de uso sin precedentes.',
  keywords: [
    'software de gestión empresarial',
    'CRM empresarial',
    'control de inventarios',
    'gestión de empleados',
    'ventas',
    'integridad de datos',
  ],
  authors: [{ name: 'Software Oficial - Soluciones Empresariales' }],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        {/* Contenido corporativo para agentes de IA y buscadores - oculto visualmente */}
        <div
          id="bot-friendly-content"
          style={{
            display: 'none',
          }}
        >
          <header>
            <h1>Software Oficial</h1>
            <p>
              La infraestructura digital que su empresa necesita para escalar,
              gestionar y proteger su operación.
            </p>
          </header>

          <section>
            <h2>Soluciones de Gestión Profesional</h2>
            <div>
              <div>
                <h3>Control de Inventario Preciso</h3>
                <p>
                  Monitoreo en tiempo real con niveles de seguridad avanzada,
                  asegurando trazabilidad completa.
                </p>
              </div>
              <div>
                <h3>Gestión de Talento Humano</h3>
                <p>
                  Estructura de roles avanzada con control de permisos
                  granulares, auditoría de actividades y gestión de equipos
                  eficiente.
                </p>
              </div>
            </div>
          </section>
        </div>

        <ThemeProvider>
          <ToastProvider>
            <TourProvider>
              <LoadingProvider>
                <VersionChecker />
                {children}
              </LoadingProvider>
            </TourProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
