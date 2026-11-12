import { Inter } from 'next/font/google';
import './globals.css';
import LayoutWrapper from '@/components/LayoutWrapper';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata = {
  title: 'Hospital Central — Gestión de Citas Médicas',
  description: 'Sistema hospitalario moderno para la gestión integral de pacientes, médicos y citas',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${inter.variable} antialiased h-full`}>
      <body className="min-h-full font-sans bg-slate-50 text-slate-800">
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
