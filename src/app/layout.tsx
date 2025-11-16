
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { FirebaseClientProvider } from '@/firebase';

export const metadata: Metadata = {
  title: 'Colimove - Transport & Suivi de Colis',
  description: 'Confiez-nous vos colis pour un transport sécurisé et suivez leur parcours en temps réel. Simple, rapide et fiable.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning={true}>
          <FirebaseClientProvider>
            {children}
          </FirebaseClientProvider>
          <Toaster />
      </body>
    </html>
  );
}
