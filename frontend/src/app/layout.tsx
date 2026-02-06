import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import Header from '@/components/layouts/Header';
import Footer from '@/components/layouts/Footer';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'EstimerMonImmeuble - Estimation d\'immeuble gratuite et precise',
  description: 'Estimez la valeur de votre immeuble en 30 secondes. Algorithme base sur les transactions DVF reelles et donnees BDNB. Paris & Ile-de-France.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${inter.variable} font-sans antialiased`}>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { background: '#18181b', color: '#fafafa', fontSize: '14px' },
          }}
        />
      </body>
    </html>
  );
}
