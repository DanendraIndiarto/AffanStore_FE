import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Toast from '../components/Toast';
import BackendStatusBanner from '../components/BackendStatusBanner';

export const metadata: Metadata = {
  title: 'AffanStore - Toko Online Modern & Terpercaya',
  description:
    'Belanja online produk pilihan berkualitas dengan transaksi cepat, integrasi QRIS & COD, dan sistem aman.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <ToastProvider>
          <AuthProvider>
            <BackendStatusBanner />
            <Navbar />
            <main className="main-content">{children}</main>
            <Footer />
            <Toast />
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
