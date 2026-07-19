import './globals.css';
import { ThemeProvider } from '../lib/theme/ThemeProvider';
import { ToastProvider } from '../components/toast/ToastProvider';
import { TourProvider } from '../components/tour/TourProvider';
import { LoadingProvider } from '../components/loading/LoadingProvider';
import Dock from '../components/Dock';

export const metadata = {
  title: 'Plataforma Optimizada',
  description:
    'Plataforma web de alto rendimiento optimizada para dispositivos de bajos recursos.',
  keywords: ['plataforma', 'optimizada', 'alto rendimiento', 'bajo consumo'],
  authors: [{ name: 'Desarrollador' }],
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
        <ThemeProvider>
          <ToastProvider>
            <TourProvider>
              <LoadingProvider>{children}</LoadingProvider>
            </TourProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
