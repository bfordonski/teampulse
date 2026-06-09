import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AppHeader } from '@/components/layout/app-header';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Consulting Platform',
  description: 'Team builder and candidate management',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} min-h-screen font-sans`}>
        <AppHeader />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</main>
      </body>
    </html>
  );
}
