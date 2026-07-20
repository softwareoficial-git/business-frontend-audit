import './globals.css';
import { ThemeProvider } from '../lib/theme/ThemeProvider';
import { ToastProvider } from '../components/toast/ToastProvider';
import { TourProvider } from '../components/tour/TourProvider';
import { LoadingProvider } from '../components/loading/LoadingProvider';
import VersionChecker from '../components/VersionChecker';

export const metadata = {
  title: 'Gestión Empresarial Inteligente | Control Total y Seguridad',
  description:
    'Plataforma integral para empresas y emprendedores. Gestiona inventarios, personal, permisos granulares y ventas con tecnología de vanguardia, alta seguridad JSONB y escalabilidad total.',
  keywords: [
    'gestión empresarial',
    'control de stock',
    'gestión de empleados',
    'ventas',
    'seguridad JSONB',
    'tecnología escalable',
  ],
  authors: [{ name: 'Equipo de Desarrollo' }],
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
        {/* Contenido amigable para bots y carga inicial */}
        <div id="bot-friendly-content" style={{ display: 'none' }}>
          <h1>Gestión Empresarial Optimizada</h1>
          <p>
            Potenciando negocios con seguridad, facilidad de uso y alta
            tecnología.
          </p>
          <p>
            Ofrecemos: Gestión de Inventario, Control de personal, Seguimiento
            de ventas.
          </p>
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
