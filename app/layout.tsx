import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'QueueLess Kacheri – NagrikSeva AI (ગુજરાત સરકાર)',
  description: 'Zero physical queues for Gujarat Government Kacheris and Jan Seva Kendras',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
      { url: '/favicon.png', type: 'image/png' }
    ],
    shortcut: '/favicon.png',
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }
    ],
  },
};

export const viewport: Viewport = {
  themeColor: '#003366',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="gu" suppressHydrationWarning>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="QueueLess Kacheri" />
        <meta name="application-name" content="QueueLess Kacheri" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="shortcut icon" href="/favicon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Early global capture of PWA beforeinstallprompt event
              window.__deferredPwaPrompt = null;
              window.addEventListener('beforeinstallprompt', function(e) {
                e.preventDefault();
                window.__deferredPwaPrompt = e;
                window.dispatchEvent(new CustomEvent('pwa-prompt-available', { detail: e }));
              });
              // Service Worker Registration for HTTPS and localhost/127.0.0.1
              if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
                var registerSW = function() {
                  navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(function() {});
                };
                if (document.readyState === 'complete') {
                  registerSW();
                } else {
                  window.addEventListener('load', registerSW);
                }
              }
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning className="bg-slate-50 text-slate-800 antialiased min-h-screen flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}
