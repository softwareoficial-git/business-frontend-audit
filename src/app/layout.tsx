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
        <div
          id="debug-test"
          style={{
            padding: '10px',
            background: 'red',
            color: 'white',
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 9999,
          }}
        >
          Debug: Layout Renderizado
        </div>
        <script
          dangerouslySetInnerHTML={{
            __html: `
          window.onerror = function(message, source, lineno, colno, error) {
            var el = document.createElement('div');
            el.style.position = 'fixed';
            el.style.top = '50px';
            el.style.left = '0';
            el.style.background = 'black';
            el.style.color = 'white';
            el.style.padding = '20px';
            el.style.zIndex = '10000';
            el.innerHTML = 'ERROR JS: ' + message + ' en ' + source + ':' + lineno;
            document.body.appendChild(el);
          };
        `,
          }}
        />
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
